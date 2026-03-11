import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { productImageUrl } from "../axios";
import StarRating from "./StarRating";
import AuthContext from "../Context/AuthContext";
import AppContext from "../Context/Context";

const sortOptions = [
  { value: "releaseDate,desc", label: "New arrivals" },
  { value: "price,asc", label: "Price: low to high" },
  { value: "price,desc", label: "Price: high to low" },
  { value: "rating,desc", label: "Rating" },
];

const clampNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const Home = ({ selectedCategory, searchKeyword }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(AppContext);

  const [wishlistIds, setWishlistIds] = useState(() => new Set());

  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState(sortOptions[0].value);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });

  // Reset paging when primary filters change.
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, searchKeyword, brand, minPrice, maxPrice, minRating, availableOnly, sort, size]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlistIds(new Set());
        return;
      }

      try {
        const response = await API.get("/wishlist");
        setWishlistIds(new Set((response.data || []).map((product) => product.id)));
      } catch (err) {
        setWishlistIds(new Set());
      }
    };

    loadWishlist();
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          size,
          sort,
          q: searchKeyword?.trim() || undefined,
          category: selectedCategory || undefined,
          brand: brand.trim() || undefined,
          minPrice: clampNumber(minPrice) ?? undefined,
          maxPrice: clampNumber(maxPrice) ?? undefined,
          minRating: clampNumber(minRating) ?? undefined,
          available: availableOnly ? true : undefined,
        };

        const response = await API.get("/products/paged", {
          params,
          signal: controller.signal,
        });

        setResult(response.data);
      } catch (err) {
        if (err?.name === "CanceledError") {
          return;
        }
        setError(err?.response?.data?.detail || err?.message || "Unable to load products.");
        setResult({ content: [], totalPages: 0, totalElements: 0, number: page });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [page, size, sort, searchKeyword, selectedCategory, brand, minPrice, maxPrice, minRating, availableOnly]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isSaved = wishlistIds.has(productId);
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
    } catch (err) {
      alert("Unable to update wishlist.");
    }
  };

  const products = result.content || [];

  const pagination = useMemo(() => {
    const totalPages = Number(result.totalPages || 0);
    const current = Number(result.number || 0);
    const totalElements = Number(result.totalElements || 0);
    const start = totalElements === 0 ? 0 : current * size + 1;
    const end = totalElements === 0 ? 0 : current * size + products.length;

    return {
      current,
      totalPages,
      totalElements,
      start,
      end,
      canPrev: current > 0,
      canNext: totalPages > 0 && current < totalPages - 1,
    };
  }, [result, products.length, size]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (brand.trim()) chips.push({ key: "brand", label: `Brand: ${brand.trim()}` });
    if (minPrice !== "" || maxPrice !== "") {
      const min = minPrice !== "" ? minPrice : "0";
      const max = maxPrice !== "" ? maxPrice : "Any";
      chips.push({ key: "price", label: `Price: ${min} - ${max}` });
    }
    if (minRating !== "") chips.push({ key: "minRating", label: `Min rating: ${minRating}` });
    if (availableOnly) chips.push({ key: "available", label: "Available only" });
    if (sort && sort !== sortOptions[0].value) {
      const option = sortOptions.find((o) => o.value === sort);
      chips.push({ key: "sort", label: `Sort: ${option?.label || sort}` });
    }
    return chips;
  }, [availableOnly, brand, maxPrice, minPrice, minRating, sort]);

  const resetFilters = () => {
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setAvailableOnly(false);
    setSort(sortOptions[0].value);
  };

  const removeChip = (key) => {
    if (key === "brand") setBrand("");
    if (key === "price") {
      setMinPrice("");
      setMaxPrice("");
    }
    if (key === "minRating") setMinRating("");
    if (key === "available") setAvailableOnly(false);
    if (key === "sort") setSort(sortOptions[0].value);
  };

  return (
    <section className="home-page">
      <header className="home-hero">
        <div>
          <h1 className="home-title">Shop smarter.</h1>
          <p className="home-subtitle">
            {searchKeyword?.trim() ? (
              <>
                Results for <b>"{searchKeyword.trim()}"</b>
              </>
            ) : (
              <>Browse products and use filters to narrow it down.</>
            )}
          </p>
        </div>
        <div className="home-meta">
          <span className="home-meta-pill">{selectedCategory || "All categories"}</span>
          <span className="home-meta-pill">{loading ? "Loading..." : `${pagination.totalElements} items`}</span>
        </div>
      </header>

      <div className="filters-bar">
        <div className="filters-row">
          <label className="filter-item">
            <span>Brand</span>
            <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Apple, Samsung..." />
          </label>

          <label className="filter-item">
            <span>Price range</span>
            <div className="filter-range">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Min"
              />
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Max"
              />
            </div>
          </label>

          <label className="filter-item">
            <span>Min rating</span>
            <input
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
              placeholder="0-5"
            />
          </label>

          <label className="filter-item">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-check">
            <input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} />
            <span>Available only</span>
          </label>

          <label className="filter-item">
            <span>Page size</span>
            <select value={size} onChange={(event) => setSize(Number(event.target.value))}>
              {[8, 12, 16, 24].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="filters-actions">
            <button type="button" className="secondary-btn" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        <div className="filters-meta">
          <span>
            {loading ? "Loading products" : `Showing ${pagination.start}-${pagination.end} of ${pagination.totalElements}`}
          </span>
          <span className="filters-context">
            Category: {selectedCategory || "All"} | Query: {searchKeyword?.trim() ? `"${searchKeyword.trim()}"` : "None"}
          </span>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="chip-row" aria-label="Active filters">
            {activeFilterChips.map((chip) => (
              <button key={chip.key} type="button" className="chip" onClick={() => removeChip(chip.key)}>
                <span>{chip.label}</span>
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pager">
        <button type="button" className="secondary-btn" disabled={!pagination.canPrev || loading} onClick={() => setPage(0)}>
          First
        </button>
        <button
          type="button"
          className="secondary-btn"
          disabled={!pagination.canPrev || loading}
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
        >
          Prev
        </button>
        <span className="pager-info">
          Page {pagination.totalPages === 0 ? 0 : pagination.current + 1} / {pagination.totalPages}
        </span>
        <button type="button" className="secondary-btn" disabled={!pagination.canNext || loading} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
        <button
          type="button"
          className="secondary-btn"
          disabled={!pagination.canNext || loading}
          onClick={() => setPage(Math.max(0, pagination.totalPages - 1))}
        >
          Last
        </button>
      </div>

      {error && !loading && <p className="state-message">{error}</p>}

      {loading && (
        <section className="products-grid" aria-label="Loading">
          {Array.from({ length: Math.min(size, 12) }, (_, idx) => (
            <article className="product-card skeleton" key={idx}>
              <div className="product-image-wrap" />
              <div className="product-content">
                <div className="sk sk-line" />
                <div className="sk sk-title" />
                <div className="sk sk-line" />
                <div className="sk sk-btn" />
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <h3>No matches</h3>
          <p>Try clearing filters or changing your search.</p>
          <button type="button" className="submit-btn" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <section className="products-grid">
          {products.map((product) => {
            const stock = Number(product.stockQuantity ?? 0);
            const isAvailableFlag = Boolean(product.available ?? product.productAvailable ?? true);
            const canBuy = stock > 0 && isAvailableFlag;
            const isSaved = wishlistIds.has(product.id);
            const cta = stock <= 0 ? "Out of Stock" : isAvailableFlag ? "Add to Cart" : "Unavailable";

            return (
              <article className="product-card" key={product.id}>
                <button
                  type="button"
                  className={isSaved ? "wish-btn saved" : "wish-btn"}
                  aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => toggleWishlist(product.id)}
                >
                  <i className={isSaved ? "bi bi-heart-fill" : "bi bi-heart"} />
                </button>

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
                  <div className="product-topline">
                    <p className="product-category">{product.category}</p>
                    <span className={stock > 0 ? "stock-pill in" : "stock-pill out"}>
                      {stock > 0 ? `${stock} in stock` : "Out"}
                    </span>
                  </div>

                  <h3>{product.name}</h3>

                  <div className="product-meta">
                    <span className="product-brand">{product.brand}</span>
                    <span className="product-rating">
                      <StarRating readOnly value={product.rating || 0} />
                      <small>{product.rating ? Number(product.rating).toFixed(1) : "No ratings"}</small>
                    </span>
                  </div>

                  <div className="product-bottom">
                    <p className="product-price">${Number(product.price || 0).toFixed(2)}</p>
                    <button type="button" className="add-btn" disabled={!canBuy} onClick={() => addToCart(product)}>
                      {cta}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </section>
  );
};

export default Home;