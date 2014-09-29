/**
 * Created by GNSSM_JBW on 2014-06-30.
 */

var EventBackground = cc.Layer.extend({
    SceneInfo : null,
    background : null,
    backgroundSize : null,

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
            EventBackground.GameUpdate(speed / 1000);
        }

        setInterval(tick, 0);
    },

    init: function (sceneInfo) {
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
        GameCamera.currentY = -456;

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

        this.background.setTextureRect(cc.rect(GameCamera.currentX, this.backgroundHeight - GameCamera.height - GameCamera.currentY,
            GameCamera.width, GameCamera.height));
        this.background.setPosition(cc.p(this.screenSize.width / 2, this.screenSize.height / 2));

        this.addChild(this.background, 1, 1);
        //SoundManager.playMusic("../repo/demoProject/" + sceneInfo.name + "/bgm/bgm.wav", true);
        this.flag = true;
    },

    SceneChange : function(){
    },

    GameUpdate: function (dt) {
    }
});