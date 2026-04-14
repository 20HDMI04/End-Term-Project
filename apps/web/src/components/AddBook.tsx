import "bootstrap/dist/css/bootstrap.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../context/apiContext";
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from "../context/darkmodeContext";
import Session from "supertokens-auth-react/recipe/session";
import { NotificationBell } from "./NotificationBell";
import Swal from "sweetalert2";
import "./css/home.css";

const AVAILABLE_GENRES = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Romance",
    "Thriller",
    "Historical Fiction",
    "Biography",
    "Self-Help",
    "Poetry",
    "Drama",
    "Children's",
    "Young Adult",
    "Horror",
    "Adventure",
    "Comedy"
];

export function AddBook() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const api = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        isbn: "",
        description: "",
        pageNumber: "",
        publicationYear: "",
        genreNames: [] as string[]
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenreToggle = (genre: string) => {
        setFormData(prev => ({
            ...prev,
            genreNames: prev.genreNames.includes(genre)
                ? prev.genreNames.filter(g => g !== genre)
                : [...prev.genreNames, genre]
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            Swal.fire("Error", "Please enter a book title", "error");
            return;
        }

        if (!formData.isbn.trim()) {
            Swal.fire("Error", "Please enter an ISBN", "error");
            return;
        }

        if (formData.description.trim().length < 20) {
            Swal.fire("Error", "Description must be at least 20 characters", "error");
            return;
        }

        if (formData.genreNames.length === 0) {
            Swal.fire("Error", "Please select at least one genre", "error");
            return;
        }

        // Show confirmation popup
        const result = await Swal.fire({
            title: "Add New Book?",
            html: `
                <div style="text-align: left;">
                    ${coverImagePreview ? `<div style="margin-bottom: 15px; text-align: center;"><img src="${coverImagePreview}" alt="Preview" style="max-width: 150px; max-height: 200px; border-radius: 5px;"/></div>` : ''}
                    <p><strong>Title:</strong> ${formData.title}</p>
                    <p><strong>ISBN:</strong> ${formData.isbn}</p>
                    <p><strong>Genres:</strong> ${formData.genreNames.join(", ")}</p>
                    ${formData.pageNumber ? `<p><strong>Pages:</strong> ${formData.pageNumber}</p>` : ''}
                    ${formData.publicationYear ? `<p><strong>Publication Year:</strong> ${formData.publicationYear}</p>` : ''}
                    <p><strong>Description:</strong> ${formData.description.substring(0, 100)}...</p>
                </div>
            `,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Add Book",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#6c8f5e"
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            // Call API to create book
            await api.createBook(
                coverImage,
                {
                    title: formData.title,
                    isbns: [formData.isbn],
                    description: formData.description,
                    pageNumber: formData.pageNumber ? parseInt(formData.pageNumber) : null,
                    latestPublicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : null,
                    genreNames: formData.genreNames
                }
            );

            Swal.fire(
                "Success!",
                "Book has been added successfully.",
                "success"
            ).then(() => {
                navigate("/user/me");
            });
        } catch (err: any) {
            console.error("Error adding book:", err);
            Swal.fire(
                "Error",
                err.message || "Failed to add book. Please try again.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="home-container">
            {/* NAVBAR */}
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
                                title="Toggle dark mode"
                                aria-label="Toggle dark mode"
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
                                    src={theme === "light" ? "/def_profile_icon.svg" : "/def_profile_icon2.svg"}
                                    alt="profile"
                                    className="profile-pic"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card p-4" style={{ backgroundColor: "var(--accent-bg)" }}>
                            <h2 className="mb-4" style={{ color: "var(--text-color)" }}>Add a New Book</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        <strong>Book Title *</strong>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter book title"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        <strong>ISBN *</strong>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleChange}
                                        placeholder="Enter ISBN (e.g., 978-0-123456-78-9)"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        <strong>Description *</strong>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Enter book description (minimum 20 characters)"
                                        rows={4}
                                        required
                                    />
                                    <small style={{ color: "var(--text-color)" }}>
                                        {formData.description.length} / 20 characters minimum
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        <strong>Genres * (Select at least one)</strong>
                                    </label>
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                        gap: "10px",
                                        backgroundColor: "var(--secondary-bg)",
                                        padding: "10px",
                                        borderRadius: "5px"
                                    }}>
                                        {AVAILABLE_GENRES.map(genre => (
                                            <label key={genre} style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "var(--text-color)" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.genreNames.includes(genre)}
                                                    onChange={() => handleGenreToggle(genre)}
                                                    style={{ marginRight: "8px" }}
                                                />
                                                {genre}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Publication Year
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="publicationYear"
                                        value={formData.publicationYear}
                                        onChange={handleChange}
                                        placeholder="e.g., 2023"
                                        min="1000"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Number of Pages
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="pageNumber"
                                        value={formData.pageNumber}
                                        onChange={handleChange}
                                        placeholder="e.g., 350"
                                        min="1"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        <strong>Book Cover Image</strong>
                                    </label>
                                    <div style={{
                                        backgroundColor: "var(--secondary-bg)",
                                        padding: "20px",
                                        borderRadius: "5px",
                                        textAlign: "center"
                                    }}>
                                        {coverImagePreview ? (
                                            <div>
                                                <img
                                                    src={coverImagePreview}
                                                    alt="Cover preview"
                                                    style={{
                                                        maxWidth: "150px",
                                                        maxHeight: "200px",
                                                        borderRadius: "5px",
                                                        marginBottom: "10px"
                                                    }}
                                                />
                                                <p style={{ color: "var(--text-color)", marginBottom: "10px" }}>
                                                    {coverImage?.name}
                                                </p>
                                            </div>
                                        ) : (
                                            <p style={{ color: "var(--text-color)", marginBottom: "10px" }}>
                                                No image selected
                                            </p>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: "none" }}
                                            id="coverImageInput"
                                        />
                                        <label
                                            htmlFor="coverImageInput"
                                            className="btn btn-outline-primary btn-sm"
                                            style={{ cursor: "pointer" }}
                                        >
                                            Choose Image
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-success flex-grow-1"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Adding..." : "Add Book"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate("/user/me")}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
