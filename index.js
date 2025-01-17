// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const path = require("path");
const args = process.argv || [];
const test = args.some((arg) => arg.includes("jasmine"));

const databaseUri =
  "mongodb+srv://adminmd1997:adminmunki619@cluster0.driym.mongodb.net/recipmes?retryWrites=true&w=majority";

if (!databaseUri) {
  console.log("DATABASE_URI not specified, falling back to localhost.");
}
const config = {
  databaseURI: databaseUri || "mongodb://localhost:27017/dev",
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js",
  appId: "recipmes",
  masterKey: "recipmesMasterKey619", //Add your master key here. Keep it secret!
  javascriptKey: "recipmesJSKey",
  serverURL: process.env.SERVER_URL || "http://localhost:1337/parse", // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"], // List of classes to support for query subscriptions
  },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use("/public", express.static(path.join(__dirname, "/public")));

// Serve the Parse API on the /parse URL prefix
if (!test) {
  const mountPath = process.env.PARSE_MOUNT || "/parse";
  const api = new ParseServer(config);
  api.start();
  app.use(mountPath, api.app);
}

// Parse Server plays nicely with the rest of your web routes
app.get("/", function (req, res) {
  res.status(200).send("Recipmes Server - /parse");
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get("/test", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/test.html"));
});

if (!test) {
  const port = process.env.PORT || 1337;
  const httpServer = require("http").createServer(app);
  httpServer.listen(port, function () {
    console.log("parse-server-example running on port " + port + ".");
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
