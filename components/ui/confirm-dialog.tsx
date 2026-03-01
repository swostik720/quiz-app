"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/45 p-4">
      <Card className="w-full max-w-md space-y-4 p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
