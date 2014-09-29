/**
 * Created by GNSSM_JBW on 2014-06-29.
 */

var WorldMapBackground = cc.Layer.extend({
    SceneInfo : null,
    flag : false,
    background : null,
    backgroundSize : {
        width : -1,
        height : -1
    },
    defaultMapSize: {
        width : 2560,
        height : 1536
    },

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
            WorldMapBackground.GameUpdate(speed / 1000);
        }

        setInterval(tick, 0);
    },

    init: function (sceneInfo) {
        if ('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
        }

        if ('keyboard' in sys.capabilities) {
            this.setKeyboardEnabled(true);
        }

        this.SceneInfo = sceneInfo;
        this.screenSize = cc.Director.getInstance().getWinSize();

        if(sceneInfo.isMapImageUpload == false){
            this.background = cc.Sprite.create("../repo/default/map/map.png");
            this.backgroundSize = this.defaultMapSize;
        }
        else{
            this.background = cc.Sprite.create("../repo/demoProject/" + sceneInfo.name + "/map/map." + sceneInfo.mapImageExt);
            this.backgroundSize = sceneInfo.mapSize;
        }

        GameCamera.mapWidth = this.backgroundSize.width;
        GameCamera.mapHeight = this.backgroundSize.height;
        GameCamera.width = 1920;
        GameCamera.height = 1080;

        var tempX = GameCamera.width;
        var tempY = GameCamera.height;

        if(this.backgroundSize.width < GameCamera.width){
            tempX = this.backgroundSize.width;
            GameCamera.width = tempX;
        }
        if(this.backgroundSize.height < GameCamera.height){
            tempY = this.backgroundSize.height;
            GameCamera.height = tempY;
        }

        GameCamera.currentX = 0;
        GameCamera.currentY = 0;

        this.background.setTextureRect(cc.rect(GameCamera.currentX, this.backgroundSize.height - GameCamera.height - GameCamera.currentY,
            GameCamera.width, GameCamera.height));
        this.background.setPosition(cc.p(this.screenSize.width / 2, this.screenSize.height / 2));

        this.addChild(this.background, 1);
        //SoundManager.playMusic("../repo/demoProject/" + sceneInfo.name + "/bgm/bgm.wav", true);
        this.flag = true;
    },

    SceneChange : function(){
        this.removeChild(this.background);
        this.SceneInfo = null;
        this.flag = false;
        this.background = null;
        this.backgroundSize = {
            width : -1,
            height : -1
        };
    },

    GameUpdate : function(dt){
        if (this.flag == true) {
            this.background.setTextureRect(cc.rect(GameCamera.currentX, this.backgroundSize.height - GameCamera.height - GameCamera.currentY,
                GameCamera.width, GameCamera.height));
        }
    }
});