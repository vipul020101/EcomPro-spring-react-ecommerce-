import "./App.css";
import { useContext, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./Context/Context";
import AuthContext, { AuthProvider } from "./Context/AuthContext";
import AddProduct from "./components/AddProduct";
import Admin from "./components/Admin";
import Cart from "./components/Cart";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Orders from "./components/Orders";
import Product from "./components/Product";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import UpdateProduct from "./components/UpdateProduct";
import Wishlist from "./components/Wishlist";

const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireAdmin = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const filters = useMemo(
    () => ({
      selectedCategory,
      searchKeyword,
    }),
    [selectedCategory, searchKeyword]
  );

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Navbar onSelectCategory={setSelectedCategory} onSearchKeyword={setSearchKeyword} />
          <main className="app-shell">
            <Routes>
              <Route
                path="/"
                element={<Home selectedCategory={filters.selectedCategory} searchKeyword={filters.searchKeyword} />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <RequireAuth>
                    <Wishlist />
                  </RequireAuth>
                }
              />
              <Route
                path="/orders"
                element={
                  <RequireAuth>
                    <Orders />
                  </RequireAuth>
                }
              />
                            <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />
              <Route path="/add_product"
                element={
                  <RequireAdmin>
                    <AddProduct />
                  </RequireAdmin>
                }
              />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/product/update/:id"
                element={
                  <RequireAdmin>
                    <UpdateProduct />
                  </RequireAdmin>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;