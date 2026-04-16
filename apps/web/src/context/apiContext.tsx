/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext } from "react";
import type { MainPageData } from "../components/interfaces/interfaces";

interface ApiContextType {
    getData: () => Promise<MainPageData>;
    getBook: (bookId: string) => Promise<any>;
    getAuthor: (authorId: string) => Promise<any>;
    getCurrentUser: () => Promise<any>;
    likeBook: (bookId: string) => Promise<any>;
    unlikeBook: (bookId: string) => Promise<any>;
    likeAuthor: (authorId: string) => Promise<any>;
    unlikeAuthor: (authorId: string) => Promise<any>;
    addHaveRead: (bookId: string) => Promise<any>;
    removeHaveRead: (bookId: string) => Promise<any>;
    refetchUser: () => Promise<any>;
    updateUserProfile: (file: File | null, data: any) => Promise<any>;
    rateBook: (bookId: string, score: number) => Promise<any>;
    updateRating: (bookId: string, score: number) => Promise<any>;
    createBook: (file: File | null, bookData: any) => Promise<any>;
}

const ApiContext = createContext<ApiContextType>(null as any);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {

    // Main page adatok lekérése
    async function getData(): Promise<MainPageData> {
        const res = await fetch("http://localhost:3002/books/mainpage");
        if (!res.ok) throw new Error("Failed to fetch main page data");
        const json = await res.json();
        return json;
    }

    // Fetch a single book by ID with complete data and statistics
    async function getBook(bookId: string): Promise<any> {
        const res = await fetch(`http://localhost:3002/books/${bookId}`);
        if (!res.ok) throw new Error("Failed to fetch book");
        const json = await res.json();
        return json;
    }

    // Fetch a single author by ID with complete data
    async function getAuthor(authorId: string): Promise<any> {
        const res = await fetch(`http://localhost:3002/authors/${authorId}`);
        if (!res.ok) throw new Error("Failed to fetch author");
        const json = await res.json();
        return json;
    }

    // Aktuális felhasználó lekérése
    async function getCurrentUser(): Promise<any> {
        const res = await fetch("http://localhost:3002/user/me", {
            credentials: "include" // ha cookie/session alapú auth van
        });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const json = await res.json();
        return json;
    }

    // Like a book
    async function likeBook(bookId: string): Promise<any> {
        try {
            const url = `http://localhost:3002/social/book/${bookId}/like`;
            console.log("Calling:", url);
            const res = await fetch(url, {
                method: "POST",
                credentials: "include"
            });
            const text = await res.text();
            console.log("Response status:", res.status, "Body:", text);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return text ? JSON.parse(text) : { success: true };
        } catch (err) {
            console.error("Error in likeBook:", err);
            throw err;
        }
    }

    // Unlike a book
    async function unlikeBook(bookId: string): Promise<any> {
        try {
            const url = `http://localhost:3002/social/book/${bookId}/unlike`;
            console.log("Calling:", url);
            const res = await fetch(url, {
                method: "PATCH",
                credentials: "include"
            });
            const text = await res.text();
            console.log("Response status:", res.status, "Body:", text);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return text ? JSON.parse(text) : { success: true };
        } catch (err) {
            console.error("Error in unlikeBook:", err);
            throw err;
        }
    }

    // Like an author
    async function likeAuthor(authorId: string): Promise<any> {
        try {
            const url = `http://localhost:3002/social/authors/${authorId}/like`;
            console.log("Calling:", url);
            const res = await fetch(url, {
                method: "POST",
                credentials: "include"
            });
            const text = await res.text();
            console.log("Response status:", res.status, "Body:", text);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return text ? JSON.parse(text) : { success: true };
        } catch (err) {
            console.error("Error in likeAuthor:", err);
            throw err;
        }
    }

    // Unlike an author
    async function unlikeAuthor(authorId: string): Promise<any> {
        try {
            const url = `http://localhost:3002/social/authors/${authorId}/unlike`;
            console.log("Calling:", url);
            const res = await fetch(url, {
                method: "PATCH",
                credentials: "include"
            });
            const text = await res.text();
            console.log("Response status:", res.status, "Body:", text);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return text ? JSON.parse(text) : { success: true };
        } catch (err) {
            console.error("Error in unlikeAuthor:", err);
            throw err;
        }
    }

    // Add book to have read
    async function addHaveRead(bookId: string): Promise<any> {
        try {
            const url = `http://localhost:3002/social/haveread/${bookId}`;
            console.log("Calling:", url);
            const res = await fetch(url, {
                method: "POST",
                credentials: "include"
            });
            const text = await res.text();
            console.log("Response status:", res.status, "Body:", text);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return text ? JSON.parse(text) : { success: true };
        } catch (err) {
            console.error("Error in addHaveRead:", err);
            throw err;
        }
    }

    // Remove book from have read
    async function removeHaveRead(bookId: string): Promise<any> {
        try {
            const url = `http://localhost:3002/social/haveread/${bookId}`;
            console.log("Calling:", url);
            const res = await fetch(url, {
                method: "PATCH",
                credentials: "include"
            });
            const text = await res.text();
            console.log("Response status:", res.status, "Body:", text);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return text ? JSON.parse(text) : { success: true };
        } catch (err) {
            console.error("Error in removeHaveRead:", err);
            throw err;
        }
    }

    // Refetch user data - used to refresh profile after favoriting
    async function refetchUser(): Promise<any> {
        return getCurrentUser();
    }

    // Update user profile with file and/or data
    async function updateUserProfile(file: File | null, data: any): Promise<any> {
        try {
            const formData = new FormData();

            if (file) {
                formData.append("file", file);
            }

            if (data) {
                Object.keys(data).forEach(key => {
                    formData.append(key, data[key]);
                });
            }

            const res = await fetch("http://localhost:3002/user/me", {
                method: "PATCH",
                credentials: "include",
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            const result = await res.json();
            return result;
        } catch (err) {
            console.error("Error updating user profile:", err);
            throw err;
        }
    }

    // Rate a book
    async function rateBook(bookId: string, score: number): Promise<any> {
        const res = await fetch(`http://localhost:3002/social/book/${bookId}/rate`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ score }),
        });

        const text = await res.text();

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        return text ? JSON.parse(text) : { success: true };
    }

    // Rerate a book
    async function updateRating(bookId: string, score: number): Promise<any> {
        const res = await fetch(`http://localhost:3002/social/book/${bookId}/rate`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ score }),
        });

        const text = await res.text();

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        return text ? JSON.parse(text) : { success: true };
    }

    // Create a new book
    async function createBook(file: File | null, bookData: any): Promise<any> {
        try {
            const formData = new FormData();

            if (file) {
                formData.append("file", file);
            }

            // Append book data
            formData.append("title", bookData.title);
            formData.append("description", bookData.description);
            
            // Append ISBNs - each ISBN as a separate form field
            if (Array.isArray(bookData.isbns)) {
                bookData.isbns.forEach((isbn: string) => {
                    formData.append("isbns", isbn);
                });
            }
            
            // Append genre names - each genre as a separate form field
            if (Array.isArray(bookData.genreNames)) {
                bookData.genreNames.forEach((genre: string) => {
                    formData.append("genreNames", genre);
                });
            }
            
            if (bookData.pageNumber) {
                formData.append("pageNumber", String(bookData.pageNumber));
            }
            if (bookData.latestPublicationYear) {
                formData.append("latestPublicationYear", String(bookData.latestPublicationYear));
            }
            if (bookData.authorId) {
                formData.append("authorId", bookData.authorId);
            }

            console.log("Creating book with isbns:", bookData.isbns);
            
            const res = await fetch("http://localhost:3002/books", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const text = await res.text();
            console.log("Response status:", res.status, "Body:", text);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            return text ? JSON.parse(text) : { success: true };
        } catch (err) {
            console.error("Error creating book:", err);
            throw err;
        }
    }

    return (
        <ApiContext.Provider value={{ getData, getBook, getAuthor, getCurrentUser, likeBook, unlikeBook, likeAuthor, unlikeAuthor, addHaveRead, removeHaveRead, refetchUser, updateUserProfile, rateBook, updateRating, createBook }}>
            {children}
        </ApiContext.Provider>
    );
};

// Hook az ApiContext használatához
// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => useContext(ApiContext);