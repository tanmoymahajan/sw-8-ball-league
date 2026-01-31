import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ADMIN_PIN = "1234";
const LS_ADMIN_KEY = "eightball_admin_unlocked_v1";

type AdminContextValue = {
    isAdmin: boolean;
    login: (pin: string) => boolean;
    logout: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean>(() => {
        try {
            return localStorage.getItem(LS_ADMIN_KEY) === "true";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LS_ADMIN_KEY, isAdmin ? "true" : "false");
        } catch {
            // ignore
        }
    }, [isAdmin]);

    const value = useMemo<AdminContextValue>(
        () => ({
            isAdmin,
            login: (pin: string) => {
                const ok = pin === ADMIN_PIN;
                if (ok) setIsAdmin(true);
                return ok;
            },
            logout: () => setIsAdmin(false),
        }),
        [isAdmin]
    );

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
}
