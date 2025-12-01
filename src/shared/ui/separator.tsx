/**
 * UI Separator
 *
 * Small primitive for horizontal/vertical separators used in layouts.
 */
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { clsx } from "clsx"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      aria-hidden={decorative ? "true" : undefined}
      aria-orientation={!decorative ? orientation : undefined}
      className={clsx(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
