// 탭 추가 함수
function addTab(index, kind)
{
    var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
    var name;
    if (kind == 0)
    {
        name = "[Battle] " + sceneList[index].SceneName.getString();
    }
    else if (kind == 1)
    {
        name = "[Event] " + sceneList[index].SceneName.getString();
    }
    else
    {
        name = "[WorldMap] " + sceneList[index].SceneName.getString();
    }
    var id = "tabs-" + tabCounter;
    var li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, name));
    tabs.find(".ui-tabs-nav").append(li);
    var canvasName = sceneList[index].SceneName.getString() + "Canvas";
    tabs.append("<div id='" + id + "'><canvas id='" + canvasName + "' width='1920' height=" + "'1080'" + "></canvas>");
    tabs.append("</div>");
    sceneList[index].tabNumber = tabCounter;
    tabs.tabs("refresh");
    tabCounter++;
}

// 포커스된 씬노드의 배열인덱스를 얻는 함수
function focusSceneNode(sceneNumber)
{
    for(var i = 0; i < sceneList.length; i++)
    {
        if(sceneList[i].SceneNumber == sceneNumber)
        {
            currentSceneIndex = i;
            break;
        }
    }
    inspectorRefresh();
}

// 씬 그래프 인스펙터 탭을 리프레쉬
function inspectorRefresh()
{
    if (currentSceneIndex == -1)
    {
        $("#sceneNameTextbox").val("");

        $("#mapThumbnail").replaceWith(null, null);
        $("#mapImageDropZone").css('padding', 100);
        $("#mapImageDropZone")[0].innerText = "Drop image here";

        $("#bgmThumbnail").replaceWith(null, null);
        $("#bgmFileDropZone").css('padding', 30);
        $("#bgmFileDropZone")[0].innerText = "Drop sound here";
    }

    $("#sceneNameTextbox").val(sceneList[currentSceneIndex].SceneName.getString());

    // 배경 업로드 여부
    if (sceneList[currentSceneIndex].isMapImageUpload)
    {
        $("#mapImageDropZone")[0].innerText = "";
        var str = '<img class="thumb" src="../repo/demoProject/' + sceneList[currentSceneIndex].SceneName.getString() + "/map/map." + sceneList[currentSceneIndex].ext +'">';
        mapSpan.innerHTML = str;
        $("#mapImageDropZone").append(mapSpan, null);
        $("#mapImageDropZone").css('padding', 0);
    }
    else
    {
        $("#mapThumbnail").replaceWith(null, null);
        $("#mapImageDropZone").css('padding', 100);
        $("#mapImageDropZone")[0].innerText = "Drop image here";
    }

    // 배경음악 업로드 여부
    if (sceneList[currentSceneIndex].isBGMUpload)
    {
        $("#bgmFileDropZone")[0].innerText = "";
        bgmSpan.innerHTML = '<img class="soundThumb"' + ' src="../repo/default/sound.png">';
        $("#bgmFileDropZone").append(bgmSpan, null);
        $("#bgmFileDropZone").css('padding', 0);
    }
    else
    {
        $("#bgmThumbnail").replaceWith(null, null);
        $("#bgmFileDropZone").css('padding', 30);
        $("#bgmFileDropZone")[0].innerText = "Drop sound here";
    }
}

// 맵 이미지 업로드
function mapHandleFileSelect(data)
{
    data.stopPropagation();
    data.preventDefault();

    $("#mapImageDropZone").css('background', '#F6F6F6');
    if (currentSceneIndex == -1)
    {
        alert("선택된 씬이 없습니다.");
        return;
    }
    if (sceneList[currentSceneIndex].isMapImageUpload)
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
            FILE.path = "repo/demoProject/" + sceneList[currentSceneIndex].SceneName.getString() + "/map/map." + ext[1];
            WebSocketConnector.socket.emit('mapImageFileUpload', JSON.stringify({file: FILE, sceneNum: sceneList[currentSceneIndex].SceneNumber, ext: ext[1]}));
        };
    }
        )(files[0]);
    reader.readAsDataURL(files[0]);
}

// 배경음악 업로드
function bgmHandleFileSelect(data)
{
    data.stopPropagation();
    data.preventDefault();

    $("#bgmFileDropZone").css('background', '#F6F6F6');
    if (currentSceneIndex == -1)
    {
        alert("선택된 씬이 없습니다.");
        return;
    }
    if (sceneList[currentSceneIndex].isBGMUpload)
    {
        alert("이미 업로드되어 있습니다.");
        return;
    }

    var files = data.dataTransfer.files;
    if (!files[0].type.match('audio.*'))
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
            FILE.path = "repo/demoProject/" + sceneList[currentSceneIndex].SceneName.getString() + "/bgm/bgm." + ext[1];

            WebSocketConnector.socket.emit('bgmFileUpload', JSON.stringify({file: FILE, sceneNum: sceneList[currentSceneIndex].SceneNumber, ext: ext[1]}));
            sceneList[currentSceneIndex].isBGMUpload = true;
            sceneList[currentSceneIndex].bgmExt = ext[1];
        };
    }
        )(files[0]);
    reader.readAsDataURL(files[0]);
}

function HandleDragOver(data)
{
    data.stopPropagation();
    data.preventDefault();
    data.dataTransfer.dropEffect = 'copy';

    $("#" + data.currentTarget.id).css('background', '#DDDDDD');
}

function HandleDragLeave(data)
{
    $("#" + data.currentTarget.id).css('background', '#F6F6F6');
}