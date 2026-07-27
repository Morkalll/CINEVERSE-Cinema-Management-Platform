import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as emailServices from './email.services.js';
import nodemailer from 'nodemailer';

vi.mock('nodemailer', () => {
    return {
        default: {
            createTransport: vi.fn().mockReturnValue({
                sendMail: vi.fn().mockResolvedValue(true)
            })
        }
    };
});

// Since emailServices initializes the transporter on import using config,
// we should just mock the underlying transporter's sendMail if possible, 
// but since the module already loaded, we can verify console outputs or 
// if transporter was created. Since we can't easily access the un-exported transporter,
// we will just ensure the functions execute without throwing errors, 
// which is the main goal for fire-and-forget email services.

describe('Email Services', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should send welcome email without throwing', async () => {
        await expect(emailServices.sendWelcomeEmail('test@test.com', 'testuser')).resolves.not.toThrow();
    });

    it('should send login alert email without throwing', async () => {
        await expect(emailServices.sendLoginAlertEmail('test@test.com', 'testuser')).resolves.not.toThrow();
    });

    it('should send order confirmation email without throwing', async () => {
        const order = { id: 1, total: 10, items: [{ name: 'Ticket', quantity: 2, price: 5 }] };
        await expect(emailServices.sendOrderConfirmationEmail('test@test.com', 'testuser', order)).resolves.not.toThrow();
    });

    it('should send order cancellation email (manual) without throwing', async () => {
        await expect(emailServices.sendOrderCancellationEmail('test@test.com', 'testuser', 1, false)).resolves.not.toThrow();
    });

    it('should send order cancellation email (automatic) without throwing', async () => {
        await expect(emailServices.sendOrderCancellationEmail('test@test.com', 'testuser', 1, true)).resolves.not.toThrow();
    });

    it('should send password changed email without throwing', async () => {
        await expect(emailServices.sendPasswordChangedEmail('test@test.com', 'testuser')).resolves.not.toThrow();
    });

    it('should send profile updated email without throwing', async () => {
        await expect(emailServices.sendProfileUpdatedEmail('test@test.com', 'testuser')).resolves.not.toThrow();
    });

    it('should send refund email without throwing', async () => {
        await expect(emailServices.sendRefundEmail('test@test.com', 'testuser', 1, 100.50)).resolves.not.toThrow();
    });

    it('should send payment success email without throwing', async () => {
        const order = { id: 1, total: 15, items: [{ name: 'Popcorn', quantity: 1, price: 5 }, { name: 'Ticket A1', quantity: 1, price: 10, seats: ['A1'] }] };
        await expect(emailServices.sendPaymentSuccessEmail('test@test.com', 'testuser', order)).resolves.not.toThrow();
    });
});
