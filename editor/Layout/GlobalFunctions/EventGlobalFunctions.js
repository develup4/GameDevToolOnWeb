// 배틀씬 인스펙터 리프레쉬
function eventInspectorInit()
{
    $("#eventCharNameChangeTextbox").val("");
    eventCharXSpinner.spinner("value", "");
    eventCharYSpinner.spinner("value", "");
    for(var i = 0; i < 4; i++)
    {
        eventCharAnimationFrameSpinner.idle[i].spinner("value", "");
        eventCharAnimationFrameSpinner.move[i].spinner("value", "");
    }

    // 업로드된 이미지 초기화
    currentEventCharIndex = -1;
    eventSpriteDropZoneInit();
}

// 캐릭터 선택시 인스펙터창에 정보 입력
function eventInspectorInput(charID)
{
    eventInspectorInit();

    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[i].id == charID)
        {
            currentEventCharIndex = i;

            $("#eventCharNameChangeTextbox").val(sceneList[focusedTabSceneIndex].eventObjects[i].name);
            /*$("#eventCharDirRadio1")[0].checked = false;
            $("#eventCharDirRadio2")[0].checked = false;
            $("#eventCharDirRadio3")[0].checked = false;
            $("#eventCharDirRadio4")[0].checked = false;*/

            if (sceneList[focusedTabSceneIndex].eventObjects[i].Node.length > 0)
            {
                eventCharXSpinner.spinner("value", sceneList[focusedTabSceneIndex].eventObjects[i].Node[0].x);
                eventCharYSpinner.spinner("value", sceneList[focusedTabSceneIndex].eventObjects[i].Node[0].y);

                /*if (sceneList[focusedTabSceneIndex].eventObjects[i].Node[0].direction == 0)
                {
                    $("#eventCharDirRadio1")[0].checked = true;
                }
                if (sceneList[focusedTabSceneIndex].eventObjects[i].Node[0].direction == 1)
                {
                    $("eventCharDirRadio2")[0].checked = true;
                }
                if (sceneList[focusedTabSceneIndex].eventObjects[i].Node[0].direction == 2)
                {
                    $("#eventCharDirRadio3")[0].checked = true;
                }
                if (sceneList[focusedTabSceneIndex].eventObjects[i].Node[0].direction == 3)
                {
                    $("#eventCharDirRadio4")[0].checked = true;
                }*/
            }
            else
            {
                eventCharXSpinner.spinner("value", 0);
                eventCharYSpinner.spinner("value", 0);
            }
/*
            $("#eventCharDirRadio1").button("refresh");
            $("#eventCharDirRadio2").button("refresh");
            $("#eventCharDirRadio3").button("refresh");
            $("#eventCharDirRadio4").button("refresh");
*/
            for(var j = 0; j < 4; j++)
            {
                if (sceneList[focusedTabSceneIndex].eventObjects[i].sprite.isSpriteUpload.idle[j])
                {
                    eventCharAnimationFrameSpinner.idle[j].spinner("value", sceneList[focusedTabSceneIndex].eventObjects[i].sprite.frameCount.idle[j]);
                }
                if (sceneList[focusedTabSceneIndex].eventObjects[i].sprite.isSpriteUpload.move[j])
                {
                    eventCharAnimationFrameSpinner.move[j].spinner("value", sceneList[focusedTabSceneIndex].eventObjects[i].sprite.frameCount.move[j]);
                }
            }

            // 업로드 이미지 초기화
            eventSpriteDropZoneInit();
        }
    }
}

// 스프라이트 썸네일 초기화
function eventSpriteDropZoneInit()
{
    for(var i = 0; i < 8; i++)
    {
        $("#eventSpriteThumbnail" + i).replaceWith(null, null);
        eventDropZone[i].css('padding', 20);
        (eventDropZone[i])[0].innerText = "Drop sprite image here";
    }
    $("#illustThumbnail").replaceWith(null, null);
    $("#illustDropZone").css('padding', 140);
    ($("#illustDropZone"))[0].innerText = "Drop illust image here";

    if (focusedTabSceneIndex == -1 || currentEventCharIndex == -1)
    {
        return;
    }

    // 배경 업로드 여부
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.idle[0])
    {
        (eventDropZone[0])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/IdleBack." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.idle[0] +'">';
        eventSpriteSpan[0].innerHTML = str;
        eventDropZone[0].append(eventSpriteSpan[0], null);
        eventDropZone[0].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.idle[1])
    {
        (eventDropZone[1])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/IdleFront." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.idle[1] +'">';
        eventSpriteSpan[1].innerHTML = str;
        eventDropZone[1].append(eventSpriteSpan[1], null);
        eventDropZone[1].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.idle[2])
    {
        (eventDropZone[2])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/IdleLeft." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.idle[2] +'">';
        eventSpriteSpan[2].innerHTML = str;
        eventDropZone[2].append(eventSpriteSpan[2], null);
        eventDropZone[2].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.idle[3])
    {
        (eventDropZone[3])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/IdleRight." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.idle[3] +'">';
        eventSpriteSpan[3].innerHTML = str;
        eventDropZone[3].append(eventSpriteSpan[3], null);
        eventDropZone[3].css('padding', 0);
    }

    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.move[0])
    {
        (eventDropZone[4])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/MoveBack." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.move[0] +'">';
        eventSpriteSpan[4].innerHTML = str;
        eventDropZone[4].append(eventSpriteSpan[4], null);
        eventDropZone[4].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.move[1])
    {
        (eventDropZone[5])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/MoveFront." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.move[1] +'">';
        eventSpriteSpan[5].innerHTML = str;
        eventDropZone[5].append(eventSpriteSpan[5], null);
        eventDropZone[5].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.move[2])
    {
        (eventDropZone[6])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/MoveLeft." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.move[2] +'">';
        eventSpriteSpan[6].innerHTML = str;
        eventDropZone[6].append(eventSpriteSpan[6], null);
        eventDropZone[6].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.move[3])
    {
        (eventDropZone[7])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/MoveRight." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.move[3] +'">';
        eventSpriteSpan[7].innerHTML = str;
        eventDropZone[7].append(eventSpriteSpan[7], null);
        eventDropZone[7].css('padding', 0);
    }

    // 일러스트 이미지
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.illust)
    {
        ($("#illustDropZone"))[0].innerText = "";
        var str = '<img class="illustThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name
            + "/Illust." + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext.illust + '">';
        illustSpan.innerHTML = str;
        $("#illustDropZone").append(illustSpan, null);
        $("#illustDropZone").css('padding', 0);
    }
}

// 스프라이트 제거 함수
function eventDeleteSprite()
{
    var button = this.id.split('-');

    if (focusedTabSceneIndex != -1 && currentEventCharIndex != -1 && eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload." + button[0].toLowerCase() + '[' + button[1] + ']'))
    {
        var fileName;
        switch(button[1])
        {
            case "0": fileName = 'Back'; break;
            case "1": fileName = 'Front'; break;
            case "2": fileName = 'Left'; break;
            case "3": fileName = 'Right'; break;
        }

        // 로컬 적용
        eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload." + button[0].toLowerCase() + '[' + button[1] + '] = false;');
        var info =
        {
            sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
            charName: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name,
            fileName: button[0] + fileName + "." + eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.ext." + button[0].toLowerCase() + '[' + button[1] + ']'),
            sprite: sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite
        };
        WebSocketConnector.socket.emit('deleteEventSprite', JSON.stringify(info));
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

// 미배치 캐릭터 콤보 갱신
function refreshNonRocateEventChar()
{
    var comboSize = $("#nonPositionEventCharCombo option").size();
    for (var i = 0; i < comboSize; i++)
    {
        $("#nonPositionEventCharCombo option:first").remove();
    }
    $("<option>미배치 캐릭터</option>").appendTo("#nonPositionEventCharCombo");

    for (var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[i].Node.length == 0)
        {
            $("<option>" + sceneList[focusedTabSceneIndex].eventObjects[i].name + "</option>").appendTo("#nonPositionEventCharCombo");
        }
    }
}

// 이벤트 캐릭터 스프라이트 업로드
function eventSpriteUploadHandle(data)
{
    data.stopPropagation();
    data.preventDefault();

    $("#" + data.currentTarget.id).css('background', '#F6F6F6');

    // 어떤애인지 체크
    var name = data.currentTarget.id.split('-');
    var animationType = name[0];
    var direction = name[1];
    var dirNumber;
    switch(direction)
    {
        case "Back": dirNumber = 0; break;
        case "Front": dirNumber = 1; break;
        case "Left": dirNumber = 2; break;
        case "Right": dirNumber = 3; break;
    }

    // 업로드 가능 체크
    if (currentEventCharIndex == -1)
    {
        alert("선택된 캐릭터가 없습니다.");
        return;
    }
    if (eval("sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload." + animationType.toLowerCase() + "[" + dirNumber + "]"))
    {
        alert("이미 업로드되어 있습니다.");
        return;
    }

    var files = data.dataTransfer.files;
    if (!files[0].type.match('image.*'))
    {
        return;
    }
    var reader = new FileReader();
    reader.onload = (function(theFile)
    {
        return function(e)
        {
            // 파일 전송
            var FILE = new Object();
            FILE.type = theFile.type;
            FILE.name = escape(theFile.name);
            FILE.src = e.target.result;

            var ext = theFile.name.split('.');
            FILE.path = "repo/demoProject/" + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name + "/" + name[0] + name[1] + "." + ext[1];

            WebSocketConnector.socket.emit('eventSpriteUpload', JSON.stringify({file: FILE, ext: ext[1], animationType: animationType.toLowerCase(), dirNumber: dirNumber}));
        };
    }
        )(files[0]);
    reader.readAsDataURL(files[0]);
}

// 일러스트 이미지 업로드
function illustHandleFileSelect(data)
{
    data.stopPropagation();
    data.preventDefault();

    $("#illustDropZone").css('background', '#F6F6F6');
    if (currentEventCharIndex == -1)
    {
        alert("선택된 캐릭터가 없습니다.");
        return;
    }
    if (sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].sprite.isSpriteUpload.illust)
    {
        alert("이미 업로드되어 있습니다.");
        return;
    }

    var files = data.dataTransfer.files;
    if (!files[0].type.match('image.*'))
    {
        return;
    }
    var reader = new FileReader();
    reader.onload = (function(theFile)
    {
        return function(e)
        {
            // 파일 전송
            var FILE = new Object();
            FILE.type = theFile.type;
            FILE.name = escape(theFile.name);
            FILE.src = e.target.result;

            var ext = theFile.name.split('.');
            FILE.path = "repo/demoProject/" + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].eventObjects[currentEventCharIndex].name + "/Illust." + ext[1];
            WebSocketConnector.socket.emit('eventIllustUpload', JSON.stringify({file: FILE, sceneNum: sceneList[currentSceneIndex].SceneNumber, ext: ext[1]}));
        };
    }
        )(files[0]);
    reader.readAsDataURL(files[0]);
}

// 스프라이트 드랍존 이벤트 핸들러 등록
function registEventSpriteEventHandler(dropzone)
{
    dropzone.addEventListener('dragover', HandleDragOver, false);
    dropzone.addEventListener('drop', eventSpriteUploadHandle, false);
    dropzone.addEventListener('dragleave', HandleDragLeave, false);
}