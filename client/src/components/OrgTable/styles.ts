import styled from "styled-components";
import { colors, fontSizes, radii, spacing } from "@/styles/tokens";
import type { PerformanceLevel } from "@/lib/format/performanceLevel";

export const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
`;

export const SearchInput = styled.input`
  flex: 1;
  max-width: 420px;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${radii.sm};
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  color: ${colors.text};
  font-size: ${fontSizes.md};

  &:focus {
    outline: 2px solid ${colors.accent};
    outline-offset: -1px;
  }
`;

export const FilterHint = styled.span`
  font-size: ${fontSizes.xs};
  color: ${colors.textMuted};
`;

export const TableScrollArea = styled.div`
  overflow: auto;
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  max-height: 70vh;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${fontSizes.sm};
`;

export const HeaderCell = styled.th`
  position: sticky;
  top: 0;
  background: ${colors.surfaceRaised};
  text-align: left;
  padding: ${spacing.sm} ${spacing.md};
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  border-bottom: 1px solid ${colors.border};

  &:hover {
    color: ${colors.accent};
  }
`;

export const BodyRow = styled.tr<{ $selected: boolean }>`
  background: ${({ $selected }) => ($selected ? colors.accentMuted : "transparent")};
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) => ($selected ? colors.accentMuted : colors.surfaceRaised)};
  }

  &:focus {
    outline: 2px solid ${colors.accent};
    outline-offset: -2px;
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
  }
`;

export const BodyCell = styled.td<{ $fading?: boolean; $indent?: number }>`
  padding: 6px ${spacing.md};
  padding-left: ${({ $indent }) => ($indent ? `calc(${spacing.md} + ${$indent - 1} * 16px)` : spacing.md)};
  border-bottom: 1px solid ${colors.border};
  white-space: nowrap;
  background-color: ${({ $fading }) => ($fading ? colors.fadeHighlight : "transparent")};
  transition: background-color 1.5s ease;
`;

const PERFORMANCE_COLOR: Record<PerformanceLevel, string> = {
  high: colors.performanceHigh,
  medium: colors.performanceMedium,
  low: colors.performanceLow,
};

export const PerformanceBadge = styled.span<{ $level: PerformanceLevel }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $level }) => PERFORMANCE_COLOR[$level]};
  }
`;

export const EmptyRow = styled.tr`
  td {
    padding: ${spacing.xl};
    text-align: center;
    color: ${colors.textMuted};
  }
`;
