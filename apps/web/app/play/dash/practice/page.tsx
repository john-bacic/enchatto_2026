"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DashPractice } from "@/components/dash/practice";
import { RoomBackground } from "@/components/ui/effects";
import { PRESET_AVATARS } from "@/lib/types";

// Chatto Dash by yourself, on the web: /play/dash/practice?avatar=<avatar id>&lang=ja (and cp=3 to start each
// run at a course's fourth checkpoint, for trying its end out). The same screen the
// iPhone app carries a copy of for playing with no connection (apps/web/offline/dash-practice.tsx).
function Practice() {
  const params = useSearchParams();
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(matchMedia("(pointer: coarse)").matches || params.get("touch") === "1");
  }, [params]);
  return (
    <>
      <RoomBackground />
      <DashPractice avatar={params.get("avatar") ?? PRESET_AVATARS[0].id} lang={params.get("lang") ?? "en"} coarse={coarse} startCheckpoint={Number(params.get("cp") ?? 0) || 0} />
    </>
  );
}

export default function DashPracticePage() {
  return (
    <Suspense fallback={null}>
      <Practice />
    </Suspense>
  );
}
