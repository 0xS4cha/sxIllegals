Labs.Weed = Labs.Weed or {}
Labs.Weed.Thread = false
Labs.Weed.IsConfig = false

Labs.Weed.plants = {}
Labs.Weed.spots = {}
Labs.Weed.rolls = {}
Labs.Weed.packs = {}

Labs.Weed.working = false

function Labs.Weed:Load()
    Labs.Weed.plants = Labs:DeepCopy(Labs.LabosIndex.weeds[1])
    Labs.Weed.spots = {}
    Labs.Weed.rolls = {}
    Labs.Weed.packs = {}
    Labs.Weed.working = false
end

function Labs.Weed:Unload()
    for k, v in pairs(Labs.Weed.plants) do if v.entity then DeleteObject(v.entity) end end
    Labs.Weed.plants = {}
    Labs.Weed.spots = {}
    Labs.Weed.rolls = {}
    Labs.Weed.packs = {}
    Labs.Weed.Thread = false
    Labs.Weed.working = false
    Logger:info('LABORATORIES', 'Unload weed')
end

function Labs.Weed:GetWeedMessage(index)
    local plant = Labs.Weed.plants[index]
    if not plant.planted then
        return 'Planter'
    elseif not plant.fertilized then
        return 'Fertiliser'
    elseif plant.pickable or plant.state == 7 then
        -- timeRemaining = 0
        return 'Recolter'
    end
    local timeRemaining = math.max((_LABS.Weed.Finish - (os.time() - plant.start)), 0.0) + 1
    local minutes = math.floor(timeRemaining / 60)
    local seconds = math.floor(timeRemaining - minutes * 60)
    return string.format("Temps restant : %02d:%02d", minutes, seconds)
end

function Labs.Weed:HandleNewState(key, labo, state)
    local plant = Labs.Weed.plants[key]
    local model = _LABS.Weed.Props[state]
    if not model then
        if state >= 1 then
            local modelHash = Labs:RequestModel(model)
            if plant.entity then DeleteObject(plant.entity) end
            plant.entity = CreateObject(modelHash, GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].spots[key].x, _LABS.Shell['weed'].spots[key].y, _LABS.Shell['weed'].spots[key].z) + vector3(0, 0, math.floor(state / 4) * -2.5 - 0.95), false, false, true)
            SetModelAsNoLongerNeeded(modelHash)
            FreezeEntityPosition(plant.entity, true)
            -- TriggerServerEvent("core:labs:UpdateProps", plant.entity, labo, key)
        else
            return
        end
    else
        local modelHash = Labs:RequestModel(model)
        if plant.entity then DeleteObject(plant.entity) end
        plant.entity = CreateObject(modelHash, GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].spots[key].x, _LABS.Shell['weed'].spots[key].y, _LABS.Shell['weed'].spots[key].z) + vector3(0, 0, math.floor(state / 4) * -2.5 - 0.95), false, false, true)
        SetModelAsNoLongerNeeded(modelHash)
        FreezeEntityPosition(plant.entity, true)
        -- TriggerServerEvent("core:labs:UpdateProps", plant.entity, labo, key)
    end
    -- if not model then return end
end

function Labs.Weed:GetState(plant)
    if not plant.planted then
        return 0
    elseif not plant.fertilized then
        return 1
    elseif plant.pickable or plant.state == 7 then
        -- timeRemaining = 0
        return 7
    end
    local timeRemaining = math.max(_LABS.Weed.Finish - (os.time() - plant.start), 0.0)
    if timeRemaining == 0 then
        plant.pickable = true
        return 7
    end
    for i, v in ipairs(_LABS.Weed.States) do
        if timeRemaining < v.time then
            return v.state
        end
    end
    return 0
end

RegisterNetEvent("core:labs:PlantWeed")
AddEventHandler("core:labs:PlantWeed", function(labo, weed)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, weed = weed})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Weed.plants[weed].planted = true
    end
end)

RegisterNetEvent("core:labs:FertilizeWeed")
AddEventHandler("core:labs:FertilizeWeed", function(labo, weed)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, weed = weed})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Weed.plants[weed].start = os.time()
        Labs.Weed.plants[weed].fertilized = true
    end
end)

RegisterNetEvent("core:labs:GetWeed")
AddEventHandler("core:labs:GetWeed", function(labo, weed)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, weed = weed})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(2500)
        if Labs.Weed.plants[weed].entity then DeleteObject(Labs.Weed.plants[weed].entity) end
        Labs.Weed.plants[weed] = { planted = false, fertilized = false, pickable = false, state = 0, previousState = -1, start = nil }
    end
end)

function Labs.Weed:ActionOnPlant(key)
    local weed = key
    local plant = Labs.Weed.plants[key]
    local pos = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].spots[key].x, _LABS.Shell['weed'].spots[key].y, _LABS.Shell['weed'].spots[key].z)
    if plant.state == 0 then
        Labs:PlayLabosAnimation(pos, "amb@world_human_gardener_plant@male@enter", "enter", -1, 2000)
        TriggerServerEvent("core:labs:CheckPlant", Labs.LabosIndex.id, weed, GetTerritoryFromCoords(Labs.LabosIndex.coords))
    elseif plant.state == 1 then
        Labs:PlayLabosAnimation(pos, "amb@world_human_gardener_plant@female@idle_a", "idle_c_female", 1000)
        TriggerServerEvent("core:labs:CheckFertilize", Labs.LabosIndex.id, weed, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
    elseif plant.state == 7 then
        local ped = PlayerPedId()
        TriggerServerEvent("core:labs:CheckGet", Labs.LabosIndex.id, weed, GetTerritoryFromCoords(Labs.LabosIndex.coords))
        TaskTurnPedToFaceCoord(ped, pos.x, pos.y, pos.z, 1000)
        Citizen.Wait(1000)
        TaskStartScenarioInPlace(ped, "PROP_HUMAN_BUM_BIN", 0, true)
        Citizen.Wait(500)
        ClearPedTasks(ped)
        Citizen.Wait(4000)
        ShowNotification(string.format("Vous avez récolté ~g~%0d~s~ de ~g~feuilles de weed~s~.", _LABS.Weed.CountFeuille))
    end
end

function Labs:StartWeed()
    local player = GetPlayer()
    if Labs.Weed.Thread then return end
    Logger:info('LABORATORIES', 'Load weed')
    Citizen.CreateThread(function()
        Labs.Weed:Load()
        Citizen.CreateThread(function()
            Labs.Weed.Thread = true
            for i = 1, #_LABS.Shell['weed'].spots do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].spots[i].x, _LABS.Shell['weed'].spots[i].y, _LABS.Shell['weed'].spots[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = function() return Labs.Weed:GetWeedMessage(i) or 'Erreur' end,
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if Labs.Weed.working then
                                    ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                else
                                    Labs.Weed:ActionOnPlant(i)
                                end
                            end
                        }
                    }
                })
            end

            for i = 1, #_LABS.Shell['weed'].Rolls do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].Rolls[i].x, _LABS.Shell['weed'].Rolls[i].y, _LABS.Shell['weed'].Rolls[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = 'Rouler',
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if Labs.Weed.working then
                                    ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                else
                                    Labs.Weed.working = true
                                    local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].Rolls[i].x, _LABS.Shell['weed'].Rolls[i].y, _LABS.Shell['weed'].Rolls[i].z)
                                    Labs:PlayLabosAnimation(coords, "anim@amb@business@coc@coc_unpack_cut@", "fullcut_cycle_cokecutter", 2000, 2000, Labs.Weed.Texts.SuccessRoll)
                                    TriggerServerEvent("core:labs:WeedToJoint", GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                    Labs.Weed.working = false
                                end
                            end
                        }
                    }
                })
            end

            for i = 1, #_LABS.Shell['weed'].Packs do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].Packs[i].x, _LABS.Shell['weed'].Packs[i].y, _LABS.Shell['weed'].Packs[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = 'Empocher',
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if Labs.Weed.working then
                                    ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                else
                                    Labs.Weed.working = true
                                    local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['weed'].Packs[i].x, _LABS.Shell['weed'].Packs[i].y, _LABS.Shell['weed'].Packs[i].z)
                                    Labs:PlayLabosAnimation(coords, "anim@amb@business@coc@coc_unpack_cut@", "fullcut_cycle_cokepacker", 4000)
                                    TriggerServerEvent("core:labs:WeedToPack", GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                    Labs.Weed.working = false
                                end
                            end
                        }
                    }
                })
            end
        end)

        Labs.Weed.IsConfig = false
        Labs.Weed.Thread = false
    end)

    Citizen.CreateThread(function()
        Labs.Weed.Thread = true

        while Labs.Weed.Thread and Labs.LabosIndex and Labs.LabosIndex.type == 'weed' do
            for k, plant in pairs(Labs.Weed.plants) do
                plant.state = Labs.Weed:GetState(plant)
                if plant.state >= 1 then
                    if not plant.entity then
                        Labs.Weed:HandleNewState(k, Labs.LabosIndex.id, plant.state)
                    end
                end
                if plant.state ~= plant.previousState then
                    plant.previousState = plant.state
                    Labs.Weed:HandleNewState(k, Labs.LabosIndex.id, plant.state)
                    TriggerServerEvent("core:labs:UpdateState", Labs.LabosIndex.id, plant.state, k)
                end
            end
            Citizen.Wait(500)
        end
        Labs.Weed:Unload()
    end)

end