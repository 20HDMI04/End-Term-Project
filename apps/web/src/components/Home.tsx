import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import React from "react";
import { useApi } from "../context/apiContext";

export function Home() {
	const { books, loading } = useApi();

	const top5Books = books
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 5);

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
				{loading ? (
					<p className="text-center">Loading books...</p>
				) : (
					<div
						className="d-flex justify-start gap-3"

					>
						{top5Books.map((book: any) => (
							<div
								key={book.id}
								className="card book-card shadow-sm"
							>
								<img
									src="/logo.svg"
									className="card-img-top"
									alt={book.name}
									style={{ height: "180px", objectFit: "cover" }}  // slightly smaller height
								/>
								<div className="card-body p-2">
									<h6 className="card-title">{book.name}</h6>
									<p className="card-text text-muted" style={{ fontSize: "0.8rem" }}>
										Books: {book._count.books}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
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