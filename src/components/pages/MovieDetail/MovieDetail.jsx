import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NavBar } from '../../NavBar/NavBar';
import './MovieDetail.css';

export const MovieDetail = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
     const fetchMovie = async (id) => {
      try {
        const response = await fetch('http://localhost:3000/api/movielistings/' + id); // Mover local host 3000 a archivo de config
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setMovie(await response.json());
      } catch (error) {
        
      }
      finally {setLoading(false);}}
      fetchMovie(id);
      
      
    
  }, []);
        if (loading) {
          return <div>Cargando...</div>
        }

  console.log(movie);
  const releaseFullYear = new Date(movie.releaseDate).getFullYear();
  const releaseMonth = new Date(movie.releaseDate).getMonth() + 1;
  const releaseDay = new Date(movie.releaseDate).getDate();

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
            <p><strong>Duración:</strong> {movie.duration} minutos</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Calificación:</strong> {movie.rating}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Director:</strong> {movie.director}</p>
            <p><strong>────────────────</strong></p>
            <p><strong>Fecha de estreno:</strong> {releaseDay} / {releaseMonth} / {releaseFullYear}</p>
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