const express = require("express"); // ✅ Fix for "express is not defined"
const dotenv = require("dotenv");
dotenv.config();

const { app, server } = require("./socket/socket"); // ✅ Use shared app and server
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const ConnectDB = require("./Config/ConnectDB");
const router = require("./route/user.route");
const cookieParser = require("cookie-parser");
const Post = require("./route/PostRoute");
const Message = require("./route/MessageRoute");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "https://instragram-back-end-p.onrender.com",
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use("/auth", router);
app.use("/post", Post);
app.use("/chat", Message);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('GET request to the homepage')
})

ConnectDB();

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`.bgGreen);
});
