import 'bulma/css/bulma.css'
import './style.css'

import $ from 'jquery'
import {DateTime, Duration} from "luxon";
import {toHumanDurationWithTemporal} from '@kitsuyui/luxon-ext'
import {PostgrestClient} from "@supabase/postgrest-js";


function colorForStation({is_terminal: isTerminal, time_since_event: timeSinceEvent}) {
    if (isTerminal) {
        return "#0039A6";
    }

    if (!timeSinceEvent) {
        return "#7f7f7f" //gray
    }

    const minutesSince = timeSinceEvent / 60;

    if (minutesSince < 5) {
        return "#1a9850" //bright green
    }

    if (minutesSince < 10) {
        return "#91cf60" //dim green
    }

    if (minutesSince < 15) {
        return "#d9ef8b" //bright yellow
    }

    if (minutesSince < 20) {
        return "#fee08b" //dim yellow
    }

    if (minutesSince < 30) {
        return "#fc8d59" //orange
    }

    if (minutesSince >= 30) {
        return "#d73027" //red
    }

    return "#000000"
}

function formatStatus(status) {
    switch (status) {
        case "INCOMING_AT":
            return "incoming"
        case "STOPPED_AT":
            return "stopped"
        case "IN_TRANSIT_TO":
            return "in transit"
    }
}

function formatTimestamp(ts) {
    return DateTime.fromISO(ts)
        .setZone("US/Eastern")
        .toLocaleString(DateTime.TIME_24_WITH_SECONDS)
}

function formatDuration(ago) {
    return toHumanDurationWithTemporal(Duration.fromMillis(ago * 1000), 'past')
}

function tooltipForStation({
                               name,
                               is_terminal: isTerminal,
                               time_since_event: timeSinceEvent,
                               train_id: trainId,
                               current_status: currentStatus,
                               vehicle_timestamp: vehicleTimestamp
                           }) {
    if (isTerminal) {
        return `${name} is a terminal in this direction`
    }

    if (!timeSinceEvent) {
        return `No train has served ${name} in this direction in the past hour`
    }

    return `${name} last served by the ${trainId}, which was ${formatStatus(currentStatus)} at ${formatTimestamp(vehicleTimestamp)}, ${formatDuration(timeSinceEvent)}`
}

const REST_URL = import.meta.env.VITE_API_BASE_URL;
const postgrest = new PostgrestClient(REST_URL)

$(".splotches[data-direction]")
    .each(async (index, element) => {
        $(element)
            .removeClass("splotches")
            .append('<progress class="progress is-large is-info" max="100">60%</progress>');

        const response = await postgrest
                .from('v_splotches_of_color')
                .select('name,is_terminal,time_since_event,train_id,current_status,vehicle_timestamp')
                .eq('direction', $(element).data('direction'))
                .order('station_mrn')
                .order('gtfs_stop_id')

        $(element)
            .empty()
            .addClass("splotches")

        response.data.forEach(
            station => {
                const color = colorForStation(station)

                $(element).append(
                    $("<div>")
                        .addClass("splotch")
                        .css("background-color", color)
                        .attr("title", tooltipForStation(station))
                )
            }
        )
    });
