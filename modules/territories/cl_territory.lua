Territories = {}
local OverlayId = 0

function Territories.Load()
    OverlayId = AddMinimapOverlay("core/MINIMAP_LOADER.gfx")
    while not HasMinimapOverlayLoaded(OverlayId) do Citizen.Wait(0) end
    SetMinimapOverlayDisplay(OverlayId, 0.0, 0.0, 100.0, 100.0, 100.0)
end

function Territories.Add(name, alpha)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "ADD_TERRITORY");
    ScaleformMovieMethodAddParamPlayerNameString(name);
    ScaleformMovieMethodAddParamInt(alpha);
    EndScaleformMovieMethod();
end

function Territories.AddPoint(name, coords)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "ADD_POINT_TO_TERRITORY");
    ScaleformMovieMethodAddParamPlayerNameString(name);
    ScaleformMovieMethodAddParamFloat(coords.x);
    ScaleformMovieMethodAddParamFloat(-coords.y);
    EndScaleformMovieMethod();
end

function Territories.ResetPoints(name)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "RESET_TERRITORY_POINTS");
    ScaleformMovieMethodAddParamPlayerNameString(name);
    EndScaleformMovieMethod();
end

function Territories.SetAttackState(name, attackState)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "SET_TERRITORY_ATTACK_STATE");
    ScaleformMovieMethodAddParamPlayerNameString(name);
    ScaleformMovieMethodAddParamInt(attackState);
    EndScaleformMovieMethod();
end

function Territories.SetAlpha(name, alpha)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "SET_TERRITORY_ALPHA");
    ScaleformMovieMethodAddParamPlayerNameString(name);
    ScaleformMovieMethodAddParamInt(alpha);
    EndScaleformMovieMethod();
end

function Territories.SetColor(name, r, g, b)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "SET_TERRITORY_COLOR");
    ScaleformMovieMethodAddParamPlayerNameString(name);
    ScaleformMovieMethodAddParamInt(r);
    ScaleformMovieMethodAddParamInt(g);
    ScaleformMovieMethodAddParamInt(b);
    EndScaleformMovieMethod();
end

function Territories.SetVisible(name, bool)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "SET_TERRITORY_VISIBLE")
    ScaleformMovieMethodAddParamPlayerNameString(name);
    ScaleformMovieMethodAddParamBool(bool);
    EndScaleformMovieMethod();
end

function Territories.Draw(name, color, border)
    if OverlayId == 0 then Territories.Load() end
    CallMinimapScaleformFunction(OverlayId, "DRAW_TERRITORY")
    ScaleformMovieMethodAddParamPlayerNameString(name);
    ScaleformMovieMethodAddParamInt(color);
    ScaleformMovieMethodAddParamInt(border);
    EndScaleformMovieMethod();
end

Citizen.CreateThread(function()
    Territories.Load()
end)
