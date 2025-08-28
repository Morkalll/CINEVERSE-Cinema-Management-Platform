
import { useState } from "react"
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap"


export const Register = () =>
{

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [error, setError] = useState
    ({
        emailError: "",
        passwordError: "",
        confirmedPasswordError: ""
    })


    const handleEmailChange = (event) =>
    {
        const emailValue = event.target.value
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        setEmail(emailValue)

        if (!emailRegex.test(emailValue))
        {
            setError({...error, emailError: "Ingrese un email válido"})
        }

        else
        {
            setError({...error, emailError: ""})
        }

    }


    const handlePasswordChange = (event) =>
    {
        const passwordValue = event.target.value

        setPassword(passwordValue)

        if (passwordValue.trim().length < 8) 
        {
            setError({...error, passwordError: "La contraseña debe tener mínimo 8 caracteres"})
        }

        else 
        {
            setError({...error, passwordError: ""})
        }

    }


    const handleConfirmedPasswordChange = (event) =>
    {
        const confirmedPasswordValue = event.target.value

        setConfirmedPassword(confirmedPasswordValue)
        
        if (confirmedPasswordValue !== password) 
        {
            setError({...error, confirmedPasswordError: "Las contraseñas deben coincidir"})
        }

        else
        {
            setError({...error, confirmedPasswordError: ""})
        }

    }


    const handleSubmit = (event) =>
    {
        event.preventDefault()

        if (email.trim() !== ""
        && password.trim() !== ""
        && confirmedPassword.trim() !== ""
        && error.emailError === "" 
        && error.passwordError === "" 
        && error.confirmedPasswordError === "")
        {
            alert(`Registro completado. El email ingresado es: ${email} y la contraseña es ${password}`)
        }
    }

    

    return(

        <Card className="mt-5 mx-3 p-3 px-5 shadow">

            <Card.Body>


                
                <Row className="mb-2">
                    <h5>
                        Por favor, ingrese sus datos para el registro:
                    </h5>
                </Row>


                <Row>
                    
                    <Form onSubmit={handleSubmit} noValidate>


                        <FormGroup className="mb-4">
                            
                            <Form.Control 
                                placeholder="Ingresar email"
                                onChange={handleEmailChange}
                                value={email}
                            />

                            {error.emailError && 
                            (
                                <div className="text-danger">
                                    {error.emailError}
                                </div>
                            )}

                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control 
                                type="password" 
                                placeholder="Ingresar contraseña"
                                onChange={handlePasswordChange}
                                value={password}
                            />
                            
                            {error.passwordError && 
                            (
                                <div className="text-danger">
                                    {error.passwordError}
                                </div>
                            )}

                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control 
                                type="password" 
                                placeholder="Confirmar contraseña"
                                onChange={handleConfirmedPasswordChange}
                                value={confirmedPassword}
                            />
                            
                            {error.confirmedPasswordError && 
                            (
                                <div className="text-danger"> 

                                    {error.confirmedPasswordError} 

                                </div>
                            )}

                        </FormGroup>


                        <Row>

                            <Col/>

                            <Col md={6} className="d-flex-justify-content-end">

                                <Button variant="secondary" type="submit">
                                    Registrarse
                                </Button>

                            </Col>

                        </Row>


                    </Form>

                </Row>


            </Card.Body>

        </Card>

    )

}