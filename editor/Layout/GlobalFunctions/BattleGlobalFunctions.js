// 배틀씬 인스펙터 리프레쉬
function battleInspectorInit()
{
    $("#battleCharNameChangeTextbox").val("");
    battleCharXSpinner.spinner("value", "");
    battleCharYSpinner.spinner("value", "");
    for(var i = 0; i < battleCharStatusSpinner.length; i++)
    {
        battleCharStatusSpinner[i].spinner("value", "");
    }
    for(var i = 0; i < 4; i++)
    {
        battleCharAnimationFrameSpinner.idle[i].spinner("value", "");
        battleCharAnimationFrameSpinner.move[i].spinner("value", "");
        battleCharAnimationFrameSpinner.attack[i].spinner("value", "");
        battleCharAnimationFrameSpinner.hit[i].spinner("value", "");
    }

    // 업로드된 이미지 초기화
    spriteDropZoneInit();
    currentBattleCharIndex = -1;
}

// 캐릭터 선택시 인스펙터창에 정보 입력
function battleInspectorInput(charID)
{
    battleInspectorInit();

    for(var i = 0; i < sceneList[focusedTabSceneIndex].battleObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].battleObjects[i].id == charID)
        {
            currentBattleCharIndex = i;

            $("#battleCharNameChangeTextbox").val(sceneList[focusedTabSceneIndex].battleObjects[i].name);
            battleCharXSpinner.spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].position.x);
            battleCharYSpinner.spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].position.y);

            battleCharStatusSpinner[0].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].status.hp);
            battleCharStatusSpinner[1].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].status.mp);
            battleCharStatusSpinner[2].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].status.str);
            battleCharStatusSpinner[3].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].status.dex);
            battleCharStatusSpinner[4].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].status.def);

            $("#battleCharDirRadio1")[0].checked = false;
            $("#battleCharDirRadio2")[0].checked = false;
            $("#battleCharDirRadio3")[0].checked = false;
            $("#battleCharDirRadio4")[0].checked = false;
            if (sceneList[focusedTabSceneIndex].battleObjects[i].direction == 0)
            {
                $("#battleCharDirRadio1")[0].checked = true;
            }
            if (sceneList[focusedTabSceneIndex].battleObjects[i].direction == 1)
            {
                $("#battleCharDirRadio2")[0].checked = true;
            }
            if (sceneList[focusedTabSceneIndex].battleObjects[i].direction == 2)
            {
                $("#battleCharDirRadio3")[0].checked = true;
            }
            if (sceneList[focusedTabSceneIndex].battleObjects[i].direction == 3)
            {
                $("#battleCharDirRadio4")[0].checked = true;
            }
            $("#battleCharDirRadio1").button("refresh");
            $("#battleCharDirRadio2").button("refresh");
            $("#battleCharDirRadio3").button("refresh");
            $("#battleCharDirRadio4").button("refresh");

            if (sceneList[focusedTabSceneIndex].battleObjects[i].isEnemy)
            {
                $("#isEnemyCheckbox")[0].checked = true;
            }
            else
            {
                $("#isEnemyCheckbox")[0].checked = false;
            }
            $("#isEnemyCheckbox").button("refresh");

            for(var j = 0; j < 4; j++)
            {
                if (sceneList[focusedTabSceneIndex].battleObjects[i].sprite.isSpriteUpload.idle[j])
                {
                    battleCharAnimationFrameSpinner.idle[j].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].sprite.frameCount.idle[j]);
                }
                if (sceneList[focusedTabSceneIndex].battleObjects[i].sprite.isSpriteUpload.move[j])
                {
                    battleCharAnimationFrameSpinner.move[j].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].sprite.frameCount.move[j]);
                }
                if (sceneList[focusedTabSceneIndex].battleObjects[i].sprite.isSpriteUpload.attack[j])
                {
                    battleCharAnimationFrameSpinner.attack[j].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].sprite.frameCount.attack[j]);
                }
                if (sceneList[focusedTabSceneIndex].battleObjects[i].sprite.isSpriteUpload.hit[j])
                {
                    battleCharAnimationFrameSpinner.hit[j].spinner("value", sceneList[focusedTabSceneIndex].battleObjects[i].sprite.frameCount.hit[j]);
                }
            }

            // 업로드 이미지 초기화
            spriteDropZoneInit();
        }
    }
}

// 스프라이트 썸네일 초기화
function spriteDropZoneInit()
{
    for(var i = 0; i < 16; i++)
    {
        $("#spriteThumbnail" + i).replaceWith(null, null);
        battleDropZone[i].css('padding', 20);
        (battleDropZone[i])[0].innerText = "Drop sprite image here";
    }

    if (focusedTabSceneIndex == -1 || currentBattleCharIndex == -1)
    {
        return;
    }

    // 배경 업로드 여부
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.idle[0])
    {
        (battleDropZone[0])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/IdleBack." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.idle[0] +'">';
        battleSpriteSpan[0].innerHTML = str;
        battleDropZone[0].append(battleSpriteSpan[0], null);
        battleDropZone[0].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.idle[1])
    {
        (battleDropZone[1])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/IdleFront." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.idle[1] +'">';
        battleSpriteSpan[1].innerHTML = str;
        battleDropZone[1].append(battleSpriteSpan[1], null);
        battleDropZone[1].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.idle[2])
    {
        (battleDropZone[2])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/IdleLeft." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.idle[2] +'">';
        battleSpriteSpan[2].innerHTML = str;
        battleDropZone[2].append(battleSpriteSpan[2], null);
        battleDropZone[2].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.idle[3])
    {
        (battleDropZone[3])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/IdleRight." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.idle[3] +'">';
        battleSpriteSpan[3].innerHTML = str;
        battleDropZone[3].append(battleSpriteSpan[3], null);
        battleDropZone[3].css('padding', 0);
    }

    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.move[0])
    {
        (battleDropZone[4])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/MoveBack." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.move[0] +'">';
        battleSpriteSpan[4].innerHTML = str;
        battleDropZone[4].append(battleSpriteSpan[4], null);
        battleDropZone[4].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.move[1])
    {
        (battleDropZone[5])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/MoveFront." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.move[1] +'">';
        battleSpriteSpan[5].innerHTML = str;
        battleDropZone[5].append(battleSpriteSpan[5], null);
        battleDropZone[5].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.move[2])
    {
        (battleDropZone[6])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/MoveLeft." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.move[2] +'">';
        battleSpriteSpan[6].innerHTML = str;
        battleDropZone[6].append(battleSpriteSpan[6], null);
        battleDropZone[6].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.move[3])
    {
        (battleDropZone[7])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/MoveRight." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.move[3] +'">';
        battleSpriteSpan[7].innerHTML = str;
        battleDropZone[7].append(battleSpriteSpan[7], null);
        battleDropZone[7].css('padding', 0);
    }

    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.attack[0])
    {
        (battleDropZone[8])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/AttackBack." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.attack[0] +'">';
        battleSpriteSpan[8].innerHTML = str;
        battleDropZone[8].append(battleSpriteSpan[8], null);
        battleDropZone[8].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.attack[1])
    {
        (battleDropZone[9])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/AttackFront." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.attack[1] +'">';
        battleSpriteSpan[9].innerHTML = str;
        battleDropZone[9].append(battleSpriteSpan[9], null);
        battleDropZone[9].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.attack[2])
    {
        (battleDropZone[10])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/AttackLeft." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.attack[2] +'">';
        battleSpriteSpan[10].innerHTML = str;
        battleDropZone[10].append(battleSpriteSpan[10], null);
        battleDropZone[10].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.attack[3])
    {
        (battleDropZone[11])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/AttackRight." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.attack[3] +'">';
        battleSpriteSpan[11].innerHTML = str;
        battleDropZone[11].append(battleSpriteSpan[11], null);
        battleDropZone[11].css('padding', 0);
    }

    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.hit[0])
    {
        (battleDropZone[12])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/HitBack." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.hit[0] +'">';
        battleSpriteSpan[12].innerHTML = str;
        battleDropZone[12].append(battleSpriteSpan[12], null);
        battleDropZone[12].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.hit[1])
    {
        (battleDropZone[13])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/HitFront." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.hit[1] +'">';
        battleSpriteSpan[13].innerHTML = str;
        battleDropZone[13].append(battleSpriteSpan[13], null);
        battleDropZone[13].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.hit[2])
    {
        (battleDropZone[14])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/HitLeft." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.hit[2] +'">';
        battleSpriteSpan[14].innerHTML = str;
        battleDropZone[14].append(battleSpriteSpan[14], null);
        battleDropZone[14].css('padding', 0);
    }
    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.hit[3])
    {
        (battleDropZone[15])[0].innerText = "";
        var str = '<img class="spriteThumbnail" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
            + "/HitRight." + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext.hit[3] +'">';
        battleSpriteSpan[15].innerHTML = str;
        battleDropZone[15].append(battleSpriteSpan[15], null);
        battleDropZone[15].css('padding', 0);
    }
}

// 스프라이트 제거 함수
function deleteSprite()
{
    var button = this.id.split('-');

    if (focusedTabSceneIndex != -1 && currentBattleCharIndex != -1 && eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload." + button[0].toLowerCase() + '[' + button[1] + ']'))
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
        eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload." + button[0].toLowerCase() + '[' + button[1] + '] = false;');
        var info =
        {
            sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
            charName: sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name,
            fileName: button[0] + fileName + "." + eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext." + button[0].toLowerCase() + '[' + button[1] + ']'),
            sprite: sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite
        };
        WebSocketConnector.socket.emit('deleteSprite', JSON.stringify(info));
        alert("삭제되었습니다.");

        // 용량 갱신
        WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");

        // 업로드 이미지 초기화
        spriteDropZoneInit();
    }
    else
    {
        alert("삭제할 내용이 없습니다.");
    }
}

// 미배치 캐릭터 콤보 갱신
function refreshNonRocateBattleChar()
{
    var comboSize = $("#nonPositionCharCombo option").size();
    for (var i = 0; i < comboSize; i++)
    {
        $("#nonPositionCharCombo option:first").remove();
    }
    $("<option>미배치 캐릭터</option>").appendTo("#nonPositionCharCombo");

    for (var i = 0; i < sceneList[focusedTabSceneIndex].battleObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].battleObjects[i].position.x == -1 && sceneList[focusedTabSceneIndex].battleObjects[i].position.y == -1)
        {
            $("<option>" + sceneList[focusedTabSceneIndex].battleObjects[i].name + "</option>").appendTo("#nonPositionCharCombo");
        }
    }
}

// 배틀캐릭터 스프라이트 업로드
function battleSpriteUploadHandle(data)
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
    if (currentBattleCharIndex == -1)
    {
        alert("선택된 캐릭터가 없습니다.");
        return;
    }
    if (eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload." + animationType.toLowerCase() + "[" + dirNumber + "]"))
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
            FILE.path = "repo/demoProject/" + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name + "/" + name[0] + name[1] + "." + ext[1];

            WebSocketConnector.socket.emit('battleSpriteUpload', JSON.stringify({file: FILE, ext: ext[1], animationType: animationType.toLowerCase(), dirNumber: dirNumber}));
        };
    }
        )(files[0]);
    reader.readAsDataURL(files[0]);
}

// 스프라이트 드랍존 이벤트 핸들러 등록
function registSpriteEventHandler(dropzone)
{
    dropzone.addEventListener('dragover', HandleDragOver, false);
    dropzone.addEventListener('drop', battleSpriteUploadHandle, false);
    dropzone.addEventListener('dragleave', HandleDragLeave, false);
}