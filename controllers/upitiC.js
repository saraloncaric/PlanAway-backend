import { pool } from '../db.js';

export const posaljiUpit = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { putovanje_id, broj_ljudi } = req.body;
        if (!putovanje_id || !broj_ljudi) {
            return res.status(400).json({ poruka: 'Putovanje ID i broj ljudi su obavezni' });
        }
        const upit = await pool.query('SELECT agencija_id FROM putovanja WHERE putovanje_id = $1', [putovanje_id]);
        if (upit.rows.length == 0) {
            return res.status(404).json({ poruka: 'Putovanje nije pronađeno'});
        }
        const agencija_id = upit.rows[0].agencija_id;
        const upitPostoji = await pool.query('SELECT * FROM upiti_putovanja WHERE user_id = $1 AND putovanje_id = $2', 
            [user_id, putovanje_id]);
        if(upitPostoji.rows.length > 0) {
            return res.status(404).json({ poruka: 'Upit je već poslan' });
        }
        const poslaniUpit = await pool.query(`
            INSERT INTO upiti_putovanja (user_id, putovanje_id, agencija_id, broj_ljudi, status) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`, [user_id, putovanje_id, agencija_id, broj_ljudi, 'novi']
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
        const statusi = ['novi','pregledan','odgovoren','odbijen','prihvaćen'];
        if (!status || !statusi.includes(status)) {
            return res.status(400).json({ poruka: 'Status je obavezan, može biti: na čekanju, prihvaćen ili odbijen'});
        }
        const upitPostoji = await pool.query('SELECT * FROM upiti_putovanja WHERE upit_id = $1', [upit_id]);
        if(upitPostoji.rows.length == 0) {
            return res.status(404).json({ poruka: 'Upit za putovanje ne postoji' });
        }
        const upit = upitPostoji.rows[0];
        const pripadaAgneciji = await pool.query('SELECT * FROM agencije WHERE agencija_id = $1 AND user_id = $2',
            [upit.agencija_id, user_id]
        );
        if (pripadaAgneciji.rows.length === 0) {
            return res.status(404).json({ poruka: 'Ne možete promjeniti status putovanja' });
        }
        const poslanUpit = await pool.query('UPDATE upiti_putovanja SET status = $1 WHERE upit_id = $2 RETURNING *', [status, upit_id]);
        res.status(200).json({ poruka: 'Upit ažuriran', upiti: poslanUpit.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const obrisiUpit = async(req, res) => {
    try {
        const { upit_id } = req.params;
        const { user_id, user_type } = req.authUser;
        const upit = await pool.query('SELECT * FROM upiti_putovanja WHERE upit_id = $1', [upit_id]);
        if(upit.rows.length === 0) {
            return res.status(400).json({ poruka: 'Upit nije pronađen'})
        }
        const podaci = upit.rows[0];
        if (user_type === 'korisnik' && podaci.user_id !== user_id) {
            return res.status(404).json({ poruka: 'Ne možete obrisati ovaj upit' });
        }
        if (user_type === 'agencija') {
            const pripadaAgneciji = await pool.query('SELECT * FROM agencije WHERE agencija_id = $1 AND user_id = $2',
                [podaci.agencija_id, user_id]
            );
            if(pripadaAgneciji.rows.length === 0) {
                return res.status(404).json({ poruka: 'Ne možete obrisati ovaj upit' });
            }
        }
        await pool.query('DELETE FROM upiti_putovanja WHERE upit_id = $1', [upit_id]);
        res.status(200).json({ poruka: 'Uspješno obrisan upit' });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiUpiteKorisnika = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const upiti = await pool.query(`
            SELECT upiti_putovanja.*, putovanja.naslov, putovanja.destinacija, putovanja.cijena,
            putovanja.start_date, agencije.naziv_agencije, agencije.kontakt_email
            FROM upiti_putovanja
            JOIN putovanja ON upiti_putovanja.putovanja_id = putovanja.putovanje_id
            JOIN agencije ON upiti_putovanja.agencija_id = agencije.agencija_id
            WHERE upiti_putovanja.user_id = $1
            ORDER BY upiti_putovanja.created_at DESC`, [user_id]
        );
        res.status(200).json(upiti.rows);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiUpiteAgencije = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const agencija = await pool.query('SELECT agencija_id FROM agencije WHERE user_id = $1', [user_id]);
        if (agencija.rows.length === 0) {
            return res.status(404).json({ poruka: 'Agencija nije pronađena' });
        }
        const agencija_id = agencija.rows[0].agencija_id;
        const upiti = await pool.query(`
            SELECT 
                up.upit_id,
                up.broj_ljudi,
                up.status,
                up.created_at,
                p.naslov,
                p.destinacija,
                p.start_date,
                u.email AS kontakt_email,
                u.ime,
                u.prezime
            FROM upiti_putovanja up
            JOIN putovanja p ON up.putovanje_id = p.putovanje_id
            JOIN users u ON up.user_id = u.user_id
            WHERE up.agencija_id = $1
            ORDER BY up.created_at DESC`, 
            [agencija_id]
        );
        res.status(200).json(upiti.rows);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}