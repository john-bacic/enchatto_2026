import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Chatto } from "@/components/ui/chatto";
import { RoomBackground } from "@/components/ui/effects";
import { TEXTURES, textureStyle } from "@/lib/textures";
import "../screens.css";
import "./guide.css";

export const metadata: Metadata = {
  title: "Enchatto Guide",
  description: "Chat across English and Japanese: live two-way translation, voice messages, party games. No download, no sign-up.",
};

type Lang = "en" | "ja";

const DEMO_TEXTURE = TEXTURES.find((t) => t.key === "sakura") ?? TEXTURES[0];

interface Card {
  icon: string;
  title: string;
  body: string;
  perk?: string;
}

const DEMO = [
  {
    side: "left",
    avatar: "av-bunny",
    name: "Yuki",
    lang: "ja",
    text: "週末なにしてた？",
    trans: "What did you do this weekend?",
    romaji: "Shūmatsu nani shiteta?",
  },
  {
    side: "right",
    avatar: "av-puppy",
    name: "Sam",
    lang: "en",
    text: "Went hiking near Mt. Takao! Want to come next time?",
    trans: "高尾山の近くでハイキングしたよ！次は一緒に来る？",
    romaji: "Takao-san no chikaku de haikingu shita yo! Tsugi wa issho ni kuru?",
    reactions: ["re-heart", "re-laugh"],
  },
  {
    side: "left",
    avatar: "av-bunny",
    name: "Yuki",
    lang: "ja",
    text: "行きたい！",
    trans: "I want to go!",
    romaji: "Ikitai!",
  },
] as const;

const GAMES = [
  { icon: "o-flower", color: "var(--yellow)", min: 2, shot: "word-rush" },
  { icon: "g-pencil", color: "var(--blue-soft)", min: 2, shot: "lost-in-translation" },
  { icon: "g-clover", color: "var(--mint-soft)", min: 1, shot: "emoji-bingo" },
  { icon: "o-cherry", color: "var(--violet-soft)", min: 1, shot: "emoji-match" },
  { icon: "g-question", color: "var(--pink-soft)", min: 2, shot: "truth-or-dare" },
];

const DRAW_SHOTS = ["draw-canvas", "draw-chat"];

const STEP_ICONS = ["o-house", "ui-camera", "re-laugh"];
const FEATURE_ICONS = ["g-arrows", "ui-camera", "g-ear", "ui-photo", "re-heart", "g-bolt", "o-tv", "re-peace"];
const HOST_ICONS = ["ui-sparkle", "g-no", "g-bang", "re-wave"];
const USE_ICONS = ["o-beer", "o-train", "o-house", "g-pencil", "re-laugh", "g-crown"];

const COPY = {
  en: {
    back: "Back",
    other: "日本語",
    kicker: "THE GUIDE",
    heroTitle: "Talk to anyone across English & Japanese",
    heroSub: "Everyone writes in their own language. Everyone reads it in theirs. No download, no sign-up: just a room code.",
    heroCta: "Join a room",
    heroMore: "See what's inside",
    demoLabel: "A room, live",
    typing: "Sam is typing",
    howTitle: "How it works",
    steps: [
      {
        title: "The host opens a room",
        body: "Open the Enchatto app on iPhone and tap Create Room. A QR code and a 6-letter code appear.",
      },
      {
        title: "Friends hop in",
        body: "They scan the QR code or type the code on the home page. Any phone browser works, nothing to install.",
      },
      {
        title: "Just talk",
        body: "Type or speak in your own language. Messages show up in English and Japanese for everyone, live.",
      },
    ],
    featuresTitle: "Everything in a room",
    features: [
      {
        title: "Two-way translation",
        body: "Every message appears in English and Japanese side by side, with optional romaji so learners can read along.",
        perk: "No more copy-pasting into a translator",
      },
      {
        title: "Join in seconds",
        body: "Scan a QR code or type 6 letters. No account, no app store, no password.",
        perk: "Zero setup for guests",
      },
      {
        title: "Voice messages",
        body: "Switch to the mic and just talk. Play clips back at your own speed, and tap Show text to read what was said.",
        perk: "For when typing is too slow",
      },
      {
        title: "Photos & doodles",
        body: "Snap a photo, share one from your library, or draw something when the words won't come.",
        perk: "Show it instead of explaining it",
      },
      {
        title: "Reactions & replies",
        body: "Drop a sticker on any message, reply to a specific one, and see when someone is typing.",
        perk: "Conversations that feel alive",
      },
      {
        title: "Vibe meter",
        body: "The meter fills up as the chat bounces between English and Japanese. Keep the back-and-forth going to hit HYPE.",
        perk: "Rewards actually talking to each other",
      },
      {
        title: "Your screen, your way",
        body: "Pick which languages to show, turn romaji on or off, and choose small, medium or large text.",
        perk: "Readable for everyone at the table",
      },
      {
        title: "See who's here",
        body: "Little dots on everyone's avatar show who's online, who stepped away and who's gone.",
        perk: "Know who's listening",
      },
    ],
    drawTitle: "Draw it, send it",
    drawSub: "Tap the pencil, pick a colour and pen size, and send your sketch to the room. Everyone can react to it.",
    drawSteps: ["Doodle", "Send & react"],
    gamesTitle: "Party games built for two languages",
    gamesSub: "Tap the game button in any room. Everyone plays in their own language.",
    swipe: "Swipe for more",
    games: [
      {
        name: "Word Rush",
        body: "3 emoji drop in: race to pick the word. Faster = more points! Japanese speakers learn English, English speakers learn Japanese.",
      },
      {
        name: "Lost in Translation",
        body: "A drawing guessing game: one player draws, everyone else picks from 4 choices. 10 rounds, rotating drawer!",
      },
      {
        name: "Emoji Bingo",
        body: "Mark emojis on your card as they're called. First to complete the pattern wins!",
      },
      { name: "Emoji Match", body: "Find matching emoji pairs! Take turns flipping cards." },
      {
        name: "Truth or Dare",
        body: "A social game: answer a question or complete a challenge! Take turns with your group.",
      },
    ],
    players: (n: number) => (n === 1 ? "Solo OK" : `${n}+ players`),
    hostTitle: "Host superpowers",
    hostSub: "Hosting runs on the Enchatto iPhone app.",
    host: [
      {
        title: "Offline translation",
        body: "Download the language pack once and the iPhone translates on-device.",
      },
      { title: "Remove guests", body: "Someone wandered into the wrong room? Remove them with one tap." },
      {
        title: "Join alerts",
        body: "Get a notification when someone joins while you're away from the app.",
      },
      {
        title: "Close when you're done",
        body: "End the room any time. Rooms also close on their own once the host has been gone for 15 minutes.",
      },
    ],
    privacy: ["No accounts, ever", "Voice clips deleted when the room closes", "Rooms close by themselves"],
    useTitle: "Made for",
    uses: ["Izakaya nights", "Travel", "Homestays", "Classrooms", "Language exchange", "Game night"],
    ctaTitle: "Got a room code?",
    ctaBody: "Ask the host for the QR code or the 6 letters, and you're in.",
  },
  ja: {
    back: "戻る",
    other: "English",
    kicker: "ガイド",
    heroTitle: "英語と日本語で、だれとでも話そう",
    heroSub: "みんな自分の言葉で書いて、自分の言葉で読める。ダウンロードも登録もいらない。必要なのはルームコードだけ。",
    heroCta: "ルームに参加",
    heroMore: "機能を見る",
    demoLabel: "ルームの様子",
    typing: "Samが入力中",
    howTitle: "使い方",
    steps: [
      {
        title: "ホストがルームを作る",
        body: "iPhoneのEnchattoアプリで「ルームを作成」をタップ。QRコードと6文字のコードが表示されます。",
      },
      {
        title: "友だちが参加",
        body: "QRコードを読み取るか、ホーム画面でコードを入力するだけ。スマホのブラウザでOK、インストール不要。",
      },
      {
        title: "あとは話すだけ",
        body: "自分の言葉で入力しても、話しても大丈夫。メッセージは英語と日本語でみんなにリアルタイムで届きます。",
      },
    ],
    featuresTitle: "ルームでできること",
    features: [
      {
        title: "双方向翻訳",
        body: "すべてのメッセージが英語と日本語で並んで表示。ローマ字もオンにできるので、学習中の人も読みやすい。",
        perk: "翻訳アプリへのコピペはもう不要",
      },
      {
        title: "数秒で参加",
        body: "QRコードを読むか6文字を入力するだけ。アカウントもアプリもパスワードもいりません。",
        perk: "ゲストの準備はゼロ",
      },
      {
        title: "ボイスメッセージ",
        body: "マイクに切り替えて話すだけ。好きな速さで再生でき、「テキストを表示」で内容も読めます。",
        perk: "入力より話す方が早いときに",
      },
      {
        title: "写真とお絵描き",
        body: "写真を撮ったり、ライブラリから共有したり。言葉に詰まったら絵で伝えよう。",
        perk: "説明するより見せる方が早い",
      },
      {
        title: "リアクションと返信",
        body: "メッセージにスタンプを付けたり、特定のメッセージに返信したり。入力中の表示もあります。",
        perk: "会話がもっと生き生き",
      },
      {
        title: "バイブメーター",
        body: "英語と日本語が行き来するほどメーターが上昇。会話を続けてHYPEを目指そう！",
        perk: "話すほど盛り上がる",
      },
      {
        title: "自分好みの表示",
        body: "表示する言語、ローマ字のオン・オフ、文字サイズ（小・中・大）を選べます。",
        perk: "テーブルの全員が読みやすい",
      },
      {
        title: "参加者がひと目でわかる",
        body: "アバターの小さなドットで、オンライン・離席中・退出済みがわかります。",
        perk: "だれが見ているかわかる",
      },
    ],
    drawTitle: "描いて、送ろう",
    drawSub: "鉛筆ボタンをタップして、色とペンの太さを選んで描くだけ。描いた絵はルームのみんなに届いて、リアクションももらえます。",
    drawSteps: ["描く", "送ってリアクション"],
    gamesTitle: "2つの言語で遊べるパーティーゲーム",
    gamesSub: "ルームのゲームボタンをタップ。みんな自分の言葉でプレイできます。",
    swipe: "スワイプしてもっと見る",
    games: [
      {
        name: "ワードラッシュ",
        body: "絵文字が3つ落ちてくる！いち早く単語を当てよう。早いほど高得点！日本語話者は英語を、英語話者は日本語を学べる。",
      },
      {
        name: "ロスト・イン・トランスレーション",
        body: "お絵描き当てゲーム：1人が描き、他の全員が4択から選ぶ。10ラウンド、描く人は交代！",
      },
      { name: "絵文字ビンゴ", body: "呼ばれた絵文字をカードにマーク。パターンを最初に完成させた人の勝ち！" },
      { name: "絵文字マッチ", body: "同じ絵文字のペアを探そう！順番にカードをめくってね。" },
      { name: "どっちする？", body: "みんなで順番に質問に答えたり、チャレンジしたりするゲームです！" },
    ],
    players: (n: number) => (n === 1 ? "1人でもOK" : `${n}人から`),
    hostTitle: "ホストの特別な機能",
    hostSub: "ホストはiPhoneのEnchattoアプリで行います。",
    host: [
      { title: "オフライン翻訳", body: "言語パックを一度ダウンロードすれば、iPhone本体で翻訳します。" },
      { title: "ゲストを退出させる", body: "まちがって入った人がいても、ワンタップで退出させられます。" },
      { title: "参加のお知らせ", body: "アプリを離れている間にだれかが参加すると、通知でお知らせします。" },
      {
        title: "終わったら閉じる",
        body: "いつでもルームを終了できます。ホストが15分いなくなると、ルームは自動で閉じます。",
      },
    ],
    privacy: ["アカウント不要", "ルームを閉じるとボイスは削除", "ルームは自動で閉じる"],
    useTitle: "こんな場面に",
    uses: ["居酒屋", "旅行", "ホームステイ", "教室", "言語交換", "ゲームナイト"],
    ctaTitle: "ルームコードはある？",
    ctaBody: "ホストにQRコードか6文字のコードを聞けば、すぐに参加できます。",
  },
} satisfies Record<Lang, unknown>;

const icon = (name: string) => `/icons/${name}.png`;

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="gd-section">
      <h2 className="gd-h2">{title}</h2>
      {sub && <p className="gd-sub">{sub}</p>}
      {children}
    </section>
  );
}

function Phone({ shot, alt }: { shot: string; alt: string }) {
  return (
    <span className="gd-phone">
      <Image src={`/guide/${shot}.jpg`} alt={alt} width={560} height={1212} sizes="(max-width: 560px) 64vw, 300px" />
    </span>
  );
}

function CardGrid({ cards, className = "" }: { cards: Card[]; className?: string }) {
  return (
    <div className={`gd-grid ${className}`}>
      {cards.map((card) => (
        <article key={card.title} className="gd-card">
          <img className="gd-card-icon" src={icon(card.icon)} alt="" />
          <h3>{card.title}</h3>
          <p>{card.body}</p>
          {card.perk && <span className="gd-perk">{card.perk}</span>}
        </article>
      ))}
    </div>
  );
}

export default function GuidePage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang: Lang = searchParams.lang === "en" ? "en" : "ja";
  const c = COPY[lang];
  const home = "/";

  return (
    <main className="gd" lang={lang}>
      <RoomBackground />

      <nav className="gd-nav">
        <Link className="gd-pill" href={home}>
          ← {c.back}
        </Link>
        <Link className="gd-pill" href={`/guide?lang=${lang === "en" ? "ja" : "en"}`}>
          <b>あ</b>/A {c.other}
        </Link>
      </nav>

      <header className="gd-hero">
        <Logo tagline={c.kicker} size={46} />
        <h1 className="gd-h1">{c.heroTitle}</h1>
        <p className="gd-lead">{c.heroSub}</p>
        <div className="gd-hero-ctas">
          <Link className="ec-btn pink gd-cta" href={home}>
            {c.heroCta}
          </Link>
          <a className="gd-more" href="#features">
            {c.heroMore} ↓
          </a>
        </div>
      </header>

      <section className="gd-demo ec-card" style={textureStyle(DEMO_TEXTURE)} aria-label={c.demoLabel}>
        <span className="gd-demo-tag">{c.demoLabel}</span>
        {DEMO.map((m, i) => (
          <div key={i} className={`gd-msg ${m.side}`} style={{ "--i": i } as React.CSSProperties}>
            <img className="gd-av" src={icon(m.avatar)} alt="" />
            <div className="gd-bubble">
              <small>
                {m.name} <span className="gd-lang">{m.lang === "ja" ? "あ" : "A"}</span>
              </small>
              <p className="gd-orig">{m.text}</p>
              <p className="gd-trans">{m.trans}</p>
              <p className="gd-romaji">{m.romaji}</p>
              {"reactions" in m && (
                <div className="gd-reacts">
                  {m.reactions.map((r) => (
                    <img key={r} src={icon(r)} alt="" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div className="gd-typing">
          <span />
          <span />
          <span />
          <small>{c.typing}</small>
        </div>
      </section>

      <Section title={c.howTitle}>
        <ol className="gd-steps">
          {c.steps.map((step, i) => (
            <li key={step.title} className="gd-step">
              <span className="gd-step-num">{i + 1}</span>
              <img src={icon(STEP_ICONS[i])} alt="" />
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div id="features" />
      <Section title={c.featuresTitle}>
        <CardGrid cards={c.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }))} />
      </Section>

      <Section title={c.drawTitle} sub={c.drawSub}>
        <div className="gd-draw">
          {DRAW_SHOTS.map((shot, i) => (
            <figure key={shot} className="gd-draw-shot">
              <Phone shot={shot} alt={c.drawSteps[i]} />
              <figcaption>
                <span className="gd-step-num">{i + 1}</span>
                {c.drawSteps[i]}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title={c.gamesTitle} sub={c.gamesSub}>
        <p className="gd-swipe">{c.swipe} →</p>
        <div className="gd-games">
          {c.games.map((game, i) => (
            <article key={game.name} className="gd-game">
              <Phone shot={GAMES[i].shot} alt={game.name} />
              <div className="gd-game-info">
                <span className="gd-game-tile" style={{ background: GAMES[i].color }}>
                  <img src={icon(GAMES[i].icon)} alt="" />
                </span>
                <div>
                  <h3>
                    {game.name}
                    <span className="gd-players">{c.players(GAMES[i].min)}</span>
                  </h3>
                  <p>{game.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={c.hostTitle} sub={c.hostSub}>
        <CardGrid className="gd-grid-host" cards={c.host.map((h, i) => ({ ...h, icon: HOST_ICONS[i] }))} />
        <ul className="gd-privacy">
          {c.privacy.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </Section>

      <Section title={c.useTitle}>
        <ul className="gd-uses">
          {c.uses.map((use, i) => (
            <li key={use} style={{ "--r": `${i % 2 ? 3 : -3}deg` } as React.CSSProperties}>
              <img src={icon(USE_ICONS[i])} alt="" />
              {use}
            </li>
          ))}
        </ul>
      </Section>

      <section className="gd-final ec-card">
        <Chatto size={96} shadow />
        <h2 className="gd-h2">{c.ctaTitle}</h2>
        <p className="gd-sub">{c.ctaBody}</p>
        <Link className="ec-btn gd-cta" href={home}>
          {c.heroCta}
        </Link>
      </section>
    </main>
  );
}
