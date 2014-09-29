var SceneManager = cc.Scene.extend({

    onDataInput : function(data)
    {
        buttonLayer.dataInput(data);
    },
    onEnter:function () {
        this._super();

        buttonLayer = new ButtonLayer();

        this.addChild(buttonLayer, 0);

        WebSocketConnector.socket.emit('requestSceneInfos', 0, 1);
        WebSocketConnector.socket.on('responseSceneInfos', this.onDataInput);
    }
});

