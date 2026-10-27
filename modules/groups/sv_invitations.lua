local Invitations = {}

local function CleanInvitations(target)
    local list = Invitations[target]
    if not list then return {} end

    local now = os.time()
    for groupId, invitation in pairs(list) do
        if invitation.expires < now or not GetGroupFromId(groupId) then
            list[groupId] = nil
        end
    end
    return list
end

function GetPlayerInvitations(source)
    local result = {}
    for groupId, invitation in pairs(CleanInvitations(source)) do
        local group = GetGroupFromId(groupId)
        result[#result + 1] = {
            groupId = groupId,
            groupName = group.name,
            rgb = group.rgb,
            inviter = invitation.inviterName,
            expiresIn = invitation.expires - os.time()
        }
    end
    table.sort(result, function(a, b) return a.expiresIn > b.expiresIn end)
    return result
end

function GetGroupMaxSlots(group)
    return group.slots or _GROUP.Slots[group.is_official == true]
end

function InvitePlayerToGroup(group, inviterSource, target)
    if not target or not GetPlayerName(target) then return false, 'player_not_found' end
    if target == inviterSource then return false, 'invalid_target' end

    local targetIdentifier = Bridge.GetIdentifier(target)
    if GetGroupFromLicense(targetIdentifier) then return false, 'already_in_group' end
    if #group.members >= GetGroupMaxSlots(group) then return false, 'group_full' end

    local list = CleanInvitations(target)
    if list[group.id] then return false, 'already_invited' end

    local inviterName = inviterSource and Bridge.GetName(inviterSource) or group.name
    Invitations[target] = list
    list[group.id] = {
        inviter = inviterSource,
        inviterName = inviterName,
        expires = os.time() + _GROUP.InvitationDuration
    }

    Notify(target, GetPhrase('notify_group_invited', inviterName, group.name))
    return true
end

function AcceptGroupInvitation(source, groupId)
    local list = CleanInvitations(source)
    local invitation = groupId and list[groupId]
    if not groupId then
        for id, data in pairs(list) do
            if not invitation or data.expires > invitation.expires then
                groupId, invitation = id, data
            end
        end
    end
    if not invitation then return false, 'invitation_expired' end

    local group = GetGroupFromId(groupId)
    local identifier = Bridge.GetIdentifier(source)
    if GetGroupFromLicense(identifier) then return false, 'already_in_group' end

    local name = group:recruitPlayer(identifier)
    if not name then return false, 'group_full' end

    Invitations[source] = nil
    group:saveGroup()
    AddGroupActivity(group.id, 'member', GetPhrase('group_activity_joined_title'), GetPhrase('group_activity_joined_desc', name, invitation.inviterName))
    TriggerEvent('sxIllegals:groupMemberAdded', group.id, identifier, name)
    SendDiscordLog('member_joined', GetPhrase('activity_member_joined_title'), GetPhrase('activity_member_joined_desc', name, group.name), 'success')
    Notify(source, GetPhrase('notify_group_joined', group.name))
    return true, group
end

function DeclineGroupInvitation(source, groupId)
    local list = CleanInvitations(source)
    if not groupId then
        for id in pairs(list) do groupId = id break end
    end

    local invitation = groupId and list[groupId]
    if not invitation then return false, 'invitation_expired' end

    list[groupId] = nil
    if invitation.inviter and GetPlayerName(invitation.inviter) then
        Notify(invitation.inviter, GetPhrase('notify_group_invite_declined', Bridge.GetName(source)))
    end
    return true
end

RegisterServerCallback('sxGroup:invitePlayer', function(source, targetId)
    local identifier = Bridge.GetIdentifier(source)
    local group = GetGroupFromLicense(identifier)
    if not group then return { ok = false, error = 'no_group' } end

    if not HasGroupPermission(group, identifier, 'canInvite') then
        return { ok = false, error = 'no_permission', group = SerializeGroupForPlayer(group, identifier) }
    end

    local ok, err = InvitePlayerToGroup(group, source, tonumber(targetId))
    if ok then
        Notify(source, GetPhrase('notify_group_invite_sent', Bridge.GetName(tonumber(targetId))))
    end
    return { ok = ok, error = err, group = SerializeGroupForPlayer(group, identifier) }
end)

RegisterServerCallback('sxGroup:respondInvitation', function(source, groupId, accept)
    if accept then
        local ok, result = AcceptGroupInvitation(source, groupId)
        if not ok then return { ok = false, error = result, invitations = GetPlayerInvitations(source) } end
        return { ok = true, group = SerializeGroupForPlayer(result, Bridge.GetIdentifier(source)) }
    end

    local ok, err = DeclineGroupInvitation(source, groupId)
    return { ok = ok, error = err, group = nil, invitations = GetPlayerInvitations(source) }
end)

RegisterNetEvent('sxGroup:acceptLatestInvitation', function()
    local src = source
    local ok, err = AcceptGroupInvitation(src)
    if not ok then Notify(src, GetPhrase('group_error_' .. err)) end
end)

RegisterNetEvent('sxGroup:declineLatestInvitation', function()
    local src = source
    local ok, err = DeclineGroupInvitation(src)
    if not ok then Notify(src, GetPhrase('group_error_' .. err)) end
end)

AddEventHandler('playerDropped', function()
    Invitations[source] = nil
end)
