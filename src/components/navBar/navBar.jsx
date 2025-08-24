import { Link } from 'react-router-dom';
import './navBar.css';

const NavBar = () => {
  return (
    // Los links to son para que al apretar te lleve a esa pagina
    <nav className="navbar">
      
      {/* Logo del cine */}
      
      <div className="navbar-left">
        <Link to="/">
          <img src="/logo-cine.png" alt="Logo Cineverso" className="logo" />
        </Link>
      </div>

      {/* Links de navegacion*/}
      
      <div className="navbar-center">
        <Link to="/cartelera" className="nav-link">PELÍCULAS</Link>
        <Link to="/candy" className="nav-link">CANDY</Link>
      </div>
      
      {/* Icono del Usuario*/}
     
     <div className="navbar-right">
        <Link to="/perfil">
          <img src="/user-icon.svg" alt="Perfil" className="user-icon" />
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
