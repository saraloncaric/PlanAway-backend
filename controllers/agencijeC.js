import { pool } from '../db.js';

export const dohvatiSveAgencije = async(req, res) => {
    try{
        const agencije = await pool.query(
            'SELECT agencija_id, user_id, naziv_agencije, opis, kontakt_broj, kontakt_email, datum_osnivanja FROM agencije')
        res.json(agencije.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiPoId = async(req, res) => {
    try {
        const { id } = req.params;
        const id_agencija = await pool.query('SELECT * FROM agencije WHERE agencija_id = $1', [id]);
        if(id_agencija.rows.length === 0) {
            return res.status(400).json({ poruka: 'Agencija nije pronađena'});
        }
        res.json(id_agencija.rows[0]);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiPuovanjePoAgenciji = async(req, res) => {
    try {
        const { id } = req.params;
        const putovanjeAgencija = await pool.query('SELECT * FROM putovanja WHERE agencija_id = $1 ORDER BY start_date ASC', [id]);
        res.json(putovanjeAgencija.rows);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
}
export const dohvatiUpitePoAgenciji = async(req, res) => {
    try {
        const { id } = req.params;
        const upiti = await pool.query(`
            SELECT upiti_putovanja.*, users.ime, users.prezime, users.email, putovanja.naslov
            FROM upiti_putovanja
            JOIN users ON upiti_putovanja.user_id = users.user_id
            JOIN putovanja ON upiti_putovanja.putovanje_id = putovanja.putovanje_id
            WHERE upiti_putovanja.agencija_id = $1
            ORDER BY upiti_putovanja.created_at DESC
            `, [id]);
            res.json(upiti.rows);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
}