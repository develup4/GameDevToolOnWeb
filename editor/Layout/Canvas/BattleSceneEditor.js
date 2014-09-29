// 캔버스 얻기
var battleCanvas;
var battleCanvasBuffer;
var battleContext;
var battleContext2;
var battleBackGround;
var cells = [];
var characters = [];
var dummyCharacter;
var characterSellectMode;
var dummyCharacterOriginPositionX, dummyCharacterOriginPositionY;
var battleSceneIndex;
var battleSceneName;

function setBattleSceneInit(name, index)
{
    battleCanvas = document.getElementById(name + 'Canvas');
    battleCanvasBuffer = document.createElement('canvas');
    battleContext = battleCanvas.getContext('2d');
    battleContext2 = battleCanvasBuffer.getContext('2d');
    battleBackGround = new Image();
    characterSellectMode = false;
    battleSceneName = name;
    battleSceneIndex = index;

    $(battleCanvas).on(
        {
            // 마우스 이벤트 생기면 바뀐 Cell 적용해서 화면 다시그림
            mousedown: function (event) {
                var position = $(this).offset();
                var x = event.pageX - position.left;
                var y = event.pageY - position.top;

                for(var i = 0; i < characters.length; i++)
                {
                    if(characters[i].canvasX < x && characters[i].canvasX + characters[i].width / characters[i].numberOfFrames > x && characters[i].canvasY + characters[i].height > y && characters[i].canvasY < y)
                    {
                        characterSellectMode = true;
                        dummyCharacter = characters[i];

                        battleInspectorInput(dummyCharacter.id);

                        dummyCharacterOriginPositionX = dummyCharacter.x;
                        dummyCharacterOriginPositionY = dummyCharacter.y;

                        return;
                    }
                }

                for (var i = 0; i < cells.length; i++) {
                    // 바뀐 Cell 정보 변경
                    if (cells[i].left < x && cells[i].left + cells[i].width > x && cells[i].top + cells[i].height > y && cells[i].top < y) {
                        if (sceneList[battleSceneIndex].battleMapMovable[i])
                            sceneList[battleSceneIndex].battleMapMovable[i] = false;
                        else
                            sceneList[battleSceneIndex].battleMapMovable[i] = true;

                        // cell 정보 들어있는 배열 초기화한후 다시 바뀐 cell 정보 입력
                        cells.splice(0, cells.length);

                        cellsInfoInput();
                        drawCellsBuffer();

                        var info =
                        {
                            sceneNum: sceneList[battleSceneIndex].SceneNumber,
                            movable: sceneList[battleSceneIndex].battleMapMovable
                        };

                        WebSocketConnector.socket.emit('renewMovable', JSON.stringify(info));

                        break;
                    }
                }
            },

            mousemove:function(evnet) {
                var position = $(this).offset();
                var x = event.pageX - position.left;
                var y = event.pageY - position.top;
                var quotient = 0;

                if(characterSellectMode)
                {
                    while(x > quotient * 64)
                        quotient++;

                    dummyCharacter.x = quotient - 1;

                    quotient = 0;

                    while((battleBackGround.height - y) > quotient * 64)
                        quotient++;

                    dummyCharacter.y = quotient - 1;
                }
            },

            mouseup:function(event) {
                if(characterSellectMode)
                {
                    if(!sceneList[battleSceneIndex].battleMapMovable[dummyCharacter.x + dummyCharacter.y * (battleBackGround.width / 64)]) {
                        dummyCharacter.x = dummyCharacterOriginPositionX;
                        dummyCharacter.y = dummyCharacterOriginPositionY;
                    }

                    for(var i = 0; i < characters.length; i++)
                    {
                        if(dummyCharacter.id != characters[i].id)
                        {
                            if(characters[i].x == dummyCharacter.x && characters[i].y == dummyCharacter.y)
                            {
                                dummyCharacter.x = dummyCharacterOriginPositionX;
                                dummyCharacter.y = dummyCharacterOriginPositionY;
                            }
                        }
                    }

                    var info =
                    {
                        sceneNum: sceneList[battleSceneIndex].SceneNumber,
                        charID: dummyCharacter.id,
                        position: {
                            x: dummyCharacter.x,
                            y: dummyCharacter.y
                        }
                    }

                    WebSocketConnector.socket.emit('battleCharMove', JSON.stringify(info));

                    for (var i = 0; i < characters.length; i++) {
                        if (sceneList[battleSceneIndex].battleObjects[i].id == dummyCharacter.id) {
                            sceneList[battleSceneIndex].battleObjects[i].position.x = dummyCharacter.x;
                            sceneList[battleSceneIndex].battleObjects[i].position.y = dummyCharacter.y;
                        }
                    }

                    characterSellectMode = false;
                    battleInspectorInput(dummyCharacter.id);
                    dummyCharacter = null;
                }
            }
        }
    );
}

var redCellPainter = {
    paint: function (sprite, context) {
        context.save();
        context.beginPath();
        context.rect(sprite.left, sprite.top, 64, 64);
        context.clip();

        context.lineWidth = 2;
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.fillStyle = 'rgba(255, 0, 0, 0.3)';
        context.fill();
        context.stroke();

        context.restore();
    }
};

var blueCellPainter = {
    paint: function (sprite, context) {
        context.save();
        context.beginPath();
        context.rect(sprite.left, sprite.top, 64, 64);
        context.clip();

        context.lineWidth = 2;
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.fillStyle = 'rgba(0, 0, 255, 0.3)';
        context.fill();
        context.stroke();

        context.restore();
    }
};

function characterDataChange()
{
    characters.splice(0, characters.length);
    makeCharacters();
}

function drawCellsBuffer() {

    var widthCount = 0, heightCount = 0, positionX = 0, positionY = 0;

    battleContext2.clearRect(0, 0, battleCanvasBuffer.width, battleCanvasBuffer.height);

    widthCount = battleBackGround.width / 64;
    heightCount = battleBackGround.height / 64;

    positionY = heightCount - 1;

    for (var i = 0; i < cells.length; i++) {
        if (positionX >= widthCount) {
            positionX = 0;
            positionY -= 1;
        }

        cells[i].width = 64;
        cells[i].height = 64;
        cells[i].left = positionX * 64;
        cells[i].top = positionY * 64;

        cells[i].paint(battleContext2);

        positionX += 1;
    }
}

function drawBackGround() {
    battleContext.drawImage(battleBackGround, 0, 0);
    battleContext.drawImage(battleCanvasBuffer, 0, 0);
}

function battleSprite(options) {

    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        heightCount = battleBackGround.height / 64;

    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.x = options.x;
    that.y = options.y;
    that.image = options.image;
    that.id = options.id;
    that.canvasX = options.x * 64;
    that.canvasY = (heightCount - options.y) * 64 - options.height;
    that.numberOfFrames = options.numberOfFrames || 1;

    that.update = function () {

        tickCount += 1;

        if (tickCount > ticksPerFrame) {

            tickCount = 0;

            // If the current frame index is in range
            if (frameIndex < that.numberOfFrames - 1) {
                // Go to the next frame
                frameIndex += 1;
            } else {
                frameIndex = 0;
            }
        }
    };

    that.render = function () {
        that.canvasX = that.x * 64;
        that.canvasY = (heightCount - that.y) * 64 - that.height;

        // Draw the animation
        that.context.drawImage(
            that.image,
            frameIndex * that.width / that.numberOfFrames,
            0,
            that.width / that.numberOfFrames,
            that.height,
            that.canvasX,
            that.canvasY,
            that.width / that.numberOfFrames,
            that.height);
    };

    return that;
}

function battleGameLoop() {

    window.requestAnimationFrame(battleGameLoop);

    // Clear the canvas
    battleContext.clearRect(0, 0, battleCanvas.width, battleCanvas.height);

    drawBackGround();

    for (var i = 0; i < characters.length; i += 1) {
        characters[i].update();
        characters[i].render();
    }
}

function cellsInfoInput() {
    for (var i = 0; i < sceneList[battleSceneIndex].battleMapMovable.length; i++) {
        if (sceneList[battleSceneIndex].battleMapMovable[i])
            cells.push(new Sprite('blueCell', blueCellPainter));
        else
            cells.push(new Sprite('redCell', redCellPainter));
    }
}

function makeCharacters() {
    var characterImg = [], direction, battleObjectCount = 0;

    for(var i = 0; i < sceneList[battleSceneIndex].battleObjects.length; i++) {
        if(sceneList[battleSceneIndex].battleObjects[i].position.x > 0 || sceneList[battleSceneIndex].battleObjects[i].position.y > 0)
        {
            characterImg.push(new Image());

            if (sceneList[battleSceneIndex].battleObjects[i].direction == 0)
                direction = 'Back';
            else if (sceneList[battleSceneIndex].battleObjects[i].direction == 1)
                direction = 'Front';
            else if (sceneList[battleSceneIndex].battleObjects[i].direction == 2)
                direction = 'Left';
            else if (sceneList[battleSceneIndex].battleObjects[i].direction == 3)
                direction = 'Right';

            characterImg[battleObjectCount].src = '../repo/demoProject/' + battleSceneName + '/objects/' + sceneList[battleSceneIndex].battleObjects[i].name + '/Idle' + direction + '.' + sceneList[battleSceneIndex].battleObjects[i].sprite.ext.idle[sceneList[battleSceneIndex].battleObjects[i].direction];

            characters.push(
                battleSprite(
                    {
                        context: battleContext,
                        width: sceneList[battleSceneIndex].battleObjects[i].sprite.frameWidth.idle[sceneList[battleSceneIndex].battleObjects[i].direction],
                        height: sceneList[battleSceneIndex].battleObjects[i].sprite.frameHeight.idle[sceneList[battleSceneIndex].battleObjects[i].direction],
                        image: characterImg[battleObjectCount],
                        numberOfFrames: sceneList[battleSceneIndex].battleObjects[i].sprite.frameCount.idle[sceneList[battleSceneIndex].battleObjects[i].direction],
                        x: sceneList[battleSceneIndex].battleObjects[i].position.x,
                        y: sceneList[battleSceneIndex].battleObjects[i].position.y,
                        id : sceneList[battleSceneIndex].battleObjects[i].id,
                        ticksPerFrame: 2
                    }
                )
            );

            battleObjectCount++;
        }
    }
}
function changeBattleScene()
{
    setBattleSceneInit(sceneList[focusedTabSceneIndex].SceneName.getString(), focusedTabSceneIndex);

    battleContext.clearRect(0, 0, battleCanvas.width, battleCanvas.height);

    drawBattleMap(focusedTabSceneIndex)
}

function drawBattleMap(index) {
    battleBackGround.src = '../repo/demoProject/' + battleSceneName + '/map/map.' + sceneList[index].ext;

    battleBackGround.onload = function (e) {

        battleCanvasBuffer.width = battleBackGround.width;
        battleCanvasBuffer.height = battleBackGround.height;

        battleContext.canvas.width = battleBackGround.width;
        battleContext.canvas.height = battleBackGround.height;
        battleContext2.canvas.width = battleBackGround.width;
        battleContext2.canvas.height = battleBackGround.height;

        cells.splice(0, cells.length);
        characters.splice(0, characters.length);

        cellsInfoInput();
        drawCellsBuffer();
        drawBackGround();

        makeCharacters();
        battleGameLoop();
    }
}