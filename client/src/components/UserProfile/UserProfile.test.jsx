import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProfile } from './UserProfile';
import { useAuth } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { successToast, errorToast } from '../../utils/toast';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../utils/toast', () => ({
    successToast: vi.fn(),
    errorToast: vi.fn()
}));

describe('UserProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        
        // Mock window.confirm and window.location
        window.confirm = vi.fn(() => true);
        delete window.location;
        window.location = { href: '' };
    });

    it('shows loading state initially', () => {
        useAuth.mockReturnValue({ loading: true });
        
        render(<UserProfile />, { wrapper: MemoryRouter });
        
        expect(screen.getByText('Cargando perfil...')).toBeInTheDocument();
    });

    it('shows login prompt if not authenticated', () => {
        useAuth.mockReturnValue({ loading: false, user: null });
        
        render(<UserProfile />, { wrapper: MemoryRouter });
        
        expect(screen.getByText('No has iniciado sesión.')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Iniciar sesión'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('fetches and displays user orders', async () => {
        useAuth.mockReturnValue({ loading: false, user: { username: 'testuser' }, token: 'fake-token', logout: vi.fn() });
        
        const mockOrders = [
            { id: 1, status: 'paid', total: 10, createdAt: '2023-01-01T00:00:00Z', orderItems: [{ name: 'Popcorn', quantity: 1, price: 10 }] }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOrders
        });
        
        render(<UserProfile />, { wrapper: MemoryRouter });
        
        await waitFor(() => {
            expect(screen.getByText('¡Bienvenido, testuser!')).toBeInTheDocument();
            expect(screen.getByText(/Orden #1/)).toBeInTheDocument();
            expect(screen.getByText('Pagado')).toBeInTheDocument();
            expect(screen.getByText(/Popcorn — Cant: 1 — Precio: \$10.00/)).toBeInTheDocument();
        });
    });

    it('handles logout', async () => {
        const mockLogout = vi.fn();
        useAuth.mockReturnValue({ loading: false, user: { username: 'testuser' }, token: 'fake-token', logout: mockLogout });
        
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        
        render(<UserProfile />, { wrapper: MemoryRouter });
        
        await waitFor(() => expect(screen.getByText('Cerrar sesión')).toBeInTheDocument());
        
        fireEvent.click(screen.getByText('Cerrar sesión'));
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles request refund for paid order', async () => {
        useAuth.mockReturnValue({ loading: false, user: { username: 'testuser' }, token: 'fake-token', logout: vi.fn() });
        
        const mockOrders = [
            { id: 1, status: 'paid', total: 10, orderItems: [] }
        ];

        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockOrders }); // initial fetch
        
        render(<UserProfile />, { wrapper: MemoryRouter });
        
        await waitFor(() => expect(screen.getByText('💰 Solicitar Reembolso')).toBeInTheDocument());
        
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // refund fetch
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockOrders }); // refresh fetch
        
        fireEvent.click(screen.getByText('💰 Solicitar Reembolso'));
        
        expect(window.confirm).toHaveBeenCalled();
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/payments/refund/1'), expect.any(Object));
            expect(successToast).toHaveBeenCalledWith('Reembolso procesado exitosamente');
        });
    });

    it('handles pay for created order', async () => {
        useAuth.mockReturnValue({ loading: false, user: { username: 'testuser' }, token: 'fake-token', logout: vi.fn() });
        
        const mockOrders = [
            { id: 1, status: 'created', total: 10, orderItems: [] }
        ];

        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockOrders });
        
        render(<UserProfile />, { wrapper: MemoryRouter });
        
        await waitFor(() => expect(screen.getByText('💳 Pagar Pedido')).toBeInTheDocument());
        
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ initPoint: 'http://mp.com' }) }); // pay fetch
        
        fireEvent.click(screen.getByText('💳 Pagar Pedido'));
        
        await waitFor(() => {
            expect(window.location.href).toBe('http://mp.com');
        });
    });

    it('handles cancel for created order', async () => {
        useAuth.mockReturnValue({ loading: false, user: { username: 'testuser' }, token: 'fake-token', logout: vi.fn() });
        
        const mockOrders = [
            { id: 1, status: 'created', total: 10, orderItems: [] }
        ];

        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockOrders });
        
        render(<UserProfile />, { wrapper: MemoryRouter });
        
        await waitFor(() => expect(screen.getByText('❌ Cancelar Pedido')).toBeInTheDocument());
        
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // cancel fetch
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockOrders }); // refresh fetch
        
        fireEvent.click(screen.getByText('❌ Cancelar Pedido'));
        
        expect(window.confirm).toHaveBeenCalled();
        
        await waitFor(() => {
            expect(successToast).toHaveBeenCalledWith('Pedido cancelado exitosamente');
        });
    });
});
