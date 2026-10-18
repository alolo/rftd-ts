import * as Phaser from "phaser";

let currentTooltip: Phaser.GameObjects.Text | null = null;

export function showTooltip(
  scene: Phaser.Scene,
  pointerX: number,
  pointerY: number,
  text: string,
) {
  hideTooltip();

  const clampedX = Phaser.Math.Clamp(pointerX, 120, scene.scale.width - 120);
  let tooltipY = pointerY - 30;

  const tooltip = scene.add
    .text(clampedX, tooltipY, text, {
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

  // Если тултип уходит за верх — показываем под курсором
  if (tooltip.y - tooltip.height < 70) {
    tooltip.setOrigin(0.5, 0);
    tooltip.setY(pointerY);
  }

  currentTooltip = tooltip;
}

export function hideTooltip() {
  if (currentTooltip) {
    currentTooltip.destroy();
    currentTooltip = null;
  }
}

export function attachTooltip(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  text: string | (() => string),
) {
  target.on("pointerover", () => {
    const t = typeof text === "function" ? text() : text;
    const p = scene.input.activePointer;
    showTooltip(scene, p.x, p.y, t);
  });
  target.on("pointerout", () => {
    hideTooltip();
  });
}
