export function Progress({ value = 0, className, ...props }) {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-800 ${className}`} {...props}>
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
}
