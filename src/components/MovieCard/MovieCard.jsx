import React from 'react';
import { Link } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ id, title, posterUrl }) => {
  return (
    // El Link to es para que cuando aprietes el poster en cartelera te lleve a la pagina de esa pelicula
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

export default MovieCard;