import React, { useState } from "react";
import type { GroupId } from "../domain/tournament/types";
import { GroupTabs } from "../components/layout/Tabs";
import { Header } from "../components/layout/Header";
import { GroupPage } from "./routes/GroupPage";
import { KnockoutPage } from "./routes/KnockoutPage";
import { buildDefaultTournamentState } from "../domain/tournament/schedule";
import {TournamentProvider, useTournament} from "./providers/TournamentProvider";
import {AdminProvider} from "./providers/AdminProvider";


function AppInner() {
    const [activeGroup, setActiveGroup] = useState<GroupId>("A");
    const [view, setView] = useState<"groups" | "knockouts">("groups");
    const { dispatch } = useTournament();

    return (
        <div className="page">
            <Header/>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <button
                    className={view === "groups" ? "primaryBtn" : "secondaryBtn"}
                    type="button"
                    onClick={() => setView("groups")}
                >
                    Groups
                </button>
                <button
                    className={view === "knockouts" ? "primaryBtn" : "secondaryBtn"}
                    type="button"
                    onClick={() => setView("knockouts")}
                >
                    Knockouts
                </button>
            </div>

            {view === "groups" ? (
                <>
                    <GroupTabs active={activeGroup} onChange={setActiveGroup} />
                    <main className="main">
                        <GroupPage group={activeGroup} />
                    </main>
                </>
            ) : (
                <main className="main">
                    <KnockoutPage />
                </main>
            )}
        </div>
    );
}


export default function App() {
    return (
        <AdminProvider>
            <TournamentProvider>
                <AppInner/>
            </TournamentProvider>
        </AdminProvider>
    );
}
