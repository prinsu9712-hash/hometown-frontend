import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isGuestPage = !user && !isHomePage;

  const userLinkStyle = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-white text-[#2c1810] shadow-sm"
        : "text-[#f5e7d3]/82 hover:bg-white/12 hover:text-white"
    }`;

  const publicTextLinkClass =
    "text-sm font-semibold text-[#2c1810]/72 transition hover:text-[#c4622d]";
  const publicButtonClass =
    "inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
        user
          ? "border-white/10 bg-[#2c1810]/88"
          : isHomePage
            ? "border-[#c4622d]/14 bg-[#faf3e8]/88"
            : "border-[#c4622d]/12 bg-[#fffaf5]/94"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-extrabold tracking-[0.18em] ${
              user
                ? "bg-gradient-to-br from-[#c4622d] to-[#ff7a35] text-white"
                : "bg-gradient-to-br from-[#c4622d]/15 to-[#e8a838]/20 text-[#c4622d]"
            }`}
          >
            HH
          </span>
          <span
            className={`font-['Playfair_Display'] text-xl font-black tracking-tight ${
              user ? "text-[#faf3e8]" : "text-[#c4622d]"
            }`}
            style={{ fontFamily: '"Playfair Display", "Outfit", serif' }}
          >
            Hometown Hub
          </span>
        </Link>

        {user ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-[#f5e7d3] sm:inline-flex">
              {user.name}
            </span>
            <NavLink className={userLinkStyle} to="/dashboard">
              Dashboard
            </NavLink>
            <NavLink className={userLinkStyle} to="/communities">
              Communities
            </NavLink>
            <NavLink className={userLinkStyle} to="/notifications">
              Notifications
            </NavLink>
            <NavLink className={userLinkStyle} to="/onboarding">
              Onboarding
            </NavLink>
            {user.role === "ADMIN" && (
              <NavLink className={userLinkStyle} to="/admin">
                Admin
              </NavLink>
            )}
            <button
              className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <div className="hidden items-center gap-6 md:flex">
              {isHomePage ? (
                <>
                  <a className={publicTextLinkClass} href="#features">
                    Features
                  </a>
                  <a className={publicTextLinkClass} href="#communities">
                    Communities
                  </a>
                  <a className={publicTextLinkClass} href="#feed">
                    Live feed
                  </a>
                  <a className={publicTextLinkClass} href="#how-it-works">
                    How it works
                  </a>
                </>
              ) : (
                <Link className={publicTextLinkClass} to="/">
                  Home
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isGuestPage && (
                <Link className={`${publicTextLinkClass} md:hidden`} to="/">
                  Home
                </Link>
              )}
              <Link
                className={`${publicButtonClass} border border-[#2c1810]/12 bg-white text-[#2c1810] hover:border-[#c4622d]/22 hover:text-[#c4622d]`}
                to="/login"
              >
                Login
              </Link>
              <Link
                className={`${publicButtonClass} bg-[#c4622d] text-white hover:bg-[#ff7a35]`}
                to="/register"
              >
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
