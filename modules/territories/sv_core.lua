local influenceCooldown = {}

function AddInfluence(source, id, interaction)
    local xPlayer = ESX.Player(source)
    if not xPlayer then return end

    local license = xPlayer.getIdentifier()
    local group = GetGroupFromLicense(license)
    local territory = GetTerritoriesFromId(id)
    local point = _TERRITORY.InfluencePoint[interaction]
    local cooldown = _TERRITORY.CouldownInfluence[interaction]

    if not group or not territory or not point or not cooldown then return end

    influenceCooldown[license] = influenceCooldown[license] or {}

    local lastUse = influenceCooldown[license][interaction] or 0
    local currentTime = os.time()

    if currentTime - lastUse < cooldown then
        return
    end

    territory:addInfluence(group:getId(), point)

    if TrackAdminActivity then
        TrackAdminActivity(group, territory, interaction, point)
    end

    influenceCooldown[license][interaction] = currentTime
end

RegisterNetEvent("sxGroup:AddInfluence")
AddEventHandler('sxGroup:AddInfluence', function(token, id, interaction)
    local source = source
    if CheckPlayerToken(source, token) then
        AddInfluence(source, id, interaction)
    end
end)

local function GenerateUniqueTerritoryId()
    local id
    repeat
        id = "TER-" .. os.time() .. "-" .. Generate.Code({ includeNumbers = true, includeLetters = true, length = 4 }):upper()
    until not GetTerritoriesFromId(id)
    return id
end

RegisterNetEvent("sxGroup:RegisterTerritory")
AddEventHandler('sxGroup:RegisterTerritory', function(data)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer or (xPlayer.getGroup() ~= 'admin' and xPlayer.getGroup() ~= 'superadmin') then
        return
    end

    local id = GenerateUniqueTerritoryId()
    MySQL.Sync.insert("INSERT INTO territories (id, label, influence, coords, minZ, maxZ) VALUES (?, ?, ?, ?, ?, ?)"
    , {
        id,
        data.label,
        json.encode({}),
        json.encode(data.coords),
        data.minZ,
        data.maxZ
    })
    data.id = id
    territory:new(data)
    
    if AdminActivities then
        table.insert(AdminActivities, 1, {
            id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
            time = os.time(),
            title = 'Territoire Créé',
            description = string.format("Le territoire %s a été créé par l'administration.", data.label),
            type = 'territory',
            severity = 'info'
        })
    end
    
    TriggerClientEvent('sxGroup:RefreshTerritories', -1, GetTerritoriesFromId(data.id), data.id)
end)

RegisterNetEvent("sxGroup:SaveTerritory")
AddEventHandler('sxGroup:SaveTerritory', function(data)
    local territory = GetTerritoriesFromId(data.id)
    if data.label ~= territory:getLabel() then
        territory:setLabel(data.label)
        territory:setLabelChanged(true)
    end
    if data.minZ ~= territory:getMinZ() then
        territory:setMinZ(data.minZ)
        territory:setMinZChanged(true)
    end
    if data.maxZ ~= territory:getMaxZ() then
        territory:setMaxZ(data.maxZ)
        territory:setMaxZChanged(true)
    end
    if data.coords ~= territory:getCoords() then
        territory:setCoords(data.coords)
        territory:setCoordsChanged(true)
    end
    TriggerClientEvent('sxGroup:RefreshTerritories', -1, GetTerritoriesFromId(data.id), data.id)
end)

RegisterServerCallback('sxGroup:getTerritoriesList', function(source)
    local territories = GetAllTerritories()
    local clientTerritories = {}
    
    for id, t in pairs(territories) do
        local coordsList = {}
        for _, coord in ipairs(t.coords or {}) do
            table.insert(coordsList, vector3(coord.x, coord.y, coord.z or 0.0))
        end
        
        local influenceList = {}
        for _, inf in ipairs(t.influence or {}) do
            table.insert(influenceList, {
                id = inf.id,
                name = inf.name,
                points = inf.points,
                rgb = inf.rgb or { r = 255, g = 255, b = 255 }
            })
        end
        
        clientTerritories[id] = {
            id = t.id,
            label = t.label,
            influence = influenceList,
            totalInfluence = t.totalInfluence or 0,
            coords = coordsList,
            minZ = t.minZ,
            maxZ = t.maxZ,
            attackState = t.attackState or 0,
            date = t.date or 0
        }
    end
    
    return clientTerritories
end)
