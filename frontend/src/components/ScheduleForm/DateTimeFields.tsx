import React from "react";
import { WORK_HOURS, getValidDate, getValidTime } from "./utils";

interface DateTimeFieldsProps {
  date: string;
  setDate: (d: string) => void;
  time: string;
  setTime: (t: string) => void;
  endTime: string;
  setEndTime: (t: string) => void;
}

export default function DateTimeFields({
  date,
  setDate,
  time,
  setTime,
  endTime,
  setEndTime,
}: DateTimeFieldsProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <label className="block text-xs text-[#344055] font-medium mb-1">Data*</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(getValidDate(e.target.value))}
          className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
          required
          min={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-[#344055] font-medium mb-1">Hora início*</label>
        <select
          value={time}
          onChange={(e) => setTime(getValidTime(e.target.value))}
          className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
          required
        >
          {WORK_HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-xs text-[#344055] font-medium mb-1">Hora fim*</label>
        <select
          value={endTime}
          onChange={(e) => setEndTime(getValidTime(e.target.value))}
          className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
          required
        >
          {WORK_HOURS.map(
            (h) => 
              WORK_HOURS.indexOf(h) > WORK_HOURS.indexOf(time) && (
                <option key={h} value={h}>
                  {h}
                </option>
              )
          )}
        </select>
      </div>
    </div>
  );
}