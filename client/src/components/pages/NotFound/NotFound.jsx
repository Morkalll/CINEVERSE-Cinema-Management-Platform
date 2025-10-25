
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
                Parece que no se pudo encontrar esta página...
            </h2>

            <Button className="text-center" onClick={goBackToHomeHandler}>
                Volver al inicio
            </Button>

            <Button className="text-center" onClick={goBackToLoginHandler}>
                Volver a iniciar sesión
            </Button>

        </div>
    )

}


