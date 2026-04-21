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
    const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
    const [genreSearch, setGenreSearch] = useState("");
    const [authorSearch, setAuthorSearch] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        isbn: "",
        chosenAuthor: "",
        description: "",
        pageNumber: "",
        publicationYear: "",
        genreNames: [] as string[]
    });

    // Helper function to get theme-based colors
    const getDropdownColor = () => theme === "dark" ? "#1e3a8a" : "#6c8f5e";

    // Fetch authors for selection
    useEffect(() => {
        async function fetchAuthors() {
            try {
                const data = await api.getData();
                const allAuthors = data.authors
                    .flatMap((section) => section.data)
                    .filter((value, index, self) =>
                        index === self.findIndex((a) => a.id === value.id)
                    );
                setAuthors(allAuthors.map((a) => ({ id: a.id, name: a.name })));
            } catch (err) {
                console.error('Error fetching authors:', err);
                setAuthors([]);
            }
        }
        fetchAuthors();
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

    const handleAuthorToggle = (authorId: string) => {
        setFormData(prev => ({
            ...prev,
            chosenAuthor: prev.chosenAuthor === authorId ? "" : authorId
        }));
    };

    const filteredGenres = AVAILABLE_GENRES.filter(genre =>
        genre.toLowerCase().includes(genreSearch.toLowerCase()) &&
        !formData.genreNames.includes(genre)
    ).sort((a, b) => a.localeCompare(b));

    const filteredAuthors = authors
        .filter(author =>
            author.name.toLowerCase().includes(authorSearch.toLowerCase()) &&
            author.id !== formData.chosenAuthor
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    const getAuthorName = (id: string) => authors.find(a => a.id === id)?.name || "Unknown";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        
        if (file) {
            if (file.size > maxFileSize) {
                Swal.fire(
                    "File Too Large",
                    `The image is too large. Maximum file size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
                    "error"
                );
                e.target.value = "";
                return;
            }
            
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

        if (!formData.chosenAuthor) {
            Swal.fire("Error", "Please select at least one author", "error");
            return;
        }

        // Show confirmation popup
        const selectedAuthorName = getAuthorName(formData.chosenAuthor);
        const result = await Swal.fire({
            title: "Add New Book?",
            html: `
                <div style="text-align: left;">
                    ${coverImagePreview ? `<div style="margin-bottom: 15px; text-align: center;"><img src="${coverImagePreview}" alt="Preview" style="max-width: 150px; max-height: 200px; border-radius: 5px;"/></div>` : ''}
                    <p><strong>Title:</strong> ${formData.title}</p>
                    <p><strong>ISBN:</strong> ${formData.isbn}</p>
                    <p><strong>Author:</strong> ${selectedAuthorName}</p>
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
                    authorId: formData.chosenAuthor,
                    pageNumber: formData.pageNumber ? parseInt(formData.pageNumber) : null,
                    latestPublicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : null,
                    genreNames: formData.genreNames
                }
                
            );

            Swal.fire(
                "Pending Approval",
                "Your book has been submitted successfully and is awaiting admin approval. You will be notified once it has been reviewed.",
                "info"
            ).then(() => {
                console.log(formData.chosenAuthor);
                navigate("/user/me");
            });
        } catch (err) {
            console.error("Error adding book:", err);
            let errorMessage = "Failed to add book. Please try again.";
            
            if ((err as any)?.status === 413 || (err as Error).message.includes("413")) {
                errorMessage = "The book cover image is too large. Maximum file size is 5MB. Please choose a smaller image.";
            } else if ((err as Error).message) {
                errorMessage = (err as Error).message;
            }
            
            Swal.fire(
                "Error",
                errorMessage,
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
                                        <strong>Author *</strong>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search authors..."
                                        value={authorSearch}
                                        onChange={(e) => setAuthorSearch(e.target.value)}
                                    />
                                    {formData.chosenAuthor && (
                                        <div style={{
                                            backgroundColor: getDropdownColor(),
                                            color: "white",
                                            padding: "10px 12px",
                                            borderRadius: "5px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "10px"
                                        }}>
                                            {getAuthorName(formData.chosenAuthor)}
                                            <button
                                                type="button"
                                                onClick={() => handleAuthorToggle(formData.chosenAuthor)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "18px",
                                                    padding: "0",
                                                    display: "flex",
                                                    alignItems: "center"
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                    {authorSearch && filteredAuthors.length > 0 && (
                                        <div style={{
                                            backgroundColor: "var(--bg-color)",
                                            borderRadius: "5px",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                            padding: "8px",
                                            border: "1px solid var(--ndfooter-bg)"
                                        }}>
                                            {filteredAuthors.map(author => (
                                                <div
                                                    key={author.id}
                                                    onClick={() => {
                                                        handleAuthorToggle(author.id);
                                                        setAuthorSearch("");
                                                    }}
                                                    style={{
                                                        padding: "8px 12px",
                                                        cursor: "pointer",
                                                        color: "white",
                                                        borderRadius: "4px",
                                                        marginBottom: "4px",
                                                        backgroundColor: getDropdownColor(),
                                                        transition: "background-color 0.2s",
                                                        border: `1px solid ${getDropdownColor()}`
                                                    }}
                                                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.opacity = "0.8"}
                                                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.opacity = "1"}
                                                >
                                                    {author.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                        <strong>Genres *</strong>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search genres..."
                                        value={genreSearch}
                                        onChange={(e) => setGenreSearch(e.target.value)}
                                    />
                                    {formData.genreNames.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                                            {formData.genreNames.map(genre => (
                                                <div
                                                    key={genre}
                                                    style={{
                                                        backgroundColor: getDropdownColor(),
                                                        color: "white",
                                                        padding: "6px 12px",
                                                        borderRadius: "20px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                        fontSize: "14px"
                                                    }}
                                                >
                                                    {genre}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGenreToggle(genre)}
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            color: "white",
                                                            cursor: "pointer",
                                                            fontSize: "18px",
                                                            padding: "0",
                                                            display: "flex",
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {genreSearch && filteredGenres.length > 0 && (
                                        <div style={{
                                            backgroundColor: "var(--bg-color)",
                                            borderRadius: "5px",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                            padding: "8px",
                                            border: "1px solid var(--ndfooter-bg)"
                                        }}>
                                            {filteredGenres.map(genre => (
                                                <div
                                                    key={genre}
                                                    onClick={() => {
                                                        handleGenreToggle(genre);
                                                        setGenreSearch("");
                                                    }}
                                                    style={{
                                                        padding: "8px 12px",
                                                        cursor: "pointer",
                                                        color: "white",
                                                        borderRadius: "4px",
                                                        marginBottom: "4px",
                                                        backgroundColor: getDropdownColor(),
                                                        transition: "background-color 0.2s",
                                                        border: `1px solid ${getDropdownColor()}`
                                                    }}
                                                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.opacity = "0.8"}
                                                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.opacity = "1"}
                                                >
                                                    {genre}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                        <span style={{ fontSize: "0.85rem", color: "var(--text-color)", marginLeft: "8px" }}>
                                            (Max 5MB)
                                        </span>
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
