import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="hero-glass p-8 sm:p-10"
        >
          <p className="section-kicker">Welcome Back</p>
          <h1 className="section-title">Sign in to your hometown network</h1>
          <p className="mt-4 max-w-lg text-stone-600">
            Manage community events, track alerts, and coordinate your local groups from
            one premium dashboard.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="glass-tile p-4">
              <p className="text-sm font-semibold text-stone-700">Live Event Feed</p>
              <p className="mt-1 text-xs text-stone-500">See what is happening in real time.</p>
            </div>
            <div className="glass-tile p-4">
              <p className="text-sm font-semibold text-stone-700">Smart Notifications</p>
              <p className="mt-1 text-xs text-stone-500">Never miss important community updates.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="hero-glass p-8 sm:p-10"
        >
          <p className="section-kicker">Member Access</p>
          <h2 className="section-title">Login</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              name="email"
              type="email"
              value={form.email}
              placeholder="Email address"
              onChange={handleChange}
              required
              className="soft-input"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              placeholder="Password"
              onChange={handleChange}
              required
              className="soft-input"
            />

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="primary-btn w-full">
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-sm text-stone-600">
            New here?{" "}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Create an account
            </Link>
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}

export default Login;
