import React from "react";
import type { GroupId } from "../../domain/tournament/types";
import { GROUPS } from "../../domain/tournament/constants";

export function GroupTabs({ active, onChange }: { active: GroupId; onChange: (g: GroupId) => void }) {
    return (
        <nav className="tabs">
            {GROUPS.map((g) => (
                <button
                    key={g}
                    className={`tabBtn ${active === g ? "tabBtnActive" : ""}`}
                    onClick={() => onChange(g)}
                    type="button"
                >
                    Group {g}
                </button>
            ))}
        </nav>
    );
}
