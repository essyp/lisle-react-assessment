// Self-contained validation + summarisation

export type EventType =
  | "IGNITION_ON"
  | "IGNITION_OFF"
  | "SPEED"
  | "LOCATION"
  | "FUEL_LEVEL";

const EVENT_TYPES: readonly EventType[] = [
  "IGNITION_ON",
  "IGNITION_OFF",
  "SPEED",
  "LOCATION",
  "FUEL_LEVEL",
];

export interface Event {
  timestamp: string;
  vehicleId: string;
  type: EventType;
  value: number;
}

export interface ValidationError {
  index: number;
  message: string;
}

export interface Summary {
  totalEvents: number;
  countPerType: Record<EventType, number>;
  earliestTimestamp: string;
  latestTimestamp: string;
  uniqueVehicleCount: number;
}

export function validateAndSummarise(
  input: unknown
): { errors: ValidationError[]; summary?: Summary } {
  if (!Array.isArray(input)) {
    return { errors: [{ index: -1, message: "Input must be a JSON array" }] };
  }

  const errors: ValidationError[] = [];
  const events: Event[] = [];

  input.forEach((item, index) => {
    if (typeof item !== "object" || item === null) {
      errors.push({ index, message: "Event must be an object" });
      return;
    }

    const { timestamp, vehicleId, type, value } = item as Record<string, unknown>;

    if (typeof timestamp !== "string" || isNaN(Date.parse(timestamp))) {
      errors.push({ index, message: "Invalid ISO-8601 timestamp" });
    }

    if (typeof vehicleId !== "string" || vehicleId.length < 5 || vehicleId.length > 40) {
      errors.push({ index, message: "vehicleId must be 5–40 chars" });
    }

    if (!EVENT_TYPES.includes(type as EventType)) {
      errors.push({ index, message: `type must be one of: ${EVENT_TYPES.join(", ")}` });
    }

    if (typeof value !== "number") {
      errors.push({ index, message: "value must be a number" });
    }

    if (
      typeof timestamp === "string" &&
      typeof vehicleId === "string" &&
      typeof value === "number" &&
      EVENT_TYPES.includes(type as EventType)
    ) {
      events.push({ timestamp, vehicleId, type: type as EventType, value });
    }
  });

  if (errors.length > 0) return { errors };

  const timestamps = events.map(e => new Date(e.timestamp).getTime());

  const countPerType: Record<EventType, number> = EVENT_TYPES.reduce((acc, t) => {
    acc[t] = 0;
    return acc;
  }, {} as Record<EventType, number>);

  events.forEach(e => countPerType[e.type]++);

  return {
    errors: [],
    summary: {
      totalEvents: events.length,
      countPerType,
      earliestTimestamp: new Date(Math.min(...timestamps)).toISOString(),
      latestTimestamp: new Date(Math.max(...timestamps)).toISOString(),
      uniqueVehicleCount: new Set(events.map(e => e.vehicleId)).size,
    },
  };
}
