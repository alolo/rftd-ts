import * as Phaser from "phaser";
import type { MainScene } from "./main";
// import { TOWER_DICTIONARY } from "./tower";

export class Informer {
  public container!: Phaser.GameObjects.Container;
  private readonly MENU_WIDTH = 420;
  private readonly MENU_HEIGHT = 540;
  private slotZones: Phaser.GameObjects.Zone[] = [];

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

    // Блокировщик кликов (нижний слой)
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

    // Фон — деревянная панель через nineslice
    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodButtonClear",
      this.MENU_WIDTH,
      this.MENU_HEIGHT,
      50,
      50,
      50,
      50,
    );

    // Баннер-заголовок сверху
    const banner = this.scene.add.image(
      0,
      -this.MENU_HEIGHT / 2 + 5,
      "ui_v2",
      "greenBanner1",
    );
    banner.setScale(0.6);

    // Группа заголовка: иконка книги + текст
    const titleGroup = this.scene.add.container(0, -this.MENU_HEIGHT / 2 + 5);

    const bookIcon = this.scene.add
      .image(0, 0, "icon", "book")
      .setDisplaySize(26, 26);

    const titleText = this.scene.add
      .text(0, 0, "ЭНЦИКЛОПЕДИЯ БАШЕН", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#1f3d1f",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);

    const gap = 8;
    const iconW = bookIcon.displayWidth;
    const textW = titleText.width;
    const totalWidth = iconW + gap + textW;
    const leftX = -totalWidth / 2;
    bookIcon.setX(leftX + iconW / 2);
    titleText.setX(leftX + iconW + gap);

    titleGroup.add([bookIcon, titleText]);

    // Кнопка закрытия — деревянный крестик в правом верхнем углу
    const btnClose = this.scene.add
      .image(
        this.MENU_WIDTH / 2 - 6,
        -this.MENU_HEIGHT / 2 + 6,
        "ui_v2",
        "squareButtonWoodClose",
      )
      .setDisplaySize(32, 32)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide())
      .on("pointerover", () => btnClose.setTint(0xdddddd))
      .on("pointerout", () => btnClose.clearTint());

    this.container.add([blocker, bg, banner, titleGroup, btnClose]);

    // --- ГЕНЕРИРУЕМ СЕТКУ БАШЕН ---
    const cols = 7;
    const cellSize = 48;
    const spacing = 5;
    const totalCellSize = cellSize + spacing;

    const startX = -((cols * totalCellSize) / 2) + totalCellSize / 2;
    const startY = -this.MENU_HEIGHT / 2 + 100;

    // Один Graphics для ВСЕХ фонов — вместо 56 отдельных.
    const allSlotBg = this.scene.add.graphics();

    // Собираем кадры, иконки и зоны в массивы.
    const slotFrames: Phaser.GameObjects.Image[] = [];
    const towerIcons: Phaser.GameObjects.Image[] = [];
    const isTouch = !this.scene.sys.game.device.os.desktop;

    let i = 0;
    let lastLevel = -1;
    for (let lvl = 1; lvl <= 6; lvl++) {
      const maxVariants = lvl === 6 ? 21 : 7;
      for (let v = 1; v <= maxVariants; v++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const slotX = startX + col * totalCellSize;
        const slotY = startY + row * totalCellSize;

        // 1. Фон в ОДИН общий Graphics. Смена цвета только при смене уровня.
        if (lvl !== lastLevel) {
          allSlotBg.fillStyle(this.getFarmColor(lvl), 1);
          lastLevel = lvl;
        }
        const pad = 2;
        allSlotBg.fillRect(
          slotX - cellSize / 2 + pad,
          slotY - cellSize / 2 + pad,
          cellSize - pad * 2,
          cellSize - pad * 2,
        );

        // 2. Рамка — пока в массив, добавим позже пачкой
        const slotFrame = this.scene.add
          .image(slotX, slotY, "ui_v2", "squareButtonWoodWithoutBg")
          .setDisplaySize(cellSize, cellSize);
        slotFrames.push(slotFrame);

        // 3. Иконка — тоже в массив
        const textureName = `${lvl}_${v}`;
        const towerIcon = this.scene.add.image(
          slotX,
          slotY,
          "towers",
          textureName,
        );
        towerIcon.setOrigin(0.5, 0.5);
        const maxDim = Math.max(towerIcon.width, towerIcon.height);
        let baseScale = 0.31;
        if (maxDim > 0) {
          baseScale = (cellSize - 12) / maxDim;
          towerIcon.setScale(baseScale);
        }
        towerIcons.push(towerIcon);

        // 4. Зона клика
        const zone = this.scene.add
          .zone(slotX, slotY, cellSize, cellSize)
          .setInteractive({ useHandCursor: true });

        zone.on("pointerover", () => {
          slotFrame.setTint(0xdddddd);
          if (isTouch) return;
          this.scene.tweens.killTweensOf(towerIcon);
          this.scene.tweens.add({
            targets: towerIcon,
            scale: baseScale * 1.25,
            duration: 100,
            ease: "Sine.easeOut",
          });
        });

        zone.on("pointerout", () => {
          slotFrame.clearTint();
          if (isTouch) return;
          this.scene.tweens.killTweensOf(towerIcon);
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
            _p: Phaser.Input.Pointer,
            _lx: number,
            _ly: number,
            e: Phaser.Types.Input.EventData,
          ) => {
            e.stopPropagation();
            this.scene.showInformerInfo(lvl, v);
            this.scene.tweens.killTweensOf(towerIcon);
            this.scene.tweens.add({
              targets: towerIcon,
              scale: baseScale * 0.9,
              duration: 50,
              yoyo: true,
            });
          },
        );

        this.slotZones.push(zone);
        i++;
      }
    }
    this.container.add(allSlotBg);
    this.container.add(slotFrames);
    this.container.add(towerIcons);
    this.container.add(this.slotZones);
  }

  private getFarmColor(level: number): number {
    const colors = [0xbbbbbd, 0x8aff8a, 0x4db2ff, 0xa3648f, 0xf1ff52, 0xace5ee];
    return colors[(level - 1) % colors.length];
  }

  public show() {
    this.container.setVisible(true);
    this.slotZones.forEach((z) => z.setInteractive({ useHandCursor: true }));
  }

  public hide() {
    this.container.setVisible(false);
    this.slotZones.forEach((z) => z.disableInteractive());
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
