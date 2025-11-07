"use client";

import { ReactNode } from "react";
import ExchangeRateWidget from "./ExchangeRateWidget";

export default function LayoutWithWidget({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ExchangeRateWidget />
    </>
  );
}
