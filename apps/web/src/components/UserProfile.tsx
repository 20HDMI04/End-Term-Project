/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";

export function UserProfile() {
    const api = useApi();
    const [user, setUser] = useState<any>(null);
    
    useEffect(() => {
        async function fetchUser() {
            try {
                const fetchedUser = await api.getCurrentUser();
                setUser(fetchedUser);
            } catch (err) {
                console.error("Error fetching current user:", err);
            }
        }
        fetchUser();
    }, []);

    if (!user) return <div className="container mt-5 text-dark">Loading...</div>;

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", color: "#212529" }}>
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
							<a href="/user/me">
								<img
									src={"/def_profile_icon.svg"}
									alt="profile"
									className="profile-pic"
								/>
							</a>
						</ul>
					</div>
				</div>
			</nav>

            <div className="container mt-4">
                <div className="row">
                    {/* LEFT SIDE */}
                    <div className="col-md-3 text-center">
                        <img
                            src={user.biggerProfilePic || "/def_profile_icon.svg"}
                            alt={user.username}
                            style={{
                                width: "260px",
                                height: "260px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
                            }}
                        />
                        <h2 className="mt-3">{user.nickname ?? user.username}</h2>
                        <p>{user.email}</p>

                        {/* User stats */}
                        <div className="mt-3 text-start" style={{ padding: "0 10px" }}>
                            <p>📚 Favorite Books: {user.favoriteBooks?.length ?? 0}</p>
                            <p>✍️ Comments: {user.comments?.length ?? 0}</p>
                            <p>⭐ Ratings: {user.ratings?.length ?? 0}</p>
                            <p>📖 Have Read: {user.haveReadIt?.length ?? 0}</p>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="col-md-9">
                        {/* Favorite Books */}
                        <h4 className="mb-3">Favorite Books</h4>
                        <div className="row mb-4">
                            {user.favoriteBooks?.length ? (
                                user.favoriteBooks.map((f: any) => (
                                    <div key={f.book.id} className="col-md-3 mb-4">
                                        <a href={`/book/${f.book.id}`} style={{ textDecoration: "none" }}>
                                            <div
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    borderRadius: "12px",
                                                    overflow: "hidden",
                                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <img
                                                    src={f.book.smallerCoverPic}
                                                    alt={f.book.title}
                                                    style={{ width: "100%", height: "260px", objectFit: "cover" }}
                                                />
                                                <div style={{ padding: "10px" }}>
                                                    <p style={{ margin: 0 }}>{f.book.title}</p>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No favorite books yet.</p>
                            )}
                        </div>

                        {/* Favorite Authors */}
                        <h4 className="mb-3">Favorite Authors</h4>
                        <div className="row mb-4">
                            {user.favoriteAuthors?.length ? (
                                user.favoriteAuthors.map((f: any) => (
                                    <div key={f.author.id} className="col-md-3 mb-4 text-center">
                                        <a href={`/author/${f.author.id}`} style={{ textDecoration: "none" }}>
                                            <img
                                                src={f.author.smallerProfilePic || "/def_profile_icon.svg"}
                                                alt={f.author.name}
                                                style={{
                                                    width: "160px",
                                                    height: "160px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    marginBottom: "5px"
                                                }}
                                            />
                                            <p style={{ margin: 0 }}>{f.author.name}</p>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No favorite authors yet.</p>
                            )}
                        </div>

                        {/* Books I've Read */}
                        <h4 className="mb-3">Books I've Read</h4>
                        <div className="row mb-4">
                            {user.haveReadIt?.length ? (
                                user.haveReadIt.map((h: any) => (
                                    <div key={h.book.id} className="col-md-3 mb-4">
                                        <a href={`/book/${h.book.id}`} style={{ textDecoration: "none" }}>
                                            <div
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    borderRadius: "12px",
                                                    overflow: "hidden",
                                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <img
                                                    src={h.book.smallerCoverPic}
                                                    alt={h.book.title}
                                                    style={{ width: "100%", height: "260px", objectFit: "cover" }}
                                                />
                                                <div style={{ padding: "10px" }}>
                                                    <p style={{ margin: 0 }}>{h.book.title}</p>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No books read yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}