import { ComponentType } from "react";

declare module "react-day-picker" {
  interface CustomComponents {
    IconLeft?: ComponentType<{ classanna: true; className?: string; }>;
  }
  interface DayPickerProps {
    components?: Partial<CustomComponents>;
  }
}