var game = new Phaser.Game(600,800);

var mainState = {

    preload: function() { //for loading assets etc
        //load the main rocket image and save as 'player'
        game.load.image('player', 'assets/PNG/Sprites/Ships/spaceship.png'); 
    },

    create: function() {
        game.stage.backgroundColor = '#040114'; //change background colour
        game.physics.startSystem(Phaser.Physics.ARCADE); //setting physics type
        game.world.enableBody = true;



        this.player = game.add.sprite(300, 700, 'player');this.player.scale.setTo(0.5,0.5); //add and rescale
       // second = entity('player', 400, 400, 100);

        this.player.anchor.setTo(0.5,0.5);
        // game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.allowRotation = false;
        this.cursor = game.input.keyboard.createCursorKeys(); //cursor object to detect key presses

        this.wasd = {
              up: game.input.keyboard.addKey(Phaser.Keyboard.W),
              down: game.input.keyboard.addKey(Phaser.Keyboard.S),
              left: game.input.keyboard.addKey(Phaser.Keyboard.A),
              right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };


    },
    update: function() {
        //setting initial speed and moving speed
        this.player.rotation = game.physics.arcade.angleToPointer(this.player);
        var speed = 322;//moving speed
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;

        if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.player.body.velocity.y -= speed;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.body.velocity.y += speed;
        }
        
        if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.velocity.x -= speed;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x += speed;
        }

        this.player.body.collideWorldBounds = true;

    }
};

function entity(name, x, y, hp)
{

    game.add.sprite(x, y, name);this.scale.setTo(0.5,0.5); //add and rescale

    return this;
}

game.state.add('main', mainState);
game.state.start('main');
