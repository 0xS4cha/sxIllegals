Raids = Raids or {}
Raids.IsPolice = false
Raids.InProgress = false

local DispatchBlips = {}

local function RefreshPoliceStatus()
    Raids.IsPolice = TriggerServerCallback('sxIllegals:isPolice') == true
end

function Raids:Start(lab)
    if self.InProgress or not lab then return end
    self.InProgress = true

    CreateThread(function()
        local result = TriggerServerCallback('sxIllegals:startRaid', lab.id)
        if not result or not result.ok then
            ShowNotification(GetPhrase('raid_error_' .. tostring(result and result.reason or 'denied')))
            Raids.InProgress = false
            return
        end

        local ped = PlayerPedId()
        local origin = GetEntityCoords(ped)
        TaskStartScenarioInPlace(ped, 'WORLD_HUMAN_HAMMERING', 0, true)

        local endTime = GetGameTimer() + result.duration * 1000
        local cancelled = false
        while GetGameTimer() < endTime do
            local remaining = math.ceil((endTime - GetGameTimer()) / 1000)
            ShowHelpNotification(GetPhrase('raid_progress', remaining))
            if #(GetEntityCoords(ped) - origin) > 2.0 or IsPedRagdoll(ped) or IsEntityDead(ped) or IsControlJustPressed(0, 177) then
                cancelled = true
                break
            end
            Wait(0)
        end

        ClearPedTasks(ped)

        if cancelled then
            TriggerServerEvent('sxIllegals:cancelRaid')
            ShowNotification(GetPhrase('raid_cancelled'))
        else
            local finish = TriggerServerCallback('sxIllegals:finishRaid', lab.id)
            if finish and finish.ok then
                ShowNotification(GetPhrase('raid_success', lab.label or lab.id))
            else
                ShowNotification(GetPhrase('raid_error_' .. tostring(finish and finish.reason or 'denied')))
            end
        end

        Raids.InProgress = false
    end)
end

function Raids:GetKeyToken()
    return ('~INPUT_%X~'):format((joaat('raidlab') & 0xFFFFFFFF) | 0x80000000)
end

function Raids:GetClosestLab()
    local coords = GetEntityCoords(PlayerPedId())
    local closest, closestDistance = nil, _RAID.Distance
    for _, lab in ipairs(Labs.Labos or {}) do
        if lab.coords then
            local distance = #(coords - vector3(lab.coords.x, lab.coords.y, lab.coords.z))
            if distance < closestDistance then
                closest, closestDistance = lab, distance
            end
        end
    end
    return closest
end

RegisterCommand('raidlab', function()
    if not _RAID.Enabled or not Raids.IsPolice or Labs.IsInLab then return end
    local lab = Raids:GetClosestLab()
    if lab then
        Raids:Start(lab)
    else
        ShowNotification(GetPhrase('raid_error_too_far'))
    end
end, false)

RegisterKeyMapping('raidlab', GetPhrase('keymap_raid_lab'), 'keyboard', _RAID.Key)

RegisterNetEvent('sxIllegals:policeAlert', function(data)
    if type(data) ~= 'table' or not data.coords then return end

    PlaySoundFrontend(-1, 'Lose_1st', 'GTAO_FM_Events_Soundset', true)
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(data.message)
    EndTextCommandThefeedPostMessagetext('CHAR_CALL911', 'CHAR_CALL911', false, 1, GetPhrase('raid_dispatch_title'), '')
    EndTextCommandThefeedPostTicker(true, true)

    local area = AddBlipForRadius(data.coords.x, data.coords.y, data.coords.z, data.radius + 0.0)
    SetBlipColour(area, 1)
    SetBlipAlpha(area, 90)

    local blip = AddBlipForCoord(data.coords.x, data.coords.y, data.coords.z)
    SetBlipSprite(blip, 403)
    SetBlipColour(blip, 1)
    SetBlipFlashes(blip, true)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentSubstringPlayerName(GetPhrase('raid_dispatch_title'))
    EndTextCommandSetBlipName(blip)

    DispatchBlips[#DispatchBlips + 1] = area
    DispatchBlips[#DispatchBlips + 1] = blip

    SetTimeout(data.duration * 1000, function()
        if DoesBlipExist(area) then RemoveBlip(area) end
        if DoesBlipExist(blip) then RemoveBlip(blip) end
    end)
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    for _, blip in ipairs(DispatchBlips) do
        if DoesBlipExist(blip) then RemoveBlip(blip) end
    end
end)

CreateThread(function()
    if not _RAID.Enabled then return end
    while true do
        RefreshPoliceStatus()
        Wait(60000)
    end
end)

RegisterNetEvent('esx:setJob', function()
    if _RAID.Enabled then
        CreateThread(RefreshPoliceStatus)
    end
end)
