import * as Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  dialogueContainer: Phaser.GameObjects.Container | any;
  dialogueText: Phaser.GameObjects.Text | any;
  
  // Scroll State
  textStartY: number = 0;
  viewportHeight: number = 0;
  viewportX: number = 0;
  viewportY: number = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.createDialogueBox();
    
    // Listen for events from GameScene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('show-dialogue', this.showDialogue, this);
    gameScene.events.on('hide-dialogue', this.hideDialogue, this);
    
    // Scroll Event
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
        if (!this.dialogueContainer.visible) return;
        
        const textHeight = this.dialogueText.height;
        if (textHeight <= this.viewportHeight) return;

        // Scroll
        this.dialogueText.y -= deltaY * 0.5;
        
        // Clamp
        const minY = this.textStartY - (textHeight - this.viewportHeight);
        const maxY = this.textStartY;
        
        if (this.dialogueText.y < minY) this.dialogueText.y = minY;
        if (this.dialogueText.y > maxY) this.dialogueText.y = maxY;
    });
  }

  createDialogueBox() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.dialogueContainer = this.add.container(0, 0).setVisible(false);
    
    // Background
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0xffffff, 0.9);
    bgGraphics.lineStyle(4, 0x000000, 1);
    
    const boxH = 150;
    const boxW = Math.min(width - 40, 600); // Max width 600
    const boxX = (width - boxW) / 2;
    const boxY = height - boxH - 40;
    
    bgGraphics.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
    bgGraphics.strokeRoundedRect(boxX, boxY, boxW, boxH, 10);
    
    // Scroll/View Config
    this.textStartY = boxY + 20;
    this.viewportHeight = boxH - 40;
    this.viewportX = boxX + 20;
    this.viewportY = boxY + 20;

    // Text
    this.dialogueText = this.add.text(this.viewportX, this.textStartY, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#000000',
        wordWrap: { width: boxW - 40 }
    });
    
    // Mask for Scrolling
    const maskShape = this.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(this.viewportX, this.viewportY, boxW - 40, this.viewportHeight);
    const mask = maskShape.createGeometryMask();
    this.dialogueText.setMask(mask);
    
    // Add Click to Close Area (Transparent Zone behind/around text)
    // We attach event to the scene input, but checking bounds?
    // Or just keep the simple "click anywhere" logic but ignore if dragging (if implemented)
    // For now, click anywhere closes it.
    
    this.dialogueContainer.add([bgGraphics, this.dialogueText]);
    
    // Close on click (anywhere in UI scene)
    this.input.on('pointerdown', () => {
        if (this.dialogueContainer.visible) {
            // Notify GameScene to resume
            this.scene.get('GameScene').events.emit('dialogue-closed');
            this.hideDialogue();
        }
    });
  }

  showDialogue(data: { text: string }) {
    this.dialogueText.setText(data.text);
    this.dialogueText.y = this.textStartY; // Reset scroll
    this.dialogueContainer.setVisible(true);
  }

  hideDialogue() {
    this.dialogueContainer.setVisible(false);
  }
}
