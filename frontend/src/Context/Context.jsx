import { createContext, useEffect, useMemo, useState } from "react";
import API from "../axios";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  incrementCartItem: () => {},
  decrementCartItem: () => {},
  clearCart: () => {},
  refreshData: async () => {},
});

const safeCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(safeCart);

  const refreshData = async () => {
    try {
      const response = await API.get("/products");
      setData(response.data);
      setIsError("");
    } catch (error) {
      setIsError(error.message || "Unable to fetch products.");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const incrementCartItem = (productId, maxStock) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        if (maxStock && item.quantity >= maxStock) {
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      })
    );
  };

  const decrementCartItem = (productId) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== Number(productId)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = useMemo(
    () => ({
      data,
      isError,
      cart,
      addToCart,
      removeFromCart,
      incrementCartItem,
      decrementCartItem,
      clearCart,
      refreshData,
    }),
    [data, isError, cart]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
