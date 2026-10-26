import * as Phaser from "phaser";
import type { MainScene } from "./main";
import { SaveSystem } from "./saveSystem";
import { createCurvedTitle } from "./ui/CurvedTitle";

export class BugReportMenu {
  private scene: MainScene;
  private container!: Phaser.GameObjects.Container;
  private attachLogsToEmail: boolean = true;
  private checkboxText!: Phaser.GameObjects.Text;

  private readonly MENU_WIDTH = 620;
  private readonly MENU_HEIGHT = 480;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.createUI();
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }

  private createUI() {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.container = this.scene.add
      .container(centerX, centerY)
      .setDepth(600)
      .setVisible(false);

    // Блокировщик кликов (нижний слой)
    const blocker = this.scene.add
      .zone(
        -this.MENU_WIDTH / 2,
        -this.MENU_HEIGHT / 2,
        this.MENU_WIDTH,
        this.MENU_HEIGHT,
      )
      .setOrigin(0, 0)
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

    // Фон — woodPanelMenu через nineslice
    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodPanelMenu",
      this.MENU_WIDTH,
      this.MENU_HEIGHT,
      60,
      60,
      60,
      60,
    );

    // Баннер — redBannerNice
    const banner = this.scene.add.image(
      0,
      -this.MENU_HEIGHT / 2 + 20,
      "ui_v2",
      "redBannerNice",
    );
    banner.setScale(1);

    // Изогнутый заголовок
    const title = createCurvedTitle(
      this.scene,
      0,
      -this.MENU_HEIGHT / 2 + 30,
      "СООБЩИТЬ ОБ ОШИБКЕ",
      800,
      0.36,
      false,
      "20px",
      "#ffffff",
      "#3d1414",
      3,
    );

    // Описание
    const desc = this.scene.add
      .text(
        0,
        -50,
        'Нашли баг? Есть предложения? Нажмите "Написать письмо".\n' +
          "Или напишите нам на почту: alo32@yandex.ru\n" +
          "Откроется ваш почтовый клиент, где вы сможете описать проблему/пожелания.\n\n" +
          "Спасибо, что помогаете делать игру лучше!",
        {
          fontSize: "18px",
          color: "#ffffffff",
          align: "center",
          lineSpacing: 4,
          stroke: "#000000",
          strokeThickness: 3,
          wordWrap: { width: this.MENU_WIDTH - 100, useAdvancedWrap: true },
        },
      )
      .setOrigin(0.5);

    // Чекбокс
    this.checkboxText = this.scene.add
      .text(0, 90, "[X] Прикрепить логи игры к письму", {
        fontSize: "18px",
        color: "#ffaaaa",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.attachLogsToEmail = !this.attachLogsToEmail;
        this.refreshCheckbox();
      });

    // Кнопки — через nineslice, как в магазине
    const makeBtn = (
      x: number,
      frame: string,
      text: string,
      color: string,
      onClick: () => void,
    ) => {
      const img = this.scene.add
        .image(0, 0, "ui_v2", frame)
        .setDisplaySize(200, 54);
      const label = this.scene.add
        .text(0, 0, text, {
          fontSize: "18px",
          color,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      const btn = this.scene.add.container(x, 150, [img, label]);

      img
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
            onClick();
          },
        )
        .on("pointerover", () => img.setTint(0xdddddd))
        .on("pointerout", () => img.clearTint());

      return btn;
    };

    const btnSend = makeBtn(-110, "redButtonMini", "НАПИСАТЬ", "#ffffff", () =>
      this.sendReport(),
    );

    const btnClose = makeBtn(110, "lightButtonClear", "ОТМЕНА", "#ffffff", () =>
      this.setVisible(false),
    );

    this.container.add([
      blocker,
      bg,
      banner,
      title,
      desc,
      this.checkboxText,
      btnSend,
      btnClose,
    ]);
  }

  private refreshCheckbox() {
    this.checkboxText.setText(
      this.attachLogsToEmail
        ? "[X] Прикрепить логи игры к письму"
        : "[ ] Прикрепить логи игры к письму",
    );
  }

  private sendReport() {
    const email = "alo32@yandex.ru";
    const subject = "Баг-репорт: Tower Defense";

    const header =
      "Опишите, что пошло не так:\n\n\n-----------------------\n" +
      `Никнейм: ${SaveSystem.nickname}\n` +
      `Браузер: ${navigator.userAgent}\n`;

    let body = header;

    if (this.attachLogsToEmail) {
      const logs = this.scene.getLogs().join("\n");
      body += `\n--- ЛОГИ ИГРЫ ---\n${logs}`;
    }
    const fullClipboard = `Кому: ${email}\nТема: ${subject}\n\n${body}`;
    this.copyToClipboard(fullClipboard);

    const shortBody =
      "[Полный текст письма скопирован в буфер обмена]\n" +
      "Вставьте его в письмо: Ctrl+V или ПКМ → Вставить.\n\n" +
      header;

    const shortUrl =
      `mailto:${email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(shortBody)}`;

    const fullUrl =
      `mailto:${email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    const urlToUse = fullUrl.length < 1900 ? fullUrl : shortUrl;

    try {
      const link = document.createElement("a");
      link.href = urlToUse;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Не удалось открыть почтовый клиент:", e);
    }

    this.scene.showNotification(
      "Текст письма скопирован в буфер. Если клиент не открылся — вставьте вручную.",
    );

    this.setVisible(false);
  }

  private copyToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {
        this.copyToClipboardFallback(text);
      });
    } else {
      this.copyToClipboardFallback(text);
    }
  }

  private copyToClipboardFallback(text: string) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      console.error("Не удалось скопировать логи в буфер", e);
    }
    document.body.removeChild(el);
  }

  public setVisible(visible: boolean) {
    this.container.setVisible(visible);
  }
}
