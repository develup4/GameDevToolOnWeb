/**
 * Created by GNSSM_JBW on 2014-06-22.
 */

var pathFinder = {
    Map : null,
    MapSize : {
        width : 0,
        height : 0
    },
    Step : null,
    resultPath : null,
    isFirst : true,
    isMoveFirst : true,
    isDeleteFirst : true,
    disableValue : -999,
    firstN : -1,

    startPos : {
        x : 0,
        y : 0
    },
    destination : {
        x : 0,
        y : 0
    },

    init : function(map){
        this.Map = map;
        this.Step = new Array();
        this.resultPath = new Array();

        this.MapSize.width = BackgroundLayer.backgroundWidth / GameCamera.tileSize;
        this.MapSize.height = BackgroundLayer.backgroundHeight / GameCamera.tileSize;

        for(var i=0; i<this.Map.length; i++){
            this.Step[i] = this.disableValue;
        }
    },

    FindPath : function(x, y, n){
        if(this.isFirst == true){
            this.startPos.x = x;
            this.startPos.y = y;
            this.isFirst = false;
        }

        this.Step[x + y * this.MapSize.width] = n;

        if(n == -2){
            return ;
        }

        if(this.Map[x + ((y+1) * this.MapSize.width)] == true && y+1 < this.MapSize.height
            && (getRealDist(x, y, n) < getRealDist(x, y+1, n-1))) {

            if(this.Step[x + ((y+1) * this.MapSize.width)] == this.disableValue)
                this.FindPath(x, y+1, n-1);
            else{
                if(this.Step[x + ((y+1) * this.MapSize.width)] < n-1){
                    this.FindPath(x, y+1, n-1);
                }
            }
        }

        if(this.Map[x + ((y-1) * this.MapSize.width)] == true && y-1 >= 0
            && (getRealDist(x, y, n) < getRealDist(x, y-1, n-1))) {

            if(this.Step[x + ((y-1) * this.MapSize.width)] == this.disableValue)
                this.FindPath(x, y-1, n-1);
            else{
                if(this.Step[x + ((y-1) * this.MapSize.width)] < n-1){
                    this.FindPath(x, y-1, n-1);
                }
            }
        }

        if(this.Map[(x-1) + (y * this.MapSize.width)] == true && x-1 >= 0
            && (getRealDist(x, y, n) < getRealDist(x-1, y, n-1))) {

            if(this.Step[(x-1) + (y * this.MapSize.width)] == this.disableValue)
                this.FindPath(x-1, y, n-1);
            else{
                if(this.Step[(x-1) + (y * this.MapSize.width)] < n-1){
                    this.FindPath(x-1, y, n-1);
                }
            }
        }

        if(this.Map[(x+1) + (y * this.MapSize.width)] == true && x+1 < this.MapSize.width
            && (getRealDist(x, y, n) < getRealDist(x+1, y, n-1))) {

            if(this.Step[(x+1) + (y * this.MapSize.width)] == this.disableValue)
                this.FindPath(x+1, y, n-1);
            else{
                if(this.Step[(x+1) + (y * this.MapSize.width)] < n-1){
                    this.FindPath(x+1, y, n-1);
                }
            }
        }
    },

    DrawCell : function(){
        for(var i=0; i<this.MapSize.width * this.MapSize.height; i++){
            if(this.Step[i] != this.disableValue){
                if(this.Step[i] < 0)
                    createCell("red", Math.floor(i % this.MapSize.width), Math.floor(i / this.MapSize.width), this.Step[i]);
                else
                    createCell("blue", Math.floor(i % this.MapSize.width), Math.floor(i / this.MapSize.width), this.Step[i]);
            }
            else{
                var max = this.disableValue;
                var tempX = Math.floor(i % this.MapSize.width);
                var tempY = Math.floor(i / this.MapSize.width);

                if(this.Step[(tempX+1) + (tempY * this.MapSize.width)] > max){
                    max = this.Step[(tempX+1) + (tempY * this.MapSize.width)];
                }
                if(this.Step[(tempX-1) + (tempY * this.MapSize.width)] > max){
                    max = this.Step[(tempX-1) + (tempY * this.MapSize.width)];
                }
                if(this.Step[tempX + ((tempY+1) * this.MapSize.width)] > max){
                    max = this.Step[tempX + ((tempY+1) * this.MapSize.width)];
                }
                if(this.Step[tempX + ((tempY-1) * this.MapSize.width)] > max){
                    max = this.Step[tempX + ((tempY-1) * this.MapSize.width)];
                }

                if(max != this.disableValue) {
                    if (AnimationLayer.SelectedUnit.status.dex + 2 >= getRealDist(tempX, tempY, max-1)) {
                        createCell("red", tempX, tempY, 0);
                    }
                }
            }
        }

        for(var i=0; i<AnimationLayer.Player.length; i++) {
            var tempX = AnimationLayer.Player[i].position.x;
            var tempY = AnimationLayer.Player[i].position.y;

            var tempCnt = 0;
            if(this.Step[tempX+1 + (tempY * this.MapSize.width)] != this.disableValue){
                tempCnt++;
            }
            if(this.Step[tempX-1 + (tempY * this.MapSize.width)] != this.disableValue){
                tempCnt++;
            }
            if(this.Step[tempX + ((tempY+1) * this.MapSize.width)] != this.disableValue){
                tempCnt++;
            }
            if(this.Step[tempX + ((tempY-1) * this.MapSize.width)] != this.disableValue){
                tempCnt++;
            }

            if(tempCnt >= 1)
                createCell("blue", tempX, tempY, 0);
        }

        for(var i=0; i<AnimationLayer.Enemy.length; i++){
            var tempX = AnimationLayer.Enemy[i].position.x;
            var tempY = AnimationLayer.Enemy[i].position.y;

            var tempCnt = 0;
            if(this.Step[tempX+1 + (tempY * this.MapSize.width)] == this.disableValue &&
                this.Step[tempX+1 + (tempY * this.MapSize.width)] != 0){
                tempCnt++;
            }
            if(this.Step[tempX-1 + (tempY * this.MapSize.width)] == this.disableValue &&
                this.Step[tempX-1 + (tempY * this.MapSize.width)] != 0){
                tempCnt++;
            }
            if(this.Step[tempX + ((tempY+1) * this.MapSize.width)] == this.disableValue &&
                this.Step[tempX + ((tempY+1) * this.MapSize.width)] != 0){
                tempCnt++;
            }
            if(this.Step[tempX + ((tempY-1) * this.MapSize.width)] == this.disableValue &&
                this.Step[tempX + ((tempY-1) * this.MapSize.width)] != 0){
                tempCnt++;
            }

            if(tempCnt <= 1)
                createCell("red", tempX, tempY, 0);
        }
    },

    AttackablePos : function(targetPos){
        var temp = -999;
        var result;

        for (var j = -2; j <= 2; j++) {
            if(j != 0){
                if(this.Step[targetPos.x+j + (targetPos.y * this.MapSize.width)] == AnimationLayer.SelectedUnit.status.dex ||
                    this.Step[targetPos.x + ((targetPos.y+j) * this.MapSize.width)] == AnimationLayer.SelectedUnit.status.dex){

                    return {x : AnimationLayer.SelectedUnit.position.x, y : AnimationLayer.SelectedUnit.position.y, n : AnimationLayer.SelectedUnit.status.dex};
                }

                if(this.Step[targetPos.x+j + (targetPos.y * this.MapSize.width)] > temp) {
                    result = {x: targetPos.x + j, y: targetPos.y, n: this.Step[targetPos.x + j + (targetPos.y * this.MapSize.width)]};
                    temp = this.Step[targetPos.x+j + (targetPos.y * this.MapSize.width)];
                }

                if(this.Step[targetPos.x + ((targetPos.y+j) * this.MapSize.width)] > temp) {
                    result = {x: targetPos.x, y: targetPos.y + j, n: this.Step[targetPos.x + ((targetPos.y + j) * this.MapSize.width)]};
                    temp = this.Step[targetPos.x + ((targetPos.y+j) * this.MapSize.width)];
                }
            }
        }

        if(result == null){
            return {x: targetPos.x, y: targetPos.y, n: this.Step[targetPos.x + (targetPos.y * this.MapSize.width)]};
        }
        else {
            return result;
        }
    },

    CharacterMove : function(x, y, n){
        if(this.isMoveFirst == true){
            this.destination.x = x;
            this.destination.y = y;
            this.firstN = AnimationLayer.SelectedUnit.status.dex;
            this.isMoveFirst = false;
        }

        if(AnimationLayer.SelectedUnit.position.x == x &&
                AnimationLayer.SelectedUnit.position.y == y){
            return ;
        }

        n++;
        if(this.Step[x + ((y+1) * this.MapSize.width)] == n
                && (this.Map[x + ((y+1) * this.MapSize.width)] == true || this.firstN == n)){
            this.CharacterMove(x, y+1, n);
            this.resultPath.push("Down");
        }
        else if(this.Step[x + ((y-1) * this.MapSize.width)] == n
                && (this.Map[x + ((y-1) * this.MapSize.width)] == true || this.firstN == n)){
            this.CharacterMove(x, y-1, n);
            this.resultPath.push("Up");
        }
        else if(this.Step[(x-1) + (y * this.MapSize.width)] == n
                && (this.Map[(x-1) + (y * this.MapSize.width)] == true || this.firstN == n)){
            this.CharacterMove(x-1, y, n);
            this.resultPath.push("Right");
        }
        else if(this.Step[(x+1) + (y * this.MapSize.width)] == n
                && (this.Map[(x+1) + (y * this.MapSize.width)] == true || this.firstN == n)){
            this.CharacterMove(x+1, y, n);
            this.resultPath.push("Left");
        }
    },

    PlayAnimation : function(){
        if(this.resultPath.length == 0){
            if(AnimationLayer.isCharacterMoving == true && AnimationLayer.isCharacterAttacking == false)
                AnimationLayer.isAIAction = false;
            AnimationLayer.isCharacterMoving = false;
            AnimationLayer.currentDirection = "";
            AnimationLayer.totalActionCount--;

            this.resultPath = null;
            this.resultPath = new Array();
            this.isFirst = true;
            this.isMoveFirst = true;
            this.Map[this.startPos.x + (this.startPos.y * this.MapSize.width)] = true;
            this.Map[this.destination.x + (this.destination.y * this.MapSize.width)] = false;

            if(AnimationLayer.isCharacterAttacking == true) {
                if (AnimationLayer.SelectedUnit.position.y == AnimationLayer.TargetUnit.position.y) {
                    if (AnimationLayer.SelectedUnit.position.x - AnimationLayer.TargetUnit.position.x < 0) {
                        AnimationLayer.SelectedUnit.direction = 3;
                    }
                    else {
                        AnimationLayer.SelectedUnit.direction = 2;
                    }
                }

                if (AnimationLayer.SelectedUnit.position.x == AnimationLayer.TargetUnit.position.x) {
                    if (AnimationLayer.SelectedUnit.position.y - AnimationLayer.TargetUnit.position.y < 0) {
                        AnimationLayer.SelectedUnit.direction = 0;
                    }
                    else {
                        AnimationLayer.SelectedUnit.direction = 1;
                    }
                }

                AnimationLayer.SelectedUnit.state = 2;
                AnimationLayer.totalAnimTime = AnimationLayer.animSpeed * AnimationLayer.SelectedUnitAnim[8 + AnimationLayer.SelectedUnit.direction].length;
                AnimationLayer.SelectedUnitAnim.sprite.stopAllActions();
                AnimationLayer.SelectedUnitAnim.sprite.runAction(AnimationLayer.SelectedUnitAction[8 + AnimationLayer.SelectedUnit.direction]);
            }

            var isAttackable = false;
            if(AnimationLayer.isPlayerTurn == true && AnimationLayer.isCharacterAttacking == false) {
                for(var i=-2; i<=2; i++){
                    if(i != 0){
                        for(var j=0; j<AnimationLayer.Enemy.length; j++){
                            if(AnimationLayer.SelectedUnit.position.x + i == AnimationLayer.Enemy[j].position.x &&
                                AnimationLayer.SelectedUnit.position.y == AnimationLayer.Enemy[j].position.y){

                                isAttackable = true;
                                createCell("red", AnimationLayer.Enemy[j].position.x, AnimationLayer.Enemy[j].position.y, 0);
                            }

                            if(AnimationLayer.SelectedUnit.position.x == AnimationLayer.Enemy[j].position.x &&
                                AnimationLayer.SelectedUnit.position.y + i == AnimationLayer.Enemy[j].position.y){

                                isAttackable = true;
                                createCell("red", AnimationLayer.Enemy[j].position.x, AnimationLayer.Enemy[j].position.y, 0);
                            }
                        }
                    }
                }

                if(isAttackable == false){
                    AnimationLayer.isCharacterSelect = false;
                    AnimationLayer.SelectedUnitAnim.sprite.removeChild(AnimationLayer.SelectedUnit.myTurnArrow);
                    AnimationLayer.SelectedUnit.moveCount = 0;
                }
            }

            if(AnimationLayer.totalActionCount == 0 && AnimationLayer.isCharacterAttacking == false) {
                AnimationLayer.TurnChange(AnimationLayer.SceneInfo);
            }

            return ;
        }

        var direction = this.resultPath.shift();
        AnimationLayer.SelectedUnitAnim.sprite.stopAllActions();

        if (direction == "Down") {
            AnimationLayer.currentDirection = "Up";
            AnimationLayer.SelectedUnit.direction = 1;
            AnimationLayer.SelectedUnitAnim.sprite.runAction(AnimationLayer.SelectedUnitAction[5]);
        }

        if (direction == "Up") {
            AnimationLayer.currentDirection = "Down";
            AnimationLayer.SelectedUnit.direction = 0;
            AnimationLayer.SelectedUnitAnim.sprite.runAction(AnimationLayer.SelectedUnitAction[4]);
        }

        if (direction == "Right") {
            AnimationLayer.currentDirection = "Left";
            AnimationLayer.SelectedUnit.direction = 3;
            AnimationLayer.SelectedUnitAnim.sprite.runAction(AnimationLayer.SelectedUnitAction[7]);
        }

        if (direction == "Left") {
            AnimationLayer.SelectedUnit.direction = 2;
            AnimationLayer.currentDirection = "Right";
            AnimationLayer.SelectedUnitAnim.sprite.runAction(AnimationLayer.SelectedUnitAction[6]);
        }
    },

    DeletePath : function(){
        if(this.isDeleteFirst == true){
            this.isDeleteFirst = false;
        }
        else {
            for (var i = 0; i < this.Map.length; i++) {
                this.Step[i] = this.disableValue;
            }

            for (var i = 0; i < BackgroundLayer.pathCell.enable.length; i++) {
                BackgroundLayer.removeChild(BackgroundLayer.pathCell.enable[i]);
            }

            for (var i = 0; i < BackgroundLayer.pathCell.disable.length; i++) {
                BackgroundLayer.removeChild(BackgroundLayer.pathCell.disable[i]);
            }

            BackgroundLayer.pathCell.enable.length = 0;
            BackgroundLayer.pathCell.disable.length = 0;
        }
    }
};

function createCell(color, x, y, n){
    var cell;

    if(x == pathFinder.startPos.x && y == pathFinder.startPos.y) {
        pathFinder.Step[x + (y * pathFinder.MapSize.width)] = AnimationLayer.SelectedUnit.status.dex;
    }

    for (var i = 0; i < BackgroundLayer.pathCell.enable.length; i++) {
        if(x == BackgroundLayer.pathCell.enable[i].coordinate.x / GameCamera.tileSize &&
                y == BackgroundLayer.pathCell.enable[i].coordinate.y / GameCamera.tileSize){

            return ;
        }
    }

    for (var i = 0; i < BackgroundLayer.pathCell.disable.length; i++) {
        if(x == BackgroundLayer.pathCell.disable[i].coordinate.x / GameCamera.tileSize &&
            y == BackgroundLayer.pathCell.disable[i].coordinate.y / GameCamera.tileSize){

            return ;
        }
    }

    if(color == "blue"){
        cell = cc.Sprite.create("../repo/default/BlueCell.png");
        cell.coordinate = {x : x, y : y};
        BackgroundLayer.pathCell.enable.push(cell);
    }

    if(color == "red"){
        cell = cc.Sprite.create("../repo/default/RedCell.png");
        cell.coordinate = {x : x, y : y};
        BackgroundLayer.pathCell.disable.push(cell);
    }

    cell.setTextureRect(cc.rect(0, 0, GameCamera.tileSize, GameCamera.tileSize));
    cell.setAnchorPoint(cc.p(0, 0));
    cell.setOpacity(100);
    cell.coordinate = {x : x * GameCamera.tileSize, y : y * GameCamera.tileSize};
    cell.setPosition(cc.p((x * GameCamera.tileSize) - GameCamera.currentX, (y * GameCamera.tileSize) - GameCamera.currentY));
    cell.setVisible(true);

    /*var temp = cc.LabelTTF.create("" + n, "Arial", 20);
    temp.setAnchorPoint(cc.p(0.5, 0.5));
    temp.setPosition(cc.p((GameCamera.tileSize / 2), (GameCamera.tileSize / 2)));
    cell.addChild(temp);*/

    BackgroundLayer.addChild(cell, 3, n);
}

function getDistance(start, end){
    var distance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    return distance;
}

var tempArray = new Array();
var tempDest = {x : -1, y : -1};
var tempFirst = true;
var tempFirstN = -1;

function getRealDist(x, y, n){
    getRealDistRecur(x, y, n);

    var result = tempArray.length;
    tempArray = new Array();
    tempDest = {x : -1, y : -1}
    tempFirst = true;

    return result;
}

function getRealDistRecur(x, y, n){
    if(tempFirst = true){
        tempDest.x = x;
        tempDest.y = y;
        tempFirstN = AnimationLayer.SelectedUnit.status.dex;
        tempFirst = false;
    }

    if(AnimationLayer.SelectedUnit.position.x == x &&
        AnimationLayer.SelectedUnit.position.y == y){
        return ;
    }

    n++;
    if(pathFinder.Step[x + ((y+1) * pathFinder.MapSize.width)] == n
        && (pathFinder.Map[x + ((y+1) * pathFinder.MapSize.width)] == true || tempFirstN == n)){
        getRealDistRecur(x, y+1, n);
        tempArray.push("Down");
    }
    else if(pathFinder.Step[x + ((y-1) * pathFinder.MapSize.width)] == n
        && (pathFinder.Map[x + ((y-1) * pathFinder.MapSize.width)] == true || tempFirstN == n)){
        getRealDistRecur(x, y-1, n);
        tempArray.push("Up");
    }
    else if(pathFinder.Step[(x-1) + (y * pathFinder.MapSize.width)] == n
        && (pathFinder.Map[(x-1) + (y * pathFinder.MapSize.width)] == true || tempFirstN == n)){
        getRealDistRecur(x-1, y, n);
        tempArray.push("Right");
    }
    else if(pathFinder.Step[(x+1) + (y * pathFinder.MapSize.width)] == n
        && (pathFinder.Map[(x+1) + (y * pathFinder.MapSize.width)] == true || tempFirstN == n)){
        getRealDistRecur(x+1, y, n);
        tempArray.push("Left");
    }
}

function compareDistance(dist1, dist2){
    var result1 = Math.abs(dist1.x - pathFinder.startPos.x) + Math.abs(dist1.y - pathFinder.startPos.y);
    var result2 = Math.abs(dist2.x - pathFinder.startPos.x) + Math.abs(dist2.y - pathFinder.startPos.y);

    return result1 > result2 ? 0 : 1;
}
