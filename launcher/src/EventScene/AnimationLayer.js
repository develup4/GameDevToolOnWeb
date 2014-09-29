/**
 * Created by GNSSM_JBW on 2014-07-01.
 */

var EventAnimation = cc.Layer.extend({
    SceneInfo : null,

    UnitData: null,
    AnimationData: null,
    ActionData: null,
    animSpeed : 0.05,
    flag : false,

    stateSuffix: [
        "IdleBack.", "IdleFront.", "IdleLeft.", "IdleRight.",
        "MoveBack.", "MoveFront.", "MoveLeft.", "MoveRight."
    ],

    dtTime : null,
    unitNodeIndex : null,
    unitNodeTime : null,
    lastTime : 0,
    textBox : null,
    showingTextBox : null,
    cameraNode : null,

    ctor: function () {
        this._super();
    },

    dataInput: function (sceneInfo, textBox) {
        this.init(sceneInfo);
        var lastUpdate = Date.now();
        //var myInterval = setInterval(tick, 0);
        this.textBox = textBox;

        function tick() {
            //var now = Date.now();
            //var dt = now - lastUpdate;
            //lastUpdate = now;

            //var speed = GameCamera.CameraSpeed * dt;
            EventAnimation.GameUpdate();
        }

        setInterval(tick, 10);
    },

    init: function (sceneInfo) {
        this.SceneInfo = sceneInfo;

        this.UnitData = new Array();
        this.AnimationData = new Array();
        this.ActionData = new Array();
        this.unitNodeIndex = new Array();
        this.unitNodeTime = new Array();
        this.dtTime = new Array();
        this.cameraNode = new Array();
        this.showingTextBox = false;

        for(var i = 0; i < sceneInfo.eventCameraNode.length; i++)
        {
            this.cameraNode.push(sceneInfo.eventCameraNode[i]);
        }

        for(var i = 0; i < sceneInfo.eventObjects.length; i++) {
            //this.UnitData[i] = new Array();
            this.UnitData.push(sceneInfo.eventObjects[i]);
        }

        for(var i = 0; i < this.UnitData.length; i++)
        {
            this.unitNodeIndex.push(1);
            this.dtTime.push(new Date().getTime());
        }

        for(var i = 0; i < this.UnitData.length; i++)
        {
            this.unitNodeTime.push(this.UnitData[i].Node[0].time);
        }

        for(var i=0; i<this.UnitData.length; i++){
            var SpriteSheet;
            var totalFrame;

            this.AnimationData[i] = new Array();
            this.ActionData[i] = new Array();

            for(var j=1; j<=8; j++) {
                switch ((j - 1) >> 2) {
                    case 0 :
                        if(this.UnitData[i].sprite.isSpriteUpload.idle[(j - 1) >> 2] == false){
                            // 이미지 업로드가 되지 않았을 때
                            // 현재는 처리하지 않은 상태
                        }
                        else{
                            SpriteSheet = cc.TextureCache.getInstance().addImage("../repo/demoProject/" + sceneInfo.name +  "/objects/" +
                                this.UnitData[i].name + "/" + this.stateSuffix[j - 1] + this.UnitData[i].sprite.ext.idle[(j - 1) % 4]);
                            totalFrame = this.UnitData[i].sprite.frameCount.idle[(j - 1) >> 2];
                        }
                        break;

                    case 1 :
                        if(this.UnitData[i].sprite.isSpriteUpload.move[(j - 1) >> 2] == false){
                            // 이미지 업로드가 되지 않았을 때
                            // 현재는 처리하지 않은 상태
                        }
                        else{
                            SpriteSheet = cc.TextureCache.getInstance().addImage("../repo/demoProject/" + sceneInfo.name +  "/objects/" +
                                this.UnitData[i].name + "/" + this.stateSuffix[j - 1] + this.UnitData[i].sprite.ext.move[(j - 1) % 4]);
                            totalFrame = this.UnitData[i].sprite.frameCount.move[(j - 1) >> 2];
                        }
                        break;
                }

                var frame = [];
                this.AnimationData[i][j - 1] = new Array();
                this.ActionData[i][j - 1] = new Array();

                for (var k = 0; k < totalFrame; k++) {
                    switch ((j - 1) >> 2) {
                        case 0 :
                            frame[k] = cc.SpriteFrame.createWithTexture(SpriteSheet,
                                cc.rect((sceneInfo.eventObjects[i].sprite.frameWidth.idle[(j - 1) % 4] / totalFrame) * k,
                                    0, sceneInfo.eventObjects[i].sprite.frameWidth.idle[(j - 1) % 4] / totalFrame,
                                    sceneInfo.eventObjects[i].sprite.frameHeight.idle[(j - 1) % 4]));
                            break;

                        case 1 :
                            frame[k] = cc.SpriteFrame.createWithTexture(SpriteSheet,
                                cc.rect((sceneInfo.eventObjects[i].sprite.frameWidth.move[(j - 1) % 4] / totalFrame) * k,
                                    0, sceneInfo.eventObjects[i].sprite.frameWidth.move[(j - 1) % 4] / totalFrame,
                                    sceneInfo.eventObjects[i].sprite.frameHeight.move[(j - 1) % 4]));
                            break;
                    }

                    this.AnimationData[i][j - 1][k] = frame[k];
                }

                var animation = cc.Animation.create(this.AnimationData[i][j-1], this.animSpeed);
                var animate = cc.Animate.create(animation);

                this.ActionData[i][j-1] = cc.RepeatForever.create(animate);
            }

            this.UnitData[i].state = 0;
            this.AnimationData[i].sprite = cc.Sprite.createWithSpriteFrame(this.AnimationData[i][this.UnitData[i].Node[0].direction][0]);
            this.AnimationData[i].sprite.setPosition(cc.p(this.UnitData[i].Node[0].x, this.UnitData[i].Node[0].y));
            this.AnimationData[i].sprite.setAnchorPoint(cc.p(0.5, 0));
            this.AnimationData[i].sprite.setVisible(true);

            if(this.UnitData[i].Node[0].time > 0){
                this.AnimationData[i].sprite.setVisible(false);
            }

            this.addChild(this.AnimationData[i].sprite, i, i);
            this.AnimationData[i].sprite.runAction(this.ActionData[i][this.UnitData[i].Node[0].direction]);
        }

        this.flag = true;
        this.scheduleUpdate();

        return true;
    },

    GameUpdate : function(){

        if(!this.showingTextBox)
            var nowTime = new Date().getTime();

        for(var i = 0; i < this.UnitData.length; i++)
        {
            if(this.unitNodeIndex[i] < this.UnitData[i].Node.length)
            {
                if ((nowTime - this.dtTime[i]) / 1000 > this.unitNodeTime[i]) {
                    // 현재 노드 정보에 Speak 내용이 없을때
                    if(!this.showingTextBox) {
                        if (this.UnitData[i].Node[this.unitNodeIndex[i]].speak == "") {
                            this.AnimationData[i].sprite.setVisible(true);

                            var action = cc.MoveBy.create(this.UnitData[i].Node[this.unitNodeIndex[i]].time - this.UnitData[i].Node[this.unitNodeIndex[i] - 1].time,
                                new cc.Point(this.UnitData[i].Node[this.unitNodeIndex[i]].x - this.AnimationData[i].sprite.getPosition().x, this.UnitData[i].Node[this.unitNodeIndex[i]].y - this.AnimationData[i].sprite.getPosition().y));

                            this.AnimationData[i].sprite.stopAllActions();
                            this.AnimationData[i].sprite.runAction(action);
                            this.AnimationData[i].sprite.runAction(this.ActionData[i][this.UnitData[i].Node[this.unitNodeIndex[i]].direction]);

                            this.unitNodeTime[i] = this.UnitData[i].Node[this.unitNodeIndex[i]].time - this.UnitData[i].Node[this.unitNodeIndex[i] - 1].time;
                            this.unitNodeIndex[i]++;

                            this.dtTime[i] = new Date().getTime();
                        }
                        // 현재 노드 정보에 Speak 내용이 있을때
                        else {
                            this.AnimationData[i].sprite.setVisible(true);

                            this.showingTextBox = true;
                            this.textBox.Text = this.UnitData[i].Node[this.unitNodeIndex[i]].speak;
                            this.textBox.NameLabel.setString(this.UnitData[i].name);
                            this.textBox.ShowText(i);

                            this.unitNodeIndex[i]++;
                        }
                    }
                }
            }
        }
    }
});