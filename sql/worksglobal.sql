-- select all works with filter on several fields.

SELECT * 
FROM vistas.vw_web_works
where searchterms ilike $1;
