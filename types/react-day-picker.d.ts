import { ComponentType } from "react";

declare module "react-day-picker" {
  interface CustomComponents {
    IconLeft?: ComponentType<{ className?: string }>;
    IconRight?: ComponentType<{ className?: string }>;
  }
  interface DayPickerProps {
    components?: Partial<CustomComponents>;
  }
}