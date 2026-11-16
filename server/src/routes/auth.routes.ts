import express from 'express';
import { getMe, logoutAllUser, logoutUser, refreshToken, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/register', registerUser);
router.get('/auth/get-me', getMe);
router.get('/auth/refresh-token', refreshToken);
router.get('/auth/logout', logoutUser);
router.get('/auth/logout-all', logoutAllUser);

export default router;