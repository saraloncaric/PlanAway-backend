import express from 'express';
import { authMiddleware, isAgencija } from '../middleware/authMiddleware.js';
import { 
    dohvatiSveAgencije, dohvatiPoId, dohvatiPuovanjePoAgenciji, dohvatiUpitePoAgenciji, azurirajAgenciju 
} from '../controllers/agencijeC.js';

const router = express.Router();

router.get('/', dohvatiSveAgencije);
router.get('/:agencija_id', dohvatiPoId);
router.get('/:agencija_id/putovanja', dohvatiPuovanjePoAgenciji);
router.get('/:agencija_id/upiti', dohvatiUpitePoAgenciji);
router.put('/:agencija_id', authMiddleware, isAgencija, azurirajAgenciju);

export default router;