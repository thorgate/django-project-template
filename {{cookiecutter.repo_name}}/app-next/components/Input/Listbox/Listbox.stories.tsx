import type { Meta, StoryObj } from "@storybook/react";
import { Listbox } from "./Listbox";

const meta = {
    title: "Input/Listbox",
    component: Listbox,
    tags: ["autodocs"],
} satisfies Meta<typeof Listbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
    { label: "Anton", key: "anton" },
    { label: "Bora", key: "bora" },
    { label: "Burak", key: "burak" },
    { label: "Dima", key: "dima" },
    { label: "Fred", key: "fred" },
    { label: "Johan", key: "johan" },
    { label: "Joosep", key: "joosep" },
    { label: "Jörgen", key: "jorgen" },
    { label: "Jürno", key: "jyrno" },
    { label: "Kristofer", key: "kristofer" },
    { label: "Kaspar", key: "kaspar" },
    { label: "Madis", key: "madis" },
    { label: "Miguel Angel", key: "miguel" },
    { label: "Mansur", key: "Mansur" },
    { label: "Omar", key: "omar" },
    { label: "Pablo Rodriguez Cesar", key: "pablo" },
    { label: "Rain", key: "rain" },
    { label: "Ragnar", key: "ragnar" },
    { label: "Rivo", key: "rivo" },
    { label: "Sergey", key: "sergey" },
    { label: "Simon", key: "simon" },
    { label: "Tim", key: "tim" },
    { label: "Tonis", key: "tonis" },
    { label: "Tuule", key: "tuule" },
    { label: "Yuri", key: "Yuri" },
];

export const Default: Story = {
    args: {
        label: "Select an option",
        options,
    },
};

export const Empty: Story = {
    args: {
        label: "Select an option",
        options: [],
    },
};

export const Disabled: Story = {
    args: {
        label: "Select an option",
        options,
        disabled: true,
    },
};

export const WithClear: Story = {
    args: {
        label: "Select an option",
        options,
        onClear: () => true,
    },
};

export const WithClearDisabled: Story = {
    args: {
        label: "Select an option",
        options,
        onClear: () => true,
        disabled: true,
    },
};

export const WithError: Story = {
    args: {
        label: "Select an option",
        options,
        onClear: () => true,
        error: "You must not select wrong values, or else.",
    },
};

export const Multiple: Story = {
    args: {
        label: "Select an option",
        multiple: true,
        options,
    },
};

export const MultipleWithDisplayLimit: Story = {
    args: {
        label: "Select an option",
        multiple: true,
        options,
        selectedOptionsDisplayLimit: 2,
    },
};

export const MultipleWithClear: Story = {
    args: {
        label: "Select an option",
        multiple: true,
        options,
        onClear: () => true,
    },
};

export const MultipleWithDefaultValue: Story = {
    args: {
        label: "Select an option",
        multiple: true,
        options,
        defaultValue: [
            { label: "Jörgen", key: "jorgen" },
            { label: "Jürno", key: "jyrno" },
        ],
        onClear: () => true,
    },
};
