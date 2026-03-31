import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";

export function Search() {

    const { theme, toggleTheme } = useTheme();


    return (
        <div className="home-container">
            {/* Navbar */}
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

                            <a href="/profile">
                                <img
                                    src={theme === "light" ? "def_profile_icon.svg" : "def_profile_icon2.svg"}
                                    alt="profile"
                                    className="profile-pic"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>


            <header>
                {/* Search bar */}
            </header>

            <div>
                {/* Explore */}
            </div>

            <div>
                {/* For You */}
            </div>
/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import { Link } from "react-router-dom";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";

export function Search() {
  const api = useApi();
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [authorList, setAuthorList] = useState<AuthorSection[] | undefined>(undefined);
  const [query, setQuery] = useState("");

  // Betöltjük az összes könyvet és szerzőt
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

  // Author név lekérése
  function getAuthorName(authorId: string | undefined): string {
    if (!authorList) return "Unknown author";
    for (const section of authorList) {
      const author = section.data.find((a) => a.id === authorId);
      if (author) return author.name;
    }
    return "Unknown author";
  }

  // Keresés szűrés
  const filteredBooks = booksList.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(query.toLowerCase());
    const authorMatch = getAuthorName(book.authorId).toLowerCase().includes(query.toLowerCase());
    return titleMatch || authorMatch;
  });

  return (
    <div className="container mt-4">
      {/* Navbar */}
			<nav className="navbar navbar-expand-lg">
				<div className="container-fluid">
					<div className="collapse navbar-collapse" id="navbarNavDropdown">
						<img src="/logo.svg" alt="logo" className="logo" />

						<ul className="navbar-nav">
							<li className="nav-item">
								<h2><a className="nav-link" href="/">Home</a></h2>
							</li>
							<li className="nav-item">
								<h2><a className="nav-link" href="/search">Search</a></h2>
							</li>
							<li className="nav-item">
								<h2><a className="nav-link" href="/discover">Discover</a></h2>
							</li>
							<a href="/user/me">
								<img
									src={"/def_profile_icon.svg"}
									alt="profile"
									className="profile-pic"
								/>
							</a>
						</ul>
					</div>
				</div>
			</nav>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by book title or author..."
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Találatok */}
      {query.trim() !== "" && (
        <div className="row g-3">
          {filteredBooks.map((book) => (
            <div key={book.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <Link to={`/book/${book.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card h-100 shadow-sm book-card">
                  <img
                    src={book.biggerCoverPic || "/logo.svg"}
                    className="card-img-top"
                    alt={book.title}
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                  <div className="card-body p-2">
                    <h6 className="card-title">{book.title}</h6>
                    <p className="card-text text-muted" style={{ fontSize: "0.8rem" }}>
                      {getAuthorName(book.authorId)}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
          {filteredBooks.length === 0 && <p className="mt-3">No books found.</p>}
        </div>
      )}
    </div>
  );
}