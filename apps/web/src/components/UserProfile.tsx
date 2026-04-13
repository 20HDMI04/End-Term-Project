/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState, useRef } from "react";
import { useApi } from "../context/apiContext";
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import "./css/home.css"
import { signOut } from "supertokens-auth-react/recipe/session";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function UserProfile() {
    const api = useApi();
    const [user, setUser] = useState<any>(null);
    const { theme, toggleTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();


    useEffect(() => {
        async function fetchUser() {
            setIsLoading(true);
            try {
                const fetchedUser = await api.getCurrentUser();
                setUser(fetchedUser);
            } catch (err) {
                console.error("Error fetching current user:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [api]);
    const handleLogout = (): void => {
        Swal.fire({
            title: "Biztosan kijelentkezel?",
            text: "A jelenlegi session megszűnik.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Igen",
            cancelButtonText: "Mégse",
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                await signOut();
                navigate("/auth");
            }
        });
    };

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            const fetchedUser = await api.getCurrentUser();
            setUser(fetchedUser);
        } catch (err) {
            console.error("Error fetching current user:", err);
        } finally {
            setIsLoading(false);
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
    const getMyRating = (bookId: string) => {
        return user?.ratings?.find((r: any) => r.bookId === bookId)?.score;
    };

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
                                alt={user.username}
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

                        <h2 className="listing-h1-authors mt-3">{user.nickname ?? user.username}</h2>
                        <p>{user.email}</p>

                        <div className="mt-4" style={{ textAlign: "left", paddingLeft: "20px" }}>
                            <p><strong>Favorite Books:</strong> {user.favoriteBooks?.length ?? 0}</p>
                            <p><strong>Favorite Authors:</strong> {user.favoriteAuthors?.length ?? 0}</p>
                            <p><strong>Comments:</strong> {user.comments?.length ?? 0}</p>
                            <p><strong>Ratings:</strong> {user.ratings?.length ?? 0}</p>
                            <p><strong>Have Read:</strong> {user.haveReadIt?.length ?? 0}</p>
                        </div>

                        <button onClick={refreshUser} disabled={isLoading} className="btn btn-success w-100 mt-3">
                            {isLoading ? "Refreshing..." : "Refresh"}
                        </button>
                        <button onClick={handleLogout} className="btn btn-success w-100 mt-3">
                            Logout
                        </button>
                    </div>

                    {/* RIGHT */}
                    <div className="col-md-9">

                        {/* FAVORITE BOOKS */}
                        <h1 className="listing-h1-books">Favorite Books</h1>

                        <div className="books-container mt-4">
                            {user.favoriteBooks?.length ? (
                                <div className="d-flex flex-wrap gap-3">

                                    {user.favoriteBooks.map((f: any) => {
                                        //const myRating = getMyRating(f.book.id);

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
                                                                    : "N/A"}                                                            </p>
                                                        </div>



                                                        <img
                                                            src={f.book.biggerCoverPic || "/logo.svg"}
                                                            className="card-img-top"
                                                            alt={f.book.title}
                                                            style={{ height: "250px", objectFit: "cover" }}
                                                        />

                                                        <div className="card-body p-2">
                                                            <h6>{f.book.title}</h6>
                                                            <p>{f.book.author?.name ?? "Unknown"}</p>
                                                        </div>

                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}

                                </div>
                            ) : (
                                <p className="text-muted">No favorite books yet.</p>
                            )}
                        </div>

                        {/* AUTHORS + READ BOOKS unchanged */}
                        <h1 className="listing-h1-authors mt-5">Favorite Authors</h1>

                        <div className="authors-container mt-5">
                            {user.favoriteAuthors?.length ? (
                                <div className="d-flex flex-wrap gap-5" style={{ paddingLeft: "55px" }}>
                                    {user.favoriteAuthors.map((f: any) => (
                                        <a key={f.author.id} href={`/author/${f.author.id}`} style={{ textDecoration: "none" }}>
                                            <img
                                                src={f.author.smallerProfilePic || "/logo.svg"}
                                                style={{ width: 140, height: 140, borderRadius: "50%" }}
                                            />
                                            <p>{f.author.name}</p>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No favorite authors yet.</p>
                            )}
                        </div>

                        <h1 className="listing-h1-books mt-5">Books I've Read</h1>

                        <div className="books-container mt-4">
                            {user.haveReadIt?.length ? (
                                <div className="d-flex flex-wrap gap-3">
                                    {user.haveReadIt.map((h: any) => {
                                        const myRating = getMyRating(h.book.id);

                                        return (
                                            <a key={h.book.id} href={`/book/${h.book.id}`} style={{ textDecoration: "none" }}>
                                                <div className="books-display-main">
                                                    <div className="card book-card" style={{ width: "150px" }}>

                                                        <div className="rating-main">
                                                            <p className="rating-display">
                                                                {myRating != null ? `You rated: ${myRating}/5` : "Not rated"}
                                                            </p>
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

                    </div>
                </div>
            </div>

            <div className="footer2">
                <p>Copyright© Readsy 2025</p>
            </div>
        </div>
    );
}