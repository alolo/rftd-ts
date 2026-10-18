import * as Phaser from "phaser";
import type { MainScene } from "./main";

export class PauseMenu {
  private scene: MainScene;
  private container!: Phaser.GameObjects.Container;
  private diffText!: Phaser.GameObjects.Text;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.createUI();
  }

  private createCurvedTitle(
    x: number,
    y: number,
    text: string,
    radius: number = 2400,
    angleSpread: number = 0.09,
    isRainbow: boolean = true,
    fontSize: string = "42px",
    textColor: string = "#ffffff",
    strokeColor: string = "#000000",
    strokeThickness: number = 6,
  ) {
    const container = this.scene.add.container(x, y);
    const chars = text.split("");

    const startAngle = -angleSpread / 2;
    const angleStep = angleSpread / Math.max(1, chars.length - 1);

    for (let i = 0; i < chars.length; i++) {
      const angle = startAngle + i * angleStep;

      const charX = Math.sin(angle) * radius;
      let charY = Math.cos(angle) * radius - radius;

      if (isRainbow) {
        charY = -charY;
      }

      const finalThickness =
        strokeThickness > 0 ? strokeThickness : parseInt(fontSize) > 40 ? 6 : 4;

      const letter = this.scene.add
        .text(charX, charY, chars[i], {
          fontSize: fontSize,
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

  // --- УНИВЕРСАЛЬНЫЙ СОЗДАТЕЛЬ КНОПОК ИЗ АТЛАСА ---
  private createButton(
    x: number,
    y: number,
    frame: string,
    text: string,
    width: number,
    height: number,
    fontSize: string,
    textColor: string,
    onClick: () => void,
  ) {
    const corner = 30;
    const img = this.scene.add.nineslice(
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

    const txt = this.scene.add
      .text(0, 0, text, {
        fontSize: fontSize,
        color: textColor,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const btnContainer = this.scene.add.container(x, y, [img, txt]);

    img
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
          // Анимация вдавливания
          this.scene.tweens.add({
            targets: btnContainer,
            scale: 0.9,
            duration: 60,
            yoyo: true,
            onComplete: () => onClick(),
          });
        },
      )
      .on("pointerover", () => {
        img.setTint(0xcccccc);
      })
      .on("pointerout", () => {
        img.clearTint();
      });

    return btnContainer;
  }

  private createUI() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(200)
      .setVisible(false);

    const centerX = this.scene.scale.width / 2;
    //Защита от клика
    const clickBlocker = this.scene.add
      .zone(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        this.scene.scale.width,
        this.scene.scale.height,
      )
      .setInteractive()
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation(); // Не пускаем клик дальше в игру
        },
      );

    // 2. Деревянная подложка окна
    const panelCorner = 30;
    const menuPanel = this.scene.add.nineslice(
      centerX,
      480,
      "ui",
      "panel_brown.png",
      480,
      560,
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );

    // 3. Баннер и заголовок
    const banner = this.scene.add.image(
      centerX,
      220,
      "ui",
      "banner_hanging.png",
    );
    banner.setScale(1.1);

    const title = this.createCurvedTitle(
      centerX,
      226, // Центр ленты по высоте
      "Пауза",
      2400, // Радиус изгиба
      0.05, // Компактный угол под 5 букв
      false, // Арка куполом
      "42px",
      "#ffffff",
      "#000000",
      6,
    );

    // 4. Текст сложности
    this.diffText = this.scene.add
      .text(centerX, 300, "Сложность: Нормальная", {
        fontSize: "20px",
        color: "#ffea88",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // 5. Кнопки меню
    const btnContinue = this.createButton(
      centerX,
      355,
      "button_red.png",
      "▶ Продолжить",
      320,
      65,
      "26px",
      "#ffffff",
      () => this.scene.togglePause(),
    );

    const btnHowToPlay = this.createButton(
      centerX,
      435,
      "button_grey.png",
      "Как играть",
      280,
      58,
      "22px",
      "#ffffff",
      () => this.scene.showHowToPlay(),
    );

    const btnAchievements = this.createButton(
      centerX,
      515,
      "button_brown.png",
      "Достижения",
      280,
      58,
      "22px",
      "#ffd700",
      () => this.scene.showAchievementsMenu(),
    );

    const btnRestart = this.createButton(
      centerX,
      595,
      "button_grey.png",
      "Начать заново",
      300,
      58,
      "20px",
      "#ffaaaa",
      () => this.scene.restartGame(),
    );

    // Сборка контейнера: сначала затемнение, потом панель, баннер и поверх кнопки
    this.container.add([
      clickBlocker,
      menuPanel,
      banner,
      title,
      this.diffText,
      btnContinue,
      btnHowToPlay,
      btnAchievements,
      btnRestart,
    ]);
  }

  public setVisible(visible: boolean) {
    this.container.setVisible(visible);
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }

  public updateDifficultyText(difficultyLevel: string) {
    const diffNames: Record<string, string> = {
      easy: "Легкая",
      normal: "Нормальная",
      hard: "Сложная",
      nightmare: "Кошмар",
      hell: "Ад",
      extreme: "Экстрим",
      god: "Режим богов",
    };
    const diffName = diffNames[difficultyLevel] || "Нормальная";
    this.diffText.setText(`Сложность: ${diffName}`);
  }
}
