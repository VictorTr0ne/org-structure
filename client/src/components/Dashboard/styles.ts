import styled from "styled-components";
import { colors, radii, spacing } from "@/styles/tokens";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Content = styled.main`
  flex: 1;
  overflow: auto;
  padding: ${spacing.xl};
`;

export const Pane = styled.section`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${radii.lg};
  padding: ${spacing.lg};
`;

export const PaneTitle = styled.h2`
  margin: 0 0 ${spacing.md};
  font-size: 15px;
  color: ${colors.textMuted};
  font-weight: 500;
`;
