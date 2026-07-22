Labs = Labs or {}
Labs.Coke = Labs.Coke or {}

Labs.Coke.Thread = false 
Labs.Coke.IsConfig = false 

Labs.Coke.trays = {}
Labs.Coke.spots = {}
Labs.Coke.packs = {}

Labs.Coke.hasTray = false

Labs.Coke.working = false

function Labs.Coke:Unload()
    Labs.Coke.trays = {}
    Labs.Coke.spots = {}
    Labs.Coke.packs = {}
    Labs.Coke.Thread = false
    Labs.Coke.hasTray = false
    Labs.Coke.working = false
    Logger:info('LABORATORIES', 'Unload coke')
end

function Labs.Coke:DisplayDuration(remaining)
    local minutes = math.floor(remaining / 60)
    local seconds = math.floor(remaining - minutes * 60)
    return string.format("%02d:%02d", minutes, seconds)
end

function Labs.Coke:GetTrayStatus(key)
    local t = Labs.Coke.trays[key]

    if not t or not t.kerosene or t.kerosene.start == 0 then 
        return  1
    end
    
    local keroseneRemaining = math.max((_LABS.Coke.KeroseneDuration - (os.time() - t.kerosene.start)), 0.0)
    if keroseneRemaining ~= 0.0 then  return 2, string.format("Temps restant : %s", Labs.Coke:DisplayDuration(keroseneRemaining + 1.0)) end

    if not t.coca or t.coca.start == 0 then 
        return 3 
    end
    local cocaRemaining = math.max((_LABS.Coke.CocaDuration - (os.time() - t.coca.start)), 0.0)
    if cocaRemaining ~= 0.0 then 
        return 4, string.format("Temps restant : %s", Labs.Coke:DisplayDuration(cocaRemaining + 1.0)) 
    end

    if not t.whitewash or t.whitewash.start == 0 then return 5 end
    local whitewashRemaining = math.max((_LABS.Coke.WhitewashDuration - (os.time() - t.whitewash.start)), 0.0)
    if whitewashRemaining ~= 0.0 then 
        return 6, string.format("Temps restant : %s", Labs.Coke:DisplayDuration(whitewashRemaining + 1.0)) 
    end    

    return 7
end

function Labs.Coke:ActionOnCoke(key)
    local t = Labs.Coke.trays[key]
    local ped = PlayerPedId()
    local pos = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['coke'].spots[key].x, _LABS.Shell['coke'].spots[key].y, _LABS.Shell['coke'].spots[key].z)

    if not t or not t.kerosene or t.kerosene.start == 0 then
        local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['coke'].spots[key].x, _LABS.Shell['coke'].spots[key].y, _LABS.Shell['coke'].spots[key].z)
        Labs:PlayLabosAnimation(coords, "anim@amb@business@coc@coc_packing@", "fill_basicmould_v2_pressoperator", 3000)
        Rsv("core:labs:CheckKerozen", Labs.LabosIndex.id, key, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
        Labs.Coke.working = false
        return
    end
    if math.max((_LABS.Coke.KeroseneDuration - (os.time() - t.kerosene.start)), 0.0) ~= 0.0 then return end
    if not t.coca or t.coca.start == 0 then
        local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['coke'].spots[key].x, _LABS.Shell['coke'].spots[key].y, _LABS.Shell['coke'].spots[key].z)
        Labs:PlayLabosAnimation(coords, "anim@amb@business@coc@coc_packing@", "fill_basicmould_v2_pressoperator", 3000)
        Rsv("core:labs:CheckCoca", Labs.LabosIndex.id, key, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
        Labs.Coke.working = false
        return
    end
    if math.max((_LABS.Coke.CocaDuration - (os.time() - t.coca.start)), 0.0) ~= 0.0 then return end
    if not t.whitewash or t.whitewash.start == 0 then
        local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, _LABS.Shell['coke'].spots[key].x, _LABS.Shell['coke'].spots[key].y, _LABS.Shell['coke'].spots[key].z)
        Labs:PlayLabosAnimation(coords, "anim@amb@business@coc@coc_packing@", "fill_basicmould_v2_pressoperator", 3000, 3000, "~g~Ajout de la chaux.")
        Rsv("core:labs:CheckWhitewash", Labs.LabosIndex.id, key, os.time(), GetTerritoryFromCoords(Labs.LabosIndex.coords))
        Labs.Coke.working = false
        return
    end
    if math.max((_LABS.Coke.WhitewashDuration - (os.time() - t.whitewash.start)), 0.0) ~= 0.0 then 
        return 
    end
    TaskTurnPedToFaceCoord(ped, pos.x, pos.y, pos.z, 500)
    Rsv("core:labs:takeCokeTray", Labs.LabosIndex.id, key, GetTerritoryFromCoords(Labs.LabosIndex.coords))
    Citizen.Wait(500)
    ShowNotification("~g~Récupération du bac de cocaïne.")
    if not Labs.Coke.hasTray then
        Labs.Coke.hasTray = true
        Citizen.CreateThread(function()
            Labs:PlayAnimation(ped, "anim@heists@box_carry@", "idle", -1, 49)                    
            local hash = Labs:RequestModel("bkr_prop_coke_tub_01a")
            local object = CreateObject(hash, 0.05, -0.35, -0.17, true, true, true)
            SetModelAsNoLongerNeeded(hash)
            AttachEntityToEntity(object, ped, GetPedBoneIndex(ped, 28422), 0.05, -0.35, -0.17,  316.0, 403.0, -261.0, true, true, false, true, 1, true)
            
            while Labs.Coke.hasTray do                                    
                Utils.ShowHelpNotification("Appuyez sur ~INPUT_ENTER~ pour ~y~ranger~s~.")
                if IsControlJustPressed(0, 23) then
                    Labs.Coke.hasTray = false
                end
                Citizen.Wait(1)
            end                                
            DeleteObject(object)
            ClearPedTasks(ped)
            Labs.Coke.hasTray = false
        end)
    end
 end

local function ShowHelpNotification(text)
    BeginTextCommandDisplayHelp("STRING")
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandDisplayHelp(0, false, true, -1)
end

function Labs:StartCoke()
    if Labs.Coke.Thread then return end
    Labs.Coke.trays = Labs:DeepCopy(Labs.LabosIndex.trays[1])
    Logger:info('LABORATORIES', 'Load coke')
    
    Labs.Coke.Thread = true
    
    local function GetActionLabel(status)
        if status == 1 then
            return "verser du kérosène"
        elseif status == 3 then
            return "ajouter des feuilles de coca"
        elseif status == 5 then
            return "verser de la chaux"
        elseif status == 7 then
            return "récupérer le bac de cocaïne"
        end
        return ""
    end

    Citizen.CreateThread(function()
        while Labs.Coke.Thread and Labs.LabosIndex and Labs.LabosIndex.type == 'coke' do
            local wait = 1000
            local pPed = PlayerPedId()
            local pPos = GetEntityCoords(pPed)
            
            -- Trays spots
            for i = 1, #_LABS.Shell['coke'].spots do
                local spot = _LABS.Shell['coke'].spots[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, spot.x, spot.y, spot.z)
                local dist = #(pPos - coords)
                
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 52, 152, 219, 100, false, false, 2, false, nil, nil, false)
                    
                    if dist < 1.3 then
                        local status, text = Labs.Coke:GetTrayStatus(i)
                        if status == 1 or status == 3 or status == 5 or status == 7 then
                            ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~" .. GetActionLabel(status) .. "~s~.")
                            if IsControlJustReleased(0, 38) then
                                if Labs.Coke.working then
                                    ShowNotification("Vous êtes déjà en train de faire une action.")
                                else
                                    Labs.Coke:ActionOnCoke(i)
                                end
                            end
                        elseif status == 2 or status == 4 or status == 6 then
                            ShowHelpNotification(text or "En cours de traitement...")
                        end
                    end
                end
            end
            
            -- Packs spots
            for i = 1, #_LABS.Shell['coke'].packs do
                local pack = _LABS.Shell['coke'].packs[i]
                local coords = GetOffsetFromEntityInWorldCoords(Labs.LabosIndex.model, pack.x, pack.y, pack.z)
                local dist = #(pPos - coords)
                
                if dist < 5.0 then
                    wait = 0
                    DrawMarker(1, coords.x, coords.y, coords.z - 0.95, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.5, 46, 204, 113, 100, false, false, 2, false, nil, nil, false)
                    
                    if dist < 1.3 then
                        ShowHelpNotification("Appuyez sur ~INPUT_CONTEXT~ pour ~y~Empocher la cocaïne~s~.")
                        if IsControlJustReleased(0, 38) then
                            if Labs.Coke.working then
                                ShowNotification("Vous êtes déjà en train de faire une action.")
                            else
                                Labs.Coke.hasTray = false
                                local ped = PlayerPedId()
                                TaskTurnPedToFaceCoord(ped, coords.x, coords.y, coords.z, 500)
                                Citizen.Wait(500)
                                Labs:PlayAnimation(ped, "anim@amb@board_room@stenographer@paper@", "break_01_left_amy_skater_01", 3000)
                                Citizen.Wait(3000)
                                ShowNotification("Vous avez empoché ~g~" .. _LABS.Coke.CountCocaine .. " cocaïnes~s~.")
                                Labs.Coke.working = false
                                Rsv("core:labs:GetEmpocheCoke", GetTerritoryFromCoords(Labs.LabosIndex.coords))
                            end
                        end
                    end
                end
            end
            
            Citizen.Wait(wait)
        end
        Labs.Coke:Unload()
    end)
end

RegisterNetEvent("core:labs:addKerosene")
AddEventHandler("core:labs:addKerosene", function(labo, tray, timer)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, tray = tray, timer = timer})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Coke.trays[tray].kerosene = { start = timer}
    end
end)

RegisterNetEvent("core:labs:addCoca")
AddEventHandler("core:labs:addCoca", function(labo, tray, timer)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, tray = tray, timer = timer})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Coke.trays[tray].coca = { start = timer }        
    end
end)

RegisterNetEvent("core:labs:addWhitewash")
AddEventHandler("core:labs:addWhitewash", function(labo, tray, timer)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, tray = tray, timer = timer})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Coke.trays[tray].whitewash = { start = timer }
    end
end)

RegisterNetEvent("core:labs:takeCokeTray")
AddEventHandler("core:labs:takeCokeTray", function(labo, tray)
    Logger:debug(Labs.LabosIndex.id, {labo = labo, tray = tray})
    if Labs.LabosIndex and Labs.LabosIndex.id == labo then
        Citizen.Wait(3000)
        Labs.Coke.trays[tray].kerosene.start = 0
        Labs.Coke.trays[tray].coca.start = 0
        Labs.Coke.trays[tray].whitewash.start = 0
    end
end)