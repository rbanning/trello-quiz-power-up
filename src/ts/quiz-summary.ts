import { DateHelper } from "./date-helper";
import { LoadingService } from "./loading.service";
import { MemberComponent } from "./member.component";
import { Question } from "./quiz.model";
import { ScoringService } from "./scoring.service";
import { trello } from "./_common";

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

  const listHtml = (list: any) => {
    if (!list) { return null; }
    return `${list.name} <code style="margin: 0 1em;">(id: ${list.id})</code>`;
  };

  const customFieldHtml = (cf: any) => {
    if (!cf) { return null; }
    const cfOptions = (opt: any) => `- ${opt.value?.text} <code>${opt.id}</code>`;
    return `<span class="dark">${cf.name}</span> <br/><code style="margin: 0 1em;">(type: ${cf.type}, id: ${cf.id})</code>`
      + (cf.option ? cf.options.map(cfOptions) : '');
  };

  const dateHtml = (d: string) => {
    return `<span class="date">${!!d ? DateHelper.dateMedium(new Date(d)) : 'none'}</span>`;
  };

  //SETUP CLOSE BUTTON
  window.document.querySelectorAll('.close')
    .forEach(btn => {
      btn.addEventListener('click', close);
    });

  
  //GET ALL OF THE INFORMATION
  const actions = [
    t.member('id', 'fullName'),
    t.cards('id', 'name', 'desc'), //all the cards
    ScoringService.Init(t)
  ];
  trello.Promise.all(actions)
    .then(([member, cards, scoringService]: [any, any[], ScoringService] ) => {
      
      const questions = cards.map(card => {
        return {
          card,
          question: Question.Parse(card.desc)
        }
      }).filter(m => !!m.question);

      console.log("DEBUG: Actions results", {member, cards, scoringService, questions});

      //subtitle
      const subtitle = window.document.getElementById('subtitle');
      subtitle.innerHTML = `${questions.length} Questions`;

      //get content element
      const content = window.document.getElementById('content');

      content.innerHTML = questions.map(q => {
        const scores = scoringService.scoreSheet[q.card.id] || [];
        const answered = scores.some(m => m.user === member.id);
        return `<div class="item"><strong>${q.card.name}</strong><br/>${scores.length} answered correctly`
          + (answered ? ' (including you!)' : '')
          + '</div>';
      }).join('');

    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});
