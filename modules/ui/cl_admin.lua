RegisterCommand('adminpanel', function()
    local isAdmin = TriggerServerCallback('sxAdmin:isAdmin')
    if isAdmin then
        SX.UI:Open('admin')
    else
        BeginTextCommandThefeedPost("STRING")
        AddTextComponentSubstringPlayerName("~r~Vous n'avez pas la permission d'ouvrir le panel admin.")
        EndTextCommandThefeedPostTicker(false, true)
    end
end, false)

RegisterKeyMapping('adminpanel', 'Ouvrir le panel admin', 'keyboard', '')
