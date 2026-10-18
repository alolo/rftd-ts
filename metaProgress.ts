import { SaveSystem } from "./saveSystem";
import { TITLES, type Difficulty } from "./meta";

export class MetaProgress {
  public completions: Record<Difficulty, number> = {
    easy: 0,
    normal: 0,
    hard: 0,
    nightmare: 0,
    hell: 0,
    extreme: 0,
    god: 0,
  };
  public currentTitleId: number = 0;

  constructor() {}

  public addWin(diff: Difficulty) {
    this.completions[diff]++;
    this.checkNewTitles();

    const newCode = SaveSystem.generateCode(
      this.currentTitleId,
      this.completions,
    );
    localStorage.setItem("td_save_code", newCode);
  }

  public applyCode(code: string): boolean {
    const data = SaveSystem.loadFromCode(code);
    if (data) {
      this.currentTitleId = data.titleId;
      this.completions = data.completions;
      localStorage.setItem("td_save_code", code);
      return true;
    }
    return false;
  }

  private checkNewTitles() {
    for (const title of TITLES) {
      if (this.currentTitleId >= title.id) continue;

      const hasEnoughWins =
        this.completions[title.reqDifficulty] >= title.reqCount;
      const hasRequiredTitle =
        title.requiredTitleId === 0 ||
        this.currentTitleId >= title.requiredTitleId;

      if (hasEnoughWins && hasRequiredTitle) {
        this.currentTitleId = title.id;
      }
    }
  }

  // --- НОВЫЕ МЕТОДЫ ДЛЯ ГЕНЕРАЦИИ ОТЧЕТА ---

  public getNextTitleInfo(): string {
    const nextTitle = TITLES.find((t) => t.id > this.currentTitleId);
    if (!nextTitle) return "Вы достигли максимального титула (Бог)!";

    const diffNames: Record<Difficulty, string> = {
      easy: "Легко",
      normal: "Нормально",
      hard: "Сложно",
      nightmare: "Кошмар",
      hell: "Ад",
      extreme: "Экстрим",
      god: "Режим Богов",
    };

    const currentWins = this.completions[nextTitle.reqDifficulty];
    const neededWins = nextTitle.reqCount;

    return `Для титула "${nextTitle.name}" нужно побед\nна сложности [${diffNames[nextTitle.reqDifficulty]}]: ${currentWins} / ${neededWins}`;
  }

  public generateSaveReport(): string {
    const currentTitle =
      TITLES.find((t) => t.id === this.currentTitleId)?.name || "Отсутствует";
    const code = localStorage.getItem("td_save_code") || "Нет кода";

    let report = `=== TOWER DEFENSE: СОХРАНЕНИЕ ===\n\n`;
    report += `👤 Игрок: ${SaveSystem.nickname}\n`;
    report += `🏆 Текущий титул: ${currentTitle}\n\n`;

    report += `--- СТАТИСТИКА ПОБЕД ---\n`;
    report += `Легко: ${this.completions.easy}\n`;
    report += `Нормально: ${this.completions.normal}\n`;
    report += `Сложно: ${this.completions.hard}\n`;
    report += `Кошмар: ${this.completions.nightmare}\n`;
    report += `Ад: ${this.completions.hell}\n`;
    report += `Экстрим: ${this.completions.extreme}\n`;
    report += `Режим Богов: ${this.completions.god}\n\n`;

    report += `--- ПРОГРЕСС ТИТУЛА ---\n`;
    report += `${this.getNextTitleInfo()}\n\n`;

    report += `=== ВАШ КОД ДЛЯ ЗАГРУЗКИ ===\n`;
    report += `${code}\n\n`;
    report += `(Скопируйте этот код и вставьте в игре при нажатии "Загрузить игру")\n`;

    return report;
  }
}
