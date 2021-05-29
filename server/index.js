const path = require("path");
const fs = require("fs");
const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require(path.join(__dirname, "../webpack.config.js"));
const compiler = webpack(config);
const app = express();

const { script } = require("./script");

app.use(webpackDevMiddleware(compiler, config.devServer));
app.use(webpackHotMiddleware(compiler));
app.use(express.static(path.join(__dirname, "../build")));

app.get("/api/getData/:username", async (req, res) => {
  const today = new Date();
  const month = today.getMonth() + 1;

  const saveHere = path.join(
    __dirname,
    `../data/${req.params.username}_${today.getFullYear()}-${
      month === 1 ? month : "0" + month
    }-${today.getDate()}_followers.txt`
  );

  console.log(`starting script for user ${req.params.username}`);
  const credentials = {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  };
  const data = await script(req.params.username, credentials);

  fs.writeFile(saveHere, data.followers.join(","), function (err) {
    if (err) return console.log(err);
    console.log("file has been saved > " + saveHere);
    res.send(data);
    console.log(`stopping script for user ${req.params.username}`);
  });
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.listen(4000, () => console.log("server started at http://localhost:4000"));
