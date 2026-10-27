_CONFIG = _CONFIG or {}

_CONFIG.Framework = 'auto'
_CONFIG.Inventory = 'auto'

_CONFIG.Admin = {
    groups = { 'admin', 'superadmin' },
    ace = 'sxillegals.admin',
}

_CONFIG.ActivityLimit = 50

_CONFIG.Webhook = {
    enabled = true,
    username = 'sxIllegals',
    events = {
        group_created = true,
        group_updated = true,
        group_deleted = true,
        member_joined = true,
        member_left = true,
        territory_created = true,
        territory_reset = true,
        territory_contested = true,
        territory_attacked = true,
        territory_captured = true,
        lab_created = true,
        lab_updated = true,
        lab_raided = true,
        police_alert = false,
    },
}
