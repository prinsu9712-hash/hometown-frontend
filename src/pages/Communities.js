import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import API, { getApiErrorMessage } from "../api";
import { AuthContext } from "../context/AuthContext";

function Communities() {
  const { user } = useContext(AuthContext);
  const [communities, setCommunities] = useState([]);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [membershipLoadingId, setMembershipLoadingId] = useState("");
  const [membershipMessage, setMembershipMessage] = useState({});
  const [policyDrafts, setPolicyDrafts] = useState({});
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({
    name: "",
    city: "",
    description: "",
  });
  const navigate = useNavigate();

  const fetchCommunities = useCallback(async () => {
    try {
      setPageError("");
      const { data } = await API.get("/communities");
      setCommunities(data);
    } catch (error) {
      setCommunities([]);
      setPageError(getApiErrorMessage(error, "Failed to load communities."));
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return communities;
    return communities.filter((community) => {
      const name = (community.name || "").toLowerCase();
      const city = (community.city || "").toLowerCase();
      const description = (community.description || "").toLowerCase();
      return name.includes(query) || city.includes(query) || description.includes(query);
    });
  }, [communities, search]);

  const canCreateCommunity = user?.role === "ADMIN";

  const isMember = useCallback(
    (community) =>
      Boolean(
        user?._id &&
          (community.members || []).some((member) =>
            String(member?._id || member) === String(user._id)
          )
      ),
    [user?._id]
  );

  const isPendingMember = useCallback(
    (community) =>
      Boolean(
        user?._id &&
          (community.pendingMembers || []).some(
            (member) => String(member?._id || member) === String(user._id)
          )
      ),
    [user?._id]
  );

  const canModerateCommunity = useCallback(
    (community) =>
      user?.role === "ADMIN" ||
      user?.role === "MODERATOR" ||
      String(community?.createdBy?._id || community?.createdBy) === String(user?._id),
    [user?._id, user?.role]
  );

  const handleCreateChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCreateError("");
  };

  const createCommunity = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");
    try {
      await API.post("/communities", form);
      setForm({ name: "", city: "", description: "" });
      await fetchCommunities();
    } catch (error) {
      setCreateError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to create community"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const toggleMembership = async (community) => {
    if (!user?._id) return;
    const joined = isMember(community);
    setMembershipLoadingId(community._id);
    setMembershipMessage((prev) => ({ ...prev, [community._id]: "" }));
    try {
      const { data } = await API.post(`/communities/${community._id}/${joined ? "leave" : "join"}`);
      if (data?.status === "pending") {
        setMembershipMessage((prev) => ({ ...prev, [community._id]: "Request pending approval" }));
      }
      await fetchCommunities();
    } catch (error) {
      setMembershipMessage((prev) => ({
        ...prev,
        [community._id]: error?.response?.data?.message || "Membership update failed"
      }));
    } finally {
      setMembershipLoadingId("");
    }
  };

  const updatePolicy = async (communityId) => {
    const draft = policyDrafts[communityId] || {};
    try {
      setPageError("");
      await API.put(`/communities/${communityId}/policy`, {
        rules: draft.rules || "",
        guidelines: draft.guidelines || ""
      });
      await fetchCommunities();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to update community rules."));
    }
  };

  const handleRequestAction = async (communityId, userId, action) => {
    try {
      setPageError("");
      await API.post(`/communities/${communityId}/requests/${userId}/${action}`);
      await fetchCommunities();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to update the membership request."));
    }
  };

  return (
    <Layout>
      <section className="hero-glass p-8 sm:p-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#8d5a34] via-[#b78656] to-[#e39d58] p-6 text-white shadow-glass">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            Local Network
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Discover Hometown Communities</h2>
          <p className="mt-2 text-sm text-white/90">
            Join your city or village community, share updates, and participate in events.
          </p>
        </div>

        {pageError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {pageError}
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Explore</p>
            <h2 className="section-title">Communities</h2>
          </div>
          <p className="text-sm text-stone-600">{filtered.length} results</p>
        </div>

        <input
          className="soft-input mb-7"
          placeholder="Search by community, city, or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {canCreateCommunity && (
          <form onSubmit={createCommunity} className="mb-8 glass-tile border-stone-200/90 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Create Community</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Admin only
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="name"
                value={form.name}
                onChange={handleCreateChange}
                className="soft-input"
                placeholder="Community name"
                required
              />
              <input
                name="city"
                value={form.city}
                onChange={handleCreateChange}
                className="soft-input"
                placeholder="City"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleCreateChange}
                className="soft-input md:col-span-2 min-h-[96px]"
                placeholder="Community description"
              />
            </div>
            {createError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {createError}
              </p>
            )}
            <button type="submit" disabled={isCreating} className="primary-btn mt-4">
              {isCreating ? "Creating..." : "Create Community"}
            </button>
          </form>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">
            No communities available yet.
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((community, idx) => (
            <motion.div
              key={community._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className="glass-tile p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold text-stone-900">{community.name}</h3>
              <p className="mt-1 text-sm font-medium text-brand">{community.city}</p>
              <p className="mt-3 text-sm text-stone-600">{community.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                Members: {community.members?.length || 0}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                Pending Requests: {community.pendingMembers?.length || 0}
              </p>
              {membershipMessage[community._id] && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  {membershipMessage[community._id]}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/events/${community._id}`)}
                  className="primary-btn"
                >
                  Open Community Hub
                </button>
                <button
                  type="button"
                  onClick={() => toggleMembership(community)}
                  disabled={membershipLoadingId === community._id || isPendingMember(community)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isMember(community)
                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      : isPendingMember(community)
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                  }`}
                >
                  {membershipLoadingId === community._id
                    ? "Updating..."
                    : isMember(community)
                      ? "Leave"
                      : isPendingMember(community)
                        ? "Pending"
                        : "Join"}
                </button>
              </div>

              {canModerateCommunity(community) && (
                <div className="mt-5 rounded-xl border border-stone-200 bg-white/75 p-4">
                  <p className="text-sm font-semibold text-stone-800">Community Rules & Guidelines</p>
                  <div className="mt-3 grid gap-2">
                    <textarea
                      className="soft-input min-h-[72px]"
                      placeholder="Rules"
                      value={policyDrafts[community._id]?.rules ?? community.rules ?? ""}
                      onChange={(e) =>
                        setPolicyDrafts((prev) => ({
                          ...prev,
                          [community._id]: {
                            ...(prev[community._id] || {}),
                            rules: e.target.value,
                            guidelines:
                              prev[community._id]?.guidelines ?? community.guidelines ?? ""
                          }
                        }))
                      }
                    />
                    <textarea
                      className="soft-input min-h-[72px]"
                      placeholder="Guidelines"
                      value={policyDrafts[community._id]?.guidelines ?? community.guidelines ?? ""}
                      onChange={(e) =>
                        setPolicyDrafts((prev) => ({
                          ...prev,
                          [community._id]: {
                            ...(prev[community._id] || {}),
                            guidelines: e.target.value,
                            rules: prev[community._id]?.rules ?? community.rules ?? ""
                          }
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="muted-btn"
                      onClick={() => updatePolicy(community._id)}
                    >
                      Save Rules
                    </button>
                  </div>

                  {(community.pendingMembers || []).length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-stone-800">Pending Member Requests</p>
                      {(community.pendingMembers || []).map((pendingUser) => (
                        <div
                          key={pendingUser._id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-stone-700">
                            {pendingUser.name} ({pendingUser.email})
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-lg bg-emerald-100 px-3 py-1 font-semibold text-emerald-700"
                              onClick={() =>
                                handleRequestAction(community._id, pendingUser._id, "approve")
                              }
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="rounded-lg bg-rose-100 px-3 py-1 font-semibold text-rose-700"
                              onClick={() =>
                                handleRequestAction(community._id, pendingUser._id, "reject")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Communities;
