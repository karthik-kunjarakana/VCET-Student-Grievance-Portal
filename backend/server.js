const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://fabled-etching-459609-q7.uc.r.appspot.com',
  'https://your-frontend-domain.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Submit grievance endpoint
app.post('/submit-grievance', async (req, res) => {
  try {
    const { name, usn, complaint, severity } = req.body;
    
    if (!name || !usn || !complaint || !severity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO grievances (name, usn, complaint, severity) VALUES (?, ?, ?, ?)',
      [name, usn, complaint, severity]
    );
    await connection.end();
    
    res.json({ 
      status: 'success',
      message: 'Grievance submitted successfully!',
      grievanceId: result.insertId
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to submit grievance',
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});