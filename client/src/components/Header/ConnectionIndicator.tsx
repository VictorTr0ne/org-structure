import type { ReactElement } from "react";
import styled from "styled-components";
import { colors, fontSizes, spacing } from "@/styles/tokens";
import type { ConnectionStatus } from "@/lib/realtime/useOrgTreeSocket";

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: "Подключение…",
  open: "Онлайн",
  reconnecting: "Переподключение…",
  offline: "Нет соединения",
};

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  connecting: colors.performanceMedium,
  open: colors.performanceHigh,
  reconnecting: colors.performanceMedium,
  offline: colors.performanceLow,
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-size: ${fontSizes.sm};
  color: ${colors.textMuted};
`;

const Dot = styled.span<{ $color: string; $pulsing: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  animation: ${({ $pulsing }) => ($pulsing ? "pulse 1.2s ease-in-out infinite" : "none")};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.35;
    }
  }
`;

export function ConnectionIndicator({ status }: { status: ConnectionStatus }): ReactElement {
  return (
    <Wrapper role="status" aria-live="polite">
      <Dot $color={STATUS_COLOR[status]} $pulsing={status !== "open"} />
      {STATUS_LABEL[status]}
    </Wrapper>
  );
}
