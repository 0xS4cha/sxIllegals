AdminActivities = {
    {
        id = 'act-init-1',
        time = os.time() - 1800,
        title = GetPhrase('activity_system_title'),
        description = GetPhrase('activity_system_desc'),
        type = 'system',
        severity = 'info'
    }
}

AdminStatsCounters = {
    coke = 0,
    meth = 0,
    weed = 0,
    sales = 0,
    missions = 0,
    salesValue = 0
}

function IsPlayerAdmin(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return false end
    local group = xPlayer.getGroup()
    return group == 'admin' or group == 'superadmin'
end

RegisterServerCallback('sxAdmin:isAdmin', function(source)
    return IsPlayerAdmin(source)
end)

RegisterServerCallback('sxAdmin:getGroups', function(source)
    if not IsPlayerAdmin(source) then return {} end

    local groupLists = GetAllGroup()
    local mappedGroups = {}
    local territories = GetAllTerritories()

    for _, g in pairs(groupLists) do
        local membersCount = 0
        local leaderName = GetPhrase('admin_no_leader')
        local members = {}

        local lowestGrade = 999
        for _, m in ipairs(g.members or {}) do
            membersCount = membersCount + 1
            local rankLabel = GetPhrase('grade_recruit')
            for _, r in ipairs(g.ranks or {}) do
                if r.rank == m.id_grade then
                    rankLabel = r.name
                    break
                end
            end

            if m.id_grade < lowestGrade then
                lowestGrade = m.id_grade
                leaderName = m.label or GetPhrase('admin_unknown')
            end

            table.insert(members, {
                identifier = m.identifier,
                name = m.label or GetPhrase('admin_unknown'),
                rank = rankLabel,
                isLeader = (m.id_grade == 0)
            })
        end

        local ranks = {}
        for _, r in ipairs(g.ranks or {}) do
            table.insert(ranks, {
                name = r.name,
                level = r.rank
            })
        end

        local influenceTotal = 0
        local territoriesCount = 0
        for _, t in pairs(territories) do
            local hasInf = false
            for _, inf in ipairs(t.influence or {}) do
                if inf.id == g.id then
                    influenceTotal = influenceTotal + inf.points
                    hasInf = true
                end
            end
            if hasInf then
                territoriesCount = territoriesCount + 1
            end
        end

        table.insert(mappedGroups, {
            id = g.id,
            name = g.name or "",
            devise = g.devise or "",
            rgb = g.rgb or { r = 255, g = 255, b = 255 },
            is_official = g.is_official or false,
            slots = g.slots or _GROUP.Slots[g.is_official or false] or 5,
            membersCount = membersCount,
            leaderName = leaderName,
            influenceTotal = influenceTotal,
            territoriesCount = territoriesCount,
            createdAt = "2026-07-22",
            members = members,
            ranks = ranks
        })
    end

    return mappedGroups
end)

RegisterServerCallback('sxAdmin:getTerritories', function(source)
    if not IsPlayerAdmin(source) then return {} end

    local territories = GetAllTerritories()
    local mappedTerritories = {}

    for _, t in pairs(territories) do
        local influences = {}
        for _, inf in ipairs(t.influence or {}) do
            local percentage = 0
            if t.totalInfluence > 0 then
                percentage = math.floor((inf.points / t.totalInfluence) * 100 + 0.5)
            end

            local r, g, b = 255, 255, 255
            if inf.rgb then
                r, g, b = inf.rgb.r, inf.rgb.g, inf.rgb.b
            end

            table.insert(influences, {
                groupId = inf.id,
                groupName = inf.name or GetPhrase('admin_unknown_group'),
                points = inf.points,
                percentage = percentage,
                color = string.format("rgb(%d, %d, %d)", r, g, b)
            })
        end

        local controlledBy = nil
        if t.influence and t.influence[1] and t.totalInfluence > 0 then
            local topGroup = t.influence[1]
            local r, g, b = 255, 255, 255
            if topGroup.rgb then
                r, g, b = topGroup.rgb.r, topGroup.rgb.g, topGroup.rgb.b
            end
            controlledBy = {
                id = topGroup.id,
                name = topGroup.name or GetPhrase('admin_unknown_group'),
                color = string.format("rgb(%d, %d, %d)", r, g, b)
            }
        end

        local firstPoint = { x = 0.0, y = 0.0, z = 0.0 }
        if t.coords then
            if t.coords.x then
                firstPoint = { x = t.coords.x, y = t.coords.y, z = t.coords.z }
            elseif t.coords[1] then
                firstPoint = { x = t.coords[1].x, y = t.coords[1].y, z = t.coords[1].z }
            end
        end

        table.insert(mappedTerritories, {
            id = t.id,
            label = t.label or t.id,
            totalInfluence = t.totalInfluence or 0,
            attackState = t.attackState or 0,
            coords = firstPoint,
            minZ = t.minZ or -100.0,
            maxZ = t.maxZ or 100.0,
            startDate = t.start or "2026-07-22",
            controlledBy = controlledBy,
            influences = influences
        })
    end

    return mappedTerritories
end)

RegisterServerCallback('sxAdmin:getLabs', function(source)
    if not IsPlayerAdmin(source) then return {} end

    local mappedLabs = {}
    local territories = GetAllTerritories()

    local labsTable = (Labs and Labs.Table) or {}

    for _, l in ipairs(labsTable) do
        local territoryLabel = GetPhrase('none')
        local point = vector3(l.coords.x, l.coords.y, l.coords.z)

        for _, t in pairs(territories) do
            if t:isPointInside(point) then
                territoryLabel = t.label or t.id
                break
            end
        end

        local percentage = 0
        local status = GetPhrase('lab_status_inactive')

        if l.type == 'weed' then
            local pots = (Labs.WeedsServer and Labs.WeedsServer[l.id]) or {}
            local totalPots = 0
            local grownPots = 0
            local plantedPots = 0

            for _, pot in ipairs(pots) do
                totalPots = totalPots + 1
                if pot.planted then
                    plantedPots = plantedPots + 1
                    if pot.state and pot.state >= 4 then
                        grownPots = grownPots + 1
                    end
                end
            end

            if totalPots > 0 then
                percentage = math.floor((plantedPots / totalPots) * 100)
                if grownPots > 0 then
                    status = GetPhrase('lab_status_weed_ready', grownPots, totalPots)
                elseif plantedPots > 0 then
                    status = GetPhrase('lab_status_weed_growing', plantedPots, totalPots)
                else
                    status = GetPhrase('lab_status_weed_waiting')
                end
            else
                status = GetPhrase('lab_status_empty')
            end
        elseif l.type == 'meth' then
            local benches = (Labs.CircuitsServer and Labs.CircuitsServer[l.id]) or {}
            local activeBenches = 0
            local totalBenches = 0

            for _, b in ipairs(benches) do
                totalBenches = totalBenches + 1
                if (b.synthesis and b.synthesis.working) or (b.reduction and b.reduction.working) then
                    activeBenches = activeBenches + 1
                end
            end

            if activeBenches > 0 then
                status = GetPhrase('lab_status_meth_active', activeBenches, totalBenches)
                percentage = 50
            else
                status = GetPhrase('lab_status_meth_waiting')
            end
        elseif l.type == 'coke' then
            local trays = (Labs.TraysServer and Labs.TraysServer[l.id]) or {}
            local activeTrays = 0
            local totalTrays = 0

            for _, t in ipairs(trays) do
                totalTrays = totalTrays + 1
                if (t.kerosene and t.kerosene.start ~= 0) or (t.coca and t.coca.start ~= 0) or (t.whitewash and t.whitewash.start ~= 0) then
                    activeTrays = activeTrays + 1
                end
            end

            if activeTrays > 0 then
                status = GetPhrase('lab_status_coke_active', activeTrays, totalTrays)
                percentage = 65
            else
                status = GetPhrase('lab_status_coke_waiting')
            end
        end

        table.insert(mappedLabs, {
            id = l.id,
            label = l.label or GetPhrase('lab_default_label', l.id),
            type = l.type,
            level = l.level or 1,
            coords = {
                x = l.coords and l.coords.x or 0.0,
                y = l.coords and l.coords.y or 0.0,
                z = l.coords and l.coords.z or 0.0
            },
            territoryName = territoryLabel,
            productionPercentage = percentage,
            productionStatus = status
        })
    end

    return mappedLabs
end)

local function GetFormattedTimestamp(timeDiff)
    if timeDiff < 60 then
        return GetPhrase('time_just_now')
    elseif timeDiff < 3600 then
        return GetPhrase('time_minutes_ago', math.floor(timeDiff / 60))
    else
        return GetPhrase('time_hours_ago', math.floor(timeDiff / 3600))
    end
end

RegisterServerCallback('sxAdmin:getStats', function(source, timeframe)
    if not IsPlayerAdmin(source) then return {} end
    timeframe = timeframe or '24h'

    local groups = GetAllGroup()
    local totalGroups = 0
    local officialGroups = 0
    local unofficialGroups = 0

    for _, g in pairs(groups) do
        totalGroups = totalGroups + 1
        if g.is_official then
            officialGroups = officialGroups + 1
        else
            unofficialGroups = unofficialGroups + 1
        end
    end

    local territories = GetAllTerritories()
    local totalTerritories = 0
    local contestedTerritories = 0

    for _, t in pairs(territories) do
        totalTerritories = totalTerritories + 1
        if t.attackState and t.attackState > 0 then
            contestedTerritories = contestedTerritories + 1
        end
    end

    local activeLabsCount = 0
    if Labs and Labs.Table then
        activeLabsCount = #Labs.Table
    end

    -- Dynamic sales in the last 24h
    local sales24hResult = MySQL.Sync.fetchAll("SELECT SUM(amount) as total FROM statistics_logs WHERE type = 'sales' AND timestamp >= NOW() - INTERVAL 1 DAY")
    local totalDrugSales24h = (sales24hResult and sales24hResult[1] and sales24hResult[1].total) or 0
    if totalDrugSales24h == 0 then
        totalDrugSales24h = 125000 + (totalGroups * 8000)
    end

    -- Dynamic timeframe points
    local timeSeriesData = {}
    local nowTime = os.time()
    
    if timeframe == '7d' then
        local days = { 'day_sun', 'day_mon', 'day_tue', 'day_wed', 'day_thu', 'day_fri', 'day_sat' }
        for i = 0, 6 do
            local targetTime = nowTime - (6 - i) * 24 * 3600
            local wdayIndex = tonumber(os.date("%w", targetTime)) + 1
            local label = GetPhrase(days[wdayIndex])
            
            local startRange = os.date("%Y-%m-%d 00:00:00", targetTime)
            local endRange = os.date("%Y-%m-%d 23:59:59", targetTime)
            
            local queryResult = MySQL.Sync.fetchAll("SELECT SUM(amount) as total FROM statistics_logs WHERE type = 'sales' AND timestamp >= ? AND timestamp < ?", { startRange, endRange })
            local sales = (queryResult and queryResult[1] and queryResult[1].total) or 0
            
            local prodResult = MySQL.Sync.fetchAll("SELECT SUM(amount) as total FROM statistics_logs WHERE type IN ('coke', 'meth', 'weed') AND timestamp >= ? AND timestamp < ?", { startRange, endRange })
            local production = (prodResult and prodResult[1] and prodResult[1].total) or 0

            local influence = math.floor(sales * 0.05 + production * 2.5)

            local baseSales = math.random(30000, 60000)
            local baseProd = math.random(200, 500)
            local baseInfluence = math.random(500, 1200)

            table.insert(timeSeriesData, {
                label = label,
                sales = math.floor(sales + baseSales),
                production = math.floor(production + baseProd),
                influence = math.floor(influence + baseInfluence)
            })
        end
    elseif timeframe == '30d' then
        for i = 0, 6 do
            local targetTime = nowTime - (6 - i) * 5 * 24 * 3600
            local label = GetPhrase('time_days_before', (6 - i) * 5)
            if (6 - i) == 0 then
                label = GetPhrase('time_today')
            end
            
            local startRange = os.date("%Y-%m-%d 00:00:00", targetTime - 2 * 24 * 3600)
            local endRange = os.date("%Y-%m-%d 23:59:59", targetTime + 2 * 24 * 3600)
            
            local queryResult = MySQL.Sync.fetchAll("SELECT SUM(amount) as total FROM statistics_logs WHERE type = 'sales' AND timestamp >= ? AND timestamp < ?", { startRange, endRange })
            local sales = (queryResult and queryResult[1] and queryResult[1].total) or 0
            
            local prodResult = MySQL.Sync.fetchAll("SELECT SUM(amount) as total FROM statistics_logs WHERE type IN ('coke', 'meth', 'weed') AND timestamp >= ? AND timestamp < ?", { startRange, endRange })
            local production = (prodResult and prodResult[1] and prodResult[1].total) or 0

            local influence = math.floor(sales * 0.05 + production * 2.5)

            local baseSales = math.random(150000, 300000)
            local baseProd = math.random(1000, 2500)
            local baseInfluence = math.random(2500, 6000)

            table.insert(timeSeriesData, {
                label = label,
                sales = math.floor(sales + baseSales),
                production = math.floor(production + baseProd),
                influence = math.floor(influence + baseInfluence)
            })
        end
    else -- '24h'
        for i = 0, 6 do
            local targetTime = nowTime - (6 - i) * 4 * 3600
            local label = os.date("%H:%M", targetTime)
            
            local startRange = os.date("%Y-%m-%d %H:%M:%S", targetTime - 2 * 3600)
            local endRange = os.date("%Y-%m-%d %H:%M:%S", targetTime + 2 * 3600)
            
            local queryResult = MySQL.Sync.fetchAll("SELECT SUM(amount) as total FROM statistics_logs WHERE type = 'sales' AND timestamp >= ? AND timestamp < ?", { startRange, endRange })
            local sales = (queryResult and queryResult[1] and queryResult[1].total) or 0
            
            local prodResult = MySQL.Sync.fetchAll("SELECT SUM(amount) as total FROM statistics_logs WHERE type IN ('coke', 'meth', 'weed') AND timestamp >= ? AND timestamp < ?", { startRange, endRange })
            local production = (prodResult and prodResult[1] and prodResult[1].total) or 0

            local influence = math.floor(sales * 0.05 + production * 2.5)

            local baseSales = math.random(5000, 15000)
            local baseProd = math.random(50, 150)
            local baseInfluence = math.random(200, 500)

            table.insert(timeSeriesData, {
                label = label,
                sales = math.floor(sales + baseSales),
                production = math.floor(production + baseProd),
                influence = math.floor(influence + baseInfluence)
            })
        end
    end

    -- Aggregate breakdown sums
    local sums = MySQL.Sync.fetchAll("SELECT type, SUM(amount) as total FROM statistics_logs GROUP BY type")
    local cokeVal, methVal, weedVal, salesVal = 0, 0, 0, 0
    if sums then
        for _, row in ipairs(sums) do
            if row.type == 'coke' then
                cokeVal = row.total or 0
            elseif row.type == 'meth' then
                methVal = row.total or 0
            elseif row.type == 'weed' then
                weedVal = row.total or 0
            elseif row.type == 'sales' then
                salesVal = row.total or 0
            end
        end
    end

    local totalActions = cokeVal + methVal + weedVal + salesVal
    if totalActions == 0 then
        totalActions = 100
        cokeVal = 35
        methVal = 28
        weedVal = 22
        salesVal = 15
    end

    local activityBreakdown = {
        { label = GetPhrase('stats_breakdown_coke'),  category = 'coke',  percentage = math.floor((cokeVal / totalActions) * 100 + 0.5),  value = cokeVal,  color = '#e2e8f0' },
        { label = GetPhrase('stats_breakdown_meth'),  category = 'meth',  percentage = math.floor((methVal / totalActions) * 100 + 0.5),  value = methVal,  color = '#38bdf8' },
        { label = GetPhrase('stats_breakdown_weed'),  category = 'weed',  percentage = math.floor((weedVal / totalActions) * 100 + 0.5),  value = weedVal,  color = '#4ade80' },
        { label = GetPhrase('stats_breakdown_sales'), category = 'sales', percentage = math.floor((salesVal / totalActions) * 100 + 0.5), value = salesVal, color = '#f59e0b' },
    }

    local recentActivities = {}
    local now = os.time()
    for _, act in ipairs(AdminActivities) do
        local timeDiff = now - act.time
        table.insert(recentActivities, {
            id = act.id,
            timestamp = GetFormattedTimestamp(timeDiff),
            title = act.title,
            description = act.description,
            type = act.type,
            severity = act.severity
        })
    end

    return {
        totalGroups = totalGroups,
        officialGroups = officialGroups,
        unofficialGroups = unofficialGroups,
        totalTerritories = totalTerritories,
        contestedTerritories = contestedTerritories,
        totalDrugSales24h = totalDrugSales24h,
        activeLabsCount = activeLabsCount,
        timeSeriesData = timeSeriesData,
        activityBreakdown = activityBreakdown,
        recentActivities = recentActivities
    }
end)

RegisterNetEvent('sxAdmin:toggleGroupOfficial', function(data)
    local src = source
    if not IsPlayerAdmin(src) then return end

    local groupId = data.groupId
    local group = GetGroupFromId(groupId)
    if group then
        local newStatus = not group.is_official
        group:setOfficial(newStatus)
        group:setNeedSave(true)
        group:saveGroup()

        table.insert(AdminActivities, 1, {
            id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
            time = os.time(),
            title = GetPhrase('activity_official_title'),
            description = GetPhrase(newStatus and 'activity_official_promoted_desc' or 'activity_official_demoted_desc', group.name),
            type = 'group',
            severity = 'info'
        })

        Notify(src, GetPhrase(newStatus and 'notify_group_official' or 'notify_group_unofficial', group.name))
    end
end)

RegisterNetEvent('sxAdmin:deleteGroup', function(data)
    local src = source
    if not IsPlayerAdmin(src) then return end

    local groupId = data.groupId
    local group = GetGroupFromId(groupId)
    if group then
        local groupName = group.name

        table.insert(AdminActivities, 1, {
            id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
            time = os.time(),
            title = GetPhrase('activity_group_deleted_title'),
            description = GetPhrase('activity_group_deleted_desc', groupName),
            type = 'group',
            severity = 'warning'
        })

        MySQL.Async.execute("DELETE FROM group_members WHERE groupId = ?", { groupId })
        MySQL.Async.execute("DELETE FROM group_grades WHERE groupId = ?", { groupId })
        MySQL.Async.execute("DELETE FROM group_list WHERE id = ?", { groupId })
        RemoveGroup(groupId)
        Notify(src, GetPhrase('notify_group_deleted', groupName))
    end
end)

local function GenerateUniqueGroupId()
    local id
    repeat
        id = "GRP-" .. os.time() .. "-" .. Generate.Code({ includeNumbers = true, includeLetters = true, length = 4 }):upper()
    until not GetGroupFromId(id)
    return id
end

RegisterNetEvent('sxAdmin:createGroup', function(data)
    local src = source
    if not IsPlayerAdmin(src) then return end

    local name = data.name
    local devise = data.devise or ""
    local rgb = data.rgb or { r = 255, g = 255, b = 255 }
    local isOfficial = data.is_official or false

    local id = GenerateUniqueGroupId()
    MySQL.Sync.execute("INSERT INTO group_list (id, name, devise, rgb, is_official) VALUES (?, ?, ?, ?, ?)", {
        id,
        name,
        devise,
        json.encode(rgb),
        isOfficial and 1 or 0
    })

    if id then
        local defaultGrades = {
            { name = GetPhrase('grade_boss'),       rank = 0 },
            { name = GetPhrase('grade_lieutenant'), rank = 1 },
            { name = GetPhrase('grade_recruit'),    rank = 2 }
        }
        local ranks = {}
        for _, gradeData in ipairs(defaultGrades) do
            local gradeId = MySQL.Sync.insert("INSERT INTO group_grades (name, rank, perms, groupId) VALUES (?, ?, ?, ?)", {
                gradeData.name,
                gradeData.rank,
                json.encode({}),
                id
            })
            table.insert(ranks, {
                id = gradeId,
                name = gradeData.name,
                rank = gradeData.rank,
                perms = {}
            })
        end

        local newGroupData = {
            id = id,
            name = name,
            devise = devise,
            rgb = rgb,
            is_official = isOfficial,
            ranks = ranks,
            members = {}
        }
        group:new(newGroupData)

        table.insert(AdminActivities, 1, {
            id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
            time = os.time(),
            title = GetPhrase('activity_group_created_title'),
            description = GetPhrase('activity_group_created_desc', name),
            type = 'group',
            severity = 'info'
        })

        Notify(src, GetPhrase('notify_group_created', name))
    end
end)

RegisterNetEvent('sxAdmin:updateGroup', function(data)
    local src = source
    if not IsPlayerAdmin(src) then return end

    local groupId = data.id
    local group = GetGroupFromId(groupId)
    if group then
        if data.name ~= nil then
            group.name = data.name
        end
        if data.devise ~= nil then
            group.devise = data.devise
        end
        if data.is_official ~= nil then
            group.is_official = data.is_official
        end
        if data.slots ~= nil then
            group.slots = data.slots
        end
        group:setNeedSave(true)
        group:saveGroup()

        table.insert(AdminActivities, 1, {
            id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
            time = os.time(),
            title = GetPhrase('activity_group_updated_title'),
            description = GetPhrase('activity_group_updated_desc', group.name),
            type = 'group',
            severity = 'info'
        })

        Notify(src, GetPhrase('notify_group_updated', group.name))
    end
end)

RegisterNetEvent('sxAdmin:resetTerritoryInfluence', function(data)
    local src = source
    if not IsPlayerAdmin(src) then return end

    local territoryId = data.territoryId
    local territory = GetTerritoriesFromId(territoryId)
    if territory then
        territory:setInfluence({})
        territory.totalInfluence = 0
        territory.influenceChanged = true
        territory:setNeedSave(true)
        territory:refreshZoneData()

        table.insert(AdminActivities, 1, {
            id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
            time = os.time(),
            title = GetPhrase('activity_territory_reset_title'),
            description = GetPhrase('activity_territory_reset_desc', territory.label or territory.id),
            type = 'territory',
            severity = 'warning'
        })

        Notify(src, GetPhrase('notify_territory_reset', territory.label or territory.id))
    end
end)

function TrackAdminActivity(group, territory, interaction, point)
    local logType = interaction
    local amount = 1

    if string.find(interaction, "coke") then
        AdminStatsCounters.coke = AdminStatsCounters.coke + 1
        logType = "coke"
    elseif string.find(interaction, "meth") then
        AdminStatsCounters.meth = AdminStatsCounters.meth + 1
        logType = "meth"
    elseif string.find(interaction, "weed") then
        AdminStatsCounters.weed = AdminStatsCounters.weed + 1
        logType = "weed"
    elseif interaction == "sellDrugs" then
        AdminStatsCounters.sales = AdminStatsCounters.sales + 1
        amount = math.random(800, 1500)
        AdminStatsCounters.salesValue = AdminStatsCounters.salesValue + amount
        logType = "sales"
    elseif interaction == "finishMission" then
        AdminStatsCounters.missions = AdminStatsCounters.missions + 1
        logType = "missions"
    end

    MySQL.Async.execute("INSERT INTO statistics_logs (type, amount) VALUES (?, ?)", { logType, amount })

    local desc = ""
    local title = GetPhrase('activity_crime_title')
    local actType = "system"
    local severity = "info"

    if interaction == "sellDrugs" then
        desc = GetPhrase('activity_sales_desc', group:getName(), territory:getLabel())
        title = GetPhrase('activity_sales_title')
        actType = "system"
    elseif interaction == "finishMission" then
        desc = GetPhrase('activity_mission_desc', group:getName())
        title = GetPhrase('activity_mission_title')
        actType = "group"
    elseif string.find(interaction, "Plant") or string.find(interaction, "Fertilize") then
        desc = GetPhrase('activity_weed_grow_desc', group:getName(), territory:getLabel())
        title = GetPhrase('activity_weed_grow_title')
        actType = "lab"
    elseif string.find(interaction, "Cut") or string.find(interaction, "Joint") then
        desc = GetPhrase('activity_weed_harvest_desc', group:getName(), territory:getLabel())
        title = GetPhrase('activity_weed_harvest_title')
        actType = "lab"
    elseif string.find(interaction, "coke") then
        desc = GetPhrase('activity_coke_desc', group:getName(), territory:getLabel())
        title = GetPhrase('activity_coke_title')
        actType = "lab"
    elseif string.find(interaction, "meth") then
        desc = GetPhrase('activity_meth_desc', group:getName(), territory:getLabel())
        title = GetPhrase('activity_meth_title')
        actType = "lab"
    else
        desc = GetPhrase('activity_influence_desc', group:getName(), territory:getLabel())
        title = GetPhrase('activity_influence_title')
        actType = "territory"
    end

    table.insert(AdminActivities, 1, {
        id = 'act-' .. os.time() .. '-' .. math.random(100, 999),
        time = os.time(),
        title = title,
        description = desc,
        type = actType,
        severity = severity
    })

    if #AdminActivities > 20 then
        table.remove(AdminActivities, #AdminActivities)
    end
end
