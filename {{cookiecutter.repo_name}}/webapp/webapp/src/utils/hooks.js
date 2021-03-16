import { useEffect, useRef } from 'react';

/**
 * Trigger callback only once.
 *
 * @param handler - Handler that is called when deps change. Return true to prevent any further execution.
 * @param deps - Deps to run the effect handler.
 */
export function useEffectOnce(handler, deps) {
    const hasRan = useRef(false);

    useEffect(() => {
        if (hasRan.current) {
            return;
        }

        hasRan.current = handler();
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    return hasRan.current;
}
