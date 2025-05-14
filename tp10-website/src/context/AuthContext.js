"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({ user: null, setUser: () => {} });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // fetch once on mount
        fetch("/api/auth/me")
            .then(res => res.ok ? res.json() : null)
            .then(data => setUser(data))
            .catch(() => {/* silent */});
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
