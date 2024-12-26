// Resource consumption thresholds
export const OPTIMAL_THRESHOLDS = {
  energy: {
    daily: 8.5,    // kWh - Based on efficient LED grow lights and optimized systems
    weekly: 59.5   // kWh - Daily * 7
  },
  water: {
    daily: 22,     // L - Based on efficient drip irrigation systems
    weekly: 154    // L - Daily * 7
  }
};

// Utility rates for Ethiopia
export const UTILITY_RATES = {
  energy: {
    rate: 2.50,      // 2.50 ETB per kWh - Average commercial rate in Ethiopia
    peakRate: 3.20,  // Peak hour rate
    offPeakRate: 1.80 // Off-peak rate
  },
  water: {
    rate: 0.15,     // 0.15 ETB per L - Average commercial water rate in Ethiopia
    sewageRate: 0.05 // Additional sewage cost
  }
};

// Implementation costs in ETB
export const IMPLEMENTATION_COSTS = {
  energyEfficiency: 85000,  // ~85,000 ETB for energy efficiency upgrades
  waterEfficiency: 62000,   // ~62,000 ETB for water efficiency upgrades
  automation: 41000         // ~41,000 ETB for automation improvements
};

// Default resource statistics
export const DEFAULT_RESOURCE_STATS = {
  energy: {
    daily: 10.2,
    weekly: 71.4,
    breakdown: {
      lighting: 6.2,      // 60% - LED grow lights
      climate: 2.1,       // 20% - Fans, temperature control
      irrigation: 1.0,    // 10% - Pumps and distribution
      automation: 0.5,    // 5%  - Controllers and sensors
      other: 0.4         // 5%  - Miscellaneous
    },
    peakUsage: {
      morning: 1.8,      // 6am-10am
      midday: 3.5,       // 10am-4pm
      evening: 3.2,      // 4pm-8pm
      night: 1.7        // 8pm-6am
    }
  },
  water: {
    daily: 25,
    weekly: 175,
    breakdown: {
      irrigation: 17.5,   // 70% - Direct plant watering
      misting: 3.75,     // 15% - Humidity control
      cleaning: 2.5,     // 10% - System maintenance
      reserve: 1.25      // 5%  - Emergency reserve
    },
    efficiency: {
      delivered: 22,     // Actually used by plants
      runoff: 2,        // Lost to drainage
      evaporation: 1    // Lost to evaporation
    }
  },
  environmental: {
    co2Offset: 15.2,    // kg CO2 offset by plants monthly
    o2Production: 22.5,  // kg O2 produced monthly
    wasteReduction: 8.5  // kg organic waste recycled monthly
  }
};
