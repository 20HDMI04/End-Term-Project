import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState, useRef } from "react";
import { useApi } from "../context/apiContext";
import { Link } from "react-router-dom";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";
import "./css/discover.css";
import Session from "supertokens-auth-react/recipe/session";
import { NotificationBell } from "./NotificationBell";
import { useLocation } from "react-router-dom";
import { Footer } from "./Footer";

export function Discover() {
    const api = useApi();
    const { theme, toggleTheme } = useTheme();

    const [user, setUser] = useState<any>(null);
    const [booksList, setBooksList] = useState<Book[]>([]);
    const [authorList, setAuthorList] = useState<AuthorSection[] | undefined>(undefined);
    const [query, setQuery] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

    const authorRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<HTMLDivElement>(null);

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const genreFromUrl = params.get("genre");

        if (genreFromUrl) {
            setSelectedGenre(genreFromUrl);
        } else {
            setSelectedGenre(null);
        }
    }, [location.search]);
    const scrollToAuthors = () => {
        authorRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const genreFromUrl = params.get("genre");

        if (genreFromUrl) {
            setSelectedGenre(genreFromUrl);

            setTimeout(() => {
                scrollToBooks();
            }, 100);
        }
    }, [location.search]);

    const scrollToBooks = () => {
        bookRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleAuthorImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const currentTheme = e.currentTarget.getAttribute('data-theme');

        if (currentTheme === "light") {
            e.currentTarget.src = "/user.png";
        } else {
            e.currentTarget.src = "/user2.png";
        }
    };

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

    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                if (await Session.doesSessionExist()) {
                    const payload = await Session.getAccessTokenPayloadSecurely();
                    const roles = payload.roles?.roles || payload.roles || [];
                    setIsAdmin(roles.includes('admin'));
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkAdminRole();
    }, []);

    function getAuthorName(authorId: string | undefined): string {
        if (!authorList) return "Unknown author";
        for (const section of authorList) {
            const author = section.data.find(a => a.id === authorId);
            if (author) return author.name;
        }
        return "Unknown author";
    }

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

        const genreMatch = selectedGenre
            ? book.genres?.some(g => g.genre.name === selectedGenre)
            : true;

        return (titleMatch || authorMatch) && genreMatch;
    });

    const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "/book.png";
    };

    return (
        <div className='home-container'>
            <div className="home-container-discover">

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
                                <NotificationBell isAdmin={isAdmin} />
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
                                            (theme === "light" ? "/def_profile_icon.svg" : "/def_profile_icon2.svg")
                                        }
                                        alt="profile"
                                        className="profile-pic"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="discover-layout">

                    {/* SIDEBAR */}
                    <aside className="discover-sidebar">

                        <input
                            type="text"
                            placeholder="Search..."
                            className="form-control sidebar-search"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setSelectedGenre(null);
                            }}
                        />

                        <div className="sidebar-section">
                            <h5>Browse</h5>
                            <ul>
                                <li onClick={scrollToAuthors}>Authors</li>
                                <li onClick={scrollToBooks}>Books</li>
                            </ul>
                        </div>

                        <div className="sidebar-section">
                            <h5>Genres</h5>
                            <ul>
                                {["Fantasy", "Romance", "Classics", "Mystery", "History"].map(g => (
                                    <li
                                        key={g}
                                        className={selectedGenre === g ? "active" : ""}
                                        onClick={() => {
                                            setSelectedGenre(g);
                                            setQuery("");
                                            scrollToBooks();
                                        }}
                                    >
                                        {g}
                                    </li>
                                ))}
                                <li onClick={() => setSelectedGenre(null)}>All</li>
                            </ul>
                        </div>

                    </aside>

                    {/* MAIN */}
                    <main className="discover-main">

                        {query ? (
                            <>
                                <h2 className="section-title">Search results:</h2>

                                {filteredAuthors.length > 0 && (
                                    <>
                                        <h4 className='listing-h1-authors'>Authors</h4>
                                        <div className="author-grid">
                                            {filteredAuthors.map(author => (
                                                <Link key={author.id} to={`/author/${author.id}`} className="author-card">
                                                    <img
                                                        key={theme + (author.smallerProfilePic ?? "")}
                                                        src={
                                                            author.smallerProfilePic ||
                                                            (theme === "light" ? "/user.png" : "/user2.png")
                                                        }
                                                        data-theme={theme}
                                                        onError={handleAuthorImageError}
                                                    />
                                                    <p>{author.name}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {filteredBooks.length > 0 && (
                                    <>
                                        <h4 className='listing-h1-books'>Books</h4>
                                        <div className="book-grid">
                                            {filteredBooks.map(book => (
                                                <Link key={book.id} to={`/book/${book.id}`} className="book-card">
                                                    <img src={book.smallerCoverPic} onError={handleBookImageError} />
                                                    <p>{book.title}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <h2 ref={authorRef} className="section-title">Popular Authors</h2>
                                <div className="author-grid">
                                    {Array.from(
                                        new Map(
                                            authorList
                                                ?.flatMap(s => s.data)
                                                .map(a => [a.id, a])
                                        ).values()
                                    ).map(author => (
                                        <Link key={author.id} to={`/author/${author.id}`} className="author-card">
                                            <img
                                                key={theme + (author.smallerProfilePic ?? "")}
                                                src={
                                                    author.smallerProfilePic ||
                                                    (theme === "light" ? "/user.png" : "/user2.png")
                                                }
                                                data-theme={theme}
                                                onError={handleAuthorImageError}
                                            />
                                            <p>{author.name}</p>
                                        </Link>
                                    ))}
                                </div>

                                <h2 ref={bookRef} className="section-title">
                                    Books {selectedGenre && <span className="genre-label"> - {selectedGenre}</span>}
                                </h2>
                                <div className="book-grid">
                                    {filteredBooks.map(book => (
                                        <Link key={book.id} to={`/book/${book.id}`} className="book-card">
                                            <img src={book.smallerCoverPic} onError={handleBookImageError} />
                                            <p>{book.title}</p>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        {query && booksList.length > 0 && filteredBooks.length === 0 && (
                            <div className="empty-state">
                                <p>
                                    We couldn’t find any books matching "<strong>{query}</strong>".
                                </p>
                                <button
                                    className="btn btn-outline-secondary mt-2"
                                    style={{ marginBottom: "20px", marginLeft: "20px" }}
                                    onClick={() => setQuery("")}
                                >
                                    Clear search
                                </button>
                            </div>
                        )}

                    </main>
                </div>

                <Footer />
            </div>
        </div>


    );
}