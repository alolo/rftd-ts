import * as Phaser from "phaser";
import type { MainScene } from "./main";
// import { TOWER_DICTIONARY } from "./tower";

export class Informer {
  public container!: Phaser.GameObjects.Container;
  private readonly MENU_WIDTH = 420;
  private readonly MENU_HEIGHT = 540;

  constructor(private scene: MainScene) {
    this.createUI();
  }

  private createUI() {
    const x = this.scene.scale.width / 2;
    const y = this.scene.scale.height / 2;

    this.container = this.scene.add
      .container(x, y)
      .setDepth(300)
      .setVisible(false);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x111111, 0.85);
    bg.fillRoundedRect(
      -this.MENU_WIDTH / 2,
      -this.MENU_HEIGHT / 2,
      this.MENU_WIDTH,
      this.MENU_HEIGHT,
      16,
    );
    bg.lineStyle(3, 0x00ffff);
    bg.strokeRoundedRect(
      -this.MENU_WIDTH / 2,
      -this.MENU_HEIGHT / 2,
      this.MENU_WIDTH,
      this.MENU_HEIGHT,
      16,
    );

    const title = this.scene.add
      .text(0, -this.MENU_HEIGHT / 2 + 25, "📚 ЭНЦИКЛОПЕДИЯ БАШЕН", {
        fontSize: "22px",
        color: "#00ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const btnClose = this.scene.add
      .text(this.MENU_WIDTH / 2 - 30, -this.MENU_HEIGHT / 2 + 25, "✖", {
        fontSize: "24px",
        color: "#ff5555",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

    const blocker = this.scene.add
      .zone(
        -this.MENU_WIDTH / 2,
        -this.MENU_HEIGHT / 2,
        this.MENU_WIDTH,
        this.MENU_HEIGHT,
      )
      .setOrigin(0, 0)
      .setInteractive()
      .on(
        "pointerdown",
        (
          p: Phaser.Input.Pointer,
          x: number,
          y: number,
          e: Phaser.Types.Input.EventData,
        ) => e.stopPropagation(),
      );

    this.container.add([blocker, bg, title, btnClose]);

    // --- ГЕНЕРИРУЕМ СЕТКУ БАШЕН ---
    const cols = 7;
    const cellSize = 48;
    const spacing = 5;
    const totalCellSize = cellSize + spacing;

    const startX = -((cols * totalCellSize) / 2) + totalCellSize / 2;
    const startY = -this.MENU_HEIGHT / 2 + 100;

    let i = 0;
    for (let lvl = 1; lvl <= 6; lvl++) {
      const maxVariants = lvl === 6 ? 21 : 7;
      for (let v = 1; v <= maxVariants; v++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const slotX = startX + col * totalCellSize;
        const slotY = startY + row * totalCellSize;

        const slotBg = this.scene.add.graphics();
        slotBg.fillStyle(this.getFarmColor(lvl), 1);
        const p = 2;
        slotBg.fillRect(
          slotX - cellSize / 2 + p,
          slotY - cellSize / 2 + p,
          cellSize - p * 2,
          cellSize - p * 2,
        );

        this.container.add(slotBg);

        const textureName = `${lvl}_${v}`;
        const towerIcon = this.scene.add.image(
          slotX,
          slotY,
          "towers",
          textureName,
        );

        towerIcon.setOrigin(0.5, 0.5);

        // ИСПРАВЛЕНО: baseScale теперь реально соответствует тому,
        // что установлено у иконки. Раньше baseScale оставался 0.31,
        // и при ховере иконка прыгала к неверному размеру.
        const maxDim = Math.max(towerIcon.width, towerIcon.height);
        let baseScale = 0.31;
        if (maxDim > 0) {
          baseScale = 42 / maxDim;
          towerIcon.setScale(baseScale);
        }

        this.container.add(towerIcon);

        const zone = this.scene.add
          .zone(slotX, slotY, cellSize, cellSize)
          .setInteractive({ useHandCursor: true });
        zone.on("pointerover", () => {
          this.scene.tweens.add({
            targets: towerIcon,
            scale: baseScale * 1.25,
            duration: 100,
            ease: "Sine.easeOut",
          });
        });

        zone.on("pointerout", () => {
          this.scene.tweens.add({
            targets: towerIcon,
            scale: baseScale,
            duration: 100,
            ease: "Sine.easeOut",
          });
        });

        zone.on(
          "pointerdown",
          (
            p: Phaser.Input.Pointer,
            x: number,
            y: number,
            e: Phaser.Types.Input.EventData,
          ) => {
            e.stopPropagation();
            this.scene.showInformerInfo(lvl, v);

            this.scene.tweens.add({
              targets: towerIcon,
              scale: baseScale * 0.9,
              duration: 50,
              yoyo: true,
            });
          },
        );

        this.container.add(zone);
        i++;
      }
    }
  }

  private getFarmColor(level: number): number {
    const colors = [0xbbbbbd, 0x8aff8a, 0x4db2ff, 0xa3648f, 0xf1ff52, 0xace5ee];
    return colors[(level - 1) % colors.length];
  }

  public show() {
    this.container.setVisible(true);
  }

  public hide() {
    this.container.setVisible(false);
    if (this.scene.interaction.selectedInformerTower) {
      this.scene.interaction.selectedInformerTower = null;
      this.scene.sideMenuContainer.setVisible(false);
    }
  }

  public isVisible(): boolean {
    return this.container && this.container.visible;
  }

  public checkClickOutside(pixelX: number, pixelY: number): boolean {
    if (!this.isVisible()) return false;

    const mCenterX = this.scene.scale.width / 2;
    const mCenterY = this.scene.scale.height / 2;

    if (
      pixelX < mCenterX - this.MENU_WIDTH / 2 ||
      pixelX > mCenterX + this.MENU_WIDTH / 2 ||
      pixelY < mCenterY - this.MENU_HEIGHT / 2 ||
      pixelY > mCenterY + this.MENU_HEIGHT / 2
    ) {
      this.hide();
    }
    return true;
  }
}
