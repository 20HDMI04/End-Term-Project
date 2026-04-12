/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import { useEffect, useState, useCallback } from "react";
import { useApi } from "../context/apiContext";
import type { AuthorSection } from "./interfaces/interfaces";
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";

export function AuthorsPage() {
    const api = useApi();
    const [authorList, setAuthorList] = useState<AuthorSection[]>();
    const [authors, setAuthors] = useState<any[]>([]);
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    // Adatok betöltése
    useEffect(() => {
        async function fetchAuthors() {
            const data = await api.getData();
            setAuthorList(data.authors);

            // flatten és unique
            const allAuthors = data.authors
                .flatMap((section: AuthorSection) => section.data)
                .filter((value: any, index: number, self: any[]) =>
                    index === self.findIndex((a) => a.id === value.id)
                );

            setAuthors(allAuthors);

        }

        fetchAuthors();
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

    const handleAuthorImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const currentTheme = e.currentTarget.getAttribute('data-theme');
        if (currentTheme === "light") {
            e.currentTarget.src = "/user.png";
        } else {
            e.currentTarget.src = "/user2.png";
        }
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
                <h1 className="listing-h1-books">All Authors</h1><br />
                <div className="row g-3">
                    {authors.map((author) => (
                        <div
                            key={author.id}
                            className="col-6 col-sm-4 col-md-3 col-lg-2 text-center"
                        >
                            <a
                                href={`/author/${author.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <img
                                    src={author.smallerProfilePic || "/def_profile_icon.svg"}
                                    alt={author.name}
                                    data-theme={theme}
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                        transition: "transform 0.3s",
                                        cursor: "pointer",
                                        marginBottom: "5px",
                                    }}
                                    onError={handleAuthorImageError}
                                />
                                <p className="card-text">
                                    {author.name ?? "Unknown"}
                                </p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}