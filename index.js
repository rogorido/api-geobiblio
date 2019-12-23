const express = require("express");
const bodyParser = require("body-parser");

const pgp = require("pg-promise")(/* options */);
const db = pgp("postgres://biblio_select@localhost:5432/biblio");

const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());

async function getAllAuthors(request, response) {
  const readAllAuthors = "SELECT author_id, author_name from authors limit 10";
  const rowList = await db.query(readAllAuthors);
  response.send(rowList);
}

async function getAllWorks(request, response) {
  const readAllAuthors = "SELECT work_id, title from works limit 10";
  const rowList = await db.query(readAllAuthors);
  response.send(rowList);
}

async function getWorksWithTitle(request, response) {
  const readWorks =
    "SELECT work_id, title from vistas.vw_web_works where title ilike $1 or subtitle ilike $1 or authors ilike $1";
  const titulo = [`%${request.params.buscar}%`];
  const rowList = await db.query(readWorks, titulo);
  response.send(rowList);
}

async function getConcreteAuthor(request, response) {
  console.log(request.params);
  const readAllAuthors =
    "SELECT author_id, author_name from authors where author_id = $1";
  const rowList = await db.query(readAllAuthors, request.params.id);
  response.send(rowList);
}

app.get("/", (req, res) => {
  res.send({ message: "Lehces somos así." });
});

app.get("/authors", getAllAuthors);
app.get("/works", getAllWorks);
app.get("/works/:buscar", getWorksWithTitle);
app.get("/autores/:id", getConcreteAuthor);

app.listen(PORT, () => {
  console.log(`Server está en http://localhost:${PORT}/authors`);
});
