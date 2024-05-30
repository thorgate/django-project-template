import React from "react";

export function Container({ children }: { children: React.ReactNode }) {
    return (
        <main className="h-screen overflow-auto bg-gray-100 dark:bg-slate-950 dark:text-white py-16">
            <div className="container h-full">{children}</div>
        </main>
    );
}
