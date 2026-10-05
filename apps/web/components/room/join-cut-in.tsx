"use client";

import { Confetti, CutIn } from "@/components/ui/effects";
import type { useVibe } from "@/hooks/use-vibe";
import { t } from "@/lib/i18n";
import { avatarIconSrc, getAvatarById } from "@/lib/types";

export function JoinCutIn({
  cutIn,
  lang,
  confettiKey,
}: {
  cutIn: ReturnType<typeof useVibe>["cutIn"];
  lang: string;
  confettiKey: ReturnType<typeof useVibe>["confettiKey"];
}) {
  return (
    <>
      {cutIn && (
        <CutIn burstKey={cutIn.key}>
          {cutIn.avatar && (
            <span className="ec-cutin-av" style={{ background: getAvatarById(cutIn.avatar).color }}>
              <img src={avatarIconSrc(cutIn.avatar)} alt="" />
            </span>
          )}
          {lang === "ja" ? t("{name} JOINED!", lang).replace("{name}", cutIn.name) : t("{name} JOINED!", lang).replace("{name}", cutIn.name).toUpperCase()}
        </CutIn>
      )}
      {confettiKey && <Confetti burstKey={confettiKey} count={50} />}
    </>
  );
}
