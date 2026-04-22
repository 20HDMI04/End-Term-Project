import React, { useEffect, useState } from "react";
import { useTheme } from "../context/darkmodeContext";
import { IconX, IconCheck, IconTrash } from "@tabler/icons-react";
import "./css/AdminPanel.css";

interface PendingBook {
id: string;
title: string;
description: string;
author: {
id: string;
name: string;
};
biggerCoverPic: string;
smallerCoverPic: string;
originalPublisher?: string;
originalPublicationYear?: number;
pageNumber?: number;
createdAt: string;
}

interface PendingAuthor {
id: string;
name: string;
bio?: string;
nationality?: string;
birthDate?: string;
biggerProfilePic?: string;
smallerProfilePic?: string;
createdAt: string;
}

interface AdminPanelProps {
onClose: () => void;
onCountUpdate?: () => void;
}

export default function AdminPanel({ onClose, onCountUpdate }: AdminPanelProps) {
const { theme } = useTheme();
const [activeTab, setActiveTab] = useState<"books" | "authors">("books");

const [pendingBooks, setPendingBooks] = useState<PendingBook[]>([]);
const [isBooksLoading, setIsBooksLoading] = useState(true);
const [booksPage, setBooksPage] = useState(1);
const [booksTotalPages, setBooksTotalPages] = useState(1);

const [pendingAuthors, setPendingAuthors] = useState<PendingAuthor[]>([]);
const [isAuthorsLoading, setIsAuthorsLoading] = useState(true);
const [authorsPage, setAuthorsPage] = useState(1);
const [authorsTotalPages, setAuthorsTotalPages] = useState(1);

const [actionInProgress, setActionInProgress] = useState<string | null>(null);

useEffect(() => {
const fetchPendingBooks = async () => {
try {
setIsBooksLoading(true);
const response = await fetch(
`http://localhost:3002/books/pending/list?page=${booksPage}&limit=5`,
{ method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }
);
if (response.ok) {
const data = await response.json();
setPendingBooks(data.data || []);
setBooksTotalPages(data.pagination?.totalPages || 1);
}
} catch (error) {
console.error("Error fetching pending books:", error);
} finally {
setIsBooksLoading(false);
}
};
fetchPendingBooks();
}, [booksPage]);

useEffect(() => {
const fetchPendingAuthors = async () => {
try {
setIsAuthorsLoading(true);
const response = await fetch(
`http://localhost:3002/authors/pending-approvals?page=${authorsPage}&limit=5`,
{ method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }
);
if (response.ok) {
const data = await response.json();
setPendingAuthors(data.data || []);
setAuthorsTotalPages(data.pagination?.totalPages || 1);
}
} catch (error) {
console.error("Error fetching pending authors:", error);
} finally {
setIsAuthorsLoading(false);
}
};
fetchPendingAuthors();
}, [authorsPage]);

const handleApproveBook = async (bookId: string) => {
try {
setActionInProgress(bookId);
const response = await fetch(`http://localhost:3002/books/approve/${bookId}`, { method: "PATCH", credentials: "include" });
if (response.ok) { setPendingBooks(prev => prev.filter(b => b.id !== bookId)); onCountUpdate?.(); }
else { const e = await response.json().catch(() => ({})); alert(`Failed to approve book: ${e.message || response.statusText}`); }
} catch (error) { alert("Error: " + (error instanceof Error ? error.message : String(error))); }
finally { setActionInProgress(null); }
};

const handleDeclineBook = async (bookId: string) => {
try {
setActionInProgress(bookId);
const response = await fetch(`http://localhost:3002/books/disapprove/${bookId}`, { method: "PATCH", credentials: "include" });
if (response.ok) { setPendingBooks(prev => prev.filter(b => b.id !== bookId)); onCountUpdate?.(); }
else { const e = await response.json().catch(() => ({})); alert(`Failed to decline book: ${e.message || response.statusText}`); }
} catch (error) { alert("Error: " + (error instanceof Error ? error.message : String(error))); }
finally { setActionInProgress(null); }
};

const handleApproveAuthor = async (authorId: string) => {
try {
setActionInProgress(authorId);
const response = await fetch(`http://localhost:3002/authors/${authorId}/approve`, { method: "PATCH", credentials: "include" });
if (response.ok) { setPendingAuthors(prev => prev.filter(a => a.id !== authorId)); onCountUpdate?.(); }
else { const e = await response.json().catch(() => ({})); alert(`Failed to approve author: ${e.message || response.statusText}`); }
} catch (error) { alert("Error: " + (error instanceof Error ? error.message : String(error))); }
finally { setActionInProgress(null); }
};

const handleDeclineAuthor = async (authorId: string) => {
try {
setActionInProgress(authorId);
const response = await fetch(`http://localhost:3002/authors/${authorId}/disapprove`, { method: "PATCH", credentials: "include" });
if (response.ok) { setPendingAuthors(prev => prev.filter(a => a.id !== authorId)); onCountUpdate?.(); }
else { const e = await response.json().catch(() => ({})); alert(`Failed to decline author: ${e.message || response.statusText}`); }
} catch (error) { alert("Error: " + (error instanceof Error ? error.message : String(error))); }
finally { setActionInProgress(null); }
};

return (
<div className={`admin-panel-overlay ${theme}`}>
<div className="admin-panel-modal">
<div className="admin-panel-header">
<h2>Pending Approvals</h2>
<button className="close-btn" onClick={onClose} aria-label="Close panel">
<IconX size={24} />
</button>
</div>

<div className="admin-panel-tabs">
<button className={`admin-tab-btn ${activeTab === "books" ? "active" : ""}`} onClick={() => setActiveTab("books")}>
Books {pendingBooks.length > 0 && <span className="tab-badge">{pendingBooks.length}</span>}
</button>
<button className={`admin-tab-btn ${activeTab === "authors" ? "active" : ""}`} onClick={() => setActiveTab("authors")}>
Authors {pendingAuthors.length > 0 && <span className="tab-badge">{pendingAuthors.length}</span>}
</button>
</div>

<div className="admin-panel-content">
{activeTab === "books" && (
isBooksLoading ? (
<div className="loading-state"><p>Loading pending books...</p></div>
) : pendingBooks.length === 0 ? (
<div className="empty-state"><p>No pending books awaiting approval!</p></div>
) : (
<div className="books-list">
{pendingBooks.map((book) => (
<div key={book.id} className="book-approval-card">
<div className="book-cover">
<img src={book.biggerCoverPic || "/book.png"} alt={book.title} onError={(e) => { e.currentTarget.src = "/book.png"; }} />
</div>
<div className="book-info">
<h3 className="book-title">{book.title}</h3>
<p className="book-author" style={{ color: "var(--text-color)" }}>by <strong>{book.author?.name || "Unknown"}</strong></p>
{book.originalPublicationYear && <p style={{ color: "var(--text-color)" }}>Published: {book.originalPublicationYear}</p>}
{book.pageNumber && <p style={{ color: "var(--text-color)" }}>Pages: {book.pageNumber}</p>}
{book.description && <p className="book-description" style={{ color: "var(--text-color)" }}>{book.description.substring(0, 150)}{book.description.length > 150 ? "..." : ""}</p>}
<p style={{ color: "var(--text-color)" }}>Submitted: {new Date(book.createdAt).toLocaleDateString()}</p>
</div>
<div className="book-actions">
<button className="approve-btn" onClick={() => handleApproveBook(book.id)} disabled={actionInProgress === book.id}>
<IconCheck size={20} /><span>Approve</span>
</button>
<button className="decline-btn" onClick={() => handleDeclineBook(book.id)} disabled={actionInProgress === book.id}>
<IconTrash size={20} /><span>Decline</span>
</button>
</div>
</div>
))}
</div>
)
)}

{activeTab === "authors" && (
isAuthorsLoading ? (
<div className="loading-state"><p>Loading pending authors...</p></div>
) : pendingAuthors.length === 0 ? (
<div className="empty-state"><p>No pending authors awaiting approval!</p></div>
) : (
<div className="books-list">
{pendingAuthors.map((author) => (
<div key={author.id} className="book-approval-card">
<div className="book-cover">
<img src={author.biggerProfilePic || "/def_profile_icon.svg"} alt={author.name} onError={(e) => { e.currentTarget.src = "/def_profile_icon.svg"; }} style={{ borderRadius: "50%" }} />
</div>
<div className="book-info">
<h3 className="book-title">{author.name}</h3>
{author.nationality && <p style={{ color: "var(--text-color)" }}>Nationality: {author.nationality}</p>}
{author.birthDate && <p style={{ color: "var(--text-color)" }}>Born: {new Date(author.birthDate).toLocaleDateString()}</p>}
{author.bio && <p className="book-description" style={{ color: "var(--text-color)" }}>{author.bio.substring(0, 150)}{author.bio.length > 150 ? "..." : ""}</p>}
<p style={{ color: "var(--text-color)" }}>Submitted: {new Date(author.createdAt).toLocaleDateString()}</p>
</div>
<div className="book-actions">
<button className="approve-btn" onClick={() => handleApproveAuthor(author.id)} disabled={actionInProgress === author.id}>
<IconCheck size={20} /><span>Approve</span>
</button>
<button className="decline-btn" onClick={() => handleDeclineAuthor(author.id)} disabled={actionInProgress === author.id}>
<IconTrash size={20} /><span>Decline</span>
</button>
</div>
</div>
))}
</div>
)
)}
</div>

{activeTab === "books" && !isBooksLoading && pendingBooks.length > 0 && booksTotalPages > 1 && (
<div className="admin-panel-footer">
<button disabled={booksPage === 1} onClick={() => setBooksPage(booksPage - 1)}>‹ Previous</button>
<span className="page-info">Page {booksPage} of {booksTotalPages}</span>
<button disabled={booksPage === booksTotalPages} onClick={() => setBooksPage(booksPage + 1)}>Next ›</button>
</div>
)}
{activeTab === "authors" && !isAuthorsLoading && pendingAuthors.length > 0 && authorsTotalPages > 1 && (
<div className="admin-panel-footer">
<button disabled={authorsPage === 1} onClick={() => setAuthorsPage(authorsPage - 1)}>‹ Previous</button>
<span className="page-info">Page {authorsPage} of {authorsTotalPages}</span>
<button disabled={authorsPage === authorsTotalPages} onClick={() => setAuthorsPage(authorsPage + 1)}>Next ›</button>
</div>
)}
</div>
</div>
);
}
