var sceneList = [];
var dummyScene;
var dummyLine;
var dummyPoint;

var g_sceneInfo;

var ButtonLayer = cc.Layer.extend({
    startButton:null,
    battleButton: null,
    eventButton: null,
    worldMapButton: null,
    worldMapButton: null,
    connectButton:null,
    connectMode:null,
    addMode:null,
    startScene:null,
    endScene:null,
    line:null,
    SceneNumber:null,
    boundaryLine:null,
    screenSize:null,
    addMode:null,
    helloLabel:null,
    focusingCircle:null,

    ctor: function () {
        this.connectMode = false;
        this.addMode = false;
        this.SceneNumber = 0;
        focusingCircle = null;
        this._super();
        this.init();
    },

    deleteSceneInfo : function(scene)
    {
        var arrowIndex = 0;
        var pointIndex = 0;

        var startArrowCount = scene.StartArrow.length;
        var endArrowCount = scene.EndArrow.length;
        var nextSceneCount = scene.NextScene.length;
        var prevSceneCount = scene.PrevScene.length;
        var startPointCount = scene.StartPoint.length;
        var endPointCount = scene.EndPoint.length;

        // 다음 Scene에 연결된 현재 Scene 연결선 정보 삭제
        while(startArrowCount != arrowIndex)
        {
            for(n = 0; n < nextSceneCount; n++)
            {
                var prevArrowCount = scene.NextScene[n].EndArrow.length;

                for(k = 0; k < prevArrowCount; k++)
                {
                    if(scene.StartArrow[arrowIndex] == scene.NextScene[n].EndArrow[k])
                    {
                        scene.NextScene[n].EndArrow.splice(k, 1);
                    }
                }
            }
            arrowIndex++;
        }

        arrowIndex = 0;

        // 이전 Scene에 연결된 현재 Scene 연결선 정보 삭제
        while(endArrowCount != arrowIndex)
        {
            for(n = 0; n < prevSceneCount; n++)
            {
                var nextArrowCount = scene.PrevScene[n].StartArrow.length;

                for(k = 0; k < nextArrowCount; k++)
                {
                    if(scene.EndArrow[arrowIndex] == scene.PrevScene[n].StartArrow[k])
                    {
                        scene.PrevScene[n].StartArrow.splice(k, 1);
                    }
                }
            }
            arrowIndex++;
        }

        // 다음 표시 점 정보 삭제
        while(startPointCount != pointIndex)
        {
            for(n = 0; n < nextSceneCount; n++)
            {
                var prevPointCount = scene.NextScene[n].EndPoint.length;

                for(k = 0; k < prevPointCount; k++)
                {
                    if(scene.StartPoint[pointIndex] == scene.NextScene[n].EndPoint[k])
                    {
                        scene.NextScene[n].EndPoint.splice(k, 1);
                    }
                }
            }
            pointIndex++;
        }

        pointIndex = 0;

        while(endPointCount != pointIndex)
        {
            for(n = 0; n < prevSceneCount; n++)
            {
                var nextPointCount = scene.PrevScene[n].StartPoint.length;

                for(k = 0; k < nextPointCount; k++)
                {
                    if(scene.EndPoint[pointIndex] == scene.PrevScene[n].StartPoint[k])
                    {
                        scene.PrevScene[n].StartPoint.splice(k, 1);
                    }
                }
            }
            pointIndex++;
        }

        var info =
        {
            name : scene.SceneName.getString(),
            id : scene.SceneNumber,
            list : []
        };

        // 다음 Scene에 연결된 현재 Scene정보 삭제
        for(n = 0; n < nextSceneCount; n++)
        {
            for(k = 0; k < scene.NextScene[n].PrevScene.length; k++)
            {
                if(scene == scene.NextScene[n].PrevScene[k])
                {
                    scene.NextScene[n].PrevScene.splice(k, 1);
                }
            }
        }

        // 이전 Scene에 연결된 현재 Scene정보 삭제
        for(n = 0; n < prevSceneCount; n++)
        {
            info.list.push(scene.PrevScene[n].SceneNumber);

            for(k = 0; k < scene.PrevScene[n].NextScene.length; k++)
            {
                if(scene == scene.PrevScene[n].NextScene[k])
                {
                    scene.PrevScene[n].NextScene.splice(k, 1);
                }
            }
        }

        WebSocketConnector.socket.emit('deleteScene', JSON.stringify(info));

        // 현재 화면에 그려져 있는 연결선, 연결점, Scene 이미지 삭제
        startArrowCount = scene.StartArrow.length;
        endArrowCount = scene.EndArrow.length;
        startPointCount = scene.StartPoint.length;
        endPointCount = scene.EndPoint.length;

        for (m = 0; m < startArrowCount; m = m + 1)
            scene.StartArrow[m].clear();

        for (m = 0; m < startArrowCount; m = m + 1)
            scene.StartArrow.pop();

        for (m = 0; m < endArrowCount; m = m + 1)
            scene.EndArrow[m].clear();

        for (m = 0; m < endArrowCount; m = m + 1)
            scene.EndArrow.pop();

        for(m = 0; m < startPointCount; m = m + 1)
            scene.StartPoint[m].clear();

        for(m = 0; m < startPointCount; m = m + 1)
            scene.StartPoint.pop();

        for(m = 0; m < endPointCount; m = m + 1)
            scene.EndPoint[m].clear();

        for(m = 0; m < endPointCount; m = m + 1)
            scene.EndPoint.pop();
    },

    getMaxSceneNumber : function()
    {
        var m, max = 0;

        for(m = 0; m < g_sceneInfo.length; m++)
            if(max < g_sceneInfo[m].sceneNumber)
                max = g_sceneInfo[m].sceneNumber;

        return max;
    },

    dataInput : function(data)
    {
        g_sceneInfo = JSON.parse(data);

        var m, n, k;

        // Scene Graph 로딩
        // Node 로딩
        for(m = 0; m < g_sceneInfo.length; m++)
        {
            dummyScene = new Scene(g_sceneInfo[m].type);
            dummyScene.setPosition(g_sceneInfo[m].graphPosition.x, g_sceneInfo[m].graphPosition.y);
            dummyScene.setSecneNumber(g_sceneInfo[m].sceneNumber);
            dummyScene.setString(g_sceneInfo[m].name);
            dummyScene.isStart = g_sceneInfo[m].isStart;
            dummyScene.tabNumber = -1;
            dummyScene.eventObjects = g_sceneInfo[m].eventObjects;
            dummyScene.eventCameraNode = g_sceneInfo[m].eventCameraNode;
            dummyScene.battleObjects = g_sceneInfo[m].battleObjects;
            dummyScene.battleMapMovable = g_sceneInfo[m].battleMapMovable;
            dummyScene.worldMapObjects = g_sceneInfo[m].worldMapObjects;
            dummyScene.isMapImageUpload = g_sceneInfo[m].isMapImageUpload;
            dummyScene.mapSize.width = g_sceneInfo[m].mapSize.width;
            dummyScene.mapSize.height = g_sceneInfo[m].mapSize.height;
            dummyScene.ext = g_sceneInfo[m].mapImageExt;
            dummyScene.isBGMUpload = g_sceneInfo[m].isBgmUpload;
            dummyScene.bgmExt = g_sceneInfo[m].bgmExt;

            for(n = 0; n < g_sceneInfo[m].nextSceneIDs.length; n++)
                dummyScene.NextSceneNumber.push(g_sceneInfo[m].nextSceneIDs[n]);

            this.addChild(dummyScene, 1);

            sceneList.push(dummyScene);
        }

        // 연결선 로딩
        for(m = 0; m < sceneList.length; m++) {
            for (n = 0; n < sceneList[m].NextSceneNumber.length; n++) {
                for (k = 0; k < sceneList.length; k++) {
                    if (sceneList[m].NextSceneNumber[n] == sceneList[k].SceneNumber) {
                        sceneList[m].NextScene.push(sceneList[k]);
                        sceneList[k].PrevScene.push(sceneList[m]);

                        dummyLine = new cc.DrawNode.create();

                        this.addChild(dummyLine, 2);

                        dummyLine.drawSegment(cc.p(sceneList[m].getPosition().x + sceneList[m].getContentSize().width / 2, sceneList[m].getPosition().y),
                            cc.p(sceneList[k].getPosition().x - sceneList[k].getContentSize().width / 2, sceneList[k].getPosition().y),
                            1, cc.c4f(0.1, 0.1, 0.1, 1));

                        dummyPoint = new cc.DrawNode.create();

                        this.addChild(dummyPoint, 2);
                        dummyPoint.drawDot(cc.p(sceneList[k].getPosition().x - sceneList[k].getContentSize().width / 2, sceneList[k].getPosition().y), 5, cc.c4f(0.1, 0.1, 0.1, 1));

                        sceneList[m].StartArrow.push(dummyLine);
                        sceneList[m].StartPoint.push(dummyPoint);
                        sceneList[k].EndArrow.push(dummyLine);
                        sceneList[k].EndPoint.push(dummyPoint);
                    }
                }
            }
        }

        for(m = 0; m < sceneList.length; m++)
        {
            if(sceneList[m].isStart)
            {
                this.startButton.NextScene.push(sceneList[m]);
                sceneList[m].PrevScene.push(this.startButton);

                dummyLine = new cc.DrawNode.create();

                this.addChild(dummyLine, 2);

                dummyLine.drawSegment(cc.p(this.startButton.getPosition().x + this.startButton.getContentSize().width / 2, this.startButton.getPosition().y),
                    cc.p(sceneList[m].getPosition().x - sceneList[m].getContentSize().width / 2, sceneList[m].getPosition().y),
                    1, cc.c4f(0.1, 0.1, 0.1, 1));

                dummyPoint = new cc.DrawNode.create();

                this.addChild(dummyPoint, 2);
                dummyPoint.drawDot(cc.p(sceneList[m].getPosition().x - sceneList[m].getContentSize().width / 2, sceneList[m].getPosition().y), 5, cc.c4f(0.1, 0.1, 0.1, 1));

                this.startButton.StartArrow.push(dummyLine);
                this.startButton.StartPoint.push(dummyPoint);
                sceneList[m].EndArrow.push(dummyLine);
                sceneList[m].EndPoint.push(dummyPoint);

                var info =
                {
                    id : sceneList[m].SceneNumber
                };

                WebSocketConnector.socket.emit('setStartNode', JSON.stringify(info));
            }
        }

        this.SceneNumber = this.getMaxSceneNumber();
        this.SceneNumber++;
    },

    init: function (){
        //////////////////////////////
        // 1. super init first
        this._super();

        this.screenSize = cc.Director.getInstance().getWinSize();

        var layer1 = cc.LayerColor.create(new cc.Color4B(220, 220, 220, 255), document.getElementById("sceneGraphCanvas").scrollWidth, document.getElementById("sceneGraphCanvas").scrollHeight);
        layer1.setAnchorPoint(new cc.Point(0.5, 0.5));
        this.addChild(layer1, 0);

        this.startButton = new Scene(3);
        this.startButton.setSecneNumber(this.SceneNumber++);
        this.startButton.setPosition(this.screenSize.width / 22 * 3, this.screenSize.height / 11 * 10);
        this.startButton.sceneNumber = -1;
        this.addChild(this.startButton, 1);

        this.eventButton = new Scene(1);
        this.eventButton.setPosition(this.screenSize.width / 22, this.screenSize.height / 11 * 10);
        this.addChild(this.eventButton, 1);

        this.battleButton = new Scene(0);
        this.battleButton.setPosition(this.screenSize.width / 22, this.screenSize.height / 11 * 8.5);
        this.addChild(this.battleButton, 1);

        this.worldMapButton = new Scene(2);
        this.worldMapButton.setPosition(this.screenSize.width / 22, this.screenSize.height / 11 * 7);
        this.addChild(this.worldMapButton, 1);

        this.connectButton = new Scene(4);
        this.connectButton.setPosition(this.screenSize.width / 22, this.screenSize.height / 11 * 6.0);
        this.connectButton.setScale(0.5);
        this.addChild(this.connectButton, 1);

        // 경계선
        this.boundaryLine = cc.DrawNode.create();
        this.addChild(this.boundaryLine, 1);
        this.boundaryLine.drawSegment(cc.p(this.screenSize.width / 11, this.screenSize.height),
            cc.p(this.screenSize.width / 11, 0),
            1, cc.c4f(0.1, 0.1, 0.1, 1));

        this.focusingCircle = cc.DrawNode.create();

        this.setTouchEnabled(true);

        return true;
    },
    // a selector callback
    menuCloseCallback: function (sender) {
        cc.Director.getInstance().end();
    },

    onTouchesBegan:function (touches, event) {
        var n;

        // Connect Mode 일때
        if(this.connectMode)
        {
            // Scene 노드 선택
            for(n = 0; n < sceneList.length; n = n + 1) {
                if (sceneList[n].getPosition().x - sceneList[n].getContentSize().width / 2 < touches[0].getLocation().x &&
                    sceneList[n].getPosition().x + sceneList[n].getContentSize().width / 2 > touches[0].getLocation().x &&
                    sceneList[n].getPosition().y - sceneList[n].getContentSize().height / 2 < touches[0].getLocation().y &&
                    sceneList[n].getPosition().y + sceneList[n].getContentSize().height / 2 > touches[0].getLocation().y) {
                    this.startScene = sceneList[n];
                }
            }

            // Start 노드 선택
            if(this.startButton.getPosition().x - this.startButton.getContentSize().width / 2 < touches[0].getLocation().x &&
                this.startButton.getPosition().x + this.startButton.getContentSize().width / 2 > touches[0].getLocation().x &&
                this.startButton.getPosition().y - this.startButton.getContentSize().height / 2 < touches[0].getLocation().y &&
                this.startButton.getPosition().y + this.startButton.getContentSize().height / 2 > touches[0].getLocation().y) {
                this.startScene = this.startButton;
            }
        }

        else
        {
            for(n = 0; n < sceneList.length; n = n + 1) {
                if (sceneList[n].getPosition().x - sceneList[n].getContentSize().width / 2 < touches[0].getLocation().x &&
                    sceneList[n].getPosition().x + sceneList[n].getContentSize().width / 2 > touches[0].getLocation().x &&
                    sceneList[n].getPosition().y - sceneList[n].getContentSize().height / 2 < touches[0].getLocation().y &&
                    sceneList[n].getPosition().y + sceneList[n].getContentSize().height / 2 > touches[0].getLocation().y) {
                    dummyScene = sceneList[n];
                }
            }

            if (this.battleButton.getPosition().x - this.battleButton.getContentSize().width / 2 < touches[0].getLocation().x &&
                this.battleButton.getPosition().x + this.battleButton.getContentSize().width / 2 > touches[0].getLocation().x &&
                this.battleButton.getPosition().y - this.battleButton.getContentSize().height / 2 < touches[0].getLocation().y &&
                this.battleButton.getPosition().y + this.battleButton.getContentSize().height / 2 > touches[0].getLocation().y) {
                dummyScene = new Scene(0);
                dummyScene.setSecneNumber(this.SceneNumber++);
                dummyScene.isStart = false;
                dummyScene.tabNumber = -1;
                dummyScene.ProjectID = null;
                dummyScene.Rivision = null;
                dummyScene.PositionX = null;
                dummyScene.PositionY = null;
                dummyScene.ext = null;
                dummyScene.eventObjects = [];
                dummyScene.eventCameraNode = [];
                dummyScene.battleObjects = [];
                dummyScene.battleMapMovable = [];
                dummyScene.worldMapObjects = [];
                dummyScene.isMapImageUpload = false;
                dummyScene.isBGMUpload = false;
                dummyScene.bgmExt = null;
                dummyScene.mapSize.width = null;
                dummyScene.mapSize.height = null;

                this.addChild(dummyScene, 1);
                this.addMode = true;
            }
            else if (this.eventButton.getPosition().x - this.eventButton.getContentSize().width / 2 < touches[0].getLocation().x &&
                this.eventButton.getPosition().x + this.eventButton.getContentSize().width / 2 > touches[0].getLocation().x &&
                this.eventButton.getPosition().y - this.eventButton.getContentSize().height / 2 < touches[0].getLocation().y &&
                this.eventButton.getPosition().y + this.eventButton.getContentSize().height / 2 > touches[0].getLocation().y) {
                dummyScene = new Scene(1);
                dummyScene.setSecneNumber(this.SceneNumber++);
                dummyScene.isStart = false;
                dummyScene.tabNumber = -1;
                dummyScene.ProjectID = null;
                dummyScene.Rivision = null;
                dummyScene.PositionX = null;
                dummyScene.PositionY = null;
                dummyScene.ext = null;
                dummyScene.eventObjects = [];
                dummyScene.eventCameraNode = [];
                dummyScene.battleObjects = [];
                dummyScene.battleMapMovable = [];
                dummyScene.worldMapObjects = [];
                dummyScene.isMapImageUpload = false;
                dummyScene.isBGMUpload = false;
                dummyScene.bgmExt = null;
                dummyScene.mapSize.width = null;
                dummyScene.mapSize.height = null;
                this.addChild(dummyScene, 1);
                this.addMode = true;
            }
            else if (this.worldMapButton.getPosition().x - this.worldMapButton.getContentSize().width / 2 < touches[0].getLocation().x &&
                this.worldMapButton.getPosition().x + this.worldMapButton.getContentSize().width / 2 > touches[0].getLocation().x &&
                this.worldMapButton.getPosition().y - this.worldMapButton.getContentSize().height / 2 < touches[0].getLocation().y &&
                this.worldMapButton.getPosition().y + this.worldMapButton.getContentSize().height / 2 > touches[0].getLocation().y) {
                dummyScene = new Scene(2);
                dummyScene.setSecneNumber(this.SceneNumber++);
                dummyScene.isStart = false;
                dummyScene.tabNumber = -1;
                dummyScene.ProjectID = null;
                dummyScene.Rivision = null;
                dummyScene.PositionX = null;
                dummyScene.PositionY = null;
                dummyScene.ext = null;
                dummyScene.eventObjects = [];
                dummyScene.eventCameraNode = [];
                dummyScene.battleObjects = [];
                dummyScene.battleMapMovable = [];
                dummyScene.worldMapObjects = [];
                dummyScene.isMapImageUpload = false;
                dummyScene.isBGMUpload = false;
                dummyScene.bgmExt = null;
                dummyScene.mapSize.width = null;
                dummyScene.mapSize.height = null;
                this.addChild(dummyScene, 1);
                this.addMode = true;
            }
        }
    },
    onTouchesMoved: function (touches, event) {
        if (!this.connectMode)
        {
            dummyScene.setPosition(touches[0].getLocation().x, touches[0].getLocation().y);
            this.focusingCircle.setPosition(touches[0].getLocation().x, touches[0].getLocation().y);
        }
    },
    onTouchesEnded: function (touches, event) {
        var n, m, k, s;

        // 연결 모드일때
        if(this.connectMode)
        {
            for(n = 0; n < sceneList.length; n = n + 1) {
                if (sceneList[n].getPosition().x - sceneList[n].getContentSize().width / 2 < touches[0].getLocation().x &&
                    sceneList[n].getPosition().x + sceneList[n].getContentSize().width / 2 > touches[0].getLocation().x &&
                    sceneList[n].getPosition().y - sceneList[n].getContentSize().height / 2 < touches[0].getLocation().y &&
                    sceneList[n].getPosition().y + sceneList[n].getContentSize().height / 2 > touches[0].getLocation().y) {

                    this.endScene = sceneList[n];

                    if(this.endScene != this.startScene)
                    {
                        if(this.endScene != this.startButton)
                        {
                            if(this.startScene.Type == 3)
                            {
                                if(this.startScene.NextScene.length != 0) {
                                    this.startScene.NextScene.isStart = false;
                                    this.deleteSceneInfo(this.startScene);
                                }
                                this.endScene.isStart = true;

                                var info =
                                {
                                    id : this.endScene.SceneNumber
                                };

                                WebSocketConnector.socket.emit('setStartNode', JSON.stringify(info));
                            }

                            this.startScene.NextScene.push(this.endScene);
                            this.endScene.PrevScene.push(this.startScene);

                            dummyLine = new cc.DrawNode.create();

                            this.addChild(dummyLine, 2);
                            dummyLine.drawSegment(cc.p(this.startScene.getPosition().x + this.startScene.getContentSize().width / 2, this.startScene.getPosition().y),
                                cc.p(this.endScene.getPosition().x - this.endScene.getContentSize().width / 2, this.endScene.getPosition().y),
                                1, cc.c4f(0.1, 0.1, 0.1, 1));

                            dummyPoint = new cc.DrawNode.create();

                            this.addChild(dummyPoint, 2);
                            dummyPoint.drawDot(cc.p(this.endScene.getPosition().x - this.endScene.getContentSize().width / 2, this.endScene.getPosition().y), 5, cc.c4f(0.1, 0.1, 0.1, 1));

                            this.startScene.StartArrow.push(dummyLine);
                            this.startScene.StartPoint.push(dummyPoint);
                            this.endScene.EndArrow.push(dummyLine);
                            this.endScene.EndPoint.push(dummyPoint);

                            dummyScene = this.endScene;

                            var info =
                            {
                                startScene : this.startScene.SceneNumber,
                                endScene : this.endScene.SceneNumber
                            };

                            WebSocketConnector.socket.emit('linkAdd', JSON.stringify(info));

                            focusSceneNode(this.endScene.SceneNumber);
                        }
                    }
                }
            }

            this.focusingCircle.clear();

            this.focusingCircle = cc.DrawNode.create();
            this.focusingCircle.drawDot(cc.p(dummyScene.getPosition().x, dummyScene.getPosition().y), 65, cc.c4f(0.1, 0.1, 0.1, 0.9));
            this.addChild(this.focusingCircle, 0);
        }

        // 연결 모드가 아닐때(추가, 삭제, 이동)
        else {
            // 노드 삭제
            if (this.screenSize.width / 11 > dummyScene.getPosition().x) {

                if(this.addMode)
                {
                    this.removeChild(dummyScene);
                    this.focusingCircle.clear();
                }
                else {
                    this.deleteSceneInfo(dummyScene);

                    for (var i = 0; i < sceneList.length; i++) {
                        if (dummyScene.SceneNumber == sceneList[i].SceneNumber) {
                            sceneList.splice(i, 1);
                        }
                    }

                    this.removeChild(dummyScene);
                    this.focusingCircle.clear();
                }
            }

            // 이동, 추가
            else
            {
                // 이동
                if(!this.addMode) {
                    if (dummyScene.StartArrow.length != 0) {

                        var startArrowCount = dummyScene.StartArrow.length;

                        for (m = 0; m < startArrowCount; m = m + 1)
                            dummyScene.StartArrow[m].clear();

                        for (m = 0; m < startArrowCount; m = m + 1)
                            dummyScene.StartArrow.pop();

                        for (m = 0; m < dummyScene.NextScene.length; m = m + 1) {
                            dummyLine = new cc.DrawNode.create();

                            this.addChild(dummyLine, 2);
                            dummyLine.drawSegment(cc.p(dummyScene.getPosition().x + dummyScene.getContentSize().width / 2, dummyScene.getPosition().y),
                                cc.p(dummyScene.NextScene[m].getPosition().x - dummyScene.NextScene[m].getContentSize().width / 2, dummyScene.NextScene[m].getPosition().y),
                                1, cc.c4f(0.1, 0.1, 0.1, 1));

                            dummyScene.StartArrow.push(dummyLine);
                            dummyScene.NextScene[m].EndArrow.push(dummyLine);
                        }
                    }

                    if (dummyScene.EndArrow.length != 0) {
                        var endArrowCount = dummyScene.EndArrow.length;
                        var endPointCount = dummyScene.EndPoint.length;
                        var pointIndex = 0;

                        while (pointIndex != endPointCount) {
                            for (m = 0; m < dummyScene.PrevScene.length; m++) {
                                for (n = 0; n < dummyScene.PrevScene[m].StartPoint.length; n++) {
                                    if (dummyScene.EndPoint[pointIndex] == dummyScene.PrevScene[m].StartPoint[n]) {
                                        dummyScene.PrevScene[m].StartPoint.splice(n, 1);
                                    }
                                }
                            }
                            pointIndex++;
                        }

                        for (m = 0; m < endPointCount; m = m + 1)
                            dummyScene.EndPoint[m].clear();

                        for (m = 0; m < endPointCount; m = m + 1)
                            dummyScene.EndPoint.pop();

                        for (m = 0; m < endArrowCount; m = m + 1)
                            dummyScene.EndArrow[m].clear();

                        for (m = 0; m < endArrowCount; m = m + 1)
                            dummyScene.EndArrow.pop();

                        for (m = 0; m < dummyScene.PrevScene.length; m = m + 1) {
                            dummyLine = new cc.DrawNode.create();

                            this.addChild(dummyLine, 2);
                            dummyLine.drawSegment(cc.p(dummyScene.getPosition().x - dummyScene.getContentSize().width / 2, dummyScene.getPosition().y),
                                cc.p(dummyScene.PrevScene[m].getPosition().x + dummyScene.PrevScene[m].getContentSize().width / 2, dummyScene.PrevScene[m].getPosition().y),
                                1, cc.c4f(0.1, 0.1, 0.1, 1));

                            dummyPoint = new cc.DrawNode.create();

                            this.addChild(dummyPoint, 2);
                            dummyPoint.drawDot(cc.p(dummyScene.getPosition().x - dummyScene.getContentSize().width / 2, dummyScene.getPosition().y), 5, cc.c4f(0.1, 0.1, 0.1, 1));

                            dummyScene.EndArrow.push(dummyLine);
                            dummyScene.PrevScene[m].StartArrow.push(dummyLine);
                            dummyScene.EndPoint.push(dummyPoint);
                            dummyScene.PrevScene[m].StartPoint.push(dummyPoint);
                        }
                    }

                    // 서버에 전송
                    var info =
                    {
                        id : dummyScene.SceneNumber,
                        x : dummyScene.getPosition().x,
                        y : dummyScene.getPosition().y
                    };

                    WebSocketConnector.socket.emit('sceneNodeMove', JSON.stringify(info));

                    focusSceneNode(dummyScene.SceneNumber);
                }

                // 추가
                else if(this.addMode)
                {
                    sceneList.push(dummyScene);

                    var info =
                    {
                        type : dummyScene.Type,
                        id : dummyScene.SceneNumber,
                        x : dummyScene.getPosition().x,
                        y : dummyScene.getPosition().y
                    };

                    WebSocketConnector.socket.emit('createScene', JSON.stringify(info));
                    WebSocketConnector.socket.on('createSceneName', function(name) {
                        dummyScene.SceneName.setString(name);
                        focusSceneNode(dummyScene.SceneNumber);
                    });

                    this.addMode = false;
                }

                this.focusingCircle.clear();

                this.focusingCircle = cc.DrawNode.create();
                this.focusingCircle.drawDot(cc.p(dummyScene.getPosition().x, dummyScene.getPosition().y), 65, cc.c4f(0.1, 0.1, 0.1, 0.9));
                this.addChild(this.focusingCircle, 0);
            }
        }

        if(this.connectButton.getPosition().x - this.connectButton.getContentSize().width / 2 < touches[0].getLocation().x &&
            this.connectButton.getPosition().x + this.connectButton.getContentSize().width / 2 > touches[0].getLocation().x &&
            this.connectButton.getPosition().y - this.connectButton.getContentSize().height / 2 < touches[0].getLocation().y &&
            this.connectButton.getPosition().y + this.connectButton.getContentSize().height / 2 > touches[0].getLocation().y)
        {
            if(this.connectMode == false)
                this.connectMode = true;
            else
                this.connectMode = false;
        }
    },
    onTouchesCancelled: function (touches, event) {
        console.log("onTouchesCancelled");
    }
});
