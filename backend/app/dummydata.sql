-- Insert data into the `users` table
INSERT INTO users (id, username, password, email, phone, first_name, last_name, date_of_birth, is_google_user, is_apple_user)
VALUES
('1', 'johndoe', 'password123', 'johndoe@example.com', '1234567890', 'John', 'Doe', '1990-01-01', FALSE, FALSE),
('2', 'janedoe', 'password456', 'janedoe@example.com', '0987654321', 'Jane', 'Doe', '1992-02-02', TRUE, FALSE),
('3', 'admin', 'admin123', 'admin@example.com', '1122334455', 'Admin', 'User', '1985-05-05', FALSE, TRUE);

-- Insert data into the `assets` table
INSERT INTO assets (id, symbol, name, type)
VALUES
(1, 'AAPL', 'Apple Inc.', 'stock'),
(2, 'GOOGL', 'Alphabet Inc.', 'stock'),
(3, 'TSLA', 'Tesla Inc.', 'stock'),
(4, 'BTC', 'Bitcoin', 'crypto'),
(5, 'ETH', 'Ethereum', 'crypto');

-- Insert data into the `portfolio` table
INSERT INTO portfolio (user_id, asset_id, quantity, avg_cost, last_updated, cur_price)
VALUES
(1, 1, 10, 150.00, '2023-01-01 10:00:00', 170.00),
(1, 2, 5, 2800.00, '2023-01-02 11:00:00', 2900.00),
(2, 3, 20, 700.00, '2023-01-03 12:00:00', 750.00),
(2, 4, 1, 20000.00, '2023-01-04 13:00:00', 21000.00),
(3, 5, 2, 1500.00, '2023-01-05 14:00:00', 1600.00);

-- Insert data into the `watchlist` table
INSERT INTO watchlist (id, user_id, symbol, is_favorite)
VALUES
(1, '1', 'AAPL', TRUE),
(2, '1', 'GOOGL', FALSE),
(3, '2', 'TSLA', TRUE),
(4, '2', 'BTC', FALSE),
(5, '3', 'ETH', TRUE);

-- Insert data into the `transactions` table
INSERT INTO transactions (id, user_id, asset_id, amount, price, timestamp, type, status)
VALUES
(1, 1, 1, 10, 150.00, '2023-01-01 10:00:00', 'buy', 'completed'),
(2, 1, 2, 5, 2800.00, '2023-01-02 11:00:00', 'buy', 'completed'),
(3, 2, 3, 20, 700.00, '2023-01-03 12:00:00', 'buy', 'completed'),
(4, 2, 4, 1, 20000.00, '2023-01-04 13:00:00', 'buy', 'completed'),
(5, 3, 5, 2, 1500.00, '2023-01-05 14:00:00', 'buy', 'completed');