import React, { useState, useEffect } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import Loader from "../Loader";
import Message from "../Message";
const ENDPOINT = "http://localhost:5000";
let socket;

function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const currentUserId = userInfo?._id;

  useEffect(() => {
    if (!chatId) {
      return;
    }

    socket = io(ENDPOINT);
    socket.emit("joinChat", chatId);

    socket.on("receiveMessage", (message) => {
      console.log("message received", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId]);

  const submitMessageHandler = async (e) => {
    e.preventDefault();

    if (!chatId || !messageContent.trim()) {
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };

      const { data } = await axios.post(
        `/api/chat/${chatId}/message`,
        { content: messageContent.trim() },
        config,
      );

      setMessages(data?.messages || []);
      socket.emit("sendMessage", {
        chatId,
        content: messageContent.trim(),
        sender: userInfo?._id,
        timestamp: new Date().toISOString(),
      });
      setMessageContent("");
      setError(null);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message,
      );
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!userInfo?.token) {
        setError("Please login to continue");
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat/${chatId}`, config);
      setMessages(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      setError(
        error.response && error.response.data?.message
          ? error.response.data.message
          : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chatId) {
      return;
    }
    fetchMessages();
  }, [chatId]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" onClose={() => setError(null)}>
          {error}
        </Message>
      ) : (
        <ListGroup>
          {messages?.map((message) => (
            <ListGroup.Item
              key={message._id || `${message.timestamp}-${message.content}`}
              className={`d-flex ${
                String(message?.sender?._id || message?.sender) ===
                String(currentUserId)
                  ? "justify-content-end"
                  : "justify-content-start"
              } border-0`}
            >
              <div
                className={`px-3 py-2 rounded-3 ${
                  String(message?.sender?._id || message?.sender) ===
                  String(currentUserId)
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "75%" }}
              >
                <div className="small fw-semibold mb-1">
                  {String(message?.sender?._id || message?.sender) ===
                  String(currentUserId)
                    ? "You"
                    : message?.sender?.username || "User"}
                </div>
                <div>{message?.content}</div>
              </div>
            </ListGroup.Item>
          ))}
          <Form onSubmit={submitMessageHandler}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Type a message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-2">
              Send
            </Button>
          </Form>
        </ListGroup>
      )}
    </>
  );
}

export default Chat;
