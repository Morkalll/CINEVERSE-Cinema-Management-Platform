import { useRef, useEffect } from 'react';
import ReactSwipe from 'react-swipe';
import './MovieCarousel.css';

export const MovieCarousel = ({ movies }) => {
  const swipeRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (swipeRef.current) {
        swipeRef.current.next(); 
      }
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <section className="carousel-section">
      <h1 className="showcase-title">
        ─────────────── Recomendadas ───────────────
      </h1>

      <div className="carousel-wrapper">
        <button
          className="carousel-arrow left"
          onClick={() => swipeRef.current.prev()}
        >
          &#10094;
        </button>
        <button
          className="carousel-arrow right"
          onClick={() => swipeRef.current.next()}
        >
          &#10095;
        </button>

        <ReactSwipe
          className="carousel-swipe"
          swipeOptions={{
            continuous: true,
            speed: 400,
          }}
          ref={swipeRef}
        >
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




