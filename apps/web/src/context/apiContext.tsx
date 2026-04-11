/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext } from "react";
import type { MainPageData } from "../components/interfaces/interfaces";

interface ApiContextType {
    getData: () => Promise<MainPageData>;
    getCurrentUser: () => Promise<any>;
    likeBook: (bookId: string) => Promise<any>;
    unlikeBook: (bookId: string) => Promise<any>;
    likeAuthor: (authorId: string) => Promise<any>;
    unlikeAuthor: (authorId: string) => Promise<any>;
    refetchUser: () => Promise<any>;
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

    // Refetch user data - used to refresh profile after favoriting
    async function refetchUser(): Promise<any> {
        return getCurrentUser();
    }

    return (
        <ApiContext.Provider value={{ getData, getCurrentUser, likeBook, unlikeBook, likeAuthor, unlikeAuthor, refetchUser }}>
            {children}
        </ApiContext.Provider>
    );
};

// Hook az ApiContext használatához
// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => useContext(ApiContext);