
import { Link } from 'react-router-dom';
import './NavBar.css';
import logo2 from '../../assets/images/cineverse-logo-2.png';
import userIcon from '../../assets/images/user-icon-2.png';
import cartIcon from '../../assets/images/cart-icon.png';
import { useAuth } from '../../context/AuthContext';


export const NavBar = () => 
{
  const {user} = useAuth() || {};
  return (

    <nav className="navbar">


      <div className="navbar-left">

        <Link to="/">

          <img src={logo2} alt="Logo Cineverso" className="logo" />

        </Link>

      </div>


      <div className="navbar-center">

        <Link to="/movielistings" className="nav-link"> • PELÍCULAS • </Link>

        <Link to="/candy" className="nav-link"> • CANDY • </Link>
        
        {user && user.role === "sysadmin" && (
          <Link to="/sysadmin" className="nav-link sysadmin-link"> • PANEL ADMIN • </Link>
        )}

      </div>


      <div className="navbar-right">

        <Link to="/profile">

          <img src={userIcon} alt="Perfil" className="user-icon" />

        </Link>

      </div>


      <div className="navbar-right">

        <Link to="/checkout">

          <img src={cartIcon} alt="Carrito" className="cart-icon" />
          
        </Link>

      </div>


    </nav>

  );

};
