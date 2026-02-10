import { describe, it, expect } from "vitest";
import { validateAndSummarise, EventType } from "./validateAnalyze";

describe("validateAndSummarise", () => {
  it("returns an error for non-array input", () => {
    const result = validateAndSummarise({ foo: "bar" });
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns an error for invalid event fields", () => {
    const input = [
      {
        timestamp: "not-a-date",
        vehicleId: "123",
        type: "INVALID_TYPE",
        value: "oops",
      },
    ];
    const result = validateAndSummarise(input);
    expect(result.errors.length).toBe(4); // one error for each field
  });

  it("returns a summary for valid events", () => {
    const input = [
      {
        timestamp: "2026-01-28T10:15:00Z",
        vehicleId: "ABC12345",
        type: "IGNITION_ON" as EventType,
        value: 1,
      },
      {
        timestamp: "2026-01-28T10:20:00Z",
        vehicleId: "XYZ98765",
        type: "SPEED" as EventType,
        value: 45,
      },
    ];

    const result = validateAndSummarise(input);

    expect(result.errors.length).toBe(0);
    expect(result.summary?.totalEvents).toBe(2);
    expect(result.summary?.uniqueVehicleCount).toBe(2);
    expect(result.summary?.countPerType["IGNITION_ON"]).toBe(1);
    expect(result.summary?.countPerType["SPEED"]).toBe(1);
  });

  it("ignores partially invalid events", () => {
    const input = [
      {
        timestamp: "2026-01-28T10:15:00Z",
        vehicleId: "ABC12345",
        type: "IGNITION_ON" as EventType,
        value: 1,
      },
      {
        timestamp: "invalid",
        vehicleId: "123",
        type: "SPEED" as EventType,
        value: 45,
      },
    ];

    const result = validateAndSummarise(input);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.summary).toBeUndefined();
  });
});
