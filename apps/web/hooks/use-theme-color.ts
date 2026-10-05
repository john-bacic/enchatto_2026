"use client";

import { useEffect } from "react";

export function useThemeColor(meTint: string | undefined) {
  useEffect(() => {
    if (!meTint) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevMeta = meta?.content;
    meta?.setAttribute("content", meTint);
    return () => {
      if (meta && prevMeta) meta.setAttribute("content", prevMeta);
    };
  }, [meTint]);
}
