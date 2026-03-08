import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, InputGroup, Card } from "react-bootstrap";
import { Link, useNavigate, useLocation }from "react-router-dom";
import axios from "axios";
import Loader from "../Loader";
import Message from "../Message";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/profile";
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formValues, setFormValues] = useState ({
    email: "",
    password: "",
    token: "",
  });

  const [formErrors, setFormErrors] = useState ({
    email: null,
    password: null,
    token: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues ({
      ...formValues,
      [name]: value,
    });
    validateField(name, value);
  };

  const getValidationClass = (name) => {
    if (formValues[name] === "") return "";
    return formErrors[name] ? "is-invalid" : "is-valid";
  };

  const clearForm = () => {
    setFormValues ({
      email: "",
      password: "",
      token: ""
    });
  };

  const validateField = (name, value) => {
    let errorMessage = null;

    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          errorMessage = "Invalid email format...";
        }
        break;

      case "password":
        if (!value) {
          errorMessage = "This field is required...";
        }
        break;

      case "token":
        errorMessage = null;
        break;

      default:
        break;
    }

    setFormErrors ({
      ...formErrors,
      [name]: errorMessage,
    });
  };

  const isFormValid = () => {
    const requiredFields = ["email", "password"];
    const hasRequiredValues = requiredFields.every(
      (field) => formValues[field] && formValues[field].trim() !== ""
    );
    const hasNoErrors = Object.values(formErrors).every((error) => error === null);

    return hasRequiredValues && hasNoErrors;
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if(!isFormValid()) {
      setMessage("Please fill out the form correctly");
      return
    }
    try {
      setLoading(true);
      setMessage("")
      setError("")

      const config = {
        headers: {
          "Content-Type":"application/json"
        }
      }

      const payload = {
        email: formValues.email,
        password: formValues.password,
      };

      if (formValues.token && formValues.token.trim() !== "") {
        payload.token = formValues.token.trim();
      }

      const {data} = await axios.post("/api/auth/login", payload, config);
      localStorage.setItem("userInfo",JSON.stringify(data));
      clearForm();
      navigate("/profile");
    } catch (error) {
      setError (
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect (() => {
    const userInfo = localStorage.getItem("userInfo");
    if(userInfo) {
      navigate("/profile")
    }
  },[navigate])

  return (
    <Container>
      <Row>
        <Col md="4"></Col>

        {loading ? (
          <Loader />
        ) : (
          <Col md="4">
            <Card className="mt-4 p-3">
              <Form onSubmit={submitHandler}>
                <br />
                <h3 className="text-center bg-light text-primary">Login Here</h3>
                {message && (
                  <Message variant="success" onClose={() => setMessage("")}>
                    {message}
                  </Message>
                )}
                {error && (
                  <Message variant="danger" onClose={() => setError(null)}>
                    {error}
                  </Message>
                )}

                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email"
                    placeholder="Enter your Email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    isInvalid={!!formErrors.email}
                    className={getValidationClass("email")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Checkbox onClick={togglePassword} />
                    <Form.Control 
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formValues.password}
                      placeholder="Enter your Password"
                      isInvalid={!!formErrors.password}
                      className={getValidationClass("password")}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>OTP (only if 2FA is enabled)</Form.Label>
                  <Form.Control
                    type="text"
                    name="token"
                    value={formValues.token}
                    placeholder="Enter your OTP"
                    isInvalid={!!formErrors.token}
                    className={getValidationClass("token")}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.token}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  className="mt-3"
                  variant="success"
                  type="submit"
                  disabled={!isFormValid()}
                >
                  Login
                </Button>
              </Form>
            </Card>

            <Row className="py-3">
              <Col>
                New User?
                <Link to="/signup">Sign Up</Link>
              </Col>
            </Row>
          </Col>
        )}
        <Col md="4"></Col>
      </Row>
    </Container>
  )
}

export default Login
