const { db, pgp } = require("./dbconnect");
const path = require("path");

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

async function getCategories(req, res) {
  const allCategories =
    "SELECT category_id as value, category as label FROM categories ORDER BY category";
  try {
    const rowList = await db.many(allCategories);
    res.send(rowList);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
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

module.exports = { getCategories, getWorks };
