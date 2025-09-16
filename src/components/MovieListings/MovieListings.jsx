import './MovieListings.css';
import { NavBar } from '../NavBar/NavBar';
import { useEffect, useState } from 'react';
import { MovieCard } from '../MovieCard/MovieCard';
import {MoviesMock} from '../../data/MoviesMock'; 

export const MovieListings = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Simula la carga desde backend
    setMovies(MoviesMock);
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
