import React, { useEffect, useState } from 'react';
import MovieCard from '../MovieCard/MovieCard';

const MovieListings = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // El useEffect es para obtener los datos de las peliculas desde el backend (base de datos)
  }, []);

  return (
    <div className="showcase">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          id={movie.id}
          title={movie.title}
          posterUrl={movie.posterUrl}
        />
      ))}
    </div>
  );
};

export default MovieListings