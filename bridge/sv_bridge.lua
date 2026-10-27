Bridge = {}
Bridge.Name = 'standalone'
Bridge.Inventory = 'none'

local ESX = nil

local function detectFramework()
    if _CONFIG.Framework == 'standalone' then return 'standalone' end

    if _CONFIG.Framework == 'esx' or GetResourceState('es_extended') ~= 'missing' then
        local ok, obj = pcall(function()
            return exports.es_extended:getSharedObject()
        end)
        if ok and obj then
            ESX = obj
            return 'esx'
        end
        Logger:error('BRIDGE', 'es_extended could not be loaded, running standalone')
    end

    return 'standalone'
end

local function detectInventory()
    if _CONFIG.Inventory ~= 'auto' then return _CONFIG.Inventory end
    if GetResourceState('ox_inventory') ~= 'missing' then return 'ox_inventory' end
    if Bridge.Name == 'esx' then return 'esx' end
    return 'none'
end

Bridge.Name = detectFramework()
Bridge.Inventory = detectInventory()
Logger:info('BRIDGE', 'Framework:', Bridge.Name, 'Inventory:', Bridge.Inventory)

local function esxPlayer(source)
    return ESX and ESX.GetPlayerFromId(source) or nil
end

function Bridge.IsESX()
    return Bridge.Name == 'esx'
end

function Bridge.GetIdentifier(source)
    local xPlayer = esxPlayer(source)
    if xPlayer then return xPlayer.getIdentifier() end
    return GetPlayerIdentifierByType(source, 'license')
end

function Bridge.GetName(source)
    local xPlayer = esxPlayer(source)
    if xPlayer and xPlayer.getName then
        local ok, name = pcall(xPlayer.getName)
        if ok and name then return name end
    end
    return GetPlayerName(source) or ('#' .. tostring(source))
end

function Bridge.GetOfflineName(identifier)
    if Bridge.IsESX() then
        local result = MySQL.Sync.fetchAll('SELECT firstname, lastname FROM users WHERE identifier = ?', { identifier })
        if result and result[1] and result[1].firstname then
            return result[1].firstname .. ' ' .. (result[1].lastname or '')
        end
    end
    return identifier
end

function Bridge.GetSourceFromIdentifier(identifier)
    for _, playerId in ipairs(GetPlayers()) do
        local source = tonumber(playerId)
        if Bridge.GetIdentifier(source) == identifier then
            return source
        end
    end
    return nil
end

function Bridge.GetJob(source)
    local xPlayer = esxPlayer(source)
    if not xPlayer then return nil, 0 end
    local job = xPlayer.getJob and xPlayer.getJob() or xPlayer.job
    if not job then return nil, 0 end
    return job.name, tonumber(job.grade) or 0
end

function Bridge.IsAdmin(source)
    if _CONFIG.Admin.ace and IsPlayerAceAllowed(source, _CONFIG.Admin.ace) then
        return true
    end

    local xPlayer = esxPlayer(source)
    if xPlayer then
        local group = xPlayer.getGroup()
        for _, allowed in ipairs(_CONFIG.Admin.groups) do
            if group == allowed then return true end
        end
    end

    return false
end

function Bridge.GetItemCount(source, item)
    if Bridge.Inventory == 'ox_inventory' then
        return exports.ox_inventory:GetItemCount(source, item) or 0
    end

    local xPlayer = esxPlayer(source)
    if xPlayer then
        local data = xPlayer.getInventoryItem(item)
        return data and tonumber(data.count) or 0
    end

    return 0
end

function Bridge.AddItem(source, item, count)
    if Bridge.Inventory == 'ox_inventory' then
        return exports.ox_inventory:AddItem(source, item, count) and true or false
    end

    local xPlayer = esxPlayer(source)
    if xPlayer then
        xPlayer.addInventoryItem(item, count)
        return true
    end

    return false
end

function Bridge.RemoveItem(source, item, count)
    if Bridge.Inventory == 'ox_inventory' then
        return exports.ox_inventory:RemoveItem(source, item, count) and true or false
    end

    local xPlayer = esxPlayer(source)
    if xPlayer then
        xPlayer.removeInventoryItem(item, count)
        return true
    end

    return false
end

function Bridge.GetItemLabel(item)
    if Bridge.Inventory == 'ox_inventory' then
        local data = exports.ox_inventory:Items(item)
        if data and data.label then return data.label end
    end

    if ESX and ESX.GetItemLabel then
        return ESX.GetItemLabel(item) or item
    end

    return item
end

function Bridge.GetMoney(source)
    local xPlayer = esxPlayer(source)
    if xPlayer then return xPlayer.getMoney() end
    if Bridge.Inventory == 'ox_inventory' then
        return exports.ox_inventory:GetItemCount(source, 'money') or 0
    end
    return 0
end

function Bridge.RemoveMoney(source, amount)
    local xPlayer = esxPlayer(source)
    if xPlayer then
        xPlayer.removeMoney(amount)
        return true
    end
    if Bridge.Inventory == 'ox_inventory' then
        return exports.ox_inventory:RemoveItem(source, 'money', amount) and true or false
    end
    return false
end

function Bridge.GetPlayer(source)
    if not GetPlayerName(source) then return nil end

    return {
        source = source,
        getIdentifier = function()
            return Bridge.GetIdentifier(source)
        end,
        getName = function()
            return Bridge.GetName(source)
        end,
        getInventoryItem = function(item)
            return { name = item, count = Bridge.GetItemCount(source, item), label = Bridge.GetItemLabel(item) }
        end,
        addInventoryItem = function(item, count)
            return Bridge.AddItem(source, item, count)
        end,
        removeInventoryItem = function(item, count)
            return Bridge.RemoveItem(source, item, count)
        end,
    }
end
