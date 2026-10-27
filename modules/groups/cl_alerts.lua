local AlertBlips = {}

local function ShowAlert(data)
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(data.message)
    EndTextCommandThefeedPostMessagetext(_GROUP.Alerts.icon, _GROUP.Alerts.icon, false, 1, data.group, data.title)
    EndTextCommandThefeedPostTicker(true, true)

    if _GROUP.Alerts.sound then
        PlaySoundFrontend(-1, 'Event_Message_Purple', 'GTAO_FM_Events_Soundset', true)
    end

    if data.coords and _GROUP.Alerts.blipDuration > 0 then
        local blip = AddBlipForCoord(data.coords.x, data.coords.y, data.coords.z)
        SetBlipSprite(blip, 161)
        SetBlipScale(blip, 1.2)
        SetBlipColour(blip, 1)
        SetBlipFlashes(blip, true)
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentSubstringPlayerName(data.title)
        EndTextCommandSetBlipName(blip)
        AlertBlips[#AlertBlips + 1] = blip

        SetTimeout(_GROUP.Alerts.blipDuration * 1000, function()
            if DoesBlipExist(blip) then
                RemoveBlip(blip)
            end
        end)
    end
end

RegisterNetEvent('sxIllegals:groupAlert', function(data)
    if type(data) == 'table' and data.message then
        ShowAlert(data)
    end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    for _, blip in ipairs(AlertBlips) do
        if DoesBlipExist(blip) then
            RemoveBlip(blip)
        end
    end
end)
