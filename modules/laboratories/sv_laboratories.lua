Labs = Labs or {}

Labs.Table = {}
Labs.Weed = Labs.Weed or {}

Labs.WeedsServer = {}
Labs.TraysServer = {}
Labs.CircuitsServer = {}


RegisterNetEvent("core:labs:UpdateState")
AddEventHandler("core:labs:UpdateState", function(labo, state, weed)
    if state ~= 0 then
        Labs.WeedsServer[labo][weed].state = state
    end
end)

RegisterNetEvent("core:labs:UpdateProps")
AddEventHandler("core:labs:UpdateProps", function(entity, labo, weed)
    Labs.WeedsServer[labo][weed].entity = entity
end)

RegisterServerEvent("core:labs:CheckPlant")
AddEventHandler("core:labs:CheckPlant", function(labo, weed)
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Weed.ItemGraine)

    if Required.count >= _LABS.Weed.CountRequiredGraine then
        Labs.WeedsServer[labo][weed].planted = true
        TriggerClientEvent("core:labs:PlantWeed", -1, labo, weed)
        xPlayer.removeInventoryItem(_LABS.Weed.ItemGraine, _LABS.Weed.CountRequiredGraine)
        AddLabInfluence(source, 'weedPlant')
        Notify(source, GetPhrase('weed_plant_success'))
    else
        local label = GetItemLabel(_LABS.Weed.ItemGraine)
        Notify(source, GetPhrase('not_enough_to_plant', label))
    end
end)

RegisterServerEvent("core:labs:CheckFertilize")
AddEventHandler("core:labs:CheckFertilize", function(labo, weed, timer)
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Weed.ItemFerti)

    if Required.count >= _LABS.Weed.CountRequiredFerti then
        Labs.WeedsServer[labo][weed].start = timer
        Labs.WeedsServer[labo][weed].fertilized = true
        TriggerClientEvent("core:labs:FertilizeWeed", -1, labo, weed)
        xPlayer.removeInventoryItem(_LABS.Weed.ItemFerti, _LABS.Weed.CountRequiredFerti)
        AddLabInfluence(source, 'weedFertilize')
        Notify(source, GetPhrase('weed_fertilize_success'))
        if weed == 1 then
            for k, v in pairs(Labs.Table) do
                if v.id == labo then
                    v.start = GetGameTimer()
                end
            end
        end
    else
        local label = GetItemLabel(_LABS.Weed.ItemFerti)
        Notify(source, GetPhrase('not_enough_to_fertilize', label))
    end
end)

RegisterServerEvent("core:labs:WeedToJoint")
AddEventHandler("core:labs:WeedToJoint", function()
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Weed.ItemFeuille)

    if Required.count >= _LABS.Weed.CountRequiredJoint then
        xPlayer.removeInventoryItem(_LABS.Weed.ItemFeuille, _LABS.Weed.CountRequiredJoint)
        xPlayer.addInventoryItem(_LABS.Weed.ItemJoint, _LABS.Weed.CountJoint)
        AddLabInfluence(source, 'weedJoint')
        Notify(source, GetPhrase('weed_joint_success', _LABS.Weed.CountJoint))
    else
        local label = GetItemLabel(_LABS.Weed.ItemFeuille)
        Notify(source, GetPhrase('not_enough_to_process', label))
    end
end)

RegisterServerEvent("core:labs:WeedToPack")
AddEventHandler("core:labs:WeedToPack", function()
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Weed.ItemFeuille)
    local Required2 = xPlayer.getInventoryItem(_LABS.Weed.ItemBags)

    if Required.count >= _LABS.Weed.CountRequiredPack then
        if Required2.count >= _LABS.Weed.CountRequiredBags then
            xPlayer.removeInventoryItem(_LABS.Weed.ItemFeuille, _LABS.Weed.CountRequiredPack)
            xPlayer.removeInventoryItem(_LABS.Weed.ItemBags, _LABS.Weed.CountRequiredBags)
            xPlayer.addInventoryItem(_LABS.Weed.ItemWeed, _LABS.Weed.CountWeed)
            AddLabInfluence(source, 'weedEmpoche')
            Notify(source, GetPhrase('weed_pack_success', _LABS.Weed.CountWeed))
        else
            local label = GetItemLabel(_LABS.Weed.ItemBags)
            Notify(source, GetPhrase('not_enough_to_pocket', label))
        end
    else
        local label = GetItemLabel(_LABS.Weed.ItemFeuille)
        Notify(source, GetPhrase('not_enough_to_pocket', label))
    end
end)

RegisterServerEvent("core:labs:CheckGet")
AddEventHandler("core:labs:CheckGet", function(labo, weed)
    local xPlayer = Bridge.GetPlayer(source)
    if Labs.WeedsServer[labo][weed].state == 7 then
        Labs.WeedsServer[labo][weed] = { planted = false, fertilized = false, pickable = false, state = 0, previousState = -1, start = nil }
        TriggerClientEvent("core:labs:GetWeed", -1, labo, weed)
        AddLabInfluence(source, 'weedCut')
        xPlayer.addInventoryItem(_LABS.Weed.ItemFeuille, _LABS.Weed.CountFeuille)
        Notify(source, GetPhrase('weed_harvest_success', _LABS.Weed.CountFeuille))
    end
end)


RegisterServerEvent("core:labs:CheckKerozen")
AddEventHandler("core:labs:CheckKerozen", function(labo, tray, timer)
    local xPlayer = Bridge.GetPlayer(source)
    local Required = xPlayer.getInventoryItem(_LABS.Coke.ItemKerozen)
    if Required.count >= _LABS.Coke.CountRequiredKerozen then
        Labs.TraysServer[labo][tray].kerosene.start = timer
        TriggerClientEvent("core:labs:addKerosene", -1, labo, tray, timer)
        xPlayer.removeInventoryItem(_LABS.Coke.ItemKerozen, _LABS.Coke.CountRequiredKerozen)
        local label = GetItemLabel(_LABS.Coke.ItemKerozen)
        AddLabInfluence(source, 'cokeKerozen')
        Notify(source, GetPhrase('item_added', label))
    else
        local label = GetItemLabel(_LABS.Coke.ItemKerozen)
        Notify(source, GetPhrase('not_enough_to_deposit', label))
    end
end)

RegisterServerEvent("core:labs:CheckCoca")
AddEventHandler("core:labs:CheckCoca", function(labo, tray, timer)
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Coke.ItemCoca)

    if Required.count >= _LABS.Coke.CountRequiredCoca then
        Labs.TraysServer[labo][tray].coca.start = timer
        TriggerClientEvent("core:labs:addCoca", -1, labo, tray, timer)
        xPlayer.removeInventoryItem(_LABS.Coke.ItemCoca, _LABS.Coke.CountRequiredCoca)
        local label = GetItemLabel(_LABS.Coke.ItemCoca)
        AddLabInfluence(source, 'cokeFeuille')
        Notify(source, GetPhrase('item_added', label))
    else
        local label = GetItemLabel(_LABS.Coke.ItemCoca)
        Notify(source, GetPhrase('not_enough_to_deposit', label))
    end
end)

RegisterServerEvent("core:labs:CheckWhitewash")
AddEventHandler("core:labs:CheckWhitewash", function(labo, tray, timer)
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Coke.ItemWhitewash)

    if Required.count >= _LABS.Coke.CountRequiredWhitewash then
        Labs.TraysServer[labo][tray].whitewash.start = timer
        TriggerClientEvent("core:labs:addWhitewash", -1, labo, tray, timer)
        xPlayer.removeInventoryItem(_LABS.Coke.ItemWhitewash, _LABS.Coke.CountRequiredWhitewash)
        local label = GetItemLabel(_LABS.Coke.ItemWhitewash)
        AddLabInfluence(source, 'cokeWhiteWash')
        Notify(source, GetPhrase('item_added', label))
    else
        local label = GetItemLabel(_LABS.Coke.ItemWhitewash)
        Notify(source, GetPhrase('not_enough_to_deposit', label))
    end
end)

RegisterServerEvent("core:labs:takeCokeTray")
AddEventHandler("core:labs:takeCokeTray", function(labo, tray)
    local xPlayer = Bridge.GetPlayer(source)

    Labs.TraysServer[labo][tray].whitewash.start = 0
    Labs.TraysServer[labo][tray].coca.start = 0
    Labs.TraysServer[labo][tray].kerosene.start = 0

    TriggerClientEvent("core:labs:takeCokeTray", -1, labo, tray)
    xPlayer.addInventoryItem(_LABS.Coke.ItemRecip, _LABS.Coke.CountRecip)
    AddLabInfluence(source, 'cokeTray')
    Notify(source, GetPhrase('coke_tray_harvest_success', _LABS.Coke.CountRecip))
end)

RegisterServerEvent("core:labs:GetEmpocheCoke")
AddEventHandler("core:labs:GetEmpocheCoke", function()
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Coke.ItemRecip)

    if Required.count >= 1 then
        xPlayer.addInventoryItem(_LABS.Coke.ItemCoke, _LABS.Coke.CountCocaine)
        xPlayer.removeInventoryItem(_LABS.Coke.ItemRecip, 1)
        AddLabInfluence(source, 'cokeEmpoche')
        local label = GetItemLabel(_LABS.Coke.ItemRecip)
        Notify(source, GetPhrase('item_added', label))
    else
        local label = GetItemLabel(_LABS.Coke.ItemRecip)
        Notify(source, GetPhrase('not_enough_to_deposit', label))
    end
end)

RegisterServerEvent("core:labs:addComponents")
AddEventHandler("core:labs:addComponents", function(labo, spot)
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Meth.ItemMethylamine)
    local Required2 = xPlayer.getInventoryItem(_LABS.Meth.ItemPhenylacetone)

    if Labs.CircuitsServer[labo][spot].synthesis.phenylacetone < _LABS.Meth.Tanks[2] then
        if Required.count >= _LABS.Meth.CountRequiredKMethylamine then
            if Required2.count >= _LABS.Meth.CountRequiredPhenylacetone then
                xPlayer.removeInventoryItem(_LABS.Meth.ItemMethylamine, _LABS.Meth.CountRequiredKMethylamine)
                xPlayer.removeInventoryItem(_LABS.Meth.ItemPhenylacetone, _LABS.Meth.CountRequiredPhenylacetone)

                Labs.CircuitsServer[labo][spot].synthesis.phenylacetone = Labs.CircuitsServer[labo][spot].synthesis
                    .phenylacetone + _LABS.Meth.CountRequiredPhenylacetone
                Labs.CircuitsServer[labo][spot].synthesis.methylamine = Labs.CircuitsServer[labo][spot].synthesis
                    .methylamine + _LABS.Meth.CountRequiredKMethylamine
                TriggerClientEvent("core:labs:addComponents", -1, labo, spot,
                    Labs.CircuitsServer[labo][spot].synthesis.phenylacetone,
                    Labs.CircuitsServer[labo][spot].synthesis.methylamine)

                Notify(source, GetPhrase('meth_components_added'))
            else
                local label = GetItemLabel(_LABS.Meth.ItemPhenylacetone)
                Notify(source, GetPhrase('not_enough_to_deposit', label))
            end
        else
            local label = GetItemLabel(_LABS.Meth.ItemMethylamine)
            Notify(source, GetPhrase('not_enough_to_deposit', label))
        end
    else
        Notify(source, GetPhrase('meth_tank_full'))
    end
end)

RegisterServerEvent("core:labs:startSynthesis")
AddEventHandler("core:labs:startSynthesis", function(labo, spot, timer)
    local xPlayer = Bridge.GetPlayer(source)

    if not Labs.CircuitsServer[labo][spot].synthesis.start then
        if Labs.CircuitsServer[labo][spot].synthesis.phenylacetone >= _LABS.Meth.Tanks[2] then
            if Labs.CircuitsServer[labo][spot].synthesis.methylamine >= _LABS.Meth.Tanks[2] then
                Labs.CircuitsServer[labo][spot].synthesis.start = timer
                Labs.CircuitsServer[labo][spot].synthesis.working = true
                AddLabInfluence(source, 'methStartSynthesis')
                TriggerClientEvent("core:labs:startSynthesis", -1, labo, spot, timer)
                Notify(source, GetPhrase('meth_synthesis_started'))
            else
                local label = GetItemLabel(_LABS.Meth.ItemMethylamine)
                Notify(source, GetPhrase('meth_not_enough_synthesis', label))
            end
        else
            local label = GetItemLabel(_LABS.Meth.ItemPhenylacetone)
            Notify(source, GetPhrase('meth_not_enough_synthesis', label))
        end
    else
        Notify(source, GetPhrase('meth_synthesis_in_progress'))
    end
end)

RegisterServerEvent("core:labs:sendToReduction")
AddEventHandler("core:labs:sendToReduction", function(labo, spot, timer)
    local xPlayer = Bridge.GetPlayer(source)

    if xPlayer and Labs.CircuitsServer[labo][spot].reduction.plates == 0 then
        if Labs.CircuitsServer[labo][spot].synthesis.phenylacetone >= _LABS.Meth.Tanks[2] then
            if Labs.CircuitsServer[labo][spot].synthesis.methylamine >= _LABS.Meth.Tanks[2] then
                Labs.CircuitsServer[labo][spot].synthesis.phenylacetone = 0
                Labs.CircuitsServer[labo][spot].synthesis.methylamine = 0
                Labs.CircuitsServer[labo][spot].synthesis.start = nil
                Labs.CircuitsServer[labo][spot].synthesis.working = false
                Labs.CircuitsServer[labo][spot].reduction.plates = Labs.CircuitsServer[labo][spot].reduction.plates +
                    _LABS.Meth.CountRecip
                TriggerClientEvent("core:labs:sendToReduction", -1, labo, spot,
                    Labs.CircuitsServer[labo][spot].reduction.plates)
                Notify(source, GetPhrase('meth_reduction_transferred'))
            else
                local label = GetItemLabel(_LABS.Meth.ItemMethylamine)
                Notify(source, GetPhrase('meth_not_enough_reduction', label))
            end
        else
            local label = GetItemLabel(_LABS.Meth.ItemPhenylacetone)
            Notify(source, GetPhrase('meth_not_enough_reduction', label))
        end
    else
        local label = GetItemLabel(_LABS.Meth.ItemRecip)
        Notify(source, GetPhrase('meth_tank_full'))
    end
end)

RegisterServerEvent("core:labs:startReduction")
AddEventHandler("core:labs:startReduction", function(labo, spot, timer)
    local xPlayer = Bridge.GetPlayer(source)

    if xPlayer and not Labs.CircuitsServer[labo][spot].reduction.start then
        if Labs.CircuitsServer[labo][spot].reduction.plates > 0 then
            Labs.CircuitsServer[labo][spot].reduction.start = timer
            Labs.CircuitsServer[labo][spot].reduction.working = true
            AddLabInfluence(source, 'methStartReduction')
            TriggerClientEvent("core:labs:startReduction", -1, labo, spot, timer)
            Notify(source, GetPhrase('meth_reduction_started'))
        else
            Notify(source, GetPhrase('meth_tank_empty'))
        end
    else
        Notify(source, GetPhrase('meth_reduction_in_progress'))
    end
end)

RegisterServerCallback("core:labs:TakePlateMeth", function(source, labo, spot)
    local xPlayer = Bridge.GetPlayer(source)

    if Labs.CircuitsServer[labo][spot].reduction.plates > 0 then
        Labs.CircuitsServer[labo][spot].reduction.plates = Labs.CircuitsServer[labo][spot].reduction.plates - 1
        xPlayer.addInventoryItem(_LABS.Meth.ItemRecip, 1)
        AddLabInfluence(source, 'methPlate')
        TriggerClientEvent("core:labs:takePlate", -1, labo, spot, Labs.CircuitsServer[labo][spot].reduction.plates)
        Notify(source, GetPhrase('meth_take_plate_success'))
        return true
    else
        Labs.CircuitsServer[labo][spot].reduction.start = nil
        Labs.CircuitsServer[labo][spot].reduction.working = false
        TriggerClientEvent("core:labs:takePlate", -1, labo, spot, Labs.CircuitsServer[labo][spot].reduction.plates)
        return false
    end
end)

RegisterServerEvent("core:labs:UpdateStatesMeth")
AddEventHandler("core:labs:UpdateStatesMeth", function(labo, spot, bool)
    Labs.CircuitsServer[labo][spot].reduction.working = bool
end)

RegisterServerEvent("core:labs:GetBrisseMeth")
AddEventHandler("core:labs:GetBrisseMeth", function()
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Meth.ItemRecip)

    if Required.count >= 1 then
        xPlayer.addInventoryItem(_LABS.Meth.ItemBack, 1)
        xPlayer.removeInventoryItem(_LABS.Meth.ItemRecip, 1)
        Notify(source, GetPhrase('meth_break_success'))
    else
        local label = GetItemLabel(_LABS.Meth.ItemRecip)
        Notify(source, GetPhrase('not_enough_to_deposit', label))
    end
end)

RegisterServerEvent("core:labs:GetEmpocheMeth")
AddEventHandler("core:labs:GetEmpocheMeth", function()
    local xPlayer = Bridge.GetPlayer(source)

    local Required = xPlayer.getInventoryItem(_LABS.Meth.ItemBack)

    if Required.count >= 1 then
        xPlayer.addInventoryItem(_LABS.Meth.ItemMeth, _LABS.Meth.CountMeth)
        xPlayer.removeInventoryItem(_LABS.Meth.ItemBack, 1)
        AddLabInfluence(source, 'methEmpoche')
        Notify(source, GetPhrase('meth_pocket_success'))
    else
        local label = GetItemLabel(_LABS.Meth.ItemBack)
        Notify(source, GetPhrase('not_enough_to_deposit', label))
    end
end)

local PlayerLabs = {}

local function GetLabFromId(id)
    for k, v in pairs(Labs.Table or {}) do
        if v.id == id then
            return v
        end
    end
    return nil
end

local LabBuckets = {}
local PreviousBuckets = {}

function AddLabInfluence(source, interaction)
    local lab = GetLabFromId(PlayerLabs[source])
    if not lab or not lab.coords then return end

    local territoryId = GetTerritoryFromCoords(lab.coords)
    if territoryId then
        AddInfluence(source, territoryId, interaction)
    end
end
local NextBucket = 1000

RegisterNetEvent("sxIllegals:enterLab", function(labId)
    local src = source
    if not GetLabFromId(labId) then return end

    if not LabBuckets[labId] then
        NextBucket = NextBucket + 1
        LabBuckets[labId] = NextBucket
        SetRoutingBucketPopulationEnabled(NextBucket, false)
    end

    if not PreviousBuckets[src] then
        PreviousBuckets[src] = GetPlayerRoutingBucket(src)
    end
    PlayerLabs[src] = labId
    SetPlayerRoutingBucket(src, LabBuckets[labId])
end)

RegisterNetEvent("sxIllegals:exitLab", function()
    local src = source
    SetPlayerRoutingBucket(src, PreviousBuckets[src] or 0)
    PreviousBuckets[src] = nil
    PlayerLabs[src] = nil
end)

AddEventHandler("playerDropped", function()
    PreviousBuckets[source] = nil
    PlayerLabs[source] = nil
end)

local function GenerateUniqueLabId()
    local id
    repeat
        id = "LAB-" .. os.time() .. "-" .. Generate.Code({ includeNumbers = true, includeLetters = true, length = 4 }):upper()
    until not GetLabFromId(id)
    return id
end

RegisterServerEvent("sxGroup:RegisterLaboratory")
AddEventHandler("sxGroup:RegisterLaboratory", function(data)
    local src = source
    if not IsPlayerAdmin(src) then return end

    local tab = {}
    if data.type == 'coke' then
        for i = 1, #_LABS.Shell[data.type].spots do
            table.insert(tab, { kerosene = { start = 0 }, coca = { start = 0 }, whitewash = { start = 0 } })
        end
    elseif data.type == 'meth' then
        for i = 1, #_LABS.Shell[data.type].Synthesis do
            table.insert(tab, { reduction = { working = false, plates = 0, start = 0, availablePlates = 0 }, synthesis = { working = false, methylamine = 0, phenylacetone = 0 } })
        end
    elseif data.type == 'weed' then
        for i = 1, #_LABS.Shell[data.type].spots do
            table.insert(tab, { pickable = false, state = 0, previousState = -1, planted = false, fertilized = false })
        end
    end
    
    local weeds    = (data.type == 'weed') and json.encode(tab) or json.encode({})
    local circuits = (data.type == 'meth') and json.encode(tab) or json.encode({})
    local trays    = (data.type == 'coke') and json.encode(tab) or json.encode({})
    
    local id = GenerateUniqueLabId()
    MySQL.Sync.execute(
        "INSERT INTO labs (id, label, coords, type, level, weeds, circuits, trays, start) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        {
            id,
            data.label,
            json.encode(data.coords),
            data.type,
            1,
            weeds,
            circuits,
            trays,
            0
        }
    )
    
    if id then
        if data.type == 'weed' then
            Labs.WeedsServer[id] = tab
            Labs.CircuitsServer[id] = {}
            Labs.TraysServer[id] = {}
        elseif data.type == 'meth' then
            Labs.WeedsServer[id] = {}
            Labs.CircuitsServer[id] = tab
            Labs.TraysServer[id] = {}
        elseif data.type == 'coke' then
            Labs.WeedsServer[id] = {}
            Labs.CircuitsServer[id] = {}
            Labs.TraysServer[id] = tab
        end
        
        local newLab = {
            id = id,
            label = data.label,
            coords = data.coords,
            type = data.type,
            level = 1,
            weeds = { Labs.WeedsServer[id] },
            circuits = { Labs.CircuitsServer[id] },
            trays = { Labs.TraysServer[id] },
            start = 0
        }
        table.insert(Labs.Table, newLab)
        
        if AdminActivities then
            table.insert(AdminActivities, 1, {
                id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
                time = os.time(),
                title = GetPhrase('activity_lab_created_title'),
                description = GetPhrase('activity_lab_created_desc', data.label, data.type:upper()),
                type = 'lab',
                severity = 'info'
            })
        end
        
        TriggerClientEvent("sxIllegals:SyncLabsTable", -1, Labs.Table)
    end
end)

RegisterServerCallback("core:labs:GetDataFromLabs", function(source, id)
    for k, v in pairs(Labs.Table) do
        if v.id == id then
            return { v, GetGameTimer() }
        end
    end
end)

RegisterServerCallback("core:labs:GetDataLabs", function(source)
    return Labs.Table
end)

Citizen.CreateThread(function()
    Wait(50)
    local result = MySQL.Sync.fetchAll("SELECT * FROM labs")
    if result then
        for k, v in pairs(result) do
            v.coords = json.decode(v.coords)
            if v.type == 'weed' then
                Labs.WeedsServer[v.id] = json.decode(v.weeds)
            else
                Labs.WeedsServer[v.id] = {}
            end
            if v.type == 'meth' then
                Labs.CircuitsServer[v.id] = json.decode(v.circuits)
            else
                Labs.CircuitsServer[v.id] = {}
            end
            if v.type == 'coke' then
                Labs.TraysServer[v.id] = json.decode(v.trays)
            else
                Labs.TraysServer[v.id] = {}
            end
            if v.type == 'weed' then
                for k, v in pairs(Labs.WeedsServer[v.id]) do
                    if v.start then
                        v.start = GetGameTimer()
                    end
                end
            end
            if v.type == 'meth' then
                for k, v in pairs(Labs.CircuitsServer[v.id]) do
                    if v.synthesis.start then
                        v.synthesis.start = GetGameTimer()
                    end
                    if v.reduction.start then
                        v.reduction.start = GetGameTimer()
                    end
                end
            end
            if v.type == 'coke' then
                for k, v in pairs(Labs.TraysServer[v.id]) do
                    if v.whitewash.start ~= 0 then
                        v.whitewash.start = GetGameTimer()
                        break
                    elseif v.coca.start ~= 0 then
                        v.coca.start = GetGameTimer()
                        break
                    elseif v.kerosene.start ~= 0 then
                        v.kerosene.start = GetGameTimer()
                        break
                    end
                end
            end
            Labs.Table[#Labs.Table + 1] = {
                id = v.id,
                label = v.label,
                coords = v.coords,
                type = v.type,
                level = v
                    .level,
                weeds = { Labs.WeedsServer[v.id] },
                circuits = { Labs.CircuitsServer[v.id] },
                trays = { Labs.TraysServer[v.id] },
                start =
                    v.start
            }
        end
        while true do
            Wait(5000)
            for k, v in pairs(Labs.Table) do
                MySQL.Async.execute(
                    'UPDATE `labs` SET `weeds` = @weeds, `circuits` = @circuits, `trays` = @trays, `start` = @start WHERE `id`= @id',
                    {
                        ['@id'] = v.id,
                        ['@weeds'] = json.encode(Labs.WeedsServer[v.id]),
                        ['@circuits'] = json.encode(Labs.CircuitsServer[v.id]),
                        ['@trays'] = json.encode(Labs.TraysServer[v.id]),
                        ['@start'] = v.start,
                    }, function(rowsChanged)
                    end)
            end
            Logger:info('SAVE', 'Labs data')
            Wait(3 * 60 * 1000)
        end
    end
end)
