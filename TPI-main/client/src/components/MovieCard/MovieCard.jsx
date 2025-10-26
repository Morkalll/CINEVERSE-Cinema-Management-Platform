
import { Link } from 'react-router-dom';
import './MovieCard.css';


export const MovieCard = ({ id, title, posterUrl }) => 
{
  return (

    <Link to={`/movie/${id}`} className="movie-card-link"> 


      <div className="movie-card">

        <div className="movie-poster-container">

          <img src={posterUrl} alt={title} className="movie-poster" />

        </div>

        <div className="movie-title">{title}</div>

      </div>


    </Link>

  );

};

