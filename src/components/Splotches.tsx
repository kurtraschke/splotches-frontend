import React from "react";
import Splotch from "./Splotch.tsx";
import type { SplotchData } from "../utils.ts";

import { useQuery } from "@tanstack/react-query";
import { tableFromIPC } from "@uwdata/flechette";
import { Duration } from "luxon";

interface SplotchesParams {
  direction: "N" | "S";
}

const Splotches: React.FunctionComponent<SplotchesParams> = ({ direction }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["splotches", direction],
    staleTime: Duration.fromISO("PT5S").as("millisecond"),
    refetchInterval: Duration.fromISO("PT5S").as("millisecond"),
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const endpoint = new URL("splotches", import.meta.env.VITE_API_BASE_URL)

      endpoint.searchParams.set("direction", direction)

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Backend request failed.");
      }
      const buf = await response.arrayBuffer();
      return tableFromIPC(buf, { useProxy: true });
    },
  });

  if (isPending) {
    return <span className="loading loading-spinner loading-xl"></span>;
  }

  if (error) {
    return "An error has occurred: " + error.message;
  }

  return (
    <RenderSplotches
      splotchesData={
        data
          .select([
            "gtfs_stop_id",
            "stop_name",
            "is_terminal",
            "train_id",
            "feed_header_timestamp",
            "vp_timestamp",
            "current_status",
          ])
          .toArray() as SplotchData[]
      }
    />
  );
};

interface RenderSplotchesParams {
  splotchesData: SplotchData[];
}

const RenderSplotches: React.FunctionComponent<RenderSplotchesParams> = ({
  splotchesData,
}) => {
  return (
    <div className={"m-2 grid gap-1 auto-fill-6"}>
      {splotchesData.map((splotchData) => {
        return <Splotch key={splotchData.gtfs_stop_id} data={splotchData} />;
      })}
    </div>
  );
};

export default Splotches;
