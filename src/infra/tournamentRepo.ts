import { supabase } from "./supabaseClient";
import type { TournamentState } from "../domain/tournament/types";

export async function loadTournament(tournamentId: string): Promise<TournamentState> {
    const { data, error } = await supabase
        .from("tournaments")
        .select("state")
        .eq("id", tournamentId)
        .single();

    if (error) throw new Error(error.message);
    if (!data?.state) throw new Error("Tournament not found");
    return data.state as TournamentState;
}

export async function createTournament(initial: TournamentState): Promise<string> {
    const { data, error } = await supabase.functions.invoke("create-tournament", {
        body: { state: initial },
    });

    if (error) throw new Error(error.message);
    if (!data?.id) throw new Error("Missing tournament id");
    return data.id as string;
}

export async function saveTournament(tournamentId: string, state: TournamentState, pin: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke("save-tournament", {
        body: { tournamentId, state, pin },
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(String(data.error));
}
