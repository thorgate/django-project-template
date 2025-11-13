import React from "react";
import clsx from "clsx";

export const Container: React.FC<{
    children: React.ReactNode;
    version?: "fullwidth" | "default";
}> = ({ version = "default", children }) => {
    return (
        <main className="h-screen overflow-auto bg-gray-100 dark:bg-slate-950 dark:text-white py-16">
            <div
                className={clsx(
                    "h-full",
                    version === "fullwidth" && "w-full px-3",
                    version === "default" && "container py-3",
                )}
            >
                {children}
            </div>
        </main>
    );
};
