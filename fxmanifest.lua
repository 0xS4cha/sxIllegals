fx_version 'cerulean'
game 'gta5'

name 'sxIllegals'
description 'Illegal groups, territories and laboratories'
author 'sxIllegals'
version '1.0.0'

lua54 'yes'

dependencies {
    'yCore',
    'oxmysql',
}

shared_scripts {
    'core/sh_class',
    'core/sh_logger.lua',
    'core/sh_modules.lua',
    'shared/groups.lua',
    'shared/territories.lua',
    'shared/laboratories.lua',
    'modules/groups/sh_groups.lua',
    'modules/territories/sh_territories.lua',
    'modules/laboratories/sh_laboratories.lua',
    'modules/admin/sh_admin.lua',
    'modules/ui/sh_ui.lua',
}

client_scripts {
    'core/cl_hook.lua',
    'core/cl_entities.lua',
    'core/cl_base.lua',
    'modules/ui/cl_nui.lua',
    'modules/ui/cl_group.lua',
    'modules/ui/cl_admin.lua',
    'modules/territories/cl_territory.lua',
    'modules/territories/cl_minimap.lua',
    'modules/territories/cl_blips.lua',
    'modules/laboratories/cl_utils.lua',
    'modules/laboratories/cl_laboratories.lua',
    'modules/laboratories/cl_weed.lua',
    'modules/laboratories/cl_coke.lua',
    'modules/laboratories/cl_meth.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'modules/groups/sv_group.lua',
    'modules/territories/sv_territory.lua',
    'modules/territories/sv_core.lua',
    'modules/laboratories/sv_laboratories.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/**/*',
}

data_file 'SCALEFORM_DLC_FILE' 'stream/MINIMAP_LOADER.gfx'
