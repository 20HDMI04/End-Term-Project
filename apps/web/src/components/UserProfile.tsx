/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState, useRef } from "react";
import { useApi } from "../context/apiContext";
import { IconSun, IconMoon, IconPencil } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import "./css/home.css"
import { signOut } from "supertokens-auth-react/recipe/session";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { NotificationBell } from "./NotificationBell";
import Session from "supertokens-auth-react/recipe/session";
import { Footer } from "./Footer";

export function UserProfile() {
    const api = useApi();
    const [user, setUser] = useState<any>(null);
    const { theme, toggleTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nickname, setNickname] = useState("");
    const [isSavingNickname, setIsSavingNickname] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showConstructionModal, setShowConstructionModal] = useState(false);


    useEffect(() => {
        async function fetchUser() {
            setIsLoading(true);
            try {
                const fetchedUser = await api.getCurrentUser();
                setUser(fetchedUser);
                setNickname(fetchedUser.nickname || "");
            } catch (err) {
                console.error("Error fetching current user:", err);
            } finally {
                setIsLoading(false);
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

    const handleLogout = (): void => {
        const isDark = theme === "dark";

        Swal.fire({
            title: "Are you sure you want to logout?",
            text: "Your current session will end.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, logout",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            background: isDark ? "#262626" : "#ffffff",
            color: isDark ? "#ffffff" : "#000000",
            confirmButtonColor: "#4E6B3A",
            cancelButtonColor: isDark ? "#444444" : "#e0e0e0",
            customClass: {
                title: "swal-title",
                htmlContainer: "swal-text",
                confirmButton: "swal-confirm-btn",
                cancelButton: "swal-cancel-btn",
            },
            iconColor: "#ff9800",
            allowOutsideClick: true,
            allowEscapeKey: true,
            width: "auto",
            padding: "2rem"
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Set theme to light
                localStorage.setItem("theme", "light");
                document.documentElement.setAttribute("data-theme", "light");

                await signOut();
                navigate("/auth");
            }
        }).catch(() => {
            // Ensure modal is closed on error
            Swal.close();
        });
    };

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            const fetchedUser = await api.getCurrentUser();
            setUser(fetchedUser);
            setNickname(fetchedUser.nickname || "");
        } catch (err) {
            console.error("Error fetching current user:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNickname = async () => {
        if (!nickname.trim()) {
            Swal.fire("Érvénytelen becenév", "A becenév nem lehet üres.", "warning");
            return;
        }
        if (nickname.trim().length < 3) {
            Swal.fire("Túl rövid", "A becenévnek legalább 3 karakternek kell lennie.", "warning");
            return;
        }

        setIsSavingNickname(true);
        try {
            await api.updateUserProfile(null, { nickname: nickname.trim() });
            const fetchedUser = await api.getCurrentUser();
            setUser(fetchedUser);
            setNickname(fetchedUser.nickname || "");
            setIsEditingNickname(false);
        } catch (err) {
            console.error("Error saving nickname:", err);
            Swal.fire("Hiba", "Nem sikerült menteni a becenevet. Kérjük, próbáld újra.", "error");
        } finally {
            setIsSavingNickname(false);
        }
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingPicture(true);
        try {
            await api.updateUserProfile(file, {});
            const fetchedUser = await api.getCurrentUser();
            setUser(fetchedUser);
        } catch (err) {
            console.error("Error uploading profile picture:", err);
            alert("Failed to upload profile picture. Please try again.");
        } finally {
            setIsUploadingPicture(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (!user) return <div className="container mt-5 text-dark">Loading...</div>;

    // ⭐ HELPER: saját rating kikeresése

    return (
        <div className="home-container">

            {/* NAVBAR */}
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
                            <NotificationBell isAdmin={isAdmin} />
                            <button
                                className="Darkmode-changer"
                                onClick={toggleTheme}
                                title="Toggle dark mode"
                                aria-label="Toggle dark mode"
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

            <div className="container mt-4">
                <div className="row">

                    {/* LEFT */}
                    <div className="col-md-3 text-center" style={{ position: "sticky", top: "80px" }}>
                        <div style={{ position: "relative", width: "200px", height: "200px", margin: "0 auto" }}>
                            <img
                                src={user.biggerProfilePic || "/def_profile_icon.svg"}
                                alt={user.username || (user.email.split("@")[0])}
                                onClick={handleProfilePictureClick}
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    cursor: isUploadingPicture ? "not-allowed" : "pointer",
                                    opacity: isUploadingPicture ? 0.6 : 1,
                                }}
                            />
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            aria-label="Upload profile picture"
                            title="Upload profile picture"
                            disabled={isUploadingPicture}
                        />


                        <h1 style={{
                            margin: "4px 0 16px 0",
                            fontSize: "1.5rem",
                            color: "var(--text-color)",
                            fontWeight: "400",
                            fontStyle: "bold",
                        }}>
                            {user.nickname || user.email.split("@")[0]}
                        </h1>

                        <div style={{
                            backgroundColor: theme === "light" ? "var(--card-tx)" : "#2d2d2d",
                            padding: "16px",
                            borderRadius: "10px",
                            marginTop: "0px",
                            marginBottom: "20px",
                            border: theme === "light" ? "none" : "1px solid #444444",
                            transition: "all 0.3s ease"
                        }}>
                            <div>
                                <p style={{
                                    margin: "0 0 4px 0",
                                    fontSize: "0.85rem",
                                    color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }}>
                                    EMAIL
                                </p>
                                <p style={{
                                    margin: "0 0 12px 0",
                                    fontSize: "0.95rem",
                                    color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                    wordBreak: "break-all"
                                }}>
                                    {user.email}
                                </p>
                            </div>

                            {/* NICKNAME SECTION */}
                            <div style={{
                                backgroundColor: theme === "light" ? "var(--card-tx)" : "#262626",
                                padding: "12px",
                                borderRadius: "8px",
                                border: theme === "light" ? "none" : "1px solid #444444",
                                marginTop: "12px",
                                transition: "all 0.3s ease"
                            }}>
                                {isEditingNickname ? (
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            className="form-control"
                                            placeholder="Enter nickname"
                                            style={{ maxWidth: "200px" }}
                                            disabled={isSavingNickname}
                                        />
                                        <button
                                            onClick={handleSaveNickname}
                                            disabled={isSavingNickname}
                                            className="btn btn-sm btn-success"
                                        >
                                            {isSavingNickname ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingNickname(false);
                                                setNickname(user.nickname || "");
                                            }}
                                            disabled={isSavingNickname}
                                            className="btn btn-sm btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <p style={{
                                                margin: "0 0 4px 0",
                                                fontSize: "0.85rem",
                                                color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px"
                                            }}>
                                                Display Name
                                            </p>
                                            <p style={{
                                                margin: "0",
                                                fontSize: "1rem",
                                                color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                                fontWeight: "500"
                                            }}>
                                                {user.nickname || "Not set"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsEditingNickname(true)}
                                            className="btn btn-sm btn-outline-primary"
                                            style={{
                                                borderRadius: "6px",
                                                fontSize: "0.8rem",
                                                backgroundColor: "transparent",
                                            }}
                                        >
                                            <IconPencil />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "20px"
                        }}>
                            <div style={{
                                backgroundColor: theme === "light" ? "var(--card-tx)" : "#262626",
                                padding: "12px",
                                borderRadius: "8px",
                                border: theme === "light" ? "none" : "1px solid #444444",
                                textAlign: "center",
                                transition: "all 0.3s ease"
                            }}>
                                <p style={{
                                    fontSize: "0.8rem",
                                    margin: "0 0 6px 0",
                                    color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3px"
                                }}>
                                    Liked Books
                                </p>
                                <p style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    margin: "0",
                                    color: theme === "light" ? "var(--bg-color)" : "#8bc34a"
                                }}>
                                    {user.favoriteBooks?.length ?? 0}
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: theme === "light" ? "var(--card-tx)" : "#262626",
                                padding: "12px",
                                borderRadius: "8px",
                                border: theme === "light" ? "none" : "1px solid #444444",
                                textAlign: "center",
                                transition: "all 0.3s ease"
                            }}>
                                <p style={{
                                    fontSize: "0.8rem",
                                    margin: "0 0 6px 0",
                                    color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3px"
                                }}>
                                    Liked Authors
                                </p>
                                <p style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    margin: "0",
                                    color: theme === "light" ? "var(--bg-color)" : "#8bc34a"
                                }}>
                                    {user.favoriteAuthors?.length ?? 0}
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: theme === "light" ? "var(--card-tx)" : "#262626",
                                padding: "12px",
                                borderRadius: "8px",
                                border: theme === "light" ? "none" : "1px solid #444444",
                                textAlign: "center",
                                transition: "all 0.3s ease"
                            }}>
                                <p style={{
                                    fontSize: "0.8rem",
                                    margin: "0 0 6px 0",
                                    color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3px"
                                }}>
                                    Comments
                                </p>
                                <p style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    margin: "0",
                                    color: theme === "light" ? "var(--bg-color)" : "#8bc34a"
                                }}>
                                    {user.comments?.length ?? 0}
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: theme === "light" ? "var(--card-tx)" : "#262626",
                                padding: "12px",
                                borderRadius: "8px",
                                border: theme === "light" ? "none" : "1px solid #444444",
                                textAlign: "center",
                                transition: "all 0.3s ease"
                            }}>
                                <p style={{
                                    fontSize: "0.8rem",
                                    margin: "0 0 6px 0",
                                    color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3px"
                                }}>
                                    Ratings
                                </p>
                                <p style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    margin: "0",
                                    color: theme === "light" ? "var(--bg-color)" : "#8bc34a"
                                }}>
                                    {user.ratings?.length ?? 0}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: theme === "light" ? "var(--card-tx)" : "#262626",
                            padding: "12px",
                            borderRadius: "8px",
                            border: theme === "light" ? "none" : "1px solid #444444",
                            textAlign: "center",
                            marginBottom: "20px"
                        }}>
                            <p style={{
                                fontSize: "0.8rem",
                                margin: "0 0 6px 0",
                                color: theme === "light" ? "var(--bg-color)" : "var(--text-color)",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px"
                            }}>
                                Have Read
                            </p>
                            <p style={{
                                fontSize: "1.5rem",
                                fontWeight: "600",
                                margin: "0",
                                color: theme === "light" ? "var(--bg-color)" : "#8bc34a"
                            }}>
                                {user.haveReadIt?.length ?? 0}
                            </p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
                            <button
                                onClick={refreshUser}
                                disabled={isLoading}
                                className="btn btn-success"
                                style={{
                                    borderRadius: "8px",
                                    padding: "10px 16px",
                                    fontWeight: "500",
                                    backgroundColor: isLoading ? "#999999" : "#4E6B3A",
                                    borderColor: "#4E6B3A",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {isLoading ? "⟳ Refreshing..." : "⟳ Refresh"}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn btn-danger"
                                style={{
                                    borderRadius: "8px",
                                    padding: "10px 16px",
                                    fontWeight: "500",
                                    backgroundColor: "#dc3545",
                                    borderColor: "#dc3545",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="col-md-9">

                        {/* FAVORITE BOOKS */}
                        <h1 className="listing-h1-books">Favorite Books</h1>

                        <div className="books-container mt-4">
                            {user.favoriteBooks?.length ? (
                                <div className="d-flex flex-wrap gap-3">

                                    {user.favoriteBooks.map((f: any) => {
                                        return (
                                            <a key={f.book.id} href={`/book/${f.book.id}`} style={{ textDecoration: "none" }}>
                                                <div className="books-display-main">
                                                    <div className="card book-card" style={{ width: "150px" }}>

                                                        <div className="rating-main">
                                                            <p
                                                                className="rating-display"
                                                                style={{
                                                                    backgroundImage: `url(${theme === "light" ? "/rating.svg" : "/rating2.svg"})`,
                                                                    backgroundRepeat: "no-repeat",
                                                                    backgroundSize: "cover",
                                                                }}
                                                            >
                                                                {f.book.statistics?.averageRating != null
                                                                    ? f.book.statistics.averageRating.toFixed(2)
                                                                    : "N/A"}</p>
                                                        </div>



                                                        <img
                                                            src={f.book.biggerCoverPic || "/logo.svg"}
                                                            className="card-img-top"
                                                            alt={f.book.title}
                                                            style={{ height: "250px", objectFit: "cover" }}
                                                        />

                                                        <div className="card-body p-2">
                                                            <h6>{f.book.title}</h6>
                                                        </div>

                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}

                                </div>
                            ) : (
                                <p>No favorite books yet.</p>
                            )}
                        </div>

                        {/* AUTHORS + READ BOOKS */}
                        <h1 className="listing-h1-authors">Favorite Authors</h1>

                        <div className="authors-container mt-5">
                            {user.favoriteAuthors?.length ? (
                                <div className="d-flex flex-wrap gap-4 justify-content-start">

                                    {user.favoriteAuthors.map((f: any) => {
                                        const author = f?.author;

                                        const fallback =
                                            theme === "light"
                                                ? "/user.png"
                                                : "/user2.png";

                                        const imgSrc =
                                            author?.smallerProfilePic ||
                                            author?.biggerProfilePic ||
                                            fallback;

                                        return (
                                            <a
                                                key={author?.id}
                                                href={`/author/${author?.id}`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "inherit",
                                                    width: "140px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <img
                                                    src={imgSrc}
                                                    alt={author?.name ?? "Unknown Author"}
                                                    onError={(e) => {
                                                        e.currentTarget.src = fallback;
                                                    }}
                                                    style={{
                                                        width: "140px",
                                                        height: "140px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                                        marginBottom: "8px",
                                                    }}
                                                />

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "14px",
                                                        fontWeight: 400,
                                                        color: theme === "light" ? "#111" : "#eee",
                                                    }}
                                                >
                                                    {author?.name ?? "Unknown"}
                                                </p>
                                            </a>
                                        );
                                    })}

                                </div>
                            ) : (
                                <p className="text-muted">No favorite authors yet.</p>
                            )}
                        </div>
                        <h1 className="listing-h1-books mt-5" style={{ marginTop: "30px" }}>Books I've Read</h1>

                        <div className="books-container mt-4">
                            {user.haveReadIt?.length ? (
                                <div className="d-flex flex-wrap gap-3">
                                    {user.haveReadIt.map((h: any) => {
                                        //const myRating = getMyRating(h.book.id);

                                        return (
                                            <a key={h.book.id} href={`/book/${h.book.id}`} style={{ textDecoration: "none" }}>
                                                <div className="books-display-main">
                                                    <div className="card book-card" style={{ width: "150px" }}>

                                                        <div className="rating-main">
                                                            <p
                                                                className="rating-display"
                                                                style={{
                                                                    backgroundImage: `url(${theme === "light" ? "/rating.svg" : "/rating2.svg"})`,
                                                                    backgroundRepeat: "no-repeat",
                                                                    backgroundSize: "cover",
                                                                }}
                                                            >
                                                                {h.book.statistics?.averageRating != null
                                                                    ? h.book.statistics.averageRating.toFixed(2)
                                                                    : "N/A"}                                                            </p>
                                                        </div>

                                                        <img
                                                            src={h.book.biggerCoverPic || "/logo.svg"}
                                                            className="card-img-top"
                                                            style={{ height: "250px", objectFit: "cover" }}
                                                        />

                                                        <div className="card-body p-2">
                                                            <h6>{h.book.title}</h6>
                                                            <p>{h.book.author?.name}</p>
                                                        </div>

                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted">No books read yet.</p>
                            )}
                        </div>

                        {/* Add a Book Section */}

                        <div className="books-container mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h1 className="listing-h1-books mt-5">Add a New Book</h1>
                            <div className="card p-4" style={{ maxWidth: "600px" }}>
                                <h5>Create a New Book</h5>
                                <p className="text-muted">Share a book you've discovered with the community.</p>
                                <a href="/add-book" className="btn btn-success w-100">
                                    + Add Book
                                </a>
                            </div>
                            <h1 className="listing-h1-books mt-5">Add a New Author</h1>
                            <div className="card p-4" style={{ maxWidth: "600px" }}>
                                <h5>Create a New Author</h5>
                                <p className="text-muted">Add a new author to the community database.</p>
                                <a href="/add-author" className="btn btn-success w-100">
                                    + Add Author
                                </a>
                            </div>
                        </div>

                        {/* Under Construction Modal */}
                        {showConstructionModal && (
                            <div className="construction-modal-overlay" onClick={() => setShowConstructionModal(false)}>
                                <div className="construction-modal-content" onClick={(e) => e.stopPropagation()}>
                                    <img
                                        src="/underconstruction.jpg"
                                        alt="Under Construction"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                    <button className="construction-modal-close" onClick={() => setShowConstructionModal(false)}>✕</button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <Footer />
        </div >
    );
}