import expres from 'express';
import { registracija, login, googlelogin, sviKorisnici, korisnikPoID, prijavljenKorisnik } from '../controllers/usersC.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = expres.Router();
router.post('/registracija', registracija);
router.post('/login', login);
router.post('/googlelogin', googlelogin);
router.get('/ime', authMiddleware, prijavljenKorisnik);
router.get('/', authMiddleware, sviKorisnici);
router.get('/:id', authMiddleware, korisnikPoID);

export default router;