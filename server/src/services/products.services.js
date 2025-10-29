import { Products } from "../models/Products.js";


export const findAllProducts = async (req, res) => 
{
  try 
  {
    const items = await Products.findAll();
    return res.json(items);
  } 
  
  catch (error) 
  {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }

};


export const findOneProduct = async (req, res) => 
{
  try 
  {
    const { id } = req.params;
    const oneProduct = await Products.findOne({ where: { id } });

    if (!oneProduct) 
    {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json(oneProduct);

  } 
  
  catch (error) 
  {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }

};


export const createProduct = async (req, res) => 
{
  try 
  {
    const { name, price, stock, image, description } = req.body;

    if (!name || price == null) 
    {
      return res.status(400).json({ message: "Campos requeridos" });
    }

    
    const newProduct = await Products.create(
    {
      name,
      price,
      stock,
      image,
      description,
    });

    return res.status(201).json(newProduct);

  } 
  
  catch (error) 
  {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }

};


export const updateProduct = async (req, res) => 
{
  try 
  {
    const { id } = req.params;
    const { name, price, stock, image, description } = req.body;

    const productToUpdate = await Products.findByPk(id);
    if (!productToUpdate) return res.status(404).json({ message: "Producto no encontrado" });

    await productToUpdate.update({ name, price, stock, image, description });
    await productToUpdate.save();

    return res.json(productToUpdate);

  } 
  
  catch (error) 
  {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }

};


export const deleteProduct = async (req, res) => 
{
  try 
  {
    const { id } = req.params;
    const productToDelete = await Products.findByPk(id);

    if (!productToDelete) return res.status(404).json({ message: "Producto no encontrado" });

    await productToDelete.destroy();

    // FIXED: Return JSON instead of plain text
    return res.status(200).json({ message: `Producto con id: ${id} eliminado correctamente` });

  } 
  
  catch (error) 
  {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: error.message || "Error interno" });
  }

};