import { useContext, useEffect, useMemo, useState } from "react";
import API from "../axios";
import AuthContext from "../Context/AuthContext";

const emptyAddress = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: false,
};

const Profile = () => {
  const { user, refreshProfile, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [error, setError] = useState("");
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const loadAll = async () => {
    try {
      const [meResponse, addressResponse] = await Promise.all([API.get("/me"), API.get("/me/addresses")]);
      setProfile(meResponse.data);
      setAddresses(addressResponse.data);
      setError("");
      await refreshProfile();
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
      }
      setError(err?.response?.data?.message || "Unable to load profile.");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultAddress = useMemo(() => addresses.find((address) => address.isDefault), [addresses]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    try {
      const response = await API.put("/me", {
        name: profile.name,
        phone: profile.phone || null,
      });
      setProfile(response.data);
      setError("");
      await refreshProfile();
      alert("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const beginEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setAddressSaving(true);
    try {
      if (editingAddressId) {
        await API.put(`/me/addresses/${editingAddressId}`, addressForm);
      } else {
        await API.post("/me/addresses", addressForm);
      }
      resetAddressForm();
      await loadAll();
      alert("Address saved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm("Delete this address?")) {
      return;
    }

    try {
      await API.delete(`/me/addresses/${id}`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete address.");
    }
  };

  const setDefault = async (id) => {
    try {
      await API.post(`/me/addresses/${id}/default`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to set default address.");
    }
  };

  if (!user) {
    return <p className="state-message">You are not logged in.</p>;
  }

  if (!profile) {
    return <p className="state-message">Loading profile...</p>;
  }

  return (
    <section className="profile-page">
      <div className="profile-grid">
        <div className="profile-card">
          <h2>Profile</h2>
          {error && <p className="state-message">{error}</p>}

          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              Name
              <input name="name" value={profile.name || ""} onChange={handleProfileChange} required />
            </label>

            <label>
              Email
              <input value={profile.email || ""} disabled />
            </label>

            <label>
              Phone
              <input name="phone" value={profile.phone || ""} onChange={handleProfileChange} placeholder="Optional" />
            </label>

            <label>
              Default address
              <textarea
                value={
                  defaultAddress
                    ? `${defaultAddress.line1}${defaultAddress.line2 ? `, ${defaultAddress.line2}` : ""}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postalCode}, ${defaultAddress.country}`
                    : "No saved address yet"
                }
                disabled
                rows={3}
              />
            </label>

            <button className="submit-btn" type="submit" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Update profile"}
            </button>
          </form>
        </div>

        <div className="profile-card">
          <h2>Saved addresses</h2>

          {addresses.length === 0 ? (
            <p className="state-message">No saved addresses yet.</p>
          ) : (
            <ul className="address-list">
              {addresses.map((address) => (
                <li key={address.id} className="address-item">
                  <div className="address-body">
                    <strong>
                      {address.label} {address.isDefault ? "(Default)" : ""}
                    </strong>
                    <p>
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                    </p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && <p>{address.phone}</p>}
                  </div>

                  <div className="address-actions">
                    {!address.isDefault && (
                      <button type="button" className="secondary-btn" onClick={() => setDefault(address.id)}>
                        Set default
                      </button>
                    )}
                    <button type="button" className="secondary-btn" onClick={() => beginEditAddress(address)}>
                      Edit
                    </button>
                    <button type="button" className="danger-btn" onClick={() => deleteAddress(address.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="divider" />

          <h3>{editingAddressId ? "Edit address" : "Add address"}</h3>
          <form className="profile-form" onSubmit={saveAddress}>
            <label>
              Label
              <input name="label" value={addressForm.label} onChange={handleAddressChange} required />
            </label>
            <label>
              Address line 1
              <input name="line1" value={addressForm.line1} onChange={handleAddressChange} required />
            </label>
            <label>
              Address line 2
              <input name="line2" value={addressForm.line2} onChange={handleAddressChange} placeholder="Optional" />
            </label>

            <div className="form-row">
              <label>
                City
                <input name="city" value={addressForm.city} onChange={handleAddressChange} required />
              </label>
              <label>
                State
                <input name="state" value={addressForm.state} onChange={handleAddressChange} required />
              </label>
            </div>

            <div className="form-row">
              <label>
                Postal code
                <input name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} required />
              </label>
              <label>
                Country
                <input name="country" value={addressForm.country} onChange={handleAddressChange} required />
              </label>
            </div>

            <label>
              Phone
              <input name="phone" value={addressForm.phone} onChange={handleAddressChange} placeholder="Optional" />
            </label>

            <label className="checkbox-row">
              <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressChange} />
              Make default
            </label>

            <div className="form-row">
              <button className="submit-btn" type="submit" disabled={addressSaving}>
                {addressSaving ? "Saving..." : "Save address"}
              </button>
              {(editingAddressId || Object.values(addressForm).some((value) => value)) && (
                <button type="button" className="secondary-btn" onClick={resetAddressForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Profile;