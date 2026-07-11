import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import screenRoutes from './screen.routes.js';
import * as screenServices from '../services/screen.services.js';
import * as tokenServices from '../services/token.services.js';
import * as authServices from '../services/auth.services.js';

vi.mock('../services/screen.services.js', () => ({
    findAllScreens: vi.fn((req, res) => res.status(200).json({ msg: 'findAllScreens' })),
    findOneScreen: vi.fn((req, res) => res.status(200).json({ msg: 'findOneScreen' })),
    createScreen: vi.fn((req, res) => res.status(201).json({ msg: 'createScreen' })),
    deleteScreen: vi.fn((req, res) => res.status(200).json({ msg: 'deleteScreen' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

vi.mock('../services/auth.services.js', () => ({
    authorize: vi.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api', screenRoutes);

describe('Screen Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/screens should call findAllScreens', async () => {
        const res = await request(app).get('/api/screens');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findAllScreens' });
        expect(screenServices.findAllScreens).toHaveBeenCalled();
    });

    it('GET /api/screens/:id should call findOneScreen', async () => {
        const res = await request(app).get('/api/screens/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findOneScreen' });
        expect(screenServices.findOneScreen).toHaveBeenCalled();
    });

    it('POST /api/screens should call verifyToken, authorize, and createScreen', async () => {
        const res = await request(app).post('/api/screens').send({});
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'createScreen' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(screenServices.createScreen).toHaveBeenCalled();
    });

    it('DELETE /api/screens/:id should call verifyToken, authorize, and deleteScreen', async () => {
        const res = await request(app).delete('/api/screens/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'deleteScreen' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(screenServices.deleteScreen).toHaveBeenCalled();
    });
});
