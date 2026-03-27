/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import React, { useEffect, useState } from "react";
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

    if (!book) return <div className="container mt-5">Loading...</div>;

    return (
        <div>
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
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
                    {/* LEFT SIDE - COVER */}
                    <div className="col-md-3">
                        <img
                            src={book.biggerCoverPic || "/logo.svg"}
                            className="img-fluid rounded shadow"
                            alt={book.title}
                        />
                        <button className="btn btn-success mt-3 w-100">
                            Add to Favorites
                        </button>
                    </div>

                    {/* RIGHT SIDE - DETAILS */}
                    <div className="col-md-9">
                        <h2>{book.title}</h2>
                        <h5 className="text-muted">{getAuthorName(book.authorId)}</h5>

                        {/* CSILLAGOK ÉS RATING SZÁM */}
                        <p>
                            {book.statistics?.averageRating ?? "N/A"}⭐
                        </p>

                        <p className="mt-3">
                            Lorem ipsum placeholder description...
                        </p>

                        <hr />

                        <h5>About the author</h5>
                        <p>{getAuthorName(book.authorId)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}