import { DateTime, Duration } from "luxon";
import { toHumanDurationWithTemporal } from "@kitsuyui/luxon-ext";

export interface SplotchData {
  gtfs_stop_id: string;
  station_id: string;
  stop_name: string;
  direction_label: string;
  is_terminal: number;
  feed_header_timestamp: number | undefined;
  trip_id: string | undefined;
  train_id: string | undefined;
  start_date: string | undefined;
  current_status: "INCOMING_AT" | "STOPPED_AT" | "IN_TRANSIT_TO" | undefined;
  vp_timestamp: number | undefined;
}

export function colorForStation(
  isTerminal: boolean,
  timeSinceEvent: Duration | undefined,
): string {
  if (isTerminal) {
    return "#0039A6";
  }

  if (!timeSinceEvent) {
    return "#7f7f7f"; //gray
  }

  const minutesSince = timeSinceEvent.as("minutes");

  if (minutesSince < 5) {
    return "#1a9850"; //bright green
  }

  if (minutesSince < 10) {
    return "#91cf60"; //dim green
  }

  if (minutesSince < 15) {
    return "#d9ef8b"; //bright yellow
  }

  if (minutesSince < 20) {
    return "#fee08b"; //dim yellow
  }

  if (minutesSince < 30) {
    return "#fc8d59"; //orange
  }

  if (minutesSince >= 30) {
    return "#d73027"; //red
  }

  return "#000000";
}

function formatStatus(currentStatus: SplotchData["current_status"]): string {
  switch (currentStatus) {
    case "INCOMING_AT":
      return "incoming";
    case "STOPPED_AT":
      return "stopped";
    case "IN_TRANSIT_TO":
      return "in transit";
  }
  return "unknown";
}

function formatTimestamp(timestamp: DateTime): string {
  return timestamp
    .setZone("US/Eastern")
    .toLocaleString(DateTime.TIME_24_WITH_SECONDS);
}

function formatDuration(duration: Duration): string {
  return toHumanDurationWithTemporal(duration, "past");
}

export function tooltipForStation(
  isTerminal: boolean,
  stopName: string,
  trainId: string | undefined,
  vehiclePositionTimestamp: DateTime | undefined,
  timeSinceEvent: Duration | undefined,
  currentStatus: SplotchData["current_status"],
): string {
  if (isTerminal) {
    return `${stopName} is a terminal in this direction`;
  }

  if (!timeSinceEvent || !vehiclePositionTimestamp || !trainId) {
    return `No train has served ${stopName} in this direction in the past hour`;
  }

  return `${stopName} last served by the ${trainId}, which was ${formatStatus(currentStatus)} at ${formatTimestamp(vehiclePositionTimestamp)}, ${formatDuration(timeSinceEvent)}`;
}
