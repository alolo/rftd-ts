import * as Phaser from "phaser";
import type { MainScene } from "./main";

const PRIZES = [
  { id: 0, name: "💰 Золото (+100)", color: "#ffd700", chance: 8 },
  { id: 1, name: "🌱 Семена (+10)", color: "#cd853f", chance: 8 },
  { id: 2, name: "🎟️ Купон на скидку", color: "#ffaaaa", chance: 4 },
  { id: 3, name: "🎲 Кубик замены башни", color: "#aaaaff", chance: 4 },
  { id: 4, name: "💀 Неудача", color: "#777777", chance: 28 },
  { id: 5, name: "💰 Золото (+300)", color: "#ffea00", chance: 4 },
  { id: 6, name: "💎 ДЖЕКПОТ (800з + 50д) 💎", color: "#ff00ff", chance: 1 },
  { id: 7, name: "🌱 Семена (+30)", color: "#d2b48c", chance: 4 },
  { id: 8, name: "🎫 Билет (1 шт)", color: "#00ffff", chance: 2 },
  { id: 9, name: "🎫 Билеты (3 шт)", color: "#00aaaa", chance: 1 },
  { id: 10, name: "💀 Неудача", color: "#777777", chance: 28 },
  { id: 11, name: "🥗 2 случайных овоща", color: "#55ff55", chance: 8 },
];

export class LuckyTicket {
  private scene: MainScene;
  public container!: Phaser.GameObjects.Container;
  private resultText!: Phaser.GameObjects.Text;
  private spinBtnText!: Phaser.GameObjects.Text;
  private prizeTooltip!: Phaser.GameObjects.Text;
  private isSpinning: boolean = false;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.createUI();
  }

  private createUI() {
    const width = 450;
    const height = 300;
    const x = this.scene.scale.width / 2;
    const y = this.scene.scale.height / 2;

    this.container = this.scene.add
      .container(x, y)
      .setDepth(400)
      .setVisible(false);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x111111, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    bg.lineStyle(4, 0xffaa00);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);

    const title = this.scene.add
      .text(0, -110, "СЧАСТЛИВЫЙ БИЛЕТ", {
        fontSize: "28px",
        color: "#ffaa00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const frame = this.scene.add.graphics();
    frame.fillStyle(0x000000, 1);
    frame.fillRect(-180, -40, 360, 80);
    frame.lineStyle(2, 0x555555);
    frame.strokeRect(-180, -40, 360, 80);

    this.resultText = this.scene.add
      .text(0, 0, 'Нажми "Крутить"', {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.prizeTooltip = this.scene.add
      .text(
        240,
        0,
        "🎁 ВОЗМОЖНЫЕ ПРИЗЫ:\n\n" +
          "💎 Джекпот (800з+50д) — 1%\n" +
          "💰 Золото (+100, +300) — 12%\n" +
          "🌱 Семена (+10, +30) — 12%\n" +
          "🎫 Билеты (1 или 3 шт) — 3%\n" +
          "💀 Неудача (Ничего) — 56%\n" +
          "🎟️ Купон на 100% скидку — 4%\n" +
          "🎲 Кубик замены башни — 4%\n" +
          "🥗 Два случайных овоща — 8%",
        {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#222222",
          padding: { x: 15, y: 15 },
          align: "left",
        },
      )
      .setOrigin(0, 0.5)
      .setVisible(false)
      .setDepth(410);

    this.prizeTooltip.setStroke("#000000", 4);

    this.spinBtnText = this.scene.add
      .text(0, 80, "КРУТИТЬ (1 🎫)", {
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#44aa44",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
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
        if (!this.isSpinning) this.prizeTooltip.setVisible(true);
      })
      .on("pointerout", () => {
        this.prizeTooltip.setVisible(false);
      });

    const btnClose = this.scene.add
      .text(180, -110, "✖", {
        fontSize: "28px",
        color: "#ff5555",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.hide());

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

    this.container.add([
      blocker,
      bg,
      title,
      frame,
      this.resultText,
      this.spinBtnText,
      btnClose,
      this.prizeTooltip,
    ]);
  }

  public show() {
    if (this.isSpinning) return;
    this.updateBtnText();
    this.resultText.setText("Удача ждет!").setColor("#ffffff");
    this.container.setVisible(true);
  }

  public hide() {
    if (this.isSpinning) return;
    this.container.setVisible(false);
    this.prizeTooltip.setVisible(false);
  }

  public updateBtnText() {
    const count = this.scene.inventory.getItemCount("ticket");
    this.spinBtnText.setText(`КРУТИТЬ (${count} 🎫)`);
    if (count > 0) this.spinBtnText.setBackgroundColor("#44aa44");
    else this.spinBtnText.setBackgroundColor("#aa4444");
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
          this.resultText.setText(finalPrize.name).setColor(finalPrize.color);

          this.scene.tweens.add({
            targets: this.resultText,
            scale: 1.3,
            duration: 150,
            yoyo: true,
          });
          this.awardPrize(finalPrize.id);
        } else {
          const fakePrize = Phaser.Utils.Array.GetRandom(PRIZES);
          this.resultText.setText(fakePrize.name).setColor("#aaaaaa");
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
        this.scene.showNotification("💎 ДЖЕКПОТ!!! 💎");
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
    const menuWidth = 450;
    const menuHeight = 300;

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
