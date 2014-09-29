var direction = {};
var character = {};
var tempSpeech = "";

function TimelineInit()
{
    anim("Direction",direction).to({"Camera":0},0);
}

function LoadTimelineInfo()
{
    Timeline.globalInstance.anims.splice(0,  Timeline.globalInstance.anims.length);
    TimelineInit();

    // 불러오기
    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[i].Node.length > 0)
        {
            AddCharacterOnTimeline(sceneList[focusedTabSceneIndex].eventObjects[i].name);
            for(var j = 0; j < sceneList[focusedTabSceneIndex].eventObjects[i].Node.length; j++)
            {
                if (sceneList[focusedTabSceneIndex].eventObjects[i].Node[j].time > 0)
                {
                    var newKey =
                    {
                        timeline: Timeline.globalInstance,
                        targetName: 'Character',
                        target: Timeline.globalInstance.anims[1].target,
                        propertyName: sceneList[focusedTabSceneIndex].eventObjects[i].name,
                        startValue: 0,
                        endValue: 0,
                        delay: 0,
                        startTime: 0,
                        endTime: sceneList[focusedTabSceneIndex].eventObjects[i].Node[j].time,
                        easing: Timeline.Easing.Linear.EaseNone
                    };
                    Timeline.globalInstance.anims.push(newKey);
                }
            }
        }
    }
    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventCameraNode.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventCameraNode[i].time > 0)
        {
            var newKey =
            {
                timeline: Timeline.globalInstance,
                targetName: 'Direction',
                target: Timeline.globalInstance.anims[0].target,
                propertyName: 'Camera',
                startValue: 0,
                endValue: 0,
                delay: 0,
                startTime: 0,
                endTime: sceneList[focusedTabSceneIndex].eventCameraNode[i].time,
                easing: Timeline.Easing.Linear.EaseNone
            };
            Timeline.globalInstance.anims.push(newKey);
        }
    }

    Timeline.globalInstance.initTracks();
}

function AddCharacterOnTimeline(name)
{
    var str = "anim('Character',character).to({'" + name + "':0},0);";
    eval(str);
}

function RemoveCharacterOnTimeline(name)
{
    for(var i = 0; i < Timeline.globalInstance.anims.length; i++)
    {
        if (Timeline.globalInstance.anims[i].propertyName == name)
        {
            Timeline.globalInstance.anims.splice(i, 1);
            break;
        }
    }

    // 캔버스에 적용
    makeEventObject("", 0);

    // 대화상자 닫기
    Timeline.globalInstance.hideKeyEditDialog();
}

function SelectKey(key)
{
    if (key.track.name == 'Camera')
    {
        eventInspectorInit();

        // 캔버스에도 선택된애랑 키 알려주기

        return;
    }
    for(var i = 0; i < sceneList[focusedTabSceneIndex].eventObjects.length; i++)
    {
        if (sceneList[focusedTabSceneIndex].eventObjects[i].name == key.track.name)
        {
            eventInspectorInput(sceneList[focusedTabSceneIndex].eventObjects[i].id);
            break;
        }
    }
    makeEventObject(key.track.name, key.time);
}