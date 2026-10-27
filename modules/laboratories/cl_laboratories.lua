Labs = Labs or {}
Labs.Labos = {}
Labs.LabosIndex = {}
Labs.IsInLab = false


local function GetShellByType(type)
    return _LABS.Shell[type].name or false
end

function Labs:LoadInteract(type)
    if type == 'coke' then
        Labs:StartCoke()
    elseif type == 'meth' then
        Labs:StartMeth()
    elseif type == 'weed' then
        Labs:StartWeed()
    end
end

function Labs:GetEnterFromType(type)
    return _LABS.Shell[type].exit or false
end

function Labs:Init()
    -- local player = GetPlayer()
    Labs.Labos = TriggerServerCallback('core:labs:GetDataLabs')
    for i = 1, #Labs.Labos do
        Labs.Labos[i].i = i
        Labs.Labos[i].shell = GetShellByType(Labs.Labos[i].type)
        Labs.Labos[i].instance = math.random(100, 200)
        Labs.Labos[i].interact_temp = {}
        Labs.Labos[i].enter = nil
        -- InteractAPI.addInteraction({
        --     coords = vector3(Labs.Labos[i].coords.x, Labs.Labos[i].coords.y, Labs.Labos[i].coords.z),
        --     distance = 5.0,
        --     interactDst = 2.5,
        --     offset = vec(0.0, 0.0, 0.5),
        --     options = {
        --         {
        --             label = GetPhrase('enter_in_lab'),
        --             canInteract = function(entity, coords, args)
        --                 return (player:Can())
        --             end,
        --             action = function(entity, coords, args)
        --                 local data = TriggerServerCallback('core:labs:GetDataFromLabs', Labs.Labos[i].id)
        --                 for k, v in pairs(data) do
        --                     Labs.Labos[i][k] = v
        --                 end
        --                 Labs.LabosIndex = Labs.Labos[i]
        --                 Labs:enter()
        --             end
        --         }
        --     }
        -- })
    end
end

function Labs:enter()
    local pPed = PlayerPedId()
    local enterOffset = Labs:GetEnterFromType(Labs.LabosIndex.type)
    -- local player = GetPlayer()

    DoScreenFadeOut(1000)
    Wait(1000)
    RequestModel(Labs.LabosIndex.shell)
    while not HasModelLoaded(Labs.LabosIndex.shell) do
        Wait(0)
    end
    Labs.LabosIndex.model = CreateObject(Labs.LabosIndex.shell, Labs.LabosIndex.coords.x, Labs.LabosIndex.coords.y,
        Labs.LabosIndex.coords.z + 100.0, false, false, true)
    SetEntityRotation(Labs.LabosIndex.model, 0.0, 0.0, 0.0, 0, true)
    SetEntityAsMissionEntity(Labs.LabosIndex.model, true, true)
    FreezeEntityPosition(Labs.LabosIndex.model, true)
    Labs:LoadInteract(Labs.LabosIndex.type)
    Labs.LabosIndex.exit = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, enterOffset.x, enterOffset.y,
        enterOffset.z)
    Labs.IsInLab = true
    NetworkOverrideClockTime(23, 0, 0)
    SetEntityCoords(pPed, vector3(Labs.LabosIndex.exit.x, Labs.LabosIndex.exit.y, Labs.LabosIndex.exit.z))
    TriggerServerEvent("sxIllegals:enterLab", Labs.LabosIndex.id)
    -- Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
    --     coords = Labs.LabosIndex.exit,
    --     distance = 5.0,
    --     interactDst = 2.5,
    --     offset = vec(0.0, 0.0, 0.5),
    --     options = {
    --         {
    --             label = GetPhrase('exit_out_lab'),
    --             canInteract = function(entity, coords, args)
    --                 return (player:Can())
    --             end,
    --             action = function(entity, coords, args)
    --                 Labs:exit()
    --             end
    --         }
    --     }
    -- })
    DoScreenFadeIn(1000)
end

function Labs:exit()
    local pPed = PlayerPedId()

    DoScreenFadeOut(1000)
    Wait(1000)
    TeleportTopCoords(Labs.LabosIndex.coords, pPed)
    DeleteObject(Labs.LabosIndex.model)
    DeleteEntity(Labs.LabosIndex.model)
    TriggerServerEvent("sxIllegals:exitLab")
    for k, v in pairs(GetActivePlayers()) do
        if v ~= GetPlayerIndex() then
            NetworkConcealPlayer(v, false, false)
        end
    end
    Labs.LabosIndex = {}
    Labs.IsInLab = false
    TriggerServerEvent('vSync:requestSync')
    TriggerServerEvent('qb-weathersync:server:RequestStateSync')
    TriggerEvent('qb-weathersync:client:EnableSync')
    TriggerEvent('cd_easytime:ToggleSync', true)
    DoScreenFadeIn(1000)
end


Citizen.CreateThread(function()
    while true do
        local wait = 1000
        local pPed = PlayerPedId()
        local pPos = GetEntityCoords(pPed)

        if not Labs.IsInLab then
            for i = 1, #Labs.Labos do
                local lab = Labs.Labos[i]
                if lab.coords then
                    local dist = #(pPos - vector3(lab.coords.x, lab.coords.y, lab.coords.z))
                    if dist < 15.0 then
                        wait = 0
                        DrawMarker(27, lab.coords.x, lab.coords.y, lab.coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                            1.0, 1.0, 46, 204, 113, 100, false, false, 2, false, nil, nil, false)

                         if dist < 1.5 then
                            if Raids and Raids.IsPolice then
                                ShowHelpNotification(GetPhrase('enter_in_lab_police', Raids:GetKeyToken()))
                            else
                                ShowHelpNotification(GetPhrase('enter_in_lab'))
                            end
                            if IsControlJustReleased(0, 38) then
                                local access = TriggerServerCallback('sxIllegals:canEnterLab', lab.id)
                                if access and access.ok then
                                    local data = TriggerServerCallback('core:labs:GetDataFromLabs', lab.id)
                                    if data then
                                        for k, v in pairs(data[1] or {}) do
                                            lab[k] = v
                                        end
                                    end
                                    Labs.LabosIndex = lab
                                    Labs:enter()
                                else
                                    ShowNotification(GetPhrase('lab_access_' .. tostring(access and access.reason or 'not_owner')))
                                end
                            end
                        end
                    end
                end
            end
        else
            if Labs.LabosIndex and Labs.LabosIndex.exit then
                local exit = Labs.LabosIndex.exit
                local dist = #(pPos - exit)
                if dist < 15.0 then
                    wait = 0
                    DrawMarker(27, exit.x, exit.y, exit.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 231, 76, 60, 100, false, false, 2, false, nil, nil, false)

                    if dist < 1.5 then
                        ShowHelpNotification(GetPhrase('exit_out_lab'))
                        if IsControlJustReleased(0, 38) then
                            Labs:exit()
                        end
                    end
                end
            end
        end

        Citizen.Wait(wait)
    end
end)

Labs:Init()

RegisterNetEvent("sxIllegals:forceExitLab")
AddEventHandler("sxIllegals:forceExitLab", function()
    if Labs.IsInLab then
        Labs:exit()
    end
end)

RegisterNetEvent("sxIllegals:SyncLabsTable")
AddEventHandler("sxIllegals:SyncLabsTable", function(tableData)
    Labs.Labos = tableData
    for i = 1, #Labs.Labos do
        Labs.Labos[i].i = i
        Labs.Labos[i].shell = GetShellByType(Labs.Labos[i].type)
        Labs.Labos[i].instance = math.random(100, 200)
        Labs.Labos[i].interact_temp = {}
        Labs.Labos[i].enter = nil
    end
end)

Citizen.CreateThread(function()
    while true do
        if Labs.IsInLab then
            NetworkOverrideClockTime(23, 0, 0)
        end
        Citizen.Wait(1000)
    end
end)
