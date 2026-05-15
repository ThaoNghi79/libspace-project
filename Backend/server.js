const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'libspace',
  port: 5432,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50),
        student_name VARCHAR(100),
        email VARCHAR(100),
        resource VARCHAR(100),
        resource_id VARCHAR(20), 
        booking_date DATE,
        start_time VARCHAR(20),
        end_time VARCHAR(20),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database & Table 'bookings' initialized successfully.");
  } catch (err) {
    console.error("Database Init Error:", err);
  }
};
initDB();

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'cache'}:6379`
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().then(() => console.log('Connected to Redis'));

const USERS = {
  'tc@student.tdtu.edu.vn':  { password: 'student1@tc',  name: 'Trần Minh Khang',  programType: 'standard' },
  'clc@student.tdtu.edu.vn': { password: 'student2@clc', name: 'Nguyễn Lan Anh',   programType: 'clc' },
};

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const account = USERS[email];
  if (!account || account.password !== password) {
    return res.status(401).send('Unauthorized');
  }

  const user = {
    name: account.name,
    email: email,
    programType: account.programType,
  };

  await redisClient.setEx(`session:${email}`, 3600, JSON.stringify(user));
  res.json(user);
});

app.post('/api/bookings', async (req, res) => {
  const b = req.body;
  try {
    const conflict = await pool.query(
      `SELECT id FROM bookings 
       WHERE resource_id = $1 AND booking_date = $2 
       AND status != 'Cancelled'
       AND start_time < $4 AND end_time > $3`,
      [b.resourceId, b.dateValue, b.start, b.end]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    const result = await pool.query(
      `INSERT INTO bookings (id, type, student_name, email, resource, resource_id, booking_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`,
      [b.id, b.type, b.studentName, b.email, b.resource, b.resourceId, b.dateValue, b.start, b.end, b.status]
    );
    res.status(201).json({ message: 'Booking saved to PostgreSQL successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Error inserting booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));
