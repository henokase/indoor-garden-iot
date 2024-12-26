import { formatDate, formatCurrency, formatNumber, getEfficiencyStatus } from './formatting';
import { calculateEfficiency, calculateMonthlyCost, calculatePotentialSavings } from './calculations';
import { OPTIMAL_THRESHOLDS } from './constants';

const addSectionHeader = (doc, text, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(34, 197, 94);
  doc.text(text, 20, y);
};

export const generateAnalyticsReport = (doc, stats, dateRange) => {
  // Title Page
  generateTitlePage(doc, dateRange);
  
  // Performance Analysis
  doc.addPage();
  generatePerformanceAnalysis(doc, stats);
  
  // Optimization Opportunities
  generateOptimizationOpportunities(doc);
  
  // Maintenance Schedule
  doc.addPage();
  generateMaintenanceSchedule(doc);
  
  // Cost Analysis
  generateCostAnalysis(doc, stats);
  
  // Executive Summary
  doc.addPage();
  generateExecutiveSummary(doc, stats);
};

const generateTitlePage = (doc, dateRange) => {
  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('Indoor Garden System', 105, 30, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setTextColor(34, 197, 94);
  doc.text('Resource Analytics Report', 105, 70, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(75, 85, 99);
  doc.text(`Report Period: ${formatDate(dateRange?.start)} to ${formatDate(dateRange?.end)}`, 105, 85, { align: 'center' });
  doc.text(`Generated on: ${formatDate(new Date())}`, 105, 95, { align: 'center' });
};

const generatePerformanceAnalysis = (doc, stats) => {
  addSectionHeader(doc, 'Current Performance Analysis', 20);
  
  const energyEfficiency = calculateEfficiency(stats.energy.daily, OPTIMAL_THRESHOLDS.energy.daily);
  const waterEfficiency = calculateEfficiency(stats.water.daily, OPTIMAL_THRESHOLDS.water.daily);
  
  const performanceData = [
    ['Metric', 'Current Usage', 'Optimal Target', 'Efficiency', 'Status'],
    [
      'Daily Energy',
      `${formatNumber(stats.energy.daily)} kWh`,
      `${OPTIMAL_THRESHOLDS.energy.daily} kWh`,
      `${energyEfficiency}%`,
      getEfficiencyStatus(energyEfficiency)
    ],
    [
      'Weekly Energy',
      `${formatNumber(stats.energy.weekly)} kWh`,
      `${OPTIMAL_THRESHOLDS.energy.weekly} kWh`,
      `${calculateEfficiency(stats.energy.weekly, OPTIMAL_THRESHOLDS.energy.weekly)}%`,
      getEfficiencyStatus(calculateEfficiency(stats.energy.weekly, OPTIMAL_THRESHOLDS.energy.weekly))
    ],
    [
      'Daily Water',
      `${formatNumber(stats.water.daily)} L`,
      `${OPTIMAL_THRESHOLDS.water.daily} L`,
      `${waterEfficiency}%`,
      getEfficiencyStatus(waterEfficiency)
    ],
    [
      'Weekly Water',
      `${formatNumber(stats.water.weekly)} L`,
      `${OPTIMAL_THRESHOLDS.water.weekly} L`,
      `${calculateEfficiency(stats.water.weekly, OPTIMAL_THRESHOLDS.water.weekly)}%`,
      getEfficiencyStatus(calculateEfficiency(stats.water.weekly, OPTIMAL_THRESHOLDS.water.weekly))
    ]
  ];
  
  doc.autoTable({
    startY: 35,
    head: [performanceData[0]],
    body: performanceData.slice(1),
    theme: 'grid',
    headStyles: { 
      fillColor: [34, 197, 94],
      font: 'helvetica',
      fontStyle: 'bold'
    },
    styles: { 
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { 
        cellCallback: function(cell) {
          const status = cell.raw;
          cell.styles.textColor = status === 'Optimal' ? '#22c55e' : 
                                status === 'Good' ? '#3b82f6' : '#ef4444';
        }
      }
    }
  });
};

const generateOptimizationOpportunities = (doc) => {
  addSectionHeader(doc, 'Optimization Opportunities', doc.autoTable.previous.finalY + 20);
  
  const opportunities = [
    { title: 'Energy Conservation', items: [
      'Adjust lighting schedules based on natural light availability',
      'Optimize temperature control during peak hours',
      'Implement smart power management for idle equipment',
      'Install motion sensors for automated lighting control',
      'Upgrade to energy-efficient LED grow lights'
    ]},
    { title: 'Water Management', items: [
      'Fine-tune irrigation based on moisture sensor readings',
      'Implement water recycling systems',
      'Optimize watering schedules based on plant needs',
      'Install drip irrigation system for targeted watering',
      'Implement rainwater harvesting system'
    ]}
  ];
  
  let yPos = doc.autoTable.previous.finalY + 35;
  opportunities.forEach(({ title, items }) => {
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);
    doc.text(title, 20, yPos);
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    items.forEach((item) => {
      yPos += 7;
      doc.text(`• ${item}`, 25, yPos);
    });
    yPos += 15;
  });
};

const generateMaintenanceSchedule = (doc) => {
  addSectionHeader(doc, 'Maintenance Schedule', 20);
  
  const maintenanceTasks = [
    ['Task', 'Frequency', 'Priority', 'Next Due'],
    ['Sensor Calibration', 'Monthly', 'High', formatDate(getNextDueDate(30))],
    ['Filter Cleaning', 'Bi-weekly', 'Medium', formatDate(getNextDueDate(14))],
    ['System Inspection', 'Weekly', 'High', formatDate(getNextDueDate(7))],
    ['Water Quality Check', 'Weekly', 'High', formatDate(getNextDueDate(7))],
    ['Equipment Cleaning', 'Monthly', 'Medium', formatDate(getNextDueDate(30))]
  ];
  
  doc.autoTable({
    startY: 35,
    head: [maintenanceTasks[0]],
    body: maintenanceTasks.slice(1),
    theme: 'grid',
    headStyles: { 
      fillColor: [34, 197, 94],
      font: 'helvetica',
      fontStyle: 'bold'
    },
    styles: { 
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });
};

const generateCostAnalysis = (doc, stats) => {
  addSectionHeader(doc, 'Cost Analysis & Savings Potential (in ETB)', doc.autoTable.previous.finalY + 20);
  
  const monthlyCost = calculateMonthlyCost(stats);
  const potentialSavings = calculatePotentialSavings(stats);
  
  // Simplified cost analysis table
  const costAnalysis = [
    ['Category', 'Current Cost (ETB)', 'Potential Savings (ETB)'],
    ['Energy', formatCurrency(monthlyCost.energy), formatCurrency(potentialSavings.energy)],
    ['Water', formatCurrency(monthlyCost.water), formatCurrency(potentialSavings.water)],
    ['Maintenance', formatCurrency(monthlyCost.maintenance), formatCurrency(potentialSavings.maintenance)],
    ['Total', formatCurrency(monthlyCost.total), formatCurrency(potentialSavings.total)]
  ];
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 35,
    head: [costAnalysis[0]],
    body: costAnalysis.slice(1),
    theme: 'grid',
    headStyles: { 
      fillColor: [34, 197, 94],
      font: 'helvetica',
      fontStyle: 'bold'
    },
    styles: { 
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });
};

const generateExecutiveSummary = (doc, stats) => {
  addSectionHeader(doc, 'Executive Summary', 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);

  const energyEfficiency = calculateEfficiency(stats.energy.daily, OPTIMAL_THRESHOLDS.energy.daily);
  const waterEfficiency = calculateEfficiency(stats.water.daily, OPTIMAL_THRESHOLDS.water.daily);
  const overallEfficiency = ((energyEfficiency + waterEfficiency) / 2).toFixed(1);
  
  const monthlyCost = calculateMonthlyCost(stats);
  const potentialSavings = calculatePotentialSavings(stats);
  
  const summary = [
    'System Performance Overview:',
    `• Overall System Efficiency: ${overallEfficiency}%`,
    `• Energy Utilization: ${energyEfficiency > 0 ? 'Optimized' : 'Requires Attention'} (${Math.abs(energyEfficiency)}% ${energyEfficiency > 0 ? 'below' : 'above'} target)`,
    `• Water Management: ${waterEfficiency > 0 ? 'Optimized' : 'Requires Attention'} (${Math.abs(waterEfficiency)}% ${waterEfficiency > 0 ? 'below' : 'above'} target)`,
    '',
    'Key Findings:',
    `• Resource Consumption: The system is currently operating at ${overallEfficiency}% efficiency`,
    `• Cost Impact: Total monthly operating cost of ${formatCurrency(monthlyCost.total).replace(/\s+/g, ' ')}`,
    `• Savings Potential: Identified ${formatCurrency(potentialSavings.total).replace(/\s+/g, ' ')} in monthly savings`,
    '',
    'Critical Action Items:',
    '• Implement suggested energy conservation measures for immediate impact',
    '• Optimize water management system to reduce waste',
    '• Follow maintenance schedule to ensure optimal performance',
    '',
    'Long-term Recommendations:',
    '• Consider upgrading to more energy-efficient equipment',
    '• Implement automated monitoring and control systems',
    '• Develop comprehensive maintenance and calibration protocols',
    '',
    'Next Steps:',
    '• Review and implement high-priority optimization opportunities',
    '• Schedule immediate maintenance tasks',
    '• Monitor system performance daily for the next month',
    '• Reassess efficiency metrics in 30 days'
  ];
  
  let summaryY = 40;
  summary.forEach(line => {
    if (line) {
      doc.setFont('helvetica', line.startsWith('•') ? 'normal' : 'bold');
      doc.text(line.replace(/\s+/g, ' '), 20, summaryY);
    }
    summaryY += line === '' ? 10 : 7;
  });
};

const getNextDueDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
