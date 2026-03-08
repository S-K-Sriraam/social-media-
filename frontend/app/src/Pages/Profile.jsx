import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  ListGroup,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import Loader from "../components/Loader";
import Message from "../components/Message";
import UserPosts from "../components/Posts/UserPosts";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [followingUsers, setFollowingUsers] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const postsData = async (userId, config) => {
    const { data } = await axios.get(`/api/posts/user/${userId}`, config);
    setUserPosts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userInfo = localStorage.getItem("userInfo");

        if (!userInfo) {
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userInfo);
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedUser.token}`,
          },
        };

        const { data } = await axios.get("/api/users/profile", config);
        setUser(data);

        await postsData(parsedUser._id, config);
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message,
        );

        if (err.response && err.response.status === 401) {
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const followingMap = {};
    if (Array.isArray(user.following)) {
      user.following.forEach((followedUser) => {
        const id =
          typeof followedUser === "string" ? followedUser : followedUser?._id;
        if (id) followingMap[id] = true;
      });
    }
    setFollowingUsers(followingMap);
  }, [user.following]);

  const generateQrCodeUrl = async (otpauthUrl) => {
    try {
      if (!otpauthUrl) return;
      const url = await QRCode.toDataURL(otpauthUrl, { width: 200, margin: 2 });
      setQrCodeUrl(url);
    } catch (err) {
      setError("Failed to generate QR code.");
    }
  };

  const enable2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage("");

      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(userInfo);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`,
        },
      };

      const { data } = await axios.post("/api/auth/enable-2fa", {}, config);
      const secretOrOtpUrl =
        data?.otpauth_url || data?.otpauthUrl || data?.secret;
      const otpauthUrl = secretOrOtpUrl?.startsWith("otpauth://")
        ? secretOrOtpUrl
        : `otpauth://totp/SocialMediaApp:${encodeURIComponent(user.email || user.username || "User")}?secret=${secretOrOtpUrl}&issuer=SocialMediaApp`;

      await generateQrCodeUrl(otpauthUrl);
      setUser((prev) => ({ ...prev, twoFactorAuth: true }));
      setMessage("Two-factor authentication enabled successfully.");
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) {
        navigate("/login");
        return;
      }
      const parsedUser = JSON.parse(userInfo);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/users/search?keyword=${encodeURIComponent(keyword)}`,
        config,
      );
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePictureHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setMessage("");

      if (!profilePicture) {
        setError("Please select an image to upload.");
        return;
      }

      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) {
        navigate("/login");
        return;
      }
      const parsedUser = JSON.parse(userInfo);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${parsedUser.token}`,
        },
      };
      const formData = new FormData();
      formData.append("profilePicture", profilePicture);

      const { data } = await axios.post(
        "/api/users/profile/upload",
        formData,
        config,
      );
      setUser((prev) => ({ ...prev, profilePicture: data.profilePicture }));
      setMessage("Profile picture updated successfully.");
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId) => {
    try {
      setLoading(true);

      const userInfo = localStorage.getItem("userInfo");
      const parsedUser = JSON.parse(userInfo);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`,
        },
      };

      await axios.post(`/api/users/follow/${userId}`, {}, config);
      setMessage("User followed Successfully");
      setFollowingUsers((prev) => ({ ...prev, [userId]: true }));

      const { data } = await axios.get("/api/users/profile", config);
      setUser(data);
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

  const unfollowUser = async (userId) => {
    try {
      setLoading(true);

      const userInfo = localStorage.getItem("userInfo");
      const parsedUser = JSON.parse(userInfo);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`,
        },
      };

      await axios.post(`/api/users/unfollow/${userId}`, {}, config);
      setMessage("User unfollowed successfully");
      setFollowingUsers((prev) => ({ ...prev, [userId]: false }));

      const { data } = await axios.get("/api/users/profile", config);
      setUser(data);
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
    <Container className="profile-page">
      <Row className="justify-content-center">
        <Col md="7" lg="6">
          {loading ? (
            <Loader />
          ) : (
            <Card className="mt-4 p-3 animated-card">
              <h3 className="text-center bg-light text-dark mt-2">Welcome</h3>

              {error && (
                <Message variant="danger" onClose={() => setError(null)}>
                  {error}
                </Message>
              )}
              {message && (
                <Message variant="success" onClose={() => setMessage("")}>
                  {message}
                </Message>
              )}

              {/* profile pic */}
              <div className="text-center">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="rounded-circle"
                    width="100"
                    height="100"
                  />
                ) : (
                  <div
                    className="placeholder rounded-circle"
                    style={{ width: "100px", height: "100px" }}
                  ></div>
                )}
              </div>

              <Form onSubmit={uploadProfilePictureHandler}>
                <Form.Group>
                  <Form.Control
                    type="file"
                    onChange={(e) => setProfilePicture(e.target.files[0])}
                  ></Form.Control>
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3 btn-sm">
                  Upload/Edit Profile Picture
                </Button>
              </Form>

              <ul className="list-group mt-3">
                <li className="list-group-item list-group-item-primary d-flex justify-content-between align-items-center">
                  <strong>Username:</strong>
                  {user.username}
                </li>
                <li className="list-group-item list-group-item-success d-flex justify-content-between align-items-center">
                  <strong>Email:</strong>
                  {user.email}
                </li>
                <li className="list-group-item">
                  <Button
                    onClick={enable2FA}
                    className="w-100 profile-2fa-btn"
                    disabled={Boolean(user.twoFactorAuth)}
                  >
                    {user.twoFactorAuth ? "2FA Enabled" : "Enable 2FA"}
                  </Button>
                </li>

                {qrCodeUrl && (
                  <li className="list-group-item">
                    <div
                      className="accordion accordion-flush"
                      id="accordionFlushExample"
                    >
                      <div className="accordion-item">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#flush-collapseOne"
                            aria-expanded="false"
                            aria-controls="flush-collapseOne"
                          >
                            Authenticate QR code
                          </button>
                        </h2>
                        <div
                          id="flush-collapseOne"
                          className="accordion-collapse collapse"
                          data-bs-parent="#accordionFlushExample"
                        >
                          <div className="accordion-body">
                            <img src={qrCodeUrl} alt="2FA QR Code" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </Card>
          )}
        </Col>

        <Col md="7">
          <Card className="mt-4 p-3 animated-card" style={{ animationDelay: "140ms" }}>
            <h3 className="text-center bg-light text-dark mt-2">
              Search Users
            </h3>

            <Form onSubmit={searchHandler}>
              <Form.Group controlId="keyword">
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={keyword}
                  className="form-control me-sm-2"
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <Button className="btn btn-primary my-2 my-sm-0" type="submit">
                  Follow
                </Button>
              </Form.Group>
            </Form>

            {loading && <Loader />}
            {error && <Message variant="danger">{error}</Message>}
            <ListGroup className="mt-4">
              {results.map((result, index) => (
                <ListGroup.Item
                  key={result._id}
                  className="animated-list-item"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to={`/user/${result._id}`}>
                      <h5>{result.username}</h5>
                    </Link>
                    <Button
                      variant="success"
                      className="ms-3"
                      onClick={() => followUser(result._id)}
                      disabled={Boolean(followingUsers[result._id])}
                    >
                      {followingUsers[result._id] ? "Following" : "Follow"}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Row>
              <Col md={6}>
                <h5 className="mt-4 bg-light p-2 text-center">
                  Followers{" "}
                  <span className="badge bg-primary rounded-pill">
                    {user.followers?.length || 0}
                  </span>
                </h5>
                {user.followers?.map((follower, index) => (
                  <Row className="g-2" key={follower._id}>
                    <Col>
                      <Card
                        className="h-100 text-center animated-list-item"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <Card.Body className="d-text align-items-center">
                          <Link to={`/user/${follower._id}`}>
                            <Card.Img
                              variant="top"
                              src={
                                follower.profilePicture ||
                                "http://via.placeholder.com/50"
                              }
                              alt={follower.username}
                              className="rounded-circle me-2"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />
                          </Link>
                          <Card.Title className="mb-0">
                            <Link to={`/user/${follower._id}`}>
                              {follower.username}
                            </Link>
                          </Card.Title>

                          <Button
                            variant={
                              followingUsers[follower._id]
                                ? "danger"
                                : "success"
                            }
                            className="ms-2 btn-sm"
                            onClick={() =>
                              followingUsers[follower._id]
                                ? unfollowUser(follower._id)
                                : followUser(follower._id)
                            }
                          >
                            {followingUsers[follower._id]
                              ? "Unfollow"
                              : "Follow"}
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                ))}
              </Col>

              <Col md={6}>
                <h5 className="mt-4 bg-light p-2 text-center">
                  Following{" "}
                  <span className="badge bg-primary rounded-pill">
                    {user.following?.length || 0}
                  </span>
                </h5>
                {user.following?.map((following, index) => (
                  <Row className="g-2" key={following._id}>
                    <Col>
                      <Card
                        className="h-100 text-center animated-list-item"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <Card.Body className="d-text align-items-center">
                          <Link to={`/user/${following._id}`}>
                            <Card.Img
                              variant="top"
                              src={
                                following.profilePicture ||
                                "http://via.placeholder.com/50"
                              }
                              alt={following.username}
                              className="rounded-circle me-2"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />
                          </Link>
                          <Card.Title className="mb-0">
                            <Link to={`/user/${following._id}`}>
                              {following.username}
                            </Link>
                          </Card.Title>

                          <Button
                            variant="danger"
                            className="ms-2 btn-sm"
                            onClick={() => unfollowUser(following._id)}
                          >
                            Unfollow
                          </Button>
                        </Card.Body>
                        
                      </Card>
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>
            <hr />
            <h3 className="text-center mt-4">Your Posts</h3>
            <UserPosts posts={userPosts} />
          </Card>
        </Col>
      </Row>
    </Container>
    </>
  );
}

export default Profile;
