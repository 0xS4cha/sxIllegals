local function DecayTerritory(territory, now, affected)
    local previousOwner = territory.influence[1] and territory.influence[1].id
    local changed = false
    local kept = {}

    for _, influence in pairs(territory.influence) do
        if influence and now - (influence.lastActivity or now) >= _TERRITORY.Decay.idleTime then
            local loss = math.max(1, math.floor(influence.points * _TERRITORY.Decay.percent / 100))
            influence.points = influence.points - loss
            changed = true
            affected[influence.id] = (affected[influence.id] or 0) + 1
        end
        if influence and influence.points > 0 then
            kept[#kept + 1] = influence
        end
    end

    if not changed then return end

    territory:setInfluence(kept)
    territory.influenceChanged = true
    territory:setNeedSave(true)
    territory:refreshZoneData()

    local newOwner = territory.influence[1] and territory.influence[1].id
    if previousOwner and previousOwner ~= newOwner then
        territory.start = os.date('%Y-%m-%d')
        territory.date = 0
        territory.startChanged = true
        SendGroupAlert(previousOwner, 'territory', GetPhrase('decay_lost_title'), GetPhrase('decay_lost_desc', territory:getLabel()))
        TriggerEvent('sxIllegals:territoryLostByDecay', territory.id, previousOwner, newOwner)
    end
end

function RunInfluenceDecay()
    local now = os.time()
    local affected = {}

    for _, territory in pairs(GetAllTerritories()) do
        DecayTerritory(territory, now, affected)
    end

    for groupId, count in pairs(affected) do
        SendGroupAlert(groupId, 'territory', GetPhrase('decay_title'), GetPhrase('decay_desc', _TERRITORY.Decay.percent, count))
    end
end

CreateThread(function()
    if not _TERRITORY.Decay.enabled then return end

    while true do
        Wait(_TERRITORY.Decay.interval * 1000)
        RunInfluenceDecay()
    end
end)
