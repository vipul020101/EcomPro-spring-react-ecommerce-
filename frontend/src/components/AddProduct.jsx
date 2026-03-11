import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios";

const categories = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const defaultProduct = {
  name: "",
  brand: "",
  description: "",
  price: "",
  category: "",
  stockQuantity: "",
  releaseDate: "",
  available: true,
};

const AddProduct = () => {
  const [product, setProduct] = useState(defaultProduct);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProduct((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(product).forEach(([key, value]) => formData.append(key, value));
      if (image) {
        formData.append("imageFile", image);
      }

      await API.post("/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added successfully.");
      navigate("/");
    } catch (error) {
      alert("Unable to add product. Please check values and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="form-page">
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>Add Product</h2>

        <label>
          Name
          <input name="name" value={product.name} onChange={handleChange} required />
        </label>

        <label>
          Brand
          <input name="brand" value={product.brand} onChange={handleChange} required />
        </label>

        <label>
          Description
          <textarea name="description" value={product.description} onChange={handleChange} rows={3} required />
        </label>

        <div className="form-row">
          <label>
            Price
            <input type="number" step="0.01" min="0" name="price" value={product.price} onChange={handleChange} required />
          </label>

          <label>
            Stock
            <input type="number" min="0" name="stockQuantity" value={product.stockQuantity} onChange={handleChange} required />
          </label>
        </div>

        <div className="form-row">
          <label>
            Category
            <select name="category" value={product.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Release Date
            <input type="date" name="releaseDate" value={product.releaseDate} onChange={handleChange} required />
          </label>
        </div>

        <label>
          Product Image
          <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
        </label>

        <label className="checkbox-row">
          <input type="checkbox" name="available" checked={product.available} onChange={handleChange} />
          Available for sale
        </label>

        <button className="submit-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Create Product"}
        </button>
      </form>
    </section>
  );
};

export default AddProduct;
