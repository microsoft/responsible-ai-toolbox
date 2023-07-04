// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const dataBalanceExperienceFlight = "dataBalanceExperience";
export const featureFlightSeparator = "&";

// add more entries for new feature flights
export const featureFlights = [dataBalanceExperienceFlight];

export function parseFeatureFlights(featureFlights?: string): string[] {
  if (featureFlights) {
    return featureFlights.split(featureFlightSeparator);
  }
  return [];
}

export function isFlightActive(
  flight: string,
  activeFeatureFlights?: string[]
): boolean {
  if (activeFeatureFlights) {
    return activeFeatureFlights.includes(flight);
  }
  return false;
}
