"use client";

import { Component, type ReactNode } from "react";
import { Chatto } from "@/components/ui/chatto";
import { t } from "@/lib/i18n";

export class MessageErrorBoundary extends Component<
  { children: ReactNode; lang?: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; lang?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="ec-empty">
          <Chatto size={84} bob={false} wave={false} />
          <div className="ec-sys plain" style={{ flexDirection: "column", gap: 6, borderRadius: 16, padding: "10px 16px" }}>
            {t("Something went wrong displaying messages.", this.props.lang)}
            <button className="ec-btn white sm" style={{ width: "auto", padding: "0 16px" }} onClick={() => this.setState({ hasError: false })}>
              {t("Try again", this.props.lang)}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
