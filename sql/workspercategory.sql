-- select all works with different categories

SELECT * 
FROM vistas.vw_web_works
WHERE work_id IN
      (SELECT work_id FROM works_categories
       WHERE category_id IN ($1:raw));
