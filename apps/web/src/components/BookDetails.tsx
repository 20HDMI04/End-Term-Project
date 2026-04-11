/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../context/apiContext";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import { Link } from "react-router-dom";

export function BookDetails() {
    const { id } = useParams();
    const api = useApi();
    const { theme, toggleTheme } = useTheme();
    const [book, setBook] = useState<Book | null>(null);
    const [authorList, setAuthorList] = useState<AuthorSection[] | undefined>(undefined);

    useEffect(() => {
        async function fetchData() {
            const data = await api.getData();
            setAuthorList(data.authors);

            const allBooks = data.books.flatMap((section: BookSection) => section.data);
            const selectedBook = allBooks.find((b) => b.id === id);
            setBook(selectedBook || null);
        }
        fetchData();
    }, [id]);

    function getAuthor(authorId: string | undefined) {
        if (!authorList || !authorId) return null;

        for (const section of authorList) {
            const author = section.data.find((a) => String(a.id) === String(authorId));
            if (author) return author;
        }
        return null;
    }

    if (!book) return <div className="container mt-5">Loading...</div>;

    const author = getAuthor(book.authorId) ?? null;

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
                <div className="book-page-text row">

                    {/* 📌 LEFT SIDE - STICKY */}
                    <div
                        className="col-md-3"
                        style={{
                            position: "sticky",
                            top: "80px", // navbar miatt
                            height: "fit-content"
                        }}
                    >
                        <img
                            src={book.biggerCoverPic || "/logo.svg"}
                            className="book-page-text img-fluid rounded shadow"
                            alt={book.title}
                        />

                        <button className="btn btn-success mt-3 w-100">
                            Add to Favorites
                        </button>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className=" book-page-text book-page-text col-md-9">
                        <h2>{book.title}</h2>
                        <h5 className="book-page-text">
                            <a href={`/author/${book.authorId}`} style={{ textDecoration: "none", color: "inherit" }}>
                                {book.author.name}
                            </a>
                        </h5>

                        {/* ⭐ RATING */}
                        <div className="book-page-text d-flex align-items-center gap-2 mb-2">
                            <strong>
                                {book.statistics?.averageRating?.toFixed(2) ?? "N/A"} ⭐
                            </strong>
                            <span className="book-page-text">
                                {book.statistics?.ratingCount ?? 0} ratings {/*| {book.statistics?.reviewCount ?? 0} reviews */}
                            </span>
                        </div>

                        {/* DESCRIPTION */}
                        <p className="book-page-text mt-3">
                            {book.description || "No description available."}
                        </p>

                        <hr />

                        {/* 📚 GENRES */}
                        <h5>Genres</h5>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {book.genres && book.genres.length > 0 ? (
                                book.genres.map((g: any) =>
                                    g.genre ? (
                                        <Link
                                            key={g.genreId}
                                            to={`/genres/${g.genreId}`} // ide navigál a kattintás
                                            className="book-genres"
                                            style={{
                                                color: "white",
                                                borderRadius: "20px",
                                                padding: "6px 14px",
                                                fontSize: "0.9rem",
                                                textDecoration: "none"
                                            }}
                                        >
                                            {g.genre.name}
                                        </Link>
                                    ) : null
                                )
                            ) : (
                                <span className="text-muted">No genres available</span>
                            )}
                        </div>

                        {/* 📊 BOOK META */}
                        <div className="book-page-text">
                            <p>
                                <strong>{book.pageNumber ?? "?"}</strong> pages <br />
                                First published in <strong>{book.originalPublicationYear ?? "Unknown"}</strong><br />
                                Publisher: <strong>{book.originalPublisher ?? "Unknown"}</strong>
                            </p>
                        </div>

                        <hr />

                        {/* 👤 AUTHOR */}
                        <h5>About the author</h5>
                        {author ? (
                            <div className="d-flex gap-3 align-items-start mt-3">
                                <Link
                                    to={`/author/${book.authorId}`}
                                    style={{ textDecoration: "none", color: "inherit" }}
                                    className="author-link-wrapper"
                                >
                                    <img
                                        src={author.smallerProfilePic || "/def_profile_icon.svg"}
                                        alt={author.name}
                                        style={{
                                            width: "70px",
                                            height: "70px",
                                            borderRadius: "50%",
                                            objectFit: "cover"
                                        }}
                                    />
                                </Link>

                                <div>
                                    <h5 className="book-page-text">
                                        <a href={`/author/${book.authorId}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            {book.author.name}
                                        </a>
                                    </h5>

                                    <p className="book-page-text mb-1">
                                        {author.nationality ?? "Unknown nationality"}
                                        {author.birthDate && ` • ${new Date(author.birthDate).getFullYear()}`}
                                    </p>

                                    <p style={{ maxWidth: "600px" }}>
                                        {author.bio ?? "No biography available."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted">Author not found</p>
                        )}
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