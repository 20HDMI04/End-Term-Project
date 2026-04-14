/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../context/apiContext";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";
import { IconSun, IconMoon, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import { Link } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NotificationBell } from "./NotificationBell";

export function BookDetails() {
    const { id } = useParams();
    const api = useApi();
    const { theme, toggleTheme } = useTheme();
    const [book, setBook] = useState<Book | null>(null);
    const [authorList, setAuthorList] = useState<AuthorSection[] | undefined>(undefined);
    const [isFavorited, setIsFavorited] = useState(false);
    const [haveRead, setHaveRead] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [isRatingLoading, setIsRatingLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            try {
                const data = await api.getData();
                setAuthorList(data.authors);

                const allBooks = data.books.flatMap((section: BookSection) => section.data);
                const selectedBook = allBooks.find((b) => b.id === id);
                console.log("Book found:", selectedBook);
                setBook(selectedBook || null);
            } catch (err) {
                console.error("Error fetching books:", err);
            }
        }
        fetchData();
    }, [id, api]);

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

    // Check if user is admin
    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                if (await Session.doesSessionExist()) {
                    const payload = await Session.getAccessTokenPayloadSecurely();
                    const roles = payload.roles?.roles || payload.roles || [];
                    setIsAdmin(roles.includes('admin'));
                }
            } catch (err) {
                console.error('Error checking admin role:', err);
            }
        };
        checkAdminRole();
    }, []);

    // Check if book is favorited
    useEffect(() => {
        async function checkFavorite() {
            try {
                const currentUser = await api.getCurrentUser();
                const isFav = currentUser.favoriteBooks?.some((fav: any) => fav.book.id === id);
                setIsFavorited(isFav || false);
            } catch (err) {
                console.error("Error checking favorite status:", err);
            }
        }
        if (id) checkFavorite();
    }, [id, api]);
    useEffect(() => {
        async function checkHaveRead() {
            try {
                const currentUser = await api.getCurrentUser();
                const haveRead = currentUser.haveReadIt?.some((b: any) => b.bookId === id);
                setHaveRead(haveRead || false);
            } catch (err) {
                console.error("Error checking have read status:", err);
            }
        }
        if (id) checkHaveRead();
    }, [id, api]);


    function getAuthor(authorId: string | undefined) {
        if (!authorList || !authorId) return null;

        for (const section of authorList) {
            const author = section.data.find((a) => String(a.id) === String(authorId));
            if (author) return author;
        }
        return null;
    }

    useEffect(() => {
        async function loadUserRating() {
            try {
                const user = await api.getCurrentUser();
                const existing = user?.ratings?.find((r: any) => r.bookId === id);
                if (existing) setRating(existing.score);
            } catch (e) {
                console.error(e);
            }
        }

        if (id) loadUserRating();
    }, [id, api]);

    async function handleFavoriteClick() {
        if (!id || isLoading) return;

        setIsLoading(true);
        try {
            console.log("Current favorite state:", isFavorited);
            console.log("Book ID:", id);

            if (isFavorited) {
                console.log("Unliking book...");
                await api.unlikeBook(id);
                setIsFavorited(false);
            } else {
                console.log("Liking book...");
                await api.likeBook(id);
                setIsFavorited(true);
            }
            console.log("Success!");
        } catch (err: any) {
            console.error("Error toggling favorite:", err);
            alert(`Failed to update favorite:\n${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    }
    async function handleHaveReadClick() {
        if (!id || isLoading) return;
        setIsLoading(true);
        try {            console.log("Current have read state:", haveRead);
            console.log("Book ID:", id);
            if (haveRead) {
                console.log("Removing from have read...");
                await api.removeHaveRead(id);
                setHaveRead(false);
            } else {
                console.log("Adding to have read...");
                await api.addHaveRead(id);
                setHaveRead(true);
            }
        } catch (err) {
            console.error("Error toggling have read status:", err);
        } finally {
            setIsLoading(false);
        }
    }


    async function submitRating(value: number) {
        if (!id || isRatingLoading) return;

        console.log("current rating:", rating);
        console.log("clicked rating:", value);

        setIsRatingLoading(true);

        try {
            const intRating = Math.round(value);

            const isUpdate = rating > 0;

            if (isUpdate) {
                await api.updateRating(id, intRating);
            } else {
                await api.rateBook(id, intRating);
            }

            console.log(`⭐ Rated book ${id} with ${intRating}/5`);

            setRating(intRating);
            setHoverRating(0);

        } catch (err) {
            console.error("Rating error:", err);
        } finally {
            setIsRatingLoading(false);
        }
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

                        <button
                            className={`btn w-100 mt-3 ${isFavorited ? 'btn-danger' : 'btn-success'}`}
                            onClick={handleFavoriteClick}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : isFavorited ? '♡ Remove from Favorites' : 'Add to Favorites'}
                        </button>

                        <button
                            className={`btn w-100 mt-2 ${haveRead ? 'btn-danger' : 'btn-outline-primary'}`}
                            onClick={handleHaveReadClick}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : haveRead ? '✓ Mark as Unread' : 'Mark as Read'}
                        </button>

                        {/* RATING UI */}
                        <div className="mt-3 text-center">
                            <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                                {Array.from({ length: 5 }).map((_, index) => {
                                    const value = index + 1;
                                    const filled = value <= (hoverRating || rating);

                                    return (
                                        <div
                                            key={index}
                                            style={{ cursor: "pointer" }}
                                            onMouseEnter={() => setHoverRating(value)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => submitRating(value)}
                                        >
                                            {filled ? (
                                                <IconStarFilled size={26} color="#f5c542" />
                                            ) : (
                                                <IconStar size={26} color="#ddd" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {rating > 0 && (
                                <p className="mt-1">
                                    <strong>{rating.toFixed(0)}</strong> / 5
                                </p>
                            )}
                        </div>

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
                                ⭐{book.statistics?.averageRating?.toFixed(2) ?? "N/A"}
                            </strong>
                            <span className="book-page-text">
                                &nbsp;{book.statistics?.ratingCount ?? 0} ratings
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