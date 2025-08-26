
import { useState } from "react"
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap"


export const Register = () =>
{

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [error, setError] = useState("")


    const handleEmailChange = (event) =>
    {
        const emailValue = event.target.value

        setEmail(emailValue)
    }


    const handlePasswordChange = (event) =>
    {
        const passwordValue = event.target.value

        setPassword(passwordValue)
    }


    const handleConfirmedPasswordChange = (event) =>
    {
        const confirmedPasswordValue = event.target.value

        setConfirmedPassword(confirmedPasswordValue)
        
        /*if (confirmedPasswordValue !== password) 
        {
            setError("Las contraseñas deben coincidir")
        }

        else
        {
            error.password = ""
        }*/

    }


    const handleSubmit = (event) =>
    {
        event.preventDefault()
        alert(`Registro completado. El email ingresado es: ${email} y la contraseña es ${password}`)
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
                    
                    <Form onSubmit={handleSubmit}>


                        <FormGroup className="mb-4">
                            
                            <Form.Control 
                                type="email" 
                                required 
                                placeholder="Ingresar email"
                                onChange={handleEmailChange}
                                value={email}
                            />

                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control 
                                type="password" 
                                required 
                                placeholder="Ingresar contraseña"
                                onChange={handlePasswordChange}
                                value={password}
                            />
                            
                        </FormGroup>


                        <FormGroup className="mb-4">

                            <Form.Control 
                                type="password" 
                                required 
                                placeholder="Confirmar contraseña"
                                onChange={handleConfirmedPasswordChange}
                                value={confirmedPassword}
                            />
                            
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