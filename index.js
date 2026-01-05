import express from 'express';
import pool from './db.js';

const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API radi');
})
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
})