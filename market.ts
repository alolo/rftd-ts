import * as Phaser from "phaser";
import type { MainScene } from "./main";
import { Tower } from "./tower";

export class Market {
  public container!: Phaser.GameObjects.Container;
  private tooltipText!: Phaser.GameObjects.Text;

  private readonly MENU_WIDTH = 512;
  private readonly MENU_HEIGHT = 336;

  constructor(private scene: MainScene) {
    this.createUI();
  }

  private createUI() {
    const x = this.scene.scale.width / 2;
    const y = this.scene.scale.height - this.MENU_HEIGHT / 1.8;

    this.container = this.scene.add
      .container(x, y)
      .setDepth(300)
      .setVisible(false);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x111111, 0.7);
    bg.fillRoundedRect(
      -this.MENU_WIDTH / 2,
      -this.MENU_HEIGHT / 2,
      this.MENU_WIDTH,
      this.MENU_HEIGHT,
      16,
    );
    bg.lineStyle(2, 0xffd700);
    bg.strokeRoundedRect(
      -this.MENU_WIDTH / 2,
      -this.MENU_HEIGHT / 2,
      this.MENU_WIDTH,
      this.MENU_HEIGHT,
      16,
    );

    const title = this.scene.add
      .text(0, -this.MENU_HEIGHT / 2 + 25, "⚖️ РЫНОК", {
        fontSize: "18px",
        color: "#ffd700",
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

    this.tooltipText = this.scene.add
      .text(0, -180, "Наведите на товар для информации", {
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
        backgroundColor: "#222222",
        padding: { x: 12, y: 12 },
      })
      .setOrigin(0.5);
    this.tooltipText.setStroke("#ffffff", 0.5);

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

    this.container.add([bg, marketBlocker, title, btnClose, this.tooltipText]);

    const cols = 4;
    const cellSize = 48;
    const spacingX = 100;
    const spacingY = 70;
    const startX = -160;
    const startY = -100;

    const itemIcons = [
      "⚔️1",
      "⚔️2",
      "⚔️3",
      "⚔️4",
      "⚔️5",
      "⚔️6",
      "⚔️7",
      "",
      "🎫",
      "",
      "",
      "",
      "📈",
      "💪",
      "🎟️",
      "🎲",
    ];

    for (let i = 0; i < 16; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const slotX = startX + col * spacingX;
      const slotY = startY + row * spacingY;

      const slotBg = this.scene.add.graphics();
      slotBg.fillStyle(0x333333, 1);
      slotBg.fillRect(
        slotX - cellSize / 2,
        slotY - cellSize / 2,
        cellSize,
        cellSize,
      );
      slotBg.lineStyle(2, 0x777777);
      slotBg.strokeRect(
        slotX - cellSize / 2,
        slotY - cellSize / 2,
        cellSize,
        cellSize,
      );
      this.container.add(slotBg);

      if (itemIcons[i] !== "") {
        const iconText = this.scene.add
          .text(slotX, slotY, itemIcons[i], { fontSize: "20px" })
          .setOrigin(0.5);
        this.container.add(iconText);
        this.setupMarketItem(i, slotX, slotY, cellSize, iconText);
      }
    }
  }

  private setupMarketItem(
    index: number,
    x: number,
    y: number,
    size: number,
    iconElement: Phaser.GameObjects.Text,
  ) {
    const zone = this.scene.add
      .zone(x, y, size, size)
      .setInteractive({ useHandCursor: true });

    let getTooltip = () => "";
    let buyAction = () => {};

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
          this.scene.showNotification("🎫 Счастливый билет куплен!");
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
        `🎲 Замена башни 6 ур на другую\nДает 2 заряда в инвентарь\nЦена: 1 медаль`;
      buyAction = () => {
        if (this.scene.economy.spendMedals(1)) {
          this.scene.inventory.addItem("reroll", 2);
          this.scene.medalsText.setText(`: ${this.scene.economy.medals}`);
          this.scene.showNotification("Заряды замены получены!");
        } else this.scene.showNotification("Недостаточно медалей!");
      };
    }

    zone.on("pointerover", () => {
      this.tooltipText.setText(getTooltip());
      this.scene.tweens.add({
        targets: iconElement,
        scale: 1.3,
        duration: 100,
        ease: "Sine.easeOut",
      });
    });

    zone.on("pointerout", () => {
      this.tooltipText.setText("Наведите на товар для информации");
      this.scene.tweens.add({
        targets: iconElement,
        scale: 1,
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
        buyAction();
        this.tooltipText.setText(getTooltip());
        this.scene.tweens.add({
          targets: iconElement,
          scale: 0.9,
          duration: 50,
          yoyo: true,
        });
      },
    );

    this.container.add(zone);
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
    const mCenterY = this.scene.scale.height - this.MENU_HEIGHT / 1.8;

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
