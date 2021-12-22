import { LoadingService } from "./loading.service";
import { trello } from "./_common";
import { DateHelper } from "./date-helper";
import { MemberComponent } from "./member.component";
import { Question } from "./quiz.model";

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

  const customFieldHtml = (cf: any) => {
    if (!cf) { return null; }
    const value = cf.value?.text || cf.value?.date || cf.value?.number || cf.value?.checked || `opt id: ${cf.idValue}`;
    return `<span class="dark">${value}</span> <br/><code style="margin: 0 1em;">(field: ${cf.idCustomField})</code>`;
  };

  
  const dateHtml = (d: string) => {    
    return `<span class="date">${!!d ? DateHelper.dateMedium(new Date(d)) : 'none'}</span>`;
  };

  const booleanHtml = (bool: string | boolean) => {    
    if (typeof(bool) === 'string') { bool = bool.toLowerCase() === "true"; }
  
    return (bool === null || bool === undefined) ? '' : `<span class="bool">${(bool ? '(DONE)' : '(PENDING)')}</span>`;
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

      const question = Question.Parse(card.desc);
      console.log("DEBUG: quiz answer details", {member, card, question});

      //get content element
      const content = window.document.getElementById('content');

      
    })
    .then(() => {
      loading.hide();
      return t.sizeTo('#page');
    });
});
