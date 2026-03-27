/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import React, { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import { Link } from "react-router-dom";
import type { BookSection, Book, AuthorSection, Author } from "./interfaces/interfaces";

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
    }, []);


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
                <h1 className="mb-4">All Books</h1>

                <div className="row g-3">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            className="col-6 col-sm-4 col-md-3 col-lg-2"
                        >
                            <Link
                                to={`/book/${book.id}`}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                <div className="card h-100 shadow-sm book-card">
                                    <img
                                        src={book.biggerCoverPic || "/logo.svg"}
                                        className="card-img-top"
                                        alt={book.title}
                                        style={{
                                            height: "200px",
                                            objectFit: "cover",
                                        }}
                                    />

                                    <div className="card-body p-2">
                                        <h6 className="card-title">
                                            {book.title}
                                        </h6>
                                        <p>
                                            {getAuthorName(book.authorId)}
                                        </p>
                                        <p
                                            className="card-text text-muted"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            Rating:{" "}
                                            {book.statistics?.averageRating ?? "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}