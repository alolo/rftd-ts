import type { Difficulty } from "./meta";

export class SaveSystem {
  public static nickname: string = "";

  // Метод просто проверяет наличие ника в памяти
  public static loadNickname(): boolean {
    const savedNick = localStorage.getItem("td_player_nick");
    if (savedNick) {
      this.nickname = savedNick;
      return true;
    }
    return false;
  }

  // Сохраняет придуманный ник
  public static setNickname(nick: string) {
    this.nickname = nick;
    localStorage.setItem("td_player_nick", nick);
  }

  public static generateCode(
    titleId: number,
    completions: Record<Difficulty, number>,
  ): string {
    const payload = [
      titleId,
      Math.min(255, completions.easy),
      Math.min(255, completions.normal),
      Math.min(255, completions.hard),
      Math.min(255, completions.nightmare),
      Math.min(255, completions.hell),
      Math.min(255, completions.extreme),
      Math.min(255, completions.god),
    ];

    let nickKey = 0;
    for (let i = 0; i < this.nickname.length; i++) {
      nickKey += this.nickname.charCodeAt(i);
    }

    let hexCode = "";
    let checksum = 0;

    for (let i = 0; i < payload.length; i++) {
      const obfuscated = (payload[i] ^ (nickKey + i)) % 256;
      checksum = (checksum + obfuscated) % 256;
      hexCode += obfuscated.toString(16).padStart(2, "0");
    }

    hexCode += checksum.toString(16).padStart(2, "0");
    return hexCode.toUpperCase();
  }

  public static loadFromCode(
    code: string,
  ): { titleId: number; completions: Record<Difficulty, number> } | null {
    code = code.trim().toUpperCase();

    if (code.length !== 18) {
      console.error("Ошибка: Код должен состоять из 18 символов!");
      return null;
    }

    let nickKey = 0;
    for (let i = 0; i < this.nickname.length; i++) {
      nickKey += this.nickname.charCodeAt(i);
    }

    const payload = [];
    let calculatedChecksum = 0;

    for (let i = 0; i < 8; i++) {
      const hex = code.substring(i * 2, i * 2 + 2);
      const obfuscated = parseInt(hex, 16);
      calculatedChecksum = (calculatedChecksum + obfuscated) % 256;
      const original = (obfuscated ^ (nickKey + i)) % 256;
      payload.push(original);
    }

    const providedChecksum = parseInt(code.substring(16, 18), 16);

    if (calculatedChecksum !== providedChecksum) {
      console.error(
        "Ошибка: Неверный код или код принадлежит другому Никнейму!",
      );
      return null;
    }

    return {
      titleId: payload[0],
      completions: {
        easy: payload[1],
        normal: payload[2],
        hard: payload[3],
        nightmare: payload[4],
        hell: payload[5],
        extreme: payload[6],
        god: payload[7],
      },
    };
  }
}
