import { trello } from "./_common";

export interface IScore {
  card: string;
  user: string;
}
export type ScoreSheet = { [key: string]: IScore[]}

export class ScoringService {
  private readonly KEY = "quiz-score-sheet";
  private readonly VISIBILITY = "shared";

  private _scoreSheet: ScoreSheet;
  get scoreSheet() {
    return {...this._scoreSheet};
  }

  constructor() {
    //what to do?
  }

  load(t: any) {
    return new trello.Promise((resolve, reject) => {
      t.get('board', this.VISIBILITY, this.KEY)
        .then((data) => {
          this._scoreSheet = data || {};
          resolve(this);
        });
    })
  }

  exists(score: IScore): boolean {
    if (Array.isArray(this._scoreSheet[score?.card])) {
      return this._scoreSheet[score.card].some(m => m.user === score.user);
    } 

    //else
    return false;
  }

  saveScore(t: any, score: IScore): Promise<ScoreSheet> {
    if (!score) {
      throw new Error("Scoring Service: Attempt to save score but no score was found");
    }


    if (!Array.isArray(this._scoreSheet[score.card])) {
      this._scoreSheet[score.card] = [];
    } 

    //does the score already exist?
    if (this.exists(score)) {
      return trello.Promise.resolve(this);  //nothing to do
    }

    //else set the score and save
    this._scoreSheet[score.card].push(score);
    return this.save(t);
}

  save(t): Promise<ScoreSheet> {
    return new trello.Promise((resolve, reject) => {
      t.set('board', this.VISIBILITY, this.KEY, this._scoreSheet)
        .then(_ => resolve(this));
    });
  }

  static Init(t: any): Promise<ScoringService> {
    var ret = new ScoringService();
    return ret.load(t);
  }
}