// Retro pixel art palette constants and canvas drawing helpers

export const PALETTE = {
  // Shared outlines & shadows
  outlineDark: '#090a0f',
  shadowFloor: 'rgba(0, 0, 0, 0.28)',
  
  // Slime
  slimeDark: '#14532d',
  slimeBase: '#16a34a',
  slimeLight: '#22c55e',
  slimeBright: '#86efac',
  slimeCore: '#4ade80',
  slimeEye: '#052e16',
  white: '#ffffff',

  // Goblin
  goblinDark: '#1e3a1e',
  goblinSkin: '#4d7c0f',
  goblinLight: '#65a30d',
  goblinLeather: '#78350f',
  goblinLeatherLight: '#92400e',
  goblinNose: '#3f6212',
  ironDark: '#334155',
  ironMid: '#64748b',
  ironLight: '#94a3b8',

  // Skeleton
  boneDark: '#64748b',
  boneMid: '#cbd5e1',
  boneLight: '#f1f5f9',
  boneEye: '#06b6d4',
  boneEyeGlow: '#67e8f9',
  woodBrown: '#451a03',
  woodMid: '#78350f',

  // Spider
  spiderCarapaceDark: '#1e1b4b',
  spiderCarapace: '#312e81',
  spiderCarapaceLight: '#4338ca',
  spiderBelly: '#581c87',
  spiderGlow: '#a855f7',
  toxicGreen: '#22c55e',
  spiderEye: '#ef4444',
  spiderEyeGlow: '#fca5a5',

  // Orc
  orcSkinDark: '#14532d',
  orcSkin: '#15803d',
  orcSkinLight: '#22c55e',
  orcHair: '#b91c1c',
  orcTusk: '#fef08a',
  orcArmor: '#1e293b',
  orcSpike: '#94a3b8',
  orcBloodStripe: '#dc2626',

  // Wraith
  wraithDeep: '#020617',
  wraithDark: '#0f172a',
  wraithMid: '#1e293b',
  wraithLight: '#38bdf8',
  wraithGlow: '#7dd3fc',
  wraithEye: '#e0f2fe',
  lanternGold: '#d97706',
  soulFire: '#06b6d4',
  soulFireLight: '#a5f3fc',

  // Knight
  knightPlatesDark: '#1e293b',
  knightPlatesMid: '#475569',
  knightPlatesLight: '#94a3b8',
  knightPlatesShine: '#e2e8f0',
  knightGold: '#eab308',
  knightGoldBright: '#fef08a',
  shieldRedDark: '#7f1d1d',
  shieldRed: '#dc2626',
  shieldRedLight: '#ef4444',
  visorGlow: '#38bdf8',

  // Magma Brute
  obsidianDark: '#0c0a09',
  obsidianMid: '#292524',
  obsidianLight: '#57534e',
  lavaDeep: '#9a3412',
  lavaMid: '#ea580c',
  lavaBright: '#f97316',
  lavaHot: '#fde047',
  lavaWhite: '#fef9c3',

  // Necromancer
  necroRobeDark: '#1e1b4b',
  necroRobeMid: '#4c1d95',
  necroRobeLight: '#6d28d9',
  necroGold: '#ca8a04',
  necroGoldLight: '#facc15',
  voidDark: '#3b0764',
  voidGlow: '#a855f7',
  voidCore: '#e9d5ff',
  skullMask: '#e2e8f0',

  // Boss: Bone Colossus
  bossBoneDark: '#334155',
  bossBoneMid: '#94a3b8',
  bossBoneLight: '#f8fafc',
  bossCrownGold: '#ca8a04',
  bossCrownGlow: '#fef08a',
  bossRuby: '#e11d48',
  bossNecroFlameDark: '#14532d',
  bossNecroFlameMid: '#16a34a',
  bossNecroFlameBright: '#4ade80',
  bossSoulGlow: '#bbf7d0',
  bossBladeDark: '#0f172a',
  bossBladeSteel: '#475569',
  bossCapeDark: '#450a0a',
  bossCapeRed: '#991b1b',
  bossCapeLight: '#dc2626',

  // ===== TIER 2: Deep Forest / Thicket (Лесная чаща) =====
  sandOutline: '#0f2415',          // Мох/косы дриады: обводка
  sandDark: '#1e3a24',             // Мох: темный
  sandBase: '#2d5a3a',             // Мох: базис
  sandMid: '#4c8c5f',              // Мох: светлый
  sandLight: '#93c5a4',            // Кожа дриады, фей
  sandBright: '#a7f3d0',           // Изумрудный свет
  scarabDark: '#1b120d',           // Ножка гриба: темная
  scarabBase: '#9f1d1d',           // Красная шляпка гриба
  scarabMid: '#dc2626',            // Алый гриб
  scarabLight: '#fca5a5',          // Споры, пятна гриба
  scarabGold: '#fbbf24',           // Янтарный свет фей
  mummyDark: '#1f120d',            // Кора корня: темная
  mummyShade: '#442912',           // Корни Гуля: кора
  mummyBase: '#7a4e29',            // Сухая гниль
  mummyLight: '#b48a58',           // Коричневый мох на корнях
  mummyEye: '#fbbf24',             // Тлеющий огонь изнутри корней
  scorpionDark: '#042f2e',         // Болото: темное
  scorpionBase: '#134e4a',         // Тина
  scorpionMid: '#115e59',          // Лапы болотной твари
  scorpionLight: '#14b8a6',        // Светильник
  scorpionAmber: '#67e8f9',        // Глаза рыси водяных огоньков
  basiliskDark: '#111c16',         // Лесная рысь: темная шерсть
  basiliskBase: '#2d3d26',         // Основа волка
  basiliskMid: '#5c7b43',          // Мох на спине
  basiliskLight: '#a3b98f',        // Лапы и морда рыси
  basiliskEye: '#4ade80',          // Свет зеленого волшебства
  basiliskJade: '#46b69a',
  anubisDark: '#111827',           // Рога, когти Лесного стража
  anubisBlue: '#334155',           // Шерсть оленя
  anubisLight: '#94a3b8',          // Костяные украшения, глаза ведьмы
  anubisGold: '#a16207',           // Деревянные оленьи рога
  anubisBright: '#fef08a',
  djinnDark: '#042f2e',            // Дух болот (светлячки)
  djinnBlue: '#134e4a',            // Тело мандрагора
  djinnLight: '#14b8a6',           // Колокольчик/глазок духа
  djinnGlow: '#67e8f9',            // Синий синий огонек
  djinnGold: '#fbbf24',
  sarcophagusDark: '#1a1a0a',      // Гном-голем: темная земля
  sarcophagusBase: '#3f6212',      // Основной мох Вьюнка
  sarcophagusLight: '#84a24b',     // Мох светлый, листва
  sarcophagusGold: '#fbbf24',
  sunPriestDark: '#1e3a24',        // Ведьма: глубокий лес
  sunPriestBlue: '#2c4c26',        // Плащ ведьмы
  sunPriestLight: '#5f7f40',       // Кожа ведьмы, мох
  sunPriestGold: '#a16207',        // Костяные маскировки, бубны
  sunGlow: '#fef08a',              // Свет зелья
  pharaohDark: '#121c14',          // Верхний Босс Энт-корень: тьма
  pharaohBlue: '#232d15',          // Ветки, толчки босса
  pharaohLight: '#3b4d1f',         // Толстая кора со спины
  pharaohGold: '#a16207',          // Живые рога-ветки, борода
  pharaohBright: '#fbbf24',
  pharaohRuby: '#dc2626',          // Красные мухоморы на боссе Энте
  pharaohSoulDark: '#052e16',
  pharaohSoul: '#16a34a',          // Древнейший зеленый дух Энта
  pharaohSoulBright: '#4ade80',
};

// Precise canvas drawing helpers for pixel art (no anti-aliasing)
export function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

export function drawOutlineRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: string,
  outlineColor: string
) {
  ctx.fillStyle = outlineColor;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  if (w > 2 && h > 2) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(Math.floor(x + 1), Math.floor(y + 1), Math.floor(w - 2), Math.floor(h - 2));
  }
}

export function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  rx: number,
  ry: number = 3,
  baseline: number = 56,
  alpha: number = 0.3
) {
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(Math.floor(cx), Math.floor(baseline + 1), rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
