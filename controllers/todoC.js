import { pool } from '../db.js';

export const dohvatiListe = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const liste = await pool.query('SELECT * FROM todo_zadaci WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        res.status(200).json(liste.rows);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const dodajNoviZadatak = async(req, res) =>{
    try {
        const { user_id } = req.authUser;
        const { tekst, kategorija } = req.body;
        if(!tekst) {
            return res.status(400).json({ poruka: 'Tekst zadatka je obavezan' });
        }
        const zadatak = await pool.query(`
            INSERT INTO todo_zadaci (user_id, tekst, kategorija, zavrsen) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`, [user_id, tekst, kategorija || null, false]
        );
        res.status(200).json({ poruka: 'Uspjesno dodan zadatak', todo: zadatak.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const azurirajToDo = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { zadatak_id } = req.params;
        const { tekst, kategorija, zavrsen } = req.body;
        const provjeraToDo = await pool.query('SELECT * FROM todo_zadaci WHERE zadatak_id = $1', [zadatak_id]);
        if(provjeraToDo.rows.length == 0) {
            return res.status(400).json({ poruka: 'Zadatak nije pronađen' });
        }
        if(provjeraToDo.rows[0].user_id !== user_id) {
            return res.status(400).json({ poruka: 'Ne možete ažurirati zadatak' });
        }
        const azurirano = await pool.query(`
            UPDATE todo_zadaci
            SET tekst = COALESCE($1, tekst), 
                zavrsen = COALESCE($2, zavrsen), 
                kategorija = COALESCE($3, kategorija) 
            WHERE zadatak_id = $4
            RETURNING *`, [tekst, zavrsen, kategorija, zadatak_id]
        );
        res.status(200).json({ poruka: 'Zadatak uspješno ažurira', todo: azurirano.rows[0] });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const obrisiToDo = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const { zadatak_id } = req.params;
        const todo = await pool.query('SELECT * FROM todo_zadaci WHERE zadatak_id = $1', [zadatak_id]);
        if(todo.rows.length === 0) {
            return res.status(400).json({ poruka: 'ToDo zadatak nije pronađen'});
        }
        if(todo.rows[0].user_id !== user_id) {
            return res.status(400).json({ poruka: 'Ne mozete obrisati ovaj zadatak'});
        }
        await pool.query('DELETE FROM todo_zadaci WHERE zadatak_id = $1', [zadatak_id]);
        res.status(200).json({ poruka: 'Uspješno obrisan zadatak' });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}