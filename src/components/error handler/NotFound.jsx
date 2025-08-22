
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"


export const NotFound = () =>
{
// _______________________________________________________________________________________________________________________________________
// FUNCIONES Y LÓGICA
// _______________________________________________________________________________________________________________________________________
    

    const navigate = useNavigate()

    const goBackToLoginHandler = () =>
    {
        navigate("/login")
    }


// _______________________________________________________________________________________________________________________________________
// RETURN EN NAVEGADOR
// _______________________________________________________________________________________________________________________________________


    return(
        <div className="text-center mt-3">

            <h2>
                Flaco qué hiciste?
            </h2>

            <Button className="text-center" onClick={goBackToLoginHandler}>
                Volver a iniciar sesión
            </Button>

        </div>
    )

}


