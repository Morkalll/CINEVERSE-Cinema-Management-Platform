import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import movieRoutes from './movie.routes.js';
import * as movieServices from '../services/movie.services.js';
import * as tokenServices from '../services/token.services.js';
import * as authServices from '../services/auth.services.js';

vi.mock('../services/movie.services.js', () => ({
    findAllMovies: vi.fn((req, res) => res.status(200).json({ msg: 'findAllMovies' })),
    findOneMovie: vi.fn((req, res) => res.status(200).json({ msg: 'findOneMovie' })),
    createMovie: vi.fn((req, res) => res.status(201).json({ msg: 'createMovie' })),
    updateMovie: vi.fn((req, res) => res.status(200).json({ msg: 'updateMovie' })),
    deleteMovie: vi.fn((req, res) => res.status(200).json({ msg: 'deleteMovie' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

vi.mock('../services/auth.services.js', () => ({
    authorize: vi.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api', movieRoutes);

describe('Movie Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/movielistings should call findAllMovies', async () => {
        const res = await request(app).get('/api/movielistings');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findAllMovies' });
        expect(movieServices.findAllMovies).toHaveBeenCalled();
    });

    it('GET /api/movielistings/:id should call findOneMovie', async () => {
        const res = await request(app).get('/api/movielistings/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findOneMovie' });
        expect(movieServices.findOneMovie).toHaveBeenCalled();
    });

    it('POST /api/movielistings should call verifyToken, authorize, and createMovie', async () => {
        const res = await request(app).post('/api/movielistings').send({});
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'createMovie' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(movieServices.createMovie).toHaveBeenCalled();
    });

    it('PATCH /api/movielistings/:id should call verifyToken, authorize, and updateMovie', async () => {
        const res = await request(app).patch('/api/movielistings/1').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'updateMovie' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(movieServices.updateMovie).toHaveBeenCalled();
    });

    it('DELETE /api/movielistings/:id should call verifyToken, authorize, and deleteMovie', async () => {
        const res = await request(app).delete('/api/movielistings/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'deleteMovie' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(movieServices.deleteMovie).toHaveBeenCalled();
    });
});
