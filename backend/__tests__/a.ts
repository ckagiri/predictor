import { compact, flatMap } from 'lodash';

import db from '../db';
import {
  Competition,
  GameRound,
  Leaderboard,
  Match,
  Prediction,
  Season,
  Team,
  User,
} from '../db/models';
import { MatchStatus } from '../db/models/match.model';
interface Builder<T> {
  build(): Promise<T>;
}

const a = {
  get competition() {
    return new CompetitionBuilder();
  },

  get game() {
    return new GameBuilder();
  },

  get gameRound() {
    return new GameRoundBuilder();
  },

  get leaderboard() {
    return new LeaderboardBuilder();
  },

  get match() {
    return new MatchBuilder();
  },

  get prediction() {
    return new PredictionBuilder();
  },

  get season() {
    return new SeasonBuilder();
  },

  get team() {
    return new TeamBuilder();
  },

  get user() {
    return new UserBuilder();
  },
};

class CompetitionBuilder implements Builder<Competition> {
  private data = {} as Competition;
  public competition?: Competition;

  get id() {
    return this.competition?.id!;
  }

  async build(): Promise<Competition> {
    this.competition = (await db.Competition.create(this.data)).toObject();
    return this.competition;
  }

  setCode(value: string) {
    this.data.code = value;
    return this;
  }

  setName(value: string) {
    this.data.name = value;
    return this;
  }

  setSlug(value: string) {
    this.data.slug = value;
    return this;
  }
}

class GameRoundBuilder implements Builder<GameRound> {
  private data = {} as GameRound;
  public gameRound?: GameRound;

  get id() {
    return this.gameRound?.id!;
  }

  async build(): Promise<GameRound> {
    this.gameRound = (await db.GameRound.create(this.data)).toObject();
    return this.gameRound;
  }

  setName(value: string) {
    this.data.name = value;
    return this;
  }

  setPosition(value: number) {
    this.data.position = value;
    return this;
  }

  setSlug(value: string) {
    this.data.slug = value;
    return this;
  }

  setSeasonId(id: string) {
    this.data.season = id;
  }
}

class LeaderboardBuilder implements Builder<Leaderboard> {
  private data = {} as Leaderboard;
  private gameRoundBuilder?: GameRoundBuilder;
  private seasonBuilder?: SeasonBuilder;

  public leaderboard?: Leaderboard;

  get id() {
    return this.leaderboard?.id!;
  }

  get gameRound(): GameRound {
    return this.gameRoundBuilder?.gameRound!;
  }

  get season(): Season {
    return this.seasonBuilder?.season!;
  }

  async build(): Promise<Leaderboard> {
    this.data.season = this.season.id!;
    this.data.gameRound = this.gameRound.id;

    this.leaderboard = (await db.Leaderboard.create(this.data)).toObject();
    return this.leaderboard;
  }

  setSeasonId(id: string) {
    this.data.season = id;
  }

  setBoardType(boardType: any) {
    this.data.boardType = boardType;
    return this;
  }

  withGameRound(gameRoundBuilder: GameRoundBuilder) {
    this.gameRoundBuilder = gameRoundBuilder;
    return this;
  }

  withSeason(seasonBuilder: SeasonBuilder) {
    this.seasonBuilder = seasonBuilder;
    return this;
  }
}

class MatchBuilder implements Builder<Match> {
  private data = {
    result: {
      goalsAwayTeam: 0,
      goalsHomeTeam: 0,
    },
    status: MatchStatus.SCHEDULED,
  } as Match;
  private gameRoundBuilder?: GameRoundBuilder;
  private homeTeamBuilder?: TeamBuilder;
  private awayTeamBuilder?: TeamBuilder;
  private predictionBuilders: PredictionBuilder[] = [];

  public match?: Match;

  get awayTeam(): Team {
    return this.awayTeamBuilder?.team!;
  }

  get gameRound(): GameRound {
    return this.gameRoundBuilder?.gameRound!;
  }

  get homeTeam(): Team {
    return this.homeTeamBuilder?.team!;
  }

  get id() {
    return this.match?.id!;
  }

  get slug() {
    return this.match?.slug!;
  }

  get predictions(): Prediction[] {
    return compact(this.predictionBuilders.map(n => n.prediction!));
  }

  async build(): Promise<Match> {
    const {
      crestUrl: homeTeamCrestUrl,
      id: homeTeamId,
      name: homeTeamName,
      slug: homeTeamSlug,
    } = this.homeTeam;
    this.data.homeTeam = {
      crestUrl: homeTeamCrestUrl!,
      id: homeTeamId!,
      name: homeTeamName!,
      slug: homeTeamSlug!,
    };

    const {
      crestUrl: awayTeamCrestUrl,
      id: awayTeamId,
      name: awayTeamName,
      slug: awayTeamSlug,
    } = this.awayTeam;
    this.data.awayTeam = {
      crestUrl: awayTeamCrestUrl!,
      id: awayTeamId!,
      name: awayTeamName!,
      slug: awayTeamSlug!,
    };

    this.data.slug = `${this.data.homeTeam.slug}-${this.data.awayTeam.slug}`;
    this.data.gameRound = this.gameRound.id!;
    this.match = (await db.Match.create(this.data)).toObject();

    await Promise.all(
      this.predictionBuilders.map(async builder => {
        builder.setSeasonId(this.data.season);
        builder.setMatchId(this.id);
        builder.setMatchSlug(this.slug);
        await builder.build();
      })
    );

    return this.match;
  }

  setSeasonId(id: string) {
    this.data.season = id;
  }

  setAwayScore(awayScore: number) {
    this.data.result!.goalsAwayTeam = awayScore;
    return this;
  }

  setDate(value: any) {
    this.data.utcDate = value;
    return this;
  }

  setHomeScore(homeScore: number) {
    this.data.result!.goalsHomeTeam = homeScore;
    return this;
  }

  setStatus(value: MatchStatus) {
    this.data.status = value;
    return this;
  }

  withAwayTeam(teamBuilder: TeamBuilder) {
    this.awayTeamBuilder = teamBuilder;
    return this;
  }

  withGameRound(gameRoundBuilder: GameRoundBuilder) {
    this.gameRoundBuilder = gameRoundBuilder;
    return this;
  }

  withHomeTeam(teamBuilder: TeamBuilder) {
    this.homeTeamBuilder = teamBuilder;
    return this;
  }

  withPredictions(...predictionBuilders: PredictionBuilder[]) {
    this.predictionBuilders = predictionBuilders;
    return this;
  }
}

class PredictionBuilder implements Builder<Prediction> {
  private data = {
    choice: {
      goalsAwayTeam: 0,
      goalsHomeTeam: 0,
      isComputerGenerated: false,
    },
    hasJoker: false,
    jokerAutoPicked: false,
    match: '',
    season: '',
    status: 'PENDING',
    user: '',
  } as Prediction;
  private userBuilder?: UserBuilder;

  public prediction?: Prediction;

  get id() {
    return this.prediction?.id!;
  }

  get user(): User {
    return this.userBuilder?.user!;
  }

  async build(): Promise<Prediction> {
    const { id: userId } = this.user as Required<User>;
    this.data.user = userId;

    if (this.userBuilder) {
      await this.userBuilder.build();
    }

    this.prediction = (await db.Prediction.create(this.data)).toObject();
    return this.prediction;
  }

  setMatchId(id: string) {
    this.data.match = id;
  }

  setMatchSlug(slug: string | undefined) {
    this.data.matchSlug = slug;
  }

  setSeasonId(id: string) {
    this.data.season = id;
  }

  setAwayScore(awayScore: number) {
    this.data.choice.goalsAwayTeam = awayScore;
    return this;
  }

  setComputerPick(isComputerPick: boolean) {
    this.data.choice.isComputerGenerated = isComputerPick;
    return this;
  }

  setHomeScore(homeScore: number) {
    this.data.choice.goalsHomeTeam = homeScore;
    return this;
  }

  setJoker(isJoker: boolean) {
    this.data.hasJoker = isJoker;
    return this;
  }

  withUser(userBuilder: UserBuilder) {
    this.userBuilder = userBuilder;
    return this;
  }
}

class SeasonBuilder implements Builder<Season> {
  private data = {} as Season;
  private competitionBuilder?: CompetitionBuilder;
  private gameRoundBuilders: GameRoundBuilder[] = [];
  private leaderboardBuilders: LeaderboardBuilder[] = [];
  private matchBuilders: MatchBuilder[] = [];
  private teamBuilders: TeamBuilder[] = [];

  public season?: Season;

  get competition(): Competition | undefined {
    return this.competitionBuilder?.competition;
  }

  get gameRounds(): GameRound[] {
    return compact(this.gameRoundBuilders.map(n => n.gameRound!));
  }

  get leaderboards(): Leaderboard[] {
    return compact(this.leaderboardBuilders.map(n => n.leaderboard));
  }

  get matches(): Match[] {
    return compact(this.matchBuilders.map(n => n.match!));
  }

  get predictions(): Prediction[] {
    return flatMap(this.matchBuilders.map(n => n.predictions));
  }

  get id() {
    return this.season?.id!;
  }

  get slug() {
    return this.season?.slug;
  }

  get teams(): Team[] {
    return compact(this.teamBuilders.map(n => n.team));
  }

  async build(): Promise<Season> {
    if (!this.competitionBuilder?.competition) {
      await this.competitionBuilder?.build();
    }

    const { id, name, slug } = this.competition as Required<Competition>;
    this.data.competition = { id, name, slug };

    if (this.teams.length === 0) {
      await Promise.all(
        this.teamBuilders.map(async builder => {
          await builder.build();
        })
      );
    }

    this.data.teams = compact(this.teams.map(n => n.id));
    this.season = (await db.Season.create(this.data)).toObject();

    await Promise.all(
      this.gameRoundBuilders.map(async builder => {
        builder.setSeasonId(this.id);
        await builder.build();
      })
    );

    await Promise.all(
      this.matchBuilders.map(async builder => {
        builder.setSeasonId(this.id);
        await builder.build();
      })
    );

    await Promise.all(
      this.leaderboardBuilders.map(async builder => {
        builder.setSeasonId(this.id);
        await builder.build();
      })
    );

    return this.season;
  }

  setCurrentMatchday(value: number) {
    this.data.currentMatchday = value;
    return this;
  }

  setExternalReference(value: any) {
    this.data.externalReference = value;
    return this;
  }

  setName(value: string) {
    this.data.name = value;
    return this;
  }

  setSeasonEnd(value: string) {
    this.data.seasonEnd = value;
    return this;
  }

  setSeasonStart(value: string) {
    this.data.seasonStart = value;
    return this;
  }

  setSlug(value: string) {
    this.data.slug = value;
    return this;
  }

  setYear(value: number) {
    this.data.year = value;
    return this;
  }

  withCompetition = (competitionBuilder: CompetitionBuilder) => {
    this.competitionBuilder = competitionBuilder;
    return this;
  };

  withGameRounds(...gameRoundBuilders: GameRoundBuilder[]) {
    this.gameRoundBuilders = gameRoundBuilders;
    return this;
  }

  withLeaderboards(...leaderboardBuilders: LeaderboardBuilder[]) {
    this.leaderboardBuilders = leaderboardBuilders;
    return this;
  }

  withMatches(...matchBuilders: MatchBuilder[]) {
    this.matchBuilders = matchBuilders;
    return this;
  }

  withTeams(...teamBuilders: TeamBuilder[]) {
    this.teamBuilders = teamBuilders;
    return this;
  }
}

class TeamBuilder implements Builder<Team> {
  private data = { name: '' } as Team;
  public team?: Team;

  get id() {
    return this.team?.id!;
  }

  get slug() {
    return this.team?.slug!;
  }

  get tla() {
    return this.team?.tla!;
  }

  async build(): Promise<Team> {
    this.team = (await db.Team.create(this.data)).toObject();
    return this.team;
  }

  setName(value: string) {
    this.data.name = value;
    return this;
  }

  setShortName(value: string) {
    this.data.shortName = value;
    return this;
  }

  setSlug(value: string) {
    this.data.slug = value;
    return this;
  }

  setTla(value: string) {
    this.data.tla = value;
    return this;
  }
}

class UserBuilder implements Builder<User> {
  private data = {} as User;
  public user?: User;

  get id() {
    return this.user?.id!;
  }

  async build(): Promise<User> {
    this.user = (await db.User.create(this.data)).toObject();
    return this.user;
  }

  setUsername(value: string) {
    this.data.username = value;
    return this;
  }
}

export class GameBuilder implements Builder<GameData> {
  private competitionBuilders: CompetitionBuilder[] = [];
  private seasonBuilders: SeasonBuilder[] = [];
  private teamBuilders: TeamBuilder[] = [];
  private userBuilders: UserBuilder[] = [];

  get competitions(): Competition[] {
    return compact(this.competitionBuilders.map(n => n.competition!));
  }

  get gameRounds(): GameRound[] {
    return flatMap(this.seasonBuilders.map(n => n.gameRounds));
  }

  get leaderboards(): Leaderboard[] {
    return flatMap(this.seasonBuilders.map(n => n.leaderboards));
  }

  get matches(): Match[] {
    return flatMap(this.seasonBuilders.map(n => n.matches));
  }

  get predictions(): Prediction[] {
    return flatMap(this.seasonBuilders.map(n => n.predictions));
  }

  get seasons(): Season[] {
    return compact(this.seasonBuilders.map(n => n.season!));
  }

  get teams(): Team[] {
    return compact(this.teamBuilders.map(n => n.team!));
  }

  get users(): User[] {
    return compact(this.userBuilders.map(n => n.user!));
  }

  async build(): Promise<GameData> {
    await Promise.all(
      this.userBuilders.map(async builder => {
        await builder.build();
      })
    );

    await Promise.all(
      this.teamBuilders.map(async builder => {
        await builder.build();
      })
    );

    await Promise.all(
      this.competitionBuilders.map(async builder => {
        await builder.build();
      })
    );

    await Promise.all(
      this.seasonBuilders.map(async builder => {
        await builder.build();
      })
    );

    const game = new GameData({
      competitions: this.competitions,
      gameRounds: this.gameRounds,
      leaderboards: this.leaderboards,
      matches: this.matches,
      predictions: this.predictions,
      seasons: this.seasons,
      teams: this.teams,
      users: this.users,
    });

    return game;
  }

  withCompetitions(...competitionBuilders: CompetitionBuilder[]) {
    this.competitionBuilders = competitionBuilders;
    return this;
  }

  withSeasons(...seasonBuilders: SeasonBuilder[]) {
    this.seasonBuilders = seasonBuilders;
    return this;
  }

  withTeams(...teamBuilders: TeamBuilder[]) {
    this.teamBuilders = teamBuilders;
    return this;
  }

  withUsers(...userBuilders: UserBuilder[]) {
    this.userBuilders = userBuilders;
    return this;
  }
}

export class GameData {
  competitions: Competition[];
  gameRounds: GameRound[];
  leaderboards: Leaderboard[];
  matches: Match[];
  predictions: Prediction[];
  seasons: Season[];
  teams: Team[];
  users: User[];
  constructor({
    competitions,
    gameRounds,
    leaderboards,
    matches,
    predictions,
    seasons,
    teams,
    users,
  }: GameData) {
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

export default a;
