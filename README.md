# sxIllegals

A FiveM resource for ESX or standalone servers that brings together **criminal groups**, **territories driven by influence** and **drug laboratories** (weed, cocaine and methamphetamine), managed through a React NUI for both players and administrators.

## Features

- **Groups**: factions with a name, motto, color, ranks, rank permissions and member slots. Players can found their own group, invite members and manage them from the group panel. Groups can be flagged as *official* to unlock more slots.
- **Territories**: polygon zones drawn on the pause map. Each criminal action performed inside a zone gives influence to the player's group. The leading group colors the territory.
- **Territory wars**: contested territories can be attacked by holding the zone with enough members, and captured when no defender shows up.
- **Influence decay**: inactive groups slowly lose their influence, so territories keep changing hands.
- **Group alerts**: members are warned in real time when their territory is contested, attacked, lost or raided.
- **Laboratories**: instanced shells for weed, cocaine and meth with a full multi-step production chain synchronized between every player. Laboratories can belong to a group and have levels.
- **Police raids**: production can alert the police, who can raid and seal a laboratory.
- **Discord logs**: optional webhook for admin and gameplay events.
- **Admin panel**: overview, statistics with timeframes, activity feed, group management, territory creation and influence reset, laboratory creation and teleportation.
- **Group panel**: members, ranks, overview and statistics for players.
- **Translations**: English and French out of the box, easily extendable.
- **Exports**: a server and client API to integrate the resource with your other scripts.

## Dependencies

| Resource | Purpose |
| --- | --- |
| [oxmysql](https://github.com/overextended/oxmysql) | Required. Database access |
| [es_extended](https://github.com/esx-framework/esx_core) | Optional. Identifiers, character names, inventory, money, jobs and admin groups |
| [ox_inventory](https://github.com/overextended/ox_inventory) | Optional. Inventory and money in standalone, used instead of the ESX inventory when started |

The framework is detected at runtime: without ESX the resource runs **standalone**, using license identifiers, FiveM player names, ACE permissions and ox_inventory when it is started. Laboratory instances use FiveM routing buckets and notifications use the native feed. The server should run with OneSync so it can check player positions for territory wars and raids.

## Installation

1. Clone the repository into your `resources` folder.

   ```bash
   git clone https://github.com/0xS4cha/sxIllegals.git
   ```

2. Import `db.sql` into your database. On existing databases, the `statistics_logs` table and the `group_list.slots`, `group_list.created_at`, `labs.owner`, `labs.sealed_until`, `statistics_logs.group_id` and `statistics_logs.identifier` columns are created automatically on first start.

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
   ensure sxIllegals
   ```

   `es_extended` is optional. In standalone, give admin and police access with ACE permissions:

   ```cfg
   add_ace group.admin sxillegals.admin allow
   add_ace group.police sxillegals.police allow
   ```

## Configuration

All gameplay values live in the `shared` folder.

### `shared/config.lua`

| Key | Description |
| --- | --- |
| `_CONFIG.Framework` | `'auto'`, `'esx'` or `'standalone'` |
| `_CONFIG.Inventory` | `'auto'`, `'esx'`, `'ox_inventory'` or `'none'` |
| `_CONFIG.Admin.groups` | ESX groups allowed to use the admin panel |
| `_CONFIG.Admin.ace` | ACE permission allowed to use the admin panel, works with every framework |
| `_CONFIG.ActivityLimit` | Entries kept in the admin activity feed |
| `_CONFIG.Webhook` | Discord username and the events sent to the webhook |

### `shared/groups.lua`

| Key | Description |
| --- | --- |
| `_GROUP.AutomaticAdminJoin` | An admin who creates a group from the panel becomes its leader, so they can invite the real leader |
| `_GROUP.PlayersCanCreate` | Players without a group can found one from the group panel |
| `_GROUP.CreationPrice` | Price paid by a player to found a group, `0` for free |
| `_GROUP.NameLength` | Minimum and maximum length of a group name |
| `_GROUP.Unofficial` | When `false`, only official groups can hold influence on territories |
| `_GROUP.Slots` | Default member slots, `[true]` for official groups and `[false]` for the others. A per-group value can be set from the admin panel |
| `_GROUP.SaveInterval` | Minutes between two automatic saves of modified groups |
| `_GROUP.InvitationDuration` | Seconds before an invitation expires |
| `_GROUP.DefaultRanks` | Ranks and permissions created with a new group |
| `_GROUP.Alerts` | Icon, sound and blip duration of the group alerts |

### `shared/territories.lua`

| Key | Description |
| --- | --- |
| `_TERRITORY.InfluencePoint` | Influence points granted for each interaction |
| `_TERRITORY.CouldownInfluence` | Cooldown in seconds, per player and per interaction, before the same interaction grants influence again |
| `_TERRITORY.SaveInterval` | Minutes between two automatic saves of modified territories |
| `_TERRITORY.War.enabled` | Enables territory wars |
| `_TERRITORY.War.contestRatio` | A territory is contested when the second group reaches this share of the owner influence |
| `_TERRITORY.War.requireContest` | Only groups reaching the contest ratio can attack |
| `_TERRITORY.War.minAttackers` | Members of the attacking group required inside the zone |
| `_TERRITORY.War.captureTime` | Seconds the zone must be held without defenders |
| `_TERRITORY.War.checkInterval` | Seconds between two checks of the players inside territories |
| `_TERRITORY.War.captureTransfer` | Share of the owner influence given to the attacker on capture |
| `_TERRITORY.War.cooldown` | Seconds before a territory can be attacked again |
| `_TERRITORY.Decay.enabled` | Enables influence decay |
| `_TERRITORY.Decay.interval` | Seconds between two decay passes |
| `_TERRITORY.Decay.idleTime` | Seconds without activity before a group starts losing influence on a territory |
| `_TERRITORY.Decay.percent` | Share of the points lost at each pass |

### `shared/laboratories.lua`

| Key | Description |
| --- | --- |
| `_LABS.AllowUnowned` | Anyone can enter laboratories without an owner |
| `_LABS.MaxLevel` | Highest laboratory level |
| `_LABS.OutputMultiplier` | Final product multiplier for each level |
| `_LABS.Shell` | Shell model, exit offset and interaction points for each laboratory type |
| `_LABS.Weed` | Items, required amounts, growth duration, growth stages and plant props |
| `_LABS.Coke` | Items, required amounts and duration of each step |
| `_LABS.Meth` | Items, required amounts, tank capacity for each level and duration of each step |

### `shared/raids.lua`

| Key | Description |
| --- | --- |
| `_RAID.Enabled` | Enables raids and police alerts |
| `_RAID.Jobs` | ESX jobs considered as police, with their minimum grade |
| `_RAID.Ace` | ACE permission considered as police, works with every framework |
| `_RAID.Key` | Default key to raid a laboratory |
| `_RAID.Duration` | Seconds needed to breach a laboratory |
| `_RAID.Distance` | Distance from the entrance to start a raid |
| `_RAID.SealDuration` | Seconds a raided laboratory stays sealed |
| `_RAID.WipeProduction` | Resets the production of a raided laboratory |
| `_RAID.Dispatch` | Chance, cooldown, radius and blip duration of the police alerts sent by production steps |

### Convars

| Convar | Default | Description |
| --- | --- | --- |
| `sh_dev` | `1` | Enables console logging |
| `sh_log_level` | `3` | `0` errors, `1` warnings, `2` info, `3` trace |
| `sx_locale` | | Forces the language, for example `setr sx_locale fr`. When unset, clients follow the game language and the server uses English |
| `sx_illegals_webhook` | | Discord webhook URL, kept out of the shared config so clients never see it |

## How it works

### Architecture

The resource is split into a small core and independent modules.

```
core/           Module loader, class helper, callbacks, logger, translations, utilities
bridge/         ESX / standalone bridge
modules/
  admin/        Admin panel data, statistics and actions
  groups/       Group class, persistence, group panel, invitations and alerts
  territories/  Territory class, influence, wars, decay, minimap overlay and pause map display
  laboratories/ Laboratory loading, ownership, levels, raids, instancing and weed, coke, meth gameplay
  polyzone/     Embedded PolyZone used for territory detection
  ui/           NUI bridge and panel commands
  exports/      Public server and client API
shared/         Configuration
translations/   Language files
web/            React, TypeScript and Tailwind interface
```

Client and server communicate through a promise based callback layer (`RegisterServerCallback`, `TriggerServerCallback`, `RegisterClientCallback`, `TriggerClientCallback`) with a 15 seconds timeout.

### Groups

Groups are loaded from `group_list`, `group_grades` and `group_members` when the database is ready and kept in memory. Rank `0` is the leader, higher numbers are lower ranks. A new group is created with the ranks of `_GROUP.DefaultRanks`: `Boss`, `Lieutenant` and `Recruit`. Modified groups are saved every `_GROUP.SaveInterval` minutes, when the resource stops and immediately after an admin or panel action.

Groups are created from the admin panel, or by players from the group panel when `_GROUP.PlayersCanCreate` is enabled. The founder becomes the leader.

**Group panel.** `/grouppanel` shows the overview, members, ranks and activity of the player's group. Every action is checked by the server against the rank permissions:

| Permission | Allows |
| --- | --- |
| `canInvite` | Invite players by server id |
| `canKick` | Kick members of a lower rank |
| `canPromote` | Promote and demote members of a lower rank, without reaching their own rank |
| `canEditDevise` | Edit the motto |
| `canManageRanks` | Rename ranks |

The leader has every permission and is the only one who can edit the rank permissions, by clicking them in the ranks view. A leader can leave only after naming another leader.

**Invitations.** Invited players receive a notification and accept or decline from the group panel, or with `/groupaccept` and `/groupdecline`. Invitations expire after `_GROUP.InvitationDuration` seconds and respect the group slots.

**Statistics.** The statistics tab shows the sales, the influence gained and the laboratory steps of the group over the last 7 days, and its top contributors by influence. Every logged action records the group and the player, so the tab only counts activity recorded after this update.

**Alerts.** Members online receive a notification, a sound and, when relevant, a flashing blip when someone joins or leaves, when one of their territories is contested, attacked, captured or lost, and when one of their laboratories is raided. Alerts also appear in the group activity.

### Territories

Territories are polygons stored with their `minZ` and `maxZ` bounds. On the client, each territory is rendered on the pause map through a minimap scaleform overlay and tracked with a PolyZone to know which territory the player is in. Hovering a territory on the pause map displays its dominating group, its influence percentage and how many days it has been controlled. The map legend button toggles the territory display.

Every time a player performs a tracked interaction inside a territory, the server:

1. Finds the player's group.
2. Checks the cooldown for this player and this interaction.
3. Adds the configured points to the group's influence.
4. Sorts influences, recolors the territory with the leader's color and syncs every client.
5. Logs the action and the influence gained for the admin statistics.

Modified territories are saved every `_TERRITORY.SaveInterval` minutes and when the resource stops.

Territories are created from the admin panel by recording points in game.

**Wars.** A territory is *contested* when the second group reaches `_TERRITORY.War.contestRatio` of the owner influence. Every `_TERRITORY.War.checkInterval` seconds the server counts the members of each group inside each territory. When a contender has at least `_TERRITORY.War.minAttackers` members inside, an attack starts and both groups are alerted. The attack progresses only while no defender is inside the zone; after `_TERRITORY.War.captureTime` seconds the attacker takes `_TERRITORY.War.captureTransfer` of the owner influence and becomes the new owner. If the attackers leave, the attack fails. A territory cannot be attacked again before `_TERRITORY.War.cooldown` seconds. The minimap shows contested and attacked territories.

**Decay.** Each group influence records its last activity. Every `_TERRITORY.Decay.interval` seconds, groups without activity on a territory for `_TERRITORY.Decay.idleTime` seconds lose `_TERRITORY.Decay.percent` of their points there, and are alerted when they lose a territory because of it.

Client scripts can also grant influence by triggering the `sxGroup:AddInfluence` net event. The server only accepts it when the player is physically inside the territory.

```lua
TriggerServerEvent("sxGroup:AddInfluence", territoryId, "sellDrugs")
```

### Laboratories

Laboratories are created from the admin panel at the admin's position. A marker is drawn at the entrance; pressing `E` spawns the shell above the entrance, teleports the player inside and moves them to a routing bucket dedicated to this laboratory, which is restored when they leave. The state of every plant, tray and circuit is kept on the server, synchronized to every client and saved to the database every 3 minutes.

A laboratory can belong to a group: only its members and admins can enter it. Laboratories without owner stay open to everyone when `_LABS.AllowUnowned` is enabled. Admins set the owner and the level from the laboratories view of the admin panel. The level raises the meth tank capacity and multiplies the final products with `_LABS.OutputMultiplier`.

If the laboratory is inside a territory, each production step gives influence to the player's group. The territory is resolved by the server from the laboratory the player entered, never from data sent by the client.

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

### Police raids

Each production step has `_RAID.Dispatch.chance` percent of chance to alert the online police, with a blip in an area of `_RAID.Dispatch.radius` around the laboratory, at most once every `_RAID.Dispatch.cooldown` seconds per laboratory. Police officers are the players with a job of `_RAID.Jobs` or the `_RAID.Ace` permission.

A police officer at a laboratory entrance presses `G` to raid it. The owner group is alerted, and after `_RAID.Duration` seconds without moving the laboratory is sealed for `_RAID.SealDuration` seconds: players inside are sent out, the production is reset when `_RAID.WipeProduction` is enabled and only the police can enter. Admins can lift the seal from the panel.

### Discord logs

Set the webhook with the `sx_illegals_webhook` convar and choose the events in `_CONFIG.Webhook.events`: group creation, update and deletion, members joining, territory creation, reset, contest, attack and capture, laboratory creation, update and raid, and police alerts.

```cfg
set sx_illegals_webhook "https://discord.com/api/webhooks/..."
```

### Admin panel

Players in an ESX group of `_CONFIG.Admin.groups` or with the `_CONFIG.Admin.ace` permission can open the admin panel. Every server action checks the permission again before running.

Statistics are computed from the `statistics_logs` table: production steps, drug sales with their value, missions and influence gained. Charts stay empty until real activity is recorded.

### Commands

| Command | Description |
| --- | --- |
| `/adminpanel` | Opens the admin panel |
| `/grouppanel` | Opens the group panel |
| `/groupaccept` | Accepts the latest group invitation |
| `/groupdecline` | Declines the latest group invitation |
| `/raidlab` | Police only, raids the closest laboratory. Bound to `G` by default |

Panel and raid commands can be bound to a key from the FiveM key bindings settings.

### Translations

Translations are registered in `translations/*.lua` with `AddLanguage`. The language follows the game language, or the `sx_locale` convar when set, and falls back to English. To add a language, copy `translations/en.lua`, translate the values and change the language code passed to `AddLanguage`.

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
    createdAt = "2026-07-22",
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
    controlledDays = 3,
    attackState = 0
}
```

`influence` is sorted from the highest to the lowest number of points. `attackState` is `0` when calm, `1` during an attack and `2` when contested.

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

##### `AddPlayerInfluence(source, territoryId, interaction, value?)`

Gives influence to the player's group using an interaction from `_TERRITORY.InfluencePoint`. Cooldowns and admin statistics apply exactly like for built-in actions. This is the recommended way to plug your own drug sales or missions into the territory system. For `sellDrugs`, `value` is the money earned by the sale and feeds the sales statistics.

```lua
exports.sxIllegals:AddPlayerInfluence(source, territoryId, "sellDrugs", 1200)
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
    { id = "LAB-1720000000-EF56", label = "Sandy Shores", type = "meth", level = 1, coords = { x = 0.0, y = 0.0, z = 0.0 }, owner = "GRP-1720000000-AB12", sealed = false }
}
```

##### `GetLaboratory(labId)`

Returns a laboratory or `nil`.

```lua
local lab = exports.sxIllegals:GetLaboratory("LAB-1720000000-EF56")
```

#### Write

Group functions accept a server id or an identifier for `target`.

| Export | Returns | Description |
| --- | --- | --- |
| `CreateGroup(data, leaderSource?)` | `groupId` or `nil, error` | Creates a group from `{ name, devise?, rgb?, is_official?, slots? }`. `leaderSource` becomes the leader. Errors: `invalid_data`, `name_taken` |
| `DeleteGroup(groupId)` | `boolean` | Deletes a group and releases its laboratories |
| `UpdateGroup(groupId, data)` | `boolean` | Updates `name`, `devise`, `rgb`, `is_official` or `slots` |
| `SetGroupOfficial(groupId, official)` | `boolean` | Changes the official status |
| `AddGroupMember(groupId, target, grade?)` | `boolean, error?` | Adds a member directly, on the last rank by default. Errors: `already_in_group`, `invalid_grade`, `group_full` |
| `RemoveGroupMember(groupId, target)` | `boolean` | Removes a member |
| `SetMemberGrade(groupId, target, grade)` | `boolean` | Sets the rank of a member, `0` is leader |
| `InvitePlayer(groupId, targetSource)` | `boolean, error?` | Sends an invitation to an online player |
| `SendGroupAlert(groupId, title, message, coords?)` | `boolean` | Alerts every online member, with a blip when `coords` is given |
| `SetGroupInfluence(territoryId, groupId, points)` | `boolean` | Sets the influence of a group on a territory, `0` removes it |
| `ResetTerritoryInfluence(territoryId)` | `boolean` | Removes every influence from a territory |
| `GetTerritoryWar(territoryId)` | `table` | `{ attackState, contested, attacker, defender, progress, cooldown }`, `progress` in percent and `cooldown` in seconds |
| `SetLaboratoryOwner(labId, groupId?)` | `boolean` | Gives a laboratory to a group, `nil` removes the owner |
| `SetLaboratoryLevel(labId, level)` | `boolean` | Sets the level, from `1` to `_LABS.MaxLevel` |
| `SealLaboratory(labId, source?)` | `boolean` | Seals a laboratory as if it was raided |
| `UnsealLaboratory(labId)` | `boolean` | Lifts the seal |
| `IsLaboratorySealed(labId)` | `boolean` | |
| `IsPlayerPolice(source)` | `boolean` | Uses `_RAID.Jobs` and `_RAID.Ace` |

```lua
local groupId = exports.sxIllegals:CreateGroup({ name = "Families", rgb = { r = 34, g = 197, b = 94 } }, source)
exports.sxIllegals:SetLaboratoryOwner("LAB-1720000000-EF56", groupId)
exports.sxIllegals:SendGroupAlert(groupId, "Shipment", "Your delivery is waiting at the docks.", { x = 1000.0, y = -3000.0, z = 5.0 })
```

### Events

Server events triggered with `TriggerEvent`, other resources can listen to them with `AddEventHandler`.

| Event | Arguments |
| --- | --- |
| `sxIllegals:groupCreated` | `groupId`, `leaderSource` |
| `sxIllegals:groupDeleted` | `groupId` |
| `sxIllegals:groupMemberAdded` | `groupId`, `identifier`, `name` |
| `sxIllegals:groupMemberRemoved` | `groupId`, `identifier`, `reason` (`kick`, `leave`, `export`), `name` |
| `sxIllegals:groupAlert` | `groupId`, `kind`, `title`, `message` |
| `sxIllegals:territoryAttackStarted` | `territoryId`, `attackerId`, `defenderId` |
| `sxIllegals:territoryAttackEnded` | `territoryId`, `attackerId`, `defenderId`, `reason` |
| `sxIllegals:territoryCaptured` | `territoryId`, `attackerId`, `defenderId` |
| `sxIllegals:territoryLostByDecay` | `territoryId`, `previousOwnerId`, `newOwnerId` |
| `sxIllegals:labRaided` | `labId`, `source`, `ownerId` |
| `sxIllegals:policeAlert` | `labId`, `coords`, `interaction` |

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
