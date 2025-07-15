import { gamesMap, playersMap, socksMap, sleep, makeid, createTournamentGame } from './pong';

export let playersParticipatingTourn = new Map<string, string>();

class Tournament {
  public tName : string = "";
  private adminId : string = "";
  public isItPrivate : boolean = true;
  private qfIds : Array<string> = ["", "", "", "", "", "", "", ""];
  private sfIds : Array<string> = ["", "", "", ""];
  private fIds : Array<string> = ["", ""];
  public winner : string = "";
  public Ids : Array<Array<string>> = [this.fIds, this.sfIds, this.qfIds];
  private gameQfIds : Array<string> = ["", "", "", ""];
  private gameSfIds : Array<string> = ["", ""];
  private gameFIds : Array<string> = [""];
  public gameIds : Array<Array<string>> = [this.gameFIds, this.gameSfIds, this.gameQfIds];
  public stages : number = 1;
  public currentStage : number = 1;
  public tId : string = "";
  public started : boolean = false;
  public alive : boolean = true;

  public calculateJoinedPN() {
    let count : number = 0;
    for (let player of this.Ids[this.stages - 1]) {
      if (player !== "") {
        count += 1;
      }
    }
    return count;
  }

  public addParticipant(participantId: string) {
    let i : number = 0;
    let I : number = Math.pow(2, this.stages);
    while (i < I && this.Ids[this.stages - 1][i] !== "") {
      if (this.Ids[this.stages - 1][i] === participantId) {
        throw "This player is already in";
      }
      i += 1;
    }
    if (i >= I) {
      throw "Everyone is already in";
    }
    this.Ids[this.stages - 1][i] = participantId;
    console.log("added", participantId, "to", this.tId);
  }

  constructor(tName: string, adminId: string, isItPrivate: boolean = true, playersN: number, tId: string) {
    this.tName = tName;
    this.adminId = adminId;
    this.isItPrivate = isItPrivate;
    if (playersN !== 2 && playersN !== 4 && playersN !== 8) {
      console.error("some clever bastard tried some bs rn");
      return ;
    }
    // I'm NOT doing a log_2.
    const numbs : Array<number> = [0, 1, 0, 2, 0, 0, 0, 3];
    this.stages = numbs[playersN - 1];
    this.currentStage = this.stages;
    this.addParticipant(adminId);
    this.tId = tId;
  }

  private checkEveryonePresent() {
    if (this.stages <= 0 || this.currentStage <= 0) {
      console.log("zeroth stage -- yup, everyone present");
      return true;
    }
    for (let i : number = 0; i < Math.pow(2, this.currentStage); i++) {
      if (this.Ids[this.currentStage - 1][i] === "") {
        console.log("since the player number", i, "isn't present, return false");
        return false;
      }
    }
    this.started = true;
    console.log("started = true, return true for presence");
    return true;
  }

  private gameCreator() {
    for (let i : number = 0; i < Math.pow(2, this.currentStage - 1); i++) {
      console.log("creating game", i);
      let lId = this.Ids[this.currentStage - 1][2 * i];
      let rId = this.Ids[this.currentStage - 1][2 * i + 1];
      try {
        this.gameIds[this.currentStage - 1][i] = createTournamentGame(lId, rId);
        console.log("great success in creating a game");
      }
      catch (e) {
        console.log("motherfu- got an error:", e);
        if (typeof e === "string") {
          this.gameIds[this.currentStage - 1][i] = "";
          if (e[0] === 'L') {
            this.Ids[this.currentStage - 1][2 * i] = "failed";
          }
          else {
            this.Ids[this.currentStage - 1][2 * i + 1] = "failed";
          }
        }
        else {
          console.log("ts wasn't even a string");
        }
      }
    }
  }

  private matchesStopped() {
    if (this.stages <= 0 || this.currentStage <= 0) {
      console.log("<= zero stages, YES stopped");
      return true;
    }
    console.log("gameids in matches stopped:", this.gameIds);
    for (let gameId of this.gameIds[this.currentStage - 1]) {
      console.log("checking stopped (pongDone) for", gameId);
      if (gamesMap.has(gameId)) {
        if (!gamesMap.get(gameId).pongDone) {
          console.log("nope,", gameId, "isn't done yet.");
          return false;
        }
      }
      else {
        console.log("somehow,", gameId, "not in map");
      }
    }
    return true;
  }

  private newStageFiller() {
    // we're in the next stage already, which has been -1'd. To go back one, we +1. - 1 + 1 = 0.
    let i : number = 0;
    console.log("the curstage var is", this.currentStage, "thus the finished stage was", this.currentStage - 1);
    for (let gameId of this.gameIds[this.currentStage]) {
      console.log("filling the new stage for", gameId);
      if (gamesMap.has(gameId)) {
        if (gamesMap.get(gameId).whoLost === "left fully" || gamesMap.get(gameId).whoLost === "left skip") {
          this.Ids[this.currentStage - 1][i] = gamesMap.get(gameId).RplayerId;
        }
        else if (gamesMap.get(gameId).whoLost === "right fully" || gamesMap.get(gameId).whoLost === "right skip") {
          this.Ids[this.currentStage - 1][i] = gamesMap.get(gameId).LplayerId;
        }
        else {
          this.Ids[this.currentStage - 1][i] = "failed";
        }
      }
      else {
        // in case we had a player already in a different game by that point,...
        // this is so rare and bad that no history will be considered, idk idc.
        if (this.Ids[this.currentStage][i * 2] === "failed") {
          this.Ids[this.currentStage - 1][i] = this.Ids[this.currentStage][i * 2 + 1];
        }
        else if (this.Ids[this.currentStage][i * 2 + 1] === "failed") {
          this.Ids[this.currentStage - 1][i] = this.Ids[this.currentStage][i * 2];
        }
      }
      i++;
    }
  }

  // loop checking for players in ts
  //
  // when EVERYONE is here, start all the games
  //
  // the games are started with the "tournament" mode and with a different func
  //
  // this mode also needs to make it so the players have to click confirm before starting
  //
  // also every time a runtime in tournament mode is created, a 30 second timer is started. if it passes and the enemy isn't ready yet, you can make them forefit.
  //
  // if YOU forefit, the enemy moves thru. if you both ain't ready, game dies after 60 seconds of inactivity, and places the special "failed" id on the winner
  // this id is treated as "no next game" for this next tier
  // visialization:
  //
  // 1
  //  - 1
  // 2
  //          - just start, don't wait for the failed. 3
  // 3
  //  - 3
  // 4
  //
  //                                                         - 3 vs 6 final match
  //
  // 5
  //  - 6
  // 6
  //          - 6 autowin, as in the game was already started
  // 7
  //  - failed
  // 8
  public mainLoop = async () => {
    while (this.alive) {
      console.log("tour: before everyone present");
      while (!this.checkEveryonePresent()) {
        await sleep(5e3);
      }
      console.log("tour: after everyone present, before checking for stopped");
      this.gameCreator();
      while (!this.matchesStopped()) {
        // TODO prolly this dude needs to get the info of the finished games and distribute the people, actually. idk
        console.log("waiting for matches to be stopped...");
        await sleep(5e3);
      }
      console.log("tour: after stopped");
      this.currentStage -= 1;
      if (this.currentStage <= 0) {
        console.log("tour: bye");
        this.alive = false;
        break ;
      }
      // TODO add the moving people on phase here
      this.newStageFiller();
    }
  }

  public eliminateSelf() {
    this.alive = false;
    if (this.currentStage <= 0) {
      throw "It should already be gone via the loop cleaning";
    }
    for (let user of this.Ids[this.currentStage - 1]) {
      if (playersParticipatingTourn.has(user)) {
        playersParticipatingTourn.delete(user);
        console.log("players participating delete", user, "from eliminateSelf");
      }
    }
    // TODO run thru game ids and clean ts up
  }

  public confirmPlayer(uuid: string) {
    for (let gId of this.gameIds[this.currentStage - 1]) {
      if (!gamesMap.has(gId)) {
        throw "gamesMap has no " + gId;
      }
      const runtime = gamesMap.get(gId);
      if (typeof runtime === "undefined") {
        throw "undefined game runtime";
      }
      if (runtime.LplayerId === uuid) {
        runtime.leftReady = true;
        console.log("lp", uuid, "confirmed");
        return ;
      }
      if (runtime.RplayerId === uuid) {
        runtime.rightReady = true;
        console.log("rp", uuid, "confirmed");
        return ;
      }
    }
    throw "Player not in tournament's games";
  }

  public eliminatePlayer(uuid: string) {
    console.log("beginning to eliminate", uuid);
    let forefit : boolean = false;
    let i : number = 0;
    for (let pId of this.Ids[this.currentStage - 1]) {
      if (pId === uuid) {
        this.Ids[this.currentStage - 1][i] = "";
        console.log("cleaned the appropriate Ids...");
        break ;
      }
      i++;
    }
    for (let gId of this.gameIds[this.currentStage - 1]) {
      if (gId === "") {
        continue ;
      }
      if (!gamesMap.has(gId)) {
        throw "gamesMap has no " + gId;
      }
      const runtime = gamesMap.get(gId);
      if (typeof runtime === "undefined") {
        throw "undefined game runtime";
      }
      if (runtime.LplayerId === uuid) {
        if (runtime.RplayerId !== "") {
          runtime.forefit(uuid);
          forefit = true;
          console.log("made a lp forefit for", uuid, "while cleaning");
        }
        else {
          runtime.LplayerId = "failed";
          if (playersMap.has(uuid)) {
            playersMap.delete(uuid);
            console.log("players map delete", uuid, "from eliminate player, for gid", gId, "as a left player");
          }
          else {
            console.log("just set lp as failed, already didn't exist in the playersmap..", uuid);
          }
        }
        break ;
      }
      if (runtime.RplayerId === uuid) {
        if (runtime.LplayerId !== "") {
          runtime.forefit(uuid);
          forefit = true;
          console.log("made a lp forefit for", uuid, "while cleaning");
        }
        else {
          runtime.RplayerId = "failed";
          if (playersMap.has(uuid)) {
            playersMap.delete(uuid);
            console.log("players map delete", uuid, "from eliminate player, for gid", gId, "as a right player");
          }
          else {
            console.log("just set rp as failed, already didn't exist in the playersmap..", uuid);
          }
        }
        break ;
      }
    }
    if (playersMap.has(uuid) && !forefit) {
      console.log("one extra deletion of", uuid, "because forefit at the end and still exists in playersMap");
      playersMap.delete(uuid);
    }
  }
}

let adminMap = new Map<string, string>();
export let tournamentMap = new Map<string, Tournament>();

export function checkAdmining(uuid: string) {
  if (adminMap.has(uuid)) {
    return adminMap.get(uuid);
  }
  throw "You don't admin a tournament";
}

export function checkParticipating(uuid: string) {
  if (playersParticipatingTourn.has(uuid)) {
    return playersParticipatingTourn.get(uuid);
  }
  throw "You don't participate in a tournament";
}

export function addTournament(tName: string, playersN: number, privacy: boolean, uuid: string, sock: WebSocket) {
  if (playersParticipatingTourn.has(uuid)) {
    const tId = playersParticipatingTourn.get(uuid);
    if (typeof tId === "undefined") {
      throw "Undefined tId in participation map";
    }
    throw "You already participate in a tournament";
  }
  if (tName === "" || !(playersN === 2 || playersN === 4 || playersN === 8) || uuid === "") {
    throw "Invalid tournament creation parameters";
  }
  const touridtoadd = makeid(64);
  adminMap.set(uuid, touridtoadd);
  const tourtoadd = new Tournament(tName, uuid, privacy, playersN, touridtoadd);
  tourtoadd.mainLoop();
  tournamentMap.set(touridtoadd, tourtoadd);
  playersParticipatingTourn.set(uuid, touridtoadd);
  if (!socksMap.has(uuid)) {
    socksMap.set(uuid, sock);
    console.log("the sockmap had no sock for an admin. added!");
  }
  console.log(uuid, "just created a tournament", touridtoadd);
  return (tourtoadd.tId);
}

export function joinTournament(tId: string, uuid: string, sock: WebSocket) {
  console.log("joining tourn", tId, "as a", uuid);
  if (playersParticipatingTourn.has(uuid)) {
    throw "Player already participates in " + playersParticipatingTourn.get(uuid);
  }
  if (tournamentMap.has(tId)) {
    const currentTour = tournamentMap.get(tId);
    if (typeof currentTour === "undefined") {
      throw "Tournament object type: undefined";
    }
    if (currentTour.started) {
      throw "This tournament is already ongoing";
    }
    currentTour.addParticipant(uuid);
    playersParticipatingTourn.set(uuid, tId);
    socksMap.set(uuid, sock);
  }
  else {
    throw "This tournament doesn't exist";
  }
}

interface listingReturnType {
  tId: string,
  tName: string,
  joinedPN: number,
  maxPN: number,
};

export function listAllPublicTournaments() {
  let res : Array<listingReturnType> = [];
  for (const [tId, tourn] of tournamentMap) {
    if (!tourn.isItPrivate && !tourn.started) {
      res.push({
        tId: tId,
        tName: tourn.tName,
        joinedPN: tourn.calculateJoinedPN(),
        maxPN: Math.pow(2, tourn.stages),
      });
    }
  }
  return res;
}

export function deleteTournament(adminId: string) {
  if (adminMap.has(adminId)) {
    const tId = adminMap.get(adminId);
    if (typeof tId === "undefined") {
      throw "tid is undefined";
    }
    if (tournamentMap.has(tId)) {
      const tour = tournamentMap.get(tId);
      if (typeof tour === "undefined") {
        throw "tour is undefined";
      }
      tour.eliminateSelf();
      tournamentMap.delete(tId);
      adminMap.delete(adminId);
    }
    else {
      adminMap.delete(adminId);
      throw "Tournament doesn't exist for some reason";
    }
  }
  else {
    throw "You don't admin anything";
  }
}

export function leaveTournament(uuid: string) {
  if (adminMap.has(uuid)) {
    throw "You can't just leave a tournament you're adminning.";
  }
  if (playersParticipatingTourn.has(uuid)) {
    const tId = playersParticipatingTourn.get(uuid);
    if (typeof tId === "undefined") {
      throw "tid is undefined";
    }
    if (tournamentMap.has(tId)) {
      const tour = tournamentMap.get(tId);
      if (typeof tour === "undefined") {
        throw "tour is undefined";
      }
      tour.eliminatePlayer(uuid);
      playersParticipatingTourn.delete(uuid);
      console.log("according to all known laws of science, player", uuid, "eliminated from", tId);
    }
    else {
      playersParticipatingTourn.delete(uuid);
      throw "Tournament doesn't exist for some reason";
    }
  }
  else {
    throw "You don't participate in anything";
  }
}

export function getFullTournament(uuid: string) {
  if (!playersParticipatingTourn.has(uuid)) {
    throw "You have no tournament you'd be in";
  }
  const tId = playersParticipatingTourn.get(uuid);
  if (typeof tId === "undefined") {
    throw "tId undefined";
  }
  if (!tournamentMap.has(tId)) {
    throw "Tournament not found in tId map";
  }
  const tour = tournamentMap.get(tId);
  if (typeof tour === "undefined") {
    throw "tour undefined";
  }
  let response = {
    tName: tour.tName,
    tId: tId,
    Ids: tour.Ids,
    currentStage: tour.currentStage,
    stages: tour.stages,
  };
  return response;
}

export function confirmParticipation(uuid: string) {
  if (!playersParticipatingTourn.has(uuid)) {
    throw "You aren't in a tournament";
  }
  const tId = playersParticipatingTourn.get(uuid);
  if (typeof tId === "undefined") {
    throw "undefined tId";
  }
  if (!tournamentMap.has(tId)) {
    throw "tournamentMap has no " + tId;
  }
  let tourn = tournamentMap.get(tId);
  if (typeof tourn === "undefined") {
    throw "undefined tournament";
  }
  tourn.confirmPlayer(uuid);
}

export async function tournamentsLoopCheck() {
  while (true) {
  for (const [tid, tour] of tournamentMap) {
    if (!tour.alive) {
      console.log("from tlc: detected dead tournament", tid);
      tournamentMap.delete(tid);
      for (const [pid, tid2] of playersParticipatingTourn) {
        if (tid2 === tid) {
          console.log("rming player", pid, "from said tournament's associated map");
          playersParticipatingTourn.delete(pid);
        }
      }
      for (const [aid, tid3] of adminMap) {
        if (tid3 === tid) {
          console.log("rming admin", aid, "from said tournament's associated map");
          adminMap.delete(aid);
        }
      }
    }
  }
  await sleep(5e3);
  }
}
