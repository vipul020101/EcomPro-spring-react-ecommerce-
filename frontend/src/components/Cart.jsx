import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { productImageUrl } from "../axios";
import AuthContext from "../Context/AuthContext";
import AppContext from "../Context/Context";
import CheckoutPopup from "./CheckoutPopup";

const emptyAddress = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: true,
};

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    cart,
    data,
    removeFromCart,
    incrementCartItem,
    decrementCartItem,
    clearCart,
    refreshData,
  } = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  const cartItems = useMemo(() => {
    const dataById = new Map(data.map((product) => [product.id, product]));
    return cart
      .map((item) => {
        const liveProduct = dataById.get(item.id);
        if (!liveProduct) {
          return null;
        }
        return {
          ...liveProduct,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);
  }, [cart, data]);

  const totalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0),
    [cartItems]
  );

  const loadAddresses = async () => {
    const response = await API.get("/me/addresses");
    const nextAddresses = response.data || [];
    setAddresses(nextAddresses);

    const fallback = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
    setSelectedAddressId(fallback ? fallback.id : null);
    setAddingAddress(nextAddresses.length === 0);
  };

  const openCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await loadAddresses();
      setShowModal(true);
    } catch (error) {
      alert("Unable to load saved addresses.");
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      await API.post("/orders", {
        addressId: selectedAddressId,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      await refreshData();
      setShowModal(false);
      navigate("/orders");
    } catch (error) {
      alert(error?.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const onToggleAddAddress = () => {
    setAddingAddress((current) => !current);
    setAddressForm(emptyAddress);
  };

  const onChangeAddressForm = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSaveAddress = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    try {
      await API.post("/me/addresses", addressForm);
      setAddressForm(emptyAddress);
      setAddingAddress(false);
      await loadAddresses();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <div className="cart-panel">
          <h2>Your cart is empty</h2>
          <Link className="secondary-btn" to="/">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-panel">
        <h2>Shopping Cart</h2>

        <ul className="cart-list">
          {cartItems.map((item) => (
            <li key={item.id} className="cart-item">
              <img
                src={productImageUrl(item.id)}
                alt={item.name}
                onError={(event) => {
                  event.currentTarget.src =
                    "https://dummyimage.com/300x300/e5e7eb/374151&text=No+Image";
                }}
              />

              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>{item.brand}</p>
                <p>${Number(item.price || 0).toFixed(2)}</p>
              </div>

              <div className="qty-controls">
                <button type="button" onClick={() => decrementCartItem(item.id)}>
                  <i className="bi bi-dash" />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => incrementCartItem(item.id, item.stockQuantity)}
                  disabled={item.quantity >= item.stockQuantity}
                >
                  <i className="bi bi-plus" />
                </button>
              </div>

              <div className="cart-item-actions">
                <p>${(Number(item.price || 0) * item.quantity).toFixed(2)}</p>
                <button type="button" className="danger-btn" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-footer">
          <h4>Total: ${totalPrice.toFixed(2)}</h4>
          <button className="submit-btn" type="button" onClick={openCheckout}>
            Proceed to Checkout
          </button>
          {!user && <p className="state-message">Login required to checkout.</p>}
        </div>
      </div>

      <CheckoutPopup
        show={showModal}
        processing={processing}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        addingAddress={addingAddress}
        onToggleAddAddress={onToggleAddAddress}
        addressForm={addressForm}
        onChangeAddressForm={onChangeAddressForm}
        onSaveAddress={onSaveAddress}
        savingAddress={savingAddress}
      />
    </section>
  );
};

export default Cart;