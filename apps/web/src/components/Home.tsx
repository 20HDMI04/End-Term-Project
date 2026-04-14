import "bootstrap/dist/css/bootstrap.css";
import "./css/home.css";
import { useEffect, useState } from "react";
import { useApi } from "../context/apiContext";
import type { BookSection, AuthorSection, Book } from "./interfaces/interfaces";
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import { Link } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NotificationBell } from "./NotificationBell";

export function Home() {
	const api = useApi();

	const [booksList, setBookList] = useState<BookSection[]>();
	const [authorList, setAuthorList] = useState<AuthorSection[]>();
	const { theme, toggleTheme } = useTheme();
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [isAdmin, setIsAdmin] = useState(false);

	// Calculate how many items to show based on screen width
	const getItemsToShow = (type: 'books' | 'authors') => {
		if (windowWidth < 576) {
			// Mobile
			return type === 'books' ? 2 : 2;
		} else if (windowWidth < 768) {
			// Small tablet
			return type === 'books' ? 3 : 3;
		} else if (windowWidth < 1024) {
			// Tablet
			return type === 'books' ? 4 : 4;
		} else if (windowWidth < 1100) {
			// Desktop
			return type === 'books' ? 6 : 6;
		} else if (windowWidth < 1200) {
			// Large desktop
			return type === 'books' ? 7 : 7;
		}
		else if (windowWidth < 1400) {
			return type === 'books' ? 8 : 8;
		} else {
			// Large desktop
			return type === 'books' ? 9 : 9;
		}
		
	};

	// Track window resize
	useEffect(() => {
		const handleResize = () => setWindowWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = "/book.png";
	};

	const handleAuthorImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		if (theme === "light") {
			e.currentTarget.src = "/user.png";
		} else {
			e.currentTarget.src = "/user2.png";
		}
	};

	// Adatok betöltése
	useEffect(() => {
		async function Books() {
			const consoleData = await api.getData();
			setBookList(consoleData.books);
			setAuthorList(consoleData.authors);
		}
		Books();
	}, [api]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [user, setUser] = useState<any>(null);

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
				<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 20px", marginTop: "20px" }}>
					<h1 className="listing-h1-books">Popular Books</h1>
					<Link to="/bookspage" className="see-all-link">
						<a href="/discover" className="see-all-link">
							<p className="see-all mb-0">See All➛</p>
						</a>
					</Link>
				</div>


				<div className="books-container mt-4">
				<div className="d-flex flex-nowrap gap-4 justify-start" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
						{booksList
							?.flatMap((section: BookSection) => section.data)
							.filter((value, index, self) =>
								index === self.findIndex(book => book.id === value.id)
							)
							.sort(
								(a: Book, b: Book) =>
									(b.statistics?.averageRating ?? 0) - (a.statistics?.averageRating ?? 0)
							)
							.slice(0, getItemsToShow('books'))
							.map((book: Book, index: number) => (
								<Link
									key={`${book.id}-${index}`}
									to={`/book/${book.id}`}
									style={{ textDecoration: "none" }}
								>
									<div className="books-display-main">
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
													{book.statistics?.averageRating != null
														? book.statistics.averageRating.toFixed(2)
														: "N/A"}
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
								</Link>
							))}
					</div>
				</div>
			</div>


			{/* Popular Authors */}
			<div className="authors-container-main">
				<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 20px", marginTop: "20px" }}>
					<h1 className="listing-h1-authors">Popular Authors</h1>
					<Link to="/authorspage" className="see-all-link">
						<a href="/discover" className="see-all-link">
							<p className="see-all mb-0">See All➛</p>
						</a>
					</Link>
				</div>

				<div className="authors-container mt-5">
				<div className="d-flex justify-content-start gap-5 flex-nowrap" style={{ paddingLeft: "20px", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
						{authorList
							?.flatMap((section: AuthorSection) => section.data)
							.filter((value, index, self) =>
								index === self.findIndex(author => author.id === value.id)
							)
						.slice(0, getItemsToShow('authors'))
							.map((author, index) => (
								<Link key={`${author.id}-${index}`} to={`/author/${author.id}`} className="text-center">
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
								</Link>
							))}
					</div>
				</div>
			</div>

			<div>{/* Explore genres */}</div>
			<div>{/* Popular Authors */}</div>

			{/* Footer */}
			<footer className="footer">
				<div>
					<p>
						<div className="contributors-list-a-tab-closer-to-the-middle">
							<h2 className="contact-h1">Contact us</h2>
							<a className="link" href="https://github.com/20HDMI04">Balogh János Péter</a><br />
							<a className="link" href="https://github.com/Cs3k0">Szalontai Csekő Krisztián</a><br />
							<a className="link" href="https://github.com/LepkefingLeo">Hegedűs Péter</a><br />
						</div>
					</p>
				</div>
			</footer>

			<div className="footer2">
				<p>Copyright© Readsy 2025. All rights reserved.</p>
				<p className="Privacy">Privacy & Policy</p>
			</div>
		</div>
	);
}