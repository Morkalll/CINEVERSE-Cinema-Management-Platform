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
        <h2>{movie.title}</h2>
        <img src={movie.poster} alt={movie.title} />
        <div className="movie-info">
          <p><strong>Género:</strong> {movie.genre}</p>
          <p><strong>Duración:</strong> {movie.duration}</p>
          <p><strong>Calificación:</strong> {movie.rating}</p>
          <p><strong>Sinopsis:</strong> {movie.synopsis}</p>
        </div>
      </div>
    </div>
  );
};