"use client";

import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  name = "phone",
  className,
}: PhoneInputProps) {
  return (
    <ReactPhoneInput
      country="us"
      value={value}
      onChange={onChange}
      inputProps={{ name }}
      containerClass={className}
      containerStyle={{ width: "100%" }}
      inputStyle={{
        width: "100%",
        height: "44px",
        borderRadius: "8px",
        border: "1px solid var(--input)",
        backgroundColor: "transparent",
        fontSize: "14px",
        paddingLeft: "48px",
      }}
      buttonStyle={{
        borderRadius: "8px 0 0 8px",
        border: "1px solid var(--input)",
        borderRight: "none",
        backgroundColor: "transparent",
      }}
    />
  );
}
