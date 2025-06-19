import { makeid } from './pong';

class Tournament {
  private tName : string = "";
  private adminId : string = "";
  private isItPrivate : bool = true;
  private participantsIds : Array<string> = ["", "", "", "", "", "", "", ""];
  public stages : number = 1;
  public currentStage : number = 1;
  public tId : string = "";

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
}
