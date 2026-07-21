Labs.Meth = Labs.Meth or {}

Labs.Meth.MethThread = false

Labs.Meth.circuits = {}
Labs.Meth.synthesis = {}
Labs.Meth.synthesispanels = {}
Labs.Meth.synthesisstatus = {}
Labs.Meth.reductions = {}
Labs.Meth.reductionsstatus = {}
Labs.Meth.plates = {}
Labs.Meth.breaks = {}
Labs.Meth.packs = {}

Labs.Meth.working = false
Labs.Meth.hasPlate = false

function Labs:OnMethModify()
    Labs.Meth:Load(true)
end

function Labs.Meth:Load(onlyPosition)
    Labs.Meth.synthesis = {}
    Labs.Meth.synthesispanels = {}
    Labs.Meth.synthesisstatus = {}
    Labs.Meth.reductions = {}
    Labs.Meth.reductionsstatus = {}
    Labs.Meth.plates = {}
    Labs.Meth.breaks = {}
    Labs.Meth.packs = {}
    if onlyPosition then return end
    Labs.Meth.circuits = Labs:DeepCopy(Labs.LabosIndex.circuits[1])
    Labs.Meth.working = false
    Labs.Meth.hasPlate = false
end

function Labs.Meth:Unload()
    Labs.Meth.circuits = {}
    Labs.Meth.synthesis = {}
    Labs.Meth.synthesispanels = {}
    Labs.Meth.synthesisstatus = {}
    Labs.Meth.reductions = {}
    Labs.Meth.reductionsstatus = {}
    Labs.Meth.plates = {}
    Labs.Meth.breaks = {}
    Labs.Meth.packs = {}
    Labs.Meth.MethThread = false
    Labs.Meth.working = false
    Labs.Meth.hasPlate = false
    Logger:info('LABORATORIES', 'Unload meth')
end

function Labs.Meth:GetSynthesisPanelStatus(key)
    local s = Labs.Meth.circuits[key].synthesis
    if s then
        if s.working then
            local remaining = math.max((_LABS.Meth.SynthesisDuration - (os.time() - s.start)) + 1.0, 0.0)
            local minutes = math.floor(remaining / 60)
            local seconds = math.floor(remaining - minutes * 60)
            if minutes == 0 and seconds == 0 then
                return "L'envoyer à la réduction", true
            end
            return string.format('Temps restant : %02d:%02d', minutes, seconds)
        end
        local max = _LABS.Meth.Tanks[Labs.LabosIndex.level]
        return string.format('En attente de Phénylacétone (%0d/%0d) et Méthylamine (%0d/%0d)', s.phenylacetone, max,
            s.methylamine, max)
    else
        return ""
    end
end

function Labs.Meth:GetReductionPanelStatus(key)
    local r = Labs.Meth.circuits[key].reduction
    if not r.working then
        if r.plates > 0 then return string.format("%0d plateaux en attente de réduction", r.plates) end
        return 'En attente de la synthèse'
    end
    local remaining = math.max((_LABS.Meth.ReductionDuration - (os.time() - r.start)) + 1.0, 0.0)
    local minutes = math.floor(remaining / 60)
    local seconds = math.floor(remaining - minutes * 60)
    if minutes == 0 and seconds == 0 then
        TriggerServerEvent("core:labs:FinishReduction", Labs.LabosIndex.id, key, false, r.plates)
        return 'Terminé'
    end
    return string.format('Temps restant : %02d:%02d', minutes, seconds)
end

function Labs:StartMeth()
    local player = GetPlayer()
    if Labs.Meth.MethThread then return end
    Logger:info('LABORATORIES', 'Load meth')
    Citizen.CreateThread(function()
        Labs.Meth:Load()
        Citizen.CreateThread(function()
            Labs.Meth.MethThread = true

            for i = 1, #_LABS.Shell['meth'].Synthesis do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].Synthesis[i].x,
                        _LABS.Shell['meth'].Synthesis[i].y, _LABS.Shell['meth'].Synthesis[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = GetPhrase("Ajouter 5x de Phénylacétone et 5x de Méthylamine"),
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if Labs.Meth.working then
                                    ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                else
                                    Labs.Meth.working = true
                                    Labs:PlayLabosAnimation(_LABS.Shell['meth'].Synthesis[i], "anim@amb@business@coc@coc_packing@", "fill_basicmould_v2_pressoperator", 3000)
                                    TriggerServerEvent("core:labs:addComponents", Labs.LabosIndex.id, i)
                                    Labs.Meth.working = false
                                end
                            end
                        }
                    }
                })
            end

            for i = 1, #_LABS.Shell['meth'].SynthesisPanels do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model,
                        _LABS.Shell['meth'].SynthesisPanels[i].x, _LABS.Shell['meth'].SynthesisPanels[i].y,
                        _LABS.Shell['meth'].SynthesisPanels[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = GetPhrase("Lancer l'image de synthèse"),
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if Labs.Meth.working then
                                    ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                else
                                    Labs.Meth.working = true
                                    Labs:PlayLabosAnimation(_LABS.Shell['meth'].SynthesisPanels[i],
                                        "anim@amb@business@meth@meth_monitoring_cooking@monitoring@",
                                        "button_press_monitor", 3000)
                                    TriggerServerEvent("core:labs:startSynthesis", Labs.LabosIndex.id, i, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                    Labs.Meth.working = false
                                end
                            end
                        }
                    }
                })
            end


            for i = 1, #_LABS.Shell['meth'].SynthesisStatus do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model,
                        _LABS.Shell['meth'].SynthesisStatus[i].x, _LABS.Shell['meth'].SynthesisStatus[i].y,
                        _LABS.Shell['meth'].SynthesisStatus[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = function() return Labs.Meth:GetSynthesisPanelStatus(i) end,
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                local status, actionable = Labs.Meth:GetSynthesisPanelStatus(i)
                                if actionable then
                                    if Labs.Meth.working then
                                        ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                    else
                                        Labs.Meth.working = true
                                        TriggerServerEvent("core:labs:sendToReduction", Labs.LabosIndex.id, i)
                                        local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].SynthesisStatus[i].x, _LABS.Shell['meth'].SynthesisStatus[i].y, _LABS.Shell['meth'].SynthesisStatus[i].z)
                                        Labs:PlayLabosAnimation(coords, "anim@amb@business@meth@meth_monitoring_cooking@monitoring@", "button_press_monitor", 3000)
                                        TriggerServerEvent("core:labs:startReduction", Labs.LabosIndex.id, i, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                        Labs.Meth.working = false
                                    end
                                end
                            end
                        }
                    }
                })
            end


            for i = 1, #_LABS.Shell['meth'].ReductionsStatus do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model,
                        _LABS.Shell['meth'].ReductionsStatus[i].x, _LABS.Shell['meth'].ReductionsStatus[i].y,
                        _LABS.Shell['meth'].ReductionsStatus[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = function() return Labs.Meth:GetReductionPanelStatus(i) end,
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                            end
                        }
                    }
                })
            end

            for i = 1, #_LABS.Shell['meth'].Plates do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].Plates[i].x,
                        _LABS.Shell['meth'].Plates[i].y, _LABS.Shell['meth'].Plates[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = function()
                                return ('Récupérer %0d plateaux'):format(Labs.Meth.circuits[i]
                                    .reduction.plates)
                            end,
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if not Labs.Meth.circuits[i].reduction.working then
                                    yCore.TriggerServerCallback("core:labs:TakePlateMeth", function(done)
                                        if done then
                                            if Labs.Meth.working then
                                                ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                            else
                                                Labs.Meth.working = true
                                                local ped = PlayerPedId()
                                                local pos =  GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].Plates[i].x, _LABS.Shell['meth'].Plates[i].y, _LABS.Shell['meth'].Plates[i].z)
                                                TaskTurnPedToFaceCoord(ped, pos.x, pos.y, pos.z, 1000)
                                                Citizen.Wait(1000)
                                                ShowNotification("~g~Récupération d'un plateau~s~.")
                                                if not Labs.Meth.hasPlate then
                                                    Labs.Meth.hasPlate = true
                                                    Citizen.CreateThread(function()
                                                        Labs:PlayAnimation(ped, "anim@heists@box_carry@", "idle", -1, 49)
                                                        local object = Labs:AttachEntityToEntity(ped,
                                                            "bkr_prop_meth_tray_01a", vector3(0.0, -0.23, -0.21),
                                                            vector3(0.0, -0.23, -0.21), vector3(16.0, -4.0, 1.0))
                                                        while Labs.Meth.hasPlate do
                                                            ShowHelpNotification("Appuyez sur ~INPUT_ENTER~ pour ~y~ranger~s~.")
                                                            if IsControlJustPressed(0, 23) then
                                                                Labs.Meth.hasPlate = false
                                                                Labs.Meth.working = false
                                                            end
                                                            Citizen.Wait(1)
                                                        end
                                                        DeleteObject(object)
                                                        ClearPedTasks(ped)
                                                        Labs.Meth.hasPlate = false
                                                    end)
                                                end
                                                Labs.Meth.working = false
                                            end
                                        else
                                            ShowNotification("~r~Il n'y a plus de plateaux de meths~s~.")
                                        end
                                    end, Labs.LabosIndex.id, i, GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                else
                                    ShowNotification("~r~La synthèse n'est pas terminée~s~.")
                                end
                            end
                        }
                    }
                })
            end

            for i = 1, #_LABS.Shell['meth'].Breaks do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].Breaks[i].x,
                        _LABS.Shell['meth'].Breaks[i].y, _LABS.Shell['meth'].Breaks[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = 'Briser la meth',
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if Labs.Meth.working then
                                    ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                else
                                    Labs.Meth.working = true
                                    Labs.Meth.hasPlate = false
                                    local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].Breaks[i].x, _LABS.Shell['meth'].Breaks[i].y, _LABS.Shell['meth'].Breaks[i].z)
                                    Labs:PlayLabosAnimation(coords, "anim@amb@board_room@stenographer@paper@", "break_01_left_amy_skater_01", 3000)
                                    TriggerServerEvent("core:labs:GetBrisseMeth")
                                    Labs.Meth.working = false
                                end
                            end
                        }
                    }
                })
            end

            for i = 1, #_LABS.Shell['meth'].Packs do
                Labs.LabosIndex.interact_temp[#Labs.LabosIndex.interact_temp + 1] = InteractAPI.addInteraction({
                    coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].Packs[i].x, _LABS.Shell['meth'].Packs[i].y, _LABS.Shell['meth'].Packs[i].z),
                    distance = 2.5,
                    interactDst = 1.5,
                    offset = vec(0.0, 0.0, 0.0),
                    options = {
                        {
                            label = 'Empocher la meth',
                            canInteract = function(entity, coords, args)
                                return (player:Can())
                            end,
                            action = function(entity, coords, args)
                                if Labs.Meth.working then
                                    ShowNotification(GetPhrase('LABS_AlreadyInAction'))
                                else
                                    Labs.Meth.working = true
                                    local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['meth'].Packs[i].x, _LABS.Shell['meth'].Packs[i].y, _LABS.Shell['meth'].Packs[i].z)
                                    Labs:PlayLabosAnimation(coords, "anim@amb@business@coc@coc_unpack_cut@", "fullcut_cycle_cokepacker", 3000)
                                    TriggerServerEvent("core:labs:GetEmpocheMeth", GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                    Labs.Meth.working = false
                                end
                            end
                        }
                    }
                })
            end
        end)
    end)

    Citizen.CreateThread(function()
        Labs.Meth.MethThread = true
        while Labs.Meth.MethThread and Labs.LabosIndex and Labs.LabosIndex.type == 'meth' do
            for k, v in pairs(Labs.Meth.circuits) do
                local reduc = v.reduction
                if reduc.start then
                    local remaining = math.max((_LABS.Meth.ReductionDuration - (os.time() - reduc.start)) + 1.0, 0.0)
                    local minutes = math.floor(remaining / 60)
                    local seconds = math.floor(remaining - minutes * 60)
                    if minutes == 0 and seconds == 0 then
                        if reduc.working then
                            reduc.working = false
                            TriggerServerEvent("core:labs:UpdateStatesMeth", Labs.LabosIndex.id, k, reduc.working)
                        end
                    end
                end
            end
            Citizen.Wait(500)
        end
        Labs.Meth:Unload()
    end)
end

RegisterNetEvent("core:labs:addComponents")
AddEventHandler("core:labs:addComponents", function(labo, circuit, phenylacetone, methylamine)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, circuit = circuit, phenylacetone = phenylacetone, methylamine = methylamine})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Meth.circuits[circuit].synthesis.phenylacetone = phenylacetone
        Labs.Meth.circuits[circuit].synthesis.methylamine = methylamine
    end
end)

RegisterNetEvent("core:labs:startSynthesis")
AddEventHandler("core:labs:startSynthesis", function(labo, circuit, timer)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, circuit = circuit, timer = timer})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Meth.circuits[circuit].synthesis.start = timer
        Labs.Meth.circuits[circuit].synthesis.working = true
    end
end)

RegisterNetEvent("core:labs:sendToReduction")
AddEventHandler("core:labs:sendToReduction", function(labo, circuit, plates)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, circuit = circuit, plates = plates})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Meth.circuits[circuit].synthesis.phenylacetone = 0
        Labs.Meth.circuits[circuit].synthesis.methylamine = 0
        Labs.Meth.circuits[circuit].synthesis.start = nil
        Labs.Meth.circuits[circuit].synthesis.working = false
        Labs.Meth.circuits[circuit].reduction.plates = plates
    end
end)

RegisterNetEvent("core:labs:startReduction")
AddEventHandler("core:labs:startReduction", function(labo, circuit, timer)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, circuit = circuit, timer = timer})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Meth.circuits[circuit].reduction.start = timer
        Labs.Meth.circuits[circuit].reduction.working = true
    end
end)

RegisterNetEvent("core:labs:takePlate")
AddEventHandler("core:labs:takePlate", function(labo, circuit, plates)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, circuit = circuit, plates = plates})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Meth.circuits[circuit].reduction.plates = plates
        if plates == 0 then
            Labs.Meth.circuits[circuit].reduction.working = false
            Labs.Meth.circuits[circuit].reduction.start = nil
        end
    end
end)