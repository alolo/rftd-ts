import type { MainScene } from "../main";
import { SaveSystem } from "../saveSystem";

export function initializePlayer(scene: MainScene) {
  if (!SaveSystem.loadNickname()) {
    scene.mainMenu.setVisible(false);
    scene.showInputMenu(
      "Придумайте Никнейм (2-12 букв):",
      12,
      (nick) => {
        SaveSystem.setNickname(nick);
        const savedCode = localStorage.getItem("td_save_code");
        if (savedCode) scene.metaProgress.applyCode(savedCode);
        scene.mainMenu.setVisible(true);
      },
      false,
      2,
    );
  } else {
    const savedCode = localStorage.getItem("td_save_code");
    if (savedCode) scene.metaProgress.applyCode(savedCode);
  }
}
