import type { ReactElement } from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { GlobalStyle } from "@/styles/GlobalStyle";

export function App(): ReactElement {
  return (
    <>
      <GlobalStyle />
      <Dashboard />
    </>
  );
}
