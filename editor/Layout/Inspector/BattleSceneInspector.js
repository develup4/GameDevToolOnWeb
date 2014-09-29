// DOM 객체 관련
var battleCharXSpinner;
var battleCharYSpinner;
var battleCharStatusSpinner = [];
var battleCharAnimationFrameSpinner =
{
    idle:   [Object],
    move:   [Object],
    attack: [Object],
    hit:    [Object]
};
var battleDropZone = [];
var battleSpriteSpan = [];

// 선택된 캐릭터 인덱스
var currentBattleCharIndex = -1;

$(document).ready(
    function()
    {
        // 스피너 설정
        battleCharXSpinner = $("#battleCharXSpinner").spinner({min: -1});
        battleCharYSpinner = $("#battleCharYSpinner").spinner({min: -1});
        battleCharStatusSpinner[0] = $("#battleCharHPSpinner").spinner({min: 0});
        battleCharStatusSpinner[1] = $("#battleCharMPSpinner").spinner({min: 0});
        battleCharStatusSpinner[2] = $("#battleCharSTRSpinner").spinner({min: 0});
        battleCharStatusSpinner[3] = $("#battleCharDEXSpinner").spinner({min: 0});
        battleCharStatusSpinner[4] = $("#battleCharDEFSpinner").spinner({min: 0});
        battleCharAnimationFrameSpinner.idle[0] = $("#battleCharIdleUpSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.idle[1] = $("#battleCharIdleDownSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.idle[2] = $("#battleCharIdleLeftSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.idle[3] = $("#battleCharIdleRightSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.move[0] = $("#battleCharMoveUpSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.move[1] = $("#battleCharMoveDownSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.move[2] = $("#battleCharMoveLeftSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.move[3] = $("#battleCharMoveRightSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.attack[0] = $("#battleCharAttackUpSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.attack[1] = $("#battleCharAttackDownSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.attack[2] = $("#battleCharAttackLeftSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.attack[3] = $("#battleCharAttackRightSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.hit[0] = $("#battleCharHitUpSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.hit[1] = $("#battleCharHitDownSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.hit[2] = $("#battleCharHitLeftSpinner").spinner({min: 1});
        battleCharAnimationFrameSpinner.hit[3] = $("#battleCharHitRightSpinner").spinner({min: 1});

        // 썸네일용 span
        for(var i = 0; i < 16; i++)
        {
            battleSpriteSpan[i] = document.createElement('span');
            battleSpriteSpan[i].id = 'spriteThumbnail' + i;
        }

        // 라디오버튼 설정
        $("#battleCharDirRadio").buttonset();

        // 체크박스 설정
        $("#isEnemyCheckbox").button();

        // 드래그 영역 설정
        battleDropZone[0] = $('#Idle-Back-Battle');
        battleDropZone[1] = $('#Idle-Front-Battle');
        battleDropZone[2] = $('#Idle-Left-Battle');
        battleDropZone[3] = $('#Idle-Right-Battle');
        battleDropZone[4] = $('#Move-Back-Battle');
        battleDropZone[5] = $('#Move-Front-Battle');
        battleDropZone[6] = $('#Move-Left-Battle');
        battleDropZone[7] = $('#Move-Right-Battle');
        battleDropZone[8] = $('#Attack-Back-Battle');
        battleDropZone[9] = $('#Attack-Front-Battle');
        battleDropZone[10] = $('#Attack-Left-Battle');
        battleDropZone[11] = $('#Attack-Right-Battle');
        battleDropZone[12] = $('#Hit-Back-Battle');
        battleDropZone[13] = $('#Hit-Front-Battle');
        battleDropZone[14] = $('#Hit-Left-Battle');
        battleDropZone[15] = $('#Hit-Right-Battle');

        // 드래그 영역 이벤트 핸들러 등록
        registSpriteEventHandler(document.getElementById('Idle-Back-Battle'));
        registSpriteEventHandler(document.getElementById('Idle-Front-Battle'));
        registSpriteEventHandler(document.getElementById('Idle-Left-Battle'));
        registSpriteEventHandler(document.getElementById('Idle-Right-Battle'));
        registSpriteEventHandler(document.getElementById('Move-Back-Battle'));
        registSpriteEventHandler(document.getElementById('Move-Front-Battle'));
        registSpriteEventHandler(document.getElementById('Move-Left-Battle'));
        registSpriteEventHandler(document.getElementById('Move-Right-Battle'));
        registSpriteEventHandler(document.getElementById('Attack-Back-Battle'));
        registSpriteEventHandler(document.getElementById('Attack-Front-Battle'));
        registSpriteEventHandler(document.getElementById('Attack-Left-Battle'));
        registSpriteEventHandler(document.getElementById('Attack-Right-Battle'));
        registSpriteEventHandler(document.getElementById('Hit-Back-Battle'));
        registSpriteEventHandler(document.getElementById('Hit-Front-Battle'));
        registSpriteEventHandler(document.getElementById('Hit-Left-Battle'));
        registSpriteEventHandler(document.getElementById('Hit-Right-Battle'));

        // 웹소켓 핸들러 등록
        WebSocketConnector.socket.on('battleSpriteUploadComplete', function(spriteData)
        {
            var sprite = JSON.parse(spriteData);
            eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload." + sprite.animationType + "[" + sprite.dirNumber + "] = true");
            eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.ext." + sprite.animationType + "[" + sprite.dirNumber + "]" + "= sprite.ext");
            eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.frameWidth." + sprite.animationType + "[" + sprite.dirNumber + "]" + "= sprite.width");
            eval("sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.frameHeight." + sprite.animationType + "[" + sprite.dirNumber + "]" + "= sprite.height");

            var info =
            {
                sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
                id: sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].id,
                sprite: sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite
            }
            WebSocketConnector.socket.emit('battleSpriteInfoUpdate', JSON.stringify(info));

            // 용량 갱신
            WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
            alert("스프라이트 이미지 업로드가 완료되었습니다.");

            // 업로드 이미지 초기화
            spriteDropZoneInit();
        });

        // 버튼 처리
        $("#createCharButton").click(
            function()
            {
                if ($("#battleCharNameTextbox").val() == "")
                {
                    alert("캐릭터 이름을 입력해야 합니다.");
                    return;
                }

                // 캐릭터명 중복 체크
                for(var i = 0; i < sceneList[focusedTabSceneIndex].battleObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].battleObjects[i].name == $("#battleCharNameTextbox").val())
                    {
                        alert("같은 캐릭터명이 존재합니다.");
                        return;
                    }
                }

                // 새로운 ID 만들기
                var maxId = 0;
                for(var i = 0; i < sceneList[focusedTabSceneIndex].battleObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].battleObjects[i].id > maxId)
                    {
                        maxId = sceneList[focusedTabSceneIndex].battleObjects[i].id;
                    }
                }
                maxId++;

                var info =
                {
                    sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
                    id: maxId,
                    name: $("#battleCharNameTextbox").val()
                };
                WebSocketConnector.socket.emit('createBattleChar', JSON.stringify(info));
                WebSocketConnector.socket.on('responseNewChar', function(char)
                {
                    sceneList[focusedTabSceneIndex].battleObjects.push(JSON.parse(char));
                });

                // 콤보박스에 추가
                $("<option>" + info.name + "</option>").appendTo("#nonPositionCharCombo");
                $("#battleCharNameTextbox").val("");

                alert("캐릭터가 생성되었습니다. 아래 콤보박스를 이용해 캐릭터를 설정해주세요.");
            }
        );

        $("#nonPosCharEditButton").click(
            function()
            {
                var charName = $("#nonPositionCharCombo option:selected").text();
                if (charName == '미배치 캐릭터')
                {
                    alert("미배치 캐릭터를 콤보박스에서 선택하세요.");
                    return;
                }

                for(var i = 0; i < sceneList[focusedTabSceneIndex].battleObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].battleObjects[i].name == charName && sceneList[focusedTabSceneIndex].battleObjects[i].position.x == -1)
                    {
                        battleInspectorInput(sceneList[focusedTabSceneIndex].battleObjects[i].id);
                    }
                }
            }
        );

        $("#battleCharEditButton").button().click(
            function()
            {
                if (currentBattleCharIndex == -1)
                {
                    alert("수정할 캐릭터가 선택되지 않았습니다.");
                    return;
                }

                if (battleCharXSpinner.spinner("value") == -1 || battleCharYSpinner.spinner("value") == -1 ||
                    battleCharXSpinner.spinner("value") == null || battleCharYSpinner.spinner("value") == null)
                {
                    alert("좌표를 설정하여주세요.");
                    return;
                }

                if ($("#battleCharNameChangeTextbox").val() == "")
                {
                    alert("캐릭터 이름이 입력되지 않았습니다.");
                    return;
                }

                for (var i = 0; i < 5; i++)
                {
                    if (battleCharStatusSpinner[i].spinner("value") == 0 || battleCharStatusSpinner[i].spinner("value") == null)
                    {
                        alert("스테이터스가 다 입력되지 않았습니다.");
                        return;
                    }
                }

                var flag = true;
                for(var i = 0; i < 4; i++)
                {
                    if (battleCharAnimationFrameSpinner.idle[i].spinner("value") == 0 ||battleCharAnimationFrameSpinner.idle[i].spinner("value") == null)
                    {
                        flag = false;
                        break;
                    }
                    if (battleCharAnimationFrameSpinner.move[i].spinner("value") == 0 ||battleCharAnimationFrameSpinner.move[i].spinner("value") == null)
                    {
                        flag = false;
                        break;
                    }
                    if (battleCharAnimationFrameSpinner.attack[i].spinner("value") == 0 ||battleCharAnimationFrameSpinner.attack[i].spinner("value") == null)
                    {
                        flag = false;
                        break;
                    }
                    if (battleCharAnimationFrameSpinner.hit[i].spinner("value") == 0 ||battleCharAnimationFrameSpinner.hit[i].spinner("value") == null)
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
                    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.idle[i] == false)
                    {
                        flag = false;
                        break;
                    }
                    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.move[i] == false)
                    {
                        flag = false;
                        break;
                    }
                    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.attack[i] == false)
                    {
                        flag = false;
                        break;
                    }
                    if (sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.isSpriteUpload.hit[i] == false)
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

                // 로컬 데이터 수정하기
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name = $("#battleCharNameChangeTextbox").val();
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].position.x = battleCharXSpinner.spinner("value");
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].position.y = battleCharYSpinner.spinner("value");
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].direction = Number($(':radio[name="battleDirRadio"]:checked').val());
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].isEnemy = $("#isEnemyCheckbox")[0].checked;
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].status.hp = battleCharStatusSpinner[0].spinner("value");
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].status.mp = battleCharStatusSpinner[1].spinner("value");
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].status.str = battleCharStatusSpinner[2].spinner("value");
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].status.dex = battleCharStatusSpinner[3].spinner("value");
                sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].status.def = battleCharStatusSpinner[4].spinner("value");
                for(var i = 0; i < 4; i++)
                {
                    sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.frameCount.idle[i] = battleCharAnimationFrameSpinner.idle[i].spinner("value");
                    sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.frameCount.move[i] = battleCharAnimationFrameSpinner.move[i].spinner("value");
                    sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.frameCount.attack[i] = battleCharAnimationFrameSpinner.attack[i].spinner("value");
                    sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].sprite.frameCount.hit[i] = battleCharAnimationFrameSpinner.hit[i].spinner("value");
                }

                // 로컬에 적용
                characterDataChange();

                // 웹소켓으로 보내서 적용
                var info =
                {
                    sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
                    char: sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex]
                }
                WebSocketConnector.socket.emit('battleCharEdit', JSON.stringify(info));

                battleInspectorInit();
                refreshNonRocateBattleChar();

                alert("캐릭터가 수정되었습니다.");
            }
        );

        $("#battleCharDeleteButton").button().click(
            function()
            {
                if (currentBattleCharIndex == -1)
                {
                    alert("삭제할 캐릭터가 선택되지 않았습니다.");
                    return;
                }

                // 웹소켓 보내서 적용
                var info =
                {
                    sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
                    charName: sceneList[focusedTabSceneIndex].battleObjects[currentBattleCharIndex].name
                }
                WebSocketConnector.socket.emit('battleCharDelete', JSON.stringify(info));

                // 로컬에서 제거
                sceneList[focusedTabSceneIndex].battleObjects.splice(currentBattleCharIndex, 1);

                // 로컬에 적용
                characterDataChange();

                battleInspectorInit();
                refreshNonRocateBattleChar();

                alert("캐릭터가 삭제되었습니다.");
            }
        );

        // 스프라이트 삭제
        $("#Idle-0-BattleDeleteButton").click(deleteSprite);
        $("#Idle-1-BattleDeleteButton").click(deleteSprite);
        $("#Idle-2-BattleDeleteButton").click(deleteSprite);
        $("#Idle-3-BattleDeleteButton").click(deleteSprite);
        $("#Move-0-BattleDeleteButton").click(deleteSprite);
        $("#Move-1-BattleDeleteButton").click(deleteSprite);
        $("#Move-2-BattleDeleteButton").click(deleteSprite);
        $("#Move-3-BattleDeleteButton").click(deleteSprite);
        $("#Attack-0-BattleDeleteButton").click(deleteSprite);
        $("#Attack-1-BattleDeleteButton").click(deleteSprite);
        $("#Attack-2-BattleDeleteButton").click(deleteSprite);
        $("#Attack-3-BattleDeleteButton").click(deleteSprite);
        $("#Hit-0-BattleDeleteButton").click(deleteSprite);
        $("#Hit-1-BattleDeleteButton").click(deleteSprite);
        $("#Hit-2-BattleDeleteButton").click(deleteSprite);
        $("#Hit-3-BattleDeleteButton").click(deleteSprite);
    }
);