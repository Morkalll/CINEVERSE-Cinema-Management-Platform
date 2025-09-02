
import express from 'express'

import { PORT } from './config.js'
import movieRoutes from "./routes/movies.routes.js"
 

const app = express()


app.listen(PORT)

app.use(movieRoutes)

console.log(`Server listening on port ${PORT}`)


