import { pool } from '../db.js';

export const dohvatiSvaPutovanja = async(req, res) => {
    try {
        
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}