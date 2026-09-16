import { createGlobalStyle } from "styled-components";
import { colors } from "./tokens";

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: dark;
  }

  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    margin: 0;
    background: ${colors.background};
    color: ${colors.text};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
  }

  button, input {
    font-family: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
  }
`;
