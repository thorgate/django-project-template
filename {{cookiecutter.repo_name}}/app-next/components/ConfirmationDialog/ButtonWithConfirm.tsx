import * as React from "react";
import { Button } from "@components/Button";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
} from "@components/ConfirmationDialog/ConfirmationDialog";

export interface ButtonWithConfirmProps {
    children: React.ReactNode;
    dialogProps: Omit<
        ConfirmationDialogProps,
        "onCancel" | "onConfirm" | "open" | "children"
    >;
    buttonProps?: Omit<
        React.ComponentProps<typeof Button>,
        "onClick" | "children"
    >;
    dialogBody: React.ReactNode;
    action: () => void;
    className?: string;
}

export const ButtonWithConfirm = ({
    children,
    dialogProps,
    buttonProps = {},
    dialogBody,
    action,
    className = "px-6 w-44 h-10 mr-5 mb-3",
}: ButtonWithConfirmProps) => {
    const [open, setOpen] = React.useState(false);
    const onCancel = React.useCallback(() => setOpen(false), []);
    const onConfirm = React.useCallback(() => {
        setOpen(false);
        action();
    }, [action]);

    return (
        <>
            <Button
                className={className}
                type="button"
                onClick={() => setOpen(true)}
                {...buttonProps}
            >
                {children}
            </Button>
            <ConfirmationDialog
                open={open}
                onCancel={onCancel}
                onConfirm={onConfirm}
                {...dialogProps}
            >
                {dialogBody}
            </ConfirmationDialog>
        </>
    );
};
