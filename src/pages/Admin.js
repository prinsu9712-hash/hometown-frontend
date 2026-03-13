import { useCallback, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import API, { getApiErrorMessage } from "../api";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";

function Admin() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("kpi");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    const [
      statsResult,
      usersResult,
      eventsResult,
      reportsResult,
      categoriesResult,
      onboardingResult
    ] = await Promise.allSettled([
      API.get("/admin/dashboard"),
      API.get("/admin/users"),
      API.get("/events/admin/all"),
      API.get("/reports"),
      API.get("/categories"),
      API.get("/onboarding")
    ]);

    if (statsResult.status === "fulfilled") setStats(statsResult.value.data);
    if (usersResult.status === "fulfilled") setUsers(usersResult.value.data);
    if (eventsResult.status === "fulfilled") setEvents(eventsResult.value.data);
    if (reportsResult.status === "fulfilled") setReports(reportsResult.value.data);
    if (categoriesResult.status === "fulfilled") setCategories(categoriesResult.value.data);
    if (onboardingResult.status === "fulfilled") setOnboarding(onboardingResult.value.data);

    const firstFailure = [
      statsResult,
      usersResult,
      eventsResult,
      reportsResult,
      categoriesResult,
      onboardingResult
    ].find((result) => result.status === "rejected");

    if (firstFailure?.status === "rejected") {
      setLoadError(getApiErrorMessage(firstFailure.reason, "Some admin data could not be loaded."));
    }

    setIsLoading(false);
  }, []);

  const runAdminAction = useCallback(async (action, fallbackMessage) => {
    setActionError("");
    try {
      await action();
      await loadAdminData();
    } catch (error) {
      setActionError(getApiErrorMessage(error, fallbackMessage));
    }
  }, [loadAdminData]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    loadAdminData();
  }, [loadAdminData, user?.role]);

  const deleteEvent = async (id) => {
    await runAdminAction(() => API.put(`/events/${id}/delete`), "Failed to archive the event.");
  };

  const restoreEvent = async (id) => {
    await runAdminAction(() => API.put(`/events/${id}/restore`), "Failed to restore the event.");
  };

  const updateRole = async (id, role) => {
    await runAdminAction(() => API.put(`/admin/users/${id}/role`, { role }), "Failed to update the user role.");
  };

  const toggleBlock = async (id) => {
    await runAdminAction(() => API.put(`/admin/users/${id}/block`), "Failed to update the block status.");
  };

  const resolveReport = async (id, status) => {
    const resolutionNote = window.prompt("Resolution note (optional):") || "";
    await runAdminAction(
      () => API.put(`/reports/${id}/resolve`, { status, resolutionNote }),
      "Failed to resolve the report."
    );
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    await runAdminAction(async () => {
      await API.post("/categories", newCategory);
      setNewCategory({ name: "", description: "" });
    }, "Failed to add the category.");
  };

  const archiveCategory = async (id) => {
    await runAdminAction(() => API.delete(`/categories/${id}`), "Failed to archive the category.");
  };

  const updateOnboardingStatus = async (id, status) => {
    await runAdminAction(
      () => API.put(`/onboarding/${id}/status`, { status }),
      "Failed to update onboarding status."
    );
  };

  if (user?.role !== "ADMIN") {
    return (
      <Layout>
        <section className="hero-glass p-8 sm:p-10">
          <p className="section-kicker">Restricted</p>
          <h2 className="section-title">Admin Access Required</h2>
          <p className="mt-4 text-stone-600">This module is only available for platform administrators.</p>
        </section>
      </Layout>
    );
  }

  const tabButton = (id, label) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === id ? "bg-gradient-to-r from-brand to-brand2 text-white" : "bg-white/80 text-stone-700"}`}
    >
      {label}
    </button>
  );

  return (
    <Layout>
      <section className="hero-glass p-8 sm:p-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#8d5a34] via-[#b78656] to-[#e39d58] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">Platform Admin</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Control Center</h2>
          <p className="mt-2 text-sm text-white/90">Monitor KPIs, users, events, abuse reports, and content categories.</p>
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {loadError}
          </div>
        )}

        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabButton("kpi", "KPI")}
          {tabButton("users", "Users")}
          {tabButton("events", "Events")}
          {tabButton("reports", "Reports")}
          {tabButton("categories", "Categories")}
          {tabButton("onboarding", "Onboarding")}
        </div>

        {isLoading && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm font-medium text-stone-600">
            Loading admin data...
          </div>
        )}

        {tab === "kpi" && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total Users", stats.totalUsers],
              ["Daily Active Users", stats.dailyActiveUsers],
              ["New Users (7d)", stats.newUsers7d],
              ["Communities", stats.totalCommunities],
              ["Posts", stats.totalPosts],
              ["Events", stats.totalEvents],
              ["Participants", stats.totalParticipants],
              ["Open Reports", stats.openReports]
            ].map(([label, value]) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-tile p-4">
                <p className="section-kicker">{label}</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">{value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {users.map((member) => (
              <div key={member._id} className="glass-tile flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-stone-900">{member.name}</p>
                  <p className="text-sm text-stone-600">{member.email} | {member.hometown || "No hometown"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select className="soft-input !w-auto !py-2" value={member.role} onChange={(e) => updateRole(member._id, e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button type="button" onClick={() => toggleBlock(member._id)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${member.isBlocked ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {member.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event._id} className={`rounded-2xl border p-4 ${event.isDeleted ? "border-red-200 bg-red-50/85" : "border-stone-200 bg-white/70"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">{event.title}</p>
                    <p className="text-sm text-stone-600">{event.community?.name || "Unknown"} | {event.createdBy?.name || "Unknown"}</p>
                  </div>
                  {!event.isDeleted ? (
                    <button type="button" onClick={() => deleteEvent(event._id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Soft Delete</button>
                  ) : (
                    <button type="button" onClick={() => restoreEvent(event._id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Restore</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report._id} className="glass-tile p-4">
                <p className="font-semibold text-stone-900">{report.targetType} | {report.reason}</p>
                <p className="mt-1 text-sm text-stone-600">By: {report.reporter?.name || "Unknown"} | Status: {report.status}</p>
                {report.details && <p className="mt-2 text-sm text-stone-700">{report.details}</p>}
                {report.status === "OPEN" && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => resolveReport(report._id, "RESOLVED")} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">Resolve</button>
                    <button type="button" onClick={() => resolveReport(report._id, "REJECTED")} className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">Reject</button>
                  </div>
                )}
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-stone-600">No reports available.</p>}
          </div>
        )}

        {tab === "categories" && (
          <div>
            <form onSubmit={addCategory} className="mb-4 grid gap-3 md:grid-cols-3">
              <input className="soft-input" placeholder="Category name" value={newCategory.name} onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="soft-input" placeholder="Description" value={newCategory.description} onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))} />
              <button type="submit" className="primary-btn">Add Category</button>
            </form>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category._id} className="glass-tile flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-stone-900">{category.name}</p>
                    <p className="text-sm text-stone-600">{category.description || "No description"}</p>
                  </div>
                  <button type="button" onClick={() => archiveCategory(category._id)} className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">Archive</button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-stone-600">No categories yet.</p>}
            </div>
          </div>
        )}

        {tab === "onboarding" && (
          <div className="space-y-3">
            {onboarding.map((item) => (
              <article key={item._id} className="glass-tile p-4">
                <p className="font-semibold text-stone-900">{item.communityName} ({item.cityVillage})</p>
                <p className="mt-1 text-sm text-stone-600">Contact: {item.contactName} | {item.contactEmail}</p>
                <p className="mt-1 text-sm text-stone-600">Status: {item.status}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => updateOnboardingStatus(item._id, "APPROVED")} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">Approve</button>
                  <button type="button" onClick={() => updateOnboardingStatus(item._id, "REJECTED")} className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">Reject</button>
                </div>
              </article>
            ))}
            {onboarding.length === 0 && <p className="text-sm text-stone-600">No onboarding requests.</p>}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default Admin;
