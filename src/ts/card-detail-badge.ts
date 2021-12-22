import { AboutPage } from "./about-page";
import { ISettings, SettingsService } from "./settings.service";
import { trello } from "./_common";

export namespace CardDetailBadge {


  const answerQuiz = (card) => {
    return (t) => {
      t.member('id', 'fullName', 'username', 'avatar')
      .then((member) => {
        console.log("DEBUG: answer quiz information", {card, member});
        const tt = trello.t();
        tt.popup({
          type: 'confirm',
          title: 'What is your name?',
          message: `Is your name: ${member.fullName}?`,
          confirmText: 'Yes, it is',
          confirmStyle: 'primary',
          onConfirm: (tt) => { console.log("YES"); tt.closePopup(); },
          cancelText: 'No, it is not',
          onCancel: (tt) => { console.log("NO"); tt.closePopup(); }
        });
      });
    };
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
            callback: answerQuiz(card)
          }
        ];

        return result;
    });
  };


}
