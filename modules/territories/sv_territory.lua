local TerritoriesList = {}

---@return territories
function GetTerritoriesFromId(id)
    return TerritoriesList[id]
end

function GetAllTerritories()
    return TerritoriesList
end

function RemoveTerritories(id)
    TerritoriesList[id] = nil
    return true
end

local function parseDate(date)
    if date then
        local year, month, day = date:match('(%d+)%-(%d+)%-(%d+)')
        return os.time({ year = tonumber(year), month = tonumber(month), day = tonumber(day) })
    else
        return os.time()
    end
end

territory = newClass()

function territory:new(data)
    if not data.coords then return end
    local self = setmetatable({}, territory)
    self.id = data.id or Generate.Code({ includeNumbers = true, includeLetters = true, length = 6 })
    self.influence = data.influence or {}
    for _, influence in pairs(self.influence) do
        influence.lastActivity = influence.lastActivity or os.time()
    end
    self.label = data.label or self.id
    self.totalInfluence = 0
    self.coords = data.coords
    self.minZ = data.minZ or -100.0
    self.maxZ = data.maxZ or 100.0
    self.attackState = 0
    self.needSave = false
    self.influenceChanged = false
    self.labelChanged = false
    self.maxZChanged = false
    self.minZChanged = false
    self.coordsChanged = false
    self.startChanged = false
    local startVal = '00-00-00'
    if data.start then
        local num = tonumber(data.start)
        if num then
            startVal = os.date("%Y-%m-%d", math.floor(num / 1000))
        elseif type(data.start) == 'string' and data.start:match('^%d+%-%d+%-%d+$') then
            startVal = data.start
        end
    else
        startVal = os.date("%Y-%m-%d")
    end
    self.start = startVal

    local diff = os.difftime(parseDate(self.start), os.time())
    self.date = diff and -math.floor(diff / (24 * 60 * 60)) or 0
    TerritoriesList[self.id] = self
    self:calculateTotalInfluence()
    self:sortInfluence()
    self:getDataGroup()
    return self
end

function territory:setLabelChanged(status)
    self.labelChanged = status
    return true
end

function territory:setCoordsChanged(status)
    self.coordsChanged = status
    return true
end

function territory:setMaxZChanged(status)
    self.maxZChanged = status
    return true
end

function territory:setMinZChanged(status)
    self.minZChanged = status
    return true
end

function territory:calculateTotalInfluence()
    self.totalInfluence = 0
    for i = 1, #self.influence do
        local value = self.influence[i]
        self.totalInfluence += value.points
    end
end

function territory:addInfluence(group, point)
    local found = false
    for i = 1, #self.influence do
        if self.influence[i].id == group then
            self.influence[i].points += point
            self.influence[i].lastActivity = os.time()
            found = true
            break
        end
    end

    if not found then
        self.influence[#self.influence + 1] = { points = point, id = group, lastActivity = os.time() }
    end

    self.influenceChanged = true
    self:setNeedSave(true)
    self:refreshZoneData()
end

function territory:refreshZoneData()
    self:calculateTotalInfluence()
    self:sortInfluence()
    self:getDataGroup()
    TriggerClientEvent('sxGroup:RefreshTerritories', -1, self, self.id)
end

function territory:getDataGroup()
    for i = 1, #self.influence do
        if self.influence[i] then
            local status, name, rgb, is_official = GetGroupInformationFromId(self.influence[i].id)

            if not status then
                Logger:warn('LOAD',
                    'Group with ID ' .. self.influence[i].id .. ' has been removed because it does not exist')
                self.influence[i] = nil
                self.influenceChanged = true
                self:setNeedSave(true)
                goto continue
            end
            if not is_official and not _GROUP.Unofficial then
                Logger:warn('LOAD',
                    'Group with ID ' .. self.influence[i].id .. ' has been removed because it is not official group')
                self.influence[i] = nil
                self.influenceChanged = true
                self:setNeedSave(true)
                goto continue
            end
            self.influence[i].name, self.influence[i].rgb = name, rgb
            ::continue::
        end
    end
end

function territory:sortInfluence()
    table.sort(self.influence, function(a, b)
        return a.points > b.points
    end)
end

function territory:saveTerritories()
    local updates = {}
    local params = {}

    if self.influenceChanged then
        table.insert(updates, "influence = ?")
        table.insert(params, json.encode(self.influence))
    end

    if self.labelChanged then
        table.insert(updates, "label = ?")
        table.insert(params, self.label)
    end

    if self.maxZChanged then
        table.insert(updates, "maxZ = ?")
        table.insert(params, self.maxZ)
    end

    if self.minZChanged then
        table.insert(updates, "minZ = ?")
        table.insert(params, self.minZ)
    end

    if self.coordsChanged then
        table.insert(updates, "coords = ?")
        table.insert(params, json.encode(self.coords))
    end

    if self.startChanged then
        table.insert(updates, "start = ?")
        table.insert(params, self.start)
    end

    self:setNeedSave(false)
    self.influenceChanged = false
    self.labelChanged = false
    self.maxZChanged = false
    self.minZChanged = false
    self.coordsChanged = false
    self.startChanged = false

    if #updates > 0 then
        table.insert(params, self.id)
        local query = ("UPDATE territories SET %s WHERE id = ?"):format(table.concat(updates, ", "))
        MySQL.Async.execute(query, params)
    end
end

function territory:isPointInside(point)
    local coords = self.coords
    if not point or not coords or #coords < 3 then return false end

    local inside = false
    local j = #coords
    for i = 1, #coords do
        local xi, yi = coords[i].x, coords[i].y
        local xj, yj = coords[j].x, coords[j].y
        if ((yi > point.y) ~= (yj > point.y)) and (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) then
            inside = not inside
        end
        j = i
    end

    return inside
end

function GetTerritoryFromCoords(coords)
    for id, data in pairs(TerritoriesList) do
        if data:isPointInside(coords) then
            return id
        end
    end
    return nil
end

function ResetTerritoryInfluence(territoryId)
    local target = TerritoriesList[territoryId]
    if not target then return false end

    target:setInfluence({})
    target.totalInfluence = 0
    target.influenceChanged = true
    target:setNeedSave(true)
    target:refreshZoneData()
    return true
end

function SetTerritoryGroupInfluence(territoryId, groupId, points)
    local target = TerritoriesList[territoryId]
    points = math.floor(tonumber(points) or -1)
    if not target or not GetGroupFromId(groupId) or points < 0 then return false end

    local kept = {}
    local found = false
    for _, influence in pairs(target.influence) do
        if influence.id == groupId then
            found = true
            influence.points = points
            influence.lastActivity = os.time()
        end
        if influence.points > 0 then
            kept[#kept + 1] = influence
        end
    end
    if not found and points > 0 then
        kept[#kept + 1] = { id = groupId, points = points, lastActivity = os.time() }
    end

    target:setInfluence(kept)
    target.influenceChanged = true
    target:setNeedSave(true)
    target:refreshZoneData()
    return true
end

function territory:getInfluence()
    return self.influence
end

function territory:setInfluence(influence)
    self.influence = influence
end

function territory:getLabel()
    return self.label
end

function territory:setLabel(label)
    self.label = label
end

function territory:getCoords()
    return self.coords
end

function territory:setCoords(coords)
    self.coords = coords
end

function territory:getMaxZ()
    return self.maxZ
end

function territory:setMaxZ(maxZ)
    self.maxZ = maxZ
end

function territory:getMinZ()
    return self.minZ
end

function territory:setMinZ(minZ)
    self.minZ = minZ
end

function territory:setNeedSave(needSave)
    self.needSave = needSave
end

function territory:getNeedSave()
    return self.needSave
end

local function LoadTerritories()
    MySQL.Async.fetchAll('SELECT * FROM territories', {}, function(result)
        for _, v in pairs(result) do
            territory:new({
                id = v.id,
                label = v.label,
                coords = json.decode(v.coords),
                start = v.start,
                influence = json.decode(v.influence)
            })
        end
    end)
    Logger:info('LOAD', "All territories have been loaded.")
end

local function SaveTerritories()
    for _, data in pairs(GetAllTerritories()) do
        if data:getNeedSave() then
            data:saveTerritories()
        end
    end
end

MySQL.ready(function()
    LoadTerritories()

    CreateThread(function()
        while true do
            Wait(_TERRITORY.SaveInterval * 60 * 1000)
            SaveTerritories()
        end
    end)
end)

AddEventHandler("onResourceStop", function(resource)
    if resource == GetCurrentResourceName() then
        Logger:info('SAVE', "Resource stopping, saving territories.")
        SaveTerritories()
    end
end)

RegisterServerCallback('sxIllegals:getTerritoriesList', function(_)
    return GetAllTerritories()
end)
