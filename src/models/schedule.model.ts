export type DayCode = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type TimeRange = {
    start: string;
    end: string;
    endNextDay?: boolean;
};

export type DaySchedule = {
    day: DayCode;
    ranges: TimeRange[];
};

export type Schedule = {
    timezone: string;
    days: DaySchedule[];
};