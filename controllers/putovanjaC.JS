import { param } from 'express-validator';
import { pool } from '../db.js';

export const dohvatiSvaPutovanja = async(req, res) => {
    try {
        const { destinacija, drzava } = req.query;
        let query = 'SELECT * FROM putovanja WHERE 1=1';
        let params = [];
        let brojac = 1;
        if(destinacija) {
            query += ` AND LOWER(destinacija) LIKE LOWER($${brojac})`;
            params.push(`%${destinacija}%`);
            brojac++;
        }
        if(drzava) {
            query += ` AND LOWER(drzava) LIKE LOWER($${brojac})`;
            params.push(`%${drzava}%`);
            brojac++;
        }
        const putovanja = await pool.query(query, params);
        res.json(putovanja.rows);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiPutovanjePoId = async(req, res) => {
    try {
        const { putovanje_id } = req.params;
        const putovanje = await pool.query('SELECT * FROM putovanja WHERE putovanje_id = $1', [putovanje_id]);
        if(putovanje.rows.length === 0) {
            return res.status(400).json({ poruka: 'Putovanje nije pronađeno' });
        }
        res.status(200).json(putovanje.rows[0]);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const dodajNovoPutovanje = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { 
            agencija_id, naslov, opis, detaljni_opis, destinacija , drzava, cijena, broj_dana, broj_noci, broj_ljudi,
            start_date, end_date, plan_putovanja, image, ostale_slike, ukljuceno, nije_ukljuceno, vazne_informacije 
        } = req.body;
        const pripadaAgneciji = await pool.query('SELECT * FROM agencije WHERE agencija_id = $1 AND user_id = $2',
            [agencija_id, user_id]
        );
        if (pripadaAgneciji.rows.length === 0) {
            return res.status(404).json({ poruka: 'Nemate dozvolu za dodavanje putovanja' });
        }
        if (!naslov || !destinacija || !cijena || !broj_dana || !start_date) {
            return res.status(400).json({ poruka: 'Naslov, destinacija, cijena, broj dana i datum početka su obavezni' });
        }
        const novo_putovanje = await pool.query(`
            INSERT INTO putovanja (agencija_id, naslov, opis, detaljni_opis, destinacija , drzava, cijena, broj_dana, broj_noci, broj_ljudi,
            start_date, end_date, plan_putovanja, image, ostale_slike, ukljuceno, nije_ukljuceno, vazne_informacije)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *`,
            [agencija_id, naslov, opis, detaljni_opis, destinacija , drzava, cijena, broj_dana, broj_noci, broj_ljudi,
            start_date, end_date, plan_putovanja, image, ostale_slike, ukljuceno, nije_ukljuceno, vazne_informacije]
        );
        res.status(200).json({ poruka: 'Putovanje uspješno dodano', putovanje: novo_putovanje.rows[0]});
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const azurirajPutovanje = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { putovanje_id } = req.params;
        const { 
            naslov, opis, detaljni_opis, destinacija , drzava, cijena, broj_dana, broj_noci, broj_ljudi,
            start_date, end_date, plan_putovanja, image, ostale_slike, ukljuceno, nije_ukljuceno, vazne_informacije 
        } = req.body;
        const putovanjePostoji = await pool.query('SELECT * FROM putovanja WHERE putovanje_id = $1', [putovanje_id]);
        if(putovanjePostoji.rows.length === 0) {
            return res.status(404).json({ poruka: 'Putovanje nije pronađeno' });
        }
        const putovanje = putovanjePostoji.rows[0];
        const pripadaAgneciji = await pool.query('SELECT * FROM agencije WHERE agencija_id = $1 AND user_id = $2',
            [putovanje.agencija_id, user_id]
        );
        if (pripadaAgneciji.rows.length === 0) {
            return res.status(404).json({ poruka: 'Ne možete uređivati putovanje' });
        }
        const azuriranoPutovanje = await pool.query(`
            UPDATE putovanja
            SET 
                naslov = COALESCE($1, naslov),
                opis = COALESCE($2, opis),
                detaljni_opis = COALESCE($3, detaljni_opis),
                destinacija = COALESCE($4, destinacija),
                drzava = COALESCE($5, drzava),
                cijena = COALESCE($6, cijena),
                broj_dana = COALESCE($7, broj_dana),
                broj_noci = COALESCE($8, broj_noci),
                broj_ljudi = COALESCE($9, broj_ljudi),
                start_date = COALESCE($10, start_date),
                end_date = COALESCE($11, end_date),
                plan_putovanja = COALESCE($12, plan_putovanja),
                image = COALESCE($13, image),
                ostale_slike = COALESCE($14, ostale_slike),
                ukljuceno = COALESCE($15, ukljuceno),
                nije_ukljuceno = COALESCE($16, nije_ukljuceno),
                vazne_informacije = COALESCE($17, vazne_informacije),
                updated_at = CURRENT_TIMESTAMP
            WHERE putovanje_id = $18
            RETURNING *`, [naslov, opis, detaljni_opis, destinacija , drzava, cijena, broj_dana, broj_noci, broj_ljudi,
            start_date, end_date, plan_putovanja, image, ostale_slike, ukljuceno, nije_ukljuceno, vazne_informacije, putovanje_id]
        );
        res.status(200).json({ poruka: 'Putovanje ažurirano', putovanje: azuriranoPutovanje.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const obrisiPutovanje = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { putovanje_id } = req.params;
        const putovanjePostoji = await pool.query('SELECT * FROM putovanja WHERE putovanje_id = $1', [putovanje_id]);
        if(putovanjePostoji.rows.length === 0) {
            return res.status(404).json({ poruka: 'Putovanje nije pronađeno' });
        }
        const putovanje = putovanjePostoji.rows[0];
        const pripadaAgneciji = await pool.query('SELECT * FROM agencije WHERE agencija_id = $1 AND user_id = $2',
            [putovanje.agencija_id, user_id]
        );
        if (pripadaAgneciji.rows.length === 0) {
            return res.status(404).json({ poruka: 'Ne možete obrisati putovanje' });
        }
        await pool.query('DELETE FROM putovanja WHERE putovanje_id = $1', [putovanje_id]);
        await pool.query('DELETE FROM wishlist WHERE putovanje_id = $1', [putovanje_id]);
        await pool.query('DELETE FROM upiti_putovanja WHERE putovanje_id = $1', [putovanje_id]);
        res.status(200).json({ poruka: 'Uspješno obrisano putovanje'})
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}