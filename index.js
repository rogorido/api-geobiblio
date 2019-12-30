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
const sqlFindWorkTermsCats = sql("./sql/workstermscats.sql");

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

async function getCategories(request, response) {
  const allCategories =
    "SELECT category_id as value, category as label FROM categories ORDER BY category";
  const rowList = await db.query(allCategories);
  response.send(rowList);
}

async function getWorks(request, response) {
  let rowList = [];

  // there are no terms, only cats
  if (!request.query.terms && request.query.cat) {
    let cats = Array.isArray(request.query.cat)
      ? request.query.cat.join(",")
      : request.query.cat;

    rowList = await db.query(sqlFindWorkPerCategory, cats);
  } else if (!request.query.cat && request.query.terms) {
    let terms = [`%${request.query.terms}%`];
    console.log(terms);
    rowList = await db.query(sqlFindWork, terms);
  } else {
    // terms and cats

    let cats = Array.isArray(request.query.cat)
      ? request.query.cat.join(",")
      : request.query.cat;

    let terms = `%${request.query.terms}%`;

    let valuestopass = [terms, cats];

    rowList = await db.query(sqlFindWorkTermsCats, valuestopass);
  }
  response.send(rowList);
}

app.get("/works/:buscar", getWorksWithTitle);
app.get("/categories/", getCategories);
app.get("/search/", getWorks);

app.listen(process.env.PORT, () => {
  console.log(`Server está en http://localhost:${process.env.PORT}/`);
});
