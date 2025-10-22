import { NavBar } from '../../NavBar/NavBar';
import { MovieListings } from '../../MovieListings/MovieListings';
import { MovieCarousel } from '../../Carousel/MovieCarousel';

import './Home.css';



export const Home = () => {
  return (
    <div className="NavBar">
      <NavBar />

      <section className="Carousel">
      </section>
      <MovieCarousel />
      <section className="Listings-section">
        <MovieListings />
      </section>
    </div>
  );
};