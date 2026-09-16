import type { ReactElement } from "react";
import styled from "styled-components";
import { colors, radii, spacing } from "@/styles/tokens";

export type DashboardView = "tree" | "table";

const Wrapper = styled.div`
  display: inline-flex;
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  overflow: hidden;

  /* Split-view kicks in at >=1280px, making the toggle redundant. */
  @media (min-width: 1280px) {
    display: none;
  }
`;

const Option = styled.button<{ $active: boolean }>`
  padding: ${spacing.sm} ${spacing.lg};
  border: none;
  cursor: pointer;
  background: ${({ $active }) => ($active ? colors.accent : colors.surface)};
  color: ${({ $active }) => ($active ? "#0b0d11" : colors.text)};
`;

export function ViewSwitcher({
  view,
  onChange,
}: {
  view: DashboardView;
  onChange: (view: DashboardView) => void;
}): ReactElement {
  return (
    <Wrapper role="tablist" aria-label="Переключение вида">
      <Option type="button" role="tab" aria-selected={view === "tree"} $active={view === "tree"} onClick={() => onChange("tree")}>
        Дерево
      </Option>
      <Option type="button" role="tab" aria-selected={view === "table"} $active={view === "table"} onClick={() => onChange("table")}>
        Таблица
      </Option>
    </Wrapper>
  );
}
