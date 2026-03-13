import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import API, { getApiErrorMessage } from "../api";
import { AuthContext } from "../context/AuthContext";

function Events() {
  const { communityId } = useParams();
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("posts");
  const [community, setCommunity] = useState(null);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [joiningId, setJoiningId] = useState(null);
  const [postError, setPostError] = useState("");
  const [eventError, setEventError] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [postForm, setPostForm] = useState({
    content: "",
    isAnnouncement: false,
    category: "",
    tags: ""
  });
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", location: "" });
  const canModerate = user?.role === "ADMIN" || user?.role === "MODERATOR";
  const canCreateEvent = canModerate;

  const fetchCommunity = useCallback(async () => {
    try {
      const { data } = await API.get("/communities");
      setCommunity(data.find((c) => c._id === communityId) || null);
    } catch (error) {
      setCommunity(null);
      setPageError((current) => current || getApiErrorMessage(error, "Failed to load community details."));
    }
  }, [communityId]);

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await API.get(`/events/community/${communityId}`);
      setEvents(data);
    } catch (error) {
      setEvents([]);
      setPageError((current) => current || getApiErrorMessage(error, "Failed to load events."));
    }
  }, [communityId]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await API.get(`/posts/${communityId}`);
      setPosts(data);
    } catch (error) {
      setPosts([]);
      setPageError((current) => current || getApiErrorMessage(error, "Failed to load posts."));
    }
  }, [communityId]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch (error) {
      setCategories([]);
      setPageError((current) => current || getApiErrorMessage(error, "Failed to load categories."));
    }
  }, []);

  useEffect(() => {
    setPageError("");
    fetchCommunity();
    fetchEvents();
    fetchPosts();
    fetchCategories();
  }, [fetchCommunity, fetchEvents, fetchPosts, fetchCategories]);

  const isUpcoming = (dateValue) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return new Date(dateValue) >= now;
  };

  const isJoinedEvent = useCallback(
    (event) =>
      Boolean(
        user?._id &&
          (event.attendees || []).some((attendee) =>
            String(attendee?._id || attendee) === String(user._id)
          )
      ),
    [user?._id]
  );

  const isLikedPost = useCallback(
    (post) => Boolean((post.likes || []).some((id) => String(id) === String(user?._id))),
    [user?._id]
  );

  const viewEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...events]
      .filter((event) => {
        const title = (event.title || "").toLowerCase();
        const desc = (event.description || "").toLowerCase();
        const matchSearch = !query || title.includes(query) || desc.includes(query);
        const matchFilter =
          filter === "all" ||
          (filter === "upcoming" && isUpcoming(event.date)) ||
          (filter === "past" && !isUpcoming(event.date)) ||
          (filter === "joined" && isJoinedEvent(event));
        return matchSearch && matchFilter;
      })
      .sort((a, b) => {
        if (sortBy === "attendeesDesc") return (b.attendees?.length || 0) - (a.attendees?.length || 0);
        if (sortBy === "dateAsc") return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
      });
  }, [events, search, filter, sortBy, isJoinedEvent]);

  const viewPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...posts]
      .filter((post) => {
        const content = (post.content || "").toLowerCase();
        const author = (post.author?.name || "").toLowerCase();
        const cat = (post.category || "").toLowerCase();
        const matchSearch = !query || content.includes(query) || author.includes(query) || cat.includes(query);
        const matchFilter =
          filter === "all" ||
          (filter === "announcement" && post.isAnnouncement) ||
          (filter === "discussion" && !post.isAnnouncement) ||
          (filter === "pinned" && post.isPinned);
        return matchSearch && matchFilter;
      })
      .sort((a, b) => {
        if (sortBy === "likesDesc") return (b.likes?.length || 0) - (a.likes?.length || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [posts, search, filter, sortBy]);

  const stats = useMemo(
    () => ({
      posts: posts.length,
      announcements: posts.filter((post) => post.isAnnouncement).length,
      pinned: posts.filter((post) => post.isPinned).length,
      events: events.length,
      upcoming: events.filter((event) => isUpcoming(event.date)).length
    }),
    [posts, events]
  );

  const resetFilters = (name) => {
    setTab(name);
    setSearch("");
    setFilter("all");
    setSortBy(name === "events" ? "dateAsc" : "latest");
  };

  const createPost = async (e) => {
    e.preventDefault();
    setPostError("");
    setIsCreatingPost(true);
    try {
      await API.post("/posts", {
        community: communityId,
        content: postForm.content,
        isAnnouncement: postForm.isAnnouncement,
        category: postForm.category,
        tags: postForm.tags
      });
      setPostForm({ content: "", isAnnouncement: false, category: "", tags: "" });
      await fetchPosts();
    } catch (error) {
      setPostError(error?.response?.data?.message || "Failed to create post");
    } finally {
      setIsCreatingPost(false);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    setEventError("");
    setIsCreatingEvent(true);
    try {
      await API.post("/events", { community: communityId, ...eventForm });
      setEventForm({ title: "", description: "", date: "", location: "" });
      await fetchEvents();
    } catch (error) {
      setEventError(error?.response?.data?.message || "Failed to create event");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      setJoiningId(eventId);
      await API.post(`/events/${eventId}/join`);
      await fetchEvents();
    } finally {
      setJoiningId(null);
    }
  };

  const toggleLike = async (postId) => {
    await API.post(`/posts/${postId}/like`);
    await fetchPosts();
  };

  const sharePost = async (postId) => {
    await API.post(`/posts/${postId}/share`);
    await fetchPosts();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const deletePost = async (postId) => {
    await API.delete(`/posts/${postId}`);
    await fetchPosts();
  };

  const togglePin = async (postId) => {
    await API.put(`/posts/${postId}/pin`);
    await fetchPosts();
  };

  const addComment = async (postId) => {
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;
    await API.post(`/posts/${postId}/comment`, { text });
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    await fetchPosts();
  };

  const deleteComment = async (postId, commentId) => {
    await API.delete(`/posts/${postId}/comment/${commentId}`);
    await fetchPosts();
  };

  const reportItem = async (targetType, targetId) => {
    const reason = window.prompt("Report reason (required):");
    if (!reason) return;
    const details = window.prompt("Extra details (optional):") || "";
    await API.post("/reports", { targetType, targetId, reason, details });
  };

  return (
    <Layout>
      <section className="hero-glass overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#8d5a34] via-[#b78656] to-[#e39d58] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">Digital Community Space</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{community?.name || "Community Hub"}</h2>
          <p className="mt-2 text-sm text-white/90">{community?.city || "City"} | {community?.members?.length || 0} members</p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="glass-tile p-4"><p className="section-kicker">Posts</p><p className="mt-2 text-2xl font-bold">{stats.posts}</p></div>
          <div className="glass-tile p-4"><p className="section-kicker">Announcements</p><p className="mt-2 text-2xl font-bold text-amber-700">{stats.announcements}</p></div>
          <div className="glass-tile p-4"><p className="section-kicker">Pinned</p><p className="mt-2 text-2xl font-bold text-indigo-700">{stats.pinned}</p></div>
          <div className="glass-tile p-4"><p className="section-kicker">Events</p><p className="mt-2 text-2xl font-bold">{stats.events}</p></div>
          <div className="glass-tile p-4"><p className="section-kicker">Upcoming</p><p className="mt-2 text-2xl font-bold text-emerald-700">{stats.upcoming}</p></div>
        </div>

        {pageError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {pageError}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => resetFilters("posts")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "posts" ? "bg-gradient-to-r from-brand to-brand2 text-white" : "bg-white/80 text-stone-700"}`}>Posts</button>
          <button type="button" onClick={() => resetFilters("events")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "events" ? "bg-gradient-to-r from-brand to-brand2 text-white" : "bg-white/80 text-stone-700"}`}>Events</button>
        </div>

        {tab === "posts" && (
          <>
            <form onSubmit={createPost} className="glass-tile mb-6 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create Post</h3>
                <label className="text-sm font-medium text-stone-700"><input type="checkbox" checked={postForm.isAnnouncement} onChange={(e) => setPostForm((prev) => ({ ...prev, isAnnouncement: e.target.checked }))} className="mr-2" />Announcement</label>
              </div>
              <textarea className="soft-input min-h-[100px]" value={postForm.content} onChange={(e) => setPostForm((prev) => ({ ...prev, content: e.target.value }))} placeholder="Share updates, local news, or discussion..." required />
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <select className="soft-input" value={postForm.category} onChange={(e) => setPostForm((prev) => ({ ...prev, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
                </select>
                <input className="soft-input" placeholder="Tags (comma separated)" value={postForm.tags} onChange={(e) => setPostForm((prev) => ({ ...prev, tags: e.target.value }))} />
              </div>
              {postError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{postError}</p>}
              <button type="submit" className="primary-btn mt-4" disabled={isCreatingPost}>{isCreatingPost ? "Posting..." : "Publish Post"}</button>
            </form>

            <div className="mb-6 grid gap-3 md:grid-cols-12">
              <input className="soft-input md:col-span-5" placeholder="Search posts" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="soft-input md:col-span-4" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="announcement">Announcements</option><option value="discussion">Discussions</option><option value="pinned">Pinned</option></select>
              <select className="soft-input md:col-span-3" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="latest">Latest</option><option value="likesDesc">Most liked</option></select>
            </div>

            <div className="space-y-4">
              {viewPosts.map((post) => {
                const canDeletePost = canModerate || String(post.author?._id) === String(user?._id);
                return (
                  <article key={post._id} className="glass-tile p-5">
                    <p className="text-sm text-stone-500">{post.author?.name || "Member"} | {new Date(post.createdAt).toLocaleString()}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.isAnnouncement && <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Announcement</span>}
                      {post.isPinned && <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Pinned</span>}
                      {post.category && <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{post.category}</span>}
                      {(post.tags || []).slice(0, 3).map((tag) => <span key={tag} className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">#{tag}</span>)}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-stone-800">{post.content}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => toggleLike(post._id)} className={`rounded-lg px-3 py-1 text-sm font-semibold ${isLikedPost(post) ? "bg-rose-100 text-rose-700" : "bg-stone-100 text-stone-700"}`}>{isLikedPost(post) ? "Liked" : "Like"} ({post.likes?.length || 0})</button>
                      <button type="button" onClick={() => sharePost(post._id)} className="rounded-lg bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">Share ({post.shares || 0})</button>
                      <button type="button" onClick={() => reportItem("POST", post._id)} className="rounded-lg bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">Report</button>
                      {canModerate && <button type="button" onClick={() => togglePin(post._id)} className="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">{post.isPinned ? "Unpin" : "Pin"}</button>}
                      {canDeletePost && <button type="button" onClick={() => deletePost(post._id)} className="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">Remove</button>}
                      <span className="text-sm text-stone-500">Comments: {post.comments?.length || 0}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(post.comments || []).slice(-4).map((comment) => {
                        const canDeleteComment =
                          canModerate ||
                          String(comment.user?._id) === String(user?._id) ||
                          String(post.author?._id) === String(user?._id);
                        return (
                          <div key={comment._id} className="rounded-lg bg-white/80 px-3 py-2 text-sm">
                            <span className="font-semibold">{comment.user?.name || "Member"}:</span> {comment.text}
                            {canDeleteComment && <button type="button" onClick={() => deleteComment(post._id, comment._id)} className="ml-3 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Delete</button>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input className="soft-input" value={commentDrafts[post._id] || ""} placeholder="Write a comment" onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))} />
                      <button type="button" onClick={() => addComment(post._id)} className="primary-btn">Comment</button>
                    </div>
                  </article>
                );
              })}
              {viewPosts.length === 0 && <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">No posts found.</div>}
            </div>
          </>
        )}

        {tab === "events" && (
          <>
            {canCreateEvent && (
              <form onSubmit={createEvent} className="glass-tile mb-6 p-5">
                <h3 className="mb-3 text-lg font-semibold">Create Event</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="soft-input md:col-span-2" placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))} required />
                  <textarea className="soft-input md:col-span-2 min-h-[96px]" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))} required />
                  <input type="datetime-local" className="soft-input" value={eventForm.date} onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))} required />
                  <input className="soft-input" placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))} />
                </div>
                {eventError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{eventError}</p>}
                <button type="submit" className="primary-btn mt-4" disabled={isCreatingEvent}>{isCreatingEvent ? "Creating..." : "Create Event"}</button>
              </form>
            )}

            <div className="mb-6 grid gap-3 md:grid-cols-12">
              <input className="soft-input md:col-span-5" placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="soft-input md:col-span-3" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All</option><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="joined">Joined by me</option></select>
              <select className="soft-input md:col-span-4" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="dateAsc">Date asc</option><option value="dateDesc">Date desc</option><option value="attendeesDesc">Most attendees</option></select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {viewEvents.map((event) => {
                const joined = isJoinedEvent(event);
                return (
                  <article key={event._id} className="glass-tile p-6">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{isUpcoming(event.date) ? "Upcoming" : "Past"}</span>
                      {joined && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Joined</span>}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold">{event.title}</h3>
                    <p className="mt-1 text-sm font-medium text-brand2">{new Date(event.date).toLocaleString()}</p>
                    <p className="mt-2 text-sm text-stone-600">{event.description}</p>
                    <p className="mt-2 text-sm text-stone-500">Location: {event.location || "TBD"} | Attendees: {event.attendees?.length || 0}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <button type="button" onClick={() => joinEvent(event._id)} disabled={joined || joiningId === event._id} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${joined ? "bg-emerald-600/80" : "bg-gradient-to-r from-brand to-brand2"}`}>{joiningId === event._id ? "Joining..." : joined ? "Joined" : "Join Event"}</button>
                      <button type="button" onClick={() => reportItem("EVENT", event._id)} className="rounded-lg bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">Report</button>
                    </div>
                  </article>
                );
              })}
              {viewEvents.length === 0 && <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600 md:col-span-2">No events found.</div>}
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}

export default Events;
