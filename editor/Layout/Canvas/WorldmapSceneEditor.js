var worldMapBackGround;
var worldMApCanvas;
var worldMapContext;
var citys = [];
var citysName = [];
var dummyCity;
var dummyCityName;
var citySellectMode;
var worldMapSceneIndex;
var worldMapSceneName;

function setWorldMapSceneInit(name, index)
{
    worldMapBackGround = new Image();
    worldMApCanvas = document.getElementById(name + 'Canvas');
    worldMapContext = worldMApCanvas.getContext('2d');
    citySellectMode = false;
    worldMapSceneName = name;
    worldMapSceneIndex = index;

    $(worldMApCanvas).on(
        {
            // 마우스 이벤트 생기면 바뀐 Cell 적용해서 화면 다시그림
            mousedown: function (event) {
                var position = $(this).offset();
                var x = event.pageX - position.left;
                var y = event.pageY - position.top;

                for(var i = 0; i < citys.length; i++)
                {
                    if(citys[i].x < x && citys[i].x + citys[i].width > x && citys[i].y + citys[i].height > y && citys[i].y < y)
                    {
                        citySellectMode = true;
                        dummyCity = citys[i];

                        for(var j = 0; j < citysName.length; j++)
                        {
                            if(citysName[i].id == dummyCity.id)
                            {
                                dummyCityName = citysName[i];
                                cityInspectorInput(dummyCity.id);
                            }
                        }
                    }
                }
            },

            mousemove:function(evnet) {
                var position = $(this).offset();
                var x = event.pageX - position.left;
                var y = event.pageY - position.top;

                if(citySellectMode)
                {
                    dummyCity.x = x;
                    dummyCity.y = y;

                    dummyCityName.x = x;
                    dummyCityName.y = y + dummyCity.height;
                }

                drawAll();
            },

            mouseup:function(event) {

                if(citySellectMode) {
                    var info =
                    {
                        sceneNum: sceneList[worldMapSceneIndex].SceneNumber,
                        cityID: dummyCity.id,
                        position: {
                            x: dummyCity.x,
                            y: worldMapBackGround.height - dummyCity.y - dummyCity.height
                        }
                    }

                    WebSocketConnector.socket.emit('cityMove', JSON.stringify(info));

                    for (var i = 0; i < citys.length; i++) {
                        if (sceneList[worldMapSceneIndex].worldMapObjects[i].id == dummyCity.id) {
                            sceneList[worldMapSceneIndex].worldMapObjects[i].position.x = dummyCity.x;
                            sceneList[worldMapSceneIndex].worldMapObjects[i].position.y = dummyCity.y;
                        }
                    }

                    citySellectMode = false;

                    cityInspectorInput(dummyCity.id);
                }
            }
        }
    );
}
function worldMapObjectsName(options)
{
    var that = {};

    that.id = options.id;
    that.x = options.x;
    that.y = worldMapBackGround.height - options.y;
    that.cityName = options.cityName;

    return that
}

function worldMapSprite(options) {

    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;

    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.x = options.x;
    that.y = worldMapBackGround.height - options.y - options.height;
    that.image = options.image;
    that.id = options.id;

    that.update = function () {

        tickCount += 1;

        if (tickCount > ticksPerFrame) {

            tickCount = 0;

            // If the current frame index is in range
            if (frameIndex < numberOfFrames - 1) {
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
            0,
            0,
            that.width,
            that.height,
            that.x,
            that.y,
            that.width,
            that.height);
    };

    return that;
}

function worldMapDataChange()
{
    citys.splice(0, citys.length);
    citysName.splice(0, citysName.length);
    makeCitys();
    drawAll();
}

function drawAll()
{
    worldMapContext.clearRect(0, 0, worldMApCanvas.width, worldMApCanvas.height);
    worldMapContext.drawImage(worldMapBackGround, 0, 0);

    for(var i = 0; i < citys.length; i++)
    {
        citys[i].render();
    }

    for(var i = 0; i < citysName.length; i++)
    {
        worldMapContext.fillStyle = '#000000';
        worldMapContext.strokeStyle = "#000000";
        worldMapContext.font = 'bold 20px sans-serif';
        worldMapContext.fillText(citysName[i].cityName, citysName[i].x, citysName[i].y);
    }
}

function makeCitys()
{
    var worldMapImg = [], worldMapObjectCount = 0;

    for(var i = 0; i < sceneList[worldMapSceneIndex].worldMapObjects.length; i++) {
        if(sceneList[worldMapSceneIndex].worldMapObjects[i].position.x > 0 || sceneList[worldMapSceneIndex].worldMapObjects[i].position.y > 0)
        {
            worldMapImg.push(new Image());

            worldMapImg[worldMapObjectCount].src = '../repo/demoProject/' + worldMapSceneName + '/objects/' + sceneList[worldMapSceneIndex].worldMapObjects[i].name + '/city.' + sceneList[worldMapSceneIndex].worldMapObjects[i].ext;

            citysName.push(worldMapObjectsName(
                    {
                        id : sceneList[worldMapSceneIndex].worldMapObjects[i].id,
                        x : sceneList[worldMapSceneIndex].worldMapObjects[i].position.x,
                        y : sceneList[worldMapSceneIndex].worldMapObjects[i].position.y,
                        cityName : sceneList[worldMapSceneIndex].worldMapObjects[i].name
                    })
            );

            citys.push(
                worldMapSprite(
                    {
                        context: worldMapContext,
                        width: sceneList[worldMapSceneIndex].worldMapObjects[i].imageSize.width,
                        height: sceneList[worldMapSceneIndex].worldMapObjects[i].imageSize.height,
                        image: worldMapImg[worldMapObjectCount],
                        x: sceneList[worldMapSceneIndex].worldMapObjects[i].position.x,
                        y: sceneList[worldMapSceneIndex].worldMapObjects[i].position.y,
                        id : sceneList[worldMapSceneIndex].worldMapObjects[i].id
                    }
                )
            );
            worldMapObjectCount++;
        }
    }
}

function changeWorldMapScene()
{
    setWorldMapSceneInit(sceneList[focusedTabSceneIndex].SceneName.getString(), focusedTabSceneIndex);

    worldMapContext.clearRect(0, 0, worldMApCanvas.width, worldMApCanvas.height);

    drawWorldMap(focusedTabSceneIndex)
}

function drawWorldMap(index)
{
    worldMapBackGround.src = '../repo/demoProject/' + worldMapSceneName + '/map/map.' + sceneList[index].ext;

    worldMapBackGround.onload = function (e) {
        worldMapContext.canvas.width = worldMapBackGround.width;
        worldMapContext.canvas.height = worldMapBackGround.height;

        citys.splice(0, citys.length);
        citysName.splice(0, citysName.length);

        makeCitys();
        drawAll();
    }
}