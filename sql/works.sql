-- select all works with filter on several fields.

SELECT * 
FROM vistas.vw_web_works
where title ilike $1
      or subtitle ilike $1
      or authors ilike $1
      or cats ilike $1
      or pw_title ilike $1
      or pw_subtitle ilike $1;

