import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import seatsRoutes from './seats.routes.js';
import * as seatServices from '../services/seat.services.js';
import * as tokenServices from '../services/token.services.js';

vi.mock('../services/seat.services.js', () => ({
    getSeats: vi.fn((req, res) => res.status(200).json({ msg: 'getSeats' })),
    getOccupiedSeats: vi.fn((req, res) => res.status(200).json({ msg: 'getOccupiedSeats' })),
    reserveSeats: vi.fn((req, res) => res.status(200).json({ msg: 'reserveSeats' })),
    releaseSeats: vi.fn((req, res) => res.status(200).json({ msg: 'releaseSeats' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api', seatsRoutes);

describe('Seats Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/showtimes/:id/seats should call getSeats', async () => {
        const res = await request(app).get('/api/showtimes/1/seats');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'getSeats' });
        expect(seatServices.getSeats).toHaveBeenCalled();
    });

    it('GET /api/seats/occupied should call getOccupiedSeats', async () => {
        const res = await request(app).get('/api/seats/occupied');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'getOccupiedSeats' });
        expect(seatServices.getOccupiedSeats).toHaveBeenCalled();
    });

    it('POST /api/seats/reserve should call verifyToken and reserveSeats', async () => {
        const res = await request(app).post('/api/seats/reserve').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'reserveSeats' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(seatServices.reserveSeats).toHaveBeenCalled();
    });

    it('POST /api/seats/release should call verifyToken and releaseSeats', async () => {
        const res = await request(app).post('/api/seats/release').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'releaseSeats' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(seatServices.releaseSeats).toHaveBeenCalled();
    });
});
