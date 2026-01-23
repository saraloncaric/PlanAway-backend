import express from 'express';
import { dohvatiSvaPutovanja, dohvatiPutovanjePoId, dodajNovoPutovanje, azurirajPutovanje, obrisiPutovanje } from '../controllers/putovanjaC.js'; 
import { authMiddleware, isAgencija } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', dohvatiSvaPutovanja);
router.get('/:putovanje_id', dohvatiPutovanjePoId);
router.post('/', authMiddleware, isAgencija, dodajNovoPutovanje);
router.put('/:putovanje_id', authMiddleware, isAgencija, azurirajPutovanje);
router.delete('/:putovanje_id', authMiddleware, isAgencija, obrisiPutovanje)

export default router;