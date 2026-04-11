import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApi } from "../context/apiContext";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "../context/darkmodeContext";
import type { BookSection, Book } from "./interfaces/interfaces";

interface Genre {
    id: string;
    name: string;
}

export function Genre() {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useApi();
    const { theme, toggleTheme } = useTheme();

    const [books, setBooks] = useState<Book[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);

    // 🎯 NULL = ALL GENRES (clean solution)
    const selectedGenre = id ?? null;

    useEffect(() => {
        async function fetchData() {
            const data = await api.getData();

            // 📚 all books
            const allBooks = data.books
                .flatMap((section: BookSection) => section.data)
                .filter(
                    (value: Book, index: number, self: Book[]) =>
                        index === self.findIndex(b => b.id === value.id)
                );

            setBooks(allBooks);

            // 🎯 unique genres + ABC sort
            const allGenres: Genre[] = Array.from(
                new Map(
                    allBooks
                        .flatMap(book => book.genres || [])
                        .map(g => [
                            g.genreId,
                            {
                                id: g.genreId,
                                name: g.genre.name
                            }
                        ])
                ).values()
            ).sort((a, b) => a.name.localeCompare(b.name));

            setGenres(allGenres);
        }

        fetchData();
    }, []);

    // 🎯 FILTER LOGIC
    const filteredBooks =
        !selectedGenre
            ? books
            : books.filter(book =>
                book.genres?.some(g => g.genreId === selectedGenre)
            );

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

                            <a href="/user/me">
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

            {/* Content */}
            <div className="container mt-4">

                <h1 className="listing-h1-books">Browse Genres</h1><br />

                {/* 🎯 DROPDOWN (FIXED ALL LOGIC) */}
                <div className="mb-4" style={{ maxWidth: "250px" }}>
                    <select
                        className="form-select"
                        value={selectedGenre ?? "all"}
                        onChange={(e) => {
                            const value = e.target.value;

                            if (value === "all") {
                                navigate("/genres", { replace: true });
                            } else {
                                navigate(`/genres/${value}`, { replace: true });
                            }
                        }}
                    >
                        <option value="all">All genres</option>

                        {genres.map(genre => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 📚 BOOK GRID */}
                <div className="d-flex flex-wrap justify-content-center gap-4">
                    {filteredBooks.map(book => (
                        <Link
                            key={book.id}
                            to={`/book/${book.id}`}
                            style={{
                                textDecoration: "none",
                                color: "#556b2f",
                                width: "160px",
                                textAlign: "center"
                            }}
                        >
                            <img
                                src={book.smallerCoverPic || "/logo.svg"}
                                style={{
                                    width: "160px",
                                    height: "240px",
                                    objectFit: "cover",
                                    borderRadius: "8px"
                                }}
                            />
                            <p className="mt-1">{book.title}</p>
                        </Link>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredBooks.length === 0 && (
                    <p className="text-center mt-4">No books found.</p>
                )}
            </div>
        </div>
    );
}