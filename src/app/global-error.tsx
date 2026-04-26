"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#16161d",
          color: "#fafafa",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>죄송합니다, 문제가 발생했습니다</h1>
          <p style={{ opacity: 0.7 }}>{error.message}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 24px",
              borderRadius: 12,
              background: "#FF6B5B",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
