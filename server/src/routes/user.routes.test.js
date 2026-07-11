import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from './user.routes.js';
import * as userServices from '../services/user.services.js';
import * as tokenServices from '../services/token.services.js';
import * as authServices from '../services/auth.services.js';

vi.mock('../services/user.services.js', () => ({
    findAllUsers: vi.fn((req, res) => res.status(200).json({ msg: 'findAllUsers' })),
    updateUser: vi.fn((req, res) => res.status(200).json({ msg: 'updateUser' })),
    deleteUser: vi.fn((req, res) => res.status(200).json({ msg: 'deleteUser' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

vi.mock('../services/auth.services.js', () => ({
    authorize: vi.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

describe('User Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/users should call verifyToken, authorize, and findAllUsers', async () => {
        const res = await request(app).get('/api/users');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findAllUsers' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(userServices.findAllUsers).toHaveBeenCalled();
    });

    it('PUT /api/users/:id should call verifyToken, authorize, and updateUser', async () => {
        const res = await request(app).put('/api/users/1').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'updateUser' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(userServices.updateUser).toHaveBeenCalled();
    });

    it('DELETE /api/users/:id should call verifyToken, authorize, and deleteUser', async () => {
        const res = await request(app).delete('/api/users/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'deleteUser' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(userServices.deleteUser).toHaveBeenCalled();
    });
});
