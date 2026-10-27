local function GroupCall(name, ...)
    return TriggerServerCallback(name, ...) or { ok = false, error = 'timeout' }
end

function SX.Group:Initialize()
    if self.initialized then return end
    self.initialized = true

    RegisterNUICallback('getMyGroupData', function(_, cb)
        cb(GroupCall('sxGroup:getMyGroup'))
    end)

    RegisterNUICallback('promoteGroupMember', function(data, cb)
        cb(GroupCall('sxGroup:promoteMember', data and data.identifier))
    end)

    RegisterNUICallback('demoteGroupMember', function(data, cb)
        cb(GroupCall('sxGroup:demoteMember', data and data.identifier))
    end)

    RegisterNUICallback('kickGroupMember', function(data, cb)
        cb(GroupCall('sxGroup:kickMember', data and data.identifier))
    end)

    RegisterNUICallback('leaveGroup', function(_, cb)
        cb(GroupCall('sxGroup:leaveGroup'))
    end)

    RegisterNUICallback('updateGroupDevise', function(data, cb)
        cb(GroupCall('sxGroup:updateDevise', data and data.devise))
    end)

    RegisterNUICallback('renameGroupRank', function(data, cb)
        cb(GroupCall('sxGroup:renameRank', data and data.rankId, data and data.newName))
    end)

    RegisterNUICallback('createPlayerGroup', function(data, cb)
        cb(GroupCall('sxGroup:createGroup', data))
    end)

    RegisterNUICallback('invitePlayerToGroup', function(data, cb)
        cb(GroupCall('sxGroup:invitePlayer', data and data.targetId))
    end)

    RegisterNUICallback('respondGroupInvitation', function(data, cb)
        cb(GroupCall('sxGroup:respondInvitation', data and data.groupId, data and data.accept == true))
    end)

    RegisterCommand('groupaccept', function()
        TriggerServerEvent('sxGroup:acceptLatestInvitation')
    end, false)

    RegisterCommand('groupdecline', function()
        TriggerServerEvent('sxGroup:declineLatestInvitation')
    end, false)

    RegisterNUICallback('setGroupRankPermissions', function(data, cb)
        cb(GroupCall('sxGroup:setRankPermissions', data and data.rankId, data and data.permissions))
    end)
end

function SX.Group:Think(lp)
end
