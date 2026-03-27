import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";

export function Search() {

    const { theme, toggleTheme } = useTheme();


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

                            <a href="/profile">
                                <img
                                    src={theme === "light" ? "def_profile_icon.svg" : "def_profile_icon2.svg"}
                                    alt="profile"
                                    className="profile-pic"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>


            <header>
                {/* Search bar */}
            </header>

            <div>
                {/* Explore */}
            </div>

            <div>
                {/* For You */}
            </div>

            <div>
                {/* Popular Books */}
            </div>

            <div>
                {/* Popular Authors */}
            </div>

            <footer>
                {/*Logo*/}
                <p>
                    "Jani ajánlásával lorem ipsum stb"
                </p>
                {/*contacts*/}
            </footer>

        </div>
    );
}