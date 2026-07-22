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


RegisterNetEvent("sxGroup:RefreshTerritories")
AddEventHandler("sxGroup:RefreshTerritories", function(data, id)
    if TerritoriesList and TerritoriesList[id] then
        TerritoriesList[id].influence = data.influence
        TerritoriesList[id].date = data.date
        TerritoriesList[id].label = data.label
        ShowTerritories(false)
        Territories.SetColor(TerritoriesList[id].id,
            (TerritoriesList[id].influence[1] and TerritoriesList[id].influence[1].rgb and TerritoriesList[id].influence[1].rgb.r or 255),
            (TerritoriesList[id].influence[1] and TerritoriesList[id].influence[1].rgb and TerritoriesList[id].influence[1].rgb.g or 255),
            (TerritoriesList[id].influence[1] and TerritoriesList[id].influence[1].rgb and TerritoriesList[id].influence[1].rgb.b or 255))

        Territories.Draw(TerritoriesList[id].id, 0xffffff, 5)
        Territories.SetAttackState(TerritoriesList[id].id, TerritoriesList[id].attackState)
        ResetBlipInfoTerritory(TerritoriesList[id].id)
        SetBlipInfoTitleTerritory(TerritoriesList[id].id, TerritoriesList[id].label, false)

        --AddBlipInfoText(TerritoriesList[territoriesId].id, '~b~Business~s~', ('~b~<C>%s</C>~s~'):format((TerritoriesList[id].influence and TerritoriesList[id].influence[1] and TerritoriesList[id].influence[1].name) or 'Aucun'))
        --AddBlipInfoHeader(TerritoriesList[territoriesId].id, "")
        AddBlipInfoTextTerritory(TerritoriesList[id].id, 'Domination', ('~b~<C>%s</C>~s~'):format((#TerritoriesList[id].influence > 0 and TerritoriesList[id].influence[1].name) or 'Aucun'))
        AddBlipInfoTextTerritory(TerritoriesList[id].id, 'Influence', ('%s'):format((TerritoriesList[id].influence and TerritoriesList[id].influence[1] and TerritoriesList[id].totalInfluence and TerritoriesList[id].totalInfluence > 0) and string.format('%.1f%%', (TerritoriesList[id].influence[1].points / TerritoriesList[id].totalInfluence * 100)) or '0%')) 
        AddBlipInfoHeaderTerritory(TerritoriesList[id].id, "")
        AddBlipInfoTextTerritory(TerritoriesList[id].id, ('%s'):format((#TerritoriesList[id].influence > 0 and TerritoriesList[id].influence[1].name) or 'Aucun groupe'), ('%s jour(s)'):format(TerritoriesList[id].date or 0))
        AddBlipInfoTextTerritory(TerritoriesList[id].id, 'Le territoire est présentement sous contrôle')
        
    end
end)

Citizen.CreateThread(function()
    AddTextEntry('IB_POI', 'Afficher les territoires')
    AddTextEntry(GetHashKey('0x86A9740F'), 'Afficher les territoires')
    AddTextEntryByHash('0x86A9740F', 'Afficher les territoires')
    Wait(5000)
    yCore.TriggerServerCallback('sxGroup:getTerritoriesList', function(data)
        TerritoriesList = data
    end)
    while json.encode(TerritoriesList) == '[]' do Wait(100) end
    for territoriesId, v in pairs(TerritoriesList) do
        local territory = TerritoriesList[territoriesId]
        TerritoriesList[territoriesId].blips = {}

        Territories.Add(TerritoriesList[territoriesId].id, 100)

        Territories.SetAlpha(TerritoriesList[territoriesId].id, 100)
        Territories.SetColor(TerritoriesList[territoriesId].id,
            (TerritoriesList[territoriesId].influence[1] and TerritoriesList[territoriesId].influence[1].rgb and TerritoriesList[territoriesId].influence[1].rgb.r or 255),
            (TerritoriesList[territoriesId].influence[1] and TerritoriesList[territoriesId].influence[1].rgb and TerritoriesList[territoriesId].influence[1].rgb.g or 255),
            (TerritoriesList[territoriesId].influence[1] and TerritoriesList[territoriesId].influence[1].rgb and TerritoriesList[territoriesId].influence[1].rgb.b or 255))
        Territories.ResetPoints(TerritoriesList[territoriesId].id)
        for i = 1, #territory.coords do
            Territories.AddPoint(TerritoriesList[territoriesId].id, territory.coords[i])
        end
        Territories.Draw(TerritoriesList[territoriesId].id, 0xffffff, 5)
        Territories.SetAttackState(TerritoriesList[territoriesId].id, TerritoriesList[territoriesId].attackState)
        TerritoriesList[territoriesId].PolyZone = PolyZone:Create(territory.coords, {
            name = TerritoriesList[territoriesId].id,
            minZ = TerritoriesList[territoriesId].minZ,
            maxZ = TerritoriesList[territoriesId].maxZ,
            debugGrid = false,
            gridDivisions = 25
        })

        SetBlipInfoTitleTerritory(TerritoriesList[territoriesId].id, TerritoriesList[territoriesId].label, false)

        --AddBlipInfoText(TerritoriesList[territoriesId].id, '~b~Business~s~', ('~b~<C>%s</C>~s~'):format((TerritoriesList[id].influence and TerritoriesList[id].influence[1] and TerritoriesList[id].influence[1].name) or 'Aucun'))
        --AddBlipInfoHeader(TerritoriesList[territoriesId].id, "")
        AddBlipInfoTextTerritory(TerritoriesList[territoriesId].id, 'Domination',
            ('~b~<C>%s</C>~s~'):format((#TerritoriesList[territoriesId].influence > 0 and TerritoriesList[territoriesId].influence[1].name) or 'Aucun'))
        AddBlipInfoTextTerritory(TerritoriesList[territoriesId].id, 'Influence',
            ('%s'):format((TerritoriesList[territoriesId].influence and TerritoriesList[territoriesId].influence[1] and territory.totalInfluence and territory.totalInfluence > 0) and
            string.format('%.1f%%', (TerritoriesList[territoriesId].influence[1].points / territory.totalInfluence * 100)) or '0%'))
        AddBlipInfoHeaderTerritory(TerritoriesList[territoriesId].id, "")
        AddBlipInfoTextTerritory(TerritoriesList[territoriesId].id,
            ('%s'):format((#TerritoriesList[territoriesId].influence > 0 and TerritoriesList[territoriesId].influence[1].name) or 'Aucun groupe'),
            ('%s jour(s)'):format(territory.date or 0))
        AddBlipInfoTextTerritory(TerritoriesList[territoriesId].id, 'Le territoire est présentement sous contrôle')
    end

    Citizen.CreateThread(function()
        local wait = 1000
        local status = nil
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