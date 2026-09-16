const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  } else if (type === "CommentCreated") {
    const { id, content, postId: postId, status } = data;

    const post = posts[postId];

    post.comments.push({ id, content, status });
  } else if (type === "CommentUpdated") {
    const { id, content, postId: postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find((e) => e.id === id);
    comment.status = status;
    comment.content = content;
  }
};

app.post("/events", (req, res) => {
  console.log("Recieved Event", req.body.type);
  const { type, data } = req.body;

  handleEvent(type, data);

  console.log(posts);
  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");

  try {
    const res = await axios.get("http://event-bus-clusterip-srv:4005/events");

    for (const event of res.data) {
      console.log("Processing event:", event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {}
});
