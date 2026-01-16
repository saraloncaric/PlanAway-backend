import { verifikacijaJwt } from "../utils/auth.js";

export const authMiddleware = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const dekodirano = await verifikacijaJwt(token);

        if (!authHeader) {
            return res.status(400).json({ poruka: 'Neautorizirani pristup, nedostaje token' });
        }
        if(!token) {
            return res.status(400).json({ poruka: 'Neispravan format tokena'});
        }
        if(!dekodirano) {
            return res.status(400).json({ poruka: 'Token nije ispravan ili je istekao'})
        }
        req.authUser = dekodirano;
        next();
    } catch(error) {
        return res.status(401).json({ error: error.message });
    }
}
export const isAgencija = async(req, res, next) => {
    if(req.authUser.user_type !== 'agencija') {
        return res.status(403).json({ poruka: 'Pristup dozvoljen samo agencijama' });
    }
    next();
}
export const isKorisnik = async(req, res, next) => {
    if(req.authUser.user_type !== 'korisnik') {
        return res.status(403).json({ poruka: 'Pristup dozvoljen samo korisnicima' });
    }
    next();
}