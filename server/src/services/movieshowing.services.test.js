import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAllMovieShowings, findOneMovieShowings, createMovieShowings, updateMovieShowings, deleteMovieShowings } from './movieshowing.services.js';
import { MovieShowing } from '../models/MovieShowing.js';
import { Movie } from '../models/Movie.js';
import { Seat } from '../models/Seats.js';
import { sequelize } from '../db.js';

vi.mock('../models/MovieShowing.js', () => ({
    MovieShowing: {
        findAll: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        findByPk: vi.fn()
    }
}));

vi.mock('../models/Movie.js', () => ({
    Movie: {}
}));

vi.mock('../models/Seats.js', () => ({
    Seat: {
        bulkCreate: vi.fn(),
        destroy: vi.fn()
    }
}));

const mockTransaction = {
    commit: vi.fn(),
    rollback: vi.fn()
};

vi.mock('../db.js', () => ({
    sequelize: {
        transaction: vi.fn(() => mockTransaction)
    }
}));

describe('MovieShowing Services', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { params: {}, body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    describe('findAllMovieShowings', () => {
        it('should return all showings', async () => {
            const showings = [{ id: 1 }];
            MovieShowing.findAll.mockResolvedValue(showings);

            await findAllMovieShowings(req, res);

            expect(MovieShowing.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(showings);
        });

        it('should return 500 on error', async () => {
            MovieShowing.findAll.mockRejectedValue(new Error('DB Error'));
            await findAllMovieShowings(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('findOneMovieShowings', () => {
        it('should return 404 if not found', async () => {
            req.params.id = 1;
            MovieShowing.findOne.mockResolvedValue(null);

            await findOneMovieShowings(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return showing if found', async () => {
            req.params.id = 1;
            const showing = { id: 1 };
            MovieShowing.findOne.mockResolvedValue(showing);

            await findOneMovieShowings(req, res);
            expect(res.json).toHaveBeenCalledWith(showing);
        });
    });

    describe('createMovieShowings', () => {
        it('should return 400 if required fields missing', async () => {
            req.body = { movieId: 1 };
            await createMovieShowings(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if showing exists', async () => {
            req.body = { movieId: 1, showtime: '2023-10-10', screenId: 1 };
            MovieShowing.findOne.mockResolvedValue({ id: 1 });

            await createMovieShowings(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should create showing and seats successfully', async () => {
            req.body = { movieId: 1, showtime: '2023-10-10', screenId: 1, price: 10 };
            MovieShowing.findOne.mockResolvedValue(null);
            MovieShowing.create.mockResolvedValue({ id: 1, ...req.body });

            await createMovieShowings(req, res);

            expect(MovieShowing.create).toHaveBeenCalled();
            expect(Seat.bulkCreate).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should rollback on error', async () => {
            req.body = { movieId: 1, showtime: '2023-10-10' };
            MovieShowing.findOne.mockRejectedValue(new Error('DB Error'));

            await createMovieShowings(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateMovieShowings', () => {
        it('should return 404 if not found', async () => {
            req.params.id = 1;
            MovieShowing.findByPk.mockResolvedValue(null);

            await updateMovieShowings(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should update showing successfully', async () => {
            req.params.id = 1;
            req.body = { price: 15 };
            const mockShowing = { id: 1, update: vi.fn().mockResolvedValue(true) };
            MovieShowing.findByPk.mockResolvedValue(mockShowing);

            await updateMovieShowings(req, res);
            expect(mockShowing.update).toHaveBeenCalledWith({ ticketPrice: 15 });
            expect(res.json).toHaveBeenCalledWith(mockShowing);
        });
    });

    describe('deleteMovieShowings', () => {
        it('should return 404 if not found and rollback', async () => {
            req.params.id = 1;
            MovieShowing.findByPk.mockResolvedValue(null);

            await deleteMovieShowings(req, res);
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should destroy showing and seats, then commit', async () => {
            req.params.id = 1;
            const mockShowing = { id: 1, destroy: vi.fn() };
            MovieShowing.findByPk.mockResolvedValue(mockShowing);

            await deleteMovieShowings(req, res);

            expect(Seat.destroy).toHaveBeenCalledWith({ where: { showingId: 1 }, transaction: mockTransaction });
            expect(mockShowing.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should rollback on error', async () => {
            req.params.id = 1;
            MovieShowing.findByPk.mockRejectedValue(new Error('DB Error'));

            await deleteMovieShowings(req, res);
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
