/** type {import("../../../../typings/phaser")} */
/** type {import("../../../../lib/phaser.js")} */


class GameScene extends Phaser.Scene {
    constructor() {
        super( { key: 'GameScene' } );
    }

    preload ()
    {
        let imgSrc = './scatterscraps/scraps/1/src/img/';

        this.load.spritesheet('cattus', imgSrc + 'cattus-sheet.png', { frameWidth: 80, frameHeight: 100 }) ;  
        this.load.spritesheet('coin', imgSrc + 'coin.png', { frameWidth: 32, frameHeight: 32 }) ;  
        
        this.load.image('desert', imgSrc + 'desert.png') ;  
        this.load.image('lake', imgSrc + 'lake.png') ;  
        this.load.image('mountain', imgSrc + 'mountain.png') ;  
        this.load.image('forest', imgSrc + 'forest.png') ;  
    }

    create ()
    {

        //ANIMS
        //#region
        this.anims.create({
            key: 'cattus-inactive',
            frames: this.anims.generateFrameNumbers('cattus', { frames: [6] }),
            frameRate: 1,
            repeat: 0
        });
        this.anims.create({
            key: 'cattus-stand',
            frames: this.anims.generateFrameNumbers('cattus', { frames: [0] }),
            frameRate: 1,
            repeat: 0
        });
        this.anims.create({
            key: 'cattus-walk',
            frames: this.anims.generateFrameNumbers('cattus', { frames: [4, 3, 2, 3] }),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'cattus-run',
            frames: this.anims.generateFrameNumbers('cattus', { frames: [4, 5, 4, 3, 2, 1, 2, 3] }),
            frameRate: 30,
            repeat: -1
        });
        
        this.anims.create({
            key: 'coin-spin',
            frames: this.anims.generateFrameNumbers('coin', { frames: [0, 1, 2, 3, 2, 1] }),
            frameRate: 6,
            repeat: -1
        });

        //#endregion

        
        //PLAYER
        //#region 
        var setupCat  =   (cat) => {
            cat.speed      = 100;
            cat.runMult    = 1;
            cat.active     = false;
            
            cat.walk       = (o) => {
                if (o.anims.getName() !== 'cattus-walk') {
                    o.anims.play('cattus-walk');
                }
            }

            cat.run        = (o) => {
                if (o.anims.getName() !== 'cattus-run') {
                    o.anims.play('cattus-run');
                }
            };
            
            cat.anims.play('cattus-inactive');
        }
        

        let worldCoords;
        
        worldCoords = gameState.worlds.getCenter(gameState.worlds.list[0]);
        gameState.cattus1 = this.physics.add.sprite(worldCoords.x, worldCoords.y, 'cattus').setName('desert')
        
        worldCoords = gameState.worlds.getCenter(gameState.worlds.list[1]);
        gameState.cattus2 = this.physics.add.sprite(worldCoords.x, worldCoords.y, 'cattus').setName('lake')
        
        worldCoords = gameState.worlds.getCenter(gameState.worlds.list[2]);
        gameState.cattus3 = this.physics.add.sprite(worldCoords.x, worldCoords.y, 'cattus').setName('forest')

        worldCoords = gameState.worlds.getCenter(gameState.worlds.list[3]);
        gameState.cattus4 = this.physics.add.sprite(worldCoords.x, worldCoords.y, 'cattus').setName('mountain')


        setupCat(gameState.cattus1);
        setupCat(gameState.cattus2);
        setupCat(gameState.cattus3);
        setupCat(gameState.cattus4);

        gameState.cattus1.anims.play('cattus-stand');
        gameState.cattus1.active    =   true;

        gameState.currentCharacter  =   gameState.cattus1

        

        gameState.characters        =   [gameState.cattus1, gameState.cattus2, gameState.cattus3, gameState.cattus4];
        //gameState.characters        =   this.add.group([gameState.cattus1, gameState.cattus2, gameState.cattus3, gameState.cattus4]);
        //#endregion


        //COINS
        //#region
        gameState.coins.collected = 0;
        gameState.coins.display = this.add.text(30, 30, '');
        gameState.coins.list = this.physics.add.group();
        

        gameState.coins.spawn = this.time.addEvent({
            delay:      200,
            loop:       true,
            callback:   () => {

                let coinCount = gameState.coins.list.getChildren().length;
                if (coinCount < 10) {

                    let worldInt = Math.floor(Math.random() * 4)
                
                    let coords = gameState.worlds.getRandomCoord(gameState.worlds.list[worldInt])
                    
                    let newCoin = gameState.coins.list.create(coords.x, coords.y, 'coin').setScale(0.5)
                    newCoin.anims.play('coin-spin')
                }
            }
        });

        
        var coinCol = this.physics.add.overlap(gameState.characters, gameState.coins.list, (char, coin) => {
            gameState.coins.collected++;
            gameState.coins.display.text = gameState.coins.collected
            coin.destroy();
        });

        //#endregion

        //WORLD
        //#region
        function generateWorlds(scene) {
            gameState.worlds.list.forEach( (world) => {
                let bounds  =   world.coords;
                let name    =   world.name;

                let bg      =   scene.add.image(bounds.left, bounds.top, world.name, 0x555491).setOrigin(0,0)

                console.log(bg);

                switch(world.name) {
                    case 'desert':
                        
                        break;

                    case 'forest':
                        
                        break;

                    case 'mountain':

                        break;

                    case 'lake':

                        break;

                    default:    

                        break;
                }

                
            });
        }
        gameState.worlds.active = gameState.worlds.list[0];
        generateWorlds(this);

        //#endregion

        //CONTROLS
        //#region 
        
        controls = {
            jump:   this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            run:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            tab:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        }

        gameState.keyboard = this.input.keyboard.keys
        gameState.cursors = this.input.keyboard.createCursorKeys(); //  Input Events
        //#endregion

        
        //layers
        //#region
        var charLayer = this.add.layer([ 
            gameState.cattus1, gameState.cattus2, gameState.cattus3, gameState.cattus4
        ]);
        
        gameState.coins.list.getChildren().forEach( (coin) => {

            charLayer.add(coin);
        })

        var midLayer = this.add.layer([ 
            
        ]);

        charLayer.setDepth(2);
        midLayer.setDepth(1);
        //#endregion
    }

    update ()
    {
        let left    = gameState.cursors.left.isDown;
        let right   = gameState.cursors.right.isDown;
        let up      = gameState.cursors.up.isDown;
        let down    = gameState.cursors.down.isDown;

        let run     = controls.run.isDown;
        let tab     = Phaser.Input.Keyboard.JustDown(controls.tab);

        let noVert  = (!up && !down)
        let noHori  = (!left && !right)
        let noDir   = (noVert && noHori)
        
        let player = gameState.currentCharacter

        //BUTTONCHECKS
        //#region
        
        if (tab) {
            activateNextCharacter()
            player = gameState.currentCharacter
        }
        

        if (!run) {
            player.runMult = 1
        } else {
            player.runMult = 1.8
        }
        //#endregion


        //DIRECTIONS
        //#region 
        if (left)
        {
            player.setVelocityX(-player.speed * player.runMult);
            player.setFlipX(true);

            //anims
            if (!run) {
                player.walk(player);
            } else {
                player.run(player);
            }
        }
        if (right)
        {			
            player.setVelocityX(player.speed * player.runMult);
            player.setFlipX(false);

            //anims
            if (!run) {
                player.walk(player);
            } else {
                player.run(player);
            }
        }
        if (up)
        {
            player.setVelocityY(-player.speed * player.runMult);

            //anims
            if (!run) {
                player.walk(player);
            } else {
                player.run(player);
            }
        }
        if (down)
        {
            player.setVelocityY(player.speed * player.runMult);

            //anims
            if (!run) {
                player.walk(player);
            } else {
                player.run(player);
            }
        }
        //#endregion


        //CLEANUP / NOBUTTONS
        //#region
        if (noVert) 
        {
            player.setVelocityY(0);
        }
        if (noHori) 
        {
            player.setVelocityX(0);
        }
        if (noDir) 
        {
            if(player.anims.getName() !== 'cattus-stand') {
                player.anims.play('cattus-stand');
            }
        }
        //#endregion
        boxChecks(player);

        //CHARACTER
        //#region

        function boxChecks(char) {
            let padding = 30;
            let vertDiff = 1.75
            let bounds = gameState.worlds.active.coords;
            
            if (char.x > bounds.right - padding)            {char.x = bounds.right - padding}
            if (char.x < bounds.left + padding)             {char.x = bounds.left + padding}
            if (char.y > bounds.bottom - vertDiff*padding)  {char.y = bounds.bottom - vertDiff*padding}
            if (char.y < bounds.top + vertDiff*padding)     {char.y = bounds.top + vertDiff*padding}
        }

        function deactivate(char) {
            char.anims.play('cattus-inactive');
            char.active = !char.active
            char.setVelocityX(0);
            char.setVelocityY(0);

            char.active = false;
        }

        function activate(char) {
            gameState.currentCharacter = char;
            gameState.worlds.setActive(char.name);

            char.active = true;
        }


        function activateNextCharacter() {
            deactivate(gameState.currentCharacter);
            activate(getNextCharacter());
        }

        function getNextCharacter() {
            let charCount   = gameState.characters.length;
            let curCharInd  = gameState.characters.indexOf(gameState.currentCharacter);

            curCharInd++;
            if (curCharInd === charCount) {curCharInd = 0}

            let nextChar = gameState.characters[curCharInd]

            return  nextChar
        }
        //#endregion

    }
 
}


let controls = {

};

let gameState = {
    coins: {
        list: {}    
    },
    worlds: {
        active:     {},
        setActive:  (name) => {
            switch(name) {
                case 'desert':
                    gameState.worlds.active = gameState.worlds.list[0];
                    break;
                case 'lake':
                    gameState.worlds.active = gameState.worlds.list[1];
                    break;
                case 'forest':
                    gameState.worlds.active = gameState.worlds.list[2];
                    break;
                case 'mountain':
                    gameState.worlds.active = gameState.worlds.list[3];
                    break;
                default:
                    break;    
            }
        },
        getRandomCoord:  (world) => {
            let coords = world.coords;

            let x = Math.floor(Math.random() * (coords.right - coords.left)) + coords.left;
            let y = Math.floor(Math.random() * (coords.bottom - coords.top)) + coords.top;

            return {x: x, y: y}
        },
        getCenter:  (world) => {
            let x = world.coords.left + ((0.5) * (world.coords.right - world.coords.left));
            let y = world.coords.top + ((0.5) * (world.coords.bottom - world.coords.top));

            return {x: x, y: y}
        },
        list:       [
            {
                name:   'desert',
                bg:     0x123456,
                coords: { 
                    top:    0,
                    bottom: 400,
                    left:   200,
                    right:  700
                }
            },
            {
                name:   'lake',
                bg:     0x55BB77,
                coords: { 
                    top:    0,
                    bottom: 400,
                    left:   701,
                    right:  1200
                }
            },
            {
                name:   'forest',
                bg:     0xAB0045,
                coords: { 
                    top:    401,
                    bottom: 800,
                    left:   200,
                    right:  700
                }
            },
            {
                name:   'mountain',
                bg:     0x567890,
                coords: { 
                    top:    401,
                    bottom: 800,
                    left:   701,
                    right:  1200
                }
            }
        ],
        getNext: () => {
            let worldList   =   gameState.worlds.list
            let curWorld    =   gameState.worlds.active;
            let curWorldInd =   worldList.indexOf(curWorld)

            console.log(curWorldInd)

            curWorldInd++;
            if (curWorldInd === worldList.length) { curWorldInd = 0; }

            console.log(`${curWorld}, ${curWorldInd}`)

            return worldList[curWorldInd];
        }
    },
    cattus: {}
};


const config = {
  type: Phaser.AUTO,
  backgroundColor: 0x000000,
  width: 1200,
  height: 800,
  physics:  {
    default:    'arcade',
    arcade:     {
        gravity:    { y: 0 },
        enableBody: true,
        debug:      false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
  