
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"


export const TestRoom = () =>
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

    const goBackToNotFoundHandler = () =>
    {
        navigate("/notfound")
    }

    //AGREGAR MÁS PÁGINAS A MEDIDA QUE SE CREEN


    return(

        <div className="text-center mt-3">

            <h2>
                ELIGE LA PÁGINA A LA QUE QUIERAS ACCEDER:
            </h2>

            <Button className="text-center" onClick={goBackToHomeHandler}>
                Home
            </Button>

            <Button className="text-center" onClick={goBackToLoginHandler}>
                Login
            </Button>

            <Button className="text-center" onClick={goBackToNotFoundHandler}>
                NotFound
            </Button>

        </div>
    )
}