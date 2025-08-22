
import './App.css'
import { Login } from './components/login/Login'
import { NotFound } from './components/error handler/NotFound'
import { Routes, Route } from 'react-router'


function App() 
{
  return (

    <div>
      
      <Routes>

        <Route path='login' element={<Login/>} />
        <Route path='*' element={<NotFound/>} />

      </Routes>
    
    </div>

  )
}

export default App
