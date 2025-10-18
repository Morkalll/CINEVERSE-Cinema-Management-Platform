import { useState } from "react";

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
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Precio:</label>
        <input name="price" type="number" value={form.price} onChange={handleChange} required />

        <label>Stock:</label>
        <input name="stock" type="number" value={form.stock} onChange={handleChange} required />

        <label>Imagen (URL):</label>
        <input name="image" value={form.image} onChange={handleChange} required />

        <label>Descripción:</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />

        <button type="submit">Agregar Candy</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};
