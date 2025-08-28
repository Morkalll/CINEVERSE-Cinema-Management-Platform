
import { Link } from 'react-router-dom';
import './NavBar.css';
import logo2 from '../../assets/images/cineverse-logo-2.png';
import userIcon from '../../assets/images/user-icon-2.png';

export const NavBar = () => {
  return (
    // Los links to son para que al apretar te lleve a esa pagina
    <nav className="navbar">
      
      {/* Logo del cine */}
      
      <div className="navbar-left">
        <Link to="/">
          <img src={logo2} alt="Logo Cineverso" className="logo" />
        </Link>
      </div>

      {/* Links de navegacion*/}
      
      <div className="navbar-center">
        <Link to="/movielistings" className="nav-link"> • PELÍCULAS • </Link>
        <Link to="/candy" className="nav-link"> • CANDY </Link>
      </div>
      
      {/* Icono del Usuario*/}
     
     <div className="navbar-right">
        <Link to="/profile">
          <img src={userIcon} alt="Perfil" className="user-icon" />
        </Link>
      </div>
    </nav>
  );
};

