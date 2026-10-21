import * as Phaser from "phaser";
import type { CropType } from "./economy";

export class Crop {
  public type: CropType;
  public wavesAlive: number = 0;
  public isCrop: boolean = true;
  public get centerY(): number {
    return this.container.y;
  }

  private container: Phaser.GameObjects.Container;
  private auraGraphic: Phaser.GameObjects.Graphics; // Добавили графику для ауры
  private cellSize: number;

  constructor(
    scene: Phaser.Scene,
    col: number,
    row: number,
    type: CropType,
    cellSize: number,
  ) {
    this.type = type;
    this.cellSize = cellSize;

    // 1. Создаем графику ауры
    this.auraGraphic = scene.add.graphics();

    // --- КАРТИНКА ОВОЩА ---
    const cropImage = scene.add.image(0, 0, type);
    cropImage.setOrigin(0.5);

    const maxDim = Math.max(cropImage.width, cropImage.height);
    if (maxDim > 0) {
      const targetSize = cellSize + 2;
      const scale = targetSize / maxDim;
      cropImage.setScale(scale);
    }

    // Рисуем ауру в "обычном" (невыделенном) состоянии при создании
    this.drawAura(false);

    // 2. Упаковываем: сначала аура (чтобы была под землей), затем сама картинка
    this.container = scene.add.container(
      col * cellSize + cellSize / 2,
      row * cellSize + cellSize / 2,
      [this.auraGraphic, cropImage],
    );
    this.container.setDepth(4);
  }

  private drawAura(isSelected: boolean) {
    if (!this.auraGraphic) return;

    this.auraGraphic.clear();

    const glowX = 0;
    const glowY = 10;

    if (isSelected) {
      this.auraGraphic.lineStyle(2, 0xffff00, 1);
      this.auraGraphic.strokeEllipse(
        glowX,
        glowY,
        this.cellSize * 1,
        this.cellSize * 0.4,
      );
    }
  }

  public setSelected(isSelected: boolean) {
    this.drawAura(isSelected);
  }

  public destroy() {
    this.container.destroy();
  }
}
