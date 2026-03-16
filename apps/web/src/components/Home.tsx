/* eslint-disable @typescript-eslint/no-explicit-any */
import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import React, { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import type { BookSection, AuthorSection, Book } from "./interfaces/interfaces";


export function Home() {
	const api = useApi();

	const [booksList, setBookList] = useState<BookSection[]>();
	const [authorList, setAuthorList] = useState<AuthorSection[]>();

	useEffect(
		() => {
			async function Boks() {
				const consoleData = await api.getData()
				setBookList(consoleData.books)
				setAuthorList(consoleData.authors)
			}
			Boks();
		},
		[]

	)



	return (
		<div className="home-container">

			{/* Navbar */}
			<nav className="navbar navbar-expand-lg">
				<div className="container-fluid">
					<div className="collapse navbar-collapse" id="navbarNavDropdown">
						<img src="/logo.svg" alt="logo" className="logo" />

						<ul className="navbar-nav">
							<li className="nav-item">
								<h2><a className="nav-link">Home</a></h2>
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
				<a href="/discover" className="see-all-link">
					<p className="see-all mb-0">See All</p>
				</a>
			</div>


			<div className="books-container mt-4">
				<div className="d-flex justify-start gap-3">
					{booksList
						?.flatMap((section: BookSection) => section.data)
						.filter((value, index, self) =>
							index === self.findIndex(book => book.id === value.id)
						)
						.sort(
							(a: Book, b: Book) =>
								(b.statistics?.averageRating ?? 0) - (a.statistics?.averageRating ?? 0)
						)
						.slice(0, 6)
						.map((book: Book) => (
							<div key={book.id} className="card book-card shadow-sm">
								<img
									src={book.biggerCoverPic || "/logo.svg"}
									className="card-img-top"
									alt={book.title}
									style={{ height: "180px", objectFit: "cover" }}
								/>
								<div className="card-body p-2">
									<h6 className="card-title">{book.title}</h6>
									<p className="card-text text-muted" style={{ fontSize: "0.8rem" }}>
										{book.author.name ?? "Unknown"} <br />
										Rating: {book.statistics?.averageRating ?? "No rating"}
									</p>
								</div>
							</div>
						))}
				</div>
			</div>


			<div>{/* Explore genres */}</div>


			<div>{/* Popular Authors */}
				<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 50px", marginTop: "20px" }}>
					<h1 className="listing-h1">Popular Authors</h1>
					<a href="/discover" className="see-all-link">
						<p className="see-all mb-0">See All</p>
					</a>
				</div>

				<div className="authors-container mt-5">
					<h2 className="text-center mb-4">Popular Authors</h2>

					<div className="d-flex justify-content-center gap-5 flex-wrap">
						{booksList
							?.flatMap((section: BookSection) => section.data)
							.filter((value, index, self) =>
								index === self.findIndex(book => book.id === value.id)
							)
							.slice(0, 5)
							.map((book: Book) => (
								<div key={book.id} className="text-center">

									<img
										src={book.smallerCoverPic || book.biggerCoverPic || "/logo.svg"}
										alt={book.author?.name}
										style={{
											width: "140px",
											height: "140px",
											objectFit: "cover",
											borderRadius: "50%",
											border: "4px solid #4E6B3A"
										}}
									/>

									<p
										style={{
											marginTop: "12px",
											fontWeight: 500,
											color: "#4E6B3A"
										}}
									>
										{book.author?.name ?? "Unknown Author"}
									</p>

								</div>
							))}
					</div>
				</div>

			</div>

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