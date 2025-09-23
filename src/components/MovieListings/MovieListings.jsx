import './MovieListings.css';
import { NavBar } from '../NavBar/NavBar';
import { useEffect, useState } from 'react';
import { MovieCard } from '../MovieCard/MovieCard';

export const MovieListings = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/movielistings');
        
        if (!response.ok) {
          throw new Error('Error al cargar las películas');
        }
        
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Hubo un problema con la solicitud:', error);
      }
    };
    
    
    fetchMovies();
  }, []);

  return (
    <>
      <NavBar />
      <h1 className="showcase-title"> ──────────────── Cartelera ────────────────</h1>
      <div className="showcase">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterUrl={movie.poster}
          />
        ))}
      </div>
    </>
  );
};