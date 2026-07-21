Labs = Labs or {}

function Labs:SetInteriorProp(interior, type, level)
    RefreshInterior(interior)
    Labs:DisableAllInteriorsProp(interior)    
    for _, interiorprop in pairs(Labs.ConfigurationInt[type][level] or {}) do
        EnableInteriorProp(interior, interiorprop)
    end
end

function Labs:DisableAllInteriorsProp(interior)
    RefreshInterior(interior)
    for _, type in pairs(Labs.ConfigurationInt) do
        for _, interiorprops in pairs(type) do
            for _, interiorprop in pairs(interiorprops) do
                DisableInteriorProp(interior, interiorprop)
            end
        end
    end
end

function Labs:AttachEntityToEntity(ped, model, spawn, position, rotation, boneIndex, useSoftPinning, collision, vertexIndex, fixedRot)
    local hash = Labs:RequestModel(model)
    local object = CreateObject(hash, spawn.x, spawn.y, spawn.z, true, true, true)
    SetModelAsNoLongerNeeded(hash)
    AttachEntityToEntity(object, ped, GetPedBoneIndex(ped, boneIndex or 28422), position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, true, useSoftPinning or true, collision or false, true, vertexIndex or 1, fixedRot or true)
    return object    
end

function Labs:GetClosest(points)
    local position = GetEntityCoords(PlayerPedId())
    local key
    local dist = math.maxinteger
    for k, point in pairs(points) do
        local oldDist = dist
        dist = math.min(dist, Vdist2(point, position))
        if dist ~= oldDist then key = k end
    end
    return key, dist
end

function Labs:GetLevelMax(type)
    return #Labs.ConfigurationInt[type]
end

function Labs:IsLevelMax(type, level)
    return level == Labs:GetLevelMax(type)
end

function Labs:KillModules()
    WeedThread = false
    Citizen.Wait(1000)
end

function Labs:PlayAnimation(ped, dict, anim, duration, flag, lock, inSpeed, outSpeed)
    duration = duration or -1
    flag = flag or 16
    lock = lock or false
    inSpeed = inSpeed or 1.0
    outSpeed = outSpeed or 1.0
    UtilsFunction:RequestAnimDict(dict)
    TaskPlayAnim(ped, dict, anim, inSpeed, outSpeed, duration, flag, 0.0, lock, lock, lock)
end

function Labs:PlayLabosAnimation(pos, dictionary, animation, duration, wait)
    local ped = PlayerPedId()
    TaskTurnPedToFaceCoord(ped, pos.x, pos.y, pos.z, 1000)
    Citizen.Wait(1000)
    Labs:PlayAnimation(ped, dictionary, animation, duration or -1)
    Wait(wait)
end

function Labs:RequestModel(model)
	local modelHash = tonumber(model)
	if modelHash == nil then modelHash = (GetHashKey(model)) end
	if not HasModelLoaded(modelHash) then
		RequestModel(modelHash)
		while not HasModelLoaded(modelHash) do
			Citizen.Wait(10)
		end
	end
	return modelHash
end

function Labs:RequestAnimDict(animDict)
    if not HasAnimDictLoaded(animDict) then
		RequestAnimDict(animDict)
		while not HasAnimDictLoaded(animDict) do
			Citizen.Wait(1)
		end
	end
end

function Labs:PlayAnimation(ped, dict, anim, duration, flag, lock, inSpeed, outSpeed)
    duration = duration or -1
    flag = flag or 16
    lock = lock or false
    inSpeed = inSpeed or 1.0
    outSpeed = outSpeed or 1.0
    Labs:RequestAnimDict(dict)
    TaskPlayAnim(ped, dict, anim, inSpeed, outSpeed, duration, flag, 0.0, lock, lock, lock)
end

function Labs:DeepCopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in next, orig, nil do
            copy[Labs:DeepCopy(orig_key)] = Labs:DeepCopy(orig_value)
        end
        setmetatable(copy, Labs:DeepCopy(getmetatable(orig)))
    else -- number, string, boolean, etc
        copy = orig
    end
    return copy
end