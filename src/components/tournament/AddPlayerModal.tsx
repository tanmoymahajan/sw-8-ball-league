// src/components/tournament/AddPlayerModal.tsx
import React, { useMemo, useState } from "react";
import type { GroupId } from "../../domain/tournament/types";
import { Modal } from "../layout/Modal";

type Validation =
    | { ok: true; name: string }
    | { ok: false; msg: string };

export function AddPlayerModal({
                                   group,
                                   onClose,
                                   onAdd,
                                   existingNames,
                               }: {
    group: GroupId;
    onClose: () => void;
    onAdd: (name: string) => void;
    existingNames: string[];
}) {
    const [name, setName] = useState("");

    const validation: Validation = useMemo(() => {
        const trimmed = name.trim();

        if (!trimmed) {
            return { ok: false, msg: "Enter a name." };
        }

        const duplicate = existingNames.some(
            (n) => n.trim().toLowerCase() === trimmed.toLowerCase()
        );

        if (duplicate) {
            return { ok: false, msg: "That name already exists in this group." };
        }

        return { ok: true, name: trimmed };
    }, [name, existingNames]);

    return (
        <Modal
            title={`Add player to Group ${group}`}
            onClose={onClose}
            footer={
                <button
                    className="primaryBtn"
                    type="button"
                    disabled={!validation.ok}
                    onClick={() => {
                        if (!validation.ok) return;
                        onAdd(validation.name); // ✅ now guaranteed string
                    }}
                >
                    Add Player
                </button>
            }
        >
            <div className="formRow">
                <label className="label">Player name</label>
                <input
                    className="scoreInput"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanmoy"
                />
            </div>

            {!validation.ok ? (
                <div className="errorText">{validation.msg}</div>
            ) : null}

            <div className="modalHint">
                Adding a player auto-creates matches vs everyone already in this group.
            </div>
        </Modal>
    );
}
