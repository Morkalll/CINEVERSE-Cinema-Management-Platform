
import { toast } from "react-toastify";


export const successToast = (message) => 
{
  toast.success(message, 
    {
        toastId: message,
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
    });
};

export const errorToast = (message) => 
{
    toast.error(message, 
    {
        toastId: message,
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
    });
};

export const confirmToast = (message) => 
{
    toast.info(message, 
    {
        position: "top-right",
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
    });
};