import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import paymentRoutes from './payment.routes.js';
import * as paymentServices from '../services/payment.services.js';
import * as tokenServices from '../services/token.services.js';

vi.mock('../services/payment.services.js', () => ({
    createPreference: vi.fn((req, res) => res.status(200).json({ msg: 'createPreference' })),
    handleWebhook: vi.fn((req, res) => res.status(200).json({ msg: 'handleWebhook' })),
    refundPayment: vi.fn((req, res) => res.status(200).json({ msg: 'refundPayment' })),
    getPaymentStatus: vi.fn((req, res) => res.status(200).json({ msg: 'getPaymentStatus' }))
}));

vi.mock('../services/token.services.js', () => ({
    verifyToken: vi.fn((req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

describe('Payment Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('POST /api/payments/create-preference should call verifyToken and createPreference', async () => {
        const res = await request(app).post('/api/payments/create-preference').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'createPreference' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(paymentServices.createPreference).toHaveBeenCalled();
    });

    it('POST /api/payments/webhook should call handleWebhook', async () => {
        const res = await request(app).post('/api/payments/webhook').send({});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'handleWebhook' });
        expect(paymentServices.handleWebhook).toHaveBeenCalled();
    });

    it('POST /api/payments/refund/:orderId should call verifyToken and refundPayment', async () => {
        const res = await request(app).post('/api/payments/refund/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'refundPayment' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(paymentServices.refundPayment).toHaveBeenCalled();
    });

    it('GET /api/payments/status/:orderId should call verifyToken and getPaymentStatus', async () => {
        const res = await request(app).get('/api/payments/status/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: 'getPaymentStatus' });
        expect(tokenServices.verifyToken).toHaveBeenCalled();
        expect(paymentServices.getPaymentStatus).toHaveBeenCalled();
    });
});
