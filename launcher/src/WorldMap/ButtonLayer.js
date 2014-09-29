/**
 * Created by GNSSM_JBW on 2014-06-29.
 */

var WorldMapButton = cc.Layer.extend({
    SceneInfo : null,
    Menu : null,
    ButtonImage : new Array(),
    diff : {
        width : 0,
        height : 0
    },
    flag : false,

    ctor: function () {
        this._super();
    },

    dataInput: function (sceneInfo) {
        this.init(sceneInfo);

        var lastUpdate = Date.now();
        var myInterval = setInterval(tick, 0);

        function tick() {
            var now = Date.now();
            var dt = now - lastUpdate;
            lastUpdate = now;

            var speed = GameCamera.CameraSpeed * dt;
            WorldMapButton.GameUpdate(speed / 1000);
        }

        setInterval(tick, 0);
    },

    init : function(sceneInfo){
        if ('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
        }

        if ('keyboard' in sys.capabilities) {
            this.setKeyboardEnabled(true);
        }

        this.SceneInfo = sceneInfo;
        this.Menu = cc.Menu.create();

        this.diff.width = (1920 - GameCamera.width) / 2;
        this.diff.height = (1080 - GameCamera.height) / 2;

        for(var i=0; i<sceneInfo.worldMapObjects.length; i++){
            var buttonImage = cc.Sprite.create("../repo/demoProject/" + sceneInfo.name + "/objects/" + sceneInfo.worldMapObjects[i].name
                                + "/city." + sceneInfo.worldMapObjects[i].ext);
            buttonImage.setTextureRect(cc.rect(0, 0, sceneInfo.worldMapObjects[i].imageSize.width, sceneInfo.worldMapObjects[i].imageSize.height));
            buttonImage.setAnchorPoint(cc.p(0, 0));
            buttonImage.setPosition(cc.p(sceneInfo.worldMapObjects[i].position.x + this.diff.width, sceneInfo.worldMapObjects[i].position.y + this.diff.height));

            this.ButtonImage.push(buttonImage);
            this.addChild(buttonImage, 1, i);
        }

        this.flag = true;
    },

    SceneChange : function(){
        for(var i=0; i<this.SceneInfo.worldMapObjects.length; i++) {
            this.removeChildByTag(i, true);
        }

        this.SceneInfo = null;
        this.Menu = null;
        this.ButtonImage = new Array();
        this.diff = {
            width : 0,
            height : 0
        };
        this.flag = false;
    },

    onMouseMoved : function(event){
    },

    onMouseUp : function(event){
        if(this.flag == true) {
            var pos = event.getLocation();

            for (var i = 0; i < this.SceneInfo.worldMapObjects.length; i++) {
                if (pos.x > this.SceneInfo.worldMapObjects[i].displayX &&
                    pos.x < this.SceneInfo.worldMapObjects[i].displayX + this.SceneInfo.worldMapObjects[i].imageSize.width &&
                    pos.y > this.SceneInfo.worldMapObjects[i].displayY &&
                    pos.y < this.SceneInfo.worldMapObjects[i].displayY + this.SceneInfo.worldMapObjects[i].imageSize.height) {

                    var tempNum = this.SceneInfo.worldMapObjects[i].nextSceneNumber;
                    this.SceneChange();
                    WorldMapBackground.SceneChange();

                    GameLauncherScene.socket = io.connect('http://211.189.19.197:9987');
                    GameLauncherScene.socket.emit('requestSceneInfo', 0, tempNum);
                    return ;

                }
            }
        }
    },

    GameUpdate : function(dt){
        if (this.flag == true) {

            if (GameCamera.isMoved == true) {
                for (var i = 0; i < this.SceneInfo.worldMapObjects.length; i++) {
                    this.SceneInfo.worldMapObjects[i].displayX = this.SceneInfo.worldMapObjects[i].position.x - GameCamera.currentX + this.diff.width;
                    this.SceneInfo.worldMapObjects[i].displayY = this.SceneInfo.worldMapObjects[i].position.y - GameCamera.currentY + this.diff.height;
                    this.ButtonImage[i].setPosition(cc.p(this.SceneInfo.worldMapObjects[i].displayX, this.SceneInfo.worldMapObjects[i].displayY));
                }
            }
        }
    }
});
