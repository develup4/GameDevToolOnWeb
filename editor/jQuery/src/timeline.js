var Timeline = function() {
    this.name = "Global";
    this.anims = [];
    this.time = 0;
    this.totalTime = 0;
    this.loopCount = 0;
    this.loopMode = 1;
    this.playing = true;
    var self = this;
    setInterval(function() {
        self.update();
    }, 1000/30);
}

Timeline.currentInstance = null;

Timeline.getGlobalInstance = function() {
    if (!Timeline.globalInstance) {
        Timeline.globalInstance = new Timeline();
    }
    return Timeline.globalInstance;
}

//Possible values of n:
//-1 infinite loop
//0 play forever without looping, continue increasing time even after last animation
//1 play once and stop at the time the last animation finishes
//>1 loop n-times
Timeline.prototype.loop = function(n) {
    this.loopMode = n;
}

Timeline.prototype.stop = function() {
    this.playing = false;
    this.time = 0;
    this.prevTime = this.time - 1/30; //FIXME 1/30
}

Timeline.prototype.pause = function() {
    this.playing = false;
}

Timeline.prototype.play = function() {
    this.playing = true;
}

Timeline.prototype.preUpdate = function() {
    //placeholder for hooks like GUI rendering
}

Timeline.prototype.update = function() {
    this.preUpdate();

    if (this.playing) {
        this.totalTime += 1/30;
        this.prevTime = this.time;
        this.time += 1/30;
    }

    if (this.loopMode != 0) {
        var animationEnd = this.findAnimationEnd();
        if (this.time > animationEnd) {
            this.loopCount++;
            this.time = 0;
        }
        if (this.loopMode == -1) {
            //loop infinitely
        }
        else {
            if (this.loopCount >= this.loopMode) {
                this.playing = false;
            }
        }
    }

    this.applyValues();
}

Timeline.prototype.findAnimationEnd = function() {
    var endTime = 0;
    for(var i=0; i<this.anims.length; i++) {
        if (this.anims[i].endTime > endTime) {
            endTime = this.anims[i].endTime;
        }
    }
    return endTime;
}

Timeline.prototype.applyValues = function() {
    for(var i=0; i<this.anims.length; i++) {
        var propertyAnim = this.anims[i];
        if (this.time < propertyAnim.startTime) {
            continue;
        }
//if start time happened during last frame
        if (this.prevTime <= propertyAnim.startTime && propertyAnim.startTime <= this.time) {
            propertyAnim.startValue = propertyAnim.target[propertyAnim.propertyName];
        }
        if (this.prevTime <= propertyAnim.endTime && propertyAnim.endTime <= this.time) {
            propertyAnim.target[propertyAnim.propertyName] = propertyAnim.endValue;
            continue;
        }
        if (propertyAnim.endTime - propertyAnim.startTime == 0) {
            continue;
        }
        var t = (this.time - propertyAnim.startTime)/(propertyAnim.endTime - propertyAnim.startTime);
        t = propertyAnim.easing(t);
        t = Math.max(0, Math.min(t, 1));
        propertyAnim.target[propertyAnim.propertyName] = propertyAnim.startValue + (propertyAnim.endValue - propertyAnim.startValue) * t;
    }
}

//--------------------------------------------------------------------

function Anim(name, target, timeline) {
    this.startTime = 0;
    this.endTime = 0;
    this.time = 0;
    this.propertyAnims = [];

    this.name = name;
    this.target = target;
    this.timeline = timeline;
}

//delay, properties, duration, easing
Anim.prototype.to = function() {
    var args = [];
    for(var i=0; i<arguments.length; i++) {
        args.push(arguments[i]);
    }
    var delay;
    var properties;
    var duration;
    var easing;

    if (typeof(args[0]) == "number") {
        delay = args.shift();
    }
    else {
        delay = 0;
    }

    if (typeof(args[0]) == "object") {
        properties = args.shift();
    }
    else {
        properties = {};
    }

    if (typeof(args[0]) == "number") {
        duration = args.shift();
    }
    else {
        duration = 1;
    }

    if (typeof(args[0]) == "function") {
        easing = args.shift();
    }
    else {
        easing = Timeline.Easing.Linear.EaseNone;
    }

    for(var propertyName in properties) {
        this.timeline.anims.push({
            timeline: this.timeline,
            targetName: this.name,
            target: this.target,
            propertyName: propertyName,
            endValue: properties[propertyName],
            delay: delay,
            startTime: this.timeline.time + delay + this.endTime,
            endTime: this.timeline.time + delay + this.endTime + duration,
            easing: easing
        });
    }
    this.endTime += delay + duration;
    return this;
}

function anim(targetName, targetObject, parentTimeline) {
    var args = [];
    for(var i=0; i<arguments.length; i++) {
        args.push(arguments[i]);
    }
    var name;
    var target;
    var timeline;

    if (typeof(args[0]) == "string") {
        name = args.shift();
    }

    if (typeof(args[0]) == "object") {
        target = args.shift();
    }
    else {
        target = {};
    }

    if (typeof(args[0]) == "object") {
        timeline = args.shift();
    }
    else {
        timeline = Timeline.getGlobalInstance();
    }

    var anim = new Anim(name, target, timeline);

    return anim;
}

//--------------------------------------------------------------------

Timeline.Easing = { Linear: {}, Quadratic: {}, Cubic: {}, Quartic: {}, Quintic: {}, Sinusoidal: {}, Exponential: {}, Circular: {}, Elastic: {}, Back: {}, Bounce: {} };

Timeline.Easing.Linear.EaseNone = function ( k ) {
    return k;
};

Timeline.Easing.Quadratic.EaseIn = function ( k ) {
    return k * k;
};

Timeline.Easing.Quadratic.EaseOut = function ( k ) {
    return - k * ( k - 2 );
};

Timeline.Easing.Quadratic.EaseInOut = function ( k ) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
    return - 0.5 * ( --k * ( k - 2 ) - 1 );
};

Timeline.Easing.Cubic.EaseIn = function ( k ) {
    return k * k * k;
};

Timeline.Easing.Cubic.EaseOut = function ( k ) {
    return --k * k * k + 1;
};

Timeline.Easing.Cubic.EaseInOut = function ( k ) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k + 2 );
};

Timeline.Easing.Elastic.EaseIn = function( k ) {
    var s, a = 0.1, p = 0.4;
    if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
    return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
};

Timeline.Easing.Elastic.EaseOut = function( k ) {
    var s, a = 0.1, p = 0.4;
    if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
    return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
};

Timeline.Easing.Elastic.EaseInOut = function( k ) {
    var s, a = 0.1, p = 0.4;
    if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
    if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
};

Timeline.Easing.Back.EaseIn = function( k ) {
    var s = 1.70158;
    return k * k * ( ( s + 1 ) * k - s );
};

Timeline.Easing.Back.EaseOut = function( k ) {
    var s = 1.70158;
    return ( k = k - 1 ) * k * ( ( s + 1 ) * k + s ) + 1;
};

Timeline.Easing.Back.EaseInOut = function( k ) {
    var s = 1.70158 * 1.525;
    if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
    return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
};

Timeline.Easing.Bounce.EaseIn = function( k ) {
    return 1 - Timeline.Easing.Bounce.EaseOut( 1 - k );
};

Timeline.Easing.Bounce.EaseOut = function( k ) {
    if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
        return 7.5625 * k * k;
    } else if ( k < ( 2 / 2.75 ) ) {
        return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
    } else if ( k < ( 2.5 / 2.75 ) ) {
        return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
    } else {
        return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
    }
};

Timeline.Easing.Bounce.EaseInOut = function( k ) {
    if ( k < 0.5 ) return Timeline.Easing.Bounce.EaseIn( k * 2 ) * 0.5;
    return Timeline.Easing.Bounce.EaseOut( k * 2 - 1 ) * 0.5 + 0.5;
};

Timeline.easingFunctionToString = function( f ) {
    for(var name in Timeline.easingMap) {
        if (Timeline.easingMap[name] == f) {
            return name;
        }
    }
}

Timeline.stringToEasingFunction = function( name ) {
    return Timeline.easingMap[name];
}

Timeline.easingMap = {
}

for(var easingFunctionFamilyName in Timeline.Easing) {
    var easingFunctionFamily = Timeline.Easing[easingFunctionFamilyName];
    for(var easingFunctionName in easingFunctionFamily) {
        Timeline.easingMap[easingFunctionFamilyName + "." + easingFunctionName] = easingFunctionFamily[easingFunctionName];
    }
}

Timeline.prototype.initGUI = function() {
    var self = this;

    this.trackLabelWidth = 108;
    this.trackLabelHeight = 20;
    this.tracksScrollWidth = 16;
    this.tracksScrollHeight = 0;
    this.tracksScrollThumbPos = 0;
    this.tracksScrollThumbHeight = 0;
    this.tracksScrollY = 0;
    this.timeScrollWidth = 0;
    this.timeScrollHeight = 16;
    this.timeScrollThumbPos = 0;
    this.timeScrollThumbWidth = 0;
    this.timeScrollX = 0;
    this.headerHeight = 30;
    this.canvasHeight = 200;
    this.draggingTime = false;
    this.draggingTracksScrollThumb = false;
    this.draggingTimeScrollThumb = false;
    this.draggingKeys = false;
    this.draggingTimeScale = false;
    this.selectedKeys = [];
    this.timeScale = 1;

    this.trackNameCounter = 0;
    this.initTracks();
    this.load();

    this.container = document.createElement("div");
    this.container.style.width = "100%";
    this.container.style.height = this.canvasHeight + "px";
    this.container.style.background = "#EEEEEE";
    this.container.style.position = "fixed";
    this.container.style.left = "0px";
    this.container.style.bottom = "0px";
    document.body.appendChild(this.container);

    this.splitter = document.createElement("div");
    this.splitter.style.width = "100%";
    this.splitter.style.height = "4px";
    this.splitter.style.cursor = "ns-resize";
    this.splitter.style.position = "fixed";
    this.splitter.style.left = "0px";
    this.splitter.style.bottom = (this.canvasHeight - 2) + "px";
    this.splitter.addEventListener("mousedown", function() {
        function mouseMove(e) {
            var h = (window.innerHeight - e.clientY);
            self.splitter.style.bottom = (h - 2) + "px";
            self.container.style.height = h + "px";
            self.canvasHeight = h;
            self.tracksScrollY = 0;
            self.tracksScrollThumbPos = 0;
            self.save();
        }
        function mouseUp(e) {
            document.body.removeEventListener("mousemove", mouseMove, false);
            document.body.removeEventListener("mouseup", mouseUp, false);
        }
        document.body.addEventListener("mousemove", mouseMove, false);
        document.body.addEventListener("mouseup", mouseUp, false);
    }, false)
    document.body.appendChild(this.splitter);

    this.canvas = document.createElement("canvas");
    this.c = this.canvas.getContext("2d");
    this.canvas.width = 0;
    this.container.appendChild(this.canvas);


    this.buildInputDialog();

    var self = this;
    this.canvas.addEventListener('click', function(event) {
        self.onMouseClick(event);
    }, false);
    this.canvas.addEventListener('mousedown', function(event) {
        self.onMouseDown(event);
    }, false);
    document.body.addEventListener('mousemove', function(event) {
        self.onDocumentMouseMove(event);
    }, false);
    this.canvas.addEventListener('mousemove', function(event) {
        self.onCanvasMouseMove(event);
    }, false);
    document.body.addEventListener('mouseup', function(event) {
        self.onMouseUp(event);
    }, false);
    this.canvas.addEventListener('dblclick', function(event) {
        self.onMouseDoubleClick(event);
    }, false);
}

Timeline.prototype.onMouseDown = function(event) {

    // 이벤트씬이 선택되지 않는한 작동하지 않음
    if (focusedTabSceneIndex == -1 || sceneList[focusedTabSceneIndex].Type != 1)
    {
        return;
    }

    this.selectedKeys = [];

    var x = event.layerX;
    var y = event.layerY;

    if (x > this.trackLabelWidth && y < this.headerHeight) {
        //timeline
        this.draggingTime = true;
        this.onCanvasMouseMove(event);
    }
    else if (x > this.canvas.width - this.tracksScrollWidth && y > this.headerHeight) {
        //tracks scroll
        if (y >= this.headerHeight + this.tracksScrollThumbPos && y <= this.headerHeight + this.tracksScrollThumbPos + this.tracksScrollThumbHeight) {
            this.tracksScrollThumbDragOffset = y - this.headerHeight - this.tracksScrollThumbPos;
            this.draggingTracksScrollThumb = true;
        }
    }
    else if (x > this.trackLabelWidth && y > this.headerHeight && y < this.canvasHeight - this.timeScrollHeight) {
        //keys
        this.selectKeys(event.layerX, event.layerY);
        if (this.selectedKeys.length > 0) {
            this.draggingKeys = true;
        }
        this.cancelKeyClick = false;
    }
    else if (x < this.trackLabelWidth && y > this.canvasHeight - this.timeScrollHeight) {
        //time scale
        this.timeScale = Math.max(0.01, Math.min((this.trackLabelWidth - x) / this.trackLabelWidth, 1));
        this.draggingTimeScale = true;
        this.save();
    }
    else if (x > this.trackLabelWidth && y > this.canvasHeight - this.timeScrollHeight) {
        //time scroll
        if (x >= this.trackLabelWidth + this.timeScrollThumbPos && x <= this.trackLabelWidth + this.timeScrollThumbPos + this.timeScrollThumbWidth) {
            this.timeScrollThumbDragOffset = x - this.trackLabelWidth - this.timeScrollThumbPos;
            this.draggingTimeScrollThumb = true;
        }
    }
}

Timeline.prototype.onDocumentMouseMove = function(event) {

    // 이벤트씬이 선택되지 않는한 작동하지 않음
    if (focusedTabSceneIndex == -1 || sceneList[focusedTabSceneIndex].Type != 1)
    {
        return;
    }

    var x = event.layerX;
    var y = event.layerY;

    if (this.draggingTime) {
        this.time = this.xToTime(x);
        var animationEnd = this.findAnimationEnd();
        if (this.time < 0) this.time = 0;
        if (this.time > animationEnd) this.time = animationEnd;
        this.prevTime = this.time - 1/30; //FIXME: hardcoded frame delta 1/30
    }
    if (this.draggingKeys) {
        for(var i=0; i<this.selectedKeys.length; i++) {
            var draggedKey = this.selectedKeys[i];
            draggedKey.time = Math.max(0, this.xToTime(x));
            this.sortTrackKeys(draggedKey.track);
            this.rebuildSelectedTracks();
        }
        this.cancelKeyClick = true;
        this.timeScrollThumbPos = this.timeScrollX * (this.timeScrollWidth - this.timeScrollThumbWidth);
    }
    if (this.draggingTimeScale) {
        this.timeScale = Math.max(0.01, Math.min((this.trackLabelWidth - x) / this.trackLabelWidth, 1));
        this.save();
    }
}

Timeline.prototype.onCanvasMouseMove = function(event) {

    // 이벤트씬이 선택되지 않는한 작동하지 않음
    if (focusedTabSceneIndex == -1 || sceneList[focusedTabSceneIndex].Type != 1)
    {
        return;
    }

    var x = event.layerX;
    var y = event.layerY;

    if (this.draggingTracksScrollThumb) {
        this.tracksScrollThumbPos = y - this.headerHeight - this.tracksScrollThumbDragOffset;
        if (this.tracksScrollThumbPos < 0) {
            this.tracksScrollThumbPos = 0;
        }
        if (this.tracksScrollThumbPos + this.tracksScrollThumbHeight > this.tracksScrollHeight) {
            this.tracksScrollThumbPos = Math.max(0, this.tracksScrollHeight - this.tracksScrollThumbHeight);
        }
        if (this.tracksScrollHeight - this.tracksScrollThumbHeight > 0) {
            this.tracksScrollY = this.tracksScrollThumbPos/(this.tracksScrollHeight - this.tracksScrollThumbHeight);
        }
        else {
            this.tracksScrollY = 0;
        }
    }
    if (this.draggingTimeScrollThumb) {
        this.timeScrollThumbPos = x - this.trackLabelWidth - this.timeScrollThumbDragOffset;
        if (this.timeScrollThumbPos < 0) {
            this.timeScrollThumbPos = 0;
        }
        if (this.timeScrollThumbPos + this.timeScrollThumbWidth > this.timeScrollWidth) {
            this.timeScrollThumbPos = Math.max(0, this.timeScrollWidth - this.timeScrollThumbWidth);
        }
        if (this.timeScrollWidth - this.timeScrollThumbWidth > 0) {
            this.timeScrollX = this.timeScrollThumbPos/(this.timeScrollWidth - this.timeScrollThumbWidth);
        }
        else {
            this.timeScrollX = 0;
        }
    }
}

Timeline.prototype.onMouseUp = function(event) {

    // 이벤트씬이 선택되지 않는한 작동하지 않음
    if (focusedTabSceneIndex == -1 || sceneList[focusedTabSceneIndex].Type != 1)
    {
        return;
    }

    if (this.draggingTime) {
        this.draggingTime = false;
    }
    if (this.draggingKeys) {
        this.draggingKeys = false;
    }
    if (this.draggingTracksScrollThumb) {
        this.draggingTracksScrollThumb = false;
    }
    if (this.draggingTimeScale) {
        this.draggingTimeScale = false;
    }
    if (this.draggingTimeScrollThumb) {
        this.draggingTimeScrollThumb = false;
    }
}

Timeline.prototype.onMouseClick = function(event) {

    // 이벤트씬이 선택되지 않는한 작동하지 않음
    if (focusedTabSceneIndex == -1 || sceneList[focusedTabSceneIndex].Type != 1)
    {
        return;
    }

    if (event.layerX < 1*this.headerHeight - 4 * 0 && event.layerY < this.headerHeight) {
        //this.play();
    }
    if (event.layerX > 1*this.headerHeight - 4 * 0 && event.layerX < 2*this.headerHeight - 4 * 1 && event.layerY < this.headerHeight) {
        //this.pause();
    }

    if (event.layerX > 2*this.headerHeight - 4 * 1 && event.layerX < 3*this.headerHeight - 4 * 2 && event.layerY < this.headerHeight) {
        //this.stop();
    }

    if (event.layerX > 3*this.headerHeight - 4 * 2 && event.layerX < 4*this.headerHeight - 4 * 3 && event.layerY < this.headerHeight) {
        //this.export();
    }

    if (this.selectedKeys.length > 0 && !this.cancelKeyClick) {
        this.showKeyEditDialog(event.pageX, event.pageY);
    }
}

Timeline.prototype.onMouseDoubleClick = function(event) {

    // 이벤트씬이 선택되지 않는한 작동하지 않음
    if (focusedTabSceneIndex == -1 || sceneList[focusedTabSceneIndex].Type != 1)
    {
        return;
    }

    var x = event.layerX;
    var y = event.layerY;

    if (x > this.trackLabelWidth && y < this.headerHeight) {
        //timeline
        var timeStr = prompt("Enter time") || "0:0:0";
        var timeArr = timeStr.split(":");
        var seconds = 0;
        var minutes = 0;
        var hours = 0;
        if (timeArr.length > 0) seconds = parseInt(timeArr[timeArr.length-1]);
        if (timeArr.length > 1) minutes = parseInt(timeArr[timeArr.length-2]);
        if (timeArr.length > 2) hours = parseInt(timeArr[timeArr.length-3]);
        this.time = this.totalTime = hours * 60 * 60 + minutes * 60 + seconds;
    }
    else if (x > this.trackLabelWidth && this.selectedKeys.length == 0 && y > this.headerHeight && y < this.canvasHeight - this.timeScrollHeight) {
        this.addKeyAt(x, y);
    }
}

Timeline.prototype.addKeyAt = function(mouseX, mouseY) {
    var selectedTrack = this.getTrackAt(mouseX, mouseY);

    if (!selectedTrack) {
        return;
    }

    var newKey = {
        time: this.xToTime(mouseX),
        value: selectedTrack.target[selectedTrack.propertyName],
        easing: Timeline.Easing.Linear.EaseNone,
        track: selectedTrack
    };
    if (selectedTrack.keys.length == 0) {
        selectedTrack.keys.push(newKey);
    }
    else if (newKey.time < selectedTrack.keys[0].time) {
        newKey.value = selectedTrack.keys[0].value;
        selectedTrack.keys.unshift(newKey);
    }
    else if (newKey.time > selectedTrack.keys[selectedTrack.keys.length-1].time) {
        newKey.value = selectedTrack.keys[selectedTrack.keys.length-1].value;
        selectedTrack.keys.push(newKey);
    }
    else for(var i=1; i<selectedTrack.keys.length; i++) {
            if (selectedTrack.keys[i].time > newKey.time) {
                var k = (selectedTrack.keys[i].time - newKey.time)/(selectedTrack.keys[i].time - selectedTrack.keys[i-1].time);
                var delta = selectedTrack.keys[i].value - selectedTrack.keys[i-1].value;
                newKey.easing = selectedTrack.keys[i-1].easing;
                newKey.value = selectedTrack.keys[i-1].value + delta * newKey.easing(k);
                selectedTrack.keys.splice(i, 0, newKey);
                break;
            }
        }
    this.selectedKeys = [newKey];
    this.rebuildSelectedTracks();

    // 로컬에 적용
    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[i].name == newKey.track.name)
        {
            currentEventCharIndex = i;
        }
    }
    sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node.push(
        {
            x: 0,
            y: 0,
            direction: 0,
            speak: "",
            visible: true,
            time: newKey.time
        }
    );
    // 정렬
    sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node.sort(
        function(left, right)
        {
            return left.time - right.time;
        }
    );
    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].time == newKey.time)
        {
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].x = sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i-1].x;
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].y = sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i-1].y;
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].direction = sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i-1].direction;
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].visible = sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i-1].visible;
        }
    }

    // 서버에 적용
    var info =
    {
        sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
        charID: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].id,
        node: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node
    };
    WebSocketConnector.socket.emit('eventKeyValueEdit', JSON.stringify(info));

    // 인스펙터에 써주기
    eventInspectorInput(sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].id);
}

Timeline.prototype.getTrackAt = function(mouseX, mouseY) {
    var scrollY = this.tracksScrollY * (this.tracks.length * this.trackLabelHeight - this.canvas.height + this.headerHeight);
    var clickedTrackNumber = Math.floor((mouseY - this.headerHeight + scrollY)/this.trackLabelHeight);

    if (clickedTrackNumber >= 0 && clickedTrackNumber >= this.tracks.length || this.tracks[clickedTrackNumber].type == "object") {
        return null;
    }

    return this.tracks[clickedTrackNumber];
}

Timeline.prototype.selectKeys = function(mouseX, mouseY) {
    this.selectedKeys = [];

    var selectedTrack = this.getTrackAt(mouseX, mouseY);

    if (!selectedTrack) {
        return;
    }

    for(var i=0; i<selectedTrack.keys.length; i++) {
        var key = selectedTrack.keys[i];
        var x = this.timeToX(key.time);

        if (x >= mouseX - this.trackLabelHeight*0.3 && x <= mouseX + this.trackLabelHeight*0.3) {
            this.selectedKeys.push(key);
            SelectKey(key);

            break;
        }
    }
}

Timeline.prototype.preUpdate = function() {
    this.updateGUI();
}

Timeline.prototype.updateGUI = function() {
    if (!this.canvas) {
        this.initGUI();
    }

    this.canvas.width = window.innerWidth;
    this.canvas.height = this.canvasHeight;
    var w = this.canvas.width;
    var h = this.canvas.height;

    this.tracksScrollHeight = this.canvas.height - this.headerHeight - this.timeScrollHeight;
    var totalTracksHeight = this.tracks.length * this.trackLabelHeight;
    var tracksScrollRatio = this.tracksScrollHeight/totalTracksHeight;
    this.tracksScrollThumbHeight = Math.min(Math.max(20, this.tracksScrollHeight * tracksScrollRatio), this.tracksScrollHeight);

    this.timeScrollWidth = this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth;
    var animationEnd = this.findAnimationEnd();
    var visibleTime = this.xToTime(this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth) - this.xToTime(0); //100 to get some space after lask key
    var timeScrollRatio = Math.max(0, Math.min(visibleTime/animationEnd, 1));
    this.timeScrollThumbWidth = timeScrollRatio * this.timeScrollWidth;
    if (this.timeScrollThumbPos + this.timeScrollThumbWidth > this.timeScrollWidth) {
        this.timeScrollThumbPos = Math.max(0, this.timeScrollWidth - this.timeScrollThumbWidth);
    }


    this.c.clearRect(0, 0, w, h);

    //buttons
    this.drawRect(0*this.headerHeight - 4 * -1, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD");
    this.drawRect(1*this.headerHeight - 4 * 0, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD");
    this.drawRect(2*this.headerHeight - 4 * 1, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD");
    this.drawRect(3*this.headerHeight - 4 * 2, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD");

    //play
    this.c.strokeStyle = "#777777";
    this.c.beginPath();
    this.c.moveTo(4 + 6.5, 5 + 5);
    this.c.lineTo(this.headerHeight - 8, this.headerHeight/2+1.5);
    this.c.lineTo(4 + 6.5, this.headerHeight - 8);
    this.c.lineTo(4 + 6.5, 5 + 5);
    this.c.stroke();

    //pause
    this.c.strokeRect(this.headerHeight + 5.5, 5 + 5.5, this.headerHeight/6, this.headerHeight - 8 - 11);
    this.c.strokeRect(this.headerHeight + 5.5 + this.headerHeight/6 + 2, 5 + 5.5, this.headerHeight/6, this.headerHeight - 8 - 11);

    //stop
    this.c.strokeRect(2*this.headerHeight - 4 + 5.5, 5 + 5.5, this.headerHeight - 8 - 11, this.headerHeight - 8 - 11);

    //export
    this.c.beginPath();
    this.c.moveTo(3*this.headerHeight - 4 * 2 + 5.5, this.headerHeight - 9.5);
    this.c.lineTo(3*this.headerHeight - 4 * 2 + 11.5, this.headerHeight - 9.5);
    this.c.moveTo(3*this.headerHeight - 4 * 2 + 5.5, this.headerHeight - 13.5);
    this.c.lineTo(3*this.headerHeight - 4 * 2 + 13.5, this.headerHeight - 13.5);
    this.c.moveTo(3*this.headerHeight - 4 * 2 + 5.5, this.headerHeight - 17.5);
    this.c.lineTo(3*this.headerHeight - 4 * 2 + 15.5, this.headerHeight - 17.5);
    this.c.stroke();

    //tracks area clipping path
    this.c.save();
    this.c.beginPath();
    this.c.moveTo(0, this.headerHeight+1);
    this.c.lineTo(this.canvas.width, this.headerHeight + 1);
    this.c.lineTo(this.canvas.width, this.canvas.height - this.timeScrollHeight);
    this.c.lineTo(0, this.canvas.height - this.timeScrollHeight);
    this.c.clip();

    for(var i=0; i<this.tracks.length; i++) {
        var yshift = this.headerHeight + this.trackLabelHeight * (i + 1);
        var scrollY = this.tracksScrollY * (this.tracks.length * this.trackLabelHeight - this.canvas.height + this.headerHeight);
        yshift -= scrollY;
        if (yshift < this.headerHeight) continue;
        this.drawTrack(this.tracks[i], yshift);
    }

    this.c.restore();

    //end of label panel
    this.drawLine(this.trackLabelWidth, 0, this.trackLabelWidth, h, "#000000");

    //timeline

    var timelineStart = 0;
    var timelineEnd = 10;
    var lastTimeLabelX = 0;

    this.c.fillStyle = "#666666";
    var x = this.timeToX(0);
    //for(var sec=timelineStart; sec<timelineEnd; sec++) {
    var sec = timelineStart;
    while(x < this.canvas.width) {
        x = this.timeToX(sec);
        this.drawLine(x, 0, x, this.headerHeight*0.3, "#999999");

        var minutes = Math.floor(sec / 60);
        var seconds = sec % 60;
        var time = minutes + ":" + ((seconds < 10) ? "0" : "") + seconds;

        if (x - lastTimeLabelX > 30) {
            this.c.fillText(time, x - 6, this.headerHeight*0.8);
            lastTimeLabelX = x;
        }
        sec += 1;
    }

    //time ticker
    this.drawLine(this.timeToX(this.time), 0, this.timeToX(this.time), h, "#FF0000");

    //time scale

    for(var i=2; i<20; i++) {
        var f = 1.0 - (i*i)/361;
        this.drawLine(7 + f*(this.trackLabelWidth-10), h - this.timeScrollHeight + 4, 7 + f*(this.trackLabelWidth - 10), h - 3, "#999999");
    }

    this.c.fillStyle = "#666666";
    this.c.beginPath();
    this.c.moveTo(7 + (1.0-this.timeScale)*(this.trackLabelWidth-10), h - 7);
    this.c.lineTo(11 + (1.0-this.timeScale)*(this.trackLabelWidth - 10), h - 1);
    this.c.lineTo(3 + (1.0-this.timeScale)*(this.trackLabelWidth - 10), h - 1);
    this.c.fill();

    //tracks scrollbar
    this.drawRect(this.canvas.width - this.tracksScrollWidth, this.headerHeight + 1, this.tracksScrollWidth, this.tracksScrollHeight, "#DDDDDD");
    if (this.tracksScrollThumbHeight < this.tracksScrollHeight) {
        this.drawRect(this.canvas.width - this.tracksScrollWidth, this.headerHeight + 1 + this.tracksScrollThumbPos, this.tracksScrollWidth, this.tracksScrollThumbHeight, "#999999");
    }

    //time scrollbar
    this.drawRect(this.trackLabelWidth, h - this.timeScrollHeight, w - this.trackLabelWidth - this.tracksScrollWidth, this.timeScrollHeight, "#DDDDDD");
    if (this.timeScrollThumbWidth < this.timeScrollWidth) {
        this.drawRect(this.trackLabelWidth + 1 + this.timeScrollThumbPos, h - this.timeScrollHeight, this.timeScrollThumbWidth, this.timeScrollHeight, "#999999");
    }

    //header borders
    this.drawLine(0, 0, w, 0, "#000000");
    this.drawLine(0, this.headerHeight, w, this.headerHeight, "#000000");
    this.drawLine(0, h - this.timeScrollHeight, this.trackLabelWidth, h - this.timeScrollHeight, "#000000");
    this.drawLine(this.trackLabelWidth, h - this.timeScrollHeight - 1, this.trackLabelWidth, h, "#000000");
}

Timeline.prototype.timeToX = function(time) {
    var animationEnd = this.findAnimationEnd();
    var visibleTime = this.xToTime(this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth) - this.xToTime(20); //50 to get some additional space
    if (visibleTime < animationEnd) {
        time -= (animationEnd - visibleTime) * this.timeScrollX;
    }

    return this.trackLabelWidth + time * (this.timeScale * 200) + 10;
}

Timeline.prototype.xToTime = function(x) {
    var animationEnd = this.findAnimationEnd();
    var visibleTime = (this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth - 20)/(this.timeScale * 200);
    var timeShift = Math.max(0, (animationEnd - visibleTime) * this.timeScrollX);
    return (x - this.trackLabelWidth - 10)/(this.timeScale * 200) + timeShift;
}

Timeline.prototype.drawTrack = function(track, y) {
    var xshift = 5;
    if (track.type == "object") {
        //object track header background
        this.drawRect(0, y - this.trackLabelHeight + 1, this.trackLabelWidth, this.trackLabelHeight-1, "#FFFFFF");
        //label color
        this.c.fillStyle = "#000000";
    }
    else {
        xshift += 10;
        //label color
        this.c.fillStyle = "#555555";
    }

    //bottom track line
    this.drawLine(0, y, this.canvas.width, y, "#FFFFFF");
    //draw track label
    this.c.fillText(track.name, xshift, y - this.trackLabelHeight/4);

    //if it's property track then draw anims
    if (track.type == "property") {
        for(var i=0; i<track.keys.length; i++) {
            var key = track.keys[i];
            var selected = false;
            if (this.selectedKeys.indexOf(key) > -1) {
                selected = true;
            }
            var first = (i == 0);
            var last = (i == track.keys.length - 1);
            this.drawRombus(this.timeToX(key.time), y - this.trackLabelHeight*0.5, this.trackLabelHeight*0.5, this.trackLabelHeight*0.5, "#999999", true, true, selected ? "#FF0000" : "#666666");
            this.drawRombus(this.timeToX(key.time), y - this.trackLabelHeight*0.5, this.trackLabelHeight*0.5, this.trackLabelHeight*0.5, "#DDDDDD", !first, !last);
        }
    }
}


Timeline.prototype.drawLine = function(x1, y1, x2, y2, color) {
    this.c.strokeStyle = color;
    this.c.beginPath();
    this.c.moveTo(x1+0.5, y1+0.5);
    this.c.lineTo(x2+0.5, y2+0.5);
    this.c.stroke();
}

Timeline.prototype.drawRect = function(x, y, w, h, color) {
    this.c.fillStyle = color;
    this.c.fillRect(x, y, w, h);
}

Timeline.prototype.drawCenteredRect = function(x, y, w, h, color) {
    this.c.fillStyle = color;
    this.c.fillRect(x-w/2, y-h/2, w, h);
}

Timeline.prototype.drawRombus = function(x, y, w, h, color, drawLeft, drawRight, strokeColor) {
    this.c.fillStyle = color;
    if (strokeColor) {
        this.c.lineWidth = 2;
        this.c.strokeStyle = strokeColor;
        this.c.beginPath();
        this.c.moveTo(x, y - h/2);
        this.c.lineTo(x + w/2, y);
        this.c.lineTo(x, y + h/2);
        this.c.lineTo(x - w/2, y);
        this.c.lineTo(x, y - h/2);
        this.c.stroke();
        this.c.lineWidth = 1;
    }

    if (drawLeft) {
        this.c.beginPath();
        this.c.moveTo(x, y - h/2);
        this.c.lineTo(x - w/2, y);
        this.c.lineTo(x, y + h/2);
        this.c.fill();
    }

    if (drawRight) {
        this.c.beginPath();
        this.c.moveTo(x, y - h/2);
        this.c.lineTo(x + w/2, y);
        this.c.lineTo(x, y + h/2);
        this.c.fill();
    }
}

Timeline.prototype.initTracks = function() {
    this.tracks = [];
    for(var i=0; i<this.anims.length; i++) {
        var anim = this.anims[i];
        var objectTrack = null;
        var propertyTrack = null;
        for(var j=0; j<this.tracks.length; j++) {
            if (this.tracks[j].type == "object" && this.tracks[j].target == anim.target) {
                objectTrack = this.tracks[j];
            }
            if (this.tracks[j].type == "property" && this.tracks[j].target == anim.target && this.tracks[j].propertyName == anim.propertyName) {
                propertyTrack = this.tracks[j];
            }
        }
        if (!objectTrack) {
            objectTrack = {
                type: "object",
                id: anim.targetName,
                name: anim.targetName,
                target: anim.target,
                propertyTracks: []
            };
            if (!objectTrack.name) {
                objectTrack.name = "Object" + this.trackNameCounter++;
            }
            this.tracks.push(objectTrack);
        }

        if (!propertyTrack) {
            propertyTrack = {
                type: "property",
                id: objectTrack.name + "." + anim.propertyName,
                name: anim.propertyName,
                propertyName: anim.propertyName,
                target: anim.target,
                parent: objectTrack,
                anims: []
            }

            //find place to insert
            var parentObjectTrack = null;
            var nextObjectTrack = null;
            for(var k=0; k<this.tracks.length; k++) {
                if (this.tracks[k].type == "object") {
                    if (parentObjectTrack && !nextObjectTrack) {
                        nextObjectTrack = this.tracks[k];
                    }
                    if (this.tracks[k].target == propertyTrack.target) {
                        parentObjectTrack = this.tracks[k];
                    }
                }
            }

            if (nextObjectTrack) {
                //add ad the end of this object property tracks, just before next one
                var nextTrackIndex = this.tracks.indexOf(nextObjectTrack);
                this.tracks.splice(nextTrackIndex, 0, propertyTrack);
            }
            else {
                //add to end of all track
                this.tracks.push(propertyTrack);
            }

            parentObjectTrack.propertyTracks.push(propertyTrack);

        }

        propertyTrack.anims.push(anim);
    }

    //convert anims to keys
    for(var i=0; i<this.tracks.length; i++) {
        var track = this.tracks[i];
        track.keys = [];
        if (track.type == "object") continue;
        for(var j=0; j<track.anims.length; j++) {
            var anim = track.anims[j];
            if (anim.delay > 0) {
                var startValue = 0;
                var easing = anim.easing;
                if (j == 0) {
                    startValue = track.target[track.propertyName];
                }
                else {
                    startValue = track.anims[j-1].endValue;
                }
                track.keys.push({
                    time: anim.startTime,
                    value: startValue,
                    easing: easing,
                    track: track
                });
            }
            var easing = Timeline.Easing.Linear.EaseNone;
            if (j < track.anims.length - 1) {
                if (track.anims[j+1].delay == 0) {
                    easing = track.anims[j+1].easing;
                }
            }
            track.keys.push({
                time: anim.endTime,
                value: anim.endValue,
                easing: easing,
                track: track
            });
        }
    }
}

Timeline.prototype.buildInputDialog = function() {
    this.keyEditDialog = document.createElement("div");
    this.keyEditDialog.id = "keyEditDialog";
    this.keyEditDialog.style.cssText = "position:absolute; padding:5px; background: #DDDDDD; font-family:arial; font-size:11px; left: 100px; top:100px; border: 1px solid #AAAAAA; border-radius: 5px;";

    var dirOptions = "";
    dirOptions += "<option>상</option>";
    dirOptions += "<option>하</option>";
    dirOptions += "<option>좌</option>";
    dirOptions += "<option>우</option>";

    var visibleOptions = "";
    visibleOptions += "<option>보임</option>";
    visibleOptions += "<option>안보임</option>";

    var controls = "";
    controls += '<label style="margin-left:10px">보이기 여부<select id="keyEditDialogVisible">' + visibleOptions + '</label>';
    controls += '<input id="SpeechInputButton" style="margin-left: 10px" type="button" value="대사입력"/>';
    controls += '<label style="margin-left:10px">방향<select id="keyEditDialogDir">' + dirOptions + '</label>';
    controls += '<input id="keyEditDialogOK" style="margin-left:10px" type="button" value="확인"/>';
    controls += '<input id="keyEditDialogDelete" style="margin-left:2px" type="button" value="삭제"/>';
    controls += '<input id="keyEditDialogCancel" style="margin-left:2px; margin-right:10px" type="button" value="취소"/>';

    this.keyEditDialog.innerHTML = controls;
    document.body.appendChild(this.keyEditDialog);

    this.keyEditDialogVisible = document.getElementById("keyEditDialogVisible");
    this.SpeechInputButton = document.getElementById("SpeechInputButton");
    this.keyEditDialogDir = document.getElementById("keyEditDialogDir");
    this.keyEditDialogOK = document.getElementById("keyEditDialogOK");
    this.keyEditDialogDelete = document.getElementById("keyEditDialogDelete");
    this.keyEditDialogCancel = document.getElementById("keyEditDialogCancel");

    var self = this;
    this.SpeechInputButton.addEventListener('click', function() {
        tempSpeech = prompt("대사를 입력하세요.");
    }, false);
    this.keyEditDialogOK.addEventListener('click', function() {
        self.applyKeyEditDialog();
        self.hideKeyEditDialog();
    }, false);
    this.keyEditDialogCancel.addEventListener('click', function() {
        self.hideKeyEditDialog();
    }, false);
    this.keyEditDialogDelete.addEventListener('click', function() {
        self.deleteSelectedKeys();
        self.rebuildSelectedTracks();
        self.hideKeyEditDialog();
    }, false);

    this.hideKeyEditDialog();
}

Timeline.prototype.applyKeyEditDialog = function()
{
    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].time == Timeline.globalInstance.selectedKeys[0].time)
        {
            var direction;
            switch ($("#keyEditDialogDir option:selected").text())
            {
                case '상': direction = 0; break;
                case '하': direction = 1; break;
                case '좌': direction = 2; break;
                case '우': direction = 3; break;
            }
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].visible = ($("#keyEditDialogVisible option:selected").text() == "보임");
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].speak = tempSpeech;
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].direction = direction;

            // 서버에 전송
            var info =
            {
                sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
                charID: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].id,
                node: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node
            };
            WebSocketConnector.socket.emit('eventKeyValueEdit', JSON.stringify(info));
            tempSpeech = "";
            break;
        }
    }

    // 캔버스에 적용
    makeEventObject(sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name, Timeline.globalInstance.selectedKeys[0].time);
}

Timeline.prototype.showKeyEditDialog = function(mouseX, mouseY) {
    this.keyEditDialog.style.left = Math.max(50, mouseX - 200) + "px";
    this.keyEditDialog.style.top = (mouseY - 50) + "px";
    this.keyEditDialog.style.display = "block";
}

Timeline.prototype.deleteSelectedKeys = function() {
    for(var i=0; i<this.selectedKeys.length; i++) {
        var selectedKey = this.selectedKeys[i];
        var keyIndex = selectedKey.track.keys.indexOf(selectedKey);
        selectedKey.track.keys.splice(keyIndex, 1);
    }
    this.rebuildSelectedTracks();

    // 로컬에 적용
    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[i].time == Timeline.globalInstance.selectedKeys[0].time)
        {
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node.splice[i, 1];
        }
    }

    // 서버에 적용
    var info =
    {
        sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
        charID: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].id,
        node: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node
    };
    WebSocketConnector.socket.emit('eventKeyValueEdit', JSON.stringify(info));

    // 캔버스에 적용
    makeEventObject("", 0);
}

Timeline.prototype.hideKeyEditDialog = function() {
    this.keyEditDialog.style.display = "none";
}

Timeline.prototype.sortTrackKeys = function(track) {
    track.keys.sort(function(a,b) { return a.time - b.time; });

    var result = "";
    for(var i=0; i<track.keys.length; i++) {
        result += track.keys[i].time + " ";
    }
}

Timeline.prototype.rebuildSelectedTracks = function() {
    for(var i=0; i<this.selectedKeys.length; i++) {
        this.rebuildTrackAnimsFromKeys(this.selectedKeys[i].track);
    }
    this.save();
}

Timeline.prototype.rebuildTrackAnimsFromKeys = function(track) {
    var deletedAnims = [];

    //remove all track's anims from the timeline
    for(var j=0; j<track.anims.length; j++) {
        var index = this.anims.indexOf(track.anims[j]);
        deletedAnims.push(track.anims[j]);
        this.anims.splice(index, 1);
    }

    //remove all anims from the track
    track.anims.splice(0, track.anims.length);

    if (track.keys.length == 0) {
        return;
    }

    var delay = track.keys[0].time;
    var prevKeyTime = track.keys[0].time;
    var prevKeyValue = track.keys[0].value;
    var prevKeyEasing = Timeline.Easing.Linear.EaseNone;
    //create new anims based on keys
    for(var j=0; j<track.keys.length; j++) {
        var key = track.keys[j];
        var anim = {
            timeline: this,
//targetName: track.parent.name, //propertyTrack.objectTrack.targetName
            target: track.target,
            propertyName: track.propertyName,
            startValue: prevKeyValue,
            endValue: key.value,
            delay: delay,
            startTime: prevKeyTime,
            endTime: key.time,
            easing: prevKeyEasing
        };
        track.anims.push(anim);
        this.anims.push(anim);
        delay = 0;
        prevKeyTime = key.time;
        prevKeyValue = key.value;
        prevKeyEasing = key.easing;
    }
}

Timeline.prototype.export = function() {
    var code = "";

    for(var i=0; i<this.tracks.length; i++) {
        var track = this.tracks[i];
        if (track.type == "object") continue;
        if (track.anims.length == 0) continue;
        code += 'anim("' + track.parent.name + '",' + track.parent.name + ')';
        for(var j=0; j<track.anims.length; j++) {
            var anim = track.anims[j];
            code += '.to(';
            if (anim.delay)
                code += anim.delay + ',';
            code += '{' + '"' + anim.propertyName + '"' + ':' + anim.endValue + '}';
            code += ',' + (anim.endTime - anim.startTime);
            if (anim.easing != Timeline.Easing.Linear.EaseNone)
                code += ', Timeline.Easing.' + Timeline.easingFunctionToString(anim.easing);
            code += ')';
            //code += '.to(' + anim.delay + ',{' + '"' + anim.propertyName + '"' + ':' + anim.endValue + '} ')';
        }
        code += ';\n';
    }

    prompt("Copy this:", code);
}

Timeline.prototype.save = function() {
    /*var data = {};

    for(var i=0; i<this.tracks.length; i++) {
        var track = this.tracks[i];
        var keysData = [];
        for(var j=0; j<track.keys.length; j++) {
            keysData.push({
                time: track.keys[j].time,
                value: track.keys[j].value,
                easing: Timeline.easingFunctionToString(track.keys[j].easing),
            });
        }
        data[track.id] = keysData;
    }

    localStorage["timeline.js.settings.canvasHeight"] = this.canvasHeight;
    localStorage["timeline.js.settings.timeScale"] = this.timeScale;
    localStorage["timeline.js.data." + this.name] = JSON.stringify(data);*/
}

Timeline.prototype.load = function() {
    this.timeScale = 0.2;
    /*if (localStorage["timeline.js.settings.canvasHeight"]) {
        this.canvasHeight = localStorage["timeline.js.settings.canvasHeight"];
    }
    if (localStorage["timeline.js.settings.timeScale"]) {
        this.timeScale = localStorage["timeline.js.settings.timeScale"];
    }

    var dataString = localStorage["timeline.js.data." + this.name];
    if (!dataString) return;
    var data = JSON.parse(dataString);
    for(var i=0; i<this.tracks.length; i++) {
        var track = this.tracks[i];
        if (!data[track.id]) {
            continue;
        }
        if (track.type == "property") {
            var keysData = data[track.id];
            track.keys = [];
            for(var j=0; j<keysData.length; j++) {
                track.keys.push({
                    time: keysData[j].time,
                    value: keysData[j].value,
                    easing: Timeline.stringToEasingFunction(keysData[j].easing),
                    track: track
                })
            }
            this.rebuildTrackAnimsFromKeys(track);
        }
    }*/
}