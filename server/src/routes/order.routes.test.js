import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderRoutes from './order.routes.js';
import * as orderServices from '../services/order.services.js';
import * as tokenServices from '../services/token.services.js';
import * as authServices from '../services/auth.services.js';

vi.mock('../services/order.services.js', () => ({
    createOrder: vi.fn((req, res) => res.status(201).json({ msg: 'createOrder' })),
    getUserOrders: vi.fn((req, res) => res.status(200).json({ msg: 'getUserOrders' })),
    getAllOrders: vi.fn((req, res) => res.status(200).json({ msg: 'getAllOrders' })),
    deleteOrder: vi.fn((req, res) => res.status(200).json({ msg: 'deleteOrder' })),
    cancelOrder: vi.fn((req, res) => res.status(200).json({ msg: 'cancelOrder' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

vi.mock('../services/auth.services.js', () => ({
    authorize: vi.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('POST /api/orders should call verifyToken and createOrder', async () => {
        const res = await request(app).post('/api/orders').send({});
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ msg: 'createOrder' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(orderServices.createOrder).toHaveBeenCalled();
    });

    it('GET /api/orders/mine should call verifyToken and getUserOrders', async () => {
        const res = await request(app).get('/api/orders/mine');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'getUserOrders' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(orderServices.getUserOrders).toHaveBeenCalled();
    });

    it('DELETE /api/orders/:id should call verifyToken and deleteOrder', async () => {
        const res = await request(app).delete('/api/orders/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'deleteOrder' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(orderServices.deleteOrder).toHaveBeenCalled();
    });

    it('GET /api/orders/all should call verifyToken, authorize, and getAllOrders', async () => {
        const res = await request(app).get('/api/orders/all');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'getAllOrders' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(orderServices.getAllOrders).toHaveBeenCalled();
    });

    it('PATCH /api/orders/:id/cancel should call verifyToken and cancelOrder', async () => {
        const res = await request(app).patch('/api/orders/1/cancel');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'cancelOrder' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(orderServices.cancelOrder).toHaveBeenCalled();
    });
});
