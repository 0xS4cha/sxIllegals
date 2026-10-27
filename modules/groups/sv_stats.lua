local STATS_DAYS = 7
local PRODUCTION_TYPES = { weed = true, coke = true, meth = true }

local function ShiftDate(date, days)
    local year, month, day = date:match('(%d+)-(%d+)-(%d+)')
    local time = os.time({ year = tonumber(year), month = tonumber(month), day = tonumber(day), hour = 12 })
    return os.date('%Y-%m-%d', time + days * 86400)
end

function GetGroupContributions(groupId)
    local rows = MySQL.Sync.fetchAll([[
        SELECT `identifier`, SUM(`amount`) AS `total`
        FROM `statistics_logs`
        WHERE `group_id` = ? AND `type` = 'influence' AND `identifier` IS NOT NULL
          AND `timestamp` >= CURDATE() - INTERVAL ? DAY
        GROUP BY `identifier`
    ]], { groupId, STATS_DAYS - 1 }) or {}

    local result = {}
    for _, row in ipairs(rows) do
        result[row.identifier] = math.floor(tonumber(row.total) or 0)
    end
    return result
end

function GetGroupStats(group)
    local today = (MySQL.Sync.fetchAll("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS `today`") or {})[1]
    today = today and today.today or os.date('%Y-%m-%d')

    local rows = MySQL.Sync.fetchAll([[
        SELECT DATE_FORMAT(`timestamp`, '%Y-%m-%d') AS `day`, `type`, SUM(`amount`) AS `total`, COUNT(*) AS `count`
        FROM `statistics_logs`
        WHERE `group_id` = ? AND `timestamp` >= CURDATE() - INTERVAL ? DAY
        GROUP BY `day`, `type`
    ]], { group.id, STATS_DAYS - 1 }) or {}

    local days, index = {}, {}
    for offset = STATS_DAYS - 1, 0, -1 do
        local date = ShiftDate(today, -offset)
        days[#days + 1] = { date = date, sales = 0, units = 0, production = 0, influence = 0 }
        index[date] = days[#days]
    end

    local totals = { sales = 0, units = 0, production = 0, influence = 0 }
    for _, row in ipairs(rows) do
        local day = index[row.day]
        local total = math.floor(tonumber(row.total) or 0)
        local count = math.floor(tonumber(row.count) or 0)
        if day then
            if row.type == 'sales' then
                day.sales = day.sales + total
                day.units = day.units + count
            elseif row.type == 'influence' then
                day.influence = day.influence + total
            elseif PRODUCTION_TYPES[row.type] then
                day.production = day.production + count
            end
        end
    end

    for _, day in ipairs(days) do
        totals.sales = totals.sales + day.sales
        totals.units = totals.units + day.units
        totals.production = totals.production + day.production
        totals.influence = totals.influence + day.influence
    end

    local names = {}
    for _, member in ipairs(group.members) do
        names[member.identifier] = member.label
    end

    local contributors = {}
    for identifier, amount in pairs(GetGroupContributions(group.id)) do
        if amount > 0 then
            contributors[#contributors + 1] = {
                name = names[identifier] or Bridge.GetOfflineName(identifier),
                amount = amount,
                percentage = totals.influence > 0 and math.floor(amount / totals.influence * 100 + 0.5) or 0
            }
        end
    end
    table.sort(contributors, function(a, b) return a.amount > b.amount end)
    while #contributors > 5 do
        table.remove(contributors)
    end

    return { days = days, totals = totals, contributors = contributors }
end

RegisterServerCallback('sxGroup:getStats', function(source)
    local identifier = Bridge.GetIdentifier(source)
    local group = identifier and GetGroupFromLicense(identifier)
    if not group then return { ok = false, error = 'no_group' } end

    return { ok = true, stats = GetGroupStats(group) }
end)
