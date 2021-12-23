import { AboutPage } from "./about-page";
import { ScoringService } from "./scoring.service";
import { ISettings, SettingsService } from "./settings.service";
import { trello, getBoardMembers, env } from "./_common";

export namespace BoardButtons {

  export const build = (t: any) => {
    const settingsService = new SettingsService();

    return trello.Promise.all([
        settingsService.get(t),
        ScoringService.Init(t)      
      ]) 
      .then(([settings, scoreService]: [ISettings, ScoringService]) => {

        //VALIDATION
        if (!settings) {
          console.warn("Unable to retrieve settings", {settings});
          return [];
        }
        if (!scoreService) {
          console.warn("Unable to retrieve score service", {scoreService});
          return [];
        }
  
        console.log("DEBUG: BoardButtons - done");
        return {
          text: 'Quiz Summary',
          callback: (t) => {
            t.modal({
              url: './quiz-summary.html',
              fullscreen: false,
              title: 'Quiz Summary',
              accentColor: env.accentColor,
              height: 500
            });
          }
        };
      });
  };

}
