/**
 * Each level's name, by its place in lib/dash/levels. Apart from the levels themselves so that a screen
 * which only names them (the lobby, the results) does not load the game. tests/web/dash-levels.test.ts holds
 * this list to the levels' own names.
 */
export const LEVEL_NAMES: { en: string; ja: string }[] = [
  { en: "Kaiten Rush", ja: "回転ずしラッシュ" },
  { en: "Taiko Bounce", ja: "太鼓ジャンプ" },
  { en: "Windy Pinwheels", ja: "かざぐるま通り" },
  { en: "Mochi Mountain", ja: "もちもち山" },
  { en: "Origami Sky", ja: "おりがみスカイ" },
  { en: "Shinkansen Dash", ja: "しんかんせんダッシュ" },
  { en: "Ninja Rooftops", ja: "しのびルーフ" },
  { en: "Matsuri Carousel", ja: "おまつりカルーセル" },
  { en: "Ramen Slide", ja: "ラーメンスライダー" },
  { en: "Onsen Hop", ja: "おんせんホップ" },
];
