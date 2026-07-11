import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import productsRoutes from './products.routes.js';
import * as productsServices from '../services/products.services.js';
import * as tokenServices from '../services/token.services.js';
import * as authServices from '../services/auth.services.js';

vi.mock('../services/products.services.js', () => ({
    findAllProducts: vi.fn((req, res) => res.status(200).json({ msg: 'findAllProducts' })),
    findOneProduct: vi.fn((req, res) => res.status(200).json({ msg: 'findOneProduct' })),
    createProduct: vi.fn((req, res) => res.status(201).json({ msg: 'createProduct' })),
    updateProduct: vi.fn((req, res) => res.status(200).json({ msg: 'updateProduct' })),
    deleteProduct: vi.fn((req, res) => res.status(200).json({ msg: 'deleteProduct' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

vi.mock('../services/auth.services.js', () => ({
    authorize: vi.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api', productsRoutes);

describe('Products Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/candy should call findAllProducts', async () => {
        const res = await request(app).get('/api/candy');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findAllProducts' });
        expect(productsServices.findAllProducts).toHaveBeenCalled();
    });

    it('GET /api/candy/:id should call findOneProduct', async () => {
        const res = await request(app).get('/api/candy/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'findOneProduct' });
        expect(productsServices.findOneProduct).toHaveBeenCalled();
    });

    it('POST /api/candy should call verifyToken, authorize, and createProduct', async () => {
        const res = await request(app).post('/api/candy').send({});
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'createProduct' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(productsServices.createProduct).toHaveBeenCalled();
    });

    it('PATCH /api/candy/:id should call verifyToken, authorize, and updateProduct', async () => {
        const res = await request(app).patch('/api/candy/1').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'updateProduct' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(productsServices.updateProduct).toHaveBeenCalled();
    });

    it('DELETE /api/candy/:id should call verifyToken, authorize, and deleteProduct', async () => {
        const res = await request(app).delete('/api/candy/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'deleteProduct' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(productsServices.deleteProduct).toHaveBeenCalled();
    });
});
