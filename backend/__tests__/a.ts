import db from '../db';
import {
  Competition,
  Season,
  User,
  Team,
  GameRound,
  Match,
  Prediction,
  Leaderboard
} from '../db/models';
import { MatchStatus } from '../db/models/match.model';
import { compact, flatMap } from 'lodash'
import { ScorePoints, Score } from '../common/score';
interface Game {
  users: User[];
  teams: Team[];
  competitions: Competition[];
  seasons: Season[];
  gameRounds: GameRound[];
  matches: Match[];
  predictions: Prediction[];
  leaderboards: Leaderboard[];
}

export class GameData {
  users: User[];
  teams: Team[];
  competitions: Competition[];
  seasons: Season[];
  gameRounds: GameRound[];
  matches: Match[];
  predictions: Prediction[];
  leaderboards: Leaderboard[];
  constructor({
    users,
    teams,
    competitions,
    seasons,
    gameRounds,
    matches,
    predictions,
    leaderboards
  }: Game) {
    this.users = users;
    this.teams = teams;
    this.competitions = competitions;
    this.seasons = seasons;
    this.gameRounds = gameRounds;
    this.matches = matches;
    this.predictions = predictions;
    this.leaderboards = leaderboards;
  }
}

interface Builder<T> {
  build(): Promise<T>;
}

class CompetitionBuilder implements Builder<Competition> {
  private built = {} as Competition;
  public competition?: Competition;

  get id() {
    return this.competition?.id!;
  }

  setName(value: string) {
    this.built.name = value;
    return this;
  }

  setCode(value: string) {
    this.built.code = value;
    return this;
  }

  setSlug(value: string) {
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

  get id() {
    return this.team?.id!;
  }

  get slug() {
    return this.team?.slug!;
  }

  setName(value: string) {
    this.built.name = value;
    return this;
  }

  setSlug(value: string) {
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

  get id() {
    return this.user?.id!;
  }

  setUsername(value: string) {
    this.built.username = value;
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

  get id() {
    return this.gameRound?.id!;
  }

  setName(value: string) {
    this.built.name = value;
    return this;
  }

  setSlug(value: string) {
    this.built.slug = value;
    return this;
  }

  setPosition(value: number) {
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
  private leaderboardBuilders: LeaderboardBuilder[] = [];
  public season?: Season;

  constructor() { }

  get id() {
    return this.season?.id!;
  }

  setName(value: string) {
    this.built.name = value;
    return this;
  }

  setSlug(value: string) {
    this.built.slug = value;
    return this;
  }

  get slug() {
    return this.season?.slug;
  }

  setYear(value: number) {
    this.built.year = value;
    return this;
  }

  setSeasonStart(value: string) {
    this.built.seasonStart = value;
    return this;
  }

  setSeasonEnd(value: string) {
    this.built.seasonEnd = value;
    return this;
  }

  setCurrentMatchday(value: number) {
    this.built.currentMatchday = value;
    return this;
  }

  setExternalReference(value: any) {
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

  get leaderboards(): Leaderboard[] {
    return compact(this.leaderboardBuilders.map(n => n.leaderboard))
  }

  withLeaderboards(...leaderboardBuilders: LeaderboardBuilder[]) {
    leaderboardBuilders.forEach(builder => builder.withSeason(this))
    this.leaderboardBuilders = leaderboardBuilders;
    return this;
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

    await Promise.all(
      this.leaderboardBuilders.map(async builder => {
        return await builder.build();
      }),
    );

    return this.season;
  }
}

class MatchBuilder implements Builder<Match> {
  private built = {
    result: {
      goalsHomeTeam: 0,
      goalsAwayTeam: 0
    },
    status: MatchStatus.SCHEDULED,
  } as Match;
  private seasonBuilder?: SeasonBuilder;
  private gameRoundBuilder?: GameRoundBuilder;
  private homeTeamBuilder?: TeamBuilder;
  private awayTeamBuilder?: TeamBuilder;
  private predictionBuilders: PredictionBuilder[] = [];
  public match?: Match;

  get id() {
    return this.match?.id!;
  }

  get slug() {
    return this.match?.slug!;
  }

  setStatus(value: MatchStatus) {
    this.built.status = value;
    return this;
  }

  setDate(value: any) {
    this.built.utcDate = value;
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

  setHomeScore(homeScore: number) {
    this.built.result!.goalsHomeTeam = homeScore;
    return this;
  }

  setAwayScore(awayScore: number) {
    this.built.result!.goalsAwayTeam = awayScore;
    return this;
  }

  withPredictions(...predictionBuilders: PredictionBuilder[]) {
    predictionBuilders.forEach(builder => builder.withMatch(this))
    this.predictionBuilders = predictionBuilders;
    return this;
  }

  get predictions(): Prediction[] {
    return compact(this.predictionBuilders.map(n => n.prediction!))
  }

  async build(): Promise<Match> {
    this.built.season = this.season.id!;
    const { name: homeTeamName, id: homeTeamId, slug: homeTeamSlug, crestUrl: homeTeamCrestUrl } = this.homeTeam;
    this.built.homeTeam = { id: homeTeamId!, name: homeTeamName, slug: homeTeamSlug!, crestUrl: homeTeamCrestUrl! };

    const { name: awayTeamName, id: awayTeamId, slug: awayTeamSlug, crestUrl: awayTeamCrestUrl } = this.awayTeam;
    this.built.awayTeam = { id: awayTeamId!, name: awayTeamName, slug: awayTeamSlug!, crestUrl: awayTeamCrestUrl! };

    this.built.slug = `${this.built.homeTeam?.slug}-${this.built.awayTeam?.slug}`;
    this.built.gameRound = this.gameRound.id!;
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
    user: '',
    season: '',
    match: '',
  } as Prediction;
  private userBuilder?: UserBuilder;
  private matchBuilder?: MatchBuilder;
  public prediction?: Prediction;

  get id() {
    return this.prediction?.id!
  }

  setHomeScore(homeScore: number) {
    this.built.choice.goalsHomeTeam = homeScore;
    return this;
  }

  setAwayScore(awayScore: number) {
    this.built.choice.goalsAwayTeam = awayScore;
    return this;
  }

  setComputerPick(isComputerPick: boolean) {
    this.built.choice.isComputerGenerated = isComputerPick;
    return this;
  }

  setJoker(isJoker: boolean) {
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
      season,
      slug: matchSlug,
    } = this.match as Required<Match>;

    const { id: userId } = this.user as Required<User>;
    this.built.match = matchId;
    this.built.matchSlug = matchSlug;
    this.built.season = season;
    this.built.user = userId;

    this.prediction = await db.Prediction.create(this.built);
    return this.prediction;
  }
}

class LeaderboardBuilder implements Builder<Leaderboard> {
  private built = {} as Leaderboard;
  private seasonBuilder?: SeasonBuilder;
  private gameRoundBuilder?: GameRoundBuilder;
  public leaderboard?: Leaderboard;

  get id() {
    return this.leaderboard?.id!
  }

  setBoardType(boardType: any) {
    this.built.boardType = boardType
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

  async build(): Promise<Leaderboard> {
    this.built.season = this.season.id!;

    // check if gameRound was set to determine if we have a gameRound leaderboard
    if (this.gameRound != null) {
      this.built.gameRound = this.gameRound.id
    }

    this.leaderboard = await db.Leaderboard.create(this.built);
    return this.leaderboard
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

  get leaderboards(): Leaderboard[] {
    return flatMap(this.seasonBuilders.map(n => n.leaderboards));
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
      leaderboards: this.leaderboards
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

  static get leaderboard() {
    return new LeaderboardBuilder();
  }
}

export default a;
