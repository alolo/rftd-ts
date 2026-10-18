import * as Phaser from "phaser";
import type { MainScene } from "./main";
import type { Difficulty } from "./meta";
import { SaveSystem } from "./saveSystem";

export class MainMenu {
  private scene: MainScene;
  private container!: Phaser.GameObjects.Container;
  private difficultyMenuContainer!: Phaser.GameObjects.Container;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.createUI();
    this.createDifficultyMenu();
  }

  public get isDifficultyOpen(): boolean {
    return this.difficultyMenuContainer.visible;
  }

  public closeDifficultyMenu() {
    this.difficultyMenuContainer.setVisible(false);
    this.container.setVisible(true);
  }

  // Генератор изогнутого текста
  private createCurvedTitle(
    x: number,
    y: number,
    text: string,
    radius: number = 3000, // Радиус по умолчанию
    angleSpread: number = 0.2, // Раскидистость по умолчанию
    isRainbow: boolean = false, // Прогиб вниз по умолчанию
    fontSize: string = "54px",
    textColor: string = "#ffffff",
    strokeColor: string = "#000000",
    strokeThickness: number = 0,
  ) {
    const container = this.scene.add.container(x, y);
    const chars = text.split("");

    const startAngle = -angleSpread / 2;
    const angleStep = angleSpread / (chars.length - 1);

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

  // --- УНИВЕРСАЛЬНЫЙ СОЗДАТЕЛЬ КРАСИВЫХ КНОПОК ---
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
    // 1. Создаем картинку из атласа
    const corner = 30;
    const img = this.scene.add.nineslice(
      0,
      0, // X, Y
      "ui",
      frame, // Атлас и имя кадра
      width,
      height, // Желаемая ширина и высота кнопки
      corner,
      corner, // Левый отступ, Правый отступ
      corner,
      corner, // Верхний отступ, Нижний отступ
    );

    // 2. Создаем текст с красивой черной обводкой для читаемости
    const txt = this.scene.add
      .text(0, 0, text, {
        fontSize: fontSize,
        color: textColor,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // 3. Собираем в контейнер
    const btnContainer = this.scene.add.container(x, y, [img, txt]);

    // 4. Вешаем интерактивность на картинку
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
          // Анимация "вдавливания" кнопки
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
      }) // Слегка затемняем при наведении
      .on("pointerout", () => {
        img.clearTint();
      });

    return btnContainer;
  }

  private createUI() {
    this.container = this.scene.add.container(0, 0).setDepth(100);

    // 1. БЛОКИРАТОР КЛИКОВ (вместо черного фона)
    // Делаем невидимую зону на весь экран, чтобы клики не проходили сквозь меню на игровое поле
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
          event.stopPropagation();
        },
      );

    // 2. КРАСИВАЯ ПОДЛОЖКА (ФОН ДЛЯ КНОПОК)
    const panelCorner = 30; // Углы для рамки подложки (можешь подкорректировать)
    const menuPanel = this.scene.add.nineslice(
      this.scene.scale.width / 2,
      515, // Ставим по центру, чуть ниже заголовка
      "ui",
      "panel_brown.png", // ⚠️ ВАЖНО: ВСТАВЬ СЮДА НАЗВАНИЕ ПОДЛОЖКИ ИЗ XML!
      500,
      600, // Ширина и высота этого окна
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );

    // 3. БАННЕР ЗАГОЛОВКА
    const banner = this.scene.add.image(
      this.scene.scale.width / 2,
      175,
      "ui",
      "banner_hanging.png",
    );
    banner.setScale(1.35);

    const title = this.createCurvedTitle(
      this.scene.scale.width / 2,
      180,
      "Random Tower Defense",
      3400, // Тот самый радиус, который ты подобрал
      0.15, // Тот самый разброс
      false, // Выгиб вниз (не радуга)
      "42px",
      "#FFFFFF",
      "#3d2817",
      8,
    );

    // 4. КНОПКИ
    const btnNewGame = this.createButton(
      this.scene.scale.width / 2,
      350,
      "button_red.png",
      "Начать новую игру",
      360,
      70,
      "28px",
      "#ffffff",
      () => {
        this.showDifficultyMenu();
      },
    );

    const btnLoadGame = this.createButton(
      this.scene.scale.width / 2,
      435,
      "button_brown.png",
      "Загрузить игру",
      300,
      60,
      "24px",
      "#ffffff",
      () => {
        this.scene.showInputMenu(
          "Введите 18-значный код:",
          18,
          (code) => {
            if (code.length === 18) {
              const success = this.scene.metaProgress.applyCode(code);
              if (success) {
                this.scene.showNotification("✅ Прогресс успешно загружен!");
              } else {
                this.scene.showNotification("❌ Неверный код или чужой Ник!");
              }
            } else {
              this.scene.showNotification(
                "❌ Код должен быть ровно 18 символов!",
              );
            }
          },
          true,
        );
      },
    );

    const btnHowToPlay = this.createButton(
      this.scene.scale.width / 2,
      520,
      "button_grey.png",
      "Как играть",
      260,
      60,
      "22px",
      "#ffffff",
      () => {
        this.scene.showHowToPlay();
      },
    );

    const btnAchievements = this.createButton(
      this.scene.scale.width / 2,
      605,
      "button_brown.png",
      "Достижения",
      280,
      60,
      "22px",
      "#ffd700",
      () => {
        this.scene.showAchievementsMenu();
      },
    );

    const btnBugReport = this.createButton(
      this.scene.scale.width / 2,
      690,
      "button_grey.png",
      "Сообщить об ошибке",
      320,
      60,
      "20px",
      "#ffaaaa",
      () => {
        this.scene.showBugReport();
      },
    );

    // ⚠️ ПОРЯДОК СБОРКИ ОЧЕНЬ ВАЖЕН:
    // Сначала Блокиратор, потом Подложка(menuPanel), и только поверх неё — Баннер и Кнопки!
    this.container.add([
      clickBlocker,
      menuPanel,
      banner,
      title,
      btnNewGame,
      btnLoadGame,
      btnHowToPlay,
      btnBugReport,
      btnAchievements,
    ]);
  }

  private createDifficultyMenu() {
    this.difficultyMenuContainer = this.scene.add
      .container(0, 0)
      .setDepth(110)
      .setVisible(false);

    // 1. Невидимый блокиратор кликов на весь экран
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
          event.stopPropagation();
        },
      );

    // 2. Красивая подложка (вытянутая вниз под список)
    const panelCorner = 30;
    const menuPanel = this.scene.add.nineslice(
      this.scene.scale.width / 2,
      480,
      "ui",
      "panel_brown.png",
      500,
      750, // Сделали её повыше, чтобы влезли все 7 уровней сложности
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );

    const banner = this.scene.add.image(
      this.scene.scale.width / 2,
      120,
      "ui",
      "banner_hanging.png",
    );
    banner.setScale(1.1);

    const title = this.createCurvedTitle(
      this.scene.scale.width / 2,
      125, // Y-координата (возможно, придется чуть сдвинуть вверх/вниз)
      "Выберите сложность",
      2800, // Радиус (сделал меньше, чтобы дуга была круче)
      0.14, // Разброс букв (пошире)
      false, // isRainbow = true (выгиб вверх)
      "40px",
      "#FFFFFF",
      "#3d2817",
      8,
    );

    // Собираем фон в правильном порядке
    this.difficultyMenuContainer.add([clickBlocker, menuPanel, banner, title]);

    const difficulties: {
      name: string;
      id: Difficulty;
      mult: number;
      color: string;
      gold: number;
    }[] = [
      {
        name: "1. Легко (75% ХП)",
        id: "easy",
        mult: 0.75,
        color: "#55ff55",
        gold: 500,
      },
      {
        name: "2. Нормально (100% ХП)",
        id: "normal",
        mult: 1.0,
        color: "#ffffff",
        gold: 500,
      },
      {
        name: "3. Сложно (125% ХП)",
        id: "hard",
        mult: 1.25,
        color: "#ffff55",
        gold: 600,
      },
      {
        name: "4. Кошмар (150% ХП)",
        id: "nightmare",
        mult: 1.5,
        color: "#ffaa00",
        gold: 700,
      },
      {
        name: "5. Ад (200% ХП)",
        id: "hell",
        mult: 2.0,
        color: "#ff5555",
        gold: 800,
      },
      {
        name: "6. Экстрим (250% ХП)",
        id: "extreme",
        mult: 2.5,
        color: "#cc0000",
        gold: 900,
      },
      {
        name: "7. Режим богов (300% ХП)",
        id: "god",
        mult: 3.0,
        color: "#ff00ff",
        gold: 1000,
      },
    ];

    let startY = 230;
    difficulties.forEach((diff) => {
      // Используем коричневые кнопки для меню сложности
      const btn = this.createButton(
        this.scene.scale.width / 2,
        startY,
        "button_brown.png",
        diff.name,
        400,
        60,
        "26px",
        diff.color,
        () => {
          this.difficultyMenuContainer.setVisible(false);
          this.scene.startGame(diff.id, diff.mult, diff.gold);
        },
      );

      this.difficultyMenuContainer.add(btn);
      startY += 75;
    });

    // Кнопка НАЗАД (используем красную кнопку с крестиком или обычную)
    const btnBack = this.createButton(
      this.scene.scale.width / 2,
      startY + 20,
      "button_red.png",
      "НАЗАД",
      200,
      50,
      "22px",
      "#ffffff",
      () => {
        this.difficultyMenuContainer.setVisible(false);
        this.container.setVisible(true);
      },
    );

    this.difficultyMenuContainer.add(btnBack);
  }

  public showDifficultyMenu() {
    this.container.setVisible(false);
    this.difficultyMenuContainer.setVisible(true);
  }

  public setVisible(visible: boolean) {
    this.container.setVisible(visible);
    if (!visible) {
      this.difficultyMenuContainer.setVisible(false);
    }
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }
}
