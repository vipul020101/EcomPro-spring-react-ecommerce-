import { useContext, useEffect, useState } from "react";
import API from "../axios";
import AuthContext from "../Context/AuthContext";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
};

const Orders = () => {
  const { logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await API.get("/orders");
      setOrders(response.data || []);
      setError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
      }
      setError(err?.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <p className="state-message">Loading orders...</p>;
  }

  if (error) {
    return <p className="state-message">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="state-message">No orders yet.</p>;
  }

  return (
    <section className="orders-page">
      <div className="orders-panel">
        <h2>Order history</h2>
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id} className="order-card">
              <div className="order-head">
                <div>
                  <strong>Order #{order.id}</strong>
                  <p className="order-meta">Placed: {formatDate(order.createdAt)}</p>
                  <p className="order-meta">Status: {order.status}</p>
                </div>
                <div className="order-total">${Number(order.total || 0).toFixed(2)}</div>
              </div>

              <div className="order-shipping">
                <strong>Shipping</strong>
                <p>
                  {order.shipping.label}: {order.shipping.line1}
                  {order.shipping.line2 ? `, ${order.shipping.line2}` : ""}
                </p>
                <p>
                  {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}, {order.shipping.country}
                </p>
                {order.shipping.phone && <p>{order.shipping.phone}</p>}
              </div>

              <div className="order-items">
                <strong>Items</strong>
                <ul className="order-items-list">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.productId}`}>
                      {item.productName} x{item.quantity} (${Number(item.unitPrice || 0).toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Orders;