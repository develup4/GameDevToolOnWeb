/**
 * Created by GNSSM_JBW on 2014-05-14.
 */

var StatusLayer = cc.Layer.extend({
    SceneInfo: null,
    UnitInfoPopup: null,
    nameText: null,
    hpText: null,
    mpText: null,
    strText: null,
    dexText: null,
    defText: null,

    mouseOveredUnit: null,
    PopupSize: {
        width : 175,
        height : 200
    },

    diff : {
        width : 0,
        height : 0
    },

    ctor: function () {
        this._super();
        this.init();
    },

    dataInput: function (sceneInfo) {
        this.init(sceneInfo);
    },

    init: function (sceneInfo) {
        if ('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
        }

        if ('keyboard' in sys.capabilities) {
            this.setKeyboardEnabled(true);
        }

        this.SceneInfo = sceneInfo;

        this.UnitInfoPopup = cc.LayerColor.create(cc.c4b(255, 255, 255, 255), this.PopupSize.width, this.PopupSize.height);
        this.UnitInfoPopup.setVisible(false);

        this.nameText = cc.LabelTTF.create("이름 : ", "Arial", 20);
        this.nameText.setAnchorPoint(cc.p(0, 0.5));
        this.nameText.setColor(cc.c4b(0, 0, 0, 0));
        this.nameText.setVisible(false);

        this.hpText = cc.LabelTTF.create("HP : " + 0, "Arial", 20);
        this.hpText.setAnchorPoint(cc.p(0, 0.5));
        this.hpText.setColor(cc.c4b(0, 0, 0, 0));
        this.hpText.setVisible(false);

        this.mpText = cc.LabelTTF.create("MP : " + 0, "Arial", 20);
        this.mpText.setAnchorPoint(cc.p(0, 0.5));
        this.mpText.setColor(cc.c4b(0, 0, 0, 0));
        this.mpText.setVisible(false);

        this.strText = cc.LabelTTF.create("힘 : " + 0, "Arial", 20);
        this.strText.setAnchorPoint(cc.p(0, 0.5));
        this.strText.setColor(cc.c4b(0, 0, 0, 0));
        this.strText.setVisible(false);

        this.dexText = cc.LabelTTF.create("민첩 : " + 0, "Arial", 20);
        this.dexText.setAnchorPoint(cc.p(0, 0.5));
        this.dexText.setColor(cc.c4b(0, 0, 0, 0));
        this.dexText.setVisible(false);

        this.defText = cc.LabelTTF.create("방어 : " + 0, "Arial", 20);
        this.defText.setAnchorPoint(cc.p(0, 0.5));
        this.defText.setColor(cc.c4b(0, 0, 0, 0));
        this.dexText.setVisible(false);

        this.addChild(this.UnitInfoPopup);
        this.UnitInfoPopup.addChild(this.nameText);
        this.UnitInfoPopup.addChild(this.hpText);
        this.UnitInfoPopup.addChild(this.mpText);
        this.UnitInfoPopup.addChild(this.strText);
        this.UnitInfoPopup.addChild(this.dexText);
        this.UnitInfoPopup.addChild(this.defText);

        this.flag = true;
    },

    SceneChange : function(){
        this.SceneInfo = null;
        this.UnitInfoPopup = null;
        this.nameText = null;
        this.hpText = null;
        this.mpText = null;
        this.mpText = null;
        this.strText = null;
        this.dexText = null;
        this.defText = null;
        this.mouseOveredUnit = null;
        this.PopupSize = {
            width : 175,
            height : 200
        };
        this.diff = {
            width : 0,
            height : 0
        };
    },

    onMouseMoved: function(event){
        if(this.flag == true) {
            for (var i = 0; i < AnimationLayer.UnitData.length; i++) {
                if (AnimationLayer.UnitData[i].position.x == BackgroundLayer.currentCell.x &&
                    AnimationLayer.UnitData[i].position.y == BackgroundLayer.currentCell.y) {

                    this.mouseOveredUnit = AnimationLayer.UnitData[i];
                    if (this.UnitInfoPopup.isVisible() == false) {
                        this.UnitInfoPopup.setVisible(true);
                        this.nameText.setVisible(true);
                        this.hpText.setVisible(true);
                        this.mpText.setVisible(true);
                        this.strText.setVisible(true);
                        this.dexText.setVisible(true);
                        this.defText.setVisible(true);
                    }
                    break;
                }
                else {
                    this.UnitInfoPopup.setVisible(false);
                    this.nameText.setVisible(false);
                    this.hpText.setVisible(false);
                    this.mpText.setVisible(false);
                    this.strText.setVisible(false);
                    this.dexText.setVisible(false);
                    this.defText.setVisible(false);
                }
            }

            if (this.UnitInfoPopup.isVisible() == true) {
                var tempX, tempY;

                tempX = event.getLocation().x + this.PopupSize.width < GameCamera.width ?
                    event.getLocation().x : event.getLocation().x - this.PopupSize.width;
                tempY = event.getLocation().y - this.PopupSize.height < 0 ?
                    event.getLocation().y : event.getLocation().y - this.PopupSize.height;

                this.UnitInfoPopup.setPosition(cc.p(tempX, tempY));
                this.nameText.setPosition(cc.p(15, 175));
                this.hpText.setPosition(cc.p(15, 145));
                this.mpText.setPosition(cc.p(15, 115));
                this.strText.setPosition(cc.p(15, 85));
                this.dexText.setPosition(cc.p(15, 55));
                this.defText.setPosition(cc.p(15, 25));

                if (this.nameText.getTexture().getContentSize().width > this.PopupSize.width - 15) {
                    this.UnitInfoPopup.changeWidth(this.nameText.getTexture().getContentSize().width + 30);
                }
                else {
                    this.UnitInfoPopup.changeWidth(this.PopupSize.width);
                }

                this.nameText.setString("이름 : " + this.mouseOveredUnit.name);
                this.hpText.setString("HP : " + this.mouseOveredUnit.status.hp);
                this.mpText.setString("MP : " + this.mouseOveredUnit.status.mp);
                this.strText.setString("힘 : " + this.mouseOveredUnit.status.str);
                this.dexText.setString("민첩 : " + this.mouseOveredUnit.status.dex);
                this.defText.setString("방어 : " + this.mouseOveredUnit.status.def);
            }
        }
    }
});
