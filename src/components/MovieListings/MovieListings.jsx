import './MovieListings.css';

import { useEffect, useState } from 'react';
import { MovieCard } from '../MovieCard/MovieCard';


export const MovieListings = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
     const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/movielistings'); // Mover local host 3000 a archivo de config
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setMovies(await response.json());
      } catch (error) {
        console.error("Error al obtener las películas:", error);
      }}
      fetchMovies();
    
  }, []);
      

  return (
    <>
     
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
