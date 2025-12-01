/**
 * Popover primitives
 *
 * Radix UI Popover components for dropdown menus and floating panels.
 */
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/shared/lib/utils"
import "./popover.css"

const PopoverControlContext = React.createContext(false)

const Popover = ({
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) => (
  <PopoverControlContext.Provider value={open !== undefined}>
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} {...props}>
      {children}
    </PopoverPrimitive.Root>
  </PopoverControlContext.Provider>
)

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, onPointerDownOutside, onFocusOutside, ...props }, ref) => {
  const isControlled = React.useContext(PopoverControlContext)

  const preventOutsideInteraction = <T extends Event>(handler?: (event: T) => void) => (event: T) => {
    if (isControlled) {
      event.preventDefault()
    }
    handler?.(event)
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        onPointerDownOutside={preventOutsideInteraction(onPointerDownOutside)}
        onFocusOutside={preventOutsideInteraction(onFocusOutside)}
        className={cn(
          "popover-content",
          "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
