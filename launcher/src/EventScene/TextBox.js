/**
 * Created by GNSSM_JBW on 2014-06-30.
 */

var TextBox = cc.Layer.extend({
    SceneInfo : null,
    Background : null,
    CharImage : new Array(),
    NextBtnOn : null,
    NextBtnOff : null,
    YesBtnOn : null,
    YesBtnOff : null,
    NoBtnOn : null,
    NoBtnOff : null,
    NameLabel : null,
    TextLabel : new Array(),
    Text : null,

    currentTime : false,
    currentText : "",
    currentScale : 0,
    charCnt : 0,
    lineCnt : 0,
    frequency : 0.15,
    maxLine : 7,
    isTextShowing : false,
    isTextBoxEffect : false,
    animationLayer : null,
    characterIndex : null,

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
            TextBox.GameUpdate(speed / 1000);
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

        this.Background = cc.Sprite.create("../repo/default/SpeakBoard.png", cc.rect(0, 0, 1445, 285));
        this.NextBtnOn = cc.Sprite.create("../repo/default/Complete.png", cc.rect(16 * 0, 0, 16, 16));
        this.NextBtnOff = cc.Sprite.create("../repo/default/Complete.png", cc.rect(16 * 1, 0, 16 ,16));
        this.NameLabel = cc.LabelTTF.create("조병우", "Arial", 25, cc.size(200, 30));

        for(var i=0; i<this.maxLine; i++){
            var tempLabel = cc.LabelTTF.create("", "Arial", 25);
            tempLabel.setAnchorPoint(cc.p(0, 1));
            tempLabel.setPosition(cc.p(30, 230 - (i*30)));
            this.Background.addChild(tempLabel, 3, 3);
            this.TextLabel.push(tempLabel);
        }

        for(var i=0; i<sceneInfo.eventObjects.length; i++){
            var tempImg = cc.Sprite.create("../repo/demoProject/" + sceneInfo.name + "/objects/" +
                sceneInfo.eventObjects[i].name + "/Illust." + sceneInfo.eventObjects[i].sprite.ext.illust,
                cc.rect(0, 0, sceneInfo.eventObjects[i].sprite.frameWidth.illust, sceneInfo.eventObjects[i].sprite.frameHeight.illust));

            tempImg.setAnchorPoint(cc.p(0.5, 0));
            tempImg.setPosition(cc.p(960, 0));
            tempImg.setVisible(false);
            this.CharImage.push(tempImg);
            this.addChild(this.CharImage[i]);
        }

        this.Background.setAnchorPoint(cc.p(0.5, 0.5));
        this.NextBtnOn.setAnchorPoint(cc.p(0, 0));
        this.NextBtnOff.setAnchorPoint(cc.p(0, 0));
        this.NameLabel.setAnchorPoint(cc.p(0.5, 0.5));

        this.Background.setPosition(cc.p(960, 172.5));
        this.NextBtnOn.setPosition(cc.p(500, 500));
        this.NextBtnOff.setPosition(cc.p(500, 500));
        this.NameLabel.setPosition(cc.p(1400, 260));

        this.Background.setVisible(false);
        this.NextBtnOn.setVisible(false);
        this.NextBtnOff.setVisible(false);

        this.Background.setOpacity(150);
        this.Background.setScale(0, 0);

        this.addChild(this.Background, 1, 1);
        this.addChild(this.NextBtnOn, 2, 2);
        this.addChild(this.NextBtnOff, 2, 2);
        this.Background.addChild(this.NameLabel, 3, 3);

        this.flag = true;
    },

    setAnimationLayer : function(layer)
    {
        this.animationLayer = layer;
    },

    ShowText : function(index){
        this.characterIndex = index
        this.Background.setVisible(true);
        this.CharImage[this.characterIndex].setVisible(true);
        this.isTextBoxEffect = true;
    },

    TextBoxDisplay : function(dt){
        this.currentTime += dt / 1000;
        if (this.currentTime > this.frequency) {
            var tempChar = this.Text[this.charCnt];

            if(tempChar != '\n')
                this.currentText += tempChar;
            else {
                this.currentText = "";
                this.lineCnt++;
            }

            this.TextLabel[this.lineCnt].setString(this.currentText);
            this.charCnt++;

            if(this.TextLabel[this.lineCnt].getTexture().getContentSize().width > 1330){
                this.currentText = "";
                this.lineCnt++;
            }

            if (this.charCnt == this.Text.length) {
                this.isTextShowing = false;
                this.charCnt = 0;
                this.lineCnt = 0;
            }

            this.currentTime = 0;
        }
    },

    TextBoxAnim : function(dt){
        this.currentScale += dt / 100;
        this.Background.setScale(this.currentScale, this.currentScale);

        if(this.currentScale > 1) {
            this.currentScale = 1;
            this.Background.setScale(this.currentScale, this.currentScale);
            this.isTextBoxEffect = false;
            this.isTextShowing = true;
        }
    },

    GameUpdate : function(dt){
        if(this.flag == true){
            if(this.isTextBoxEffect == true){
                this.TextBoxAnim(dt);
            }

            if(this.isTextShowing == true) {
                this.TextBoxDisplay(dt);
            }
        }
    },

    onMouseUp : function(event){
        this.frequency = 0.15;
    },

    onMouseDown : function(event){
        this.frequency = 0.01;

        if(!this.isTextShowing)
        {
            this.Background.setVisible(false);
            this.CharImage[this.characterIndex].setVisible(false);
            this.animationLayer.showingTextBox = false;

            this.currentText = "";

            for(var i = 0; i < this.TextLabel.length; i++)
            {
                this.TextLabel[i].setString("");
                this.TextLabel[i].getTexture()._contentSize.width = 0;
            }
        }
    }
});
