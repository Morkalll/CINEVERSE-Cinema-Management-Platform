import express from 'express'
import cors from 'cors' //Eto permite el paso de solicitudes desde otros orígenes
import { PORT } from './config.js'
import { sequelize } from './db.js'
import "./models/Movie.js"
import movieRoutes from "./routes/movies.routes.js"

const app = express()

async function main() {
  try {
    await sequelize.sync({ alter: true }) // Mejor sintaxis si esto esta antes del app.use
    app.use(express.json());// Para que lea los cuerpos JSON
    app.use(cors()); //Middleware
    app.use('/api', movieRoutes)
    app.listen(PORT)
    console.log(`Server listening on port ${PORT}`)
  } catch (error) {
    console.log('There was an error on initialization', error)
  }
}

main();




