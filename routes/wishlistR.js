import express from 'express';
import { prijavljen, dodajPutovanje, obrisiPutovanje } from '../controllers/wishlistC.js';
import { authMiddleware, isKorisnik } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/korisnik', authMiddleware, isKorisnik, prijavljen);
router.post('/', authMiddleware, isKorisnik, dodajPutovanje);
router.delete('/:wishlist_id', authMiddleware, isKorisnik, obrisiPutovanje);

export default router;