import { OPTIMAL_THRESHOLDS, UTILITY_RATES, IMPLEMENTATION_COSTS } from './constants';

export const calculateEfficiency = (actual, target) => {
  if (!actual || !target || isNaN(actual) || isNaN(target)) return 0;
  
  // Calculate base efficiency
  const baseEfficiency = (((target - actual) / target) * 100).toFixed(1);
  
  // Apply weighted adjustments based on time of day and season
  const hour = new Date().getHours();
  const month = new Date().getMonth();
  
  // Peak usage hours penalty/bonus
  const peakAdjustment = (hour >= 9 && hour <= 17) ? -2 : 2;
  
  // Seasonal adjustment
  const seasonAdjustment = (month >= 5 && month <= 8) ? -1.5 : 1.5;
  
  return (parseFloat(baseEfficiency) + peakAdjustment + seasonAdjustment).toFixed(1);
};

export const calculateMonthlyCost = (stats) => {
  if (!stats) return { energy: 0, water: 0, total: 0, breakdown: {} };
  
  // Energy cost calculation with Ethiopian peak/off-peak rates
  const peakEnergyUsage = (stats.energy?.daily || 0) * 0.6; // 60% during peak hours
  const offPeakEnergyUsage = (stats.energy?.daily || 0) * 0.4; // 40% during off-peak
  
  const energyCost = (
    (peakEnergyUsage * UTILITY_RATES.energy.peakRate) +
    (offPeakEnergyUsage * UTILITY_RATES.energy.offPeakRate)
  ) * 30;
  
  // Water cost calculation including Ethiopian sewage rates
  const waterCost = (stats.water?.daily || 0) * 
    (UTILITY_RATES.water.rate + UTILITY_RATES.water.sewageRate) * 30;
  
  // Maintenance cost estimation (adjusted for Ethiopian market)
  const maintenanceCost = (energyCost + waterCost) * 0.12; // 12% of utility costs
  
  return {
    energy: energyCost,
    water: waterCost,
    maintenance: maintenanceCost,
    total: energyCost + waterCost + maintenanceCost,
    breakdown: {
      peakEnergy: (peakEnergyUsage * UTILITY_RATES.energy.peakRate) * 30,
      offPeakEnergy: (offPeakEnergyUsage * UTILITY_RATES.energy.offPeakRate) * 30,
      waterSupply: (stats.water?.daily || 0) * UTILITY_RATES.water.rate * 30,
      sewage: (stats.water?.daily || 0) * UTILITY_RATES.water.sewageRate * 30
    }
  };
};

export const calculatePotentialSavings = (stats) => {
  if (!stats) return { energy: 0, water: 0, maintenance: 0, total: 0, roi: 0 };
  
  const currentCosts = calculateMonthlyCost(stats);
  const optimalCosts = calculateMonthlyCost({
    energy: { daily: OPTIMAL_THRESHOLDS.energy.daily },
    water: { daily: OPTIMAL_THRESHOLDS.water.daily }
  });
  
  const energySavings = Math.max(0, currentCosts.energy - optimalCosts.energy);
  const waterSavings = Math.max(0, currentCosts.water - optimalCosts.water);
  
  // Calculate maintenance savings (20% of current maintenance costs after optimization)
  const maintenanceSavings = currentCosts.maintenance * 0.20;
  
  const totalSavings = energySavings + waterSavings + maintenanceSavings;
  
  const totalImplementationCost = Object.values(IMPLEMENTATION_COSTS).reduce((a, b) => a + b, 0);
  const roiMonths = totalSavings > 0 ? Math.ceil(totalImplementationCost / totalSavings) : 0;
  
  return {
    energy: energySavings,
    water: waterSavings,
    maintenance: maintenanceSavings,
    total: totalSavings,
    roi: roiMonths,
    breakdown: {
      monthly: totalSavings,
      yearly: totalSavings * 12,
      fiveYear: totalSavings * 60
    }
  };
};
