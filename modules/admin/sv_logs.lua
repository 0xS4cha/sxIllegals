local webhookUrl = GetConvar('sx_illegals_webhook', '')

local SEVERITY_COLORS = {
    info = 3447003,
    success = 5763719,
    warning = 16705372,
    danger = 15548997,
}

function SendDiscordLog(event, title, description, severity, fields)
    if not _CONFIG.Webhook.enabled or webhookUrl == '' then return end
    if not event or not _CONFIG.Webhook.events[event] then return end

    PerformHttpRequest(webhookUrl, function() end, 'POST', json.encode({
        username = _CONFIG.Webhook.username,
        embeds = { {
            title = title,
            description = description,
            color = SEVERITY_COLORS[severity] or SEVERITY_COLORS.info,
            fields = fields,
            timestamp = os.date('!%Y-%m-%dT%H:%M:%SZ'),
            footer = { text = 'sxIllegals' },
        } },
    }), { ['Content-Type'] = 'application/json' })
end

function AddAdminActivity(entry, logEvent)
    entry.id = entry.id or ('act-' .. os.time() .. '-' .. math.random(100, 999))
    entry.time = entry.time or os.time()
    table.insert(AdminActivities, 1, entry)

    while #AdminActivities > _CONFIG.ActivityLimit do
        table.remove(AdminActivities)
    end

    if logEvent then
        SendDiscordLog(logEvent, entry.title, entry.description, entry.severity)
    end
end
