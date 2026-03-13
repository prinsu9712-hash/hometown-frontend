import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const cards = [
    {
      title: "Communities",
      desc: "Create, join, and manage city or village communities.",
      to: "/communities",
      badge: "Explore",
    },
    {
      title: "Notifications",
      desc: "Track announcements, event alerts, and moderation updates.",
      to: "/notifications",
      badge: "Inbox",
    },
    {
      title: "Admin",
      desc: "Moderate events, users, and platform activities.",
      to: "/admin",
      badge: "Control",
    },
    {
      title: "Onboarding",
      desc: "Submit and track community or pandit onboarding requests.",
      to: "/onboarding",
      badge: "Submit",
    },
  ];
  const visibleCards = cards.filter((card) => card.title !== "Admin" || user?.role === "ADMIN");

  return (
    <Layout>
      <section className="hero-glass p-8 sm:p-10">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#8d5a34] via-[#b78656] to-[#e39d58] p-6 text-white shadow-glass">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
            Hometown Hub
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Digital community platform for local connection
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/90">
            Reconnect with your hometown, participate in local events, and keep your community informed in one colorful space.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-kicker">Dashboard</p>
          <h1 className="section-title">Community Operations Center</h1>
          <p className="mt-4 max-w-2xl text-stone-600">
            Manage communities, posts, announcements, discussions, events, and notifications from a single place.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {visibleCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <Link
                to={card.to}
                className="glass-tile block h-full p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {card.badge}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-stone-900">{card.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{card.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Dashboard;
