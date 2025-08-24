import React from 'react';
import NavBar from '../components/navBar/navBar';
import Carrousel from '../components/Carrousel/Carrousel';
import MovieListings from '../components/MovieListings/MovieListings';

const Home = () => (
  <>
    <NavBar />
    <Carrousel />
    <MovieListings />
  </>
);

export default Home;
