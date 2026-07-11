import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SysAdminPanel } from './SysAdminPanel';
import { useAuth } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../components/NavBar/NavBar', () => ({
    NavBar: () => <div data-testid="navbar">NavBar</div>
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../utils/toast', () => ({
    successToast: vi.fn(),
    errorToast: vi.fn()
}));

const renderWithRouter = (ui) => {
    return render(
        <MemoryRouter>
            {ui}
        </MemoryRouter>
    );
};

describe('SysAdminPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
        }));
    });

    it('redirects or shows error if user is not sysadmin/admin', () => {
        useAuth.mockReturnValue({ user: { role: 'user' } });
        
        renderWithRouter(<SysAdminPanel />);
        // It will try to navigate to /home and show errorToast
        // We can check if it calls fetch, which it shouldn't
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('renders loading state initially', () => {
        useAuth.mockReturnValue({ user: { role: 'sysadmin' } });
        // Make fetch never resolve to keep it in loading state
        global.fetch.mockImplementation(() => new Promise(() => {}));
        
        renderWithRouter(<SysAdminPanel />);
        
        expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    });

    it('fetches data and renders tabs correctly', async () => {
        useAuth.mockReturnValue({ user: { role: 'sysadmin' } });
        
        // Mock specific fetch responses
        global.fetch.mockImplementation((url) => {
            if (url.includes('/users')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, name: 'Admin', email: 'a@a.com', role: 'admin' }]) });
            }
            if (url.includes('/movielistings')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, title: 'Alien' }]) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });
        
        renderWithRouter(<SysAdminPanel />);
        
        await waitFor(() => {
            expect(screen.getByText('Administración')).toBeInTheDocument();
        });

        // Tabs
        expect(screen.getByRole('button', { name: /Usuarios/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Películas/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Salas/i })).toBeInTheDocument();
        
        // Users tab is active by default
        expect(screen.getByText('Usuarios Registrados')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('a@a.com')).toBeInTheDocument();
        
        // Switch to Movies tab
        fireEvent.click(screen.getByRole('button', { name: /Películas/i }));
        
        expect(screen.getByText('Películas')).toBeInTheDocument(); // section header
        expect(screen.getByText('Alien')).toBeInTheDocument();
    });
});
