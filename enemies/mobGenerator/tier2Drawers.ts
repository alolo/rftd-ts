import {
  PALETTE as p,
  drawGroundShadow,
  drawOutlineRect as box,
  drawPixel as px,
  drawRect as r,
} from "./palette";
import type { SpriteDirection } from "../types/mob";

// Tier 2 only. All views use transparent 64x64 frames and a ground line at y=56.
type Ctx = CanvasRenderingContext2D;
const dark = p.outlineDark;
const BASELINE_Y = 56;

function feet(
  c: Ctx,
  frame: number,
  x: number,
  hip: number,
  leg: string,
  boot: string,
  width = 5,
) {
  const leftLift = frame === 0 ? 4 : frame === 3 ? 2 : 0;
  const rightLift = frame === 2 ? 4 : frame === 1 ? 2 : 0;
  for (const [footX, lift] of [
    [x - 7, leftLift],
    [x + 4, rightLift],
  ]) {
    const bottom = 55 - lift;
    r(c, footX, hip, width, bottom - hip - 2, leg);
    r(c, footX - 1, bottom - 2, width + 2, 3, boot);
    if (lift) r(c, footX, bottom, width, 1, dark);
  }
}

function limbs(c: Ctx, frame: number, x: number, y: number, color: string) {
  const sway = frame === 0 ? 2 : frame === 2 ? -2 : 0;
  r(c, x - 14, y + sway, 4, 12, color);
  r(c, x + 10, y - sway, 4, 12, color);
}

interface SideLegsOpts {
  hipX: number;
  hipY: number;
  legW: number;
  nearLeg: string;
  farLeg: string;
  nearFoot: string;
  farFoot: string;
  footW?: number;
  footH?: number;
}

/**
 * Универсальный 4-кадровый цикл двухногой ходьбы в профиль (вправо).
 * К0: ближняя нога впереди стоит на плоскости, дальняя сзади в воздухе.
 * К1: ближняя опорная под корпусом, дальняя проходит мимо в воздухе.
 * К2: дальняя нога впереди стоит, ближняя сзади в воздухе.
 * К3: дальняя опорная, ближняя проходит в воздухе.
 */
function drawSideLegs(c: Ctx, frame: number, o: SideLegsOpts) {
  const plane = 55;
  const footH = o.footH ?? 4;
  const footW = o.footW ?? o.legW + 3;

  const leg = (
    x: number,
    liftRows: number,
    legColor: string,
    footColor: string,
  ) => {
    if (liftRows === 0) {
      r(c, x, o.hipY, o.legW, plane - footH - o.hipY + 1, legColor);
      r(c, x - 1, plane - footH + 1, footW, footH, footColor);
    } else {
      const footTop = plane - liftRows - footH + 1;
      r(c, x, o.hipY, o.legW, footTop - o.hipY, legColor);
      r(c, x - 1, footTop, footW, footH, footColor);
    }
  };

  const f = ((frame % 4) + 4) % 4;
  const hip = o.hipX;

  if (f === 0) {
    leg(hip - 4, 5, o.farLeg, o.farFoot);
    leg(hip + 2, 0, o.nearLeg, o.nearFoot);
  } else if (f === 1) {
    leg(hip + 1, 9, o.farLeg, o.farFoot);
    leg(hip - 1, 0, o.nearLeg, o.nearFoot);
  } else if (f === 2) {
    leg(hip - 3, 5, o.nearLeg, o.nearFoot);
    leg(hip + 3, 0, o.farLeg, o.farFoot);
  } else {
    leg(hip + 2, 9, o.nearLeg, o.nearFoot);
    leg(hip - 1, 0, o.farLeg, o.farFoot);
  }
}

function drawSporelingSide(c: Ctx, frame: number) {
  drawGroundShadow(c, 29, 18, 3, BASELINE_Y, 0.32);

  const footXs = [8, 15, 22, 37, 44, 51];
  footXs.forEach((footX, index) => {
    const lifted = (index + frame) % 2 === 0 ? 4 : 0;
    const attachX = [17, 23, 29, 34, 39, 42][index];
    const footY = 55 - lifted;
    r(c, attachX, 40, 2, 5, p.scarabDark);
    r(
      c,
      Math.min(attachX, footX + 1),
      44,
      Math.max(2, Math.abs(footX - attachX) + 1),
      2,
      p.scarabBase,
    );
    r(c, footX, footY - 3, 2, 4, p.scarabMid);
    r(c, footX - 1, footY, 4, 1, p.scarabLight);
  });

  box(c, 12, 27, 30, 18, p.scarabBase, p.scarabDark);
  r(c, 15, 29, 24, 12, p.scarabMid);
  r(c, 17, 28, 20, 2, p.scarabLight);
  r(c, 27, 30, 2, 12, p.scarabDark);
  r(c, 30, 31, 8, 8, p.scarabBase);
  r(c, 19, 32, 5, 5, p.scarabLight);
  px(c, 20, 33, p.scarabGold);
  px(c, 21, 34, p.scarabGold);

  box(c, 39, 33, 9, 10, p.scarabMid, p.scarabDark);
  r(c, 44, 36, 5, 3, p.scarabLight);
  px(c, 46, 35, p.sandBright);
  r(c, 45, 39, 2, 2, p.scarabDark);
  px(c, 43, 31, p.scarabGold);
  px(c, 47, 30, p.scarabLight);
}

function drawDryadSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : -1;
  drawGroundShadow(c, 31, 13, 3, BASELINE_Y, 0.34);
  drawSideLegs(c, frame, {
    hipX: 30,
    hipY: 42,
    legW: 4,
    nearLeg: p.sandBase,
    farLeg: p.sandDark,
    nearFoot: p.sandDark,
    farFoot: p.sandOutline,
    footW: 7,
    footH: 3,
  });

  // Развевающийся плащ из густой травы позади
  r(c, 19, 30 + bob, 7, 13, p.anubisBlue);
  r(c, 15, 39 + bob, 6, 9, p.sandBase);
  px(c, 14, 47 + bob, p.sandLight);
  r(c, 25, 40 + bob, 13, 4, p.sandOutline);
  r(c, 28, 41 + bob, 5, 2, p.scarabGold);

  // Торс в слоях мха и травы
  box(c, 24, 27 + bob, 14, 16, p.sandBase, p.sandOutline);
  r(c, 27, 29 + bob, 9, 11, p.sandMid);
  r(c, 23, 28 + bob, 5, 11, p.anubisBlue);
  r(c, 30, 32 + bob, 7, 2, p.sandLight);
  px(c, 32, 35 + bob, p.scarabGold);

  // Голова в капюшоне: лицо и глаз смотрят вправо
  const hy = 12 + bob;
  r(c, 21, hy + 4, 8, 10, p.anubisBlue);
  r(c, 15, hy + 3, 9, 6, p.anubisBlue);
  px(c, 13, hy + 2, p.sandLight);
  box(c, 27, hy, 12, 14, p.sandBase, p.sandOutline);
  r(c, 29, hy + 2, 9, 7, p.sandLight);
  r(c, 36, hy + 5, 5, 3, p.sandBase); // нос
  r(c, 34, hy + 4, 3, 2, p.basiliskEye);
  px(c, 36, hy + 4, dark);
  r(c, 31, hy + 10, 8, 2, p.sandOutline); // обмотка лица

  // Передняя рука с лозой-мечом; угол клинка меняется по циклу
  const angle = frame === 0 || frame === 3 ? 0 : 2;
  r(c, 34, 29 + bob, 7, 4, p.sandBase);
  r(c, 40, 26 + bob + angle, 4, 5, p.sandMid);
  r(c, 43, 19 + bob + angle, 2, 10, p.scarabGold);
  r(c, 44, 16 + bob + angle, 2, 5, p.scarabGold);
  px(c, 45, 15 + bob + angle, p.sandBright);
  r(c, 42, 27 + bob + angle, 5, 2, p.sandDark);

  // Задняя рука держит второй короткий росток
  r(c, 20, 33 + bob, 4, 5, p.sandBase);
  r(c, 17, 25 + bob, 2, 9, p.scarabGold);
  px(c, 18, 23 + bob, p.sandBright);
}

function drawBogGhoulSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : -1;
  drawGroundShadow(c, 31, 17, 4, BASELINE_Y, 0.38);
  drawSideLegs(c, frame, {
    hipX: 31,
    hipY: 43,
    legW: 6,
    nearLeg: p.mummyBase,
    farLeg: p.mummyShade,
    nearFoot: p.mummyLight,
    farFoot: p.mummyBase,
    footW: 9,
    footH: 4,
  });

  // Ползущие за спиной корневища и лохмотья
  r(c, 11, 29 + bob, 11, 3, p.mummyShade);
  r(c, 8, 32 + bob, 8, 2, p.mummyBase);
  r(c, 11, 34 + bob, 10, 2, p.mummyLight);
  px(c, 9, 36 + bob, p.mummyShade);

  // Тяжелый корпус из гнилых корней
  box(c, 21, 23 + bob, 21, 23, p.mummyBase, p.mummyDark);
  r(c, 23, 25 + bob, 17, 18, p.mummyLight);
  r(c, 24, 28 + bob, 14, 2, p.mummyShade);
  r(c, 25, 34 + bob, 15, 2, p.mummyShade);
  r(c, 23, 40 + bob, 17, 2, p.mummyShade);
  r(c, 28, 26 + bob, 3, 17, p.mummyBase);
  px(c, 29, 29 + bob, p.sandBright);

  // Передняя рука с моховыми пальцами
  r(c, 37, 27 + bob, 7, 5, p.mummyBase);
  r(c, 42, 29 + bob + (frame % 2), 5, 4, p.mummyLight);
  r(c, 43, 32 + bob, 2, 5, p.mummyShade);

  // Череп в профиль с горящим глазом
  const hy = 10 + bob;
  box(c, 25, hy, 16, 15, p.mummyBase, p.mummyDark);
  r(c, 27, hy + 2, 12, 10, p.mummyLight);
  r(c, 26, hy + 3, 12, 2, p.mummyShade);
  r(c, 29, hy + 6, 9, 2, p.mummyBase);
  r(c, 34, hy + 7, 4, 3, p.mummyDark);
  r(c, 36, hy + 7, 2, 2, p.mummyEye);
  px(c, 37, hy + 7, p.sandBright);
  r(c, 33, hy + 11, 7, 2, p.mummyShade);

  // Отслаивающиеся полосы коры с темечка и затылка
  r(c, 22, hy + 1, 4, 3, p.mummyLight);
  px(c, 20, hy + 4, p.mummyBase);
  r(c, 30, hy - 2, 8, 2, p.mummyLight);
}

function drawMarshBeastSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : 1;
  drawGroundShadow(c, 29, 22, 4, BASELINE_Y, 0.42);

  // 8 суставчатых лап, две чередующиеся группы опоры
  const legPairs: [number, number][] = [
    [18, 9],
    [22, 15],
    [27, 22],
    [31, 29],
    [33, 37],
    [30, 45],
    [26, 51],
    [23, 55],
  ];
  legPairs.forEach(([attach, foot], index) => {
    const planted = (index + Math.floor(frame / 2)) % 2 === 0;
    const lift = planted ? 0 : 4;
    r(c, attach, 38 + bob, 2, 5, p.scorpionDark);
    r(
      c,
      Math.min(attach, foot),
      42 + bob,
      Math.abs(foot - attach) + 2,
      2,
      p.scorpionBase,
    );
    r(c, foot, 44 + bob, 2, 10 - lift, p.scorpionMid);
    r(c, foot - 1, 54 - lift, 5, 2, p.scorpionLight);
  });

  // Сегментированный хвост, изогнутый над спиной
  const tailLift = frame === 1 ? -2 : frame === 3 ? 2 : 0;
  r(c, 14, 31 + bob, 5, 4, p.scorpionDark);
  r(c, 11, 25 + bob, 5, 7, p.scorpionBase);
  r(c, 14, 18 + bob + tailLift, 5, 8, p.scorpionMid);
  r(c, 20, 13 + bob + tailLift, 6, 6, p.scorpionBase);
  r(c, 25, 9 + bob + tailLift, 6, 5, p.scorpionMid);
  r(c, 30, 7 + bob + tailLift, 5, 5, p.scorpionLight);
  r(c, 34, 4 + bob + tailLift, 4, 5, p.scorpionAmber);
  px(c, 37, 3 + bob + tailLift, p.sandBright);
  px(c, 38, 5 + bob + tailLift, p.scorpionAmber);

  // Широкое панцирное брюхо
  box(c, 16, 30 + bob, 23, 15, p.scorpionBase, p.scorpionDark);
  r(c, 19, 32 + bob, 17, 10, p.scorpionMid);
  r(c, 20, 33 + bob, 3, 8, p.scorpionLight);
  r(c, 27, 32 + bob, 2, 10, p.scorpionDark);
  r(c, 32, 33 + bob, 3, 8, p.scorpionBase);
  px(c, 24, 37 + bob, p.scorpionAmber);

  // Передняя часть тела и гипертрофированные клешни
  box(c, 33, 29 + bob, 13, 12, p.scorpionMid, p.scorpionDark);
  r(c, 36, 31 + bob, 8, 7, p.scorpionLight);
  px(c, 42, 32 + bob, p.scorpionAmber);
  const claw = frame % 2;
  r(c, 43, 35 + bob, 8, 4, p.scorpionDark);
  r(c, 48, 32 + bob + claw, 8, 5, p.scorpionBase);
  r(c, 54, 32 + bob + claw, 4, 2, p.scorpionLight);
  r(c, 48, 38 + bob - claw, 8, 4, p.scorpionBase);
  px(c, 55, 40 + bob, p.scorpionLight);
}

function drawForestCaracalSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : -1;
  drawGroundShadow(c, 31, 23, 3, BASELINE_Y, 0.34);

  // Длинный хвост кисточкой: покачивается по циклу, тело держится у земли
  const tailLift = frame === 0 ? 0 : frame === 1 ? -2 : frame === 2 ? 1 : -1;
  r(c, 11, 34 + bob, 12, 8, p.basiliskDark);
  r(c, 6, 32 + bob + tailLift, 9, 5, p.basiliskBase);
  r(c, 3, 30 + bob + tailLift, 6, 4, p.basiliskMid);
  px(c, 2, 29 + bob + tailLift, p.basiliskLight);
  r(c, 12, 37 + bob, 12, 4, p.basiliskBase);

  // Четыре короткие лапы: две чередующиеся пары касаются y=55
  const nearStep = frame === 0 || frame === 1 ? 0 : 1;
  const legs: [number, number, boolean][] = [
    [19, 40, nearStep === 0],
    [25, 41, nearStep !== 0],
    [34, 40, nearStep !== 0],
    [39, 41, nearStep === 0],
  ];
  legs.forEach(([x, y, planted], i) => {
    const footX = x + (i > 1 ? 1 : -2);
    const lift = planted ? 0 : 4;
    r(c, x, y + bob, 4, 7, i % 2 ? p.basiliskDark : p.basiliskBase);
    r(c, footX, 46 + bob, 5, 7 - lift, p.basiliskMid);
    r(c, footX - 1, 53 - lift, 7, 3, p.basiliskBase);
  });

  // Длинное чешуйчатое тело и спинные камни
  box(c, 15, 28 + bob, 31, 16, p.basiliskBase, p.basiliskDark);
  r(c, 18, 30 + bob, 25, 11, p.basiliskMid);
  r(c, 20, 29 + bob, 4, 4, p.basiliskLight);
  r(c, 27, 27 + bob, 5, 5, p.sandDark);
  r(c, 35, 28 + bob, 5, 4, p.basiliskDark);
  r(c, 21, 36 + bob, 17, 2, p.basiliskDark);
  px(c, 25, 33 + bob, p.basiliskJade);

  // Угловатая голова, надбровный гребень и окаменяющий глаз вправо
  box(c, 39, 21 + bob, 14, 13, p.basiliskBase, p.basiliskDark);
  r(c, 41, 23 + bob, 10, 7, p.basiliskLight);
  r(c, 48, 28 + bob, 8, 4, p.basiliskBase);
  r(c, 51, 30 + bob, 5, 2, p.basiliskDark);
  r(c, 47, 24 + bob, 5, 2, p.basiliskDark);
  r(c, 49, 25 + bob, 3, 2, p.basiliskEye);
  px(c, 51, 25 + bob, p.sandBright);

  // Небольшой рогатый гребень
  r(c, 42, 18 + bob, 3, 4, p.sandDark);
  px(c, 45, 17 + bob, p.sandLight);
  px(c, 38, 21 + bob, p.basiliskJade);
}

function drawStagGuardianSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : -1;
  drawGroundShadow(c, 32, 14, 3, BASELINE_Y, 0.36);
  drawSideLegs(c, frame, {
    hipX: 31,
    hipY: 43,
    legW: 5,
    nearLeg: p.anubisBlue,
    farLeg: p.anubisDark,
    nearFoot: p.anubisGold,
    farFoot: p.sandDark,
    footW: 8,
    footH: 4,
  });

  // Сизая накидка из мха позади
  r(c, 17, 24 + bob, 7, 21, p.anubisDark);
  r(c, 13, 35 + bob, 5, 11, p.anubisBlue);
  px(c, 12, 46 + bob, p.anubisGold);

  // Нагрудник и килт
  box(c, 24, 26 + bob, 15, 19, p.anubisBlue, p.anubisDark);
  r(c, 27, 28 + bob, 10, 13, p.anubisLight);
  r(c, 28, 31 + bob, 6, 7, p.anubisBlue);
  r(c, 24, 40 + bob, 15, 4, p.anubisGold);
  px(c, 31, 41 + bob, p.anubisBright);

  // Передняя рука и древко копья
  r(c, 36, 29 + bob, 8, 4, p.anubisBlue);
  r(c, 43, 27 + bob, 4, 4, p.sandLight);
  r(c, 48, 7, 2, 39, p.sandDark);
  r(c, 47, 7, 4, 2, p.anubisGold);
  r(c, 48, 3, 2, 5, p.anubisLight);
  px(c, 48, 2, p.anubisBright);

  // Круглый щит-солнце перед торсом
  box(c, 38, 33 + bob, 11, 11, p.anubisGold, p.anubisDark);
  r(c, 40, 35 + bob, 7, 7, p.anubisBlue);
  r(c, 42, 36 + bob, 3, 5, p.anubisBright);
  r(c, 41, 37 + bob, 5, 2, p.anubisGold);

  // Голова с высокими ушами, длинной мордой вправо
  const hy = 10 + bob;
  r(c, 25, hy + 2, 5, 7, p.anubisDark);
  r(c, 22, hy - 4, 3, 9, p.anubisBlue);
  px(c, 22, hy - 5, p.anubisGold);
  r(c, 29, hy + 1, 11, 12, p.anubisDark);
  r(c, 31, hy + 3, 8, 6, p.anubisBlue);
  r(c, 38, hy + 7, 9, 4, p.anubisDark);
  r(c, 43, hy + 9, 5, 2, p.anubisGold);
  r(c, 37, hy + 5, 3, 2, p.anubisBright);
  px(c, 39, hy + 5, dark);
  r(c, 30, hy + 10, 10, 2, p.anubisGold);
}

function drawSwampWispSide(c: Ctx, frame: number) {
  const float = frame === 0 ? 0 : frame === 1 ? -2 : frame === 2 ? 1 : -1;
  drawGroundShadow(c, 31, 17, 3, BASELINE_Y, 0.22);

  // Спиральный шлейф тумана, спускающийся к плоскости y=55
  r(c, 24, 43 + float, 15, 5, p.sandDark);
  r(c, 20, 47 + float, 13, 4, p.sandBase);
  r(c, 24, 50 + float, 11, 4, p.sandMid);
  r(c, 28, 53, 8, 3, p.sandLight);
  px(c, 36, 54, p.sandBright);
  px(c, 18, 48 + float, p.sandLight);
  px(c, 41, 46 + float, p.sandBright);

  // Тело-огонек и шарф-накидка
  box(c, 22, 23 + float, 20, 22, p.djinnBlue, p.djinnDark);
  r(c, 24, 25 + float, 16, 17, p.djinnLight);
  r(c, 28, 28 + float, 8, 12, p.djinnBlue);
  r(c, 19, 27 + float, 7, 9, p.djinnDark);
  r(c, 13, 30 + float, 9, 3, p.djinnBlue);
  px(c, 11, 29 + float, p.djinnLight);

  // Передняя рука вперёд с золотым ободом
  r(c, 38, 28 + float, 9, 4, p.djinnBlue);
  r(c, 45, 26 + float, 4, 4, p.djinnGold);
  px(c, 50, 27 + float, p.djinnGlow);

  // Задняя рука изгибается назад
  r(c, 18, 32 + float, 5, 5, p.djinnBlue);
  r(c, 14, 35 + float, 6, 3, p.djinnLight);

  // Лицо в профиль, заострённое надбровье и светящиеся глаза
  const hy = 8 + float;
  box(c, 23, hy, 18, 18, p.djinnBlue, p.djinnDark);
  r(c, 25, hy + 2, 14, 12, p.djinnLight);
  r(c, 30, hy + 6, 10, 7, p.djinnDark);
  r(c, 37, hy + 9, 7, 3, p.djinnBlue);
  r(c, 34, hy + 8, 4, 2, p.djinnGlow);
  px(c, 36, hy + 8, p.white);
  r(c, 29, hy + 15, 10, 2, p.djinnDark);

  // Золотой лобный самоцвет и лента сзади
  r(c, 30, hy + 2, 6, 2, p.djinnGold);
  px(c, 33, hy + 3, p.djinnGlow);
  r(c, 21, hy + 4, 4, 5, p.djinnDark);
  px(c, 18, hy + 4, p.djinnLight);
}

function drawMossGolemSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : -1;
  drawGroundShadow(c, 31, 18, 4, BASELINE_Y, 0.4);
  drawSideLegs(c, frame, {
    hipX: 31,
    hipY: 47,
    legW: 6,
    nearLeg: p.sarcophagusDark,
    farLeg: p.sandDark,
    nearFoot: p.sandBase,
    farFoot: p.sarcophagusBase,
    footW: 9,
    footH: 4,
  });

  // Каменные руки покачиваются вдоль корпуса
  r(c, 15, 29 + bob, 6, 11, p.sarcophagusDark);
  r(c, 12, 38 + bob, 8, 6, p.sarcophagusBase);
  r(c, 41, 30 + bob, 6, 12, p.sarcophagusDark);
  r(c, 43, 39 + bob, 8, 6, p.sarcophagusBase);

  // Толстая каменная крышка и золочёный корпус голема
  box(c, 19, 8 + bob, 27, 43, p.sarcophagusBase, p.sarcophagusDark);
  r(c, 22, 11 + bob, 21, 36, p.sarcophagusLight);
  r(c, 23, 13 + bob, 19, 3, p.sarcophagusGold);
  r(c, 24, 18 + bob, 17, 24, p.sandBase);
  r(c, 26, 20 + bob, 13, 19, p.sarcophagusBase);

  // Шеврон-обмотка и центральная бирюзовая линия проклятия
  r(c, 24, 22 + bob, 17, 2, p.sarcophagusGold);
  r(c, 26, 26 + bob, 13, 2, p.sarcophagusGold);
  r(c, 29, 28 + bob, 6, 12, p.pharaohSoul);
  r(c, 30, 29 + bob, 4, 9, p.pharaohSoulBright);
  px(c, 31, 31 + bob, p.white);

  // Лицевая пластина в верхней части саркофага
  box(c, 26, 13 + bob, 14, 12, p.sandMid, p.sarcophagusDark);
  r(c, 28, 15 + bob, 10, 7, p.sandLight);
  r(c, 29, 18 + bob, 4, 2, p.scarabDark);
  r(c, 35, 18 + bob, 3, 2, p.scarabDark);
  r(c, 32, 17 + bob, 3, 6, p.sarcophagusGold);
  r(c, 29, 23 + bob, 9, 2, p.sarcophagusDark);

  // Древние трещины пульсируют по чётным кадрам
  if (frame === 1 || frame === 3) {
    px(c, 22, 31 + bob, p.pharaohSoulBright);
    px(c, 42, 35 + bob, p.pharaohSoulBright);
  }
}

function drawThicketWitchSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : -1;
  drawGroundShadow(c, 30, 14, 3, BASELINE_Y, 0.34);
  drawSideLegs(c, frame, {
    hipX: 30,
    hipY: 43,
    legW: 5,
    nearLeg: p.sunPriestBlue,
    farLeg: p.sunPriestDark,
    nearFoot: p.sandBase,
    farFoot: p.sandDark,
    footW: 8,
    footH: 4,
  });

  // Шлейф мантии и длинное ритуальное платье
  r(c, 17, 25 + bob, 7, 21, p.sunPriestDark);
  r(c, 13, 39 + bob, 6, 9, p.sunPriestBlue);
  box(c, 22, 25 + bob, 16, 21, p.sunPriestBlue, p.sunPriestDark);
  r(c, 24, 28 + bob, 12, 15, p.sunPriestLight);
  r(c, 30, 28 + bob, 3, 15, p.sunPriestGold);
  px(c, 31, 31 + bob, p.sunGlow);
  px(c, 31, 37 + bob, p.sunGlow);
  r(c, 22, 41 + bob, 16, 3, p.sunPriestGold);

  // Задний рукав и передняя рука, поднятая к солнечному диску
  r(c, 19, 29 + bob, 5, 7, p.sunPriestDark);
  r(c, 35, 27 + bob, 6, 4, p.sunPriestBlue);
  r(c, 40, 24 + bob, 4, 5, p.sandBase);
  px(c, 45, 20 + bob, p.sunGlow);

  // Посох с оживлённым солнцем на навершии
  r(c, 47, 22 + bob, 2, 33, p.sandDark);
  r(c, 45, 18 + bob, 6, 3, p.sunPriestGold);
  const ray = frame % 2 === 0 ? 1 : 0;
  r(c, 45, 10 + bob, 7, 7, p.sunPriestGold);
  r(c, 47, 12 + bob, 4, 4, p.sunGlow);
  px(c, 48, 13 + bob, p.white);
  px(c, 48, 8 - ray + bob, p.sunGlow);
  px(c, 43 - ray, 13 + bob, p.sunGlow);
  px(c, 54 + ray, 13 + bob, p.sunGlow);
  px(c, 48, 19 + ray + bob, p.sunGlow);

  // Лицо в профиль, золотой венец и полосатый перьевой гребень
  const hy = 10 + bob;
  box(c, 24, hy, 14, 15, p.sandBase, p.sunPriestDark);
  r(c, 26, hy + 2, 10, 10, p.sandLight);
  r(c, 33, hy + 6, 4, 2, p.sunPriestDark);
  px(c, 35, hy + 6, p.sunGlow);
  r(c, 33, hy + 10, 5, 2, p.sandDark);
  r(c, 24, hy + 1, 14, 2, p.sunPriestGold);
  r(c, 26, hy - 4, 3, 5, p.sunPriestBlue);
  r(c, 30, hy - 7, 3, 8, p.sunPriestLight);
  r(c, 34, hy - 4, 3, 5, p.sunPriestGold);
  px(c, 39, hy + 2, p.sunPriestGold);
}

function drawRootEntSide(c: Ctx, frame: number) {
  const bob = frame % 2 === 0 ? 0 : -1;
  drawGroundShadow(c, 31, 25, 5, BASELINE_Y, 0.52);

  // Огромная полосатая мантия из коры позади
  const cape = frame === 0 ? 2 : frame === 2 ? -2 : 0;
  r(c, 7 + cape, 18 + bob, 14, 30, p.pharaohDark);
  r(c, 5 + cape, 24 + bob, 5, 19, p.pharaohBlue);
  r(c, 9 + cape, 21 + bob, 3, 23, p.pharaohRuby);
  r(c, 6 + cape, 45 + bob, 11, 5, p.pharaohGold);
  px(c, 5 + cape, 51 + bob, p.pharaohDark);
  px(c, 13 + cape, 52 + bob, p.pharaohRuby);

  // Тяжёлые золотые сандалии-корни на общей линии пола
  const forward = frame < 2;
  r(c, forward ? 27 : 32, 42, 9, 11, p.pharaohDark);
  r(c, forward ? 29 : 34, 44, 5, 8, p.pharaohGold);
  r(c, forward ? 24 : 29, 52, 14, 4, p.pharaohBright);
  r(c, forward ? 37 : 22, 44, 8, 8, p.pharaohDark);
  r(c, forward ? 39 : 21, 51, 10, 4, p.pharaohGold);
  r(c, forward ? 37 : 20, 54, 13, 2, p.pharaohBright);
  if (frame === 0 || frame === 2) {
    r(c, forward ? 22 : 35, 55, 13, 1, p.pharaohSoulBright);
  }

  // Широкая лазурная кираса, золотой воротник и светящееся ядро души
  box(c, 17, 22 + bob, 25, 22, p.pharaohBlue, p.pharaohDark);
  r(c, 20, 25 + bob, 19, 15, p.pharaohLight);
  r(c, 20, 24 + bob, 19, 4, p.pharaohGold);
  r(c, 23, 31 + bob, 13, 3, p.pharaohBlue);
  r(c, 28, 33 + bob, 7, 8, p.pharaohSoulDark);
  r(c, 29, 34 + bob, 5, 6, p.pharaohSoul);
  px(c, 31, 35 + bob, p.pharaohSoulBright);
  px(c, 32, 36 + bob, p.white);

  // Раздутый наплечник и слоистый наруч
  box(c, 35, 19 + bob, 12, 10, p.pharaohGold, p.pharaohDark);
  r(c, 37, 21 + bob, 8, 5, p.pharaohBright);
  r(c, 39, 27 + bob, 8, 5, p.pharaohBlue);

  // Полосатый немес-шлем, стекающий назад
  const hy = 13 + bob;
  r(c, 18, hy + 3, 10, 14, p.pharaohBlue);
  r(c, 12, hy + 8, 9, 17, p.pharaohDark);
  r(c, 14, hy + 10, 4, 12, p.pharaohGold);
  r(c, 20, hy + 5, 4, 11, p.pharaohRuby);

  // Золотая маска в профиль и высокая корона
  box(c, 26, hy, 16, 17, p.pharaohGold, p.pharaohDark);
  r(c, 28, hy + 2, 12, 11, p.pharaohBright);
  r(c, 37, hy + 7, 8, 4, p.pharaohGold);
  r(c, 40, hy + 9, 5, 2, p.pharaohDark);
  r(c, 35, hy + 6, 4, 3, p.pharaohSoul);
  px(c, 37, hy + 6, p.pharaohSoulBright);
  r(c, 29, hy + 13, 14, 3, p.pharaohDark);
  r(c, 28, hy + 16, 15, 3, p.pharaohGold);
  r(c, 31, hy - 5, 8, 6, p.pharaohGold);
  r(c, 33, hy - 9, 4, 5, p.pharaohBright);
  px(c, 34, hy - 11, p.pharaohRuby);
  px(c, 28, hy - 3, p.pharaohGold);
  px(c, 42, hy - 3, p.pharaohGold);

  // Королевский солнечный посох впереди; его лучи пульсируют по кадрам
  r(c, 50, 20 + bob, 2, 35, p.sandDark);
  r(c, 47, 17 + bob, 8, 3, p.pharaohGold);
  r(c, 47, 8 + bob, 8, 8, p.pharaohRuby);
  r(c, 49, 10 + bob, 5, 5, p.pharaohBright);
  r(c, 50, 11 + bob, 3, 3, p.pharaohSoul);
  px(c, 51, 12 + bob, p.pharaohSoulBright);
  const rays = frame % 2 === 0;
  if (rays) {
    px(c, 51, 5 + bob, p.pharaohBright);
    px(c, 45, 11 + bob, p.pharaohSoulBright);
    px(c, 57, 11 + bob, p.pharaohSoulBright);
    px(c, 51, 18 + bob, p.pharaohBright);
  } else {
    px(c, 47, 6 + bob, p.pharaohBright);
    px(c, 56, 7 + bob, p.pharaohBright);
    px(c, 46, 16 + bob, p.pharaohBright);
  }
}

function rearScarab(c: Ctx, f: number) {
  // Грибо-споровик со спины: ножки из болотного дерна, светлый стебель и красная шляпка.
  drawGroundShadow(c, 32, 19, 3, 56, 0.36);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const lift = (i + f + (side === 1 ? 1 : 0)) % 2 ? 0 : 4;
      r(c, 32 + side * (13 + i * 4), 42, 3, 12 - lift, p.scarabDark); // темный низ ножки
      r(c, 32 + side * (14 + i * 4) - 1, 54 - lift, 5, 2, p.mummyBase); // корневые тапочки
    }
  }
  // Морщинистый стебель гриба
  r(c, 24, 34, 16, 15, p.sandLight);
  r(c, 26, 36, 12, 12, p.sandBright);
  // Яркая лесная мухоморная шляпа со спины (в белых спорах/точечках)
  box(c, 16, 23, 32, 19, p.scarabBase, p.scarabDark);
  r(c, 19, 26, 26, 13, p.scarabMid);
  r(c, 21, 24, 20, 3, p.scarabLight);
  // Грибные споры на задней части красной шляпки
  for (const x of [21, 26, 32, 38, 42]) {
    px(c, x, 28, "#ffffff");
    px(c, x + 1, 31, "#ffffff");
  }
  px(c, 24, 35, "#ffffff");
  px(c, 39, 35, "#ffffff");
  px(c, 30, 27, "#ffffff");
  // Теплый свет светлячка и крошка мха на стебле позади
  r(c, 27, 46, 10, 3, p.scarabDark);
  px(c, 29, 48, p.scarabGold);
  px(c, 35, 48, p.scarabGold);
}

function frontScarab(c: Ctx, f: number) {
  rearScarab(c, f);
  // Мордочка гриба: черные бусинки глаз под красной шляпкой и крошечный ротик
  box(c, 23, 36, 18, 12, p.sandLight, p.scarabDark);
  r(c, 26, 38, 12, 8, p.sandMid);
  for (const x of [27, 35]) {
    r(c, x, 40, 3, 3, "#000000"); // Изумрудно-черные глазка
    px(c, x + 1, 41, "#ffffff");
  }
  r(c, 30, 45, 4, 2, p.scarabGold); // ротик-спорница
  // Мелкие травянистые побеги над шляпкой
  r(c, 26, 30 - (f % 2), 2, 5, p.sandBase);
  r(c, 36, 30 + (f % 2), 2, 5, p.sandBase);
}

function raider(c: Ctx, f: number, back: boolean) {
  // Лесная дриада: стержень из мхов, кустистая листва на плечах и деревянные мечи-лозы
  const bob = f % 2 ? -1 : 0;
  drawGroundShadow(c, 32, 14, 3, 56, 0.34);
  feet(c, f, 32, 43, p.mummyShade, p.mummyBase); // ножки как сухой корень
  r(c, 17, 34 + bob, 8, 13, p.sandBase); // плащ из густой травы/мха
  limbs(c, f, 32, 30 + bob, p.sandBase);
  box(c, 23, 27 + bob, 18, 17, p.sandBase, p.sandOutline);
  r(c, 25, 29 + bob, 14, 12, back ? p.sandDark : p.sandMid);
  r(c, 25, 40 + bob, 14, 3, p.scarabGold); // пояс из сухого желудя
  if (back) {
    // Зеленый корешковый узел, травина и плетеные корневые лозы на спине
    r(c, 27, 29 + bob, 3, 11, p.mummyBase);
    r(c, 35, 29 + bob, 3, 11, p.mummyBase);
    r(c, 29, 35 + bob, 7, 2, p.scarabGold);
    box(c, 25, 14 + bob, 14, 14, p.sandBase, p.sandOutline);
    // Затылок покрыт густым мхом и листвой
    r(c, 29, 17 + bob, 6, 8, p.sandMid);
    r(c, 31, 23 + bob, 3, 5, p.scarabGold);
    px(c, 26, 15 + bob, p.sandBright);
    px(c, 37, 17 + bob, p.sandBright);
  } else {
    box(c, 25, 14 + bob, 14, 14, p.sandBase, p.sandOutline);
    r(c, 26, 15 + bob, 12, 5, p.sandDark); // волосы из темной лозы
    r(c, 27, 21 + bob, 10, 5, p.sandLight); // лицо дриады
    r(c, 28, 22 + bob, 3, 2, dark);
    r(c, 34, 22 + bob, 3, 2, dark);
    r(c, 28, 26 + bob, 9, 2, p.sandBright); // румянец из мха
    px(c, 26, 20 + bob, p.sandBright); // светлячок от лесной ведьмы
  }
  // Деревянные ростки-мечи и блики лесного зла
  r(c, 15, 19 + bob + (f === 2 ? 3 : 0), 2, 16, p.mummyBase);
  r(c, 47, 18 + bob + (f === 0 ? 3 : 0), 2, 16, p.mummyBase);
  px(c, 16, 17 + bob, p.sandBright);
  px(c, 48, 16 + bob, p.sandBright);
}

function mummy(c: Ctx, f: number, back: boolean) {
  // Болотный Гнилой Гуль: корни-лапы, гора сухого корня, тина, мох и сияющий жар из впадин вместо глазиц
  const bob = f % 2 ? -1 : 0;
  drawGroundShadow(c, 32, 16, 4, 56, 0.4);
  feet(c, f, 32, 43, p.mummyShade, p.mummyBase, 6); // корни-тупы
  limbs(c, f, 32, 30 + bob, p.mummyBase);
  box(c, 21, 24 + bob, 22, 21, p.mummyBase, p.mummyDark);
  r(c, 23, 26 + bob, 18, 17, p.mummyLight);
  // Корни и комлы грязной зеленой тины поверх гниющих корней
  r(c, 24, 28 + bob, 16, 2, p.scorpionBase);
  r(c, 24, 34 + bob, 16, 2, p.scorpionBase);
  r(c, 24, 40 + bob, 16, 2, p.scorpionLight);
  if (back) {
    r(c, 30, 26 + bob, 4, 17, p.mummyShade); // плетеные гнилые ветви по позвоночнику
    r(c, 18 - (f % 2) * 2, 31 + bob, 8, 2, p.scorpionBase); // болотный гланд тины позади
    box(c, 24, 11 + bob, 16, 15, p.mummyBase, p.mummyDark);
    r(c, 26, 13 + bob, 12, 10, p.mummyLight);
    // Толстая сосновая корка на затылке гуля
    r(c, 27, 16 + bob, 10, 2, p.mummyShade);
    r(c, 29, 20 + bob, 8, 2, p.mummyShade);
    px(c, 28, 15 + bob, p.scorpionLight); // мох на горбу
  } else {
    box(c, 24, 11 + bob, 16, 15, p.mummyBase, p.mummyDark);
    r(c, 26, 13 + bob, 12, 10, p.mummyLight);
    // Горящие тепленные стружки огня в темных глазницах из корня
    r(c, 27, 17 + bob, 3, 3, p.scarabGold);
    r(c, 35, 17 + bob, 3, 3, p.scarabGold);
    px(c, 28, 18 + bob, "#ffffff");
    px(c, 36, 18 + bob, "#ffffff");
    r(c, 29, 22 + bob, 6, 2, p.scorpionDark);
    r(c, 16, 36 + bob, 9, 2, p.mummyLight);
  }
}

function scorpion(c: Ctx, f: number, back: boolean) {
  // Болотный клешненос: лапы-палочки болота, зеленое моховище на спине вместо панциря
  drawGroundShadow(c, 32, 23, 4, 56, 0.45);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const lift = (i + f + (side === 1 ? 1 : 0)) % 2 ? 0 : 4;
      const x = 32 + side * (13 + i * 4);
      r(c, Math.min(x, 32 + side * 10), 40, 8, 3, p.mummyDark);
      r(c, x, 43, 3, 12 - lift, p.scorpionMid);
      r(c, x - 1, 54 - lift, 5, 2, p.scorpionLight);
    }
  }
  // Болотный хвостик из тины с пузырьками
  r(c, 29, 26, 6, 11, p.scorpionDark);
  r(c, 29 + (f % 2 ? 2 : -2), 17, 6, 11, p.scorpionBase);
  r(c, 31, 10, 4, 8, p.scorpionMid);
  r(c, 31, 6 + (f % 2), 3, 5, p.scorpionAmber); // светящийся глаз над болотом
  // Туловище, покрытое водяным мхом и лесным листом
  box(c, 19, 29, 26, 16, p.scorpionBase, p.scorpionDark);
  r(c, 21, 31, 22, 11, p.sandDark); // большое болотно-зеленое брюхо
  r(c, 30, 30, 4, 13, p.sandBase); // корчаг из спиленного дуба сзади
  if (back) {
    for (const x of [24, 37]) r(c, x, 33, 3, 7, p.sandMid);
    r(c, 27, 43, 10, 3, p.scorpionDark);
    px(c, 24, 32, p.sandBright); // светящиеся водоросли сзади
  } else {
    box(c, 24, 36, 16, 10, p.scorpionBase, p.scorpionDark);
    for (const x of [27, 35]) px(c, x, 39, p.scorpionAmber); // неоновые взгляды кусочкува
    for (const side of [-1, 1]) {
      const x = side < 0 ? 9 : 46;
      box(c, x, 34 + (f % 2), 9, 8, p.scorpionMid, p.scorpionDark);
      r(c, x + 2, 40, 6, 2, p.scorpionLight);
    }
  }
}

function basilisk(c: Ctx, f: number, back: boolean) {
  // Лесная рысь: пятнистая темная шерсть, мягкие лапы, сзади покрыта мшистым гребнем
  drawGroundShadow(c, 32, 22, 3, 56, 0.35);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const lift = (i + f + (side === 1 ? 1 : 0)) % 2 ? 0 : 4;
      const x = 32 + side * (11 + i * 7);
      r(c, x, 41, 5, 13 - lift, p.basiliskDark);
      r(c, x - 1, 53 - lift, 7, 3, p.mummyBase); // грязные когти-корни
    }
  }
  // Пушистый хвост кисточкой, поднятый вверх позади
  r(c, 29, back ? 42 : 18, 6, 11, p.basiliskDark);
  r(
    c,
    30 + (f === 0 ? -2 : f === 2 ? 2 : 0),
    back ? 51 : 15,
    4,
    5,
    p.basiliskMid,
  );
  // Туловище с пятнами и лесным жилом
  box(c, 17, 27, 30, 18, p.basiliskBase, p.basiliskDark);
  r(c, 19, 29, 26, 12, p.basiliskMid);
  for (const x of [22, 29, 36]) r(c, x, 26, 4, 4, p.basiliskDark);
  // Подбородок/затылок рыси
  box(c, 24, back ? 20 : 34, 16, 12, p.basiliskBase, p.basiliskDark);
  if (back) {
    r(c, 28, 22, 8, 5, p.basiliskLight); // затылок
    r(c, 30, 30, 4, 12, p.basiliskMid); // контур спины и ухо
  } else {
    r(c, 26, 36, 12, 6, p.basiliskLight); // мордочка
    for (const x of [27, 35]) {
      r(c, x, 38, 3, 3, p.basiliskEye); // изумрудные глаза
      px(c, x + 1, 39, dark);
    }
    r(c, 30, 44, 5, 2, p.basiliskDark); // носовой гребень
  }
}

function anubis(c: Ctx, f: number, back: boolean) {
  // Олений караул: рога из дубовых веток, школа, щит из спиленного пня и деревянное копье
  const bob = f % 2 ? -1 : 0;
  drawGroundShadow(c, 32, 16, 3, 56, 0.38);
  feet(c, f, 32, 44, p.anubisBlue, p.anubisGold, 6); // лесные копыта
  limbs(c, f, 32, 27 + bob, p.anubisDark);
  box(c, 21, 25 + bob, 22, 20, p.anubisBlue, p.anubisDark);
  r(c, 24, 28 + bob, 16, 13, back ? p.anubisBlue : p.sandBase); // сизая грудная шерсть
  r(c, 24, 26 + bob, 16, 3, p.anubisGold); // желудевый пояс
  r(c, 25, 40 + bob, 14, 3, p.anubisGold);
  if (back) {
    r(c, 30, 30 + bob, 4, 10, p.anubisGold);
    r(c, 29, 33 + bob, 6, 2, p.anubisBright);
  } else {
    r(c, 29, 32 + bob, 6, 7, p.anubisBlue);
    px(c, 31, 35 + bob, p.anubisBright);
  }
  // Мощные ветвистые рога (позади и спереди!)
  r(c, 24, 8 + bob, 3, 9, p.anubisDark);
  r(c, 24, 6 + bob, 2, 3, p.anubisGold); // побег рога
  r(c, 36, 8 + bob, 3, 9, p.anubisDark);
  r(c, 37, 5 + bob, 2, 4, p.anubisGold);
  px(c, 25, 7 + bob, p.scarabGold); // лесной тлеющий свет
  px(c, 38, 7 + bob, p.scarabGold);
  // Черная морда рыси с сизым пятном
  box(c, 24, 16 + bob, 16, 12, p.anubisDark, dark);
  r(c, 26, 18 + bob, 12, 7, p.anubisBlue);
  if (back) {
    r(c, 30, 18 + bob, 4, 9, p.anubisGold);
  } else {
    for (const x of [27, 35]) {
      r(c, x, 21 + bob, 3, 2, p.scarabGold); // горящие лесные глаза
      px(c, x + 1, 21 + bob, dark);
    }
    r(c, 29, 25 + bob, 6, 4, p.anubisDark);
  }
  // Деревянное копье-трость и корапщит из дубового среза
  r(c, 47, 7 + bob, 2, 46, p.mummyBase);
  r(c, 47, 5 + bob, 2, 5, p.anubisBright);
  px(c, 48, 3 + bob, p.scarabGold);
  box(
    c,
    12,
    32 + bob,
    11,
    12,
    back ? p.mummyShade : p.anubisGold,
    p.anubisDark,
  );
  r(c, 15, 35 + bob, 5, 5, back ? p.anubisGold : p.anubisBlue);
}

function djinn(c: Ctx, f: number, back: boolean) {
  // Болотный огонек: летающий дух мха и светлячков, туманный шлейф до плоскости y=56
  const float = f === 1 ? -2 : f === 3 ? 1 : 0;
  drawGroundShadow(c, 32, 16, 3, 56, 0.22);
  // Болотный шлейф из пузырьков и тумана, касающийся земли y=55
  r(c, 27, 44 + float, 10, 5, p.scorpionBase);
  r(c, 23, 47 + float, 18, 4, p.scorpionMid);
  r(c, 28, 51, 8, 5, p.scorpionBase); // лужа болота позади
  px(c, 32, 55, p.scorpionAmber); // капли, оторвавшиеся на y=55
  limbs(c, f, 32, 29 + float, p.djinnBlue);
  // Основной овал тела-огонька
  box(c, 21, 25 + float, 22, 22, p.djinnBlue, p.djinnDark);
  r(c, 24, 28 + float, 16, 15, p.djinnLight);
  r(c, 26, 33 + float, 12, 11, p.scorpionBase); // центральный тлевый свет
  // Подвесные фонаречки болота (золотые по бокам)
  r(c, 18, 29 + float, 5, 4, p.djinnGold);
  r(c, 41, 29 + float, 5, 4, p.djinnGold);
  // Головка/вспышка огонька и крошечная мухоморная шляпка на болотной прозрачности
  box(c, 24, 10 + float, 16, 16, p.djinnBlue, p.djinnDark);
  r(c, 26, 12 + float, 12, 11, p.djinnLight);
  r(c, 26, 11 + float, 12, 3, p.scarabGold); // поясок светляков
  if (back) {
    r(c, 30, 15 + float, 4, 10, p.djinnDark);
    px(c, 31, 19 + float, p.djinnGlow); // спираль позади
  } else {
    r(c, 27, 18 + float, 3, 2, p.djinnGlow); // изумрудные реснички огня
    r(c, 35, 18 + float, 3, 2, p.djinnGlow);
    r(c, 30, 23 + float, 4, 2, p.djinnDark);
  }
  // Летящая пылин-крошка
  px(c, 15 + f * 2, 44 - f, p.scarabGold);
}

function sarcophagus(c: Ctx, f: number, back: boolean) {
  // Моховой камне-голем: лесной голем из гранитного валуна с вьюном, корнями и зеленым духом
  const bob = f % 2 ? -1 : 0;
  drawGroundShadow(c, 32, 17, 4, 56, 0.42);
  feet(c, f, 32, 47, p.sarcophagusDark, p.sarcophagusBase, 6); // моховые пластины ног
  limbs(c, f, 32, 29 + bob, p.sarcophagusDark);
  // Гранитно-моховый корпус
  box(c, 18, 7 + bob, 28, 43, p.sarcophagusBase, p.sarcophagusDark);
  r(c, 21, 10 + bob, 22, 37, p.sarcophagusLight);
  r(c, 23, 13 + bob, 18, 31, p.sandBase);
  // Широкая стяжка из корня вместо лазурных ремней
  r(c, 21, 14 + bob, 22, 3, p.mummyBase);
  r(c, 21, 40 + bob, 22, 3, p.mummyBase);
  if (back) {
    r(c, 30, 18 + bob, 4, 20, p.sarcophagusDark); // центральная щель в камне на спине
    r(c, 31, 21 + bob, 2, 14, p.pharaohSoul); // сияющий зеленый лесной позвоночный дух голема
    for (const y of [22, 29, 36]) r(c, 26, y + bob, 12, 2, p.mummyLight);
    px(c, 31, 28 + bob, f % 2 ? p.pharaohSoulBright : p.pharaohSoul);
    px(c, 22, 10 + bob, p.sandBright); // свежий лесной ляден на спине
  } else {
    box(c, 25, 13 + bob, 14, 15, p.sandDark, p.sarcophagusDark);
    r(c, 27, 15 + bob, 10, 10, p.sandLight);
    // Мшисто-черными бусины глаз и лесной крюк носа голема
    r(c, 27, 19 + bob, 3, 2, p.scarabDark);
    r(c, 34, 19 + bob, 3, 2, p.scarabDark);
    r(c, 31, 19 + bob, 2, 5, p.mummyBase);
    r(c, 27, 27 + bob, 10, 11, p.pharaohSoul); // изумрудное сердце голема
    r(c, 29, 28 + bob, 6, 8, p.pharaohSoulBright);
  }
}

function priest(c: Ctx, f: number, back: boolean) {
  // Лесная ведьма зарослей: цилиндр капюшона, венец из коры, янтарная лампада зелья
  const bob = f % 2 ? -1 : 0;
  drawGroundShadow(c, 32, 14, 3, 56, 0.34);
  feet(c, f, 32, 46, p.sunPriestDark, p.sandBase);
  limbs(c, f, 32, 28 + bob, p.sunPriestBlue);
  // Темное стельное платье лесной ведьмы
  box(c, 21, 25 + bob, 22, 23, p.sunPriestBlue, p.sunPriestDark);
  r(c, 24, 27 + bob, 16, 18, p.sunPriestLight);
  r(c, 30, 29 + bob, 4, 16, p.scarabGold); // пояс с травяными талисманами
  if (back) {
    r(c, 27, 34 + bob, 10, 2, p.sunGlow);
    px(c, 31, 36 + bob, p.white);
    r(c, 28, 18 + bob, 8, 9, p.sunPriestBlue); // длинный шлейк капюшона вмятины сзади
  } else {
    r(c, 27, 30 + bob, 10, 3, p.scarabGold);
    r(c, 29, 36 + bob, 6, 5, p.sunPriestBlue);
  }
  // Глухой лесной капюшон
  box(
    c,
    25,
    11 + bob,
    14,
    15,
    back ? p.sunPriestBlue : p.sandBase,
    p.sunPriestDark,
  );
  r(c, 27, 13 + bob, 10, 10, back ? p.sunPriestLight : p.sandLight);
  if (!back) {
    for (const x of [28, 35]) px(c, x, 19 + bob, p.sunPriestDark); // блестящие глаза из-под тени колдовства
    r(c, 29, 24 + bob, 6, 2, p.sandDark);
  } else r(c, 31, 15 + bob, 2, 10, p.scarabGold);
  // Ветвяный лесной венец и посох с кварцевым ламстром и мухомором!
  for (const [x, h] of [
    [25, 7],
    [30, 10],
    [35, 7],
  ])
    r(c, x, 11 - h + bob, 3, h, p.mummyBase);
  r(c, 48, 18 + bob, 2, 37, p.mummyBase);
  box(c, 45, 10 + bob, 8, 8, p.scarabBase, p.sunPriestDark); // мухомор на посохе ведьмы!
  r(c, 47, 12 + bob, 4, 4, p.sunGlow); // яркая квора-ламма со свечением лилии
  px(c, 49, 7 + bob - (f % 2), p.sunGlow);
  px(c, 55, 14 + bob, p.sunGlow);
}

function pharaoh(c: Ctx, f: number, back: boolean) {
  // БОСС: Древний Энт-Корень — огромный лесной ствол-голом, старыий дуб с грибами-мухоморами на спине/плечах
  const bob = f % 2 ? -1 : 0;
  drawGroundShadow(c, 32, 23, 5, 56, 0.55);
  feet(c, f, 32, 42, p.mummyShade, p.mummyBase, 9); // мощные ступы-корни
  // Массивные ветви и тяжелый древесная мантия из коры по всему торсу
  box(c, 12, 19 + bob, 40, 31, p.pharaohDark, dark);
  r(c, 14, 22 + bob, 36, 24, p.pharaohBlue);
  // Красные лесные мухоморы по краям мантии-сада Энта (что видны со спины и спереди!)
  r(c, 17, 46 + bob, 7, 6, p.pharaohRuby);
  px(c, 18, 47 + bob, "#ffffff");
  px(c, 21, 48 + bob, "#ffffff");
  r(c, 39, 46 + bob, 7, 6, p.pharaohRuby);
  px(c, 40, 47 + bob, "#ffffff");
  px(c, 43, 48 + bob, "#ffffff");
  // Грудь и затылок-горб ствола
  box(c, 17, 21 + bob, 30, 24, p.pharaohBlue, p.pharaohDark);
  r(c, 19, 24 + bob, 26, 18, back ? p.pharaohDark : p.sandBase);
  r(c, 20, 23 + bob, 24, 3, p.anubisGold);
  if (back) {
    // Затылочная часть лесного волхва: корабельная просмола, драгоценное сердце мха и ветки раскрытия зарослей
    r(c, 27, 26 + bob, 10, 14, p.pharaohBlue);
    r(c, 30, 28 + bob, 4, 10, p.pharaohSoul); // живое тепло мха и древнего духа на спине
    px(c, 31, 32 + bob, p.pharaohSoulBright);
    r(c, 23, 30 + bob, 5, 3, p.anubisGold);
    r(c, 36, 30 + bob, 5, 3, p.anubisGold);
    // Верхний мох и мухомор на плечах сзади
    r(c, 19, 36 + bob, 5, 10, p.pharaohRuby);
    px(c, 21, 38 + bob, "#ffffff");
    r(c, 40, 36 + bob, 5, 10, p.pharaohRuby);
    px(c, 43, 38 + bob, "#ffffff");
  } else {
    // Оглашенное духовное сердце внутри дорогих корней Энт-голема
    r(c, 26, 29 + bob, 12, 10, p.pharaohBlue);
    r(c, 29, 31 + bob, 6, 6, p.pharaohSoul);
    px(c, 31, 33 + bob, p.pharaohSoulBright);
    r(c, 21, 40 + bob, 22, 3, p.anubisGold);
  }
  // Защитные моховые колодцы и наплечные погибы
  for (const x of [12, 43])
    box(c, x, 19 + bob, 10, 10, p.anubisGold, p.pharaohDark);
  // Ветвяный шлем-крона а-мори с золотыми желудями и плотной обводкой листвы вокруг
  r(c, 19, 11 + bob, 26, 17, p.pharaohBlue);
  r(c, 20, 15 + bob, 4, 15, p.anubisGold);
  r(c, 40, 15 + bob, 4, 15, p.anubisGold);
  box(
    c,
    24,
    8 + bob,
    16,
    18,
    back ? p.pharaohBlue : p.pharaohGold,
    p.pharaohDark,
  );
  r(c, 26, 10 + bob, 12, 12, back ? p.sandBase : p.pharaohBright);
  if (back) {
    r(c, 30, 12 + bob, 4, 12, p.anubisGold); // корневой шов сзади на затылке
    r(c, 27, 16 + bob, 10, 2, p.pharaohBlue);
  } else {
    for (const x of [27, 35]) {
      r(c, x, 17 + bob, 3, 3, p.pharaohSoul); // живые глаза-друга слезы-болота
      px(c, x + 1, 18 + bob, p.pharaohSoulBright);
    }
    r(c, 30, 21 + bob, 4, 4, p.pharaohDark);
  }
  // Молодой дух деревянной ветки с течением золотых крошек
  r(c, 26, 5 + bob, 12, 4, p.anubisGold);
  r(c, 30, 1 + bob, 4, 5, p.pharaohBright);
  px(c, 31, 0, p.pharaohRuby); // верхушка огненного мухомора на голове Энта
  // Лесной посох, закрытый в золотом кварце и тлеющей мозгом клетки позади
  r(c, 54, 20 + bob, 2, 34, p.mummyBase);
  box(c, 51, 9 + bob, 8, 9, p.anubisGold, p.pharaohDark);
  r(c, 53, 11 + bob, 4, 5, f % 2 ? p.pharaohSoulBright : p.pharaohSoul);
  px(c, 55, 6 + bob, p.pharaohBright);
  px(c, 61, 13 + bob, p.pharaohBright);
}

/** Tier 2 directions are independent from the Tier 1 drawing module. */
export function drawTier2Direction(
  c: Ctx,
  id: number,
  frame: number,
  direction: SpriteDirection,
) {
  const f = ((frame % 4) + 4) % 4;

  // Профиль (движение вбок) — отдельный набор side-отрисовщиков.
  if (direction === "side") {
    switch (id) {
      case 11:
        return drawSporelingSide(c, f);
      case 12:
        return drawDryadSide(c, f);
      case 13:
        return drawBogGhoulSide(c, f);
      case 14:
        return drawMarshBeastSide(c, f);
      case 15:
        return drawForestCaracalSide(c, f);
      case 16:
        return drawStagGuardianSide(c, f);
      case 17:
        return drawSwampWispSide(c, f);
      case 18:
        return drawMossGolemSide(c, f);
      case 19:
        return drawThicketWitchSide(c, f);
      case 20:
        return drawRootEntSide(c, f);
    }
    return;
  }

  // Фронт и спина — как было.
  const back = direction === "back";
  switch (id) {
    case 11:
      return back ? rearScarab(c, f) : frontScarab(c, f);
    case 12:
      return raider(c, f, back);
    case 13:
      return mummy(c, f, back);
    case 14:
      return scorpion(c, f, back);
    case 15:
      return basilisk(c, f, back);
    case 16:
      return anubis(c, f, back);
    case 17:
      return djinn(c, f, back);
    case 18:
      return sarcophagus(c, f, back);
    case 19:
      return priest(c, f, back);
    case 20:
      return pharaoh(c, f, back);
  }
}

export const TIER2_DIRECTION_GUIDE: Record<SpriteDirection, string> = {
  front:
    "Вид спереди: моб идет вниз, к игроку. В кадрах 0 и 2 чередуются поднятая левая и правая стопа; опорная нога остается на y=56.",
  side: "Вид сбоку: моб движется вправо. Четыре кадра чередуют опорную ногу, перенос веса и движение оружия или хвоста.",
  back: "Вид со спины: моб идет вверх, от игрока. Голова и спина без глаз и лица; в кадрах 0 и 2 меняется опорная стопа на y=56.",
};
