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

    territory:AddInfluence(group:getId(), point)

    influenceCooldown[license][interaction] = currentTime
end

RegisterNetEvent("sxGroup:AddInfluence")
AddEventHandler('sxGroup:AddInfluence', function(token, id, interaction)
    local source = source
    if CheckPlayerToken(source, token) then
        AddInfluence(source, id, interaction)
    end
end)

RegisterNetEvent("sxGroup:RegisterTerritory")
AddEventHandler('sxGroup:RegisterTerritory', function(data)
    local id = Generate.Code({ includeNumbers = true, includeLetters = true, length = 6 })
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
    territories:new(data)
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
