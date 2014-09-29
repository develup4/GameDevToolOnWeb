var GameCamera = cc.Layer.extend({
    screenSize: null,
    width: 1920,
    height: 1080,
    mapWidth: 0,
    mapHeight: 0,
    currentX: 0,
    currentY: 0,
    tileSize: 64,
    CameraSpeed: 750,

    pos: null,
    curMousePos: null,
    isMoved: false,

    flag: false,
    isScrollUp: false,
    isScrollDown: false,
    isScrollLeft: false,
    isScrollRight: false,

    ctor: function () {
        this._super();
    },

    dataInput: function () {
        this.init();
        var lastUpdate = Date.now();
        var myInterval = setInterval(tick, 0);

        function tick() {
            var now = Date.now();
            var dt = now - lastUpdate;
            lastUpdate = now;

            var speed = this.GameCamera.CameraSpeed * dt;
            GameCamera.GameUpdate(speed / 1000);
        }

        setInterval(tick, 0);
    },

    init: function () {
        this.screenSize = cc.Director.getInstance().getWinSize();

        if ('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
        }

        if ('keyboard' in sys.capabilities) {
            this.setKeyboardEnabled(true);
        }

        this.flag = true;
    },

    GameUpdate: function (dt) {
        if (this.isScrollLeft == true && this.currentX > 0) {
            this.currentX -= dt;
            if (this.currentX < 0) {
                this.currentX = 0;
            }
            this.isMoved = true;
        }

        if (this.isScrollRight == true &&
            this.currentX < this.mapWidth - this.width) {
            this.currentX += dt;
            if (this.currentX > this.mapWidth - this.width) {
                this.currentX = this.mapWidth - this.width;
            }
            this.isMoved = true;
        }

        if (this.isScrollUp == true &&
            this.currentY < this.mapHeight - this.height) {
            this.currentY += dt;
            if (this.currentY > this.mapHeight - this.height) {
                this.currentY = this.mapHeight - this.height;
            }
            this.isMoved = true;
        }

        if (this.isScrollDown == true && this.currentY > 0) {
            this.currentY -= dt;
            if (this.currentY < 0) {
                this.currentY = 0;
            }
            this.isMoved = true;
        }
    },

    onMouseMoved: function (event) {
        if(this.flag == true) {
            this.pos = event.getLocation();
            this.curMousePos = this.pos;

            if (this.pos.x < 100) {
                if (this.pos.y < this.height / 3) {
                    this.isScrollLeft = true;
                    this.isScrollRight = false;
                    this.isScrollUp = false;
                    this.isScrollDown = true;
                }
                else if (this.pos.y < this.height * 2 / 3) {
                    this.isScrollLeft = true;
                    this.isScrollRight = false;
                    this.isScrollUp = false;
                    this.isScrollDown = false;
                }
                else if (this.pos.y < this.height) {
                    this.isScrollLeft = true;
                    this.isScrollRight = false;
                    this.isScrollUp = true;
                    this.isScrollDown = false;
                }
            }
            else if (this.pos.x > this.width - 100) {
                if (this.pos.y < this.height / 3) {
                    this.isScrollLeft = false;
                    this.isScrollRight = true;
                    this.isScrollUp = false;
                    this.isScrollDown = true;
                }
                else if (this.pos.y < this.height * 2 / 3) {
                    this.isScrollLeft = false;
                    this.isScrollRight = true;
                    this.isScrollUp = false;
                    this.isScrollDown = false;
                }
                else if (this.pos.y < this.height) {
                    this.isScrollLeft = false;
                    this.isScrollRight = true;
                    this.isScrollUp = true;
                    this.isScrollDown = false;
                }
            }
            else {
                if (this.pos.y < 100) {
                    this.isScrollLeft = false;
                    this.isScrollRight = false;
                    this.isScrollUp = false;
                    this.isScrollDown = true;
                }
                else if (this.pos.y > this.height - 100) {
                    this.isScrollLeft = false;
                    this.isScrollRight = false;
                    this.isScrollUp = true;
                    this.isScrollDown = false;
                }
                else {
                    this.isScrollLeft = false;
                    this.isScrollRight = false;
                    this.isScrollUp = false;
                    this.isScrollDown = false;
                }
            }
        }
    },
    onKeyDown: function (event) {
        if(this.flag == true) {
            switch (event) {
                case cc.KEY.left:
                    this.isScrollLeft = true;
                    break;

                case cc.KEY.right:
                    this.isScrollRight = true;
                    break;

                case cc.KEY.up:
                    this.isScrollUp = true;
                    break;

                case cc.KEY.down:
                    this.isScrollDown = true;
                    break;
            }
        }
    },
    onKeyUp: function (event) {
        if(this.flag == true) {
            switch (event) {
                case cc.KEY.left:
                    this.isScrollLeft = false;
                    break;

                case cc.KEY.right:
                    this.isScrollRight = false;
                    break;

                case cc.KEY.up:
                    this.isScrollUp = false;
                    break;

                case cc.KEY.down:
                    this.isScrollDown = false;
                    break;
            }
        }
    }
})