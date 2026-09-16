import styled from "styled-components";
import { colors, fontSizes, radii, spacing } from "@/styles/tokens";
import type { PerformanceLevel } from "@/lib/format/performanceLevel";

export const TreeRoot = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const TreeItem = styled.li`
  list-style: none;
`;

export const NodeRow = styled.div<{ $depth: number; $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: 6px ${spacing.sm};
  padding-left: calc(${spacing.sm} + ${({ $depth }) => $depth - 1} * 20px);
  border-radius: ${radii.sm};
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? colors.accentMuted : "transparent")};

  &:hover {
    background: ${({ $selected }) => ($selected ? colors.accentMuted : colors.surfaceRaised)};
  }
`;

export const ExpandButton = styled.button<{ $expanded: boolean; $visible: boolean }>`
  width: 16px;
  height: 16px;
  flex: none;
  border: none;
  background: transparent;
  color: ${colors.textMuted};
  cursor: pointer;
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
  transform: rotate(${({ $expanded }) => ($expanded ? "90deg" : "0deg")});
  transition: transform 0.15s ease;
  font-size: ${fontSizes.sm};
  padding: 0;
  line-height: 1;
`;

export const NodeName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Headcount = styled.span`
  color: ${colors.textMuted};
  font-size: ${fontSizes.sm};
  flex: none;
`;

const PERFORMANCE_COLOR: Record<PerformanceLevel, string> = {
  high: colors.performanceHigh,
  medium: colors.performanceMedium,
  low: colors.performanceLow,
};

export const PerformanceDot = styled.span<{ $level: PerformanceLevel }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
  background: ${({ $level }) => PERFORMANCE_COLOR[$level]};
`;

export const ChildrenWrapper = styled.div<{ $expanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $expanded }) => ($expanded ? "1fr" : "0fr")};
  transition: grid-template-rows 0.2s ease;

  > ul {
    overflow: hidden;
  }
`;
