SX = SX or {}

SX.Modules = {}
SX.Modules.List = {}
SX.Modules.HasFunction = { Think = {} }
SX.Modules.Disabled = { }

function SX.Modules:Register(name, priority, submodules)
    table.insert(self.List, {
        name = name,
        priority = priority or 50,
        submodules = submodules
    })
end

local function safeCall(label, fn, obj)
    local ok, err = pcall(fn, obj)
    if not ok then
        Logger:error("Module", label, err)
    end
end

function SX:InitializeModules()
    table.sort(self.Modules.List, function(a, b)
        return a.priority < b.priority
    end)

    TriggerEvent("sxIllegals:initialize")

    for _, module in pairs(self.Modules.List) do
        local name = module.name
        if not self.Modules.Disabled[name] and self[name] then
            local startTime = GetGameTimer()

            if self[name].Initialize then
                Logger:info("Module", "Initializing", name)
                safeCall(name, self[name].Initialize, self[name])
            end

            if self[name].InitializeAsync then
                CreateThread(function()
                    self[name]:InitializeAsync()
                end)
            end

            if module.submodules then
                for _, submodule in pairs(module.submodules) do
                    local sub = self[name][submodule]
                    if sub then
                        if sub.Initialize then
                            safeCall(name .. "." .. submodule, sub.Initialize, sub)
                        end

                        if sub.InitializeAsync then
                            CreateThread(function()
                                sub:InitializeAsync()
                            end)
                        end
                    end
                end
            end

            local timeTaken = GetGameTimer() - startTime
            local timeStr = tostring(timeTaken)
            if timeTaken > 1 then
                timeStr = "^1" .. timeStr
            end
            Logger:info("Module", "Initialized " .. name .. " in " .. timeStr .. "ms")

            if not IsDuplicityVersion() and self[name].Think then
                table.insert(SX.Modules.HasFunction.Think, name)
            end
        end
    end

    TriggerEvent("sxIllegals:initialized")
end
