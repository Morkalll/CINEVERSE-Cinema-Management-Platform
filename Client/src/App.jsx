
import './App.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from 'react-router-dom';
import { TestRoom } from './components/pages/TestRoom';
import { Login } from './components/pages/Login/Login';
import { Register } from './components/pages/Register/Register';
import { Home } from './components/pages/Home/Home';
//import { MovieListings } from './components/MovieListings/MovieListings';
import { MovieDetail } from './components/pages/MovieDetail/MovieDetail';
import { Profile } from './components/pages/Profile/Profile';
import { Candy } from './components/pages/Candy/Candy';
import { NotFound } from './components/pages/NotFound/NotFound';
import { Movies } from './components/pages/MovieListings/Movies';



function App() 
{
  return (

    <div>

      <Routes>

        <Route path='/' element={<TestRoom/>} />
        <Route path='login' element={<Login/>} />
        <Route path='register' element={<Register/>} />
        <Route path='home' element={<Home/>} />
        <Route path='movies' element={<Movies/>} />
        <Route path = "/movie/:id" element = {<MovieDetail/>} />
        <Route path='profile' element={<Profile/>} />
        <Route path='candy' element={<Candy/>} />
        <Route path='*' element={<NotFound/>} />

      </Routes>

      <ToastContainer/>

    </div>

  )
}

export default App
