/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../context/apiContext";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";

export function BookDetails() {
    const { id } = useParams();
    const api = useApi();

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

    function getAuthorName(authorId: string | undefined): string {
        if (!authorList) return "Unknown author";
        for (const section of authorList) {
            const author = section.data.find((a) => a.id === authorId);
            if (author) return author.name;
        }
        return "Unknown author";
    }

    function getAuthor(authorId: string | undefined) {
        if (!authorList) return null;

        for (const section of authorList) {
            const author = section.data.find((a) => a.id === authorId);
            if (author) return author;
        }
        return null;
    }

    if (!book) return <div className="container mt-5">Loading...</div>;

    const author = getAuthor(book.authorId);

    return (
        <div>
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <div className="collapse navbar-collapse">
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
                            <a href="">
                                <img src="/def_profile_icon.svg" alt="profile" className="profile-pic" />
                            </a>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="row">

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
                            className="img-fluid rounded shadow"
                            alt={book.title}
                        />

                        <button className="btn btn-success mt-3 w-100">
                            Add to Favorites
                        </button>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="col-md-9">
                        <h2>{book.title}</h2>
                        <h5 className="text-muted">
                            <a href={`/author/${book.authorId}`} style={{ textDecoration: "none", color: "inherit" }}>
                                {getAuthorName(book.authorId)}
                            </a>
                        </h5>

                        {/* ⭐ RATING */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <strong>
                                {book.statistics?.averageRating?.toFixed(2) ?? "N/A"} ⭐
                            </strong>
                            <span className="text-muted">
                                {book.statistics?.ratingCount ?? 0} ratings | {book.statistics?.reviewCount ?? 0} reviews
                            </span>
                        </div>

                        {/* DESCRIPTION */}
                        <p className="mt-3">
                            {book.description || "No description available."}
                        </p>

                        <hr />

                        {/* 📚 GENRES */}
                        <h5>Genres</h5>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {book.genres && book.genres.length > 0 ? (
                                book.genres.map((g: any) =>
                                    g.genre ? (
                                        <span
                                            key={g.genre.id}
                                            style={{
                                                backgroundColor: "#6c8f5e",
                                                color: "white",
                                                borderRadius: "20px",
                                                padding: "6px 14px",
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            {g.genre.name}
                                        </span>
                                    ) : null
                                )
                            ) : (
                                <span className="text-muted">No genres available</span>
                            )}
                        </div>

                        {/* 📊 BOOK META */}
                        <div className="text-muted">
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

                                <div>
                                    <h5 className="text-muted">
                                        <a href={`/author/${book.authorId}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            {getAuthorName(book.authorId)}
                                        </a>
                                    </h5>

                                    <p className="text-muted mb-1">
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
        </div>
    );
}