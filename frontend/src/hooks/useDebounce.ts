import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user stops changing it for `delay` ms.
 * Use for search inputs to reduce unnecessary API calls.
 */
export function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
