local os = { time = function() return GetCloudTimeAsInt() end }

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

local function ShowHelpNotification(text)
    BeginTextCommandDisplayHelp("STRING")
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandDisplayHelp(0, false, true, -1)
end

function Labs:StartMeth()
    if Labs.Meth.MethThread then return end
    Logger:info('LABORATORIES', 'Load meth')
    
    Labs.Meth:Load()
    Labs.Meth.MethThread = true

    Citizen.CreateThread(function()
        while Labs.Meth.MethThread and Labs.LabosIndex and Labs.LabosIndex.type == 'meth' do
            local wait = 1000
            local pPed = PlayerPedId()
            local pPos = GetEntityCoords(pPed)

            -- 1. Synthesis components spots
            for i = 1, #_LABS.Shell['meth'].Synthesis do
                local spot = _LABS.Shell['meth'].Synthesis[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 142, 68, 173, 100, false, false, 2, false, nil, nil, false)
                    if dist < 1.3 then
                        ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~Ajouter 5x de Phénylacétone et 5x de Méthylamine~s~.")
                        if IsControlJustReleased(0, 38) then
                            if Labs.Meth.working then
                                ShowNotification("Vous êtes déjà en train de faire une action.")
                            else
                                Labs.Meth.working = true
                                Labs:PlayLabosAnimation(spot, "anim@amb@business@coc@coc_packing@", "fill_basicmould_v2_pressoperator", 3000)
                                TriggerServerEvent("core:labs:addComponents", Labs.LabosIndex.id, i)
                                Labs.Meth.working = false
                            end
                        end
                    end
                end
            end

            -- 2. Synthesis panels
            for i = 1, #_LABS.Shell['meth'].SynthesisPanels do
                local spot = _LABS.Shell['meth'].SynthesisPanels[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 142, 68, 173, 100, false, false, 2, false, nil, nil, false)
                    if dist < 1.3 then
                        ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~Lancer l'image de synthèse~s~.")
                        if IsControlJustReleased(0, 38) then
                            if Labs.Meth.working then
                                ShowNotification("Vous êtes déjà en train de faire une action.")
                            else
                                Labs.Meth.working = true
                                Labs:PlayLabosAnimation(spot, "anim@amb@business@meth@meth_monitoring_cooking@monitoring@", "button_press_monitor", 3000)
                                TriggerServerEvent("core:labs:startSynthesis", Labs.LabosIndex.id, i, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                Labs.Meth.working = false
                            end
                        end
                    end
                end
            end

            -- 3. Synthesis Status Panels
            for i = 1, #_LABS.Shell['meth'].SynthesisStatus do
                local spot = _LABS.Shell['meth'].SynthesisStatus[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 142, 68, 173, 100, false, false, 2, false, nil, nil, false)
                    if dist < 1.3 then
                        local statusStr, actionable = Labs.Meth:GetSynthesisPanelStatus(i)
                        if actionable then
                            ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~" .. statusStr .. "~s~.")
                            if IsControlJustReleased(0, 38) then
                                if Labs.Meth.working then
                                    ShowNotification("Vous êtes déjà en train de faire une action.")
                                else
                                    Labs.Meth.working = true
                                    TriggerServerEvent("core:labs:sendToReduction", Labs.LabosIndex.id, i)
                                    Labs:PlayLabosAnimation(spot, "anim@amb@business@meth@meth_monitoring_cooking@monitoring@", "button_press_monitor", 3000)
                                    TriggerServerEvent("core:labs:startReduction", Labs.LabosIndex.id, i, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                    Labs.Meth.working = false
                                end
                            end
                        else
                            ShowHelpNotification(statusStr or "Calcul en cours...")
                        end
                    end
                end
            end

            -- 4. Reductions Status Panels
            for i = 1, #_LABS.Shell['meth'].ReductionsStatus do
                local spot = _LABS.Shell['meth'].ReductionsStatus[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 142, 68, 173, 100, false, false, 2, false, nil, nil, false)
                    if dist < 1.3 then
                        local statusStr = Labs.Meth:GetReductionPanelStatus(i)
                        ShowHelpNotification(statusStr or "Attente...")
                    end
                end
            end

            -- 5. Plates Spots (Take plates)
            for i = 1, #_LABS.Shell['meth'].Plates do
                local spot = _LABS.Shell['meth'].Plates[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 142, 68, 173, 100, false, false, 2, false, nil, nil, false)
                    if dist < 1.3 then
                        local platesCount = (Labs.Meth.circuits[i] and Labs.Meth.circuits[i].reduction) and Labs.Meth.circuits[i].reduction.plates or 0
                        ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~Récupérer " .. platesCount .. " plateau(x)~s~.")
                        if IsControlJustReleased(0, 38) then
                            if not Labs.Meth.circuits[i].reduction.working then
                                yCore.TriggerServerCallback("core:labs:TakePlateMeth", function(done)
                                    if done then
                                        if Labs.Meth.working then
                                            ShowNotification("Vous êtes déjà en train de faire une action.")
                                        else
                                            Labs.Meth.working = true
                                            local ped = PlayerPedId()
                                            TaskTurnPedToFaceCoord(ped, coords.x, coords.y, coords.z, 1000)
                                            Citizen.Wait(1000)
                                            ShowNotification("~g~Récupération d'un plateau~s~.")
                                            if not Labs.Meth.hasPlate then
                                                Labs.Meth.hasPlate = true
                                                Citizen.CreateThread(function()
                                                    Labs:PlayAnimation(ped, "anim@heists@box_carry@", "idle", -1, 49)
                                                    local object = Labs:AttachEntityToEntity(ped, "bkr_prop_meth_tray_01a", vector3(0.0, -0.23, -0.21), vector3(0.0, -0.23, -0.21), vector3(16.0, -4.0, 1.0))
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
                    end
                end
            end

            -- 6. Breaks spots
            for i = 1, #_LABS.Shell['meth'].Breaks do
                local spot = _LABS.Shell['meth'].Breaks[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 142, 68, 173, 100, false, false, 2, false, nil, nil, false)
                    if dist < 1.3 then
                        ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~Briser la meth~s~.")
                        if IsControlJustReleased(0, 38) then
                            if Labs.Meth.working then
                                ShowNotification("Vous êtes déjà en train de faire une action.")
                            else
                                Labs.Meth.working = true
                                Labs.Meth.hasPlate = false
                                TaskTurnPedToFaceCoord(pPed, coords.x, coords.y, coords.z, 500)
                                Citizen.Wait(500)
                                Labs:PlayAnimation(pPed, "anim@amb@board_room@stenographer@paper@", "break_01_left_amy_skater_01", 3000)
                                Citizen.Wait(3000)
                                TriggerServerEvent("core:labs:GetBrisseMeth")
                                Labs.Meth.working = false
                            end
                        end
                    end
                end
            end

            -- 7. Packs spots
            for i = 1, #_LABS.Shell['meth'].Packs do
                local spot = _LABS.Shell['meth'].Packs[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 46, 204, 113, 100, false, false, 2, false, nil, nil, false)
                    if dist < 1.3 then
                        ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~Empocher la meth~s~.")
                        if IsControlJustReleased(0, 38) then
                            if Labs.Meth.working then
                                ShowNotification("Vous êtes déjà en train de faire une action.")
                            else
                                Labs.Meth.working = true
                                TaskTurnPedToFaceCoord(pPed, coords.x, coords.y, coords.z, 500)
                                Citizen.Wait(500)
                                Labs:PlayAnimation(pPed, "anim@amb@business@coc@coc_unpack_cut@", "fullcut_cycle_cokepacker", 3000)
                                Citizen.Wait(3000)
                                TriggerServerEvent("core:labs:GetEmpocheMeth", GetTerritoryFromCoords(Labs.LabosIndex.coords))
                                Labs.Meth.working = false
                            end
                        end
                    end
                end
            end

            Citizen.Wait(wait)
        end
        Labs.Meth:Unload()
    end)

    Citizen.CreateThread(function()
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