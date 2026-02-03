import { type PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <main className={cn("px-5 pb-24 pt-3", className)}>{children}</main>;
}
