import { gamesMap, playersMap, socksMap, sleep, makeid } from './pong';

class Tournament {
  private tName : string = "";
  private adminId : string = "";
  private isItPrivate : boolean = true;
  private participantsIds : Array<string> = ["", "", "", "", "", "", "", ""];
  public stages : number = 1;
  public currentStage : number = 1;
  public tId : string = "";

  public addParticipant(participantId: string) {
    let i : number = 0;
    while (i < Math.pow(2, this.currentStage) && this.participantsIds[i] !== "") {
      i += 1;
    }
    if (i === Math.pow(2, this.currentStage)) {
      throw "everyone is already in";
    }
    this.participantsIds[i] = participantId;
  }

  constructor(tName: string, adminId: string, isItPrivate: boolean = true, playersN: number) {
    this.tName = tName;
    this.adminId = adminId;
    this.isItPrivate = isItPrivate;
    console.log("so. the playersN is...", playersN);
    console.log(typeof playersN);
    switch (playersN) {
      case 2:
        console.log("2");
        this.stages = 1;
        break;
      case 4:
        console.log("4");
        this.stages = 2;
        break;
      case 8:
        console.log("8");
        this.stages = 3;
        break;
      default:
        console.log("how.");
        this.stages = 0;
    }
    this.currentStage = this.stages;
    this.addParticipant(adminId);
  }

  private checkEveryonePresent() {
    if (this.stages === 0) {
      return true;
    }
    for (let i : number = 0; i < Math.pow(2, this.currentStage); i++) {
      if (this.participantsIds[i] === "") {
        console.log("hha! participant", i, "of", Math.pow(2, this.currentStage), "is not present");
        return false;
      }
    }
    return true;
  }

  private matchesOngoing() {
    let res : Array<boolean> = [false, false, false, false, false, false, false, false];
    for (let i : number = 0; i < Math.pow(2, this.currentStage); i++) {
      if (this.participantsIds[i] !== "" && this.participantsIds[i] !== "failed") {
        let playerId : string = this.participantsIds[i];
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
    while (1) {
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
}

let adminMap = new Map<string, string>();
let tournamentMap = new Map<string, Tournament>();

export function addTournament(tName: string, playersN: number, privacy: boolean, uuid: string) {
  if (adminMap.has(uuid)) {
    throw "player already manages a tournament";
  }
  const touridtoadd = makeid(64);
  adminMap.set(uuid, touridtoadd);
  console.log("the playersnum shall be...", playersN);
  const tourtoadd = new Tournament(tName, uuid, privacy, playersN);
  tourtoadd.mainLoop();
  tournamentMap.set(touridtoadd, tourtoadd);
  console.log("so here's what the current maps are r/n:");
  console.log(adminMap);
  console.log(tournamentMap);
}
