/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import "./css/home.css"

export function UserProfile() {
    const api = useApi();
    const [user, setUser] = useState<any>(null);
    const { theme, toggleTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            setIsLoading(true);
            try {
                const fetchedUser = await api.getCurrentUser();
                setUser(fetchedUser);
            } catch (err) {
                console.error("Error fetching current user:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [api]);

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            const fetchedUser = await api.getCurrentUser();
            setUser(fetchedUser);
        } catch (err) {
            console.error("Error fetching current user:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="container mt-5 text-dark">Loading...</div>;

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
                                    src={theme === "light" ? "/def_profile_icon.svg" : "/def_profile_icon2.svg"}
                                    alt="profile"
                                    className="profile-pic"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="row">
                    {/* LEFT SIDE - PROFILE INFO */}
                    <div className="col-md-3 text-center" style={{ position: "sticky", top: "80px", height: "fit-content" }}>
                        <img
                            src={user.biggerProfilePic || "/def_profile_icon.svg"}
                            alt={user.username}
                            style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
                            }}
                        />
                        <h2 className="mt-3">{user.nickname ?? user.username}</h2>
                        <p>{user.email}</p>

                        {/* User stats */}
                        <div className="mt-4" style={{ textAlign: "left", paddingLeft: "20px" }}>
                            <p><strong>Favorite Books:</strong> {user.favoriteBooks?.length ?? 0}</p>
                            <p><strong>Favorite Authors:</strong> {user.favoriteAuthors?.length ?? 0}</p>
                            <p><strong>Comments:</strong> {user.comments?.length ?? 0}</p>
                            <p><strong>Ratings:</strong> {user.ratings?.length ?? 0}</p>
                            <p><strong>Have Read:</strong> {user.haveReadIt?.length ?? 0}</p>
                        </div>

                        <button 
                            onClick={refreshUser}
                            disabled={isLoading}
                            className="btn btn-success w-100 mt-3"
                        >
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {/* RIGHT SIDE - CONTENT */}
                    <div className="col-md-9">
                        {/* Favorite Books */}
                        <h1 className="listing-h1-books">Favorite Books</h1>
                        <div className="books-container mt-4">
                            {user.favoriteBooks?.length ? (
                                <div className="d-flex flex-wrap gap-3 justify-start">
                                    {user.favoriteBooks.map((f: any) => (
                                        <a key={f.book.id} href={`/book/${f.book.id}`} style={{ textDecoration: "none" }}>
                                            <div className="books-display-main">
                                                <div
                                                    className="card book-card"
                                                    style={{
                                                        width: "150px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                    }}
                                                >
                                                    <div className="rating-main">
                                                        <p className="rating-display">
                                                            {f.book.statistics?.averageRating?.toFixed(1) ?? "No rating"}
                                                        </p>
                                                    </div>
                                                    <img
                                                        src={f.book.biggerCoverPic || "/logo.svg"}
                                                        className="card-img-top"
                                                        alt={f.book.title}
                                                        style={{
                                                            height: "250px",
                                                            objectFit: "cover",
                                                            flexShrink: 0,
                                                            borderRadius: "5px"
                                                        }}
                                                    />
                                                    <div className="card-body p-2" style={{ flexGrow: 1 }}>
                                                        <h6 className="card-title">{f.book.title}</h6>
                                                        <p className="card-text">
                                                            {f.book.author?.name ?? "Unknown"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No favorite books yet.</p>
                            )}
                        </div>

                        {/* Favorite Authors */}
                        <h1 className="listing-h1-authors mt-5">Favorite Authors</h1>
                        <div className="authors-container mt-5">
                            {user.favoriteAuthors?.length ? (
                                <div className="d-flex justify-content-center gap-5 flex-wrap">
                                    {user.favoriteAuthors.map((f: any) => (
                                        <a key={f.author.id} href={`/author/${f.author.id}`} className="text-center" style={{ textDecoration: "none" }}>
                                            <img
                                                className="author-ppic"
                                                src={f.author.smallerProfilePic || "/logo.svg"}
                                                alt={f.author.name}
                                                style={{
                                                    width: "140px",
                                                    height: "140px",
                                                    objectFit: "cover",
                                                    borderRadius: "50%",
                                                }}
                                            />
                                            <p className="author-name">
                                                {f.author.name ?? "Unknown Author"}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No favorite authors yet.</p>
                            )}
                        </div>

                        {/* Books I've Read */}
                        <h1 className="listing-h1-books mt-5">Books I've Read</h1>
                        <div className="books-container mt-4">
                            {user.haveReadIt?.length ? (
                                <div className="d-flex flex-wrap gap-3 justify-start">
                                    {user.haveReadIt.map((h: any) => (
                                        <a key={h.book.id} href={`/book/${h.book.id}`} style={{ textDecoration: "none" }}>
                                            <div className="books-display-main">
                                                <div
                                                    className="card book-card"
                                                    style={{
                                                        width: "150px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                    }}
                                                >
                                                    <div className="rating-main">
                                                        <p className="rating-display">
                                                            {h.book.statistics?.averageRating?.toFixed(1) ?? "No rating"}
                                                        </p>
                                                    </div>
                                                    <img
                                                        src={h.book.biggerCoverPic || "/logo.svg"}
                                                        className="card-img-top"
                                                        alt={h.book.title}
                                                        style={{
                                                            height: "250px",
                                                            objectFit: "cover",
                                                            flexShrink: 0,
                                                            borderRadius: "5px"
                                                        }}
                                                    />
                                                    <div className="card-body p-2" style={{ flexGrow: 1 }}>
                                                        <h6 className="card-title">{h.book.title}</h6>
                                                        <p className="card-text">
                                                            {h.book.author?.name ?? "Unknown"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No books read yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="gap"></div>

            <div className="footer2">
                <p>Copyright© Readsy 2025. All rights reserved.</p>
                <p className="Privacy">Privacy & Policy</p>
            </div>
        </div>
    );
}