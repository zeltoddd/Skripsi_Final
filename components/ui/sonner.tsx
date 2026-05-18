"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-zinc-950 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:font-sans group-[.toaster]:text-sm group-[.toaster]:opacity-100",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!border !border-emerald-200 !bg-emerald-100/80 dark:!border-emerald-800/30 dark:!bg-emerald-950/40 !text-emerald-800 dark:!text-emerald-200 opacity-100",
        },
      }}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-800" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      {...props}
    />
  )
}

export { Toaster }
