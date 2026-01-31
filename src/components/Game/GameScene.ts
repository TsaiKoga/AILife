import * as Phaser from 'phaser';
import { getAIDecision, getAIConversation } from '@/utils/ai';

export class GameScene extends Phaser.Scene {
  player: Phaser.Physics.Arcade.Sprite | any;
  npcs: Phaser.Physics.Arcade.Group | any;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | any;
  apiToken: string = '';
  playerData: any;
  dialogueText: Phaser.GameObjects.Text | any;
  dialogueContainer: Phaser.GameObjects.Container | any;
  isTalking: boolean = false;
  
  // NPC Update Index for Round Robin
  npcUpdateIndex: number = 0;

  // Available character sprites from Limezu pack
  characterTypes = ['Adam', 'Alex', 'Amelia', 'Bob'];

  constructor() {
    super('GameScene');
  }

  preload() {
    // 1. Load Map Tiles (Interiors 16x16)
    this.load.image('tiles', '/assets/Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png');
    this.load.image('room_builder', '/assets/Modern tiles_Free/Interiors_free/16x16/Room_Builder_free_16x16.png');

    // 2. Load Character Spritesheets
    this.characterTypes.forEach(name => {
      this.load.spritesheet(name, `/assets/Modern tiles_Free/Characters_free/${name}_16x16.png`, {
        frameWidth: 16,
        frameHeight: 32
      });
    });
  }

  create() {
    this.apiToken = this.registry.get('apiToken');
    this.playerData = this.registry.get('playerData');
    
    // Launch UI Scene
    this.scene.launch('UIScene');
    this.events.on('dialogue-closed', () => {
        this.isTalking = false;
    });

    // --- Create Animations (Updated based on Limezu full sheet) ---
    const WALK_START_INDEX = 24;

    this.characterTypes.forEach(name => {
        this.anims.create({
            key: `${name}-walk-right`,
            frames: this.anims.generateFrameNumbers(name, { start: WALK_START_INDEX, end: WALK_START_INDEX + 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: `${name}-walk-up`,
            frames: this.anims.generateFrameNumbers(name, { start: WALK_START_INDEX + 6, end: WALK_START_INDEX + 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: `${name}-walk-left`,
            frames: this.anims.generateFrameNumbers(name, { start: WALK_START_INDEX + 12, end: WALK_START_INDEX + 17 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: `${name}-walk-down`,
            frames: this.anims.generateFrameNumbers(name, { start: WALK_START_INDEX + 18, end: WALK_START_INDEX + 23 }),
            frameRate: 10,
            repeat: -1
        });
    });

    // 1. Create Map
    const mapWidth = 50;
    const mapHeight = 40;
    const tileSize = 16;

    const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: mapWidth, height: mapHeight });
    
    const tilesetBuilder = map.addTilesetImage('room_builder', undefined, 16, 16);
    const tilesetInteriors = map.addTilesetImage('tiles', undefined, 16, 16);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 1); 
    bg.fillRect(0, 0, mapWidth * tileSize * 3, mapHeight * tileSize * 3);

    // Create Layers
    const floorLayer = map.createBlankLayer('Floor', tilesetBuilder!, 0, 0);
    const wallsLayer = map.createBlankLayer('Walls', tilesetBuilder!, 0, 0);
    const decoLayer = map.createBlankLayer('Decoration', tilesetInteriors!, 0, 0);
    const furnitureLayer = map.createBlankLayer('Furniture', tilesetInteriors!, 0, 0); 

    // Room Dimensions
    const roomX = 10; 
    const roomY = 8;  
    const roomW = 20; 
    const roomH = 15; 

    if (floorLayer && wallsLayer && decoLayer && furnitureLayer) {
        // Floor
        floorLayer.fill(206, roomX, roomY, roomW, roomH); 

        // Walls
        for (let x = roomX; x < roomX + roomW; x++) wallsLayer.putTileAt(194, x, roomY - 1); 
        for (let x = roomX; x < roomX + roomW; x++) wallsLayer.putTileAt(24, x, roomY + roomH);
        for (let y = roomY - 1; y <= roomY + roomH; y++) {
            wallsLayer.putTileAt(7, roomX - 1, y); 
            wallsLayer.putTileAt(6, roomX + roomW, y); 
        }

        // Collision
        wallsLayer.setCollisionByExclusion([-1]);
        wallsLayer.setCollision([194, 24, 7, 6]); 

        // Windows
        const winBR = 405; 
        decoLayer.putTileAt(winBR - 17, roomX + 4, roomY - 2); 
        decoLayer.putTileAt(winBR - 16, roomX + 5, roomY - 2);
        decoLayer.putTileAt(winBR - 15, roomX + 6, roomY - 2);
        decoLayer.putTileAt(winBR - 1, roomX + 4, roomY - 1);
        decoLayer.putTileAt(winBR, roomX + 5, roomY - 1);
        decoLayer.putTileAt(winBR + 1, roomX + 6, roomY - 1);
        
        decoLayer.putTileAt(winBR - 17, roomX + 14, roomY - 2); 
        decoLayer.putTileAt(winBR - 16, roomX + 15, roomY - 2);
        decoLayer.putTileAt(winBR - 15, roomX + 16, roomY - 2);
        decoLayer.putTileAt(winBR - 1, roomX + 14, roomY - 1);
        decoLayer.putTileAt(winBR, roomX + 15, roomY - 1);
        decoLayer.putTileAt(winBR + 1, roomX + 16, roomY - 1);
        
        // Rugs
        const rugStart = 269;
        for (let rx = 0; rx < 3; rx++) {
            for (let ry = 0; ry < 4; ry++) {
                decoLayer.putTileAt(rugStart + rx + (ry * 16), roomX + 8 + rx, roomY + 6 + ry);
            }
        }

        // Furniture
        furnitureLayer.putTileAt(1102, roomX + 2, roomY + 2); 
        furnitureLayer.putTileAt(1103, roomX + 3, roomY + 2); 
        furnitureLayer.putTileAt(1118, roomX + 2, roomY + 3); 
        furnitureLayer.putTileAt(1119, roomX + 3, roomY + 3); 
        furnitureLayer.putTileAt(1134, roomX + 2, roomY + 4); 
        furnitureLayer.putTileAt(1135, roomX + 3, roomY + 4); 

        furnitureLayer.putTileAt(215, roomX + 8, roomY + 6); 
        furnitureLayer.putTileAt(216, roomX + 9, roomY + 6); 
        furnitureLayer.putTileAt(217, roomX + 10, roomY + 6); 
        furnitureLayer.putTileAt(231, roomX + 8, roomY + 7); 
        furnitureLayer.putTileAt(232, roomX + 9, roomY + 7); 
        furnitureLayer.putTileAt(233, roomX + 10, roomY + 7); 

        furnitureLayer.putTileAt(732, roomX + roomW - 2, roomY + 1);
        furnitureLayer.putTileAt(748, roomX + roomW - 2, roomY + 2); 
        
        furnitureLayer.setCollision([1102, 1103, 1118, 1119, 1134, 1135, 215, 216, 217, 231, 232, 233, 732, 748]);
        
        decoLayer.setDepth(5);       
        furnitureLayer.setDepth(10); 
    }
    
    // 2. Scale
    this.cameras.main.setZoom(3);
    this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

    // 3. Create Player
    const spawnX = (roomX + 4) * 16;
    const spawnY = (roomY + 4) * 16;
    const playerSkin = this.characterTypes[Math.floor(Math.random() * this.characterTypes.length)];
    this.player = this.createCharacterSprite(spawnX, spawnY, playerSkin, 3);
    this.player.setData('skin', playerSkin);
    
    // Create Name Tag for Player
    const nameText = this.add.text(0, 0, this.playerData.name, {
        fontSize: '10px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        fontFamily: 'monospace'
    }).setOrigin(0.5, 1);
    this.player.setData('nameTag', nameText);
    nameText.setDepth(21);

    this.cameras.main.startFollow(this.player);
    this.player.setDepth(20); 

    // 4. Create Remote Players Group (Initially empty, to be populated by multiplayer logic)
    this.npcs = this.physics.add.group();
    
    // NOTE: NPCs removed as per request. Only real users (via multiplayer sync) will appear here.

    // 5. Collisions
    this.physics.add.collider(this.player, this.npcs, this.handleCollision, undefined, this);
    this.physics.add.collider(this.npcs, this.npcs); // Bounce
    if (wallsLayer) this.physics.add.collider(this.player, wallsLayer);
    if (wallsLayer) this.physics.add.collider(this.npcs, wallsLayer);
    if (decoLayer) this.physics.add.collider(this.player, decoLayer);
    if (decoLayer) this.physics.add.collider(this.npcs, decoLayer);
    if (furnitureLayer) this.physics.add.collider(this.player, furnitureLayer);
    if (furnitureLayer) this.physics.add.collider(this.npcs, furnitureLayer);

    // 6. Update Loop for AI Decisions
    this.time.addEvent({ delay: 1000, callback: this.updateAIDecisions, callbackScope: this, loop: true });
  }

  createCharacterSprite(x: number, y: number, skin: string, startFrame: number) {
    const sprite = this.physics.add.sprite(x, y, skin, startFrame); 
    sprite.setCollideWorldBounds(true);
    sprite.body.setSize(10, 10); 
    sprite.body.setOffset(3, 22);
    return sprite;
  }

  playWalkAnimation(sprite: Phaser.Physics.Arcade.Sprite) {
    const skin = sprite.getData('skin') || 'Adam'; 
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    
    const velocity = body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed < 0.1) {
        if (sprite.anims.currentAnim && sprite.anims.currentAnim.key.includes('walk')) {
             sprite.anims.stop();
        }
        return;
    }

    let animKey = '';
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
        if (velocity.x > 0) animKey = `${skin}-walk-right`;
        else animKey = `${skin}-walk-left`;
    } else {
        if (velocity.y > 0) animKey = `${skin}-walk-down`;
        else animKey = `${skin}-walk-up`;
    }

    if (sprite.anims.currentAnim?.key !== animKey) {
        sprite.anims.play(animKey, true);
    }
  }

  update() {
    if (this.player) {
        this.playWalkAnimation(this.player);
        const nameTag = this.player.getData('nameTag');
        if (nameTag) nameTag.setPosition(this.player.x, this.player.y - 10);
    }
    if (this.npcs) {
        this.npcs.getChildren().forEach((npc: any) => {
            this.playWalkAnimation(npc);
            const nameTag = npc.getData('nameTag');
            if (nameTag) nameTag.setPosition(npc.x, npc.y - 10);
        });
    }
  }

  async updateAIDecisions() {
    if (this.isTalking) return;

    // 1. Player Decision (Always update)
    const nearbyNPCs = this.npcs.getChildren().filter((npc: any) => {
        return Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < 80; // Increased range
    });
    const nearbyNames = nearbyNPCs.map((npc: any) => npc.getData('name'));
    
    // Get Pending Message for Player (if any)
    const playerIncoming = this.player.getData('incomingMessage');

    // We use a simple check to avoid flooding API if player is moving? 
    // Or just let it run every second (it's okay for one agent).
    getAIDecision(this.apiToken, {
      name: this.playerData.name,
      health: this.playerData.health,
      hunger: this.playerData.hunger,
      personality: this.playerData.personality,
      x: this.player.x / 16, 
      y: this.player.y / 16,
      nearby: nearbyNames,
      incomingMessage: playerIncoming // Pass incoming message
    }).then(decision => {
        if (playerIncoming) this.player.setData('incomingMessage', null); // Clear message after processing

        if (this.isTalking) return; // Check again async
        const speed = 60;
        this.player.setVelocity(0);

        if (decision.action === 'move') {
          if (decision.direction === 'up') this.player.setVelocityY(-speed);
          else if (decision.direction === 'down') this.player.setVelocityY(speed);
          else if (decision.direction === 'left') this.player.setVelocityX(-speed);
          else if (decision.direction === 'right') this.player.setVelocityX(speed);
        } 
        else if (decision.action === 'talk') {
            this.isTalking = true;
            this.player.setVelocity(0);
            
            const content = decision.content || "...";
            const targetName = decision.target;
            const fullText = `${this.playerData.name} (Me):\n\n"${content}"\n\n(Click to close)`;
            this.events.emit('show-dialogue', { text: fullText });
            
            // Send Message to Target NPC
            if (targetName) {
                const targetNPC = this.npcs.getChildren().find((n: any) => n.getData('name') === targetName);
                if (targetNPC) {
                    targetNPC.setData('incomingMessage', { sender: this.playerData.name, content: content });
                }
            }
        }
    }).catch(console.error);
    
    // 2. NPC Decisions (Skipped as no NPCs)
    // const npcsArray = this.npcs.getChildren();
    // ...
  }

  async handleCollision(player: any, npc: any) {
    if (this.isTalking) return;
    
    this.isTalking = true;
    player.setVelocity(0);
    npc.setVelocity(0);
    player.anims.stop();
    npc.anims.stop();

    // Show "Thinking..." via UI Scene
    this.events.emit('show-dialogue', { text: "AI is thinking..." });

    const pPersonality = this.playerData.personality;
    const nPersonality = npc.getData('personality');
    const nName = npc.getData('name'); // Updated to use 'name'

    const response = await getAIConversation(
      this.apiToken, 
      pPersonality, 
      nPersonality, 
      "We bumped into each other in town."
    );

    const fullText = `${nName} (${nPersonality}):\n\n"${response}"\n\n(Click to close)`;
    this.events.emit('show-dialogue', { text: fullText });
    
    // Bounce
    const angle = Phaser.Math.Angle.Between(player.x, player.y, npc.x, npc.y);
    const bounce = 20;
    player.x -= Math.cos(angle) * bounce;
    player.y -= Math.sin(angle) * bounce;
  }
}
