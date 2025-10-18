import { useState } from "react";
import './CreateCandyForm.css'


export const CreateCandyForm = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/candy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Error al crear el producto");

      setMessage("Producto agregado con éxito");
      setForm({
        name: "",
        price: "",
        stock: "",
        image: "",
        description: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
    <h2>Agregar Candy</h2>
  <form onSubmit={handleSubmit} className="candy-form">
    
    <div className="form-group">
      <label>Nombre:</label>
      <input name="name" value={form.name} onChange={handleChange} required />
    </div>

    <div className="form-group">
      <label>Precio:</label>
      <input name="price" type="number" value={form.price} onChange={handleChange} required />
    </div>


    <div className="form-group">
      <label>Stock:</label>
      <input name="stock" type="number" value={form.stock} onChange={handleChange} required />
    </div>


    <div className="form-group">
      <label>Imagen (URL):</label>
      <input name="image" value={form.image} onChange={handleChange} required />
    </div>


    <div className="form-group">
      <label>Descripción:</label>
      <textarea name="description" value={form.description} onChange={handleChange} required />
    </div>

    <button type="submit">Agregar Candy</button>
  </form>
</div>
  );
};
