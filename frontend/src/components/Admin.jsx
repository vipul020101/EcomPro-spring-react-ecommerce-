import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API, { productImageUrl } from "../axios";

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [savingIds, setSavingIds] = useState(() => new Set());

  const load = async () => {
    setLoading(true);
    try {
      const response = await API.get("/products");
      setProducts(response.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const target = [
        product.name,
        product.brand,
        product.category,
        product.description,
        product.releaseDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return target.includes(keyword);
    });
  }, [products, query]);

  const updateLocal = (id, patch) => {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, ...patch } : product))
    );
  };

  const saveRow = async (product) => {
    setSavingIds((current) => {
      const next = new Set(current);
      next.add(product.id);
      return next;
    });

    try {
      const stockQuantity = Number(product.stockQuantity || 0);
      const available = Boolean(product.available ?? product.productAvailable ?? stockQuantity > 0);

            await API.put(`/product/${product.id}`, {
        name: product.name,
        brand: product.brand,
        description: product.description ?? product.desc ?? "",
        price: product.price,
        category: product.category,
        releaseDate: product.releaseDate,
        stockQuantity,
        available,
      });

      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to update product.");
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  };

  if (loading) {
    return <p className="state-message">Loading admin dashboard...</p>;
  }

  if (error) {
    return <p className="state-message">{error}</p>;
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <h2>Admin</h2>
          <p className="state-message">Update stock and availability directly from this page.</p>
        </div>
        <div className="admin-actions">
          <input
            className="admin-search"
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Link className="submit-btn" to="/add_product">
            Add product
          </Link>
          <button type="button" className="secondary-btn" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="state-message">No products match that search.</p>
      ) : (
        <div className="admin-grid">
          {filtered.map((product) => {
            const stockQuantity = Number(product.stockQuantity ?? 0);
            const available = Boolean(product.available ?? product.productAvailable ?? stockQuantity > 0);
            const saving = savingIds.has(product.id);

            return (
              <article key={product.id} className="admin-card">
                <div className="admin-card-head">
                  <img
                    className="admin-thumb"
                    src={productImageUrl(product.id)}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://dummyimage.com/80x80/e5e7eb/374151&text=No+Image";
                    }}
                  />
                  <div className="admin-card-title">
                    <strong>{product.name}</strong>
                    <div className="admin-sub">{product.brand}</div>
                    <div className="admin-sub">{product.category} | ID: {product.id}</div>
                  </div>
                  <div className="admin-card-price">${Number(product.price || 0).toFixed(2)}</div>
                </div>

                <div className="admin-card-body">
                  <label className="admin-field">
                    <span>Stock</span>
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      value={product.stockQuantity ?? 0}
                      onChange={(event) =>
                        updateLocal(product.id, {
                          stockQuantity: event.target.value,
                          available: Number(event.target.value || 0) > 0,
                        })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveRow(product);
                        }
                      }}
                    />
                  </label>

                  <label className="admin-field admin-toggle">
                    <span>Available</span>
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(event) => updateLocal(product.id, { available: event.target.checked })}
                    />
                  </label>

                  <div className="admin-card-actions">
                    <Link className="secondary-btn" to={`/product/${product.id}`}>
                      View
                    </Link>
                    <Link className="secondary-btn" to={`/product/update/${product.id}`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="submit-btn"
                      disabled={saving}
                      onClick={() => saveRow(product)}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Admin;