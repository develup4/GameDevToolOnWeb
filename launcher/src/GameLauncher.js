var BattleScene = null;
var EventScene = null;
var WorldMapScene = null;

var GameLauncherScene = cc.Scene.extend({
    socket: null,

    ttest: function (data) {
        var sceneInfo = JSON.parse(data);
        if(sceneInfo == null){
            alert("Game Over");
        }

        if(sceneInfo.type == 0) {
            if(EventScene.getChildByTag(0) != null)     EventScene.removeChild(GameCamera, true);
            if(EventScene.getChildByTag(1) != null)     EventScene.removeChild(EventBackground, true);
            if(EventScene.getChildByTag(2) != null)     EventScene.removeChild(EventAnimation, true);
            if(EventScene.getChildByTag(3) != null)     EventScene.removeChild(TextBox, true);

            if(WorldMapScene.getChildByTag(0) != null)      WorldMapScene.removeChild(GameCamera, true);
            if(WorldMapScene.getChildByTag(1) != null)      WorldMapScene.removeChild(WorldMapBackground, true);
            if(WorldMapScene.getChildByTag(2) != null)      WorldMapScene.removeChild(WorldMapButton, true);

            GameCamera.dataInput();
            BackgroundLayer.dataInput(sceneInfo);
            AnimationLayer.dataInput(sceneInfo);
            StatusLayer.dataInput(sceneInfo);

            BattleScene = cc.Scene.create();
            BattleScene.addChild(GameCamera, 0, 0);
            BattleScene.addChild(BackgroundLayer, 1, 1);
            BattleScene.addChild(AnimationLayer, 2, 2);
            BattleScene.addChild(StatusLayer, 3, 3);

            cc.Director.getInstance().replaceScene(cc.TransitionShrinkGrow.create(0.5, BattleScene));
        }
        else if(sceneInfo.type == 1){
            if(BattleScene.getChildByTag(0) != null)    BattleScene.removeChild(GameCamera, true);
            if(BattleScene.getChildByTag(1) != null)    BattleScene.removeChild(BackgroundLayer, true);
            if(BattleScene.getChildByTag(2) != null)    BattleScene.removeChild(AnimationLayer, true);
            if(BattleScene.getChildByTag(3) != null)    BattleScene.removeChild(StatusLayer, true);

            if(WorldMapScene.getChildByTag(0) != null)      WorldMapScene.removeChild(GameCamera, true);
            if(WorldMapScene.getChildByTag(1) != null)      WorldMapScene.removeChild(WorldMapBackground, true);
            if(WorldMapScene.getChildByTag(2) != null)      WorldMapScene.removeChild(WorldMapButton, true);

            GameCamera.dataInput();
            EventBackground.dataInput(sceneInfo);
            TextBox.dataInput(sceneInfo);
            EventAnimation.dataInput(sceneInfo, TextBox);
            TextBox.setAnimationLayer(EventAnimation);

            EventScene = cc.Scene.create();
            EventScene.addChild(GameCamera, 0, 0);
            EventScene.addChild(EventBackground, 1, 1);
            EventScene.addChild(EventAnimation, 2, 2);
            EventScene.addChild(TextBox, 3, 3);
            cc.Director.getInstance().replaceScene(cc.TransitionShrinkGrow.create(0.5, EventScene));
        }
        else if(sceneInfo.type == 2){
            if(BattleScene.getChildByTag(0) != null)    BattleScene.removeChild(GameCamera, true);
            if(BattleScene.getChildByTag(1) != null)    BattleScene.removeChild(BackgroundLayer, true);
            if(BattleScene.getChildByTag(2) != null)    BattleScene.removeChild(AnimationLayer, true);
            if(BattleScene.getChildByTag(3) != null)    BattleScene.removeChild(StatusLayer, true);

            if(EventScene.getChildByTag(0) != null)     EventScene.removeChild(GameCamera, true);
            if(EventScene.getChildByTag(1) != null)     EventScene.removeChild(EventBackground, true);
            if(EventScene.getChildByTag(2) != null)     EventScene.removeChild(EventAnimation, true);
            if(EventScene.getChildByTag(3) != null)     EventScene.removeChild(TextBox, true);

            GameCamera.dataInput();
            WorldMapBackground.dataInput(sceneInfo);
            WorldMapButton.dataInput(sceneInfo);

            WorldMapScene = cc.Scene.create();
            WorldMapScene.addChild(GameCamera, 0, 0);
            WorldMapScene.addChild(WorldMapBackground, 1, 1);
            WorldMapScene.addChild(WorldMapButton, 2, 2);
            cc.Director.getInstance().replaceScene(cc.TransitionShrinkGrow.create(0.5, WorldMapScene));
        }
    },
    onEnter: function () {
        this._super();

        GameCamera = new GameCamera();
        BackgroundLayer = new BackgroundLayer();
        AnimationLayer = new AnimationLayer();
        StatusLayer = new StatusLayer();

        EventBackground = new EventBackground();
        TextBox = new TextBox();
        EventAnimation = new EventAnimation();

        WorldMapBackground = new WorldMapBackground();
        WorldMapButton = new WorldMapButton();

        BattleScene = cc.Scene.create();
        EventScene = cc.Scene.create();
        WorldMapScene = cc.Scene.create();

        this.socket = io.connect('http://211.189.19.197:9987');
        this.socket.emit('requestSceneInfo', 0, 0);
        this.socket.on('responseSceneInfo', this.ttest);
    }
});

function sleep(num){
    var now = new Date();
    var stop = now.getTime() + num;
    while(true){
        now = new Date();
        if(now.getTime() > stop)return;
    }
}