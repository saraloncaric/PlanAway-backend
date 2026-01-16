import { pool } from '../db.js';
import { hashLozinka, provjeraLozinke, generiranjeJwt } from '../utils/auth.js';

export const registracija = async(req, res) => {
    try {
        const { ime, prezime, email, password, user_type } = req.body;
        if (!ime || !prezime || !email || !password || !user_type) {
            return res.status(400).json({ poruka: 'Svi podaci su obvezni'});
        }
        const userPostoji = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(userPostoji.rows.length > 0) {
            return res.status(400).json({ poruka: `Korisnik sa email-om ${email} već postoji`});
        }
        const hashiranaLozinka = await hashLozinka(password, 10);
        if(!hashiranaLozinka) {
            return res.status(400).json({ poruka: 'Greška pri hashiranju lozinke'});
        }
        const n_korisnik = await pool.query(`
            INSERT INTO users (ime, prezime, email, password, user_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, ime, prezime, email, user_type, created_at`,
            [ime, prezime, email, hashiranaLozinka, user_type || 'korisnik']
        );
        const noviUser = n_korisnik.rows[0];
        const token = await generiranjeJwt({
            user_id: noviUser.user_id,
            email: noviUser.email,
            user_type: noviUser.user_type
        })
        res.status(200).json({ poruka: 'Korisnik uspješno registriran', user: noviUser, jwt_token: token});
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ poruka: 'Email i lozinka su obavezni'});
        }
        const korisnik = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(korisnik.rows.length == 0) {
            return res.status(400).json({ poruka: 'Greška prilikom prijave'});
        }
        const user = korisnik.rows[0];
        const lozinkavalja = await provjeraLozinke(password, user.password);
        if(!lozinkavalja) {
            return res.status(400).json({ poruka: 'Greška prilikom prijave'});
        }
        const token = await generiranjeJwt({
            user_id: user.user_id,
            email: user.email,
            user_type: user.user_type
        })
        const { password: _, ...userWithoutPasswor } = user;
        res.status(200).json({ poruka: 'Uspješna prijava', user: userWithoutPasswor, jwt_token: token });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const googlelogin = async(req, res) => {
    try {
        const { ime, prezime, email, google_id } = req.body;
        let postoji = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;
        if(postoji.rows.length == 0) {
            postoji = await pool.query(`
                INSERT INTO users (ime, prezime, email, google_id, user_type)
                VAUES ($1, $2, $3, $4, $5)
                RETURNING ime, prezime, email, google_id, user_id, user_type`,
                [ime, prezime, email, google_id, 'korisnik']
            );
            user = postoji.rows[0];
        }
        else {
            user = postoji.rows[0];
            if(!user.google_id) {
                await pool.query('UPDATE users SET google_id = $1 WHERE user_id = $2', [google_id, user.user_id]);
                user.google_id = google_id;
            }
        }
        const token = await generiranjeJwt({
            user_id: user.user_id,
            email: user.email,
            user_type: user.user_type
        })
        res.status(200).json({ poruka: 'Uspješna prijava putem Googla', user, jwt_token: token });
    } catch(error) { 
        res.status(500).json({ error: error.message });
    }
}
export const sviKorisnici = async(req, res) => {
    try {
        const korisnici = await pool.query('SELECT user_id, ime, prezime, email, user_type, created_at FROM users');
        res.status(200).json(korisnici);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const korisnikPoID = async(req, res) => {
    try {
        const { id } = req.params;
        const korinikPostoji = await pool.query(`
            SELECT user_id, ime, prezime, email, user_type, created_at 
            FROM users 
            WHERE user_id = $1`, [id]
        );
        if (korinikPostoji.rows.length == 0) {
            return res.status(400).json({ poruka: 'Korisnik nije pronađen'});
        }
        res.status(200).json(korinikPostoji.rows[0]);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
export const prijavljenKorisnik = async(req, res) => {
    try {
        const { user_id } = req.authUser;
        const postoji = await pool.query(`
            SELECT user_id, ime, prezime, email, user_type, created_at
            FROM users 
            WHERE user_id = $1`, [user_id]
        );
        if(postoji.rows.length == 0) {
            return res.status(404).json({ poruka: 'Korisnik nije pronađen'});
        }
        res.status(200).json(postoji.rows[0]);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}