import { clone, concat, first, initial, last, map, tail } from 'lodash';

import Gameday from './gameday';
import Match from './match';

export { Gameday, Match };

export function generateGameday<T>(previousGameday: Gameday<T>): Gameday<T> {
  if (!previousGameday.leftJoker) {
    return shiftToLeft(previousGameday);
  }
  return shiftToRight(previousGameday);
}

export function generateGamedays<T>(teams: T[]): Gameday<T>[] {
  const schedule: Gameday<T>[] = [];
  const firstGameday = initGameday(teams);
  schedule.push(firstGameday);
  let previousGameday = firstGameday;
  const gamedayCount = teams.length % 2 == 0 ? teams.length - 1 : teams.length;
  for (let i = 1; i < gamedayCount; i++) {
    const gameday = generateGameday(previousGameday);
    schedule.push(gameday);
    previousGameday = gameday;
  }
  return schedule;
}

export function generateSchedule<T>(teams: T[], rematch = false): Match<T>[][] {
  let schedule: Match<T>[][] = [];
  const gamedays = generateGamedays(teams);
  for (let i = 0; i < gamedays.length; i++) {
    const switchSides = i % 2 == 0;
    schedule.push(gamedayToMatchArray(gamedays[i], switchSides));
  }
  if (rematch) {
    schedule = concat(schedule, createRematchSchedule(schedule));
  }
  return schedule;
}

export function initGameday<T>(allTeams: T[]): Gameday<T> {
  const gameday = new Gameday<T>();
  const bucketCount = allTeams.length / 2 - 1;
  const rightJokerMatch = new Match<T>();
  rightJokerMatch.away = last(allTeams);
  gameday.rightJoker = rightJokerMatch;
  let teams = initial(allTeams);
  for (let i = 0; i < bucketCount; i++) {
    const firstTeam = first(teams);
    const lastTeam = last(teams);
    const match = new Match<T>();
    match.home = firstTeam;
    match.away = lastTeam;
    gameday.buckets.push(match);
    teams = initial(tail(teams));
  }
  rightJokerMatch.home = teams[0]; // assign last remaining team
  return gameday;
}

function createMatch<T>(match: Match<T>, switchSides = true): Match<T> {
  const createdMatch = clone(match);
  if (switchSides) {
    createdMatch.home = match.away;
    createdMatch.away = match.home;
  }
  return createdMatch;
}

function createRematchSchedule<T>(schedule: Match<T>[][]): Match<T>[][] {
  const rematchSchedule: Match<T>[][] = [];
  for (const matches of schedule) {
    const rematches: Match<T>[] = map(matches, match => createMatch(match));
    rematchSchedule.push(rematches);
  }
  return rematchSchedule;
}

function gamedayToMatchArray<T>(
  gameday: Gameday<T>,
  switchSides: boolean
): Match<T>[] {
  const matches: Match<T>[] = [];

  if (gameday.leftJoker) {
    const match = createMatch(gameday.leftJoker, false);
    if (match.home && match.away) {
      matches.push(match); // jokers already swept by algorithm
    }
  }
  if (gameday.rightJoker) {
    const match = createMatch(gameday.rightJoker, false);
    if (match.home && match.away) {
      matches.push(match); // jokers already swept by algorithm
    }
  }
  for (const bucketMatch of gameday.buckets) {
    const match = createMatch(bucketMatch, switchSides);
    if (match.home && match.away) {
      matches.push(match);
    }
  }
  return matches;
}

function shiftToLeft<T>(previousGameday: Gameday<T>): Gameday<T> {
  const gameday = new Gameday<T>();
  const leftJokerMatch = new Match<T>();
  leftJokerMatch.home =
    previousGameday.rightJoker && previousGameday.rightJoker.away;
  leftJokerMatch.away = previousGameday.buckets[0].home;
  gameday.leftJoker = leftJokerMatch;
  for (let i = 0; i < previousGameday.buckets.length - 1; i++) {
    const match = new Match<T>();
    match.home = previousGameday.buckets[i + 1].home;
    match.away = previousGameday.buckets[i].away;
    gameday.buckets.push(match);
  }
  const lastMatch = new Match<T>();
  lastMatch.home =
    previousGameday.rightJoker && previousGameday.rightJoker.home;
  lastMatch.away = last(previousGameday.buckets)?.away;
  gameday.buckets.push(lastMatch);
  delete gameday.rightJoker;
  return gameday;
}

function shiftToRight<T>(previousGameday: Gameday<T>): Gameday<T> {
  const gameday = new Gameday<T>();
  const rightJokerMatch = new Match<T>();
  rightJokerMatch.home = last(previousGameday.buckets)?.away;
  rightJokerMatch.away =
    previousGameday.leftJoker && previousGameday.leftJoker.home;
  gameday.rightJoker = rightJokerMatch;
  for (let i = 1; i < previousGameday.buckets.length; i++) {
    const match = new Match<T>();
    match.away = previousGameday.buckets[i - 1].away;
    match.home = previousGameday.buckets[i].home;
    gameday.buckets.push(match);
  }
  const firstMatch = new Match<T>();
  firstMatch.home = previousGameday.buckets[0].home;
  firstMatch.away = previousGameday.leftJoker && previousGameday.leftJoker.away;
  gameday.buckets = concat([firstMatch], gameday.buckets);
  delete gameday.leftJoker;
  return gameday;
}
