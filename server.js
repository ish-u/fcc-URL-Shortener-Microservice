require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const URL = require("./URL");
const bodyParser = require("body-parser");
const { nanoid } = require("nanoid");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// create a Short URL
app.post("/api/shorturl", async (req, res) => {
  const REPLACE_REGEX = /^https?:\/\//i;
  var hostname = req.body.url.replace(REPLACE_REGEX, "").split("/")[0];
  dns.lookup(hostname, async (err, addresses) => {
    if (err) {
      res.send({ error: "invalid url" });
    } else {
      const newURL = {
        original_url: req.body.url,
        short_url: nanoid(10),
      };
      await new URL(newURL).save();
      res.send(newURL);
    }
  });
});

// redirect to original URL given Short URL
app.get("/api/shorturl/:url", (req, res) => {
  URL.findOne({ short_url: req.params.url }, (err, data) => {
    if (err || data === null) {
      res.send({ error: "No short URL found for the given input" });
    } else {
      res.redirect(data.original_url);
    }
  });
});

// connecting to DB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => console.log(err));

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
