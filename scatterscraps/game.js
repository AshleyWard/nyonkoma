/** @type {import("../../typings/phaser")} */

class GameScene extends Phaser.Scene {
    constructor() {
        super( { key: 'GameScene' } );
    }

    preload ()
    {	
        this.load.spritesheet('sqrl', './src/img/SQORL.png', { frameWidth:48, frameHeight:48 } );  //48 x 48
        this.load.spritesheet('acorn', './src/img/acorn.png', { frameWidth:48, frameHeight:48 } );  //48 x 48
        this.load.spritesheet('ufo', './src/img/ufosheet.png', { frameWidth:48, frameHeight:96 } );  //48 x 48
        this.load.image('ufoGuy', './src/img/ufoPopup.png') ;  //48 x 48
        this.load.image('beam', './src/img/beam.png') ;  //8 x 1
        this.load.image('beamHitbox', './src/img/beamHitbox.png') ;  //16 x 16
        this.load.image('stump', './src/img/stump.png') ;  //48 x 48
        this.load.image('shadow', './src/img/shadow.png') ;  //48 x 48
        this.load.image('sapling', './src/img/sapling.png') ;  //48 x 48
        this.load.image('youngling', './src/img/youngling.png') ;  //48 x 48
        this.load.image('wholeling', './src/img/wholeling.png') ;  //48 x 48
    }

    create ()
    {	
        var width = config.width;
        var height = config.height;

        controls = {
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        }

        gameState.keyboard = this.input.keyboard.keys
        gameState.cursors = this.input.keyboard.createCursorKeys(); //  Input Events	

        //interface
        //#region

        //AcornDisplay
        var acorns = gameState.inventory.acorns;

        var acornDisplay = {
            count:      acorns,
            sprites:    [],
            update()    {
                console.log(this.count.length);
            }
        }

        //#endregion

                                
        //anims
        //#region
        this.anims.create({
            key: 'sqrl-left',
            frames: this.anims.generateFrameNumbers('sqrl', { frames: [12, 13, 14] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'sqrl-right',
            frames: this.anims.generateFrameNumbers('sqrl', { frames: [24, 25, 26] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'sqrl-up',
            frames: this.anims.generateFrameNumbers('sqrl', { frames: [36, 37, 38] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'sqrl-down',
            frames: this.anims.generateFrameNumbers('sqrl', { frames: [0, 1, 2] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'ufoSpin',
            frames: this.anims.generateFrameNumbers('ufo', {start: 0, end: 4}),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'acornRotate',
            frames: this.anims.generateFrameNumbers('acorn', {start: 0, end: 9}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'acornShake',
            frames: this.anims.generateFrameNumbers('acorn', { frames: [0, 1, 0, 9] }),
            frameRate: 3,
            repeat: -1
        });
        //#endregion


        //player
        //#region
        //squirrel & shadow
        var sqrl    = this.physics.add.sprite(game.config.width/2, game.config.height-100, 'sqrl')
        var shadow  = this.add.sprite(game.config.width/2, game.config.height-100, 'shadow')

        sqrl.speed  = 220;
        shadow.y    = sqrl.y+25;
        
        //sq+sh become player
        var player = this.physics.add.group([sqrl, shadow]);
        
        gameState.player = player;

        gameState.player.onGround = true;
        gameState.player.squirrel = sqrl;
        gameState.player.shadow = shadow;
        //#endregion

        //ufo       // SO much refactoring to be done in here
        //#region
        
        //UFO

        let wiggleRoom = 17;

        var ufoGuy      = this.physics.add.sprite(game.config.width/2, 300, 'ufoGuy');
        var beam        = this.physics.add.sprite(game.config.width/2, 300, 'beam');
        var ufo         = this.physics.add.sprite(game.config.width/2, 300, 'ufo');
        var beamHitbox  = this.physics.add.sprite(game.config.width/2, 300, 'beamHitbox');
        
        ufo.name = 'ufo';
        beam.name = 'beam';
        ufoGuy.name = 'ufoGuy';
        beamHitbox.name = 'beamHitbox';

        
        


        beam.hitbox     = beamHitbox;
        beam.hitbox.setVisible(false);
        beam.setOrigin(0.5, 0)

        beam.attack = {
            frequency:      3,
            movesSinceLast: 0
        }
        

        
        let beamBase = 34;
        beam.y += beamBase;


        this.physics.add.overlap(beam.hitbox, gameState.trees, () => {
            console.log('pyoot')
        });

        var ship = this.physics.add.group([ufoGuy, beam, beamHitbox, ufo]);

        beam.hitbox.shootOffset = ship.getChildren()[0].y + beamBase;


        ufo.anims.play('ufoSpin');


        beam.shoot = (dist) => {

            beam.setY(ufo.y)

            if (!dist) {
                beam.setVisible(false);
                beam.hitbox.setVisible(false);
            } else {
                beam.setScale(1, dist);
                beam.setVisible(true);
                beam.hitbox.setVisible(true);

                beam.setY(ufo.y + beamBase)
                beam.hitbox.setY(beam.getBottomLeft().y) + dist/2
                
            }
        };
    

        ship.move = (type, coords = {} ) => {

            let x;
            let y;

            if(!coords.x) {
                let pt  =   gameState.world.getRandomPoint();
                x = pt.x;
                y = pt.y;
            } else {
                x = coords.x;
                y = coords.y;
            }

            let ufoGroup = ship.getChildren();
            let beam = ufoGroup[1];

            let shipPathTween;
            

            switch(type) {
                case    'path':

                shipPathTween = this.tweens.add({
                    paused:     false,
                    x:          x,
                    y:          y,
                    ease:       'Sine',
                    duration:   1600,
                    repeat:     0,
                    yoyo:       false,
                    onComplete: function () {
                        //beam.shoot(0);
                    }
                });

                ufoGroup.tweens.play(shipPathTween);


                break;
                
                case    'attack':

                break;

                case    'random':

                    if (beam.attack.frequency <= beam.attack.movesSinceLast) {
                        beam.shoot(300);
                        beam.attack.movesSinceLast = 0;
                    } else {
                        beam.shoot(0);
                    }

                    

                    ufoGroup.forEach( (child) => {
                        var offset = 0;
                        if (child.name === 'beam'){
                            offset = beamBase;
                        } else if (child.name === 'beamHitbox'){
                            offset = beamBase + (beam.getBottomLeft().y - beam.getTopLeft().y);
                        }

                        shipPathTween = this.tweens.add({
                            paused:     false,
                            targets:    child,
                            x:          x,
                            y:          y - 300 + offset,
                            ease:       'Sine',
                            duration:   1600,
                            repeat:     0,
                            yoyo:       false,
                            onComplete: function () {
                                if (child.name === 'ufo') {
                                    ship.move('random');
                                    beam.attack.movesSinceLast += 1;
                                }
                            }
                        });
                    })

                    

                break;

                case    'placeholder':

                break;
                default:

                break;
            }


        }

        
        //ship.move('path', {x: 500, y: 500});
        ship.move('random');

        //#endregion


        //actions
        //#region

        //JUMP
        gameState.actions.jumpHelper = this.physics.add.sprite(0, 0)
        gameState.actions.jumpHelper.yChanged = false;
        gameState.actions.jumpHelper.lastY = 0;
        gameState.actions.jump = () => {
        

            let jumpTween = this.tweens.add({
                paused:     false,
                targets:    gameState.actions.jumpHelper,
                y:          gameState.actions.jumpHelper.y - 100,
                ease:       'Sine',
                duration:   400,
                repeat:     0,
                yoyo:       true,
                onComplete: function () {
                    gameState.player.jumping = false;
                }
            });

            let jumpShadeTween = this.tweens.add({
                paused:     false,
                targets:    gameState.player.shadow,
                scaleX:     1.3,
                ease:       'Sine',
                duration:   400,
                repeat:     0,
                yoyo:       true,
                onComplete: function () {
                    gameState.player.jumping = false;
                }
            });
        }


        
        //ATTACK
        var basicWeapon = {
            name:       'acorn',
            delay:      500,
            growTime:   5000,
            lifeTime:   50000,
            dropRate:   2.5
        }

        gameState.weapons = {};
        gameState.weapons.currentWeapon = basicWeapon;

        gameState.actions.attack = () => {};
        gameState.actions.attack.disabled = false;

        gameState.actions.attack = () => {
            if(!gameState.actions.attack.disabled) {
                //Vars
                var proj = gameState.weapons.currentWeapon;
                var squirrel = gameState.player.squirrel;

                //Attack!
                console.log(`I shoot a ${proj.name} at you! pew!`)

                var facing = gameState.player.facing;

                let facingOffsetX = 0;
                let facingOffsetY = 0;

                if (facing === 'left')  { facingOffsetX = -25 }
                if (facing === 'right') { facingOffsetX = 25 }
                if (facing === 'up')    { facingOffsetY = -25 }
                if (facing === 'down')  { facingOffsetY = 25 }

                var attackNut = this.physics.add.sprite(squirrel.x + facingOffsetX, squirrel.y + facingOffsetY, proj.name)
                attackNut.setScale(0.5);
                attackNut.anims.play('acornRotate',true);

                var nutCol = this.physics.add.collider(attackNut, squirrel, () => {
                    console.log('contact - change this when there are real targets for nuts!');
                });

                let acornTweenY = this.tweens.add({
                    paused:     true,
                    targets:    attackNut,
                    y:          squirrel.y - 100 + (2*facingOffsetY),
                    ease:       'Sine',
                    duration:   400,
                    repeat:     0,
                    yoyo:       true,
                    onComplete: function () {
                        gameState.actions.plant(attackNut, proj);
                        attackNut.destroy();
                    }
                });
                let acornTweenX = this.tweens.add({
                    paused:     true,
                    targets:    attackNut,
                    x:          squirrel.x + facingOffsetX * 15,
                    ease:       'Linear',
                    duration:   800,
                    repeat:     0,
                    yoyo:       false
                });

                acornTweenY.play()
                acornTweenX.play()


                //Attack delay timer:
                gameState.actions.attack.disabled = true;
                gameState.actions.attack.lastAttack = this.time.delayedCall(proj.delay, () => {
                    gameState.actions.attack.disabled = false;
                    console.log('Attack ready');
                });
            }
        }


        //GROW
        gameState.trees = {
            list:   [],
            grow:   function(tree, scene){
                if (tree.sprite.name === 'sapling'){

                    var youngTree = scene.add.sprite(tree.sprite.x, tree.sprite.y, 'youngling')
                    youngTree.setName('youngling');
                    
                    tree.sprite.destroy()
                    tree.sprite = youngTree;

                    scene.time.delayedCall(tree.type.growTime, () => {
                        gameState.trees.grow(tree, scene);
                    });

                    //console.log(`${tree} has grown, it is now a ${tree.sprite.name}`)

                } else if (tree.sprite.name === 'youngling'){

                    var wholeTree = scene.add.sprite(tree.sprite.x, tree.sprite.y-24, 'wholeling');
                    wholeTree.setName('wholeling');
                    wholeTree.setScale(1,1);

                    
                    tree.sprite.destroy()
                    tree.sprite = wholeTree;

                    scene.time.delayedCall(tree.type.lifeTime, () => {
                        gameState.trees.grow(tree, scene);
                    });
                    
                    scene.time.delayedCall(tree.type.lifeTime, () => {
                        gameState.trees.grow(tree, scene);
                    });

                    scene.time.delayedCall(tree.type.lifeTime, () => {
                        gameState.trees.grow(tree, scene);
                    });

                    //console.log(`${tree} has grown, it is now a ${tree.sprite.name}`)

                    //Drop acorns
                    let drops = Math.ceil(Math.random() * tree.type.dropRate);
                    for (let ind = 0; ind < drops; ind++){
                        scene.time.delayedCall(Math.floor(Math.random() * tree.type.lifeTime), () => {
                            var variance = 5;
                            gameState.actions.drop({ x: tree.sprite.x - variance + Math.random() * variance*2, y: 30 + tree.sprite.y - variance + Math.random() * variance * 2}, tree.type)
                        });
                    }

                } else if (tree.sprite.name === 'wholeling'){
                    
                    tree.sprite.destroy()
                    //console.log(`${tree} has died.`);

                } else {
                    console.log('an error has occurred in gameState.trees.grow()');
                }

                tree.step += 1
            }
        }

        //PLANT
        gameState.actions.plant = (attackNut, proj) => {
            //attackNut: The actual sprite being acted on
            //proj:      Projectile properties
            var treeBaby = this.add.sprite(attackNut.x, attackNut.y, 'sapling').setName('sapling');
            var newTree;
            newTree = {
                type:           proj,
                sprite:         treeBaby,
                step:           0,
                growCallback:   this.time.delayedCall(proj.growTime, () => {
                    gameState.trees.grow(newTree, this);
                })
            }
            gameState.trees.list.push(newTree);

        }


        //DROP
        gameState.actions.drop = (pt, proj) => {

            let fallDist = 85;

            var newNut = this.physics.add.sprite(pt.x, pt.y - fallDist, proj.name)
            newNut.setScale(0.35)
            

            newNut.anims.play('acornRotate');
            
            var dropTween = this.tweens.add({
                paused:     false,
                targets:    newNut,
                y:          newNut.y + fallDist,
                ease:       'Bounce',
                duration:   1000,
                repeat:     0,
                yoyo:       false,
                onComplete: () =>   {
                    if(newNut){

                        var nutCol = this.physics.add.collider(newNut, gameState.player.squirrel, () => {
                            newNut.destroy();
                            gameState.inventory.acorns.display.add(this, 1);
                        }) 
                        newNut.anims.stop();
                    }
                }
            });

        }

        for (let i = 1; i < 2; i++){
            gameState.actions.drop(gameState.world.getRandomPoint(), gameState.weapons.currentWeapon);
        }

        //#endregion
        

        // ===WORLD===
        //bgFloors
        //#region
        var bgFloor1     = this.add.rectangle(width/2, height*1.1, width*2, height, 0x00FF00, 1);
        var bgFloor2     = this.add.rectangle(width/2, height*1.1, width*2, height, 0x00FF00, 1);
        bgFloor1.setRotation(-0.1);
        bgFloor2.setRotation(0.1);

        var bgFloors = this.physics.add.staticGroup([bgFloor1, bgFloor2])
        //#endregion

        //Floors
        //#region
        var platforms = this.physics.add.staticGroup();
        var floor1 = platforms.create(game.config.width/2, game.config.height, 'floor').setScale(25,1).refreshBody();
        var floor2 = platforms.create(0, game.config.height-150, 'floor').setScale(.25,10).refreshBody();
        var floor3 = platforms.create(game.config.width, game.config.height-150, 'floor').setScale(.25,10).refreshBody();
        //#endregion

        //Roofs
        //#region
        var roofs = this.physics.add.staticGroup();
        var roof1 = roofs.create(400, 150,   'floor').setScale(25,10).refreshBody();
        var roof1 = roofs.create(400, 160,   'floor').setScale(20,10).refreshBody();
        var roof1 = roofs.create(400, 170,   'floor').setScale(15,10).refreshBody();
        var roof1 = roofs.create(400, 180,   'floor').setScale(10,10).refreshBody();
        var roof1 = roofs.create(400, 190,   'floor').setScale( 5,10).refreshBody();

        roofs.setVisible(false);
        //#endregion

        //stumps
        /*
        var stumps = this.physics.add.group({ allowGravity: false });
        var s1 = stumps.create(225,490, 'stump');
        var s2 = stumps.create(0,game.config.height, 'stump');
        */

        //world colliders
        //#region
        var plCol = this.physics.add.collider(gameState.player.squirrel, platforms, () => {

        });
        var roCol = this.physics.add.collider(gameState.player.squirrel, roofs, () => {
            gameState.player.touchingRoof = true;
        });
        var flCol = this.physics.add.collider(gameState.player.squirrel, bgFloors, () => {
            gameState.player.touchingRoof = false;
        });
        flCol.overlapOnly = true;
        //var stCol = this.physics.add.collider(gameState.player.squirrel, stumps, () => {

        //});
        //#endregion

        //layers
        //#region
        var charLayer = this.add.layer([ sqrl,
                                        shadow ]);

        var midLayer = this.add.layer([ 
                                          ])

        var bgLayer = this.add.layer([  floor1,
                                        floor2,
                                        floor3,
                                        bgFloor1,
                                        bgFloor2])
        
        charLayer.setDepth(0);
        midLayer.setDepth(1);
        bgLayer.setDepth(-2);
        //#endregion

        //debug
        //#region 
        this.physics.world.drawDebug = !this.physics.world.drawDebug;
        this.physics.world.debugGraphic.visible = this.physics.world.drawDebug;
        this.input.on('pointerdown', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.visible = this.physics.world.drawDebug;
        })
        //#endregion
    }

    update ()
    {	
        let left    = gameState.cursors.left.isDown;
        let right   = gameState.cursors.right.isDown;
        let up      = gameState.cursors.up.isDown;
        let down    = gameState.cursors.down.isDown;

        let jump = controls.jump.isDown;
        let attack = controls.attack.isDown;

        let horizontalInput = (left || right);
        let verticalInput = (up || down);
        let anyDirection   = (horizontalInput || verticalInput);

        let player = gameState.player;
        let squirrel = gameState.player.squirrel;
        let shadow = gameState.player.children.entries[1];

        if (attack) {
            if(gameState.inventory.acorns.display.count > 0 && !gameState.actions.attack.disabled) {
                gameState.inventory.acorns.display.add(this, -1);
                gameState.actions.attack();
            }
        }

        if (jump) {
            if(!player.jumping) {
                player.jumping = true;
                gameState.actions.jump();
            }
        }

        if (left)
        {
            player.setVelocityX(-squirrel.speed);
            squirrel.anims.play('sqrl-left', true);
            player.facing = 'left';
        }
        if (right)
        {			
            player.setVelocityX(squirrel.speed);
            squirrel.anims.play('sqrl-right', true);
            player.facing = 'right';
        }
        if (up && player.onGround && !player.touchingRoof)
        {
            player.setVelocityY(-squirrel.speed/2);
            if (!horizontalInput) { 
                squirrel.anims.play('sqrl-up', true)
                player.facing = 'up'; 
            }
        }
        if (down)
        {
            player.setVelocityY(squirrel.speed/2);
            if (!horizontalInput) { 
                squirrel.anims.play('sqrl-down', true)
                player.facing = 'down';  
            }
        }

        if (!anyDirection)
        {
            squirrel.anims.pause();
        } else {
            shadow.x = squirrel.x;
            if(!player.jumping){
                shadow.y = squirrel.y+25;
            }
        }

        //#region ==> Multiple controls at once...
        if (!left && !right || left && right)
        {
            player.setVelocityX(0);
        }
        if (!up && !down || up && down)
        {
            player.setVelocityY(0);
        }
        //#endregion
        if (gameState.actions.jumpHelper.y != gameState.actions.jumpHelper.lastY){
            let diff = gameState.actions.jumpHelper.lastY - gameState.actions.jumpHelper.y
            //squirrel.height = squirrel.height + diff
            squirrel.y -= diff;
            //console.log(squirrel.height);
            gameState.actions.jumpHelper.lastY = gameState.actions.jumpHelper.y
        }
        
        if (player.touchingRoof) {
            squirrel.y += 1;
            shadow.y += 1;
        }

        //gameState.inventory.display.update();

    }
}


var player = {
    squirrel:       {},
    shadow:         {},
    touchingRoof:   false,
    onGround:       false,
    jumping:        false,
    facing:         '',

}

var actions = {
    jumpHelper: {
        y:     '',
        lastY: ''
    }
}


var gameState = {
    trees: {
        list: [],
        grow: () => {}
    },
    inventory: {
        acorns: {
            display:    {
                count:      1,
                symbol:     '',
                sprites:    [],
                update(scene)    {

                    if (!this.symbol) {
                        this.symbol = scene.add.sprite(26, 36, 'acorn');
                        this.symbol.setScale(0.4)
                        this.symbol.anims.play('acornShake');
                    }

                    var countLen = this.count.toString().length;
                    let len = this.sprites.length

                    if (len < countLen) {
                        var newDigit = scene.add.text(30 + 20 * countLen, 30)
                        
                        this.sprites.push(newDigit);
                    } else if (len > countLen) {
                        let last = this.sprites.pop();
                        last.destroy();
                    } 

                    for (digit = 0; digit < countLen; digit++){

                        let valueAtDigit = this.count.toString().charAt(digit);
                        this.sprites[digit].setText(valueAtDigit);


                        //console.log(this.sprites[digit].value);
                    }

                },
                add(scene, num)    {
                    this.count += num;
                    this.update(scene);
                }
            }
        }
    },
    world:  {
        bounds:     {
            top:    390,
            left:   0,
            bottom: 650,
            right:  800
        },
        getRandomPoint() {
            var x = Math.floor(  Math.random() * this.bounds.right );
            var y = Math.floor(  Math.random() * (this.bounds.bottom - this.bounds.top)  )  + this.bounds.top;
            var pt  = {x, y}
            return pt;
        }
    },
    player: player,
    actions: actions,
    weapons: {}
}



var controls = {};


var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 650,
	backgroundColor: 0x80AADC,
    physics: {
        default: 'arcade',
        arcade: {
            //gravity:    { y: 500 },
            enableBody: true,
            debug: true
        }
    },
    scene: [GameScene]
};


let game = new Phaser.Game(config);