exports("GetCurrentTerritory", function()
    if not PlayerInTerritory or not TerritoriesList[PlayerInTerritory] then
        return nil
    end

    local data = TerritoriesList[PlayerInTerritory]
    return {
        id = data.id,
        label = data.label
    }
end)

exports("GetTerritoryAtCoords", function(coords)
    return GetTerritoryFromCoords(coords)
end)

exports("IsInTerritory", function(territoryId)
    if territoryId == nil then
        return PlayerInTerritory ~= nil
    end
    return PlayerInTerritory == territoryId
end)

exports("IsInLaboratory", function()
    return Labs.IsInLab == true
end)

exports("GetCurrentLaboratory", function()
    if not Labs.IsInLab or not Labs.LabosIndex or not Labs.LabosIndex.id then
        return nil
    end

    return {
        id = Labs.LabosIndex.id,
        label = Labs.LabosIndex.label,
        type = Labs.LabosIndex.type,
        level = Labs.LabosIndex.level
    }
end)

exports("OpenPanel", function(panel)
    SX.UI:Open(panel or 'group')
end)

exports("ClosePanel", function()
    SX.UI:Close()
end)

exports("IsPanelOpen", function()
    return SX.UI:IsOpen()
end)
