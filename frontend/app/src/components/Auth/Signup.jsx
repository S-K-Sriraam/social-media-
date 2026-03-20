import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Loader from "../Loader";
import Message from "../Message";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { setUserInfo } from "../../utils/userSession";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/profile";
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [show, changeshow] = useState("fa fa-eye-slash");
  const [loading, setLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormValues({
      ...formValues,
      [name]: newValue,
    });
    validateField(name, newValue);
  };

  const getValidationClass = (name) => {
    if (formValues[name] === "") return "";
    return formErrors[name] ? "is-invalid" : "is-valid";
  };

  const clearForm = () => {
    setFormValues({
      username: "",
      email: "",
      password: "",
      confirmpassword: "",
      termsAccepted: false,
    });
  };

  const validateField = (name, value) => {
    let errorMessage = null;

    switch (name) {
      case "username":
        if (!value) {
          errorMessage = "This field is required...";
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = "Invalid email format...";
        }
        break;

      case "password":
        const minLength = 6;
        const passwordRegex =
          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[_$@*!])[A-Za-z0-9_$@*!]{6,}$/;
        if (value.length < minLength || !passwordRegex.test(value)) {
          errorMessage =
            "Password must include atleast [1-9][a-z][A-Z][_$@*!..] & 6 characters";
        }
        break;

      case "confirmpassword":
        if (value !== formValues.password) {
          errorMessage = "Password do not match...";
        }
        break;

      case "termsAccepted":
        if (!value) {
          errorMessage = "You must accept the terms and conditions...";
        }
        break;

      default:
        break;
    }

    setFormErrors({
      ...formErrors,
      [name]: errorMessage,
    });
  };

  const isFormValid = () => {
    return (
      Object.values(formErrors).every((error) => error === null) &&
      Object.values(formValues).every(
        (value) => value !== "" && value !== false,
      )
    );
  };

  const showPassword = () => {
    var x = document.getElementById("pass1");
    var z = document.getElementById("pass2");
    if (x.type === "password" && z.type === "password") {
      x.type = "text";
      z.type = "text";
      changeshow(`fa fa-eye`);
    } else {
      x.type = "password";
      z.type = "password";
      changeshow(`fa fa-eye-slash`);
    }
  };

  const handleClose = () => {
    setMessage("");
    setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setMessage("Please fill out the form correctly.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError(null);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post("/api/auth/signup", formValues, config);
      setUserInfo(data);
      clearForm();
      navigate(redirect);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container fluid className="min-vh-100 d-flex align-items-center py-4">
        <Row className="w-100 justify-content-center">
          {loading ? (
            <Loader />
          ) : (
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4 p-md-5">
                  <h3 className="text-center text-primary bg-light mb-4">
                    Signup Here
                  </h3>
                  {message && (
                    <Message variant="success" onClose={handleClose}>
                      {message}
                    </Message>
                  )}
                  {error && (
                    <Message variant="danger" onClose={handleClose}>
                      {error}
                    </Message>
                  )}
                  
                  <Form onSubmit={submitHandler}>
                    <Form.Group controlId="username" className="mb-3">
                      <Form.Label>UserName</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="enter your username"
                        name="username"
                        value={formValues.username}
                        onChange={handleChange}
                        isInvalid={!!formErrors.username}
                        className={getValidationClass("username")}
                      />

                      <Form.Control.Feedback type="invalid">
                        {formErrors.username}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="email" className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
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

                    <Form.Group controlId="password" className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="password"
                          placeholder="Enter your password"
                          name="password"
                          id="pass1"
                          value={formValues.password}
                          onChange={handleChange}
                          isInvalid={!!formErrors.password}
                          className={getValidationClass("password")}
                        />
                        <Button variant="outline-secondary" onClick={showPassword}>
                          <i className={show}></i>
                        </Button>
                      </div>

                      <Form.Control.Feedback type="invalid">
                        {formErrors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="confirmpassword" className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        name="confirmpassword"
                        id="pass2"
                        value={formValues.confirmpassword}
                        onChange={handleChange}
                        isInvalid={!!formErrors.confirmpassword}
                        className={getValidationClass("confirmpassword")}
                      />

                      <Form.Control.Feedback type="invalid">
                        {formErrors.confirmpassword}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="termsAccepted" className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="I accept the terms and conditions"
                        name="termsAccepted"
                        checked={formValues.termsAccepted}
                        onChange={handleChange}
                        isInvalid={!!formErrors.termsAccepted}
                        className={getValidationClass("termsAccepted")}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.termsAccepted}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      className="w-100 mt-2"
                      variant="success"
                      type="submit"
                      disabled={!isFormValid()}
                    >
                      Signup
                    </Button>
                  </Form>

                  <Row className="pt-3">
                    <Col>
                      Already have an account?
                      <Link to="/login">Login</Link>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
}

export default Signup;
