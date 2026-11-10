// Chatto Dash's own words, in the two languages the app speaks

const EN = {
  title: "Chatto Dash",
  blurb: "Race through five wild obstacle courses. Points for every finish. Most points wins!",
  players: "Racers",
  join: "JOIN THE RACE!",
  leave: "Leave",
  start: "START!",
  cancel: "Cancel",
  waitingHost: "Waiting for the host to start…",
  courses: "The five courses",
  howTouch: "Left thumb to run · JUMP · DIVE",
  howKeys: "WASD or arrows to run · Space to jump · Shift to dive",
  round: "Round",
  getReady: "Get ready!",
  go: "GO!",
  jump: "JUMP",
  dive: "DIVE",
  finished: "FINISHED!",
  waitingOthers: "Waiting for the others…",
  hurry: "Hurry!",
  watching: "Watching",
  end: "End",
  endConfirm: "End the game for everyone?",
  results: "Results",
  standings: "Standings",
  nextIn: "Next course in",
  nextNow: "Next course",
  dnf: "did not finish",
  pts: "pts",
  winner: "WINNER!",
  tie: "IT'S A TIE!",
  finalResults: "Final results",
  playAgain: "PLAY AGAIN",
  close: "Close",
  minimize: "Minimize",
  resume: "Resume Chatto Dash",
  loading: "Building the course…",
  noWebgl: "This device can't draw the 3D course.",
  raceOn: "A race is on!",
  watch: "WATCH",
};

const JA: typeof EN = {
  title: "チャットダッシュ",
  blurb: "5つのハチャメチャ障害物コースを走りぬけ！ゴールするたびポイント。いちばん多い人が優勝！",
  players: "ランナー",
  join: "レースに参加！",
  leave: "ぬける",
  start: "スタート！",
  cancel: "キャンセル",
  waitingHost: "ホストのスタートを待っています…",
  courses: "5つのコース",
  howTouch: "左の親指で走る · ジャンプ · ダイブ",
  howKeys: "WASD・矢印で走る · スペースでジャンプ · シフトでダイブ",
  round: "ラウンド",
  getReady: "よーい…",
  go: "ドン！",
  jump: "ジャンプ",
  dive: "ダイブ",
  finished: "ゴール！",
  waitingOthers: "みんなを待っています…",
  hurry: "いそげ！",
  watching: "観戦中",
  end: "終了",
  endConfirm: "みんなのゲームを終了しますか？",
  results: "結果",
  standings: "総合順位",
  nextIn: "次のコースまで",
  nextNow: "次のコースへ",
  dnf: "ゴールできず",
  pts: "点",
  winner: "優勝！",
  tie: "引き分け！",
  finalResults: "最終結果",
  playAgain: "もう一回",
  close: "閉じる",
  minimize: "最小化",
  resume: "チャットダッシュを再開",
  loading: "コースを準備中…",
  noWebgl: "この端末では3Dコースを表示できません。",
  raceOn: "レース中！",
  watch: "観戦する",
};

export type DashCopy = typeof EN;
export const dashCopy = (lang?: string): DashCopy => (lang === "ja" ? JA : EN);

export function ordinal(n: number, lang?: string): string {
  if (lang === "ja") return `${n}位`;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** 83.42 seconds as 1:23.4 */
export function raceClock(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${m}:${rest < 10 ? "0" : ""}${rest.toFixed(1)}`;
}
