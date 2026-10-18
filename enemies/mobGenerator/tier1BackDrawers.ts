import {
  PALETTE,
  drawRect,
  drawPixel,
  drawOutlineRect,
  drawGroundShadow,
} from "./palette";

export const BASELINE_Y = 56;

interface BackLegsOpts {
  leftX: number;
  rightX: number;
  hipY: number;
  legW: number;
  legColor: string;
  legShade: string;
  bootColor: string;
  soleColor?: string;
  bootH?: number;
}

/**
 * 4-кадровый цикл ходьбы СО СПИНЫ (моб уходит вверх от зрителя).
 * Когда нога отрывается от земли для шага вперед (от камеры),
 * зрителю видна темная подошва/каблук сапога, а опорная стопа стоит на плоскости y=55.
 */
function drawBackLegs(
  ctx: CanvasRenderingContext2D,
  frame: number,
  o: BackLegsOpts,
) {
  const plane = 55;
  const bootH = o.bootH ?? 4;
  const soleColor = o.soleColor ?? "#090a0f";
  const f = ((frame % 4) + 4) % 4;

  const renderSingleBackLeg = (
    x: number,
    lift: number,
    isStepping: boolean,
  ) => {
    const bottomY = plane - lift;
    const legH = Math.max(2, bottomY - o.hipY - bootH + 1);
    // Бедро и голень сзади
    drawRect(
      ctx,
      x,
      o.hipY,
      o.legW,
      legH,
      isStepping ? o.legShade : o.legColor,
    );
    // Икра / тень под коленом
    drawRect(ctx, x + 1, o.hipY + 2, Math.max(1, o.legW - 2), 2, o.legShade);
    // Сапог / стопа
    const bootTop = bottomY - bootH + 1;
    drawRect(ctx, x - 1, bootTop, o.legW + 2, bootH, o.bootColor);
    // Если нога приподнята в шаге от зрителя — показываем темную подошву и каблук
    if (lift > 0) {
      drawRect(ctx, x - 1, bottomY - 1, o.legW + 2, 2, soleColor);
      drawPixel(ctx, x, bottomY - 2, o.legShade);
    } else {
      // Каблук опорной ноги на плоскости y=55
      drawRect(ctx, x, plane, o.legW, 1, soleColor);
    }
  };

  if (f === 0) {
    // Левая нога шагает вперед-вверх (от нас), правая опорная на y=55
    renderSingleBackLeg(o.leftX, 4, true);
    renderSingleBackLeg(o.rightX, 0, false);
  } else if (f === 1) {
    // Фаза переноса: левая опускается, правая начинает отрыв
    renderSingleBackLeg(o.leftX, 0, false);
    renderSingleBackLeg(o.rightX, 2, true);
  } else if (f === 2) {
    // Правая нога шагает вперед-вверх (от нас), левая опорная на y=55
    renderSingleBackLeg(o.leftX, 0, false);
    renderSingleBackLeg(o.rightX, 4, true);
  } else {
    // Фаза переноса: правая опускается, левая начинает отрыв
    renderSingleBackLeg(o.leftX, 2, true);
    renderSingleBackLeg(o.rightX, 0, false);
  }
}

/**
 * 1. GREEN SLIME (Зеленый Слизень) — ВИД СО СПИНЫ (уходит вверх).
 * Глаз и рта не видно (они спереди), виден задний желеобразный купол,
 * спинной гребень, просвечивающее сквозь толщу ядро и капли слизи позади на плоскости y=55.
 */
export function drawSlimeBack(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;

  if (frame === 0) {
    // Широкое расплющивание перед толчком вверх
    drawGroundShadow(ctx, cx, 16, 4, BASELINE_Y, 0.4);
    drawOutlineRect(ctx, 16, 40, 32, 16, p.slimeBase, p.slimeDark);
    drawRect(ctx, 18, 38, 28, 2, p.slimeDark);
    drawRect(ctx, 19, 39, 26, 2, p.slimeLight);
    // Задняя часть купола (темнее внизу у подошвы, светлее на макушке)
    drawRect(ctx, 18, 42, 28, 12, p.slimeBase);
    drawRect(ctx, 20, 41, 24, 7, p.slimeLight);
    // Внутреннее ядро просвечивает сквозь спинку (приглушенное)
    drawRect(ctx, 29, 45, 6, 5, p.slimeDark);
    drawRect(ctx, 30, 46, 4, 3, p.slimeCore);
    // Спинной студенистый блик и пузырьки сзади
    drawRect(ctx, 25, 40, 14, 2, p.slimeBright);
    drawPixel(ctx, 23, 48, p.slimeBright);
    drawPixel(ctx, 40, 49, p.slimeBright);
    // Складки и капли слизи, остающиеся позади на плоскости y=55
    drawRect(ctx, 20, 53, 24, 2, p.slimeDark);
    drawRect(ctx, 22, 55, 4, 1, p.slimeLight);
    drawRect(ctx, 38, 55, 4, 1, p.slimeLight);
  } else if (frame === 1) {
    // Вытягивание вверх при отталкивании от зрителя
    drawGroundShadow(ctx, cx, 12, 3, BASELINE_Y, 0.35);
    drawOutlineRect(ctx, 20, 32, 24, 24, p.slimeBase, p.slimeDark);
    drawRect(ctx, 23, 30, 18, 3, p.slimeDark);
    drawRect(ctx, 24, 31, 16, 2, p.slimeLight);
    drawRect(ctx, 22, 34, 20, 18, p.slimeBase);
    drawRect(ctx, 24, 33, 16, 10, p.slimeLight);
    // Ядро сместилось выше
    drawRect(ctx, 29, 40, 6, 6, p.slimeDark);
    drawRect(ctx, 30, 41, 4, 4, p.slimeCore);
    // Вертикальные полосы натяжения геля со спины
    drawRect(ctx, 26, 35, 2, 12, p.slimeBright);
    drawRect(ctx, 36, 36, 2, 10, p.slimeLight);
    // Тянущийся след слизи внизу
    drawRect(ctx, 26, 53, 12, 3, p.slimeDark);
    drawPixel(ctx, 31, 55, p.slimeBright);
  } else if (frame === 2) {
    // Пик прыжка (в воздухе, улетает вперед от камеры)
    drawGroundShadow(ctx, cx, 9, 2.5, BASELINE_Y, 0.25);
    const yOff = -6;
    drawOutlineRect(ctx, 19, 34 + yOff, 26, 22, p.slimeBase, p.slimeDark);
    drawRect(ctx, 22, 32 + yOff, 20, 3, p.slimeDark);
    drawRect(ctx, 23, 33 + yOff, 18, 2, p.slimeLight);
    drawRect(ctx, 21, 36 + yOff, 22, 16, p.slimeBase);
    drawRect(ctx, 23, 35 + yOff, 18, 9, p.slimeLight);
    // Ядро внутри
    drawRect(ctx, 29, 41 + yOff, 6, 5, p.slimeDark);
    drawRect(ctx, 30, 42 + yOff, 4, 3, p.slimeCore);
    drawRect(ctx, 27, 34 + yOff, 10, 2, p.slimeBright);
    // Капли слизи, оторвавшиеся сзади-снизу
    drawRect(ctx, 28, 51, 3, 3, p.slimeBase);
    drawPixel(ctx, 29, 52, p.slimeBright);
    drawRect(ctx, 35, 54, 2, 2, p.slimeLight);
  } else {
    // Приземление на плоскость y=55
    drawGroundShadow(ctx, cx, 15, 3.5, BASELINE_Y, 0.4);
    drawOutlineRect(ctx, 17, 37, 30, 19, p.slimeBase, p.slimeDark);
    drawRect(ctx, 19, 35, 26, 3, p.slimeDark);
    drawRect(ctx, 20, 36, 24, 2, p.slimeLight);
    drawRect(ctx, 19, 39, 26, 14, p.slimeBase);
    drawRect(ctx, 21, 38, 22, 8, p.slimeLight);
    drawRect(ctx, 29, 44, 6, 5, p.slimeDark);
    drawRect(ctx, 30, 45, 4, 3, p.slimeCore);
    drawRect(ctx, 26, 37, 12, 2, p.slimeBright);
    drawPixel(ctx, 22, 46, p.slimeBright);
    drawPixel(ctx, 41, 45, p.slimeBright);
    drawRect(ctx, 21, 53, 22, 2, p.slimeDark);
  }
}

/**
 * 2. GOBLIN SCOUT (Гоблин-разведчик) — ВИД СО СПИНЫ.
 * Затылок с узлом банданы, большие уши с тыльной стороны, шнуровка кожаного жилета
 * на спине, поясная сумка и ножны, кинжал в правой руке.
 */
export function drawGoblinBack(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 14, 3, BASELINE_Y, 0.35);

  // Ноги со спины (показывают темные пятки/подошвы при беге от зрителя)
  drawBackLegs(ctx, frame, {
    leftX: 25,
    rightX: 35,
    hipY: 44,
    legW: 4,
    legColor: p.goblinSkin,
    legShade: p.goblinDark,
    bootColor: p.goblinLeather,
    soleColor: "#090a0f",
    bootH: 4,
  });

  // Кожаные штаны и ремень сзади
  drawRect(ctx, 25, 41 + bob, 14, 5, p.goblinLeather);
  drawRect(ctx, 26, 42 + bob, 12, 3, p.goblinLeatherLight);

  // Спина в кожаном жилете со шнуровкой
  drawOutlineRect(ctx, 24, 31 + bob, 16, 12, p.goblinLeather, p.goblinDark);
  drawRect(ctx, 26, 32 + bob, 12, 10, p.goblinLeatherLight);
  // Позвоночная шнуровка жилета крест-накрест
  drawRect(ctx, 31, 32 + bob, 2, 9, p.woodBrown);
  drawPixel(ctx, 30, 34 + bob, "#d97706");
  drawPixel(ctx, 33, 34 + bob, "#d97706");
  drawPixel(ctx, 30, 37 + bob, "#d97706");
  drawPixel(ctx, 33, 37 + bob, "#d97706");
  // Диагональный ремень и пустые ножны на спине
  drawRect(ctx, 27, 33 + bob, 2, 7, p.woodBrown);
  drawRect(ctx, 29, 36 + bob, 2, 5, p.woodBrown);
  // Поясная сумка разведчика на пояснице
  drawOutlineRect(ctx, 31, 39 + bob, 7, 6, p.woodMid, "#090a0f");
  drawPixel(ctx, 34, 41 + bob, "#facc15"); // застежка сумки

  // Руки (левая и правая с кинжалом) в противофазе шагам
  const leftArmSwing = frame === 0 ? 2 : frame === 2 ? -2 : 0;
  const rightArmSwing = -leftArmSwing;
  // Левая рука
  drawRect(ctx, 20, 33 + bob + leftArmSwing, 4, 8, p.goblinSkin);
  drawRect(ctx, 20, 39 + bob + leftArmSwing, 4, 2, p.goblinLeather);
  // Правая рука с кинжалом
  drawRect(ctx, 40, 33 + bob + rightArmSwing, 4, 7, p.goblinSkin);
  drawRect(ctx, 43, 32 + bob + rightArmSwing, 2, 4, p.woodMid);
  drawRect(ctx, 42, 30 + bob + rightArmSwing, 4, 2, p.ironMid);
  drawRect(ctx, 43, 24 + bob + rightArmSwing, 2, 6, p.ironLight);
  drawPixel(ctx, 44, 23 + bob + rightArmSwing, p.white);

  // Голова со спины (затылок и уши)
  const hy = 19 + bob;
  // Левое ухо с тыльной стороны
  drawPixel(ctx, 17, hy + 5, p.goblinDark);
  drawRect(ctx, 18, hy + 4, 3, 4, p.goblinSkin);
  drawRect(ctx, 21, hy + 3, 3, 6, p.goblinSkin);
  drawRect(ctx, 19, hy + 6, 4, 2, p.goblinDark);
  // Правое ухо с тыльной стороны
  drawRect(ctx, 40, hy + 3, 3, 6, p.goblinSkin);
  drawRect(ctx, 43, hy + 4, 3, 4, p.goblinSkin);
  drawPixel(ctx, 46, hy + 5, p.goblinDark);
  drawRect(ctx, 41, hy + 6, 4, 2, p.goblinDark);
  // Затылок
  drawOutlineRect(ctx, 24, hy, 16, 13, p.goblinSkin, p.goblinDark);
  drawRect(ctx, 26, hy + 1, 12, 6, p.goblinLight);
  // Тень шеи и затылочной впадины
  drawRect(ctx, 28, hy + 9, 8, 3, p.goblinDark);
  // Кожаная повязка-бандана с узлом на затылке
  drawRect(ctx, 24, hy + 4, 16, 3, p.goblinLeather);
  drawRect(ctx, 30, hy + 5, 4, 4, p.goblinLeatherLight); // узел
  drawRect(ctx, 29, hy + 8, 2, 4, p.goblinLeather); // левый хвост узла
  drawRect(ctx, 33, hy + 8, 2, 3, p.goblinLeather); // правый хвост узла
}

/**
 * 3. SKELETON INFANTRY (Скелет-пехотинец) — ВИД СО СПИНЫ.
 * Гладкий затылок черепа с трещиной-швом, детальный позвоночник и лопатки на спине,
 * щит с внутренней стороны (доски и ремни крепления), меч в правой руке.
 */
export function drawSkeletonBack(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 14, 3, BASELINE_Y, 0.35);

  // Костяные ноги со спины
  drawBackLegs(ctx, frame, {
    leftX: 27,
    rightX: 35,
    hipY: 43,
    legW: 3,
    legColor: p.boneLight,
    legShade: p.boneDark,
    bootColor: p.boneMid,
    soleColor: p.boneDark,
    bootH: 3,
  });

  // Крестец и тазовые кости сзади
  drawRect(ctx, 27, 40 + bob, 11, 4, p.boneMid);
  drawRect(ctx, 31, 40 + bob, 3, 4, p.boneLight); // крестец по центру
  drawPixel(ctx, 29, 42 + bob, p.boneDark);
  drawPixel(ctx, 35, 42 + bob, p.boneDark);

  // Спина: ребра, лопатки и позвоночный столб
  const ry = 28 + bob;
  // Темная полость внутри грудной клетки
  drawRect(ctx, 26, ry + 1, 13, 10, "#0f172a");
  // Задние дуги ребер
  drawRect(ctx, 25, ry + 2, 15, 2, p.boneMid);
  drawRect(ctx, 25, ry + 5, 15, 2, p.boneMid);
  drawRect(ctx, 27, ry + 8, 11, 2, p.boneDark);
  // Две треугольные лопатки (scapulae) на спине
  drawRect(ctx, 26, ry + 1, 4, 5, p.boneLight);
  drawRect(ctx, 35, ry + 1, 4, 5, p.boneLight);
  // Центральный позвоночник с остистыми отростками (выступает поверх ребер)
  drawRect(ctx, 31, ry - 1, 3, 13, p.boneLight);
  for (let y = 0; y < 12; y += 2) {
    drawPixel(ctx, 32, ry + y, p.white);
    drawPixel(ctx, 31, ry + y + 1, p.boneDark);
  }

  // Затылок черепа (без глазниц!)
  const sy = 14 + bob;
  drawOutlineRect(ctx, 25, sy, 15, 14, p.boneMid, p.boneDark);
  drawRect(ctx, 26, sy + 1, 13, 10, p.boneLight);
  // Черепной шов / трещина на затылке
  drawPixel(ctx, 32, sy + 3, p.boneDark);
  drawPixel(ctx, 32, sy + 4, p.boneDark);
  drawPixel(ctx, 31, sy + 5, p.boneDark);
  drawPixel(ctx, 33, sy + 5, p.boneDark);
  drawPixel(ctx, 30, sy + 6, p.boneDark);
  drawPixel(ctx, 34, sy + 6, p.boneDark);
  // Затылочное основание и шейные позвонки
  drawRect(ctx, 27, sy + 11, 11, 2, p.boneDark);
  drawRect(ctx, 31, sy + 12, 3, 3, p.boneLight);

  // Щит на левой руке (вид с внутренней стороны: доски и кожаный ремень для руки)
  const shSwing = frame === 0 ? 1 : frame === 2 ? -1 : 0;
  const shY = 28 + bob + shSwing;
  drawOutlineRect(ctx, 15, shY, 10, 14, p.woodBrown, p.ironDark);
  drawRect(ctx, 17, shY + 2, 6, 10, p.woodMid);
  // Железные скобы и ремень хвата внутри щита
  drawRect(ctx, 16, shY + 4, 8, 2, p.ironDark);
  drawRect(ctx, 16, shY + 9, 8, 2, p.ironDark);
  drawRect(ctx, 19, shY + 3, 3, 8, p.boneLight); // костяная кисть в ремне

  // Меч в правой руке
  const swBob = frame === 0 || frame === 1 ? -2 : 2;
  const swX = 41;
  const swY = 22 + bob + swBob;
  drawRect(ctx, swX + 2, swY - 8, 3, 14, p.ironLight);
  drawPixel(ctx, swX + 3, swY - 9, p.white);
  drawRect(ctx, swX, swY + 6, 7, 2, p.ironMid);
  drawRect(ctx, swX + 2, swY + 8, 3, 4, p.woodBrown);
  drawRect(ctx, 39, swY + 8, 4, 3, p.boneLight); // костяная кисть
}

/**
 * 4. TOXIC SPIDER (Пещерный паук) — ВИД СО СПИНЫ (уходит вверх).
 * Крупное брюшко на переднем плане перед камерой с паутинными бородавками
 * и каплей яда сзади, головогрудь частично видна спереди-сверху, 8 лап по бокам.
 */
export function drawSpiderBack(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? 1 : 0;

  drawGroundShadow(ctx, cx, 20, 4, BASELINE_Y, 0.4);

  // 8 членистых лап расходятся влево и вправо, касаясь плоскости y=55
  const groupA = frame === 0 || frame === 1;
  const drawSpiderSideLeg = (
    side: -1 | 1,
    attachY: number,
    kneeSpan: number,
    footSpan: number,
    footY: number,
    planted: boolean,
  ) => {
    const ax = side === -1 ? 23 : 40;
    const kx = ax + side * kneeSpan;
    const fx = ax + side * footSpan;
    const lift = planted ? 0 : 4;
    const actualFootY = footY - lift;
    // Бедро вверх-вбок
    drawRect(
      ctx,
      Math.min(ax, kx),
      attachY - 3 + bob,
      Math.abs(kx - ax) + 2,
      3,
      p.spiderCarapaceDark,
    );
    // Голень к земле
    drawRect(
      ctx,
      side === -1 ? fx : kx,
      attachY - 1 + bob,
      3,
      Math.max(4, actualFootY - (attachY - 1 + bob)),
      p.spiderCarapaceLight,
    );
    // Лапка на плоскости y=55
    drawRect(
      ctx,
      fx - 1,
      actualFootY - 1,
      4,
      2,
      planted ? p.toxicGreen : p.spiderCarapaceLight,
    );
  };

  // Левые 4 лапы
  drawSpiderSideLeg(-1, 30, 6, 13, 55, groupA);
  drawSpiderSideLeg(-1, 33, 8, 15, 55, !groupA);
  drawSpiderSideLeg(-1, 36, 7, 12, 55, groupA);
  drawSpiderSideLeg(-1, 39, 5, 9, 55, !groupA);

  // Правые 4 лапы
  drawSpiderSideLeg(1, 30, 6, 13, 55, !groupA);
  drawSpiderSideLeg(1, 33, 8, 15, 55, groupA);
  drawSpiderSideLeg(1, 36, 7, 12, 55, !groupA);
  drawSpiderSideLeg(1, 39, 5, 9, 55, groupA);

  // Передняя головогрудь (видна сверху дальше от зрителя, без глаз)
  const cy = 22 + bob;
  drawOutlineRect(ctx, 25, cy, 14, 10, p.spiderCarapace, p.spiderCarapaceDark);
  drawRect(ctx, 27, cy + 2, 10, 5, p.spiderCarapaceLight);

  // Крупное шарообразное брюшко НА ПЕРЕДНЕМ ПЛАНЕ (ближе к зрителю)
  const by = 28 + bob;
  drawOutlineRect(ctx, 20, by, 24, 18, p.spiderBelly, p.spiderCarapaceDark);
  drawRect(ctx, 22, by + 2, 20, 14, p.spiderCarapace);
  // Ядовитый неоновый череп/песочные часы на спине брюшка
  drawRect(ctx, 29, by + 3, 6, 2, p.toxicGreen);
  drawRect(ctx, 30, by + 5, 4, 3, "#86efac");
  drawRect(ctx, 28, by + 8, 8, 3, p.toxicGreen);
  drawPixel(ctx, 26, by + 6, p.spiderGlow);
  drawPixel(ctx, 37, by + 6, p.spiderGlow);

  // Паутинные бородавки (spinnerets) сзади-снизу брюшка + капля токсина
  drawRect(ctx, 29, by + 17, 2, 3, p.spiderCarapaceDark);
  drawRect(ctx, 33, by + 17, 2, 3, p.spiderCarapaceDark);
  if (frame === 1 || frame === 3) {
    drawRect(ctx, 31, by + 18, 2, 3, p.toxicGreen);
    drawPixel(ctx, 31, by + 21, "#86efac");
  }
}

/**
 * 5. ORC BERSERKER (Орк-берсерк) — ВИД СО СПИНЫ.
 * Мощная спина с перекрестными ремнями и кольцом, красный ирокез вдоль затылка,
 * шипастый наплечник слева, меховая набедренная повязка сзади и моргенштерн справа.
 */
export function drawOrcBack(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 16, 4, BASELINE_Y, 0.45);

  // Тяжелые ноги в кованых сапогах со спины
  drawBackLegs(ctx, frame, {
    leftX: 24,
    rightX: 34,
    hipY: 43,
    legW: 6,
    legColor: p.orcArmor,
    legShade: "#0f172a",
    bootColor: p.ironMid,
    soleColor: "#090a0f",
    bootH: 4,
  });

  // Меховая повязка и тяжелый пояс со спины
  drawRect(ctx, 22, 40 + bob, 20, 5, p.orcArmor);
  drawRect(ctx, 25, 42 + bob, 14, 4, p.goblinLeather);

  // Широкая мускулистая спина
  const ty = 25 + bob;
  drawOutlineRect(ctx, 21, ty, 22, 16, p.orcSkin, p.orcSkinDark);
  drawRect(ctx, 23, ty + 2, 18, 12, p.orcSkinLight);
  // Рельеф лопаток и позвоночной ложбинки на спине
  drawRect(ctx, 31, ty + 2, 2, 12, p.orcSkinDark);
  drawRect(ctx, 24, ty + 6, 5, 2, p.orcSkinDark);
  drawRect(ctx, 35, ty + 6, 5, 2, p.orcSkinDark);

  // Перекрестные кожаные ремни берсерка на спине с железным кольцом в центре
  drawRect(ctx, 24, ty + 2, 3, 3, p.goblinLeather);
  drawRect(ctx, 27, ty + 5, 3, 3, p.goblinLeather);
  drawRect(ctx, 34, ty + 5, 3, 3, p.goblinLeather);
  drawRect(ctx, 37, ty + 2, 3, 3, p.goblinLeather);
  drawRect(ctx, 25, ty + 10, 3, 3, p.goblinLeather);
  drawRect(ctx, 36, ty + 10, 3, 3, p.goblinLeather);
  drawOutlineRect(ctx, 29, ty + 6, 6, 5, p.ironMid, p.ironDark); // кольцо на спине

  // Шипастый железный наплечник на левом плече
  drawOutlineRect(ctx, 16, ty - 1, 8, 8, p.ironMid, p.ironDark);
  drawPixel(ctx, 15, ty - 2, p.orcSpike);
  drawPixel(ctx, 19, ty - 3, p.orcSpike);
  drawPixel(ctx, 22, ty - 2, p.orcSpike);

  // Левая рука
  const armSwing = frame === 0 ? 2 : frame === 2 ? -2 : 0;
  drawRect(ctx, 17, ty + 7 + armSwing, 5, 7, p.orcSkin);
  drawRect(ctx, 17, ty + 12 + armSwing, 5, 2, p.orcArmor);

  // Затылок и красный ирокез
  const hy = 13 + bob;
  drawOutlineRect(ctx, 24, hy, 16, 13, p.orcSkin, p.orcSkinDark);
  drawRect(ctx, 26, hy + 2, 12, 8, p.orcSkinLight);
  // Уши орка по бокам
  drawRect(ctx, 22, hy + 4, 2, 4, p.orcSkin);
  drawRect(ctx, 40, hy + 4, 2, 4, p.orcSkin);
  // Мощный красный ирокез идет прямо вдоль затылка сверху вниз до шеи!
  drawRect(ctx, 30, hy - 5, 4, 17, p.orcHair);
  drawRect(ctx, 31, hy - 6, 2, 16, "#ef4444");

  // Правая рука с шипастым моргенштерном
  const wy = frame === 0 || frame === 1 ? 16 + bob : 20 + bob;
  drawRect(ctx, 42, ty + 3 - armSwing, 5, 7, p.orcSkin);
  drawRect(ctx, 45, wy, 3, 18, p.woodMid);
  drawOutlineRect(ctx, 42, wy - 6, 9, 8, p.ironMid, p.ironDark);
  drawPixel(ctx, 46, wy - 8, p.orcSpike);
  drawPixel(ctx, 40, wy - 3, p.orcSpike);
  drawPixel(ctx, 52, wy - 3, p.orcSpike);
}

/**
 * 6. CRYPT WRAITH (Призрак теней) — ВИД СО СПИНЫ.
 * Глубокий капюшон со спины с длинным качающимся хвостом-шлейфом между лопаток,
 * светящиеся руны на спине плаща, раздвоенный призрачный шлейф касается y=55,
 * фонарь душ справа.
 */
export function drawWraithBack(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const floatY = Math.round(Math.sin((frame / 4) * Math.PI * 2) * 2);
  const sway = frame === 0 ? -2 : frame === 2 ? 2 : 0;

  drawGroundShadow(ctx, cx, 15, 3.5, BASELINE_Y, 0.25);

  // Нижний призрачный шлейф мантии касается плоскости y=55
  drawRect(ctx, 25 + sway, 45 + floatY, 14, 6, p.wraithDark);
  drawRect(ctx, 27 + sway, 50, 4, 5, p.wraithMid);
  drawRect(ctx, 33 + sway, 49, 4, 6, p.wraithMid);
  drawPixel(ctx, 28 + sway, 55, p.wraithLight);
  drawPixel(ctx, 35 + sway, 55, p.wraithLight);

  // Спина савана с вертикальными складками и некро-узором
  const by = 25 + floatY;
  drawOutlineRect(ctx, 21, by, 22, 22, p.wraithDark, p.wraithDeep);
  drawRect(ctx, 23, by + 2, 18, 18, p.wraithMid);
  // Складки плаща со спины
  drawRect(ctx, 26, by + 3, 2, 16, p.wraithDeep);
  drawRect(ctx, 36, by + 3, 2, 16, p.wraithDeep);
  // Светящийся эфирный позвоночный рунный знак на спине
  drawRect(ctx, 31, by + 4, 2, 13, p.wraithLight);
  drawRect(ctx, 28, by + 7, 8, 2, p.wraithLight);
  drawPixel(ctx, 31, by + 7, p.wraithEye);

  // Капюшон со спины (без лица!) с длинным хвостом капюшона
  const hy = 11 + floatY;
  drawOutlineRect(ctx, 23, hy, 18, 15, p.wraithDark, p.wraithDeep);
  drawRect(ctx, 25, hy + 2, 14, 11, p.wraithMid);
  // Острый хвост капюшона свисает на спину и качается при полете
  drawRect(ctx, 29 + sway, hy + 8, 6, 11, p.wraithDark);
  drawRect(ctx, 30 + sway, hy + 10, 4, 8, p.wraithLight);
  drawPixel(ctx, 31 + sway, hy + 19, p.wraithGlow);

  // Фонарь душ справа на цепи
  const lx = 45 + sway;
  const ly = 24 + floatY;
  drawPixel(ctx, lx, ly - 4, p.ironMid);
  drawPixel(ctx, lx, ly - 2, p.ironLight);
  drawRect(ctx, lx - 3, ly, 7, 2, p.lanternGold);
  drawRect(ctx, lx - 4, ly + 2, 9, 8, "#0f172a");
  drawRect(ctx, lx - 2, ly + 3, 5, 6, p.soulFire);
  drawPixel(ctx, lx, ly + 5, p.soulFireLight);
  drawRect(ctx, lx - 3, ly + 10, 7, 2, p.lanternGold);
}

/**
 * 7. IRONCLAD KNIGHT (Бронированный рыцарь) — ВИД СО СПИНЫ.
 * Затылок топхелма с золотым султаном, ниспадающим назад, алый геральдический плащ
 * с золотым крестом поверх стальной спины, внутренняя сторона щита слева и булава справа.
 */
export function drawKnightBack(ctx: CanvasRenderingContext2D, frame: number) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 16, 4, BASELINE_Y, 0.45);

  // Тяжелые латные поножи и сабатоны со спины
  drawBackLegs(ctx, frame, {
    leftX: 25,
    rightX: 34,
    hipY: 44,
    legW: 5,
    legColor: p.knightPlatesMid,
    legShade: p.knightPlatesDark,
    bootColor: p.knightPlatesLight,
    soleColor: "#090a0f",
    bootH: 4,
  });

  // Стальная кираса и наплечники со спины
  const cy = 24 + bob;
  drawOutlineRect(ctx, 22, cy, 20, 20, p.knightPlatesMid, p.knightPlatesDark);
  drawRect(ctx, 24, cy + 2, 16, 16, p.knightPlatesLight);
  // Латные наплечники
  drawOutlineRect(ctx, 19, cy, 6, 8, p.knightPlatesLight, p.knightPlatesDark);
  drawOutlineRect(ctx, 39, cy, 6, 8, p.knightPlatesLight, p.knightPlatesDark);

  // Геральдический алый плащ во всю спину с золотым крестом
  const capeSway = frame === 0 ? -1 : frame === 2 ? 1 : 0;
  drawOutlineRect(
    ctx,
    24 + capeSway,
    cy + 2,
    16,
    19,
    p.shieldRed,
    p.knightPlatesDark,
  );
  drawRect(ctx, 26 + capeSway, cy + 4, 12, 15, p.shieldRedDark);
  // Золотой орденский крест на плаще
  drawRect(ctx, 31 + capeSway, cy + 6, 2, 11, p.knightGold);
  drawRect(ctx, 28 + capeSway, cy + 9, 8, 2, p.knightGold);
  drawPixel(ctx, 31 + capeSway, cy + 9, p.knightGoldBright);

  // Башенный щит слева (вид со спины — виден стальной обод и ремни)
  const shY = 23 + bob;
  drawOutlineRect(ctx, 13, shY, 8, 21, p.knightPlatesMid, p.knightPlatesDark);
  drawRect(ctx, 15, shY + 2, 4, 17, p.woodBrown);
  drawRect(ctx, 14, shY + 6, 6, 2, p.knightGold);
  drawRect(ctx, 14, shY + 14, 6, 2, p.knightGold);

  // Шлем-топхелм со спины (без забрала!) + пышный золотой султан
  const hy = 11 + bob;
  drawOutlineRect(ctx, 25, hy, 14, 14, p.knightPlatesMid, p.knightPlatesDark);
  drawRect(ctx, 27, hy + 2, 10, 10, p.knightPlatesLight);
  // Затылочный вертикальный шов и заклепки шлема
  drawRect(ctx, 31, hy + 2, 2, 10, p.knightPlatesDark);
  drawPixel(ctx, 29, hy + 5, p.knightPlatesShine);
  drawPixel(ctx, 34, hy + 5, p.knightPlatesShine);
  // Золотой султан ниспадает по затылку шлема
  drawRect(ctx, 29, hy - 5, 6, 6, p.knightGold);
  drawRect(ctx, 30, hy - 6, 4, 4, p.knightGoldBright);
  drawRect(ctx, 30, hy + 1, 4, 7, p.knightGold);

  // Перчатка и булава в правой руке
  const my = frame === 0 || frame === 1 ? 18 + bob : 22 + bob;
  drawRect(ctx, 43, my, 3, 16, p.knightPlatesMid);
  drawOutlineRect(
    ctx,
    41,
    my - 6,
    7,
    7,
    p.knightPlatesLight,
    p.knightPlatesDark,
  );
  drawPixel(ctx, 44, my - 7, p.knightPlatesShine);
  drawPixel(ctx, 40, my - 3, p.knightPlatesShine);
  drawPixel(ctx, 48, my - 3, p.knightPlatesShine);
}

/**
 * 8. MAGMA BRUTE (Магматический голем) — ВИД СО СПИНЫ.
 * Массивный базальтовый горб с 3 пылающими вулканическими кратерами на спине,
 * лавовые трещины вдоль позвоночника, расплавленные следы от пяток на плоскости y=55.
 */
export function drawMagmaBruteBack(
  ctx: CanvasRenderingContext2D,
  frame: number,
) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 18, 4.5, BASELINE_Y, 0.5);

  // Базальтовые ноги-колонны со спины
  drawBackLegs(ctx, frame, {
    leftX: 22,
    rightX: 35,
    hipY: 42,
    legW: 7,
    legColor: p.obsidianMid,
    legShade: p.obsidianDark,
    bootColor: p.obsidianLight,
    soleColor: p.lavaBright,
    bootH: 5,
  });
  // Пылающие следы лавы от пяток на плоскости y=55
  if (frame === 0) drawRect(ctx, 34, 55, 9, 1, p.lavaHot);
  if (frame === 2) drawRect(ctx, 21, 55, 9, 1, p.lavaHot);

  // Широкая каменная спина с вулканическими разломами
  const ty = 22 + bob;
  drawOutlineRect(ctx, 19, ty, 26, 21, p.obsidianMid, p.obsidianDark);
  drawRect(ctx, 21, ty + 2, 22, 17, p.obsidianDark);
  // Каменные спинные плиты
  drawRect(ctx, 22, ty + 3, 7, 6, p.obsidianLight);
  drawRect(ctx, 35, ty + 3, 7, 6, p.obsidianLight);
  drawRect(ctx, 23, ty + 12, 6, 5, p.obsidianMid);
  drawRect(ctx, 35, ty + 12, 6, 5, p.obsidianMid);

  // Y-образный магматический разлом вдоль хребта и спинные кратеры
  drawRect(ctx, 30, ty + 4, 4, 14, p.lavaDeep);
  drawRect(ctx, 31, ty + 5, 2, 12, p.lavaBright);
  drawRect(ctx, 26, ty + 8, 12, 3, p.lavaMid);
  drawRect(ctx, 29, ty + 7, 6, 5, p.lavaHot);
  drawPixel(ctx, 31, ty + 9, p.lavaWhite);
  drawPixel(ctx, 32, ty + 9, p.lavaWhite);

  // Затылок каменной головы и лавовые рога (без глазной щели!)
  const hy = 11 + bob;
  drawRect(ctx, 22, hy - 4, 3, 5, p.lavaDeep);
  drawPixel(ctx, 21, hy - 5, p.lavaBright);
  drawRect(ctx, 39, hy - 4, 3, 5, p.lavaDeep);
  drawPixel(ctx, 42, hy - 5, p.lavaBright);
  drawOutlineRect(ctx, 25, hy, 14, 12, p.obsidianMid, p.obsidianDark);
  drawRect(ctx, 27, hy + 2, 10, 8, p.obsidianDark);
  // Затылочное жерло с лавой
  drawRect(ctx, 30, hy + 4, 4, 4, p.lavaBright);
  drawPixel(ctx, 31, hy + 5, p.lavaHot);

  // Огромные базальтовые кулаки по бокам
  const armSwing = frame === 0 ? 2 : frame === 2 ? -2 : 0;
  drawOutlineRect(
    ctx,
    13,
    ty + 5 + armSwing,
    7,
    10,
    p.obsidianMid,
    p.obsidianDark,
  );
  drawRect(ctx, 15, ty + 8 + armSwing, 3, 3, p.lavaBright);
  drawOutlineRect(
    ctx,
    44,
    ty + 5 - armSwing,
    7,
    10,
    p.obsidianMid,
    p.obsidianDark,
  );
  drawRect(ctx, 46, ty + 8 - armSwing, 3, 3, p.lavaBright);

  // Взлетающие со спины искры
  const sparkY = (frame * 3) % 10;
  drawPixel(ctx, 28, ty - 2 - sparkY, p.lavaHot);
  drawPixel(ctx, 36, ty - 4 - sparkY, p.lavaBright);
}

/**
 * 9. VOID NECROMANCER (Чумной Некромант) — ВИД СО СПИНЫ.
 * Высокий остроконечный капюшон сзади (без маски черепа!), мантия с вышитым
 * золотым Символом Ока Бездны на спине, посох с парящей сферой справа.
 */
export function drawNecromancerBack(
  ctx: CanvasRenderingContext2D,
  frame: number,
) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 15, 3.5, BASELINE_Y, 0.4);

  // Шаги сапог под подолом мантии на плоскости y=55
  drawBackLegs(ctx, frame, {
    leftX: 26,
    rightX: 34,
    hipY: 47,
    legW: 4,
    legColor: p.necroRobeDark,
    legShade: "#090a0f",
    bootColor: p.skullMask,
    soleColor: "#090a0f",
    bootH: 3,
  });

  // Оккультная мантия со спины
  const ry = 24 + bob;
  drawOutlineRect(ctx, 21, ry, 20, 29, p.necroRobeDark, "#090a0f");
  drawRect(ctx, 23, ry + 2, 16, 25, p.necroRobeMid);
  // Широкая золотая стоola и рунический узор Ока Бездны на спине мантии
  drawRect(ctx, 29, ry + 2, 4, 25, p.necroGold);
  drawOutlineRect(ctx, 26, ry + 6, 10, 8, p.voidDark, p.necroGoldLight);
  drawRect(ctx, 29, ry + 8, 4, 4, p.voidGlow);
  drawPixel(ctx, 30, ry + 9, p.voidCore);
  drawPixel(ctx, 30, ry + 16, p.necroGoldLight);
  drawPixel(ctx, 31, ry + 21, p.necroGoldLight);

  // Капюшон со спины с золотыми рожками
  const hy = 10 + bob;
  drawRect(ctx, 23, hy, 2, 6, p.necroGold);
  drawRect(ctx, 39, hy, 2, 6, p.necroGold);
  drawOutlineRect(ctx, 24, hy, 14, 15, p.necroRobeDark, "#090a0f");
  drawRect(ctx, 26, hy + 2, 10, 11, p.necroRobeMid);
  // Золотой шов капюшона и острый кончик сзади
  drawRect(ctx, 30, hy + 2, 2, 11, p.necroGold);
  drawRect(ctx, 23, hy + 13, 16, 2, p.necroGold);

  // Посох Бездны в правой руке
  const staffBob = frame === 0 || frame === 1 ? -1 : 1;
  const sx = 44;
  const sy = 16 + bob + staffBob;
  drawRect(ctx, sx + 2, sy + 6, 2, 34, p.woodBrown);
  drawRect(ctx, sx, sy + 4, 6, 3, p.skullMask);
  const orbY = sy - 4 + (frame % 2 === 0 ? -1 : 1);
  drawOutlineRect(ctx, sx - 2, orbY, 9, 9, p.voidDark, p.voidGlow);
  drawRect(ctx, sx - 1, orbY + 1, 7, 7, p.voidGlow);
  drawRect(ctx, sx, orbY + 2, 5, 5, p.voidCore);
  drawPixel(ctx, sx + 2, orbY + 3, p.white);
  const orbitX = Math.round(Math.cos(frame * 1.57) * 7);
  drawPixel(ctx, sx + 2 + orbitX, orbY + 4, p.necroGoldLight);
}

/**
 * 10. BOSS: BONE COLOSSUS (БОСС: Костяной Колосс) — ВИД СО СПИНЫ.
 * Громадный 64x64 силуэт со спины: рогатый затылок черепа с золотой короной,
 * исполинские шипастые наплечники, широкий рваный багровый плащ на переднем плане
 * с пылающим сквозь броню изумрудным некро-позвоночником и гигантским Рунным Клинком справа.
 */
export function drawBoneColossusBack(
  ctx: CanvasRenderingContext2D,
  frame: number,
) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  drawGroundShadow(ctx, cx, 24, 6, BASELINE_Y, 0.55);

  // Титанические костяные ноги со спины (видны под рваным краем плаща)
  drawBackLegs(ctx, frame, {
    leftX: 20,
    rightX: 36,
    hipY: 41,
    legW: 8,
    legColor: p.bossBoneMid,
    legShade: p.bossBoneDark,
    bootColor: p.bossBoneLight,
    soleColor: "#090a0f",
    bootH: 5,
  });
  // Изумрудные расколы земли под пятками на плоскости y=55
  if (frame === 0) drawRect(ctx, 33, 55, 14, 1, p.bossNecroFlameBright);
  if (frame === 2) drawRect(ctx, 17, 55, 14, 1, p.bossNecroFlameBright);

  // Широкая спина бронированного скелета-титана
  const by = 20 + bob;
  drawOutlineRect(ctx, 18, by, 28, 22, p.bossBoneMid, p.bossBoneDark);

  // Царский рваный багровый плащ НА ПЕРЕДНЕМ ПЛАНЕ (закрывает спину босса)
  const capeWave = frame === 0 ? -2 : frame === 2 ? 2 : 0;
  drawOutlineRect(
    ctx,
    16 + capeWave,
    by + 2,
    32,
    27,
    p.bossCapeDark,
    "#090a0f",
  );
  drawRect(ctx, 18 + capeWave, by + 4, 28, 22, p.bossCapeRed);
  drawRect(ctx, 21 + capeWave, by + 6, 22, 18, p.bossCapeDark);
  // Рваные зубья подола плаща
  drawRect(ctx, 17 + capeWave, by + 27, 5, 4, p.bossCapeLight);
  drawRect(ctx, 25 + capeWave, by + 28, 6, 4, p.bossCapeRed);
  drawRect(ctx, 34 + capeWave, by + 28, 6, 4, p.bossCapeRed);
  drawRect(ctx, 42 + capeWave, by + 27, 5, 4, p.bossCapeLight);

  // Изумрудный некротический позвоночник и руны Рока, пылающие поверх хребта плаща
  const glow = frame % 2 === 0 ? p.bossNecroFlameBright : p.bossSoulGlow;
  drawOutlineRect(ctx, 28 + capeWave, by + 3, 8, 19, p.bossBoneDark, "#090a0f");
  drawRect(ctx, 30 + capeWave, by + 4, 4, 17, p.bossNecroFlameMid);
  for (let y = 0; y < 16; y += 3) {
    drawRect(ctx, 29 + capeWave, by + 5 + y, 6, 2, glow);
    drawPixel(ctx, 31 + capeWave, by + 5 + y, p.white);
  }

  // Исполинские шипастые наплечники-башни со спины
  const sy = 16 + bob;
  drawOutlineRect(ctx, 10, sy, 12, 11, p.bossBoneMid, p.bossBoneDark);
  drawRect(ctx, 12, sy + 2, 8, 6, p.bossBoneLight);
  drawPixel(ctx, 10, sy - 3, p.bossBoneLight);
  drawPixel(ctx, 14, sy - 5, p.bossBoneLight);
  drawPixel(ctx, 18, sy - 4, p.bossBoneLight);

  drawOutlineRect(ctx, 42, sy, 12, 11, p.bossBoneMid, p.bossBoneDark);
  drawRect(ctx, 44, sy + 2, 8, 6, p.bossBoneLight);
  drawPixel(ctx, 45, sy - 4, p.bossBoneLight);
  drawPixel(ctx, 49, sy - 5, p.bossBoneLight);
  drawPixel(ctx, 53, sy - 3, p.bossBoneLight);

  // Гигантский рогатый череп и золотая корона СО СПИНЫ (y=6)
  const hy = 6 + bob;
  // Демонические рога расходятся в стороны
  drawRect(ctx, 18, hy, 4, 7, p.bossBoneMid);
  drawRect(ctx, 14, hy - 4, 5, 5, p.bossBoneLight);
  drawPixel(ctx, 13, hy - 5, p.bossBoneLight);
  drawRect(ctx, 42, hy, 4, 7, p.bossBoneMid);
  drawRect(ctx, 45, hy - 4, 5, 5, p.bossBoneLight);
  drawPixel(ctx, 50, hy - 5, p.bossBoneLight);

  // Корона Владыки со спины
  drawRect(ctx, 24, hy - 2, 16, 4, p.bossCrownGold);
  drawPixel(ctx, 24, hy - 4, p.bossCrownGlow);
  drawPixel(ctx, 28, hy - 5, p.bossCrownGlow);
  drawPixel(ctx, 32, hy - 6, p.bossCrownGlow);
  drawPixel(ctx, 36, hy - 5, p.bossCrownGlow);
  drawPixel(ctx, 40, hy - 4, p.bossCrownGlow);
  drawPixel(ctx, 32, hy - 2, p.bossRuby);

  // Затылок черепа (без глаз и зубов!) с мощным затылочным гребнем
  drawOutlineRect(ctx, 24, hy + 2, 16, 14, p.bossBoneMid, p.bossBoneDark);
  drawRect(ctx, 26, hy + 4, 12, 9, p.bossBoneLight);
  drawRect(ctx, 31, hy + 3, 2, 11, p.bossBoneDark); // затылочный шов
  drawRect(ctx, 28, hy + 8, 8, 2, p.bossBoneMid);

  // Колоссальный Рунический Клинок в правой руке
  const wy = frame === 0 || frame === 1 ? 14 + bob : 18 + bob;
  const wx = 52;
  drawRect(ctx, wx, wy - 8, 4, 34, p.bossBladeDark);
  drawRect(ctx, wx + 1, wy - 6, 2, 30, p.bossBladeSteel);
  drawPixel(ctx, wx - 1, wy - 2, p.bossNecroFlameBright);
  drawPixel(ctx, wx - 1, wy + 4, p.bossNecroFlameBright);
  drawPixel(ctx, wx - 1, wy + 10, p.bossNecroFlameBright);
  drawPixel(ctx, wx - 1, wy + 16, p.bossNecroFlameBright);
  drawPixel(ctx, wx + 1, wy - 9, p.bossSoulGlow);
  drawRect(ctx, wx - 2, wy + 26, 8, 3, p.bossCrownGold);
  drawRect(ctx, wx, wy + 28, 5, 4, p.bossBoneLight);
}

/**
 * Фронтальные (Front View — идут вниз на зрителя) версии мобов Тира 1
 * для поддержки всех 3 ракурсов (Спина / Бок / Фронт).
 */
export function drawTier1Front(
  ctx: CanvasRenderingContext2D,
  mobId: number,
  frame: number,
) {
  const p = PALETTE;
  const cx = 32;
  const bob = frame % 2 === 1 ? -1 : 0;

  if (mobId === 1) {
    // Slime Front
    const yOff = frame === 2 ? -6 : 0;
    drawGroundShadow(ctx, cx, frame === 2 ? 9 : 15, 3.5, BASELINE_Y, 0.38);
    drawOutlineRect(ctx, 17, 38 + yOff, 30, 18, p.slimeBase, p.slimeDark);
    drawRect(ctx, 19, 40 + yOff, 26, 13, p.slimeLight);
    drawRect(ctx, 21, 41 + yOff, 9, 3, p.slimeBright);
    drawRect(ctx, 29, 45 + yOff, 6, 6, p.slimeCore);
    drawRect(ctx, 24, 44 + yOff, 3, 4, p.slimeEye);
    drawPixel(ctx, 24, 44 + yOff, p.white);
    drawRect(ctx, 37, 44 + yOff, 3, 4, p.slimeEye);
    drawPixel(ctx, 37, 44 + yOff, p.white);
    return;
  }

  if (mobId === 2) {
    // Goblin Front
    drawGroundShadow(ctx, cx, 14, 3, BASELINE_Y, 0.35);
    drawBackLegs(ctx, frame, {
      leftX: 26,
      rightX: 34,
      hipY: 45,
      legW: 4,
      legColor: p.goblinSkin,
      legShade: p.goblinDark,
      bootColor: p.goblinLeather,
    });
    drawOutlineRect(ctx, 25, 32 + bob, 14, 13, p.goblinSkin, p.goblinDark);
    drawRect(ctx, 26, 33 + bob, 3, 10, p.goblinLeather);
    drawRect(ctx, 35, 33 + bob, 3, 10, p.goblinLeather);
    const hy = 19 + bob;
    drawRect(ctx, 18, hy + 4, 6, 4, p.goblinSkin);
    drawRect(ctx, 40, hy + 4, 6, 4, p.goblinSkin);
    drawOutlineRect(ctx, 24, hy, 16, 14, p.goblinSkin, p.goblinDark);
    drawRect(ctx, 27, hy + 4, 3, 3, "#facc15");
    drawPixel(ctx, 28, hy + 5, "#000000");
    drawRect(ctx, 34, hy + 4, 3, 3, "#facc15");
    drawPixel(ctx, 35, hy + 5, "#000000");
    drawRect(ctx, 30, hy + 7, 4, 3, p.goblinNose);
    drawRect(ctx, 41, 27 + bob, 2, 9, p.ironLight);
    return;
  }

  if (mobId === 3) {
    // Skeleton Front
    drawGroundShadow(ctx, cx, 14, 3, BASELINE_Y, 0.35);
    drawBackLegs(ctx, frame, {
      leftX: 27,
      rightX: 35,
      hipY: 43,
      legW: 3,
      legColor: p.boneLight,
      legShade: p.boneDark,
      bootColor: p.boneMid,
    });
    drawRect(ctx, 31, 28 + bob, 3, 14, p.boneMid);
    drawRect(ctx, 25, 30 + bob, 15, 2, p.boneLight);
    drawRect(ctx, 25, 34 + bob, 15, 2, p.boneLight);
    drawRect(ctx, 27, 38 + bob, 11, 2, p.boneMid);
    const sy = 14 + bob;
    drawOutlineRect(ctx, 25, sy, 15, 14, p.boneMid, p.boneDark);
    drawRect(ctx, 26, sy + 1, 13, 8, p.boneLight);
    drawRect(ctx, 27, sy + 7, 3, 3, p.boneEye);
    drawPixel(ctx, 28, sy + 8, p.boneEyeGlow);
    drawRect(ctx, 35, sy + 7, 3, 3, p.boneEye);
    drawPixel(ctx, 36, sy + 8, p.boneEyeGlow);
    drawOutlineRect(ctx, 16, 28 + bob, 9, 14, p.woodMid, p.ironDark);
    drawRect(ctx, 43, 18 + bob, 3, 14, p.ironLight);
    return;
  }

  if (mobId === 4) {
    // Spider Front
    drawSpiderBack(ctx, frame);
    const cy = 33 + (frame % 2);
    drawOutlineRect(
      ctx,
      25,
      cy,
      14,
      11,
      p.spiderCarapace,
      p.spiderCarapaceDark,
    );
    drawRect(ctx, 28, cy + 3, 2, 2, p.spiderEye);
    drawRect(ctx, 31, cy + 2, 2, 2, p.spiderEye);
    drawRect(ctx, 34, cy + 3, 2, 2, p.spiderEye);
    drawRect(ctx, 29, cy + 9, 2, 4, "#e2e8f0");
    drawRect(ctx, 33, cy + 9, 2, 4, "#e2e8f0");
    return;
  }

  if (mobId === 5) {
    // Orc Front
    drawOrcBack(ctx, frame);
    const hy = 13 + bob;
    drawOutlineRect(ctx, 24, hy, 16, 13, p.orcSkin, p.orcSkinDark);
    drawRect(ctx, 27, hy + 5, 3, 2, "#dc2626");
    drawRect(ctx, 34, hy + 5, 3, 2, "#dc2626");
    drawRect(ctx, 27, hy + 8, 3, 4, p.orcTusk);
    drawRect(ctx, 34, hy + 8, 3, 4, p.orcTusk);
    return;
  }

  if (mobId === 6) {
    // Wraith Front
    drawWraithBack(ctx, frame);
    const floatY = Math.round(Math.sin((frame / 4) * Math.PI * 2) * 2);
    const hy = 11 + floatY;
    drawRect(ctx, 26, hy + 5, 12, 8, p.wraithDeep);
    drawRect(ctx, 28, hy + 7, 3, 2, p.wraithLight);
    drawRect(ctx, 33, hy + 7, 3, 2, p.wraithLight);
    return;
  }

  if (mobId === 7) {
    // Knight Front
    drawKnightBack(ctx, frame);
    const hy = 11 + bob;
    drawRect(ctx, 27, hy + 7, 10, 2, "#090a0f");
    drawRect(ctx, 31, hy + 7, 2, 5, "#090a0f");
    drawPixel(ctx, 29, hy + 7, p.visorGlow);
    drawPixel(ctx, 34, hy + 7, p.visorGlow);
    return;
  }

  if (mobId === 8) {
    // Magma Brute Front
    drawMagmaBruteBack(ctx, frame);
    const hy = 11 + bob;
    drawRect(ctx, 28, hy + 5, 8, 3, p.lavaHot);
    drawPixel(ctx, 29, hy + 6, p.lavaWhite);
    drawPixel(ctx, 34, hy + 6, p.lavaWhite);
    return;
  }

  if (mobId === 9) {
    // Necromancer Front
    drawNecromancerBack(ctx, frame);
    const hy = 10 + bob;
    drawRect(ctx, 27, hy + 5, 10, 7, p.skullMask);
    drawRect(ctx, 30, hy + 10, 4, 4, p.skullMask);
    drawRect(ctx, 28, hy + 7, 2, 2, p.voidGlow);
    drawRect(ctx, 34, hy + 7, 2, 2, p.voidGlow);
    return;
  }

  // Boss #10 Front
  drawBoneColossusBack(ctx, frame);
  const hy = 6 + bob;
  drawRect(ctx, 27, hy + 7, 3, 3, p.bossNecroFlameBright);
  drawPixel(ctx, 28, hy + 8, p.bossSoulGlow);
  drawRect(ctx, 34, hy + 7, 3, 3, p.bossNecroFlameBright);
  drawPixel(ctx, 35, hy + 8, p.bossSoulGlow);
  drawRect(ctx, 28, hy + 12, 8, 3, p.bossBoneDark);
}

/**
 * Диспатчер отрисовки Тира 1 СО СПИНЫ (mobs 1..10).
 */
export function drawTier1Back(
  ctx: CanvasRenderingContext2D,
  mobId: number,
  frame: number,
) {
  switch (mobId) {
    case 1:
      drawSlimeBack(ctx, frame);
      break;
    case 2:
      drawGoblinBack(ctx, frame);
      break;
    case 3:
      drawSkeletonBack(ctx, frame);
      break;
    case 4:
      drawSpiderBack(ctx, frame);
      break;
    case 5:
      drawOrcBack(ctx, frame);
      break;
    case 6:
      drawWraithBack(ctx, frame);
      break;
    case 7:
      drawKnightBack(ctx, frame);
      break;
    case 8:
      drawMagmaBruteBack(ctx, frame);
      break;
    case 9:
      drawNecromancerBack(ctx, frame);
      break;
    case 10:
      drawBoneColossusBack(ctx, frame);
      break;
    default:
      drawSlimeBack(ctx, frame);
  }
}
