import express from 'express'
import { PORT } from './config.js'
import { sequelize } from './db.js'
import "./models/Movie.js"
import movieRoutes from "./routes/movies.routes.js"

const app = express()

async function main() {
  try {
    await sequelize.sync({ alter: true }) // Mejor sintaxis si esto esta antes del app.use
    app.use(movieRoutes)
    app.listen(PORT)
    console.log(`Server listening on port ${PORT}`)
  } catch (error) {
    console.log('There was an error on initialization', error)
  }
}

main();




