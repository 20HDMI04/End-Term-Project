/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../context/apiContext";
import type { BookSection, Book, AuthorSection } from "./interfaces/interfaces";
import { IconSun, IconMoon, IconStar, IconStarFilled, IconTrash, IconEdit, IconThumbUp } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import { Link, useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NotificationBell } from "./NotificationBell";
import { Footer } from "./Footer";

export function BookDetails() {
    const { id } = useParams();
    const api = useApi();
    const navigate = useNavigate();
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

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

    useEffect(() => {
        async function loadComments() {
            if (!id) return;
            setLoadingComments(true);
            try {
                const data = await api.getComments(id);
                setComments(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingComments(false);
            }
        }

        loadComments();
    }, [id]);

    function startEdit(comment: any) {
        setEditingCommentId(comment.id);
        setEditText(comment.text);
    }


    async function saveEdit(commentId: string) {
        try {
            const updated = await api.updateComment(commentId, editText);

            setComments(prev =>
                prev.map(c =>
                    c.id === commentId ? { ...c, text: updated.text } : c
                )
            );

            setEditingCommentId(null);
            setEditText("");
        } catch (err) {
            console.error(err);
        }
    }

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
        try {
            console.log("Current have read state:", haveRead);
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

    function timeAgo(date: string) {
        const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
        return `${Math.floor(diff / 86400)} d ago`;
    }

    async function handleAddComment() {
        if (!newComment.trim() || !id) return;

        try {
            const created = await api.createComment(id, newComment);
            setComments(prev => [created, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error(err);
        }
    }

    async function toggleLike(comment: any) {
        try {
            const current = comments.find((c) => c.id === comment.id);
            if (!current) return;

            const isLiked = current.likedByUser ?? current.isLikedByMe ?? false;
            if (isLiked) {
                await api.unlikeComment(comment.id);
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === comment.id
                            ? {
                                ...c,
                                likedByUser: false,
                                isLikedByMe: false,
                                likeCount: Math.max(0, (c.likeCount ?? 0) - 1),
                            }
                            : c,
                    ),
                );
            } else {
                await api.likeComment(comment.id);
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === comment.id
                            ? {
                                ...c,
                                likedByUser: true,
                                isLikedByMe: true,
                                likeCount: (c.likeCount ?? 0) + 1,
                            }
                            : c,
                    ),
                );
            }
        } catch (err: any) {
            console.error(err);
        }
    }

    async function handleDelete(commentId: string) {
        try {
            await api.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error(err);
        }
    }

    if (!book) return <div className="container mt-5">Loading...</div>;

    const baseAuthor = getAuthor(book.authorId);

    const author = {
        ...(book.author || {}),
        ...(baseAuthor || {}),
    };

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
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-3" style={{ display: "flex", alignItems: "center", gap: "6px" }}>← Vissza</button>
                <div className="book-page-text row">

                    {/* 📌 LEFT SIDE - STICKY */}
                    <div
                        className="col-md-3"
                    >
                        <div
                            style={{
                                position: "sticky",
                                top: "90px", // navbar + kis spacing
                            }}
                        >
                            <img
                                src={book.biggerCoverPic || "/logo.svg"}
                                className="book-page-text img-fluid rounded shadow"
                                alt={book.title}
                                onError={(e) => { e.currentTarget.src = "/book.png"; }}
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
                    </div>

                    {/* RIGHT SIDE */}
                    <div className=" book-page-text book-page-text col-md-9">
                        <h2>{book.title}</h2>
                        <h5 className="book-page-text">
                            <a href={`/author/${book.authorId} || ${book.authorId}`} style={{ textDecoration: "none", color: "inherit" }}>
                                {book.author.name || "Unknown Author"}
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
                        {author?.name ? (
                            <div className="d-flex gap-3 align-items-start mt-3">
                                <Link
                                    to={`/author/${author?.id || book.authorId}`}
                                    style={{ textDecoration: "none", color: "inherit" }}
                                >
                                    <img
                                        src={author.smallerProfilePic || (theme === "light"
                                            ? "/user.png"
                                            : "/user2.png")}
                                        alt={author.name}
                                        onError={(e) => { e.currentTarget.src = theme === "light" ? "/user.png" : "/user2.png"; }}
                                        style={{
                                            width: "70px",
                                            height: "70px",
                                            borderRadius: "50%",
                                            objectFit: "cover"
                                        }}
                                    />
                                </Link>

                                <div>
                                    <h5>
                                        <a
                                            href={`/author/${author?.id || book.authorId}`}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            {author.name}
                                        </a>
                                    </h5>

                                    <p className="mb-1">
                                        {author.nationality ?? "Unknown nationality"}
                                        {author.birthDate && ` • ${new Date(author.birthDate).getFullYear()}`}
                                    </p>

                                    <p style={{ maxWidth: "600px" }}>
                                        {author.bio ?? "No biography available."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted">Author not available</p>
                        )}

                        <hr />

                        <h5>Comments</h5>

                        {/* ADD COMMENT */}
                        <div className="d-flex gap-2 mb-3">
                            <input
                                className="form-control"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleAddComment}>
                                &nbsp;➤&nbsp;
                            </button>
                        </div>

                        {/* COMMENT LIST */}
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            {loadingComments ? (
                                <p>Loading comments...</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="d-flex gap-2 mb-3 p-3 border rounded">

                                        {/* PROFILE PIC */}
                                        <img
                                            src={comment.user?.smallerProfilePic || "/def_profile_icon.svg"}
                                            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                                        />

                                        <div style={{ flex: 1 }}>
                                            {/* NAME + TIME */}
                                            <div className="d-flex justify-content-between">
                                                <span>
                                                    <strong>{comment.user?.nickname || (comment.user?.email || "unknown").split("@")[0]}</strong>
                                                </span>
                                                <small>{timeAgo(comment.createdAt)}</small>
                                            </div>

                                            {/* USER RATING */}
                                            {comment.userRating && (
                                                <div style={{ fontSize: "0.8rem" }}>
                                                    ⭐ {comment.userRating}/5
                                                </div>
                                            )}

                                            {/* TEXT */}
                                            {editingCommentId === comment.id ? (
                                                <div className="mt-2">
                                                    <input
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="form-control mb-2"
                                                    />

                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary px-3"
                                                            onClick={() => setEditingCommentId(null)}
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-success px-3"
                                                            onClick={() => saveEdit(comment.id)}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="mb-1">{comment.text}</p>
                                            )}

                                            {/* ACTIONS */}
                                            <div className="d-flex gap-3 align-items-center">
                                                <button
                                                    className={`btn btn-sm ${(comment.likedByUser ?? comment.isLikedByMe)
                                                        ? 'btn-danger'
                                                        : 'btn-outline-danger'
                                                        }`}
                                                    onClick={() => toggleLike(comment)}
                                                >
                                                    <IconThumbUp /> {comment.likeCount ?? 0}
                                                </button>

                                                {/* EDIT OWN */}
                                                {(user?.email === comment.userId || user?.email === comment.user?.email) && editingCommentId !== comment.id && (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => startEdit(comment)}
                                                    >
                                                        <IconEdit />
                                                    </button>
                                                )}

                                                {/* DELETE OWN */}
                                                {user?.email === comment.userId && (
                                                    <>
                                                        {confirmDeleteId === comment.id ? (
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(comment.id)}
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => setConfirmDeleteId(null)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => setConfirmDeleteId(comment.id)}
                                                            >
                                                                <IconTrash />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <div className="gap"></div>

            <Footer />
        </div>
    );
}