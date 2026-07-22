local GroupList = {}

groupLoaded = false

function GetGroupFromId(id)
    return GroupList[id]
end

function GetGroupInformationFromId(id)
    local group = GetGroupFromId(id)
    if not group then
        return false, nil, nil
    end
    return true, group.name, group.rgb, group.is_official
end

function GetGroupFromLicense(license)
    for _, group in pairs(GroupList) do
        for i = 1, #group.members do
            local member = group.members[i]
            if member and member.identifier == license then
                return group
            end
        end
    end
    return false
end

function GetAllGroup()
    return GroupList
end

function RemoveGroup(id)
    GroupList[id] = nil
    return true
end

group = newClass()

function group:new(data)
    if not data.id then return end
    local self = setmetatable({}, group)
    self.id = data.id or 0
    self.name = data.name or ''
    self.devise = data.devise or ''
    self.rgb = data.rgb or { r = 255, g = 255, b = 255 }
    self.members = data.members or {}
    self.ranks = data.ranks or {}
    self.is_official = data.is_official or false
    self.slots = data.slots
    GroupList[self.id] = self
    return self
end

function group:getDevise()
    return self.devise
end

function group:changeDevise(str)
    self:setNeedSave(true)
    self.devise = str
    return true
end

function group:is_official()
    return self.is_official
end

function group:setOfficial(status)
    self.is_official = status
    return true
end

function group:getName()
    return self.name
end

function group:renameGroup(name)
    self:setNeedSave(true)
    self.name = name
    return true
end

function group:getRankExistFromId(rankId)
    for _, rank in pairs(self.ranks) do
        if rank.rank == rankId then
            return true
        end
    end
    return false
end

function group:getId()
    return self.id
end

function group:getRGB()
    return self.rgb
end

function group:promotePlayer(identifier)
    for i = 1, #self.members do
        local member = self.members[i]
        if member.identifier == identifier then
            local newGrade = member.id_grade - 1
            while not self:getRankExistFromId(newGrade) and newGrade >= 0 do
                Wait(100)
                newGrade = newGrade - 1
                if newGrade > 100 then break end
            end
            if self:getRankExistFromId(newGrade) then
                self:setNeedSave(true)
                member.id_grade = newGrade
                return member.id_grade
            end
            return false
        end
    end
end

function group:getPlayerRank(identifier)
    for i = 1, #self.members do
        local member = self.members[i]
        if member.identifier == identifier then
            return member.rank
        end
    end
end

function group:renameRank(rankId, newName)
    for i = 1, #self.ranks do
        local rank = self.ranks[i]
        if rank.rank == rankId then
            self.ranks[i].name = newName
            return true
        end
    end
    return false
end

function group:getPlayerlist()
    return self.members
end

function group:updateRankPermission(rankId, perm)
    for i = 1, #self.ranks do
        local rank = self.ranks[i]
        if rank.rank == rankId then
            self:setNeedSave(true)
            self.ranks[i].perms = perm
            return true
        end
    end
    return false
end

function group:prettyPlayerlist()
    local enrichedMembers = {}

    for _, member in ipairs(self.members) do
        local rankLabel = "unkown"
        for _, rank in ipairs(self.ranks) do
            if rank.rank == member.id_grade then
                rankLabel = rank.name
                break
            end
        end

        local enriched = table.clone(member)
        enriched.rankLabel = rankLabel

        enrichedMembers[#enrichedMembers + 1] = enriched
    end

    return enrichedMembers
end

function group:kickPlayer(identifier)
    for i = 1, #self.members do
        local member = self.members[i]
        if member.identifier == identifier then
            local result = MySQL.Sync.execute(
                "DELETE FROM group_members WHERE groupId = @groupId AND identifier = @identifier", {
                    ['@groupId'] = self.id,
                    ['@identifier'] = identifier
                })
            if result then
                self:setNeedSave(true)
                self.members[i] = nil
                return true
            end
            return false
        end
    end
    return false
end

function group:demotePlayer(identifier)
    for i = 1, #self.members do
        local member = self.members[i]
        if member.identifier == identifier then
            local newGrade = member.id_grade + 1
            while not self:getRankExistFromId(newGrade) and newGrade >= 0 do
                Wait(100)
                newGrade = newGrade + 1
                if newGrade > 100 then break end
            end
            if newGrade then
                member.id_grade = newGrade
                self:setNeedSave(true)
                return member.id_grade
            end
            return false
        end
    end
end

function group:getLastRank()
    local id = 0
    for i = 1, #self.ranks do
        if self.ranks[i].rank > id then
            id = self.ranks[i].rank
        end
    end
    return id
end

function group:getRankList()
    return self.ranks
end

function group:getPermissionFromRank(id)
    for i = 1, #self.ranks do
        if self.ranks[i].rank == id then
            return self.ranks[i].perms
        end
    end
    return false
end

function group:getRankFromPlayer(identifier)
    local id = 0
    for i = 1, #self.members do
        if self.members[i].identifier == identifier then
            return self.members[i].id_grade
        end
    end
    return false
end

function group:setNeedSave(needSave)
    self.needSave = needSave
end

function group:getNeedSave()
    return self.needSave
end

function group:recruitPlayer(identifier, rank)
    local maxSlots = self.slots or _GROUP.Slots[self.is_official]
    if #self.members < maxSlots then
        local pResult = MySQL.Sync.fetchAll("SELECT * FROM users WHERE identifier = @identifier", {
            ["@identifier"] = identifier
        })
        local pName = {}
        pName.Firstname = pResult[1].firstname
        pName.Lastname = pResult[1].lastname
        pName.Name = pName.Firstname .. ' ' .. pName.Lastname
        pName.rank = rank or self:getLastRank()
        local id = MySQL.Sync.insert(
            "INSERT INTO group_members (identifier, label, id_grade, groupId) VALUES (?, ?, ?, ?)"
            , {
                identifier,
                pName.Name,
                pName.rank,
                self.id
            })
        self.members[#self.members + 1] = {
            identifier = identifier,
            label = pName.Name,
            id_grade = pName.rank,
            groupId =
                self.id
        }
        return pName.Name
    else
        return false
    end
end

function group:saveGroup()
    MySQL.Async.execute([[
        UPDATE group_list
        SET name = ?, devise = ?, rgb = ?, is_official = ?, slots = ?
        WHERE id = ?
    ]], {
        self.name,
        self.devise,
        json.encode(self.rgb),
        self.is_official and 1 or 0,
        self.slots,
        self.id
    })

    if #self.ranks > 0 then
        local query = "INSERT INTO group_grades (id, groupId, name, rank, perms) VALUES "
        local params = {}

        for i, rank in ipairs(self.ranks) do
            query = query .. "(?, ?, ?, ?, ?),"
            table.insert(params, rank.id)
            table.insert(params, self.id)
            table.insert(params, rank.name)
            table.insert(params, rank.rank)
            table.insert(params, json.encode(rank.perms))
        end

        query = query:sub(1, -2)
        query = query .. " ON DUPLICATE KEY UPDATE name = VALUES(name), rank = VALUES(rank), perms = VALUES(perms);"

        MySQL.Async.execute(query, params)
    end

    if #self.members > 0 then
        local query = "INSERT INTO group_members (id, groupId, label, id_grade) VALUES "
        local values = {}
        local params = {}

        for i, member in ipairs(self.members) do
            query = query .. "(?, ?, ?, ?),"
            table.insert(params, member.id)
            table.insert(params, self.id)
            table.insert(params, member.label)
            table.insert(params, member.id_grade)
        end

        query = query:sub(1, -2)
        query = query .. " ON DUPLICATE KEY UPDATE label = VALUES(label), id_grade = VALUES(id_grade);"

        MySQL.Async.execute(query, params)
    end
end

local function ConvertToBool(number)
    local number = tonumber(number)
    if number == 1 then return true else return false end
end

local function LoadGroup()
    local result = MySQL.Sync.fetchAll('SELECT * FROM group_list', {})
    for _, v in pairs(result) do
        v.is_official = ConvertToBool(v.is_official)
        v.ranks = MySQL.Sync.fetchAll('SELECT * FROM group_grades WHERE groupId = ?', { v.id })
        v.members = MySQL.Sync.fetchAll('SELECT * FROM group_members WHERE groupId = ?', { v.id })
        for i = 1, #v.ranks do
            v.ranks[i].perms = json.decode(v.ranks[i].perms)
        end
        v.rgb = json.decode(v.rgb)
        group:new(v)
    end
    Logger:info('LOAD', "All group have been loaded.")
end

MySQL.ready(function()
    -- Check if group_list.id is varchar
    local result = MySQL.Sync.fetchAll("SHOW COLUMNS FROM `group_list` WHERE Field = 'id'")
    if result and result[1] and not result[1].Type:find("varchar") then
        Logger:info('DATABASE', "Migrating group_list and labs IDs to VARCHAR(50)...")

        -- Drop foreign key constraints safely
        pcall(function() MySQL.Sync.execute("ALTER TABLE `group_grades` DROP FOREIGN KEY `group_grades_ibfk_1`") end)
        pcall(function() MySQL.Sync.execute("ALTER TABLE `group_members` DROP FOREIGN KEY `group_members_ibfk_1`") end)

        -- Modify group_list id
        MySQL.Sync.execute("ALTER TABLE `group_list` MODIFY `id` VARCHAR(50) NOT NULL")

        -- Modify group_grades and group_members groupId columns
        MySQL.Sync.execute("ALTER TABLE `group_grades` MODIFY `groupId` VARCHAR(50) NOT NULL")
        MySQL.Sync.execute("ALTER TABLE `group_members` MODIFY `groupId` VARCHAR(50) NOT NULL")

        -- Re-add constraints with ON DELETE CASCADE
        pcall(function()
            MySQL.Sync.execute(
            "ALTER TABLE `group_grades` ADD CONSTRAINT `group_grades_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `group_list` (`id`) ON DELETE CASCADE")
        end)
        pcall(function()
            MySQL.Sync.execute(
            "ALTER TABLE `group_members` ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `group_list` (`id`) ON DELETE CASCADE")
        end)
    end

    -- Check if labs.id is varchar
    local labsResult = MySQL.Sync.fetchAll("SHOW COLUMNS FROM `labs` WHERE Field = 'id'")
    if labsResult and labsResult[1] and not labsResult[1].Type:find("varchar") then
        MySQL.Sync.execute("ALTER TABLE `labs` MODIFY `id` VARCHAR(50) NOT NULL")
    end

    -- Ensure statistics logs table exists
    MySQL.Sync.execute([[
        CREATE TABLE IF NOT EXISTS `statistics_logs` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `type` VARCHAR(50) NOT NULL,
            `amount` INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])

    MySQL.query("ALTER TABLE `group_list` ADD COLUMN IF NOT EXISTS `slots` INT DEFAULT NULL", {}, function()
        Wait(1000)
        LoadGroup()
        groupLoaded = true
    end)
end)

AddEventHandler("onResourceStop", function(resource)
    if resource == GetCurrentResourceName() then
        Logger:info('SAVE', "Resource stopping, saving groups.")
        local groupLists = GetAllGroup()
        for k, v in pairs(groupLists) do
            if v:getNeedSave() then
                v:saveGroup()
            end
        end
    end
end)


RegisterServerCallback('sxGroup:getGroupList', function(_)
    return GetAllGroup()
end)
