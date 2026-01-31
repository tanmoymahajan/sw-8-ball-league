import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const LS_ADMIN_KEY = "eightball_admin_unlocked_v2";
const SS_ADMIN_PIN_KEY = "eightball_admin_pin_v1";

type AdminContextValue = {
    isAdmin: boolean;
    adminPin: string | null;
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

    const [adminPin, setAdminPin] = useState<string | null>(() => {
        try {
            return sessionStorage.getItem(SS_ADMIN_PIN_KEY);
        } catch {
            return null;
        }
    });

    // Persist admin unlocked flag
    useEffect(() => {
        try {
            localStorage.setItem(LS_ADMIN_KEY, isAdmin ? "true" : "false");
        } catch {
            // ignore
        }
    }, [isAdmin]);

    // Persist pin only for the session
    useEffect(() => {
        try {
            if (adminPin) sessionStorage.setItem(SS_ADMIN_PIN_KEY, adminPin);
            else sessionStorage.removeItem(SS_ADMIN_PIN_KEY);
        } catch {
            // ignore
        }
    }, [adminPin]);

    const value = useMemo<AdminContextValue>(
        () => ({
            isAdmin,
            adminPin,

            // IMPORTANT:
            // We do NOT validate the pin here anymore for "real security".
            // The backend Edge Function will validate the pin on every save.
            // Here we just set isAdmin=true if user enters something non-empty.
            // If you still want local validation, you can keep it (but it’s not secure anyway).
            login: (pin: string) => {
                const trimmed = pin.trim();
                if (!trimmed) return false;

                setIsAdmin(true);
                setAdminPin(trimmed);
                return true;
            },

            logout: () => {
                setIsAdmin(false);
                setAdminPin(null);
            },
        }),
        [isAdmin, adminPin]
    );

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
}
