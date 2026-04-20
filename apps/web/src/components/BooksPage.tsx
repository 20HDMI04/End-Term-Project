/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import { Link } from "react-router-dom";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import Session from "supertokens-auth-react/recipe/session";
import { NotificationBell } from "./NotificationBell";

export function BooksPage() {
    const api = useApi();
    const [books, setBooks] = useState<Book[]>([]);
    const [authorList, setAuthorList] = useState<AuthorSection[]>();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function fetchBooks() {
            const data = await api.getData();

            const allBooks = data.books
                .flatMap((section: BookSection) => section.data)
                .filter(
                    (value: Book, index: number, self: Book[]) =>
                        index === self.findIndex((b) => b.id === value.id)
                );
            setBooks(allBooks);
            setAuthorList(data.authors);
        }

        fetchBooks();
    }, [api]);

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

    // Check if user is admin
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
                                        (theme === "light"
                                            ? "/def_profile_icon.svg"
                                            : "/def_profile_icon2.svg")
                                    }
                                    alt="profile"
                                    className="profile-pic"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* CONTENT */}
            <div className="container mt-4">
                <h1 className="listing-h1-books" style={{marginBottom: "10px"}}>All Books</h1>

                <div className="d-flex flex-wrap justify-start gap-4">
                    {books.map((book) => (
                        <Link
                            key={book.id}
                            to={`/book/${book.id}`}
                            style={{
                                textDecoration: "none",
                                color: "#556b2f",
                                width: "160px",
                                textAlign: "center",
                                fontFamily: "'Georgia', serif",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    border: "1px solid var(--accent-bg)",
                                }}
                            >
                                <img
                                    src={book.biggerCoverPic || "/logo.svg"}
                                    alt={book.title}
                                    style={{
                                        width: "160px",
                                        height: "240px",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "8px",
                                        right: "8px",
                                        backgroundColor: "#485b1fc4",
                                        color: "white",
                                        borderRadius: "8px",
                                        padding: "2px 6px",
                                        fontSize: "0.75rem",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        zIndex: 10,
                                        pointerEvents: "none",
                                    }}
                                >
                                </div>
                            </div>

                            <h6 className="book-page-text" style={{ marginTop: "8px", fontWeight: "600" }}>{book.title}</h6>
                            <p className="book-page-text" style={{ fontStyle: "italic", fontSize: "0.9rem", margin: 0 }}>
                                {book.author.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}