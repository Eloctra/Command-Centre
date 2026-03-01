import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <>
        <style jsx global>{`
          :root {
            --cc-bg: #0b1320;
            --cc-surface: #1c3f60;
            --cc-surface-alt: #282828;
            --cc-accent: #ffffff;
            --cc-accent-soft: #ffffff;
            --cc-border-subtle: rgba(255, 255, 255, 0.2);
            --cc-text: #ffffff;
            --cc-text-muted: #e5e7eb;
            --cc-black: #282828;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: radial-gradient(circle at top left, #1c3f60, #0b1320);
            color: var(--cc-text);
            font-family: system-ui, -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
          }

          body {
            min-height: 100vh;
          }

          a {
            color: var(--cc-accent);
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }

          button {
            font-family: inherit;
          }
        `}</style>
        <Component {...pageProps} />
      </>
    </SessionProvider>
  );
}
