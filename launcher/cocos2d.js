(function () {
    var d = document;
    var c = {
        COCOS2D_DEBUG: 2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
        box2d: false,
        chipmunk: false,
        showFPS: true,
        frameRate: 60,
        loadExtension: false,
        renderMode: 1,
        tag: 'gameCanvas',
        engineDir: '../lib/cocos2d-x/cocos2d/',
        appFiles: [
            'src/BattleScene/AnimationLayer.js',
            'src/BattleScene/BackgroundLayer.js',
            'src/BattleScene/PathFind.js',
            'src/BattleScene/StatusLayer.js',

            'src/EventScene/BackgroundLayer.js',
            'src/EventScene/TextBox.js',
            'src/EventScene/AnimationLayer.js',

            'src/WorldMap/BackgroundLayer.js',
            'src/WorldMap/ButtonLayer.js',

            'src/Camera.js',
            'src/GameLauncher.js',
            'src/Resources.js',
            'src/SoundManager.js'
        ]
    };

    var fn;
    window.addEventListener("DOMContentLoaded", fn = function () {
        this.removeEventListener('DOMContentLoaded', fn, false);
        var s = d.createElement('script');

        if (c.SingleEngineFile && !c.engineDir) {
            s.src = c.SingleEngineFile;
        }
        else if (c.engineDir && !c.SingleEngineFile) {
            s.src = c.engineDir + 'jsloader.js';
        }
        else {
            alert('You must specify either the single engine file OR the engine directory in "cocos2d.js"');
        }
        d.body.appendChild(s);
        document.ccConfig = c;
        s.id = 'cocos2d-html5';

        resizeGame();
    });

    window.addEventListener("resize", resizeGame, false);
    window.addEventListener("orientationchange", resizeGame, false);
})();

function resizeGame() {
    var gameArea = document.getElementById('gameArea');
    var gameCanvas = document.getElementById('gameCanvas');
    var size = {
        width: window.innerWidth || document.body.clientWidth,
        height: window.innerHeight || document.body.clientHeight
    };

    gameArea.style.width = size.width + 'px';
    gameArea.style.height = size.height + 'px';
}