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
  public stages : number = 0;
  public currentStage : number = 0;
  public tId : string = "";
  public started : boolean = false;
  public alive : boolean = true;
  public gotDeleted : boolean = false;

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
    console.log("starting new stage filler.");
    console.log("the curstage var is", this.currentStage, "thus the index to use is", this.currentStage - 1);
    console.log("game ids in this:", this.gameIds);
    console.log("and the game map:", gamesMap);
    for (let gameId of this.gameIds[this.currentStage]) {
      console.log("filling the new stage for", gameId);
      console.log("i =", i, "; i*2 =", i * 2, "; i*2+1 =", i * 2 + 1);
      if (gamesMap.has(gameId)) {
        console.log("if 1");
        if (gamesMap.get(gameId).whoLost === "left fully" || gamesMap.get(gameId).whoLost === "left skip") {
          console.log("if 1.1");
          this.Ids[this.currentStage - 1][i] = gamesMap.get(gameId).RplayerId;
        }
        else if (gamesMap.get(gameId).whoLost === "right fully" || gamesMap.get(gameId).whoLost === "right skip") {
          console.log("elif 1.2");
          this.Ids[this.currentStage - 1][i] = gamesMap.get(gameId).LplayerId;
        }
        else {
          console.log("else 1.3");
          this.Ids[this.currentStage - 1][i] = "failed";
        }
      }
      else {
        console.log("else 2");
        // in case we had a player already in a different game by that point,...
        if (this.Ids[this.currentStage][i * 2] === "failed") {
          console.log("if 2.1");
          this.Ids[this.currentStage - 1][i] = this.Ids[this.currentStage][i * 2 + 1];
        }
        else if (this.Ids[this.currentStage][i * 2 + 1] === "failed") {
          console.log("elif 2.2");
          this.Ids[this.currentStage - 1][i] = this.Ids[this.currentStage][i * 2];
        }
        else {
          console.log("mysterious nothing");
        }
      }
      i++;
      console.log("i incremented and is now", i);
    }
  }

  private oldStuffDeleter() {
    // we're in the next stage already, which has been -1'd. To go back one, we +1. - 1 + 1 = 0.
    console.log("starting old stuff deleter.");
    console.log("the curstage var is", this.currentStage, "thus the index to use is", this.currentStage - 1);
    console.log("game ids in this:", this.gameIds);
    console.log("and the game map:", gamesMap);
    for (let gameId of this.gameIds[this.currentStage]) {
      console.log("cleaning up for", gameId);
      if (gamesMap.has(gameId)) {
        const lid = gamesMap.get(gameId).LplayerId;
        const rid = gamesMap.get(gameId).RplayerId;
        if (playersMap.has(lid)) {
          playersMap.delete(lid);
          console.log("from within the OSD deleted lid", lid, "of game", gameId);
        }
        else {
          console.log("from within the OSD didn't find lid", lid, "in pmap of game", gameId);
        }
        if (playersMap.has(rid)) {
          playersMap.delete(rid);
          console.log("from within the OSD deleted rid", rid, "of game", gameId);
        }
        else {
          console.log("from within the OSD didn't find rid", rid, "in pmap of game", gameId);
        }
        gamesMap.delete(gameId);
        console.log("also rmd gid", gameId);
      }
      else {
        console.log("from within the OSD, didn't find the game id!!!!!!!!!", gameId);
      }
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
  // also every time a runtime in tournament mode is created, a 30 second timer is started. if it passes and the enemy isn't ready yet, you can make them forfeit.
  //
  // if YOU forfeit, the enemy moves thru. if you both ain't ready, game dies after 60 seconds of inactivity, and places the special "failed" id on the winner
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
      console.log("stage", this.currentStage, "tour: before everyone present");
      while (!this.checkEveryonePresent()) {
        if (this.gotDeleted) {
          break ;
        }
        await sleep(5e3);
      }
      if (this.gotDeleted) {
        break ;
      }
      console.log("stage", this.currentStage, "tour: after everyone present, before checking for stopped");
      this.gameCreator();
      while (!this.matchesStopped()) {
        console.log("stage", this.currentStage, "waiting for matches to be stopped...");
        if (this.gotDeleted) {
          break ;
        }
        await sleep(5e3);
      }
      if (this.gotDeleted) {
        break ;
      }
      console.log("stage", this.currentStage, "tour: after stopped");
      this.currentStage -= 1;
      if (this.currentStage <= 0) {
        if (this.currentStage === 0 ) {
          // finished correctly
          if (gamesMap.has(this.gameIds[0][0])) {
            const lastGame = gamesMap.get(this.gameIds[0][0]);
            if (lastGame.whoLost === "left fully" || lastGame.whoLost === "left skip") {
              this.winner = lastGame.RplayerId;
            }
            else if (lastGame.whoLost === "right fully" || lastGame.whoLost === "right skip") {
              this.winner = lastGame.LplayerId;
            }
            else if (lastGame.whoLost === "both") {
              this.winner = "failed";
            }
            else {
              console.log("now explain to me: how did you get here?");
            }
            console.log("WINNER CHOSEN:", this.winner);
          }
          else {
            console.log("holy shit i think somebody deleted the very last game way too soon");
          }
        }

        console.log("tour", this.tId, "awaiting a minute till auto-shutdown; will delete everything when shutting down");
        await sleep(60e3);
        this.alive = false;
        console.log("tour", this.tId, "bye");
        break ;
      }
      console.log("stage", this.currentStage, "tour: after subtraction");
      this.newStageFiller();
      console.log("stage", this.currentStage, "tour: after newstagefiller");
      this.oldStuffDeleter();
      console.log("stage", this.currentStage, "tour: after oldstuffdeleter");
    }
  }

  public eliminateSelf() {
    this.alive = false;
    for (const [pid, tid] of playersParticipatingTourn) {
      if (tid === this.tId) {
        playersParticipatingTourn.delete(pid);
        if (playersMap.has(pid)) {
          if (gamesMap.has(playersMap.get(pid))) {
            console.log("deleting game", gamesMap.get(playersMap.get(pid)), "gamesmap from eliminateSelf");
            gamesMap.delete(playersMap.get(pid));
          }
          console.log("deleting player", pid, "from playersmap from eliminateSelf");
          playersMap.delete(pid);
        }
        console.log("players participating delete", pid, "from eliminateSelf in tournament", this.tId);
      }
    }
    this.gotDeleted = true;
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
    let forfeit : boolean = false;
    if (this.currentStage > 0) {
      let i : number = 0;
      for (let pId of this.Ids[this.currentStage - 1]) {
        if (pId === uuid) {
          this.Ids[this.currentStage - 1][i] = "";
          console.log("cleaned the appropriate Ids' id...");
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
          console.log("met our player in", runtime);
          if (runtime.RplayerId !== "") {
            runtime.forfeit(uuid);
            forfeit = true;
            console.log("made a lp forfeit for", uuid, "while cleaning");
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
          console.log("met our player in", runtime);
          if (runtime.LplayerId !== "") {
            runtime.forfeit(uuid);
            forfeit = true;
            console.log("made a lp forfeit for", uuid, "while cleaning");
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
    }
    if (playersMap.has(uuid)) {
      console.log("one extra deletion of", uuid, "from playersmap");
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
  if (playersMap.has(uuid)) {
    throw "You're already participating in a game";
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
  console.log("trying to join tourn", tId, "as a", uuid);
  if (playersParticipatingTourn.has(uuid)) {
    throw "Player already participates in " + playersParticipatingTourn.get(uuid);
  }
  if (playersMap.has(uuid)) {
    throw "You're already participating in a game";
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
  console.log("leave tournament called by", uuid);
  console.log("here's players map:", playersMap);
  console.log("here's players participating map:", playersParticipatingTourn);
  console.log("here's gamesMap:", gamesMap);
  console.log("here's tournament map:", tournamentMap);
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
  if (socksMap.has(uuid)) {
    socksMap.get(uuid).send("confirmed");
  }
  else {
    console.log("weird. we confirmed the participation but the player just straight up got no sock.");
  }
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
          if (playersMap.has(pid)) {
            if (gamesMap.has(playersMap.get(pid))) {
              console.log("deleting game", gamesMap.get(playersMap.get(pid)), "gamesmap from tlc");
              gamesMap.delete(playersMap.get(pid));
            }
            console.log("deleting player", pid, "from playersmap from tlc");
            playersMap.delete(pid);
          }
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

export function getFinalist(uuid: string) {
  if (playersParticipatingTourn.has(uuid)) {
    const tid = playersParticipatingTourn.get(uuid);
    if (typeof tid === "undefined") {
      throw "undefined tid";
    }
    if (tournamentMap.has(tid)) {
      const tour = tournamentMap.get(tid);
      if (typeof tour === "undefined") {
        throw "undefined tour";
      }
      return tour.winner;
    }
    throw "Tournament not found in tid-tourn map";
  }
  throw "Player not found in players-tournaments map";
}

export function checkInTour(uuid: string) {
  if (adminMap.has(uuid)) {
    return (true);
  }
  if (playersParticipatingTourn.has(uuid)) {
    return (true);
  }
  return (false);
}

export function checkTourReady(uuid: string) {
  if (playersMap.has(uuid)) {
    if (gamesMap.has(playersMap.get(uuid))) {
      if (uuid === gamesMap.get(playersMap.get(uuid)).LplayerId) {
        return gamesMap.get(playersMap.get(uuid)).leftReady;
      }
      else {
        return gamesMap.get(playersMap.get(uuid)).rightReady;
      }
    }
  }
  return (true);
  // lying to the user to simply make the button disabled.
}
