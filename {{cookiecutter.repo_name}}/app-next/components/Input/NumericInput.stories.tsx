import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { SimpleNumericInput } from "./NumericInput";

const meta = {
    title: "Input/NumericInput",
    component: SimpleNumericInput,
    tags: ["autodocs"],
} satisfies Meta<typeof SimpleNumericInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Type a number",
        thousandSeparator: " ",
        thousandsGroupStyle: "thousand",
        decimalSeparator: ",",
        decimalScale: 3,
    },
};

const ValueController: React.FC<{
    children: (props: {
        defaultValue: string;
        onChange: (v: React.ChangeEvent<HTMLInputElement>) => void;
        label: string;
    }) => React.ReactNode;
}> = ({ children }) => {
    const [value, setValue] = React.useState("");
    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        },
        [],
    );
    const label = React.useMemo(
        () => `Value: ${value || "<nothing>"}`,
        [value],
    );
    return <>{children({ defaultValue: value, onChange, label })}</>;
};

export const WithCurrentValue: Story = {
    decorators: [
        (Story) => (
            <ValueController>
                {(props) => <Story args={{ ...props }} />}
            </ValueController>
        ),
    ],
};

export const WithError: Story = {
    args: {
        label: "Type a number",
        defaultValue: 420000.001,
        error: "But what was the question?",
    },
};

export const WithSuffix: Story = {
    args: {
        label: "Type a weight",
        defaultValue: 42,
        suffix: " t",
    },
};
