"use client"

import { useState, type MouseEvent, type ReactNode } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Menu, X } from "lucide-react"
import { cn } from "../lib/utils.js"

export interface DocsMobileNavProps {
  /** Drawer contents, usually the same `Docs.Nav` as in `Docs.Sidebar`. */
  children?: ReactNode
  /** Accessible name of the drawer and its trigger. */
  title?: string
  /** Trigger button contents. Defaults to a menu icon. */
  trigger?: ReactNode
  /** Controlled open state. Leave both unset to let the drawer manage it. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Classes for the trigger button. */
  triggerClassName?: string
  /** Classes for the drawer panel. */
  className?: string
}

/**
 * Menu button and left-side drawer for the sidebar nav below `lg`, where
 * `Docs.Sidebar` is hidden. Render it where the button should go, usually in
 * the site header. The button hides itself from `lg`.
 *
 * The drawer closes when a link inside it is clicked, so children can come
 * straight from a Server Component without an `onNavigate` callback.
 *
 * ```tsx
 * <header>
 *   <Docs.MobileNav>
 *     <Docs.Nav items={nav} baseHref="/docs" activeHref={pathname} />
 *   </Docs.MobileNav>
 * </header>
 * ```
 */
export function DocsMobileNav({
  children,
  title = "Navigation",
  trigger,
  open: openProp,
  onOpenChange,
  triggerClassName,
  className,
}: DocsMobileNavProps) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState

  function setOpen(value: boolean) {
    if (openProp === undefined) setOpenState(value)
    onOpenChange?.(value)
  }

  function closeOnLink(event: MouseEvent<HTMLDivElement>) {
    const link = (event.target as Element).closest("a[href]")
    if (link !== null && !event.defaultPrevented) setOpen(false)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        data-slot="docs-mobile-nav-trigger"
        aria-label={trigger === undefined ? title : undefined}
        className={cn(
          "text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md transition-colors lg:hidden",
          triggerClassName
        )}
      >
        {trigger ?? <Menu className="size-4.5" />}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 lg:hidden" />
        <DialogPrimitive.Content
          data-slot="docs-mobile-nav"
          aria-describedby={undefined}
          onClick={closeOnLink}
          className={cn(
            "bg-background fixed inset-y-0 left-0 z-50 w-[min(19rem,85vw)] overflow-y-auto border-r px-4 pt-14 pb-8 shadow-lg outline-none lg:hidden",
            className
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-md transition-colors"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
