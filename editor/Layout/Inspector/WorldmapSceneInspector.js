// DOM 객체 관련
var cityXSpinner;
var cityYSpinner;

// 선택된 도시 인덱스
var currentCityIndex = -1;

// 썸네일용 span
var citySpan = document.createElement('span');
citySpan.id = 'cityThumbnail';

$(document).ready(
    function()
    {
        // 스피너 설정
        cityXSpinner = $("#cityXSpinner").spinner({min: -1});
        cityYSpinner = $("#cityYSpinner").spinner({min: -1});

        // 웹소켓 리스너 등록
        WebSocketConnector.socket.on('cityImageUploadComplete', function(data)
        {
            var size = JSON.parse(data);
            sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].imageSize.width = size.width;
            sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].imageSize.height = size.height;
            sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].isImageUpload = true;
            sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].ext = size.ext;

            WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");

            // 썸네일 표시
            cityThumbnailRefresh();
            alert("도시 이미지 업로드가 완료되었습니다.");
        });

        // 이벤트 핸들러 등록
        var cityDropZone = document.getElementById('cityImageDropZone');
        cityDropZone.addEventListener('dragover', HandleDragOver, false);
        cityDropZone.addEventListener('drop', cityHandleFileSelect, false);
        cityDropZone.addEventListener('dragleave', HandleDragLeave, false);

        // 버튼 처리
        $("#createCityButton").click(
            function()
            {
                if ($("#cityNameTextbox").val() == "")
                {
                    alert("도시 이름을 입력해야 합니다.");
                    return;
                }

                // 캐릭터명 중복 체크
                for(var i = 0; i < sceneList[focusedTabSceneIndex].worldMapObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].worldMapObjects[i].name == $("#cityNameTextbox").val())
                    {
                        alert("같은 도시명이 존재합니다.");
                        return;
                    }
                }

                // 새로운 ID 만들기
                var maxId = 0;
                for(var i = 0; i < sceneList[focusedTabSceneIndex].worldMapObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].worldMapObjects[i].id > maxId)
                    {
                        maxId = sceneList[focusedTabSceneIndex].worldMapObjects[i].id;
                    }
                }
                maxId++;

                var info =
                {
                    sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
                    id: maxId,
                    name: $("#cityNameTextbox").val(),
                    nextScenes: sceneList[focusedTabSceneIndex].NextSceneNumber
                };
                WebSocketConnector.socket.emit('createCity', JSON.stringify(info));
                WebSocketConnector.socket.on('responseNewCity', function(city)
                {
                    sceneList[focusedTabSceneIndex].worldMapObjects.push(JSON.parse(city));
                });

                // 콤보박스에 추가
                $("<option>" + info.name + "</option>").appendTo("#nonPositionCityCombo");
                $("#cityNameTextbox").val("");

                alert("도시가 생성되었습니다. 아래 콤보박스를 이용해 도시를 설정해주세요.");
            }
        );

        $("#nonPosCityEditButton").click(
            function()
            {
                var cityName = $("#nonPositionCityCombo option:selected").text();
                if (cityName == '미배치 도시')
                {
                    alert("미배치 도시를 콤보박스에서 선택하세요.");
                    return;
                }

                for(var i = 0; i < sceneList[focusedTabSceneIndex].worldMapObjects.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].worldMapObjects[i].name == cityName && sceneList[focusedTabSceneIndex].worldMapObjects[i].position.x == -1)
                    {
                        cityInspectorInput(sceneList[focusedTabSceneIndex].worldMapObjects[i].id);
                    }
                }
            }
        );

        $("#cityImageDeleteButton").click(
            function()
            {
                if (focusedTabSceneIndex != -1 && currentCityIndex != -1 && sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].isImageUpload)
                {
                    var info =
                    {
                        sceneName: sceneList[currentSceneIndex].SceneName.getString(),
                        cityName: sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].name,
                        ext: sceneList[currentSceneIndex].worldMapObjects[currentCityIndex].ext
                    };
                    WebSocketConnector.socket.emit('deleteCityImage', JSON.stringify(info));
                    sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].isImageUpload = false;
                    alert("삭제되었습니다.");

                    // 썸네일 제거
                    $("#cityThumbnail").replaceWith(null, null);
                    $("#cityImageDropZone").css('padding', 80);
                    $("#cityImageDropZone")[0].innerText = "Drop city image here";

                    // 용량 갱신
                    WebSocketConnector.socket.emit('requestProjectCapacity', "demoProject");
                }
                else
                {
                    alert("삭제할 내용이 없습니다.");
                }
            }
        );

        $("#cityEditButton").button().click(
            function()
            {
                if (currentCityIndex == -1)
                {
                    alert("수정할 도시가 선택되지 않았습니다.");
                    return;
                }

                if (cityXSpinner.spinner("value") == -1 || cityYSpinner.spinner("value") == -1 ||
                    cityXSpinner.spinner("value") == null || cityYSpinner.spinner("value") == null)
                {
                    alert("좌표를 설정하여주세요.");
                    return;
                }

                if ($("#cityNameChangeTextbox").val() == "")
                {
                    alert("도시 이름이 입력되지 않았습니다.");
                    return;
                }
                if (sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].isImageUpload == false)
                {
                    alert("도시 이미지가 업로드되지 않았습니다.");
                    return;
                }
                if ($("#linkSceneCombo option:selected").text() == "진행가능한 씬 리스트")
                {
                    alert("진행할 씬이 선택되지 않았습니다.");
                    return;
                }

                // 로컬 데이터 수정하기
                sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].name = $("#cityNameChangeTextbox").val();
                sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].position.x = cityXSpinner.spinner("value");
                sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].position.y = cityYSpinner.spinner("value");

                for (var i = 0; i < sceneList[focusedTabSceneIndex].NextScene.length; i++)
                {
                    if (sceneList[focusedTabSceneIndex].NextScene[i].SceneName.getString() == $("#linkSceneCombo option:selected").text())
                    {
                        sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].nextSceneNumber = sceneList[focusedTabSceneIndex].NextScene[i].SceneNumber;
                    }
                }

                // 로컬에 적용
                worldMapDataChange();

                // 웹소켓으로 보내서 적용
                var info =
                {
                    sceneNum: sceneList[focusedTabSceneIndex].SceneNumber,
                    city: sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex]
                }
                WebSocketConnector.socket.emit('cityEdit', JSON.stringify(info));

                // 인스펙터 처
                cityInspectorInit();
                refreshNonRocateCity();

                alert("도시가 수정되었습니다.");
            }
        );

        $("#cityDeleteButton").button().click(
            function()
            {
                if (currentCityIndex == -1)
                {
                    alert("삭제할 도시가 선택되지 않았습니다.");
                    return;
                }

                // 웹소켓 보내서 적용
                var info =
                {
                    sceneName: sceneList[focusedTabSceneIndex].SceneName.getString(),
                    cityName: sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].name
                }
                WebSocketConnector.socket.emit('cityDelete', JSON.stringify(info));

                // 로컬에서 제거
                sceneList[focusedTabSceneIndex].worldMapObjects.splice(currentCityIndex, 1);

                // 로컬에 적용
                worldMapDataChange();

                // 인스펙터 처리
                cityInspectorInit()();
                refreshNonRocateCity();

                alert("도시가 삭제되었습니다.");
            }
        );
    }
);