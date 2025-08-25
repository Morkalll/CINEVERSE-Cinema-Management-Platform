
import './App.css'
import { Home } from './components/pages/Home'
import { Login } from './components/pages/Login'
import { NotFound } from './components/pages/NotFound'
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
