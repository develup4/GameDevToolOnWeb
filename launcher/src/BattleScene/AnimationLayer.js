/**
 * Created by GNSSM_JBW on 2014-05-14.
 */

var AnimationLayer = cc.Layer.extend({
    SceneInfo: null,

    UnitData: null,
    AnimationData: null,
    ActionData: null,

    Player: null,
    Enemy: null,

    SelectedUnit: null,
    SelectedUnitAnim: null,
    SelectedUnitAction: null,

    TargetUnit: null,
    TargetUnitAnim: null,
    TargetUnitAction: null,

    tileSize: 64,
    animSpeed: 0.05,
    currentTime: 0,

    ArrowSpriteSheet: null,
    ArrowAnimation: [],

    flag: false,
    isPlayerTurn: false,
    isCharacterSelect: false,
    isCharacterMoving: false,
    isCharacterAttacking: false,
    isAIAction: false,
    totalActionCount: 0,
    currentDirection: null,

    stateSuffix: [
        "IdleBack.", "IdleFront.", "IdleLeft.", "IdleRight.",
        "MoveBack.", "MoveFront.", "MoveLeft.", "MoveRight.",
        "AttackBack.", "AttackFront.", "AttackLeft.", "AttackRight.",
        "HitBack.", "HitFront.", "HitLeft.", "HitRight."
    ],

    ctor: function () {
        this._super();
    },

    dataInput: function (sceneInfo) {
        this.init(sceneInfo);
        this.SceneInfo = sceneInfo;
        var lastUpdate = Date.now();
        var myInterval = setInterval(tick, 0);

        function tick() {
            var now = Date.now();
            var dt = now - lastUpdate;
            lastUpdate = now;

            var speed = this.GameCamera.CameraSpeed * dt;
            AnimationLayer.GameUpdate(speed / 1000);
        }

        setInterval(tick, 0);
    },

    init: function (sceneInfo) {
        pathFinder.init(sceneInfo.battleMapMovable);

        if ('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
        }

        if ('keyboard' in sys.capabilities) {
            this.setKeyboardEnabled(true);
        }

        this.UnitData = new Array();
        this.Player = new Array();
        this.Enemy = new Array();
        this.ArrowAnimationSetting();

        var count = 0;
        for (var i = 0; i < sceneInfo.battleObjects.length; i++) {
            if(!(sceneInfo.battleObjects[i].position.x < 0 || sceneInfo.battleObjects[i].position.y < 0)) {
                this.UnitData[count] = new Array();
                this.UnitData[count] = sceneInfo.battleObjects[i];
                this.UnitData[count].myTurnArrow = new cc.Sprite;
                count++;
            }
        }

        this.AnimationData = new Array();
        this.ActionData = new Array();
        for (var i = 0; i < this.UnitData.length; i++) {
            this.UnitData[i].moveCount = 0;
            this.AnimationData[i] = new Array();
            this.ActionData[i] = new Array();

            if(this.UnitData[i].isEnemy == false){
                this.Player.push(this.UnitData[i]);
            }
            else{
                this.Enemy.push(this.UnitData[i]);
            }

            for (var j = 1; j <= 16; j++) {
                var SpriteSheet;
                var totalFrame;

                switch ((j - 1) >> 2){
                    case 0 :
                        if(this.UnitData[i].sprite.isSpriteUpload.idle[(j - 1) >> 2] == false){
                            SpriteSheet = cc.TextureCache.getInstance().
                                addImage("../repo/default/battleObject/" + this.stateSuffix[j - 1] + "png");
                            totalFrame = 9;
                        }
                        else {
                            SpriteSheet = cc.TextureCache.getInstance().addImage("../repo/demoProject/" + sceneInfo.name +  "/objects/" +
                                this.UnitData[i].name + "/" + this.stateSuffix[j - 1] + this.UnitData[i].sprite.ext.idle[(j - 1) % 4]);
                            totalFrame = this.UnitData[i].sprite.frameCount.idle[(j - 1) >> 2];
                        }
                        break;

                    case 1 :
                        if(this.UnitData[i].sprite.isSpriteUpload.move[(j - 1) >> 2]  == false){
                            SpriteSheet = cc.TextureCache.getInstance().
                                addImage("../repo/default/battleObject/" + this.stateSuffix[j - 1] + "png");
                            totalFrame = 9;
                        }
                        else {
                            SpriteSheet = cc.TextureCache.getInstance().addImage("../repo/demoProject/" + sceneInfo.name + "/objects/" +
                                this.UnitData[i].name + "/" + this.stateSuffix[j - 1] + this.UnitData[i].sprite.ext.move[(j - 1) % 4]);
                            totalFrame = this.UnitData[i].sprite.frameCount.move[(j - 1) >> 2];
                        }
                        break;

                    case 2 :
                        if(this.UnitData[i].sprite.isSpriteUpload.attack[(j - 1) >> 2]  == false){
                            SpriteSheet = cc.TextureCache.getInstance().
                                addImage("../repo/default/battleObject/" + this.stateSuffix[j - 1] + "png");
                            totalFrame = 12;
                        }
                        else {
                            SpriteSheet = cc.TextureCache.getInstance().addImage("../repo/demoProject/" + sceneInfo.name + "/objects/" +
                                this.UnitData[i].name + "/" + this.stateSuffix[j - 1] + this.UnitData[i].sprite.ext.attack[(j - 1) % 4]);
                            totalFrame = this.UnitData[i].sprite.frameCount.attack[(j - 1) >> 2];
                        }
                        break;

                    case 3 :
                        if(this.UnitData[i].sprite.isSpriteUpload.hit[(j - 1) >> 2] == false){
                            SpriteSheet = cc.TextureCache.getInstance().
                                addImage("../repo/default/battleObject/" + this.stateSuffix[j - 1] + "png");
                            totalFrame = 12;
                        }
                        else {
                            SpriteSheet = cc.TextureCache.getInstance().addImage("../repo/demoProject/" + sceneInfo.name + "/objects/" +
                                this.UnitData[i].name + "/" + this.stateSuffix[j - 1] + this.UnitData[i].sprite.ext.hit[(j - 1) % 4]);
                            totalFrame = this.UnitData[i].sprite.frameCount.hit[(j - 1) >> 2];
                        }
                        break;
                }

                var frame = [];
                this.AnimationData[i][j - 1] = new Array();
                this.ActionData[i][j - 1] = new Array();
                for (var k = 0; k < totalFrame; k++) {
                    switch ((j - 1) >> 2) {
                        case 0 : frame[k] = cc.SpriteFrame.createWithTexture(SpriteSheet,
                            cc.rect((sceneInfo.battleObjects[i].sprite.frameWidth.idle[(j - 1) % 4] / totalFrame) * k,
                                0, sceneInfo.battleObjects[i].sprite.frameWidth.idle[(j - 1) % 4] / totalFrame,
                                sceneInfo.battleObjects[i].sprite.frameHeight.idle[(j - 1) % 4]));
                            break;

                        case 1 : frame[k] = cc.SpriteFrame.createWithTexture(SpriteSheet,
                            cc.rect((sceneInfo.battleObjects[i].sprite.frameWidth.move[(j - 1) % 4] / totalFrame) * k,
                                0, sceneInfo.battleObjects[i].sprite.frameWidth.move[(j - 1) % 4] / totalFrame,
                                sceneInfo.battleObjects[i].sprite.frameHeight.move[(j - 1) % 4]));
                            break;

                        case 2 : frame[k] = cc.SpriteFrame.createWithTexture(SpriteSheet,
                            cc.rect((sceneInfo.battleObjects[i].sprite.frameWidth.attack[(j - 1) % 4] / totalFrame) * k,
                                0, sceneInfo.battleObjects[i].sprite.frameWidth.attack[(j - 1) % 4] / totalFrame,
                                sceneInfo.battleObjects[i].sprite.frameHeight.attack[(j - 1) % 4]));
                            break;

                        case 3 : frame[k] = cc.SpriteFrame.createWithTexture(SpriteSheet,
                            cc.rect((sceneInfo.battleObjects[i].sprite.frameWidth.hit[(j - 1) % 4] / totalFrame) * k,
                                0, sceneInfo.battleObjects[i].sprite.frameWidth.hit[(j - 1) % 4] / totalFrame,
                                sceneInfo.battleObjects[i].sprite.frameHeight.hit[(j - 1) % 4]));
                            break;
                    }

                    this.AnimationData[i][j - 1][k] = frame[k];
                }

                var animation = cc.Animation.create(this.AnimationData[i][j-1], this.animSpeed);
                var animate = cc.Animate.create(animation);

                this.ActionData[i][j-1] = cc.RepeatForever.create(animate);
            }

            this.UnitData[i].state = 0;
            this.AnimationData[i].sprite = cc.Sprite.createWithSpriteFrame(this.AnimationData[i][this.UnitData[i].direction][0]);
            this.UnitData[i].coordinateX = (this.UnitData[i].position.x * this.tileSize) + (this.tileSize / 2);
            this.UnitData[i].coordinateY = (this.UnitData[i].position.y * this.tileSize) + (this.tileSize / 2);
            this.AnimationData[i].sprite.setPosition(cc.p(this.UnitData[i].coordinateX, this.UnitData[i].coordinateY));
            this.AnimationData[i].sprite.setAnchorPoint(cc.p(0.5, 0));
            pathFinder.Map[this.UnitData[i].position.x + (this.UnitData[i].position.y * pathFinder.MapSize.width)] = false;
            this.addChild(this.AnimationData[i].sprite, (BackgroundLayer.backgroundHeight / this.tileSize) - this.UnitData[i].position.y + 1, i);

            this.AnimationData[i].sprite.runAction(this.ActionData[i][this.UnitData[i].direction]);
        }

        this.flag = true;
        this.TurnChange(sceneInfo);
        this.scheduleUpdate();

        return true;
    },

    SceneChange : function(){
        var tempNum = this.UnitData.length;
        for(var i=0; i<=tempNum; i++){
            if(this.getChildByTag(i) != null) {
                this.removeChildByTag(i, true);
            }
        }

        this.SceneInfo = null;
        this.UnitData = null;
        this.AnimationData = null;
        this.ActionData = null;
        this.Player = null;
        this.Enemy = null;
        this.SelectedUnit = null;
        this.SelectedUnitAnim = null;
        this.SelectedUnitAction = null;
        this.TargetUnit = null;
        this.TargetUnitAnim = null;
        this.TargetUnitAction = null;
        this.tileSize = 64;
        this.animSpeed = 0.1;
        this.currentTime = 0;
        this.flag = false;
        this.isPlayerTurn = false;
        this.isCharacterSelect = false;
        this.isCharacterMoving = false;
        this.isCharacterAttacking = false;
        this.isAIAction = false;
        this.totalActionCount = 0;
        this.currentDirection = null;
    },

    GameUpdate: function (dt) {
        if (this.flag == true) {
            if (GameCamera.isMoved == true) {
                for (var i = 0; i < this.UnitData.length; i++) {
                    this.UnitData[i].displayX = this.UnitData[i].coordinateX - GameCamera.currentX;
                    this.UnitData[i].displayY = this.UnitData[i].coordinateY - GameCamera.currentY;

                    this.AnimationData[i].sprite.setPosition(cc.p(this.UnitData[i].displayX, this.UnitData[i].displayY));
                    this.AnimationData[i].sprite.setAnchorPoint(cc.p(0.5, 0));
                }
            }

            if(this.isPlayerTurn == false && this.isAIAction == false){
                for(var i=0; i<this.UnitData.length; i++){
                    if(this.UnitData[i].isEnemy == true && this.UnitData[i].moveCount > 0){
                        this.SelectedUnit = this.UnitData[i];
                        this.SelectedUnitAnim = this.AnimationData[i];
                        this.SelectedUnitAction = this.ActionData[i];

                        var tempDist = 10000;
                        for(var j=0; j<this.UnitData.length; j++){
                            if(this.UnitData[j].isEnemy == false && this.UnitData[i].moveCount > 0){
                                if(tempDist > getDistance(this.SelectedUnit.position, this.UnitData[j].position)){
                                    tempDist = getDistance(this.SelectedUnit.position, this.UnitData[j].position);
                                    this.TargetUnit = this.UnitData[j];
                                    this.TargetUnitAnim = this.AnimationData[j];
                                    this.TargetUnitAction = this.ActionData[j];
                                }
                            }
                        }

                        if(tempDist != 10000) {
                            if (tempDist <= this.SelectedUnit.status.dex + 2) {
                                this.isCharacterMoving = true;
                                this.isCharacterAttacking = true;
                                this.isAIAction = true;
                                this.SelectedUnit.moveCount--;

                                pathFinder.FindPath(this.SelectedUnit.position.x, this.SelectedUnit.position.y, this.SelectedUnit.status.dex);
                                var tempPos = pathFinder.AttackablePos(this.TargetUnit.position);
                                pathFinder.CharacterMove(tempPos.x, tempPos.y, tempPos.n);
                                pathFinder.DeletePath();
                                pathFinder.destination = {x : tempPos.x, y : tempPos.y};
                                pathFinder.PlayAnimation();
                                this.SelectedUnitAnim.sprite.removeChild(this.SelectedUnit.myTurnArrow);
                                if(this.totalActionCount == 0){
                                    //pathFinder.TurnChange(this.SceneInfo);
                                }
                                break;
                            }
                            else {
                                this.isCharacterMoving = true;
                                this.isAIAction = true;
                                this.SelectedUnit.moveCount--;

                                pathFinder.DeletePath();
                                pathFinder.FindPath(this.SelectedUnit.position.x, this.SelectedUnit.position.y, this.SelectedUnit.status.dex);

                                var minN = 10000;
                                for (var i = 0; i < pathFinder.Step.length; i++) {
                                    if (pathFinder.Step[i] < minN && pathFinder.Step[i] != pathFinder.disableValue
                                            && pathFinder.Step[i] >= 0){
                                        minN = pathFinder.Step[i];
                                    }
                                }

                                var minCell = new Array();
                                for (var i = 0; i < pathFinder.Step.length; i++) {
                                    if (pathFinder.Step[i] == minN) {
                                        var tempX = Math.floor(i % (BackgroundLayer.backgroundWidth / this.tileSize));
                                        var tempY = Math.floor(i / (BackgroundLayer.backgroundWidth / this.tileSize));

                                        if(pathFinder.Map[tempX + (tempY * pathFinder.MapSize.width)] == true)
                                            minCell.push({x: tempX, y: tempY});
                                    }
                                }

                                var resultDist = 0;
                                var resultCell = null;
                                for (var i = 0; i < minCell.length; i++) {
                                    if (i == 0) {
                                        resultDist = getDistance(this.TargetUnit.position, minCell[i]);
                                        resultCell = minCell[i];
                                    }
                                    else {
                                        if (resultDist > getDistance(this.TargetUnit.position, minCell[i])) {
                                            resultDist = getDistance(this.TargetUnit.position, minCell[i]);
                                            resultCell = minCell[i];
                                        }
                                    }
                                }

                                this.isCharacterMoving = true;
                                pathFinder.CharacterMove(resultCell.x, resultCell.y, pathFinder.Step[
                                    resultCell.x + (resultCell.y * pathFinder.MapSize.width)]);
                                pathFinder.DeletePath();
                                pathFinder.PlayAnimation();
                                this.SelectedUnitAnim.sprite.removeChild(this.SelectedUnit.myTurnArrow, true);
                                if(this.totalActionCount == 0){
                                    pathFinder.TurnChange(this.SceneInfo);
                                }
                                break;
                            }
                        }
                    }
                }
            }

            if(this.isCharacterMoving == true || this.isCharacterAttacking == true){
                if(this.isCharacterAttacking == true) {
                    if (this.SelectedUnit.state == 2) {
                        this.currentTime += dt / 1000;
                        if (this.currentTime >= this.totalAnimTime * 0.66) {
                            this.SelectedUnitAnim.sprite.stopAllActions();
                            this.SelectedUnitAnim.sprite.runAction(this.SelectedUnitAction[this.SelectedUnit.direction]);
                            this.SelectedUnit.state = 0;

                            var tempDirection = this.SelectedUnit.direction % 2 == 0 ? this.SelectedUnit.direction + 1 : this.SelectedUnit.direction - 1;
                            this.totalAnimTime = this.animSpeed * this.TargetUnitAnim[12 + tempDirection].length;
                            this.TargetUnit.state = 3;
                            this.TargetUnit.direction = tempDirection;
                            this.TargetUnitAnim.sprite.stopAllActions();
                            this.TargetUnitAnim.sprite.runAction(this.TargetUnitAction[12 + this.TargetUnit.direction]);
                            SoundManager.playEffect("../repo/default/hit.wav", false);

                            this.currentTime = 0;
                        }
                    }
                    else if (this.TargetUnit.state == 3) {
                        this.currentTime += dt / 1000;
                        if (this.currentTime >= this.totalAnimTime * 0.66) {
                            this.TargetUnitAnim.sprite.stopAllActions();
                            this.TargetUnitAnim.sprite.runAction(this.TargetUnitAction[this.TargetUnit.direction]);
                            this.TargetUnit.state = 0;

                            var resultDamage;
                            if(this.SelectedUnit.status.str - this.TargetUnit.status.def < 0){
                                resultDamage = 0;
                            }
                            else{
                                resultDamage = this.SelectedUnit.status.str - this.TargetUnit.status.def;
                            }
                            this.TargetUnit.status.hp -= resultDamage;
                            StatusLayer.hpText.setString("HP : " + this.TargetUnit.status.hp);
                            if(this.TargetUnit.status.hp <= 0){
                                for(var i=0; i<this.UnitData.length; i++){
                                    if(this.UnitData[i] == this.TargetUnit){
                                        for(var j=0; j<this.Player.length; j++){
                                            if(this.Player[j] == this.TargetUnit){
                                                this.Player.splice(j, 1);
                                            }
                                        }

                                        for(var j=0; j<this.Enemy.length; j++) {
                                            if(this.Enemy[j] == this.TargetUnit){
                                                this.Enemy.splice(j, 1);
                                            }
                                        }

                                        StatusLayer.UnitInfoPopup.setVisible(false);
                                        this.UnitData.splice(i, 1);
                                        this.AnimationData.splice(i, 1);
                                        this.ActionData.splice(i, 1);
                                        this.removeChild(this.TargetUnitAnim.sprite, true);

                                        // Game Over(패배)
                                        if(this.Player.length == 0){
                                            alert("Game Over");
                                            return ;
                                        }

                                        // Game End(승리)
                                        if(this.Enemy.length == 0){
                                            var tempNum = this.SceneInfo.nextSceneIDs[0];
                                            this.flag = false;
                                            this.SceneChange();
                                            BackgroundLayer.SceneChange();
                                            StatusLayer.SceneChange();

                                            GameLauncherScene.socket = io.connect('http://211.189.19.197:9987');
                                            GameLauncherScene.socket.emit('requestSceneInfo', 0, tempNum);
                                            return ;
                                        }
                                    }
                                }
                            }

                            this.currentTime = 0;
                            this.isAIAction = false;
                            this.isCharacterAttacking = false;
                            this.isCharacterMoving = false;
                            this.isCharacterSelect = false;

                            pathFinder.resultPath = null;
                            pathFinder.resultPath = new Array();
                            pathFinder.Map[pathFinder.startPos.x, pathFinder.startPos.y] = true;
                            pathFinder.Map[this.SelectedUnit.position.x, this.SelectedUnit.position.y] = false;

                            if(this.totalActionCount == 0){
                                this.TurnChange(this.SceneInfo);
                            }
                        }
                    }
                }

                dt = dt / 5;
                if(this.currentDirection == "Down"){
                    this.SelectedUnit.coordinateY = this.SelectedUnit.coordinateY + dt;
                    this.SelectedUnit.displayX = this.SelectedUnit.coordinateX - GameCamera.currentX;
                    this.SelectedUnit.displayY = this.SelectedUnit.coordinateY - GameCamera.currentY + dt;
                    this.SelectedUnitAnim.sprite.setPosition(this.SelectedUnit.displayX, this.SelectedUnit.displayY);
                    if(this.SelectedUnit.displayY >= ((this.SelectedUnit.position.y + 1) * this.tileSize) + (this.tileSize / 2) - GameCamera.currentY){
                        this.SelectedUnit.coordinateY = ((this.SelectedUnit.position.y + 1) * this.tileSize) + (this.tileSize / 2);
                        this.SelectedUnit.position.y++;
                        this.reorderChild(this.SelectedUnitAnim.sprite, (BackgroundLayer.backgroundHeight / this.tileSize) - this.SelectedUnit.position.y + 1);
                        pathFinder.PlayAnimation();
                    }
                }
                if(this.currentDirection == "Up"){
                    this.SelectedUnit.coordinateY = this.SelectedUnit.coordinateY - dt;
                    this.SelectedUnit.displayX = this.SelectedUnit.coordinateX - GameCamera.currentX;
                    this.SelectedUnit.displayY = this.SelectedUnit.coordinateY - GameCamera.currentY - dt;
                    this.SelectedUnitAnim.sprite.setPosition(this.SelectedUnit.displayX, this.SelectedUnit.displayY);
                    if(this.SelectedUnit.displayY <= ((this.SelectedUnit.position.y - 1) * this.tileSize) + (this.tileSize / 2) - GameCamera.currentY){
                        this.SelectedUnit.coordinateY = ((this.SelectedUnit.position.y - 1) * this.tileSize) + (this.tileSize / 2);
                        this.SelectedUnit.position.y--;
                        this.reorderChild(this.SelectedUnitAnim.sprite, (BackgroundLayer.backgroundHeight / this.tileSize) - this.SelectedUnit.position.y + 1);
                        pathFinder.PlayAnimation();
                    }
                }
                if(this.currentDirection == "Right"){
                    this.SelectedUnit.coordinateX = this.SelectedUnit.coordinateX - dt;
                    this.SelectedUnit.displayX = this.SelectedUnit.coordinateX - GameCamera.currentX - dt;
                    this.SelectedUnit.displayY = this.SelectedUnit.coordinateY - GameCamera.currentY;
                    this.SelectedUnitAnim.sprite.setPosition(this.SelectedUnit.displayX, this.SelectedUnit.displayY);
                    if(this.SelectedUnit.displayX <= ((this.SelectedUnit.position.x - 1) * this.tileSize) + (this.tileSize / 2) - GameCamera.currentX){
                        this.SelectedUnit.coordinateX = ((this.SelectedUnit.position.x - 1) * this.tileSize) + (this.tileSize / 2);
                        this.SelectedUnit.position.x--;
                        pathFinder.PlayAnimation();
                    }
                }
                if(this.currentDirection == "Left"){
                    this.SelectedUnit.coordinateX = this.SelectedUnit.coordinateX + dt;
                    this.SelectedUnit.displayX = this.SelectedUnit.coordinateX - GameCamera.currentX + dt;
                    this.SelectedUnit.displayY = this.SelectedUnit.coordinateY - GameCamera.currentY;
                    this.SelectedUnitAnim.sprite.setPosition(this.SelectedUnit.displayX, this.SelectedUnit.displayY);
                    if(this.SelectedUnit.displayX >= ((this.SelectedUnit.position.x + 1) * this.tileSize) + (this.tileSize / 2) - GameCamera.currentX){
                        this.SelectedUnit.coordinateX = ((this.SelectedUnit.position.x + 1) * this.tileSize) + (this.tileSize / 2);
                        this.SelectedUnit.position.x++;
                        pathFinder.PlayAnimation();
                    }
                }
            }
        }
    },

    ArrowAnimationSetting: function(){
        this.ArrowSpriteSheet = cc.TextureCache.getInstance().addImage("../repo/default/myTurn.png");
        var arrowFrame = [];
        var totalArrowFrame = 3;

        for(var i=0; i<totalArrowFrame; i++){
            arrowFrame[i] = cc.SpriteFrame.createWithTexture(this.ArrowSpriteSheet, cc.rect(225 * i, 0, 225, 179));
            this.ArrowAnimation[i] = arrowFrame[i];
        }
    },

    TurnChange: function(sceneInfo){
        this.isPlayerTurn = !this.isPlayerTurn;
        this.totalActionCount = 0;
        pathFinder.DeletePath();

        for(var i=0; i<this.UnitData.length; i++){
            this.AnimationData[i].sprite.removeChild(this.UnitData[i].myTurnArrow, true);
        }

        for(var i=0; i<this.UnitData.length; i++){
            if((this.isPlayerTurn == true && this.UnitData[i].isEnemy == false) ||
                    (this.isPlayerTurn == false && this.UnitData[i].isEnemy == true)){

                this.UnitData[i].moveCount = 1;
                this.totalActionCount++;

                this.ArrowAnimation.sprite = cc.Sprite.createWithSpriteFrame(this.ArrowAnimation[0]);
                this.ArrowAnimation.sprite.setScaleX(0.25);
                this.ArrowAnimation.sprite.setScaleY(0.25);
                this.ArrowAnimation.sprite.setPosition(
                    (this.UnitData[i].sprite.frameWidth.idle[this.UnitData[i].direction] / this.UnitData[i].sprite.frameCount.idle[this.UnitData[i].direction]) / 2,
                    this.UnitData[i].sprite.frameHeight.idle[this.UnitData[i].direction] * 1.2);

                this.UnitData[i].myTurnArrow = this.ArrowAnimation.sprite;
                this.AnimationData[i].sprite.addChild(this.UnitData[i].myTurnArrow);

                var arrowAnimation = cc.Animation.create(this.ArrowAnimation, this.animSpeed);
                var arrowAnimate = cc.Animate.create(arrowAnimation);
                this.ArrowAnimation.sprite.runAction(cc.RepeatForever.create(arrowAnimate));
            }
        }
    },

    onMouseUp: function(event){
        if(this.isCharacterMoving != true && this.isCharacterMoving != true) {
            if (this.isCharacterSelect == true) {
                // 공격 대상을 선택 했을 때
                if (getDistance(pathFinder.startPos, {x: BackgroundLayer.currentCell.x, y: BackgroundLayer.currentCell.y}) <= this.SelectedUnit.status.dex + 2) {
                    for (var i = 0; i < this.UnitData.length; i++) {
                        if (BackgroundLayer.currentCell.x == this.UnitData[i].position.x &&
                            BackgroundLayer.currentCell.y == this.UnitData[i].position.y) {

                            if(this.UnitData[i] == this.SelectedUnit
                                    ||  this.UnitData[i].isEnemy != this.isPlayerTurn){
                                this.isCharacterSelect = false;
                                pathFinder.DeletePath();
                                pathFinder.isFirst = true;
                                pathFinder.isMoveFirst = true;
                            }
                            else {
                                this.isCharacterMoving = true;
                                this.isCharacterAttacking = true;

                                this.TargetUnit = this.UnitData[i];
                                this.TargetUnitAnim = this.AnimationData[i];
                                this.TargetUnitAction = this.ActionData[i];

                                // 공격 대상으로 지정한 유닛이 같은 진영일 경우
                                if (this.SelectedUnit.isEnemy == this.TargetUnit.isEnemy) {
                                    this.isCharacterSelect = false;
                                    pathFinder.DeletePath();
                                    pathFinder.isFirst = true;
                                    pathFinder.isMoveFirst = true;
                                }
                                // 공격 가능한 대상을 지정했을 경우
                                else {
                                    pathFinder.FindPath(this.SelectedUnit.position.x, this.SelectedUnit.position.y, this.SelectedUnit.status.dex);
                                    var tempPos = pathFinder.AttackablePos(this.TargetUnit.position);
                                    pathFinder.CharacterMove(tempPos.x, tempPos.y, tempPos.n);
                                    pathFinder.DeletePath();
                                    pathFinder.destination = {x: tempPos.x, y: tempPos.y};
                                    pathFinder.PlayAnimation();
                                    this.SelectedUnitAnim.sprite.removeChild(this.SelectedUnit.myTurnArrow, true);
                                }
                            }
                        }
                    }
                }

                // 움직이기만 할 때
                if (getDistance(pathFinder.startPos, {x: BackgroundLayer.currentCell.x, y: BackgroundLayer.currentCell.y}) <= this.SelectedUnit.status.dex
                    && pathFinder.Step[BackgroundLayer.currentCell.x + (BackgroundLayer.currentCell.y * pathFinder.MapSize.width)] != pathFinder.disableValue) {

                    this.isCharacterMoving = true;
                    pathFinder.CharacterMove(BackgroundLayer.currentCell.x, BackgroundLayer.currentCell.y, pathFinder.Step[
                        BackgroundLayer.currentCell.x + (BackgroundLayer.currentCell.y * pathFinder.MapSize.width)]);
                    pathFinder.DeletePath();
                    pathFinder.PlayAnimation();
                }
            }
            // 플레이어가 이동 가능한 유닛을 클릭 했을 때
            else {
                for (var i = 0; i < this.UnitData.length; i++) {
                    if (BackgroundLayer.currentCell.x == this.UnitData[i].position.x &&
                        BackgroundLayer.currentCell.y == this.UnitData[i].position.y) {

                        if (this.UnitData[i].isEnemy != this.isPlayerTurn) {
                            this.SelectedUnit = this.UnitData[i];
                            this.SelectedUnitAnim = this.AnimationData[i];
                            this.SelectedUnitAction = this.ActionData[i];

                            if (this.SelectedUnit.moveCount > 0) {
                                pathFinder.DeletePath();
                                pathFinder.FindPath(BackgroundLayer.currentCell.x, BackgroundLayer.currentCell.y, this.UnitData[i].status.dex);
                                pathFinder.DrawCell();
                                this.isCharacterSelect = true;
                            }
                            else {
                                this.SelectedUnit = null;
                                this.SelectedUnitAnim = null;
                                this.SelectedUnitAction = null;
                            }
                        }
                    }
                }
            }
        }
    },

    onKeyUp: function(event){
        if(this.isCharacterMoving != true && this.isCharacterMoving != true) {
            switch (event) {
                case cc.KEY.tab:
                    this.TurnChange();
                    break;

                case cc.KEY.escape:
                    this.isCharacterSelect = false;
                    pathFinder.DeletePath();
                    pathFinder.isFirst = true;
                    pathFinder.isMoveFirst = true;
                    break;
            }
        }
    }
});
