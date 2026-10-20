# sxIllegals

A FiveM resource for ESX that brings together **criminal groups**, **territories driven by influence** and **drug laboratories** (weed, cocaine and methamphetamine), managed through a React NUI for both players and administrators.

## Features

- **Groups**: create factions with a name, motto, color, ranks and member slots. Groups can be flagged as *official* to unlock more slots.
- **Territories**: polygon zones drawn on the pause map. Each criminal action performed inside a zone gives influence to the player's group. The leading group colors the territory.
- **Laboratories**: instanced shells for weed, cocaine and meth with a full multi-step production chain synchronized between every player.
- **Admin panel**: overview, statistics with timeframes, activity feed, group management, territory creation and influence reset, laboratory creation and teleportation.
- **Group panel**: members, ranks, overview and statistics for players.
- **Translations**: English and French out of the box, easily extendable.
- **Exports**: a server and client API to integrate the resource with your other scripts.

## Dependencies

| Resource | Purpose |
| --- | --- |
| [es_extended](https://github.com/esx-framework/esx_core) | Players, identifiers, inventory and admin groups |
| [oxmysql](https://github.com/overextended/oxmysql) | Database access |
| `yCore` | Notifications (`yCore:showNotification`), item labels, instances and the server callback used by the meth plates |

The `sxGroup:AddInfluence` net event relies on a global `CheckPlayerToken(source, token)` function provided by your anti-cheat or core resource.

## Installation

1. Clone the repository into your `resources` folder.

   ```bash
   git clone https://github.com/0xS4cha/sxIllegals.git
   ```

2. Import `db.sql` into your database. The `statistics_logs` table and the `group_list.slots` column are created automatically on first start.

3. Build the interface.

   ```bash
   cd sxIllegals/web
   npm install
   npm run build
   ```

4. Add the resource to your `server.cfg` after its dependencies.

   ```cfg
   ensure oxmysql
   ensure es_extended
   ensure yCore
   ensure sxIllegals
   ```

## Configuration

All gameplay values live in the `shared` folder.

### `shared/groups.lua`

| Key | Description |
| --- | --- |
| `_GROUP.Unofficial` | When `false`, only official groups can hold influence on territories |
| `_GROUP.Slots` | Default member slots, `[true]` for official groups and `[false]` for the others. A per-group value can be set from the admin panel |

### `shared/territories.lua`

| Key | Description |
| --- | --- |
| `_TERRITORY.InfluencePoint` | Influence points granted for each interaction |
| `_TERRITORY.CouldownInfluence` | Cooldown in seconds, per player and per interaction, before the same interaction grants influence again |

### `shared/laboratories.lua`

| Key | Description |
| --- | --- |
| `_LABS.Shell` | Shell model, exit offset and interaction points for each laboratory type |
| `_LABS.Weed` | Items, required amounts, growth duration, growth stages and plant props |
| `_LABS.Coke` | Items, required amounts and duration of each step |
| `_LABS.Meth` | Items, required amounts, tank capacity and duration of each step |

### Convars

| Convar | Default | Description |
| --- | --- | --- |
| `sh_dev` | `1` | Enables console logging |
| `sh_log_level` | `3` | `0` errors, `1` warnings, `2` info, `3` trace |

## How it works

### Architecture

The resource is split into a small core and independent modules.

```
core/           Module loader, class helper, callbacks, logger, translations, utilities
modules/
  admin/        Admin panel data, statistics and actions
  groups/       Group class, persistence and loading
  territories/  Territory class, influence, minimap overlay and pause map display
  laboratories/ Laboratory loading, instancing and weed, coke, meth gameplay
  polyzone/     Embedded PolyZone used for territory detection
  ui/           NUI bridge and panel commands
  exports/      Public server and client API
shared/         Configuration
translations/   Language files
web/            React, TypeScript and Tailwind interface
```

Client and server communicate through a promise based callback layer (`RegisterServerCallback`, `TriggerServerCallback`, `RegisterClientCallback`, `TriggerClientCallback`) with a 15 seconds timeout.

### Groups

Groups are loaded from `group_list`, `group_grades` and `group_members` when the database is ready and kept in memory. Rank `0` is the leader, higher numbers are lower ranks. A new group is created with three default ranks: `Boss`, `Lieutenant` and `Recrue`. Modified groups are saved when the resource stops or immediately after an admin action.

### Territories

Territories are polygons stored with their `minZ` and `maxZ` bounds. On the client, each territory is rendered on the pause map through a minimap scaleform overlay and tracked with a PolyZone to know which territory the player is in. Hovering a territory on the pause map displays its dominating group, its influence percentage and how many days it has been controlled. The map legend button toggles the territory display.

Every time a player performs a tracked interaction inside a territory, the server:

1. Finds the player's group.
2. Checks the cooldown for this player and this interaction.
3. Adds the configured points to the group's influence.
4. Sorts influences, recolors the territory with the leader's color and syncs every client.
5. Logs the action for the admin statistics.

Territories are created from the admin panel by recording points in game.

### Laboratories

Laboratories are created from the admin panel at the admin's position. A marker is drawn at the entrance; pressing `E` spawns the shell above the entrance, teleports the player inside and puts them in an instance. The state of every plant, tray and circuit is kept on the server, synchronized to every client and saved to the database every 3 minutes.

If the laboratory is inside a territory, each production step gives influence to the player's group.

**Weed**

| Step | Requires | Result |
| --- | --- | --- |
| Plant | 2 `graineweed` | Plant placed on a spot |
| Fertilize | 2 `fertilisant` | Growth starts and goes through 5 stages over 1 hour |
| Harvest | Fully grown plant | 14 `feuille_weed` |
| Roll | 1 `feuille_weed` | 1 `joint` |
| Pack | 5 `feuille_weed` and 1 `drugbags` | 1 `weed` |

**Cocaine**

| Step | Requires | Duration |
| --- | --- | --- |
| Pour kerosene | 6 `kerozen` | 60 s |
| Add coca leaves | 6 `grainecoca` | 60 s |
| Pour whitewash | 6 `whitewash` | 58 min |
| Take the tray | Finished tray | 12 `recip_coke` |
| Pocket | 1 `recip_coke` | 8 `coke` |

**Methamphetamine**

| Step | Requires | Result |
| --- | --- | --- |
| Add components | 5 `methylamine` and 5 `phenylacetone` | Fills the tanks up to 25 / 25 |
| Synthesis | Full tanks | 60 s |
| Send to reduction | Finished synthesis | 12 plates queued |
| Reduction | Queued plates | 1 hour |
| Take plate | Finished reduction | 1 `plateau_meth` |
| Break | 1 `plateau_meth` | 1 `bac_meth` |
| Pocket | 1 `bac_meth` | 8 `meth` |

### Admin panel

Players in the ESX `admin` or `superadmin` group can open the admin panel. Every server action checks the player's group again before running.

### Commands

| Command | Description |
| --- | --- |
| `/adminpanel` | Opens the admin panel |
| `/grouppanel` | Opens the group panel |

Both commands can be bound to a key from the FiveM key bindings settings.

### Translations

Translations are registered in `translations/*.lua` with `AddLanguage`. The language follows the game language and falls back to English. To add a language, copy `translations/en.lua`, translate the values and change the language code passed to `AddLanguage`.

## Exports

All exports return plain tables that can be safely used from other resources.

### Server

#### Groups

##### `GetGroup(groupId)`

Returns a group or `nil`.

```lua
local group = exports.sxIllegals:GetGroup("GRP-1720000000-AB12")
```

```lua
{
    id = "GRP-1720000000-AB12",
    name = "Ballas",
    devise = "Purple forever",
    rgb = { r = 128, g = 0, b = 128 },
    isOfficial = true,
    slots = 15,
    members = {
        { identifier = "char1:abc", label = "John Doe", grade = 0 }
    },
    ranks = {
        { name = "Boss", rank = 0, perms = {} }
    }
}
```

##### `GetGroups()`

Returns an array of every group.

```lua
for _, group in ipairs(exports.sxIllegals:GetGroups()) do
    print(group.name, #group.members)
end
```

##### `GetGroupByIdentifier(identifier)`

Returns the group of an ESX identifier, even when the player is offline, or `nil`.

```lua
local group = exports.sxIllegals:GetGroupByIdentifier("char1:abc")
```

##### `GetPlayerGroup(source)`

Returns the group of an online player or `nil`.

```lua
local group = exports.sxIllegals:GetPlayerGroup(source)
```

##### `IsPlayerInGroup(source, groupId?)`

Returns `true` if the player belongs to a group. When `groupId` is given, checks this specific group.

```lua
if exports.sxIllegals:IsPlayerInGroup(source, "GRP-1720000000-AB12") then
end
```

##### `GetPlayerGrade(source)`

Returns the grade number and the grade name of the player, or `nil` if the player has no group.

```lua
local grade, gradeName = exports.sxIllegals:GetPlayerGrade(source)
```

##### `IsPlayerGroupLeader(source)`

Returns `true` if the player holds the rank `0` of their group.

```lua
local isLeader = exports.sxIllegals:IsPlayerGroupLeader(source)
```

#### Territories

##### `GetTerritory(territoryId)`

Returns a territory or `nil`.

```lua
local territory = exports.sxIllegals:GetTerritory("TER-1720000000-CD34")
```

```lua
{
    id = "TER-1720000000-CD34",
    label = "Grove Street",
    coords = { { x = 0.0, y = 0.0, z = 0.0 } },
    minZ = -100.0,
    maxZ = 100.0,
    influence = {
        { groupId = "GRP-1720000000-AB12", name = "Ballas", points = 120, rgb = { r = 128, g = 0, b = 128 } }
    },
    totalInfluence = 120,
    controlledSince = "2026-07-22",
    controlledDays = 3
}
```

`influence` is sorted from the highest to the lowest number of points.

##### `GetTerritories()`

Returns an array of every territory.

```lua
local territories = exports.sxIllegals:GetTerritories()
```

##### `GetTerritoryOwner(territoryId)`

Returns the dominating group of a territory or `nil` if nobody has influence there.

```lua
local owner = exports.sxIllegals:GetTerritoryOwner("TER-1720000000-CD34")
```

```lua
{ groupId = "GRP-1720000000-AB12", name = "Ballas", points = 120, percentage = 100.0 }
```

##### `GetGroupInfluence(territoryId, groupId)`

Returns the influence points of a group on a territory, `0` if none.

```lua
local points = exports.sxIllegals:GetGroupInfluence("TER-1720000000-CD34", "GRP-1720000000-AB12")
```

##### `GetGroupTerritories(groupId)`

Returns an array of the territories dominated by a group.

```lua
local owned = exports.sxIllegals:GetGroupTerritories("GRP-1720000000-AB12")
```

##### `AddPlayerInfluence(source, territoryId, interaction)`

Gives influence to the player's group using an interaction from `_TERRITORY.InfluencePoint`. Cooldowns and admin statistics apply exactly like for built-in actions. This is the recommended way to plug your own drug sales or missions into the territory system.

```lua
exports.sxIllegals:AddPlayerInfluence(source, territoryId, "sellDrugs")
```

##### `AddGroupInfluence(territoryId, groupId, points)`

Adds a raw amount of influence to a group without cooldown, then syncs every client. Returns `true` on success.

```lua
exports.sxIllegals:AddGroupInfluence("TER-1720000000-CD34", "GRP-1720000000-AB12", 50)
```

#### Laboratories

##### `GetLaboratories(labType?)`

Returns an array of laboratories, optionally filtered by type (`weed`, `coke` or `meth`).

```lua
local methLabs = exports.sxIllegals:GetLaboratories("meth")
```

```lua
{
    { id = "LAB-1720000000-EF56", label = "Sandy Shores", type = "meth", level = 1, coords = { x = 0.0, y = 0.0, z = 0.0 } }
}
```

##### `GetLaboratory(labId)`

Returns a laboratory or `nil`.

```lua
local lab = exports.sxIllegals:GetLaboratory("LAB-1720000000-EF56")
```

### Client

#### Territories

##### `GetCurrentTerritory()`

Returns the territory the player is standing in, or `nil`.

```lua
local territory = exports.sxIllegals:GetCurrentTerritory()
if territory then
    print(territory.id, territory.label)
end
```

##### `IsInTerritory(territoryId?)`

Returns `true` if the player is inside any territory, or inside a specific one when `territoryId` is given.

```lua
local inside = exports.sxIllegals:IsInTerritory()
```

##### `GetTerritoryAtCoords(coords)`

Returns the id of the territory containing the given coordinates, or `nil`. Pair it with the server export `AddPlayerInfluence` to reward actions happening anywhere on the map.

```lua
local territoryId = exports.sxIllegals:GetTerritoryAtCoords(GetEntityCoords(PlayerPedId()))
TriggerServerEvent("myResource:sellDrugs", territoryId)
```

#### Laboratories

##### `IsInLaboratory()`

Returns `true` while the player is inside a laboratory.

```lua
if exports.sxIllegals:IsInLaboratory() then
end
```

##### `GetCurrentLaboratory()`

Returns the laboratory the player is inside, or `nil`.

```lua
local lab = exports.sxIllegals:GetCurrentLaboratory()
```

```lua
{ id = "LAB-1720000000-EF56", label = "Sandy Shores", type = "meth", level = 1 }
```

#### Interface

##### `OpenPanel(panel?)`

Opens the interface on the `group` panel, or on `admin`. The admin panel data is still protected by server side permission checks.

```lua
exports.sxIllegals:OpenPanel("group")
```

##### `ClosePanel()`

Closes the interface.

```lua
exports.sxIllegals:ClosePanel()
```

##### `IsPanelOpen()`

Returns `true` when the interface is open.

```lua
local open = exports.sxIllegals:IsPanelOpen()
```

### Shared

| Export | Description |
| --- | --- |
| `GetPhrase(key, ...)` | Returns a translated phrase formatted with the given arguments |
| `AddPhrase(lang, key, phrase)` | Adds or overrides a phrase for a language |
| `UpdateDefaultPhrase(key, phrase)` | Overrides a default phrase |
| `IsPhraseRegistered(key)` | Returns `true` if the phrase exists in the main language |
| `GetPreferredLanguageId()` | Returns the active language code |
| `GetLanguageTable(lang?)` | Client only, returns every phrase of a language merged with the fallbacks |
| `SetGameLanguage(lang)` | Client only, changes the active language, `auto` follows the game language |

## Development

The interface can be developed in a browser with mock data.

```bash
cd web
npm install
npm run dev
```

## License

Released under the [MIT License](LICENSE).
