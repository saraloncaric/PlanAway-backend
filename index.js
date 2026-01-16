import express from 'express';
import { pool } from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import agencijeR from './routes/agencijeR.js';
import putovanjaR from './routes/putovanjaR.js';
import todoR from './routes/todoR.js';
import usersR from './routes/usersR.js';
import wishlistR from './routes/wishlistR.js';
import upitiR from './routes/upitiR.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use('/agencije', agencijeR);
app.use('/putovanja', putovanjaR);
app.use('/todo', todoR);
app.use('/users', usersR);
app.use('/wishlist', wishlistR);
app.use('/upiti', upitiR);

app.get('/', (req, res) => {
    res.send('API radi');
})
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
})