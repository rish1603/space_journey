class Ship {

    constructor() {
	this.sprite = game.add.sprite(0, 100, 'player');
	this.sprite.scale.setTo(0.5, 0.5);
	game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	this.sprite.anchor.setTo(0.5,0.5);
	this.sprite.animations.add('kaboom');
	this.sprite.rotation = Math.PI / 2;
	this.fireRate = 500;
	this.nextFire = 0;

	this.hp = 100;
	this.initHP = 100;
	this.scale = 0.5;

	this.healthBar = new HealthBar(game, {
	    x: 0,
	    y: 0,
	    width: this.sprite.width,
	    height: 10,
	    bg: {color: "#BDC3C7"}, // Grey
	    bar:{color: "#26A65B"}
	});

	var sprite = this.sprite;
	this.healthBar.getX = () => { return sprite.x }
	this.healthBar.getY = () => { return sprite.y  - sprite.height/1.5}
    }

    // Fire a bullet
    fire(direction, force) {

	// Additional direction
	direction = direction || 0;
	force = force || false;

	if (game.time.now > this.nextFire && bullets.countDead() > 0 || force)
	{
	    this.nextFire = game.time.now + this.fireRate;
	    var bullet = bullets.getFirstDead();
	    bullet.owner = this;
	    bullet.reset(this.sprite.x, this.sprite.y);
	    bullet.rotation = (Math.PI * direction / 180) + this.sprite.rotation + Math.PI / 2;
	    game.physics.arcade.velocityFromAngle(bullet.angle - 90, 400, bullet.body.velocity);
	    gunfire.play();
	}
    }

    die() {
	var sprite = this.sprite;
	var healthBar = this.healthBar;
	var deathTween = game.add.tween(this.sprite)
	deathTween.to( { alpha: 0.5 }, 100, Phaser.Easing.Linear.None, true, 0);
	deathTween.onComplete.add(() => {sprite.kill(); healthBar.kill()});

	enemies.splice(enemies.indexOf(this), 1);
	numKills++;
	scoreText.text = "Score: " + numKills;

	explosion.play();
    }

}

class Enemy extends Ship {
    constructor() {
	super();
    }
    update() {
	this.healthBar.setPosition(this.healthBar.getX(), this.healthBar.getY());
    }
}

class Player extends Ship {

    constructor() {
	super();
	this.sprite.anchor.setTo(0.5,0.5);
	this.sprite.y = game.world.height - 100;
	this.sprite.x = game.width/2;
	this.fireRate = playerFireRate;
	game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	this.sprite.body.allowRotation = false;

	this.hp = 1000;
	this.initHP = 1000;
    }

    update() {
	//setting initial speed and moving speed
	this.sprite.rotation = game.physics.arcade.angleToPointer(this.sprite);
	this.healthBar.setPosition(this.healthBar.getX(), this.healthBar.getY());
	var speed = 322;//moving speed
	this.sprite.body.velocity.y = 0;
	this.sprite.body.velocity.x = 0;

	if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
	    this.sprite.body.velocity.y -= speed;
	} else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
	    this.sprite.body.velocity.y += speed;
	}

	if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
	    this.sprite.body.velocity.x -= speed;
	} else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
	    this.sprite.body.velocity.x += speed;
	}

	this.sprite.body.collideWorldBounds = true;
    }
}


class HorizontalAIEnemy extends Enemy {
    constructor() {
	super();
	this.sprite.x = this.sprite.width/2;
	this.sprite.scale = {x: 0.3, y: 0.3};
	this.direction = 2;
	this.lastFire = game.time;
    }

    update() {
	super.update();
	this.sprite.x += this.direction;
	if (this.sprite.x > game.width-this.sprite.width/2) {
	    this.direction = -Math.abs(this.direction);
	}
	if (this.sprite.x < this.sprite.width/2) {
	    this.direction = Math.abs(this.direction);
	}

	// This will be auto rate limited
	this.fire();
    }
}

class FourWay extends Enemy {

    constructor() {
	super();
	this.sprite.loadTexture('4way');
	this.sprite.rotation = 0;
	this.fireRate = 500;
	this.hp = 100;
	this.initHP = 100;

	this.ydirec = 2;
	this.xdirec = -2;
    }

    fire() {
	if (game.time.now > this.nextFire && bullets.countDead() > 0)
	{
	    this.nextFire = game.time.now + this.fireRate;
	    super.fire(0, true);
	    super.fire(90, true);
	    super.fire(180, true);
	    super.fire(270, true);
	}
    }

    update() {
	super.update();

	this.sprite.y += this.ydirec;
	this.sprite.x += this.xdirec;

	if (this.sprite.x > game.width-this.sprite.width/2 || this.sprite.x < this.sprite.width/2) {
	    this.xdirec = -this.xdirec;
	}
	if (this.sprite.y > game.height-this.sprite.height/2 || this.sprite.y < this.sprite.height) {
	    this.ydirec = -this.ydirec;
	}
	this.fire();
    }
}


class Meteor extends Enemy {

    constructor() {
	super();
	this.sprite.loadTexture('meteor');

	this.hp = 150;
	this.initHP = 150;

	this.ydirec = 2;
	this.xdirec = 2;
    }

    update() {
	super.update();
	this.sprite.y += this.ydirec;
	this.sprite.x += this.xdirec;

	if (this.sprite.x > game.width-this.sprite.width/2 || this.sprite.x < this.sprite.width/2) {
	    this.xdirec = -this.xdirec;
	}
	if (this.sprite.y > game.height-this.sprite.height/2 || this.sprite.y < this.sprite.height) {
	    this.ydirec = -this.ydirec;
	}

    }
}

class Boss extends Enemy {
    constructor() {
	super();
	this.sprite.rotation = 0;
	this.sprite.loadTexture('boss');
	this.sprite.x = this.sprite.width/2;
	this.sprite.scale = {x: 1, y: 1};
	this.direction = 2;
	this.lastFire = game.time;

	this.hp = 1000;
	this.initHP = 1000;
    }

    update() {
	super.update();
	this.sprite.x += this.direction;
	if (this.sprite.x > game.width-this.sprite.width/2) {
	    this.direction = -Math.abs(this.direction);
	}
	if (this.sprite.x < this.sprite.width/2) {
	    this.direction = Math.abs(this.direction);
	}

	this.healthBar.setPosition(
	    this.healthBar.getX(),
	    this.sprite.y + 60
	);


	// This will be auto rate limited
	this.fire(90);
    }

    fire() {
	if (game.time.now > this.nextFire && bullets.countDead() > 0)
	{
	    this.nextFire = game.time.now + this.fireRate;
	    super.fire(70, true);
	    super.fire(80, true);
	    super.fire(90, true);
	    super.fire(100, true);
	    super.fire(110, true);
	}
    }
}
