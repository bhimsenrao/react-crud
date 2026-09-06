const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================
// SQLite Database
// ============================
const db = new sqlite3.Database('./bank.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase(); // Create table AFTER connection
    }
});

// Initialize database - create table with error handling
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            balance REAL NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table initialized successfully');
        }
    });
}

// ============================
// TEST
// ============================
app.get('/test', (req, res) => {
    res.json({
        message: 'Express is reachable',
        database: 'SQLite connected'
    });
});

// ============================
// CREATE
// ============================
app.post('/accounts', (req, res) => {
    const { name, balance } = req.body;

    // Input validation
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (balance === undefined || balance === null) {
        return res.status(400).json({ error: 'Balance is required' });
    }
    if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({ error: 'Balance must be a positive number' });
    }

    db.run(
        'INSERT INTO accounts (name, balance) VALUES (?, ?)',
        [name.trim(), balance],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                name: name.trim(),
                balance: balance
            });
        }
    );
});

// ============================
// READ
// ============================
app.get('/accounts', (req, res) => {
    db.all(
        'SELECT * FROM accounts',
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        }
    );
});

// Get single account
app.get('/accounts/:id', (req, res) => {
    db.get(
        'SELECT * FROM accounts WHERE id = ?',
        [req.params.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Account not found' });
            }
            res.json(row);
        }
    );
});

// ============================
// UPDATE
// ============================
app.put('/accounts/:id', (req, res) => {
    const { name, balance } = req.body;

    // Input validation
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (balance === undefined || balance === null) {
        return res.status(400).json({ error: 'Balance is required' });
    }
    if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({ error: 'Balance must be a positive number' });
    }

    db.run(
        'UPDATE accounts SET name = ?, balance = ? WHERE id = ?',
        [name.trim(), balance, req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Account not found' });
            }
            res.json({
                updated: this.changes,
                id: req.params.id,
                name: name.trim(),
                balance: balance
            });
        }
    );
});

// ============================
// DELETE
// ============================
app.delete('/accounts/:id', (req, res) => {
    db.run(
        'DELETE FROM accounts WHERE id = ?',
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Account not found' });
            }
            res.json({
                deleted: this.changes
            });
        }
    );
});

// ============================
// START SERVER
// ============================
const server = app.listen(5000, '0.0.0.0', () => {
    console.log('Server running on port 5000');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
            process.exit(0);
        });
    });
});