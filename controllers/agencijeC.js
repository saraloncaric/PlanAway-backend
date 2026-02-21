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
        const { agencija_id } = req.params;
        const id_agencija = await pool.query('SELECT * FROM agencije WHERE agencija_id = $1', [agencija_id]);
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
        const { agencija_id } = req.params;
        const putovanjeAgencija = await pool.query('SELECT * FROM putovanja WHERE agencija_id = $1 ORDER BY start_date ASC', [agencija_id]);
        res.json(putovanjeAgencija.rows);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
}
export const dohvatiUpitePoAgenciji = async(req, res) => {
    try {
        const { agencija_id } = req.params;
        const upiti = await pool.query(`
            SELECT upiti_putovanja.*, users.ime, users.prezime, users.email, putovanja.naslov
            FROM upiti_putovanja
            JOIN users ON upiti_putovanja.user_id = users.user_id
            JOIN putovanja ON upiti_putovanja.putovanje_id = putovanja.putovanje_id
            WHERE upiti_putovanja.agencija_id = $1
            ORDER BY upiti_putovanja.created_at DESC
            `, [agencija_id]);
            res.json(upiti.rows);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
}
export const azurirajAgenciju = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { naziv_agencije, opis, kontakt_broj, kontakt_email } = req.body;
        const agencija = await pool.query('SELECT * FROM agencije WHERE user_id = $1', [user_id]);
        if(agencija.rows.length === 0) {
            return res.status(404).json({ poruka: 'Agencija nije pronađena' });
        }
        const azurirana = await pool.query(`
            UPDATE agencije
            SET naziv_agencije = COALESCE($1, naziv_agencije),
                opis = COALESCE($2, opis),
                kontakt_broj = COALESCE($3, kontakt_broj),
                kontakt_email = COALESCE($4, kontakt_email)
            WHERE user_id = $5
            RETURNING *`,
            [naziv_agencije, opis, kontakt_broj, kontakt_email, user_id]
        );
        res.json({ poruka: 'Agencija ažurirana', agencija: azurirana.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}