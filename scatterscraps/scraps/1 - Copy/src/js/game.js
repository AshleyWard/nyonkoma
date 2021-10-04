/** type {import("../../../typings/phaser")} */

class GameScene extends Phaser.Scene {
    constructor() {
        super( { key: 'GameScene' } );
    }

    preload ()
    {

    }

    create ()
    {

    }

    update ()
    {

    }
 
}


let gameState = {

};


const config = {
  type: Phaser.AUTO,
  backgroundColor: 0xffc836,
  width: 440,
  height: 550,
  physics:  {
    default:    'matter',
    arcade:     {
        gravity:    { y: 100 },
        enableBody: true,
        debug:      false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
  