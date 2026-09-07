"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button {...props} disabled={pending || props.disabled} className={className}>
      {pending ? "Saving..." : children}
    </button>
  );
}
