// DOM 객체 관련 변수
var tabs;
var tabCounter = 2;

// 썸네일용 span
var mapSpan = document.createElement('span');
mapSpan.id = 'mapThumbnail';
var bgmSpan = document.createElement('span');
bgmSpan.id = 'bgmThumbnail';

// 현재씬 번호 전역변수
var focusedTabSceneIndex = -1;
var currentSceneIndex = -1;

// 웹소켓 객체
var WebSocketConnector =
{
    socket : null,
    connection : 'http://211.189.19.197:9987'
};

$(document).ready(
    function()
    {
        // 웹소켓 연결
        WebSocketConnector.socket = io.connect(WebSocketConnector.connection);

        // 레이아웃 설정
        var editorLayout = $('body').layout({applyDefaultStyles: true});
        var nestedLayout = $("body > .ui-layout-center").layout({applyDefaultStyles: true, resizable: false});
        editorLayout.sizePane("south", 200);
        nestedLayout.sizePane("east", 420);
        nestedLayout.options.east.resizable = false;

        // 탭 설정
        tabs = $("#tabs").tabs({heightStyle: "fill"});
        tabs.find(".ui-tabs-nav").sortable(
            {
                axis: "x",
                stop: function () {
                    tabs.tabs("refresh");
                }
            }
        );
        tabs.on("tabsactivate", function(event, ui)
        {
            // 일단 모든 설정탭 비활성화
            tabsEast.tabs("disable", 0);
            tabsEast.tabs("disable", 1);
            tabsEast.tabs("disable", 2);
            tabsEast.tabs("disable", 3);

            // 현재 포커스된 씬 번호 기록
            var tabText = ui.newTab[0].textContent.split(' ');
            for(var i = 0; i < sceneList.length; i++)
            {
                if(sceneList[i].SceneName.getString() == tabText[1])
                {
                    focusedTabSceneIndex = i;
                    switch(sceneList[i].Type)
                    {
                        case 0: changeBattleScene(); break;
                        case 1: changeEventScene(); break;
                        case 2: changeWorldMapScene(); break;
                    }
                    break;
                }
            }

            var tabKind = ui.newTab[0].innerText.substr(1,1);
            if (tabKind == 'c')
            {
                tabsEast.tabs("enable", 0);
                tabsEast.tabs("option", "active",  0);
                focusedTabSceneIndex = -1;
            }
            else if (tabKind == 'B')
            {
                tabsEast.tabs("enable", 1);
                tabsEast.tabs("option", "active",  1);

                // 미배치 캐릭터 로드
                refreshNonRocateBattleChar();
            }
            else if (tabKind == 'E')
            {
                tabsEast.tabs("enable", 2);
                tabsEast.tabs("option", "active",  2);

                // 미배치 캐릭터 로드
                refreshNonRocateEventChar();

                // 타임라인 세팅
                LoadTimelineInfo();
            }
            else
            {
                tabsEast.tabs("enable", 3);
                tabsEast.tabs("option", "active",  3);

                // 미배치 도시 로드
                refreshNonRocateCity();
            }
            tabsEast.tabs("refresh");
        });

        // 동적 탭 제거버튼 처리
        var tabsEast = $("#tabs-east").tabs({heightStyle: "fill"});
        tabs.delegate("span.ui-icon-close", "click",
            function()
            {
                var panelId = $(this).closest("li").remove().attr("aria-controls");
                $("#" + panelId).remove();
                tabs.tabs("refresh");
                tabCounter--;

                var tabNumber = panelId.split('-');
                for(var i = 0; i < sceneList.length; i++)
                {
                    if(sceneList[i].tabNumber == tabNumber[1])
                    {
                        sceneList[i].tabNumber = -1;
                        break;
                    }
                }
            }
        );

        // Inspector 탭 세팅
        tabsEast.tabs("disable", 1);
        tabsEast.tabs("disable", 2);
        tabsEast.tabs("disable", 3);
        tabsEast.tabs("option", "active",  0);
        tabsEast.tabs("refresh");

        // 툴팁 처리
        $(document).tooltip({track: true});

        // 프로그레스바
        var progressLabel = $(".progress-label");
        var capacityProgressbar = $("#capacityProgressbar");
        var battleCapacityProgressbar = $("#battleCapacityProgressbar");
        var worldMapCapacityProgressbar = $("#worldMapCapacityProgressbar");
        var eventCapacityProgressbar = $("#eventCapacityProgressbar");
        capacityProgressbar.progressbar();
        battleCapacityProgressbar.progressbar();
        eventCapacityProgressbar.progressbar();
        worldMapCapacityProgressbar.progressbar();

        // 용량 얻어내기
        WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
        WebSocketConnector.socket.on('responseProjectCapacity', function(size)
        {
            progressLabel.text(size + "MB / 300MB");
            capacityProgressbar.progressbar("value", size / 300 * 100);
            battleCapacityProgressbar.progressbar("value", size / 300 * 100);
            worldMapCapacityProgressbar.progressbar("value", size / 300 * 100);
            eventCapacityProgressbar.progressbar("value", size / 300 * 100);

        });

        WebSocketConnector.socket.on('sceneDeleteComplete', function(size)
        {
            currentSceneIndex = -1;
            inspectorRefresh();
        });

        WebSocketConnector.socket.on('mapImageUploadComplete', function(data)
        {
            var size = JSON.parse(data);
            if (sceneList[currentSceneIndex].Type == 0)
            {
                for(var i = 0; i < size.width / 64 * size.height / 64; i++)
                {
                    sceneList[currentSceneIndex].battleMapMovable.push(false);
                }
            }
            sceneList[currentSceneIndex].mapSize.width = size.width;
            sceneList[currentSceneIndex].mapSize.height = size.height;
            sceneList[currentSceneIndex].isMapImageUpload = true;
            sceneList[currentSceneIndex].ext = size.ext;
            WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
            WebSocketConnector.socket.emit('renewMovable', JSON.stringify({movable: sceneList[currentSceneIndex].battleMapMovable, sceneNum: sceneList[currentSceneIndex].SceneNumber}));

            inspectorRefresh();
            alert("맵 이미지 업로드가 완료되었습니다.");
        });

        WebSocketConnector.socket.on('bgmUploadComplete', function()
        {
            WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");

            inspectorRefresh();
            alert("배경음악 업로드가 완료되었습니다.");
        });

        // 이벤트 핸들러 등록
        var mapDropZone = document.getElementById('mapImageDropZone');
        mapDropZone.addEventListener('dragover', HandleDragOver, false);
        mapDropZone.addEventListener('drop', mapHandleFileSelect, false);
        mapDropZone.addEventListener('dragleave', HandleDragLeave, false);

        var bgmDropZone = document.getElementById('bgmFileDropZone');
        bgmDropZone.addEventListener('dragover', HandleDragOver, false);
        bgmDropZone.addEventListener('drop', bgmHandleFileSelect, false);
        bgmDropZone.addEventListener('dragleave', HandleDragLeave, false);

        // 버튼 처리
        $("#sceneEditButton").button().click(
            function()
            {
                if (currentSceneIndex == -1)
                {
                    return;
                }
                if (sceneList[currentSceneIndex].isMapImageUpload == false)
                {
                    alert("배경 맵 이미지가 업로드되지 않았습니다.");
                    return;
                }
                if (sceneList[currentSceneIndex].isBGMUpload == false)
                {
                    alert("배경음악 파일이 업로드되지 않았습니다.");
                    return;
                }

                if(currentSceneIndex != -1 && sceneList[currentSceneIndex].tabNumber == -1)
                {
                    addTab(currentSceneIndex, sceneList[currentSceneIndex].Type);
                }
            }
        );

        $("#sceneNameEditButton").click(
            function()
            {
                if (currentSceneIndex != -1)
                {
                    var text = $("#sceneNameTextbox").val();
                    for(var i = 0; i < sceneList.length; i++)
                    {
                        if(sceneList[i].SceneName == text)
                        {
                            alert("동일한 씬 이름이 존재합니다.");
                            return;
                        }
                    }
                    var info =
                    {
                        id: sceneList[currentSceneIndex].SceneNumber,
                        oldName: sceneList[currentSceneIndex].SceneName.getString(),
                        newName: text
                    };
                    sceneList[currentSceneIndex].SceneName.setString(text);
                    WebSocketConnector.socket.emit('sceneNameChange', JSON.stringify(info));
                }
            }
        );

        $("#mapDeleteButton").click(
            function()
            {
                if (currentSceneIndex != -1 && sceneList[currentSceneIndex].isMapImageUpload)
                {
                    var info =
                    {
                        sceneName: sceneList[currentSceneIndex].SceneName.getString(),
                        ext: sceneList[currentSceneIndex].ext
                    };
                    WebSocketConnector.socket.emit('deleteMapImage', JSON.stringify(info));
                    sceneList[currentSceneIndex].isMapImageUpload = false;
                    alert("삭제되었습니다.");

                    // 썸네일 제거
                    $("#mapThumbnail").replaceWith(null, null);
                    $("#mapImageDropZone").css('padding', 100);
                    $("#mapImageDropZone")[0].innerText = "Drop image here";

                    // 용량 갱신
                    WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
                }
                else
                {
                    alert("삭제할 내용이 없습니다.");
                }
            }
        );

        $("#bgmDeleteButton").click(
            function()
            {
                if (currentSceneIndex != -1 && sceneList[currentSceneIndex].isBGMUpload)
                {
                    var info =
                    {
                        sceneName: sceneList[currentSceneIndex].SceneName.getString(),
                        ext: sceneList[currentSceneIndex].bgmExt
                    };
                    WebSocketConnector.socket.emit('deleteBGM', JSON.stringify(info));
                    sceneList[currentSceneIndex].isBGMUpload = false;
                    alert("삭제되었습니다.");

                    // 썸네일 제거
                    $("#bgmThumbnail").replaceWith(null, null);
                    $("#bgmFileDropZone").css('padding', 30);
                    $("#bgmFileDropZone")[0].innerText = "Drop sound here";

                    // 용량 갱신
                    WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
                }
                else
                {
                    alert("삭제할 내용이 없습니다.");
                }
            }
        );
    }
);