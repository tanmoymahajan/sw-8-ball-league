import React, { useState } from "react";
import { useAdmin } from "../../app/providers/AdminProvider";
import { Modal } from "./Modal";

export function Header({ onReset }: { onReset: () => void }) {
    const { isAdmin, login, logout } = useAdmin();
    const [open, setOpen] = useState(false);
    const [pin, setPin] = useState("");
    const [err, setErr] = useState<string | null>(null);

    return (
        <header className="header">
            <div>
                <div className="title">Sobha Windsor 8-Baller's League</div>
                <div className="subtitle">Groups • Round-robin • Win = 2 pts • Ball Diff from opponent remaining</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
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
