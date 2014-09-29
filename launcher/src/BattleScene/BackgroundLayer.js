/**
 * Created by GNSSM_JBW on 2014-05-14.
 */

var BackgroundLayer = cc.Layer.extend({
    background: null,
    backgroundTexture: null,
    backgroundWidth: null,
    backgroundHeight: null,
    SceneInfo: null,
    cellSprite: null,
    currentCell: {x:0, y:0},
    flag: false,

    pathCell: {
        enable : [],
        disable : []
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
            BackgroundLayer.GameUpdate(speed / 1000);
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
            this.backgroundTexture = cc.TextureCache.getInstance().addImage("../repo/default/map/map.png");

            this.backgroundWidth = this.defaultMapSize.width;
            this.backgroundHeight = this.defaultMapSize.height;
        }
        else {
            this.background = cc.Sprite.create("../repo/demoProject/" + sceneInfo.name + "/map/map." + sceneInfo.mapImageExt);
            this.backgroundTexture = cc.TextureCache.getInstance().addImage("../repo/demoProject/" + sceneInfo.name + "/map/map." + sceneInfo.mapImageExt);

            this.backgroundWidth = sceneInfo.mapSize.width;
            this.backgroundHeight = sceneInfo.mapSize.height;
        }

        GameCamera.mapWidth = this.backgroundWidth;
        GameCamera.mapHeight = this.backgroundHeight;
        GameCamera.width = 1920;
        GameCamera.height = 1080;

        var tempX = GameCamera.width;
        var tempY = GameCamera.height;

        if(this.backgroundWidth < GameCamera.width){
            tempX = this.backgroundWidth;
            GameCamera.width = tempX;
        }
        if(this.backgroundHeight < GameCamera.height){
            tempY = this.backgroundHeight;
            GameCamera.height = tempY;
        }

        this.background.setTextureRect(cc.rect(GameCamera.currentX, this.backgroundHeight - GameCamera.height - GameCamera.currentY,
            GameCamera.width, GameCamera.height));
        this.background.setPosition(cc.p(this.screenSize.width / 2, this.screenSize.height / 2));

        this.cellSprite = cc.Sprite.create("../repo/default/CurCell.png");
        this.cellSprite.setTextureRect(cc.rect(0, 0, GameCamera.tileSize, GameCamera.tileSize));
        this.cellSprite.setAnchorPoint(cc.p(0, 0));
        this.cellSprite.setOpacity(150);
        this.cellSprite.coordinate = {x:0, y:0};
        this.cellSprite.setVisible(false);

        this.addChild(this.background, 1, 1);
        this.addChild(this.cellSprite, 2, 2);

        //SoundManager.playMusic("../repo/demoProject/" + sceneInfo.name + "/bgm/bgm.wav", true);
        this.flag = true;
    },

    SceneChange : function(){
        this.removeChildByTag(1, true);
        this.removeChildByTag(2, true);

        this.background = null;
        this.backgroundWidth = null;
        this.backgroundHeight = null;
        this.SceneInfo = null;
        this.cellSprite = null;
        this.currentCell = {
            x : 0,
            y : 0
        };
        this.flag = false;
        this.pathCell = {
            enable : [],
            disable : []
        };
    },

    GameUpdate: function (dt) {
        if (this.flag == true) {
            this.background.setTextureRect(cc.rect(GameCamera.currentX, this.backgroundHeight - GameCamera.height - GameCamera.currentY,
                GameCamera.width, GameCamera.height));
            this.cellSprite.setPosition(cc.p(this.cellSprite.coordinate.x - GameCamera.currentX,
                    this.cellSprite.coordinate.y - GameCamera.currentY));

            for(var i=0; i<this.pathCell.enable.length; i++){
                this.pathCell.enable[i].setPosition(cc.p(this.pathCell.enable[i].coordinate.x - GameCamera.currentX,
                    this.pathCell.enable[i].coordinate.y - GameCamera.currentY));
            }

            for(var i=0; i<this.pathCell.disable.length; i++){
                this.pathCell.disable[i].setPosition(cc.p(this.pathCell.disable[i].coordinate.x - GameCamera.currentX,
                        this.pathCell.disable[i].coordinate.y - GameCamera.currentY));
            }
        }
    },

    onMouseMoved: function(event){
        if(this.flag == true) {
            this.currentCell.x = Math.floor((event.getLocation().x + GameCamera.currentX) / GameCamera.tileSize);
            this.currentCell.y = Math.floor((event.getLocation().y + GameCamera.currentY) / GameCamera.tileSize);
            this.cellSprite.coordinate.x = this.currentCell.x * GameCamera.tileSize;
            this.cellSprite.coordinate.y = this.currentCell.y * GameCamera.tileSize;

            for (var i = 0; i < this.pathCell.enable.length; i++) {
                if (this.pathCell.enable[i].coordinate.x / GameCamera.tileSize == this.currentCell.x &&
                    this.pathCell.enable[i].coordinate.y / GameCamera.tileSize == this.currentCell.y) {

                    this.pathCell.enable[i].setVisible(false);
                }
                else {
                    if (this.pathCell.enable[i].isVisible() == false) {
                        this.pathCell.enable[i].setVisible(true);
                    }
                }
            }

            for (var i = 0; i < this.pathCell.disable.length; i++) {
                if (this.pathCell.disable[i].coordinate.x / GameCamera.tileSize == this.currentCell.x &&
                    this.pathCell.disable[i].coordinate.y / GameCamera.tileSize == this.currentCell.y) {

                    this.pathCell.disable[i].setVisible(false);
                }
                else {
                    if (this.pathCell.disable[i].isVisible() == false) {
                        this.pathCell.disable[i].setVisible(true);
                    }
                }
            }

            this.cellSprite.setVisible(true);
        }
    }
});
