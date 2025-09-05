
import express from 'express'

import { PORT } from './config.js'
import { sequelize } from './db.js'

import "./models/Movie.js"

import movieRoutes from "./routes/movies.routes.js"


const app = express()

try
{
    app.listen(PORT)
    app.use(movieRoutes)

    await sequelize.sync()

    console.log(`Server listening on port ${PORT}`)
}

catch (error)
{
    console.log('There was an error on initialization')
}




