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
import { Footer } from "./Footer";

export function Home() {
	const api = useApi();

	const { theme, toggleTheme } = useTheme();
	const [booksList, setBookList] = useState<BookSection[]>();
	const [authorList, setAuthorList] = useState<AuthorSection[]>();
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [isAdmin, setIsAdmin] = useState(false);

	const getItemsToShow = (type: 'books' | 'authors') => {
		if (windowWidth < 576) {
			return type === 'books' ? 2 : 2;
		} else if (windowWidth < 768) {
			return type === 'books' ? 3 : 3;
		} else if (windowWidth < 1024) {
			return type === 'books' ? 4 : 4;
		} else if (windowWidth < 1100) {
			return type === 'books' ? 6 : 6;
		} else if (windowWidth < 1200) {
			return type === 'books' ? 7 : 7;
		}
		else if (windowWidth < 1400) {
			return type === 'books' ? 8 : 8;
		} else {
			return type === 'books' ? 9 : 9;
		}

	};

	useEffect(() => {
		const handleResize = () => setWindowWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = "/book.png";
	};

	useEffect(() => {
		async function Books() {
			const consoleData = await api.getData();
			setBookList(consoleData.books);
			setAuthorList(consoleData.authors);
		}
		Books();
	}, [api]);

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

			<div className="books-container-main">
				<div className="d-flex align-items-center justify-content-between" style={{ margin: "0 20px", marginTop: "20px" }}>
					<h1 className="listing-h1-books">Popular Books</h1>
					<Link to="/bookspage" className="see-all-link">
						<p className="see-all mb-0">See All➛</p>
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

			{booksList
				?.filter((section) => section.title !== "Popular Books")
				.map((section, sectionIndex) => (
					<div key={sectionIndex} className="books-container-main">
						<div
							className="d-flex align-items-center justify-content-between"
							style={{ margin: "0 20px", marginTop: "20px" }}
						>
							<div>
								<h1 className="listing-h1-books">{section.title}</h1>
								{section.subtitle && (
									<p style={{ margin: 0, opacity: 0.7 }}>{section.subtitle}</p>
								)}
							</div>

							<Link to="/bookspage" className="see-all-link">
								<p className="see-all mb-0">See All➛</p>
							</Link>
						</div>

						<div className="books-container mt-4">
							<div
								className="d-flex flex-nowrap gap-4 justify-start"
								style={{
									overflowX: "auto",
									scrollbarWidth: "none",
									msOverflowStyle: "none",
								}}
							>
								{section.data
									?.filter(
										(value, index, self) =>
											index === self.findIndex((book) => book.id === value.id)
									)
									.slice(0, getItemsToShow("books"))
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
																backgroundImage: `url(${theme === "light"
																	? "/rating.svg"
																	: "/rating2.svg"
																	})`,
																backgroundRepeat: "no-repeat",
																backgroundSize: "cover",
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
															borderRadius: "5px",
														}}
														onError={handleBookImageError}
													/>

													<div
														className="card-body p-2"
														style={{ flexGrow: 1 }}
													>
														<h6 className="card-title">{book.title}</h6>
														<p className="card-text">
															{book.author?.name ?? "Unknown"}
														</p>
													</div>
												</div>
											</div>
										</Link>
									))}
							</div>
						</div>
					</div>
				))}

			<div className="paddingForAuthors">
				{authorList?.map((section: AuthorSection, sectionIndex) => (
					<div key={sectionIndex} className="authors-container-main">

						<div
							className="d-flex align-items-center justify-content-between"
							style={{ margin: "0 20px", marginTop: "20px" }}
						>
							<div>
								<h1 className="listing-h1-authors">{section.title}</h1>
								{section.subtitle && (
									<p style={{ margin: 0, opacity: 0.7 }}>{section.subtitle}</p>
								)}
							</div>

							<Link to="/authorspage" className="see-all-link">
								<p className="see-all mb-0">See All➛</p>
							</Link>
						</div>

						<div className="authors-container mt-5">
							<div
								className="d-flex justify-content-start gap-5 flex-nowrap"
								style={{
									paddingLeft: "20px",
									overflowX: "auto",
									scrollbarWidth: "none",
									msOverflowStyle: "none",
								}}
							>
								{section.data
									?.slice(0, getItemsToShow("authors"))
									.map((author) => (
										<Link
											key={`${author.id}-${theme}`}
											to={`/author/${author.id}`}
											className="text-center"
										>
											<img
												className="author-ic"
												src={
													author.smallerProfilePic ||
													(theme === "light" ? "/user.png" : "/user2.png")
												}
												data-theme={theme}
												style={{
													width: "120px",
													height: "120px",
													borderRadius: "50%",
													objectFit: "cover",
													boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
													transition: "transform 0.3s",
													cursor: "pointer",
													marginBottom: "5px",
												}}
												onError={(e) => {
													e.currentTarget.src = theme === "light" ? "/user.png" : "/user2.png";
												}}
											/>
											<p className="author-name">
												{author.name ?? "Unknown Author"}
											</p>
										</Link>
									))}
							</div>
						</div>
					</div>
				))}
			</div>
			<Footer />
		</div>
	);
}