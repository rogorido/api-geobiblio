-- select of categories for the input box

SELECT category_id as VALUE,
       LOWER(category) as label
FROM categories
ORDER BY category;
