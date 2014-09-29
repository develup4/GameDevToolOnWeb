// 모듈 추출
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var exec = require('exec');
var mongoose = require('mongoose');
var fs = require('fs');
var fse = require('fs-extra');
var dir = require('dir-util'), options = { filters: null, unit: 'mb' };
var image = require('imagemagick');

// 웹 서버 생성
var app = express();

// DB Connection
var connectionDB;

// 스키마 정의
var schema = mongoose.Schema;

// 이벤트씬 오브젝트 스키마
var eventSceneObjectSchema = new schema(
    {
        id:             Number,
        name:           String,
        sprite:
        {
            isSpriteUpload:
            {
                idle:       [Boolean],
                move:       [Boolean],
                illust:     Boolean
            },
            frameCount:
            {
                idle:       [Number],
                move:       [Number]
            },
            frameWidth:
            {
                idle:       [Number],
                move:       [Number],
                illust:     Number
            },
            frameHeight:
            {
                idle:       [Number],
                move:       [Number],
                illust:     Number
            },
            ext:
            {
                idle:       [String],
                move:       [String],
                illust:     String
            }
        },
        Node:
            [
                {
                    time:       Number,
                    visible:    Boolean,
                    x:          Number,
                    y:          Number,
                    direction:  Number,
                    speak:      String
                }
            ]
    }
);

// 배틀씬 오브젝트 스키마
var battleSceneObjectSchema = new schema(
    {
        id:             Number,
        name:           String,
        position:
        {
            x:  Number,
            y:  Number
        },
        direction:      Number,
        isEnemy:        Boolean,
        status:
        {
            hp:             Number,
            mp:             Number,
            str:            Number,
            dex:            Number,
            def:            Number
        },
        sprite:
        {
            isSpriteUpload:
            {
                idle:       [Boolean],
                move:       [Boolean],
                attack:     [Boolean],
                hit:        [Boolean]
            },
            frameCount:
            {
                idle:       [Number],
                move:       [Number],
                attack:     [Number],
                hit:        [Number]
            },
            frameWidth:
            {
                idle:       [Number],
                move:       [Number],
                attack:     [Number],
                hit:        [Number]
            },
            frameHeight:
            {
                idle:       [Number],
                move:       [Number],
                attack:     [Number],
                hit:        [Number]
            },
            ext:
            {
                idle:       [String],
                move:       [String],
                attack:     [String],
                hit:        [String]
            }
        }
    }
);

// 월드맵씬 오브젝트 스키마
var worldMapSceneObjectSchema = new schema(
    {
        id:             Number,
        name:           String,
        position:
        {
            x:  Number,
            y:  Number
        },
        nextSceneNumber:Number,
        imageSize:
        {
            width:      Number,
            height:     Number
        },
        isImageUpload: Boolean,
        ext:            String
    }
);

// 씬 객체 스키마
var sceneInfoSchema = new schema(
    {
        rivision:           Number,
        projectID:          Number,
        sceneNumber:        Number,
        isStart:            Boolean,
        name:               String,
        type:               Number,
        graphPosition:
        {
            x: Number,
            y: Number
        },
        nextSceneIDs:       [Number],
        eventObjects:       [eventSceneObjectSchema],
        eventCameraNode:
            [
                {
                    x:          Number,
                    y:          Number,
                    fadeIn:     Boolean,
                    fadeOut:    Boolean,
                    time:       Number
                }
            ],
        battleObjects:      [battleSceneObjectSchema],
        battleMapMovable:   [Boolean],   // 이차원 배열이 안되서 일렬로 저장
        worldMapObjects:    [worldMapSceneObjectSchema],
        isMapImageUpload:   Boolean,
        mapImageExt:        String,
        mapSize:
        {
            width:          Number,
            height:         Number
        },
        isBgmUpload:        Boolean,
        bgmExt:             String
    }
);

// 씬 모델 정의
var sceneModel = mongoose.model('sceneCollection', sceneInfoSchema);
var revisionModel = mongoose.model('revision', sceneInfoSchema);

// 미들웨어 설정

var router = express.Router();
app.use(router);
app.use(express.static(__dirname));

// 라우트
app.get('/', function(request, response, next)
{
    fs.readFile('index.html', function(error, data)
    {
        response.send(data.toString());
    });
});

// Commit 기능
app.get('/commit/:revision', function(request, response)
{
    var revision = request.param('revision');

    // 리비전 디렉토리 생성
    var dir = 'repo/revision/' + revision;
    fse.ensureDir(dir, function(err)
    {
        console.log(err);
    });

    // 복사
    fse.copy('repo/demoProject', dir, function(err)
    {
        if (err) return console.error(err);
        console.log("commit success!");

        response.send('<h1>Commit Success!</h1>');
    });

    sceneModel.find({projectID: 0}, function(err, data)
    {
        for(var i = 0; i < data.length; i++)
        {
            var instance = new revisionModel();

            instance.rivision = revision;
            instance.projectID = data[i].projectID;
            instance.sceneNumber = data[i].sceneNumber;
            instance.isStart = data[i].isStart;
            instance.name = data[i].name;
            instance.type = data[i].type;
            instance.graphPosition = data[i].graphPosition;
            instance.nextSceneIDs = data[i].nextSceneIDs;
            instance.eventObjects = data[i].eventObjects;
            instance.eventCameraNode = data[i].eventCameraNode;
            instance.battleObjects = data[i].battleObjects;
            instance.battleMapMovable = data[i].battleMapMovable;
            instance.worldMapObjects = data[i].worldMapObjects;
            instance.isMapImageUpload = data[i].isMapImageUpload;
            instance.mapImageExt = data[i].mapImageExt;
            instance.mapSize = data[i].mapSize;
            instance.isBgmUpload = data[i].isBgmUpload;
            instance.bgmExt = data[i].bgmExt;

            instance.save(function(err){console.log("Revision 기록")});
        }
    });
});

// 롤백 기능
app.get('/rollback/:revision', function(request, response)
{
    var revision = request.param('revision');
    dir.rm("repo/demoProject", function(err){});

    var path = 'repo/demoProject';
    fse.ensureDir(path, function(err)
    {
        console.log(err);
    });

    fse.copy('repo/revision/' + revision, 'repo/demoProject', function(err)
    {
        if (err) return console.error(err);
        console.log("rollback success!");

        response.send('<h1>Rollback Success!</h1>');
    });

    // 현재 디비 날리기
    sceneModel.remove({projectID: 0}, function(err, updated)
    {
        console.log("현재 디비 내용 제거");
    });

    revisionModel.find({rivision: revision}, function(err, data)
    {
        for(var i = 0; i < data.length; i++)
        {
            var instance = new sceneModel();

            instance.rivision = revision;
            instance.projectID = data[i].projectID;
            instance.sceneNumber = data[i].sceneNumber;
            instance.isStart = data[i].isStart;
            instance.name = data[i].name;
            instance.type = data[i].type;
            instance.graphPosition = data[i].graphPosition;
            instance.nextSceneIDs = data[i].nextSceneIDs;
            instance.eventObjects = data[i].eventObjects;
            instance.eventCameraNode = data[i].eventCameraNode;
            instance.battleObjects = data[i].battleObjects;
            instance.battleMapMovable = data[i].battleMapMovable;
            instance.worldMapObjects = data[i].worldMapObjects;
            instance.isMapImageUpload = data[i].isMapImageUpload;
            instance.mapImageExt = data[i].mapImageExt;
            instance.mapSize = data[i].mapSize;
            instance.isBgmUpload = data[i].isBgmUpload;
            instance.bgmExt = data[i].bgmExt;

            instance.save(function(err){console.log("Revision 기록")});
        }
    });
});

// 자동 pull
app.post('/pull', function(request, response)
{
    exec(['git', 'pull'], function(err, out, code)
    {
        console.log('GitHub Repository Push & Pull!\n');
    });
});

// 웹 서버 실행
var server = http.createServer(app);
server.listen(9987, function()
{
    // MongoDB 연결
    mongoose.connect('mongodb://localhost/toolDatabase');
    connectionDB = mongoose.connection;
    connectionDB.on('error', console.error.bind(console, 'mongoDB Connection Error'));
    connectionDB.once('open', function callback()
    {
        console.log('mongoDB Open');
    });

    // 접속 메시지
    console.log('Server is running');
});

// 웹 소켓 생성
var io = socketio.listen(server);
io.sockets.on('connection', function(socket)
{
    socket.on('requestSceneInfo', function(projectID, sceneNum)
    {
        var sceneNumber;
        if (sceneNum == 0)
        {
            sceneModel.find({projectID: projectID, isStart: true}, function(err, data)
            {
                socket.emit('responseSceneInfo', JSON.stringify(data[0]));
            });
        }
        else
        {
            sceneModel.find({projectID: projectID, sceneNumber: sceneNum}, function(err, data)
            {
                socket.emit('responseSceneInfo', JSON.stringify(data[0]));
            });
        }
    });

    socket.on('requestSceneInfos', function(projectID)
    {
        sceneModel.find({projectID: projectID}, function(err, data)
        {
            socket.emit('responseSceneInfos', JSON.stringify(data));
        });
    });

    socket.on('requestProjectCapacity', function(data)
    {
        dir.getSize('repo/' + data, options, function(err, size)
        {
            socket.emit('responseProjectCapacity', dir.to(size, options.unit));
        });
    });

    socket.on('createScene', function(data)
    {
        var info = JSON.parse(data);

        // 추가하기 위한 인스턴스
        var instance = new sceneModel();
        instance.rivision = 1;
        instance.projectID = 0;
        instance.sceneNumber = info.id;
        instance.isStart = false;
        instance.name = "Scene" + info.id;
        socket.emit('createSceneName', instance.name);
        instance.type = info.type;
        instance.graphPosition.x = info.x;
        instance.graphPosition.y = info.y;
        instance.nextSceneIDs = [];
        instance.eventObjects = [];
        instance.battleObjects = [];
        instance.worldMapObjects = [];
        instance.battleMapMovable = [];
        instance.isMapImageUpload = false;
        instance.mapImageExt = null;
        instance.mapSize.width = null;
        instance.mapSize.height = null;
        instance.isBgmUpload = false;
        instance.bgmExt = null;

        instance.save(function(err)
        {
            console.log("씬 추가[id:" + info.id + ", type:" + info.type + ", x:" + info.x + ",y:" + info.y + "]");

            // 디렉토리 생성
            fs.mkdirSync("repo/demoProject/" + instance.name);
            fs.mkdirSync("repo/demoProject/" + instance.name + "/bgm");
            fs.mkdirSync("repo/demoProject/" + instance.name + "/map");
            fs.mkdirSync("repo/demoProject/" + instance.name + "/objects");
        });
    });

    socket.on('deleteScene', function(data)
    {
        var info = JSON.parse(data);

        if (info.id != -1)
        {
            sceneModel.remove({sceneNumber: info.id}, function(err, updated)
            {
                console.log("씬 제거[id:" + info.id + "]");
            });

            for(var i = 0; i < info.list.length; i++)
            {
                sceneModel.update({sceneNumber : info.list[i]}, {$pull: {nextSceneIDs: info.id}}, function(err, updated) { });
            }

            // 디렉토리 삭제
            var path = "repo/demoProject/" + info.name;
            dir.rm(path, function(err)
            {
                dir.getSize('repo/demoProject', options, function(err, size)
                {
                    socket.emit('responseProjectCapacity', dir.to(size, options.unit));
                });
            });
            socket.emit('sceneDeleteComplete');
        }
    });

    socket.on('setStartNode', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({isStart: true}, {$set: {isStart: false}}, function(err, updated)
        {
            console.log("기존 스타트 노드 해제");
        });
        sceneModel.update({sceneNumber: info.id}, {$set: {isStart: true}}, function(err, updated)
        {
            console.log("시작 씬 노드 설정[id:" + info.id + "]");
        });
    });

    socket.on('sceneNodeMove', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.id}, {$set: {graphPosition: {x: info.x, y: info.y}}}, function(err, updated)
        {
            console.log("씬 노드 이동[id:" + info.id + "] x: " + info.x + ", y:" + info.y);
        });
    });

    socket.on('linkAdd', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.startScene}, {$push: {nextSceneIDs: info.endScene}}, function(err, updated)
        {
            console.log("씬 링크추가[from:" + info.startScene + ", to:" + info.endScene+ "]");
        });
    });

    socket.on('sceneNameChange', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.id}, {$set: {name: info.newName}}, function(err, updated)
        {
            console.log("씬 이름 변경 [id:" + info.id + ", name:" + info.newName + "]");
        });

        // 디렉토리 이름 변경
        fs.renameSync("repo/demoProject/" + info.oldName, "repo/demoProject/" + info.newName);
    });

    socket.on('mapImageFileUpload', function(data)
    {
        var json = JSON.parse(data);
        var matches = json.file.src.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        var buffer = new Buffer(matches[2], 'base64');
        fs.writeFileSync(json.file.path, buffer);

        console.log(json.file.path + "에 파일 저장 완료!");
        image.identify(json.file.path, function(err, features)
        {
            sceneModel.update({sceneNumber: json.sceneNum}, {$set: {mapImageExt: json.ext, isMapImageUpload: true, mapSize: {width: features.width, height: features.height}}}, function(err, updated)
            {
                console.log(json.sceneNum, json.ext, features.width, features.height);
                socket.emit('mapImageUploadComplete', JSON.stringify({width: features.width, height: features.height, ext: json.ext}));
            });
        });
    });

    socket.on('bgmFileUpload', function(data)
    {
        var json = JSON.parse(data);
        var data = json.file.src.split(',');
        var buffer = new Buffer(data[1], 'base64');
        fs.writeFileSync(json.file.path, buffer);

        console.log(json.file.path + "에 파일 저장 완료!");
        sceneModel.update({sceneNumber: json.sceneNum}, {$set: {bgmExt: json.ext, isBgmUpload: true}}, function(err, updated)
        {
            console.log(json.sceneNum, json.ext);
        });

        socket.emit('bgmUploadComplete');
    });


    socket.on('deleteMapImage', function(data)
    {
        var info = JSON.parse(data);
        fs.unlinkSync("repo/demoProject/" + info.sceneName + "/map/map." + info.ext);
        sceneModel.update({name: info.sceneName}, {$set: {isMapImageUpload: false}}, function(err, updated)
        {
            console.log("맵 이미지 제거 [" + info.sceneName + "씬");
        });
    });

    socket.on('deleteBGM', function(data)
    {
        var info = JSON.parse(data);
        fs.unlinkSync("repo/demoProject/" + info.sceneName + "/bgm/bgm." + info.ext);
        sceneModel.update({name: info.sceneName}, {$set: {isBgmUpload: false}}, function(err, updated)
        {
            console.log("배경음악 제거 [" + info.sceneName + "] 씬");
        });
    });

    socket.on('createBattleChar', function(data)
    {
        var info = JSON.parse(data);
        var newChar =
        {
            id: info.id,
            name: info.name,
            position:
            {
                x:  -1,
                y:  -1
            },
            direction: 1,
            isEnemy: false,
            status:
            {
                hp: 0,
                mp: 0,
                str: 0,
                dex: 0,
                def: 0
            },
            sprite:
            {
                isSpriteUpload:
                {
                    idle: [false, false, false, false],
                    move: [false, false, false, false],
                    attack: [false, false, false, false],
                    hit: [false, false, false, false]
                },
                frameCount:
                {
                    idle: [1, 1, 1, 1],
                    move: [1, 1, 1, 1],
                    attack: [1, 1, 1, 1],
                    hit: [1, 1, 1, 1]
                },
                frameWidth:
                {
                    idle: [0, 0, 0, 0],
                    move: [0, 0, 0, 0],
                    attack: [0, 0, 0, 0],
                    hit: [0, 0, 0, 0]
                },
                frameHeight:
                {
                    idle: [0, 0, 0, 0],
                    move: [0, 0, 0, 0],
                    attack: [0, 0, 0, 0],
                    hit: [0, 0, 0, 0]
                },
                ext:
                {
                    idle: ["", "", "", ""],
                    move: ["", "", "", ""],
                    attack: ["", "", "", ""],
                    hit: ["", "", "", ""]
                }
            }
        }
        sceneModel.update({name: info.sceneName}, {$push: {battleObjects: newChar}}, function(err, updated)
        {
            console.log("배틀 캐릭터 생성[SceneName:" + info.sceneName + ", 캐릭터명:" + info.name+ "]");

            // 디렉토리 생성
            fs.mkdirSync("repo/demoProject/" + info.sceneName + "/objects/" + info.name);

            // 생성된 캐릭터 보내기
            socket.emit('responseNewChar', JSON.stringify(newChar));
        });
    });

    socket.on('battleCharDelete', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({name: info.sceneName}, {$pull: {battleObjects: {name: info.charName}}}, function(err, updated){ });
        console.log("[ " + info.sceneName + " 씬 ] 캐릭터 " + info.charName + "캐릭터 삭제");

        // 디렉토리 삭제
        dir.rm("repo/demoProject/" + info.sceneName + "/objects/" + info.charName, function(err)
        {
            dir.getSize('repo/demoProject', options, function(err, size)
            {
                socket.emit('responseProjectCapacity', dir.to(size, options.unit));
            });
        });
    });

    socket.on('battleCharEdit', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({sceneNumber: info.sceneNum, 'battleObjects.id': info.char.id}, {$set: {'battleObjects.$': info.char}}, function(err, updated){ });
        console.log("[ " + info.sceneNum + "번 씬 ] 캐릭터 " + info.char.id + "번 수정");

        // 캐릭터명이 변경될 경우 폴더명도 변경해야함
        // 일단 제껴
    });

    socket.on('battleSpriteUpload', function(data)
    {
        var info = JSON.parse(data);
        var matches = info.file.src.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        var buffer = new Buffer(matches[2], 'base64');
        fs.writeFileSync(info.file.path, buffer);

        console.log(info.file.path + "에 파일 저장 완료!");
        image.identify(info.file.path, function(err, features)
        {
            socket.emit('battleSpriteUploadComplete', JSON.stringify({width: features.width, height: features.height, ext: info.ext, animationType: info.animationType, dirNumber: info.dirNumber}));
        });
    });

    socket.on('deleteSprite', function(data)
    {
        var info = JSON.parse(data);
        console.log("repo/demoProject/" + info.sceneName + "/objects/" + info.charName + "/" + info.fileName);
        fs.unlinkSync("repo/demoProject/" + info.sceneName + "/objects/" + info.charName + "/" + info.fileName);

        sceneModel.update({name: info.sceneName, 'battleObjects.name': info.charName}, {$set: {'battleObjects.$.sprite': info.sprite}}, function(err, updated)
        {
            console.log("배틀 캐릭터 스프라이트 제거");
        });
    });

    socket.on('battleSpriteInfoUpdate', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.sceneNum, 'battleObjects.id': info.id}, {$set: {'battleObjects.$.sprite': info.sprite}}, function(err, updated){ });
    });

    socket.on('battleCharMove', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({sceneNumber: info.sceneNum, 'battleObjects.id': info.charID}, {$set: {'battleObjects.$.position': info.position}}, function(err, updated){ });
        console.log("[ " + info.sceneNum + "번 씬 ] 캐릭터 " + info.charID + "번 이동 - x : " + info.position.x + ", y : " + info.position.y);
    });

    socket.on('renewMovable', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.sceneNum}, {$set: {battleMapMovable: info.movable}}, function(err, updated){ });
    });

    socket.on('createCity', function(data)
    {
        var info = JSON.parse(data);
        var newCity =
        {
            id: info.id,
            name: info.name,
            position:
            {
                x:  -1,
                y:  -1
            },
            nextSceneNumber: [Number],
            imageSize:
            {
                width: 0,
                height: 0
            },
            isImageUpload: false,
            ext: ""
        }
        sceneModel.update({name: info.sceneName}, {$push: {worldMapObjects: newCity}}, function(err, updated)
        {
            console.log("도시 생성[SceneName:" + info.sceneName + ", 도시명:" + info.name+ "]");

            // 디렉토리 생성
            fs.mkdirSync("repo/demoProject/" + info.sceneName + "/objects/" + info.name);

            // 생성된 캐릭터 보내기
            socket.emit('responseNewCity', JSON.stringify(newCity));
        });
    });

    socket.on('cityDelete', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({name: info.sceneName}, {$pull: {worldMapObjects: {name: info.cityName}}}, function(err, updated){ });
        console.log("[ " + info.sceneName + " 씬 ] 도시 " + info.cityName + " 삭제");

        // 디렉토리 삭제
        dir.rm("repo/demoProject/" + info.sceneName + "/objects/" + info.cityName, function(err)
        {
            dir.getSize('repo/demoProject', options, function(err, size)
            {
                socket.emit('responseProjectCapacity', dir.to(size, options.unit));
            });
        });
    });

    socket.on('cityEdit', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({sceneNumber: info.sceneNum, 'worldMapObjects.id': info.city.id}, {$set: {'worldMapObjects.$': info.city}}, function(err, updated){ });
        console.log("[ " + info.sceneNum + "번 씬 ] 도시 " + info.city.id + "번 수정");
    });

    socket.on('cityMove', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({sceneNumber: info.sceneNum, 'worldMapObjects.id': info.cityID}, {$set: {'worldMapObjects.$.position': info.position}}, function(err, updated){ });
        console.log("[ " + info.sceneNum + "번 씬 ] 도시 " + info.cityID + "번 이동 - x : " + info.position.x + ", y : " + info.position.y);
    });

    socket.on('cityFileUpload', function(data)
    {
        var json = JSON.parse(data);
        var matches = json.file.src.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        var buffer = new Buffer(matches[2], 'base64');
        fs.writeFileSync(json.file.path, buffer);

        console.log(json.file.path + "에 파일 저장 완료!");
        image.identify(json.file.path, function(err, features)
        {
            sceneModel.update({sceneNumber: json.sceneNum, 'worldMapObjects.name': json.cityName},
                {$set: {'worldMapObjects.$.isImageUpload': true, 'worldMapObjects.$.imageSize': {width: features.width, height: features.height}, 'worldMapObjects.$.ext': json.ext}}, function(err, updated)
                {
                    console.log(json.sceneNum, json.ext, features.width, features.height);
                    socket.emit('cityImageUploadComplete', JSON.stringify({width: features.width, height: features.height, ext: json.ext}));
                });
        });
    });

    socket.on('deleteCityImage', function(data)
    {
        var info = JSON.parse(data);
        fs.unlinkSync("repo/demoProject/" + info.sceneName + "/objects/" + info.cityName + "/city." + info.ext);
        sceneModel.update({name: info.sceneName, 'worldMapObjects.name': info.cityName}, {$set: {'worldMapObjects.$.isImageUpload': false}}, function(err, updated)
        {
            console.log("도시 이미지 제거");
        });
    });

    socket.on('createEventChar', function(data)
    {
        var info = JSON.parse(data);
        var newChar =
        {
            id: info.id,
            name: info.name,
            Node: [],     // 미배치 구분을 노드 개수가 0인 것으로 구별
            sprite:
            {
                isSpriteUpload:
                {
                    idle: [false, false, false, false],
                    move: [false, false, false, false],
                    illust: false
                },
                frameCount:
                {
                    idle: [1, 1, 1, 1],
                    move: [1, 1, 1, 1]
                },
                frameWidth:
                {
                    idle: [0, 0, 0, 0],
                    move: [0, 0, 0, 0],
                    illust: 0
                },
                frameHeight:
                {
                    idle: [0, 0, 0, 0],
                    move: [0, 0, 0, 0],
                    illust: 0
                },
                ext:
                {
                    idle: ["", "", "", ""],
                    move: ["", "", "", ""],
                    illust: ""
                }
            }
        }
        sceneModel.update({name: info.sceneName}, {$push: {eventObjects: newChar}}, function(err, updated)
        {
            console.log("이벤트 캐릭터 생성[SceneName:" + info.sceneName + ", 캐릭터명:" + info.name+ "]");

            // 디렉토리 생성
            fs.mkdirSync("repo/demoProject/" + info.sceneName + "/objects/" + info.name);

            // 생성된 캐릭터 보내기
            socket.emit('responseEventNewChar', JSON.stringify(newChar));
        });
    });

    socket.on('eventCharDelete', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({name: info.sceneName}, {$pull: {eventObjects: {name: info.charName}}}, function(err, updated){ });
        console.log("[ " + info.sceneName + " 씬 ] 캐릭터 " + info.charName + "캐릭터 삭제");

        // 디렉토리 삭제
        dir.rm("repo/demoProject/" + info.sceneName + "/objects/" + info.charName, function(err)
        {
            dir.getSize('repo/demoProject', options, function(err, size)
            {
                socket.emit('responseProjectCapacity', dir.to(size, options.unit));
            });
        });
    });

    socket.on('eventCharEdit', function(data)
    {
        var info = JSON.parse(data);

        sceneModel.update({sceneNumber: info.sceneNum, 'eventObjects.id': info.char.id}, {$set: {'eventObjects.$': info.char}}, function(err, updated){ });
        console.log("[ " + info.sceneNum + "번 씬 ] 캐릭터 " + info.char.id + "번 수정");

        // 캐릭터명이 변경될 경우 폴더명도 변경해야함
        // 일단 제껴
    });

    socket.on('eventSpriteUpload', function(data)
    {
        var info = JSON.parse(data);
        var matches = info.file.src.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        var buffer = new Buffer(matches[2], 'base64');
        fs.writeFileSync(info.file.path, buffer);

        console.log(info.file.path + "에 파일 저장 완료!");
        image.identify(info.file.path, function(err, features)
        {
            socket.emit('eventSpriteUploadComplete', JSON.stringify({width: features.width, height: features.height, ext: info.ext, animationType: info.animationType, dirNumber: info.dirNumber}));
        });
    });

    socket.on('eventIllustUpload', function(data)
    {
        var info = JSON.parse(data);
        var matches = info.file.src.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        var buffer = new Buffer(matches[2], 'base64');
        fs.writeFileSync(info.file.path, buffer);

        console.log(info.file.path + "에 파일 저장 완료!");
        image.identify(info.file.path, function(err, features)
        {
            socket.emit('illustUploadComplete', JSON.stringify({width: features.width, height: features.height, ext: info.ext}));
        });
    });

    socket.on('eventSpriteInfoUpdate', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.sceneNum, 'eventObjects.id': info.id}, {$set: {'eventObjects.$.sprite': info.sprite}}, function(err, updated){ });
    });

    socket.on('eventIllustInfoUpdate', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.sceneNum, 'eventObjects.id': info.id}, {$set: {'eventObjects.$.sprite': info.sprite}}, function(err, updated){ });
    });

    socket.on('deleteEventSprite', function(data)
    {
        var info = JSON.parse(data);
        console.log("repo/demoProject/" + info.sceneName + "/objects/" + info.charName + "/" + info.fileName);
        fs.unlinkSync("repo/demoProject/" + info.sceneName + "/objects/" + info.charName + "/" + info.fileName);

        sceneModel.update({name: info.sceneName, 'eventObjects.name': info.charName}, {$set: {'eventObjects.$.sprite': info.sprite}}, function(err, updated)
        {
            console.log("이벤트 캐릭터 스프라이트 제거");
        });
    });

    socket.on('deleteEventIllust', function(data)
    {
        var info = JSON.parse(data);
        console.log("repo/demoProject/" + info.sceneName + "/objects/" + info.charName + "/Illust." + info.ext);
        fs.unlinkSync("repo/demoProject/" + info.sceneName + "/objects/" + info.charName + "/Illust." + info.ext);

        sceneModel.update({name: info.sceneName, 'eventObjects.name': info.charName}, {$set: {'eventObjects.$.sprite': info.sprite}}, function(err, updated)
        {
            console.log("이벤트 캐릭터 스프라이트 제거");
        });
    });

    socket.on('eventKeyValueEdit', function(data)
    {
        var info = JSON.parse(data);
        sceneModel.update({sceneNumber: info.sceneNum, 'eventObjects.id': info.charID}, {$set: {'eventObjects.$.Node': info.node}}, function(err, updated)
        {
            console.log("이벤트 키 변경");
        });
    });
});