import { ISettings, SettingsService } from "./settings.service";
import { env, trello } from "./_common";

export namespace CardDetailBadge {


  const showQuizAnswerPromptModal = (t) => {
    t.modal({
      url: './answer-quiz-modal.html',
      fullscreen: false,
      title: 'Answer Question',
      accentColor: env.accentColor,
      height: 500
    });
  };



  export const build = (t: any) => {
    const settingsService = new SettingsService();

    return trello.Promise.all([
        settingsService.get(t),
        t.card('id', 'name', 'desc')      
      ]) 
      .then(([settings, card]: [ISettings, any]) => {

        //VALIDATION
        if (!settings) {
          console.warn("Unable to retrieve settings", {settings});
          return [];
        }
        if (!card) {
          console.warn("Unable to retrieve card", {card});
          return [];
        }

        const result = [
          {
            title: settings.quiz_name || 'Untitled Quiz',
            text: 'Answer Question',
            color: 'sky',
            callback: showQuizAnswerPromptModal
          }
        ];

        return result;
    });
  };


}
