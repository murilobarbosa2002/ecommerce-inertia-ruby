export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  // "danger": ação destrutiva/irreversível (ex. resetar 2FA de outro
  // admin) — mesma cor usada no Button pra esse tipo de ação em outros
  // lugares do painel.
  confirmIntent?: "primary" | "danger";
}
