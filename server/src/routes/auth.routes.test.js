import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from './auth.routes.js';
import * as userServices from '../services/user.services.js';
import * as adminServices from '../services/admin.services.js';
import * as sysadminServices from '../services/sysadmin.services.js';
import * as tokenServices from '../services/token.services.js';
import * as authServices from '../services/auth.services.js';

// Mock the services
vi.mock('../services/user.services.js', () => ({
    loginUser: vi.fn((req, res) => res.status(200).json({ msg: 'loginUser called' })),
    getUser: vi.fn((req, res) => res.status(200).json({ msg: 'getUser called' })),
    registerUser: vi.fn((req, res) => res.status(201).json({ msg: 'registerUser called' })),
    forgotPassword: vi.fn((req, res) => res.status(200).json({ msg: 'forgotPassword called' })),
    resetPassword: vi.fn((req, res) => res.status(200).json({ msg: 'resetPassword called' })),
    changePassword: vi.fn((req, res) => res.status(200).json({ msg: 'changePassword called' }))
}));

vi.mock('../services/admin.services.js', () => ({
    registerAdmin: vi.fn((req, res) => res.status(201).json({ msg: 'registerAdmin called' }))
}));

vi.mock('../services/sysadmin.services.js', () => ({
    registerSysAdmin: vi.fn((req, res) => res.status(201).json({ msg: 'registerSysAdmin called' }))
}));

// Mock middlewares to just pass through
vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

vi.mock('../services/auth.services.js', () => ({
    authorize: vi.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('POST /api/auth/login should call loginUser', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'loginUser called' });
        expect(userServices.loginUser).toHaveBeenCalled();
    });

    it('GET /api/auth/profile/:id should call verifyToken and getUser', async () => {
        const res = await request(app).get('/api/auth/profile/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'getUser called' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(userServices.getUser).toHaveBeenCalled();
    });

    it('POST /api/auth/register should call registerUser', async () => {
        const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'registerUser called' });
        expect(userServices.registerUser).toHaveBeenCalled();
    });

    it('POST /api/auth/register-admin should call verifyToken, authorize, and registerAdmin', async () => {
        const res = await request(app).post('/api/auth/register-admin').send({ email: 'admin@test.com' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'registerAdmin called' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(adminServices.registerAdmin).toHaveBeenCalled();
    });

    it('POST /api/auth/register-sysadmin should call verifyToken, authorize, and registerSysAdmin', async () => {
        const res = await request(app).post('/api/auth/register-sysadmin').send({ email: 'sys@test.com' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'registerSysAdmin called' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(sysadminServices.registerSysAdmin).toHaveBeenCalled();
    });

    it('POST /api/auth/change-password should call verifyToken and changePassword', async () => {
        const res = await request(app).post('/api/auth/change-password').send({ currentPassword: 'old', newPassword: 'new' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'changePassword called' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(userServices.changePassword).toHaveBeenCalled();
    });
});
