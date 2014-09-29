// 월드맵 인스펙터탭 리프레쉬
function cityInspectorInit()
{
    $("#cityNameChangeTextbox").val("");
    cityXSpinner.spinner("value", "");
    cityYSpinner.spinner("value", "");

    var comboSize = $("#linkSceneCombo option").size();
    for (var i = 0; i < comboSize; i++)
    {
        $("#linkSceneCombo option:first").remove();
    }
    $("<option>진행가능한 씬 리스트</option>").appendTo("#linkSceneCombo");

    currentCityIndex = -1;
    cityThumbnailRefresh();
}

// 도시 썸네일 갱신
function cityThumbnailRefresh()
{
    if (currentCityIndex == -1)
    {
        $("#cityThumbnail").replaceWith(null, null);
        $("#cityImageDropZone").css('padding', 80);
        $("#cityImageDropZone")[0].innerText = "Drop city image here";

        return;
    }

    // 배경 업로드 여부
    if (sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].isImageUpload)
    {
        $("#cityImageDropZone")[0].innerText = "";
        var str = '<img class="cityThumb" src="../repo/demoProject/' + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/"
            + sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].name + "/city." + sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].ext +'">';
        citySpan.innerHTML = str;
        $("#cityImageDropZone").append(citySpan, null);
        $("#cityImageDropZone").css('padding', 0);
    }
    else
    {
        $("#cityThumbnail").replaceWith(null, null);
        $("#cityImageDropZone").css('padding', 80);
        $("#cityImageDropZone")[0].innerText = "Drop city image here";
    }
}

// 도시 선택시 인스펙터탭에 정보입력
function cityInspectorInput(cityID)
{
    cityInspectorInit();

    for(var i = 0; i < sceneList[focusedTabSceneIndex].worldMapObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].worldMapObjects[i].id == cityID)
        {
            currentCityIndex = i;

            $("#cityNameChangeTextbox").val(sceneList[focusedTabSceneIndex].worldMapObjects[i].name);
            cityXSpinner.spinner("value", sceneList[focusedTabSceneIndex].worldMapObjects[i].position.x);
            cityYSpinner.spinner("value", sceneList[focusedTabSceneIndex].worldMapObjects[i].position.y);
        }
    }

    // 진행가능 씬 콤보
    for (var i = 0; i < sceneList[focusedTabSceneIndex].NextScene.length; i++)
    {
        for (var j = 0; j < sceneList.length; j++)
        {
            if (sceneList[j].SceneNumber == sceneList[focusedTabSceneIndex].NextScene[i].SceneNumber)
            {
                $("<option>" + sceneList[j].SceneName.getString() + "</option>").appendTo("#linkSceneCombo");
            }
        }
    }

    cityThumbnailRefresh();
}

// 미배치 도시 콤보 갱신
function refreshNonRocateCity()
{
    var comboSize = $("#nonPositionCityCombo option").size();
    for (var i = 0; i < comboSize; i++)
    {
        $("#nonPositionCityCombo option:first").remove();
    }
    $("<option>미배치 도시</option>").appendTo("#nonPositionCityCombo");

    for (var i = 0; i < sceneList[focusedTabSceneIndex].worldMapObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].worldMapObjects[i].position.x == -1 && sceneList[focusedTabSceneIndex].worldMapObjects[i].position.y == -1)
        {
            $("<option>" + sceneList[focusedTabSceneIndex].worldMapObjects[i].name + "</option>").appendTo("#nonPositionCityCombo");
        }
    }
}

// 도시 이미지 업로드
function cityHandleFileSelect(data)
{
    data.stopPropagation();
    data.preventDefault();

    $("#cityImageDropZone").css('background', '#F6F6F6');
    if (currentCityIndex == -1)
    {
        alert("선택된 도시가 없습니다.");
        return;
    }
    if (sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].isImageUpload)
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
            FILE.path = "repo/demoProject/" + sceneList[focusedTabSceneIndex].SceneName.getString() + "/objects/" + sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].name + "/city." + ext[1];
            WebSocketConnector.socket.emit('cityFileUpload', JSON.stringify({file: FILE, sceneNum: sceneList[currentSceneIndex].SceneNumber, cityName: sceneList[focusedTabSceneIndex].worldMapObjects[currentCityIndex].name, ext: ext[1]}));
        };
    }
        )(files[0]);
    reader.readAsDataURL(files[0]);
}