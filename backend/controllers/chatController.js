const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");
const User = require("../models/User");

// Create or get a chat between users
// POST /api/chat

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("messages.sender", "-password");

  if (!chat) {
    chat = new Chat({
      users: [req.user._id, userId],
    });
    await chat.save();
  }
  res.json(chat);
});

// send a message
// POST /api/chat/:chatId/message

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Message content is required");
  }

  const chat = await Chat.findById(chatId);
  if (chat) {
    const message = {
      sender: req.user._id,
      content,
      timestamp: Date.now(),
    };

    chat.messages.push(message);
    await chat.save();
    res.json(chat);
  } else {
    res.status(404);
    throw new Error("Chat not found...");
  }
});

// get all chats for user
// GET /api/chat

const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    users: req.user._id,
  })
    .populate("users", "-password")
    .populate("messages.sender", "-password");
  res.json(chats);
});

// get messages from the chat
// GET /api/chat/:chatId

const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("messages.sender", "-password");

  if (chat) {
    res.json(chat.messages);
  } else {
    res.status(404);
  }
});

module.exports = {accessChat, sendMessage, getUserChats, getChatMessages}
