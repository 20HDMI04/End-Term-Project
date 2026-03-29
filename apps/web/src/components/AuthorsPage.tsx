/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import type { AuthorSection } from "./interfaces/interfaces";

export function AuthorsPage() {
    const api = useApi();
    const [authorList, setAuthorList] = useState<AuthorSection[]>();
    const [authors, setAuthors] = useState<any[]>([]);

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

    return (
        <div>
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <img src="/logo.svg" alt="logo" className="logo" />

                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <h2>
                                    <a className="nav-link" href="/">Home</a>
                                </h2>
                            </li>
                            <li className="nav-item">
                                <h2>
                                    <a className="nav-link" href="/search">Search</a>
                                </h2>
                            </li>
                            <li className="nav-item">
                                <h2>
                                    <a className="nav-link" href="/discover">Discover</a>
                                </h2>
                            </li>
                            <a href="/user/me">
                                <img
                                    src="/def_profile_icon.svg"
                                    alt="profile"
                                    className="profile-pic"
                                />
                            </a>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* CONTENT */}
            <div className="container mt-4">
                <h1 className="mb-4" style={{ color: "#556b2f", fontFamily: "'Georgia', serif" }}>All Authors</h1>

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
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                />
                                <p>{author.name}</p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}