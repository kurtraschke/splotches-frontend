import React from "react";
import {
  colorForStation,
  type SplotchData,
  tooltipForStation,
} from "../utils.ts";
import { DateTime } from "luxon";

interface SplotchParams {
  data: SplotchData;
}

const Splotch: React.FunctionComponent<SplotchParams> = ({ data }) => {
  const {
    is_terminal: isTerminal,
    stop_name: stopName,
    train_id: trainId,
    feed_header_timestamp: feedHeaderEpochSeconds,
    vp_timestamp: vehiclePositionEpochSeconds,
    current_status: currentStatus,
  } = data;

  const feedHeaderTimestamp = feedHeaderEpochSeconds
    ? DateTime.fromSeconds(feedHeaderEpochSeconds)
    : undefined;

  const vehiclePositionTimestamp = vehiclePositionEpochSeconds
    ? DateTime.fromSeconds(vehiclePositionEpochSeconds)
    : undefined;

  const timeSinceEvent = feedHeaderTimestamp
    ? DateTime.now().diff(feedHeaderTimestamp)
    : undefined;

  return (
    <div
      className={"w-6 h-6"}
      title={tooltipForStation(
        isTerminal == 1,
        stopName,
        trainId,
        vehiclePositionTimestamp,
        timeSinceEvent,
        currentStatus,
      )}
      style={{
        backgroundColor: colorForStation(isTerminal == 1, timeSinceEvent),
      }}
    />
  );
};

export default Splotch;
