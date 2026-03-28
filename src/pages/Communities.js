import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import API, { getApiErrorMessage } from "../api";
import { AuthContext } from "../context/AuthContext";

const fallbackCommunities = [
  {
    _id: "fallback-delhi-pulse",
    name: "Delhi Pulse",
    city: "New Delhi, Delhi",
    description:
      "Heritage volunteers, civic circles, and metro commuters sharing urgent notices and festive guides.",
    memberCount: 9820,
    pendingCount: 62,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-mumbai-local-network",
    name: "Mumbai Local Network",
    city: "Mumbai, Maharashtra",
    description:
      "Coastal neighborhoods and textile hubs coordinating cleanups, rail updates, and weekend plans.",
    memberCount: 10540,
    pendingCount: 49,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-bengaluru-hive",
    name: "Bengaluru Hive",
    city: "Bengaluru, Karnataka",
    description:
      "Tech parks and residential blocks keeping each other informed about launch parties, traffic, and shared rides.",
    memberCount: 8200,
    pendingCount: 36,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-chennai-shoreline",
    name: "Chennai Shoreline Collective",
    city: "Chennai, Tamil Nadu",
    description:
      "Coastal civic groups reporting festival prep, monsoon safety, and volunteer drives along the Marina.",
    memberCount: 6200,
    pendingCount: 28,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-kolkata-connect",
    name: "Kolkata Connect",
    city: "Kolkata, West Bengal",
    description:
      "Culture, food, and neighborhood discussions woven together with civic updates and creative polls.",
    memberCount: 5400,
    pendingCount: 19,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-gujarat-waypoints",
    name: "Gujarat Waypoints",
    city: "Ahmedabad, Gujarat",
    description:
      "Sabarmati neighborhoods, industrial corridors, and cultural hubs sharing civic announcements and festival logistics.",
    memberCount: 7600,
    pendingCount: 41,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-surat-circle",
    name: "Surat Circle",
    city: "Surat, Gujarat",
    description:
      "Textile families and food vendors syncing on production runs, events, and neighborhood safety checks.",
    memberCount: 4300,
    pendingCount: 14,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-vadodara-connect",
    name: "Vadodara Connect",
    city: "Vadodara, Gujarat",
    description:
      "City planners, schools, and residents coordinating heritage walks, alerts, and community meals.",
    memberCount: 4218,
    pendingCount: 12,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-rajkot-resonance",
    name: "Rajkot Resonance",
    city: "Rajkot, Gujarat",
    description:
      "Craft and maker neighborhoods sharing logistics, artisan markets, and safety updates.",
    memberCount: 1980,
    pendingCount: 9,
    members: [],
    pendingMembers: []
  },
  {
    _id: "fallback-bhuj-connect",
    name: "Bhuj Connect",
    city: "Bhuj, Gujarat",
    description:
      "Kutch communities collaborating on climate resilience, arts festivals, and travel tips.",
    memberCount: 1120,
    pendingCount: 6,
    members: [],
    pendingMembers: []
  }
];

const getFallbackMemberCount = (community) =>
  community?.members?.length ?? community?.memberCount ?? 0;

const getFallbackPendingCount = (community) =>
  community?.pendingMembers?.length ?? community?.pendingCount ?? 0;

const INDIAN_STATES = [
  { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Tirupati"] },
  { name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Ziro"] },
  { name: "Assam", cities: ["Guwahati", "Jorhat", "Silchar"] },
  { name: "Bihar", cities: ["Patna", "Gaya", "Muzaffarpur"] },
  { name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur"] },
  { name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama"] },
  { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara"] },
  { name: "Haryana", cities: ["Gurugram", "Faridabad", "Panipat"] },
  { name: "Himachal Pradesh", cities: ["Shimla", "Dharamshala", "Solan"] },
  { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad"] },
  { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubli"] },
  { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode"] },
  { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior"] },
  { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"] },
  { name: "Manipur", cities: ["Imphal", "Thoubal", "Churachandpur"] },
  { name: "Meghalaya", cities: ["Shillong", "Tura", "Nongpoh"] },
  { name: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai"] },
  { name: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung"] },
  { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela"] },
  { name: "Punjab", cities: ["Chandigarh", "Amritsar", "Ludhiana"] },
  { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur"] },
  { name: "Sikkim", cities: ["Gangtok", "Namchi", "Mangan"] },
  { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"] },
  { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad"] },
  { name: "Tripura", cities: ["Agartala", "Udaipur", "Kailasahar"] },
  { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Varanasi"] },
  { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Rishikesh"] },
  { name: "West Bengal", cities: ["Kolkata", "Siliguri", "Durgapur"] }
];

function Communities() {
  const { user } = useContext(AuthContext);
  const [communities, setCommunities] = useState(fallbackCommunities);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
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
  const formRef = useRef(null);

  const fetchCommunities = useCallback(async () => {
    try {
      setPageError("");
      const { data } = await API.get("/communities");
      if (Array.isArray(data) && data.length > 0) {
        setCommunities(data);
      } else {
        setCommunities(fallbackCommunities);
        if (!Array.isArray(data) || data.length === 0) {
          setPageError("No live communities found yet; showing curated fallbacks.");
        }
      }
    } catch (error) {
      setCommunities(fallbackCommunities);
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

  const selectedState = useMemo(() => {
    if (stateFilter === "All") return null;
    return INDIAN_STATES.find((state) => state.name === stateFilter) || null;
  }, [stateFilter]);

  const cityOptions = selectedState?.cities || [];

  const stateFilteredCommunities = useMemo(() => {
    let results = filtered;
    if (stateFilter !== "All") {
      results = results.filter((community) =>
        community.state?.includes(stateFilter) || community.city?.includes(stateFilter)
      );
    }
    if (cityFilter !== "All") {
      results = results.filter((community) => community.city?.includes(cityFilter));
    }
    return results;
  }, [filtered, stateFilter, cityFilter]);

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

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Explore</p>
            <h2 className="section-title">Communities</h2>
          </div>
          <p className="text-sm text-stone-600">{stateFilteredCommunities.length} results</p>
        </div>

        <div className="mb-8 rounded-2xl border border-stone-200 bg-white/70 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Statewise communities
            </p>
            <span className="text-xs text-stone-500">
              Showing {stateFilter === "All" ? "all states" : stateFilter}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(stateFilter === "All" ? INDIAN_STATES : selectedState ? [selectedState] : []).map(
              (state) => (
                <article key={state.name} className="rounded-2xl border border-stone-200 p-4">
                  <h3 className="font-semibold text-stone-900">{state.name}</h3>
                  <p className="text-sm text-stone-500">
                    {state.cities.join(", ")} and nearby towns
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase text-stone-500">
                    {communities.filter(
                      (community) =>
                        community.state === state.name ||
                        community.city?.includes(state.name) ||
                        state.cities.some((city) => community.city?.includes(city))
                    ).length || "Create new"} communities
                  </p>
                  <button
                    type="button"
                    className="primary-btn mt-4"
                    onClick={() =>
                      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  >
                    Create community for {state.name}
                  </button>
                </article>
              )
            )}
          </div>
        </div>

        <div className="mb-7 grid gap-3 md:grid-cols-3">
          <select
            className="soft-input"
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCityFilter("All");
            }}
          >
            <option value="All">All States</option>
            {INDIAN_STATES.map((state) => (
              <option key={state.name} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
          <select
            className="soft-input"
            value={cityFilter}
            disabled={stateFilter === "All"}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="All">All Cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="muted-btn"
            onClick={() => {
              setStateFilter("All");
              setCityFilter("All");
            }}
          >
            Reset filters
          </button>
        </div>
        <input
          className="soft-input mb-7"
          placeholder="Search by community, city, or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {canCreateCommunity && (
          <form
            ref={formRef}
            onSubmit={createCommunity}
            className="mb-8 glass-tile border-stone-200/90 p-5"
          >
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

        {stateFilteredCommunities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">
            No communities available yet.
          </div>
        )}

      <div className="grid gap-5 md:grid-cols-2">
        {stateFilteredCommunities.map((community, idx) => (
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
                  Members: {getFallbackMemberCount(community)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Pending Requests: {getFallbackPendingCount(community)}
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
