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

interface AdminPanelProps {
	onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
	const { theme } = useTheme();
	const [pendingBooks, setPendingBooks] = useState<PendingBook[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [actionInProgress, setActionInProgress] = useState<string | null>(null);

	// Fetch pending books
	useEffect(() => {
		const fetchPendingBooks = async () => {
			try {
				setIsLoading(true);
				const limit = 5;
				const response = await fetch(
					`http://localhost:3002/books/pending/list?page=${page}&limit=${limit}`,
					{
						method: "GET",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					setPendingBooks(data.data || []);
					setTotalPages(data.pagination?.totalPages || 1);
				} else {
					console.error("Failed to fetch pending books");
				}
			} catch (error) {
				console.error("Error fetching pending books:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPendingBooks();
	}, [page]);

	// Approve book
	const handleApprove = async (bookId: string) => {
		try {
			setActionInProgress(bookId);
			const response = await fetch(
				`http://localhost:3002/books/approve/${bookId}`,
				{
					method: "PATCH",
					credentials: "include",
				}
			);

			if (response.ok) {
				// Remove the book from the list
				setPendingBooks(pendingBooks.filter((book) => book.id !== bookId));
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Approve error response:", response.status, errorData);
				alert(`Failed to approve book: ${errorData.message || response.statusText}`);
			}
		} catch (error) {
			console.error("Error approving book:", error);
			alert("Error approving book: " + (error instanceof Error ? error.message : String(error)));
		} finally {
			setActionInProgress(null);
		}
	};

	// Decline/Disapprove book
	const handleDecline = async (bookId: string) => {
		try {
			setActionInProgress(bookId);
			const response = await fetch(
				`http://localhost:3002/books/disapprove/${bookId}`,
				{
					method: "PATCH",
					credentials: "include",
				}
			);

			if (response.ok) {
				// Remove the book from the list
				setPendingBooks(pendingBooks.filter((book) => book.id !== bookId));
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Decline error response:", response.status, errorData);
				alert(`Failed to decline book: ${errorData.message || response.statusText}`);
			}
		} catch (error) {
			console.error("Error declining book:", error);
			alert("Error declining book: " + (error instanceof Error ? error.message : String(error)));
		} finally {
			setActionInProgress(null);
		}
	};

	return (
		<div className={`admin-panel-overlay ${theme}`}>
			<div className="admin-panel-modal">
				<div className="admin-panel-header">
					<h2>Pending Book Approvals</h2>
					<button
						className="close-btn"
						onClick={onClose}
						aria-label="Close panel"
					>
						<IconX size={24} />
					</button>
				</div>

				<div className="admin-panel-content">
					{isLoading ? (
						<div className="loading-state">
							<p>Loading pending books...</p>
						</div>
					) : pendingBooks.length === 0 ? (
						<div className="empty-state">
							<p>No pending books awaiting approval!</p>
						</div>
					) : (
						<div className="books-list">
							{pendingBooks.map((book) => (
								<div key={book.id} className="book-approval-card">
									<div className="book-cover">
										<img
											src={book.biggerCoverPic || "/book.png"}
											alt={book.title}
											onError={(e) => {
												e.currentTarget.src = "/book.png";
											}}
										/>
									</div>

									<div className="book-info">
										<h3 className="book-title">{book.title}</h3>
										<p className="book-author">
											by <strong>{book.author?.name || "Unknown"}</strong>
										</p>

										{book.originalPublicationYear && (
											<p className="book-year">
												Published: {book.originalPublicationYear}
											</p>
										)}

										{book.originalPublisher && (
											<p className="book-publisher">
												Publisher: {book.originalPublisher}
											</p>
										)}

										{book.pageNumber && (
											<p className="book-pages">
												Pages: {book.pageNumber}
											</p>
										)}

										{book.description && (
											<p className="book-description">
												{book.description.substring(0, 150)}
												{book.description.length > 150 ? "..." : ""}
											</p>
										)}

										<p className="book-submitted">
											Submitted: {new Date(book.createdAt).toLocaleDateString()}
										</p>
									</div>

									<div className="book-actions">
										<button
											className="approve-btn"
											onClick={() => handleApprove(book.id)}
											disabled={actionInProgress === book.id}
											title="Approve this book"
										>
											<IconCheck size={20} />
											<span>Approve</span>
										</button>

										<button
											className="decline-btn"
											onClick={() => handleDecline(book.id)}
											disabled={actionInProgress === book.id}
											title="Decline this book"
										>
											<IconTrash size={20} />
											<span>Decline</span>
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{!isLoading && pendingBooks.length > 0 && totalPages > 1 && (
					<div className="admin-panel-footer">
						<button
							disabled={page === 1}
							onClick={() => setPage(page - 1)}
						>
							← Previous
						</button>
						<span className="page-info">
							Page {page} of {totalPages}
						</span>
						<button
							disabled={page === totalPages}
							onClick={() => setPage(page + 1)}
						>
							Next →
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
