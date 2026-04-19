import * as React from "react"
import { ContextMenu } from "radix-ui"

import { cn } from "@/lib/utils"

const ContextMenuRoot = ContextMenu.Root
const ContextMenuTrigger = ContextMenu.Trigger
const ContextMenuPortal = ContextMenu.Portal
const ContextMenuGroup = ContextMenu.Group

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenu.Content>) {
  return (
    <ContextMenuPortal>
      <ContextMenu.Content
        className={cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </ContextMenuPortal>
  )
}

function ContextMenuItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenu.Item> & { inset?: boolean }) {
  return (
    <ContextMenu.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "transition-colors focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenu.Separator>) {
  return (
    <ContextMenu.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenu.Label> & { inset?: boolean }) {
  return (
    <ContextMenu.Label
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuGroup,
}
