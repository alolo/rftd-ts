import * as Phaser from "phaser";

let currentTooltip: Phaser.GameObjects.Text | null = null;
let autoHideTimer: Phaser.Time.TimerEvent | null = null;

const LONG_PRESS_MS = 400;
const AUTO_HIDE_MS = 2500;
const MOVE_TOLERANCE_PX = 15;

function isTouchPointer(p: Phaser.Input.Pointer): boolean {
  const pt = (p as any).pointerType as string | undefined;
  if (pt === "touch" || pt === "pen") return true;
  if (pt === "mouse") return false;
  if ((p as any).wasTouch === true) return true;
  const evt = (p as any).event as PointerEvent | undefined;
  if (evt?.pointerType === "touch" || evt?.pointerType === "pen") return true;
  return false;
}

export function showTooltip(
  scene: Phaser.Scene,
  pointerX: number,
  pointerY: number,
  text: string,
) {
  if (!text) return;
  hideTooltip();

  const clampedX = Phaser.Math.Clamp(pointerX, 120, scene.scale.width - 120);
  const tooltip = scene.add
    .text(clampedX, pointerY, text, {
      fontSize: "16px",
      color: "#fff5e0",
      backgroundColor: "#000000dd",
      padding: { x: 12, y: 8 },
      align: "center",
      stroke: "#000000",
      strokeThickness: 2,
      fontStyle: "bold",
    })
    .setOrigin(0.5, 1)
    .setDepth(2000);

  if (tooltip.y - tooltip.height < 70) {
    tooltip.setOrigin(0.5, 0);
    tooltip.setY(pointerY);
  }

  currentTooltip = tooltip;
}

export function hideTooltip() {
  if (autoHideTimer) {
    autoHideTimer.remove(false);
    autoHideTimer = null;
  }
  if (currentTooltip) {
    currentTooltip.destroy();
    currentTooltip = null;
  }
}

function scheduleAutoHide(scene: Phaser.Scene, delayMs: number) {
  if (autoHideTimer) autoHideTimer.remove(false);
  autoHideTimer = scene.time.delayedCall(delayMs, () => {
    autoHideTimer = null;
    if (currentTooltip) {
      currentTooltip.destroy();
      currentTooltip = null;
    }
  });
}

export interface AttachOptions {
  /** Где показывать: над указателем (default) или над самим объектом */
  position?: "cursor" | "above-target";
}

function computeTooltipPosition(
  target: Phaser.GameObjects.GameObject,
  pointer: Phaser.Input.Pointer,
  position: "cursor" | "above-target",
  isTouch: boolean,
): { x: number; y: number } {
  if (position === "above-target") {
    const bounds = (target as any).getBounds?.();
    if (bounds) {
      return { x: bounds.centerX, y: bounds.top - 6 };
    }
  }
  const y = pointer.y - (isTouch ? 60 : 30);
  return { x: pointer.x, y };
}

/** Обычный тултип: hover (мышь) или long-press (тач). Не мешает действию. */
export function attachTooltip(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  text: string | (() => string),
  options: AttachOptions = {},
) {
  const resolveText = () => (typeof text === "function" ? text() : text);
  const position = options.position ?? "cursor";

  let longPressTimer: Phaser.Time.TimerEvent | null = null;
  let pressStartX = 0;
  let pressStartY = 0;

  const cancelLongPress = () => {
    if (longPressTimer) {
      longPressTimer.remove(false);
      longPressTimer = null;
    }
  };

  // Мышь
  target.on("pointerover", (p: Phaser.Input.Pointer) => {
    if (isTouchPointer(p)) return;
    const pos = computeTooltipPosition(target, p, position, false);
    showTooltip(scene, pos.x, pos.y, resolveText());
  });
  target.on("pointerout", (p: Phaser.Input.Pointer) => {
    if (isTouchPointer(p)) return;
    hideTooltip();
  });

  // Тач
  target.on("pointerdown", (p: Phaser.Input.Pointer) => {
    if (!isTouchPointer(p)) return;
    pressStartX = p.x;
    pressStartY = p.y;
    cancelLongPress();
    longPressTimer = scene.time.delayedCall(LONG_PRESS_MS, () => {
      longPressTimer = null;
      const pos = computeTooltipPosition(target, p, position, true);
      showTooltip(scene, pos.x, pos.y, resolveText());
    });
  });
  target.on("pointermove", (p: Phaser.Input.Pointer) => {
    if (!isTouchPointer(p) || !p.isDown) return;
    const dx = p.x - pressStartX;
    const dy = p.y - pressStartY;
    if (dx * dx + dy * dy > MOVE_TOLERANCE_PX * MOVE_TOLERANCE_PX) {
      cancelLongPress();
      hideTooltip();
    }
  });
  target.on("pointerup", (p: Phaser.Input.Pointer) => {
    if (!isTouchPointer(p)) return;
    if (longPressTimer) {
      cancelLongPress();
    } else if (currentTooltip) {
      scheduleAutoHide(scene, AUTO_HIDE_MS);
    }
  });
  target.on("pointerupoutside", (p: Phaser.Input.Pointer) => {
    if (!isTouchPointer(p)) return;
    cancelLongPress();
    if (currentTooltip) scheduleAutoHide(scene, AUTO_HIDE_MS);
  });
}

/**
 * Тултип + безопасное действие.
 * Мышь: hover → тултип, click → action.
 * Тач: короткий тап → action; long-press 400мс → только тултип, БЕЗ action.
 */
export function attachTooltipWithAction(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  text: string | (() => string),
  action: () => void,
  options: AttachOptions = {},
) {
  const resolveText = () => (typeof text === "function" ? text() : text);
  const position = options.position ?? "above-target";

  let longPressTimer: Phaser.Time.TimerEvent | null = null;
  let pressStartX = 0;
  let pressStartY = 0;
  let longPressFired = false;
  let movedTooFar = false;

  const cancelLongPress = () => {
    if (longPressTimer) {
      longPressTimer.remove(false);
      longPressTimer = null;
    }
  };

  // Мышь
  target.on("pointerover", (p: Phaser.Input.Pointer) => {
    if (isTouchPointer(p)) return;
    const pos = computeTooltipPosition(target, p, position, false);
    showTooltip(scene, pos.x, pos.y, resolveText());
  });
  target.on("pointerout", (p: Phaser.Input.Pointer) => {
    if (isTouchPointer(p)) return;
    hideTooltip();
  });

  // Клик/тап
  target.on("pointerdown", (p: Phaser.Input.Pointer) => {
    if (isTouchPointer(p)) {
      pressStartX = p.x;
      pressStartY = p.y;
      longPressFired = false;
      movedTooFar = false;
      cancelLongPress();
      longPressTimer = scene.time.delayedCall(LONG_PRESS_MS, () => {
        longPressTimer = null;
        longPressFired = true;
        const pos = computeTooltipPosition(target, p, position, true);
        showTooltip(scene, pos.x, pos.y, resolveText());
      });
    } else {
      action();
    }
  });

  target.on("pointermove", (p: Phaser.Input.Pointer) => {
    if (!isTouchPointer(p) || !p.isDown) return;
    const dx = p.x - pressStartX;
    const dy = p.y - pressStartY;
    if (dx * dx + dy * dy > MOVE_TOLERANCE_PX * MOVE_TOLERANCE_PX) {
      movedTooFar = true;
      cancelLongPress();
      hideTooltip();
    }
  });

  target.on("pointerup", (p: Phaser.Input.Pointer) => {
    if (!isTouchPointer(p)) return;

    if (longPressFired) {
      scheduleAutoHide(scene, AUTO_HIDE_MS);
    } else if (longPressTimer && !movedTooFar) {
      cancelLongPress();
      action();
    } else {
      cancelLongPress();
    }

    longPressFired = false;
    movedTooFar = false;
  });

  target.on("pointerupoutside", (p: Phaser.Input.Pointer) => {
    if (!isTouchPointer(p)) return;
    cancelLongPress();
    longPressFired = false;
    movedTooFar = false;
    if (currentTooltip) scheduleAutoHide(scene, AUTO_HIDE_MS);
  });
}
