/* eslint-disable @typescript-eslint/no-explicit-any */ 
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import { Link } from "react-router-dom";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";

export function BooksPage() {
    const api = useApi();
    const [books, setBooks] = useState<Book[]>([]);
    const [authorList, setAuthorList] = useState<AuthorSection[]>();

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

    function getAuthorName(authorId: string | undefined): string {
        if (!authorList) return "Unknown author";

        for (const section of authorList) {
            const author = section.data.find((a) => a.id === authorId);
            if (author) {
                return author.name;
            }
        }
        return "Unknown author";
    }

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
                            <a href="">
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
                <h1 className="mb-4" style={{ color: "#556b2f", fontFamily: "'Georgia', serif" }}>All Books</h1>

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
                                    }}
                                >
                                    <span>{book.statistics?.averageRating?.toFixed(2) ?? "N/A"}</span>
                                    <svg
                                        width="14"
                                        height="14"
                                        fill="currentColor"
                                        className="bi bi-star-fill"
                                        viewBox="0 0 16 16"
                                        style={{ color: "#ffd000" }}
                                    >
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.063.612.63.282.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                    </svg>
                                </div>
                            </div>

                            <h6 style={{ marginTop: "8px", fontWeight: "600" }}>{book.title}</h6>
                            <p style={{ fontStyle: "italic", fontSize: "0.9rem", margin: 0 }}>
                                {getAuthorName(book.authorId)}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}