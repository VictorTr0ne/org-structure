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

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.lg};
`;

export const Layout = styled.div<{ $view: "tree" | "table" }>`
  display: block;

  .pane-tree {
    display: ${({ $view }) => ($view === "tree" ? "block" : "none")};
  }

  .pane-table {
    display: ${({ $view }) => ($view === "table" ? "block" : "none")};
  }

  @media (min-width: 1280px) {
    display: grid;
    grid-template-columns: minmax(280px, 380px) 1fr;
    gap: ${spacing.xl};

    .pane-tree,
    .pane-table {
      display: block;
    }
  }
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
