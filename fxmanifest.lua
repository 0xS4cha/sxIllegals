fx_version 'cerulean'
game 'gta5'

name 'sxIllegals'
description 'Illegal groups, territories and laboratories'
author 'sxIllegals'
version '1.0.0'

lua54 'yes'

dependencies {
    'oxmysql',
}

shared_scripts {
    '@es_extended/imports.lua',
    'core/sh_logger.lua',
    'core/sh_modules.lua',
    'core/sh_class.lua',
    'core/sh_callback.lua',
    'shared/*.lua',
    'modules/**/sh_*.lua',
}

client_scripts {
    'core/cl_hook.lua',
    'core/cl_entities.lua',
    'core/cl_base.lua',
    'modules/**/cl_*.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'modules/**/sv_*.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/**/*',
}

data_file 'SCALEFORM_DLC_FILE' 'stream/MINIMAP_LOADER.gfx'
