/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import React, { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import type { BookSection, AuthorSection, Book } from "./interfaces/interfaces";
import { Link } from "react-router-dom";

export function Home() {
	const api = useApi();

	const [booksList, setBookList] = useState<BookSection[]>();
	const [authorList, setAuthorList] = useState<AuthorSection[]>();

	// Adatok betöltése
	useEffect(() => {
		async function Boks() {
			const consoleData = await api.getData();
			setBookList(consoleData.books);
			setAuthorList(consoleData.authors); // Author list betöltése
		}
		Boks();
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
							<a href="">
								<img src="/def_profile_icon.svg" alt="profile" className="profile-pic" />
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
			<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 50px", marginTop: "20px" }}>
				<h1 className="listing-h1">Popular Books</h1>
				<Link to="/bookspage" className="see-all-link">
					<p className="see-all mb-0">See All</p>
				</Link>
			</div>

			<div className="books-container mt-4">
				<div className="d-flex justify-start gap-3 flex-wrap">
					{booksList
						?.flatMap((section: BookSection) => section.data)
						.filter((value, index, self) =>
							index === self.findIndex(book => book.id === value.id)
						)
						.sort(
							(a: Book, b: Book) =>
								(b.statistics?.averageRating ?? 0) - (a.statistics?.averageRating ?? 0)
						) 
						.slice(0, 5)
						.map((book: Book) => (
							<Link
								key={book.id}
								to={`/book/${book.id}`}
								style={{ textDecoration: "none", color: "inherit" }}
							>
								<div className="card book-card shadow-sm">
									<img
										src={book.biggerCoverPic || "/logo.svg"}
										className="card-img-top"
										alt={book.title}
										style={{ height: "180px", objectFit: "cover" }}
									/>
									<div className="card-body p-2">
										<h6 className="card-title">{book.title}</h6>
										<p className="card-text text-muted" style={{ fontSize: "0.8rem" }}>
											{getAuthorName(book.authorId) ?? "Unknown"} <br />
											Rating: {book.statistics?.averageRating ?? "No rating"}
										</p>
									</div>
								</div>
							</Link>
						))}
				</div>
			</div>

			{/* Other Sections */}
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