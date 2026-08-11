import { COMPLETED_TN_DISTRICTS } from './formatUtils';

export function calculateExecutiveKpis(allStatesCount = 37, totalDistrictsCount = 750, totalPincodesCount = 19586, currentTeamMembers = 4) {
  const tnTotal = 38;
  const tnCompleted = COMPLETED_TN_DISTRICTS.length;
  const tnPending = tnTotal - tnCompleted;
  const tnPercentage = ((tnCompleted / tnTotal) * 100).toFixed(1);

  return {
    totalStates: allStatesCount,
    totalDistricts: totalDistrictsCount,
    tnCompleted,
    tnPending,
    tnTotal,
    tnPercentage: parseFloat(tnPercentage),
    totalPincodes: totalPincodesCount,
    teamMembers: currentTeamMembers
  };
}

export function calculateWhatIfScenarios({
  individualHourlyRate = 0.5625,
  targetRemainingVenues = 90
}) {
  const baseScenarios = [
    { name: 'Current Baseline', members: 4, hours: 8 },
    { name: 'Scenario A (Reduced Shift)', members: 4, hours: 5 },
    { name: 'Scenario B (Expanded Team 5h)', members: 6, hours: 5 },
    { name: 'Scenario C (Expanded Team 8h)', members: 6, hours: 8 },
    { name: 'Scenario D (Max Operations)', members: 8, hours: 8 }
  ];

  return baseScenarios.map(s => {
    const dailyCapacity = s.members * s.hours * individualHourlyRate;
    const estimatedDays = targetRemainingVenues > 0
      ? parseFloat((targetRemainingVenues / Math.max(dailyCapacity, 0.1)).toFixed(1))
      : 0;

    return {
      ...s,
      expectedOutput: parseFloat(dailyCapacity.toFixed(2)),
      completionDays: estimatedDays
    };
  });
}

export function calculateBurndownSeries({
  targetRemainingVenues = 90,
  teamMembers = 4,
  workingHours = 8,
  individualHourlyRate = 0.5625
}) {
  const dailyOutput = teamMembers * workingHours * individualHourlyRate;
  const totalDays = Math.ceil(targetRemainingVenues / Math.max(dailyOutput, 0.1));
  const series = [];

  let remaining = targetRemainingVenues;
  for (let day = 0; day <= Math.min(totalDays, 14); day++) {
    series.push({
      day: `Day ${day}`,
      remaining: Math.max(0, parseFloat(remaining.toFixed(1))),
      target: 0
    });
    remaining -= dailyOutput;
  }

  return {
    dailyOutput: parseFloat(dailyOutput.toFixed(2)),
    totalDays,
    series
  };
}

export function generateOperationalInsights({
  teamMembers = 4,
  workingHours = 8,
  completedVenues = 18,
  cutoffHours = 5,
  targetRemainingVenues = 90,
  minRateHourly = 1.0,
  maxRateHourly = 2.5
}) {
  const teamHourlyRate = (completedVenues / workingHours).toFixed(2);
  const individualHourlyRate = (completedVenues / (teamMembers * workingHours)).toFixed(4);
  const cutoffMin = (cutoffHours * minRateHourly).toFixed(1);
  const cutoffMax = (cutoffHours * maxRateHourly).toFixed(1);

  const currentDailyCapacity = teamMembers * workingHours * parseFloat(individualHourlyRate);
  const expandedDailyCapacity = 6 * workingHours * parseFloat(individualHourlyRate);
  const capacityIncreasePct = (((expandedDailyCapacity - currentDailyCapacity) / currentDailyCapacity) * 100).toFixed(1);

  const estimatedDays = currentDailyCapacity > 0
    ? (targetRemainingVenues / currentDailyCapacity).toFixed(1)
    : 0;
  const totalPersonHours = (parseFloat(estimatedDays) * teamMembers * workingHours).toFixed(0);

  return [
    `Current observed team productivity is ${teamHourlyRate} venues/hour (${individualHourlyRate} venues per person-hour).`,
    `At the selected cut-off of ${cutoffHours} hours, the theoretical output range is ${cutoffMin} – ${cutoffMax} venues.`,
    `Increasing the team size from ${teamMembers} to 6 members increases projected daily capacity by ${capacityIncreasePct}% (from ${currentDailyCapacity.toFixed(1)} to ${expandedDailyCapacity.toFixed(1)} venues).`,
    `At the current productivity rate, remaining work of ${targetRemainingVenues} venues is estimated to require ${estimatedDays} working days (${totalPersonHours} person-hours).`
  ];
}
