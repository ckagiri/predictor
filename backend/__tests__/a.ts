import db from '../db';
import {
  Competition,
  Season,
  User,
  Team,
  Match,
  Prediction,
} from '../db/models';
import { MatchStatus } from '../db/models/match.model';

interface Game {
  users: User[];
  teams: Team[];
  competitions: Competition[];
  seasons: Season[];
  matches: Match[];
  predictions: Prediction[];
}

export class GameData {
  users: User[];
  teams: Team[];
  competitions: Competition[];
  seasons: Season[];
  matches: Match[];
  predictions: Prediction[];
  constructor({
    users,
    teams,
    competitions,
    seasons,
    matches,
    predictions,
  }: Game) {
    this.users = users;
    this.teams = teams;
    this.competitions = competitions;
    this.seasons = seasons;
    this.matches = matches;
    this.predictions = predictions;
  }
}

interface Builder<T> {
  build(): Promise<T>;
}

class CompetitionBuilder implements Builder<Competition> {
  private built = {} as Competition;
  private competition?: Competition;

  name(value: string) {
    this.built.name = value;
    return this;
  }

  code(value: string) {
    this.built.code = value;
    return this;
  }

  slug(value: string) {
    this.built.slug = value;
    return this;
  }

  getSlug() {
    return this.competition?.slug;
  }

  async build(): Promise<Competition> {
    this.competition = await db.Competition.create(this.built);
    return this.competition;
  }
}

class SeasonBuilder implements Builder<Season> {
  private built = {} as Season;
  private competitionBuilder?: CompetitionBuilder;
  private teamBuilders: TeamBuilder[] = [];
  private matchBuilders: MatchBuilder[] = [];
  private season?: Season;
  private predictions: Prediction[] = [];

  constructor(private gameBuilder: GameBuilder) {}

  name(value: string) {
    this.built.name = value;
    return this;
  }

  slug(value: string) {
    this.built.slug = value;
    return this;
  }

  year(value: number) {
    this.built.year = value;
    return this;
  }

  seasonStart(value: string) {
    this.built.seasonStart = value;
    return this;
  }

  seasonEnd(value: string) {
    this.built.seasonEnd = value;
    return this;
  }

  currentMatchRound(value: number) {
    this.built.currentMatchRound = value;
    return this;
  }

  withCompetition(competition: CompetitionBuilder) {
    this.competitionBuilder = competition;
    return this;
  }

  withTeams(...teams: TeamBuilder[]) {
    this.teamBuilders = teams;
    return this;
  }

  getTeams() {
    const teams = this.gameBuilder.teams.filter(gameTeam =>
      this.teamBuilders.some(
        teamBuilder => gameTeam.slug! === teamBuilder.getSlug(),
      ),
    );
    return teams;
  }

  getUsers() {
    return this.gameBuilder.users;
  }

  getPredictions() {
    return this.predictions;
  }

  addPredictions(predictions: Prediction[]) {
    this.predictions = [...this.predictions, ...predictions];
  }

  getCompetition() {
    const competition = this.gameBuilder.competitions.find(
      gameCompetition =>
        gameCompetition.slug === this.competitionBuilder?.getSlug(),
    );
    return competition;
  }

  getSeason() {
    return this.season;
  }

  withMatches(...matches: MatchBuilder[]) {
    this.matchBuilders = matches;
    return this;
  }

  async build(): Promise<Season> {
    const { name, slug, id } = this.getCompetition() as Required<Competition>;
    this.built.competition = { name, slug, id };
    this.built.teams = this.getTeams().map((t: any) => t._id as any);
    this.season = await db.Season.create(this.built);
    const matches = await Promise.all(
      this.matchBuilders.map(async builder => {
        builder.season(this);
        const match = builder.build();
        return match;
      }),
    );

    this.gameBuilder.matches = [...this.gameBuilder.matches, ...matches];
    this.gameBuilder.predictions = [
      ...this.gameBuilder.predictions,
      ...this.predictions,
    ];
    return this.season;
  }
}

class TeamBuilder implements Builder<Team> {
  private built = {} as Team;
  private team?: Team;

  name(value: string) {
    this.built.name = value;
    return this;
  }

  slug(value: string) {
    this.built.slug = value;
    return this;
  }

  getSlug() {
    return this.team?.slug;
  }

  async build(): Promise<Team> {
    this.team = await db.Team.create(this.built);
    return this.team;
  }
}

class MatchBuilder implements Builder<Match> {
  private built = {
    status: MatchStatus.SCHEDULED,
  } as Match;
  private seasonBuilder?: SeasonBuilder;
  private homeTeamBuilder?: TeamBuilder;
  private awayTeamBuilder?: TeamBuilder;
  private predictionBuilders: PredictionBuilder[] = [];
  private match?: Match;

  season(season: SeasonBuilder) {
    this.seasonBuilder = season;
    return this;
  }

  homeTeam(team: TeamBuilder) {
    this.homeTeamBuilder = team;
    return this;
  }

  awayTeam(team: TeamBuilder) {
    this.awayTeamBuilder = team;
    return this;
  }

  getHomeTeam() {
    return this.seasonBuilder
      ?.getTeams()
      .find(team => team.slug === this.homeTeamBuilder?.getSlug());
  }

  getAwayTeam() {
    return this.seasonBuilder
      ?.getTeams()
      .find(team => team.slug === this.awayTeamBuilder?.getSlug());
  }

  status(value: MatchStatus) {
    this.built.status = value;
    return this;
  }

  date(value: any) {
    this.built.date = value;
    return this;
  }

  gameRound(value: number) {
    this.built.gameRound = value;
    return this;
  }

  withPredictions(...predictions: PredictionBuilder[]) {
    this.predictionBuilders = predictions;
    return this;
  }

  getUsers() {
    return this.seasonBuilder?.getUsers();
  }

  getMatch() {
    return this.match;
  }

  async build(): Promise<Match> {
    const {
      id: seasonId,
      currentMatchRound,
    } = this.seasonBuilder?.getSeason() as Required<Season>;
    this.built.season = seasonId;
    this.built.gameRound ?? currentMatchRound;
    this.built.matchRound ?? currentMatchRound;
    const {
      name: htName,
      id: htId,
      slug: htSlug,
    } = this.getHomeTeam() as Required<Team>;
    this.built.homeTeam = {
      name: htName,
      id: htId,
      slug: htSlug,
      crestUrl: '',
    };
    let {
      name: atName,
      id: atId,
      slug: atSlug,
    } = this.getAwayTeam() as Required<Team>;
    this.built.awayTeam = {
      name: atName,
      id: atId,
      slug: atSlug,
      crestUrl: '',
    };
    this.built.slug = `${htSlug}-${atSlug}`;
    this.match = await db.Match.create(this.built);
    const predictions = await Promise.all(
      this.predictionBuilders.map(async builder => {
        builder.match(this);
        const prediction = builder.build();
        return prediction;
      }),
    );
    this.seasonBuilder?.addPredictions(predictions);
    return this.match;
  }
}

class UserBuilder implements Builder<User> {
  private built = {} as User;
  private user?: User;

  username(value: string) {
    this.built.username = value;
    return this;
  }

  getUsername() {
    return this.user?.username;
  }

  email(value: string) {
    this.built.email = value;
    return this;
  }

  async build(): Promise<User> {
    this.user = await db.User.create(this.built);
    return this.user;
  }
}

class PredictionBuilder implements Builder<Prediction> {
  private built = {
    hasJoker: false,
    jokerAutoPicked: false,
    choice: {
      goalsHomeTeam: 0,
      goalsAwayTeam: 0,
      isComputerGenerated: false,
    },
    status: 'PENDING',
  } as Prediction;
  private userBuilder?: UserBuilder;
  private matchBuilder?: MatchBuilder;

  user(user: UserBuilder) {
    this.userBuilder = user;
    return this;
  }

  getUser() {
    return this.matchBuilder
      ?.getUsers()
      ?.find(user => user.username === this.userBuilder?.getUsername());
  }

  homeScore(homeScore: number) {
    this.built.choice.goalsHomeTeam = homeScore;
    return this;
  }

  awayScore(awayScore: number) {
    this.built.choice.goalsAwayTeam = awayScore;
    return this;
  }

  computerPick(isComputerPick: boolean) {
    this.built.choice.isComputerGenerated = isComputerPick;
    return this;
  }

  joker(isJoker: boolean) {
    this.built.hasJoker = isJoker;
    return this;
  }

  match(match: MatchBuilder) {
    this.matchBuilder = match;
    return this;
  }

  async build(): Promise<Prediction> {
    const {
      id: matchId,
      slug: matchSlug,
      season,
      gameRound,
    } = this.matchBuilder?.getMatch() as Required<Match>;
    const { id: userId } = this.getUser() as Required<User>;
    this.built.match = matchId;
    this.built.matchSlug = matchSlug;
    this.built.user = userId;
    this.built.season = season;
    this.built.gameRound = gameRound;
    const prediction = await db.Prediction.create(this.built);
    return prediction;
  }
}

class GameBuilder implements Builder<GameData> {
  private userBuilders: UserBuilder[] = [];
  private teamBuilders: TeamBuilder[] = [];
  private competitionBuilders: CompetitionBuilder[] = [];
  private seasonBuilders: SeasonBuilder[] = [];
  public users: User[] = [];
  public teams: Team[] = [];
  public competitions: Competition[] = [];
  public seasons: Season[] = [];
  public matches: Match[] = [];
  public predictions: Prediction[] = [];

  withUsers(...users: UserBuilder[]) {
    this.userBuilders = users;
    return this;
  }

  withTeams(...teams: TeamBuilder[]) {
    this.teamBuilders = teams;
    return this;
  }

  withCompetitions(...competitions: CompetitionBuilder[]) {
    this.competitionBuilders = competitions;
    return this;
  }

  withSeasons(...seasons: SeasonBuilder[]) {
    this.seasonBuilders = seasons;
    return this;
  }

  private clearGameData() {
    this.users = [];
    this.teams = [];
    this.competitions = [];
    this.seasons = [];
    this.matches = [];
    this.predictions = [];
  }

  async build(): Promise<Game> {
    this.users = await Promise.all(
      this.userBuilders.map(async builder => {
        const user = await builder.build();
        return user;
      }),
    );

    this.teams = await Promise.all(
      this.teamBuilders.map(async builder => {
        const team = await builder.build();
        return team;
      }),
    );

    this.competitions = await Promise.all(
      this.competitionBuilders.map(async builder => {
        const competition = await builder.build();
        return competition;
      }),
    );

    this.seasons = await Promise.all(
      this.seasonBuilders.map(async builder => {
        const season = await builder.build();
        return season;
      }),
    );

    const game = new GameData({
      users: this.users,
      teams: this.teams,
      competitions: this.competitions,
      seasons: this.seasons,
      matches: this.matches,
      predictions: this.predictions,
    });

    this.clearGameData();

    return game;
  }
}

class a {
  static game = new GameBuilder();

  static get competition() {
    return new CompetitionBuilder();
  }

  static get season() {
    return new SeasonBuilder(a.game);
  }

  static get team() {
    return new TeamBuilder();
  }

  static get match() {
    return new MatchBuilder();
  }

  static get user() {
    return new UserBuilder();
  }

  static get prediction() {
    return new PredictionBuilder();
  }
}

export default a;
