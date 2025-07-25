import { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalPortalProps = { children: ReactNode };

export default function ModalPortal({ children }: ModalPortalProps) {
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;
  return createPortal(children, modalRoot);
}