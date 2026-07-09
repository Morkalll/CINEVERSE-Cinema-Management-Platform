
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"


export const TestRoom = () => {


    const navigate = useNavigate()


    const goToLoginHandler = () => {
        navigate("/login")
    }

    const goToRegisterHandler = () => {
        navigate("/register")
    }

    const goToRegisterAdminHandler = () => {
        navigate("/register-admin")
    }

    const goToRegisterSysAdminHandler = () =>{
        navigate("/register-sysadmin")
    }

    const goToHomeHandler = () => {
        navigate("/home")
    }

    const goToMovieListingsHandler = () => {
        navigate("/movielistings")
    }

    const goToProfileHandler = () => {
        navigate("/profile")
    }

    const goToCandyHandler = () => {
        navigate("/candy")
    }

    const goToNotFoundHandler = () => {
        navigate("/notfound")
    }

    const goToCheckoutHandler = () => {
        navigate("/checkout")
    }

    const goToSysAdminPanelHandler = () => {
    navigate("/sysadmin")
    }





    return (

        <div className="text-center mt-3">

            <h1>
                BORRAR CUANDO ACABE EL DEBUG
            </h1>

            <Button className="text-center" onClick={goToLoginHandler}>
                Login
            </Button>

            <Button className="text-center" onClick={goToRegisterHandler}>
                Register
            </Button>

            <Button className="text-center" onClick={goToRegisterAdminHandler}>
                Register Admin
            </Button>

            <Button className="text-center" onClick={goToSysAdminPanelHandler}>
                SysAdmin Panel
            </Button>

            <Button className="text-center" onClick={goToRegisterSysAdminHandler}>
                Register SysAdmin
            </Button>

            <Button className="text-center" onClick={goToHomeHandler}>
                Home
            </Button>

            <Button className="text-center" onClick={goToMovieListingsHandler}>
                Movie Listings
            </Button>

            <Button className="text-center" onClick={goToProfileHandler}>
                Profile
            </Button>

            <Button className="text-center" onClick={goToCandyHandler}>
                Candy
            </Button>

            <Button className="text-center" onClick={goToNotFoundHandler}>
                Not Found
            </Button>

            <Button className="text-center" onClick={goToCheckoutHandler}>
                Checkout
            </Button>


        </div>
    )
}