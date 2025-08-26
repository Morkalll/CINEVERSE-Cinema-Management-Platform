
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"


export const NotFound = () =>
{

    const navigate = useNavigate()


    const goBackToLoginHandler = () =>
    {
        navigate("/login")
    }

    const goBackToHomeHandler = () =>
    {
        navigate("/home")
    }



    return(

        <div className="text-center mt-3">

            <h2>
                Flaco qué hiciste?
            </h2>

            <Button className="text-center" onClick={goBackToHomeHandler}>
                Volver a la cartelera
            </Button>

            <Button className="text-center" onClick={goBackToLoginHandler}>
                Volver a iniciar sesión
            </Button>

        </div>
    )

}


