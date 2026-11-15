import express from 'express';
import { getMe, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/register', registerUser);
router.get('/auth/get-me', getMe)

export default router;