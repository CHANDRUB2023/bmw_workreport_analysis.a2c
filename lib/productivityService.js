export function calculateProductivityMetrics({
  teamMembers = 4,
  workingHours = 8,
  completedVenues = 18,
  targetRemainingVenues = 90,
  minProductivity2h = 2,
  maxProductivity2h = 5,
  cutoffHours = 5
}) {
  const members = Math.max(1, parseInt(teamMembers) || 4);
  const hours = Math.max(0.5, parseFloat(workingHours) || 8);
  const completed = Math.max(0, parseInt(completedVenues) || 18);
  const remaining = Math.max(0, parseInt(targetRemainingVenues) || 90);
  const cutoff = Math.max(0.5, parseFloat(cutoffHours) || 5);

  // Baseline Performance
  const teamHourlyRate = completed / hours;
  const individualHourlyRate = completed / (members * hours);

  // Productivity Rates (Hourly)
  const minRateHourly = (parseFloat(minProductivity2h) || 2) / 2;
  const maxRateHourly = (parseFloat(maxProductivity2h) || 5) / 2;
  const avgRateHourly = (minRateHourly + maxRateHourly) / 2;

  // Cut-off Predictions for Cutoff Hours
  const minPrediction = cutoff * minRateHourly;
  const maxPrediction = cutoff * maxRateHourly;
  const avgPrediction = cutoff * avgRateHourly;

  // Baseline Output Prediction for Custom Team & Cutoff
  const baselineTeamPrediction = members * cutoff * individualHourlyRate;

  // Required Team Size for Target Remaining Venues
  const exactRequiredMembers = remaining / (cutoff * individualHourlyRate);
  const requiredMembers = Math.ceil(exactRequiredMembers);

  // Expected Completion Time with Current Team
  const estimatedHoursCurrentTeam = remaining / (members * individualHourlyRate);

  // Forecast Series for Hours 1 to 12
  const forecastSeries = [];
  for (let h = 1; h <= 12; h++) {
    forecastSeries.push({
      hour: h,
      min: parseFloat((h * minRateHourly).toFixed(2)),
      avg: parseFloat((h * avgRateHourly).toFixed(2)),
      max: parseFloat((h * maxRateHourly).toFixed(2)),
      baseline: parseFloat((members * h * individualHourlyRate).toFixed(2))
    });
  }

  // Team Size Series (Members 1 to 10 for Selected Cutoff)
  const teamSizeSeries = [];
  for (let m = 1; m <= 10; m++) {
    const output = m * cutoff * individualHourlyRate;
    teamSizeSeries.push({
      members: m,
      output: parseFloat(output.toFixed(2))
    });
  }

  return {
    inputs: {
      teamMembers: members,
      workingHours: hours,
      completedVenues: completed,
      targetRemainingVenues: remaining,
      cutoffHours: cutoff,
      minProductivity2h,
      maxProductivity2h
    },
    baseline: {
      teamHourlyRate: parseFloat(teamHourlyRate.toFixed(4)),
      individualHourlyRate: parseFloat(individualHourlyRate.toFixed(4)),
      totalPersonHours: members * hours
    },
    rates: {
      minRateHourly: parseFloat(minRateHourly.toFixed(4)),
      maxRateHourly: parseFloat(maxRateHourly.toFixed(4)),
      avgRateHourly: parseFloat(avgRateHourly.toFixed(4))
    },
    cutoffAnalysis: {
      cutoffHours: cutoff,
      minPrediction: parseFloat(minPrediction.toFixed(2)),
      avgPrediction: parseFloat(avgPrediction.toFixed(2)),
      maxPrediction: parseFloat(maxPrediction.toFixed(2)),
      baselineTeamPrediction: parseFloat(baselineTeamPrediction.toFixed(2))
    },
    teamRequirement: {
      remainingVenues: remaining,
      availableHours: cutoff,
      exactRequiredMembers: parseFloat(exactRequiredMembers.toFixed(2)),
      requiredMembers,
      estimatedHoursCurrentTeam: parseFloat(estimatedHoursCurrentTeam.toFixed(2))
    },
    charts: {
      forecastSeries,
      teamSizeSeries
    }
  };
}

export const VERIFIED_METRO_SYSTEMS = [
  {
    city: "Delhi NCR",
    system: "Delhi Metro (DMRC)",
    totalStations: 256,
    lines: ["Yellow", "Blue", "Red", "Violet", "Pink", "Magenta", "Airport Express"],
    sampleStations: ["Rajiv Chowk", "Kashmere Gate", "Hauz Khas", "New Delhi", "Botanical Garden", "NOIDA City Centre", "HUDA City Centre", "AIIMS"]
  },
  {
    city: "Mumbai",
    system: "Mumbai Metro (MMRDA)",
    totalStations: 43,
    lines: ["Line 1 (Blue)", "Line 2A (Yellow)", "Line 7 (Red)", "Line 3 (Aqua)"],
    sampleStations: ["Ghatkopar", "Andheri", "Versova", "Marol Naka", "DN Nagar", "Bandra Kurla Complex", "Dahisar East"]
  },
  {
    city: "Kolkata",
    system: "Kolkata Metro",
    totalStations: 40,
    lines: ["Blue Line (North-South)", "Green Line (East-West)", "Purple Line"],
    sampleStations: ["Dum Dum", "Esplanade", "Park Street", "Howrah Maidan", "Salt Lake Sector V", "Sealdah", "Kavi Subhash"]
  },
  {
    city: "Bengaluru",
    system: "Namma Metro (BMRCL)",
    totalStations: 66,
    lines: ["Purple Line", "Green Line"],
    sampleStations: ["Majestic (Nadaprabhu Kempegowda)", "MG Road", "Indiranagar", "Whitefield", "Jayanagar", "Yeshwantpur", "KR Puram"]
  },
  {
    city: "Chennai",
    system: "Chennai Metro (CMRL)",
    totalStations: 41,
    lines: ["Blue Line", "Green Line"],
    sampleStations: ["Puratchi Thalaivar Dr. M.G.R. Central", "Chennai Airport", "Guindy", "Teynampet", "Koyambedu", "Thirumangalam", "Alandur"]
  },
  {
    city: "Hyderabad",
    system: "Hyderabad Metro (HMRL)",
    totalStations: 57,
    lines: ["Red Line", "Blue Line", "Green Line"],
    sampleStations: ["Ameerpet", "Miyapur", "LB Nagar", "Hitec City", "Raidurg", "Secunderabad East", "MGBS"]
  },
  {
    city: "Ahmedabad",
    system: "Ahmedabad Metro (GMRC)",
    totalStations: 32,
    lines: ["East-West Corridor", "North-South Corridor"],
    sampleStations: ["Kalupur Railway Station", "Gandhidham", "Apparel Park", "Motera Stadium", "Thaltej", "Paldi"]
  },
  {
    city: "Jaipur",
    system: "Jaipur Metro (JMRC)",
    totalStations: 11,
    lines: ["Pink Line"],
    sampleStations: ["Badi Chaupar", "Chandpole", "Railway Station", "Mansarovar", "Civil Lines"]
  },
  {
    city: "Kochi",
    system: "Kochi Metro (KMRL)",
    totalStations: 25,
    lines: ["Blue Line"],
    sampleStations: ["Aluva", "Edapally", "MG Road", "Ernakulam South", "Vytila", "Pettah", "Tripunithura"]
  },
  {
    city: "Lucknow",
    system: "Lucknow Metro (UPMRC)",
    totalStations: 21,
    lines: ["Red Line"],
    sampleStations: ["CCS Airport", "Charbagh Railway Station", "Hazratganj", "KD Singh Babu Stadium", "Munshipulia"]
  },
  {
    city: "Nagpur",
    system: "Maha Metro Nagpur",
    totalStations: 38,
    lines: ["Orange Line", "Aqua Line"],
    sampleStations: ["Sitabuldi", "Khapri", "Automotive Square", "Prajapati Nagar", "Airport"]
  },
  {
    city: "Pune",
    system: "Pune Metro (Maha Metro)",
    totalStations: 30,
    lines: ["Purple Line", "Aqua Line"],
    sampleStations: ["Shivajinagar", "District Court", "Pimpri Chinchwad", "Swargate", "Vanaz", "Ruby Hall Clinic"]
  },
  {
    city: "Kanpur",
    system: "Kanpur Metro (UPMRC)",
    totalStations: 9,
    lines: ["Orange Line"],
    sampleStations: ["IIT Kanpur", "Kalyanpur", "Rawatpur", "Moti Jheel"]
  },
  {
    city: "Agra",
    system: "Agra Metro (UPMRC)",
    totalStations: 6,
    lines: ["Yellow Line"],
    sampleStations: ["Taj East Gate", "Captain Shubham Gupta", "Fatehabad Road", "Agra Fort", "Mankameshwar Temple"]
  }
];
