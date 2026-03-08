import React, { useEffect, useState } from "react";
import { ListGroup, Button, Card } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Message from "../Message";
import Loader from "../Loader";

function ChatList() {
  const [chatItems, setChatItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthConfig = () => {
    const userinfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userinfo?.token) {
      throw new Error("Please login to view chats");
    }

    return {
      userinfo,
      config: {
        headers: {
          Authorization: `Bearer ${userinfo.token}`,
        },
      },
    };
  };

  const fetchChatList = async () => {
    try {
      setLoading(true);
      const { userinfo, config } = getAuthConfig();

      const [{ data: chats }, { data: profile }] = await Promise.all([
        axios.get("/api/chat", config),
        axios.get("/api/users/profile", config),
      ]);

      const currentUserId = profile?._id || userinfo?._id;
      const followingIds = new Set(
        (profile?.following || [])
          .map((user) => (typeof user === "string" ? user : user?._id))
          .filter(Boolean),
      );

      const chatMapByOtherUser = new Map();
      (Array.isArray(chats) ? chats : []).forEach((chat) => {
        const users = Array.isArray(chat?.users) ? chat.users : [];
        const otherUser = users.find((user) => user?._id !== currentUserId);
        if (otherUser?._id) {
          chatMapByOtherUser.set(otherUser._id, chat);
        }
      });

      const followedUsers = (profile?.following || [])
        .map((user) => (typeof user === "string" ? null : user))
        .filter((user) => user?._id && followingIds.has(user._id));

      const items = followedUsers.map((user) => {
        const existingChat = chatMapByOtherUser.get(user._id);
        const lastMessage =
          Array.isArray(existingChat?.messages) && existingChat.messages.length > 0
            ? existingChat.messages[existingChat.messages.length - 1]
            : null;

        return {
          userId: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
          chatId: existingChat?._id || null,
          lastMessage,
        };
      });

      setChatItems(items);
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

  const openChatHandler = async (userId) => {
    try {
      const { config } = getAuthConfig();
      const { data } = await axios.post("/api/chat", { userId }, config);
      navigate(`/chat/${data._id}`);
    } catch (error) {
      setError(
        error.response && error.response.data?.message
          ? error.response.data.message
          : error.message,
      );
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" onClose={() => setError(null)}>
          {error}
        </Message>
      ) : (
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            <div className="px-3 py-3 border-bottom">
              <h5 className="mb-0 fw-semibold">Chats (Following)</h5>
            </div>

            <ListGroup variant="flush">
              {chatItems.length === 0 && (
                <ListGroup.Item className="text-muted py-4 px-3">
                  You are not following anyone yet.
                </ListGroup.Item>
              )}

              {chatItems.map((item) => (
                <ListGroup.Item
                  key={item.userId}
                  className="d-flex align-items-center justify-content-between py-3 px-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={
                        item.profilePicture ||
                        "https://via.placeholder.com/52"
                      }
                      alt={item.username}
                      className="rounded-circle"
                      style={{ width: "52px", height: "52px", objectFit: "cover" }}
                    />
                    <div>
                      <div className="fw-semibold">{item.username}</div>
                      <small className="text-muted">
                        {item.lastMessage?.content || "Start conversation"}
                      </small>
                    </div>
                  </div>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openChatHandler(item.userId)}
                  >
                    Open Chat
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default ChatList;
