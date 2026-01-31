import { useEffect } from "react";

export function useLocalStorageEffect<T>(value: T, onSave: (value: T) => void): void {
    useEffect(() => {
        onSave(value);
    }, [value, onSave]);
}
