const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { randomBytes } = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const comments = {};

app.get("/comments", (req, res) => {
  res.send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  const { commentId } = req.body;

  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";

    await axios.post("http://event-bus-clusterip-srv:4005/events", {
      type: "CommentModerated",
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }

  res.status({});
});

app.listen(4003, () => {
  console.log("Listening on 4003");
});
