// dictionary.js — Jisho API lookup + inline fallback data
window.IJ = window.IJ || {};

// Fallback data: key = concatenated input kana (starters' readings joined)
// value = { kanji, readingKana, meaning }
// Covers rendaku, vowel shifts, and direct combinations from the 20 starters.
const FALLBACK_DATA = {
  // Water combinations
  "みずくさ":    { kanji: "水草",  readingKana: "みずくさ",   meaning: "aquatic plants" },
  "みずうみ":    { kanji: "湖",    readingKana: "みずうみ",   meaning: "lake" },
  "みずあめ":    { kanji: "水飴",  readingKana: "みずあめ",   meaning: "starch syrup" },
  "みずそら":    { kanji: "水空",  readingKana: "みずぞら",   meaning: "watery sky" },
  "みずはな":    { kanji: "水花",  readingKana: "みずはな",   meaning: "water flower" },
  "みずかわ":    { kanji: "水川",  readingKana: "みずかわ",   meaning: "water stream" },
  "みずやま":    { kanji: "水山",  readingKana: "みずやま",   meaning: "water mountain" },
  "みずひかり":  { kanji: "水光",  readingKana: "みずひかり", meaning: "shimmer of water" },
  // Fire combinations
  "ひはな":      { kanji: "火花",  readingKana: "ひばな",     meaning: "spark" },
  "ひかぜ":      { kanji: "火風",  readingKana: "ひかぜ",     meaning: "fire wind" },
  "ひみず":      { kanji: "火水",  readingKana: "ひみず",     meaning: "fire and water" },
  "ひやま":      { kanji: "火山",  readingKana: "かざん",     meaning: "volcano" },
  "ひそら":      { kanji: "火空",  readingKana: "ひぞら",     meaning: "fiery sky" },
  "ひかわ":      { kanji: "火川",  readingKana: "ひかわ",     meaning: "fire river" },
  "ひひかり":    { kanji: "火光",  readingKana: "ひひかり",   meaning: "firelight" },
  // Tree/wood combinations
  "きくさ":      { kanji: "木草",  readingKana: "きくさ",     meaning: "trees and grass" },
  "きかわ":      { kanji: "木川",  readingKana: "きかわ",     meaning: "wooded river" },
  "きやま":      { kanji: "木山",  readingKana: "きやま",     meaning: "wooded mountain" },
  "きいし":      { kanji: "木石",  readingKana: "きいし",     meaning: "wood and stone" },
  "きはな":      { kanji: "木花",  readingKana: "きはな",     meaning: "tree flower" },
  // Mountain combinations
  "やまかわ":    { kanji: "山川",  readingKana: "やまかわ",   meaning: "mountain stream" },
  "やまくさ":    { kanji: "山草",  readingKana: "やまくさ",   meaning: "mountain plants" },
  "やまかぜ":    { kanji: "山風",  readingKana: "やまかぜ",   meaning: "mountain wind" },
  "やまそら":    { kanji: "山空",  readingKana: "やまぞら",   meaning: "mountain sky" },
  "やまひかり":  { kanji: "山光",  readingKana: "やまひかり", meaning: "mountain glow" },
  "やまうみ":    { kanji: "山海",  readingKana: "やまうみ",   meaning: "mountains and sea" },
  "やまゆき":    { kanji: "山雪",  readingKana: "やまゆき",   meaning: "mountain snow" },
  "やまひ":      { kanji: "山火",  readingKana: "やまび",     meaning: "wildfire" },
  "やまみず":    { kanji: "山水",  readingKana: "さんすい",   meaning: "landscape (sanscui)" },
  // River combinations
  "かわかぜ":    { kanji: "川風",  readingKana: "かわかぜ",   meaning: "river breeze" },
  "かわやま":    { kanji: "川山",  readingKana: "かわやま",   meaning: "river and mountain" },
  "かわくさ":    { kanji: "川草",  readingKana: "かわくさ",   meaning: "river grass" },
  "かわそら":    { kanji: "川空",  readingKana: "かわぞら",   meaning: "sky over a river" },
  "かわひかり":  { kanji: "川光",  readingKana: "かわひかり", meaning: "glittering river" },
  "かわひ":      { kanji: "川火",  readingKana: "かわび",     meaning: "river fire" },
  // Person combinations
  "ひとやま":    { kanji: "人山",  readingKana: "ひとやま",   meaning: "crowd, heap of people" },
  "ひとうみ":    { kanji: "人海",  readingKana: "ひとうみ",   meaning: "sea of people" },
  "ひとかわ":    { kanji: "人川",  readingKana: "ひとかわ",   meaning: "stream of people" },
  "ひとひかり":  { kanji: "人光",  readingKana: "ひとひかり", meaning: "light of humanity" },
  // Sky combinations
  "そらうみ":    { kanji: "空海",  readingKana: "そらうみ",   meaning: "sky and sea" },
  "そらかぜ":    { kanji: "空風",  readingKana: "からかぜ",   meaning: "dry wind" },
  "そらはな":    { kanji: "空花",  readingKana: "そらはな",   meaning: "flowers in the sky" },
  "そらひかり":  { kanji: "空光",  readingKana: "そらひかり", meaning: "sky light" },
  "そらやま":    { kanji: "空山",  readingKana: "そらやま",   meaning: "sky mountain" },
  "そらくさ":    { kanji: "空草",  readingKana: "そらくさ",   meaning: "windswept grass" },
  // Earth combinations
  "つちやま":    { kanji: "土山",  readingKana: "つちやま",   meaning: "mound of earth" },
  "つちかわ":    { kanji: "土川",  readingKana: "つちかわ",   meaning: "muddy river" },
  "つちくさ":    { kanji: "土草",  readingKana: "つちくさ",   meaning: "ground cover plants" },
  "つちかぜ":    { kanji: "土風",  readingKana: "つちかぜ",   meaning: "dust storm" },
  "つちいし":    { kanji: "土石",  readingKana: "どせき",     meaning: "dirt and rocks" },
  // Wind combinations
  "かぜはな":    { kanji: "風花",  readingKana: "かざはな",   meaning: "snow flurries on a clear day" },
  "かぜくさ":    { kanji: "風草",  readingKana: "かぜくさ",   meaning: "windswept grass" },
  "かぜそら":    { kanji: "風空",  readingKana: "かぜぞら",   meaning: "windy sky" },
  "かぜやま":    { kanji: "風山",  readingKana: "かぜやま",   meaning: "windy mountain" },
  "かぜみず":    { kanji: "風水",  readingKana: "ふうすい",   meaning: "feng shui" },
  "かぜかわ":    { kanji: "風川",  readingKana: "かぜかわ",   meaning: "windswept river" },
  // Flower combinations
  "はなひ":      { kanji: "花火",  readingKana: "はなび",     meaning: "fireworks" },
  "はなやま":    { kanji: "花山",  readingKana: "はなやま",   meaning: "flower mountain" },
  "はなくさ":    { kanji: "花草",  readingKana: "はなくさ",   meaning: "flowers and grass" },
  "はなかぜ":    { kanji: "花風",  readingKana: "はなかぜ",   meaning: "spring breeze" },
  "はなかわ":    { kanji: "花川",  readingKana: "はなかわ",   meaning: "flower-lined river" },
  "はなゆき":    { kanji: "花雪",  readingKana: "はなゆき",   meaning: "petal-like snow" },
  "はなみず":    { kanji: "花水",  readingKana: "はなみず",   meaning: "flower water" },
  "はなうみ":    { kanji: "花海",  readingKana: "はなうみ",   meaning: "sea of flowers" },
  "はなそら":    { kanji: "花空",  readingKana: "はなぞら",   meaning: "flower-filled sky" },
  // Sea combinations
  "うみかぜ":    { kanji: "海風",  readingKana: "うみかぜ",   meaning: "sea breeze" },
  "うみやま":    { kanji: "海山",  readingKana: "うみやま",   meaning: "sea and mountains" },
  "うみくさ":    { kanji: "海草",  readingKana: "うみくさ",   meaning: "seaweed" },
  "うみそら":    { kanji: "海空",  readingKana: "うみぞら",   meaning: "sea and sky" },
  "うみいし":    { kanji: "海石",  readingKana: "うみいし",   meaning: "sea rock" },
  "うみはな":    { kanji: "海花",  readingKana: "うみはな",   meaning: "sea anemone" },
  "うみひかり":  { kanji: "海光",  readingKana: "うみひかり", meaning: "sea glow" },
  "うみかわ":    { kanji: "海川",  readingKana: "うみかわ",   meaning: "sea and river" },
  // Stone combinations
  "いしかわ":    { kanji: "石川",  readingKana: "いしかわ",   meaning: "stony river (Ishikawa)" },
  "いしやま":    { kanji: "石山",  readingKana: "いしやま",   meaning: "rocky mountain" },
  "いしくさ":    { kanji: "石草",  readingKana: "いしくさ",   meaning: "stony ground plants" },
  "いしはな":    { kanji: "石花",  readingKana: "いしはな",   meaning: "carved stone flower" },
  "いしみず":    { kanji: "石清水", readingKana: "いわしみず",  meaning: "spring water from rocks" },
  "いしつち":    { kanji: "石土",  readingKana: "いしつち",   meaning: "rock and soil" },
  // Gold/metal combinations
  "きんいし":    { kanji: "金石",  readingKana: "きんせき",   meaning: "metal and stone; gems" },
  "きんやま":    { kanji: "金山",  readingKana: "きんざん",   meaning: "gold mine" },
  "きんかわ":    { kanji: "金川",  readingKana: "きんかわ",   meaning: "gold river" },
  "きんひかり":  { kanji: "金光",  readingKana: "きんひかり", meaning: "golden light" },
  "きんくさ":    { kanji: "金草",  readingKana: "きんぐさ",   meaning: "golden grass" },
  // Sun/Day combinations
  "ひつき":      { kanji: "日月",  readingKana: "につき",     meaning: "sun and moon" },
  "ひひかり":    { kanji: "日光",  readingKana: "にっこう",   meaning: "sunlight; Nikko" },
  "ひそら":      { kanji: "日空",  readingKana: "にちくう",   meaning: "daytime sky" },
  "ひかわ":      { kanji: "日川",  readingKana: "ひかわ",     meaning: "sun river" },
  // Moon combinations
  "つきひ":      { kanji: "月日",  readingKana: "つきひ",     meaning: "months and days; time" },
  "つきやま":    { kanji: "築山",  readingKana: "つきやま",   meaning: "ornamental garden hill" },
  "つきくさ":    { kanji: "月草",  readingKana: "つきくさ",   meaning: "dayflower plant" },
  "つきかぜ":    { kanji: "月風",  readingKana: "つきかぜ",   meaning: "moonlit breeze" },
  "つきうみ":    { kanji: "月海",  readingKana: "つきうみ",   meaning: "moonlit sea" },
  "つきそら":    { kanji: "月空",  readingKana: "つきぞら",   meaning: "moonlit sky" },
  "つきひかり":  { kanji: "月光",  readingKana: "げっこう",   meaning: "moonlight" },
  // Grass combinations
  "くさはな":    { kanji: "草花",  readingKana: "くさはな",   meaning: "plants and flowers" },
  "くさやま":    { kanji: "草山",  readingKana: "くさやま",   meaning: "grassy mountain" },
  "くさかぜ":    { kanji: "草風",  readingKana: "くさかぜ",   meaning: "grassy breeze" },
  "くさうみ":    { kanji: "草海",  readingKana: "くさうみ",   meaning: "sea of grass" },
  "くさかわ":    { kanji: "草川",  readingKana: "くさかわ",   meaning: "grassy river bank" },
  "くさつち":    { kanji: "草土",  readingKana: "くさつち",   meaning: "grassy soil" },
  "くさいし":    { kanji: "草石",  readingKana: "くさいし",   meaning: "mossy stone" },
  // Rain combinations
  "あめゆき":    { kanji: "雨雪",  readingKana: "あめゆき",   meaning: "sleet" },
  "あめかぜ":    { kanji: "雨風",  readingKana: "あめかぜ",   meaning: "rain and wind" },
  "あめみず":    { kanji: "雨水",  readingKana: "あまみず",   meaning: "rainwater" },
  "あめそら":    { kanji: "雨空",  readingKana: "あまぞら",   meaning: "rainy sky" },
  "あめくさ":    { kanji: "雨草",  readingKana: "あめくさ",   meaning: "rain-soaked grass" },
  "あめはな":    { kanji: "雨花",  readingKana: "あめはな",   meaning: "rain flower" },
  "あめうみ":    { kanji: "雨海",  readingKana: "あめうみ",   meaning: "rain over the sea" },
  "あめかわ":    { kanji: "雨川",  readingKana: "あめかわ",   meaning: "rain-swollen river" },
  // Snow combinations
  "ゆきやま":    { kanji: "雪山",  readingKana: "ゆきやま",   meaning: "snowy mountain" },
  "ゆきみず":    { kanji: "雪水",  readingKana: "ゆきみず",   meaning: "snowmelt water" },
  "ゆきかぜ":    { kanji: "雪風",  readingKana: "ゆきかぜ",   meaning: "snowy wind" },
  "ゆきはな":    { kanji: "雪花",  readingKana: "ゆきはな",   meaning: "snowflake" },
  "ゆきそら":    { kanji: "雪空",  readingKana: "ゆきぞら",   meaning: "snowy sky" },
  "ゆきかわ":    { kanji: "雪川",  readingKana: "ゆきかわ",   meaning: "snowy river" },
  "ゆきうみ":    { kanji: "雪海",  readingKana: "ゆきうみ",   meaning: "snow-covered sea" },
  "ゆきくさ":    { kanji: "雪草",  readingKana: "ゆきくさ",   meaning: "snow-covered grass" },
  "ゆきひかり":  { kanji: "雪光",  readingKana: "ゆきびかり", meaning: "snow glare" },
  // Light combinations
  "ひかりそら":  { kanji: "光空",  readingKana: "ひかりぞら", meaning: "luminous sky" },
  "ひかりうみ":  { kanji: "光海",  readingKana: "ひかりうみ", meaning: "glittering sea" },
  "ひかりはな":  { kanji: "光花",  readingKana: "ひかりはな", meaning: "glowing flower" },
  "ひかりかぜ":  { kanji: "光風",  readingKana: "こうふう",   meaning: "bright spring breeze" },
  "ひかりかわ":  { kanji: "光川",  readingKana: "ひかりかわ", meaning: "shimmering river" },
  "ひかりやま":  { kanji: "光山",  readingKana: "ひかりやま", meaning: "luminous mountain" },
  "ひかりつき":  { kanji: "光月",  readingKana: "こうげつ",   meaning: "brilliant moon" },
  // Night combinations
  "よるかぜ":    { kanji: "夜風",  readingKana: "よるかぜ",   meaning: "night breeze" },
  "よるそら":    { kanji: "夜空",  readingKana: "よぞら",     meaning: "night sky" },
  "よるうみ":    { kanji: "夜海",  readingKana: "よるうみ",   meaning: "night sea" },
  "よるやま":    { kanji: "夜山",  readingKana: "よるやま",   meaning: "mountain at night" },
  "よるかわ":    { kanji: "夜川",  readingKana: "よるかわ",   meaning: "river at night" },
  "よるはな":    { kanji: "夜花",  readingKana: "よるはな",   meaning: "night-blooming flower" },
  "よるひかり":  { kanji: "夜光",  readingKana: "やこう",     meaning: "glow in the dark" },
  "よるみず":    { kanji: "夜水",  readingKana: "よるみず",   meaning: "night water" },
  "よるゆき":    { kanji: "夜雪",  readingKana: "よるゆき",   meaning: "nighttime snow" },
  // Multi-word fun compounds
  "みずかぜ":    { kanji: "水風",  readingKana: "すいふう",   meaning: "water and wind" },
  "みずひかり":  { kanji: "水光",  readingKana: "みずびかり", meaning: "water sparkle" },
  "みずひ":      { kanji: "水火",  readingKana: "すいか",     meaning: "water and fire" },
  "かぜひかり":  { kanji: "風光",  readingKana: "ふうこう",   meaning: "scenic beauty" },

  // ── Single-kanji / short entries (used by the Create Kanji feature) ───────
  "み":      { kanji: "見",  readingKana: "み",     meaning: "to see" },
  "て":      { kanji: "手",  readingKana: "て",     meaning: "hand" },
  "め":      { kanji: "目",  readingKana: "め",     meaning: "eye" },
  "みみ":    { kanji: "耳",  readingKana: "みみ",   meaning: "ear" },
  "くち":    { kanji: "口",  readingKana: "くち",   meaning: "mouth" },
  "あし":    { kanji: "足",  readingKana: "あし",   meaning: "foot, leg" },
  "あたま":  { kanji: "頭",  readingKana: "あたま", meaning: "head" },
  "こころ":  { kanji: "心",  readingKana: "こころ", meaning: "heart, mind" },
  "いえ":    { kanji: "家",  readingKana: "いえ",   meaning: "house, home" },
  "まち":    { kanji: "町",  readingKana: "まち",   meaning: "town" },
  "みち":    { kanji: "道",  readingKana: "みち",   meaning: "road, path" },
  "とり":    { kanji: "鳥",  readingKana: "とり",   meaning: "bird" },
  "さかな":  { kanji: "魚",  readingKana: "さかな", meaning: "fish" },
  "むし":    { kanji: "虫",  readingKana: "むし",   meaning: "insect, bug" },
  "こ":      { kanji: "子",  readingKana: "こ",     meaning: "child" },
  "おとこ":  { kanji: "男",  readingKana: "おとこ", meaning: "man" },
  "おんな":  { kanji: "女",  readingKana: "おんな", meaning: "woman" },
  "こえ":    { kanji: "声",  readingKana: "こえ",   meaning: "voice" },
  "そと":    { kanji: "外",  readingKana: "そと",   meaning: "outside" },
  "なか":    { kanji: "中",  readingKana: "なか",   meaning: "inside, middle" },
  "うえ":    { kanji: "上",  readingKana: "うえ",   meaning: "above, top" },
  "した":    { kanji: "下",  readingKana: "した",   meaning: "below, under" },
  "もり":    { kanji: "森",  readingKana: "もり",   meaning: "forest" },
  "おか":    { kanji: "丘",  readingKana: "おか",   meaning: "hill" },
  "いけ":    { kanji: "池",  readingKana: "いけ",   meaning: "pond" },
  "はら":    { kanji: "原",  readingKana: "はら",   meaning: "field, plain" },
  "しろ":    { kanji: "城",  readingKana: "しろ",   meaning: "castle" },
  "てら":    { kanji: "寺",  readingKana: "てら",   meaning: "temple" },
  "はし":    { kanji: "橋",  readingKana: "はし",   meaning: "bridge" },
  "ふね":    { kanji: "船",  readingKana: "ふね",   meaning: "boat, ship" },
  "くも":    { kanji: "雲",  readingKana: "くも",   meaning: "cloud" },
  "かみなり":{ kanji: "雷",  readingKana: "かみなり", meaning: "thunder" },
  "にじ":    { kanji: "虹",  readingKana: "にじ",   meaning: "rainbow" },
  "ほし":    { kanji: "星",  readingKana: "ほし",   meaning: "star" },
  "いなずま":{ kanji: "稲妻", readingKana: "いなずま", meaning: "lightning" },
  "たき":    { kanji: "滝",  readingKana: "たき",   meaning: "waterfall" },
  "しま":    { kanji: "島",  readingKana: "しま",   meaning: "island" },
  "たに":    { kanji: "谷",  readingKana: "たに",   meaning: "valley" },
  "いわ":    { kanji: "岩",  readingKana: "いわ",   meaning: "rock, boulder" },
  "はな":    { kanji: "鼻",  readingKana: "はな",   meaning: "nose" },
  "あめ":    { kanji: "飴",  readingKana: "あめ",   meaning: "candy, sweets" },
  "ゆみ":    { kanji: "弓",  readingKana: "ゆみ",   meaning: "bow (archery)" },
  "つるぎ":  { kanji: "剣",  readingKana: "つるぎ", meaning: "sword" },
  "ちから":  { kanji: "力",  readingKana: "ちから", meaning: "power, strength" },
  "いのち":  { kanji: "命",  readingKana: "いのち", meaning: "life" },
  "ゆめ":    { kanji: "夢",  readingKana: "ゆめ",   meaning: "dream" },
  "かがみ":  { kanji: "鏡",  readingKana: "かがみ", meaning: "mirror" },
  "とびら":  { kanji: "扉",  readingKana: "とびら", meaning: "door" },
  "ふゆ":    { kanji: "冬",  readingKana: "ふゆ",   meaning: "winter" },
  "はる":    { kanji: "春",  readingKana: "はる",   meaning: "spring" },
  "なつ":    { kanji: "夏",  readingKana: "なつ",   meaning: "summer" },
  "あき":    { kanji: "秋",  readingKana: "あき",   meaning: "autumn" },
  "あさ":    { kanji: "朝",  readingKana: "あさ",   meaning: "morning" },
  "ひる":    { kanji: "昼",  readingKana: "ひる",   meaning: "daytime, noon" },
  "ゆうひ":  { kanji: "夕日", readingKana: "ゆうひ", meaning: "sunset" },
  "よあけ":  { kanji: "夜明け", readingKana: "よあけ", meaning: "dawn" },

  // ── Kanji-keyed entries (on-yomi compounds) ───────────────────────────────
  // Key = kanji string so the kanji-search strategy finds them offline.
  // These cover combinations the kana-search path cannot reach because the
  // compound's reading uses on-yomi (different from the tiles' kun-yomi).
  "火山":   { kanji: "火山",  readingKana: "かざん",   meaning: "volcano" },
  "海水":   { kanji: "海水",  readingKana: "かいすい",  meaning: "seawater" },
  "水山":   { kanji: "水山",  readingKana: "みずやま",  meaning: "water mountain" },
  "山水":   { kanji: "山水",  readingKana: "さんすい",  meaning: "landscape, scenery" },
  "月光":   { kanji: "月光",  readingKana: "げっこう",  meaning: "moonlight" },
  "日光":   { kanji: "日光",  readingKana: "にっこう",  meaning: "sunlight; Nikko" },
  "風水":   { kanji: "風水",  readingKana: "ふうすい",  meaning: "feng shui" },
  "金山":   { kanji: "金山",  readingKana: "きんざん",  meaning: "gold mine" },
  "石山":   { kanji: "石山",  readingKana: "いしやま",  meaning: "rocky mountain" },
  "山川":   { kanji: "山川",  readingKana: "やまかわ",  meaning: "mountain stream" },
  "花火":   { kanji: "花火",  readingKana: "はなび",    meaning: "fireworks" },
  "夜空":   { kanji: "夜空",  readingKana: "よぞら",    meaning: "night sky" },
  "雪山":   { kanji: "雪山",  readingKana: "ゆきやま",  meaning: "snowy mountain" },
  "草花":   { kanji: "草花",  readingKana: "くさはな",  meaning: "plants and flowers" },
  "水草":   { kanji: "水草",  readingKana: "みずくさ",  meaning: "aquatic plants" },
  "海草":   { kanji: "海草",  readingKana: "うみくさ",  meaning: "seaweed" },
  "山海":   { kanji: "山海",  readingKana: "さんかい",  meaning: "mountains and sea" },
  "川風":   { kanji: "川風",  readingKana: "かわかぜ",  meaning: "river breeze" },
  "海風":   { kanji: "海風",  readingKana: "かいふう",  meaning: "sea breeze" },
  "夜風":   { kanji: "夜風",  readingKana: "よるかぜ",  meaning: "night breeze" },
  "山風":   { kanji: "山風",  readingKana: "やまかぜ",  meaning: "mountain wind" },
  "雨水":   { kanji: "雨水",  readingKana: "あまみず",  meaning: "rainwater" },
  "雨雪":   { kanji: "雨雪",  readingKana: "あめゆき",  meaning: "sleet" },
  "雪水":   { kanji: "雪水",  readingKana: "ゆきみず",  meaning: "snowmelt water" },
  "光風":   { kanji: "光風",  readingKana: "こうふう",  meaning: "bright spring breeze" },
  "月日":   { kanji: "月日",  readingKana: "つきひ",    meaning: "months and days; time" },
  "花風":   { kanji: "花風",  readingKana: "はなかぜ",  meaning: "spring breeze" },
  // Compounds reachable via Create Kanji (見, 森, 星, 道, 心, etc.)
  "月見":   { kanji: "月見",  readingKana: "つきみ",    meaning: "moon viewing" },
  "花見":   { kanji: "花見",  readingKana: "はなみ",    meaning: "flower viewing (hanami)" },
  "雪見":   { kanji: "雪見",  readingKana: "ゆきみ",    meaning: "snow viewing" },
  "星見":   { kanji: "星見",  readingKana: "ほしみ",    meaning: "stargazing" },
  "夜見":   { kanji: "夜見",  readingKana: "よるみ",    meaning: "watching at night" },
  "海見":   { kanji: "海見",  readingKana: "うみみ",    meaning: "sea gazing" },
  "山道":   { kanji: "山道",  readingKana: "やまみち",  meaning: "mountain path" },
  "花道":   { kanji: "花道",  readingKana: "はなみち",  meaning: "flower path" },
  "海道":   { kanji: "海道",  readingKana: "かいどう",  meaning: "sea road; Kaidō" },
  "心水":   { kanji: "心水",  readingKana: "こころみず", meaning: "water of the heart" },
  "心火":   { kanji: "心火",  readingKana: "しんか",    meaning: "inner fire" },
  "心風":   { kanji: "心風",  readingKana: "こころかぜ", meaning: "breeze of the heart" },
  "森川":   { kanji: "森川",  readingKana: "もりかわ",  meaning: "forest river" },
  "森山":   { kanji: "森山",  readingKana: "もりやま",  meaning: "forested mountain" },
  "森海":   { kanji: "森海",  readingKana: "もりうみ",  meaning: "forest and sea" },
  "星空":   { kanji: "星空",  readingKana: "ほしぞら",  meaning: "starry sky" },
  "星川":   { kanji: "星川",  readingKana: "ほしかわ",  meaning: "star river (Milky Way)" },
  "星月":   { kanji: "星月",  readingKana: "ほしつき",  meaning: "stars and moon" },
  "道山":   { kanji: "道山",  readingKana: "どうざん",  meaning: "mountain path" },
  "夢見":   { kanji: "夢見",  readingKana: "ゆめみ",    meaning: "dreaming; dream vision" },
  "夢花":   { kanji: "夢花",  readingKana: "ゆめはな",  meaning: "dream flower" },
  "夢空":   { kanji: "夢空",  readingKana: "ゆめぞら",  meaning: "dream sky" },
};

// ── Romaji → Hiragana converter ───────────────────────────────────────────
// Processes romaji left-to-right with longest-match; handles gemination (っ).
function romajiToHiragana(romaji) {
  const r = romaji.toLowerCase().trim();

  // Pairs: [romaji, hiragana] — longer patterns must come before shorter ones.
  const PAIRS = [
    // Digraphs + compound kana (must appear before single-syllable ka/ki/etc.)
    ['sha','しゃ'],['shi','し'],['shu','しゅ'],['sho','しょ'],
    ['chi','ち'],['cha','ちゃ'],['chu','ちゅ'],['cho','ちょ'],
    ['tsu','つ'],
    ['kya','きゃ'],['kyu','きゅ'],['kyo','きょ'],
    ['sya','しゃ'],['syu','しゅ'],['syo','しょ'],
    ['tya','ちゃ'],['tyu','ちゅ'],['tyo','ちょ'],
    ['nya','にゃ'],['nyu','にゅ'],['nyo','にょ'],
    ['hya','ひゃ'],['hyu','ひゅ'],['hyo','ひょ'],
    ['mya','みゃ'],['myu','みゅ'],['myo','みょ'],
    ['rya','りゃ'],['ryu','りゅ'],['ryo','りょ'],
    ['gya','ぎゃ'],['gyu','ぎゅ'],['gyo','ぎょ'],
    ['zya','じゃ'],['zyu','じゅ'],['zyo','じょ'],
    ['jya','じゃ'],['jyu','じゅ'],['jyo','じょ'],
    ['bya','びゃ'],['byu','びゅ'],['byo','びょ'],
    ['pya','ぴゃ'],['pyu','ぴゅ'],['pyo','ぴょ'],
    ['dya','ぢゃ'],['dyu','ぢゅ'],['dyo','ぢょ'],
    // 2-char basic syllables
    ['ka','か'],['ki','き'],['ku','く'],['ke','け'],['ko','こ'],
    ['sa','さ'],['si','し'],['su','す'],['se','せ'],['so','そ'],
    ['ta','た'],['ti','ち'],['tu','つ'],['te','て'],['to','と'],
    ['na','な'],['ni','に'],['nu','ぬ'],['ne','ね'],['no','の'],
    ['ha','は'],['hi','ひ'],['fu','ふ'],['hu','ふ'],['he','へ'],['ho','ほ'],
    ['ma','ま'],['mi','み'],['mu','む'],['me','め'],['mo','も'],
    ['ya','や'],['yu','ゆ'],['yo','よ'],
    ['ra','ら'],['ri','り'],['ru','る'],['re','れ'],['ro','ろ'],
    ['wa','わ'],['wo','を'],
    ['ga','が'],['gi','ぎ'],['gu','ぐ'],['ge','げ'],['go','ご'],
    ['za','ざ'],['zi','じ'],['zu','ず'],['ze','ぜ'],['zo','ぞ'],
    ['ja','じゃ'],['ji','じ'],['ju','じゅ'],['jo','じょ'],
    ['da','だ'],['di','ぢ'],['du','づ'],['de','で'],['do','ど'],
    ['ba','ば'],['bi','び'],['bu','ぶ'],['be','べ'],['bo','ぼ'],
    ['pa','ぱ'],['pi','ぴ'],['pu','ぷ'],['pe','ぺ'],['po','ぽ'],
    ['nn','ん'],
    // Single vowels
    ['a','あ'],['i','い'],['u','う'],['e','え'],['o','お'],
    ['n','ん'],
  ];

  const MAP = {};
  for (const [rom, kana] of PAIRS) MAP[rom] = kana;

  let result = '';
  let i = 0;
  while (i < r.length) {
    // Gemination: double consonant (not 'n') → っ
    if (
      i + 1 < r.length &&
      r[i] === r[i + 1] &&
      r[i] !== 'n' &&
      /[bcdfghjklmnpqrstvwxyz]/.test(r[i])
    ) {
      result += 'っ';
      i++;
      continue;
    }
    // Longest match first (4 → 1 chars)
    let matched = false;
    for (let len = 4; len >= 1; len--) {
      const chunk = r.slice(i, i + len);
      if (MAP[chunk]) {
        result += MAP[chunk];
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += r[i]; // keep spaces, numbers, unknown chars
      i++;
    }
  }
  return result;
}

// ── API helpers ───────────────────────────────────────────────────────────

// Fetch raw Jisho entries for a keyword. Returns [] on any error.
async function searchJisho(keyword) {
  try {
    const res = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return []; // CORS, network, or parse error
  }
}

// From Jisho entries, extract tiles where japanese[].reading === kana exactly.
function extractByReading(entries, kana) {
  const results = [];
  for (const entry of entries) {
    for (const j of entry.japanese) {
      if (j.reading === kana) {
        results.push({
          kanji: j.word || kana,
          readingKana: j.reading,
          meaning: entry.senses[0].english_definitions.slice(0, 3).join(', ')
        });
        break;
      }
    }
  }
  return results;
}

// From Jisho entries, extract tiles where japanese[].word === kanjiStr exactly.
function extractByKanji(entries, kanjiStr) {
  const results = [];
  for (const entry of entries) {
    for (const j of entry.japanese) {
      if (j.word === kanjiStr && j.reading) {
        results.push({
          kanji: j.word,
          readingKana: j.reading,
          meaning: entry.senses[0].english_definitions.slice(0, 3).join(', ')
        });
        break;
      }
    }
  }
  return results;
}

// Cache key: sort all query terms so that A+B and B+A hit the same entry.
function cacheKey(...terms) {
  return terms.filter(Boolean).sort().join('|');
}

// Result cache: key → [tileData, ...]
const apiCache = {};

IJ.dictionary = {
  /**
   * Look up all words reachable from 1–4 parallel searches.
   * Returns a deduplicated array of tile-data objects ([] if nothing found).
   *
   * @param {string} kana        - primary kana query (e.g. "つきみ")
   * @param {object} [opts]
   *   @param {string} [opts.kanaRev]   - reversed kana (e.g. "みつき")
   *   @param {string} [opts.kanji]     - forward kanji string (e.g. "月見")
   *   @param {string} [opts.kanjiRev]  - reversed kanji string (e.g. "見月")
   *
   * Strategies tried in parallel:
   *   1. Search by kana    → keep entries whose reading === kana
   *   2. Search by kanaRev → keep entries whose reading === kanaRev
   *   3. Search by kanji   → keep entries whose word   === kanji    (catches on-yomi)
   *   4. Search by kanjiRev→ keep entries whose word   === kanjiRev (catches on-yomi reversed)
   *
   * All hits are deduplicated and returned as an array.
   * If the API fails or returns nothing, the inline FALLBACK_DATA is checked.
   */
  async lookup(kana, { kanaRev = null, kanji = null, kanjiRev = null } = {}) {
    const key = cacheKey(kana, kanaRev, kanji, kanjiRev);

    if (apiCache[key] !== undefined) {
      return apiCache[key]; // already resolved — full array
    }

    // Deduplicate helper
    const seen = new Set();
    const pool = [];
    function add(r) {
      const id = r.kanji + '§' + r.readingKana;
      if (!seen.has(id)) { seen.add(id); pool.push(r); }
    }

    // Fire all unique queries in parallel
    const unique = [...new Set([kana, kanaRev, kanji, kanjiRev].filter(Boolean))];
    const fetched = await Promise.all(unique.map(q => searchJisho(q)));

    unique.forEach((q, i) => {
      const isKanjiQuery = (q === kanji || q === kanjiRev);
      if (isKanjiQuery) {
        extractByKanji(fetched[i], q).forEach(add);
      } else {
        extractByReading(fetched[i], q).forEach(add);
      }
    });

    // Offline fallback: check every query term against FALLBACK_DATA
    if (pool.length === 0) {
      for (const q of unique) {
        const fb = FALLBACK_DATA[q];
        if (fb) add({ ...fb });
      }
    }

    apiCache[key] = pool;
    return pool; // full array — caller decides how many to use
  },

  // Convert romaji string to hiragana string
  romajiToHiragana
};
