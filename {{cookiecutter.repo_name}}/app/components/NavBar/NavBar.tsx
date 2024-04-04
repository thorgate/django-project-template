import clsx from "clsx";
import { ReactNode } from "react";
import Link from "next/link";

export interface NavItem {
    label: string;
    href: string;
    native?: boolean;
}

export interface NavBarProps {
    className?: string;

    navItems: NavItem[];

    children?: ReactNode;
}

interface LinkComponentProps {
    href: string;
    children: ReactNode;
    native?: boolean;
    className?: string;
}

function LinkComponent({
    href, children, native, className,
                       }: LinkComponentProps) {
    if (native) {
        return (
            <a className={className} href={href}>
                {children}
            </a>
        )
    }

    return (
        <Link className={className} href={href}>
            {children}
        </Link>
    )
}

export function NavBar({ className, navItems, children }: NavBarProps) {
    return (
        <nav
            className={clsx(
                "tw-fixed tw-w-full tw-z-30 tw-py-1 tw-bg-white dark:tw-bg-slate-800 tw-shadow-lg tw-border-b tw-border-blue-400 dark:tw-border-blue-600",
                className
            )}
        >
            <div className="tw-w-full tw-flex tw-items-center tw-justify-between tw-mt-0 tw-px-6 tw-py-2">
                <label
                    htmlFor="menu-toggle"
                    className="tw-cursor-pointer md:tw-hidden tw-block"
                >
                    <svg
                        className="tw-fill-current tw-text-blue-600 dark:tw-text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                    >
                        <title>menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </label>
                <input className="tw-hidden" type="checkbox" id="menu-toggle" />

                <div className="tw-hidden md:tw-flex md:tw-items-center md:tw-w-auto tw-w-full tw-order-3 md:tw-order-1">
                    <nav>
                        <ul className="md:tw-flex tw-items-center tw-justify-between tw-text-base tw-text-blue-600 dark:tw-text-blue-400 tw-pt-3 md:tw-pt-0">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <LinkComponent
                                        className="tw-nav-link tw-inline-block tw-no-underline hover:tw-text-black dark:hover:tw-text-white tw-font-medium tw-text-lg tw-py-2 tw-px-3 lg:-tw-ml-2"
                                        href={item.href}
                                        native={item.native}
                                    >
                                        {item.label}
                                    </LinkComponent>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {children && (
                    <div className="tw-order-2 md:tw-order-3 tw-flex tw-flex-wrap tw-items-center tw-justify-end tw-mr-0 md:tw-mr-4">
                        <div className="tw-flex tw-items-center tw-w-full md:tw-w-full">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
