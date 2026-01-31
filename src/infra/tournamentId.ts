export function getTournamentIdFromUrl(): string | null {
    try {
        const url = new URL(window.location.href);
        return url.searchParams.get("t");
    } catch {
        return null;
    }
}

export function setTournamentIdInUrl(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("t", id);
    window.history.replaceState({}, "", url.toString());
}
