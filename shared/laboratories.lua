_LABS = _LABS or {}

_LABS.AllowUnowned = true
_LABS.MaxLevel = 3
_LABS.OutputMultiplier = { 1.0, 1.25, 1.5 }

_LABS.Shell = {
	['weed'] = { 
		name = 'weed_business_empty',
		exit = vector4(7.626282, 24.110352, 0.830040, 2.612500),
		Packs = {
			vector4(-16.066162, 13.484863, 1.830666, 31.024837)
		},
		Rolls = {
			vector4(-13.842529, 9.730469, 1.836800, 251.360657)
		},
		spots = {
			vector4(4.202240, 9.991211, 0.850254, 260.411621),
			vector4(5.419800, 9.872070, 0.858856, 189.071503),
			vector4(5.224335, 8.797363, 0.863056, 86.701988),
			vector4(4.053345, 8.975586, 0.870880, 7.119734),
			vector4(3.917511, 13.614746, 0.881023, 319.650452),
			vector4(4.073364, 14.758789, 0.847824, 272.205750),
			vector4(5.088806, 14.682617, 0.853241, 185.628159),
			vector4(5.126770, 13.474609, 0.871830, 117.197174),
			vector4(-1.649414, 17.205566, 0.868687, 94.617676),
			vector4(-1.677063, 18.220215, 0.894264, 90.254150),
			vector4(-2.646637, 18.363281, 0.860977, 192.138916),
			vector4(-2.650360, 17.182617, 0.861202, 189.437668),
			vector4(-6.538300, 12.116211, 0.844528, 168.035599),
			vector4(-7.561127, 12.254883, 0.844521, 177.108994),
			vector4(-7.605042, 11.009766, 0.844532, 186.874969),
			vector4(-6.534302, 11.054199, 0.846043, 184.658615),
			vector4(-6.340363, 7.578125, 0.863186, 172.191360),
			vector4(-7.313782, 7.597168, 0.861862, 178.632614),
			vector4(-7.360382, 6.420410, 0.855305, 178.217590),
			vector4(-6.392639, 6.399902, 0.876781, 177.663544),
			vector4(-6.358032, 2.677734, 0.881107, 175.100677),
			vector4(-7.340668, 2.739258, 0.874924, 178.425232),
			vector4(-7.344635, 1.563965, 0.851967, 181.334229),
			vector4(-6.373138, 1.574219, 0.845821, 180.710907),
			vector4(-5.634338, 19.591309, 0.944878, 87.647156),
			vector4(-5.722260, 17.053223, 0.945179, 87.993492),
			vector4(-5.820099, 14.497070, 0.944000, 89.655823),
			vector4(-8.475983, 14.573730, 0.958206, 88.686195),
			vector4(-8.355530, 16.968750, 0.945568, 87.647278),
			vector4(-8.293915, 19.747070, 0.946644, 87.578125),
			vector4(-2.291870, 10.388184, 0.932835, 264.473694),
			vector4(-2.459900, 7.930664, 0.947552, 266.482330),
			vector4(-2.654602, 5.312988, 0.942558, 265.166321),
			vector4(0.043976, 5.093750, 0.947838, 266.551605),
			vector4(0.201691, 7.886719, 0.998238, 269.252899),
			vector4(0.435364, 10.198242, 0.945683, 267.521271),
			vector4(3.858276, 6.235840, 0.945774, 267.590637),
			vector4(3.759277, 3.514648, 0.945469, 268.768127),
			vector4(3.644104, 1.190918, 0.974335, 267.313599),
			vector4(6.194519, 1.066406, 0.939465, 268.214050),
			vector4(6.224640, 3.496582, 0.946785, 270.084198),
			vector4(6.278717, 6.120605, 0.942417, 270.569061),
			vector4(1.462372, 2.722656, 0.946712, 176.233704),
			vector4(-1.345764, 2.776855, 0.963375, 176.926254),
			vector4(-3.602356, 2.941406, 0.970020, 174.224899),
			vector4(-3.816711, 0.326660, 0.948483, 174.848221),
			vector4(-1.479797, 0.238770, 0.948360, 182.397873),
			vector4(1.301331, -0.000488, 0.944279, 180.458511),
		}
	},
	['coke'] = {
		name = 'coke_business',
		exit = vector4(-6.192566, 8.479492, -0.905754, 288.764038),
		spots = {
			vector4(-1.936340, 1.074707, -0.905758, 178.809677),
			vector4(-4.501099, -0.615723, -0.905758, 359.107025), 
			vector4(0.356567, 1.086426, -0.905758, 180.591080),
			vector4(4.728577, 1.720703, -0.905758, 94.449165),
			vector4(7.013184, 2.212891, -0.905758, 13.028444)
		},
		packs = {
			vector4(5.478149, -2.733398, -0.905758, 183.59187316895)
		}
	},
	['meth'] = {
		name = 'meth_business',
		exit = vector4(-12.677124, -3.954590, 3.600349, 85.266182),
		Synthesis = {
			vector4(-3.753906, -3.728516, 1.479248, 177.079117)
		},
		SynthesisPanels = {
			vector4(-7.348389, -2.391113, 1.000534, 87.730507)
		},
		SynthesisStatus = {
			vector4(-1.713135, -4.604004, 1.000603, 173.633560)
		},
		Reductions = {
			vector4(-2.892578, -0.802246, 1.000603, 237.951813)
		},
		ReductionsStatus = {
			vector4(1.549561, -0.428711, 1.000603, 206.917221)
		},
		Packs = {
			vector4(4.572021, 1.628906, 1.000603, 0.012604)
		},
		Plates = {
			vector4(0.639404, -3.282227, 1.000603, 28.820087)
		},
		Breaks = {
			vector4(6.874512, 1.719238, 1.000542, 352.638641),
		}
	}
}



_LABS.Coke = _LABS.Coke or {}

_LABS.Coke.ItemKerozen = "kerozen"
_LABS.Coke.ItemCoca = "grainecoca"
_LABS.Coke.ItemWhitewash = "whitewash"
_LABS.Coke.ItemRecip = "recip_coke"
_LABS.Coke.ItemCoke = "coke"
_LABS.Coke.CountRequiredKerozen = 6
_LABS.Coke.CountRequiredCoca = 6
_LABS.Coke.CountRequiredWhitewash = 6
_LABS.Coke.CountRecip = 12
_LABS.Coke.CountCocaine = 8
_LABS.Coke.KeroseneDuration = 60
_LABS.Coke.CocaDuration = 60
_LABS.Coke.WhitewashDuration = 3480


_LABS.Meth = _LABS.Meth or {}

_LABS.Meth.ItemMethylamine = "methylamine"
_LABS.Meth.ItemPhenylacetone = "phenylacetone"
_LABS.Meth.ItemWhitewash = "whitewash"
_LABS.Meth.ItemRecip = "plateau_meth"
_LABS.Meth.ItemBack = "bac_meth"
_LABS.Meth.ItemMeth = "meth"
_LABS.Meth.CountRequiredKMethylamine = 5
_LABS.Meth.CountRequiredPhenylacetone = 5
_LABS.Meth.CountRecip = 12
_LABS.Meth.CountMeth = 8
_LABS.Meth.SynthesisDuration = 60
_LABS.Meth.ReductionDuration = 3600
_LABS.Meth.Tanks = {
    25, 35, 50
}


_LABS.Weed = _LABS.Weed or {}

_LABS.Weed.Finish = 3600
_LABS.Weed.ItemGraine = "graineweed"
_LABS.Weed.ItemFerti = "fertilisant"
_LABS.Weed.ItemFeuille = "feuille_weed"
_LABS.Weed.ItemJoint = "joint"
_LABS.Weed.ItemBags = "drugbags"
_LABS.Weed.ItemWeed = "weed"
_LABS.Weed.CountRequiredGraine = 2
_LABS.Weed.CountRequiredFerti = 2
_LABS.Weed.CountRequiredJoint = 1
_LABS.Weed.CountRequiredPack = 5
_LABS.Weed.CountRequiredBags = 1
_LABS.Weed.CountFeuille = 14
_LABS.Weed.CountJoint = 1
_LABS.Weed.CountWeed = 1
_LABS.Weed.States = {
    {time = _LABS.Weed.Finish / 5, state = 6},
    {time = _LABS.Weed.Finish / 5 * 2, state = 5},
    {time = _LABS.Weed.Finish / 5 * 3, state = 4},
    {time = _LABS.Weed.Finish / 5 * 4, state = 3},
    {time = _LABS.Weed.Finish, state = 2},
}

_LABS.Weed.Props = {
    "bkr_prop_weed_01_small_01c",
    "bkr_prop_weed_01_small_01b",
    "bkr_prop_weed_01_small_01a",
    "bkr_prop_weed_med_01a",
    "bkr_prop_weed_med_01b",
    "bkr_prop_weed_lrg_01a",
    "bkr_prop_weed_lrg_01b",
}