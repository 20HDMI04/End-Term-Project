import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./Home.css";
import type { Book } from "./interfaces/book";

export function Home() {
	const navigate = useNavigate();

	let top5books = [] as Book[];

	fetch("http://localhost:3002/books")
		.then((response) => response.json())
		.then((data) => {
			top5books = data;
			console.log(top5books);
		})
		.catch((error) => {
			console.error("Error fetching top 5 books:", error);
		});

	return (
		<div className="home-container">
			<nav className="navbar navbar-expand-lg">
				<div className="container-fluid">
					<div className="collapse navbar-collapse" id="navbarNavDropdown">
						<img src="../public/logo.svg" alt="" className="logo" />
						<ul className="navbar-nav">
							<li className="nav-item">
								<h2>
									<a className="nav-link" href="/search">
										Search
									</a>
								</h2>
							</li>
							<li className="nav-item">
								<h2>
									<a className="nav-link" href="/discover">
										Discover
									</a>
								</h2>
							</li>
							<li className="nav-item"></li>
						</ul>
					</div>
				</div>
			</nav>

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
					<button className="gomb1" onClick={() => navigate("/discover")}>
						Browse Books
					</button>
				</div>
				<div className="header-images">
					<img
						src="../public/headerImgAlso.svg"
						alt=""
						className="headerAlso"
					/>
					<img
						src="../public/headerImgFelso.svg"
						alt=""
						className="headerFelso"
					/>
				</div>
			</header>

			<div>
				{/*fetch top 5 books from backend and display them here*/}
				<h1 className="listing-h1">Popular Books</h1>
				{top5books.map((book: Book) => (
					<div key={book.id}>
						<img src={`${book.smallerCoverPic}`} alt={book.title} />
						<h3>{book.author?.name}</h3>
						<h3>{book.title}</h3>
						<p>{book.statistics?.averageRating}</p>
					</div>
				))}
			</div>

			<div>{/*Explore genres*/}</div>

			<div>{/*Popular Authors*/}</div>

			<footer className="footer">
				{/*Logo*/}
				<p>"Jani ajánlásával lorem ipsum stb"</p>
				{/*contacts*/}
			</footer>
			<div className="footer2">
				<p>Copyright© Readsy 2025. Allrights reserved.</p>
				<p className="Privacy">Privacy & Policy</p>
			</div>
		</div>
	);
}
