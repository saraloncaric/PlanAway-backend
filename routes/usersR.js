import express from 'express';
import { registracija, login, googlelogin, sviKorisnici, korisnikPoID, prijavljenKorisnik } from '../controllers/usersC.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validationRegistracija, validationLogin } from '../middleware/validators.js';

const router = express.Router();
router.post('/registracija', validationRegistracija, registracija); 
router.post('/login', validationLogin, login);   
router.post('/googlelogin', googlelogin);
router.get('/ime', authMiddleware, prijavljenKorisnik);
router.get('/', authMiddleware, sviKorisnici);
router.get('/:id', authMiddleware, korisnikPoID);

export default router;