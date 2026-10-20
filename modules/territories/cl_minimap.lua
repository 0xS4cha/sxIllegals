local TerritoriesStates = false
PlayerInTerritory = nil
TerritoriesList = {}


function ShowTerritories(bool)
    for territoriesId, v in pairs(TerritoriesList) do
        Territories.SetVisible(TerritoriesList[territoriesId].id, bool)
        if not bool then
            ShowDisplayTerritory(false)
        end
    end
    Citizen.CreateThread(function()
        while TerritoriesStates do
            local cursor = GetPauseMapPointerWorldPosition()
            if cursor then
                for territoriesId, v in pairs(TerritoriesList) do
                    local territory = TerritoriesList[territoriesId]
                    local isInside = territory.PolyZone:isPointInside(vector3(cursor.x, cursor.y, 50.0))

                    if isInside and not territory.isInside then
                        Territories.SetAlpha(territory.id, 75)
                        local data = EnsureBlipInfoTerritory(TerritoriesList[territoriesId].id)
                        N_0xec9264727eec0f28()
                        ClearDisplayTerritory()
                        SetTitleTerritory(data.title, data.rockstarVerified, data.rp, data.money, data.dict, data.tex)
                        for _, info in next, data.info do
                            if info[1] == 2 then
                                AddIconTerritory(info[2], info[3], info[4], info[5], info[6])
                            else
                                AddTextTerritory(info[2], info[3], info[1])
                            end
                        end
                        ShowDisplayTerritory(true)
                        UpdateDisplayTerritory()
                        N_0x14621bb1df14e2b2()
                        territory.isInside = true
                    elseif not isInside and territory.isInside then
                        Territories.SetAlpha(territory.id, 50)
                        ShowDisplayTerritory(false)
                        territory.isInside = false
                    end
                end
            end
            Wait(100)
        end
    end)
end

function InitializeTerritory(id, data)
    if not data then return end
    
    local coords = {}
    for i = 1, #data.coords do
        local c = data.coords[i]
        coords[i] = vector3(c.x, c.y, c.z or 0.0)
    end
    
    TerritoriesList[id] = {
        id = id,
        label = data.label,
        influence = data.influence or {},
        totalInfluence = data.totalInfluence or 0,
        coords = coords,
        minZ = data.minZ or -100.0,
        maxZ = data.maxZ or 100.0,
        attackState = data.attackState or 0,
        date = data.date or 0,
        blips = {}
    }
    
    local territory = TerritoriesList[id]
    
    Territories.Add(territory.id, 100)
    Territories.SetAlpha(territory.id, 100)
    
    local r, g, b = 255, 255, 255
    if territory.influence[1] and territory.influence[1].rgb then
        r = territory.influence[1].rgb.r or 255
        g = territory.influence[1].rgb.g or 255
        b = territory.influence[1].rgb.b or 255
    end
    Territories.SetColor(territory.id, r, g, b)
    
    Territories.ResetPoints(territory.id)
    for i = 1, #territory.coords do
        Territories.AddPoint(territory.id, territory.coords[i])
    end
    
    Territories.Draw(territory.id, 0xffffff, 5)
    Territories.SetAttackState(territory.id, territory.attackState)
    
    territory.PolyZone = PolyZone:Create(territory.coords, {
        name = territory.id,
        minZ = territory.minZ,
        maxZ = territory.maxZ,
        debugGrid = false,
        gridDivisions = 25
    })
    
    ResetBlipInfoTerritory(territory.id)
    SetBlipInfoTitleTerritory(territory.id, territory.label, false)
    
    AddBlipInfoTextTerritory(territory.id, GetPhrase('territory_domination'),
        ('~b~<C>%s</C>~s~'):format((#territory.influence > 0 and territory.influence[1].name) or GetPhrase('none')))
        
    AddBlipInfoTextTerritory(territory.id, GetPhrase('territories_influence'),
        ('%s'):format((territory.influence and territory.influence[1] and territory.totalInfluence and territory.totalInfluence > 0) and
            string.format('%.1f%%', (territory.influence[1].points / territory.totalInfluence * 100)) or '0%'))
            
    AddBlipInfoHeaderTerritory(territory.id, "")
    
    AddBlipInfoTextTerritory(territory.id,
        ('%s'):format((#territory.influence > 0 and territory.influence[1].name) or GetPhrase('no_group')), 
        GetPhrase('territory_days', territory.date or 0))
        
    AddBlipInfoTextTerritory(territory.id, GetPhrase('territory_controlled'))
end

RegisterNetEvent("sxGroup:RefreshTerritories")
AddEventHandler("sxGroup:RefreshTerritories", function(data, id)
    if not TerritoriesList then return end
    
    if not TerritoriesList[id] then
        InitializeTerritory(id, data)
    else
        TerritoriesList[id].influence = data.influence
        TerritoriesList[id].date = data.date
        TerritoriesList[id].label = data.label
        ShowTerritories(false)
        
        local r, g, b = 255, 255, 255
        if TerritoriesList[id].influence[1] and TerritoriesList[id].influence[1].rgb then
            r = TerritoriesList[id].influence[1].rgb.r or 255
            g = TerritoriesList[id].influence[1].rgb.g or 255
            b = TerritoriesList[id].influence[1].rgb.b or 255
        end
        Territories.SetColor(TerritoriesList[id].id, r, g, b)

        Territories.Draw(TerritoriesList[id].id, 0xffffff, 5)
        Territories.SetAttackState(TerritoriesList[id].id, TerritoriesList[id].attackState)
        ResetBlipInfoTerritory(TerritoriesList[id].id)
        SetBlipInfoTitleTerritory(TerritoriesList[id].id, TerritoriesList[id].label, false)

        AddBlipInfoTextTerritory(TerritoriesList[id].id, GetPhrase('territory_domination'),
            ('~b~<C>%s</C>~s~'):format((#TerritoriesList[id].influence > 0 and TerritoriesList[id].influence[1].name) or
                GetPhrase('none')))
        AddBlipInfoTextTerritory(TerritoriesList[id].id, GetPhrase('territories_influence'),
            ('%s'):format((TerritoriesList[id].influence and TerritoriesList[id].influence[1] and TerritoriesList[id].totalInfluence and TerritoriesList[id].totalInfluence > 0) and
                string.format('%.1f%%',
                    (TerritoriesList[id].influence[1].points / TerritoriesList[id].totalInfluence * 100)) or
                '0%'))
        AddBlipInfoHeaderTerritory(TerritoriesList[id].id, "")
        AddBlipInfoTextTerritory(TerritoriesList[id].id,
            ('%s'):format((#TerritoriesList[id].influence > 0 and TerritoriesList[id].influence[1].name) or
                GetPhrase('no_group')), GetPhrase('territory_days', TerritoriesList[id].date or 0))
        AddBlipInfoTextTerritory(TerritoriesList[id].id, GetPhrase('territory_controlled'))
    end
end)

Citizen.CreateThread(function()
    AddTextEntry('IB_POI', GetPhrase('territory_toggle_display'))
    AddTextEntry(GetHashKey('0x86A9740F'), GetPhrase('territory_toggle_display'))
    AddTextEntryByHash('0x86A9740F', GetPhrase('territory_toggle_display'))
    
    local list = TriggerServerCallback('sxGroup:getTerritoriesList') or {}
    TerritoriesList = {}
    for id, data in pairs(list) do
        InitializeTerritory(id, data)
    end

    Citizen.CreateThread(function()
        local wait = 1000
        while true do
            if GetPauseMenuState() ~= 0 then
                wait = 1
                DisableControlAction(0, 204, true)
                if IsDisabledControlJustPressed(0, 204) then
                    if not TerritoriesStates then
                        TerritoriesStates = true
                        ShowTerritories(true)
                    else
                        TerritoriesStates = false
                        ShowTerritories(false)
                    end
                end
            else
                wait = 1000
                if TerritoriesStates then
                    TerritoriesStates = false
                    ShowTerritories(false)
                end
            end
            local wasInTerritory = PlayerInTerritory ~= nil
            local currentTerritory = nil

            for territoriesId, v in pairs(TerritoriesList) do
                local isInside = TerritoriesList[territoriesId].PolyZone:isPointInside(GetEntityCoords(PlayerPedId()))
                if isInside then
                    currentTerritory = territoriesId
                    break
                end
            end

            if currentTerritory and PlayerInTerritory ~= currentTerritory then
                PlayerInTerritory = currentTerritory
                Logger:info('SXGROUP', 'PLAYER JOIN ' .. currentTerritory .. ' TERRITORY')
            elseif not currentTerritory and wasInTerritory then
                Logger:info('SXGROUP', 'PLAYER LEFT ALL TERRITORY')
                PlayerInTerritory = nil
            end
            Wait(wait)
        end
    end)
end)


function GetTerritoryFromCoords(coords)
    if not coords or not TerritoriesList then return nil end

    local x = coords.x or (coords[1] and coords[1].x) or nil
    local y = coords.y or (coords[1] and coords[1].y) or nil
    local z = coords.z or (coords[1] and coords[1].z) or 50.0

    if not x or not y then return nil end

    local point = vector3(x, y, z)

    for territoriesId, territory in pairs(TerritoriesList) do
        if territory.PolyZone and territory.PolyZone:isPointInside(point) then
            return territoriesId
        end
    end

    return nil
end
