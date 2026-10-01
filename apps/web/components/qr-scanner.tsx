"use client";

import { useEffect, useRef, useState } from "react";
import { Chatto } from "@/components/ui/chatto";
import { Icon } from "@/components/ui/icon";
import { t } from "@/lib/i18n";

interface QrScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  lang?: string;
}

export function QrScanner({ onScan, onClose, lang }: QrScannerProps) {
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
              : t("Camera access denied. Please allow camera permissions.", lang)
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
    <div className="ec-modal-backdrop" style={{ zIndex: 300 }}>
      <div className="ec-card ec-modal" style={{ maxWidth: 400, padding: "16px 16px 18px", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Icon name="ui-camera" size={34} />
          <h2 className="ec-chunky" style={{ flex: 1, fontSize: 20 }}>
            {t("SCAN QR CODE", lang)}
          </h2>
          <button className="ec-round-btn" onClick={onClose} aria-label={t("Close", lang)}>
            ✕
          </button>
        </div>

        {error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "10px 0 4px", textAlign: "center" }}>
            <Chatto size={84} bob={false} wave={false} shadow />
            <div className="ec-error" style={{ width: "100%" }}>{error}</div>
            <button className="ec-btn sm" onClick={onClose}>
              {t("Close", lang)}
            </button>
          </div>
        ) : (
          <>
            <div className="ec-qr-frame">
              <div id="qr-reader" ref={containerRef} style={{ width: "100%" }} />
              <div className="ec-qr-corners" aria-hidden><i /><i /><i /><i /></div>
            </div>
            <p style={{ marginTop: 12, fontSize: 13, fontWeight: 900, textAlign: "center", opacity: 0.7 }}>
              {t("Point your camera at the room's QR code", lang)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
