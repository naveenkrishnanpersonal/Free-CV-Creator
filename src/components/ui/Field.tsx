import { cloneElement, forwardRef, isValidElement, useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

const controlClass =
  'w-full rounded-md border border-line bg-surface px-2.5 text-[13px] text-ink placeholder:text-faint transition-[border-color,box-shadow] hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlClass, 'h-9', className)} {...props} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(controlClass, 'min-h-[72px] resize-y py-2 leading-relaxed', className)}
        {...props}
      />
    )
  },
)

export function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
  action,
}: {
  label?: string
  hint?: ReactNode
  error?: string
  htmlFor?: string
  className?: string
  children: ReactNode
  action?: ReactNode
}) {
  const generatedId = useId()
  const child = isValidElement(children) ? (children as ReactElement<{ id?: string }>) : null
  const controlId = htmlFor ?? child?.props.id ?? generatedId
  const control =
    child && !child.props.id
      ? cloneElement(child, { id: controlId })
      : children

  return (
    <div className={cn('min-w-0', className)}>
      {(label || action) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && (
            <label
              htmlFor={controlId}
              className="text-[11.5px] font-medium tracking-[0.01em] text-muted"
            >
              {label}
            </label>
          )}
          {action}
        </div>
      )}
      {control}
      {error ? (
        <p className="mt-1 text-[11.5px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11.5px] leading-snug text-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export function LabeledInput({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
  error?: string
  className?: string
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
      <Input id={inputId} {...props} />
    </Field>
  )
}

export function LabeledTextarea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: ReactNode
  error?: string
  className?: string
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
      <Textarea id={inputId} {...props} />
    </Field>
  )
}
