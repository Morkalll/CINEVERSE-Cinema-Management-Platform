import { NavBar } from '../../NavBar/NavBar';
import { MovieListings } from '../../MovieListings/MovieListings';
import { MovieCarousel } from '../../Carousel/MovieCarousel';
import { MoviesMock } from "../../../data/MoviesMock";
import './Home.css';



export const Home = () => {
  return (
    <div className="NavBar">
      <NavBar />

      <section className="Carousel">
        <MovieCarousel movies = {MoviesMock}/>
      </section>

      <section className="Listings-section">
        <MovieListings />
      </section>
    </div>
  );
};