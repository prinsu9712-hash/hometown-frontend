import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

const fallbackCommunities = [
  {
    _id: "community-vadodara",
    name: "Vadodara Connect",
    city: "Vadodara, Gujarat",
    description:
      "Stay in sync with local updates, cultural events, and the people who make Baroda feel like home.",
    memberCount: 4218,
    postsPerDay: 128,
    activeLabel: "Active daily"
  },
  {
    _id: "community-surat",
    name: "Surat Circle",
    city: "Surat, Gujarat",
    description:
      "A fast-moving local space for textile news, food tips, and neighborhood recommendations.",
    memberCount: 2905,
    postsPerDay: 89,
    activeLabel: "Growing fast"
  },
  {
    _id: "community-udaipur",
    name: "Udaipur Walo",
    city: "Udaipur, Rajasthan",
    description:
      "Bring together residents, students, and visitors around heritage events and everyday city life.",
    memberCount: 1640,
    postsPerDay: 54,
    activeLabel: "Events first"
  },
  {
    _id: "community-anand",
    name: "Anand Neighbors",
    city: "Anand, Gujarat",
    description:
      "Small-city warmth with one shared feed for trusted updates, volunteering, and local pride.",
    memberCount: 892,
    postsPerDay: 31,
    activeLabel: "Tight-knit"
  }
];

const fallbackEvents = [
  {
    _id: "event-diwali",
    title: "Diwali Mela",
    description: "Food stalls, performances, and a local makers showcase.",
    date: "2026-10-28T18:00:00.000Z",
    location: "Kirti Mandir",
    attendeesCount: 198,
    community: { name: "Vadodara Connect", city: "Vadodara, Gujarat" }
  },
  {
    _id: "event-walk",
    title: "Heritage City Walk",
    description: "A guided morning walk through the old city landmarks.",
    date: "2026-11-02T07:00:00.000Z",
    location: "Mandvi Gate",
    attendeesCount: 54,
    community: { name: "Vadodara Connect", city: "Vadodara, Gujarat" }
  },
  {
    _id: "event-cleanup",
    title: "Community Clean-Up Drive",
    description: "Neighbors teaming up for a cleaner and safer street.",
    date: "2026-11-10T08:30:00.000Z",
    location: "Fatehgunj",
    attendeesCount: 81,
    community: { name: "Vadodara Connect", city: "Vadodara, Gujarat" }
  }
];

const fallbackPosts = [
  {
    _id: "post-announcement",
    author: { name: "Ramesh Patel" },
    community: { name: "Vadodara Connect", city: "Vadodara, Gujarat" },
    content:
      "The Sayajibaug heritage walk now opens extra weekend slots. Families and senior citizens can register through the local volunteer team.",
    isAnnouncement: true,
    likesCount: 142,
    commentsCount: 28,
    shares: 12,
    createdAt: "2026-03-13T07:30:00.000Z"
  },
  {
    _id: "post-event",
    author: { name: "Priya Desai" },
    community: { name: "Vadodara Connect", city: "Vadodara, Gujarat" },
    content:
      "We are planning a spring mela with music, food counters, and a kids storytelling corner. Share what you want included this year.",
    category: "Event",
    likesCount: 89,
    commentsCount: 45,
    shares: 9,
    createdAt: "2026-03-12T12:15:00.000Z"
  },
  {
    _id: "post-discussion",
    author: { name: "Kiran Shah" },
    community: { name: "Vadodara Connect", city: "Vadodara, Gujarat" },
    content:
      "Which areas would you recommend for a family moving soon? Looking for safe neighborhoods, decent schools, and smooth daily commute.",
    likesCount: 34,
    commentsCount: 62,
    shares: 5,
    createdAt: "2026-03-11T15:45:00.000Z"
  }
];

const featureItems = [
  {
    code: "AN",
    title: "Community Announcements",
    description:
      "Publish trusted local notices, emergency alerts, and neighborhood updates in one visible space."
  },
  {
    code: "EV",
    title: "Event Management",
    description:
      "Create local gatherings, track attendance, and help people show up for what matters nearby."
  },
  {
    code: "DS",
    title: "Discussions and Polls",
    description:
      "Run practical conversations, gather opinions, and make decisions together as a community."
  },
  {
    code: "MD",
    title: "Moderated Spaces",
    description:
      "Keep communities healthy with roles, approval flows, and moderation tools built into the platform."
  },
  {
    code: "PR",
    title: "Member Profiles",
    description:
      "Help people reconnect through hometown identity, shared local history, and meaningful context."
  },
  {
    code: "NT",
    title: "Smart Notifications",
    description:
      "Send timely event reminders and important updates without forcing users to sift through noise."
  }
];

const stepItems = [
  {
    number: "01",
    code: "AC",
    title: "Create your account",
    description: "Sign up with your name, email, and hometown details to start discovering local spaces."
  },
  {
    number: "02",
    code: "FN",
    title: "Find your community",
    description: "Search for your city or village and join the conversations already happening there."
  },
  {
    number: "03",
    code: "SH",
    title: "Share updates",
    description: "Post announcements, ask questions, and keep your people informed about daily local life."
  },
  {
    number: "04",
    code: "EV",
    title: "Bring people together",
    description: "Organize events and turn digital coordination into real community momentum."
  }
];

const formatCount = (value) => new Intl.NumberFormat("en-IN").format(value || 0);

const formatRelativeTime = (value) => {
  if (!value) {
    return "Recently";
  }

  const targetDate = new Date(value);
  const diffMs = targetDate.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }

  return targetDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const formatEventMeta = (value) => {
  if (!value) {
    return { day: "--", month: "---", full: "Date to be announced" };
  }

  const targetDate = new Date(value);
  return {
    day: targetDate.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: targetDate.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    full: targetDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  };
};

const truncateText = (value, limit) => {
  if (!value || value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit).trim()}...`;
};

const getInitials = (value) =>
  String(value || "HH")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const getMemberCount = (community) => community?.members?.length || community?.memberCount || 0;

const getAttendeeCount = (event) => event?.attendees?.length || event?.attendeesCount || 0;

const getCommentsCount = (post) => post?.comments?.length || post?.commentsCount || 0;

const getLikesCount = (post) => post?.likes?.length || post?.likesCount || 0;

const getCommunityGroup = (community) => {
  const location = String(community?.city || "").trim();
  if (!location) {
    return "Nearby";
  }

  const segments = location.split(",").map((part) => part.trim()).filter(Boolean);
  return segments.length > 1 ? segments[segments.length - 1] : segments[0];
};

const getPostCategory = (post) => {
  if (post?.isAnnouncement) {
    return {
      id: "announcements",
      label: "Announcement",
      className: "landing-post-tag--announcement"
    };
  }

  if (String(post?.category || "").toLowerCase().includes("event")) {
    return {
      id: "events",
      label: "Event",
      className: "landing-post-tag--event"
    };
  }

  return {
    id: "discussions",
    label: "Discussion",
    className: "landing-post-tag--discussion"
  };
};

const buildActiveMembers = (posts, communities) => {
  const authorItems = posts
    .map((post) => post?.author)
    .filter(Boolean)
    .map((author, index) => ({
      name: author.name || "Community Member",
      role: author.role || (index === 0 ? "Moderator" : "Member"),
      meta: author.hometown || `Joined through ${posts[index]?.community?.name || "local community"}`
    }));

  const creatorItems = communities
    .map((community) => community?.createdBy)
    .filter(Boolean)
    .map((creator, index) => ({
      name: creator.name || "Community Lead",
      role: creator.role || (index === 0 ? "Organizer" : "Member"),
      meta: creator.email || `Leads ${communities[index]?.name || "a community"}`
    }));

  const seenNames = new Set();
  return [...authorItems, ...creatorItems]
    .filter((item) => {
      const key = item.name.toLowerCase();
      if (seenNames.has(key)) {
        return false;
      }

      seenNames.add(key);
      return true;
    })
    .slice(0, 4);
};

function Home() {
  const { user } = useContext(AuthContext);
  const [communities, setCommunities] = useState(fallbackCommunities);
  const [events, setEvents] = useState(fallbackEvents);
  const [posts, setPosts] = useState(fallbackPosts);
  const [communityFilter, setCommunityFilter] = useState("All");
  const [feedFilter, setFeedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      setIsLoading(true);

      const [communitiesResult, eventsResult, postsResult] = await Promise.allSettled([
        API.get("/communities"),
        API.get("/events/public?limit=3"),
        API.get("/posts/highlights?limit=3")
      ]);

      if (!isMounted) {
        return;
      }

      const nextCommunities =
        communitiesResult.status === "fulfilled" &&
        Array.isArray(communitiesResult.value.data) &&
        communitiesResult.value.data.length > 0
          ? communitiesResult.value.data
          : fallbackCommunities;

      const nextEvents =
        eventsResult.status === "fulfilled" &&
        Array.isArray(eventsResult.value.data) &&
        eventsResult.value.data.length > 0
          ? eventsResult.value.data
          : fallbackEvents;

      const nextPosts =
        postsResult.status === "fulfilled" &&
        Array.isArray(postsResult.value.data) &&
        postsResult.value.data.length > 0
          ? postsResult.value.data
          : fallbackPosts;

      setCommunities(nextCommunities);
      setEvents(nextEvents);
      setPosts(nextPosts);
      setIsLoading(false);
    };

    loadHomeData().catch(() => {
      if (isMounted) {
        setCommunities(fallbackCommunities);
        setEvents(fallbackEvents);
        setPosts(fallbackPosts);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const communityGroups = Array.from(
    new Set(communities.map((community) => getCommunityGroup(community)).filter(Boolean))
  ).slice(0, 4);
  const communityTabs = ["All", ...communityGroups];

  const filteredCommunities =
    communityFilter === "All"
      ? communities
      : communities.filter((community) => getCommunityGroup(community) === communityFilter);

  const visiblePosts = posts.filter((post) => {
    if (feedFilter === "all") {
      return true;
    }

    return getPostCategory(post).id === feedFilter;
  });

  const activeMembers = buildActiveMembers(posts, communities);
  const totalMembers = communities.reduce((sum, community) => sum + getMemberCount(community), 0);
  const totalActivity = posts.reduce(
    (sum, post) => sum + getLikesCount(post) + getCommentsCount(post) + (post?.shares || 0),
    0
  );

  const previewItems = [...posts.slice(0, 3), ...events.slice(0, 2)].slice(0, 5);
  const sidebarEvents = events.slice(0, 3);
  const sidebarMembers = activeMembers.length > 0
    ? activeMembers
    : [
        { name: "Community Member", role: "Moderator", meta: "Ready to connect" },
        { name: "Neighborhood Lead", role: "Organizer", meta: "Hosting the next event" }
      ];

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-shell landing-hero-grid">
          <div className="landing-hero-copy-block">
            <div className="landing-chip">React frontend | Node backend | MongoDB ready</div>
            <h1 className="landing-hero-title">
              A digital home for every <span>hometown</span>.
            </h1>
            <p className="landing-copy landing-copy--hero">
              Hometown Hub brings announcements, events, and neighborhood conversations into one
              warm platform that feels local from the first screen.
            </p>

            <div className="landing-actions">
              <Link className="landing-btn landing-btn--primary" to={user ? "/dashboard" : "/register"}>
                {user ? "Open dashboard" : "Get started"}
              </Link>
              <a className="landing-btn landing-btn--ghost" href="#communities">
                Explore communities
              </a>
            </div>

            <p className="landing-live-note">
              {isLoading
                ? "Syncing landing content from the platform..."
                : `Showing ${communities.length} communities, ${events.length} upcoming events, and ${posts.length} live feed highlights.`}
            </p>

            <div className="landing-stats">
              <div className="landing-stat">
                <strong>{formatCount(communities.length)}</strong>
                <span>Communities listed</span>
              </div>
              <div className="landing-stat">
                <strong>{formatCount(totalMembers)}</strong>
                <span>Members connected</span>
              </div>
              <div className="landing-stat">
                <strong>{formatCount(totalActivity)}</strong>
                <span>Feed interactions</span>
              </div>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-phone">
              <div className="landing-phone-header">
                <div>
                  <p className="landing-phone-title">Local feed</p>
                  <span className="landing-phone-subtitle">Real-time community highlights</span>
                </div>
                <div className="landing-phone-badge">NT</div>
              </div>

              <div className="landing-phone-feed">
                <div className="landing-phone-feed-track">
                  {[...previewItems, ...previewItems].map((item, index) => {
                    const isEvent = Boolean(item?.location || item?.date);
                    const label = isEvent ? "Upcoming event" : getPostCategory(item).label;
                    const meta = isEvent
                      ? `${item?.community?.name || "Local community"} | ${formatEventMeta(item?.date).full}`
                      : `${item?.author?.name || "Member"} | ${formatRelativeTime(item?.createdAt)}`;

                    return (
                      <article
                        key={`${item?._id || index}-${index}`}
                        className={`landing-phone-card ${isEvent ? "landing-phone-card--event" : ""}`}
                      >
                        <div className="landing-phone-card-top">
                          <span className="landing-phone-pill">{label}</span>
                          <span className="landing-phone-avatar">
                            {getInitials(isEvent ? item?.community?.name : item?.author?.name)}
                          </span>
                        </div>
                        <h3>{truncateText(isEvent ? item?.title : item?.content, 72)}</h3>
                        <p>{meta}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <article className="landing-float-card landing-float-card--members">
              <span className="landing-float-label">Members online</span>
              <strong className="landing-float-value">
                {formatCount(Math.max(Math.round(totalMembers / 3), 1284))}
              </strong>
              <span className="landing-float-meta">Live activity across communities</span>
            </article>

            <article className="landing-float-card landing-float-card--posts">
              <span className="landing-float-label">Fresh highlights</span>
              <strong className="landing-float-value">{formatCount(posts.length)}</strong>
              <span className="landing-float-meta">Landing feed updates now</span>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--how" id="how-it-works">
        <div className="landing-shell">
          <p className="landing-kicker">How it works</p>
          <h2 className="landing-title">Four steps to make every hometown feel closer</h2>
          <p className="landing-copy">
            We kept the experience simple so people can join, trust the space, and start sharing
            useful local information quickly.
          </p>

          <div className="landing-steps-grid">
            {stepItems.map((step) => (
              <article className="landing-step-card" key={step.number}>
                <div className="landing-step-number">{step.number}</div>
                <div className="landing-step-icon">{step.code}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--dark" id="features">
        <div className="landing-shell">
          <p className="landing-kicker landing-kicker--light">Platform features</p>
          <h2 className="landing-title landing-title--light">
            Everything your community needs in one place
          </h2>
          <p className="landing-copy landing-copy--light">
            The stack is already split the right way: React on the front, Node and Express on the
            backend, and MongoDB powering the content that keeps the homepage alive.
          </p>

          <div className="landing-features-grid">
            {featureItems.map((feature) => (
              <article className="landing-feature-card" key={feature.title}>
                <div className="landing-feature-icon">{feature.code}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" id="communities">
        <div className="landing-shell">
          <p className="landing-kicker">Explore communities</p>
          <h2 className="landing-title">Thriving local spaces across your network</h2>
          <p className="landing-copy">
            Communities below use live platform data when available, with polished fallbacks so the
            design still looks complete while the database grows.
          </p>

          <div className="landing-tabs">
            {communityTabs.map((tab) => (
              <button
                key={tab}
                className={`landing-tab ${communityFilter === tab ? "is-active" : ""}`}
                onClick={() => setCommunityFilter(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="landing-communities-grid">
            {filteredCommunities.slice(0, 4).map((community) => (
              <article className="landing-community-card" key={community._id}>
                <div className="landing-community-banner">
                  <span className="landing-community-badge">
                    {formatCount(getMemberCount(community))} members
                  </span>
                  <strong>{getInitials(community.name)}</strong>
                </div>
                <h3>{community.name}</h3>
                <p className="landing-community-location">{community.city || "Local community"}</p>
                <p className="landing-community-description">
                  {truncateText(
                    community.description || "A warm local community built for updates, trust, and collaboration.",
                    130
                  )}
                </p>
                <div className="landing-community-footer">
                  <div className="landing-community-stats">
                    <span>
                      {formatCount(community.postsPerDay || Math.max(Math.round(getMemberCount(community) / 35), 6))} posts/day
                    </span>
                    <span>{community.activeLabel || "Open to join"}</span>
                  </div>
                  <Link
                    className="landing-mini-button"
                    to={user ? `/events/${community._id}` : "/register"}
                  >
                    {user ? "Open" : "Join"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--feed" id="feed">
        <div className="landing-shell">
          <p className="landing-kicker">Live community feed</p>
          <h2 className="landing-title">See what your platform looks like in motion</h2>
          <p className="landing-copy">
            This section is wired to public post and event endpoints so the landing page can preview
            real activity before someone logs in.
          </p>

          <div className="landing-feed-layout">
            <div>
              <div className="landing-tabs">
                <button
                  className={`landing-tab ${feedFilter === "all" ? "is-active" : ""}`}
                  onClick={() => setFeedFilter("all")}
                  type="button"
                >
                  All posts
                </button>
                <button
                  className={`landing-tab ${feedFilter === "announcements" ? "is-active" : ""}`}
                  onClick={() => setFeedFilter("announcements")}
                  type="button"
                >
                  Announcements
                </button>
                <button
                  className={`landing-tab ${feedFilter === "events" ? "is-active" : ""}`}
                  onClick={() => setFeedFilter("events")}
                  type="button"
                >
                  Events
                </button>
                <button
                  className={`landing-tab ${feedFilter === "discussions" ? "is-active" : ""}`}
                  onClick={() => setFeedFilter("discussions")}
                  type="button"
                >
                  Discussions
                </button>
              </div>

              {visiblePosts.slice(0, 3).map((post) => {
                const postCategory = getPostCategory(post);

                return (
                  <article className="landing-post-card" key={post._id}>
                    <div className="landing-post-header">
                      <div className="landing-post-avatar">{getInitials(post?.author?.name)}</div>
                      <div>
                        <h3>{post?.author?.name || "Community Member"}</h3>
                        <p>
                          {post?.community?.name || "Local community"} | {formatRelativeTime(post?.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span className={`landing-post-tag ${postCategory.className}`}>
                      {postCategory.label}
                    </span>
                    <p className="landing-post-text">{truncateText(post?.content, 220)}</p>

                    <div className="landing-post-actions">
                      <span>{formatCount(getLikesCount(post))} likes</span>
                      <span>{formatCount(getCommentsCount(post))} comments</span>
                      <span>{formatCount(post?.shares || 0)} shares</span>
                    </div>
                  </article>
                );
              })}

              {visiblePosts.length === 0 && (
                <div className="landing-empty-card">
                  No feed items match this filter yet. Add posts in the dashboard and they will show up here.
                </div>
              )}
            </div>

            <aside>
              <div className="landing-sidebar-card">
                <h3>Upcoming events</h3>
                {sidebarEvents.map((event) => {
                  const eventDate = formatEventMeta(event?.date);

                  return (
                    <div className="landing-event-row" key={event._id}>
                      <div className="landing-event-date">
                        <strong>{eventDate.day}</strong>
                        <span>{eventDate.month}</span>
                      </div>
                      <div>
                        <h4>{event.title}</h4>
                        <p>
                          {event.location || event?.community?.city || "Location soon"} |{" "}
                          {formatCount(getAttendeeCount(event))} going
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="landing-sidebar-card">
                <h3>Active members</h3>
                {sidebarMembers.map((member, index) => (
                  <div className="landing-member-row" key={`${member.name}-${index}`}>
                    <div className="landing-member-avatar">{getInitials(member.name)}</div>
                    <div>
                      <h4>{member.name}</h4>
                      <p>{member.role}</p>
                    </div>
                    <span className="landing-member-meta">{truncateText(member.meta, 24)}</span>
                  </div>
                ))}
              </div>

              <div className="landing-cta-card">
                <p className="landing-cta-code">NEW</p>
                <h3>Cannot find your hometown?</h3>
                <p>
                  Start a new community and use the same Node, React, and MongoDB setup to bring
                  local people together.
                </p>
                <Link className="landing-btn landing-btn--inverse" to={user ? "/communities" : "/register"}>
                  {user ? "Create community" : "Create account"}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer-grid">
          <div>
            <p className="landing-footer-logo">Hometown Hub</p>
            <p className="landing-footer-copy">
              A digital home for every hometown, now shaped as a real React and Node application
              instead of a single HTML file.
            </p>
          </div>

          <div>
            <h4>Platform</h4>
            <a href="#communities">Explore communities</a>
            <a href="#features">Features</a>
            <a href="#feed">Live feed</a>
          </div>

          <div>
            <h4>Account</h4>
            <Link to="/register">Sign up</Link>
            <Link to="/login">Log in</Link>
            <Link to={user ? "/dashboard" : "/register"}>Dashboard</Link>
          </div>

          <div>
            <h4>Build</h4>
            <span>React frontend</span>
            <span>Node and Express API</span>
            <span>MongoDB storage</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;
