import { useState } from "react";
import { toast } from "react-toastify";
import './CreateCandyForm.css'

export const CreateCandyForm = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const [error, setError] = useState({
    nameError: "",
    priceError: "",
    stockError: "",
    descriptionError: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    price: false,
    stock: false,
    description: false
  });

  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, name: value });
    if (touched.name) {
      setError({ ...error, nameError: value.trim() === "" ? "El nombre es requerido" : "" });
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, price: value });
    if (touched.price) {
      const numValue = parseFloat(value);
      setError({ ...error, priceError: value === "" ? "El precio es requerido" : (numValue <= 0 ? "El precio debe ser mayor a 0" : "") });
    }
  };

  const handleStockChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, stock: value });
    if (touched.stock) {
      const numValue = parseFloat(value);
      setError({ ...error, stockError: value === "" ? "El stock es requerido" : (numValue < 0 ? "El stock no puede ser negativo" : "") });
    }
  };

  const handleImageChange = (e) => {
    setForm({ ...form, image: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, description: value });
    if (touched.description) {
      setError({ ...error, descriptionError: value.trim() === "" ? "La descripción es requerida" : "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      price: true,
      stock: true,
      description: true
    });

    const nameError = form.name.trim() === "" ? "El nombre es requerido" : "";
    const numPrice = parseFloat(form.price);
    const priceError = form.price === "" ? "El precio es requerido" : (numPrice <= 0 ? "El precio debe ser mayor a 0" : "");
    const numStock = parseFloat(form.stock);
    const stockError = form.stock === "" ? "El stock es requerido" : (numStock < 0 ? "El stock no puede ser negativo" : "");
    const descriptionError = form.description.trim() === "" ? "La descripción es requerida" : "";

    setError({ nameError, priceError, stockError, descriptionError });

    if (!nameError && !priceError && !stockError && !descriptionError) {
      try {
        const response = await fetch("http://localhost:3000/api/candy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(form),
        });

        if (!response.ok) throw new Error("Error al crear el producto");

        toast.success("Producto agregado con éxito!");
        setForm({
          name: "",
          price: "",
          stock: "",
          image: "",
          description: "",
        });
        setTouched({
          name: false,
          price: false,
          stock: false,
          description: false
        });
      } catch (error) {
        toast.error("Error al crear el producto");
      }
    }
  };

  return (
    <div>
      <h2>Agregar Candy</h2>
      <form onSubmit={handleSubmit} className="candy-form" noValidate>
        
        <div className="form-group">
          <label>Nombre:</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleNameChange}
            onBlur={() => {
              setTouched({ ...touched, name: true });
              setError({ ...error, nameError: form.name.trim() === "" ? "El nombre es requerido" : "" });
            }}
          />
          {touched.name && error.nameError && (
            <div className="text-danger">{error.nameError}</div>
          )}
        </div>

        <div className="form-group">
          <label>Precio:</label>
          <input 
            name="price" 
            type="number" 
            step="0.01"
            value={form.price} 
            onChange={handlePriceChange}
            onBlur={() => {
              setTouched({ ...touched, price: true });
              const numValue = parseFloat(form.price);
              setError({ ...error, priceError: form.price === "" ? "El precio es requerido" : (numValue <= 0 ? "El precio debe ser mayor a 0" : "") });
            }}
          />
          {touched.price && error.priceError && (
            <div className="text-danger">{error.priceError}</div>
          )}
        </div>

        <div className="form-group">
          <label>Stock:</label>
          <input 
            name="stock" 
            type="number" 
            value={form.stock} 
            onChange={handleStockChange}
            onBlur={() => {
              setTouched({ ...touched, stock: true });
              const numValue = parseFloat(form.stock);
              setError({ ...error, stockError: form.stock === "" ? "El stock es requerido" : (numValue < 0 ? "El stock no puede ser negativo" : "") });
            }}
          />
          {touched.stock && error.stockError && (
            <div className="text-danger">{error.stockError}</div>
          )}
        </div>

        <div className="form-group">
          <label>Imagen (URL) - Opcional:</label>
          <input 
            name="image" 
            value={form.image} 
            onChange={handleImageChange}
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleDescriptionChange}
            onBlur={() => {
              setTouched({ ...touched, description: true });
              setError({ ...error, descriptionError: form.description.trim() === "" ? "La descripción es requerida" : "" });
            }}
          />
          {touched.description && error.descriptionError && (
            <div className="text-danger">{error.descriptionError}</div>
          )}
        </div>

        <button type="submit">Agregar Candy</button>
      </form>
    </div>
  );
};