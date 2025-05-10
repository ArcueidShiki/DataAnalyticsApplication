-- TODO separate portfolio table into balance table and stocks table
-- Assuming the `users` table exists and has a `id` column and a `name` column
-- Fetch the id for the user with name 'aruceid'
-- Then populate the watchlist table with 20 rows of dummy data

INSERT INTO watchlist (user_id, symbol, is_favorite)
VALUES
((SELECT id FROM users WHERE username = 'arcueid'), 'AAPL', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'GOOGL', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'TSLA', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'MSFT', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'AMZN', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'NFLX', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'NVDA', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'META', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'XOM', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'JPM', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'V', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'MA', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'DIS', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'PYPL', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'ADBE', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'INTC', FALSE),
((SELECT id FROM users WHERE username = 'arcueid'), 'CSCO', TRUE),
((SELECT id FROM users WHERE username = 'arcueid'), 'ORCL', FALSE);
