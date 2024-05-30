import { Provider } from "react-redux";
import { wrapper } from "@lib/store";

export const ProvidersWrapper = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const store = wrapper.useStore();

    return <Provider store={store}>{children}</Provider>;
};
