local BLIP_INFO_DATA = {}


function EnsureBlipInfoTerritory(zone)
    if not BLIP_INFO_DATA[zone] then BLIP_INFO_DATA[zone] = {} end
    if not BLIP_INFO_DATA[zone].title then BLIP_INFO_DATA[zone].title = "" end
    if not BLIP_INFO_DATA[zone].rockstarVerified then BLIP_INFO_DATA[zone].rockstarVerified = false end
    if not BLIP_INFO_DATA[zone].info then BLIP_INFO_DATA[zone].info = {} end
    if not BLIP_INFO_DATA[zone].money then BLIP_INFO_DATA[zone].money = "" end
    if not BLIP_INFO_DATA[zone].rp then BLIP_INFO_DATA[zone].rp = "" end
    if not BLIP_INFO_DATA[zone].dict then BLIP_INFO_DATA[zone].dict = "" end
    if not BLIP_INFO_DATA[zone].tex then BLIP_INFO_DATA[zone].tex = "" end
    return BLIP_INFO_DATA[zone]
end

function ResetBlipInfoTerritory(blip)
    BLIP_INFO_DATA[blip] = nil
end

function SetBlipInfoTitleTerritory(zone, title, rockstarVerified)
    local data = EnsureBlipInfoTerritory(zone)
    data.title = title or ""
    data.rockstarVerified = rockstarVerified or false
end

function SetBlipInfoImageTerritory(blip, dict, tex)
    local data = EnsureBlipInfoTerritory(blip)
    data.dict = dict or ""
    data.tex = tex or ""
end

function SetBlipInfoEconomyTerritory(blip, rp, money)
    local data = EnsureBlipInfoTerritory(blip)
    data.money = tostring(money) or ""
    data.rp = tostring(rp) or ""
end

function SetBlipInfoTerritory(blip, info)
    local data = EnsureBlipInfoTerritory(blip)
    data.info = info
end

function AddBlipInfoTextTerritory(blip, leftText, rightText)
    local data = EnsureBlipInfoTerritory(blip)
    if rightText then
        table.insert(data.info, {1, leftText or "", rightText or ""})
    else
        table.insert(data.info, {5, leftText or "", ""})
    end
end

function AddBlipInfoNameTerritory(blip, leftText, rightText)
    local data = EnsureBlipInfoTerritory(blip)
    table.insert(data.info, {3, leftText or "", rightText or ""})
end

function AddBlipInfoHeaderTerritory(blip, leftText, rightText)
    local data = EnsureBlipInfoTerritory(blip)
    table.insert(data.info, {4, leftText or "", rightText or ""})
end

function AddBlipInfoIconTerritory(blip, leftText, rightText, iconId, iconColor, checked)
    local data = EnsureBlipInfoTerritory(blip)
    table.insert(data.info, {2, leftText or "", rightText or "", iconId or 0, iconColor or 0, checked or false})
end

local Display = 1
function UpdateDisplayTerritory()
    if PushScaleformMovieFunctionN("DISPLAY_DATA_SLOT") then
        PushScaleformMovieFunctionParameterInt(Display)
        PopScaleformMovieFunctionVoid()
    end
end

function SetColumnStateTerritory(column, state)
    if PushScaleformMovieFunctionN("SHOW_COLUMN") then
        PushScaleformMovieFunctionParameterInt(column)
        PushScaleformMovieFunctionParameterBool(state)
        PopScaleformMovieFunctionVoid()
    end
end

function ShowDisplayTerritory(show)
    SetColumnStateTerritory(Display, show)
end

function func_36(fParam0)
    BeginTextCommandScaleformString(fParam0)
    EndTextCommandScaleformString()
end

function SetIconTerritory(index, title, text, icon, iconColor, completed)
    if PushScaleformMovieFunctionN("SET_DATA_SLOT") then
        PushScaleformMovieFunctionParameterInt(Display)
        PushScaleformMovieFunctionParameterInt(index)
        PushScaleformMovieFunctionParameterInt(65)
        PushScaleformMovieFunctionParameterInt(3)
        PushScaleformMovieFunctionParameterInt(2)
        PushScaleformMovieFunctionParameterInt(0)
        PushScaleformMovieFunctionParameterInt(1)
        func_36(title)
        func_36(text)
        PushScaleformMovieFunctionParameterInt(icon)
        PushScaleformMovieFunctionParameterInt(iconColor)
        PushScaleformMovieFunctionParameterBool(completed)
        PopScaleformMovieFunctionVoid()
    end
end

function SetTextTerritory(index, title, text, textType)
    if PushScaleformMovieFunctionN("SET_DATA_SLOT") then
        PushScaleformMovieFunctionParameterInt(Display)
        PushScaleformMovieFunctionParameterInt(index)
        PushScaleformMovieFunctionParameterInt(65)
        PushScaleformMovieFunctionParameterInt(3)
        PushScaleformMovieFunctionParameterInt(textType or 0)
        PushScaleformMovieFunctionParameterInt(0)
        PushScaleformMovieFunctionParameterInt(0)
        func_36(title)
        func_36(text)
        PopScaleformMovieFunctionVoid()
    end
end

local _labels = 0
local _entries = 0
function ClearDisplayTerritory()
    if PushScaleformMovieFunctionN("SET_DATA_SLOT_EMPTY") then
        PushScaleformMovieFunctionParameterInt(Display)
    end
    PopScaleformMovieFunctionVoid()
    _labels = 0
    _entries = 0
end

function _labelTerritory(text)
    local lbl = "LBL" .. _labels
    AddTextEntry(lbl, text)
    _labels = _labels + 1
    return lbl
end

function SetTitleTerritory(title, rockstarVerified, rp, money, dict, tex)
    if PushScaleformMovieFunctionN("SET_COLUMN_TITLE") then
        PushScaleformMovieFunctionParameterInt(Display)
        func_36("")
        func_36(_labelTerritory(title))
        PushScaleformMovieFunctionParameterInt(rockstarVerified)
        PushScaleformMovieFunctionParameterString(dict)
        PushScaleformMovieFunctionParameterString(tex)
        PushScaleformMovieFunctionParameterInt(0)
        PushScaleformMovieFunctionParameterInt(0)
        if rp == "" then
            PushScaleformMovieFunctionParameterBool(0)
        else
            func_36(_labelTerritory(rp))
        end
        if money == "" then
            PushScaleformMovieFunctionParameterBool(0)
        else
            func_36(_labelTerritory(money))
        end
    end
    PopScaleformMovieFunctionVoid()
end

function AddTextTerritory(title, desc, style)
    SetTextTerritory(_entries, _labelTerritory(title), _labelTerritory(desc), style or 1)
    _entries = _entries + 1
end

function AddIconTerritory(title, desc, icon, color, checked)
    SetIconTerritory(_entries, _labelTerritory(title), _labelTerritory(desc), icon, color, checked)
    _entries = _entries + 1
end
