import { gamesMap, playersMap, socksMap, sleep, makeid } from './pong';

class Tournament {
  private tName : string = "";
  private adminId : string = "";
  private isItPrivate : boolean = true;
  private participantsIds : Array<string> = ["", "", "", "", "", "", "", ""];
  public stages : number = 1;
  public currentStage : number = 1;
  public tId : string = "";

  private function checkEveryonePresent() {
    for (let i : number = 0; i < Math.pow(2, this.currentStage); i++) {
      if (participantsIds[i] === "") {
        return false;
      }
    }
    return true;
  }

  private function matchesOngoing() {
    let res : Array<boolean> = [false, false, false, false, false, false, false, false];
    for (let i : number = 0; i < Math.pow(2, this.currentStage); i++) {
      if (participantsIds[i] !== "" && participantsIds[i] !== "failed") {
        let playerId : string = participantsIds[i];
        if (playersMap.has(playerId)) {
          let gameId : string = playersMap.get(playerId);
          if (gamesMap.has(gameId)) {
            if (!(gamesMap.get(getId).pongDone)) {
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
  public async function mainLoop() {
    while (1) {
      while (!this.checkEveryonePresent()) {
        await sleep(5e3);
      }
      while (this.matchesOngoing()) {
        await sleep(5e3);
      }
      this.currentStage -= 1;
      if (this.currentStage === 0)
        break ;
    }
  }
}
