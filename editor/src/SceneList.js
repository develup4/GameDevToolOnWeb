var Scene = cc.Sprite.extend({
    ProjectID:null,
    SceneName:null,
    SceneNumber:null,
    Rivision:null,
    PositionX:null,
    PositionY:null,
    Type:null,

    NextSceneNumber:null,

    PrevScene:null,
    NextScene:null,
    StartArrow:null,
    StartPoint:null,
    EndArrow:null,
    EndPoint:null,

    isStart:            Boolean,
    tabNumber:          Number,
    ext:                String,

    eventObjects:       [Object],
    eventCameraNode:    [Object],
    battleObjects:      [Object],
    battleMapMovable:   [Number],
    worldMapObjects:    [Object],
    isMapImageUpload:   Boolean,
    isBGMUpload:        Boolean,
    bgmExt:             String,
    mapSize:
    {
        width:          Number,
        height:         Number
    },

    ctor:function(type)
    {
        this._super();
        this.Type = type;
        this.NextSceneNumber = new Array();
        this.NextScene = new Array();
        this.PrevScene = new Array();
        this.StartArrow = new Array();
        this.StartPoint = new Array();
        this.EndArrow = new Array();
        this.EndPoint = new Array();

        if(this.Type == 0)
        {
            this.initWithFile("res/battle_nofocusing.png");
        }
        else if(this.Type == 1)
        {
            this.initWithFile("res/event_nofocusing.png");
        }
        else if(this.Type == 2)
        {
            this.initWithFile("res/worldmap_nofocusing.png");
        }
        else if(this.Type == 3)
        {
            this.initWithFile("res/start.png");
        }
        else if(this.Type == 4)
        {
            this.initWithFile("res/connect_nofocusing.jpg");
        }

        if(this.Type != 4)
        {
            this.SceneName = cc.LabelTTF.create("", "Arial", 12);
            this.SceneName.setColor(cc.c4f(0.1, 0.1, 0.1, 1));
            this.SceneName.setPosition(cc.p(this.getContentSize().width / 2, this.getContentSize().height / 2 + 11));
            this.addChild(this.SceneName);
        }

    },
    setSecneNumber:function(number)
    {
        this.SceneNumber = number;
    },

    setString:function(string)
    {
        this.SceneName.setString(string);
    }
});