
import { Router } from "express"


const router = Router()
 
/* GET */
router.get("/movielistings", (req, res) =>
{
    res.send("Obteniendo películas")
})

/* GET (ID) */
router.get("/movielistings/:id", (req, res) => 
{
    const { id } = req.params
    res.send(`Obteniendo película con ID: ${id}`)
})

/* POST */
router.post("/movielistings", (req, res) =>
{
    res.send("Creando película (fua era Tarantino)")
})

/* PUT */
router.put("/movielistings/:id", (req, res) => 
{
    const { id } = req.params
    res.send(`Actualizando película con ID: ${id}`)
})

/* DELETE */
router.delete("/movielistings/:id", (req, res) => 
{
    const { id } = req.params
    res.send(`Eliminando película con ID: ${id}`)
})


export default router

