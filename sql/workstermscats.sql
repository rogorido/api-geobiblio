-- select all works with filter on several fields.

SELECT * 
FROM vistas.vw_web_works
WHERE searchterms ILIKE $1
      AND work_id IN
      (SELECT work_id FROM works_categories
       WHERE category_id IN ($2:raw));

