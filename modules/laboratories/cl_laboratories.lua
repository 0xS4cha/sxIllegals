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
    SetEntityCoords(pPed, vector3(Labs.LabosIndex.exit.x, Labs.LabosIndex.exit.y, Labs.LabosIndex.exit.z))
    TriggerServerEvent("yCore:initInstance", Labs.LabosIndex.id)
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
    for i = 1, #Labs.LabosIndex.interact_temp do
        InteractAPI.removeInteraction(Labs.LabosIndex.interact_temp[i])
        Labs.LabosIndex.interact_temp[i] = nil
    end
    TriggerServerEvent("yCore:outInstance", Labs.LabosIndex.id)
    for k, v in pairs(GetActivePlayers()) do
        if v ~= GetPlayerIndex() then
            NetworkConcealPlayer(v, false, false)
        end
    end
    Labs.LabosIndex = {}
    DoScreenFadeIn(1000)
end

Labs:Init()

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
