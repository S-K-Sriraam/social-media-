const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/PostRoutes");
const path = require('path')
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes")

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client is connected...");
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log("joined chat");
  });

  socket.on("sendMessage", (message) => {
    io.to(message.chatId).emit("receiveMessage", message);
    console.log("message sent...");
  });

  socket.on("disconnect", () => {
    console.log("Client is disconnected...");
  });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use('/uploads',express.static(path.join(__dirname, '/uploads')))
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server is running at PORT", PORT);
});
