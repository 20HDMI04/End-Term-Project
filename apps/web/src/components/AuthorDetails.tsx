/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../context/apiContext";
import type { AuthorSection, BookSection } from "./interfaces/interfaces";

export function AuthorDetails() {
    const { id } = useParams();
    const api = useApi();

    const [author, setAuthor] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            const data = await api.getData();

            // 👤 Author keresése
            for (const section of data.authors as AuthorSection[]) {
                const found = section.data.find((a) => a.id === id);
                if (found) {
                    setAuthor(found);
                    break;
                }
            }

            // 📚 Könyvek lekérése + duplikáció szűrés
            const allBooks = data.books.flatMap((section: BookSection) => section.data);
            const filteredBooks = allBooks.filter((b) => b.authorId === id);

            const uniqueBooks = Array.from(
                new Map(filteredBooks.map((b) => [b.id, b])).values()
            );

            setBooks(uniqueBooks);
        }

        fetchData();
    }, [id]);

    if (!author) return <div className="container mt-5">Loading...</div>;

    return (
        <div>
            {/* Navbar */}
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

                    {/* 👤 LEFT SIDE - STICKY */}
                    <div
                        className="col-md-3"
                        style={{
                            position: "sticky",
                            top: "80px",
                            height: "fit-content"
                        }}
                    >
                        <div className="text-center">
                            <img
                                src={author.biggerProfilePic || "/def_profile_icon.svg"}
                                alt={author.name}
                                style={{
                                    width: "240px",   // 🔥 nagyobb kép
                                    height: "240px",
                                    borderRadius: "50%", // 🔥 kör alak
                                    objectFit: "cover",
                                    boxShadow: "0 6px 15px rgba(0,0,0,0.25)"
                                }}
                            />
                        </div>
                    </div>

                    {/* 📄 RIGHT SIDE */}
                    <div className="col-md-9">
                        <h2>{author.name}</h2>

                        <p className="text-muted">
                            {author.nationality ?? "Unknown nationality"}
                            {author.birthDate && ` • ${new Date(author.birthDate).getFullYear()}`}
                        </p>

                        <p style={{ maxWidth: "700px" }}>
                            {author.bio ?? "No biography available."}
                        </p>

                        <hr />

                        {/* 📚 BOOKS */}
                        <h4>Books by {author.name}</h4>

                        <div className="row mt-3">
                            {books.length > 0 ? (
                                books.map((book) => (
                                    <div key={book.id} className="col-md-3 mb-4 text-center">
                                        <a href={`/book/${book.id}`}>
                                            <img
                                                src={book.smallerCoverPic}
                                                className="img-fluid rounded shadow"
                                                alt={book.title}
                                                style={{
                                                    height: "220px",
                                                    objectFit: "cover",
                                                    transition: "0.2s"
                                                }}
                                            />
                                        </a>

                                        <p className="mt-2 mb-0">{book.title}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No books found.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}