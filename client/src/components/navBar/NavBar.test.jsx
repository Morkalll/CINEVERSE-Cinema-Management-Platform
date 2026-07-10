import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { NavBar } from './NavBar';
import { AuthContext } from '../../context/AuthContext';

describe('NavBar Component', () => {
  it('renders the navbar links for a guest user', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('• PELÍCULAS •')).toBeInTheDocument();
    expect(screen.getByText('• CANDY •')).toBeInTheDocument();
    
    // Panel Admin should NOT be in the document for guests
    expect(screen.queryByText('• PANEL ADMIN •')).not.toBeInTheDocument();
  });

  it('renders the admin panel link for a sysadmin user', () => {
    const mockUser = { role: 'sysadmin' };
    
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('• PANEL ADMIN •')).toBeInTheDocument();
  });
});
