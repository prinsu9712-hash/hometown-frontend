import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API, { getApiErrorMessage } from "../api";
import Layout from "../components/Layout";

function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    hometown: "",
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
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Registration failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hero-glass p-8 sm:p-10"
        >
          <p className="section-kicker">Join Hometown Hub</p>
          <h1 className="section-title">Create your local identity</h1>
          <p className="mt-4 text-stone-600">
            Build your presence, join nearby communities, and unlock curated hometown
            experiences through one modern platform.
          </p>
          <div className="mt-8 space-y-3">
            <div className="glass-tile p-4">
              <p className="text-sm font-semibold text-stone-700">Community Discovery</p>
            </div>
            <div className="glass-tile p-4">
              <p className="text-sm font-semibold text-stone-700">Events + Notifications</p>
            </div>
            <div className="glass-tile p-4">
              <p className="text-sm font-semibold text-stone-700">Admin Moderation Tools</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="hero-glass p-8 sm:p-10"
        >
          <p className="section-kicker">Registration</p>
          <h2 className="section-title">Create account</h2>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
              className="soft-input sm:col-span-2"
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="soft-input sm:col-span-2"
            />
            <input
              name="password"
              type="password"
              placeholder="Password (6+ chars)"
              value={form.password}
              onChange={handleChange}
              required
              className="soft-input sm:col-span-2"
            />
            <input
              name="hometown"
              placeholder="Hometown"
              value={form.hometown}
              onChange={handleChange}
              className="soft-input sm:col-span-2"
            />

            {errorMessage && (
              <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="primary-btn sm:col-span-2">
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-5 text-sm text-stone-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Login
            </Link>
          </p>
        </motion.section>
      </div>
    </Layout>
  );
}

export default Register;
