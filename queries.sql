
-- Create car_details table
CREATE TABLE car_details (
    car_id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_model TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Luxury', 'Sport', 'SUV', 'Economy')),
    price DECIMAL(10,2) NOT NULL,
    seats INTEGER NOT NULL,
    transmission TEXT NOT NULL
);

-- Create customer_details table
CREATE TABLE customer_details (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create order_details table
CREATE TABLE order_details (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    car_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    full_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    driving_license TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_details(customer_id),
    FOREIGN KEY (car_id) REFERENCES car_details(car_id)
);



INSERT INTO car_details (car_model, type, price, seats, transmission) VALUES
-- Luxury Cars
('Mercedes S-Class', 'Luxury', 150.00, 5, 'Automatic'),
('BMW 7 Series', 'Luxury', 140.00, 5, 'Automatic'),
('Tesla Model S', 'Luxury', 180.00, 5, 'Automatic'),
('Rolls Royce Phantom', 'Luxury', 450.00, 5, 'Automatic'),
('Bentley Continental GT', 'Luxury', 320.00, 4, 'Automatic'),

-- Sport Cars
('Audi R8', 'Sport', 220.00, 2, 'Automatic'),
('Porsche 911', 'Sport', 200.00, 2, 'Manual'),
('Lamborghini Huracan', 'Sport', 350.00, 2, 'Automatic'),
('Ferrari F8 Tributo', 'Sport', 400.00, 2, 'Automatic'),
('McLaren 720S', 'Sport', 380.00, 2, 'Automatic'),

-- SUV Cars
('Range Rover Sport', 'SUV', 170.00, 7, 'Automatic'),
('BMW X7', 'SUV', 160.00, 7, 'Automatic'),
('Mercedes GLS', 'SUV', 165.00, 7, 'Automatic'),
('Porsche Cayenne', 'SUV', 190.00, 5, 'Automatic'),
('Audi Q8', 'SUV', 175.00, 5, 'Automatic'),

-- Economy Cars
('Toyota Camry', 'Economy', 70.00, 5, 'Automatic'),
('Honda Accord', 'Economy', 75.00, 5, 'Automatic'),
('Volkswagen Passat', 'Economy', 65.00, 5, 'Automatic'),
('Hyundai Sonata', 'Economy', 60.00, 5, 'Automatic'),
('Mazda 6', 'Economy', 68.00, 5, 'Automatic');