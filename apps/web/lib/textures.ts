import type { CSSProperties } from "react";

// Room background textures. All share the cream paper, two soft colour blobs and the
// same palette; only the pattern and blob tints change. Order matters: rooms store an
// index (rooms.background), and iOS ships PNG renders in the same order (RoomTexture.swift).
// A new texture goes at the end, and the server holds their number (BACKGROUND_COUNT in
// convex/rooms.ts). None is ever taken out: a texture that is no longer offered is marked
// `retired`, here, in RoomTexture.swift and on the server (RETIRED_BACKGROUNDS in
// convex/rooms.ts), and keeps its place and its index.

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
  /** A retired texture is drawn for a room that has it, and nothing picks it: no room is given it any more */
  retired?: true;
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
    retired: true,
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
    retired: true,
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
  {
    key: "sakura",
    name: "Sakura drift",
    size: "160px",
    blobs: [P, V],
    svg: tile(
      160,
      160,
      `<g fill='#ff7ab6' opacity='.3'><g transform='translate(30 30) rotate(12)'><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(72)'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(144)'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(216)'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(288)'/></g><g transform='translate(120 102) rotate(-18) scale(0.82)'><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(72)'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(144)'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(216)'/><path d='M0-2.5C-6-6-7-12.5-2.8-16.5L0-13.8L2.8-16.5C7-12.5 6-6 0-2.5Z' transform='rotate(288)'/></g><path d='M0 7C-6 3.5-7-3-2.8-7L0-4.3L2.8-7C7-3 6 3.5 0 7Z' transform='translate(88 18) rotate(38)'/><path d='M0 7C-6 3.5-7-3-2.8-7L0-4.3L2.8-7C7-3 6 3.5 0 7Z' transform='translate(138 44) rotate(-34) scale(0.8)'/><path d='M0 7C-6 3.5-7-3-2.8-7L0-4.3L2.8-7C7-3 6 3.5 0 7Z' transform='translate(16 84) rotate(118) scale(0.9)'/><path d='M0 7C-6 3.5-7-3-2.8-7L0-4.3L2.8-7C7-3 6 3.5 0 7Z' transform='translate(70 72) rotate(205) scale(0.8)'/><path d='M0 7C-6 3.5-7-3-2.8-7L0-4.3L2.8-7C7-3 6 3.5 0 7Z' transform='translate(44 128) rotate(62)'/><path d='M0 7C-6 3.5-7-3-2.8-7L0-4.3L2.8-7C7-3 6 3.5 0 7Z' transform='translate(92 146) rotate(-20) scale(0.85)'/><path d='M0 7C-6 3.5-7-3-2.8-7L0-4.3L2.8-7C7-3 6 3.5 0 7Z' transform='translate(149 149) rotate(-70) scale(0.75)'/></g><g fill='#ffd23f' fill-opacity='.6'><circle cx='30' cy='30' r='2.4'/><circle cx='120' cy='102' r='2'/></g>`
    ),
  },
  {
    key: "seigaiha",
    name: "Calm sea",
    size: "96px 48px",
    blobs: [B, M],
    svg: tile(
      96,
      48,
      `<g fill='none' stroke-width='2' stroke-linecap='round'><path d='M-12.66 -1.48A20 20 0 0 1 12.66 -1.48M83.34 -1.48A20 20 0 0 1 108.66 -1.48M-40.57 36.35A48 48 0 0 1 40.57 36.35M-24.65 38.58A34 34 0 0 1 24.65 38.58M-12.66 46.52A20 20 0 0 1 12.66 46.52M55.43 36.35A48 48 0 0 1 136.57 36.35M71.35 38.58A34 34 0 0 1 120.65 38.58M83.34 46.52A20 20 0 0 1 108.66 46.52' stroke='#3b6bff' stroke-opacity='.16'/><path d='M7.43 12.35A48 48 0 0 1 88.57 12.35M23.35 14.58A34 34 0 0 1 72.65 14.58M35.34 22.52A20 20 0 0 1 60.66 22.52M7.43 60.35A48 48 0 0 1 88.57 60.35' stroke='#3fdcb0' stroke-opacity='.28'/></g>`
    ),
  },
  {
    key: "onigiri",
    name: "Onigiri time",
    size: "126px 134px",
    blobs: [M, V],
    svg: tile(
      126,
      134,
      `<g fill='none' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' opacity='.21'><path d='M26.4 31L25.5 22.5Q25.3 21 26.8 20.9L36.8 19.8Q38.3 19.7 38.4 21.1L39.3 29.6Z' fill='#1d1b4f' fill-opacity='.5' stroke='none'/><path d='M23.9 7.6C26.9 2.2 32.9 1.6 36.9 6.2Q43.6 12.6 47.4 20.7C49.8 25.5 47.8 28.7 42.8 29.2L22.9 31.3C17.9 31.8 15.3 29.1 16.6 23.9Q18.7 15.2 23.9 7.6Z' stroke='#3b6bff'/><circle cx='27.2' cy='14.8' r='1.4' fill='#3b6bff' stroke='none'/><circle cx='35.2' cy='13.9' r='1.4' fill='#3b6bff' stroke='none'/><circle cx='94.5' cy='50.3' r='10.5' stroke='#a77bff'/><path d='M24.1 94.5L25.1 86.9Q25.3 85.6 26.7 85.8L35.6 87.1Q36.9 87.2 36.7 88.6L35.7 96.2Z' fill='#1d1b4f' fill-opacity='.5' stroke='none'/><path d='M27 73.6C30.8 69.6 36.1 70.3 38.6 75.2Q43.1 82.2 44.7 90.1C45.7 94.8 43.2 97.2 38.8 96.6L21 94.1C16.5 93.5 14.8 90.5 17.1 86.3Q20.8 79.1 27 73.6Z' stroke='#3fdcb0'/><path d='M84.8 117.9L104.5 115.8A5 5 0 0 1 105.5 125.7L85.8 127.7A5 5 0 0 1 84.8 117.9Z' stroke='#3b6bff'/><path d='M78.3 119.7Q77.4 110.9 93.8 109.2Q110.2 107.5 111.1 116.2' stroke='#ff7ab6'/><path d='M88.4 110.3L86.7 115.5M97.1 109.4L95.5 114.5' stroke='#ff7ab6'/></g><g opacity='.32'><circle cx='92.5' cy='49.5' r='2.8' fill='#ff7ab6'/><circle cx='96.9' cy='48.7' r='2.2' fill='#3fdcb0'/><circle cx='10.5' cy='50.3' r='2.4' fill='#a77bff'/><circle cx='115.5' cy='83.8' r='2.4' fill='#ff7ab6'/><circle cx='52.5' cy='117.3' r='2.2' fill='#3b6bff'/></g><g opacity='.55'><circle cx='95.3' cy='52.9' r='2.2' fill='#ffd23f'/><circle cx='73.5' cy='16.8' r='2.6' fill='#ffd23f'/></g>`
    ),
  },
  {
    key: "honeycomb",
    name: "Honeycomb",
    size: "120px 68px",
    blobs: [Y, P],
    svg: tile(
      120,
      68,
      `<path d='M0 17L10 0H30L40 17L30 34H10z' fill='#ffd23f' fill-opacity='.2'/><path d='M60 51L70 34H90L100 51L90 68H70z' fill='#ff7ab6' fill-opacity='.1'/><path d='M10 0L0 17L10 34L0 51L10 68M30 0L40 17L30 34L40 51L30 68M70 0L60 17L70 34L60 51L70 68M90 0L100 17L90 34L100 51L90 68M130 0L120 17L130 34L120 51L130 68M10 0H30M70 0H90M10 34H30M70 34H90M10 68H30M70 68H90M-20 17H0M40 17H60M100 17H120M-20 51H0M40 51H60M100 51H120' fill='none' stroke='#ffd23f' stroke-opacity='.3' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/>`
    ),
  },
  {
    key: "argyle",
    name: "Cozy argyle",
    size: "42px 112px",
    blobs: [P, B],
    svg: tile(
      42,
      112,
      `<g stroke-width='4' stroke-linejoin='round' opacity='.14'><path d='M21 6L37 28L21 50L5 28z' fill='#ff7ab6' stroke='#ff7ab6'/><path d='M21 62L37 84L21 106L5 84z' fill='#a77bff' stroke='#a77bff'/></g><path d='M-21-28L63 84M-21 28L63 140M63-28L-21 84M63 28L-21 140' fill='none' stroke='#3b6bff' stroke-opacity='.2' stroke-width='1.5' stroke-linecap='round' stroke-dasharray='2.5 4.5' stroke-dashoffset='4.75'/>`
    ),
  },
  {
    key: "clouds",
    name: "Fluffy clouds",
    size: "128px 116px",
    blobs: [B, V],
    svg: tile(
      128,
      116,
      `<g fill='none' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' opacity='.22'><path d='M19.5 25.9A5.4 5.4 0 1 1 19.6 15.1A7.2 7.2 0 0 1 30.6 8.2A8.1 8.1 0 0 1 45.5 13.4A6.3 6.3 0 1 1 46.5 25.9Z' stroke='#3b6bff'/><path d='M106 55.5A7 7 0 1 0 105.5 41.5A9.5 9.5 0 0 0 86.6 39.9A8 8 0 1 0 84 55.5Z' stroke='#a77bff'/><path d='M20.7 82.9A6 6 0 1 1 21.1 71A8.1 8.1 0 0 1 37.1 69.6A6.8 6.8 0 1 1 39.4 82.9Z' stroke='#3fdcb0'/><path d='M109 111.3A4.8 4.8 0 1 0 108.9 101.7A6.4 6.4 0 0 0 99.1 95.5A7.2 7.2 0 0 0 85.9 100.2A5.6 5.6 0 1 0 85 111.3Z' stroke='#ff7ab6'/></g><g opacity='.32'><circle cx='117.3' cy='72.5' r='2.4' fill='#3b6bff'/><circle cx='10.7' cy='101.5' r='2.4' fill='#ff7ab6'/><circle cx='53.3' cy='43.5' r='2.4' fill='#a77bff'/></g><g opacity='.55'><circle cx='74.7' cy='14.5' r='2.8' fill='#ffd23f'/></g>`
    ),
  },
  {
    key: "asanoha",
    name: "Asanoha stars",
    size: "104px 60px",
    blobs: [M, B],
    svg: tile(
      104,
      60,
      `<g fill='none' stroke='#3fdcb0' stroke-linecap='round' opacity='.22'><path d='M-37 -20L15 10M-37 40L15 10M-37 40L15 70M15 -50L15 10M15 10L67 -20M15 10L15 70M15 10L67 40M15 70L67 40M67 -20L67 40M67 -20L119 10M67 40L119 10M67 40L67 100M67 40L119 70' stroke-width='2'/><path d='M-19.67 10L15 10M32.33 -20L15 10M-2.33 -20L15 10M32.33 40L15 10M32.33 40L15 70M32.33 40L67 40M-2.33 40L15 10M-2.33 40L15 70M84.33 10L67 -20M84.33 10L67 40M84.33 10L119 10M49.67 10L67 -20M49.67 10L67 40M49.67 10L15 10M84.33 70L67 40M49.67 70L67 40M101.67 -20L119 10M101.67 40L119 10M101.67 40L119 70M101.67 40L67 40' stroke-width='1.5'/></g>`
    ),
  },
  {
    key: "cherries",
    name: "Cherry pop",
    size: "124px 130px",
    blobs: [M, P],
    svg: tile(
      124,
      130,
      `<g fill='none' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' opacity='.24'><circle cx='30' cy='22.2' r='7' stroke='#ff7ab6'/><path d='M26.2 20.5A4.5 4.5 0 0 1 29.7 18' stroke='#ff7ab6'/><path d='M31.2 15.3Q33.5 7.6 40.2 4.7' stroke='#3fdcb0'/><circle cx='84.2' cy='58.9' r='7' stroke='#ff7ab6'/><circle cx='102.6' cy='60.4' r='7' stroke='#ff7ab6'/><path d='M80.1 58.5A4.5 4.5 0 0 1 82.7 55.1' stroke='#ff7ab6'/><path d='M98.5 59.9A4.5 4.5 0 0 1 101 56.6' stroke='#ff7ab6'/><path d='M83.7 51.9Q84.8 41.7 93 35.5Q100.1 42.6 101.1 53.5' stroke='#3fdcb0'/><path d='M93 35.5Q96.1 28.5 103.9 30.4Q100.9 37.4 93 35.5Z' stroke='#3fdcb0'/><circle cx='39.8' cy='91.4' r='7' stroke='#ff7ab6'/><circle cx='21.4' cy='92.9' r='7' stroke='#ff7ab6'/><path d='M43.9 91A4.5 4.5 0 0 0 41.3 87.6' stroke='#ff7ab6'/><path d='M25.5 92.4A4.5 4.5 0 0 0 23 89.1' stroke='#ff7ab6'/><path d='M40.3 84.4Q39.2 74.2 31 68Q23.9 75.1 22.9 86' stroke='#3fdcb0'/><path d='M31 68Q27.9 61 20.1 62.9Q23.1 69.9 31 68Z' stroke='#3fdcb0'/><circle cx='93.2' cy='119.6' r='7' stroke='#ff7ab6'/><path d='M97 117.8A4.5 4.5 0 0 0 93.4 115.5' stroke='#ff7ab6'/><path d='M91.8 112.8Q89.2 105.2 82.5 102.5' stroke='#3fdcb0'/></g><g opacity='.32'><circle cx='10.3' cy='48.8' r='2.4' fill='#3b6bff'/><circle cx='113.7' cy='81.3' r='2.4' fill='#a77bff'/></g><g opacity='.55'><circle cx='72.3' cy='16.3' r='2.6' fill='#ffd23f'/><circle cx='51.7' cy='113.8' r='2.6' fill='#ffd23f'/></g>`
    ),
  },
  {
    key: "shippo",
    name: "Lucky rings",
    size: "44px",
    blobs: [B, Y],
    svg: tile(
      44,
      44,
      `<g fill='none' stroke='#3b6bff' stroke-width='2' opacity='.15'><circle cx='22' cy='22' r='22'/><circle cx='0' cy='0' r='22'/><circle cx='44' cy='0' r='22'/><circle cx='0' cy='44' r='22'/><circle cx='44' cy='44' r='22'/><circle cx='22' cy='-22' r='22'/><circle cx='22' cy='66' r='22'/><circle cx='-22' cy='22' r='22'/><circle cx='66' cy='22' r='22'/></g><g fill='#ffd23f' fill-opacity='.5'><circle cx='22' cy='22' r='2.5'/><circle cx='0' cy='0' r='2.5'/><circle cx='44' cy='0' r='2.5'/><circle cx='0' cy='44' r='2.5'/><circle cx='44' cy='44' r='2.5'/></g>`
    ),
  },
  {
    key: "terrazzo",
    name: "Terrazzo",
    size: "160px",
    blobs: [Y, B],
    svg: tile(
      160,
      160,
      `<g stroke-width='3' stroke-linejoin='round'><path d='M10 18L30 10L38 28L18 38zM118 86L130 82L134 94L122 98zM80 152L98 148L104 162L88 170zM80-8L98-12L104 2L88 10zM41 102L47 101L46 107z' fill='#ff7ab6' stroke='#ff7ab6' opacity='.18'/><path d='M58 20L80 18L72 36zM60 104L78 98L90 110L82 126L64 124zM134 146L146 144L148 154L138 156z' fill='#3b6bff' stroke='#3b6bff' opacity='.13'/><path d='M108 24L126 16L138 28L130 44L112 40zM12 98L28 94L34 106L20 114zM138 112L152 116L154 130L142 130zM60 146l5-1l-1 5z' fill='#ffd23f' stroke='#ffd23f' opacity='.38'/><path d='M146 64L168 56L174 70L152 80zM-14 64L8 56L14 70L-8 80zM88 54L104 58L92 70zM18 136L36 130L44 142L30 152zM48 36l5-1l-2 5z' fill='#3fdcb0' stroke='#3fdcb0' opacity='.22'/><path d='M36 60L54 52L66 64L58 80L40 78zM106 122L120 122L112 134zM93 34L99 33L98 39z' fill='#a77bff' stroke='#a77bff' opacity='.17'/><path d='M98 90l5-1l-1 5zM6 128l5 1l-3 4zM116 62l5 1l-3 4z' fill='#1d1b4f' stroke='#1d1b4f' stroke-width='1.5' opacity='.09'/></g>`
    ),
  },
  {
    key: "crossstitch",
    name: "Cross-stitch",
    size: "84px",
    blobs: [Y, V],
    svg: tile(
      84,
      84,
      `<g fill='none' stroke-width='1.8' stroke-linecap='round'><path d='M13 7l4 4m0-4l-4 4M25 7l4 4m0-4l-4 4M7 13l4 4m0-4l-4 4M13 13l4 4m0-4l-4 4M19 13l4 4m0-4l-4 4M25 13l4 4m0-4l-4 4M31 13l4 4m0-4l-4 4M7 19l4 4m0-4l-4 4M13 19l4 4m0-4l-4 4M19 19l4 4m0-4l-4 4M25 19l4 4m0-4l-4 4M31 19l4 4m0-4l-4 4M13 25l4 4m0-4l-4 4M19 25l4 4m0-4l-4 4M25 25l4 4m0-4l-4 4M19 31l4 4m0-4l-4 4' stroke='#ff7ab6' stroke-opacity='.32'/><path d='M55 49l4 4m0-4l-4 4M67 49l4 4m0-4l-4 4M49 55l4 4m0-4l-4 4M55 55l4 4m0-4l-4 4M61 55l4 4m0-4l-4 4M67 55l4 4m0-4l-4 4M73 55l4 4m0-4l-4 4M49 61l4 4m0-4l-4 4M55 61l4 4m0-4l-4 4M61 61l4 4m0-4l-4 4M67 61l4 4m0-4l-4 4M73 61l4 4m0-4l-4 4M55 67l4 4m0-4l-4 4M61 67l4 4m0-4l-4 4M67 67l4 4m0-4l-4 4M61 73l4 4m0-4l-4 4' stroke='#3b6bff' stroke-opacity='.22'/><path d='M61 13l4 4m0-4l-4 4M55 19l4 4m0-4l-4 4M67 19l4 4m0-4l-4 4M61 25l4 4m0-4l-4 4M19 55l4 4m0-4l-4 4M13 61l4 4m0-4l-4 4M25 61l4 4m0-4l-4 4M19 67l4 4m0-4l-4 4' stroke='#3fdcb0' stroke-opacity='.4'/></g>`
    ),
  },
  {
    key: "paws",
    name: "Kitty paws",
    size: "120px 132px",
    blobs: [V, Y],
    svg: tile(
      120,
      132,
      `<g fill='none' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' opacity='.24'><path d='M28.9 14.5C33.2 13.1 39 16 40.3 20C41.3 23 39 24.8 32.8 26.7C26.7 28.7 23.8 28.7 22.8 25.7C21.5 21.7 24.5 15.9 28.9 14.5Z' stroke='#ff7ab6'/><circle cx='18.8' cy='19.2' r='2.9' fill='#ff7ab6' stroke='none'/><circle cx='22.8' cy='10.2' r='3.1' fill='#ff7ab6' stroke='none'/><circle cx='31.2' cy='7.4' r='3.1' fill='#ff7ab6' stroke='none'/><circle cx='39.8' cy='12.4' r='2.9' fill='#ff7ab6' stroke='none'/><path d='M77.1 49.7L75.4 38.3L83.7 42.1Q88.8 40 94.2 41L101.5 35.5L102.2 47.1Q105.6 59.4 91.1 61.9Q76.4 62.4 77.1 49.7Z' stroke='#a77bff'/><path d='M87.8 55.1Q89.3 56.9 90.4 54.8Q91.8 56.6 92.9 54.6' stroke='#a77bff' stroke-width='1.8'/><circle cx='84.7' cy='51' r='1.7' fill='#a77bff' stroke='none'/><circle cx='95.1' cy='49.9' r='1.7' fill='#a77bff' stroke='none'/><path d='M30.8 80.2C34.9 81.2 38 86.4 37.1 90.1C36.4 93 33.7 93.2 27.9 91.7C22.2 90.3 19.9 88.9 20.6 86C21.5 82.3 26.7 79.2 30.8 80.2Z' stroke='#3b6bff'/><circle cx='20.6' cy='79' r='2.7' fill='#3b6bff' stroke='none'/><circle cx='28.2' cy='73.9' r='2.9' fill='#3b6bff' stroke='none'/><circle cx='36.1' cy='75.8' r='2.9' fill='#3b6bff' stroke='none'/><circle cx='40.4' cy='83.9' r='2.7' fill='#3b6bff' stroke='none'/><path d='M89.5 112.6C93.7 112 98.5 115.7 99.1 119.4C99.5 122.4 97.1 123.6 91.2 124.4C85.3 125.2 82.6 124.8 82.2 121.8C81.7 118 85.3 113.2 89.5 112.6Z' stroke='#3fdcb0'/><circle cx='79.6' cy='115.3' r='2.7' fill='#3fdcb0' stroke='none'/><circle cx='84.7' cy='107.7' r='2.9' fill='#3fdcb0' stroke='none'/><circle cx='92.8' cy='106.6' r='2.9' fill='#3fdcb0' stroke='none'/><circle cx='99.8' cy='112.5' r='2.7' fill='#3fdcb0' stroke='none'/></g><g opacity='.32'><circle cx='110' cy='82.5' r='2.4' fill='#a77bff'/><circle cx='10' cy='49.5' r='2.4' fill='#ff7ab6'/></g><g opacity='.55'><circle cx='70' cy='16.5' r='2.6' fill='#ffd23f'/><circle cx='50' cy='115.5' r='2.4' fill='#ffd23f'/></g>`
    ),
  },
  {
    key: "waves",
    name: "Groovy waves",
    size: "80px 56px",
    blobs: [V, P],
    svg: tile(
      80,
      56,
      `<g fill='none' stroke-width='8' stroke-linecap='round'><path d='M-40 14q20-14 40 0t40 0t40 0t40 0' stroke='#a77bff' stroke-opacity='.13'/><path d='M-40 42q20-14 40 0t40 0t40 0t40 0' stroke='#ffd23f' stroke-opacity='.3'/></g>`
    ),
  },
  {
    key: "hearts",
    name: "Heart confetti",
    size: "180px",
    blobs: [P, Y],
    svg: tile(
      180,
      180,
      `<g fill='#ff7ab6' fill-opacity='.3'><path transform='translate(48 40) rotate(-14) scale(1.5)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(132 62) rotate(18) scale(0.75)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(96 120) rotate(-28) scale(1.0)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(28 138) rotate(24) scale(0.8)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(156 150) rotate(-8) scale(1.1)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/></g><g fill='#a77bff' fill-opacity='.26'><circle cx='14' cy='18' r='3.5'/><circle cx='84' cy='26' r='4'/><circle cx='118' cy='14' r='2.5'/><circle cx='166' cy='30' r='3.5'/><circle cx='70' cy='70' r='3'/><circle cx='20' cy='84' r='4.5'/><circle cx='150' cy='96' r='4'/><circle cx='112' cy='88' r='2.5'/><circle cx='58' cy='108' r='3.5'/><circle cx='134' cy='124' r='3'/><circle cx='72' cy='152' r='4'/><circle cx='110' cy='168' r='3'/><circle cx='8' cy='168' r='2.5'/><circle cx='170' cy='112' r='2.5'/></g><g fill='#3fdcb0' fill-opacity='.38'><circle cx='100' cy='48' r='4.5'/><circle cx='38' cy='70' r='3'/><circle cx='160' cy='70' r='3.5'/><circle cx='12' cy='116' r='3.5'/><circle cx='124' cy='150' r='4.5'/><circle cx='52' cy='170' r='3'/><circle cx='86' cy='96' r='2.5'/></g><g fill='#ffd23f' fill-opacity='.55'><circle cx='64' cy='12' r='3'/><circle cx='146' cy='10' r='2.5'/><circle cx='30' cy='104' r='3'/><circle cx='176' cy='84' r='3'/><circle cx='90' cy='140' r='2.5'/><circle cx='140' cy='176' r='3'/><circle cx='4' cy='48' r='3'/></g><g fill='#3b6bff' fill-opacity='.2'><circle cx='116' cy='36' r='2'/><circle cx='46' cy='90' r='2'/><circle cx='172' cy='128' r='2'/><circle cx='22' cy='56' r='2'/></g>`
    ),
  },
  {
    key: "brush",
    name: "Brush stripes",
    retired: true,
    size: "200px 128px",
    blobs: [P, B],
    svg: tile(
      200,
      128,
      `<path d='M-25 10.5C-16.7 10.6 -8.3 10.6 0 10.7C8.3 10.8 16.7 10.7 25 10.9C33.3 11.1 41.7 12 50 11.7C58.3 11.4 66.7 9.2 75 9.3C83.3 9.4 91.7 12.2 100 12.3C108.3 12.3 116.7 9.8 125 9.5C133.3 9.1 141.7 10.2 150 10.4C158.3 10.5 166.7 10.5 175 10.5C183.3 10.6 191.7 10.6 200 10.7C208.3 10.8 216.7 10.7 225 10.9L225 21.8C216.7 21.9 208.3 20.1 200 19.7C191.7 19.4 183.3 19.4 175 19.6C166.7 19.7 158.3 20.3 150 20.6C141.7 20.8 133.3 20.8 125 21C116.7 21.2 108.3 22.2 100 21.9C91.7 21.6 83.3 19.7 75 19.4C66.7 19 58.3 19.3 50 19.7C41.7 20.1 33.3 21.8 25 21.8C16.7 21.9 8.3 20.1 0 19.7C-8.3 19.4 -16.7 19.4 -25 19.6Z' fill='#ff7ab6' fill-opacity='0.2'/><path d='M0 24.2 H200' stroke='#ff7ab6' stroke-opacity='0.2' stroke-width='1.3' stroke-linecap='round' stroke-dasharray='34 16 66 30 28 26' stroke-dashoffset='36' fill='none'/><path d='M-25 43C-16.7 43.2 -8.3 44.3 0 44.6C8.3 44.8 16.7 44.4 25 44.4C33.3 44.3 41.7 43.9 50 44.2C58.3 44.5 66.7 46.3 75 46C83.3 45.7 91.7 42.7 100 42.4C108.3 42.1 116.7 44.3 125 44.5C133.3 44.7 141.7 43.9 150 43.7C158.3 43.4 166.7 42.9 175 43C183.3 43.2 191.7 44.3 200 44.6C208.3 44.8 216.7 44.4 225 44.4L225 50.9C216.7 51 208.3 51.4 200 51.6C191.7 51.9 183.3 52.4 175 52.3C166.7 52.2 158.3 51.2 150 51.1C141.7 51 133.3 51.8 125 51.7C116.7 51.6 108.3 50.3 100 50.4C91.7 50.4 83.3 51.8 75 51.9C66.7 52 58.3 51.1 50 50.9C41.7 50.7 33.3 50.7 25 50.9C16.7 51 8.3 51.4 0 51.6C-8.3 51.9 -16.7 52.4 -25 52.3Z' fill='#3b6bff' fill-opacity='0.14'/><path d='M0 54.5 H200' stroke='#3b6bff' stroke-opacity='0.14' stroke-width='1.3' stroke-linecap='round' stroke-dasharray='34 16 66 30 28 26' stroke-dashoffset='114' fill='none'/><path d='M-25 74.3C-16.7 74.1 -8.3 74.1 0 74.7C8.3 75.3 16.7 77.8 25 77.9C33.3 78 41.7 75.7 50 75.3C58.3 74.8 66.7 74.9 75 75.2C83.3 75.4 91.7 77.1 100 76.8C108.3 76.5 116.7 73.4 125 73.3C133.3 73.1 141.7 75.8 150 75.9C158.3 76.1 166.7 74.5 175 74.3C183.3 74.1 191.7 74.1 200 74.7C208.3 75.3 216.7 77.8 225 77.9L225 86.2C216.7 86.1 208.3 85.1 200 85C191.7 84.8 183.3 85.1 175 85.1C166.7 85.2 158.3 85.5 150 85.3C141.7 85.1 133.3 84.3 125 84.1C116.7 83.9 108.3 84 100 84.3C91.7 84.5 83.3 85.5 75 85.7C66.7 86 58.3 85.7 50 85.8C41.7 85.9 33.3 86.4 25 86.2C16.7 86.1 8.3 85.1 0 85C-8.3 84.8 -16.7 85.1 -25 85.1Z' fill='#ff7ab6' fill-opacity='0.2'/><path d='M0 87.7 H200' stroke='#ff7ab6' stroke-opacity='0.2' stroke-width='1.3' stroke-linecap='round' stroke-dasharray='34 16 66 30 28 26' stroke-dashoffset='174' fill='none'/><path d='M-25 108.1C-16.7 108.6 -8.3 109.6 0 109.7C8.3 109.8 16.7 108.8 25 108.7C33.3 108.5 41.7 108.7 50 108.9C58.3 109.1 66.7 110.4 75 109.9C83.3 109.5 91.7 106.6 100 106.3C108.3 106 116.7 108.1 125 108.2C133.3 108.3 141.7 107 150 107C158.3 107 166.7 107.7 175 108.1C183.3 108.6 191.7 109.6 200 109.7C208.3 109.8 216.7 108.8 225 108.7L225 117.3C216.7 117.2 208.3 114.3 200 114.1C191.7 113.9 183.3 116.3 175 116.2C166.7 116.2 158.3 113.7 150 113.7C141.7 113.8 133.3 116.4 125 116.6C116.7 116.7 108.3 114.8 100 114.6C91.7 114.4 83.3 115.4 75 115.5C66.7 115.6 58.3 114.7 50 115C41.7 115.3 33.3 117.5 25 117.3C16.7 117.2 8.3 114.3 0 114.1C-8.3 113.9 -16.7 116.3 -25 116.2Z' fill='#3b6bff' fill-opacity='0.14'/><path d='M0 118.7 H200' stroke='#3b6bff' stroke-opacity='0.14' stroke-width='1.3' stroke-linecap='round' stroke-dasharray='34 16 66 30 28 26' stroke-dashoffset='59' fill='none'/>`
    ),
  },
  {
    key: "pencil",
    name: "Wobbly lines",
    retired: true,
    size: "150px 200px",
    blobs: [V, M],
    svg: tile(
      150,
      200,
      `<g fill='none' stroke-linecap='round' stroke-width='2.2'><path d='M14.2 -25C14.4 -16.7 10.6 -8.3 10.3 0C10 8.3 12.1 16.7 12.3 25C12.4 33.3 11.1 41.7 11.2 50C11.2 58.3 12.4 66.7 12.7 75C12.9 83.3 13.4 91.7 12.8 100C12.2 108.3 9.9 116.7 9.2 125C8.6 133.3 8.1 141.7 8.9 150C9.7 158.3 13.9 166.7 14.2 175C14.4 183.3 10.6 191.7 10.3 200C10 208.3 12.1 216.7 12.3 225' stroke='#ff7ab6' stroke-opacity='0.3'/><path d='M31.8 -25C31.4 -16.7 32.4 -8.3 32.5 0C32.5 8.3 31.5 16.7 32.3 25C33.1 33.3 36.9 41.7 37.2 50C37.4 58.3 34 66.7 33.8 75C33.6 83.3 36.1 91.7 36.2 100C36.2 108.3 34.1 116.7 33.8 125C33.6 133.3 35.2 141.7 34.9 150C34.5 158.3 32.2 166.7 31.8 175C31.4 183.3 32.4 191.7 32.5 200C32.5 208.3 31.5 216.7 32.3 225' stroke='#a77bff' stroke-opacity='0.3'/><path d='M62.6 -25C62.5 -16.7 62.6 -8.3 62.9 0C63.2 8.3 64.5 16.7 64.4 25C64.2 33.3 62.3 41.7 62.1 50C62 58.3 63.4 66.7 63.5 75C63.7 83.3 63.8 91.7 63.1 100C62.4 108.3 59.1 116.7 59.2 125C59.3 133.3 63.1 141.7 63.7 150C64.2 158.3 62.7 166.7 62.6 175C62.5 183.3 62.6 191.7 62.9 200C63.2 208.3 64.5 216.7 64.4 225' stroke='#3fdcb0' stroke-opacity='0.42'/><path d='M86.7 -25C86.3 -16.7 83.7 -8.3 82.7 0C81.8 8.3 80.4 16.7 81 25C81.6 33.3 85.9 41.7 86.3 50C86.8 58.3 84 66.7 83.8 75C83.7 83.3 85 91.7 85.4 100C85.8 108.3 86.4 116.7 86.4 125C86.4 133.3 85.3 141.7 85.4 150C85.4 158.3 87.1 166.7 86.7 175C86.3 183.3 83.7 191.7 82.7 200C81.8 208.3 80.4 216.7 81 225' stroke='#ff7ab6' stroke-opacity='0.3'/><path d='M110.2 -25C110.5 -16.7 110.7 -8.3 111.3 0C112 8.3 113.9 16.7 113.9 25C114 33.3 111.5 41.7 111.6 50C111.8 58.3 114.3 66.7 114.8 75C115.3 83.3 115.3 91.7 114.4 100C113.5 108.3 110.2 116.7 109.4 125C108.6 133.3 109.5 141.7 109.7 150C109.8 158.3 109.9 166.7 110.2 175C110.5 183.3 110.7 191.7 111.3 200C112 208.3 113.9 216.7 113.9 225' stroke='#3fdcb0' stroke-opacity='0.42'/><path d='M136.5 -25C137.2 -16.7 139.1 -8.3 139 0C138.8 8.3 136 16.7 135.6 25C135.2 33.3 137 41.7 136.8 50C136.7 58.3 134.9 66.7 134.7 75C134.6 83.3 136 91.7 136 100C136.1 108.3 135.4 116.7 135.3 125C135.1 133.3 134.8 141.7 135 150C135.3 158.3 135.9 166.7 136.5 175C137.2 183.3 139.1 191.7 139 200C138.8 208.3 136 216.7 135.6 225' stroke='#a77bff' stroke-opacity='0.3'/></g>`
    ),
  },
  {
    key: "candylines",
    name: "Candy lines",
    retired: true,
    size: "176px 220px",
    blobs: [Y, P],
    svg: tile(
      176,
      220,
      `<g fill='none' stroke-linecap='round' stroke-width='2.6'><path d='M22.9 -22C22.8 -14.7 22 -7.3 21.8 0C21.7 7.3 21.9 14.7 22.2 22C22.4 29.3 23.4 36.7 23.4 44C23.3 51.3 22.1 58.7 21.9 66C21.7 73.3 22 80.7 22 88C22.1 95.3 22.5 102.7 22.3 110C22.1 117.3 21 124.7 21 132C21 139.3 21.8 146.7 22 154C22.3 161.3 22.3 168.7 22.4 176C22.6 183.3 23 190.7 22.9 198C22.8 205.3 22 212.7 21.8 220C21.7 227.3 21.9 234.7 22.2 242' stroke='#ff7ab6' stroke-opacity='0.34'/><path d='M68.4 -22C68.1 -14.7 66.9 -7.3 66.7 0C66.5 7.3 67.4 14.7 67.4 22C67.4 29.3 66.4 36.7 66.7 44C67 51.3 68.7 58.7 69 66C69.3 73.3 69 80.7 68.6 88C68.2 95.3 66.4 102.7 66.5 110C66.7 117.3 69.1 124.7 69.5 132C70 139.3 69.7 146.7 69.5 154C69.3 161.3 68.7 168.7 68.5 176C68.3 183.3 68.7 190.7 68.4 198C68.1 205.3 66.9 212.7 66.7 220C66.5 227.3 67.4 234.7 67.4 242' stroke='#ffd23f' stroke-opacity='0.62'/><path d='M109.1 -22C108.9 -14.7 107.3 -7.3 106.9 0C106.5 7.3 106.3 14.7 106.4 22C106.6 29.3 108.1 36.7 108.1 44C108.1 51.3 106.8 58.7 106.6 66C106.4 73.3 106.9 80.7 107 88C107.1 95.3 107.3 102.7 107.2 110C107.1 117.3 106.4 124.7 106.5 132C106.6 139.3 107.7 146.7 107.9 154C108.1 161.3 107.6 168.7 107.8 176C108 183.3 109.2 190.7 109.1 198C108.9 205.3 107.3 212.7 106.9 220C106.5 227.3 106.3 234.7 106.4 242' stroke='#a77bff' stroke-opacity='0.34'/><path d='M154.7 -22C154.5 -14.7 154.1 -7.3 154.1 0C154 7.3 154.5 14.7 154.4 22C154.4 29.3 154 36.7 154 44C154 51.3 154.5 58.7 154.5 66C154.5 73.3 154.1 80.7 153.9 88C153.7 95.3 153 102.7 153.3 110C153.6 117.3 155.2 124.7 155.6 132C156 139.3 155.7 146.7 155.6 154C155.5 161.3 155.2 168.7 155.1 176C154.9 183.3 154.8 190.7 154.7 198C154.5 205.3 154.1 212.7 154.1 220C154 227.3 154.5 234.7 154.4 242' stroke='#3fdcb0' stroke-opacity='0.46'/></g>`
    ),
  },
  {
    key: "jimmies",
    name: "Jimmies",
    size: "160px",
    blobs: [Y, V],
    svg: tile(
      160,
      160,
      `<g fill='none' stroke-linecap='round' stroke-width='3.2'><path d='M26.5 106L26.3 114.7' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M135.3 25.2L145.1 26.8' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M64.4 44.9L60.1 54.2' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M99.8 117.1L100.7 125.6' stroke='#a77bff' stroke-opacity='0.4'/><path d='M119.1 69.4L118.5 78.5' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M38.5 5.2L29.9 7.8' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M17.4 62.1L9.1 67.7' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M74.3 4.9L80.2 12.7' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M60.4 120.8L69.3 122.7' stroke='#a77bff' stroke-opacity='0.4'/><path d='M145.2 120L140.1 126.8' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M101.1 38.5L99.2 48.9' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M96.8 88.1L86.6 89.3' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M60.3 83.6L52.5 88.3' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M106.7 149L110.6 157.2' stroke='#a77bff' stroke-opacity='0.4'/><path d='M133.3 95.3L141.7 97' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M150.6 153.3L159.4 154.9' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M-9.4 153.3L-0.6 154.9' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M150.6 -6.7L159.4 -5.1' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M-9.4 -6.7L-0.6 -5.1' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M112.8 17.1L117.5 25.1' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M2.6 34.3L3.2 44.7' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M162.6 34.3L163.2 44.7' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M1.4 100.8L5.3 109.5' stroke='#a77bff' stroke-opacity='0.4'/><path d='M161.4 100.8L165.3 109.5' stroke='#a77bff' stroke-opacity='0.4'/><path d='M24.5 141.1L16.8 146.6' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M132.3 44.1L125.3 52.3' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M27.4 37.8L18.8 40.6' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M44.5 54L35.2 59.1' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M41.9 140.9L48.4 146.8' stroke='#a77bff' stroke-opacity='0.4'/><path d='M34.4 82.1L27.8 89.6' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M144.8 67.2L153.4 73.7' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M81.8 131L83 141.7' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M132.8 141.5L132.8 151.7' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M41.4 24.7L50.8 29' stroke='#a77bff' stroke-opacity='0.4'/><path d='M157 9.1L158.6 17.9' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M-3 9.1L-1.4 17.9' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M70.9 25L73.2 34.7' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M97.2 59.3L87.6 62.8' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M104.8 10.8L94.9 13.4' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M127.2 2.8L130.6 11' stroke='#a77bff' stroke-opacity='0.4'/><path d='M129.1 109.5L120.1 112.2' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M11.5 126.8L1.6 128.1' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M171.5 126.8L161.6 128.1' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M111.1 99.2L103.3 105.2' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M151.1 88.8L158.8 94.4' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M-8.9 88.8L-1.2 94.4' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M77.8 69.7L73.5 77.2' stroke='#a77bff' stroke-opacity='0.4'/><path d='M59 8.6L63.1 18.1' stroke='#ffd23f' stroke-opacity='0.68'/><path d='M56.3 137.5L62.8 142.8' stroke='#ff7ab6' stroke-opacity='0.42'/><path d='M71.2 86.5L78.4 92.6' stroke='#3b6bff' stroke-opacity='0.26'/><path d='M40.1 122L46.2 129.5' stroke='#3fdcb0' stroke-opacity='0.48'/><path d='M110.7 49.4L116.9 56.5' stroke='#a77bff' stroke-opacity='0.4'/></g>`
    ),
  },
  {
    key: "minihearts",
    name: "Little hearts",
    size: "168px",
    blobs: [B, P],
    svg: tile(
      168,
      168,
      `<g fill='#ff7ab6' fill-opacity='.27'><path transform='translate(104.6 124.6) rotate(18.9) scale(0.69)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(15.3 57.2) rotate(17) scale(0.71)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(25.1 141.9) rotate(10) scale(0.58)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(91.6 57) rotate(148.2) scale(0.59)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(150.1 0.2) rotate(-10) scale(0.67)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(150.1 168.2) rotate(-10) scale(0.67)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(149.2 91.7) rotate(199.4) scale(0.62)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(104.6 7.3) rotate(3.5) scale(0.58)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(104.6 175.3) rotate(3.5) scale(0.58)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(64.8 22.9) rotate(7.8) scale(0.67)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(63.3 105) rotate(-0.4) scale(0.71)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(137.7 52.6) rotate(-34.2) scale(0.68)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(157.7 133.5) rotate(163.7) scale(0.64)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(-10.3 133.5) rotate(163.7) scale(0.64)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/><path transform='translate(52.4 64.3) rotate(-11.7) scale(0.71)' d='M0 8.5C-4.5 5-10 1-10.5-4.5C-11-9.5-5-12 -0.5-7.5C4-12.5 11.5-10.5 11-5C10.5 0.5 5 4.5 0 8.5Z'/><path transform='translate(26.3 15.6) rotate(-9.4) scale(0.64)' d='M0 8C-5 4-11 0-11-5.5C-11-10-5.5-12 0-7C5.5-12 11-10 11-5.5C11 0 5 4 0 8Z'/></g>`
    ),
  },
  {
    key: "dabs",
    name: "Paint dabs",
    size: "220px",
    blobs: [P, B],
    svg: tile(
      220,
      220,
      `<g stroke='#ff7ab6' stroke-linecap='round' opacity='0.17' transform='translate(52 44) rotate(-34)'><path d='M-42.4 -12.1L46.5 -13.4' stroke-width='9.4'/><path d='M-45.3 -6.8L43.9 -6.9' stroke-width='8.5'/><path d='M-45.9 1L36.5 0.6' stroke-width='9.6'/><path d='M-49.1 9L39.2 7.1' stroke-width='9.5'/><path d='M-48 14.4L34.7 14.1' stroke-width='9.9'/></g><g stroke='#ff7ab6' stroke-linecap='round' opacity='0.17' transform='translate(52 264) rotate(-34)'><path d='M-42.4 -12.1L46.5 -13.4' stroke-width='9.4'/><path d='M-45.3 -6.8L43.9 -6.9' stroke-width='8.5'/><path d='M-45.9 1L36.5 0.6' stroke-width='9.6'/><path d='M-49.1 9L39.2 7.1' stroke-width='9.5'/><path d='M-48 14.4L34.7 14.1' stroke-width='9.9'/></g><g stroke='#ff7ab6' stroke-linecap='round' opacity='0.17' transform='translate(272 44) rotate(-34)'><path d='M-42.4 -12.1L46.5 -13.4' stroke-width='9.4'/><path d='M-45.3 -6.8L43.9 -6.9' stroke-width='8.5'/><path d='M-45.9 1L36.5 0.6' stroke-width='9.6'/><path d='M-49.1 9L39.2 7.1' stroke-width='9.5'/><path d='M-48 14.4L34.7 14.1' stroke-width='9.9'/></g><g stroke='#ff7ab6' stroke-linecap='round' opacity='0.17' transform='translate(272 264) rotate(-34)'><path d='M-42.4 -12.1L46.5 -13.4' stroke-width='9.4'/><path d='M-45.3 -6.8L43.9 -6.9' stroke-width='8.5'/><path d='M-45.9 1L36.5 0.6' stroke-width='9.6'/><path d='M-49.1 9L39.2 7.1' stroke-width='9.5'/><path d='M-48 14.4L34.7 14.1' stroke-width='9.9'/></g><g stroke='#3b6bff' stroke-linecap='round' opacity='0.12' transform='translate(160 70) rotate(38)'><path d='M-37.4 -12.2L41.7 -12.7' stroke-width='8.3'/><path d='M-35.3 -6.1L48.9 -5' stroke-width='7.9'/><path d='M-47 1.8L46.6 0' stroke-width='8.4'/><path d='M-34.8 7.7L45.5 8.9' stroke-width='8.4'/><path d='M-46.4 13.5L47.6 14.1' stroke-width='9.9'/></g><g stroke='#3b6bff' stroke-linecap='round' opacity='0.12' transform='translate(-60 70) rotate(38)'><path d='M-37.4 -12.2L41.7 -12.7' stroke-width='8.3'/><path d='M-35.3 -6.1L48.9 -5' stroke-width='7.9'/><path d='M-47 1.8L46.6 0' stroke-width='8.4'/><path d='M-34.8 7.7L45.5 8.9' stroke-width='8.4'/><path d='M-46.4 13.5L47.6 14.1' stroke-width='9.9'/></g><g stroke='#ffd23f' stroke-linecap='round' opacity='0.26' transform='translate(88 132) rotate(-30)'><path d='M-42.4 -13.5L38.5 -12.4' stroke-width='8'/><path d='M-43.7 -5.9L42 -6.7' stroke-width='9.1'/><path d='M-48.7 0.7L37.7 1.8' stroke-width='8.9'/><path d='M-38.4 8.5L32.2 7.7' stroke-width='8.7'/><path d='M-38.4 14.5L43.4 13.6' stroke-width='7.7'/></g><g stroke='#3fdcb0' stroke-linecap='round' opacity='0.17' transform='translate(188 172) rotate(-36)'><path d='M-49.8 -14L48.4 -12.9' stroke-width='9.2'/><path d='M-40.4 -5.1L45.2 -5.8' stroke-width='8.5'/><path d='M-37.1 0.3L36.5 0.2' stroke-width='8'/><path d='M-47.5 8.6L41.7 8.8' stroke-width='9.5'/><path d='M-34.8 13.2L48.7 14.5' stroke-width='9.6'/></g><g stroke='#3fdcb0' stroke-linecap='round' opacity='0.17' transform='translate(188 -48) rotate(-36)'><path d='M-49.8 -14L48.4 -12.9' stroke-width='9.2'/><path d='M-40.4 -5.1L45.2 -5.8' stroke-width='8.5'/><path d='M-37.1 0.3L36.5 0.2' stroke-width='8'/><path d='M-47.5 8.6L41.7 8.8' stroke-width='9.5'/><path d='M-34.8 13.2L48.7 14.5' stroke-width='9.6'/></g><g stroke='#3fdcb0' stroke-linecap='round' opacity='0.17' transform='translate(-32 172) rotate(-36)'><path d='M-49.8 -14L48.4 -12.9' stroke-width='9.2'/><path d='M-40.4 -5.1L45.2 -5.8' stroke-width='8.5'/><path d='M-37.1 0.3L36.5 0.2' stroke-width='8'/><path d='M-47.5 8.6L41.7 8.8' stroke-width='9.5'/><path d='M-34.8 13.2L48.7 14.5' stroke-width='9.6'/></g><g stroke='#3fdcb0' stroke-linecap='round' opacity='0.17' transform='translate(-32 -48) rotate(-36)'><path d='M-49.8 -14L48.4 -12.9' stroke-width='9.2'/><path d='M-40.4 -5.1L45.2 -5.8' stroke-width='8.5'/><path d='M-37.1 0.3L36.5 0.2' stroke-width='8'/><path d='M-47.5 8.6L41.7 8.8' stroke-width='9.5'/><path d='M-34.8 13.2L48.7 14.5' stroke-width='9.6'/></g><g stroke='#ff7ab6' stroke-linecap='round' opacity='0.15' transform='translate(30 190) rotate(40)'><path d='M-44.5 -13.8L39.3 -13.8' stroke-width='9.1'/><path d='M-37.9 -6.5L41.6 -6.7' stroke-width='8.2'/><path d='M-45.6 0.8L40.8 1' stroke-width='8.9'/><path d='M-42.3 8.9L40 8.5' stroke-width='8.1'/><path d='M-39.1 13.7L35.4 13.1' stroke-width='9.4'/></g><g stroke='#ff7ab6' stroke-linecap='round' opacity='0.15' transform='translate(30 -30) rotate(40)'><path d='M-44.5 -13.8L39.3 -13.8' stroke-width='9.1'/><path d='M-37.9 -6.5L41.6 -6.7' stroke-width='8.2'/><path d='M-45.6 0.8L40.8 1' stroke-width='8.9'/><path d='M-42.3 8.9L40 8.5' stroke-width='8.1'/><path d='M-39.1 13.7L35.4 13.1' stroke-width='9.4'/></g><g stroke='#ff7ab6' stroke-linecap='round' opacity='0.15' transform='translate(250 190) rotate(40)'><path d='M-44.5 -13.8L39.3 -13.8' stroke-width='9.1'/><path d='M-37.9 -6.5L41.6 -6.7' stroke-width='8.2'/><path d='M-45.6 0.8L40.8 1' stroke-width='8.9'/><path d='M-42.3 8.9L40 8.5' stroke-width='8.1'/><path d='M-39.1 13.7L35.4 13.1' stroke-width='9.4'/></g><g stroke='#ff7ab6' stroke-linecap='round' opacity='0.15' transform='translate(250 -30) rotate(40)'><path d='M-44.5 -13.8L39.3 -13.8' stroke-width='9.1'/><path d='M-37.9 -6.5L41.6 -6.7' stroke-width='8.2'/><path d='M-45.6 0.8L40.8 1' stroke-width='8.9'/><path d='M-42.3 8.9L40 8.5' stroke-width='8.1'/><path d='M-39.1 13.7L35.4 13.1' stroke-width='9.4'/></g>`
    ),
  },
  {
    key: "softcheck",
    name: "Soft check",
    size: "144px",
    blobs: [P, M],
    svg: tile(
      144,
      144,
      `<path d='M15.7 -24C16.1 -16 16.7 -8 16.8 0C16.8 8 16.2 16 16.1 24C15.9 32 15.8 40 15.9 48C16.1 56 17.1 64 16.9 72C16.6 80 14.8 88 14.6 96C14.4 104 15.4 112 15.7 120C16.1 128 16.7 136 16.8 144C16.8 152 16.2 160 16.1 168L30.2 168C30.4 160 33 152 33 144C33 136 31 128 30.4 120C29.8 112 29.6 104 29.7 96C29.8 88 30.8 80 31.2 72C31.6 64 32.2 56 32.1 48C31.9 40 30.1 32 30.2 24C30.4 16 33 8 33 0C33 -8 31 -16 30.4 -24Z' fill='#ff7ab6' fill-opacity='0.11'/><path d='M65.9 -24C66 -16 64.2 -8 64.1 0C63.9 8 65.1 16 65.1 24C65.2 32 64.2 40 64.3 48C64.5 56 66 64 65.9 72C65.8 80 63.6 88 63.6 96C63.6 104 65.9 112 65.9 120C66 128 64.2 136 64.1 144C63.9 152 65.1 160 65.1 168L78.3 168C78.1 160 77.8 152 77.9 144C78.1 136 79 128 79.1 120C79.2 112 78.4 104 78.7 96C79 88 80.6 80 80.7 72C80.9 64 80 56 79.6 48C79.2 40 78.6 32 78.3 24C78.1 16 77.8 8 77.9 0C78.1 -8 79 -16 79.1 -24Z' fill='#3fdcb0' fill-opacity='0.13'/><path d='M111.5 -24C111.9 -16 113.2 -8 113 0C112.8 8 110.6 16 110.3 24C110 32 111 40 111.3 48C111.7 56 112.7 64 112.6 72C112.4 80 110.4 88 110.2 96C110 104 111 112 111.5 120C111.9 128 113.2 136 113 144C112.8 152 110.6 160 110.3 168L125.4 168C125.6 160 127.7 152 128.1 144C128.4 136 128 128 127.8 120C127.6 112 127 104 126.8 96C126.6 88 126.5 80 126.5 72C126.5 64 127.1 56 127 48C126.8 40 125.3 32 125.4 24C125.6 16 127.7 8 128.1 0C128.4 -8 128 -16 127.8 -24Z' fill='#ffd23f' fill-opacity='0.2'/><path d='M-24 14.6C-16 14.4 -8 16.3 0 16.7C8 17.1 16 17.1 24 17C32 16.8 40 15.8 48 15.8C56 15.9 64 16.8 72 17.2C80 17.5 88 18.3 96 17.9C104 17.4 112 14.8 120 14.6C128 14.4 136 16.3 144 16.7C152 17.1 160 17.1 168 17L168 29.9C160 30 152 31.8 144 31.9C136 32.1 128 31 120 30.9C112 30.8 104 30.8 96 31.2C88 31.7 80 33.7 72 33.8C64 33.8 56 32 48 31.4C40 30.7 32 29.8 24 29.9C16 30 8 31.8 0 31.9C-8 32.1 -16 31 -24 30.9Z' fill='#3fdcb0' fill-opacity='0.13'/><path d='M-24 63.2C-16 63.5 -8 64.8 0 65.2C8 65.7 16 65.9 24 65.7C32 65.4 40 63.6 48 63.6C56 63.6 64 65.8 72 65.8C80 65.7 88 63.8 96 63.4C104 62.9 112 62.9 120 63.2C128 63.5 136 64.8 144 65.2C152 65.7 160 65.9 168 65.7L168 79.7C160 79.7 152 80.2 144 80.2C136 80.1 128 79.7 120 79.6C112 79.4 104 79.3 96 79.2C88 79.2 80 79.2 72 79.3C64 79.4 56 80 48 80.1C40 80.1 32 79.6 24 79.7C16 79.7 8 80.2 0 80.2C-8 80.1 -16 79.7 -24 79.6Z' fill='#ffd23f' fill-opacity='0.2'/><path d='M-24 111.9C-16 112.1 -8 113.9 0 113.9C8 114 16 112.2 24 112C32 111.8 40 112.9 48 112.7C56 112.6 64 111.2 72 111.2C80 111.2 88 112.7 96 112.8C104 112.9 112 111.7 120 111.9C128 112.1 136 113.9 144 113.9C152 114 160 112.2 168 112L168 127.9C160 127.9 152 126.9 144 127C136 127 128 128.2 120 128.1C112 128.1 104 126.7 96 126.6C88 126.6 80 127.8 72 127.8C64 127.8 56 126.8 48 126.8C40 126.8 32 127.8 24 127.9C16 127.9 8 126.9 0 127C-8 127 -16 128.2 -24 128.1Z' fill='#ff7ab6' fill-opacity='0.11'/>`
    ),
  },
  {
    key: "rainbowgrid",
    name: "Rainbow grid",
    size: "180px",
    blobs: [B, Y],
    svg: tile(
      180,
      180,
      `<g fill='none' stroke-linecap='round' stroke-width='3'><path d='M17.3 -30C17.3 -20 17.2 -10 17.4 0C17.6 10 18.3 20 18.5 30C18.7 40 18.4 50 18.5 60C18.5 70 19.1 80 18.9 90C18.7 100 17.5 110 17.2 120C16.9 130 17.3 140 17.3 150C17.3 160 17.2 170 17.4 180C17.6 190 18.3 200 18.5 210' stroke='#ff7ab6' stroke-opacity='0.3'/><path d='M53.3 -30C53.1 -20 53.1 -10 53.1 0C53.1 10 53 20 53.3 30C53.5 40 54.6 50 54.6 60C54.6 70 53.1 80 53 90C53 100 54 110 54.1 120C54.1 130 53.4 140 53.3 150C53.1 160 53.1 170 53.1 180C53.1 190 53 200 53.3 210' stroke='#3b6bff' stroke-opacity='0.2'/><path d='M89.4 -30C89.5 -20 89.4 -10 89.5 0C89.5 10 89.6 20 89.8 30C90.1 40 90.8 50 90.9 60C91 70 90.6 80 90.3 90C89.9 100 88.9 110 88.7 120C88.6 130 89.3 140 89.4 150C89.5 160 89.4 170 89.5 180C89.5 190 89.6 200 89.8 210' stroke='#ffd23f' stroke-opacity='0.55'/><path d='M126.6 -30C126.3 -20 125 -10 125.1 0C125.1 10 126.7 20 127 30C127.3 40 126.8 50 126.8 60C126.8 70 126.8 80 126.8 90C126.8 100 126.9 110 126.8 120C126.8 130 126.9 140 126.6 150C126.3 160 125 170 125.1 180C125.1 190 126.7 200 127 210' stroke='#a77bff' stroke-opacity='0.3'/><path d='M162.7 -30C162.9 -20 163.2 -10 163.2 0C163.2 10 163.1 20 162.8 30C162.5 40 161.3 50 161.4 60C161.4 70 162.8 80 162.9 90C163 100 162 110 162 120C161.9 130 162.5 140 162.7 150C162.9 160 163.2 170 163.2 180C163.2 190 163.1 200 162.8 210' stroke='#3fdcb0' stroke-opacity='0.4'/><path d='M-30 17C-20 17.1 -10 18 0 18.2C10 18.3 20 17.9 30 17.8C40 17.7 50 17.6 60 17.6C70 17.6 80 17.8 90 17.8C100 17.8 110 17.7 120 17.5C130 17.4 140 16.9 150 17C160 17.1 170 18 180 18.2C190 18.3 200 17.9 210 17.8' stroke='#a77bff' stroke-opacity='0.3'/><path d='M-30 54.6C-20 54.8 -10 54.8 0 54.8C10 54.9 20 54.7 30 54.8C40 54.8 50 55.3 60 55.3C70 55.2 80 54.7 90 54.5C100 54.3 110 54.1 120 54.1C130 54.2 140 54.5 150 54.6C160 54.8 170 54.8 180 54.8C190 54.9 200 54.7 210 54.8' stroke='#3fdcb0' stroke-opacity='0.4'/><path d='M-30 90.1C-20 90 -10 89 0 89.1C10 89.1 20 90.3 30 90.5C40 90.6 50 90.1 60 89.9C70 89.6 80 89.3 90 89.2C100 89.1 110 89.1 120 89.2C130 89.4 140 90.1 150 90.1C160 90 170 89 180 89.1C190 89.1 200 90.3 210 90.5' stroke='#ff7ab6' stroke-opacity='0.3'/><path d='M-30 126C-20 126 -10 125.4 0 125.4C10 125.3 20 125.7 30 125.9C40 126 50 126.3 60 126.3C70 126.2 80 125.9 90 125.7C100 125.5 110 125 120 125C130 125.1 140 125.9 150 126C160 126 170 125.4 180 125.4C190 125.3 200 125.7 210 125.9' stroke='#ffd23f' stroke-opacity='0.55'/><path d='M-30 162.4C-20 162.5 -10 161.5 0 161.3C10 161.1 20 161.3 30 161.3C40 161.3 50 161.1 60 161.2C70 161.3 80 161.7 90 161.7C100 161.6 110 160.8 120 160.9C130 161 140 162.3 150 162.4C160 162.5 170 161.5 180 161.3C190 161.1 200 161.3 210 161.3' stroke='#3b6bff' stroke-opacity='0.2'/></g>`
    ),
  },
  {
    key: "swatches",
    name: "Paint swatches",
    size: "192px",
    blobs: [M, Y],
    svg: tile(
      192,
      192,
      `<path d='M11 8.3C14.2 7.5 21 7.3 25.8 7.4C30.6 7.4 36.6 7.5 39.7 8.4C42.8 9.2 43.8 9.9 44.5 12.5C45.2 15.2 43.6 20.1 43.9 24.5C44.1 28.8 46.6 35.4 46 38.7C45.5 41.9 44.2 43.3 40.7 43.8C37.2 44.3 30.1 41.7 25.2 41.6C20.4 41.6 14.8 43.7 11.7 43.3C8.5 42.9 7.2 42.3 6.5 39.3C5.8 36.3 7.5 29.9 7.5 25.4C7.6 20.9 6.3 15.1 6.9 12.3C7.4 9.4 7.9 9.1 11 8.3Z' fill='#ff7ab6' fill-opacity='0.18'/><path d='M106.6 8.1C109.7 7.6 115.9 7.5 120.6 7.2C125.2 6.9 131.6 5.7 134.4 6.4C137.2 7 136.4 8.1 137.2 11C138 13.8 139.3 19.4 139.2 23.7C139.2 27.9 138.1 33.6 137 36.5C135.9 39.4 135.2 40.1 132.4 41.2C129.7 42.3 124.9 42.9 120.5 42.9C116.1 43 109.3 42.4 106.1 41.5C103 40.5 102.1 39.9 101.7 37.1C101.2 34.4 103.2 29.3 103.2 24.8C103.2 20.3 101 13.1 101.6 10.3C102.1 7.5 103.4 8.6 106.6 8.1Z' fill='#3fdcb0' fill-opacity='0.2'/><path d='M58.5 56.5C61.8 56.1 68.7 56.5 73.4 56.5C78.2 56.6 83.9 56.2 86.9 56.6C89.8 57.1 90.5 56.2 91.2 59.1C91.9 62 90.8 69 91.1 73.8C91.4 78.6 93.6 84.8 93.2 87.8C92.9 90.8 92.2 91.3 88.9 92C85.6 92.7 78.2 92.4 73.3 92.1C68.3 91.8 62.1 91.1 59.1 90.1C56.1 89 56.2 89 55.2 85.9C54.1 82.8 52.9 76.1 52.7 71.5C52.4 66.9 52.6 60.9 53.5 58.4C54.5 55.9 55.2 56.8 58.5 56.5Z' fill='#ffd23f' fill-opacity='0.32'/><path d='M156.4 55.4C159.4 54.7 165.6 57.4 169.9 57.5C174.2 57.6 179.2 55.7 182.4 56.2C185.5 56.7 187.9 57.3 188.7 60.5C189.4 63.6 186.9 70.4 186.9 75.1C186.8 79.7 188.9 85.6 188.4 88.2C187.9 90.9 186.8 90.2 183.7 90.8C180.7 91.5 174.8 92.3 170.4 92.2C165.9 92.1 159.9 91.2 156.8 90.3C153.6 89.4 152.1 89.4 151.4 86.7C150.8 84 152.8 78.1 153 74C153.1 69.8 151.7 64.8 152.2 61.7C152.8 58.6 153.5 56.1 156.4 55.4Z' fill='#a77bff' fill-opacity='0.16'/><path d='M9.8 101C13 100.1 19.5 100.3 23.9 100.5C28.3 100.7 33.7 101 36.3 102C38.9 103 38.9 103.5 39.6 106.5C40.3 109.6 40.1 115.9 40.3 120.4C40.6 124.8 41.9 129.8 41.1 133.1C40.4 136.4 39 138.9 35.7 140.1C32.4 141.3 25.9 140.4 21.3 140.4C16.6 140.3 10.8 140.8 7.8 139.8C4.8 138.8 4 138 3.4 134.6C2.8 131.1 3.9 123.9 4.2 119.2C4.5 114.5 4.1 109.3 5.1 106.3C6 103.2 6.7 102 9.8 101Z' fill='#ff7ab6' fill-opacity='0.14'/><path d='M105.9 102.9C109 102.5 114.4 103 119.4 102.8C124.5 102.6 132.6 100.9 136.1 101.6C139.6 102.2 139.7 103.6 140.3 106.6C140.9 109.6 140 115 139.8 119.5C139.5 124 139.8 130.3 138.8 133.8C137.9 137.2 137.4 139.4 134.3 140.2C131.2 141 124.9 138.5 120.2 138.4C115.6 138.3 109.3 140.4 106.3 139.7C103.3 139.1 102.9 137.8 102 134.4C101.2 131.1 101.5 124.3 101.3 119.4C101.1 114.6 100 107.9 100.8 105.1C101.5 102.4 102.8 103.2 105.9 102.9Z' fill='#3b6bff' fill-opacity='0.11'/><path d='M56.9 150.9C59.8 150.1 66.4 151.8 71.3 151.9C76.2 152 83 150.7 86.3 151.3C89.5 151.9 89.9 152.3 90.7 155.4C91.5 158.5 91.5 165.1 91.1 169.8C90.7 174.5 89.2 180.8 88.1 183.6C87 186.3 87.4 185.6 84.4 186.3C81.4 187 74.7 187.6 69.9 187.8C65.1 188 58.6 188.3 55.7 187.5C52.7 186.7 52.8 186.4 52.2 183.2C51.6 179.9 51.6 172.5 51.9 168.1C52.2 163.7 53 159.6 53.9 156.7C54.7 153.9 54 151.7 56.9 150.9Z' fill='#3fdcb0' fill-opacity='0.16'/><path d='M150.1 152.7C153.3 152.1 160.3 153 165.5 153.1C170.8 153.2 178.1 152.3 181.6 153C185.1 153.7 185.7 154.6 186.6 157.4C187.6 160.3 187.4 166 187.4 170.2C187.5 174.4 187.9 180 186.7 182.7C185.6 185.3 183.7 185.5 180.5 186.1C177.4 186.8 172.7 186.4 167.8 186.5C163 186.6 154.9 187.4 151.4 186.9C148 186.3 147.9 186.2 147.3 183.3C146.8 180.5 148.2 174.1 148.1 169.7C148 165.3 146.2 159.9 146.5 157.1C146.8 154.2 147 153.4 150.1 152.7Z' fill='#ffd23f' fill-opacity='0.26'/>`
    ),
  },
  {
    key: "squiggles",
    name: "Squiggles",
    size: "220px",
    blobs: [Y, P],
    svg: tile(
      220,
      220,
      `<g fill='none' stroke-linecap='round' stroke-linejoin='round' stroke-width='5'><g transform='translate(2.7 24.7) rotate(267.1)'><circle r='9' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(2.7 244.7) rotate(267.1)'><circle r='9' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(222.7 24.7) rotate(267.1)'><circle r='9' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(222.7 244.7) rotate(267.1)'><circle r='9' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(115.3 157.8) rotate(326.8)'><path d='M-16 10C-18-6-4-16 8-12C18-8 20 4 12 12' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(121.9 48.8) rotate(228.2)'><path d='M-22 8C-12-14 8-17 11-3C13 7 1 10-2 1C-5-11 13-18 24-7' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(200.3 162.5) rotate(88.8)'><path d='M-18-10C-15 9 4 15 19 3' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(-19.7 162.5) rotate(88.8)'><path d='M-18-10C-15 9 4 15 19 3' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(35.3 102.9) rotate(102.2)'><path d='M-22 0C-14-13-6-13-1 0C4 13 12 13 21 0' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(170.9 101.9) rotate(210.9)'><path d='M-10 0L10 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(63.4 191) rotate(167)'><path d='M-16 10C-18-6-4-16 8-12C18-8 20 4 12 12' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(63.4 -29) rotate(167)'><path d='M-16 10C-18-6-4-16 8-12C18-8 20 4 12 12' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(154.3 0.1) rotate(237)'><circle r='3.2' fill='#ffd23f' fill-opacity='0.58'/></g><g transform='translate(154.3 220.1) rotate(237)'><circle r='3.2' fill='#ffd23f' fill-opacity='0.58'/></g><g transform='translate(78.3 126.3) rotate(203.1)'><path d='M-22 0C-14-13-6-13-1 0C4 13 12 13 21 0' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(85.4 16.1) rotate(258.9)'><path d='M-18-10C-15 9 4 15 19 3' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(85.4 236.1) rotate(258.9)'><path d='M-18-10C-15 9 4 15 19 3' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(72.3 71.3) rotate(289.4)'><circle r='9' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(23.3 170.4) rotate(182.9)'><path d='M-22 8C-12-14 8-17 11-3C13 7 1 10-2 1C-5-11 13-18 24-7' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(243.3 170.4) rotate(182.9)'><path d='M-22 8C-12-14 8-17 11-3C13 7 1 10-2 1C-5-11 13-18 24-7' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(180.6 53.7) rotate(256.7)'><circle r='9' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(214.8 88.6) rotate(54.8)'><circle r='3.2' fill='#a77bff' fill-opacity='0.32'/></g><g transform='translate(-5.2 88.6) rotate(54.8)'><circle r='3.2' fill='#a77bff' fill-opacity='0.32'/></g><g transform='translate(40.2 41.6) rotate(83.2)'><circle r='9' stroke='#3fdcb0' stroke-opacity='0.4'/></g></g>`
    ),
  },
  {
    key: "memphis",
    name: "Memphis party",
    size: "200px",
    blobs: [B, P],
    svg: tile(
      200,
      200,
      `<g fill='none' stroke-linecap='round' stroke-linejoin='round' stroke-width='3'><g transform='translate(136.4 18.3) rotate(110.9)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(136.4 218.3) rotate(110.9)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(34.9 141.9) rotate(341.1)'><path d='M-9 0L9 0' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(130.3 121.7) rotate(116.1)'><circle r='4.5' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(22.7 47.7) rotate(154.9)'><circle r='5' stroke='#3fdcb0' stroke-opacity='0.4'/><circle r='11' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(190.5 189) rotate(352.1)'><circle r='4.5' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(190.5 -11) rotate(352.1)'><circle r='4.5' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(-9.5 189) rotate(352.1)'><circle r='4.5' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(-9.5 -11) rotate(352.1)'><circle r='4.5' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(75.2 194.6) rotate(326.1)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(75.2 -5.4) rotate(326.1)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(65.2 82.3) rotate(232.2)'><circle r='11' stroke='#ff7ab6' stroke-opacity='0.32'/><circle cx='-4' cy='-4' r='1.5' fill='#ff7ab6' fill-opacity='0.32'/><circle cx='4' cy='-3' r='1.5' fill='#ff7ab6' fill-opacity='0.32'/><circle cx='0' cy='2' r='1.5' fill='#ff7ab6' fill-opacity='0.32'/><circle cx='-5' cy='4' r='1.5' fill='#ff7ab6' fill-opacity='0.32'/><circle cx='5' cy='5' r='1.5' fill='#ff7ab6' fill-opacity='0.32'/></g><g transform='translate(125.2 67) rotate(180.2)'><path d='M0-9L8.5 6.5L-8.5 6.5Z' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(181.4 69.5) rotate(136.4)'><circle r='4.5' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(-18.6 69.5) rotate(136.4)'><circle r='4.5' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(83.2 146.7) rotate(22.5)'><path d='M-11 4A11 11 0 0 1 11 4' stroke='#3fdcb0' stroke-opacity='0.4'/><path d='M-6 4V-4M0 4V-6.5M6 4V-4' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(26.3 100.8) rotate(301.9)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(150.1 158.2) rotate(124.6)'><circle r='4.5' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(72.9 36.6) rotate(60.3)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(113.7 176.4) rotate(108.4)'><circle r='4.5' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(33.9 182.4) rotate(130.7)'><path d='M-9 0L9 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(33.9 -17.6) rotate(130.7)'><path d='M-9 0L9 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(157.9 107.8) rotate(74.2)'><path d='M0-9L8.5 6.5L-8.5 6.5Z' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(188.4 148.1) rotate(238.2)'><circle r='3' fill='#ffd23f' fill-opacity='0.58'/></g><g transform='translate(-11.6 148.1) rotate(238.2)'><circle r='3' fill='#ffd23f' fill-opacity='0.58'/></g><g transform='translate(165 39.6) rotate(351.7)'><path d='M-9 0L9 0' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(101.5 10.2) rotate(165)'><path d='M0-9L8.5 6.5L-8.5 6.5Z' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(101.5 210.2) rotate(165)'><path d='M0-9L8.5 6.5L-8.5 6.5Z' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(63.9 119.1) rotate(110.8)'><circle r='5' stroke='#3b6bff' stroke-opacity='0.2'/><circle r='11' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(187.4 100.3) rotate(199.9)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(-12.6 100.3) rotate(199.9)'><path d='M-18 0C-15-7-9-7-6 0C-3 7 3 7 6 0C9-7 15-7 18 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(95.8 58.7) rotate(70.8)'><circle r='3' fill='#3fdcb0' fill-opacity='0.4'/></g></g>`
    ),
  },
  {
    key: "shapes",
    name: "Tiny shapes",
    size: "168px",
    blobs: [M, V],
    svg: tile(
      168,
      168,
      `<g fill='none' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.6'><g transform='translate(64 38.8) rotate(76.8)'><rect x='-4.6' y='-4.6' width='9.2' height='9.2' rx='1.4' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(134 116.2) rotate(142.6)'><path d='M-5.5 3A6 6 0 0 1 5.5 3' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(145.1 29.1) rotate(168.5)'><circle r='2' fill='#3b6bff' fill-opacity='0.2'/></g><g transform='translate(42.1 143.4) rotate(226.9)'><path d='M-4.5 0L4.5 0' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(16 75.1) rotate(236.7)'><circle r='2' fill='#a77bff' fill-opacity='0.32'/></g><g transform='translate(79 90.9) rotate(27.6)'><path d='M-4.5 0L4.5 0' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(98.5 2.2) rotate(201.1)'><rect x='-4.6' y='-4.6' width='9.2' height='9.2' rx='1.4' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(98.5 170.2) rotate(201.1)'><rect x='-4.6' y='-4.6' width='9.2' height='9.2' rx='1.4' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(115.8 65.9) rotate(19.9)'><path d='M0-6L5.8 4.4L-5.8 4.4Z' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(29.2 26.2) rotate(163.5)'><rect x='-4.6' y='-4.6' width='9.2' height='9.2' rx='1.4' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(155.1 158.5) rotate(90.8)'><path d='M-4.5 0L4.5 0' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(77.1 135.9) rotate(264.6)'><rect x='-4.6' y='-4.6' width='9.2' height='9.2' rx='1.4' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(36.8 105.9) rotate(283.1)'><path d='M-5.5 3A6 6 0 0 1 5.5 3' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(147.5 85) rotate(201.8)'><circle r='2' fill='#3b6bff' fill-opacity='0.2'/></g><g transform='translate(55.2 7) rotate(78.7)'><path d='M-4.5 0L4.5 0' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(55.2 175) rotate(78.7)'><path d='M-4.5 0L4.5 0' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(53.8 68.6) rotate(74.9)'><circle r='2' fill='#ff7ab6' fill-opacity='0.32'/></g><g transform='translate(109.5 140.4) rotate(99.6)'><path d='M-5.5 3A6 6 0 0 1 5.5 3' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(114.4 27.4) rotate(24.5)'><circle r='2' fill='#ffd23f' fill-opacity='0.58'/></g><g transform='translate(2.8 120.2) rotate(126.7)'><circle r='5' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(170.8 120.2) rotate(126.7)'><circle r='5' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(16.1 162.6) rotate(293.2)'><path d='M-4.5 0L4.5 0' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(16.1 -5.4) rotate(293.2)'><path d='M-4.5 0L4.5 0' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(107 98.6) rotate(87.1)'><path d='M-5.5 3A6 6 0 0 1 5.5 3' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(92.3 42.6) rotate(3.5)'><rect x='-4.6' y='-4.6' width='9.2' height='9.2' rx='1.4' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(97.6 120.6) rotate(252.7)'><path d='M-4.5 0L4.5 0' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(4 38.2) rotate(344.2)'><circle r='2' fill='#ff7ab6' fill-opacity='0.32'/></g><g transform='translate(172 38.2) rotate(344.2)'><circle r='2' fill='#ff7ab6' fill-opacity='0.32'/></g><g transform='translate(129 2.3) rotate(298.7)'><path d='M-4.5 0L4.5 0' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(129 170.3) rotate(298.7)'><path d='M-4.5 0L4.5 0' stroke='#3fdcb0' stroke-opacity='0.4'/></g><g transform='translate(137.5 54.7) rotate(90.3)'><rect x='-4.6' y='-4.6' width='9.2' height='9.2' rx='1.4' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(10.6 95.5) rotate(187.2)'><path d='M0-6L5.8 4.4L-5.8 4.4Z' stroke='#ff7ab6' stroke-opacity='0.32'/></g><g transform='translate(77.9 15.3) rotate(341)'><path d='M-5.5 3A6 6 0 0 1 5.5 3' stroke='#3b6bff' stroke-opacity='0.2'/></g><g transform='translate(27.8 52.1) rotate(137.2)'><circle r='5' stroke='#ffd23f' stroke-opacity='0.58'/></g><g transform='translate(54.7 122) rotate(211.7)'><path d='M-5.5 3A6 6 0 0 1 5.5 3' stroke='#a77bff' stroke-opacity='0.32'/></g><g transform='translate(125.8 90.9) rotate(205.9)'><path d='M0-6L5.8 4.4L-5.8 4.4Z' stroke='#3fdcb0' stroke-opacity='0.4'/></g></g>`
    ),
  },
];

// A room with no stored index is drawn with one of the first ten textures, chosen by its join code. Ten, however
// long the list is: every build of the web page and the iPhone app has those ten, so they all draw such a room
// alike, and a room from before the index was stored keeps the texture it has.
const JOIN_CODE_TEXTURES = 10;

/** Older rooms have no stored index: hash the join code (FNV-1a) so every device agrees. */
export function textureForRoom(room: { background?: number; joinCode?: string } | null | undefined): RoomTexture {
  if (room?.background !== undefined && TEXTURES[room.background]) return TEXTURES[room.background];
  if (!room?.joinCode) return TEXTURES[0];
  let h = 0x811c9dc5;
  for (const ch of room.joinCode) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return TEXTURES[h % JOIN_CODE_TEXTURES];
}

export function textureStyle(t: RoomTexture): CSSProperties {
  return {
    "--tex-img": svgUrl(t.svg),
    "--tex-size": t.size,
    "--blob-a": t.blobs[0],
    "--blob-b": t.blobs[1],
  } as CSSProperties;
}

// A screen outside a room (the home page, a join link whose room is not known yet) shows the "ambient" texture:
// that of the last room shown in this tab, so a guest put out of a chat keeps its background until the next chat
// brings its own. With no room yet it is a random one, picked once per page load: moving between such screens
// keeps it, and a reload picks again. A screen that is only waiting for its room picks nothing: it shows the
// ambient texture if the page load has one, and otherwise bare paper until the room's own arrives.
// A retired texture is never the ambient one. The pick is made among the others, and a last room that has a
// retired texture counts as no room yet.

const AMBIENT_KEY = "enchatto_background";

/** Where the last room's index is kept, as text: sessionStorage in the browser, a stand-in in a test */
type TextureStorage = Pick<Storage, "getItem" | "setItem">;

const isTextureIndex = (index: number) => Number.isInteger(index) && index >= 0 && index < TEXTURES.length;

/** The indexes the random pick is made among: every texture that is not retired */
const PICKED_TEXTURES = TEXTURES.flatMap((texture, index) => (texture.retired ? [] : [index]));

/**
 * The rule for the ambient texture, over a given storage and source of random numbers. Storage that is missing or
 * blocked never throws here: what is kept or picked is held in memory too, which lasts as long as the page load.
 */
export function ambientTextureIndex(storage: TextureStorage | null | undefined, random: () => number) {
  // Read first: a room's texture kept by this page load is the last one shown, whatever storage took or still holds
  let kept: number | undefined;
  let picked: number | undefined;
  /** The texture of the last room shown: the one this page load kept, or else the one storage holds */
  const lastRoom = (): number | undefined => {
    if (kept !== undefined) return kept;
    try {
      const stored = storage?.getItem(AMBIENT_KEY);
      // Digits only: Number() alone reads "" as 0 and "1e0" as 1
      if (stored && /^\d+$/.test(stored) && isTextureIndex(Number(stored))) return Number(stored);
    } catch {
      // storage blocked
    }
    return undefined;
  };
  /** What this page load already has: a room's texture, or a pick made earlier. Picks nothing */
  const peek = (): number | undefined => {
    const last = lastRoom();
    // A retired texture is shown in its room and nowhere else
    return last !== undefined && !TEXTURES[last].retired ? last : picked;
  };
  return {
    peek,
    get(): number {
      const known = peek();
      if (known !== undefined) return known;
      picked = PICKED_TEXTURES[Math.floor(random() * PICKED_TEXTURES.length)];
      return picked;
    },
    keep(index: number) {
      if (!isTextureIndex(index)) return;
      kept = index;
      try {
        storage?.setItem(AMBIENT_KEY, String(index));
      } catch {
        // The copy in memory serves this page load
      }
    },
  };
}

// sessionStorage is looked up at each call, inside the rule's try: the server has none, and a browser that blocks
// storage throws on the lookup itself
const ambient = ambientTextureIndex(
  {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
  },
  Math.random
);

/** The texture of a screen outside a room. For the browser only: the server cannot know what a tab last showed */
export function ambientTexture(): RoomTexture {
  return TEXTURES[ambient.get()];
}

/**
 * The ambient texture if this page load already has one, and nothing otherwise. For a screen whose room is on its
 * way: a join link opened in a fresh tab then goes from bare paper to the room's texture, not through a random one
 */
export function ambientTextureIfAny(): RoomTexture | undefined {
  const index = ambient.peek();
  return index === undefined ? undefined : TEXTURES[index];
}

/** Makes a room's texture the ambient one, so the screens that follow the room look like it */
export function keepAmbientTexture(texture: RoomTexture) {
  ambient.keep(TEXTURES.indexOf(texture));
}
