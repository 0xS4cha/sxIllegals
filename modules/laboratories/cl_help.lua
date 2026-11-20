-- sxHelpMenu widget shown while the player is inside a laboratory.
-- The native help texts of the workstations are kept, the widget shows the lab itself.

LabHelp = {}

local MENU = 'laboratory'
local Settings = _CONFIG.HelpMenu or {}
local session = 0

local TYPE_ICONS = { weed = 'leaf', coke = 'gem', meth = 'flask-conical' }

local function Build(data)
    return {
        header = {
            subtitle = GetPhrase('lab_type_' .. tostring(data.type)),
            title = data.label,
        },
        title = GetPhrase('help_lab_title'),
        icon = TYPE_ICONS[data.type] or 'flask-conical',
        rows = {
            {
                type = 'slider',
                label = GetPhrase('lab_level'),
                value = data.level,
                max = data.maxLevel,
                display = ('%d/%d'):format(data.level, data.maxLevel),
                tone = 'accent',
            },
            {
                type = 'text',
                label = GetPhrase('lab_owner'),
                value = data.owner or GetPhrase('lab_owner_none'),
                icon = 'users',
            },
            {
                type = 'text',
                id = 'status',
                label = GetPhrase('help_lab_status'),
                value = data.status,
                tone = data.active and 'safe' or 'neutral',
                scramble = false,
            },
        },
        footer = {
            label = GetPhrase('help_lab_output'),
            items = { { value = ('x%.2f'):format(data.multiplier), icon = 'trending-up' } },
        },
    }
end

function LabHelp.Start()
    if not HelpUI.IsEnabled('laboratory') then return end
    session = session + 1
    local token = session

    CreateThread(function()
        -- Lets the server register the player in the laboratory first
        Wait(1000)
        while token == session and Labs.IsInLab do
            local data = TriggerServerCallback('sxIllegals:getLabStatus')
            if token ~= session or not Labs.IsInLab then break end
            if data then
                HelpUI.Show('laboratory', MENU, Build(data))
            end
            Wait(Settings.laboratoryRefresh or 5000)
        end
        if token == session then
            HelpUI.Hide(MENU)
        end
    end)
end

function LabHelp.Stop()
    session = session + 1
    HelpUI.Hide(MENU)
end
