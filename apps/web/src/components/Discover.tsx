import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import { Link } from "react-router-dom";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";
import "./css/discover.css";

export function Discover() {
    const api = useApi();
    const { theme, toggleTheme } = useTheme();

    const [booksList, setBooksList] = useState<Book[]>([]);
    const [authorList, setAuthorList] = useState<AuthorSection[] | undefined>(undefined);
    const [query, setQuery] = useState("");

    useEffect(() => {
        async function fetchData() {
            const data = await api.getData();
            setAuthorList(data.authors);

            const allBooks = data.books
                .flatMap((section: BookSection) => section.data)
                .filter((value: Book, index: number, self: Book[]) =>
                    index === self.findIndex(b => b.id === value.id)
                );

            setBooksList(allBooks);
        }
        fetchData();
    }, []);

    // === Author név lekérése ===
    function getAuthorName(authorId: string | undefined): string {
        if (!authorList) return "Unknown author";
        for (const section of authorList) {
            const author = section.data.find(a => a.id === authorId);
            if (author) return author.name;
        }
        return "Unknown author";
    }

    // === Keresés szűrés ===
    const filteredAuthors = authorList
        ? Array.from(
            new Map(
                authorList
                    .flatMap(s => s.data)
                    .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
                    .map(a => [a.id, a])
            ).values()
        )
        : [];

    const filteredBooks = booksList.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(query.toLowerCase());
        const authorMatch = getAuthorName(book.authorId).toLowerCase().includes(query.toLowerCase());
        return titleMatch || authorMatch;
    });

    const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "/book.png";
    };

    return (
        <div className='home-container'>
            <div className="home-container-discover">
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
                            <button className="Darkmode-changer" onClick={toggleTheme} aria-label="Toggle color scheme">
                                <span className={`icon sun-icon ${theme === "light" ? "visible" : ""}`}><IconSun size={20} stroke={2} /></span>
                                <span className={`icon moon-icon ${theme === "dark" ? "visible" : ""}`}><IconMoon size={20} stroke={2} /></span>
                            </button>
                            <a href="/user/me">
                                <img
                                    src={theme === "light" ? "def_profile_icon.svg" : "def_profile_icon2.svg"}
                                    alt="profile"
                                    className="profile-pic"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Search bar */}
            <div className='search-bar-on-the-left'>
                <div className="search-bar-on-discoverpage">
                <input
                    type="text"
                    placeholder="Search by book title or author..."
                    className="form-control"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>
            </div>

            {/* Találatok a keresésre */}
            {query.trim() !== "" && (
                <div className="search-results mb-4">
                    {filteredAuthors.length > 0 && (
                        <div className="mb-3">
                            <h3 className='listing-h1-authors'>Authors:</h3>
                            <div className="d-flex flex-wrap gap-3">
                                {filteredAuthors.map(author => (
                                    <Link key={author.id} to={`/author/${author.id}`} className="author-card">
                                        <div style={{ textAlign: "center" }}>
                                            <img
                                                src={author.smallerProfilePic || "/def_profile_icon.svg"}
                                                alt={author.name}
                                                style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }}
                                            />
                                            <p>{author.name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredBooks.length > 0 && (
                        <div>
                            <h3 className='listing-h1-books'>Books:</h3>
                            <div className="row g-2">
                                {filteredBooks.map(book => (
                                    <div key={book.id} className="col-3 col-md-2 text-center">
                                        <Link to={`/book/${book.id}`}>
                                            <img
                                                src={book.smallerCoverPic || "/logo.svg"}
                                                alt={book.title}
                                                className="img-fluid rounded"
                                                onError={handleBookImageError}
                                            />
                                            <p className="mt-1">{book.title}</p>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredAuthors.length === 0 && filteredBooks.length === 0 && (
                        <p className="text-muted">No results found.</p>
                    )}
                </div>
            )}
            
            <>
                {/* Authors */}
                {authorList && (
                    <div className="mb-4">
                        <h1 className='listing-h1-authors'>Authors:</h1>
                        <div className="row g-3">
                            {Array.from(
                                new Map(
                                    authorList.flatMap(s => s.data).map(a => [a.id, a])
                                ).values()
                            ).map(author => (
                                <div
                                    key={author.id}
                                    className="col-6 col-sm-4 col-md-3 col-lg-2 text-center"
                                >
                                    <Link
                                        to={`/author/${author.id}`}
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
                                                transition: "0.3s",
                                                cursor: "pointer",
                                                marginBottom: "5px",
                                            }}
                                            onError={(e) => {
                                                const currentTheme = e.currentTarget.getAttribute('data-theme');
                                                e.currentTarget.src =
                                                    currentTheme === "light" ? "/user.png" : "/user2.png";
                                            }}
                                        />
                                        <p>{author.name}</p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Books */}
                <div className="row g-3">
                    <h1 className='listing-h1-books'>Books:</h1>
                    {booksList.map(book => (
                        <div key={book.id} className="col-3 col-md-2 text-center">
                            <Link to={`/book/${book.id}`}>
                                <img
                                    src={book.smallerCoverPic || "/logo.svg"}
                                    alt={book.title}
                                    className="img-fluid rounded"
                                    onError={handleBookImageError}
                                />
                                <p className="mt-1">{book.title}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </>
        </div>

        <div className='space'></div>

        <div className="footer2">
				<p>Copyright© Readsy 2025. All rights reserved.</p>
				<p className="Privacy">Privacy & Policy</p>
			</div>
        </div>
    );
}