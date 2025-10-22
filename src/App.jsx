
import './App.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from 'react-router-dom';
import { TestRoom } from './components/pages/TestRoom';
import { Login } from './components/pages/Login/Login';
import { LoginAdmin } from './components/pages/LoginAdmin/LoginAdmin';
import { Register } from './components/pages/Register/Register';
import { RegisterAdmin } from './components/pages/RegisterAdmin/RegisterAdmin';
import { Home } from './components/pages/Home/Home';
import { MovieListingsPage } from './components/pages/MovieListingsPage/MovieListingsPage';
import { MovieDetail } from './components/pages/MovieDetail/MovieDetail';
import { Profile } from './components/pages/Profile/Profile';
import { Candy } from './components/pages/Candy/Candy';
import { NotFound } from './components/pages/NotFound/NotFound';
import { CheckoutPage } from "./components/pages/Cart/CheckoutPage";





function App() {
  return (

    <div>

      <Routes>

        <Route path='/' element={<TestRoom />} />
        <Route path='login' element={<Login />} />
        <Route path='login-admin' element={<LoginAdmin />} />
        <Route path='register' element={<Register />} />
        <Route path='register-admin' element={<RegisterAdmin />} />
        <Route path='home' element={<Home />} />
        <Route path='movielistings' element={<MovieListingsPage />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path='profile' element={<Profile />} />
        <Route path='candy' element={<Candy />} />
        <Route path='*' element={<NotFound />} />
        <Route path="/checkout" element={<CheckoutPage />} />

      </Routes>

      <ToastContainer />

    </div>

  )
}

export default App
