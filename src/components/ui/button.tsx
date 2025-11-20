import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        custom: "", // For backward compatibility or specific custom styling
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  // Legacy props
  to?: string | null
  href?: string | null
  icon?: IconDefinition | string
  reverse?: boolean
  selected?: boolean
  primary?: boolean // Mapped to variant="default"
  active?: boolean
  confirmNeeded?: boolean
  inProgress?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    children,
    to,
    href,
    icon,
    reverse,
    selected,
    disabled,
    primary,
    active,
    confirmNeeded,
    inProgress,
    onClick,
    ...props 
  }, ref) => {
    const [confirming, setConfirming] = React.useState(false)
    const timeoutRef = React.useRef<number | undefined>()

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    let finalOnClick = onClick
    let finalChildren = children
    let finalIcon = icon

    if (confirmNeeded) {
      if (confirming) {
        finalIcon = faExclamationCircle
        finalChildren = "Click to Confirm"
        const onClickOriginal = onClick
        finalOnClick = (e) => {
          if (onClickOriginal) onClickOriginal(e as React.MouseEvent<HTMLButtonElement>)
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current)
            timeoutRef.current = undefined
            setConfirming(false)
          }
        }
      } else {
        finalOnClick = (e) => {
          e.preventDefault()
          setConfirming(true)
          timeoutRef.current = window.setTimeout(() => {
            timeoutRef.current = undefined
            setConfirming(false)
          }, 2000)
        }
      }
    }

    const computedVariant = variant || (primary ? "default" : "ghost")
    const computedClassName = cn(
      buttonVariants({ variant: computedVariant, size, className }),
      selected && "bg-accent text-accent-foreground",
      reverse && "flex-row-reverse",
      active && "bg-accent text-accent-foreground font-bold"
    )

    const content = (
      <>
        {inProgress ? (
          <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
        ) : finalIcon ? (
          typeof finalIcon === 'string' ? (
             <div
              className="mr-2 h-4 w-4 bg-cover bg-center rounded-sm"
              style={{ backgroundImage: `url(${finalIcon})` }}
            />
          ) : (
            <FontAwesomeIcon icon={finalIcon} className={cn("mr-2 h-4 w-4", reverse && "mr-0 ml-2")} />
          )
        ) : null}
        {finalChildren}
      </>
    )

    if (to && !disabled) {
      return (
        <Link to={to} className={computedClassName} {...(props as any)}>
          {content}
        </Link>
      )
    }

    if (href && !disabled) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={computedClassName} {...(props as any)}>
          {content}
        </a>
      )
    }

    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={computedClassName}
        ref={ref}
        disabled={disabled}
        onClick={finalOnClick}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
