const express = require("express");
// const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();

require("dotenv").config();

const dbFunctions = require("./db/dbfunctions");

const app = express();

// https://expressjs.com/en/resources/middleware/morgan.html
app.use(morgan("combined")); // common, tiny, etc.

app.use(
  morgan("combined", {
    stream: fs.createWriteStream(
      path.join(homedir, ".config/apibiblio/", "access.log"),
      {
        flags: "a",
      }
    ),
  })
);

// app.use(bodyParser.json());
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

app.use(compression());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 45, // 45 requests,
});

app.use(limiter);

app.use(
  cors({
    origin: [
      "https://dominicans.georeligion.org",
      "http://localhost:8000",
      "http://localhost:3000",
      "http://localhost:9000",
      "http://localhost:4000",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://192.168.1.10:8080",
    ],
  })
);

// send API version
app.get("/", (req, res) => {
  res.send({ version: process.env.npm_package_version });
});

app.get("/categories/", dbFunctions.getCategories);
app.get("/search/", dbFunctions.getWorks);

module.exports = app;
