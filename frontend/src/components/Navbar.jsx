import { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../axios";
import AppContext from "../Context/Context";
import AuthContext from "../Context/AuthContext";

const categories = ["", "Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const Navbar = ({ onSelectCategory, onSearchKeyword }) => {
  const { cart } = useContext(AppContext);
  const { user, logout } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + (item.quantity || 0), 0),
    [cart]
  );

  const isAdmin = user?.role === "ADMIN";
  useLayoutEffect(() => {
    const syncTopbarHeight = () => {
      const el = document.querySelector(".topbar");
      if (!el) {
        return;
      }
      const height = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--topbar-h", `${height}px`);
    };

    syncTopbarHeight();
    const timer = setTimeout(syncTopbarHeight, 0);
    window.addEventListener("resize", syncTopbarHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", syncTopbarHeight);
    };
  }, [user, totalItems]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const keyword = query.trim();
      onSearchKeyword(keyword);
      if (!keyword) {
        setResults([]);
        return;
      }

      try {
        const response = await API.get("/products/paged", {
          params: {
            q: keyword,
            page: 0,
            size: 6,
            sort: "releaseDate,desc",
          },
        });

        setResults((response.data?.content || []).slice(0, 6));
      } catch (error) {
        setResults([]);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, onSearchKeyword]);

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    onSelectCategory(category);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery("");
    onSearchKeyword("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" to="/">
          EcomPro
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          {isAdmin && <Link to="/add_product">Add Product</Link>}
          {isAdmin && <Link to="/admin">Admin</Link>}
          {user && <Link to="/wishlist">Wishlist</Link>}
          {user && <Link to="/orders">Orders</Link>}
        </nav>

        <div className="toolbar">
          <select className="category-select" onChange={handleCategoryChange} defaultValue="">
            {categories.map((category) => (
              <option key={category || "all"} value={category}>
                {category || "All Categories"}
              </option>
            ))}
          </select>

          <div
            className="search-box"
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
          >
            <i className="bi bi-search" />
            <input
              type="search"
              placeholder="Search by name, description, brand, date..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {showResults && query && (
              <ul className="search-results">
                {results.length > 0 ? (
                  results.map((product) => (
                    <li key={product.id}>
                      <Link to={`/product/${product.id}`} onClick={handleResultClick}>
                        {product.name}
                        <small>{product.category}</small>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="empty-result">No matching products</li>
                )}
              </ul>
            )}
          </div>

          <button
            className="theme-btn"
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            <i className={`bi ${theme === "dark" ? "bi-moon-stars-fill" : "bi-brightness-high-fill"}`} />
          </button>

          <Link className="cart-link" to="/cart">
            <i className="bi bi-cart3" />
            <span>Cart</span>
            {totalItems > 0 && <b>{totalItems}</b>}
          </Link>

          {user ? (
            <>
              <Link className="profile-link" to="/profile" title="Profile">
                <i className="bi bi-person-circle" />
                <span>{user.name?.split(" ")?.[0] || "Profile"}</span>
              </Link>
              <button className="logout-btn" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="login-link" to="/login">
                Login
              </Link>
              <Link className="signup-link" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
