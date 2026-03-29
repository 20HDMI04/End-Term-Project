/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import type { BookSection, AuthorSection } from "./interfaces/interfaces";
import { Link } from "react-router-dom";

export function Home() {
	const api = useApi();

	const [booksList, setBookList] = useState<BookSection[]>();
	const [authorList, setAuthorList] = useState<AuthorSection[]>();

	// Adatok betöltése
	useEffect(() => {
		async function Books() {
			const consoleData = await api.getData();
			setBookList(consoleData.books);
			setAuthorList(consoleData.authors); // Author list betöltése
		}
		Books();
	}, []);

	//User
	const [setUser] = useState<any>(null);

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
	}, []);

	// Author név lekérése authorId alapján
	function getAuthorName(authorId: string | undefined): string {
		if (!authorList) return "Unknown author";

		for (const section of authorList) {
			const author = section.data.find((a) => a.id === authorId);
			if (author) return author.name;
		}
		return "Unknown author";
	}

	return (
		<div className="home-container">

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

			{/* Header */}
			<header className="header">
				<div className="header-content">
					<h1>
						Explore the World of <br />
						Books
					</h1>
					<h3>
						Dive into our collection of bestsellers <br />
						and compelling reads
					</h3>
				</div>
				<div className="header-images">
					<img src="/headerImgAlso.svg" alt="" className="headerAlso" />
					<img src="/headerImgFelso.svg" alt="" className="headerFelso" />
				</div>
			</header>

			{/* Popular Books Section */}
			<div className="d-flex align-items-center justify-content-between px-4 my-3">
				<h1 className="listing-h1">Popular Books</h1>				
				<Link to="/bookspage" className="see-all-link" style={{textDecoration: "none"}}>
					<p className="see-all mb-0">See All</p>
				</Link>
			</div>

			<div className="d-flex flex-wrap justify-content-start gap-4 px-4">
				{booksList
					?.flatMap(section => section.data)
					.filter((book, idx, arr) => arr.findIndex(b => b.id === book.id) === idx)
					.sort((a, b) => (b.statistics?.averageRating ?? 0) - (a.statistics?.averageRating ?? 0))
					.slice(0, 5)
					.map(book => (
						<Link
							key={book.id}
							to={`/book/${book.id}`}
							style={{
								textDecoration: "none",
								color: "#556b2f",
								width: "160px",
								textAlign: "center",
								fontFamily: "'Georgia', serif",
							}}
						>
							<div
								style={{
									position: "relative",
									borderRadius: "12px",
									overflow: "hidden",
									boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
								}}
							>
								<img
									src={book.biggerCoverPic || "/logo.svg"}
									alt={book.title}
									style={{
										width: "160px",
										height: "240px",
										objectFit: "cover",
										display: "block",
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: "8px",
										right: "8px",
										backgroundColor: "#485b1fc4",
										color: "white",
										borderRadius: "8px",
										padding: "2px 6px",
										fontSize: "0.75rem",
										fontWeight: "600",
										display: "flex",
										alignItems: "center",
										gap: "4px",
									}}
								>
									<span>{book.statistics?.averageRating?.toFixed(2) || "N/A"}</span>
									<svg
										width="14"
										height="14"
										fill="currentColor"
										className="bi bi-star-fill"
										viewBox="0 0 16 16"
										style={{ color: "#ffd000" }}
									>
										<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.063.612.63.282.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
									</svg>
								</div>
							</div>

							<h6 style={{ marginTop: "8px", fontWeight: "600" }}>{book.title}</h6>
							<p style={{ fontStyle: "italic", fontSize: "0.9rem", margin: 0 }}>
								{getAuthorName(book.authorId)}
							</p>
						</Link>
					))}
			</div>

			{/* Popular Authors Section */}
			<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 50px", marginTop: "40px" }}>
				<h1 className="listing-h1">Popular Authors</h1>
				<Link to="/authorspage" className="see-all-link" style={{textDecoration: "none"}}>
					<p className="see-all mb-0">See All</p>
				</Link>
			</div>

			<div className="authors-container mt-4 d-flex gap-4 flex-wrap" style={{marginLeft: "40px"}}>
				{authorList
					?.flatMap((section: AuthorSection) => section.data)
					.filter((value, index, self) =>
						index === self.findIndex(author => author.id === value.id)
					)
					.slice(0, 6)
					.map((author: any) => (
						<a
							key={author.id}
							href={`/author/${author.id}`}
							style={{ textDecoration: "none", textAlign: "center" }}
						>
							<img
								src={author.smallerProfilePic || "/def_profile_icon.svg"}
								alt={author.name}
								style={{
									width: "120px",
									height: "120px",
									borderRadius: "50%",
									objectFit: "cover",
									boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
									transition: "transform 0.3s",
									cursor: "pointer"
								}}
								onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
								onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
							/>
							<p style={{ marginTop: "8px", color: "#212529" }}>{author.name}</p>
						</a>
					))}
			</div>
			
			<div>{/* Explore genres */}</div>
			<div>{/* Popular Authors */}</div>

			{/* Footer */}
			<footer className="footer">
				<p>"Jani ajánlásával lorem ipsum stb"</p>
			</footer>

			<div className="footer2">
				<p>Copyright© Readsy 2025. All rights reserved.</p>
				<p className="Privacy">Privacy & Policy</p>
			</div>

		</div>
	);
}