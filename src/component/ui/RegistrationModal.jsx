import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Buttonv2 from "./Buttonv2";

export default function RegistrationModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Registration required",
  description = "You are not registered for this contest. Would you like to register now?",
  cancelText = "Cancel",
  confirmText = "Register",
  compact = false,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" />
        <Dialog.Content
          className={`fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-zinc-900 text-white rounded-2xl p-4 z-[210] border border-white/10`}
        >
          <Dialog.Title className="text-sm font-semibold mb-2">
            {title}
          </Dialog.Title>
          <div className="text-sm text-slate-200 mb-4">{description}</div>
          <div className="flex justify-end gap-3">
            <div className="w-28">
              <Buttonv2
                text={cancelText}
                ApiCall={async () => onOpenChange(false)}
                funct={() => {}}
              />
            </div>
            <div className="w-28">
              <Buttonv2
                text={confirmText}
                ApiCall={async () => await onConfirm()}
                funct={() => {}}
                variant="green"
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
