import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import Loader from "../Loader";
import Message from "../Message";
import { getUserInfo } from "../../utils/userSession";

function PostForm({fetchPosts}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const handleClose = () => setMessage("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }
    try {
      setLoading(true);
      const userInfo = getUserInfo();
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post("/api/posts", formData, config);
      setContent("");
      setImage(null);
      setMessage("Post created successfully.");
      if (typeof fetchPosts === "function") {
        await fetchPosts();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
      );
    }
  };

  return (
    <>
      {message && (
        <Message variant="success" onClose={handleClose}>
          {message}
        </Message>
      )}
      {error && (
        <Message variant="danger" onClose={() => setError(null)}>
          {error}
        </Message>
      )}

      <Form onSubmit={submitHandler} className="post-form">
        <Form.Group controlId="content">
          <Form.Control
            type="text"
            placeholder="Post something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="image" className="mt-3">
          <Form.Control
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          ></Form.Control>
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="mt-3 btn-sm"
          disabled={loading}
        >
          {loading ? <Loader size="sm" /> : "Post"}{" "}
          <i className="fa-solid fa-upload"></i>
        </Button>
      </Form>
    </>
  );
}

export default PostForm;
