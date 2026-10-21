import * as Phaser from "phaser";
import { EconomyManager, type CropType } from "./economy";

export interface InventorySlot {
  type: ItemType | null;
  count: number;
}

export type ItemType = "ticket" | CropType | "reroll" | "coupon";

const ITEM_EMOJIS: Record<string, string> = {
  ticket: "🎫",
  potato: "🥔",
  onion: "🧅",
  pineapple: "🍍",
  reroll: "🎲",
  coupon: "🎟️",
};

const ITEM_DESCRIPTIONS: Record<string, string> = {
  ticket: "🎫 Счастливый билет\nИспытай удачу в рулетке!",
  potato: "🥔 Картошка",
  onion: "🧅 Лук",
  pineapple: "🍍 Ананас",
  reroll: "🎲 Кубик замены\nЗаменяет башню 6 ур. на случайную.",
  coupon: "🎟️ Купон на скидку\nБесплатная постройка башни 4 уровня (800 з)!",
};

export class Inventory {
  public readonly WIDTH = 512;
  public readonly HEIGHT = 256;

  private scene: Phaser.Scene;
  private economy: EconomyManager;
  private container!: Phaser.GameObjects.Container;
  private slots: InventorySlot[] = [];
  private slotVisuals: {
    icon: Phaser.GameObjects.Text;
    text: Phaser.GameObjects.Text;
  }[] = [];

  private sellMenuContainer!: Phaser.GameObjects.Container;
  private sellText!: Phaser.GameObjects.Text;
  private pendingSellIndex: number | null = null;
  private itemTooltip!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, economy: EconomyManager) {
    this.scene = scene;
    this.economy = economy;
    this.initLogic();
    this.createUI();
  }

  private initLogic() {
    for (let i = 0; i < 12; i++) {
      this.slots.push({ type: null, count: 0 });
    }
    // Первый слот ЖЕСТКО зафиксирован за билетом
    this.slots[0] = { type: "ticket", count: 0 };
  }

  public reset() {
    for (let i = 1; i < 12; i++) {
      this.slots[i] = { type: null, count: 0 };
    }
    this.slots[0] = { type: "ticket", count: 0 };
    this.updateUI();
  }

  private createUI() {
    const width = this.WIDTH;
    const height = this.HEIGHT;
    const x = this.scene.scale.width / 2;
    const y = this.scene.scale.height - height / 2 - 20;

    this.container = this.scene.add
      .container(x, y)
      .setDepth(200)
      .setVisible(false);

    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "panelClear",
      width,
      height,
      40,
      40,
      40,
      40,
    );

    const hitZone = this.scene.add
      .zone(0, 0, width, height)
      .setInteractive()
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          localX: number,
          localY: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
        },
      );

    this.container.add([bg, hitZone]);

    const title = this.scene.add
      .text(0, -height / 2 + 25, "🎒 ИНВЕНТАРЬ", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.container.add(title);

    const cols = 4;
    const spacingX = 100;
    const spacingY = 70;
    const startX = -150;
    const startY = -50;

    for (let i = 0; i < 12; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const slotX = startX + col * spacingX;
      const slotY = startY + row * spacingY;

      const slotBg = this.scene.add.graphics();
      slotBg.fillStyle(0x444444, 1);
      slotBg.fillRect(slotX - 24, slotY - 24, 48, 48);
      slotBg.lineStyle(2, 0x777777);
      slotBg.strokeRect(slotX - 24, slotY - 24, 48, 48);

      const icon = this.scene.add
        .text(slotX, slotY, "", { fontSize: "28px" })
        .setOrigin(0.5);

      const countText = this.scene.add
        .text(slotX + 24, slotY + 24, "", {
          fontSize: "16px",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(1, 1);

      const slotZone = this.scene.add
        .zone(slotX, slotY, 48, 48)
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            localX: number,
            localY: number,
            event: Phaser.Types.Input.EventData,
          ) => {
            event.stopPropagation();
            this.onSlotClick(i);
          },
        )
        .on("pointerover", () => {
          const slot = this.slots[i];
          if (slot && slot.type) {
            this.itemTooltip.setText(
              ITEM_DESCRIPTIONS[slot.type] || "Неизвестный предмет",
            );
            this.itemTooltip.setPosition(slotX, slotY - 40);
            this.itemTooltip.setVisible(true);
          }
        })
        .on("pointerout", () => {
          this.itemTooltip.setVisible(false);
        });

      this.container.add([slotBg, icon, countText, slotZone]);
      this.slotVisuals.push({ icon, text: countText });
    }

    this.itemTooltip = this.scene.add
      .text(0, 0, "", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#000000ee",
        padding: { x: 10, y: 10 },
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setVisible(false)
      .setDepth(300);

    this.itemTooltip.setStroke("#ffffff", 0.5);

    this.container.add(this.itemTooltip);

    this.sellMenuContainer = this.scene.add
      .container(0, 0)
      .setVisible(false)
      .setDepth(10);

    const sellBg = this.scene.add.graphics();
    sellBg.fillStyle(0x111111, 0.98);
    sellBg.fillRoundedRect(-140, -60, 280, 120, 8);
    sellBg.lineStyle(3, 0xffd700);
    sellBg.strokeRoundedRect(-140, -60, 280, 120, 8);

    this.sellText = this.scene.add
      .text(0, -30, "Продать?\n...", {
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const btnYes = this.scene.add
      .text(-60, 30, "[1] ДА", {
        fontSize: "16px",
        color: "#aaffaa",
        backgroundColor: "#335533",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          p: Phaser.Input.Pointer,
          x: number,
          y: number,
          e: Phaser.Types.Input.EventData,
        ) => {
          e.stopPropagation();
          this.handleKeyOne();
        },
      );

    const btnNo = this.scene.add
      .text(60, 30, "[2] НЕТ", {
        fontSize: "16px",
        color: "#ffaaaa",
        backgroundColor: "#553333",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          p: Phaser.Input.Pointer,
          x: number,
          y: number,
          e: Phaser.Types.Input.EventData,
        ) => {
          e.stopPropagation();
          this.handleKeyTwo();
        },
      );

    const sellBlocker = this.scene.add
      .zone(0, 0, 280, 120)
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

    this.sellMenuContainer.add([
      sellBg,
      sellBlocker,
      this.sellText,
      btnYes,
      btnNo,
    ]);
    this.container.add(this.sellMenuContainer);

    this.updateUI();
  }

  private onSlotClick(index: number) {
    this.itemTooltip.setVisible(false);
    const slot = this.slots[index];

    if (slot && slot.type === "ticket") {
      this.hide();
      (this.scene as any).luckyTicket.show();
      return;
    }

    if (
      !slot ||
      !slot.type ||
      slot.count <= 0 ||
      slot.type === "coupon" ||
      slot.type === "reroll"
    )
      return;

    this.pendingSellIndex = index;
    const pricePerItem = this.economy.marketPrices[slot.type as CropType];
    const totalRevenue = pricePerItem * slot.count;

    this.sellText.setText(
      `Продать все ${ITEM_EMOJIS[slot.type]} (${slot.count}шт)\nза ${totalRevenue}g?`,
    );
    this.sellMenuContainer.setVisible(true);
  }

  public handleKeyOne() {
    if (!this.sellMenuContainer.visible || this.pendingSellIndex === null)
      return;

    const slot = this.slots[this.pendingSellIndex];
    this.cancelSell();

    if (slot && slot.type && slot.count > 0) {
      const pricePerItem = this.economy.marketPrices[slot.type as CropType];
      const revenue = pricePerItem * slot.count;

      if (slot.count >= 50 && slot.type !== "ticket") {
        (this.scene as any).achievements.unlock("secret_2");
      }

      const cropNames: Record<string, string> = {
        potato: "🥔 Картошку",
        onion: "🧅 Лук",
        pineapple: "🍍 Ананасы",
      };
      const itemName = cropNames[slot.type] || "Овощи";
      const count = slot.count;

      this.economy.addGold(revenue);

      slot.count = 0;
      slot.type = null;

      this.updateUI();
      this.scene.events.emit(
        "inventory-sold",
        `Продано: ${itemName} (${count}шт)\nПолучено: ${revenue} золота`,
      );
    }
  }

  public handleKeyTwo() {
    if (this.sellMenuContainer.visible) this.cancelSell();
  }

  private cancelSell() {
    this.pendingSellIndex = null;
    this.sellMenuContainer.setVisible(false);
  }

  public addItem(type: ItemType, amount: number = 1): boolean {
    const existingSlot = this.slots.find((s) => s.type === type);
    if (existingSlot) {
      existingSlot.count += amount;
      this.updateUI();
      return true;
    }

    for (let i = 1; i < this.slots.length; i++) {
      if (this.slots[i].type === null) {
        this.slots[i].type = type;
        this.slots[i].count = amount;
        this.updateUI();
        return true;
      }
    }
    return false;
  }

  public removeItem(type: ItemType, amount: number = 1): boolean {
    const slot = this.slots.find((s) => s.type === type);
    if (slot && slot.count >= amount) {
      slot.count -= amount;
      if (slot.count <= 0 && slot.type !== "ticket") slot.type = null;
      this.updateUI();
      return true;
    }
    return false;
  }

  public getItemCount(type: ItemType): number {
    const slot = this.slots.find((s) => s.type === type);
    return slot ? slot.count : 0;
  }

  public show() {
    this.container.setVisible(true);
  }

  public hide() {
    this.cancelSell();
    this.container.setVisible(false);
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }

  public containsPoint(x: number, y: number): boolean {
    return (
      x >= this.container.x - this.WIDTH / 2 &&
      x <= this.container.x + this.WIDTH / 2 &&
      y >= this.container.y - this.HEIGHT / 2 &&
      y <= this.container.y + this.HEIGHT / 2
    );
  }

  public isSellMenuVisible(): boolean {
    return this.sellMenuContainer.visible;
  }

  private updateUI() {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const vis = this.slotVisuals[i];

      if (slot.type) {
        vis.icon.setText(ITEM_EMOJIS[slot.type] || "❓");
        vis.text.setText(slot.count.toString());
      } else {
        vis.icon.setText("");
        vis.text.setText("");
      }
    }
    const mainScene = this.scene as any;
    if (mainScene.luckyTicket && mainScene.luckyTicket.isVisible()) {
      mainScene.luckyTicket.updateBtnText();
    }
  }
}
