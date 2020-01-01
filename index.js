const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cors = require("cors");
const dbFunctions = require("./functions/dbfunctions");

require("dotenv").config();

const app = express();
app.use(morgan("tiny"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(compression());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 45 // 45 requests,
});

app.use(limiter);

app.use(
  cors({
    origin: ["https://beta.georeligion.org", "http://localhost:8000"]
  })
);

app.get("/works/:buscar", dbFunctions.getWorksWithTitle);
app.get("/categories/", dbFunctions.getCategories);
app.get("/search/", dbFunctions.getWorks);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});
