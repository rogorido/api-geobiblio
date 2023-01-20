-- select all works with filter on several fields.

--- it is important to use vistas.unaccent, otherwise I get an error
--- because the user can not access the function which is available in
--- the vistas schema
SELECT * 
FROM vistas.vw_web_works
WHERE to_tsquery('simple', vistas.unaccent($1)) @@ searchterms;
