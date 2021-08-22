import db from '../db';
import {
  Competition,
  Season,
  User,
  Team,
  GameRound,
  Match,
  Prediction,
} from '../db/models';
import { MatchStatus } from '../db/models/match.model';
import { compact, flatMap } from 'lodash'

interface Game {
  users: User[];
  teams: Team[];
  competitions: Competition[];
  seasons: Season[];
  gameRounds: GameRound[];
  matches: Match[];
  predictions: Prediction[];
}

export class GameData {
  users: User[];
  teams: Team[];
  competitions: Competition[];
  seasons: Season[];
  gameRounds: GameRound[];
  matches: Match[];
  predictions: Prediction[];
  constructor({
    users,
    teams,
    competitions,
    seasons,
    gameRounds,
    matches,
    predictions,
  }: Game) {
    this.users = users;
    this.teams = teams;
    this.competitions = competitions;
    this.seasons = seasons;
    this.gameRounds = gameRounds;
    this.matches = matches;
    this.predictions = predictions;
  }
}

interface Builder<T> {
  build(): Promise<T>;
}

class CompetitionBuilder implements Builder<Competition> {
  private built = {} as Competition;
  public competition?: Competition;

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

  async build(): Promise<Competition> {
    this.competition = await db.Competition.create(this.built);
    return this.competition;
  }
}

class TeamBuilder implements Builder<Team> {
  private built = {} as Team;
  public team?: Team;

  name(value: string) {
    this.built.name = value;
    return this;
  }

  slug(value: string) {
    this.built.slug = value;
    return this;
  }

  async build(): Promise<Team> {
    this.team = await db.Team.create(this.built);
    return this.team;
  }
}

class UserBuilder implements Builder<User> {
  private built = {} as User;
  public user?: User;

  username(value: string) {
    this.built.username = value;
    return this;
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

class GameRoundBuilder implements Builder<GameRound> {
  private built = {} as GameRound;
  private seasonBuilder?: SeasonBuilder;
  public gameRound?: GameRound;

  name(value: string) {
    this.built.name = value;
    return this;
  }

  position(value: number) {
    this.built.position = value;
    return this;
  }

  withSeason(seasonBuilder: SeasonBuilder) {
    this.seasonBuilder = seasonBuilder;
    return this;
  }

  get season(): Season {
    return this.seasonBuilder?.season!;
  }

  async build(): Promise<GameRound> {
    this.built.season = this.season?.id;

    this.gameRound = await db.GameRound.create(this.built);
    return this.gameRound;
  }
}

class SeasonBuilder implements Builder<Season> {
  private built = {} as Season;
  private competitionBuilder?: CompetitionBuilder;
  private teamBuilders: TeamBuilder[] = [];
  private gameRoundBuilders: GameRoundBuilder[] = [];
  private matchBuilders: MatchBuilder[] = [];
  public season?: Season;

  constructor() {}

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

  externalReference(value: any) {
    this.built.externalReference = value;
    return this;
  }

  withCompetition = (competitionBuilder: CompetitionBuilder) => {
    this.competitionBuilder = competitionBuilder;
    return this;
  }

  get competition(): Competition {
    return this.competitionBuilder?.competition!;
  }

  withTeams(...teamBuilders: TeamBuilder[]) {
    this.teamBuilders = teamBuilders;
    return this;
  }

  get teams(): Team[] {
    return compact(this.teamBuilders.map(n => n.team!));
  }

  withGameRounds(...gameRoundBuilders: GameRoundBuilder[]) {
    gameRoundBuilders.forEach(builder => builder.withSeason(this))
    this.gameRoundBuilders = gameRoundBuilders;
    return this;
  }

  get gameRounds(): GameRound[] {
    return compact(this.gameRoundBuilders.map(n => n.gameRound!));
  }

  withMatches(...matchBuilders: MatchBuilder[]) {
    matchBuilders.forEach(builder => builder.withSeason(this))
    this.matchBuilders = matchBuilders;
    return this;
  }

  get matches(): Match[] {
    return compact(this.matchBuilders.map(n => n.match!));
  }

  get predictions(): Prediction[] {
    return flatMap(this.matchBuilders.map(n => n.predictions));
  }

  async build(): Promise<Season> {
    if (this.competition == null) {
      await this.competitionBuilder?.build()!;
    }
    this.built.competition = {
      name: this.competition?.name!,
      slug: this.competition?.slug!,
      id: this.competition?.id!,
    };

    if (this.teams.length == 0) {
      await Promise.all(
        this.teamBuilders.map(async builder => {
          return await builder.build();
        }),
      );
    }
    this.built.teams = this.teams.map(n => n.id!);
    this.season = await db.Season.create(this.built);

    await Promise.all(
      this.gameRoundBuilders.map(async builder => {
        return await builder.build();
      })
    )

    await Promise.all(
      this.matchBuilders.map(async builder => {
        return await builder.build();
      }),
    );

    return this.season;
  }
}

class MatchBuilder implements Builder<Match> {
  private built = {
    status: MatchStatus.SCHEDULED,
  } as Match;
  private seasonBuilder?: SeasonBuilder;
  private gameRoundBuilder?: GameRoundBuilder;
  private homeTeamBuilder?: TeamBuilder;
  private awayTeamBuilder?: TeamBuilder;
  private predictionBuilders: PredictionBuilder[] = [];
  public match?: Match;

  status(value: MatchStatus) {
    this.built.status = value;
    return this;
  }

  date(value: any) {
    this.built.date = value;
    return this;
  }

  withSeason(seasonBuilder: SeasonBuilder) {
    this.seasonBuilder = seasonBuilder;
    return this;
  }

  get season(): Season {
    return this.seasonBuilder?.season!;
  }

  withGameRound(gameRoundBuilder: GameRoundBuilder) {
    this.gameRoundBuilder = gameRoundBuilder;
    return this;
  }

  get gameRound(): GameRound {
    return this.gameRoundBuilder?.gameRound!;
  }

  withHomeTeam(teamBuilder: TeamBuilder) {
    this.homeTeamBuilder = teamBuilder;
    return this;
  }

  get homeTeam(): Team {
    return this.homeTeamBuilder?.team!;
  }

  withAwayTeam(teamBuilder: TeamBuilder) {
    this.awayTeamBuilder = teamBuilder;
    return this;
  }

  get awayTeam(): Team {
    return this.awayTeamBuilder?.team!;
  }

  withPredictions(...predictionBuilders: PredictionBuilder[]) {
    this.predictionBuilders = predictionBuilders;
    return this;
  }

  get predictions(): Prediction[] {
    return compact(this.predictionBuilders.map(n => n.prediction!))
  }

  async build(): Promise<Match> {
    this.built.season = this.season?.id;
    const { name: homeTeamName, id: homeTeamId, slug: homeTeamSlug, crestUrl: homeTeamCrestUrl } = this.homeTeam;
    this.built.homeTeam = { id: homeTeamId!, name: homeTeamName, slug: homeTeamSlug!, crestUrl: homeTeamCrestUrl! };

    const { name: awayTeamName, id: awayTeamId, slug: awayTeamSlug, crestUrl: awayTeamCrestUrl } = this.awayTeam;
    this.built.awayTeam = { id: awayTeamId!, name: awayTeamName, slug: awayTeamSlug!, crestUrl: awayTeamCrestUrl! };

    this.built.slug = `${this.built.homeTeam?.slug}-${this.built.homeTeam?.slug}`;
    this.built.gameRound = this.gameRound.id;
    this.match = await db.Match.create(this.built);

    await Promise.all(
      this.predictionBuilders.map(async builder => {
        return await builder.build();
      }),
    );

    return this.match;
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
  public prediction?: Prediction;

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

  withUser(userBuilder: UserBuilder) {
    this.userBuilder = userBuilder;
    return this;
  }

  get user(): User {
    return this.userBuilder?.user!;
  }

  withMatch(matchBuilder: MatchBuilder) {
    this.matchBuilder = matchBuilder;
    return this;
  }

  get match(): Match {
    return this.matchBuilder?.match!;
  }

  async build(): Promise<Prediction> {
    if (this.match == null) {
      await this.matchBuilder?.build();
    }

    if (this.user == null) {
      await this.userBuilder?.build();
    }

    const {
      id: matchId,
      slug: matchSlug,
      season,
      gameRound,
    } = this.match as Required<Match>;

    const { id: userId } = this.user as Required<User>;
    this.built.match = matchId;
    this.built.matchSlug = matchSlug;
    this.built.user = userId;
    this.built.season = season;
    this.built.gameRound = gameRound;

    this.prediction = await db.Prediction.create(this.built);
    return this.prediction;
  }
}

export class GameBuilder implements Builder<GameData> {
  private userBuilders: UserBuilder[] = [];
  private teamBuilders: TeamBuilder[] = [];
  private competitionBuilders: CompetitionBuilder[] = [];
  private seasonBuilders: SeasonBuilder[] = [];

  withUsers(...userBuilders: UserBuilder[]) {
    this.userBuilders = userBuilders;
    return this;
  }

  get users(): User[] {
    return compact(this.userBuilders.map(n => n.user!));
  }

  withTeams(...teamBuilders: TeamBuilder[]) {
    this.teamBuilders = teamBuilders;
    return this;
  }

  get teams(): Team[] {
    return compact(this.teamBuilders.map(n => n.team!))
  }

  withCompetitions(...competitionBuilders: CompetitionBuilder[]) {
    this.competitionBuilders = competitionBuilders;
    return this;
  }

  get competitions(): Competition[] {
    return compact(this.competitionBuilders.map(n => n.competition!));
  }

  withSeasons(...seasonBuilders: SeasonBuilder[]) {
    this.seasonBuilders = seasonBuilders;
    return this;
  }

  get seasons(): Season[] {
    return compact(this.seasonBuilders.map(n => n.season!));
  }

  get gameRounds(): GameRound[] {
    return flatMap(this.seasonBuilders.map(n => n.gameRounds));
  }

  get matches(): Match[] {
    return flatMap(this.seasonBuilders.map(n => n.matches))
  }

  get predictions(): Prediction[] {
    return flatMap(this.seasonBuilders.map(n => n.predictions));
  }

  async build(): Promise<Game> {
    await Promise.all(
      this.userBuilders.map(async builder => {
        return await builder.build();
      }),
    );

    await Promise.all(
      this.teamBuilders.map(async builder => {
        return await builder.build();
      }),
    );

    await Promise.all(
      this.competitionBuilders.map(async builder => {
        return await builder.build();
      }),
    );

    await Promise.all(
      this.seasonBuilders.map(async builder => {
        return await builder.build();
      }),
    );

    const game = new GameData({
      users: this.users,
      teams: this.teams,
      competitions: this.competitions,
      seasons: this.seasons,
      gameRounds: this.gameRounds,
      matches: this.matches,
      predictions: this.predictions,
    });

    return game;
  }
}

class a {
  static get game() {
    return new GameBuilder();
  }

  static get competition() {
    return new CompetitionBuilder();
  }

  static get season() {
    return new SeasonBuilder();
  }

  static get gameRound() {
    return new GameRoundBuilder();
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
