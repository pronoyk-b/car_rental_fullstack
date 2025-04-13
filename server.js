const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

// Session middleware must come before other middleware
app.use(session({
    secret: 'rent-a-car-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using https
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Database setup
const dbPath = path.join(__dirname, 'rentacar.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
    // Create customer_details table
    db.run(`CREATE TABLE IF NOT EXISTS customer_details (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Create car_details table
    db.run(`CREATE TABLE IF NOT EXISTS car_details (
        car_id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_model TEXT NOT NULL,
        type TEXT NOT NULL,
        price REAL NOT NULL
    )`);

    // Create order_details table
    db.run(`CREATE TABLE IF NOT EXISTS order_details (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        car_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        full_address TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        driving_license TEXT NOT NULL,
        pickup_date TEXT NOT NULL,
        return_date TEXT NOT NULL,
        total_price REAL NOT NULL,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customer_details(customer_id),
        FOREIGN KEY (car_id) REFERENCES car_details(car_id)
    )`);

    // Insert sample cars if the table is empty
    db.get('SELECT COUNT(*) as count FROM car_details', [], (err, row) => {
        if (err) {
            console.error('Error checking car_details:', err);
            return;
        }
        
        if (row.count === 0) {
            const sampleCars = [
                ['Toyota Camry', 'Sedan', 50],
                ['Honda CR-V', 'SUV', 70],
                ['BMW 3 Series', 'Luxury', 100],
                ['Ford Mustang', 'Sports', 120],
                ['Chevrolet Suburban', 'SUV', 90],
                ['Mercedes-Benz C-Class', 'Luxury', 110],
                ['Volkswagen Golf', 'Hatchback', 45],
                ['Tesla Model 3', 'Electric', 95]
            ];

            const stmt = db.prepare('INSERT INTO car_details (car_model, type, price) VALUES (?, ?, ?)');
            sampleCars.forEach(car => {
                stmt.run(car, (err) => {
                    if (err) console.error('Error inserting car:', err);
                });
            });
            stmt.finalize();
            console.log('Sample cars inserted');
        }
    });
});

// Initialize database before starting server
let dbReady = false;
db.serialize(() => {
    db.get('SELECT COUNT(*) as count FROM customer_details', [], (err, row) => {
        if (err) {
            console.error('Error checking customer_details:', err);
            process.exit(1);
        }
        
        if (row.count === 0) {
            console.log('No customers found, skipping database initialization');
        } else {
            dbReady = true;
        }
    });
});

// Start the server after database is initialized
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Routes
app.post('/api/register', async (req, res) => {
    const { customer_name, email, username, password } = req.body;
    
    // Validate input
    if (!customer_name || !email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Attempting to insert new user:', { customer_name, email, username });
        
        const query = 'INSERT INTO customer_details (customer_name, email, username, password) VALUES (?, ?, ?, ?)';
        db.run(query, [customer_name, email, username, hashedPassword], function(err) {
            if (err) {
                console.error('Database error:', err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Username or email already exists' });
                } else {
                    res.status(500).json({ error: 'Error creating user: ' + err.message });
                }
            } else {
                console.log('User registered successfully with ID:', this.lastID);
                res.json({ 
                    message: 'User registered successfully',
                    userId: this.lastID 
                });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'SELECT * FROM customer_details WHERE username = ?';
    db.get(query, [username], async (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error during login' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                // Set session data
                req.session.user = {
                    id: user.customer_id,
                    name: user.customer_name,
                    email: user.email,
                    username: user.username
                };
                
                // Save session explicitly
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ error: 'Error saving session' });
                    }
                    
                    return res.json({
                        message: 'Login successful',
                        user: {
                            id: user.customer_id,
                            name: user.customer_name,
                            email: user.email,
                            username: user.username
                        }
                    });
                });
            } else {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return res.status(500).json({ error: 'Error during login' });
        }
    });
});

app.get('/api/cars', (req, res) => {
    const query = 'SELECT * FROM car_details';
    db.all(query, [], (err, cars) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching cars' });
        } else {
            res.json(cars);
        }
    });
});

app.post('/api/bookings', requireAuth, (req, res) => {
    console.log('Received booking request:', req.body);
    console.log('User session:', req.session.user);

    const { car_id, full_name, full_address, phone_number, driving_license, pickup_date, return_date, total_price } = req.body;
    const customer_id = req.session.user.id;

    // Validate input
    if (!car_id || !full_name || !full_address || !phone_number || !driving_license || !pickup_date || !return_date || !total_price) {
        console.log('Missing fields:', { car_id, full_name, full_address, phone_number, driving_license, pickup_date, return_date, total_price });
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        INSERT INTO order_details (
            customer_id, car_id, full_name, full_address, phone_number, 
            driving_license, pickup_date, return_date, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        customer_id, car_id, full_name, full_address, phone_number,
        driving_license, pickup_date, return_date, total_price
    ];

    console.log('Executing query:', query);
    console.log('With values:', values);

    db.run(query, values, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Error creating booking: ' + err.message });
        } else {
            console.log('Booking created successfully with ID:', this.lastID);
            res.json({ 
                message: 'Booking created successfully',
                bookingId: this.lastID 
            });
        }
    });
});

app.get('/api/bookings/history', requireAuth, (req, res) => {
    const customer_id = req.session.user.id;
    
    const query = `
        SELECT o.*, c.car_model, c.type
        FROM order_details o
        JOIN car_details c ON o.car_id = c.car_id
        WHERE o.customer_id = ?
        ORDER BY o.booking_date DESC
    `;
    
    db.all(query, [customer_id], (err, bookings) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Error fetching booking history' });
        } else {
            res.json(bookings);
        }
    });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ error: 'Error logging out' });
        } else {
            res.json({ message: 'Logged out successfully' });
        }
    });
});

// Change password endpoint
app.post('/api/change-password', requireAuth, async (req, res) => {
    console.log('Change password request received');
    console.log('Session:', req.session);
    console.log('User:', req.session.user);
    
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user.id;

    console.log('User ID from session:', userId);

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user's current password
    const query = 'SELECT * FROM customer_details WHERE customer_id = ?';
    db.get(query, [userId], async (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            console.error('User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        try {
            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password in database
            const updateQuery = 'UPDATE customer_details SET password = ? WHERE customer_id = ?';
            db.run(updateQuery, [hashedPassword, userId], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Error updating password' });
                }
                console.log('Password updated successfully for user:', userId);
                res.json({ message: 'Password updated successfully' });
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });
});
