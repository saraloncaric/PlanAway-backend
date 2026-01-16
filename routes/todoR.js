import express from 'express';
import { dohvatiListe, dodajNoviZadatak, azurirajToDo, obrisiToDo } from '../controllers/todoC.js';
import { authMiddleware, isKorisnik } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/liste', authMiddleware, dohvatiListe, isKorisnik);
router.post('/', dodajNoviZadatak);
router.put('/:zadatak_id', authMiddleware, azurirajToDo, isKorisnik);
router.delete('/:zadatak_id', authMiddleware, obrisiToDo, isKorisnik);

export default router;