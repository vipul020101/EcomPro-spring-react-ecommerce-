import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../axios";

const categories = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        setProduct({
          name: response.data.name || "",
          brand: response.data.brand || "",
          description: response.data.description || "",
          price: response.data.price ?? "",
          category: response.data.category || "",
          releaseDate: response.data.releaseDate || "",
          stockQuantity: response.data.stockQuantity ?? 0,
          available: Boolean(response.data.available ?? response.data.productAvailable),
        });
      } catch (error) {
        setProduct(null);
      }
    };

    loadProduct();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setProduct((current) => {
      const nextValue = type === "checkbox" ? checked : value;

      // Keep the UI consistent: stock 0 => unavailable, stock > 0 => available.
      if (name === "stockQuantity") {
        const numeric = Number(nextValue || 0);
        return {
          ...current,
          stockQuantity: nextValue,
          available: numeric > 0,
        };
      }

      return {
        ...current,
        [name]: nextValue,
      };
    });
  };

  const buildBasePayload = () => ({
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: product.price,
    category: product.category,
    releaseDate: product.releaseDate,
    stockQuantity: Number(product.stockQuantity),
    available: Boolean(product.available),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!product) {
      return;
    }

    setSaving(true);

    try {
      const basePayload = buildBasePayload();

      if (image) {
        const formData = new FormData();
        Object.entries(basePayload).forEach(([key, value]) => formData.append(key, value));
        formData.append("imageFile", image);

        await API.put(`/product/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.put(`/product/${id}`, basePayload);
      }

      alert("Product updated successfully.");
      navigate(`/product/${id}`);
    } catch (error) {
      alert("Failed to update product. Please try another image or smaller file.");
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return <p className="state-message">Loading product details...</p>;
  }

  return (
    <section className="form-page">
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>Update Product</h2>

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
          <textarea name="description" rows={3} value={product.description} onChange={handleChange} required />
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
          Replace Product Image
          <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
        </label>

        <label className="checkbox-row">
          <input type="checkbox" name="available" checked={product.available} onChange={handleChange} />
          Available for sale
        </label>

        <button className="submit-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
};

export default UpdateProduct;