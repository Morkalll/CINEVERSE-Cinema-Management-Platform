
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"


export async function apiRequest(endpoint, method = "GET", data = null, token = null)
{
    const options =
    {
        method,
        headers: 
        {
            "Content-Type": "application/json"
        }
    }


    if (data) 
    {
        options.body = JSON.stringify(data)
    }   
           
    if (token) 
    {
        options.headers.Authorization = `Bearer ${token}`
    }

    
    const response = await fetch(`${API_URL}${endpoint}`, options)


    if (!response.ok)
    {
        if (response.status === 401 || response.status === 403) {
            window.dispatchEvent(new Event("auth:expired"));
        }
        const error = await response.json().catch(() => ({ message: `Error ${response.status}` }))
        throw new Error(error.message || "Error en la solicitud")
    }


    return response.json()
    
}



