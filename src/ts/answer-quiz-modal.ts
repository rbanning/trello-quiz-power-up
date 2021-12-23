import * as Showdown from "showdown";

import { LoadingService } from "./loading.service";
import { env, trello } from "./_common";
import { DateHelper } from "./date-helper";
import { MemberComponent } from "./member.component";
import { IAnswer, IQuestion, Question } from "./quiz.model";

const t = trello.t();
const loading = new LoadingService();
loading.show();


t.render(() => {



  //HELPERS
  const close = () => {
    trello.t().closeModal();
  };

  const memberHtml = (member: any) => {
    const el = MemberComponent.build(member);
    return el?.outerHTML;
  };

  const mdConverter = new Showdown.Converter();
  const markdownToHtml = (md: string): string => {
    return mdConverter.makeHtml(md);
  };

  const answerButton = (answer: IAnswer): string => {
    return `<div class="answer" data-id="${answer.id}">${markdownToHtml(answer.text)}</div>`;
  }
  
  const iconHtml = (correct: boolean) => {    
    return `<img class="icon-mark" src="${correct ? env.icon.correct : env.icon.incorrect}" alt="${correct ? 'CORRECT' : 'INCORRECT'}" />`;
  };

  const removeAllIcons = () => {    
    window.document.querySelectorAll("img.icon-mark")
      .forEach((element: Element) => {
        element.remove();
      });
  };

  //SETUP CLOSE BUTTON
  window.document.querySelectorAll('.close')
    .forEach(btn => {
      btn.addEventListener('click', close);
    });

  
  //GET ALL OF THE INFORMATION
  const actions = [
    t.member('id', 'fullName', 'username', 'avatar'),
    t.card('id', 'name', 'desc')
  ];
  trello.Promise.all(actions)
    .then(([member, card]) => {
      //subtitle
      const subtitle = window.document.getElementById('subtitle');
      subtitle.innerHTML = card.name;

      const question: IQuestion = Question.Parse(card.desc);
      console.log("DEBUG: quiz answer details", {member, card, question});

      //get content element
      const content = window.document.getElementById('content');

      if (question?.isValid) {
        //prepare content HTML
        content.innerHTML = `<div class="question">${markdownToHtml(question.text)}</div>`
          + `<div class="answers">${question.answers.map(answerButton).join(' ')}</div>`;

        //setup answer handlers
        window.document.querySelectorAll(".answer")
          .forEach((el: Element) => {
            el.addEventListener('click', (e: MouseEvent) => {
              removeAllIcons();
              const target: HTMLElement = e.target as HTMLElement;
              const id = target.dataset?.id;
              console.log("Checking Answer", {target, id, question, check: question.checkAnswer(id)});
              target.innerHTML = iconHtml(question.checkAnswer(id)) + target.innerHTML;
            });
          });
      } else {
        content.innerHTML = `<div class="error"><strong>Oops!</strong> This appears to be an invalid question!</div>`;
      }
      
    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});
