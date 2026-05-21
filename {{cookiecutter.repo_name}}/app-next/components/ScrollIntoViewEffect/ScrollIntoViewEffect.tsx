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
    const componentRef = React.useRef(null);
    const triggeredRef = React.useRef(false);
    const prevEffectRef = React.useRef(effect);
    if (prevEffectRef.current !== effect) {
        prevEffectRef.current = effect;
        triggeredRef.current = false;
    }
    const trigger = React.useCallback(() => {
        if (!triggeredRef.current) {
            effect();
        }
        triggeredRef.current = true;
    }, [effect]);

    React.useEffect(() => {
        // IntersectionObserver is not available on server side and in tests
        if (
            componentRef.current &&
            typeof IntersectionObserver !== "undefined"
        ) {
            const observer = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    trigger();
                }
            });
            observer.observe(componentRef.current);
            return () => observer.disconnect();
        }
    }, [componentRef, trigger]);

    return (
        <span ref={componentRef} className={className}>
            {children}
        </span>
    );
};
