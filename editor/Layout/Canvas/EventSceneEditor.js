var eventCanvas;
var eventContext;
var eventBackGround;
var eventSceneName;
var eventSceneIndex;
var eventObjects = [];
var dummyEventObject;
var sellectNodeIndex;
var sellectNodeName;
var sellectObjectindex;
var eventObjectSellectMode;

function setEventSceneInit(name, index)
{
    eventCanvas = document.getElementById(name + 'Canvas');
    eventContext = eventCanvas.getContext('2d');
    eventBackGround = new Image();
    eventSceneName = name;
    eventSceneIndex = index;
    eventObjectSellectMode = false;
    dummyEventObject = null;

    $(eventCanvas).on(
        {
            // 마우스 이벤트 생기면 바뀐 Cell 적용해서 화면 다시그림
            mousedown: function (event) {
                var position = $(this).offset();
                var x = event.pageX - position.left;
                var y = event.pageY - position.top;
                if(dummyEventObject != null) {
                    if (eventObjects[sellectObjectindex].x < x && eventObjects[sellectObjectindex].x + eventObjects[sellectObjectindex].width > x && eventObjects[sellectObjectindex].y + eventObjects[sellectObjectindex].height > y && eventObjects[sellectObjectindex].y < y)
                        eventObjectSellectMode = true;
                }
            },

            mousemove:function(evnet) {
                var position = $(this).offset();
                var x = event.pageX - position.left;
                var y = event.pageY - position.top;

                if(eventObjectSellectMode) {
                    dummyEventObject.x = x;
                    dummyEventObject.y = y;
                }
            },

            mouseup:function(event) {

                if(eventObjectSellectMode) {
                    sceneList[eventSceneIndex].eventObjects[sellectObjectindex].Node[sellectNodeIndex].x = dummyEventObject.x;
                    sceneList[eventSceneIndex].eventObjects[sellectObjectindex].Node[sellectNodeIndex].y = eventBackGround.height - dummyEventObject.y - dummyEventObject.height;

                    var info =
                    {
                        sceneNum: sceneList[eventSceneIndex].SceneNumber,
                        charID: dummyEventObject.id,
                        node: sceneList[eventSceneIndex].eventObjects[sellectObjectindex].Node
                    }

                    WebSocketConnector.socket.emit('eventKeyValueEdit', JSON.stringify(info));

                    eventObjectSellectMode = false;
                }
            }
        }
    );
}

function changeEventScene()
{
    setEventSceneInit(sceneList[focusedTabSceneIndex].SceneName.getString(), focusedTabSceneIndex);

    eventContext.clearRect(0, 0, eventCanvas.width, eventCanvas.height);

    drawEventMap(focusedTabSceneIndex)
}

function drawEventMap(index)
{
    var name = sceneList[index].SceneName.getString();

    setEventSceneInit(name, index);

    eventBackGround.src = '../repo/demoProject/' + name + '/map/map.' + sceneList[index].ext;

    eventBackGround.onload = function (e) {
        eventContext.canvas.width = eventBackGround.width;
        eventContext.canvas.height = eventBackGround.height;

        makeEventObject("", 0);
        eventGameLoop();
    }
}

function drawEventObjects()
{
    eventContext.clearRect(0, 0, eventCanvas.width, eventCanvas.height);

    eventContext.drawImage(eventBackGround, 0, 0);

    for(var i = 0; i < eventObjects.length; i++)
    {
        eventObjects[i].update();
        eventObjects[i].render();
    }
}

function makeEventObject(name, time)
{
    var characterImg = [], direction, eventObjectCount = 0;

    eventObjects.splice(0, eventObjects.length);

    for(var i = 0; i < sceneList[eventSceneIndex].eventObjects.length; i++) {

        if(sceneList[eventSceneIndex].eventObjects[i].name == name)
        {
            for(var j = sceneList[eventSceneIndex].eventObjects[i].Node.length - 1; j >= 0; j--)
            {
                if(sceneList[eventSceneIndex].eventObjects[i].Node[j].time <= time) {
                    sellectObjectindex = i;
                    sellectNodeIndex = j;
                    sellectNodeName = sceneList[eventSceneIndex].eventObjects[i].name;

                    break;
                }
            }
        }

        for(var j = sceneList[eventSceneIndex].eventObjects[i].Node.length - 1; j >= 0; j--)
        {
            if(sceneList[eventSceneIndex].eventObjects[i].Node[j].time <= time)
            {
                characterImg.push(new Image());

                if (sceneList[eventSceneIndex].eventObjects[i].Node[j].direction == 0)
                    direction = 'Back';
                else if (sceneList[eventSceneIndex].eventObjects[i].Node[j].direction == 1)
                    direction = 'Front';
                else if (sceneList[eventSceneIndex].eventObjects[i].Node[j].direction == 2)
                    direction = 'Left';
                else if (sceneList[eventSceneIndex].eventObjects[i].Node[j].direction == 3)
                    direction = 'Right';

                characterImg[eventObjectCount].src = '../repo/demoProject/' + eventSceneName + '/objects/' + sceneList[eventSceneIndex].eventObjects[i].name + '/Idle' + direction + '.' + sceneList[eventSceneIndex].eventObjects[i].sprite.ext.idle[sceneList[eventSceneIndex].eventObjects[i].Node[j].direction];

                eventObjects.push(
                    eventSprite(
                        {
                            context: eventContext,
                            width: sceneList[eventSceneIndex].eventObjects[i].sprite.frameWidth.idle[sceneList[eventSceneIndex].eventObjects[i].Node[j].direction],
                            height: sceneList[eventSceneIndex].eventObjects[i].sprite.frameHeight.idle[sceneList[eventSceneIndex].eventObjects[i].Node[j].direction],
                            image: characterImg[eventObjectCount],
                            numberOfFrames: sceneList[eventSceneIndex].eventObjects[i].sprite.frameCount.idle[sceneList[eventSceneIndex].eventObjects[i].Node[j].direction],
                            x: sceneList[eventSceneIndex].eventObjects[i].Node[j].x,
                            y: sceneList[eventSceneIndex].eventObjects[i].Node[j].y,
                            id : sceneList[eventSceneIndex].eventObjects[i].id,
                            name : sceneList[eventSceneIndex].eventObjects[i].name,
                            ticksPerFrame: 2
                        }
                    )
                );
                eventObjectCount++;
                break;
            }
        }
    }

    if(name != "") {
        dummyEventObject = eventObjects[sellectObjectindex];
    }
    else {
        dummyEventObject = null;
    }
}

function eventGameLoop() {

    window.requestAnimationFrame(eventGameLoop);

    drawEventObjects();
}

function eventSprite(options) {

    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0;

    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.x = options.x;
    that.y = eventBackGround.height - options.y - options.height;
    that.image = options.image;
    that.id = options.id;
    that.canvasX = options.x;
    that.canvasY = (eventBackGround.height - options.y) - options.height;
    that.numberOfFrames = options.numberOfFrames || 1;
    that.name = options.name;

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
        // Draw the animation
        that.context.drawImage(
            that.image,
            frameIndex * that.width / that.numberOfFrames,
            0,
            that.width / that.numberOfFrames,
            that.height,
            that.x,
            that.y,
            that.width / that.numberOfFrames,
            that.height);
    };

    return that;
}