-- select all works with filter on several fields.

SELECT * 
FROM vistas.vw_web_works
WHERE to_tsquery('simple', $1) @@ searchterms;
