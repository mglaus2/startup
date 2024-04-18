export class GameState {
    static JoinGame = new GameState('join-game');
    static InGame = new GameState('in-game');
  
    constructor(name) {
      this.name = name;
    }
}