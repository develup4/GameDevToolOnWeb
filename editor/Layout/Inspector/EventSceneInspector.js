// DOM 객체 관련
var eventCharXSpinner;
var eventCharYSpinner;
var eventCharAnimationFrameSpinner =
{
    idle:   [Object],
    move:   [Object]
};
var eventDropZone = [];
var eventSpriteSpan = [];
var illustSpan = document.createElement('span');
illustSpan.id = 'illustThumbnail';

// 선택된 캐릭터 인덱스
var currentEventCharIndex = -1;

$(document).ready(
    function()
    {
        // 타임라인 초기화
        TimelineInit();

        // 스피너 설정
        eventCharXSpinner = $("#eventCharXSpinner").spinner({min: -1});
        eventCharYSpinner = $("#eventCharYSpinner").spinner({min: -1});
        eventCharAnimationFrameSpinner.idle[0] = $("#eventCharIdleUpSpinner").spinner({min: 1});
        eventCharAnimationFrameSpinner.idle[1] = $("#eventCharIdleDownSpinner").spinner({min: 1});
        eventCharAnimationFrameSpinner.idle[2] = $("#eventCharIdleLeftSpinner").spinner({min: 1});
        eventCharAnimationFrameSpinner.idle[3] = $("#eventCharIdleRightSpinner").spinner({min: 1});
        eventCharAnimationFrameSpinner.move[0] = $("#eventCharMoveUpSpinner").spinner({min: 1});
        eventCharAnimationFrameSpinner.move[1] = $("#eventCharMoveDownSpinner").spinner({min: 1});
        eventCharAnimationFrameSpinner.move[2] = $("#eventCharMoveLeftSpinner").spinner({min: 1});
        eventCharAnimationFrameSpinner.move[3] = $("#eventCharMoveRightSpinner").spinner({min: 1});

        // 썸네일용 span
        for(var i = 0; i < 8; i++)
        {
            eventSpriteSpan[i] = document.createElement('span');
            eventSpriteSpan[i].id = 'eventSpriteThumbnail' + i;
        }

        // 라디오버튼 설정
        $("#eventCharDirRadio").buttonset();

        // 드래그 영역 설정
        eventDropZone[0] = $('#Idle-Back-Event');
        eventDropZone[1] = $('#Idle-Front-Event');
        eventDropZone[2] = $('#Idle-Left-Event');
        eventDropZone[3] = $('#Idle-Right-Event');
        eventDropZone[4] = $('#Move-Back-Event');
        eventDropZone[5] = $('#Move-Front-Event');
        eventDropZone[6] = $('#Move-Left-Event');
        eventDropZone[7] = $('#Move-Right-Event');

        // 드래그 영역 이벤트 핸들러 등록
        registEventSpriteEventHandler(document.getElementById('Idle-Back-Event'));
        registEventSpriteEventHandler(document.getElementById('Idle-Front-Event'));
        registEventSpriteEventHandler(document.getElementById('Idle-Left-Event'));
        registEventSpriteEventHandler(document.getElementById('Idle-Right-Event'));
        registEventSpriteEventHandler(document.getElementById('Move-Back-Event'));
        registEventSpriteEventHandler(document.getElementById('Move-Front-Event'));
        registEventSpriteEventHandler(document.getElementById('Move-Left-Event'));
        registEventSpriteEventHandler(document.getElementById('Move-Right-Event'));

        // 일러스트 영역 이벤트 핸들러 등록
        var illustDropZone = document.getElementById('illustDropZone');
        illustDropZone.addEventListener('dragover', HandleDragOver, false);
        illustDropZone.addEventListener('drop', illustHandleFileSelect, false);
        illustDropZone.addEventListener('dragleave', HandleDragLeave, false);

        // 웹소켓 핸들러 등록
        WebSocketConnector.socket.on('eventSpriteUploadComplete', function(spriteData)
        {
            var sprite = JSON.parse(spriteData);
            eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload." + sprite.animationType + "[" + sprite.dirNumber + "] = true");
            eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext." + sprite.animationType + "[" + sprite.dirNumber + "]" + "= sprite.ext");
            eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.frameWidth." + sprite.animationType + "[" + sprite.dirNumber + "]" + "= sprite.width");
            eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.frameHeight." + sprite.animationType + "[" + sprite.dirNumber + "]" + "= sprite.height");

            var info =
            {
                sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
                id: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].id,
                sprite: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite
            }
            WebSocketConnector.socket.emit('eventSpriteInfoUpdate', JSON.stringify(info));

            // 용량 갱신
            WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
            alert("스프라이트 이미지 업로드가 완료되었습니다.");

            // 업로드 이미지 초기화
            eventSpriteDropZoneInit();
        });
        WebSocketConnector.socket.on('illustUploadComplete', function(data)
        {
            var illust = JSON.parse(data);
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.illust = true;
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.illust = illust.ext;
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.frameWidth.illust = illust.width;
            sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.frameHeight.illust = illust.height;

            var info =
            {
                sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
                id: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].id,
                sprite: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite
            }
            WebSocketConnector.socket.emit('eventIllustInfoUpdate', JSON.stringify(info));

            // 용량 갱신
            WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
            alert("일러스트 이미지 업로드가 완료되었습니다.");

            // 업로드 이미지 초기화
            eventSpriteDropZoneInit();
        });

        // 버튼 처리
        $("#createEventCharButton").click(
            function()
            {
                if ($("#eventCharNameTextbox").val() == "")
                {
                    alert("캐릭터 이름을 입력해야 합니다.");
                    return;
                }

                // 캐릭터명 중복 체크
                for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].eventObjects[i].name == $("#eventCharNameTextbox").val())
                    {
                        alert("같은 캐릭터명이 존재합니다.");
                        return;
                    }
                }

                // 새로운 ID 만들기
                var maxId = 0;
                for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].eventObjects[i].id > maxId)
                    {
                        maxId = sceneList[focusedTabSceneIndex].eventObjects[i].id;
                    }
                }
                maxId++;

                var info =
                {
                    sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
                    id: maxId,
                    name: $("#eventCharNameTextbox").val()
                };
                WebSocketConnector.socket.emit('createEventChar', JSON.stringify(info));
                WebSocketConnector.socket.on('responseEventNewChar', function(char)
                {
                    sceneList[focusedTabSceneIndex].eventObjects.push(JSON.parse(char));
                });

                // 콤보박스에 추가
                $("<option>" + info.name + "</option>").appendTo("#nonPositionEventCharCombo");
                $("#eventCharNameTextbox").val("");

                alert("캐릭터가 생성되었습니다. 아래 콤보박스를 이용해 캐릭터를 설정해주세요.");
            }
        );

        $("#nonPosEventCharEditButton").click(
            function()
            {
                var charName = $("#nonPositionEventCharCombo option:selected").text();
                if (charName == '미배치 캐릭터')
                {
                    alert("미배치 캐릭터를 콤보박스에서 선택하세요.");
                    return;
                }

                for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].eventObjects[i].name == charName && sceneList[focusedTabSceneIndex].eventObjects[i].Node.length == 0)
                    {
                        eventInspectorInput(sceneList[focusedTabSceneIndex].eventObjects[i].id);
                    }
                }
            }
        );

        $("#eventCharEditButton").button().click(
            function()
            {
                if (currentEventCharIndex == -1)
                {
                    alert("수정할 캐릭터가 선택되지 않았습니다.");
                    return;
                }

                if (eventCharXSpinner.spinner("value") == -1 || eventCharYSpinner.spinner("value") == -1 ||
                    eventCharXSpinner.spinner("value") == null || eventCharYSpinner.spinner("value") == null)
                {
                    alert("좌표를 설정하여주세요.");
                    return;
                }

                if ($("#eventCharNameChangeTextbox").val() == "")
                {
                    alert("캐릭터 이름이 입력되지 않았습니다.");
                    return;
                }

                var flag = true;
                for(var i = 0; i < 4; i++)
                {
                    if (eventCharAnimationFrameSpinner.idle[i].spinner("value") == 0 ||eventCharAnimationFrameSpinner.idle[i].spinner("value") == null)
                    {
                        flag = false;
                        break;
                    }
                    if (eventCharAnimationFrameSpinner.move[i].spinner("value") == 0 ||eventCharAnimationFrameSpinner.move[i].spinner("value") == null)
                    {
                        flag = false;
                        break;
                    }
                }
                if (flag == false)
                {
                    alert("프레임 수가 입력되지 않은 곳이 있습니다.");
                    return;
                }

                flag = true;
                for(var i = 0; i < 4; i++)
                {
                    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.idle[i] == false)
                    {
                        flag = false;
                        break;
                    }
                    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.move[i] == false)
                    {
                        flag = false;
                        break;
                    }
                }
                if (flag == false)
                {
                    alert("스프라이트 이미지가 업로드되지 않은 곳이 있습니다.");
                    return;
                }
                if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.illust == false)
                {
                    alert("일러스트 이미지가 업로드되지 않았습니다.");
                    return;
                }

                // 로컬 데이터 수정하기
                sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name = $("#eventCharNameChangeTextbox").val();
                sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].Node[0] =
                    {
                        x: eventCharXSpinner.spinner("value"),
                        y: eventCharYSpinner.spinner("value"),
                        visible: true,
                        time: 0,
                        direction: Number($(':radio[name="eventDirRadio"]:checked').val()),
                        speak: ""
                    }
                for(var i = 0; i < 4; i++)
                {
                    sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.frameCount.idle[i] = eventCharAnimationFrameSpinner.idle[i].spinner("value");
                    sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.frameCount.move[i] = eventCharAnimationFrameSpinner.move[i].spinner("value");
                }

                // 로컬에 적용
                makeEventObject($("#eventCharNameChangeTextbox").val(), 0);

                // 웹소켓으로 보내서 적용
                var info =
                {
                    sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
                    char: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex]
                }
                WebSocketConnector.socket.emit('eventCharEdit', JSON.stringify(info));

                eventInspectorInit();
                refreshNonRocateEventChar();

                // 타임라인 재적용
                LoadTimelineInfo();

                alert("캐릭터가 수정되었습니다.");
            }
        );

        $("#eventCharDeleteButton").button().click(
            function()
            {
                if (currentEventCharIndex == -1)
                {
                    alert("삭제할 캐릭터가 선택되지 않았습니다.");
                    return;
                }

                // 웹소켓 보내서 적용
                var info =
                {
                    sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
                    charName: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
                }
                WebSocketConnector.socket.emit('eventCharDelete', JSON.stringify(info));

                // 로컬에서 제거
                sceneList[focusedTabSceneIndex].eventObjects.splice(currentEventCharIndex, 1);

                // 로컬에 적용
                makeEventObject("", 0);

                eventInspectorInit();
                refreshNonRocateEventChar();

                // 타임라인 재적용
                LoadTimelineInfo();

                alert("캐릭터가 삭제되었습니다.");
            }
        );

        $("#illustDeleteButton").click(
            function()
            {
                if (focusedTabSceneIndex != -1 && currentEventCharIndex != -1 && sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.illust)
                {
                    // 로컬 적용
                    sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.illust = false;
                    var info =
                    {
                        sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
                        charName: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name,
                        ext: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.illust,
                        sprite: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite
                    };
                    WebSocketConnector.socket.emit('deleteEventIllust', JSON.stringify(info));
                    alert("삭제되었습니다.");

                    // 용량 갱신
                    WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");

                    // 업로드 이미지 초기화
                    eventSpriteDropZoneInit();
                }
                else
                {
                    alert("삭제할 내용이 없습니다.");
                }
            }
        );

        // 스프라이트 삭제
        $("#Idle-0-EventDeleteButton").click(eventDeleteSprite);
        $("#Idle-1-EventDeleteButton").click(eventDeleteSprite);
        $("#Idle-2-EventDeleteButton").click(eventDeleteSprite);
        $("#Idle-3-EventDeleteButton").click(eventDeleteSprite);
        $("#Move-0-EventDeleteButton").click(eventDeleteSprite);
        $("#Move-1-EventDeleteButton").click(eventDeleteSprite);
        $("#Move-2-EventDeleteButton").click(eventDeleteSprite);
        $("#Move-3-EventDeleteButton").click(eventDeleteSprite);
        $("#Attack-0-EventDeleteButton").click(eventDeleteSprite);
        $("#Attack-1-EventDeleteButton").click(eventDeleteSprite);
        $("#Attack-2-EventDeleteButton").click(eventDeleteSprite);
        $("#Attack-3-EventDeleteButton").click(eventDeleteSprite);
        $("#Hit-0-EventDeleteButton").click(eventDeleteSprite);
        $("#Hit-1-EventDeleteButton").click(eventDeleteSprite);
        $("#Hit-2-EventDeleteButton").click(eventDeleteSprite);
        $("#Hit-3-EventDeleteButton").click(eventDeleteSprite);
    }
);