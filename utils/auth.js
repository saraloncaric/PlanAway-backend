import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export async function hashLozinka(password, krug=10) {
    try{
        const hash = await bcrypt.hash(password, krug);
        return hash;
    } catch(error) {
        console.error(`Došlo je do greške prilikom hashiranja lozinke: ${error}`);
        return null;
    }
}
export async function provjeraLozinke(password, hashPassword) {
    try{
        const provjera = await bcrypt.compare(password, hashPassword);
        return provjera;
    } catch(error) {
        console.error(`Došlo je do greške prilikom usporedbe hash vrijednosti: ${error}`);
        return false;
    }
}
export async function generiranjeJwt(podaci) {
    try{
        const token = jwt.sign(podaci, JWT_SECRET, { expiresIn: '24h' });
        return token;
    } catch(error) {
        console.error(`Došlo je do greške prilikom generiranja JWT tokena: ${error}`)
        return null;
    }
}
export async function verifikacijaJwt(token) {
    try {
        const verifikacija = jwt.verify(token, JWT_SECRET);
        return verifikacija;
    } catch(error) {
        console.error(`Došlo je do greške prilikom verifikacije JWT tokena: ${error}`);
        return null;
    }
}