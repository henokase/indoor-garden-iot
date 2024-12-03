import { formatters } from './formatters.js'

export const exportUtils = {
  generateCSV(data, fields) {
    return formatters.csvData(data, fields)
  },

  generatePDF(data, config) {
    const content = []
    
    // Add title
    if (config.title) {
      content.push({
        text: config.title,
        style: 'header'
      })
    }

    // Add timestamp
    content.push({
      text: `Generated on ${formatters.timestamp(new Date())}`,
      style: 'subheader'
    })

    // Add table
    if (config.table) {
      content.push({
        table: {
          headerRows: 1,
          widths: config.table.widths || Array(config.table.headers.length).fill('*'),
          body: [
            config.table.headers,
            ...config.table.data
          ]
        }
      })
    }

    // Add charts if any
    if (config.charts) {
      config.charts.forEach(chart => {
        content.push({
          image: chart.base64,
          width: 500,
          alignment: 'center'
        })
      })
    }

    return {
      content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 12,
          margin: [0, 0, 0, 20],
          color: '#666666'
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    }
  },

  prepareChartForExport(chartData, options = {}) {
    return {
      data: chartData.map(item => ({
        timestamp: formatters.timestamp(item.timestamp),
        value: options.formatter ? 
          options.formatter(item.value) : 
          item.value.toString()
      })),
      fields: [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'value', label: options.valueLabel || 'Value' }
      ]
    }
  }
} 