import { pool } from '../db.js';

export const prijavljen = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const postoji = await pool.query(`
            SELECT w.*, p.naslov, p.destinacija, p.drzava, p.cijena, p.image, p.broj_dana, p.broj_noci, p.start_date
            FROM wishlist w
            JOIN putovanja p ON w.putovanje_id = p.putovanje_id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC`, [user_id]
        );
        res.status(200).json(postoji.rows);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const dodajPutovanje = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { putovanje_id } = req.body;

        const putovanjePostoji = await pool.query('SELECT * FROM putovanja WHERE putovanje_id = $1', [putovanje_id]);
        if(putovanjePostoji.rows.length == 0) {
            return res.status(400).json({ poruka: 'Putovanje ne postoji'});
        }
        const vecJeDodano = await pool.query(`
            SELECT * FROM wishlist WHERE user_id = $1 AND putovanje_id = $2`, [user_id, putovanje_id]
        );
        if(vecJeDodano.rows.length > 0) {
            return res.status(400).json({ poruka: 'Putovanje je već dodano na wishlistu'});
        }
        const dodanoPutovanje = await pool.query(`
            INSERT INTO wishlist (user_id, putovanje_id) 
            VALUES ($1, $2)
            RETURNING *`, [user_id, putovanje_id]
        );
        res.status(200).json({ poruka: 'Uspješno dodano u wishlistu', wishlist: dodanoPutovanje.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const obrisiPutovanje = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { wishlist_id } = req.params;
        
        const wishlistPutovanje = await pool.query(`SELECT * FROM wishlist WHERE wishlist_id = $1`, [wishlist_id]);
        if(wishlistPutovanje.rows.length == 0) {
            return res.status(400).json({ poruka: 'Putovanje nije pronađeno' });
        }
        if(wishlistPutovanje.rows[0].user_id !== user_id) {
            return res.status(400).json({ poruka: 'Ne možete obrisati stavku' });
        }
        await pool.query('DELETE FROM wishlist WHERE wishlist_id = $1', [wishlist_id]);
        res.status(200).json({ poruka: 'Uspješno obrisnao sa wishliste' });
    } catch(error) { 
        res.status(500).json({ error: error.message });
    }
}