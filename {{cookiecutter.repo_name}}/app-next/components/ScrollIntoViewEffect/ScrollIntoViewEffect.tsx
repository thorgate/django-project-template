import * as React from "react";

export interface ScrollIntoViewEffectProps {
    effect: () => void;
    children?: React.ReactNode;
    className?: string;
}

export const ScrollIntoViewEffect = ({
    effect,
    children,
    className = "",
}: ScrollIntoViewEffectProps) => {
    const component = React.useRef(null);
    const [triggered, setTriggered] = React.useState<boolean>(false);
    const trigger = React.useCallback(() => {
        if (!triggered) {
            effect();
        }
        setTriggered(true);
    }, [triggered, effect]);

    /* Reset on effect change */
    React.useEffect(() => {
        setTriggered(false);
    }, [effect]);

    React.useEffect(() => {
        // IntersectionObserver is not available on server side and in tests
        if (component.current && typeof IntersectionObserver !== "undefined") {
            const observer = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    trigger();
                }
            });
            observer.observe(component.current);
            return () => observer.disconnect();
        }
    }, [component, trigger]);

    return (
        <span ref={component} className={className}>
            {children}
        </span>
    );
};
