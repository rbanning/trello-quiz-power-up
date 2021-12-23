
export interface IAnswer {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface IQuestion {
  text: string;
  answers: IAnswer[];
  readonly isValid: boolean;
  readonly correctAnswer: IAnswer;
  checkAnswer: (id: string) => boolean
}

export const QuestionAnswerSeparator = "---";
export const CorrectAnswerIndicator = '\u200B';

export class Question implements IQuestion {
  text: string;
  answers: IAnswer[];
  get isValid(): boolean {
    return Array.isArray(this.answers)
      && this.answers.filter((m: IAnswer) => m.isCorrect).length === 1;
  }
  get correctAnswer(): IAnswer {
    return this.isValid ? this.answers.find(m => m.isCorrect) : null;
  }

  constructor(obj: any) {
    this.answers = [];
    if (obj) {
      this.text = obj.text;
      if (Array.isArray(obj.answers)) {
        this.answers = obj.answers;
      }
    }
  }

  checkAnswer(id: string): boolean {
    const correct = this.correctAnswer;
    return correct?.id === id;
  }

  static Parse(text: string): IQuestion {
    const parts = text.split(QuestionAnswerSeparator);
    if (parts.length >= 2) {
      const result = {
        text: parts.slice(0, parts.length - 1).join(QuestionAnswerSeparator),  //answers are after the last separator so rejoin the text of the question
        answers: parts[parts.length - 1].split('\n').filter(m => m && m.trim().length > 0)
            .map((answer: string, index: number) => {
              return {
                id: `${index}-${answer.replace(" ", "").substring(0,5).toLocaleLowerCase()}`,
                text: answer,
                isCorrect: answer.includes(CorrectAnswerIndicator)
              }
            })
      };
      return new Question(result);
    }
    //else
    return null;
  }

}