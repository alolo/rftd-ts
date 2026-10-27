import * as Phaser from "phaser";
import type { MainScene } from "../main";
import type { CropType } from "../economy";
import { attachTooltip } from "../tooltip";

export class TopBarUI {
  public goldText!: Phaser.GameObjects.Text;
  public woodText!: Phaser.GameObjects.Text;
  public playerLivesText!: Phaser.GameObjects.Text;
  public medalsText!: Phaser.GameObjects.Text;
  public burgerBtn!: Phaser.GameObjects.Image;
  public marketPopupContainer!: Phaser.GameObjects.Container;
  public achievementsDot!: Phaser.GameObjects.Container;

  private scene: MainScene;
  private marketPriceTexts: {
    potato?: Phaser.GameObjects.Text;
    onion?: Phaser.GameObjects.Text;
    pineapple?: Phaser.GameObjects.Text;
  } = {};
  private speedText!: Phaser.GameObjects.Text;
  private burgerIsOpen = false;
  private burgerHoverScale = 1;
  private burgerPopupTimer: Phaser.Time.TimerEvent | null = null;
  private achievementsBtnObj!: Phaser.GameObjects.Text;
  private achievementsDotCircle!: Phaser.GameObjects.Arc;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public create() {
    // --- ВЕРХНИЙ БАР ---
    this.scene.add
      .nineslice(
        this.scene.scale.width / 2,
        20,
        "ui_v2",
        "buttonPanelLight",
        this.scene.scale.width + 200,
        80,
        64,
        64,
        1,
        1,
      )
      .setDepth(19)
      .setAlpha(0.9);

    const CENTER_Y = 22;
    const ICON_SIZE = 24;
    const ICON_TEXT_GAP = 5;
    const EDGE_PADDING = 20;
    const BURGER_SLOT = 64;
    const SLOT_GOLD = 200;
    const SLOT_LIVES = 200;
    const SLOT_MEDAL = 100;

    const labelStyle = {
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#030303",
      strokeThickness: 3,
    } as const;

    const RESOURCE_CHIP_W = 180;
    const RESOURCE_CHIP_H = 44;

    const GLASS_L = 2;
    const GLASS_R = 2;
    const GLASS_T = 2;
    const GLASS_B = 2;

    const drawResource = (
      slotX: number,
      iconKey: string,
      labelText: string,
    ): Phaser.GameObjects.Text => {
      this.scene.add
        .nineslice(
          slotX - 5,
          CENTER_Y + 3,
          "ui_v2",
          "glassPanelLight",
          RESOURCE_CHIP_W,
          RESOURCE_CHIP_H,
          GLASS_L,
          GLASS_R,
          GLASS_T,
          GLASS_B,
        )
        .setOrigin(0, 0.5)
        .setDepth(19);

      this.scene.add
        .image(slotX + 12, CENTER_Y + 3, "icon", iconKey)
        .setDisplaySize(ICON_SIZE, ICON_SIZE)
        .setOrigin(0, 0.5)
        .setDepth(20);

      return this.scene.add
        .text(
          slotX + 12 + ICON_SIZE + ICON_TEXT_GAP,
          CENTER_Y + 3,
          labelText,
          labelStyle,
        )
        .setOrigin(0, 0.5)
        .setDepth(20);
    };

    this.goldText = drawResource(
      EDGE_PADDING,
      "gold",
      `: ${this.scene.economy.gold}`,
    );
    this.woodText = drawResource(
      EDGE_PADDING + SLOT_GOLD,
      "seeds",
      `: ${this.scene.economy.wood}`,
    );

    const rightEdge = this.scene.scale.width - EDGE_PADDING - BURGER_SLOT;

    this.playerLivesText = drawResource(
      rightEdge - SLOT_MEDAL - SLOT_LIVES,
      "heart",
      `: ${this.scene.playerLives}`,
    );
    this.medalsText = drawResource(
      rightEdge - SLOT_MEDAL,
      "medal",
      `: ${this.scene.economy.medals}`,
    );

    // --- ЦЕНТРАЛЬНЫЕ КНОПКИ ---
    const btnStyle = {
      fontSize: "16px",
      color: "#000000ff",
      fontStyle: "bold",
      stroke: "#ffe9c8ff",
      strokeThickness: 1,
    } as const;

    const btnDefs: [string, () => void][] = [
      [
        "[I] Профиль",
        () =>
          this.scene.openMenu(this.scene.profileMenuVisible ? null : "profile"),
      ],
      ["[ESC] Меню", () => this.scene.togglePause()],
      [
        "[B] Инвентарь",
        () =>
          this.scene.openMenu(
            this.scene.inventory.isVisible ? null : "inventory",
          ),
      ],
      [
        "[J] Достижения",
        () =>
          this.scene.openMenu(
            this.scene.achievementsMenuVisible ? null : "achievements",
          ),
      ],
    ];

    const btnGap = 40;
    const btnObjs = btnDefs.map(([label, onClick]) => {
      return this.scene.add
        .text(0, CENTER_Y, label, btnStyle)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(20)
        .on(
          "pointerdown",
          (
            _p: Phaser.Input.Pointer,
            _lx: number,
            _ly: number,
            e: Phaser.Types.Input.EventData,
          ) => {
            e.stopPropagation();
            onClick();
          },
        );
    });

    const totalBtnsW =
      btnObjs.reduce((s, b) => s + b.width, 0) + btnGap * (btnObjs.length - 1);

    let cursor = this.scene.scale.width / 2 - totalBtnsW / 2;
    for (const btn of btnObjs) {
      btn.setX(cursor + btn.width / 2);
      cursor += btn.width + btnGap;
    }

    this.achievementsBtnObj = btnObjs[3];
    this.createAchievementsDot();

    this.createBurgerButton(CENTER_Y);
    this.createSpeedButton(CENTER_Y);

    this.createMarketPopup();

    this.updateMarketUI();
  }

  private createMarketPopup() {
    const PAD_X = 25;
    const PAD_Y = 14;
    const POPUP_W = 540;
    const POPUP_H = 140;
    const POPUP_ICON_SIZE = 22;
    const LINE_HEIGHT = 26;

    const popupBg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodButtonClear",
      POPUP_W,
      POPUP_H,
      40,
      40,
      30,
      30,
    );

    const popupBlocker = this.scene.add
      .zone(0, 0, POPUP_W, POPUP_H)
      .setInteractive()
      .on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          e: Phaser.Types.Input.EventData,
        ) => e.stopPropagation(),
      );

    const titleText = this.scene.add
      .text(
        -POPUP_W / 2 + PAD_X,
        -POPUP_H / 2 + PAD_Y,
        "РЫНОК (уровень / цена / наличие):",
        { fontSize: "16px", color: "#ffffff", fontStyle: "bold" },
      )
      .setOrigin(0, 0);

    const crops: { key: CropType; label: string }[] = [
      { key: "potato", label: "Картошка" },
      { key: "onion", label: "Лук" },
      { key: "pineapple", label: "Ананас" },
    ];

    const popupItems: Phaser.GameObjects.GameObject[] = [
      popupBg,
      popupBlocker,
      titleText,
    ];

    const rowBaseY = -POPUP_H / 2 + PAD_Y + 30;

    crops.forEach((crop, i) => {
      const y = rowBaseY + i * LINE_HEIGHT;

      const icon = this.scene.add
        .image(
          -POPUP_W / 2 + PAD_X + POPUP_ICON_SIZE / 2,
          y + 8,
          "icon",
          crop.key,
        )
        .setDisplaySize(POPUP_ICON_SIZE, POPUP_ICON_SIZE);

      const text = this.scene.add
        .text(-POPUP_W / 2 + PAD_X + POPUP_ICON_SIZE + 8, y, "", {
          fontSize: "16px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0);

      this.marketPriceTexts[crop.key] = text;
      popupItems.push(icon, text);
    });

    this.marketPopupContainer = this.scene.add
      .container(0, 0, popupItems)
      .setDepth(22)
      .setVisible(false);
  }

  private createBurgerButton(centerY: number) {
    const ICON_SIZE = 32;
    const ICON_BASE_SCALE = ICON_SIZE / 128;
    const btnX = this.scene.scale.width - 15 - ICON_SIZE / 2;
    const BURGER_Y_OFFSET = 60;

    this.burgerBtn = this.scene.add
      .image(btnX, centerY + BURGER_Y_OFFSET, "ui_v2", "squareButtonWoodBurger")
      .setScale(ICON_BASE_SCALE)
      .setDepth(21)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          e: Phaser.Types.Input.EventData,
        ) => {
          e.stopPropagation();
          this.toggleBurgerPopup();
        },
      );

    this.burgerBtn.setData("baseScale", ICON_BASE_SCALE);
    this.burgerHoverScale = ICON_BASE_SCALE * 1.15;

    this.burgerBtn.on("pointerover", () => {
      this.scene.tweens.add({
        targets: this.burgerBtn,
        scale: this.burgerHoverScale,
        duration: 100,
        ease: "Sine.easeOut",
      });
    });

    this.burgerBtn.on("pointerout", () => {
      const baseScale = this.burgerBtn.getData("baseScale") as number;
      this.scene.tweens.add({
        targets: this.burgerBtn,
        scale: baseScale,
        duration: 100,
        ease: "Sine.easeOut",
      });
    });

    attachTooltip(this.scene, this.burgerBtn, "[T] Цены на овощи");
  }

  private createSpeedButton(centerY: number) {
    const BTN_SIZE = 32;
    const btnX = 15 + BTN_SIZE / 2;
    const BTN_Y_OFFSET = 60;

    const bg = this.scene.add
      .image(0, 0, "ui_v2", "squareWoodButtonClear")
      .setDisplaySize(BTN_SIZE, BTN_SIZE);

    this.speedText = this.scene.add
      .text(0, 0, "x1", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const speedBtn = this.scene.add
      .container(btnX, centerY + BTN_Y_OFFSET, [bg, this.speedText])
      .setSize(BTN_SIZE, BTN_SIZE)
      .setDepth(21)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          e: Phaser.Types.Input.EventData,
        ) => {
          e.stopPropagation();
          this.scene.cycleGameSpeed();
        },
      );

    attachTooltip(
      this.scene,
      speedBtn,
      () => `[F] Скорость игры: x${this.scene.gameSpeed}`,
    );

    speedBtn.on("pointerover", () => bg.setTint(0xdddddd));
    speedBtn.on("pointerout", () => bg.clearTint());
  }

  private createAchievementsDot() {
    const btn = this.achievementsBtnObj;
    const dotX = btn.x + btn.width / 2;
    const dotY = btn.y - btn.height / 2 - 2;

    this.achievementsDotCircle = this.scene.add.circle(0, 0, 6, 0xff2222);
    this.achievementsDotCircle.setStrokeStyle(2, 0xffffff);

    this.achievementsDot = this.scene.add
      .container(dotX, dotY, [this.achievementsDotCircle])
      .setDepth(21)
      .setVisible(false);
  }

  public refreshAchievementsDot() {
    if (!this.achievementsDot) return;

    if (this.scene.achievementsMenuVisible) {
      this.scene.achievements.markAllSeen();
      this.achievementsDot.setVisible(false);
      return;
    }

    if (!this.scene.achievements.hasUnseen) {
      this.achievementsDot.setVisible(false);
      return;
    }

    const wasVisible = this.achievementsDot.visible;
    this.achievementsDot.setVisible(true);

    if (!wasVisible) {
      this.achievementsDot.setScale(0);
      this.scene.tweens.add({
        targets: this.achievementsDot,
        scale: 1,
        duration: 300,
        ease: "Back.easeOut",
      });
    }
  }

  public updateMarketUI() {
    const p = this.scene.economy.marketPrices;

    const getStr = (type: CropType, name: string) => {
      const dynamicBase = this.scene.economy.getDynamicBasePrice(type);
      const minPrice = Math.floor(dynamicBase * 0.8);
      const maxPrice = Math.floor(dynamicBase * 1.5);
      const currentPrice = p[type];
      const pct = Math.round((currentPrice / dynamicBase) * 100);
      const count = this.scene.inventory
        ? this.scene.inventory.getItemCount(type)
        : 0;

      const plantedCount = this.scene.economy.cropsPlanted[type] || 0;
      let level = 0;
      const thresholds = [15, 30, 45, 60, 75, 90];
      for (const t of thresholds) {
        if (plantedCount >= t) level++;
      }

      return `${name} [${level}ур] ${currentPrice}g (${minPrice}~${maxPrice}g, ${pct}%) - ${count} шт`;
    };

    this.marketPriceTexts.potato?.setText(getStr("potato", "Картошка"));
    this.marketPriceTexts.onion?.setText(getStr("onion", "Лук"));
    this.marketPriceTexts.pineapple?.setText(getStr("pineapple", "Ананас"));
  }

  public setGameSpeed(speed: number) {
    if (this.burgerPopupTimer) this.burgerPopupTimer.timeScale = 1 / speed;
    if (this.speedText) this.speedText.setText(`x${speed}`);
  }

  public showMarketPricesPopup(autoCloseMs: number = 5000) {
    this.updateMarketUI();

    const POPUP_W = 540;
    const gap = 12;
    const finalX = this.burgerBtn.x - gap - POPUP_W / 2 - 10;
    const finalY = this.burgerBtn.y + 50;

    this.marketPopupContainer.setPosition(finalX + 40, finalY);
    this.marketPopupContainer.setVisible(true);
    this.marketPopupContainer.setAlpha(0);

    this.scene.tweens.add({
      targets: this.marketPopupContainer,
      x: finalX,
      alpha: 1,
      duration: 200,
      ease: "Cubic.easeOut",
    });

    if (this.burgerPopupTimer) this.burgerPopupTimer.remove(false);
    this.burgerPopupTimer = this.scene.time.addEvent({
      delay: autoCloseMs,
      timeScale: 1 / this.scene.gameSpeed,
      callback: () => {
        if (!this.burgerIsOpen) return;
        this.burgerIsOpen = false;
        const baseScale = this.burgerBtn.getData("baseScale") as number;
        this.burgerBtn.setScale(baseScale);
        this.burgerBtn.setTexture("ui_v2", "squareButtonWoodBurger");
        this.hideMarketPricesPopup();
      },
    });
  }

  public hideMarketPricesPopup() {
    if (!this.marketPopupContainer.visible) {
      if (this.burgerPopupTimer) {
        this.burgerPopupTimer.remove(false);
        this.burgerPopupTimer = null;
      }
      return;
    }

    this.scene.tweens.add({
      targets: this.marketPopupContainer,
      x: this.marketPopupContainer.x + 40,
      alpha: 0,
      duration: 180,
      ease: "Cubic.easeIn",
      onComplete: () => this.marketPopupContainer.setVisible(false),
    });

    if (this.burgerPopupTimer) {
      this.burgerPopupTimer.remove(false);
      this.burgerPopupTimer = null;
    }
  }

  public closeMarketPopup() {
    if (!this.marketPopupContainer.visible) return;
    this.burgerIsOpen = false;
    const baseScale = this.burgerBtn.getData("baseScale") as number;
    this.burgerBtn.setScale(baseScale);
    this.burgerBtn.setTexture("ui_v2", "squareButtonWoodBurger");
    this.hideMarketPricesPopup();
  }

  public toggleBurgerPopup() {
    const willOpen = !this.burgerIsOpen;

    // Ручной вызов — закрываем все остальные меню.
    if (willOpen) {
      this.scene.openMenu(null);
    }

    this.burgerIsOpen = willOpen;
    const newFrame = willOpen
      ? "squareButtonWoodClose"
      : "squareButtonWoodBurger";
    const baseScale = this.burgerBtn.getData("baseScale") as number;

    this.burgerBtn.setScale(baseScale);

    this.scene.tweens.add({
      targets: this.burgerBtn,
      scale: 0,
      duration: 100,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.burgerBtn.setTexture("ui_v2", newFrame);
        this.burgerBtn.setScale(0);
        this.scene.tweens.add({
          targets: this.burgerBtn,
          scale: baseScale,
          duration: 180,
          ease: "Back.easeOut",
        });
      },
    });

    if (willOpen) {
      this.showMarketPricesPopup(5000);
    } else {
      this.hideMarketPricesPopup();
    }
  }

  public autoShowMarketPrices() {
    if (this.scene.isGameOver) return;
    if (this.burgerIsOpen) return;

    this.burgerIsOpen = true;
    const baseScale = this.burgerBtn.getData("baseScale") as number;
    this.burgerBtn.setScale(baseScale);
    this.burgerBtn.setTexture("ui_v2", "squareButtonWoodClose");
    this.showMarketPricesPopup(3000);
  }
}
