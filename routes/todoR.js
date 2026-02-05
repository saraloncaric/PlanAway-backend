import express from 'express';
import { dohvatiListe, dodajNoviZadatak, azurirajToDo, obrisiToDo } from '../controllers/todoC.js';
import { authMiddleware, isKorisnik } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/liste', authMiddleware, isKorisnik, dohvatiListe);
router.post('/', authMiddleware, isKorisnik, dodajNoviZadatak);
router.put('/:zadatak_id', authMiddleware, isKorisnik, azurirajToDo);
router.delete('/:zadatak_id', authMiddleware, isKorisnik, obrisiToDo);

export default router;