import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Session from '../models/session.model.js';
import User from '../models/user.model.js';

interface CustomJwtPayload {
    id: string;
}

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: 'User already exist!'
            });
        }

        const hashPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');

        const user = await User.create({
            name,
            email,
            password: hashPassword
        });

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '7d' }
        );

        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await Session.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        const accessToken = jwt.sign(
            { id: user._id, sessionId: session._id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '15m' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'User register successfully',
            user: {
                name,
                email
            },
            accessToken
        });
    }
    catch (error) {
        console.error('Registration failed with:', error);

        return res.status(500).json({
            message: 'Server error happend'
        });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');

        const isPasswordValid = hashedPassword === user.password;
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '7d' }
        );

        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await Session.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        const accessToken = jwt.sign(
            { id: user._id, sessionId: session._id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '15m' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: 'Logged in successful',
            user: {
                name: user.name,
                email: user.email
            },
            accessToken
        });
    }
    catch (error) {
        console.error('Logging in failed with:', error);

        return res.status(500).json({
            message: 'Server error happend'
        });
    }
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Token not found'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(token, secret) as CustomJwtPayload;
        if (!decoded.id) {
            return res.status(401).json({
                message: 'Invalid session'
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User fetched successfully',
            user: {
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('User fetched failed with:', error);

        return res.status(500).json({
            message: 'Server error happend'
        });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: 'Token not found!'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(refreshToken, secret) as CustomJwtPayload;
        if (!decoded.id) {
            return res.status(401).json({
                message: 'Invalid session'
            });
        }

        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await Session.findOne({
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                message: 'Invalid refresh token'
            });
        }

        const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '15m' }
        );

        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET || 'fallback secret',
            { expiresIn: '7d' }
        );

        const newRefreshTokenHash = crypto
            .createHash('sha256')
            .update(newRefreshToken)
            .digest('hex');

        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 1000 // 7d
        });

        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken
        });
    }
    catch (error) {
        console.error('Token refresh failed with:', error);

        res.status(500).json({
            message: 'Server error happend'
        });
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({
                message: 'Refresh token not found'
            });
        }

        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await Session.findOne({
            refreshTokenHash,
            revoked: false
        });
        console.log(session, 'session');

        if (!session) {
            return res.status(400).json({
                message: 'Invalid refresh token'
            });
        }

        session.revoked = true;
        await session.save();

        res.status(200).json({
            message: 'Logged out Successfull'
        });
    }
    catch (error) {
        console.error('Logged out failed with:', error);

        return res.status(500).json({
            message: 'Server error happend'
        });
    }
}

export const logoutAllUser = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({
                message: 'Refresh token not found'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(refreshToken, secret) as CustomJwtPayload;
        if (!decoded.id) {
            return res.status(401).json({
                message: 'Invalid session'
            });
        }

        await Session.updateMany(
            { user: decoded.id, revoked: false },
            { revoked: true }
        );

        res.clearCookie('refreshToken');

        res.status(200).json({
            message: 'Logged out from all devices successfully'
        });
    }
    catch (error) {
        console.error('Logging out from all devices failed with:', error);

        return res.status(500).json({
            message: 'Server error happend'
        });
    }
}