import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import movieshowingRoutes from './movieshowing.routes.js';
import * as movieshowingServices from '../services/movieshowing.services.js';
import * as tokenServices from '../services/token.services.js';
import * as authServices from '../services/auth.services.js';

vi.mock('../services/movieshowing.services.js', () => ({
    findAllMovieShowings: vi.fn((req, res) => res.status(200).json({ msg: 'findAllMovieShowings' })),
    findOneMovieShowings: vi.fn((req, res) => res.status(200).json({ msg: 'findOneMovieShowings' })),
    createMovieShowings: vi.fn((req, res) => res.status(201).json({ msg: 'createMovieShowings' })),
    updateMovieShowings: vi.fn((req, res) => res.status(200).json({ msg: 'updateMovieShowings' })),
    deleteMovieShowings: vi.fn((req, res) => res.status(200).json({ msg: 'deleteMovieShowings' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

vi.mock('../services/auth.services.js', () => ({
    authorize: vi.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api', movieshowingRoutes);

describe('MovieShowing Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/movieshowings should call findAllMovieShowings', async () => {
        const res = await request(app).get('/api/movieshowings');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findAllMovieShowings' });
        expect(movieshowingServices.findAllMovieShowings).toHaveBeenCalled();
    });

    it('GET /api/movieshowings/:id should call findOneMovieShowings', async () => {
        const res = await request(app).get('/api/movieshowings/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findOneMovieShowings' });
        expect(movieshowingServices.findOneMovieShowings).toHaveBeenCalled();
    });

    it('POST /api/movieshowings should call verifyToken, authorize, and createMovieShowings', async () => {
        const res = await request(app).post('/api/movieshowings').send({});
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'createMovieShowings' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(movieshowingServices.createMovieShowings).toHaveBeenCalled();
    });

    it('PATCH /api/movieshowings/:id should call verifyToken, authorize, and updateMovieShowings', async () => {
        const res = await request(app).patch('/api/movieshowings/1').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'updateMovieShowings' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(movieshowingServices.updateMovieShowings).toHaveBeenCalled();
    });

    it('DELETE /api/movieshowings/:id should call verifyToken, authorize, and deleteMovieShowings', async () => {
        const res = await request(app).delete('/api/movieshowings/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'deleteMovieShowings' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(movieshowingServices.deleteMovieShowings).toHaveBeenCalled();
    });
});
