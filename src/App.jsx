
import './App.css'
import { Home } from './components/pages/Home'
import { Login } from './components/pages/Login'
import { Register } from './components/pages/Register'
import { NotFound } from './components/pages/NotFound'
import { TestRoom } from './components/pages/TestRoom'
import { Routes, Route } from 'react-router'


function App() 
{
  return (

    <div>
      
      <Routes>

        <Route path='/' element={<TestRoom/>} />
        <Route path='login' element={<Login/>} />
        <Route path='register' element={<Register/>} />
        <Route path='home' element={<Home/>} />
        <Route path='*' element={<NotFound/>} />

      </Routes>
    
    </div>

  )
}

export default App
