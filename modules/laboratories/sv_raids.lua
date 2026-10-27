local SealedLabs = {}
local ActiveRaids = {}
local DispatchCooldowns = {}

function IsPlayerPolice(source)
    if _RAID.Ace and IsPlayerAceAllowed(source, _RAID.Ace) then return true end

    local job, grade = Bridge.GetJob(source)
    return job ~= nil and _RAID.Jobs[job] ~= nil and grade >= _RAID.Jobs[job]
end

function GetOnlinePolice()
    local result = {}
    for _, playerId in ipairs(GetPlayers()) do
        local source = tonumber(playerId)
        if IsPlayerPolice(source) then
            result[#result + 1] = source
        end
    end
    return result
end

function IsLabSealed(labId)
    local expires = SealedLabs[labId]
    if expires and expires <= os.time() then
        SealedLabs[labId] = nil
        MySQL.Async.execute('UPDATE `labs` SET `sealed_until` = 0 WHERE `id` = ?', { labId })
        return false
    end
    return expires ~= nil
end

function GetLabSealRemaining(labId)
    if not IsLabSealed(labId) then return 0 end
    return SealedLabs[labId] - os.time()
end

function CanPoliceEnterLab(source, lab)
    return IsLabSealed(lab.id) and IsPlayerPolice(source)
end

function UnsealLab(labId)
    if not SealedLabs[labId] then return false end
    SealedLabs[labId] = nil
    MySQL.Async.execute('UPDATE `labs` SET `sealed_until` = 0 WHERE `id` = ?', { labId })
    return true
end

local function IsNearLab(source, lab)
    local ped = GetPlayerPed(source)
    if not ped or ped == 0 then return false end
    local coords = GetEntityCoords(ped)
    return #(coords - vector3(lab.coords.x, lab.coords.y, lab.coords.z)) <= _RAID.Distance + 2.0
end

function SealLab(lab, source)
    local expires = os.time() + _RAID.SealDuration
    SealedLabs[lab.id] = expires
    MySQL.Async.execute('UPDATE `labs` SET `sealed_until` = ? WHERE `id` = ?', { expires, lab.id })

    for _, target in ipairs(GetPlayersInLab(lab.id)) do
        if not IsPlayerPolice(target) then
            TriggerClientEvent('sxIllegals:forceExitLab', target)
        end
    end

    if _RAID.WipeProduction then
        ResetLabProduction(lab.id)
    end

    local label = lab.label or lab.id
    if lab.owner then
        SendGroupAlert(lab.owner, 'lab', GetPhrase('raid_sealed_title'), GetPhrase('raid_sealed_owner', label, math.floor(_RAID.SealDuration / 60)), lab.coords)
    end

    AddAdminActivity({
        title = GetPhrase('raid_sealed_title'),
        description = GetPhrase('raid_sealed_admin', label, source and Bridge.GetName(source) or GetPhrase('none')),
        type = 'lab',
        severity = 'warning'
    }, 'lab_raided')

    TriggerEvent('sxIllegals:labRaided', lab.id, source, lab.owner)
    return true
end

function TriggerPoliceAlert(lab, interaction)
    if not _RAID.Enabled or not _RAID.Dispatch.enabled then return end
    if DispatchCooldowns[lab.id] and DispatchCooldowns[lab.id] > os.time() then return end
    if math.random(100) > _RAID.Dispatch.chance then return end

    DispatchCooldowns[lab.id] = os.time() + _RAID.Dispatch.cooldown

    local angle = math.random() * math.pi * 2
    local distance = math.random() * _RAID.Dispatch.radius
    local coords = {
        x = lab.coords.x + math.cos(angle) * distance,
        y = lab.coords.y + math.sin(angle) * distance,
        z = lab.coords.z
    }

    for _, target in ipairs(GetOnlinePolice()) do
        TriggerClientEvent('sxIllegals:policeAlert', target, {
            coords = coords,
            radius = _RAID.Dispatch.radius,
            duration = _RAID.Dispatch.blipDuration,
            message = GetPhrase('raid_dispatch_' .. lab.type)
        })
    end

    SendDiscordLog('police_alert', GetPhrase('raid_dispatch_title'), GetPhrase('raid_dispatch_admin', lab.label or lab.id, interaction), 'info')
    TriggerEvent('sxIllegals:policeAlert', lab.id, coords, interaction)
end

RegisterServerCallback('sxIllegals:isPolice', function(source)
    return _RAID.Enabled and IsPlayerPolice(source)
end)

RegisterServerCallback('sxIllegals:startRaid', function(source, labId)
    if not _RAID.Enabled or not IsPlayerPolice(source) then return { ok = false, reason = 'not_police' } end

    local lab = GetLabFromId(labId)
    if not lab then return { ok = false, reason = 'not_found' } end
    if IsLabSealed(lab.id) then return { ok = false, reason = 'already_sealed' } end
    if not IsNearLab(source, lab) then return { ok = false, reason = 'too_far' } end

    ActiveRaids[source] = { labId = lab.id, start = os.time() }

    if lab.owner then
        SendGroupAlert(lab.owner, 'lab', GetPhrase('raid_started_title'), GetPhrase('raid_started_owner', lab.label or lab.id), lab.coords)
    end

    return { ok = true, duration = _RAID.Duration }
end)

RegisterServerCallback('sxIllegals:finishRaid', function(source, labId)
    local raid = ActiveRaids[source]
    ActiveRaids[source] = nil

    if not raid or raid.labId ~= labId or os.time() - raid.start < _RAID.Duration - 1 then
        return { ok = false, reason = 'denied' }
    end

    local lab = GetLabFromId(labId)
    if not lab or not IsNearLab(source, lab) then return { ok = false, reason = 'too_far' } end
    if IsLabSealed(lab.id) then return { ok = false, reason = 'already_sealed' } end

    SealLab(lab, source)
    return { ok = true }
end)

RegisterNetEvent('sxIllegals:cancelRaid', function()
    ActiveRaids[source] = nil
end)

AddEventHandler('playerDropped', function()
    ActiveRaids[source] = nil
end)

CreateThread(function()
    Wait(1000)
    MySQL.Sync.execute("ALTER TABLE `labs` ADD COLUMN IF NOT EXISTS `sealed_until` INT DEFAULT 0")
    local rows = MySQL.Sync.fetchAll('SELECT `id`, `sealed_until` FROM `labs` WHERE `sealed_until` > ?', { os.time() })
    for _, row in ipairs(rows or {}) do
        SealedLabs[row.id] = tonumber(row.sealed_until)
    end
end)
