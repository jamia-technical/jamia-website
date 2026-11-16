"use client";

import React from "react";
import { DatePicker as AntdDatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { MdCalendarToday } from "react-icons/md";

// Load the customParseFormat plugin for DD/MM/YYYY support
dayjs.extend(customParseFormat);

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder, id }) => {
  // Convert string value to dayjs object for Ant Design
  const dateValue = value ? dayjs(value, "DD/MM/YYYY") : null;

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date && date.isValid()) {
      onChange(date.format("DD/MM/YYYY"));
    } else {
      onChange("");
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#22543d",
          borderRadius: 8,
          controlHeight: 48, // Matches py-3.5 approximately
          fontFamily: "inherit",
        },
        components: {
          DatePicker: {
            activeBorderColor: "#22543d",
            hoverBorderColor: "#22543d",
          },
        },
      }}
    >
      <div className="relative group w-full">
        <MdCalendarToday 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg transition-colors group-hover:text-primary z-10 pointer-events-none"
        />
        <AntdDatePicker
          id={id}
          value={dateValue}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          placeholder={placeholder || "DD/MM/YYYY"}
          className="w-full !pl-11 pr-4 py-3.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-gray-50 hover:bg-white custom-antd-picker"
          inputReadOnly={false} // Allow manual entry
          allowClear={true}
          suffixIcon={null} // We use our own icon on the left
        />
       
      </div>
    </ConfigProvider>
  );
};

export default DatePicker;
