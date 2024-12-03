import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export async function exportToCSV(data, dateRange) {
  const csvContent = convertToCSV(data)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `analytics_${formatDateForFilename(dateRange.from)}_${formatDateForFilename(dateRange.to)}.csv`)
}

export async function exportToPDF(data, dateRange) {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(16)
  doc.text('Analytics Report', 14, 15)
  
  // Add date range
  doc.setFontSize(12)
  doc.text(`Period: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`, 14, 25)
  
  // Add tables
  doc.autoTable({
    head: [['Timestamp', 'Temperature (°C)', 'Moisture (%)']],
    body: data.map(row => [
      formatDate(new Date(row.timestamp)),
      row.temperature.toFixed(1),
      row.moisture.toFixed(1)
    ]),
    startY: 35
  })
  
  doc.save(`analytics_${formatDateForFilename(dateRange.from)}_${formatDateForFilename(dateRange.to)}.pdf`)
}

function convertToCSV(data) {
  const headers = ['Timestamp', 'Temperature (°C)', 'Moisture (%)']
  const rows = data.map(row => [
    new Date(row.timestamp).toISOString(),
    row.temperature.toFixed(1),
    row.moisture.toFixed(1)
  ])
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function formatDateForFilename(date) {
  return new Date(date).toISOString().split('T')[0]
} 