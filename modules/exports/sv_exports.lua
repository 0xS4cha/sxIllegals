local function GetIdentifierFromSource(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return nil end
    return xPlayer.getIdentifier()
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
        controlledDays = data.date or 0
    }
end

local function SerializeLaboratory(data)
    if not data then return nil end

    return {
        id = data.id,
        label = data.label,
        type = data.type,
        level = data.level,
        coords = data.coords
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

exports("AddPlayerInfluence", function(source, territoryId, interaction)
    AddInfluence(source, territoryId, interaction)
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
