import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './NavBar.css';
import logo2 from '../../assets/images/cineverse-logo-2.png';
import userIcon from '../../assets/images/user-icon-2.png';
import cartIcon from '../../assets/images/cart-icon.png';
import { useAuth } from '../../context/AuthContext';

export const NavBar = () => {
  const { user } = useAuth() || {};
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="hamburger-btn" 
          onClick={toggleMenu}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X size={28} color="#ff00cc" /> : <Menu size={28} color="#ff00cc" />}
        </button>
        <Link to="/" onClick={closeMenu}>
          <img src={logo2} alt="Logo Cineverso" className="logo" />
        </Link>
      </div>

      <div className={`navbar-center ${isOpen ? 'open' : ''}`}>
        <Link to="/movielistings" className="nav-link" onClick={closeMenu}> • PELÍCULAS • </Link>
        <Link to="/candy" className="nav-link" onClick={closeMenu}> • CANDY • </Link>
        {user && (user.role === "sysadmin" || user.role === "admin") && (
          <Link to="/sysadmin" className="nav-link sysadmin-link" onClick={closeMenu}> • PANEL ADMIN • </Link>
        )}
      </div>

      <div className="navbar-right">
        <Link to="/profile" onClick={closeMenu}>
          <img src={userIcon} alt="Perfil" className="user-icon" />
        </Link>
        <Link to="/checkout" onClick={closeMenu}>
          <img src={cartIcon} alt="Carrito" className="cart-icon" />
        </Link>
      </div>
    </nav>
  );
};