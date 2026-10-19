import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { attachTooltip } from "../tooltip";

export class MapBuildingsUI {
  private scene: MainScene;
  private marketAura!: Phaser.GameObjects.Graphics;
  private informerAura!: Phaser.GameObjects.Graphics;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public create() {
    this.createMarket();
    this.createInformer();
  }

  public update() {
    if (this.marketAura && this.scene.market) {
      this.drawBuildingAura(
        this.marketAura,
        128,
        this.scene.market.isVisible(),
      );
    }
    if (this.informerAura && this.scene.informer) {
      this.drawBuildingAura(
        this.informerAura,
        64,
        this.scene.informer.isVisible(),
      );
    }
  }

  private createMarket() {
    const mx = 22.5 * this.scene.CELL_SIZE;
    const my = 6 * this.scene.CELL_SIZE;

    this.marketAura = this.scene.add.graphics();
    this.marketAura.setPosition(mx + 64, my + 105);
    this.drawBuildingAura(this.marketAura, 128, false);

    const marketImg = this.scene.add.image(mx + 64, my + 128, "market");
    marketImg.setOrigin(0.5, 1);
    marketImg.setDisplaySize(196, 196);

    const mScaleX = marketImg.scaleX;
    const mScaleY = marketImg.scaleY;

    this.scene.add.container(0, 0, [this.marketAura, marketImg]).setDepth(2);
    const marketZone = this.scene.add
      .zone(mx, my, 128, 128)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    marketZone.on("pointerover", () => {
      if (this.scene.isPaused || this.scene.isGameOver) return;
      this.scene.tweens.add({
        targets: marketImg,
        scaleX: mScaleX * 1.08,
        scaleY: mScaleY * 1.08,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    marketZone.on("pointerout", () => {
      this.scene.tweens.add({
        targets: marketImg,
        scaleX: mScaleX,
        scaleY: mScaleY,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    attachTooltip(this.scene, marketZone, "Рынок овощей");

    marketZone.on(
      "pointerdown",
      (
        _p: Phaser.Input.Pointer,
        _lx: number,
        _ly: number,
        e: Phaser.Types.Input.EventData,
      ) => {
        e.stopPropagation();
        if (this.scene.isPaused || this.scene.isGameOver) return;

        this.scene.tweens.add({
          targets: marketImg,
          scaleX: mScaleX * 0.95,
          scaleY: mScaleY * 0.9,
          duration: 60,
          yoyo: true,
        });

        this.scene.openMenu("market");
      },
    );
  }

  private createInformer() {
    const ix = 23 * this.scene.CELL_SIZE;
    const iy = 2 * this.scene.CELL_SIZE;

    this.informerAura = this.scene.add.graphics();
    this.informerAura.setPosition(ix + 32, iy + 60);
    this.drawBuildingAura(this.informerAura, 70, false);

    const informerImg = this.scene.add.image(ix + 32, iy + 64, "informer");
    informerImg.setOrigin(0.5, 1);
    informerImg.setDisplaySize(112, 112);

    const iScaleX = informerImg.scaleX;
    const iScaleY = informerImg.scaleY;

    this.scene.add.container(0, 0, [this.informerAura, informerImg]).setDepth(2);
    const informerZone = this.scene.add
      .zone(ix, iy, 64, 64)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    informerZone.on("pointerover", () => {
      if (this.scene.isPaused || this.scene.isGameOver) return;
      this.scene.tweens.add({
        targets: informerImg,
        scaleX: iScaleX * 1.15,
        scaleY: iScaleY * 1.15,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    informerZone.on("pointerout", () => {
      this.scene.tweens.add({
        targets: informerImg,
        scaleX: iScaleX,
        scaleY: iScaleY,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    attachTooltip(this.scene, informerZone, "Энциклопедия башен");

    informerZone.on(
      "pointerdown",
      (
        _p: Phaser.Input.Pointer,
        _lx: number,
        _ly: number,
        e: Phaser.Types.Input.EventData,
      ) => {
        e.stopPropagation();
        if (this.scene.isPaused || this.scene.isGameOver) return;

        this.scene.tweens.add({
          targets: informerImg,
          scaleX: iScaleX * 0.9,
          scaleY: iScaleY * 0.9,
          duration: 60,
          yoyo: true,
        });

        this.scene.interaction.closeAllInGameMenus();
        this.scene.informer.show();
      },
    );
  }

  private drawBuildingAura(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    isSelected: boolean,
  ) {
    graphics.clear();

    const shadowColor = 0x0a0a0a;

    if (isSelected) {
      graphics.fillStyle(shadowColor, 0.4);
      graphics.fillEllipse(0, 0, width * 1, width * 0.3);

      graphics.fillStyle(shadowColor, 0.7);
      graphics.fillEllipse(0, 0, width * 0.85, width * 0.3);

      graphics.lineStyle(2, 0xffff00, 1);
      graphics.strokeEllipse(0, 0, width * 1.0, width * 0.3);
    } else {
      graphics.fillStyle(shadowColor, 0.3);
      graphics.fillEllipse(0, 0, width * 1, width * 0.3);

      graphics.fillStyle(shadowColor, 0.55);
      graphics.fillEllipse(0, 0, width * 0.75, width * 0.3);
    }
  }
}