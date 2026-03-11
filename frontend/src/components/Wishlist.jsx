import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { productImageUrl } from "../axios";
import AuthContext from "../Context/AuthContext";

const Wishlist = () => {
  const { logout } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await API.get("/wishlist");
      setItems(response.data || []);
      setError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
      }
      setError(err?.response?.data?.message || "Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setItems((current) => current.filter((product) => product.id !== productId));
    } catch (err) {
      alert("Unable to remove item.");
    }
  };

  if (loading) {
    return <p className="state-message">Loading wishlist...</p>;
  }

  if (error) {
    return <p className="state-message">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="state-message">Your wishlist is empty.</p>;
  }

  return (
    <section className="products-grid">
      {items.map((product) => (
        <article className="product-card" key={product.id}>
          <Link to={`/product/${product.id}`} className="product-image-wrap">
            <img
              src={productImageUrl(product.id)}
              alt={product.name}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = "https://dummyimage.com/640x400/e5e7eb/374151&text=No+Image";
              }}
            />
          </Link>

          <div className="product-content">
            <p className="product-category">{product.category}</p>
            <h3>{product.name}</h3>
            <p className="product-meta">{product.brand}</p>
            <p className="product-price">${Number(product.price || 0).toFixed(2)}</p>
            <button type="button" className="danger-btn" onClick={() => remove(product.id)}>
              Remove
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

export default Wishlist;