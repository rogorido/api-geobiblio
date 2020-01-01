const path = require("path");
const pgp = require("pg-promise")(/* options */);
const db = pgp(
  "postgres://biblio_select:1AmMNo7hUcGe@localhost:5432/bibliography"
);

// Helper for linking to external query files:
function sql(file) {
  const fullPath = path.join(__dirname, file);
  return new pgp.QueryFile(fullPath, { minify: true });
}

// Es necesario crearlo aquí globalmente y no en la función concreta
// por no sé cuestión interna...
// const sqlFindWork = sql("./sql/works.sql");
const sqlFindWork = sql("../sql/worksglobal.sql");
const sqlFindWorkPerCategory = sql("../sql/workspercategory.sql");
const sqlFindWorkTermsCats = sql("../sql/workstermscats.sql");

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
  if (!request.query.term && request.query.cat) {
    let cats = Array.isArray(request.query.cat)
      ? request.query.cat.join(",")
      : request.query.cat;

    rowList = await db.query(sqlFindWorkPerCategory, cats);
  } else if (!request.query.cat && request.query.term) {
    let terms = Array.isArray(request.query.term)
      ? request.query.term.join(":*&")
      : request.query.term;

    // we need to add at the end :*
    terms = `${terms}:*`;
    rowList = await db.query(sqlFindWork, terms);
  } else {
    // terms and cats

    let cats = Array.isArray(request.query.cat)
      ? request.query.cat.join(",")
      : request.query.cat;

    let terms = Array.isArray(request.query.term)
      ? request.query.term.join(":*&")
      : request.query.term;

    // we need to add at the end :*
    terms = `${terms}:*`;

    let valuestopass = [terms, cats];

    rowList = await db.query(sqlFindWorkTermsCats, valuestopass);
  }
  response.send(rowList);
}

module.exports = { getWorksWithTitle, getCategories, getWorks };
