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

interface Game {
  competitions: Competition[];
  gameRounds: GameRound[];
  leaderboards: Leaderboard[];
  matches: Match[];
  predictions: Prediction[];
  seasons: Season[];
  teams: Team[];
  users: User[];
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
  public competition?: Competition;
  get id() {
    return this.competition?.id!;
  }

  private data = {} as Competition;

  async build(): Promise<Competition> {
    this.competition = await db.Competition.create(this.data);
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
  public gameRound?: GameRound;
  get id() {
    return this.gameRound?.id!;
  }
  get season(): Season {
    return this.seasonBuilder?.season!;
  }

  private data = {} as GameRound;

  private seasonBuilder?: SeasonBuilder;

  async build(): Promise<GameRound> {
    this.data.season = this.season.id!;

    this.gameRound = await db.GameRound.create(this.data);
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

  withSeason(seasonBuilder: SeasonBuilder) {
    this.seasonBuilder = seasonBuilder;
    return this;
  }
}

class LeaderboardBuilder implements Builder<Leaderboard> {
  public leaderboard?: Leaderboard;
  get gameRound(): GameRound {
    return this.gameRoundBuilder?.gameRound!;
  }
  get id() {
    return this.leaderboard?.id!;
  }
  get season(): Season {
    return this.seasonBuilder?.season!;
  }

  private data = {} as Leaderboard;

  private gameRoundBuilder?: GameRoundBuilder;

  private seasonBuilder?: SeasonBuilder;

  async build(): Promise<Leaderboard> {
    this.data.season = this.season.id!;

    this.data.gameRound = this.gameRound.id;

    this.leaderboard = await db.Leaderboard.create(this.data);
    return this.leaderboard;
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
  get predictions(): Prediction[] {
    return compact(this.predictionBuilders.map(n => n.prediction!));
  }
  get season(): Season {
    return this.seasonBuilder?.season!;
  }

  get slug() {
    return this.match?.slug!;
  }

  private awayTeamBuilder?: TeamBuilder;

  private data = {
    result: {
      goalsAwayTeam: 0,
      goalsHomeTeam: 0,
    },
    status: MatchStatus.SCHEDULED,
  } as Match;

  private gameRoundBuilder?: GameRoundBuilder;

  private homeTeamBuilder?: TeamBuilder;

  private predictionBuilders: PredictionBuilder[] = [];

  private seasonBuilder?: SeasonBuilder;

  async build(): Promise<Match> {
    this.data.season = this.season.id!;
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
    this.match = await db.Match.create(this.data).then(m => m.toObject());

    await Promise.all(
      this.predictionBuilders.map(async builder => {
        return await builder.build();
      })
    );

    return this.match;
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
    predictionBuilders.forEach(builder => builder.withMatch(this));
    this.predictionBuilders = predictionBuilders;
    return this;
  }

  withSeason(seasonBuilder: SeasonBuilder) {
    this.seasonBuilder = seasonBuilder;
    return this;
  }
}

class PredictionBuilder implements Builder<Prediction> {
  public prediction?: Prediction;
  get id() {
    return this.prediction?.id!;
  }
  get match(): Match {
    return this.matchBuilder?.match!;
  }
  get user(): User {
    return this.userBuilder?.user!;
  }

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

  private matchBuilder?: MatchBuilder;

  private userBuilder?: UserBuilder;

  async build(): Promise<Prediction> {
    if (this.matchBuilder) {
      await this.matchBuilder.build();
    }

    if (this.userBuilder) {
      await this.userBuilder.build();
    }

    const {
      id: matchId,
      season,
      slug: matchSlug,
    } = this.match as Required<Match>;

    const { id: userId } = this.user as Required<User>;
    this.data.match = matchId;
    this.data.matchSlug = matchSlug;
    this.data.season = season;
    this.data.user = userId;

    this.prediction = await db.Prediction.create(this.data).then(p =>
      p.toObject()
    );
    return this.prediction;
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

  withMatch(matchBuilder: MatchBuilder) {
    this.matchBuilder = matchBuilder;
    return this;
  }

  withUser(userBuilder: UserBuilder) {
    this.userBuilder = userBuilder;
    return this;
  }
}

class SeasonBuilder implements Builder<Season> {
  public season?: Season;
  get competition(): Competition {
    return this.competitionBuilder?.competition!;
  }
  get gameRounds(): GameRound[] {
    return compact(this.gameRoundBuilders.map(n => n.gameRound!));
  }
  get id() {
    return this.season?.id!;
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

  get slug() {
    return this.season?.slug;
  }

  get teams(): Team[] {
    return compact(this.teamBuilders.map(n => n.team!));
  }

  private competitionBuilder?: CompetitionBuilder;

  private data = {} as Season;

  private gameRoundBuilders: GameRoundBuilder[] = [];

  private leaderboardBuilders: LeaderboardBuilder[] = [];

  private matchBuilders: MatchBuilder[] = [];

  private teamBuilders: TeamBuilder[] = [];

  async build(): Promise<Season> {
    if (this.competitionBuilder && !this.competitionBuilder.competition) {
      await this.competitionBuilder.build();
    }
    this.data.competition = {
      id: this.competition.id!,
      name: this.competition.name,
      slug: this.competition.slug,
    };

    if (this.teams.length == 0) {
      await Promise.all(
        this.teamBuilders.map(async builder => {
          return await builder.build();
        })
      );
    }
    this.data.teams = this.teams.map(n => n.id!);
    this.season = await db.Season.create(this.data);

    await Promise.all(
      this.gameRoundBuilders.map(async builder => {
        return await builder.build();
      })
    );

    await Promise.all(
      this.matchBuilders.map(async builder => {
        return await builder.build();
      })
    );

    await Promise.all(
      this.leaderboardBuilders.map(async builder => {
        return await builder.build();
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
    gameRoundBuilders.forEach(builder => builder.withSeason(this));
    this.gameRoundBuilders = gameRoundBuilders;
    return this;
  }

  withLeaderboards(...leaderboardBuilders: LeaderboardBuilder[]) {
    leaderboardBuilders.forEach(builder => builder.withSeason(this));
    this.leaderboardBuilders = leaderboardBuilders;
    return this;
  }

  withMatches(...matchBuilders: MatchBuilder[]) {
    matchBuilders.forEach(builder => builder.withSeason(this));
    this.matchBuilders = matchBuilders;
    return this;
  }

  withTeams(...teamBuilders: TeamBuilder[]) {
    this.teamBuilders = teamBuilders;
    return this;
  }
}

class TeamBuilder implements Builder<Team> {
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

  private data = { name: '' } as Team;

  async build(): Promise<Team> {
    this.team = await db.Team.create(this.data).then(t => t.toObject());
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
  public user?: User;
  get id() {
    return this.user?.id!;
  }

  private data = {} as User;

  async build(): Promise<User> {
    this.user = await db.User.create(this.data);
    return this.user;
  }

  setUsername(value: string) {
    this.data.username = value;
    return this;
  }
}

export class GameBuilder implements Builder<GameData> {
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

  private competitionBuilders: CompetitionBuilder[] = [];

  private seasonBuilders: SeasonBuilder[] = [];

  private teamBuilders: TeamBuilder[] = [];

  private userBuilders: UserBuilder[] = [];

  async build(): Promise<Game> {
    await Promise.all(
      this.userBuilders.map(async builder => {
        return await builder.build();
      })
    );

    await Promise.all(
      this.teamBuilders.map(async builder => {
        return await builder.build();
      })
    );

    await Promise.all(
      this.competitionBuilders.map(async builder => {
        return await builder.build();
      })
    );

    await Promise.all(
      this.seasonBuilders.map(async builder => {
        return await builder.build();
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

export default a;
