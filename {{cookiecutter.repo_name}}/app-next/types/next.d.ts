import type {
    NextComponentType,
    NextPageContext,
    NextLayoutComponentType,
} from "next";
import type { AppProps } from "next/app";
import type { LayoutProps } from "@components/Layout";

declare module "next" {
    type NextLayoutComponentType<P = {}> = NextComponentType<
        NextPageContext,
        any,
        P
    > & {
        getLayout?: (page: ReactNode) => ReactNode;
        getLayoutProps?: () => Partial<LayoutProps>;
    };
}

declare module "next/app" {
    type AppLayoutProps<P = {}> = AppProps & {
        Component: NextLayoutComponentType;
    };
}
