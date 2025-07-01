import { gamesMap, playersMap, socksMap, sleep, makeid } from './pong';

let playersAlreadyParticipating = new Map<string, string>();

class Tournament {
  public tName : string = "";
  private adminId : string = "";
  public isItPrivate : boolean = true;
  private qfIds : Array<string> = ["", "", "", "", "", "", "", ""];
  private sfIds : Array<string> = ["", "", "", ""];
  private fIds : Array<string> = ["", ""];
  private Ids : Array<Array<string>> = [this.fIds, this.sfIds, this.qfIds];
  public stages : number = 1;
  public currentStage : number = 1;
  public tId : string = "";
  public started : boolean = false;
  public alive : boolean = true;

  public calculateJoinedPN() {
    let count : number = 0;
    for (var player of this.Ids[this.stages - 1]) {
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
  }

  constructor(tName: string, adminId: string, isItPrivate: boolean = true, playersN: number, tId: string) {
    this.tName = tName;
    this.adminId = adminId;
    this.isItPrivate = isItPrivate;
    console.log("so. the playersN is...", playersN);
    if (playersN !== 2 && playersN !== 4 && playersN !== 8) {
      console.error("some clever bastard tried some bs rn");
      return ;
    }
    // I'm NOT doing a log_2.
    const numbs : Array<number> = [0, 1, 0, 2, 0, 0, 0, 3];
    this.stages = numbs[playersN - 1];
    console.log("chosen stages var:", this.stages);
    this.currentStage = this.stages;
    this.addParticipant(adminId);
    this.tId = tId;
  }

  private checkEveryonePresent() {
    if (this.stages === 0 || this.currentStage === 0) {
      return true;
    }
    for (let i : number = 0; i < Math.pow(2, this.currentStage); i++) {
      if (this.Ids[this.currentStage - 1][i] === "") {
        console.log("hha! participant", i, "of", Math.pow(2, this.currentStage), "is not present");
        return false;
      }
    }
    this.started = true;
    return true;
  }

  private matchesOngoing() {
    if (this.stages === 0 || this.currentStage === 0) {
      return false;
    }
    let res : Array<boolean> = [false, false, false, false, false, false, false, false];
    for (let i : number = 0; i < Math.pow(2, this.currentStage); i++) {
      if (this.Ids[this.currentStage - 1][i] !== "" && this.Ids[this.currentStage - 1][i] !== "failed") {
        let playerId : string = this.Ids[this.stages - 1][i];
        if (playersMap.has(playerId)) {
          let gameId : string = playersMap.get(playerId);
          if (gamesMap.has(gameId)) {
            if (!(gamesMap.get(gameId).pongDone)) {
              res[i] = true;
            }
          }
        }
      }
    }
    const inlineIsTrue = (a) => a === true;
    return (res.some(inlineIsTrue));
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
      console.log("tour: after everyone present, before ongoing");
      while (this.matchesOngoing()) {
        await sleep(5e3);
      }
      console.log("tour: after ongoing");
      // TODO add the moving people on phase here
      this.currentStage -= 1;
      if (this.currentStage <= 0) {
        console.log("tour: bye");
        break ;
      }
    }
  }

  public eliminateSelf() {
    this.alive = false;
    for (var user of this.Ids[this.currentStage - 1]) {
      if (playersAlreadyParticipating.has(user)) {
        playersAlreadyParticipating.delete(user);
      }
    }
    // TODO run thru game ids and clean ts up
  }
}

let adminMap = new Map<string, string>();
let tournamentMap = new Map<string, Tournament>();

export function addTournament(tName: string, playersN: number, privacy: boolean, uuid: string) {
  if (adminMap.has(uuid)) {
    throw adminMap.get(uuid);
  }
  if (playersAlreadyParticipating.has(uuid)) {
    throw "Player already participates in " + playersAlreadyParticipating.get(uuid);
  }
  if (playersN === -1) {
    throw "no tourament for this player found";
  }
  if (tName === "" || !(playersN === 2 || playersN === 4 || playersN === 8) || uuid === "") {
    throw "invalid tournament creation parameters";
  }
  const touridtoadd = makeid(64);
  adminMap.set(uuid, touridtoadd);
  console.log("the playersnum shall be...", playersN);
  const tourtoadd = new Tournament(tName, uuid, privacy, playersN, touridtoadd);
  tourtoadd.mainLoop();
  tournamentMap.set(touridtoadd, tourtoadd);
  playersAlreadyParticipating.set(uuid, touridtoadd);
  console.log("so here's what the current maps are r/n:");
  console.log(adminMap);
  console.log(tournamentMap);
  return (tourtoadd.tId);
}

export function joinTournament(tId: string, uuid: string) {
  if (playersAlreadyParticipating.has(uuid)) {
    throw "Player already participates in " + playersAlreadyParticipating.get(uuid);
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
    playersAlreadyParticipating.set(uuid, tId);
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
