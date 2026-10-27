local function GetIdentifierFromSource(source)
    return Bridge.GetIdentifier(source)
end

local function SerializeGroup(data)
    if not data then return nil end

    local members = {}
    for _, member in pairs(data.members or {}) do
        members[#members + 1] = {
            identifier = member.identifier,
            label = member.label,
            grade = member.id_grade
        }
    end

    local ranks = {}
    for _, rank in ipairs(data.ranks or {}) do
        ranks[#ranks + 1] = {
            name = rank.name,
            rank = rank.rank,
            perms = rank.perms or {}
        }
    end

    return {
        id = data.id,
        name = data.name,
        devise = data.devise,
        rgb = data.rgb,
        isOfficial = data.is_official == true,
        slots = data.slots or _GROUP.Slots[data.is_official == true],
        createdAt = data.createdAt,
        members = members,
        ranks = ranks
    }
end

local function SerializeTerritory(data)
    if not data then return nil end

    local influence = {}
    for _, entry in ipairs(data.influence or {}) do
        influence[#influence + 1] = {
            groupId = entry.id,
            name = entry.name,
            points = entry.points,
            rgb = entry.rgb
        }
    end

    return {
        id = data.id,
        label = data.label,
        coords = data.coords,
        minZ = data.minZ,
        maxZ = data.maxZ,
        influence = influence,
        totalInfluence = data.totalInfluence or 0,
        controlledSince = data.start,
        controlledDays = data.date or 0,
        attackState = data.attackState or 0
    }
end

local function SerializeLaboratory(data)
    if not data then return nil end

    return {
        id = data.id,
        label = data.label,
        type = data.type,
        level = data.level,
        coords = data.coords,
        owner = data.owner,
        sealed = IsLabSealed(data.id)
    }
end

exports("GetGroup", function(groupId)
    return SerializeGroup(GetGroupFromId(groupId))
end)

exports("GetGroups", function()
    local result = {}
    for _, data in pairs(GetAllGroup()) do
        result[#result + 1] = SerializeGroup(data)
    end
    return result
end)

exports("GetGroupByIdentifier", function(identifier)
    return SerializeGroup(GetGroupFromLicense(identifier) or nil)
end)

exports("GetPlayerGroup", function(source)
    local identifier = GetIdentifierFromSource(source)
    if not identifier then return nil end
    return SerializeGroup(GetGroupFromLicense(identifier) or nil)
end)

exports("IsPlayerInGroup", function(source, groupId)
    local identifier = GetIdentifierFromSource(source)
    if not identifier then return false end

    local data = GetGroupFromLicense(identifier)
    if not data then return false end

    return groupId == nil or data.id == groupId
end)

exports("GetPlayerGrade", function(source)
    local identifier = GetIdentifierFromSource(source)
    if not identifier then return nil end

    local data = GetGroupFromLicense(identifier)
    if not data then return nil end

    local grade = data:getRankFromPlayer(identifier)
    if grade == false then return nil end

    for _, rank in ipairs(data.ranks or {}) do
        if rank.rank == grade then
            return grade, rank.name
        end
    end

    return grade, nil
end)

exports("IsPlayerGroupLeader", function(source)
    local identifier = GetIdentifierFromSource(source)
    if not identifier then return false end

    local data = GetGroupFromLicense(identifier)
    if not data then return false end

    return data:getRankFromPlayer(identifier) == 0
end)

exports("GetTerritory", function(territoryId)
    return SerializeTerritory(GetTerritoriesFromId(territoryId))
end)

exports("GetTerritories", function()
    local result = {}
    for _, data in pairs(GetAllTerritories()) do
        result[#result + 1] = SerializeTerritory(data)
    end
    return result
end)

exports("GetTerritoryOwner", function(territoryId)
    local data = GetTerritoriesFromId(territoryId)
    if not data or not data.influence or not data.influence[1] then return nil end

    local leader = data.influence[1]
    return {
        groupId = leader.id,
        name = leader.name,
        points = leader.points,
        percentage = data.totalInfluence > 0 and (leader.points / data.totalInfluence * 100) or 0
    }
end)

exports("GetGroupInfluence", function(territoryId, groupId)
    local data = GetTerritoriesFromId(territoryId)
    if not data then return 0 end

    for _, entry in ipairs(data.influence or {}) do
        if entry.id == groupId then
            return entry.points
        end
    end

    return 0
end)

exports("GetGroupTerritories", function(groupId)
    local result = {}
    for _, data in pairs(GetAllTerritories()) do
        local leader = data.influence and data.influence[1]
        if leader and leader.id == groupId then
            result[#result + 1] = SerializeTerritory(data)
        end
    end
    return result
end)

exports("AddPlayerInfluence", function(source, territoryId, interaction, value)
    AddInfluence(source, territoryId, interaction, value)
end)

exports("AddGroupInfluence", function(territoryId, groupId, points)
    local data = GetTerritoriesFromId(territoryId)
    if not data or not GetGroupFromId(groupId) or type(points) ~= "number" then
        return false
    end

    data:addInfluence(groupId, points)
    return true
end)

exports("GetLaboratories", function(labType)
    local result = {}
    for _, data in pairs(Labs.Table or {}) do
        if labType == nil or data.type == labType then
            result[#result + 1] = SerializeLaboratory(data)
        end
    end
    return result
end)

exports("GetLaboratory", function(labId)
    for _, data in pairs(Labs.Table or {}) do
        if data.id == labId then
            return SerializeLaboratory(data)
        end
    end
    return nil
end)

local function ResolveIdentifier(target)
    if type(target) == "number" then
        return Bridge.GetIdentifier(target)
    end
    return target
end

exports("CreateGroup", function(data, leaderSource)
    local created, err = CreateGroup(data, leaderSource)
    return created and created.id or nil, err
end)

exports("DeleteGroup", function(groupId)
    return DeleteGroup(groupId)
end)

exports("UpdateGroup", function(groupId, data)
    local target = GetGroupFromId(groupId)
    if not target or type(data) ~= "table" then return false end

    if type(data.name) == "string" and data.name ~= target.name then
        if IsGroupNameTaken(data.name) then return false, "name_taken" end
        target.name = data.name:sub(1, 50)
    end
    if type(data.devise) == "string" then target.devise = data.devise:sub(1, 120) end
    if type(data.rgb) == "table" then target.rgb = data.rgb end
    if data.is_official ~= nil then target.is_official = data.is_official == true end
    if data.slots ~= nil then target.slots = tonumber(data.slots) end

    target:setNeedSave(true)
    target:saveGroup()
    return true
end)

exports("SetGroupOfficial", function(groupId, official)
    local target = GetGroupFromId(groupId)
    if not target then return false end
    target:setOfficial(official == true)
    target:setNeedSave(true)
    target:saveGroup()
    return true
end)

exports("AddGroupMember", function(groupId, target, grade)
    local group = GetGroupFromId(groupId)
    local identifier = ResolveIdentifier(target)
    if not group or not identifier then return false, "invalid_data" end
    if GetGroupFromLicense(identifier) then return false, "already_in_group" end
    if grade ~= nil and not group:getRankExistFromId(tonumber(grade)) then return false, "invalid_grade" end

    local name = group:recruitPlayer(identifier, grade ~= nil and tonumber(grade) or nil)
    if not name then return false, "group_full" end

    TriggerEvent("sxIllegals:groupMemberAdded", group.id, identifier, name)
    return true
end)

exports("RemoveGroupMember", function(groupId, target)
    local group = GetGroupFromId(groupId)
    local identifier = ResolveIdentifier(target)
    if not group or not identifier then return false end
    if not group:kickPlayer(identifier) then return false end

    TriggerEvent("sxIllegals:groupMemberRemoved", group.id, identifier, "export")
    return true
end)

exports("SetMemberGrade", function(groupId, target, grade)
    return SetGroupMemberGrade(groupId, ResolveIdentifier(target), grade)
end)

exports("InvitePlayer", function(groupId, targetSource)
    local group = GetGroupFromId(groupId)
    if not group then return false, "invalid_data" end
    return InvitePlayerToGroup(group, nil, tonumber(targetSource))
end)

exports("SendGroupAlert", function(groupId, title, message, coords)
    if not GetGroupFromId(groupId) then return false end
    SendGroupAlert(groupId, "alert", title, message, coords)
    return true
end)

exports("SetGroupInfluence", function(territoryId, groupId, points)
    return SetTerritoryGroupInfluence(territoryId, groupId, points)
end)

exports("ResetTerritoryInfluence", function(territoryId)
    return ResetTerritoryInfluence(territoryId)
end)

exports("GetTerritoryWar", function(territoryId)
    return GetTerritoryWar(territoryId)
end)

exports("SetLaboratoryOwner", function(labId, groupId)
    return SetLabOwner(labId, groupId)
end)

exports("SetLaboratoryLevel", function(labId, level)
    return SetLabLevel(labId, level)
end)

exports("SealLaboratory", function(labId, source)
    local lab = GetLabFromId(labId)
    if not lab or IsLabSealed(labId) then return false end
    return SealLab(lab, source)
end)

exports("UnsealLaboratory", function(labId)
    return UnsealLab(labId)
end)

exports("IsLaboratorySealed", function(labId)
    return IsLabSealed(labId)
end)

exports("IsPlayerPolice", function(source)
    return IsPlayerPolice(source)
end)
