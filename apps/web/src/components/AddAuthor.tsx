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

export function AddAuthor() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const api = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        birthDate: "",
        nationality: "",
        topWorks: "",
        subjects: "",
        openLibraryId: "",
    });

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

    useEffect(() => {
        api.getCurrentUser().then(setUser).catch(() => {});
    }, [api]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const maxFileSize = 5 * 1024 * 1024;
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
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfileImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            Swal.fire("Error", "Please enter an author name", "error");
            return;
        }

        const result = await Swal.fire({
            title: "Add New Author?",
            html: `
                <div style="text-align: left;">
                    ${profileImagePreview ? `<div style="margin-bottom: 15px; text-align: center;"><img src="${profileImagePreview}" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;"/></div>` : ''}
                    <p><strong>Name:</strong> ${formData.name}</p>
                    ${formData.nationality ? `<p><strong>Nationality:</strong> ${formData.nationality}</p>` : ''}
                    ${formData.birthDate ? `<p><strong>Birth Date:</strong> ${formData.birthDate}</p>` : ''}
                    ${formData.bio ? `<p><strong>Bio:</strong> ${formData.bio.substring(0, 100)}...</p>` : ''}
                </div>
            `,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Add Author",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#6c8f5e"
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.createAuthor(profileImage, {
                name: formData.name,
                bio: formData.bio || undefined,
                birthDate: formData.birthDate || undefined,
                nationality: formData.nationality || undefined,
                topWorks: formData.topWorks || undefined,
                subjects: formData.subjects || undefined,
                openLibraryId: formData.openLibraryId || undefined,
            });

            Swal.fire(
                "Waiting for Approval",
                "Your author submission has been received and is pending admin review.",
                "success"
            ).then(() => navigate("/user/me"));
        } catch (err) {
            console.error("Error adding author:", err);
            let errorMessage = "Failed to add author. Please try again.";
            if ((err as Error).message) errorMessage = (err as Error).message;
            Swal.fire("Error", errorMessage, "error");
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

            {/* MAIN CONTENT */}
            <div className="container mt-5">
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-3" style={{ display: "flex", alignItems: "center", gap: "6px" }}>← Vissza</button>
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card p-4" style={{ backgroundColor: "var(--accent-bg)" }}>
                            <h2 className="mb-4" style={{ color: "var(--text-color)" }}>Add a New Author</h2>

                            <form onSubmit={handleSubmit}>
                                {/* Name */}
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Author Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter author name"
                                        required
                                    />
                                </div>

                                {/* Nationality */}
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Nationality
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleChange}
                                        placeholder="e.g., British"
                                        maxLength={100}
                                    />
                                </div>

                                {/* Birth Date */}
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Birth Date
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Bio */}
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Biography
                                    </label>
                                    <textarea
                                        className="form-control"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Enter author biography"
                                        rows={4}
                                        maxLength={5000}
                                    />
                                    <small style={{ color: "var(--text-color)" }}>
                                        {formData.bio.length} / 5000 characters
                                    </small>
                                </div>

                                {/* Top Works */}
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Top Works
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="topWorks"
                                        value={formData.topWorks}
                                        onChange={handleChange}
                                        placeholder="e.g., The Lord of the Rings, The Hobbit"
                                        maxLength={1000}
                                    />
                                </div>

                                {/* Subjects */}
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Subjects
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="subjects"
                                        value={formData.subjects}
                                        onChange={handleChange}
                                        placeholder="e.g., Fantasy, Adventure, Mythology"
                                        maxLength={1000}
                                    />
                                </div>

                                {/* Open Library ID */}
                                {/* Profile Image */}
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: "var(--text-color)" }}>
                                        Profile Image
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
                                        {profileImagePreview ? (
                                            <div>
                                                <img
                                                    src={profileImagePreview}
                                                    alt="Preview"
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        objectFit: "cover",
                                                        borderRadius: "50%",
                                                        marginBottom: "10px"
                                                    }}
                                                />
                                                <p style={{ color: "var(--text-color)", marginBottom: "10px" }}>
                                                    {profileImage?.name}
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
                                            id="profileImageInput"
                                        />
                                        <label
                                            htmlFor="profileImageInput"
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
                                        {isLoading ? "Adding..." : "Add Author"}
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
