import * as Phaser from "phaser";
import { EconomyManager, type CropType } from "./economy";
import { attachTooltipWithAction } from "./tooltip";

export interface InventorySlot {
  type: ItemType | null;
  count: number;
}

export type ItemType = "ticket" | CropType | "reroll" | "coupon";

const ITEM_DESCRIPTIONS: Record<string, string> = {
  ticket: "Счастливый билет\nИспытай удачу в рулетке!",
  potato: "Картошка",
  onion: "Лук",
  pineapple: "Ананас",
  reroll: "Купон замены\nЗаменяет башню 6 ур. на случайную.",
  coupon: "Купон на скидку\nБесплатная постройка башни 4 уровня (800 з)!",
};

const ITEM_ICON_FRAMES: Record<string, string> = {
  ticket: "ticket",
  potato: "potato",
  onion: "onion",
  pineapple: "pineapple",
  reroll: "couponReroll",
  coupon: "couponDiscount",
};

export class Inventory {
  public readonly WIDTH = 512;
  public readonly HEIGHT = 256;
  private readonly SLOT_ICON_SIZE = 38;

  private scene: Phaser.Scene;
  private economy: EconomyManager;
  private container!: Phaser.GameObjects.Container;
  private slots: InventorySlot[] = [];
  private slotVisuals: {
    icon: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
  }[] = [];

  private sellMenuContainer!: Phaser.GameObjects.Container;
  private sellText!: Phaser.GameObjects.Text;
  private pendingSellIndex: number | null = null;
  private sellIcon!: Phaser.GameObjects.Image;

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
    const SELL_BTN_Y = 40;

    this.container = this.scene.add
      .container(x, y)
      .setDepth(200)
      .setVisible(false);

    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodButtonClear",
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

    // Баннер-заголовок (как в магазине)
    const banner = this.scene.add.image(
      0,
      -height / 2 + 5,
      "ui_v2",
      "greenBanner1",
    );
    banner.setScale(0.45);
    this.container.add(banner);

    // Группа заголовка: иконка сумки + текст
    const titleGroup = this.scene.add.container(0, -height / 2 + 5);

    const bagIcon = this.scene.add
      .image(0, 0, "icon", "bag")
      .setDisplaySize(26, 26);

    const titleText = this.scene.add
      .text(0, 0, "ИНВЕНТАРЬ", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#1f3d1f",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);

    const gap = 8;
    const iconW = bagIcon.displayWidth;
    const textW = titleText.width;
    const totalWidth = iconW + gap + textW;
    const leftX = -totalWidth / 2;
    bagIcon.setX(leftX + iconW / 2);
    titleText.setX(leftX + iconW + gap);

    titleGroup.add([bagIcon, titleText]);
    this.container.add(titleGroup);

    const cols = 4;
    const spacingX = 100;
    const spacingY = 70;
    const startX = -150;
    const startY = -58;

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

      const slotFrame = this.scene.add
        .image(slotX, slotY, "ui_v2", "squareButtonWoodWithoutBg")
        .setDisplaySize(50, 50);

      const icon = this.scene.add
        .image(slotX, slotY, "icon", "potato")
        .setDisplaySize(this.SLOT_ICON_SIZE, this.SLOT_ICON_SIZE)
        .setVisible(false);
      icon.setData("baseScale", icon.scaleX);

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
        .setInteractive({ useHandCursor: true });

      // Тултип + безопасное действие (long-press на тач НЕ продаёт/открывает)
      attachTooltipWithAction(
        this.scene,
        slotZone,
        () => {
          const slot = this.slots[i];
          return slot && slot.type ? ITEM_DESCRIPTIONS[slot.type] || "" : "";
        },
        () => this.onSlotClick(i),
        { position: "above-target" },
      );

      // Визуальный hover
      slotZone.on("pointerover", () => {
        const slot = this.slots[i];
        if (!slot || !slot.type) return;

        slotFrame.setTint(0xdddddd);

        const iconImg = this.slotVisuals[i].icon;
        const baseScale = iconImg.getData("baseScale") as number;
        this.scene.tweens.killTweensOf(iconImg);
        this.scene.tweens.add({
          targets: iconImg,
          scale: baseScale * 1.2,
          duration: 100,
          ease: "Sine.easeOut",
        });
      });

      slotZone.on("pointerout", () => {
        slotFrame.clearTint();

        const iconImg = this.slotVisuals[i].icon;
        const baseScale = iconImg.getData("baseScale") as number;
        this.scene.tweens.killTweensOf(iconImg);
        this.scene.tweens.add({
          targets: iconImg,
          scale: baseScale,
          duration: 100,
          ease: "Sine.easeOut",
        });
      });

      this.container.add([slotBg, slotFrame, icon, countText, slotZone]);
      this.slotVisuals.push({ icon, text: countText });
    }

    this.sellMenuContainer = this.scene.add
      .container(0, 0)
      .setVisible(false)
      .setDepth(10);

    // Фон — nineslice woodButtonClear
    const sellBg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodButtonClear",
      340,
      170,
      40,
      40,
      40,
      40,
    );

    // Иконка продаваемого предмета
    this.sellIcon = this.scene.add
      .image(-100, -45, "icon", "potato")
      .setDisplaySize(48, 48);

    // Текст (слева-верх от кнопок)
    this.sellText = this.scene.add
      .text(-60, -45, "Продать все?\n...", {
        fontSize: "16px",
        color: "#fff5e0",
        align: "left",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
        lineSpacing: 4,
      })
      .setOrigin(0, 0.5);

    // Хелпер для кнопок (nineslice buttonPanelLight)
    const makeSellBtn = (
      x: number,
      text: string,
      color: string,
      onClick: () => void,
    ) => {
      const img = this.scene.add
        .image(0, 0, "ui_v2", "buttonPanelLightMini")
        .setDisplaySize(130, 46);
      const label = this.scene.add
        .text(0, 0, text, {
          fontSize: "16px",
          color,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 1,
        })
        .setOrigin(0.5);

      const btn = this.scene.add.container(x, SELL_BTN_Y, [img, label]);

      img
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
            onClick();
          },
        )
        .on("pointerover", () => img.setTint(0xdddddd))
        .on("pointerout", () => img.clearTint());

      return btn;
    };

    const btnYes = makeSellBtn(-80, "ДА [1]", "#4c9c4cff", () =>
      this.handleKeyOne(),
    );
    const btnNo = makeSellBtn(80, "НЕТ [2]", "#b92b2bff", () =>
      this.handleKeyTwo(),
    );

    // Блокер — добавлен ДО кнопок, чтобы не перекрывать клики
    const sellBlocker = this.scene.add
      .zone(0, 0, 340, 170)
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
      this.sellIcon,
      this.sellText,
      btnYes,
      btnNo,
    ]);
    this.container.add(this.sellMenuContainer);

    this.updateUI();
  }

  private onSlotClick(index: number) {
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

    const frameName = ITEM_ICON_FRAMES[slot.type] || "potato";
    this.sellIcon.setTexture("icon", frameName);
    this.sellText.setText(
      `Продать все (${slot.count} шт)\nза ${totalRevenue} золота?`,
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
        potato: "Картошку",
        onion: "Лук",
        pineapple: "Ананасы",
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
        const frameName = ITEM_ICON_FRAMES[slot.type] || "potato";
        if (this.scene.textures.getFrame("icon", frameName)) {
          vis.icon.setTexture("icon", frameName);
          vis.icon.setDisplaySize(this.SLOT_ICON_SIZE, this.SLOT_ICON_SIZE);
          this.scene.tweens.killTweensOf(vis.icon);
          vis.icon.setData("baseScale", vis.icon.scaleX);
          vis.icon.setVisible(true);
        } else {
          vis.icon.setVisible(false);
        }
        vis.text.setText(slot.count.toString());
      } else {
        this.scene.tweens.killTweensOf(vis.icon);
        vis.icon.setVisible(false);
        vis.text.setText("");
      }
    }
    const mainScene = this.scene as any;
    if (mainScene.luckyTicket && mainScene.luckyTicket.isVisible()) {
      mainScene.luckyTicket.updateBtnText();
    }
  }
}
