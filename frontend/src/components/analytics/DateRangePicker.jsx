import { Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

function DateRangePicker({ dateRange, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <div className="flex items-center gap-2">
        <DatePicker
          selected={dateRange.from}
          onChange={date => onChange({ ...dateRange, from: date })}
          selectsStart
          startDate={dateRange.from}
          endDate={dateRange.to}
          maxDate={dateRange.to}
          className="border bg-transparent p-2 sm:w-44 w-28 cursor-pointer outline-none rounded-lg border-gray-600 text-sm text-gray-600 dark:text-gray-300 "
          dateFormat="MMM d, yyyy"
        />
        <span className="text-gray-500 dark:text-gray-400 cursor-default">to</span>
        <DatePicker
          selected={dateRange.to}
          onChange={date => onChange({ ...dateRange, to: date })}
          selectsEnd
          startDate={dateRange.from}
          endDate={dateRange.to}
          minDate={dateRange.from}
          maxDate={new Date()}
          className="border bg-transparent p-2 sm:w-44 w-28 cursor-pointer outline-none rounded-lg border-gray-600 text-sm text-gray-600 dark:text-gray-300 "
          dateFormat="MMM d, yyyy"
        />
      </div>
    </div>
  )
}

export default DateRangePicker 