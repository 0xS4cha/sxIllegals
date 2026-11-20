TerritoryHelp = {}

local WAR_MENU = 'war'
local TERRITORY_MENU = 'territory'
local MAP_MENU = 'map'
local MAP_MAX_GROUPS = 4
local Settings = _CONFIG.HelpMenu or {}

local warUntil = 0

local function IsWarShown()
    return GetGameTimer() < warUntil
end

local function Percent(value)
    return ('%d%%'):format(math.floor(value * 100 + 0.5))
end

local function Share(entry, total)
    if not entry or not total or total <= 0 then return 0 end
    return entry.points / total
end

local function FindInfluence(territory, groupId)
    for _, entry in ipairs(territory.influence or {}) do
        if entry.id == groupId then return entry end
    end
    return nil
end

local function StateRow(attackState, war)
    if attackState == 1 then
        return {
            type = 'text',
            label = GetPhrase('help_territory_state'),
            value = war and war.attacker and GetPhrase('help_territory_attacked_by', war.attacker) or GetPhrase('territory_state_attack'),
            icon = 'swords',
            tone = 'danger',
        }
    elseif attackState == 2 then
        return { type = 'text', label = GetPhrase('help_territory_state'), value = GetPhrase('territory_state_contested'), icon = 'triangle-alert', tone = 'warning' }
    end
    return { type = 'text', label = GetPhrase('help_territory_state'), value = GetPhrase('territory_state_calm'), icon = 'shield-check', tone = 'safe' }
end

function TerritoryHelp.Enter(territoryId)
    if IsWarShown() or not HelpUI.IsEnabled('territory') then return end

    CreateThread(function()
        local info = TriggerServerCallback('sxIllegals:getTerritoryInfo', territoryId) or {}
        local territory = TerritoriesList[territoryId]
        if not territory or PlayerInTerritory ~= territoryId or IsWarShown() then return end

        local total = territory.totalInfluence or 0
        local owner = territory.influence and territory.influence[1]
        local ownerTone = owner and HelpUI.Color(owner.rgb) or 'neutral'
        local rows = {
            {
                type = 'text',
                label = GetPhrase('territory_domination'),
                value = owner and owner.name or GetPhrase('none'),
                icon = 'crown',
                tone = ownerTone,
            },
            {
                type = 'bar',
                label = GetPhrase('territories_influence'),
                value = Share(owner, total),
                display = Percent(Share(owner, total)),
                tone = ownerTone,
            },
        }

        if info.groupId and (not owner or owner.id ~= info.groupId) then
            local mine = FindInfluence(territory, info.groupId)
            rows[#rows + 1] = {
                type = 'bar',
                label = GetPhrase('help_territory_my_influence'),
                value = Share(mine, total),
                display = Percent(Share(mine, total)),
                tone = 'accent',
            }
        end

        rows[#rows + 1] = StateRow(territory.attackState or 0, { attacker = info.attacker })

        local footer = nil
        if owner then
            footer = {
                label = GetPhrase('help_territory_held_for'),
                items = { { value = GetPhrase('territory_days', territory.date or 0), icon = 'calendar' } },
            }
        end

        HelpUI.Show('territory', TERRITORY_MENU, {
            header = { subtitle = GetPhrase('help_territory_subtitle'), title = territory.label or territory.id },
            rows = rows,
            footer = footer,
            duration = Settings.territoryDuration or 6000,
        })
    end)
end

function TerritoryHelp.Leave()
    HelpUI.Hide(TERRITORY_MENU)
end

local function WarStatus(state, role)
    if state.ended == 'captured' then
        return role == 'attacker' and GetPhrase('help_war_captured') or GetPhrase('help_war_lost'),
            role == 'attacker' and 'safe' or 'danger'
    elseif state.ended == 'defended' then
        return role == 'attacker' and GetPhrase('help_war_failed') or GetPhrase('help_war_defended'),
            role == 'attacker' and 'danger' or 'safe'
    elseif state.defenders > 0 then
        return role == 'attacker' and GetPhrase('help_war_blocked_attacker') or GetPhrase('help_war_blocked_defender'),
            role == 'attacker' and 'warning' or 'safe'
    end
    return role == 'attacker' and GetPhrase('help_war_holding_attacker') or GetPhrase('help_war_holding_defender'),
        role == 'attacker' and 'safe' or 'danger'
end

RegisterNetEvent('sxIllegals:warState', function(state, role)
    if type(state) ~= 'table' or not HelpUI.IsEnabled('war') then return end

    local progress = math.min(state.progress / math.max(state.captureTime, 1), 1.0)
    local remaining = math.max(0, state.captureTime - state.progress)
    local status, statusTone = WarStatus(state, role)
    local enough = state.attackers >= state.required

    local duration = state.ended and 6000 or (state.interval * 1000 + 3000)

    HelpUI.Hide(TERRITORY_MENU)
    local shown = HelpUI.Show('war', WAR_MENU, {
        header = {
            subtitle = role == 'attacker' and GetPhrase('help_war_attack') or GetPhrase('help_war_defense'),
            title = state.label,
        },
        rows = {
            {
                type = 'bar',
                label = GetPhrase('help_war_capture'),
                value = progress,
                display = state.ended and Percent(state.ended == 'captured' and 1 or progress)
                    or ('%s · %s'):format(Percent(progress), HelpUI.Duration(remaining)),
                tone = role == 'attacker' and 'warning' or 'danger',
            },
            {
                type = 'stats',
                items = {
                    {
                        label = state.attacker,
                        value = ('%d/%d'):format(state.attackers, state.required),
                        icon = 'swords',
                        tone = enough and 'danger' or 'neutral',
                    },
                    {
                        label = state.defender,
                        value = tostring(state.defenders),
                        icon = 'shield',
                        tone = state.defenders > 0 and 'safe' or 'neutral',
                    },
                },
            },
            { type = 'text', label = GetPhrase('help_territory_state'), value = status, tone = statusTone, scramble = false },
        },
        duration = duration,
    })

    warUntil = shown and GetGameTimer() + duration or 0
end)

function TerritoryHelp.CanShowOnMap()
    return HelpUI.IsEnabled('mapHover') and HelpUI.AtLeast('1.3.0')
end

function TerritoryHelp.ShowOnMap(territoryId)
    if not TerritoryHelp.CanShowOnMap() then return false end

    local territory = TerritoriesList[territoryId]
    if not territory then return false end

    local total = territory.totalInfluence or 0
    local influence = territory.influence or {}
    local owner = influence[1]
    local rows = {
        {
            type = 'text',
            label = GetPhrase('territory_domination'),
            value = owner and owner.name or GetPhrase('none'),
            icon = 'crown',
            tone = owner and HelpUI.Color(owner.rgb) or 'neutral',
        },
    }

    for i = 1, math.min(#influence, MAP_MAX_GROUPS) do
        local entry = influence[i]
        rows[#rows + 1] = {
            type = 'bar',
            label = entry.name or GetPhrase('none'),
            value = Share(entry, total),
            display = Percent(Share(entry, total)),
            tone = HelpUI.Color(entry.rgb) or 'neutral',
        }
    end

    rows[#rows + 1] = StateRow(territory.attackState or 0)

    local footer = nil
    if owner then
        footer = {
            label = GetPhrase('help_territory_held_for'),
            items = { { value = GetPhrase('territory_days', territory.date or 0), icon = 'calendar' } },
        }
    end

    return HelpUI.Show('mapHover', MAP_MENU, {
        header = {
            subtitle = GetPhrase('help_territory_subtitle'),
            title = territory.label or territory.id,
            watermark = territory.label or territory.id,
        },
        rows = rows,
        footer = footer,
        position = Settings.mapPosition or 'top-left',
        offset = Settings.mapOffset,
        pauseMenu = true,
    }) ~= nil
end

function TerritoryHelp.HideOnMap()
    HelpUI.Hide(MAP_MENU)
end
