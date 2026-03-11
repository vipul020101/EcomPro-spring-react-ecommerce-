import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        {error && <p className="state-message">{error}</p>}

        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} minLength={8} required />
        </label>

        <label>
          Confirm password
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} minLength={8} required />
        </label>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="form-hint">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
};

export default Signup;