import * as React from "react";
import NextImage from "next/image";
import config from "@lib/config";

const directLoader = ({ src }: { src: string }) => src;

const debug = config("APP_PUBLIC_DEBUG", "boolean");

export const Image: React.FC<
    Omit<React.ComponentProps<typeof NextImage>, "loader"> & {
        loadDirectly?: boolean;
    }
> = ({ loadDirectly, unoptimized: outerUnoptimized, ...props }) => {
    const unoptimized = React.useMemo(
        () => outerUnoptimized || debug || loadDirectly,
        [outerUnoptimized, loadDirectly]
    );
    const loader = React.useMemo(
        () => (unoptimized ? directLoader : undefined),
        [unoptimized]
    );

    return <NextImage {...props} unoptimized={unoptimized} loader={loader} />;
};
