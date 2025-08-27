
import './App.css'
import { TestRoom } from './components/pages/TestRoom'
import { Home } from './components/pages/Home/Home'
import { Login } from './components/pages/Login/Login'
import { Register } from './components/pages/Register/Register'
import { MovieListings } from './components/pages/MovieListings/MovieListings'
import { Profile } from './components/pages/Profile/Profile'
import { Candy } from './components/pages/Candy/Candy'
import { NotFound } from './components/pages/NotFound/NotFound'
import { Routes, Route } from 'react-router-dom'



function App() 
{
  return (

    <div>
      
      <Routes>

        <Route path='/' element={<TestRoom/>} />
        <Route path='login' element={<Login/>} />
        <Route path='register' element={<Register/>} />
        <Route path='home' element={<Home/>} />
        <Route path='movielistings' element={<MovieListings/>} />
        <Route path='profile' element={<Profile/>} />
        <Route path='candy' element={<Candy/>} />
        <Route path='*' element={<NotFound/>} />

      </Routes>
    
    </div>

  )
}

export default App
