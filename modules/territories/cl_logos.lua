TerritoryLogos = {}

local DUI_URL = ('https://cfx-nui-%s/core/logo.html'):format(GetCurrentResourceName())
local DUI_SIZE = 256
local TEXTURE_NAME = 'logo'

local textures = {}
local overlays = {}
local lastOverlayId = 0
local lastTxdId = 0
local visible = false

local function UrlEncode(str)
    return (str:gsub('[^%w%-%._~]', function(c) return ('%%%02X'):format(c:byte()) end))
end

local function GetOwner(territory)
    local first = territory.influence and territory.influence[1]
    if first and (first.points or 0) > 0 and first.logo then return first end
    return nil
end

local function GetCentre(coords)
    local count = #coords
    local area, cx, cy = 0.0, 0.0, 0.0
    for i = 1, count do
        local a, b = coords[i], coords[i % count + 1]
        local cross = a.x * b.y - b.x * a.y
        area = area + cross
        cx = cx + (a.x + b.x) * cross
        cy = cy + (a.y + b.y) * cross
    end
    if math.abs(area) > 1.0 then
        return cx / (3.0 * area), cy / (3.0 * area)
    end
    local sx, sy = 0.0, 0.0
    for i = 1, count do sx, sy = sx + coords[i].x, sy + coords[i].y end
    return sx / count, sy / count
end

local function GetLogoSize(coords)
    local minX, minY, maxX, maxY = math.huge, math.huge, -math.huge, -math.huge
    for i = 1, #coords do
        local c = coords[i]
        minX, maxX = math.min(minX, c.x), math.max(maxX, c.x)
        minY, maxY = math.min(minY, c.y), math.max(maxY, c.y)
    end
    local cfg = _TERRITORY.Logo
    local size = math.min(maxX - minX, maxY - minY) * cfg.SizeRatio
    return math.max(cfg.MinSize, math.min(cfg.MaxSize, size))
end

local function GetTexture(groupId, version)
    local entry = textures[groupId]
    if entry and entry.version == version then
        return entry.ready and entry or nil
    end
    if entry and entry.pending then return nil end

    entry = entry or {}
    textures[groupId] = entry
    entry.pending = true

    CreateThread(function()
        local logo = TriggerServerCallback('sxIllegals:getGroupLogo', groupId)
        entry.pending = false
        entry.version = version

        if type(logo) ~= 'string' or logo == '' then
            entry.ready = false
        else
            local url = DUI_URL .. '#' .. UrlEncode(logo)
            if entry.dui then
                SetDuiUrl(entry.dui, url)
            else
                lastTxdId = lastTxdId + 1
                entry.txd = ('sxillegals_logo_%d'):format(lastTxdId)
                entry.dui = CreateDui(url, DUI_SIZE, DUI_SIZE)
                local txd = CreateRuntimeTxd(entry.txd)
                CreateRuntimeTextureFromDuiHandle(txd, TEXTURE_NAME, GetDuiHandle(entry.dui))
            end
            entry.ready = true
        end

        TerritoryLogos.Refresh()
    end)
    return nil
end

local function RemoveOverlay(territoryId)
    local overlay = overlays[territoryId]
    if not overlay then return end
    Territories.RemoveOverlay(overlay.id)
    overlays[territoryId] = nil
end

local function UpdateTerritory(territoryId, territory)
    local owner = visible and territory.coords and #territory.coords >= 3 and GetOwner(territory)
    local texture = owner and GetTexture(owner.id, owner.logo)
    if not texture then
        RemoveOverlay(territoryId)
        return
    end

    local x, y = GetCentre(territory.coords)
    local size = GetLogoSize(territory.coords)
    local key = ('%s:%s:%.1f:%.1f:%.1f'):format(texture.txd, owner.logo, x, y, size)

    local overlay = overlays[territoryId]
    if overlay and overlay.key == key then return end
    RemoveOverlay(territoryId)

    lastOverlayId = lastOverlayId + 1
    overlays[territoryId] = { id = lastOverlayId, key = key }
    Territories.AddOverlay(lastOverlayId, ('img://%s/%s'):format(texture.txd, TEXTURE_NAME), x, y, size, size, _TERRITORY.Logo.Alpha)
end

function TerritoryLogos.Refresh()
    if not _TERRITORY.Logo or not TerritoriesList then return end

    for territoryId in pairs(overlays) do
        if not TerritoriesList[territoryId] then
            RemoveOverlay(territoryId)
        end
    end
    for territoryId, territory in pairs(TerritoriesList) do
        UpdateTerritory(territoryId, territory)
    end
end

function TerritoryLogos.SetVisible(state)
    visible = state == true
    TerritoryLogos.Refresh()
end

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    for _, entry in pairs(textures) do
        if entry.dui then DestroyDui(entry.dui) end
    end
end)
