import * as Showdown from "showdown";

import { LoadingService } from "./loading.service";
import { env, trello } from "./_common";
import { MemberComponent } from "./member.component";
import { IAnswer, IQuestion, Question } from "./quiz.model";
import { Fireworks } from "./fireworks";

const t = trello.t();
const loading = new LoadingService();
loading.show();


const close = () => {
  trello.t().closeModal();
};

const correctMessages = ["Well Done!", "You're Correct!", "Right On!", "Good Answer!", "So Smart!"];
const randomCorrectMessage = () => {
  return correctMessages[Math.floor(Math.random() * 100) % correctMessages.length];
}

const showFireworks = (message: string = null) => {
  const backdrop = window.document.getElementById("backdrop");
  backdrop.classList.add("show");
  Fireworks.load();
  if (message) {
    const el = window.document.createElement("div");
    el.classList.add("message");
    el.innerHTML = message;
    backdrop.append(el);
  }
}

t.render(() => {



  //HELPERS

  const memberHtml = (member: any) => {
    const el = MemberComponent.build(member);
    return el?.outerHTML;
  };

  const mdConverter = new Showdown.Converter();
  const markdownToHtml = (md: string): string => {
    return mdConverter.makeHtml(md);
  };

  const answerButton = (answer: IAnswer): string => {
    return `<div class="answer" id="${answer.id}">${markdownToHtml(answer.text)}</div>`;
  }

  const preloadIcons = () => {
    const ok = new Image();
    ok.src = env.icon.correct;
    ok.onload = () => { console.log("DEBUG: Correct icon loaded"); }
    const wrong = new Image();
    wrong.src = env.icon.incorrect;
    wrong.onload = () => { console.log("DEBUG: Incorrect icon loaded"); }
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

  //Preload images
  preloadIcons();


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
            el.addEventListener('click', (e: PointerEvent) => {
              removeAllIcons();
              const id = el.getAttribute('id');
              const isCorrect = question.checkAnswer(id);

              console.log("DEBUG: Checking Answer", {el, id, question, isCorrect});
              el.innerHTML = iconHtml(isCorrect) + el.innerHTML;

              if (isCorrect) {
                window.setTimeout(() => {
                  showFireworks(randomCorrectMessage());
                  //window.setTimeout(close, 5000);
                }, 1000);  
              }
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
