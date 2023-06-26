const express = require("express");
const port = 5000;
const dotenv = require("dotenv").config();
const passport = require("passport");
const passportJwt = require("./config/passport-jwt-strategy");
const db = require("./config/mongoose");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

const app = express();

// app.use((req, res, next) => {
//   // To be able to send cookies
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

const { uploadFile, getUrl } = require("./config/s3");
const Relationship = require("./models/Relationship");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post(
  "/api/v1/upload",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ height: 1080, width: 1080, fit: "cover" })
      .toBuffer();
    const imageName = await uploadFile(buffer);
    return res.status(200).json(imageName);
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routes"));

const server = app.listen(port, (err) => {
  if (err) {
    console.log(`Error in starting the express server: ${err}`);
    return;
  }
  console.log(`Server is running on port: ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

let connectedUsers = [];

io.on("connection", (socket) => {
  let currentSocket;
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    currentSocket = userData._id;
    socket.emit("connected");
    connectedUsers.push(userData._id);
    // connectedUsers = Array.from(new Set(connectedUsers));
    console.log(connectedUsers);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users is not defined.");
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("online friends", async (userData) => {
    const sentFriends = await Relationship.find({
      sentBy: userData._id,
      status: "Accepted",
    })
      .populate("sentBy", "firstName lastName profileImage email")
      .populate("sentTo", "firstName lastName profileImage email");
    const receivedFriends = await Relationship.find({
      sentTo: userData._id,
      status: "Accepted",
    })
      .populate("sentBy", "firstName lastName profileImage email")
      .populate("sentTo", "firstName lastName profileImage email");
    const allFriends = [...sentFriends, ...receivedFriends];

    let signedUrlDone = [];
    for (let friend of allFriends) {
      if (signedUrlDone.indexOf(friend.sentBy.id) === -1) {
        if (friend.sentBy.profileImage) {
          const url = await getUrl(friend.sentBy.profileImage);
          friend.sentBy.profileImage = url;
          signedUrlDone.push(friend.sentBy.id);
        }
      }
      if (signedUrlDone.indexOf(friend.sentTo.id) === -1) {
        if (friend.sentTo.profileImage) {
          const url = await getUrl(friend.sentTo.profileImage);
          friend.sentTo.profileImage = url;
          signedUrlDone.push(friend.sentTo.id);
        }
      }
    }
    const onlineFriends1 = allFriends.filter(
      (rel) =>
        rel.sentBy.id !== userData._id &&
        connectedUsers.indexOf(rel.sentBy.id) !== -1
    );
    const onlineFriends2 = allFriends.filter(
      (rel) =>
        rel.sentTo.id !== userData._id &&
        connectedUsers.indexOf(rel.sentTo.id) !== -1
    );
    const onlineFriends = [...onlineFriends1, ...onlineFriends2];
    const onlineData = onlineFriends.map((rel) => {
      if (rel.sentBy.id !== userData._id) {
        return rel.sentBy;
      }
      return rel.sentTo;
    });
    socket.emit("online friends list", onlineData);
  });

  socket.on("logout", (userData) => {
    const index = connectedUsers.indexOf(userData._id);
    connectedUsers.splice(index, 1);
  });

  socket.on("disconnect", () => {
    console.log(currentSocket + " Disconnected!");
    const index = connectedUsers.indexOf(currentSocket);
    connectedUsers.splice(index, 1);
  });
});
