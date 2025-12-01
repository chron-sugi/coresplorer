/**
 * Toggle Group primitives
 *
 * Radix UI Toggle Group components for chip-style multi-select.
 * Uses semantic tokens for accessible, themeable colors.
 */
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: cn(
          "border border-border bg-muted text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-primary data-[state=on]:border-primary data-[state=on]:text-primary-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ),
        outline: cn(
          "border border-border bg-transparent text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "data-[state=on]:bg-accent data-[state=on]:border-primary data-[state=on]:text-primary"
        ),
      },
      size: {
        default: "h-8 px-3 min-h-[32px]",
        sm: "h-7 px-2 text-xs min-h-[28px]",
        lg: "h-10 px-4 min-h-[40px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleGroupItemVariants>
>({
  variant: "default",
  size: "default",
})

const ToggleGroup = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  const [isPressed, setIsPressed] = React.useState(false)
  const itemRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (itemRef.current) {
      const state = itemRef.current.getAttribute('data-state')
      setIsPressed(state === 'on')
      // Set up a mutation observer to track state changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-state') {
            const newState = itemRef.current?.getAttribute('data-state')
            setIsPressed(newState === 'on')
          }
        })
      })
      observer.observe(itemRef.current, { attributes: true })
      return () => observer.disconnect()
    }
  }, [])

  const combinedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      // @ts-ignore - ref types
      itemRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )

  return (
    <ToggleGroupPrimitive.Item
      ref={combinedRef}
      value={value}
      role="button"
      aria-pressed={isPressed}
      className={cn(
        toggleGroupItemVariants({
          variant: variant ?? context.variant,
          size: size ?? context.size,
        }),
        className
      )}
      {...props}
    />
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem, toggleGroupItemVariants }
