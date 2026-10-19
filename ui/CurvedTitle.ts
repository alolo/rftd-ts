import * as Phaser from "phaser";

export function createCurvedTitle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  radius: number = 2400,
  angleSpread: number = 0.14,
  isRainbow: boolean = true,
  fontSize: string = "36px",
  textColor: string = "#ffffff",
  strokeColor: string = "#000000",
  strokeThickness: number = 6,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const chars = text.split("");
  const startAngle = -angleSpread / 2;
  const angleStep = angleSpread / Math.max(1, chars.length - 1);

  for (let i = 0; i < chars.length; i++) {
    const angle = startAngle + i * angleStep;
    const charX = Math.sin(angle) * radius;
    let charY = Math.cos(angle) * radius - radius;
    if (isRainbow) charY = -charY;

    const finalThickness =
      strokeThickness > 0
        ? strokeThickness
        : parseInt(fontSize) > 40
          ? 6
          : 4;

    const letter = scene.add
      .text(charX, charY, chars[i], {
        fontSize,
        color: textColor,
        fontStyle: "bold",
        stroke: strokeColor,
        strokeThickness: finalThickness,
      })
      .setOrigin(0.5);

    letter.setRotation(isRainbow ? angle : -angle);
    container.add(letter);
  }

  return container;
}