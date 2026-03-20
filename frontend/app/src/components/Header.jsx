import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { getUserInfo, clearUserInfo } from "../utils/userSession";

function Header() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const syncUserFromStorage = () => {
    const userInfo = getUserInfo();
    if (!userInfo) {
      setUser(null);
      return;
    }
    setUser(userInfo);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    syncUserFromStorage();
  }, [location.pathname]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "userInfo") {
        syncUserFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    document.body.classList.remove("app-theme-light", "app-theme-dark");
    document.body.classList.add(`app-theme-${theme}`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const logoutHandler = () => {
    clearUserInfo();
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg custom-navbar ${
          theme === "dark" ? "navbar-dark bg-dark" : "navbar-light bg-light"
        }`}
      >
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            IG
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarColor03"
            aria-controls="navbarColor03"
            aria-expanded="false"
            aria-label="Toggle navigation"
            fdprocessedid="2tikgui"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarColor03">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about">
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/chats">
                  Chat 
                </NavLink>
              </li>
              <li className="nav-item dropdown" ref={dropdownRef}>
                <button
                  className="nav-link dropdown-toggle btn btn-link"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {user ? `Welcome ${user.username}` : "signin"}
                </button>
                <div className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                  {!user ? (
                    <>
                      <Link
                        className="dropdown-item"
                        to="/signup"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Sign-Up
                      </Link>
                      <Link
                        className="dropdown-item"
                        to="/login"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Login
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={logoutHandler}
                      >
                        Logout
                      </button>

                      <div className="dropdown-divider"></div>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                    </>
                  )}
                </div>
              </li>
            </ul>
            <form className="d-flex" role="search">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button className="btn btn-secondary" type="submit">
                Search
              </button>
            </form>
            <button
              type="button"
              className="theme-toggle-btn ms-lg-3 ms-0 mt-3 mt-lg-0"
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb">
                  <span className="theme-icon" />
                </span>
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
