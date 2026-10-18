import * as Phaser from "phaser";
import type { MainScene } from "./main";
import { attachTooltip, hideTooltip } from "./tooltip";

export type RadialMode = "build" | "crop";

interface RadialCallbacks {
  build1: () => void;
  build4: () => void;
  goCrop: () => void;
  plantPotato: () => void;
  plantOnion: () => void;
  plantPineapple: () => void;
  onClose: () => void;
}

interface RadialButton {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Image;
  icon: Phaser.GameObjects.Image;
}

export class RadialMenu {
  private scene: MainScene;
  private callbacks: RadialCallbacks;

  public container!: Phaser.GameObjects.Container;
  private buttons: RadialButton[] = [];
  public mode: RadialMode = "build";
  public isOpen = false;

  private readonly SIZE = 256;
  private readonly BTN_SIZE = 72;
  private readonly ICON_SIZE = 48;
  private readonly RADIUS = 114;
  private readonly HALF = 128; // SIZE / 2

  private closeBtn!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;

  constructor(scene: MainScene, callbacks: RadialCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.createUI();
  }

  private getTooltipsForMode(): string[] {
    if (this.mode === "build") {
      return ["[1] Башня 1 ур.", "[2] Башня 4 ур.", "[3] Меню овощей"];
    }
    return ["[1] Посадить картошку", "[2] Посадить лук", "[3] Посадить ананас"];
  }

  private createUI() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(160)
      .setVisible(false);

    this.bg = this.scene.add
      .image(0, 0, "ui_v2", "buildCircleClean2")
      .setDisplaySize(this.SIZE, this.SIZE);
    this.container.add(this.bg);

    // Позиции трёх кнопок: top, right, left
    const positions: [number, number][] = [
      [0, -this.RADIUS], // top — башня 1 ур
      [this.RADIUS, 0], // right — башня 4 ур (90° от top)
      [-this.RADIUS, 0], // left — овощи (симметрично правой)
    ];

    positions.forEach(([x, y], index) => {
      const btnBg = this.scene.add
        .image(0, 0, "ui_v2", "buildBgClean")
        .setDisplaySize(this.BTN_SIZE, this.BTN_SIZE);

      const icon = this.scene.add
        .image(0, 0, "icon", "buildNormal")
        .setDisplaySize(this.ICON_SIZE, this.ICON_SIZE);

      const btn = this.scene.add
        .container(x, y, [btnBg, icon])
        .setSize(this.BTN_SIZE, this.BTN_SIZE)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerover", () => btnBg.setTint(0xdddddd));
      btn.on("pointerout", () => btnBg.clearTint());

      attachTooltip(this.scene, btn, () => {
        const tooltips = this.getTooltipsForMode();
        return tooltips[index] ?? "";
      });

      this.buttons.push({ container: btn, bg: btnBg, icon });
      this.container.add(btn);
    });

    const bottomY = this.RADIUS;
    const closeBg = this.scene.add
      .image(0, 0, "ui_v2", "squareButtonWoodClose")
      .setDisplaySize(this.BTN_SIZE - 28, this.BTN_SIZE - 28);

    this.closeBtn = this.scene.add
      .container(0, bottomY, [closeBg])
      .setSize(this.BTN_SIZE, this.BTN_SIZE)
      .setInteractive({ useHandCursor: true });

    this.closeBtn.on("pointerover", () => closeBg.setTint(0xdddddd));
    this.closeBtn.on("pointerout", () => closeBg.clearTint());

    attachTooltip(this.scene, this.closeBtn, () => {
      return this.mode === "crop" ? "[ESC] Назад к башням" : "[ESC] Закрыть";
    });

    this.closeBtn.on(
      "pointerdown",
      (
        _p: Phaser.Input.Pointer,
        _lx: number,
        _ly: number,
        e: Phaser.Types.Input.EventData,
      ) => {
        e.stopPropagation();
        if (this.mode === "crop") {
          // В режиме овощей — возврат в меню постройки.
          this.switchMode("build");
        } else {
          // В режиме постройки — закрыть.
          this.callbacks.onClose();
        }
      },
    );

    this.container.add(this.closeBtn);

    this.refreshMode();
  }

  public open(worldX: number, worldY: number, mode: RadialMode = "build") {
    this.mode = mode;
    this.scene.tweens.killTweensOf(this.container);

    const clampedX = Phaser.Math.Clamp(
      worldX,
      this.HALF,
      this.scene.scale.width - this.HALF,
    );
    const clampedY = Phaser.Math.Clamp(
      worldY,
      this.HALF + 40, // отступ от верхнего бара
      this.scene.scale.height - this.HALF,
    );

    this.container.setPosition(clampedX, clampedY);
    this.container.setScale(0);
    this.container.setVisible(true);
    this.isOpen = true;

    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 180,
      ease: "Back.easeOut",
    });

    this.refreshMode();
  }

  public switchMode(mode: RadialMode) {
    if (this.mode === mode) return;
    hideTooltip();
    this.mode = mode;

    const icons = this.buttons.map((b) => b.icon);
    const baseScale = this.ICON_SIZE / 128; // 128 — размер фрейма в атласе

    this.scene.tweens.killTweensOf(icons);

    // Пульс подложки — как будто меню «вдохнуло»
    const bgScaleX = this.bg.scaleX;
    const bgScaleY = this.bg.scaleY;
    this.scene.tweens.killTweensOf(this.bg);
    this.scene.tweens.add({
      targets: this.bg,
      scaleX: bgScaleX * 0.94,
      scaleY: bgScaleY * 0.94,
      duration: 120,
      yoyo: true,
      ease: "Sine.easeOut",
    });

    // 1. Сжимаем иконки с каскадом: top → right → left
    this.scene.tweens.add({
      targets: icons,
      scale: 0,
      duration: 100,
      delay: this.scene.tweens.stagger(30),
      ease: "Sine.easeIn",
      onComplete: () => {
        // 2. Подменяем текстуры и обработчики
        this.refreshMode();
        icons.forEach((icon) => icon.setScale(0));

        // 3. Разжимаем в обратном порядке: left → right → top
        this.scene.tweens.add({
          targets: icons.slice().reverse(),
          scale: baseScale,
          duration: 200,
          delay: this.scene.tweens.stagger(30),
          ease: "Back.easeOut",
        });
      },
    });
  }

  public close() {
    hideTooltip();
    if (!this.isOpen) return;
    this.isOpen = false;

    this.scene.tweens.add({
      targets: this.container,
      scale: 0,
      duration: 150,
      ease: "Back.easeIn",
      onComplete: () => this.container.setVisible(false),
    });
  }

  private refreshMode() {
    if (this.mode === "build") {
      this.setButton(0, "buildNormal", this.callbacks.build1);
      this.setButton(1, "buildEpic", this.callbacks.build4);
      this.setButton(2, "onion", this.callbacks.goCrop);
    } else {
      this.setButton(0, "potato", this.callbacks.plantPotato);
      this.setButton(1, "onion", this.callbacks.plantOnion);
      this.setButton(2, "pineapple", this.callbacks.plantPineapple);
    }
  }

  private setButton(index: number, iconKey: string, action: () => void) {
    const btn = this.buttons[index];
    btn.icon.setTexture("icon", iconKey);

    btn.container.off("pointerdown");
    btn.container.on(
      "pointerdown",
      (
        _p: Phaser.Input.Pointer,
        _lx: number,
        _ly: number,
        e: Phaser.Types.Input.EventData,
      ) => {
        e.stopPropagation();
        action();
      },
    );
  }
}
