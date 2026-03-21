import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import type { BookSection, AuthorSection, Book } from "./interfaces/interfaces";

export function Home() {
	const api = useApi();

	const [booksList, setBookList] = useState<BookSection[]>();
	const [authorList, setAuthorList] = useState<AuthorSection[]>();
	const [theme, setTheme] = useState("light");

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) setTheme(savedTheme);
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	useEffect(() => {
		async function Boks() {
			const consoleData = await api.getData();
			setBookList(consoleData.books);
			setAuthorList(consoleData.authors);
		}
		Boks();
	}, []);

	const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = "/book.png";
	};

	const handleAuthorImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = "/user.png";
	};

	return (
		<div className="home-container">

			{/* Navbar */}
			<nav className="navbar navbar-expand-lg">
				<div className="container-fluid">
					<div className="collapse navbar-collapse" id="navbarNavDropdown">
						<img src={theme === "light" ? "/logo.svg" : "/logo2.svg"} alt="logo" className="logo" />

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
							<button
								className="Darkmode-changer gomb1"
								onClick={() => setTheme(theme === "light" ? "dark" : "light")}
							>

								{theme === "light" ? (
									<span className="icon-container sun-icon">☀️</span>
								) : (
									<span className="icon-container moon-icon">🌙</span>
								)}
							</button>

							<a href="/profile">
								<img src={theme === "light" ? "def_profile_icon.svg" : "def_profile_icon2.svg"} alt="profile" className="profile-pic" />
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
			<div className="books-container-main">
				<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 50px", marginTop: "20px" }}>
					<h1 className="listing-h1-books">Popular Books</h1>
					<a href="/discover" className="see-all-link">
						<p className="see-all mb-0">See All➛</p>
					</a>
				</div>

				<div className="books-container mt-4">
					<div className="d-flex flex-wrap gap-3 justify-start">
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
							.map((book: Book, index: number) => (
								<div key={`${book.id}-${index}`} className="books-display-main">
									<div
										className="card book-card"
										style={{
											width: "150px",
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="rating-main">
											<p
												className="rating-display"
												style={{
													backgroundImage: `url(${theme === "light" ? "/rating.svg" : "/rating2.svg"})`,
													backgroundRepeat: "no-repeat",
													backgroundSize: "cover"
												}}
											>
												{book.statistics?.averageRating ?? "No rating"}
											</p>
										</div>
										<img
											src={book.biggerCoverPic || "/logo.svg"}
											className="card-img-top"
											alt={book.title}
											style={{
												height: "250px",
												objectFit: "cover",
												flexShrink: 0,
												borderRadius: "5px"
											}}
											onError={handleBookImageError}
										/>
										<div className="card-body p-2" style={{ flexGrow: 1 }}>
											<h6 className="card-title">{book.title}</h6>
											<p className="card-text">
												{book.author.name ?? "Unknown"}
											</p>
										</div>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>

			{/* Popular Authors */}
			<div className="authors-container-main">
				<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 50px", marginTop: "20px" }}>
					<h1 className="listing-h1-authors">Popular Authors</h1>
					<a href="/discover" className="see-all-link">
						<p className="see-all mb-0">See All➛</p>
					</a>
				</div>

				<div className="authors-container mt-5">
					<div className="d-flex justify-content-center gap-5 flex-wrap">
						{authorList
							?.flatMap((section: AuthorSection) => section.data)
							.filter((value, index, self) =>
								index === self.findIndex(author => author.id === value.id)
							)
							.slice(0, 6)
							.map((author, index) => (
								<div key={`${author.id}-${index}`} className="text-center">
									<img
										className="author-ppic"
										src={author.smallerProfilePic || "/logo.svg"}
										alt={author.name}
										style={{
											width: "140px",
											height: "140px",
											objectFit: "cover",
											borderRadius: "50%",

										}}
										onError={handleAuthorImageError}
									/>
									<p className="author-name">
										{author.name ?? "Unknown Author"}
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