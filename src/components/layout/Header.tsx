import React, { useState } from "react";
import { useAdmin } from "../../app/providers/AdminProvider";
import { Modal } from "./Modal";
import logo from "../../assets/logo.jpg";

export function Header({ onReset }: { onReset: () => void }) {
    const { isAdmin, login, logout } = useAdmin();
    const [open, setOpen] = useState(false);
    const [pin, setPin] = useState("");
    const [err, setErr] = useState<string | null>(null);

    return (
        <header className="header">
            {/* Logo */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 6,
                }}
            >
                <img
                    src={logo}
                    alt="League logo"
                    style={{
                        height: 64,
                        width: 64,
                        objectFit: "cover",
                        borderRadius: 8,
                    }}
                />
            </div>

            {/* Title + subtitle BELOW logo */}
            <div
                style={{
                    textAlign: "center",
                    marginBottom: 10,
                }}
            >
                <div className="title">Sobha Windsor 8-Baller&apos;s League</div>
                <div className="subtitle">
                    Groups • Round-robin • Win = 2 pts • BM = Ball Margin (Balls a player won by)
                </div>
            </div>

            {/* Admin button */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                <button className="secondaryBtn" type="button" onClick={() => setOpen(true)}>
                    {isAdmin ? "Admin: ON" : "Admin: OFF"}
                </button>
            </div>

            {open && (
                <Modal
                    title={isAdmin ? "Admin mode" : "Enter admin PIN"}
                    onClose={() => {
                        setOpen(false);
                        setPin("");
                        setErr(null);
                    }}
                    footer={
                        isAdmin ? (
                            <button
                                className="dangerBtn"
                                type="button"
                                onClick={() => {
                                    logout();
                                    setOpen(false);
                                }}
                            >
                                Logout Admin
                            </button>
                        ) : (
                            <button
                                className="primaryBtn"
                                type="button"
                                onClick={() => {
                                    const ok = login(pin);
                                    if (!ok) setErr("Wrong PIN");
                                    else {
                                        setErr(null);
                                        setPin("");
                                        setOpen(false);
                                    }
                                }}
                                disabled={pin.trim().length === 0}
                            >
                                Unlock
                            </button>
                        )
                    }
                >
                    {isAdmin ? (
                        <div className="modalHint">Admin is enabled on this device.</div>
                    ) : (
                        <>
                            <div className="formRow">
                                <label className="label">PIN</label>
                                <input
                                    className="scoreInput"
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="enter admin pin"
                                />
                            </div>
                            {err ? <div className="errorText">{err}</div> : null}
                            <div className="modalHint">
                                View-only is the default. Admin can add players and edit scores.
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </header>
    );
}
