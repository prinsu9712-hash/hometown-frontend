import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api";
import Layout from "../components/Layout";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get("/notifications");
        setNotifications(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <Layout>
      <section className="hero-glass p-8 sm:p-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Alerts</p>
            <h2 className="section-title">Notifications</h2>
          </div>
          <p className="text-sm text-stone-600">{unreadCount} unread</p>
        </div>

        {notifications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">
            No notifications.
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.03 }}
              className={`rounded-2xl border p-5 ${
                item.isRead
                  ? "border-stone-200 bg-white/70"
                  : "border-brand/30 bg-brand/5"
              }`}
            >
              <p className="text-stone-800">{item.message}</p>
              {!item.isRead && (
                <button onClick={() => markAsRead(item._id)} className="muted-btn mt-4">
                  Mark as Read
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Notifications;
