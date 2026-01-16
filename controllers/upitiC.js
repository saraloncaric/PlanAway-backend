import { pool } from '../db.js';

export const posaljiUpit = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { putovanje_id, broj_ljudi } = req.body;
        const upit = await pool.query('SELECT agencija_id FROM putovanja WHERE putovanje_id = $1', [putovanje_id]);
        if (upit.rows.length == 0) {
            return res.status(404).json({ poruka: 'Putovanje nije pronađeno'});
        }
        const agencija_id = upit.rows[0].agencija_id;
        const poslaniUpit = await pool.query(`
            INSERT INTO upiti_putovanja (user_id, putovanje_id, agencija_id, broj_ljudi, status) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`, [user_id, agencija_id, putovanje_id, broj_ljudi, 'pending']
        );
        res.status(200).json({ poruka: 'Uspješno poslan upit za putovanje', upit: poslaniUpit.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const azurirajStatusUpita = async(req, res) => {
    try {
        const { upit_id } = req.params;
        const { user_id } = req.authUser;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ poruka: 'Status je obavezan'});
        }
        const upitPostoji = await pool.query('SELECT * FROM upiti_putovanja WHERE upit_id = $1', [upit_id]);
        if(upitPostoji.rows.length == 0) {
            return res.status(404).json({ pourka: 'Upit za putovanje ne postoji' });
        }
        const poslanUpit = await pool.query('UPDATE upiti_putovanja SET status = $1 WHERE upit_id = $2 RETURNING *', [status, upit_id]);
        res.status(200).json({ poruka: 'Upit ažuriran', upiti: poslanUpit.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}