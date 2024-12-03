import { motion } from 'framer-motion'

function FormField({
  label,
  name,
  type = 'text',
  icon: Icon,
  options,
  isLoading,
  ...props
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  if (type === 'checkbox') {
    return (
      <label className="flex items-center space-x-3 cursor-pointer">
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
        <motion.input
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          type="checkbox"
          name={name}
          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 disabled:opacity-50 w-4 h-4"
          {...props}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </label>
    )
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {type === 'select' ? (
          <select
            id={name}
            name={name}
            className={`
              block w-full rounded-md border-gray-300 dark:border-gray-600
              bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 p-2
              ${Icon ? 'pl-10' : ''}
            `}
            {...props}
          >
            {options?.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        ) : (
          <motion.input
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            type={type}
            id={name}
            name={name}
            className={`
              block w-full rounded-md border-gray-300 dark:border-gray-600
              bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 p-2
              ${Icon ? 'pl-10' : ''}
            `}
            {...props}
          />
        )}
      </div>
    </div>
  )
}

export default FormField 