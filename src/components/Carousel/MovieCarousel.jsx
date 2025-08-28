import ReactSwipe from 'react-swipe';
import './MovieCarousel.css';

export const MovieCarousel = ({ movies, title = "RECOMENDADAS" }) => {
  let swipeRef;

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">{title}</h2>

      <ReactSwipe
        className="carousel-swipe"
        swipeOptions={{
          continuous: true,
          auto: 3000,
          speed: 400
        }}
        ref={(el) => (swipeRef = el)}
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
    </section>
  );
};



