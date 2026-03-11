import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API, { productImageUrl } from "../axios";
import AuthContext from "../Context/AuthContext";
import AppContext from "../Context/Context";
import StarRating from "./StarRating";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(() => new Set());

  const [ratingSummary, setRatingSummary] = useState({ average: null, count: 0, myRating: null });
  const [ratingSaving, setRatingSaving] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/product/${id}`);
        setProduct(response.data);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlistIds(new Set());
        return;
      }

      try {
        const response = await API.get("/wishlist");
        setWishlistIds(new Set((response.data || []).map((item) => item.id)));
      } catch (error) {
        setWishlistIds(new Set());
      }
    };

    loadWishlist();
  }, [user]);

  useEffect(() => {
    const loadRatingSummary = async () => {
      try {
        const response = await API.get(`/products/${id}/rating`);
        setRatingSummary(response.data);
      } catch (error) {
        setRatingSummary({ average: null, count: 0, myRating: null });
      }
    };

    loadRatingSummary();
  }, [id, user]);

  const isSaved = useMemo(() => wishlistIds.has(Number(id)), [wishlistIds, id]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const productId = Number(id);
    try {
      if (isSaved) {
        await API.delete(`/wishlist/${productId}`);
      } else {
        await API.post(`/wishlist/${productId}`);
      }

      setWishlistIds((current) => {
        const next = new Set(current);
        if (isSaved) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });
    } catch (error) {
      alert("Unable to update wishlist.");
    }
  };

  const submitRating = async (nextRating) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setRatingSaving(true);
    try {
      const response = await API.post(`/products/${id}/rating`, { rating: nextRating });
      setRatingSummary(response.data);
      setProduct((current) => (current ? { ...current, rating: response.data.average } : current));
    } catch (error) {
      alert("Unable to save rating.");
    } finally {
      setRatingSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirm("Delete this product?")) {
      return;
    }

    try {
      await API.delete(`/product/${id}`);
      removeFromCart(Number(id));
      await refreshData();
      navigate("/");
    } catch (error) {
      alert("Unable to delete product.");
    }
  };

  if (loading) {
    return <p className="state-message">Loading product details...</p>;
  }

  if (!product) {
    return <p className="state-message">Product not found.</p>;
  }

  const stock = Number(product.stockQuantity ?? 0);
  const isAvailableFlag = Boolean(product.available ?? product.productAvailable ?? true);
  const canBuy = stock > 0 && isAvailableFlag;
  const cta = stock <= 0 ? "Out of Stock" : isAvailableFlag ? "Add to Cart" : "Unavailable";

  return (
    <section className="detail-page">
      <div className="detail-media">
        <img
          className="detail-image"
          src={productImageUrl(id)}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = "https://dummyimage.com/800x600/e5e7eb/374151&text=No+Image";
          }}
        />
        <button type="button" className={isSaved ? "wish-btn saved" : "wish-btn"} onClick={toggleWishlist}>
          <i className={isSaved ? "bi bi-heart-fill" : "bi bi-heart"} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>

      <div className="detail-content">
        <p className="product-category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-meta">{product.brand}</p>

        <div className="detail-rating">
          <div className="detail-rating-row">
            <StarRating readOnly value={ratingSummary.average || 0} />
            <span className="detail-rating-meta">
              {ratingSummary.average ? Number(ratingSummary.average).toFixed(1) : "No ratings"}
              {` (${Number(ratingSummary.count || 0)} reviews)`}
            </span>
          </div>

          {user && !isAdmin && (
            <div className="detail-rating-row">
              <span className="detail-rating-label">Your rating</span>
              <StarRating
                value={ratingSummary.myRating || 0}
                onChange={(val) => !ratingSaving && submitRating(val)}
                className={ratingSaving ? "saving" : ""}
              />
              <span className="detail-rating-meta">
                {ratingSaving
                  ? "Saving..."
                  : ratingSummary.myRating
                    ? `${ratingSummary.myRating}/5`
                    : "Tap a star"}
              </span>
            </div>
          )}
        </div>

        <p>{product.description}</p>

        <p className="detail-price">${Number(product.price || 0).toFixed(2)}</p>
        <p>Stock: {product.stockQuantity}</p>
        <p>Release Date: {product.releaseDate}</p>

        <div className="detail-actions">
          <button className="add-btn" type="button" disabled={!canBuy} onClick={() => addToCart(product)}>
            {cta}
          </button>

          {isAdmin ? (
            <>
              <Link className="secondary-btn" to={`/product/update/${id}`}>
                Update
              </Link>
              <button className="danger-btn" type="button" onClick={deleteProduct}>
                Delete
              </button>
            </>
          ) : (
            <Link className="secondary-btn" to="/">
              Back
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Product;