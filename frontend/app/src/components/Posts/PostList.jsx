import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import axios from "axios";
import Loader from "../Loader";
import Message from "../Message";
import { getUserInfo } from "../../utils/userSession";

function PostList({ posts, fetchPosts, startChatHandler }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const handleClose = () => setMessage("");
  const [commentContent, setCommentContent] = useState({});
  const userInfo = getUserInfo();
  const currentUserId = userInfo?._id;

  const submitCommentHandler = async (postId) => {
    try {
      setLoading(true);
      const userInfo = getUserInfo();
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        `/api/posts/${postId}/comments`,
        { content: commentContent[postId] },
        config,
      );
      setCommentContent({ ...commentContent, [postId]: "" });
      fetchPosts();
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

  const deletePostHandler = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setLoading(true);
        const userInfo = getUserInfo();
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`/api/posts/${postId}`, config);

        fetchPosts();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
        );
      }
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" onClose={() => setError(null)}>
          {error}
        </Message>
      ) : (
        posts?.map((post, index) => (
          <Card
            key={post._id}
            className="my-3 post-card"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Card.Body>
              <Card.Title>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <img
                      src={
                        post.user.profilePicture ||
                        "https://via.placeholder.com/50"
                      }
                      alt={post.user.username}
                      className="rounded-circle me-3 post-user-avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <span className="fw-semibold mb-0">{post.user.username}</span>
                  </div>
                  {post.user._id === currentUserId && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "34px", height: "34px", padding: 0 }}
                      onClick={() => deletePostHandler(post._id)}
                      title="Delete post"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </Button>
                  )}
                  <Button variant="primary" onClick={() => startChatHandler(post.user._id)}>Chat</Button>
                </div>
              </Card.Title>
              <Card.Text>{post.content}</Card.Text>
              <Card.Text>
                <small className="text-body-secondary">
                  Posted at: {post.createdAt}
                </small>
              </Card.Text>
              {post?.image && (
                <Card.Img
                  variant="top"
                  src={post.image}
                  alt="Post image"
                  className="card-img-top"
                  style={{
                    width: "300px",
                    height: "300px",
                    objectFit: "cover",
                  }}
                />
              )}
            </Card.Body>
            <div
              className="accordion accordion-flush"
              id={`commentContent-${post._id}`}
            >
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#flush-collapseOne-${post._id}`}
                    aria-expanded="false"
                    aria-controls={`flush-collapseOne-${post._id}`}
                  >
                    Comments <i className="fa-solid fa-comment ml-3"></i>
                  </button>
                </h2>
                <div
                  id={`flush-collapseOne-${post._id}`}
                  className="accordion-collapse collapse"
                  data-bs-parent={`#accordionFlushExample-${post._id}`}
                >
                  <div className="accordion-body">
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitCommentHandler(post._id);
                      }}
                    >
                      <Form.Group controlId={`commsntContent-${post._id}`}>
                        <Form.Control
                          type="text"
                          placeholder="Post a comment..."
                          value={commentContent[post._id] || ""}
                          onChange={(e) =>
                            setCommentContent({
                              ...commentContent,
                              [post._id]: e.target.value,
                            })
                          }
                        ></Form.Control>
                        <Button
                          type="submit"
                          variant="primary"
                          className="mt-2 btn-sm"
                        >
                          Comment
                        </Button>
                      </Form.Group>
                    </Form>

                    <Card.Text className="mt-2">
                      {post.comments?.map((comment) => (
                        <div key={comment._id}>
                          <strong>{comment.user.username}</strong>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                    </Card.Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </>
  );
}

export default PostList;
