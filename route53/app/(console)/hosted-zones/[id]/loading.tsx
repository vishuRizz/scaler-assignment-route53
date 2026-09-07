export default function HostedZoneLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        width: "100%",
        background: "var(--aws-surface, #151d26)",
        color: "var(--aws-text-secondary, #aab7b8)",
        fontSize: 14,
      }}
      role="status"
      aria-live="polite"
    >
      Loading...
    </div>
  );
}
