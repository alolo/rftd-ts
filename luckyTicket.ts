import * as Phaser from "phaser";
import type { MainScene } from "./main";
import { createCurvedTitle } from "./ui/CurvedTitle";

const PRIZES: Array<{
  id: number;
  name: string;
  color: string;
  chance: number;
  frame: string | null;
}> = [
  { id: 0, name: "Золото (+100)", color: "#ffd700", chance: 8, frame: "gold" },
  { id: 1, name: "Семена (+10)", color: "#cd853f", chance: 8, frame: "seeds" },
  {
    id: 2,
    name: "Купон на скидку",
    color: "#ffaaaa",
    chance: 4,
    frame: "couponDiscount",
  },
  {
    id: 3,
    name: "Кубик замены башни",
    color: "#aaaaff",
    chance: 4,
    frame: "couponReroll",
  },
  { id: 4, name: "Неудача", color: "#777777", chance: 28, frame: null },
  { id: 5, name: "Золото (+300)", color: "#ffea00", chance: 4, frame: "gold" },
  {
    id: 6,
    name: "ДЖЕКПОТ (800з + 50д)",
    color: "#ff00ff",
    chance: 1,
    frame: null,
  },
  { id: 7, name: "Семена (+30)", color: "#d2b48c", chance: 4, frame: "seeds" },
  { id: 8, name: "Билет (1 шт)", color: "#00ffff", chance: 2, frame: "ticket" },
  {
    id: 9,
    name: "Билеты (3 шт)",
    color: "#00aaaa",
    chance: 1,
    frame: "ticket",
  },
  { id: 10, name: "Неудача", color: "#777777", chance: 28, frame: null },
  {
    id: 11,
    name: "2 случайных овоща",
    color: "#55ff55",
    chance: 8,
    frame: null,
  },
];

export class LuckyTicket {
  private scene: MainScene;
  public container!: Phaser.GameObjects.Container;
  private resultText!: Phaser.GameObjects.Text;
  private resultIcon!: Phaser.GameObjects.Image;
  private spinBtnText!: Phaser.GameObjects.Text;
  private prizeTooltip!: Phaser.GameObjects.Text;
  private isSpinning: boolean = false;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.createUI();
  }

  private createUI() {
    const width = 500;
    const height = 400;
    const x = this.scene.scale.width / 2;
    const y = this.scene.scale.height / 2;

    this.container = this.scene.add
      .container(x, y)
      .setDepth(400)
      .setVisible(false);

    // Блокировщик кликов (нижний слой)
    const blocker = this.scene.add
      .zone(-width / 2, -height / 2, width, height)
      .setOrigin(0, 0)
      .setInteractive()
      .on(
        "pointerdown",
        (
          p: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          e: Phaser.Types.Input.EventData,
        ) => e.stopPropagation(),
      );

    // Фон — треснутая деревянная панель
    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodPanelMenuCracked",
      width + 40,
      height + 20,
      50,
      50,
      50,
      50,
    );

    // Баннер-заголовок
    const banner = this.scene.add.image(
      0,
      -height / 2 + 20,
      "ui_v2",
      "bannerGreen",
    );
    banner.setScale(0.75);

    const ticketIcon = this.scene.add
      .image(-150, -height / 2 + 9, "icon", "ticket")
      .setDisplaySize(28, 28);

    // Группа заголовка: иконка билета + текст
    const title = createCurvedTitle(
      this.scene,
      0,
      -height / 2 + 25, // центр баннера
      "СЧАСТЛИВЫЙ БИЛЕТ",
      800, // радиус — чем больше, тем положе дуга
      0.3, // разброс букв — 0.06 ≈ компактный купол
      false, // isRainbow = false → дуга «вниз» (по форме баннера)
      "18px",
      "#ffffff",
      "#000000ff",
      2,
    );

    // GlassPanel — фон для результата
    const glassW = 400;
    const glassH = 91;
    const glass = this.scene.add.nineslice(
      0,
      -30,
      "ui_v2",
      "GlassPanel",
      glassW,
      glassH,
      60,
      60,
      2,
      2,
    );

    this.resultIcon = this.scene.add
      .image(-140, -30, "icon", "gold")
      .setDisplaySize(48, 48)
      .setVisible(false);

    this.resultText = this.scene.add
      .text(0, -30, "Нажми КРУТИТЬ", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
        wordWrap: { width: glassW - 40, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    // Кнопка «Крутить»
    const spinBtnImg = this.scene.add
      .image(0, 90, "ui_v2", "buttonPanelLight")
      .setDisplaySize(229, 60)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          p: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          e: Phaser.Types.Input.EventData,
        ) => {
          e.stopPropagation();
          this.spin();
        },
      )
      .on("pointerover", () => {
        spinBtnImg.setTint(0xdddddd);
        if (!this.isSpinning) this.prizeTooltip.setVisible(true);
      })
      .on("pointerout", () => {
        spinBtnImg.clearTint();
        this.prizeTooltip.setVisible(false);
      });

    this.spinBtnText = this.scene.add
      .text(0, 90, "КРУТИТЬ (0)", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#0a1a33",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Кнопка закрытия — в правом верхнем углу, ниже баннера
    const btnClose = this.scene.add
      .image(width / 2 - 14, -height / 2 + 14, "ui_v2", "squareButtonWoodClose")
      .setDisplaySize(32, 32)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide())
      .on("pointerover", () => btnClose.setTint(0xdddddd))
      .on("pointerout", () => btnClose.clearTint());

    // Тултип с возможными призами — под кнопкой, при hover
    this.prizeTooltip = this.scene.add
      .text(
        0,
        150,
        "Возможные призы:\n" +
          "Джекпот (800з+50д) — 1%\n" +
          "Золото (+100, +300) — 12%\n" +
          "Семена (+10, +30) — 12%\n" +
          "Билеты (1 или 3 шт) — 3%\n" +
          "Неудача (Ничего) — 56%\n" +
          "Купон на 100% скидку — 4%\n" +
          "Кубик замены башни — 4%\n" +
          "Два случайных овоща — 8%",
        {
          fontSize: "14px",
          color: "#ffffff",
          backgroundColor: "#000000dd",
          padding: { x: 12, y: 10 },
          align: "left",
          lineSpacing: 2,
        },
      )
      .setOrigin(0.5, 0)
      .setVisible(false)
      .setDepth(410);
    this.prizeTooltip.setStroke("#000000", 3);

    this.container.add([
      blocker,
      bg,
      banner,
      ticketIcon,
      title,
      glass,
      this.resultIcon,
      this.resultText,
      spinBtnImg,
      this.spinBtnText,
      btnClose,
      this.prizeTooltip,
    ]);
  }

  public show() {
    if (this.isSpinning) return;
    this.updateBtnText();
    this.setResult("Удача ждет!", "#ffffff", null);
    this.container.setVisible(true);
  }

  public hide() {
    if (this.isSpinning) return;
    this.container.setVisible(false);
    this.prizeTooltip.setVisible(false);
  }

  public updateBtnText() {
    const count = this.scene.inventory.getItemCount("ticket");
    this.spinBtnText.setText(`КРУТИТЬ (${count})`);
  }

  private setResult(name: string, color: string, frame: string | null) {
    this.resultText.setText(name).setColor(color);

    const hasIcon =
      frame !== null &&
      this.scene.textures.exists("icon") &&
      !!this.scene.textures.getFrame("icon", frame);

    if (hasIcon) {
      this.resultIcon.setTexture("icon", frame);
      this.resultIcon.setVisible(true);
      this.resultText.setPosition(30, -30);
      this.resultText.setWordWrapWidth(280, true);
    } else {
      this.resultIcon.setVisible(false);
      this.resultText.setPosition(0, -30);
      this.resultText.setWordWrapWidth(360, true);
    }
  }

  private spin() {
    if (this.isSpinning) return;
    if (!this.scene.inventory.removeItem("ticket", 1)) {
      this.scene.showNotification("У вас нет билетов!");
      return;
    }

    this.isSpinning = true;
    this.updateBtnText();
    this.spinBtnText.setAlpha(0.5);
    this.prizeTooltip.setVisible(false);

    const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.chance, 0);
    const randomNum = Phaser.Math.Between(1, totalWeight);

    let currentSum = 0;
    let finalPrizeIndex = 0;

    for (let i = 0; i < PRIZES.length; i++) {
      currentSum += PRIZES[i].chance;
      if (randomNum <= currentSum) {
        finalPrizeIndex = i;
        break;
      }
    }

    const finalPrize = PRIZES[finalPrizeIndex];

    let ticks = 0;
    const maxTicks = 30;

    this.scene.time.addEvent({
      delay: 60,
      repeat: maxTicks,
      callback: () => {
        ticks++;
        if (ticks > maxTicks) {
          this.isSpinning = false;
          this.spinBtnText.setAlpha(1);
          this.setResult(finalPrize.name, finalPrize.color, finalPrize.frame);

          this.scene.tweens.add({
            targets: this.resultText,
            scale: 1.3,
            duration: 150,
            yoyo: true,
          });
          this.awardPrize(finalPrize.id);
        } else {
          const fakePrize = Phaser.Utils.Array.GetRandom(PRIZES);
          this.setResult(fakePrize.name, "#aaaaaa", fakePrize.frame);
        }
      },
    });
  }

  private awardPrize(id: number) {
    if (id === 4 || id === 10) {
      this.scene.achievements.rouletteLosses++;
      if (this.scene.achievements.rouletteLosses >= 4) {
        this.scene.achievements.unlock("unlucky_luck");
      }
    } else {
      this.scene.achievements.rouletteLosses = 0;
    }
    switch (id) {
      case 0:
        this.scene.economy.addGold(100);
        break;
      case 1:
        this.scene.economy.addWood(10);
        break;
      case 2:
        this.scene.inventory.addItem("coupon", 1);
        break;
      case 3:
        this.scene.inventory.addItem("reroll", 1);
        break;
      case 4:
        break;
      case 5:
        this.scene.economy.addGold(300);
        break;
      case 6:
        this.scene.economy.addGold(800);
        this.scene.economy.addWood(50);
        this.scene.showNotification("ДЖЕКПОТ!!!");
        break;
      case 7:
        this.scene.economy.addWood(30);
        break;
      case 8:
        this.scene.inventory.addItem("ticket", 1);
        break;
      case 9:
        this.scene.inventory.addItem("ticket", 3);
        break;
      case 10:
        break;
      case 11:
        const veggies: ("potato" | "onion" | "pineapple")[] = [
          "potato",
          "onion",
          "pineapple",
        ];
        this.scene.inventory.addItem(Phaser.Utils.Array.GetRandom(veggies), 1);
        this.scene.inventory.addItem(Phaser.Utils.Array.GetRandom(veggies), 1);
        break;
    }

    this.scene.goldText.setText(`: ${this.scene.economy.gold}`);
    this.scene.woodText.setText(`: ${this.scene.economy.wood}`);
    this.updateBtnText();

    this.scene.updateMarketUI();
  }

  public isVisible(): boolean {
    return this.container && this.container.visible;
  }

  public checkClickOutside(pixelX: number, pixelY: number): boolean {
    if (!this.isVisible()) return false;

    const mCenterX = this.scene.scale.width / 2;
    const mCenterY = this.scene.scale.height / 2;
    const menuWidth = 500;
    const menuHeight = 400;

    if (
      pixelX < mCenterX - menuWidth / 2 ||
      pixelX > mCenterX + menuWidth / 2 ||
      pixelY < mCenterY - menuHeight / 2 ||
      pixelY > mCenterY + menuHeight / 2
    ) {
      this.hide();
    }
    return true;
  }
}
