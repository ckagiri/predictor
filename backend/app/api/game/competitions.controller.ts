export class GameCompetitionsController {
  public static getInstance() {
    return new GameCompetitionsController();
  }

  constructor() {

  }
};

const gameCompetitionsController = GameCompetitionsController.getInstance();

export default gameCompetitionsController;
