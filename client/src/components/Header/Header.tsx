import type { ReactElement } from "react";
import styled from "styled-components";
import { colors, spacing } from "@/styles/tokens";
import type { ConnectionStatus } from "@/lib/realtime/useOrgTreeSocket";
import { ConnectionIndicator } from "./ConnectionIndicator";

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md} ${spacing.xl};
  border-bottom: 1px solid ${colors.border};
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

export function Header({ connectionStatus }: { connectionStatus: ConnectionStatus }): ReactElement {
  return (
    <Bar>
      <Title>Мониторинг орг-структуры</Title>
      <ConnectionIndicator status={connectionStatus} />
    </Bar>
  );
}
