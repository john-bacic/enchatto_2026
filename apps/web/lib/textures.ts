import type { CSSProperties } from "react";

// Room background textures. All share the cream paper, two soft colour blobs and the
// same palette; only the pattern and blob tints change. Order matters: rooms store an
// index (rooms.background), and iOS ships PNG renders in the same order (RoomTexture.swift).

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const tile = (w: number, h: number, body: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`;

const P = "rgba(255, 122, 182, .18)";
const B = "rgba(59, 107, 255, .13)";
const M = "rgba(63, 220, 176, .2)";
const V = "rgba(167, 123, 255, .17)";
const Y = "rgba(255, 210, 63, .26)";

export interface RoomTexture {
  key: string;
  name: string;
  size: string;
  blobs: [string, string];
  svg: string;
}

export const TEXTURES: RoomTexture[] = [
  {
    key: "grid",
    name: "Graph paper",
    size: "26px",
    blobs: [P, B],
    svg: tile(26, 26, `<path d='M0 .75H26M.75 0V26' fill='none' stroke='#3b6bff' stroke-opacity='.11' stroke-width='1.5'/>`),
  },
  {
    key: "dots",
    name: "Halftone dots",
    size: "24px",
    blobs: [P, B],
    svg: tile(
      24,
      24,
      `<circle cx='6' cy='6' r='2.4' fill='#3b6bff' fill-opacity='.22'/><circle cx='18' cy='18' r='2.4' fill='#ff7ab6' fill-opacity='.26'/>`
    ),
  },
  {
    key: "gingham",
    name: "Picnic gingham",
    size: "34px",
    blobs: [Y, B],
    svg: tile(34, 34, `<g fill='#ff7ab6' fill-opacity='.1'><rect width='34' height='17'/><rect width='17' height='34'/></g>`),
  },
  {
    key: "sprinkles",
    name: "Sprinkles",
    size: "120px",
    blobs: [V, M],
    svg: tile(
      120,
      120,
      `<g fill='none' stroke-width='3' stroke-linecap='round' opacity='.5'>
        <path d='M14 18h10M19 13v10' stroke='#ff7ab6'/><circle cx='80' cy='22' r='4' stroke='#3b6bff'/>
        <path d='M40 64q5-6 10 0t10 0' stroke='#3fdcb0'/><path d='M96 72h10M101 67v10' stroke='#a77bff'/>
        <path d='M70 104l7-7' stroke='#ff7ab6'/><path d='M10 56l5 5' stroke='#3b6bff'/>
      </g>
      <g opacity='.55'>
        <circle cx='24' cy='96' r='3.5' fill='#ffd23f'/><circle cx='106' cy='110' r='3' fill='#3b6bff'/>
        <path d='M58 26l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z' fill='#ffd23f'/>
      </g>`
    ),
  },
  {
    key: "doodles",
    name: "Chat doodles",
    size: "160px",
    blobs: [P, B],
    svg: tile(
      160,
      160,
      `<g fill='none' stroke='#3b6bff' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' opacity='.2'>
        <path d='M18 14h34a10 10 0 0 1 10 10v12a10 10 0 0 1-10 10H32l-9 8 2-8h-7a10 10 0 0 1-10-10V24a10 10 0 0 1 10-10z'/>
        <path d='M100 84h36a10 10 0 0 1 10 10v12a10 10 0 0 1-10 10h-6l2 8-9-8h-23a10 10 0 0 1-10-10V94a10 10 0 0 1 10-10z'/>
        <path d='M120 22c-4-6-12-2-10 4 1 4 10 10 10 10s9-6 10-10c2-6-6-10-10-4z' stroke='#ff7ab6'/>
        <circle cx='30' cy='124' r='2.5'/><circle cx='40' cy='124' r='2.5'/><circle cx='50' cy='124' r='2.5'/>
        <path d='M70 142l4 4 8-9' stroke='#3fdcb0'/>
      </g>
      <g font-family='Hiragino Maru Gothic ProN, Zen Maru Gothic, sans-serif' font-weight='900' font-size='16' text-anchor='middle' opacity='.24'>
        <text x='35' y='36' fill='#3b6bff'>A</text><text x='118' y='106' fill='#ff7ab6'>あ</text><text x='82' y='62' font-size='20' fill='#a77bff'>!</text>
      </g>`
    ),
  },
  {
    key: "stripes",
    name: "Candy stripes",
    size: "40px",
    blobs: [M, V],
    svg: tile(
      40,
      40,
      `<g stroke-width='5' stroke-opacity='.15'>
        <path d='M-10 10L10-10M0 40L40 0M30 50L50 30' stroke='#a77bff'/><path d='M-10 30L30-10M10 50L50 10' stroke='#3fdcb0'/>
      </g>`
    ),
  },
  {
    key: "zigzag",
    name: "Zigzag",
    size: "40px 48px",
    blobs: [Y, B],
    svg: tile(
      40,
      48,
      `<g fill='none' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' stroke-opacity='.24'>
        <path d='M0 16L10 6L20 16L30 6L40 16' stroke='#ff7ab6'/><path d='M0 40L10 30L20 40L30 30L40 40' stroke='#3b6bff'/>
      </g>`
    ),
  },
  {
    key: "bubbles",
    name: "Bubbles",
    size: "110px",
    blobs: [M, B],
    svg: tile(
      110,
      110,
      `<g fill='none' stroke-width='2.5' stroke-linecap='round' stroke-opacity='.24'>
        <circle cx='24' cy='26' r='13' stroke='#3b6bff'/><path d='M16 22a9 9 0 0 1 5-5' stroke='#3b6bff'/>
        <circle cx='80' cy='18' r='6' stroke='#ff7ab6'/>
        <circle cx='72' cy='72' r='17' stroke='#3fdcb0'/><path d='M62 66a12 12 0 0 1 7-7' stroke='#3fdcb0'/>
        <circle cx='22' cy='88' r='7' stroke='#a77bff'/>
      </g>
      <g fill-opacity='.32'><circle cx='46' cy='52' r='3' fill='#3b6bff'/><circle cx='102' cy='46' r='3.5' fill='#ff7ab6'/><circle cx='100' cy='100' r='3' fill='#ffd23f'/></g>`
    ),
  },
  {
    key: "plaid",
    name: "Picnic plaid",
    size: "48px",
    blobs: [P, M],
    svg: tile(
      48,
      48,
      `<g fill='#3fdcb0' fill-opacity='.11'><rect y='6' width='48' height='14'/><rect x='6' width='14' height='48'/></g>
      <path d='M0 33H48M33 0V48' stroke='#a77bff' stroke-opacity='.2' stroke-width='1.5'/>
      <path d='M0 38H48M38 0V48' stroke='#ff7ab6' stroke-opacity='.16'/>`
    ),
  },
  {
    key: "alphabet",
    name: "Alphabet soup",
    size: "170px",
    blobs: [Y, V],
    svg: tile(
      170,
      170,
      `<g font-family='Hiragino Maru Gothic ProN, Zen Maru Gothic, Apple SD Gothic Neo, sans-serif' font-weight='900' font-size='22' text-anchor='middle' fill-opacity='.2'>
        <text x='24' y='34' fill='#3b6bff' transform='rotate(-12 24 34)'>A</text>
        <text x='86' y='28' fill='#ff7ab6' transform='rotate(8 86 28)'>あ</text>
        <text x='146' y='40' fill='#3fdcb0' transform='rotate(-6 146 40)'>Ñ</text>
        <text x='54' y='90' fill='#a77bff' transform='rotate(10 54 90)'>한</text>
        <text x='122' y='98' fill='#3b6bff' transform='rotate(-10 122 98)'>文</text>
        <text x='22' y='146' fill='#ff7ab6' transform='rotate(6 22 146)'>¿</text>
        <text x='86' y='152' fill='#3fdcb0' transform='rotate(-8 86 152)'>ü</text>
        <text x='148' y='154' fill='#a77bff' transform='rotate(12 148 154)'>ア</text>
      </g>`
    ),
  },
];

/** Older rooms have no stored index: hash the join code (FNV-1a) so every device agrees. */
export function textureForRoom(room: { background?: number; joinCode?: string } | null | undefined): RoomTexture {
  if (room?.background !== undefined && TEXTURES[room.background]) return TEXTURES[room.background];
  if (!room?.joinCode) return TEXTURES[0];
  let h = 0x811c9dc5;
  for (const ch of room.joinCode) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return TEXTURES[h % TEXTURES.length];
}

export function textureStyle(t: RoomTexture): CSSProperties {
  return {
    "--tex-img": svgUrl(t.svg),
    "--tex-size": t.size,
    "--blob-a": t.blobs[0],
    "--blob-b": t.blobs[1],
  } as CSSProperties;
}
