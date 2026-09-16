import type { ReactElement } from "react";
import styled from "styled-components";
import { colors, fontSizes, spacing } from "@/styles/tokens";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.md};
  padding: ${spacing.xxl};
  min-height: 240px;
  text-align: center;
  color: ${colors.textMuted};
`;

const Title = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${colors.text};
`;

const Description = styled.p`
  margin: 0;
  max-width: 360px;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid ${colors.border};
  border-top-color: ${colors.accent};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const RetryButton = styled.button`
  margin-top: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: 6px;
  border: 1px solid ${colors.accent};
  background: transparent;
  color: ${colors.accent};
  cursor: pointer;
  font-size: ${fontSizes.md};

  &:hover {
    background: ${colors.accentMuted};
  }
`;

export function LoadingState(): ReactElement {
  return (
    <Container role="status" aria-live="polite">
      <Spinner aria-hidden />
      <Title>Загружаем орг-структуру…</Title>
    </Container>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}): ReactElement {
  return (
    <Container role="alert">
      <Title>Не удалось загрузить данные</Title>
      <Description>{message}</Description>
      <RetryButton type="button" onClick={onRetry}>
        Повторить
      </RetryButton>
    </Container>
  );
}

export function EmptyState(): ReactElement {
  return (
    <Container>
      <Title>Пока нет данных</Title>
      <Description>Сервер вернул пустую орг-структуру — добавьте узлы и обновите страницу.</Description>
    </Container>
  );
}
