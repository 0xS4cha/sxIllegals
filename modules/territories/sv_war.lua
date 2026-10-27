ATTACK_STATE = { NONE = 0, ATTACK = 1, CONTESTED = 2 }

local function GetTerritoryCenter(territory)
    local x, y, z, count = 0.0, 0.0, 0.0, 0
    for _, point in ipairs(territory.coords or {}) do
        x, y, z, count = x + point.x, y + point.y, z + (point.z or 0.0), count + 1
    end
    if count == 0 then return nil end
    return { x = x / count, y = y / count, z = z / count }
end

local function GetOwner(territory)
    local first = territory.influence and territory.influence[1]
    if first and first.points > 0 then return first end
    return nil
end

local function GetGroupPoints(territory, groupId)
    for _, influence in ipairs(territory.influence or {}) do
        if influence.id == groupId then
            return influence.points
        end
    end
    return 0
end

local function IsContender(territory, owner, groupId)
    if not _TERRITORY.War.requireContest then return true end
    return GetGroupPoints(territory, groupId) >= owner.points * _TERRITORY.War.contestRatio
end

local function GetPresence()
    local presence = {}
    for _, playerId in ipairs(GetPlayers()) do
        local source = tonumber(playerId)
        local ped = GetPlayerPed(source)
        if ped and ped ~= 0 and GetEntityHealth(ped) > 0 then
            local group = GetGroupFromLicense(Bridge.GetIdentifier(source))
            if group then
                local territoryId = GetTerritoryFromCoords(GetEntityCoords(ped))
                if territoryId then
                    presence[territoryId] = presence[territoryId] or {}
                    presence[territoryId][group.id] = presence[territoryId][group.id] or { count = 0, sources = {} }
                    local entry = presence[territoryId][group.id]
                    entry.count = entry.count + 1
                    entry.sources[#entry.sources + 1] = source
                end
            end
        end
    end
    return presence
end

local function GroupName(groupId)
    local group = GetGroupFromId(groupId)
    return group and group.name or groupId
end

local function StartAttack(territory, owner, attackerId)
    territory.war = { attacker = attackerId, defender = owner.id, progress = 0, lastNotice = 0 }
    local center = GetTerritoryCenter(territory)
    local label = territory:getLabel()

    SendGroupAlert(owner.id, 'territory', GetPhrase('war_attack_title'), GetPhrase('war_attack_defender', GroupName(attackerId), label), center)
    SendGroupAlert(attackerId, 'territory', GetPhrase('war_attack_title'), GetPhrase('war_attack_attacker', label, math.ceil(_TERRITORY.War.captureTime / 60)), center)
    AddAdminActivity({
        title = GetPhrase('war_attack_title'),
        description = GetPhrase('war_attack_admin', GroupName(attackerId), label, GroupName(owner.id)),
        type = 'territory',
        severity = 'warning'
    }, 'territory_attacked')
    TriggerEvent('sxIllegals:territoryAttackStarted', territory.id, attackerId, owner.id)
end

local function StopAttack(territory, reason)
    local war = territory.war
    territory.war = nil
    territory.warCooldown = os.time() + _TERRITORY.War.cooldown

    local label = territory:getLabel()
    SendGroupAlert(war.attacker, 'territory', GetPhrase('war_failed_title'), GetPhrase('war_failed_attacker', label))
    SendGroupAlert(war.defender, 'territory', GetPhrase('war_defended_title'), GetPhrase('war_defended_defender', label))
    TriggerEvent('sxIllegals:territoryAttackEnded', territory.id, war.attacker, war.defender, reason)
end

local function Capture(territory)
    local war = territory.war
    territory.war = nil
    territory.warCooldown = os.time() + _TERRITORY.War.cooldown

    local defenderPoints = GetGroupPoints(territory, war.defender)
    local transfer = math.floor(defenderPoints * _TERRITORY.War.captureTransfer)
    for _, influence in ipairs(territory.influence) do
        if influence.id == war.defender then
            influence.points = influence.points - transfer
        end
    end

    local attackerPoints = GetGroupPoints(territory, war.attacker)
    local defenderAfter = GetGroupPoints(territory, war.defender)
    if attackerPoints + transfer <= defenderAfter then
        transfer = defenderAfter - attackerPoints + 1
    end
    territory:addInfluence(war.attacker, transfer)

    territory.start = os.date('%Y-%m-%d')
    territory.date = 0
    territory.startChanged = true
    territory.influenceChanged = true
    territory:setNeedSave(true)

    local label = territory:getLabel()
    SendGroupAlert(war.attacker, 'territory', GetPhrase('war_captured_title'), GetPhrase('war_captured_attacker', label))
    SendGroupAlert(war.defender, 'territory', GetPhrase('war_lost_title'), GetPhrase('war_lost_defender', label, GroupName(war.attacker)))
    AddAdminActivity({
        title = GetPhrase('war_captured_title'),
        description = GetPhrase('war_captured_admin', GroupName(war.attacker), label, GroupName(war.defender)),
        type = 'territory',
        severity = 'warning'
    }, 'territory_captured')
    TriggerEvent('sxIllegals:territoryCaptured', territory.id, war.attacker, war.defender)
end

local function UpdateContest(territory, owner)
    local challenger = territory.influence[2]
    local contested = owner and challenger and challenger.points >= owner.points * _TERRITORY.War.contestRatio
    local wasContested = territory.contested == true
    territory.contested = contested and true or false

    if contested and not wasContested then
        local label = territory:getLabel()
        SendGroupAlert(owner.id, 'territory', GetPhrase('war_contested_title'), GetPhrase('war_contested_owner', challenger.name or GroupName(challenger.id), label))
        SendGroupAlert(challenger.id, 'territory', GetPhrase('war_contested_title'), GetPhrase('war_contested_challenger', label))
        AddAdminActivity({
            title = GetPhrase('war_contested_title'),
            description = GetPhrase('war_contested_admin', label, GroupName(owner.id), challenger.name or GroupName(challenger.id)),
            type = 'territory',
            severity = 'info'
        }, 'territory_contested')
    end
end

local function UpdateWar(territory, presence)
    local owner = GetOwner(territory)
    local interval = _TERRITORY.War.checkInterval

    if territory.war then
        local war = territory.war
        local attackers = presence[war.attacker] and presence[war.attacker].count or 0
        local defenders = presence[war.defender] and presence[war.defender].count or 0

        if not owner or owner.id ~= war.defender or attackers < _TERRITORY.War.minAttackers then
            StopAttack(territory, 'abandoned')
        elseif defenders == 0 then
            war.progress = war.progress + interval
            if war.progress >= _TERRITORY.War.captureTime then
                Capture(territory)
            elseif war.progress - war.lastNotice >= 60 then
                war.lastNotice = war.progress
                local percent = math.floor(war.progress / _TERRITORY.War.captureTime * 100)
                for _, target in ipairs(presence[war.attacker].sources) do
                    Notify(target, GetPhrase('war_progress', territory:getLabel(), percent))
                end
            end
        end
    elseif owner and (not territory.warCooldown or territory.warCooldown < os.time()) then
        for groupId, entry in pairs(presence) do
            if groupId ~= owner.id and entry.count >= _TERRITORY.War.minAttackers and IsContender(territory, owner, groupId) then
                StartAttack(territory, owner, groupId)
                break
            end
        end
    end

    UpdateContest(territory, GetOwner(territory))
end

function GetTerritoryWar(territoryId)
    local territory = GetTerritoriesFromId(territoryId)
    if not territory then return nil end

    local war = territory.war
    return {
        attackState = territory.attackState or 0,
        contested = territory.contested == true,
        attacker = war and war.attacker or nil,
        defender = war and war.defender or nil,
        progress = war and math.floor(war.progress / _TERRITORY.War.captureTime * 100) or 0,
        cooldown = territory.warCooldown and math.max(0, territory.warCooldown - os.time()) or 0
    }
end

CreateThread(function()
    if not _TERRITORY.War.enabled then return end

    while true do
        Wait(_TERRITORY.War.checkInterval * 1000)

        local presence = GetPresence()
        for id, territory in pairs(GetAllTerritories()) do
            local previous = territory.attackState or 0
            UpdateWar(territory, presence[id] or {})

            local state = ATTACK_STATE.NONE
            if territory.war then
                state = ATTACK_STATE.ATTACK
            elseif territory.contested then
                state = ATTACK_STATE.CONTESTED
            end

            territory.attackState = state
            if state ~= previous then
                territory:refreshZoneData()
            end
        end
    end
end)
