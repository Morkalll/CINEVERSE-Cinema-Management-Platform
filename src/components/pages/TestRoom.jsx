
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"


export const TestRoom = () =>
{


    const navigate = useNavigate()


    const goToLoginHandler = () =>
    {
        navigate("/login")
    }

    const goToRegisterHandler = () =>
    {
        navigate("/register")
    }

    const goToHomeHandler = () =>
    {
        navigate("/home")
    }

    const goToNotFoundHandler = () =>
    {
        navigate("/notfound")
    }


    //AGREGAR MÁS PÁGINAS A MEDIDA QUE SE CREEN


    return(

        <div className="text-center mt-3">

            <h2>
                ELIGE LA PÁGINA A LA QUE QUIERAS ACCEDER:
            </h2>

            <Button className="text-center" onClick={goToHomeHandler}>
                Home
            </Button>

            <Button className="text-center" onClick={goToLoginHandler}>
                Login
            </Button>

            <Button className="text-center" onClick={goToRegisterHandler}>
                Register
            </Button>

            <Button className="text-center" onClick={goToNotFoundHandler}>
                NotFound
            </Button>

        </div>
    )
}