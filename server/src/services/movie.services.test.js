import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAllMovies, findOneMovie, createMovie, updateMovie, deleteMovie } from './movie.services.js';
import { Movie } from '../models/Movie.js';
import { MovieShowing } from '../models/MovieShowing.js';
import { Seat } from '../models/Seats.js';
import { sequelize } from '../db.js';

vi.mock('../models/Movie.js', () => ({
    Movie: {
        findAll: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        findByPk: vi.fn()
    }
}));

vi.mock('../models/MovieShowing.js', () => ({
    MovieShowing: {
        findAll: vi.fn(),
        destroy: vi.fn()
    }
}));

vi.mock('../models/Seats.js', () => ({
    Seat: {
        destroy: vi.fn()
    }
}));

const mockTransaction = {
    commit: vi.fn(),
    rollback: vi.fn()
};

vi.mock('../db.js', () => ({
    sequelize: {
        transaction: vi.fn(() => mockTransaction),
        fn: vi.fn(),
        col: vi.fn(),
        where: vi.fn()
    }
}));

describe('Movie Services', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { params: {}, body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn()
        };
    });

    describe('findAllMovies', () => {
        it('should return all movies', async () => {
            const movies = [{ id: 1, title: 'Alien' }];
            Movie.findAll.mockResolvedValue(movies);

            await findAllMovies(req, res);

            expect(Movie.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(movies);
        });

        it('should return 500 on error', async () => {
            Movie.findAll.mockRejectedValue(new Error('DB Error'));
            await findAllMovies(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('findOneMovie', () => {
        it('should return 404 if movie not found', async () => {
            req.params.id = 1;
            Movie.findOne.mockResolvedValue(null);
            
            await findOneMovie(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return movie if found', async () => {
            req.params.id = 1;
            const movie = { id: 1, title: 'Alien' };
            Movie.findOne.mockResolvedValue(movie);

            await findOneMovie(req, res);
            expect(res.json).toHaveBeenCalledWith(movie);
        });
    });

    describe('createMovie', () => {
        it('should return 400 if title or genre missing', async () => {
            req.body = { title: 'Alien' }; // missing genre
            await createMovie(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if movie exists', async () => {
            req.body = { title: 'Alien', genre: 'Sci-Fi' };
            Movie.findOne.mockResolvedValue({ id: 1 });
            
            await createMovie(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should create movie successfully', async () => {
            req.body = { title: 'Alien', genre: 'Sci-Fi' };
            Movie.findOne.mockResolvedValue(null);
            Movie.create.mockResolvedValue({ id: 1, ...req.body });

            await createMovie(req, res);
            expect(Movie.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateMovie', () => {
        it('should return 404 if not found', async () => {
            req.params.id = 1;
            Movie.findByPk.mockResolvedValue(null);

            await updateMovie(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should update movie successfully', async () => {
            req.params.id = 1;
            req.body = { title: 'Alien 2' };
            const mockMovie = { id: 1, title: 'Alien', update: vi.fn().mockResolvedValue(true) };
            Movie.findByPk.mockResolvedValue(mockMovie);

            await updateMovie(req, res);
            expect(mockMovie.update).toHaveBeenCalledWith({ title: 'Alien 2' });
            expect(res.json).toHaveBeenCalledWith(mockMovie);
        });
    });

    describe('deleteMovie', () => {
        it('should return 404 if not found and rollback', async () => {
            req.params.id = 1;
            Movie.findByPk.mockResolvedValue(null);

            await deleteMovie(req, res);
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should destroy related data and commit', async () => {
            req.params.id = 1;
            const mockMovie = { id: 1, destroy: vi.fn() };
            Movie.findByPk.mockResolvedValue(mockMovie);
            MovieShowing.findAll.mockResolvedValue([{ id: 10 }]);

            await deleteMovie(req, res);

            expect(Seat.destroy).toHaveBeenCalledWith({ where: { showingId: 10 }, transaction: mockTransaction });
            expect(MovieShowing.destroy).toHaveBeenCalledWith({ where: { movieId: 1 }, transaction: mockTransaction });
            expect(mockMovie.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should rollback on error', async () => {
            req.params.id = 1;
            Movie.findByPk.mockRejectedValue(new Error('DB Error'));

            await deleteMovie(req, res);
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
