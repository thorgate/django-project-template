import React from "react";

export function Container({ children }: { children: React.ReactNode }) {
    return (
        <main className="tw-min-h-screen tw-bg-gray-100 dark:tw-bg-slate-950 dark:tw-text-white sm:tw-py-20">
            <div className="tw-container tw-mx-auto">{children}</div>
        </main>
    );
}
