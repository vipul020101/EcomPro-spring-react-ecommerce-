import { Button, Form, Modal } from "react-bootstrap";

const CheckoutPopup = ({
  show,
  handleClose,
  cartItems,
  totalPrice,
  handleCheckout,
  processing,
  addresses,
  selectedAddressId,
  onSelectAddress,
  addingAddress,
  onToggleAddAddress,
  addressForm,
  onChangeAddressForm,
  onSaveAddress,
  savingAddress,
}) => {
  const canCheckout = Boolean(selectedAddressId) && cartItems.length > 0 && !processing;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Checkout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="checkout-block">
          <strong>Shipping address</strong>

          {addresses.length > 0 && (
            <Form.Select
              className="mt-2"
              value={selectedAddressId || ""}
              onChange={(event) => onSelectAddress(Number(event.target.value))}
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.isDefault ? "(Default) " : ""}{address.label} - {address.line1}, {address.city}
                </option>
              ))}
            </Form.Select>
          )}

          <div className="mt-2 d-flex gap-2 flex-wrap">
            <Button variant="outline-primary" size="sm" onClick={onToggleAddAddress}>
              {addingAddress ? "Cancel" : addresses.length ? "Add new address" : "Add address"}
            </Button>
          </div>

          {addingAddress && (
            <Form className="mt-3" onSubmit={onSaveAddress}>
              <Form.Group className="mb-2">
                <Form.Label>Label</Form.Label>
                <Form.Control name="label" value={addressForm.label} onChange={onChangeAddressForm} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Address line 1</Form.Label>
                <Form.Control name="line1" value={addressForm.line1} onChange={onChangeAddressForm} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Address line 2</Form.Label>
                <Form.Control name="line2" value={addressForm.line2} onChange={onChangeAddressForm} />
              </Form.Group>

              <div className="d-flex gap-2">
                <Form.Group className="mb-2 flex-fill">
                  <Form.Label>City</Form.Label>
                  <Form.Control name="city" value={addressForm.city} onChange={onChangeAddressForm} required />
                </Form.Group>
                <Form.Group className="mb-2 flex-fill">
                  <Form.Label>State</Form.Label>
                  <Form.Control name="state" value={addressForm.state} onChange={onChangeAddressForm} required />
                </Form.Group>
              </div>

              <div className="d-flex gap-2">
                <Form.Group className="mb-2 flex-fill">
                  <Form.Label>Postal code</Form.Label>
                  <Form.Control name="postalCode" value={addressForm.postalCode} onChange={onChangeAddressForm} required />
                </Form.Group>
                <Form.Group className="mb-2 flex-fill">
                  <Form.Label>Country</Form.Label>
                  <Form.Control name="country" value={addressForm.country} onChange={onChangeAddressForm} required />
                </Form.Group>
              </div>

              <Form.Group className="mb-2">
                <Form.Label>Phone</Form.Label>
                <Form.Control name="phone" value={addressForm.phone} onChange={onChangeAddressForm} />
              </Form.Group>

              <Form.Check
                className="mb-2"
                type="checkbox"
                id="makeDefault"
                name="isDefault"
                label="Make default"
                checked={Boolean(addressForm.isDefault)}
                onChange={onChangeAddressForm}
              />

              <Button type="submit" variant="primary" disabled={savingAddress}>
                {savingAddress ? "Saving..." : "Save address"}
              </Button>
            </Form>
          )}

          {!addingAddress && addresses.length === 0 && (
            <p className="state-message">Add a shipping address to continue.</p>
          )}
        </div>

        <hr />

        {cartItems.map((item) => (
          <div key={item.id} className="checkout-item">
            <span>
              {item.name} x {item.quantity}
            </span>
            <strong>${(Number(item.price || 0) * item.quantity).toFixed(2)}</strong>
          </div>
        ))}

        <hr />
        <div className="checkout-item">
          <span>Total</span>
          <strong>${totalPrice.toFixed(2)}</strong>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={processing || savingAddress}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCheckout} disabled={!canCheckout || savingAddress}>
          {processing ? "Processing..." : "Confirm Purchase"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutPopup;