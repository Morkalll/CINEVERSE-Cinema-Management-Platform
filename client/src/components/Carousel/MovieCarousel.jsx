import { useRef, useEffect, useState } from 'react';
import ReactSwipe from 'react-swipe';
import './MovieCarousel.css';

export const MovieCarousel = () => 
{
  const swipeRef = useRef(null);
  const [movies, setMovies] = useState([]);

  useEffect(() => 
  {
    const fetchMovies = async () => 
    {
      try 
      {
        const response = await fetch('http://localhost:3000/api/movielistings');

        if (!response.ok) 
        {
          throw new Error('Error al obtener las películas');
        }

        const data = await response.json();
        setMovies(data);
      } 
      catch (error) 
      {
        console.error('Error:', error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => 
  {
    const interval = setInterval(() => 
    {
      if (swipeRef.current) 
      {
        swipeRef.current.next();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [movies.length]);

  if (movies.length === 0) {
    return (
      <section className="carousel-section">
        <h1 className="showcase-title">
          ─────────────── Recomendadas ───────────────
        </h1>
        <div className="carousel-wrapper">
          <p>Cargando películas...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="carousel-section">
      <h1 className="showcase-title">
        ─────────────── Recomendadas ───────────────
      </h1>

      <div className="carousel-wrapper">
        <button className="carousel-arrow left" onClick={() => swipeRef.current.prev()}>
          &#10094;
        </button>

        <button className="carousel-arrow right" onClick={() => swipeRef.current.next()}>
          &#10095;
        </button>

        <ReactSwipe 
          className="carousel-swipe"
          swipeOptions={{
            continuous: true,
            speed: 400,
          }}
          ref={swipeRef}>

          {movies.map((movie) => (
            <div key={movie.id} className="carousel-slide">
              <img
                src={movie.posterCarousel}
                alt={movie.title}
                className="carousel-poster"
              />
            </div>
          ))}
        </ReactSwipe>
      </div>
    </section>
  );
};