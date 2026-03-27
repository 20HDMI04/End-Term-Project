/**
 * ================================================================
 * READSY - DISCOVER COMPONENT
 * Book Discovery & Browsing Page
 * ================================================================
 * File: src/components/Discover.tsx
 * Routes: /discover, /books (alias)
 * Protected: Yes (SessionAuth wrapper in src/App.tsx)
 * 
 * Purpose:
 * - Browse and discover books
 * - Apply filters and sorting
 * - View book details
 * - Add books to lists
 * 
 * Status: EMPTY - Ready for implementation
 * 
 * Suggested Features to Implement:
 * Featured books carousel
 * Latest releases
 * Popular books
 * Genre filtering
 * Author filtering
 * Sort options (rating, date, popularity)
 * Book cards with cover images
 * Quick preview on hover
 * Add to list button
 * View book details
 * 
 * Related Files:
 *       src/App.tsx (line ~133) - Route definition
 *       COMPONENT_GUIDE.md → Discover Component - Implementation guide
 * 
 * API Endpoints Needed:
 * GET /books - List all books with filters
 * GET /books/:id - Get single book details
 * 
 * See: WEB_DOCUMENTATION.md → Discover Component section
 * ================================================================
 */
import "./css/Discover.css"
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";



export function Discover() {
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

            <header className="header">

            </header>


            <div>
                {/* Filters */}
            </div>

            <div>
                {/* For You */}
            </div>

            <div>
                {/* Popular Books */}
            </div>

            <div>
                {/* Explore Genres */}
            </div>

            <div>
                {/* Popular Authors */}
            </div>

            <footer className="footer">
                {/*Logo*/}
                <p>
                    "Jani ajánlásával lorem ipsum stb"
                </p>
                {/*contacts*/}
            </footer>
            <div className="footer2">
                <p>Copyright© Readsy 2025. Allrights reserved.</p>
                <p className="Privacy">Privacy & Policy</p>
            </div>

        </div>
    );
}
