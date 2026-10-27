local GroupActivities = {}
local ActivityLimit = 30

function AddGroupActivity(groupId, kind, title, description)
    GroupActivities[groupId] = GroupActivities[groupId] or {}
    table.insert(GroupActivities[groupId], 1, {
        id = ('%s-%d-%d'):format(groupId, os.time(), math.random(1000, 9999)),
        time = os.time(),
        type = kind,
        title = title,
        description = description
    })

    if #GroupActivities[groupId] > ActivityLimit then
        table.remove(GroupActivities[groupId])
    end
end

function GetGroupActivities(groupId)
    return GroupActivities[groupId] or {}
end

function ClearGroupActivities(groupId)
    GroupActivities[groupId] = nil
end
