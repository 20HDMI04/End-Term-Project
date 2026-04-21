import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import { Link, useNavigate } from "react-router-dom";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";
import "./css/search.css";
import { NotificationBell } from "./NotificationBell";
import Session from "supertokens-auth-react/recipe/session";

export function Search() {
  const api = useApi();
  const navigate = useNavigate();

  const [booksList, setBooksList] = useState<Book[]>([]);
  const [authorList, setAuthorList] = useState<AuthorSection[] | undefined>(undefined);
  const [query, setQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Betöltjük az adatokat
  useEffect(() => {
    async function fetchData() {
      const data = await api.getData();
      setAuthorList(data.authors);

      const allBooks = data.books
        .flatMap((section: BookSection) => section.data)
        .filter((value: Book, index: number, self: Book[]) =>
          index === self.findIndex((b) => b.id === value.id)
        );

      setBooksList(allBooks);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [api]);

  // Admin check
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        if (await Session.doesSessionExist()) {
          const payload = await Session.getAccessTokenPayloadSecurely();
          const roles = payload.roles?.roles || payload.roles || [];
          setIsAdmin(roles.includes('admin'));
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
      }
    };
    checkAdminRole();
  }, []);

  // Author név
  function getAuthorName(authorId: string | undefined): string {
    if (!authorList) return "Unknown author";
    for (const section of authorList) {
      const author = section.data.find((a) => a.id === authorId);
      if (author) return author.name;
    }
    return "Unknown author";
  } 

  // 🔎 SZŰRÉS
  const filteredBooks = booksList.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(query.toLowerCase());
    const authorMatch = getAuthorName(book.authorId).toLowerCase().includes(query.toLowerCase());
    return titleMatch || authorMatch;
  });

  const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/book.png";
  };

  return (
    <div className="home-container mt-4">

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <img
            src={theme === "light" ? "/logo.svg" : "/logo2.svg"}
            alt="logo"
            className="logo"
          />

          <div className="navbar-content">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/search">Search</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/discover">Discover</a>
              </li>
            </ul>

            <div className="navbar-right">
              <NotificationBell isAdmin={isAdmin} />

              <button
                className="Darkmode-changer"
                onClick={toggleTheme}
                aria-label="Toggle color scheme"
              >
                <span className={`icon sun-icon ${theme === "light" ? "visible" : ""}`}>
                  <IconSun size={20} stroke={2} />
                </span>
                <span className={`icon moon-icon ${theme === "dark" ? "visible" : ""}`}>
                  <IconMoon size={20} stroke={2} />
                </span>
              </button>

              <a href="/user/me">
                <img
                  src={
                    user?.smallerProfilePic ||
                    user?.biggerProfilePic ||
                    (theme === "light" ? "/def_profile_icon.svg" : "/def_profile_icon2.svg")
                  }
                  alt="profile"
                  className="profile-pic"
                />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* SEARCH BAR */}
      <div
        className='search-bar-bg'
        style={{
          backgroundImage: `url(${theme === "light" ? "/search-bg.png" : "/search-bg-dark.png"})`
        }}
      >
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by book title or author..."
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 🎯 GENRE KATEGÓRIÁK */}
      {query.trim() === "" && (
        <div className="categories">
          <h5 className="categories-title">Categories</h5>

          <div className="categories-grid">
            {["Fantasy", "Romance", "Classics", "Mystery", "History"].map((genre) => {
              const bookWithGenre = booksList.find(b =>
                b.genres?.some(g => g.genre.name === genre)
              );

              return (
                <div
                  key={genre}
                  className="category-tile"
                  onClick={() => navigate(`/discover?genre=${genre}`)}
                  style={{
                    backgroundImage: bookWithGenre?.biggerCoverPic
                      ? `url(${bookWithGenre.biggerCoverPic})`
                      : undefined
                  }}
                >
                  <div className="overlay" />
                  <span>{genre}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📚 TALÁLATOK */}
      {query.trim() !== "" && (
        <div className="row g-3" style={{marginLeft: "300px", marginRight: "250px"}}>
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-col">
              <Link to={`/book/${book.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="books-display-main">
                  <div className="card book-card" style={{ width: "150px" }}>

                    <div className="rating-main">
                      <p
                        className="rating-display"
                        style={{
                          backgroundImage: `url(${theme === "light" ? "/rating.svg" : "/rating2.svg"})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "cover"
                        }}
                      >
                        {book.statistics?.averageRating.toFixed(2) ?? "No rating"}
                      </p>
                    </div>

                    <img
                      src={book.biggerCoverPic || "/logo.svg"}
                      className="card-img-top"
                      alt={book.title}
                      style={{
                        height: "250px",
                        objectFit: "cover",
                        borderRadius: "5px"
                      }}
                      onError={handleBookImageError}
                    />

                    <div className="card-body p-2">
                      <h6 className="card-title">{book.title}</h6>
                      <p className="card-text">
                        {book.author?.name ?? "Unknown"}
                      </p>
                    </div>

                  </div>
                </div>
              </Link>
            </div>
          ))}

          {filteredBooks.length === 0 && (
            <div className="empty-state">
              <p>
                We couldn’t find any books matching "<strong>{query}</strong>".
              </p>
              <button
                className="btn btn-outline-secondary mt-2"
                style={{marginBottom: "20px", marginLeft: "20px"}}
                onClick={() => setQuery("")}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}