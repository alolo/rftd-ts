import * as Phaser from "phaser";

export class ActionButton {
  public readonly container: Phaser.GameObjects.Container;
  private label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    frame: string,
    text: string,
    onClick: () => void,
  ) {
    const corner = 30;
    const img = scene.add.nineslice(
      0,
      0,
      "ui",
      frame,
      width,
      height,
      corner,
      corner,
      corner,
      corner,
    );

    this.label = scene.add
      .text(0, 0, text, {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5);

    this.container = scene.add.container(centerX, centerY, [img, this.label]);

    img
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
          scene.tweens.add({
            targets: this.container,
            scale: 0.93,
            duration: 60,
            yoyo: true,
            onComplete: () => onClick(),
          });
        },
      )
      .on("pointerover", () => img.setTint(0xcccccc))
      .on("pointerout", () => img.clearTint());
  }

  public setText(text: string): this {
    this.label.setText(text);
    return this;
  }

  public get visible(): boolean {
    return this.container.visible;
  }

  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  public setOrigin(_x?: number, _y?: number): this {
    return this;
  }

  public setDepth(depth: number): this {
    this.container.setDepth(depth);
    return this;
  }
}