import { Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

export function DateRangePicker({ dateRange, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 dark:bg-gray-800 p-2 rounded-lg shadow-sm">
      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <div className="flex items-center gap-2">
        <DatePicker
          selected={dateRange.start}
          onChange={date => onChange({ ...dateRange, start: date })}
          selectsStart
          startDate={dateRange.start}
          endDate={dateRange.end}
          maxDate={dateRange.end}
          className="border bg-transparent p-2 sm:w-44 w-28 cursor-pointer outline-none rounded-lg border-gray-600 text-sm text-gray-600 dark:text-gray-300"
          dateFormat="MMM d, yyyy"
        />
        <span className="text-gray-500 dark:text-gray-400 cursor-default">to</span>
        <DatePicker
          selected={dateRange.end}
          onChange={date => onChange({ ...dateRange, end: date })}
          selectsEnd
          startDate={dateRange.start}
          endDate={dateRange.end}
          minDate={dateRange.start}
          maxDate={new Date()}
          className="border bg-transparent p-2 sm:w-44 w-28 cursor-pointer outline-none rounded-lg border-gray-600 text-sm text-gray-600 dark:text-gray-300"
          dateFormat="MMM d, yyyy"
        />
      </div>
    </div>
  )
} 