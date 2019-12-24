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

const cors = require("cors");

const app = express();
const PORT = 8080;

// Helper for linking to external query files:
function sql(file) {
  const fullPath = path.join(__dirname, file);
  return new pgp.QueryFile(fullPath, { minify: true });
}

// Es necesario crearlo aquí globalmente y no en la función concreta
// por no sé cuestión interna...
const sqlFindWork = sql("./sql/works.sql");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(morgan("tiny"));
// app.use(cors());

app.use(compression());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5 // 5 requests,
});

app.use(limiter);

app.use(
  cors({
    origin: ["https://beta.georeligion.org", "http://localhost:8000"]
  })
);

// app.options("*", function(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   res.end();
// });

// app.use(
//   cors({
//     origin: myorigin.tld,
//     allowedHeaders: [
//       "Accept-Version",
//       "Authorization",
//       "Credentials",
//       "Content-Type"
//     ]
//   })
// );

//app.options("*", cors());
//app.use(cors());

// app.use(function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// var allowedOrigins = ["http://localhost:8000", "https://beta.georeligion.org"];

// app.use(
//   cors({
//     origin: function(origin, callback) {
//       // allow requests with no origin
//       // (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         var msg =
//           "The CORS policy for this site does not " +
//           "allow access from the specified Origin.";
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     }
//   })
// );

async function getAllAuthors(request, response) {
  const readAllAuthors = "SELECT author_id, author_name from authors limit 10";
  const rowList = await db.query(readAllAuthors);
  response.send(rowList);
}

async function getWorksWithTitle(request, response) {
  const titulo = [`%${request.params.buscar}%`];
  const rowList = await db.query(sqlFindWork, titulo);

  // response.setHeader("Access-Control-Allow-Origin", "*");
  // response.setHeader(
  //   "Access-Control-Allow-Methods",
  //   "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  // ); // If needed
  // response.setHeader(
  //   "Access-Control-Allow-Headers",
  //   "X-Requested-With,content-type"
  // ); // If needed

  response.send(rowList);
}

async function getConcreteAuthor(request, response) {
  console.log(request.params);
  const readAllAuthors =
    "SELECT author_id, author_name from authors where author_id = $1";
  const rowList = await db.query(readAllAuthors, request.params.id);
  response.send(rowList);
}

app.get("/authors", getAllAuthors);
//app.get("/works", getAllWorks);
app.get("/works/:buscar", getWorksWithTitle);
app.get("/autores/:id", getConcreteAuthor);

app.listen(PORT, () => {
  console.log(`Server está en http://localhost:${PORT}/authors`);
});
