import * as React from "react";
import clsx from "clsx";
import Link from "next/link";

export interface NavItem {
    label: string;
    href: string;
    className?: string;
}

export interface NavBarProps {
    className?: string;

    navItems: NavItem[];

    children?: React.ReactNode;
}

export function NavBar({ className, navItems, children }: NavBarProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const onToggleDropdown = React.useCallback(() => {
        setIsOpen((current) => !current);
    }, []);
    const onCloseDropdown = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <nav
            className={clsx(
                "fixed top-0 left-0 z-50 w-full h-16 text-white",
                className,
            )}
        >
            <div className="w-full flex items-center justify-between mt-0 px-6 pt-1 pb-2 flex-wrap md:flex-nowrap border-t bg-brand-muted border-brand-muted">
                <label
                    className="cursor-pointer md:hidden block"
                    onClick={onToggleDropdown}
                >
                    <svg
                        className="fill-current text-brand-light"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                    >
                        <title>menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </label>

                <div
                    className={clsx(
                        "md:flex md:items-center md:w-auto w-full order-3 md:order-1",
                        {
                            hidden: !isOpen,
                            flex: isOpen,
                        },
                    )}
                >
                    <nav>
                        <ul className="md:flex items-center justify-between text-base text-white pt-3 md:pt-0">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        className={clsx(
                                            "nav-link inline-block no-underline text-white hover:text-brand-primary hover:bg-brand-muted-dark font-light py-2 px-3 uppercase",
                                            item.className,
                                        )}
                                        href={item.href}
                                        onClick={onCloseDropdown}
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
