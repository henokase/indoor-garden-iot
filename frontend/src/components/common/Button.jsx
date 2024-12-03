export function Button({
  children,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {

  return (
    <button
      type={type}
      className={`
        bg-blue-500 
        hover:bg-blue-600 
        text-white
        px-4 py-2
        rounded-md
        disabled:opacity-50
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
