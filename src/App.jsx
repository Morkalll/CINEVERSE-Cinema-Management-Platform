
import './App.css'
import { Home } from './components/home/Home'
import { Login } from './components/login/Login'
import { NotFound } from './components/error handler/NotFound'
import { Routes, Route } from 'react-router'


function App() 
{
  return (

    <div>
      
      <Routes>

        <Route path='login' element={<Login/>} />
        <Route path='home' element={<Home/>} />
        <Route path='*' element={<NotFound/>} />

      </Routes>
    
    </div>

  )
}

export default App
