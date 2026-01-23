import express from 'express';
import { posaljiUpit, azurirajStatusUpita, obrisiUpit, dohvatiUpiteKorisnika } from '../controllers/upitiC.js';
import { authMiddleware, isKorisnik, isAgencija } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', authMiddleware, isKorisnik, posaljiUpit);
router.put('/:upit_id', authMiddleware, isAgencija, azurirajStatusUpita);
router.delete('/:upit_id', authMiddleware, obrisiUpit);
router.get('/moji-upiti', authMiddleware, isKorisnik, dohvatiUpiteKorisnika);

export default router;