import clsx from "clsx";
import { ReactNode } from "react";
import Link from "next/link";

export interface NavItem {
    label: string;
    href: string;
}

export interface NavBarProps {
    className?: string;

    navItems: NavItem[];

    children?: ReactNode;
}

export function NavBar({ className, navItems, children }: NavBarProps) {
    return (
        <nav
            className={clsx(
                "fixed top-0 left-0 z-50 w-full h-16 bg-white dark:bg-slate-800 shadow-lg border-b border-blue-400 dark:border-blue-600",
                className
            )}
        >
            <div className="w-full flex items-center justify-between mt-0 px-6 py-2">
                <label
                    htmlFor="menu-toggle"
                    className="cursor-pointer md:hidden block"
                >
                    <svg
                        className="fill-current text-blue-600 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                    >
                        <title>menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </label>
                <input className="hidden" type="checkbox" id="menu-toggle" />

                <div className="hidden md:flex md:items-center md:w-auto w-full order-3 md:order-1">
                    <nav>
                        <ul className="md:flex items-center justify-between text-base text-blue-600 dark:text-blue-400 pt-3 md:pt-0">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        className="nav-link inline-block no-underline hover:text-black dark:hover:text-white font-medium text-lg py-2 px-3 lg:-ml-2"
                                        href={item.href}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {children ? (
                    <div className="order-2 md:order-3 flex flex-wrap items-center justify-end mr-0 md:mr-4">
                        <div className="flex items-center w-full md:w-full">
                            {children}
                        </div>
                    </div>
                ) : null}
            </div>
        </nav>
    );
}
