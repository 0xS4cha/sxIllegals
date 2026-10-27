function GetOnlineGroupMembers(groupId)
    local group = GetGroupFromId(groupId)
    local sources = {}
    if not group then return sources end

    for _, member in ipairs(group.members) do
        local target = Bridge.GetSourceFromIdentifier(member.identifier)
        if target then
            sources[#sources + 1] = target
        end
    end
    return sources
end

function SendGroupAlert(groupId, kind, title, message, coords)
    local group = GetGroupFromId(groupId)
    if not group then return end

    AddGroupActivity(groupId, kind == 'territory' and 'territory' or 'alert', title, message)

    for _, target in ipairs(GetOnlineGroupMembers(groupId)) do
        TriggerClientEvent('sxIllegals:groupAlert', target, {
            group = group.name,
            title = title,
            message = message,
            kind = kind,
            coords = coords
        })
    end

    TriggerEvent('sxIllegals:groupAlert', groupId, kind, title, message)
end

AddEventHandler('sxIllegals:groupMemberRemoved', function(groupId, identifier, reason, name)
    name = name or identifier
    SendGroupAlert(groupId, 'member', GetPhrase('alert_member_left_title'), GetPhrase(reason == 'kick' and 'alert_member_kicked' or 'alert_member_left', name))
end)

AddEventHandler('sxIllegals:groupMemberAdded', function(groupId, identifier, name)
    SendGroupAlert(groupId, 'member', GetPhrase('alert_member_joined_title'), GetPhrase('alert_member_joined', name or identifier))
end)
