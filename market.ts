import * as Phaser from "phaser";
import type { MainScene } from "./main";
import { Tower } from "./tower";
import { attachTooltipWithAction } from "./tooltip";

export class Market {
  public container!: Phaser.GameObjects.Container;

  private readonly MENU_WIDTH = 512;
  private readonly MENU_HEIGHT = 336;
  private readonly MENU_BOTTOM_MARGIN = 20;

  constructor(private scene: MainScene) {
    this.createUI();
  }

  private createUI() {
    const x = this.scene.scale.width / 2;
    const y =
      this.scene.scale.height - this.MENU_HEIGHT / 2 - this.MENU_BOTTOM_MARGIN;

    this.container = this.scene.add
      .container(x, y)
      .setDepth(300)
      .setVisible(false);

    // Блокировщик кликов (нижний слой)
    const marketBlocker = this.scene.add
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

    // Фон — деревянная панель через nineslice под 512×336
    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodButtonClear",
      this.MENU_WIDTH,
      this.MENU_HEIGHT,
      70,
      70,
      70,
      70,
    );

    // Баннер-заголовок (выступает за края панели сверху)
    const banner = this.scene.add.image(
      0,
      -this.MENU_HEIGHT / 2 + 10,
      "ui_v2",
      "greenBanner1",
    );
    banner.setScale(0.55);

    const title = this.scene.add
      .text(0, -this.MENU_HEIGHT / 2 + 10, "МАГАЗИН УЛУЧШЕНИЙ", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#1f3d1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // Кнопка закрытия (в правом верхнем углу внутри панели)
    const btnClose = this.scene.add
      .image(
        this.MENU_WIDTH / 2 - 7,
        -this.MENU_HEIGHT / 2 + 7,
        "ui_v2",
        "squareButtonWoodClose",
      )
      .setDisplaySize(36, 36)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide())
      .on("pointerover", () => btnClose.setTint(0xdddddd))
      .on("pointerout", () => btnClose.clearTint());

    this.container.add([marketBlocker, bg, banner, title, btnClose]);

    const cols = 4;
    const rows = 4;
    const cellSize = 48;
    const spacingX = 90;
    const spacingY = 56;
    const startX = -((cols - 1) * spacingX) / 2;
    const startY = -((rows - 1) * spacingY) / 2.25;

    const allSlotBg = this.scene.add.graphics();
    const slotFrames: Phaser.GameObjects.Image[] = [];
    const icons: Phaser.GameObjects.Image[] = [];
    const zones: Phaser.GameObjects.Zone[] = [];

    const itemFrames: (string | null)[] = [
      "attackNormal",
      "attackPiercing",
      "attackSiege",
      "attackMagic",
      "attackHeroic",
      "attackLight",
      "attackDark",
      null,
      "ticket",
      null,
      null,
      null,
      "priceUp",
      "attackUp",
      "couponDiscount",
      "couponReroll",
    ];

    for (let i = 0; i < 16; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const slotX = startX + col * spacingX;
      const slotY = startY + row * spacingY;

      allSlotBg.fillStyle(0x2a1a0a, 0.7);
      allSlotBg.fillRoundedRect(
        slotX - cellSize / 2,
        slotY - cellSize / 2,
        cellSize,
        cellSize,
        6,
      );
      allSlotBg.lineStyle(2, 0x8a5a2a, 0.9);
      allSlotBg.strokeRoundedRect(
        slotX - cellSize / 2,
        slotY - cellSize / 2,
        cellSize,
        cellSize,
        6,
      );

      const slotFrame = this.scene.add
        .image(slotX, slotY, "ui_v2", "squareButtonWoodWithoutBg")
        .setDisplaySize(cellSize + 2, cellSize + 2);
      slotFrames.push(slotFrame);

      const frameName = itemFrames[i];
      if (frameName) {
        const iconImg = this.scene.add.image(slotX, slotY, "icon", frameName);

        const frame = this.scene.textures.getFrame("icon", frameName);
        const maxDim = frame ? Math.max(frame.width, frame.height) : 128;
        const baseScale = 40 / maxDim;

        iconImg.setScale(baseScale);
        iconImg.setData("baseScale", baseScale);
        icons.push(iconImg);

        const zone = this.setupMarketItem(
          i,
          slotX,
          slotY,
          cellSize,
          iconImg,
          slotFrame,
        );
        zones.push(zone);
      }
    }
    this.container.add(allSlotBg);
    this.container.add(slotFrames);
    this.container.add(icons);
    this.container.add(zones);
  }

  private setupMarketItem(
    index: number,
    x: number,
    y: number,
    size: number,
    iconElement: Phaser.GameObjects.Image,
    slotFrame: Phaser.GameObjects.Image,
  ): Phaser.GameObjects.Zone {
    const zone = this.scene.add
      .zone(x, y, size, size)
      .setInteractive({ useHandCursor: true });

    let getTooltip = () => "";
    let buyAction = () => {};

    const baseScale = iconElement.getData("baseScale") as number;

    if (index >= 0 && index <= 6) {
      const dmgType = index + 1;
      getTooltip = () => {
        const level = this.scene.economy.damageUpgrades[dmgType];
        const cost = 120 + level * 60;
        const typeName = Tower.DAMAGE_TYPES[dmgType];
        return `Улучшение урона: ${typeName}\nУровень: ${level}/20 (+${level * 15}%)\nЦена: ${level >= 20 ? "МАКСИМУМ" : cost + " золота"}`;
      };
      buyAction = () => {
        const level = this.scene.economy.damageUpgrades[dmgType];
        const cost = 120 + level * 60;
        if (level < 20 && this.scene.economy.spendGold(cost)) {
          this.scene.economy.damageUpgrades[dmgType]++;
          this.scene.goldText.setText(`: ${this.scene.economy.gold}`);
          this.scene.showNotification(
            `Урон ${Tower.DAMAGE_TYPES[dmgType]} повышен!`,
          );
          this.scene.builder.updateAllAuras();
        } else if (level >= 20)
          this.scene.showNotification("Максимальный уровень!");
        else this.scene.showNotification("Недостаточно золота!");
      };
    } else if (index === 8) {
      getTooltip = () =>
        `Счастливый билет\nДает 1 попытку в рулетке\nЦена: 40 семян`;
      buyAction = () => {
        if (this.scene.economy.spendWood(40)) {
          this.scene.inventory.addItem("ticket", 1);
          this.scene.woodText.setText(`: ${this.scene.economy.wood}`);
          this.scene.showNotification("Счастливый билет куплен!");
        } else this.scene.showNotification("Недостаточно семян!");
      };
    } else if (index === 12) {
      getTooltip = () =>
        `+20% к базовой цене всех овощей\nКуплено: ${Math.round((this.scene.economy.cropPriceBonus - 1) * 5)} раз\nЦена: 1 медаль`;
      buyAction = () => {
        if (this.scene.economy.spendMedals(1)) {
          this.scene.economy.cropPriceBonus += 0.2;
          this.scene.medalsText.setText(`: ${this.scene.economy.medals}`);
          this.scene.economy.updateMarketPrices();
          this.scene.updateMarketUI();
          this.scene.showNotification("Цены на овощи повышены!");
        } else this.scene.showNotification("Недостаточно медалей!");
      };
    } else if (index === 13) {
      getTooltip = () =>
        `+10% к атаке ВСЕХ башен\nКуплено: ${Math.round(this.scene.economy.globalDamageBuff * 10)} раз\nЦена: 1 медаль`;
      buyAction = () => {
        if (this.scene.economy.spendMedals(1)) {
          this.scene.economy.globalDamageBuff += 0.1;
          this.scene.medalsText.setText(`: ${this.scene.economy.medals}`);
          this.scene.showNotification("Глобальная атака повышена!");
          this.scene.builder.updateAllAuras();
        } else this.scene.showNotification("Недостаточно медалей!");
      };
    } else if (index === 14) {
      getTooltip = () =>
        `Скидка 100% на дорогую башню\nВ инвентаре: ${this.scene.inventory.getItemCount("coupon")} шт.\nЦена: 1 медаль`;
      buyAction = () => {
        if (this.scene.economy.spendMedals(1)) {
          this.scene.inventory.addItem("coupon", 1);
          this.scene.medalsText.setText(`: ${this.scene.economy.medals}`);
          this.scene.showNotification("Купон получен!");
        } else this.scene.showNotification("Недостаточно медалей!");
      };
    } else if (index === 15) {
      getTooltip = () =>
        `Замена башни 6 ур на другую\nДает 2 заряда в инвентарь\nЦена: 1 медаль`;
      buyAction = () => {
        if (this.scene.economy.spendMedals(1)) {
          this.scene.inventory.addItem("reroll", 2);
          this.scene.medalsText.setText(`: ${this.scene.economy.medals}`);
          this.scene.showNotification("Заряды замены получены!");
        } else this.scene.showNotification("Недостаточно медалей!");
      };
    }

    attachTooltipWithAction(
      this.scene,
      zone,
      getTooltip,
      () => {
        buyAction();
        this.scene.tweens.killTweensOf(iconElement);
        this.scene.tweens.add({
          targets: iconElement,
          scale: baseScale * 0.9,
          duration: 50,
          yoyo: true,
        });
      },
      { position: "above-target" },
    );

    // Визуальный hover (tint + scale) — независимо от тултипа
    zone.on("pointerover", () => {
      slotFrame.setTint(0xdddddd);
      this.scene.tweens.killTweensOf(iconElement);
      this.scene.tweens.add({
        targets: iconElement,
        scale: baseScale * 1.2,
        duration: 100,
        ease: "Sine.easeOut",
      });
    });
    zone.on("pointerout", () => {
      slotFrame.clearTint();
      this.scene.tweens.killTweensOf(iconElement);
      this.scene.tweens.add({
        targets: iconElement,
        scale: baseScale,
        duration: 100,
        ease: "Sine.easeOut",
      });
    });

    return zone;
  }

  public show() {
    this.container.setVisible(true);
  }

  public hide() {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container && this.container.visible;
  }

  public checkClickOutside(pixelX: number, pixelY: number): boolean {
    if (!this.isVisible()) return false;

    const mCenterX = this.scene.scale.width / 2;
    const mCenterY =
      this.scene.scale.height - this.MENU_HEIGHT / 2 - this.MENU_BOTTOM_MARGIN;

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
