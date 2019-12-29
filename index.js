const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const pgp = require("pg-promise")(/* options */);
const db = pgp(
  "postgres://biblio_select:1AmMNo7hUcGe@localhost:5432/bibliography"
);
require("dotenv").config();

const cors = require("cors");

const app = express();
app.use(morgan("tiny"));

// Helper for linking to external query files:
function sql(file) {
  const fullPath = path.join(__dirname, file);
  return new pgp.QueryFile(fullPath, { minify: true });
}

// Es necesario crearlo aquí globalmente y no en la función concreta
// por no sé cuestión interna...
// const sqlFindWork = sql("./sql/works.sql");
const sqlFindWork = sql("./sql/worksglobal.sql");
const sqlFindWorkPerCategory = sql("./sql/workspercategory.sql");

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
  max: 15 // 15 requests,
});

app.use(limiter);

app.use(
  cors({
    origin: ["https://beta.georeligion.org", "http://localhost:8000"]
  })
);

async function getWorksWithTitle(request, response) {
  const titulo = [`%${request.params.buscar}%`];
  const rowList = await db.query(sqlFindWork, titulo);

  response.send(rowList);
}

async function getWorksWithCategories(request, response) {
  let rowList = [];

  // we check if the URL has a query with cat=X or not.
  // if not, we return all categories for use in the select component.
  if (Object.keys(request.query).length === 0) {
    const allCategories =
      "SELECT category_id as value, category as label FROM categories ORDER BY category";
    rowList = await db.query(allCategories);
  } else {
    let cats = Array.isArray(request.query.cat)
      ? request.query.cat.join(",")
      : request.query.cat;

    rowList = await db.query(sqlFindWorkPerCategory, cats);
  }
  response.send(rowList);
}

app.get("/works/:buscar", getWorksWithTitle);
app.get("/categories/", getWorksWithCategories);

app.listen(process.env.PORT, () => {
  console.log(`Server está en http://localhost:${process.env.PORT}/`);
});
