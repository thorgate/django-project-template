import type { Meta, StoryObj } from "@storybook/react";
import { TextArea } from "./TextArea";

const meta = {
    title: "Input/TextArea",
    component: TextArea,
    tags: ["autodocs"],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Text Area",
    },
};

export const Uncontrolled: Story = {
    args: {
        label: "Text Area",
        defaultValue:
            "When in deadly danger\nWhen beset by doubt\nDo a big refactor\nWave your hands and shout.",
    },
};

export const WithError: Story = {
    args: {
        label: "Text Area",
        error: "+++Melon Melon Melon+++",
    },
};
