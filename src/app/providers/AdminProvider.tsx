import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ADMIN_PIN = "11431"; // ✅ UI-only gate (database security is still Edge Function)
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

    // ✅ If someone has isAdmin persisted but no valid pin in session, force view-only.
    useEffect(() => {
        if (isAdmin && adminPin !== ADMIN_PIN) {
            setIsAdmin(false);
            setAdminPin(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            // ✅ UI gate: only correct pin unlocks admin mode
            login: (pin: string) => {
                const trimmed = pin.trim();
                const ok = trimmed === ADMIN_PIN;
                if (!ok) return false;

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
