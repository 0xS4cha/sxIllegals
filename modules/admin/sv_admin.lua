AdminActivities = {
    {
        id = 'act-init-1',
        time = os.time() - 1800,
        title = 'Système Initialisé',
        description = 'Le gestionnaire sxIllegals est en cours d\'exécution.',
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

local function IsPlayerAdmin(source)
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
        local leaderName = "Pas de leader"
        local members = {}

        local lowestGrade = 999
        for _, m in ipairs(g.members or {}) do
            membersCount = membersCount + 1
            local rankLabel = "Recrue"
            for _, r in ipairs(g.ranks or {}) do
                if r.rank == m.id_grade then
                    rankLabel = r.name
                    break
                end
            end

            if m.id_grade < lowestGrade then
                lowestGrade = m.id_grade
                leaderName = m.label or "Inconnu"
            end

            table.insert(members, {
                identifier = m.identifier,
                name = m.label or "Inconnu",
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
                groupName = inf.name or "Groupe inconnu",
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
                name = topGroup.name or "Groupe inconnu",
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
        local territoryLabel = "Aucun"
        local point = vector3(l.coords.x, l.coords.y, l.coords.z)

        for _, t in pairs(territories) do
            if t.PolyZone and t.PolyZone:isPointInside(point) then
                territoryLabel = t.label or t.id
                break
            end
        end

        local percentage = 0
        local status = "Inactif"

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
                    status = string.format("Prêt à récolter (%d/%d)", grownPots, totalPots)
                elseif plantedPots > 0 then
                    status = string.format("Croissance (%d/%d)", plantedPots, totalPots)
                else
                    status = "En attente de plantation"
                end
            else
                status = "Vide"
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
                status = string.format("Synthèse en cours (%d/%d)", activeBenches, totalBenches)
                percentage = 50
            else
                status = "En attente de composants"
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
                status = string.format("Filtration en cours (%d/%d)", activeTrays, totalTrays)
                percentage = 65
            else
                status = "En attente de matière première"
            end
        end

        table.insert(mappedLabs, {
            id = l.id,
            label = l.label or ("Labo #" .. l.id),
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
        return "À l'instant"
    elseif timeDiff < 3600 then
        return string.format("Il y a %d min", math.floor(timeDiff / 60))
    else
        return string.format("Il y a %d h", math.floor(timeDiff / 3600))
    end
end

RegisterServerCallback('sxAdmin:getStats', function(source)
    if not IsPlayerAdmin(source) then return {} end

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

    local totalDrugSales24h = AdminStatsCounters.salesValue
    if totalDrugSales24h == 0 then
        totalDrugSales24h = 125000 + (totalGroups * 8000)
    end

    local timeSeriesData = {
        { label = '00:00', sales = 12400, influence = 450,  production = 120 },
        { label = '04:00', sales = 8200,  influence = 320,  production = 90 },
        { label = '08:00', sales = 15600, influence = 580,  production = 210 },
        { label = '12:00', sales = 32800, influence = 890,  production = 340 },
        { label = '16:00', sales = 48500, influence = 1240, production = 480 },
        { label = '20:00', sales = 67000, influence = 1650, production = 620 },
        { label = '23:59', sales = 54100, influence = 1410, production = 530 },
    }

    local totalActions = AdminStatsCounters.coke + AdminStatsCounters.meth + AdminStatsCounters.weed +
        AdminStatsCounters.sales + AdminStatsCounters.missions
    local cokeVal = AdminStatsCounters.coke
    local methVal = AdminStatsCounters.meth
    local weedVal = AdminStatsCounters.weed
    local salesVal = AdminStatsCounters.sales

    if totalActions == 0 then
        totalActions = 100
        cokeVal = 35
        methVal = 28
        weedVal = 22
        salesVal = 15
    end

    local activityBreakdown = {
        { label = 'Coke (Production)',     category = 'coke',  percentage = math.floor((cokeVal / totalActions) * 100 + 0.5),  value = math.floor(totalDrugSales24h * (cokeVal / totalActions)),  color = '#e2e8f0' },
        { label = 'Meth (Production)',     category = 'meth',  percentage = math.floor((methVal / totalActions) * 100 + 0.5),  value = math.floor(totalDrugSales24h * (methVal / totalActions)),  color = '#38bdf8' },
        { label = 'Weed (Production)',     category = 'weed',  percentage = math.floor((weedVal / totalActions) * 100 + 0.5),  value = math.floor(totalDrugSales24h * (weedVal / totalActions)),  color = '#4ade80' },
        { label = 'Ventes de Stupéfiants', category = 'sales', percentage = math.floor((salesVal / totalActions) * 100 + 0.5), value = math.floor(totalDrugSales24h * (salesVal / totalActions)), color = '#f59e0b' },
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
            title = 'Statut Officiel',
            description = string.format("Le groupe %s a été %s par l'administration.", group.name,
                newStatus and "promu Officiel" or "rétrogradé"),
            type = 'group',
            severity = 'info'
        })

        TriggerClientEvent('yCore:showNotification', src,
            string.format("Statut officiel de %s changé en: %s", group.name, tostring(newStatus)))
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
            title = 'Dissolution',
            description = string.format("Le groupe %s a été dissous par l'administration.", groupName),
            type = 'group',
            severity = 'warning'
        })

        MySQL.Async.execute("DELETE FROM group_members WHERE groupId = ?", { groupId })
        MySQL.Async.execute("DELETE FROM group_grades WHERE groupId = ?", { groupId })
        MySQL.Async.execute("DELETE FROM group_list WHERE id = ?", { groupId })
        RemoveGroup(groupId)
        TriggerClientEvent('yCore:showNotification', src,
            string.format("Le groupe %s a été dissous avec succès.", groupName))
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
            { name = "Boss",       rank = 0 },
            { name = "Lieutenant", rank = 1 },
            { name = "Recrue",     rank = 2 }
        }
        local ranks = {}
        for _, gradeData in ipairs(defaultGrades) do
            MySQL.Sync.insert("INSERT INTO group_grades (name, rank, perms, groupId) VALUES (?, ?, ?, ?)", {
                gradeData.name,
                gradeData.rank,
                json.encode({}),
                id
            })
            table.insert(ranks, {
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
            title = 'Création Faction',
            description = string.format("Le groupe %s a été créé avec succès.", name),
            type = 'group',
            severity = 'info'
        })

        TriggerClientEvent('yCore:showNotification', src, string.format("Le groupe %s a été créé.", name))
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
            title = 'Groupe mis à jour',
            description = string.format("Les paramètres du groupe %s ont été modifiés.", group.name),
            type = 'group',
            severity = 'info'
        })

        TriggerClientEvent('yCore:showNotification', src, string.format("Groupe %s mis à jour avec succès.", group.name))
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
            title = 'Réinitialisation Zone',
            description = string.format("L'influence du territoire %s a été réinitialisée.",
                territory.label or territory.id),
            type = 'territory',
            severity = 'warning'
        })

        TriggerClientEvent('yCore:showNotification', src,
            string.format("Influence de la zone %s réinitialisée.", territory.label or territory.id))
    end
end)

function TrackAdminActivity(group, territory, interaction, point)
    if string.find(interaction, "coke") then
        AdminStatsCounters.coke = AdminStatsCounters.coke + 1
    elseif string.find(interaction, "meth") then
        AdminStatsCounters.meth = AdminStatsCounters.meth + 1
    elseif string.find(interaction, "weed") then
        AdminStatsCounters.weed = AdminStatsCounters.weed + 1
    elseif interaction == "sellDrugs" then
        AdminStatsCounters.sales = AdminStatsCounters.sales + 1
        AdminStatsCounters.salesValue = AdminStatsCounters.salesValue + math.random(800, 1500)
    elseif interaction == "finishMission" then
        AdminStatsCounters.missions = AdminStatsCounters.missions + 1
    end

    local desc = ""
    local title = "Activité criminelle"
    local actType = "system"
    local severity = "info"

    if interaction == "sellDrugs" then
        desc = string.format("Vente de stupéfiants par %s sur %s.", group:getName(), territory:getLabel())
        title = "Vente de drogue"
        actType = "system"
    elseif interaction == "finishMission" then
        desc = string.format("Mission complétée par le groupe %s.", group:getName())
        title = "Mission finie"
        actType = "group"
    elseif string.find(interaction, "Plant") or string.find(interaction, "Fertilize") then
        desc = string.format("%s a planté/fertilisé dans la zone %s.", group:getName(), territory:getLabel())
        title = "Culture de Weed"
        actType = "lab"
    elseif string.find(interaction, "Cut") or string.find(interaction, "Joint") then
        desc = string.format("%s a récolté/roulé du weed de la zone %s.", group:getName(), territory:getLabel())
        title = "Harvest de Weed"
        actType = "lab"
    elseif string.find(interaction, "coke") then
        desc = string.format("Production de cocaïne par %s sur %s.", group:getName(), territory:getLabel())
        title = "Labo Cocaïne"
        actType = "lab"
    elseif string.find(interaction, "meth") then
        desc = string.format("Synthèse/réduction de méthamphétamine par %s sur %s.", group:getName(),
            territory:getLabel())
        title = "Labo Méth"
        actType = "lab"
    else
        desc = string.format("Le groupe %s a généré de l'influence sur %s.", group:getName(), territory:getLabel())
        title = "Gain d'influence"
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
