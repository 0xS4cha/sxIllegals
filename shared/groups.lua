_GROUP = _GROUP or {}

_GROUP.AutomaticAdminJoin = true
_GROUP.PlayersCanCreate = true
_GROUP.Unofficial = true
_GROUP.SaveInterval = 5
_GROUP.InvitationDuration = 120
_GROUP.Slots = {
    [true] = 15,
    [false] = 5
}

_GROUP.DefaultRanks = {
    { label = 'grade_boss', rank = 0, perms = {} },
    { label = 'grade_lieutenant', rank = 1, perms = { canInvite = true, canKick = true, canPromote = true } },
    { label = 'grade_recruit', rank = 2, perms = {} },
}

_GROUP.Alerts = {
    icon = 'CHAR_LESTER',
    sound = true,
    blipDuration = 60,
}
