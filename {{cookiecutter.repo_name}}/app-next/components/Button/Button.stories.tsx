import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
    title: "Input/Button",
    component: Button,
    tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: "Click me!",
    },
};

export const Primary: Story = {
    args: {
        children: "Click me!",
        variant: "primary",
    },
};

export const Secondary: Story = {
    args: {
        children: "Click me next!",
        variant: "secondary",
    },
};

export const Danger: Story = {
    args: {
        children: "Click me, be dangerous!",
        variant: "danger",
    },
};

export const Safe: Story = {
    args: {
        children: "Click me, it's safe!",
        variant: "safe",
    },
};

export const PrimaryDisabled: Story = {
    args: {
        children: "Can't click me!",
        variant: "primary",
        disabled: true,
    },
};

export const SecondaryDisabled: Story = {
    args: {
        children: "Can't click me too!",
        variant: "secondary",
        disabled: true,
    },
};

export const DangerDisabled: Story = {
    args: {
        children: "It is too dangerous to click me!",
        variant: "danger",
        disabled: true,
    },
};

export const SafeDisabled: Story = {
    args: {
        children: "It is too safe to click me!",
        variant: "safe",
        disabled: true,
    },
};
