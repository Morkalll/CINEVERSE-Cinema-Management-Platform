import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NavBar } from '../../NavBar/NavBar';
import { MoviesMock } from "../../../data/MoviesMock";
import './MovieDetail.css';

export const MovieDetail = () => {
  const [movie, setMovie] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const foundMovie = MoviesMock.find(item => item.id === parseInt(id));
    setMovie(foundMovie);
  }, [id]);

  if (!movie) return <h2>Película no encontrada :/</h2>;

  return (
     <div>
      <NavBar />
        <div className="movie-detail-container">
       
        <div className="poster-section">
          <img src={movie.poster} alt={movie.title} />
          <div className="extra-info">
            <p>{movie.synopsis}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Género:</strong> {movie.genre}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Duración:</strong> {movie.duration}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Calificación:</strong> {movie.rating}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Director:</strong> {movie.director}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Fecha de estreno:</strong> {movie.year}</p>
          </div>
        </div>
        <div className="movie-details-right-side">
            <h2 className="movie-title">{movie.title}</h2>

        <div className="section-showtimes">
            <h3>HORARIOS</h3>
          </div>

          <div className="section-format">
            <h3>FORMATOS</h3>
          </div>

          <button className="buy-button">
            COMPRAR ENTRADA
          </button>
          </div>
      </div>
    </div>
  );
};