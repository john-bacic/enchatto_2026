"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!mounted || !containerRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Camera access denied. Please allow camera permissions."
          );
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "400px",
          margin: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Scan QR Code</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              fontSize: "1.5rem",
              color: "var(--muted)",
              padding: "0.25rem",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {error ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <p style={{ color: "#ef4444", fontSize: "0.9rem", marginBottom: "1rem" }}>
              {error}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "0.5rem 1.5rem",
                borderRadius: "8px",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div
            id="qr-reader"
            ref={containerRef}
            style={{ width: "100%", borderRadius: "8px", overflow: "hidden" }}
          />
        )}
      </div>
    </div>
  );
}
