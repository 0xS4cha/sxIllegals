GROUP_PERMISSIONS = { 'canInvite', 'canKick', 'canPromote', 'canEditDevise', 'canManageRanks' }

local function FindMember(group, identifier)
    for _, member in ipairs(group.members) do
        if member.identifier == identifier then
            return member
        end
    end
    return nil
end

local function GetRankName(group, grade)
    for _, rank in ipairs(group.ranks) do
        if rank.rank == grade then
            return rank.name
        end
    end
    return GetPhrase('grade_recruit')
end

local function GetRankLevel(group, grade)
    return group:getLastRank() - grade + 1
end

function GetMemberPermissions(group, identifier)
    local member = FindMember(group, identifier)
    local permissions = {}
    if not member then return permissions end

    local rankPerms = group:getPermissionFromRank(member.id_grade) or {}
    for _, key in ipairs(GROUP_PERMISSIONS) do
        permissions[key] = member.id_grade == 0 or rankPerms[key] == true
    end
    return permissions
end

function HasGroupPermission(group, identifier, permission)
    return GetMemberPermissions(group, identifier)[permission] == true
end

local function FormatActivityTime(timestamp)
    local diff = os.time() - timestamp
    if diff < 60 then return GetPhrase('time_just_now') end
    if diff < 3600 then return GetPhrase('time_minutes_ago', math.floor(diff / 60)) end
    if diff < 86400 then return GetPhrase('time_hours_ago', math.floor(diff / 3600)) end
    return GetPhrase('time_days_ago', math.floor(diff / 86400))
end

function SerializeGroupForPlayer(group, identifier)
    local me = FindMember(group, identifier)
    if not me then return nil end

    local influenceTotal = 0
    for _, territory in pairs(GetAllTerritories()) do
        for _, influence in ipairs(territory.influence or {}) do
            if influence.id == group.id then
                influenceTotal = influenceTotal + influence.points
            end
        end
    end

    local leaderName = GetPhrase('admin_no_leader')
    local members = {}
    for _, member in ipairs(group.members) do
        if member.id_grade == 0 then
            leaderName = member.label or leaderName
        end
        members[#members + 1] = {
            identifier = member.identifier,
            name = member.label or member.identifier,
            rank = GetRankName(group, member.id_grade),
            rankLevel = GetRankLevel(group, member.id_grade),
            isOnline = Bridge.GetSourceFromIdentifier(member.identifier) ~= nil,
            isLeader = member.id_grade == 0,
            joinedAt = '',
            contributions = 0
        }
    end
    table.sort(members, function(a, b) return a.rankLevel > b.rankLevel end)

    local ranks = {}
    for _, rank in ipairs(group.ranks) do
        local perms = rank.perms or {}
        local permissions = {}
        for _, key in ipairs(GROUP_PERMISSIONS) do
            permissions[key] = rank.rank == 0 or perms[key] == true
        end
        ranks[#ranks + 1] = {
            id = rank.rank,
            name = rank.name,
            level = GetRankLevel(group, rank.rank),
            permissions = permissions
        }
    end
    table.sort(ranks, function(a, b) return a.level > b.level end)

    local activities = {}
    for _, activity in ipairs(GetGroupActivities(group.id)) do
        activities[#activities + 1] = {
            id = activity.id,
            timestamp = FormatActivityTime(activity.time),
            actor = '',
            title = activity.title,
            description = activity.description,
            type = activity.type
        }
    end

    local permissions = GetMemberPermissions(group, identifier)

    return {
        id = group.id,
        name = group.name,
        devise = group.devise,
        rgb = group.rgb,
        is_official = group.is_official == true,
        slots = group.slots or _GROUP.Slots[group.is_official == true],
        influenceTotal = influenceTotal,
        leaderName = leaderName,
        myRole = {
            rank = GetRankName(group, me.id_grade),
            level = GetRankLevel(group, me.id_grade),
            grade = me.id_grade,
            isLeader = me.id_grade == 0,
            canManage = permissions.canInvite or permissions.canKick or permissions.canPromote,
            permissions = permissions
        },
        members = members,
        ranks = ranks,
        activities = activities,
        salesHistory = {},
        topContributors = {}
    }
end

local function GetContext(source)
    local identifier = Bridge.GetIdentifier(source)
    if not identifier then return nil end

    local group = GetGroupFromLicense(identifier)
    if not group then return nil end

    return group, FindMember(group, identifier), identifier
end

local function Result(source, group, identifier, error)
    return {
        ok = error == nil,
        error = error,
        group = group and SerializeGroupForPlayer(group, identifier) or nil
    }
end

local function CanActOn(actor, target)
    return target and actor.identifier ~= target.identifier and target.id_grade > actor.id_grade
end

function NotifyGroupMember(identifier, message)
    local target = Bridge.GetSourceFromIdentifier(identifier)
    if target then
        Notify(target, message)
    end
end

RegisterServerCallback('sxGroup:getMyGroup', function(source)
    local group, _, identifier = GetContext(source)
    if not group then return { ok = true, group = nil } end
    return Result(source, group, identifier)
end)

RegisterServerCallback('sxGroup:promoteMember', function(source, targetIdentifier)
    local group, actor, identifier = GetContext(source)
    if not group then return { ok = false, error = 'no_group' } end
    if not HasGroupPermission(group, identifier, 'canPromote') then return Result(source, group, identifier, 'no_permission') end

    local target = FindMember(group, targetIdentifier)
    if not CanActOn(actor, target) then return Result(source, group, identifier, 'no_permission') end
    if target.id_grade - 1 <= actor.id_grade and actor.id_grade ~= 0 then
        return Result(source, group, identifier, 'no_permission')
    end

    local newGrade = group:promotePlayer(targetIdentifier)
    if not newGrade then return Result(source, group, identifier, 'max_rank') end

    local rankName = GetRankName(group, newGrade)
    AddGroupActivity(group.id, 'rank', GetPhrase('group_activity_promoted_title'), GetPhrase('group_activity_promoted_desc', target.label, rankName, actor.label))
    NotifyGroupMember(targetIdentifier, GetPhrase('notify_group_promoted', rankName))
    return Result(source, group, identifier)
end)

RegisterServerCallback('sxGroup:demoteMember', function(source, targetIdentifier)
    local group, actor, identifier = GetContext(source)
    if not group then return { ok = false, error = 'no_group' } end
    if not HasGroupPermission(group, identifier, 'canPromote') then return Result(source, group, identifier, 'no_permission') end

    local target = FindMember(group, targetIdentifier)
    if not CanActOn(actor, target) then return Result(source, group, identifier, 'no_permission') end

    local newGrade = group:demotePlayer(targetIdentifier)
    if not newGrade then return Result(source, group, identifier, 'min_rank') end

    local rankName = GetRankName(group, newGrade)
    AddGroupActivity(group.id, 'rank', GetPhrase('group_activity_demoted_title'), GetPhrase('group_activity_demoted_desc', target.label, rankName, actor.label))
    NotifyGroupMember(targetIdentifier, GetPhrase('notify_group_demoted', rankName))
    return Result(source, group, identifier)
end)

RegisterServerCallback('sxGroup:kickMember', function(source, targetIdentifier)
    local group, actor, identifier = GetContext(source)
    if not group then return { ok = false, error = 'no_group' } end
    if not HasGroupPermission(group, identifier, 'canKick') then return Result(source, group, identifier, 'no_permission') end

    local target = FindMember(group, targetIdentifier)
    if not CanActOn(actor, target) then return Result(source, group, identifier, 'no_permission') end

    local label = target.label
    if not group:kickPlayer(targetIdentifier) then return Result(source, group, identifier, 'unknown') end

    AddGroupActivity(group.id, 'member', GetPhrase('group_activity_kicked_title'), GetPhrase('group_activity_kicked_desc', label, actor.label))
    NotifyGroupMember(targetIdentifier, GetPhrase('notify_group_kicked', group.name))
    TriggerEvent('sxIllegals:groupMemberRemoved', group.id, targetIdentifier, 'kick', label)
    return Result(source, group, identifier)
end)

RegisterServerCallback('sxGroup:leaveGroup', function(source)
    local group, actor, identifier = GetContext(source)
    if not group then return { ok = false, error = 'no_group' } end

    if actor.id_grade == 0 then
        local leaders = 0
        for _, member in ipairs(group.members) do
            if member.id_grade == 0 then leaders = leaders + 1 end
        end
        if leaders <= 1 and #group.members > 1 then
            return Result(source, group, identifier, 'last_leader')
        end
    end

    local label = actor.label
    if not group:kickPlayer(identifier) then return Result(source, group, identifier, 'unknown') end

    AddGroupActivity(group.id, 'member', GetPhrase('group_activity_left_title'), GetPhrase('group_activity_left_desc', label))
    TriggerEvent('sxIllegals:groupMemberRemoved', group.id, identifier, 'leave', label)
    Notify(source, GetPhrase('notify_group_left', group.name))
    return { ok = true, group = nil }
end)

RegisterServerCallback('sxGroup:updateDevise', function(source, devise)
    local group, actor, identifier = GetContext(source)
    if not group then return { ok = false, error = 'no_group' } end
    if not HasGroupPermission(group, identifier, 'canEditDevise') then return Result(source, group, identifier, 'no_permission') end
    if type(devise) ~= 'string' then return Result(source, group, identifier, 'invalid_data') end

    devise = devise:sub(1, 120)
    group:changeDevise(devise)
    group:saveGroup()
    AddGroupActivity(group.id, 'member', GetPhrase('group_activity_devise_title'), GetPhrase('group_activity_devise_desc', actor.label))
    return Result(source, group, identifier)
end)

RegisterServerCallback('sxGroup:renameRank', function(source, rankId, newName)
    local group, actor, identifier = GetContext(source)
    if not group then return { ok = false, error = 'no_group' } end
    if not HasGroupPermission(group, identifier, 'canManageRanks') then return Result(source, group, identifier, 'no_permission') end
    if type(newName) ~= 'string' or newName == '' then return Result(source, group, identifier, 'invalid_data') end

    if not group:renameRank(tonumber(rankId), newName:sub(1, 50)) then
        return Result(source, group, identifier, 'invalid_data')
    end
    group:saveGroup()
    AddGroupActivity(group.id, 'rank', GetPhrase('group_activity_rank_renamed_title'), GetPhrase('group_activity_rank_renamed_desc', newName:sub(1, 50), actor.label))
    return Result(source, group, identifier)
end)

RegisterServerCallback('sxGroup:setRankPermissions', function(source, rankId, permissions)
    local group, actor, identifier = GetContext(source)
    if not group then return { ok = false, error = 'no_group' } end
    if actor.id_grade ~= 0 then return Result(source, group, identifier, 'no_permission') end

    rankId = tonumber(rankId)
    if rankId == 0 or type(permissions) ~= 'table' then return Result(source, group, identifier, 'invalid_data') end

    local perms = {}
    for _, key in ipairs(GROUP_PERMISSIONS) do
        perms[key] = permissions[key] == true
    end

    if not group:updateRankPermission(rankId, perms) then
        return Result(source, group, identifier, 'invalid_data')
    end
    group:saveGroup()
    AddGroupActivity(group.id, 'rank', GetPhrase('group_activity_permissions_title'), GetPhrase('group_activity_permissions_desc', GetRankName(group, rankId), actor.label))
    return Result(source, group, identifier)
end)
