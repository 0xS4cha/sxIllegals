function GetSexFromModel(model)
    local hash = GetSafeHashKey(model)
    if hash == GetHashKey("mp_m_freemode_01") then
        return 0
    elseif hash == GetHashKey("mp_f_freemode_01") then
        return 1
    else
        return 2
    end
end

function GetGridZoneId(x, y)
    local min = -8000
    local max = 8000
    local step = (max - min) / 32 -- 500

    local xIdx = math.floor((x - min) / step)
    local yIdx = math.floor((y - min) / step)

    return xIdx + (yIdx * 100)
end

function GetGridsSurroundingPosition(pos)
    local grids = {}
    local offsets = { -75, 0, 75 }

    for i = 1, 3 do
        for j = 1, 3 do
            local x = pos.x + offsets[i]
            local y = pos.y + offsets[j]
            grids[GetGridZoneId(x, y)] = true
        end
    end

    return grids
end
