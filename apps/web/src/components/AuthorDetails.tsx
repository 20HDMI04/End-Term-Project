/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../context/apiContext";
import type { AuthorSection, BookSection } from "./interfaces/interfaces";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "../context/darkmodeContext";
import "./css/author.css";
import Session from "supertokens-auth-react/recipe/session";
import { NotificationBell } from "./NotificationBell";

export function AuthorDetails() {
    const { id } = useParams();
    const api = useApi();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [author, setAuthor] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const authorFallback = theme === "light" ? "/user.png" : "/user2.png";

    useEffect(() => {
        async function fetchData() {
            if (!id) return;

            try {
                const data = await api.getData();

                for (const section of data.authors as AuthorSection[]) {
                    const found = section.data.find((a) => a.id === id);
                    if (found) {
                        setAuthor(found);
                        break;
                    }
                }

                const allBooks = data.books.flatMap((section: BookSection) => section.data);
                const filteredBooks = allBooks.filter((b) => b.authorId === id);

                const uniqueBooks = Array.from(
                    new Map(filteredBooks.map((b) => [b.id, b])).values()
                );

                setBooks(uniqueBooks);
            } catch (err) {
                console.error("Error fetching author:", err);
            }
        }

        fetchData();
    }, [id, api]);

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

    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                if (await Session.doesSessionExist()) {
                    const payload = await Session.getAccessTokenPayloadSecurely();
                    const roles = payload.roles?.roles || payload.roles || [];
                    setIsAdmin(roles.includes("admin"));
                }
            } catch (err) {
                console.error("Error checking admin role:", err);
            }
        };
        checkAdminRole();
    }, []);

    useEffect(() => {
        async function checkFavorite() {
            try {
                const currentUser = await api.getCurrentUser();
                const isFav = currentUser.favoriteAuthors?.some(
                    (fav: any) => fav.author.id === id
                );
                setIsFavorited(isFav || false);
            } catch (err) {
                console.error("Error checking favorite status:", err);
            }
        }
        if (id) checkFavorite();
    }, [id, api]);

    async function handleFavoriteClick() {
        if (!id || isLoading) return;

        setIsLoading(true);
        try {
            if (isFavorited) {
                await api.unlikeAuthor(id);
                setIsFavorited(false);
            } else {
                await api.likeAuthor(id);
                setIsFavorited(true);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    if (!author) return <div className="container mt-5">Loading...</div>;

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
                            <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
                            <li className="nav-item"><a className="nav-link" href="/search">Search</a></li>
                            <li className="nav-item"><a className="nav-link" href="/discover">Discover</a></li>
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
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-3" style={{ display: "flex", alignItems: "center", gap: "6px" }}>← Vissza</button>
                <div className="row">

                    {/* LEFT SIDE */}
                    <div className="col-md-3" style={{ position: "sticky", top: "80px" }}>
                        <div className="card-text-center">
                            <img
                                key={`${author.id}-${theme}-${author.biggerProfilePic || ""}`}
                                src={author.biggerProfilePic || authorFallback}
                                alt={author.name}
                                data-theme={theme}
                                onError={(e) => {
                                    e.currentTarget.src = authorFallback;
                                }}
                                style={{
                                    width: "240px",
                                    height: "240px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    boxShadow: "0 6px 15px rgba(0,0,0,0.25)"
                                }}
                            />
                        </div>

                        <button
                            className={`custom-btn ${isFavorited ? "btn-danger" : "btn-success"} btn w-80 mt-3`}
                            onClick={handleFavoriteClick}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Loading..."
                                : isFavorited
                                    ? "❤️ Remove from Favorites"
                                    : "♡ Add to Favorites"}
                        </button>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="author-page-text col-md-9">
                        <h2>{author.name}</h2>

                        <p>
                            {author.nationality ?? "Unknown nationality"}
                            {author.birthDate &&
                                ` • ${new Date(author.birthDate).getFullYear()}`}
                        </p>

                        <p style={{ maxWidth: "700px" }}>
                            {author.bio ?? "No biography available."}
                        </p>

                        <hr />

                        <h4>Books by {author.name}</h4>

                        <div className="row mt-3">
                            {books.length > 0 ? (
                                books.map((book) => (
                                    <div key={book.id} className="col-md-3 mb-4 text-center">
                                        <a href={`/book/${book.id}`}>
                                            <img
                                                src={book.smallerCoverPic || "/book.png"}
                                                className="img-fluid rounded shadow"
                                                alt={book.title}
                                                onError={(e) => { e.currentTarget.src = "/book.png"; }}
                                                style={{
                                                    height: "220px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </a>
                                        <p className="mt-2 mb-0">{book.title}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="author-page-text">No books found.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}