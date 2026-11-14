/**
 * 課本題庫 Canonical Question 映射表與結構定義 (Scheme A + Batches A, B, C & D Expanded)
 *
 * 規範依據：
 * - 冊內正規化 (In-book Canonical)：現有 1989 題 (原 1,589 題 + Batch A 100 題 + Batch B 100 題 + Batch C 100 題 + Batch D 100 題)
 * - 已刪除同冊跨單元重複複本：1,728 筆
 * - 跨冊複現題目保留各自獨立進度：22 組
 * - 每冊保證獨立題目數 >= 100 題
 * - scopes 精準限制為原授課單元及對應 Review (長度 <= 2)，絕無全冊漫延
 */

export const CANONICAL_STATS = {
  "totalLegacyMapped": 3717,
  "canonicalItems": 1989,
  "duplicateClones": 1728,
  "prunedClonesCount": 1728,
  "crossBookIndependentSets": 22,
  "bookCounts": {
    "1": 209,
    "2": 204,
    "3": 205,
    "4": 185,
    "5": 183,
    "6": 199,
    "7": 178,
    "8": 176,
    "9": 137,
    "g1": 143,
    "g2": 170
  },
  "unitCounts": {
    "b1_Unit 1": 40,
    "b1_Unit 2": 40,
    "b1_Review 1": 7,
    "b1_Unit 3": 53,
    "b1_Unit 4": 40,
    "b1_Review 2": 6,
    "b3_Starter": 14,
    "b3_Unit 1": 32,
    "b3_Unit 2": 45,
    "b3_Review 1": 4,
    "b3_Unit 3": 49,
    "b3_Unit 4": 47,
    "b3_Review 2": 4,
    "b3_Festival": 10,
    "b5_Starter": 14,
    "b5_Unit 1": 44,
    "b5_Unit 2": 45,
    "b5_Unit 3": 44,
    "b5_Unit 4": 30,
    "b5_Festival": 6,
    "b7_Starter": 15,
    "b7_Unit 1": 45,
    "b7_Unit 2": 36,
    "b7_Review 1": 5,
    "b7_Unit 3": 24,
    "b7_Unit 4": 43,
    "b7_Review 2": 7,
    "b9_Unit 1": 36,
    "b9_Unit 2": 32,
    "b9_Unit 3": 23,
    "b9_Unit 4": 46,
    "b1_Starter": 21,
    "b1_Festival": 2,
    "b2_Starter": 10,
    "b2_Unit 1": 50,
    "b2_Unit 2": 46,
    "b2_Review 1": 12,
    "b2_Unit 3": 41,
    "b2_Unit 4": 41,
    "b2_Review 2": 2,
    "b2_Festival": 2,
    "b4_Unit 1": 43,
    "b4_Unit 2": 46,
    "b4_Unit 3": 29,
    "b4_Unit 4": 34,
    "b4_Starter": 7,
    "b4_Review 1": 12,
    "b4_Review 2": 10,
    "b4_Festival": 4,
    "b6_Starter": 10,
    "b6_Unit 1": 43,
    "b6_Unit 2": 34,
    "b6_Review 1": 6,
    "b6_Unit 3": 52,
    "b6_Unit 4": 46,
    "b6_Review 2": 6,
    "b8_Starter": 11,
    "b8_Unit 1": 41,
    "b8_Unit 2": 40,
    "b8_Review 1": 2,
    "b8_Unit 3": 45,
    "b8_Unit 4": 26,
    "b8_Review 2": 8,
    "bg1_Unit 1 (A~G)": 38,
    "bg1_Unit 2 (H~N)": 42,
    "bg1_Unit 3 (O~T)": 36,
    "bg1_Unit 4 (U~Z)": 27,
    "bg2_Unit 1 (Aa~Gg)": 46,
    "bg2_Unit 2 (Hh~Nn)": 46,
    "bg2_Unit 3 (Oo~Tt)": 42,
    "bg2_Unit 4 (Uu~Zz)": 36,
    "b6_Festival": 2,
    "b7_Festival": 3,
    "b8_Festival": 3
  }
};

/** 舊題號 (legacyId) -> 標準題號 (canonicalId) 映射表 */
export const LEGACY_TO_CANONICAL_MAP = {
  "hwg_b1_1": "hwg_b1_1",
  "hwg_b1_2": "hwg_b1_2",
  "hwg_b1_3": "hwg_b1_3",
  "hwg_b1_4": "hwg_b1_4",
  "hwg_b1_5": "hwg_b1_5",
  "hwg_b1_6": "hwg_b1_6",
  "hwg_b1_7": "hwg_b1_7",
  "hwg_b1_8": "hwg_b1_8",
  "hwg_b1_9": "hwg_b1_9",
  "hwg_b1_10": "hwg_b1_10",
  "hwg_b1_11": "hwg_b1_11",
  "hwg_b1_12": "hwg_b1_12",
  "hwg_b1_13": "hwg_b1_13",
  "hwg_b1_14": "hwg_b1_14",
  "hwg_b1_15": "hwg_b1_15",
  "hwg_b1_16": "hwg_b1_16",
  "hwg_b1_17": "hwg_b1_17",
  "hwg_b1_18": "hwg_b1_18",
  "hwg_b1_19": "hwg_b1_19",
  "hwg_b1_20": "hwg_b1_20",
  "hwg_b1_21": "hwg_b1_21",
  "hwg_b1_22": "hwg_b1_22",
  "hwg_b1_23": "hwg_b1_23",
  "hwg_b1_24": "hwg_b1_24",
  "hwg_b1_25": "hwg_b1_25",
  "hwg_b1_26": "hwg_b1_26",
  "hwg_b1_27": "hwg_b1_27",
  "hwg_b1_28": "hwg_b1_28",
  "hwg_b1_29": "hwg_b1_29",
  "hwg_b1_30": "hwg_b1_30",
  "hwg_b1_31": "hwg_b1_31",
  "hwg_b1_32": "hwg_b1_32",
  "hwg_b1_33": "hwg_b1_33",
  "hwg_b1_34": "hwg_b1_34",
  "hwg_b1_35": "hwg_b1_35",
  "hwg_b1_36": "hwg_b1_36",
  "hwg_b1_37": "hwg_b1_37",
  "hwg_b1_38": "hwg_b1_38",
  "hwg_b1_39": "hwg_b1_39",
  "hwg_b1_40": "hwg_b1_40",
  "hwg_b1_41": "hwg_b1_41",
  "hwg_b1_42": "hwg_b1_42",
  "hwg_b1_43": "hwg_b1_43",
  "hwg_b1_44": "hwg_b1_44",
  "hwg_b3_45": "hwg_b3_45",
  "hwg_b3_46": "hwg_b3_46",
  "hwg_b3_47": "hwg_b3_47",
  "hwg_b3_48": "hwg_b3_48",
  "hwg_b3_49": "hwg_b3_49",
  "hwg_b3_50": "hwg_b3_50",
  "hwg_b3_51": "hwg_b3_51",
  "hwg_b3_52": "hwg_b3_52",
  "hwg_b3_53": "hwg_b3_53",
  "hwg_b3_54": "hwg_b3_54",
  "hwg_b3_55": "hwg_b3_55",
  "hwg_b3_56": "hwg_b3_56",
  "hwg_b3_57": "hwg_b3_57",
  "hwg_b3_58": "hwg_b3_58",
  "hwg_b3_59": "hwg_b3_59",
  "hwg_b3_60": "hwg_b3_60",
  "hwg_b3_61": "hwg_b3_61",
  "hwg_b3_62": "hwg_b3_62",
  "hwg_b3_63": "hwg_b3_63",
  "hwg_b3_64": "hwg_b3_64",
  "hwg_b3_65": "hwg_b3_65",
  "hwg_b3_66": "hwg_b3_66",
  "hwg_b3_67": "hwg_b3_67",
  "hwg_b3_68": "hwg_b3_68",
  "hwg_b3_69": "hwg_b3_69",
  "hwg_b3_70": "hwg_b3_70",
  "hwg_b3_71": "hwg_b3_71",
  "hwg_b3_72": "hwg_b3_72",
  "hwg_b3_73": "hwg_b3_73",
  "hwg_b3_74": "hwg_b3_74",
  "hwg_b3_75": "hwg_b3_75",
  "hwg_b3_76": "hwg_b3_76",
  "hwg_b3_77": "hwg_b3_77",
  "hwg_b3_78": "hwg_b3_78",
  "hwg_b3_79": "hwg_b3_79",
  "hwg_b3_80": "hwg_b3_80",
  "hwg_b3_81": "hwg_b3_81",
  "hwg_b3_82": "hwg_b3_82",
  "hwg_b3_83": "hwg_b3_83",
  "hwg_b3_84": "hwg_b3_84",
  "hwg_b3_85": "hwg_b3_85",
  "hwg_b3_86": "hwg_b3_86",
  "hwg_b3_87": "hwg_b3_87",
  "hwg_b3_88": "hwg_b3_88",
  "hwg_b3_89": "hwg_b3_89",
  "hwg_b3_90": "hwg_b3_90",
  "hwg_b3_91": "hwg_b3_91",
  "hwg_b3_92": "hwg_b3_92",
  "hwg_b3_93": "hwg_b3_93",
  "hwg_b3_94": "hwg_b3_94",
  "hwg_b3_95": "hwg_b3_95",
  "hwg_b3_96": "hwg_b3_96",
  "hwg_b3_97": "hwg_b3_97",
  "hwg_b3_98": "hwg_b3_98",
  "hwg_b3_99": "hwg_b3_99",
  "hwg_b3_100": "hwg_b3_100",
  "hwg_b3_101": "hwg_b3_101",
  "hwg_b3_102": "hwg_b3_102",
  "hwg_b3_103": "hwg_b3_103",
  "hwg_b3_104": "hwg_b3_104",
  "hwg_b3_105": "hwg_b3_105",
  "hwg_b3_106": "hwg_b3_106",
  "hwg_b3_107": "hwg_b3_107",
  "hwg_b3_108": "hwg_b3_108",
  "hwg_b3_109": "hwg_b3_109",
  "hwg_b3_110": "hwg_b3_110",
  "hwg_b3_111": "hwg_b3_111",
  "hwg_b3_112": "hwg_b3_112",
  "hwg_b3_113": "hwg_b3_113",
  "hwg_b3_114": "hwg_b3_114",
  "hwg_b3_115": "hwg_b3_115",
  "hwg_b3_116": "hwg_b3_116",
  "hwg_b3_117": "hwg_b3_117",
  "hwg_b3_118": "hwg_b3_118",
  "hwg_b5_119": "hwg_b5_119",
  "hwg_b5_120": "hwg_b5_120",
  "hwg_b5_121": "hwg_b5_121",
  "hwg_b5_122": "hwg_b5_122",
  "hwg_b5_123": "hwg_b5_123",
  "hwg_b5_124": "hwg_b5_124",
  "hwg_b5_125": "hwg_b5_125",
  "hwg_b5_126": "hwg_b5_126",
  "hwg_b5_127": "hwg_b5_127",
  "hwg_b5_128": "hwg_b5_128",
  "hwg_b5_129": "hwg_b5_129",
  "hwg_b5_130": "hwg_b5_130",
  "hwg_b5_131": "hwg_b5_131",
  "hwg_b5_132": "hwg_b5_132",
  "hwg_b5_133": "hwg_b5_133",
  "hwg_b5_134": "hwg_b5_134",
  "hwg_b5_135": "hwg_b5_135",
  "hwg_b5_136": "hwg_b5_136",
  "hwg_b5_137": "hwg_b5_137",
  "hwg_b5_138": "hwg_b5_138",
  "hwg_b5_139": "hwg_b5_139",
  "hwg_b5_140": "hwg_b5_140",
  "hwg_b5_141": "hwg_b5_141",
  "hwg_b5_142": "hwg_b5_142",
  "hwg_b5_143": "hwg_b5_143",
  "hwg_b5_144": "hwg_b5_144",
  "hwg_b5_145": "hwg_b5_145",
  "hwg_b5_146": "hwg_b5_146",
  "hwg_b5_147": "hwg_b5_147",
  "hwg_b5_148": "hwg_b5_148",
  "hwg_b5_149": "hwg_b5_149",
  "hwg_b5_150": "hwg_b5_150",
  "hwg_b5_151": "hwg_b5_151",
  "hwg_b5_152": "hwg_b5_152",
  "hwg_b5_153": "hwg_b5_153",
  "hwg_b5_154": "hwg_b5_154",
  "hwg_b5_155": "hwg_b5_155",
  "hwg_b5_156": "hwg_b5_156",
  "hwg_b5_157": "hwg_b5_157",
  "hwg_b5_158": "hwg_b5_158",
  "hwg_b5_159": "hwg_b5_159",
  "hwg_b5_160": "hwg_b5_160",
  "hwg_b5_161": "hwg_b5_161",
  "hwg_b5_162": "hwg_b5_162",
  "hwg_b5_163": "hwg_b5_163",
  "hwg_b5_164": "hwg_b5_164",
  "hwg_b5_165": "hwg_b5_165",
  "hwg_b5_166": "hwg_b5_166",
  "hwg_b5_167": "hwg_b5_167",
  "hwg_b5_168": "hwg_b5_168",
  "hwg_b5_169": "hwg_b5_169",
  "hwg_b5_170": "hwg_b5_170",
  "hwg_b5_171": "hwg_b5_171",
  "hwg_b5_172": "hwg_b5_172",
  "hwg_b5_173": "hwg_b5_173",
  "hwg_b5_174": "hwg_b5_174",
  "hwg_b5_175": "hwg_b5_175",
  "hwg_b5_176": "hwg_b5_176",
  "hwg_b5_177": "hwg_b5_177",
  "hwg_b5_178": "hwg_b5_178",
  "hwg_b5_179": "hwg_b5_179",
  "hwg_b5_180": "hwg_b5_180",
  "hwg_b5_181": "hwg_b5_181",
  "hwg_b5_182": "hwg_b5_182",
  "hwg_b5_183": "hwg_b5_183",
  "hwg_b5_184": "hwg_b5_184",
  "hwg_b5_185": "hwg_b5_185",
  "hwg_b5_186": "hwg_b5_186",
  "hwg_b5_187": "hwg_b5_187",
  "hwg_b5_188": "hwg_b5_188",
  "hwg_b5_189": "hwg_b5_189",
  "hwg_b5_190": "hwg_b5_190",
  "hwg_b5_191": "hwg_b5_191",
  "hwg_b5_192": "hwg_b5_192",
  "hwg_b5_193": "hwg_b5_193",
  "hwg_b5_194": "hwg_b5_194",
  "hwg_b5_195": "hwg_b5_195",
  "hwg_b5_196": "hwg_b5_196",
  "hwg_b7_197": "hwg_b7_197",
  "hwg_b7_198": "hwg_b7_198",
  "hwg_b7_199": "hwg_b7_199",
  "hwg_b7_200": "hwg_b7_200",
  "hwg_b7_201": "hwg_b7_201",
  "hwg_b7_202": "hwg_b7_202",
  "hwg_b7_203": "hwg_b7_203",
  "hwg_b7_204": "hwg_b7_204",
  "hwg_b7_205": "hwg_b7_205",
  "hwg_b7_206": "hwg_b7_206",
  "hwg_b7_207": "hwg_b7_207",
  "hwg_b7_208": "hwg_b7_208",
  "hwg_b7_209": "hwg_b7_209",
  "hwg_b7_210": "hwg_b7_210",
  "hwg_b7_211": "hwg_b7_211",
  "hwg_b7_212": "hwg_b7_212",
  "hwg_b7_213": "hwg_b7_213",
  "hwg_b7_214": "hwg_b7_214",
  "hwg_b7_215": "hwg_b7_215",
  "hwg_b7_216": "hwg_b7_216",
  "hwg_b7_217": "hwg_b7_217",
  "hwg_b7_218": "hwg_b7_218",
  "hwg_b7_219": "hwg_b7_219",
  "hwg_b7_220": "hwg_b7_220",
  "hwg_b7_221": "hwg_b7_221",
  "hwg_b7_222": "hwg_b7_222",
  "hwg_b7_223": "hwg_b7_223",
  "hwg_b7_224": "hwg_b7_224",
  "hwg_b7_225": "hwg_b7_225",
  "hwg_b7_226": "hwg_b7_226",
  "hwg_b7_227": "hwg_b7_227",
  "hwg_b7_228": "hwg_b7_228",
  "hwg_b7_229": "hwg_b7_229",
  "hwg_b7_230": "hwg_b7_230",
  "hwg_b7_231": "hwg_b7_231",
  "hwg_b7_232": "hwg_b7_232",
  "hwg_b7_233": "hwg_b7_233",
  "hwg_b7_234": "hwg_b7_234",
  "hwg_b7_235": "hwg_b7_235",
  "hwg_b7_236": "hwg_b7_236",
  "hwg_b7_237": "hwg_b7_237",
  "hwg_b7_238": "hwg_b7_238",
  "hwg_b7_239": "hwg_b7_239",
  "hwg_b7_240": "hwg_b7_240",
  "hwg_b7_241": "hwg_b7_241",
  "hwg_b7_242": "hwg_b7_242",
  "hwg_b7_243": "hwg_b7_243",
  "hwg_b7_244": "hwg_b7_244",
  "hwg_b7_245": "hwg_b7_245",
  "hwg_b7_246": "hwg_b7_246",
  "hwg_b7_247": "hwg_b7_247",
  "hwg_b7_248": "hwg_b7_248",
  "hwg_b7_249": "hwg_b7_249",
  "hwg_b7_250": "hwg_b7_250",
  "hwg_b7_251": "hwg_b7_251",
  "hwg_b7_252": "hwg_b7_252",
  "hwg_b7_253": "hwg_b7_253",
  "hwg_b7_254": "hwg_b7_254",
  "hwg_b7_255": "hwg_b7_255",
  "hwg_b7_256": "hwg_b7_256",
  "hwg_b7_257": "hwg_b7_257",
  "hwg_b7_258": "hwg_b7_258",
  "hwg_b7_259": "hwg_b7_259",
  "hwg_b7_260": "hwg_b7_260",
  "hwg_b7_261": "hwg_b7_261",
  "hwg_b7_262": "hwg_b7_262",
  "hwg_b7_263": "hwg_b7_263",
  "hwg_b7_264": "hwg_b7_264",
  "hwg_b7_265": "hwg_b7_265",
  "hwg_b7_266": "hwg_b7_266",
  "hwg_b7_267": "hwg_b7_267",
  "hwg_b7_268": "hwg_b7_268",
  "hwg_b7_269": "hwg_b7_269",
  "hwg_b7_270": "hwg_b7_270",
  "hwg_b9_271": "hwg_b9_271",
  "hwg_b9_272": "hwg_b9_272",
  "hwg_b9_273": "hwg_b9_273",
  "hwg_b9_274": "hwg_b9_274",
  "hwg_b9_275": "hwg_b9_275",
  "hwg_b9_276": "hwg_b9_276",
  "hwg_b9_277": "hwg_b9_277",
  "hwg_b9_278": "hwg_b9_278",
  "hwg_b9_279": "hwg_b9_279",
  "hwg_b9_280": "hwg_b9_280",
  "hwg_b9_281": "hwg_b9_281",
  "hwg_b9_282": "hwg_b9_282",
  "hwg_b9_283": "hwg_b9_283",
  "hwg_b9_284": "hwg_b9_284",
  "hwg_b9_285": "hwg_b9_285",
  "hwg_b9_286": "hwg_b9_286",
  "hwg_b9_287": "hwg_b9_287",
  "hwg_b9_288": "hwg_b9_288",
  "hwg_b9_289": "hwg_b9_289",
  "hwg_b9_290": "hwg_b9_290",
  "hwg_b9_291": "hwg_b9_291",
  "hwg_b9_292": "hwg_b9_292",
  "hwg_b9_293": "hwg_b9_293",
  "hwg_b9_294": "hwg_b9_294",
  "hwg_b9_295": "hwg_b9_295",
  "hwg_b9_296": "hwg_b9_296",
  "hwg_b9_297": "hwg_b9_297",
  "hwg_b9_298": "hwg_b9_298",
  "hwg_b9_299": "hwg_b9_299",
  "hwg_b9_300": "hwg_b9_300",
  "hwg_b9_301": "hwg_b9_301",
  "hwg_b9_302": "hwg_b9_302",
  "hwg_b9_303": "hwg_b9_303",
  "hwg_b9_304": "hwg_b9_304",
  "hwg_b9_305": "hwg_b9_305",
  "hwg_b9_306": "hwg_b9_306",
  "hwg_b9_307": "hwg_b9_307",
  "hwg_b9_308": "hwg_b9_308",
  "hwg_b9_309": "hwg_b9_309",
  "hwg_b9_310": "hwg_b9_310",
  "hwg_b9_311": "hwg_b9_311",
  "hwg_b9_312": "hwg_b9_312",
  "hwg_b9_313": "hwg_b9_313",
  "hwg_b9_314": "hwg_b9_314",
  "hwg_b9_315": "hwg_b9_315",
  "hwg_b9_316": "hwg_b9_316",
  "hwg_b9_317": "hwg_b9_317",
  "hwg_b9_318": "hwg_b9_318",
  "hwg_b9_319": "hwg_b9_319",
  "hwg_b9_320": "hwg_b9_320",
  "hwg_b9_321": "hwg_b9_321",
  "hwg_b9_322": "hwg_b9_322",
  "hwg_b9_323": "hwg_b9_323",
  "hwg_b9_324": "hwg_b9_324",
  "hwg_b9_325": "hwg_b9_325",
  "hwg_b9_326": "hwg_b9_326",
  "hwg_b9_327": "hwg_b9_327",
  "hwg_b9_328": "hwg_b9_328",
  "hwg_b9_329": "hwg_b9_329",
  "hwg_b9_330": "hwg_b9_330",
  "hwg_b9_331": "hwg_b9_331",
  "hwg_b9_332": "hwg_b9_332",
  "hwg_b9_333": "hwg_b9_333",
  "hwg_b9_334": "hwg_b9_334",
  "hwg_b1_335": "hwg_b1_335",
  "hwg_b1_336": "hwg_b1_336",
  "hwg_b1_337": "hwg_b1_337",
  "hwg_b1_338": "hwg_b1_338",
  "hwg_b1_339": "hwg_b1_339",
  "hwg_b1_340": "hwg_b1_340",
  "hwg_b1_341": "hwg_b1_341",
  "hwg_b1_342": "hwg_b1_342",
  "hwg_b1_343": "hwg_b1_343",
  "hwg_b1_344": "hwg_b1_344",
  "hwg_b1_345": "hwg_b1_345",
  "hwg_b1_346": "hwg_b1_346",
  "hwg_b1_347": "hwg_b1_347",
  "hwg_b1_348": "hwg_b1_348",
  "hwg_b1_349": "hwg_b1_349",
  "hwg_b1_350": "hwg_b1_350",
  "hwg_b1_351": "hwg_b1_351",
  "hwg_b1_352": "hwg_b1_352",
  "hwg_b1_353": "hwg_b1_353",
  "hwg_b1_354": "hwg_b1_354",
  "hwg_b1_355": "hwg_b1_355",
  "hwg_b1_356": "hwg_b1_356",
  "hwg_b1_357": "hwg_b1_357",
  "hwg_b1_358": "hwg_b1_358",
  "hwg_b1_359": "hwg_b1_359",
  "hwg_b1_360": "hwg_b1_360",
  "hwg_b1_361": "hwg_b1_361",
  "hwg_b1_362": "hwg_b1_362",
  "hwg_b1_363": "hwg_b1_363",
  "hwg_b1_364": "hwg_b1_364",
  "hwg_b1_365": "hwg_b1_365",
  "hwg_b1_366": "hwg_b1_366",
  "hwg_b1_367": "hwg_b1_367",
  "hwg_b1_368": "hwg_b1_368",
  "hwg_b1_369": "hwg_b1_369",
  "hwg_b1_370": "hwg_b1_370",
  "hwg_b1_371": "hwg_b1_371",
  "hwg_b1_372": "hwg_b1_372",
  "hwg_b1_373": "hwg_b1_373",
  "hwg_b1_374": "hwg_b1_374",
  "hwg_b1_375": "hwg_b1_375",
  "hwg_b1_376": "hwg_b1_376",
  "hwg_b1_377": "hwg_b1_377",
  "hwg_b1_378": "hwg_b1_378",
  "hwg_b1_379": "hwg_b1_379",
  "hwg_b1_380": "hwg_b1_380",
  "hwg_b1_381": "hwg_b1_381",
  "hwg_b1_382": "hwg_b1_382",
  "hwg_b1_383": "hwg_b1_383",
  "hwg_b1_384": "hwg_b1_384",
  "hwg_b1_385": "hwg_b1_385",
  "hwg_b1_386": "hwg_b1_386",
  "hwg_b1_387": "hwg_b1_387",
  "hwg_b1_388": "hwg_b1_388",
  "hwg_b1_389": "hwg_b1_389",
  "hwg_b1_390": "hwg_b1_390",
  "hwg_b1_391": "hwg_b1_391",
  "hwg_b1_392": "hwg_b1_392",
  "hwg_b1_393": "hwg_b1_393",
  "hwg_b1_394": "hwg_b1_394",
  "hwg_b1_395": "hwg_b1_395",
  "hwg_b1_396": "hwg_b1_396",
  "hwg_b1_397": "hwg_b1_397",
  "hwg_b1_398": "hwg_b1_398",
  "hwg_b1_399": "hwg_b1_399",
  "hwg_b1_400": "hwg_b1_400",
  "hwg_b1_401": "hwg_b1_401",
  "hwg_b1_402": "hwg_b1_402",
  "hwg_b1_403": "hwg_b1_403",
  "hwg_b1_404": "hwg_b1_404",
  "hwg_b1_405": "hwg_b1_405",
  "hwg_b1_406": "hwg_b1_406",
  "hwg_b1_407": "hwg_b1_407",
  "hwg_b1_408": "hwg_b1_408",
  "hwg_b1_409": "hwg_b1_409",
  "hwg_b1_410": "hwg_b1_410",
  "hwg_b1_411": "hwg_b1_411",
  "hwg_b1_412": "hwg_b1_412",
  "hwg_b1_413": "hwg_b1_413",
  "hwg_b1_414": "hwg_b1_414",
  "hwg_b1_415": "hwg_b1_415",
  "hwg_b2_416": "hwg_b2_416",
  "hwg_b2_417": "hwg_b2_417",
  "hwg_b2_418": "hwg_b2_418",
  "hwg_b2_419": "hwg_b2_419",
  "hwg_b2_420": "hwg_b2_420",
  "hwg_b2_421": "hwg_b2_421",
  "hwg_b2_422": "hwg_b2_422",
  "hwg_b2_423": "hwg_b2_423",
  "hwg_b2_424": "hwg_b2_424",
  "hwg_b2_425": "hwg_b2_425",
  "hwg_b2_426": "hwg_b2_426",
  "hwg_b2_427": "hwg_b2_427",
  "hwg_b2_428": "hwg_b2_428",
  "hwg_b2_429": "hwg_b2_429",
  "hwg_b2_430": "hwg_b2_430",
  "hwg_b2_431": "hwg_b2_431",
  "hwg_b2_432": "hwg_b2_432",
  "hwg_b2_433": "hwg_b2_433",
  "hwg_b2_434": "hwg_b2_434",
  "hwg_b2_435": "hwg_b2_435",
  "hwg_b2_436": "hwg_b2_436",
  "hwg_b2_437": "hwg_b2_437",
  "hwg_b2_438": "hwg_b2_438",
  "hwg_b2_439": "hwg_b2_439",
  "hwg_b2_440": "hwg_b2_440",
  "hwg_b2_441": "hwg_b2_441",
  "hwg_b2_442": "hwg_b2_442",
  "hwg_b2_443": "hwg_b2_443",
  "hwg_b2_444": "hwg_b2_444",
  "hwg_b2_445": "hwg_b2_445",
  "hwg_b2_446": "hwg_b2_446",
  "hwg_b2_447": "hwg_b2_447",
  "hwg_b2_448": "hwg_b2_448",
  "hwg_b2_449": "hwg_b2_449",
  "hwg_b2_450": "hwg_b2_450",
  "hwg_b2_451": "hwg_b2_451",
  "hwg_b2_452": "hwg_b2_452",
  "hwg_b2_453": "hwg_b2_453",
  "hwg_b2_454": "hwg_b2_454",
  "hwg_b2_455": "hwg_b2_455",
  "hwg_b2_456": "hwg_b2_456",
  "hwg_b2_457": "hwg_b2_457",
  "hwg_b2_458": "hwg_b2_458",
  "hwg_b2_459": "hwg_b2_459",
  "hwg_b2_460": "hwg_b2_460",
  "hwg_b2_461": "hwg_b2_461",
  "hwg_b2_462": "hwg_b2_462",
  "hwg_b2_463": "hwg_b2_463",
  "hwg_b2_464": "hwg_b2_464",
  "hwg_b2_465": "hwg_b2_465",
  "hwg_b2_466": "hwg_b2_466",
  "hwg_b2_467": "hwg_b2_467",
  "hwg_b2_468": "hwg_b2_468",
  "hwg_b2_469": "hwg_b2_469",
  "hwg_b2_470": "hwg_b2_470",
  "hwg_b2_471": "hwg_b2_471",
  "hwg_b2_472": "hwg_b2_472",
  "hwg_b2_473": "hwg_b2_473",
  "hwg_b2_474": "hwg_b2_474",
  "hwg_b2_475": "hwg_b2_475",
  "hwg_b2_476": "hwg_b2_476",
  "hwg_b2_477": "hwg_b2_477",
  "hwg_b2_478": "hwg_b2_478",
  "hwg_b2_479": "hwg_b2_479",
  "hwg_b2_480": "hwg_b2_480",
  "hwg_b2_481": "hwg_b2_481",
  "hwg_b2_482": "hwg_b2_482",
  "hwg_b2_483": "hwg_b2_483",
  "hwg_b2_484": "hwg_b2_484",
  "hwg_b2_485": "hwg_b2_485",
  "hwg_b2_486": "hwg_b2_486",
  "hwg_b2_487": "hwg_b2_487",
  "hwg_b2_488": "hwg_b2_488",
  "hwg_b2_489": "hwg_b2_489",
  "hwg_b2_490": "hwg_b2_490",
  "hwg_b2_491": "hwg_b2_491",
  "hwg_b2_492": "hwg_b2_492",
  "hwg_b2_493": "hwg_b2_493",
  "hwg_b2_494": "hwg_b2_494",
  "hwg_b2_495": "hwg_b2_495",
  "hwg_b2_496": "hwg_b2_496",
  "hwg_b2_497": "hwg_b2_497",
  "hwg_b2_498": "hwg_b2_498",
  "hwg_b2_499": "hwg_b2_499",
  "hwg_b2_500": "hwg_b2_500",
  "hwg_b2_501": "hwg_b2_501",
  "hwg_b2_502": "hwg_b2_502",
  "hwg_b2_503": "hwg_b2_503",
  "hwg_b2_504": "hwg_b2_504",
  "hwg_b2_505": "hwg_b2_505",
  "hwg_b2_506": "hwg_b2_506",
  "hwg_b2_507": "hwg_b2_507",
  "hwg_b2_508": "hwg_b2_508",
  "hwg_b2_509": "hwg_b2_509",
  "hwg_b2_510": "hwg_b2_510",
  "hwg_b2_511": "hwg_b2_511",
  "hwg_b2_512": "hwg_b2_512",
  "hwg_b2_513": "hwg_b2_513",
  "hwg_b2_514": "hwg_b2_514",
  "hwg_b2_515": "hwg_b2_515",
  "hwg_b2_516": "hwg_b2_516",
  "hwg_b2_517": "hwg_b2_517",
  "hwg_b2_518": "hwg_b2_518",
  "hwg_b2_519": "hwg_b2_519",
  "hwg_b2_520": "hwg_b2_520",
  "hwg_b2_521": "hwg_b2_521",
  "hwg_b2_522": "hwg_b2_522",
  "hwg_b2_523": "hwg_b2_523",
  "hwg_b2_524": "hwg_b2_524",
  "hwg_b2_525": "hwg_b2_525",
  "hwg_b2_526": "hwg_b2_526",
  "hwg_b2_527": "hwg_b2_527",
  "hwg_b2_528": "hwg_b2_528",
  "hwg_b2_529": "hwg_b2_529",
  "hwg_b2_530": "hwg_b2_530",
  "hwg_b2_531": "hwg_b2_531",
  "hwg_b2_532": "hwg_b2_532",
  "hwg_b2_533": "hwg_b2_533",
  "hwg_b2_534": "hwg_b2_534",
  "hwg_b2_535": "hwg_b2_535",
  "hwg_b2_536": "hwg_b2_536",
  "hwg_b2_537": "hwg_b2_537",
  "hwg_b3_538": "hwg_b3_538",
  "hwg_b3_539": "hwg_b3_539",
  "hwg_b3_540": "hwg_b3_540",
  "hwg_b3_541": "hwg_b3_541",
  "hwg_b3_542": "hwg_b3_542",
  "hwg_b3_543": "hwg_b3_543",
  "hwg_b3_544": "hwg_b3_544",
  "hwg_b3_545": "hwg_b3_545",
  "hwg_b3_546": "hwg_b3_546",
  "hwg_b3_547": "hwg_b3_547",
  "hwg_b3_548": "hwg_b3_548",
  "hwg_b3_549": "hwg_b3_549",
  "hwg_b3_550": "hwg_b3_550",
  "hwg_b3_551": "hwg_b3_551",
  "hwg_b3_552": "hwg_b3_552",
  "hwg_b3_553": "hwg_b3_553",
  "hwg_b3_554": "hwg_b3_554",
  "hwg_b3_555": "hwg_b3_555",
  "hwg_b3_556": "hwg_b3_556",
  "hwg_b3_557": "hwg_b3_557",
  "hwg_b3_558": "hwg_b3_558",
  "hwg_b3_559": "hwg_b3_559",
  "hwg_b3_560": "hwg_b3_560",
  "hwg_b3_561": "hwg_b3_561",
  "hwg_b3_562": "hwg_b3_562",
  "hwg_b3_563": "hwg_b3_563",
  "hwg_b3_564": "hwg_b3_564",
  "hwg_b3_565": "hwg_b3_565",
  "hwg_b3_566": "hwg_b3_566",
  "hwg_b3_567": "hwg_b3_567",
  "hwg_b3_568": "hwg_b3_568",
  "hwg_b3_569": "hwg_b3_569",
  "hwg_b3_570": "hwg_b3_570",
  "hwg_b3_571": "hwg_b3_571",
  "hwg_b3_572": "hwg_b3_572",
  "hwg_b3_573": "hwg_b3_573",
  "hwg_b3_574": "hwg_b3_574",
  "hwg_b3_575": "hwg_b3_575",
  "hwg_b3_576": "hwg_b3_576",
  "hwg_b3_577": "hwg_b3_577",
  "hwg_b3_578": "hwg_b3_578",
  "hwg_b3_579": "hwg_b3_579",
  "hwg_b3_580": "hwg_b3_580",
  "hwg_b3_581": "hwg_b3_581",
  "hwg_b3_582": "hwg_b3_582",
  "hwg_b3_583": "hwg_b3_583",
  "hwg_b3_584": "hwg_b3_584",
  "hwg_b3_585": "hwg_b3_585",
  "hwg_b3_586": "hwg_b3_586",
  "hwg_b3_587": "hwg_b3_587",
  "hwg_b3_588": "hwg_b3_588",
  "hwg_b3_589": "hwg_b3_589",
  "hwg_b3_590": "hwg_b3_590",
  "hwg_b4_591": "hwg_b4_591",
  "hwg_b4_592": "hwg_b4_592",
  "hwg_b4_593": "hwg_b4_593",
  "hwg_b4_594": "hwg_b4_594",
  "hwg_b4_595": "hwg_b4_595",
  "hwg_b4_596": "hwg_b4_596",
  "hwg_b4_597": "hwg_b4_597",
  "hwg_b4_598": "hwg_b4_598",
  "hwg_b4_599": "hwg_b4_599",
  "hwg_b4_600": "hwg_b4_600",
  "hwg_b4_601": "hwg_b4_601",
  "hwg_b4_602": "hwg_b4_602",
  "hwg_b4_603": "hwg_b4_603",
  "hwg_b4_604": "hwg_b4_604",
  "hwg_b4_605": "hwg_b4_605",
  "hwg_b4_606": "hwg_b4_606",
  "hwg_b4_607": "hwg_b4_607",
  "hwg_b4_608": "hwg_b4_608",
  "hwg_b4_609": "hwg_b4_609",
  "hwg_b4_610": "hwg_b4_610",
  "hwg_b4_611": "hwg_b4_611",
  "hwg_b4_612": "hwg_b4_612",
  "hwg_b4_613": "hwg_b4_613",
  "hwg_b4_614": "hwg_b4_614",
  "hwg_b4_615": "hwg_b4_615",
  "hwg_b4_616": "hwg_b4_616",
  "hwg_b4_617": "hwg_b4_617",
  "hwg_b4_618": "hwg_b4_618",
  "hwg_b4_619": "hwg_b4_619",
  "hwg_b4_620": "hwg_b4_620",
  "hwg_b4_621": "hwg_b4_621",
  "hwg_b4_622": "hwg_b4_622",
  "hwg_b4_623": "hwg_b4_623",
  "hwg_b4_624": "hwg_b4_624",
  "hwg_b4_625": "hwg_b4_625",
  "hwg_b4_626": "hwg_b4_626",
  "hwg_b4_627": "hwg_b4_627",
  "hwg_b4_628": "hwg_b4_628",
  "hwg_b4_629": "hwg_b4_629",
  "hwg_b4_630": "hwg_b4_630",
  "hwg_b4_631": "hwg_b4_631",
  "hwg_b4_632": "hwg_b4_632",
  "hwg_b4_633": "hwg_b4_633",
  "hwg_b4_634": "hwg_b4_634",
  "hwg_b4_635": "hwg_b4_635",
  "hwg_b4_636": "hwg_b4_636",
  "hwg_b4_637": "hwg_b4_637",
  "hwg_b4_638": "hwg_b4_638",
  "hwg_b4_639": "hwg_b4_639",
  "hwg_b4_640": "hwg_b4_640",
  "hwg_b4_641": "hwg_b4_641",
  "hwg_b4_642": "hwg_b4_642",
  "hwg_b4_643": "hwg_b4_643",
  "hwg_b4_644": "hwg_b4_644",
  "hwg_b4_645": "hwg_b4_645",
  "hwg_b4_646": "hwg_b4_646",
  "hwg_b4_647": "hwg_b4_647",
  "hwg_b4_648": "hwg_b4_648",
  "hwg_b4_649": "hwg_b4_649",
  "hwg_b4_650": "hwg_b4_650",
  "hwg_b4_651": "hwg_b4_651",
  "hwg_b4_652": "hwg_b4_652",
  "hwg_b4_653": "hwg_b4_653",
  "hwg_b4_654": "hwg_b4_654",
  "hwg_b4_655": "hwg_b4_655",
  "hwg_b4_656": "hwg_b4_656",
  "hwg_b4_657": "hwg_b4_657",
  "hwg_b4_658": "hwg_b4_658",
  "hwg_b4_659": "hwg_b4_659",
  "hwg_b4_660": "hwg_b4_660",
  "hwg_b4_661": "hwg_b4_661",
  "hwg_b4_662": "hwg_b4_662",
  "hwg_b4_663": "hwg_b4_663",
  "hwg_b4_664": "hwg_b4_664",
  "hwg_b4_665": "hwg_b4_665",
  "hwg_b4_666": "hwg_b4_666",
  "hwg_b4_667": "hwg_b4_667",
  "hwg_b4_668": "hwg_b4_668",
  "hwg_b4_669": "hwg_b4_669",
  "hwg_b4_670": "hwg_b4_670",
  "hwg_b4_671": "hwg_b4_671",
  "hwg_b4_672": "hwg_b4_672",
  "hwg_b4_673": "hwg_b4_673",
  "hwg_b4_674": "hwg_b4_674",
  "hwg_b4_675": "hwg_b4_675",
  "hwg_b4_676": "hwg_b4_676",
  "hwg_b4_677": "hwg_b4_677",
  "hwg_b4_678": "hwg_b4_678",
  "hwg_b4_679": "hwg_b4_679",
  "hwg_b4_680": "hwg_b4_680",
  "hwg_b4_681": "hwg_b4_681",
  "hwg_b4_682": "hwg_b4_682",
  "hwg_b4_683": "hwg_b4_683",
  "hwg_b4_684": "hwg_b4_684",
  "hwg_b4_685": "hwg_b4_685",
  "hwg_b4_686": "hwg_b4_686",
  "hwg_b4_687": "hwg_b4_687",
  "hwg_b4_688": "hwg_b4_688",
  "hwg_b4_689": "hwg_b4_689",
  "hwg_b4_690": "hwg_b4_690",
  "hwg_b4_691": "hwg_b4_691",
  "hwg_b4_692": "hwg_b4_692",
  "hwg_b4_693": "hwg_b4_693",
  "hwg_b4_694": "hwg_b4_694",
  "hwg_b4_695": "hwg_b4_695",
  "hwg_b4_696": "hwg_b4_696",
  "hwg_b4_697": "hwg_b4_697",
  "hwg_b4_698": "hwg_b4_698",
  "hwg_b4_699": "hwg_b4_699",
  "hwg_b5_700": "hwg_b5_700",
  "hwg_b5_701": "hwg_b5_701",
  "hwg_b5_702": "hwg_b5_702",
  "hwg_b5_703": "hwg_b5_703",
  "hwg_b5_704": "hwg_b5_704",
  "hwg_b5_705": "hwg_b5_705",
  "hwg_b5_706": "hwg_b5_706",
  "hwg_b5_707": "hwg_b5_707",
  "hwg_b5_708": "hwg_b5_708",
  "hwg_b5_709": "hwg_b5_709",
  "hwg_b5_710": "hwg_b5_710",
  "hwg_b5_711": "hwg_b5_711",
  "hwg_b5_712": "hwg_b5_712",
  "hwg_b5_713": "hwg_b5_713",
  "hwg_b5_714": "hwg_b5_714",
  "hwg_b5_715": "hwg_b5_715",
  "hwg_b5_716": "hwg_b5_716",
  "hwg_b5_717": "hwg_b5_717",
  "hwg_b5_718": "hwg_b5_718",
  "hwg_b5_719": "hwg_b5_719",
  "hwg_b5_720": "hwg_b5_720",
  "hwg_b5_721": "hwg_b5_721",
  "hwg_b5_722": "hwg_b5_722",
  "hwg_b5_723": "hwg_b5_723",
  "hwg_b5_724": "hwg_b5_724",
  "hwg_b5_725": "hwg_b5_725",
  "hwg_b5_726": "hwg_b5_726",
  "hwg_b5_727": "hwg_b5_727",
  "hwg_b5_728": "hwg_b5_728",
  "hwg_b6_729": "hwg_b6_729",
  "hwg_b6_730": "hwg_b6_730",
  "hwg_b6_731": "hwg_b6_731",
  "hwg_b6_732": "hwg_b6_732",
  "hwg_b6_733": "hwg_b6_733",
  "hwg_b6_734": "hwg_b6_734",
  "hwg_b6_735": "hwg_b6_735",
  "hwg_b6_736": "hwg_b6_736",
  "hwg_b6_737": "hwg_b6_737",
  "hwg_b6_738": "hwg_b6_738",
  "hwg_b6_739": "hwg_b6_739",
  "hwg_b6_740": "hwg_b6_740",
  "hwg_b6_741": "hwg_b6_741",
  "hwg_b6_742": "hwg_b6_742",
  "hwg_b6_743": "hwg_b6_743",
  "hwg_b6_744": "hwg_b6_744",
  "hwg_b6_745": "hwg_b6_745",
  "hwg_b6_746": "hwg_b6_746",
  "hwg_b6_747": "hwg_b6_747",
  "hwg_b6_748": "hwg_b6_748",
  "hwg_b6_749": "hwg_b6_749",
  "hwg_b6_750": "hwg_b6_750",
  "hwg_b6_751": "hwg_b6_751",
  "hwg_b6_752": "hwg_b6_752",
  "hwg_b6_753": "hwg_b6_753",
  "hwg_b6_754": "hwg_b6_754",
  "hwg_b6_755": "hwg_b6_755",
  "hwg_b6_756": "hwg_b6_756",
  "hwg_b6_757": "hwg_b6_757",
  "hwg_b6_758": "hwg_b6_758",
  "hwg_b6_759": "hwg_b6_759",
  "hwg_b6_760": "hwg_b6_760",
  "hwg_b6_761": "hwg_b6_761",
  "hwg_b6_762": "hwg_b6_762",
  "hwg_b6_763": "hwg_b6_763",
  "hwg_b6_764": "hwg_b6_764",
  "hwg_b6_765": "hwg_b6_765",
  "hwg_b6_766": "hwg_b6_766",
  "hwg_b6_767": "hwg_b6_767",
  "hwg_b6_768": "hwg_b6_768",
  "hwg_b6_769": "hwg_b6_769",
  "hwg_b6_770": "hwg_b6_770",
  "hwg_b6_771": "hwg_b6_771",
  "hwg_b6_772": "hwg_b6_772",
  "hwg_b6_773": "hwg_b6_773",
  "hwg_b6_774": "hwg_b6_774",
  "hwg_b6_775": "hwg_b6_775",
  "hwg_b6_776": "hwg_b6_776",
  "hwg_b6_777": "hwg_b6_777",
  "hwg_b6_778": "hwg_b6_778",
  "hwg_b6_779": "hwg_b6_779",
  "hwg_b6_780": "hwg_b6_780",
  "hwg_b6_781": "hwg_b6_781",
  "hwg_b6_782": "hwg_b6_782",
  "hwg_b6_783": "hwg_b6_783",
  "hwg_b6_784": "hwg_b6_784",
  "hwg_b6_785": "hwg_b6_785",
  "hwg_b6_786": "hwg_b6_786",
  "hwg_b6_787": "hwg_b6_787",
  "hwg_b6_788": "hwg_b6_788",
  "hwg_b6_789": "hwg_b6_789",
  "hwg_b6_790": "hwg_b6_790",
  "hwg_b6_791": "hwg_b6_791",
  "hwg_b6_792": "hwg_b6_792",
  "hwg_b6_793": "hwg_b6_793",
  "hwg_b6_794": "hwg_b6_794",
  "hwg_b6_795": "hwg_b6_795",
  "hwg_b6_796": "hwg_b6_796",
  "hwg_b6_797": "hwg_b6_797",
  "hwg_b6_798": "hwg_b6_798",
  "hwg_b6_799": "hwg_b6_799",
  "hwg_b6_800": "hwg_b6_800",
  "hwg_b6_801": "hwg_b6_801",
  "hwg_b6_802": "hwg_b6_802",
  "hwg_b6_803": "hwg_b6_803",
  "hwg_b6_804": "hwg_b6_804",
  "hwg_b6_805": "hwg_b6_805",
  "hwg_b6_806": "hwg_b6_806",
  "hwg_b6_807": "hwg_b6_807",
  "hwg_b6_808": "hwg_b6_808",
  "hwg_b6_809": "hwg_b6_809",
  "hwg_b6_810": "hwg_b6_810",
  "hwg_b6_811": "hwg_b6_811",
  "hwg_b6_812": "hwg_b6_812",
  "hwg_b6_813": "hwg_b6_813",
  "hwg_b6_814": "hwg_b6_814",
  "hwg_b6_815": "hwg_b6_815",
  "hwg_b6_816": "hwg_b6_816",
  "hwg_b6_817": "hwg_b6_817",
  "hwg_b6_818": "hwg_b6_818",
  "hwg_b6_819": "hwg_b6_819",
  "hwg_b6_820": "hwg_b6_820",
  "hwg_b6_821": "hwg_b6_821",
  "hwg_b6_822": "hwg_b6_822",
  "hwg_b6_823": "hwg_b6_823",
  "hwg_b6_824": "hwg_b6_824",
  "hwg_b6_825": "hwg_b6_825",
  "hwg_b6_826": "hwg_b6_826",
  "hwg_b6_827": "hwg_b6_827",
  "hwg_b6_828": "hwg_b6_828",
  "hwg_b6_829": "hwg_b6_829",
  "hwg_b6_830": "hwg_b6_830",
  "hwg_b6_831": "hwg_b6_831",
  "hwg_b6_832": "hwg_b6_832",
  "hwg_b6_833": "hwg_b6_833",
  "hwg_b6_834": "hwg_b6_834",
  "hwg_b6_835": "hwg_b6_835",
  "hwg_b6_836": "hwg_b6_836",
  "hwg_b6_837": "hwg_b6_837",
  "hwg_b6_838": "hwg_b6_838",
  "hwg_b6_839": "hwg_b6_839",
  "hwg_b6_840": "hwg_b6_840",
  "hwg_b6_841": "hwg_b6_841",
  "hwg_b6_842": "hwg_b6_842",
  "hwg_b6_843": "hwg_b6_843",
  "hwg_b6_844": "hwg_b6_844",
  "hwg_b6_845": "hwg_b6_845",
  "hwg_b6_846": "hwg_b6_846",
  "hwg_b6_847": "hwg_b6_847",
  "hwg_b6_848": "hwg_b6_848",
  "hwg_b6_849": "hwg_b6_849",
  "hwg_b6_850": "hwg_b6_850",
  "hwg_b6_851": "hwg_b6_851",
  "hwg_b6_852": "hwg_b6_852",
  "hwg_b6_853": "hwg_b6_853",
  "hwg_b6_854": "hwg_b6_854",
  "hwg_b6_855": "hwg_b6_855",
  "hwg_b7_856": "hwg_b7_856",
  "hwg_b7_857": "hwg_b7_857",
  "hwg_b7_858": "hwg_b7_858",
  "hwg_b7_859": "hwg_b7_859",
  "hwg_b7_860": "hwg_b7_860",
  "hwg_b7_861": "hwg_b7_861",
  "hwg_b7_862": "hwg_b7_862",
  "hwg_b7_863": "hwg_b7_863",
  "hwg_b7_864": "hwg_b7_864",
  "hwg_b7_865": "hwg_b7_865",
  "hwg_b7_866": "hwg_b7_866",
  "hwg_b7_867": "hwg_b7_867",
  "hwg_b7_868": "hwg_b7_868",
  "hwg_b7_869": "hwg_b7_869",
  "hwg_b7_870": "hwg_b7_870",
  "hwg_b7_871": "hwg_b7_871",
  "hwg_b7_872": "hwg_b7_872",
  "hwg_b7_873": "hwg_b7_873",
  "hwg_b7_874": "hwg_b7_874",
  "hwg_b7_875": "hwg_b7_875",
  "hwg_b7_876": "hwg_b7_876",
  "hwg_b7_877": "hwg_b7_877",
  "hwg_b7_878": "hwg_b7_878",
  "hwg_b7_879": "hwg_b7_879",
  "hwg_b7_880": "hwg_b7_880",
  "hwg_b7_881": "hwg_b7_881",
  "hwg_b7_882": "hwg_b7_882",
  "hwg_b7_883": "hwg_b7_883",
  "hwg_b7_884": "hwg_b7_884",
  "hwg_b7_885": "hwg_b7_885",
  "hwg_b7_886": "hwg_b7_886",
  "hwg_b8_887": "hwg_b8_887",
  "hwg_b8_888": "hwg_b8_888",
  "hwg_b8_889": "hwg_b8_889",
  "hwg_b8_890": "hwg_b8_890",
  "hwg_b8_891": "hwg_b8_891",
  "hwg_b8_892": "hwg_b8_892",
  "hwg_b8_893": "hwg_b8_893",
  "hwg_b8_894": "hwg_b8_894",
  "hwg_b8_895": "hwg_b8_895",
  "hwg_b8_896": "hwg_b8_896",
  "hwg_b8_897": "hwg_b8_897",
  "hwg_b8_898": "hwg_b8_898",
  "hwg_b8_899": "hwg_b8_899",
  "hwg_b8_900": "hwg_b8_900",
  "hwg_b8_901": "hwg_b8_901",
  "hwg_b8_902": "hwg_b8_902",
  "hwg_b8_903": "hwg_b8_903",
  "hwg_b8_904": "hwg_b8_904",
  "hwg_b8_905": "hwg_b8_905",
  "hwg_b8_906": "hwg_b8_906",
  "hwg_b8_907": "hwg_b8_907",
  "hwg_b8_908": "hwg_b8_908",
  "hwg_b8_909": "hwg_b8_909",
  "hwg_b8_910": "hwg_b8_910",
  "hwg_b8_911": "hwg_b8_911",
  "hwg_b8_912": "hwg_b8_912",
  "hwg_b8_913": "hwg_b8_913",
  "hwg_b8_914": "hwg_b8_914",
  "hwg_b8_915": "hwg_b8_915",
  "hwg_b8_916": "hwg_b8_916",
  "hwg_b8_917": "hwg_b8_917",
  "hwg_b8_918": "hwg_b8_918",
  "hwg_b8_919": "hwg_b8_919",
  "hwg_b8_920": "hwg_b8_920",
  "hwg_b8_921": "hwg_b8_921",
  "hwg_b8_922": "hwg_b8_922",
  "hwg_b8_923": "hwg_b8_923",
  "hwg_b8_924": "hwg_b8_924",
  "hwg_b8_925": "hwg_b8_925",
  "hwg_b8_926": "hwg_b8_926",
  "hwg_b8_927": "hwg_b8_927",
  "hwg_b8_928": "hwg_b8_928",
  "hwg_b8_929": "hwg_b8_929",
  "hwg_b8_930": "hwg_b8_930",
  "hwg_b8_931": "hwg_b8_931",
  "hwg_b8_932": "hwg_b8_932",
  "hwg_b8_933": "hwg_b8_933",
  "hwg_b8_934": "hwg_b8_934",
  "hwg_b8_935": "hwg_b8_935",
  "hwg_b8_936": "hwg_b8_936",
  "hwg_b8_937": "hwg_b8_937",
  "hwg_b8_938": "hwg_b8_938",
  "hwg_b8_939": "hwg_b8_939",
  "hwg_b8_940": "hwg_b8_940",
  "hwg_b8_941": "hwg_b8_941",
  "hwg_b8_942": "hwg_b8_942",
  "hwg_b8_943": "hwg_b8_943",
  "hwg_b8_944": "hwg_b8_944",
  "hwg_b8_945": "hwg_b8_945",
  "hwg_b8_946": "hwg_b8_946",
  "hwg_b8_947": "hwg_b8_947",
  "hwg_b8_948": "hwg_b8_948",
  "hwg_b8_949": "hwg_b8_949",
  "hwg_b8_950": "hwg_b8_950",
  "hwg_b8_951": "hwg_b8_951",
  "hwg_b8_952": "hwg_b8_952",
  "hwg_b8_953": "hwg_b8_953",
  "hwg_b8_954": "hwg_b8_954",
  "hwg_b8_955": "hwg_b8_955",
  "hwg_b8_956": "hwg_b8_956",
  "hwg_b8_957": "hwg_b8_957",
  "hwg_b8_958": "hwg_b8_958",
  "hwg_b8_959": "hwg_b8_959",
  "hwg_b8_960": "hwg_b8_960",
  "hwg_b8_961": "hwg_b8_961",
  "hwg_b8_962": "hwg_b8_962",
  "hwg_b8_963": "hwg_b8_963",
  "hwg_b8_964": "hwg_b8_964",
  "hwg_b8_965": "hwg_b8_965",
  "hwg_b8_966": "hwg_b8_966",
  "hwg_b8_967": "hwg_b8_967",
  "hwg_b8_968": "hwg_b8_968",
  "hwg_b8_969": "hwg_b8_969",
  "hwg_b8_970": "hwg_b8_970",
  "hwg_b8_971": "hwg_b8_971",
  "hwg_b8_972": "hwg_b8_972",
  "hwg_b8_973": "hwg_b8_973",
  "hwg_b8_974": "hwg_b8_974",
  "hwg_b8_975": "hwg_b8_975",
  "hwg_b8_976": "hwg_b8_976",
  "hwg_b8_977": "hwg_b8_977",
  "hwg_b8_978": "hwg_b8_978",
  "hwg_b8_979": "hwg_b8_979",
  "hwg_b8_980": "hwg_b8_980",
  "hwg_b8_981": "hwg_b8_981",
  "hwg_b8_982": "hwg_b8_982",
  "hwg_b8_983": "hwg_b8_983",
  "hwg_b8_984": "hwg_b8_984",
  "hwg_b8_985": "hwg_b8_985",
  "hwg_b8_986": "hwg_b8_986",
  "hwg_b8_987": "hwg_b8_987",
  "hwg_b8_988": "hwg_b8_988",
  "hwg_b8_989": "hwg_b8_989",
  "hwg_b8_990": "hwg_b8_990",
  "hwg_b8_991": "hwg_b8_991",
  "hwg_b9_992": "hwg_b9_992",
  "hwg_b9_993": "hwg_b9_993",
  "hwg_b9_994": "hwg_b9_994",
  "hwg_b9_995": "hwg_b9_995",
  "hwg_b9_996": "hwg_b9_996",
  "hwg_b9_997": "hwg_b9_997",
  "hwg_b9_998": "hwg_b9_998",
  "hwg_b9_999": "hwg_b9_999",
  "hwg_b9_1000": "hwg_b9_1000",
  "hwg_b9_1001": "hwg_b9_1001",
  "hwg_b9_1002": "hwg_b9_1002",
  "hwg_b9_1003": "hwg_b9_1003",
  "hwg_b9_1004": "hwg_b9_1004",
  "hwg_b9_1005": "hwg_b9_1005",
  "hwg_b9_1006": "hwg_b9_1006",
  "hwg_b9_1007": "hwg_b9_1007",
  "hwg_b9_1008": "hwg_b9_1008",
  "hwg_b9_1009": "hwg_b9_1009",
  "hwg_b9_1010": "hwg_b9_1010",
  "hwg_b9_1011": "hwg_b9_1011",
  "hwg_b9_1012": "hwg_b9_1012",
  "hwg_b9_1013": "hwg_b9_1013",
  "hwg_b9_1014": "hwg_b9_1014",
  "hwg_b9_1015": "hwg_b9_1015",
  "hwg_b9_1016": "hwg_b9_1016",
  "hwg_b9_1017": "hwg_b9_1017",
  "hwg_b9_1018": "hwg_b9_1018",
  "hwg_b9_1019": "hwg_b9_1019",
  "hwg_b9_1020": "hwg_b9_1020",
  "hwg_b9_1021": "hwg_b9_1021",
  "hwg_b9_1022": "hwg_b9_1022",
  "hwg_b9_1023": "hwg_b9_1023",
  "hwg_b9_1024": "hwg_b9_1024",
  "hwg_b9_1025": "hwg_b9_1025",
  "hwg_b9_1026": "hwg_b9_1026",
  "hwg_b9_1027": "hwg_b9_1027",
  "hwg_b9_1028": "hwg_b9_1028",
  "hwg_b9_1029": "hwg_b9_1029",
  "hwg_b9_1030": "hwg_b9_1030",
  "hwg_b9_1031": "hwg_b9_1031",
  "hwg_b9_1032": "hwg_b9_1032",
  "hwg_b9_1033": "hwg_b9_1033",
  "hwg_b9_1034": "hwg_b9_1034",
  "hwg_b9_1035": "hwg_b9_1035",
  "hwg_b9_1036": "hwg_b9_1036",
  "hwg_b9_1037": "hwg_b9_1037",
  "hwg_b9_1038": "hwg_b9_1038",
  "hwg_b9_1039": "hwg_b9_1039",
  "hwg_b9_1040": "hwg_b9_1040",
  "hwg_b9_1041": "hwg_b9_1041",
  "hwg_b9_1042": "hwg_b9_1042",
  "hwg_b9_1043": "hwg_b9_1043",
  "hwg_b9_1044": "hwg_b9_1044",
  "hwg_bg1_1045": "hwg_bg1_1045",
  "hwg_bg1_1046": "hwg_bg1_1046",
  "hwg_bg1_1047": "hwg_bg1_1047",
  "hwg_bg1_1048": "hwg_bg1_1048",
  "hwg_bg1_1049": "hwg_bg1_1049",
  "hwg_bg1_1050": "hwg_bg1_1050",
  "hwg_bg1_1051": "hwg_bg1_1051",
  "hwg_bg1_1052": "hwg_bg1_1052",
  "hwg_bg1_1053": "hwg_bg1_1053",
  "hwg_bg1_1054": "hwg_bg1_1054",
  "hwg_bg1_1055": "hwg_bg1_1055",
  "hwg_bg1_1056": "hwg_bg1_1056",
  "hwg_bg1_1057": "hwg_bg1_1057",
  "hwg_bg1_1058": "hwg_bg1_1058",
  "hwg_bg1_1059": "hwg_bg1_1059",
  "hwg_bg1_1060": "hwg_bg1_1060",
  "hwg_bg1_1061": "hwg_bg1_1061",
  "hwg_bg1_1062": "hwg_bg1_1062",
  "hwg_bg1_1063": "hwg_bg1_1063",
  "hwg_bg1_1064": "hwg_bg1_1064",
  "hwg_bg1_1065": "hwg_bg1_1065",
  "hwg_bg1_1066": "hwg_bg1_1066",
  "hwg_bg1_1067": "hwg_bg1_1067",
  "hwg_bg1_1068": "hwg_bg1_1068",
  "hwg_bg1_1069": "hwg_bg1_1069",
  "hwg_bg1_1070": "hwg_bg1_1070",
  "hwg_bg1_1071": "hwg_bg1_1071",
  "hwg_bg1_1072": "hwg_bg1_1072",
  "hwg_bg1_1073": "hwg_bg1_1073",
  "hwg_bg1_1074": "hwg_bg1_1074",
  "hwg_bg1_1075": "hwg_bg1_1075",
  "hwg_bg1_1076": "hwg_bg1_1076",
  "hwg_bg1_1077": "hwg_bg1_1077",
  "hwg_bg1_1078": "hwg_bg1_1078",
  "hwg_bg1_1079": "hwg_bg1_1079",
  "hwg_bg1_1080": "hwg_bg1_1080",
  "hwg_bg1_1081": "hwg_bg1_1081",
  "hwg_bg1_1082": "hwg_bg1_1082",
  "hwg_bg1_1083": "hwg_bg1_1083",
  "hwg_bg1_1084": "hwg_bg1_1084",
  "hwg_bg1_1085": "hwg_bg1_1085",
  "hwg_bg1_1086": "hwg_bg1_1086",
  "hwg_bg1_1087": "hwg_bg1_1087",
  "hwg_bg1_1088": "hwg_bg1_1088",
  "hwg_bg1_1089": "hwg_bg1_1089",
  "hwg_bg1_1090": "hwg_bg1_1090",
  "hwg_bg1_1091": "hwg_bg1_1091",
  "hwg_bg1_1092": "hwg_bg1_1092",
  "hwg_bg1_1093": "hwg_bg1_1093",
  "hwg_bg1_1094": "hwg_bg1_1094",
  "hwg_bg1_1095": "hwg_bg1_1095",
  "hwg_bg1_1096": "hwg_bg1_1096",
  "hwg_bg1_1097": "hwg_bg1_1097",
  "hwg_bg1_1098": "hwg_bg1_1098",
  "hwg_bg1_1099": "hwg_bg1_1099",
  "hwg_bg1_1100": "hwg_bg1_1100",
  "hwg_bg1_1101": "hwg_bg1_1101",
  "hwg_bg1_1102": "hwg_bg1_1102",
  "hwg_bg1_1103": "hwg_bg1_1103",
  "hwg_bg1_1104": "hwg_bg1_1104",
  "hwg_bg1_1105": "hwg_bg1_1105",
  "hwg_bg1_1106": "hwg_bg1_1106",
  "hwg_bg1_1107": "hwg_bg1_1107",
  "hwg_bg1_1108": "hwg_bg1_1108",
  "hwg_bg1_1109": "hwg_bg1_1109",
  "hwg_bg1_1110": "hwg_bg1_1110",
  "hwg_bg1_1111": "hwg_bg1_1111",
  "hwg_bg1_1112": "hwg_bg1_1112",
  "hwg_bg1_1113": "hwg_bg1_1113",
  "hwg_bg1_1114": "hwg_bg1_1114",
  "hwg_bg1_1115": "hwg_bg1_1115",
  "hwg_bg1_1116": "hwg_bg1_1116",
  "hwg_bg1_1117": "hwg_bg1_1117",
  "hwg_bg1_1118": "hwg_bg1_1118",
  "hwg_bg1_1119": "hwg_bg1_1119",
  "hwg_bg1_1120": "hwg_bg1_1120",
  "hwg_bg1_1121": "hwg_bg1_1121",
  "hwg_bg1_1122": "hwg_bg1_1122",
  "hwg_bg1_1123": "hwg_bg1_1123",
  "hwg_bg1_1124": "hwg_bg1_1124",
  "hwg_bg1_1125": "hwg_bg1_1125",
  "hwg_bg1_1126": "hwg_bg1_1126",
  "hwg_bg1_1127": "hwg_bg1_1127",
  "hwg_bg1_1128": "hwg_bg1_1128",
  "hwg_bg1_1129": "hwg_bg1_1129",
  "hwg_bg1_1130": "hwg_bg1_1130",
  "hwg_bg1_1131": "hwg_bg1_1131",
  "hwg_bg1_1132": "hwg_bg1_1132",
  "hwg_bg1_1133": "hwg_bg1_1133",
  "hwg_bg1_1134": "hwg_bg1_1134",
  "hwg_bg1_1135": "hwg_bg1_1135",
  "hwg_bg1_1136": "hwg_bg1_1136",
  "hwg_bg1_1137": "hwg_bg1_1137",
  "hwg_bg1_1138": "hwg_bg1_1138",
  "hwg_bg1_1139": "hwg_bg1_1139",
  "hwg_bg1_1140": "hwg_bg1_1140",
  "hwg_bg1_1141": "hwg_bg1_1141",
  "hwg_bg1_1142": "hwg_bg1_1142",
  "hwg_bg1_1143": "hwg_bg1_1143",
  "hwg_bg1_1144": "hwg_bg1_1144",
  "hwg_bg1_1145": "hwg_bg1_1145",
  "hwg_bg1_1146": "hwg_bg1_1146",
  "hwg_bg1_1147": "hwg_bg1_1147",
  "hwg_bg1_1148": "hwg_bg1_1148",
  "hwg_bg1_1149": "hwg_bg1_1149",
  "hwg_bg1_1150": "hwg_bg1_1150",
  "hwg_bg1_1151": "hwg_bg1_1151",
  "hwg_bg1_1152": "hwg_bg1_1152",
  "hwg_bg1_1153": "hwg_bg1_1153",
  "hwg_bg1_1154": "hwg_bg1_1154",
  "hwg_bg1_1155": "hwg_bg1_1155",
  "hwg_bg1_1156": "hwg_bg1_1156",
  "hwg_bg1_1157": "hwg_bg1_1157",
  "hwg_bg1_1158": "hwg_bg1_1158",
  "hwg_bg1_1159": "hwg_bg1_1159",
  "hwg_bg1_1160": "hwg_bg1_1160",
  "hwg_bg1_1161": "hwg_bg1_1161",
  "hwg_bg1_1162": "hwg_bg1_1162",
  "hwg_bg1_1163": "hwg_bg1_1163",
  "hwg_bg1_1164": "hwg_bg1_1164",
  "hwg_bg2_1165": "hwg_bg2_1165",
  "hwg_bg2_1166": "hwg_bg2_1166",
  "hwg_bg2_1167": "hwg_bg2_1167",
  "hwg_bg2_1168": "hwg_bg2_1168",
  "hwg_bg2_1169": "hwg_bg2_1169",
  "hwg_bg2_1170": "hwg_bg2_1170",
  "hwg_bg2_1171": "hwg_bg2_1171",
  "hwg_bg2_1172": "hwg_bg2_1172",
  "hwg_bg2_1173": "hwg_bg2_1173",
  "hwg_bg2_1174": "hwg_bg2_1174",
  "hwg_bg2_1175": "hwg_bg2_1175",
  "hwg_bg2_1176": "hwg_bg2_1176",
  "hwg_bg2_1177": "hwg_bg2_1177",
  "hwg_bg2_1178": "hwg_bg2_1178",
  "hwg_bg2_1179": "hwg_bg2_1179",
  "hwg_bg2_1180": "hwg_bg2_1180",
  "hwg_bg2_1181": "hwg_bg2_1181",
  "hwg_bg2_1182": "hwg_bg2_1182",
  "hwg_bg2_1183": "hwg_bg2_1183",
  "hwg_bg2_1184": "hwg_bg2_1184",
  "hwg_bg2_1185": "hwg_bg2_1185",
  "hwg_bg2_1186": "hwg_bg2_1186",
  "hwg_bg2_1187": "hwg_bg2_1187",
  "hwg_bg2_1188": "hwg_bg2_1188",
  "hwg_bg2_1189": "hwg_bg2_1189",
  "hwg_bg2_1190": "hwg_bg2_1190",
  "hwg_bg2_1191": "hwg_bg2_1191",
  "hwg_bg2_1192": "hwg_bg2_1192",
  "hwg_bg2_1193": "hwg_bg2_1193",
  "hwg_bg2_1194": "hwg_bg2_1194",
  "hwg_bg2_1195": "hwg_bg2_1195",
  "hwg_bg2_1196": "hwg_bg2_1196",
  "hwg_bg2_1197": "hwg_bg2_1197",
  "hwg_bg2_1198": "hwg_bg2_1198",
  "hwg_bg2_1199": "hwg_bg2_1199",
  "hwg_bg2_1200": "hwg_bg2_1200",
  "hwg_bg2_1201": "hwg_bg2_1201",
  "hwg_bg2_1202": "hwg_bg2_1202",
  "hwg_bg2_1203": "hwg_bg2_1203",
  "hwg_bg2_1204": "hwg_bg2_1204",
  "hwg_bg2_1205": "hwg_bg2_1205",
  "hwg_bg2_1206": "hwg_bg2_1206",
  "hwg_bg2_1207": "hwg_bg2_1207",
  "hwg_bg2_1208": "hwg_bg2_1208",
  "hwg_bg2_1209": "hwg_bg2_1209",
  "hwg_bg2_1210": "hwg_bg2_1210",
  "hwg_bg2_1211": "hwg_bg2_1211",
  "hwg_bg2_1212": "hwg_bg2_1212",
  "hwg_bg2_1213": "hwg_bg2_1213",
  "hwg_bg2_1214": "hwg_bg2_1214",
  "hwg_bg2_1215": "hwg_bg2_1215",
  "hwg_bg2_1216": "hwg_bg2_1216",
  "hwg_bg2_1217": "hwg_bg2_1217",
  "hwg_bg2_1218": "hwg_bg2_1218",
  "hwg_bg2_1219": "hwg_bg2_1219",
  "hwg_bg2_1220": "hwg_bg2_1220",
  "hwg_bg2_1221": "hwg_bg2_1221",
  "hwg_bg2_1222": "hwg_bg2_1222",
  "hwg_bg2_1223": "hwg_bg2_1223",
  "hwg_bg2_1224": "hwg_bg2_1224",
  "hwg_bg2_1225": "hwg_bg2_1225",
  "hwg_bg2_1226": "hwg_bg2_1226",
  "hwg_bg2_1227": "hwg_bg2_1227",
  "hwg_bg2_1228": "hwg_bg2_1228",
  "hwg_bg2_1229": "hwg_bg2_1229",
  "hwg_bg2_1230": "hwg_bg2_1230",
  "hwg_bg2_1231": "hwg_bg2_1231",
  "hwg_bg2_1232": "hwg_bg2_1232",
  "hwg_bg2_1233": "hwg_bg2_1233",
  "hwg_bg2_1234": "hwg_bg2_1234",
  "hwg_bg2_1235": "hwg_bg2_1235",
  "hwg_bg2_1236": "hwg_bg2_1236",
  "hwg_bg2_1237": "hwg_bg2_1237",
  "hwg_bg2_1238": "hwg_bg2_1238",
  "hwg_bg2_1239": "hwg_bg2_1239",
  "hwg_bg2_1240": "hwg_bg2_1240",
  "hwg_bg2_1241": "hwg_bg2_1241",
  "hwg_bg2_1242": "hwg_bg2_1242",
  "hwg_bg2_1243": "hwg_bg2_1243",
  "hwg_bg2_1244": "hwg_bg2_1244",
  "hwg_bg2_1245": "hwg_bg2_1245",
  "hwg_bg2_1246": "hwg_bg2_1246",
  "hwg_bg2_1247": "hwg_bg2_1247",
  "hwg_bg2_1248": "hwg_bg2_1248",
  "hwg_bg2_1249": "hwg_bg2_1249",
  "hwg_bg2_1250": "hwg_bg2_1250",
  "hwg_bg2_1251": "hwg_bg2_1251",
  "hwg_bg2_1252": "hwg_bg2_1252",
  "hwg_bg2_1253": "hwg_bg2_1253",
  "hwg_bg2_1254": "hwg_bg2_1254",
  "hwg_bg2_1255": "hwg_bg2_1255",
  "hwg_bg2_1256": "hwg_bg2_1256",
  "hwg_bg2_1257": "hwg_bg2_1257",
  "hwg_bg2_1258": "hwg_bg2_1258",
  "hwg_bg2_1259": "hwg_bg2_1259",
  "hwg_bg2_1260": "hwg_bg2_1260",
  "hwg_bg2_1261": "hwg_bg2_1261",
  "hwg_bg2_1262": "hwg_bg2_1262",
  "hwg_bg2_1263": "hwg_bg2_1263",
  "hwg_bg2_1264": "hwg_bg2_1264",
  "hwg_bg2_1265": "hwg_bg2_1265",
  "hwg_bg2_1266": "hwg_bg2_1266",
  "hwg_bg2_1267": "hwg_bg2_1267",
  "hwg_bg2_1268": "hwg_bg2_1268",
  "hwg_bg2_1269": "hwg_bg2_1269",
  "hwg_bg2_1270": "hwg_bg2_1270",
  "hwg_bg2_1271": "hwg_bg2_1271",
  "hwg_bg2_1272": "hwg_bg2_1272",
  "hwg_bg2_1273": "hwg_bg2_1273",
  "hwg_bg2_1274": "hwg_bg2_1274",
  "hwg_bg2_1275": "hwg_bg2_1275",
  "hwg_bg2_1276": "hwg_bg2_1276",
  "hwg_bg2_1277": "hwg_bg2_1277",
  "hwg_bg2_1278": "hwg_bg2_1278",
  "hwg_bg2_1279": "hwg_bg2_1279",
  "hwg_bg2_1280": "hwg_bg2_1280",
  "hwg_bg2_1281": "hwg_bg2_1281",
  "hwg_bg2_1282": "hwg_bg2_1282",
  "hwg_bg2_1283": "hwg_bg2_1283",
  "hwg_bg2_1284": "hwg_bg2_1284",
  "hwg_bg2_1285": "hwg_bg2_1285",
  "hwg_bg2_1286": "hwg_bg2_1286",
  "hwg_bg2_1287": "hwg_bg2_1287",
  "hwg_bg2_1288": "hwg_bg2_1288",
  "hwg_bg2_1289": "hwg_bg2_1289",
  "hwg_b1_exp_5137": "hwg_b1_exp_5137",
  "hwg_b1_exp_5001": "hwg_b1_exp_5137",
  "hwg_b1_exp_5035": "hwg_b1_exp_5137",
  "hwg_b1_exp_5069": "hwg_b1_exp_5137",
  "hwg_b1_exp_5103": "hwg_b1_exp_5137",
  "hwg_b1_exp_5171": "hwg_b1_exp_5137",
  "hwg_b1_exp_5205": "hwg_b1_exp_5137",
  "hwg_b1_exp_5239": "hwg_b1_exp_5137",
  "hwg_b1_exp_5138": "hwg_b1_exp_5138",
  "hwg_b1_exp_5002": "hwg_b1_exp_5138",
  "hwg_b1_exp_5036": "hwg_b1_exp_5138",
  "hwg_b1_exp_5070": "hwg_b1_exp_5138",
  "hwg_b1_exp_5104": "hwg_b1_exp_5138",
  "hwg_b1_exp_5172": "hwg_b1_exp_5138",
  "hwg_b1_exp_5206": "hwg_b1_exp_5138",
  "hwg_b1_exp_5240": "hwg_b1_exp_5138",
  "hwg_b1_exp_5139": "hwg_b1_exp_5139",
  "hwg_b1_exp_5003": "hwg_b1_exp_5139",
  "hwg_b1_exp_5037": "hwg_b1_exp_5139",
  "hwg_b1_exp_5071": "hwg_b1_exp_5139",
  "hwg_b1_exp_5105": "hwg_b1_exp_5139",
  "hwg_b1_exp_5173": "hwg_b1_exp_5139",
  "hwg_b1_exp_5207": "hwg_b1_exp_5139",
  "hwg_b1_exp_5241": "hwg_b1_exp_5139",
  "hwg_b1_exp_5140": "hwg_b1_exp_5140",
  "hwg_b1_exp_5004": "hwg_b1_exp_5140",
  "hwg_b1_exp_5038": "hwg_b1_exp_5140",
  "hwg_b1_exp_5072": "hwg_b1_exp_5140",
  "hwg_b1_exp_5106": "hwg_b1_exp_5140",
  "hwg_b1_exp_5174": "hwg_b1_exp_5140",
  "hwg_b1_exp_5208": "hwg_b1_exp_5140",
  "hwg_b1_exp_5242": "hwg_b1_exp_5140",
  "hwg_b1_exp_5141": "hwg_b1_exp_5141",
  "hwg_b1_exp_5005": "hwg_b1_exp_5141",
  "hwg_b1_exp_5039": "hwg_b1_exp_5141",
  "hwg_b1_exp_5073": "hwg_b1_exp_5141",
  "hwg_b1_exp_5107": "hwg_b1_exp_5141",
  "hwg_b1_exp_5175": "hwg_b1_exp_5141",
  "hwg_b1_exp_5209": "hwg_b1_exp_5141",
  "hwg_b1_exp_5243": "hwg_b1_exp_5141",
  "hwg_b1_exp_5142": "hwg_b1_exp_5142",
  "hwg_b1_exp_5006": "hwg_b1_exp_5142",
  "hwg_b1_exp_5040": "hwg_b1_exp_5142",
  "hwg_b1_exp_5074": "hwg_b1_exp_5142",
  "hwg_b1_exp_5108": "hwg_b1_exp_5142",
  "hwg_b1_exp_5176": "hwg_b1_exp_5142",
  "hwg_b1_exp_5210": "hwg_b1_exp_5142",
  "hwg_b1_exp_5244": "hwg_b1_exp_5142",
  "hwg_b1_exp_5143": "hwg_b1_exp_5143",
  "hwg_b1_exp_5007": "hwg_b1_exp_5143",
  "hwg_b1_exp_5041": "hwg_b1_exp_5143",
  "hwg_b1_exp_5075": "hwg_b1_exp_5143",
  "hwg_b1_exp_5109": "hwg_b1_exp_5143",
  "hwg_b1_exp_5177": "hwg_b1_exp_5143",
  "hwg_b1_exp_5211": "hwg_b1_exp_5143",
  "hwg_b1_exp_5245": "hwg_b1_exp_5143",
  "hwg_b1_exp_5144": "hwg_b1_exp_5144",
  "hwg_b1_exp_5008": "hwg_b1_exp_5144",
  "hwg_b1_exp_5042": "hwg_b1_exp_5144",
  "hwg_b1_exp_5076": "hwg_b1_exp_5144",
  "hwg_b1_exp_5110": "hwg_b1_exp_5144",
  "hwg_b1_exp_5178": "hwg_b1_exp_5144",
  "hwg_b1_exp_5212": "hwg_b1_exp_5144",
  "hwg_b1_exp_5246": "hwg_b1_exp_5144",
  "hwg_b1_exp_5179": "hwg_b1_exp_5179",
  "hwg_b1_exp_5009": "hwg_b1_exp_5179",
  "hwg_b1_exp_5043": "hwg_b1_exp_5179",
  "hwg_b1_exp_5077": "hwg_b1_exp_5179",
  "hwg_b1_exp_5111": "hwg_b1_exp_5179",
  "hwg_b1_exp_5145": "hwg_b1_exp_5179",
  "hwg_b1_exp_5213": "hwg_b1_exp_5179",
  "hwg_b1_exp_5247": "hwg_b1_exp_5179",
  "hwg_b1_exp_5180": "hwg_b1_exp_5180",
  "hwg_b1_exp_5010": "hwg_b1_exp_5180",
  "hwg_b1_exp_5044": "hwg_b1_exp_5180",
  "hwg_b1_exp_5078": "hwg_b1_exp_5180",
  "hwg_b1_exp_5112": "hwg_b1_exp_5180",
  "hwg_b1_exp_5146": "hwg_b1_exp_5180",
  "hwg_b1_exp_5214": "hwg_b1_exp_5180",
  "hwg_b1_exp_5248": "hwg_b1_exp_5180",
  "hwg_b1_exp_5181": "hwg_b1_exp_5181",
  "hwg_b1_exp_5011": "hwg_b1_exp_5181",
  "hwg_b1_exp_5045": "hwg_b1_exp_5181",
  "hwg_b1_exp_5079": "hwg_b1_exp_5181",
  "hwg_b1_exp_5113": "hwg_b1_exp_5181",
  "hwg_b1_exp_5147": "hwg_b1_exp_5181",
  "hwg_b1_exp_5215": "hwg_b1_exp_5181",
  "hwg_b1_exp_5249": "hwg_b1_exp_5181",
  "hwg_b1_exp_5182": "hwg_b1_exp_5182",
  "hwg_b1_exp_5012": "hwg_b1_exp_5182",
  "hwg_b1_exp_5046": "hwg_b1_exp_5182",
  "hwg_b1_exp_5080": "hwg_b1_exp_5182",
  "hwg_b1_exp_5114": "hwg_b1_exp_5182",
  "hwg_b1_exp_5148": "hwg_b1_exp_5182",
  "hwg_b1_exp_5216": "hwg_b1_exp_5182",
  "hwg_b1_exp_5250": "hwg_b1_exp_5182",
  "hwg_b1_exp_5183": "hwg_b1_exp_5183",
  "hwg_b1_exp_5013": "hwg_b1_exp_5183",
  "hwg_b1_exp_5047": "hwg_b1_exp_5183",
  "hwg_b1_exp_5081": "hwg_b1_exp_5183",
  "hwg_b1_exp_5115": "hwg_b1_exp_5183",
  "hwg_b1_exp_5149": "hwg_b1_exp_5183",
  "hwg_b1_exp_5217": "hwg_b1_exp_5183",
  "hwg_b1_exp_5251": "hwg_b1_exp_5183",
  "hwg_b1_exp_5184": "hwg_b1_exp_5184",
  "hwg_b1_exp_5014": "hwg_b1_exp_5184",
  "hwg_b1_exp_5048": "hwg_b1_exp_5184",
  "hwg_b1_exp_5082": "hwg_b1_exp_5184",
  "hwg_b1_exp_5116": "hwg_b1_exp_5184",
  "hwg_b1_exp_5150": "hwg_b1_exp_5184",
  "hwg_b1_exp_5218": "hwg_b1_exp_5184",
  "hwg_b1_exp_5252": "hwg_b1_exp_5184",
  "hwg_b1_exp_5185": "hwg_b1_exp_5185",
  "hwg_b1_exp_5015": "hwg_b1_exp_5185",
  "hwg_b1_exp_5049": "hwg_b1_exp_5185",
  "hwg_b1_exp_5083": "hwg_b1_exp_5185",
  "hwg_b1_exp_5117": "hwg_b1_exp_5185",
  "hwg_b1_exp_5151": "hwg_b1_exp_5185",
  "hwg_b1_exp_5219": "hwg_b1_exp_5185",
  "hwg_b1_exp_5253": "hwg_b1_exp_5185",
  "hwg_b1_exp_5186": "hwg_b1_exp_5186",
  "hwg_b1_exp_5016": "hwg_b1_exp_5186",
  "hwg_b1_exp_5050": "hwg_b1_exp_5186",
  "hwg_b1_exp_5084": "hwg_b1_exp_5186",
  "hwg_b1_exp_5118": "hwg_b1_exp_5186",
  "hwg_b1_exp_5152": "hwg_b1_exp_5186",
  "hwg_b1_exp_5220": "hwg_b1_exp_5186",
  "hwg_b1_exp_5254": "hwg_b1_exp_5186",
  "hwg_b1_exp_5017": "hwg_b1_exp_5017",
  "hwg_b1_exp_5051": "hwg_b1_exp_5017",
  "hwg_b1_exp_5085": "hwg_b1_exp_5017",
  "hwg_b1_exp_5119": "hwg_b1_exp_5017",
  "hwg_b1_exp_5153": "hwg_b1_exp_5017",
  "hwg_b1_exp_5187": "hwg_b1_exp_5017",
  "hwg_b1_exp_5221": "hwg_b1_exp_5017",
  "hwg_b1_exp_5255": "hwg_b1_exp_5017",
  "hwg_b1_exp_5018": "hwg_b1_exp_5018",
  "hwg_b1_exp_5052": "hwg_b1_exp_5018",
  "hwg_b1_exp_5086": "hwg_b1_exp_5018",
  "hwg_b1_exp_5120": "hwg_b1_exp_5018",
  "hwg_b1_exp_5154": "hwg_b1_exp_5018",
  "hwg_b1_exp_5188": "hwg_b1_exp_5018",
  "hwg_b1_exp_5222": "hwg_b1_exp_5018",
  "hwg_b1_exp_5256": "hwg_b1_exp_5018",
  "hwg_b1_exp_5019": "hwg_b1_exp_5019",
  "hwg_b1_exp_5053": "hwg_b1_exp_5019",
  "hwg_b1_exp_5087": "hwg_b1_exp_5019",
  "hwg_b1_exp_5121": "hwg_b1_exp_5019",
  "hwg_b1_exp_5155": "hwg_b1_exp_5019",
  "hwg_b1_exp_5189": "hwg_b1_exp_5019",
  "hwg_b1_exp_5223": "hwg_b1_exp_5019",
  "hwg_b1_exp_5257": "hwg_b1_exp_5019",
  "hwg_b1_exp_5020": "hwg_b1_exp_5020",
  "hwg_b1_exp_5054": "hwg_b1_exp_5020",
  "hwg_b1_exp_5088": "hwg_b1_exp_5020",
  "hwg_b1_exp_5122": "hwg_b1_exp_5020",
  "hwg_b1_exp_5156": "hwg_b1_exp_5020",
  "hwg_b1_exp_5190": "hwg_b1_exp_5020",
  "hwg_b1_exp_5224": "hwg_b1_exp_5020",
  "hwg_b1_exp_5258": "hwg_b1_exp_5020",
  "hwg_b1_exp_5021": "hwg_b1_exp_5021",
  "hwg_b1_exp_5055": "hwg_b1_exp_5021",
  "hwg_b1_exp_5089": "hwg_b1_exp_5021",
  "hwg_b1_exp_5123": "hwg_b1_exp_5021",
  "hwg_b1_exp_5157": "hwg_b1_exp_5021",
  "hwg_b1_exp_5191": "hwg_b1_exp_5021",
  "hwg_b1_exp_5225": "hwg_b1_exp_5021",
  "hwg_b1_exp_5259": "hwg_b1_exp_5021",
  "hwg_b1_exp_5090": "hwg_b1_exp_5090",
  "hwg_b1_exp_5022": "hwg_b1_exp_5090",
  "hwg_b1_exp_5056": "hwg_b1_exp_5090",
  "hwg_b1_exp_5124": "hwg_b1_exp_5090",
  "hwg_b1_exp_5158": "hwg_b1_exp_5090",
  "hwg_b1_exp_5192": "hwg_b1_exp_5090",
  "hwg_b1_exp_5226": "hwg_b1_exp_5090",
  "hwg_b1_exp_5260": "hwg_b1_exp_5090",
  "hwg_b1_exp_5091": "hwg_b1_exp_5091",
  "hwg_b1_exp_5023": "hwg_b1_exp_5091",
  "hwg_b1_exp_5057": "hwg_b1_exp_5091",
  "hwg_b1_exp_5125": "hwg_b1_exp_5091",
  "hwg_b1_exp_5159": "hwg_b1_exp_5091",
  "hwg_b1_exp_5193": "hwg_b1_exp_5091",
  "hwg_b1_exp_5227": "hwg_b1_exp_5091",
  "hwg_b1_exp_5261": "hwg_b1_exp_5091",
  "hwg_b1_exp_5092": "hwg_b1_exp_5092",
  "hwg_b1_exp_5024": "hwg_b1_exp_5092",
  "hwg_b1_exp_5058": "hwg_b1_exp_5092",
  "hwg_b1_exp_5126": "hwg_b1_exp_5092",
  "hwg_b1_exp_5160": "hwg_b1_exp_5092",
  "hwg_b1_exp_5194": "hwg_b1_exp_5092",
  "hwg_b1_exp_5228": "hwg_b1_exp_5092",
  "hwg_b1_exp_5262": "hwg_b1_exp_5092",
  "hwg_b1_exp_5093": "hwg_b1_exp_5093",
  "hwg_b1_exp_5025": "hwg_b1_exp_5093",
  "hwg_b1_exp_5059": "hwg_b1_exp_5093",
  "hwg_b1_exp_5127": "hwg_b1_exp_5093",
  "hwg_b1_exp_5161": "hwg_b1_exp_5093",
  "hwg_b1_exp_5195": "hwg_b1_exp_5093",
  "hwg_b1_exp_5229": "hwg_b1_exp_5093",
  "hwg_b1_exp_5263": "hwg_b1_exp_5093",
  "hwg_b1_exp_5094": "hwg_b1_exp_5094",
  "hwg_b1_exp_5026": "hwg_b1_exp_5094",
  "hwg_b1_exp_5060": "hwg_b1_exp_5094",
  "hwg_b1_exp_5128": "hwg_b1_exp_5094",
  "hwg_b1_exp_5162": "hwg_b1_exp_5094",
  "hwg_b1_exp_5196": "hwg_b1_exp_5094",
  "hwg_b1_exp_5230": "hwg_b1_exp_5094",
  "hwg_b1_exp_5264": "hwg_b1_exp_5094",
  "hwg_b1_exp_5163": "hwg_b1_exp_5163",
  "hwg_b1_exp_5027": "hwg_b1_exp_5163",
  "hwg_b1_exp_5061": "hwg_b1_exp_5163",
  "hwg_b1_exp_5095": "hwg_b1_exp_5163",
  "hwg_b1_exp_5129": "hwg_b1_exp_5163",
  "hwg_b1_exp_5197": "hwg_b1_exp_5163",
  "hwg_b1_exp_5231": "hwg_b1_exp_5163",
  "hwg_b1_exp_5265": "hwg_b1_exp_5163",
  "hwg_b1_exp_5164": "hwg_b1_exp_5164",
  "hwg_b1_exp_5028": "hwg_b1_exp_5164",
  "hwg_b1_exp_5062": "hwg_b1_exp_5164",
  "hwg_b1_exp_5096": "hwg_b1_exp_5164",
  "hwg_b1_exp_5130": "hwg_b1_exp_5164",
  "hwg_b1_exp_5198": "hwg_b1_exp_5164",
  "hwg_b1_exp_5232": "hwg_b1_exp_5164",
  "hwg_b1_exp_5266": "hwg_b1_exp_5164",
  "hwg_b1_exp_5165": "hwg_b1_exp_5165",
  "hwg_b1_exp_5029": "hwg_b1_exp_5165",
  "hwg_b1_exp_5063": "hwg_b1_exp_5165",
  "hwg_b1_exp_5097": "hwg_b1_exp_5165",
  "hwg_b1_exp_5131": "hwg_b1_exp_5165",
  "hwg_b1_exp_5199": "hwg_b1_exp_5165",
  "hwg_b1_exp_5233": "hwg_b1_exp_5165",
  "hwg_b1_exp_5267": "hwg_b1_exp_5165",
  "hwg_b1_exp_5166": "hwg_b1_exp_5166",
  "hwg_b1_exp_5030": "hwg_b1_exp_5166",
  "hwg_b1_exp_5064": "hwg_b1_exp_5166",
  "hwg_b1_exp_5098": "hwg_b1_exp_5166",
  "hwg_b1_exp_5132": "hwg_b1_exp_5166",
  "hwg_b1_exp_5200": "hwg_b1_exp_5166",
  "hwg_b1_exp_5234": "hwg_b1_exp_5166",
  "hwg_b1_exp_5268": "hwg_b1_exp_5166",
  "hwg_b1_exp_5167": "hwg_b1_exp_5167",
  "hwg_b1_exp_5031": "hwg_b1_exp_5167",
  "hwg_b1_exp_5065": "hwg_b1_exp_5167",
  "hwg_b1_exp_5099": "hwg_b1_exp_5167",
  "hwg_b1_exp_5133": "hwg_b1_exp_5167",
  "hwg_b1_exp_5201": "hwg_b1_exp_5167",
  "hwg_b1_exp_5235": "hwg_b1_exp_5167",
  "hwg_b1_exp_5269": "hwg_b1_exp_5167",
  "hwg_b1_exp_5168": "hwg_b1_exp_5168",
  "hwg_b1_exp_5032": "hwg_b1_exp_5168",
  "hwg_b1_exp_5066": "hwg_b1_exp_5168",
  "hwg_b1_exp_5100": "hwg_b1_exp_5168",
  "hwg_b1_exp_5134": "hwg_b1_exp_5168",
  "hwg_b1_exp_5202": "hwg_b1_exp_5168",
  "hwg_b1_exp_5236": "hwg_b1_exp_5168",
  "hwg_b1_exp_5270": "hwg_b1_exp_5168",
  "hwg_b1_exp_5169": "hwg_b1_exp_5169",
  "hwg_b1_exp_5033": "hwg_b1_exp_5169",
  "hwg_b1_exp_5067": "hwg_b1_exp_5169",
  "hwg_b1_exp_5101": "hwg_b1_exp_5169",
  "hwg_b1_exp_5135": "hwg_b1_exp_5169",
  "hwg_b1_exp_5203": "hwg_b1_exp_5169",
  "hwg_b1_exp_5237": "hwg_b1_exp_5169",
  "hwg_b1_exp_5271": "hwg_b1_exp_5169",
  "hwg_b1_exp_5170": "hwg_b1_exp_5170",
  "hwg_b1_exp_5034": "hwg_b1_exp_5170",
  "hwg_b1_exp_5068": "hwg_b1_exp_5170",
  "hwg_b1_exp_5102": "hwg_b1_exp_5170",
  "hwg_b1_exp_5136": "hwg_b1_exp_5170",
  "hwg_b1_exp_5204": "hwg_b1_exp_5170",
  "hwg_b1_exp_5238": "hwg_b1_exp_5170",
  "hwg_b1_exp_5272": "hwg_b1_exp_5170",
  "hwg_b2_exp_5305": "hwg_b2_exp_5305",
  "hwg_b2_exp_5273": "hwg_b2_exp_5305",
  "hwg_b2_exp_5337": "hwg_b2_exp_5305",
  "hwg_b2_exp_5369": "hwg_b2_exp_5305",
  "hwg_b2_exp_5401": "hwg_b2_exp_5305",
  "hwg_b2_exp_5433": "hwg_b2_exp_5305",
  "hwg_b2_exp_5465": "hwg_b2_exp_5305",
  "hwg_b2_exp_5497": "hwg_b2_exp_5305",
  "hwg_b2_exp_5306": "hwg_b2_exp_5306",
  "hwg_b2_exp_5274": "hwg_b2_exp_5306",
  "hwg_b2_exp_5338": "hwg_b2_exp_5306",
  "hwg_b2_exp_5370": "hwg_b2_exp_5306",
  "hwg_b2_exp_5402": "hwg_b2_exp_5306",
  "hwg_b2_exp_5434": "hwg_b2_exp_5306",
  "hwg_b2_exp_5466": "hwg_b2_exp_5306",
  "hwg_b2_exp_5498": "hwg_b2_exp_5306",
  "hwg_b2_exp_5307": "hwg_b2_exp_5307",
  "hwg_b2_exp_5275": "hwg_b2_exp_5307",
  "hwg_b2_exp_5339": "hwg_b2_exp_5307",
  "hwg_b2_exp_5371": "hwg_b2_exp_5307",
  "hwg_b2_exp_5403": "hwg_b2_exp_5307",
  "hwg_b2_exp_5435": "hwg_b2_exp_5307",
  "hwg_b2_exp_5467": "hwg_b2_exp_5307",
  "hwg_b2_exp_5499": "hwg_b2_exp_5307",
  "hwg_b2_exp_5308": "hwg_b2_exp_5308",
  "hwg_b2_exp_5276": "hwg_b2_exp_5308",
  "hwg_b2_exp_5340": "hwg_b2_exp_5308",
  "hwg_b2_exp_5372": "hwg_b2_exp_5308",
  "hwg_b2_exp_5404": "hwg_b2_exp_5308",
  "hwg_b2_exp_5436": "hwg_b2_exp_5308",
  "hwg_b2_exp_5468": "hwg_b2_exp_5308",
  "hwg_b2_exp_5500": "hwg_b2_exp_5308",
  "hwg_b2_exp_5309": "hwg_b2_exp_5309",
  "hwg_b2_exp_5277": "hwg_b2_exp_5309",
  "hwg_b2_exp_5341": "hwg_b2_exp_5309",
  "hwg_b2_exp_5373": "hwg_b2_exp_5309",
  "hwg_b2_exp_5405": "hwg_b2_exp_5309",
  "hwg_b2_exp_5437": "hwg_b2_exp_5309",
  "hwg_b2_exp_5469": "hwg_b2_exp_5309",
  "hwg_b2_exp_5501": "hwg_b2_exp_5309",
  "hwg_b2_exp_5310": "hwg_b2_exp_5310",
  "hwg_b2_exp_5278": "hwg_b2_exp_5310",
  "hwg_b2_exp_5342": "hwg_b2_exp_5310",
  "hwg_b2_exp_5374": "hwg_b2_exp_5310",
  "hwg_b2_exp_5406": "hwg_b2_exp_5310",
  "hwg_b2_exp_5438": "hwg_b2_exp_5310",
  "hwg_b2_exp_5470": "hwg_b2_exp_5310",
  "hwg_b2_exp_5502": "hwg_b2_exp_5310",
  "hwg_b2_exp_5311": "hwg_b2_exp_5311",
  "hwg_b2_exp_5279": "hwg_b2_exp_5311",
  "hwg_b2_exp_5343": "hwg_b2_exp_5311",
  "hwg_b2_exp_5375": "hwg_b2_exp_5311",
  "hwg_b2_exp_5407": "hwg_b2_exp_5311",
  "hwg_b2_exp_5439": "hwg_b2_exp_5311",
  "hwg_b2_exp_5471": "hwg_b2_exp_5311",
  "hwg_b2_exp_5503": "hwg_b2_exp_5311",
  "hwg_b2_exp_5344": "hwg_b2_exp_5344",
  "hwg_b2_exp_5280": "hwg_b2_exp_5344",
  "hwg_b2_exp_5312": "hwg_b2_exp_5344",
  "hwg_b2_exp_5376": "hwg_b2_exp_5344",
  "hwg_b2_exp_5408": "hwg_b2_exp_5344",
  "hwg_b2_exp_5440": "hwg_b2_exp_5344",
  "hwg_b2_exp_5472": "hwg_b2_exp_5344",
  "hwg_b2_exp_5504": "hwg_b2_exp_5344",
  "hwg_b2_exp_5345": "hwg_b2_exp_5345",
  "hwg_b2_exp_5281": "hwg_b2_exp_5345",
  "hwg_b2_exp_5313": "hwg_b2_exp_5345",
  "hwg_b2_exp_5377": "hwg_b2_exp_5345",
  "hwg_b2_exp_5409": "hwg_b2_exp_5345",
  "hwg_b2_exp_5441": "hwg_b2_exp_5345",
  "hwg_b2_exp_5473": "hwg_b2_exp_5345",
  "hwg_b2_exp_5505": "hwg_b2_exp_5345",
  "hwg_b2_exp_5346": "hwg_b2_exp_5346",
  "hwg_b2_exp_5282": "hwg_b2_exp_5346",
  "hwg_b2_exp_5314": "hwg_b2_exp_5346",
  "hwg_b2_exp_5378": "hwg_b2_exp_5346",
  "hwg_b2_exp_5410": "hwg_b2_exp_5346",
  "hwg_b2_exp_5442": "hwg_b2_exp_5346",
  "hwg_b2_exp_5474": "hwg_b2_exp_5346",
  "hwg_b2_exp_5506": "hwg_b2_exp_5346",
  "hwg_b2_exp_5347": "hwg_b2_exp_5347",
  "hwg_b2_exp_5283": "hwg_b2_exp_5347",
  "hwg_b2_exp_5315": "hwg_b2_exp_5347",
  "hwg_b2_exp_5379": "hwg_b2_exp_5347",
  "hwg_b2_exp_5411": "hwg_b2_exp_5347",
  "hwg_b2_exp_5443": "hwg_b2_exp_5347",
  "hwg_b2_exp_5475": "hwg_b2_exp_5347",
  "hwg_b2_exp_5507": "hwg_b2_exp_5347",
  "hwg_b2_exp_5348": "hwg_b2_exp_5348",
  "hwg_b2_exp_5284": "hwg_b2_exp_5348",
  "hwg_b2_exp_5316": "hwg_b2_exp_5348",
  "hwg_b2_exp_5380": "hwg_b2_exp_5348",
  "hwg_b2_exp_5412": "hwg_b2_exp_5348",
  "hwg_b2_exp_5444": "hwg_b2_exp_5348",
  "hwg_b2_exp_5476": "hwg_b2_exp_5348",
  "hwg_b2_exp_5508": "hwg_b2_exp_5348",
  "hwg_b2_exp_5413": "hwg_b2_exp_5413",
  "hwg_b2_exp_5285": "hwg_b2_exp_5413",
  "hwg_b2_exp_5317": "hwg_b2_exp_5413",
  "hwg_b2_exp_5349": "hwg_b2_exp_5413",
  "hwg_b2_exp_5381": "hwg_b2_exp_5413",
  "hwg_b2_exp_5445": "hwg_b2_exp_5413",
  "hwg_b2_exp_5477": "hwg_b2_exp_5413",
  "hwg_b2_exp_5509": "hwg_b2_exp_5413",
  "hwg_b2_exp_5414": "hwg_b2_exp_5414",
  "hwg_b2_exp_5286": "hwg_b2_exp_5414",
  "hwg_b2_exp_5318": "hwg_b2_exp_5414",
  "hwg_b2_exp_5350": "hwg_b2_exp_5414",
  "hwg_b2_exp_5382": "hwg_b2_exp_5414",
  "hwg_b2_exp_5446": "hwg_b2_exp_5414",
  "hwg_b2_exp_5478": "hwg_b2_exp_5414",
  "hwg_b2_exp_5510": "hwg_b2_exp_5414",
  "hwg_b2_exp_5415": "hwg_b2_exp_5415",
  "hwg_b2_exp_5287": "hwg_b2_exp_5415",
  "hwg_b2_exp_5319": "hwg_b2_exp_5415",
  "hwg_b2_exp_5351": "hwg_b2_exp_5415",
  "hwg_b2_exp_5383": "hwg_b2_exp_5415",
  "hwg_b2_exp_5447": "hwg_b2_exp_5415",
  "hwg_b2_exp_5479": "hwg_b2_exp_5415",
  "hwg_b2_exp_5511": "hwg_b2_exp_5415",
  "hwg_b2_exp_5416": "hwg_b2_exp_5416",
  "hwg_b2_exp_5288": "hwg_b2_exp_5416",
  "hwg_b2_exp_5320": "hwg_b2_exp_5416",
  "hwg_b2_exp_5352": "hwg_b2_exp_5416",
  "hwg_b2_exp_5384": "hwg_b2_exp_5416",
  "hwg_b2_exp_5448": "hwg_b2_exp_5416",
  "hwg_b2_exp_5480": "hwg_b2_exp_5416",
  "hwg_b2_exp_5512": "hwg_b2_exp_5416",
  "hwg_b2_exp_5417": "hwg_b2_exp_5417",
  "hwg_b2_exp_5289": "hwg_b2_exp_5417",
  "hwg_b2_exp_5321": "hwg_b2_exp_5417",
  "hwg_b2_exp_5353": "hwg_b2_exp_5417",
  "hwg_b2_exp_5385": "hwg_b2_exp_5417",
  "hwg_b2_exp_5449": "hwg_b2_exp_5417",
  "hwg_b2_exp_5481": "hwg_b2_exp_5417",
  "hwg_b2_exp_5513": "hwg_b2_exp_5417",
  "hwg_b2_exp_5418": "hwg_b2_exp_5418",
  "hwg_b2_exp_5290": "hwg_b2_exp_5418",
  "hwg_b2_exp_5322": "hwg_b2_exp_5418",
  "hwg_b2_exp_5354": "hwg_b2_exp_5418",
  "hwg_b2_exp_5386": "hwg_b2_exp_5418",
  "hwg_b2_exp_5450": "hwg_b2_exp_5418",
  "hwg_b2_exp_5482": "hwg_b2_exp_5418",
  "hwg_b2_exp_5514": "hwg_b2_exp_5418",
  "hwg_b2_exp_5451": "hwg_b2_exp_5451",
  "hwg_b2_exp_5291": "hwg_b2_exp_5451",
  "hwg_b2_exp_5323": "hwg_b2_exp_5451",
  "hwg_b2_exp_5355": "hwg_b2_exp_5451",
  "hwg_b2_exp_5387": "hwg_b2_exp_5451",
  "hwg_b2_exp_5419": "hwg_b2_exp_5451",
  "hwg_b2_exp_5483": "hwg_b2_exp_5451",
  "hwg_b2_exp_5515": "hwg_b2_exp_5451",
  "hwg_b2_exp_5452": "hwg_b2_exp_5452",
  "hwg_b2_exp_5292": "hwg_b2_exp_5452",
  "hwg_b2_exp_5324": "hwg_b2_exp_5452",
  "hwg_b2_exp_5356": "hwg_b2_exp_5452",
  "hwg_b2_exp_5388": "hwg_b2_exp_5452",
  "hwg_b2_exp_5420": "hwg_b2_exp_5452",
  "hwg_b2_exp_5484": "hwg_b2_exp_5452",
  "hwg_b2_exp_5516": "hwg_b2_exp_5452",
  "hwg_b2_exp_5453": "hwg_b2_exp_5453",
  "hwg_b2_exp_5293": "hwg_b2_exp_5453",
  "hwg_b2_exp_5325": "hwg_b2_exp_5453",
  "hwg_b2_exp_5357": "hwg_b2_exp_5453",
  "hwg_b2_exp_5389": "hwg_b2_exp_5453",
  "hwg_b2_exp_5421": "hwg_b2_exp_5453",
  "hwg_b2_exp_5485": "hwg_b2_exp_5453",
  "hwg_b2_exp_5517": "hwg_b2_exp_5453",
  "hwg_b2_exp_5454": "hwg_b2_exp_5454",
  "hwg_b2_exp_5294": "hwg_b2_exp_5454",
  "hwg_b2_exp_5326": "hwg_b2_exp_5454",
  "hwg_b2_exp_5358": "hwg_b2_exp_5454",
  "hwg_b2_exp_5390": "hwg_b2_exp_5454",
  "hwg_b2_exp_5422": "hwg_b2_exp_5454",
  "hwg_b2_exp_5486": "hwg_b2_exp_5454",
  "hwg_b2_exp_5518": "hwg_b2_exp_5454",
  "hwg_b2_exp_5455": "hwg_b2_exp_5455",
  "hwg_b2_exp_5295": "hwg_b2_exp_5455",
  "hwg_b2_exp_5327": "hwg_b2_exp_5455",
  "hwg_b2_exp_5359": "hwg_b2_exp_5455",
  "hwg_b2_exp_5391": "hwg_b2_exp_5455",
  "hwg_b2_exp_5423": "hwg_b2_exp_5455",
  "hwg_b2_exp_5487": "hwg_b2_exp_5455",
  "hwg_b2_exp_5519": "hwg_b2_exp_5455",
  "hwg_b2_exp_5456": "hwg_b2_exp_5456",
  "hwg_b2_exp_5296": "hwg_b2_exp_5456",
  "hwg_b2_exp_5328": "hwg_b2_exp_5456",
  "hwg_b2_exp_5360": "hwg_b2_exp_5456",
  "hwg_b2_exp_5392": "hwg_b2_exp_5456",
  "hwg_b2_exp_5424": "hwg_b2_exp_5456",
  "hwg_b2_exp_5488": "hwg_b2_exp_5456",
  "hwg_b2_exp_5520": "hwg_b2_exp_5456",
  "hwg_b2_exp_5329": "hwg_b2_exp_5329",
  "hwg_b2_exp_5297": "hwg_b2_exp_5329",
  "hwg_b2_exp_5361": "hwg_b2_exp_5329",
  "hwg_b2_exp_5393": "hwg_b2_exp_5329",
  "hwg_b2_exp_5425": "hwg_b2_exp_5329",
  "hwg_b2_exp_5457": "hwg_b2_exp_5329",
  "hwg_b2_exp_5489": "hwg_b2_exp_5329",
  "hwg_b2_exp_5521": "hwg_b2_exp_5329",
  "hwg_b2_exp_5330": "hwg_b2_exp_5330",
  "hwg_b2_exp_5298": "hwg_b2_exp_5330",
  "hwg_b2_exp_5362": "hwg_b2_exp_5330",
  "hwg_b2_exp_5394": "hwg_b2_exp_5330",
  "hwg_b2_exp_5426": "hwg_b2_exp_5330",
  "hwg_b2_exp_5458": "hwg_b2_exp_5330",
  "hwg_b2_exp_5490": "hwg_b2_exp_5330",
  "hwg_b2_exp_5522": "hwg_b2_exp_5330",
  "hwg_b2_exp_5331": "hwg_b2_exp_5331",
  "hwg_b2_exp_5299": "hwg_b2_exp_5331",
  "hwg_b2_exp_5363": "hwg_b2_exp_5331",
  "hwg_b2_exp_5395": "hwg_b2_exp_5331",
  "hwg_b2_exp_5427": "hwg_b2_exp_5331",
  "hwg_b2_exp_5459": "hwg_b2_exp_5331",
  "hwg_b2_exp_5491": "hwg_b2_exp_5331",
  "hwg_b2_exp_5523": "hwg_b2_exp_5331",
  "hwg_b2_exp_5332": "hwg_b2_exp_5332",
  "hwg_b2_exp_5300": "hwg_b2_exp_5332",
  "hwg_b2_exp_5364": "hwg_b2_exp_5332",
  "hwg_b2_exp_5396": "hwg_b2_exp_5332",
  "hwg_b2_exp_5428": "hwg_b2_exp_5332",
  "hwg_b2_exp_5460": "hwg_b2_exp_5332",
  "hwg_b2_exp_5492": "hwg_b2_exp_5332",
  "hwg_b2_exp_5524": "hwg_b2_exp_5332",
  "hwg_b2_exp_5333": "hwg_b2_exp_5333",
  "hwg_b2_exp_5301": "hwg_b2_exp_5333",
  "hwg_b2_exp_5365": "hwg_b2_exp_5333",
  "hwg_b2_exp_5397": "hwg_b2_exp_5333",
  "hwg_b2_exp_5429": "hwg_b2_exp_5333",
  "hwg_b2_exp_5461": "hwg_b2_exp_5333",
  "hwg_b2_exp_5493": "hwg_b2_exp_5333",
  "hwg_b2_exp_5525": "hwg_b2_exp_5333",
  "hwg_b2_exp_5334": "hwg_b2_exp_5334",
  "hwg_b2_exp_5302": "hwg_b2_exp_5334",
  "hwg_b2_exp_5366": "hwg_b2_exp_5334",
  "hwg_b2_exp_5398": "hwg_b2_exp_5334",
  "hwg_b2_exp_5430": "hwg_b2_exp_5334",
  "hwg_b2_exp_5462": "hwg_b2_exp_5334",
  "hwg_b2_exp_5494": "hwg_b2_exp_5334",
  "hwg_b2_exp_5526": "hwg_b2_exp_5334",
  "hwg_b2_exp_5335": "hwg_b2_exp_5335",
  "hwg_b2_exp_5303": "hwg_b2_exp_5335",
  "hwg_b2_exp_5367": "hwg_b2_exp_5335",
  "hwg_b2_exp_5399": "hwg_b2_exp_5335",
  "hwg_b2_exp_5431": "hwg_b2_exp_5335",
  "hwg_b2_exp_5463": "hwg_b2_exp_5335",
  "hwg_b2_exp_5495": "hwg_b2_exp_5335",
  "hwg_b2_exp_5527": "hwg_b2_exp_5335",
  "hwg_b2_exp_5368": "hwg_b2_exp_5368",
  "hwg_b2_exp_5304": "hwg_b2_exp_5368",
  "hwg_b2_exp_5336": "hwg_b2_exp_5368",
  "hwg_b2_exp_5400": "hwg_b2_exp_5368",
  "hwg_b2_exp_5432": "hwg_b2_exp_5368",
  "hwg_b2_exp_5464": "hwg_b2_exp_5368",
  "hwg_b2_exp_5496": "hwg_b2_exp_5368",
  "hwg_b2_exp_5528": "hwg_b2_exp_5368",
  "hwg_b3_exp_5585": "hwg_b3_exp_5585",
  "hwg_b3_exp_5529": "hwg_b3_exp_5585",
  "hwg_b3_exp_5557": "hwg_b3_exp_5585",
  "hwg_b3_exp_5613": "hwg_b3_exp_5585",
  "hwg_b3_exp_5641": "hwg_b3_exp_5585",
  "hwg_b3_exp_5669": "hwg_b3_exp_5585",
  "hwg_b3_exp_5697": "hwg_b3_exp_5585",
  "hwg_b3_exp_5725": "hwg_b3_exp_5585",
  "hwg_b3_exp_5586": "hwg_b3_exp_5586",
  "hwg_b3_exp_5530": "hwg_b3_exp_5586",
  "hwg_b3_exp_5558": "hwg_b3_exp_5586",
  "hwg_b3_exp_5614": "hwg_b3_exp_5586",
  "hwg_b3_exp_5642": "hwg_b3_exp_5586",
  "hwg_b3_exp_5670": "hwg_b3_exp_5586",
  "hwg_b3_exp_5698": "hwg_b3_exp_5586",
  "hwg_b3_exp_5726": "hwg_b3_exp_5586",
  "hwg_b3_exp_5587": "hwg_b3_exp_5587",
  "hwg_b3_exp_5531": "hwg_b3_exp_5587",
  "hwg_b3_exp_5559": "hwg_b3_exp_5587",
  "hwg_b3_exp_5615": "hwg_b3_exp_5587",
  "hwg_b3_exp_5643": "hwg_b3_exp_5587",
  "hwg_b3_exp_5671": "hwg_b3_exp_5587",
  "hwg_b3_exp_5699": "hwg_b3_exp_5587",
  "hwg_b3_exp_5727": "hwg_b3_exp_5587",
  "hwg_b3_exp_5588": "hwg_b3_exp_5588",
  "hwg_b3_exp_5532": "hwg_b3_exp_5588",
  "hwg_b3_exp_5560": "hwg_b3_exp_5588",
  "hwg_b3_exp_5616": "hwg_b3_exp_5588",
  "hwg_b3_exp_5644": "hwg_b3_exp_5588",
  "hwg_b3_exp_5672": "hwg_b3_exp_5588",
  "hwg_b3_exp_5700": "hwg_b3_exp_5588",
  "hwg_b3_exp_5728": "hwg_b3_exp_5588",
  "hwg_b3_exp_5589": "hwg_b3_exp_5589",
  "hwg_b3_exp_5533": "hwg_b3_exp_5589",
  "hwg_b3_exp_5561": "hwg_b3_exp_5589",
  "hwg_b3_exp_5617": "hwg_b3_exp_5589",
  "hwg_b3_exp_5645": "hwg_b3_exp_5589",
  "hwg_b3_exp_5673": "hwg_b3_exp_5589",
  "hwg_b3_exp_5701": "hwg_b3_exp_5589",
  "hwg_b3_exp_5729": "hwg_b3_exp_5589",
  "hwg_b3_exp_5646": "hwg_b3_exp_5646",
  "hwg_b3_exp_5534": "hwg_b3_exp_5646",
  "hwg_b3_exp_5562": "hwg_b3_exp_5646",
  "hwg_b3_exp_5590": "hwg_b3_exp_5646",
  "hwg_b3_exp_5618": "hwg_b3_exp_5646",
  "hwg_b3_exp_5674": "hwg_b3_exp_5646",
  "hwg_b3_exp_5702": "hwg_b3_exp_5646",
  "hwg_b3_exp_5730": "hwg_b3_exp_5646",
  "hwg_b3_exp_5647": "hwg_b3_exp_5647",
  "hwg_b3_exp_5535": "hwg_b3_exp_5647",
  "hwg_b3_exp_5563": "hwg_b3_exp_5647",
  "hwg_b3_exp_5591": "hwg_b3_exp_5647",
  "hwg_b3_exp_5619": "hwg_b3_exp_5647",
  "hwg_b3_exp_5675": "hwg_b3_exp_5647",
  "hwg_b3_exp_5703": "hwg_b3_exp_5647",
  "hwg_b3_exp_5731": "hwg_b3_exp_5647",
  "hwg_b3_exp_5648": "hwg_b3_exp_5648",
  "hwg_b3_exp_5536": "hwg_b3_exp_5648",
  "hwg_b3_exp_5564": "hwg_b3_exp_5648",
  "hwg_b3_exp_5592": "hwg_b3_exp_5648",
  "hwg_b3_exp_5620": "hwg_b3_exp_5648",
  "hwg_b3_exp_5676": "hwg_b3_exp_5648",
  "hwg_b3_exp_5704": "hwg_b3_exp_5648",
  "hwg_b3_exp_5732": "hwg_b3_exp_5648",
  "hwg_b3_exp_5649": "hwg_b3_exp_5649",
  "hwg_b3_exp_5537": "hwg_b3_exp_5649",
  "hwg_b3_exp_5565": "hwg_b3_exp_5649",
  "hwg_b3_exp_5593": "hwg_b3_exp_5649",
  "hwg_b3_exp_5621": "hwg_b3_exp_5649",
  "hwg_b3_exp_5677": "hwg_b3_exp_5649",
  "hwg_b3_exp_5705": "hwg_b3_exp_5649",
  "hwg_b3_exp_5733": "hwg_b3_exp_5649",
  "hwg_b3_exp_5650": "hwg_b3_exp_5650",
  "hwg_b3_exp_5538": "hwg_b3_exp_5650",
  "hwg_b3_exp_5566": "hwg_b3_exp_5650",
  "hwg_b3_exp_5594": "hwg_b3_exp_5650",
  "hwg_b3_exp_5622": "hwg_b3_exp_5650",
  "hwg_b3_exp_5678": "hwg_b3_exp_5650",
  "hwg_b3_exp_5706": "hwg_b3_exp_5650",
  "hwg_b3_exp_5734": "hwg_b3_exp_5650",
  "hwg_b3_exp_5651": "hwg_b3_exp_5651",
  "hwg_b3_exp_5539": "hwg_b3_exp_5651",
  "hwg_b3_exp_5567": "hwg_b3_exp_5651",
  "hwg_b3_exp_5595": "hwg_b3_exp_5651",
  "hwg_b3_exp_5623": "hwg_b3_exp_5651",
  "hwg_b3_exp_5679": "hwg_b3_exp_5651",
  "hwg_b3_exp_5707": "hwg_b3_exp_5651",
  "hwg_b3_exp_5735": "hwg_b3_exp_5651",
  "hwg_b3_exp_5652": "hwg_b3_exp_5652",
  "hwg_b3_exp_5540": "hwg_b3_exp_5652",
  "hwg_b3_exp_5568": "hwg_b3_exp_5652",
  "hwg_b3_exp_5596": "hwg_b3_exp_5652",
  "hwg_b3_exp_5624": "hwg_b3_exp_5652",
  "hwg_b3_exp_5680": "hwg_b3_exp_5652",
  "hwg_b3_exp_5708": "hwg_b3_exp_5652",
  "hwg_b3_exp_5736": "hwg_b3_exp_5652",
  "hwg_b3_exp_5681": "hwg_b3_exp_5681",
  "hwg_b3_exp_5541": "hwg_b3_exp_5681",
  "hwg_b3_exp_5569": "hwg_b3_exp_5681",
  "hwg_b3_exp_5597": "hwg_b3_exp_5681",
  "hwg_b3_exp_5625": "hwg_b3_exp_5681",
  "hwg_b3_exp_5653": "hwg_b3_exp_5681",
  "hwg_b3_exp_5709": "hwg_b3_exp_5681",
  "hwg_b3_exp_5737": "hwg_b3_exp_5681",
  "hwg_b3_exp_5682": "hwg_b3_exp_5682",
  "hwg_b3_exp_5542": "hwg_b3_exp_5682",
  "hwg_b3_exp_5570": "hwg_b3_exp_5682",
  "hwg_b3_exp_5598": "hwg_b3_exp_5682",
  "hwg_b3_exp_5626": "hwg_b3_exp_5682",
  "hwg_b3_exp_5654": "hwg_b3_exp_5682",
  "hwg_b3_exp_5710": "hwg_b3_exp_5682",
  "hwg_b3_exp_5738": "hwg_b3_exp_5682",
  "hwg_b3_exp_5683": "hwg_b3_exp_5683",
  "hwg_b3_exp_5543": "hwg_b3_exp_5683",
  "hwg_b3_exp_5571": "hwg_b3_exp_5683",
  "hwg_b3_exp_5599": "hwg_b3_exp_5683",
  "hwg_b3_exp_5627": "hwg_b3_exp_5683",
  "hwg_b3_exp_5655": "hwg_b3_exp_5683",
  "hwg_b3_exp_5711": "hwg_b3_exp_5683",
  "hwg_b3_exp_5739": "hwg_b3_exp_5683",
  "hwg_b3_exp_5684": "hwg_b3_exp_5684",
  "hwg_b3_exp_5544": "hwg_b3_exp_5684",
  "hwg_b3_exp_5572": "hwg_b3_exp_5684",
  "hwg_b3_exp_5600": "hwg_b3_exp_5684",
  "hwg_b3_exp_5628": "hwg_b3_exp_5684",
  "hwg_b3_exp_5656": "hwg_b3_exp_5684",
  "hwg_b3_exp_5712": "hwg_b3_exp_5684",
  "hwg_b3_exp_5740": "hwg_b3_exp_5684",
  "hwg_b3_exp_5685": "hwg_b3_exp_5685",
  "hwg_b3_exp_5545": "hwg_b3_exp_5685",
  "hwg_b3_exp_5573": "hwg_b3_exp_5685",
  "hwg_b3_exp_5601": "hwg_b3_exp_5685",
  "hwg_b3_exp_5629": "hwg_b3_exp_5685",
  "hwg_b3_exp_5657": "hwg_b3_exp_5685",
  "hwg_b3_exp_5713": "hwg_b3_exp_5685",
  "hwg_b3_exp_5741": "hwg_b3_exp_5685",
  "hwg_b3_exp_5686": "hwg_b3_exp_5686",
  "hwg_b3_exp_5546": "hwg_b3_exp_5686",
  "hwg_b3_exp_5574": "hwg_b3_exp_5686",
  "hwg_b3_exp_5602": "hwg_b3_exp_5686",
  "hwg_b3_exp_5630": "hwg_b3_exp_5686",
  "hwg_b3_exp_5658": "hwg_b3_exp_5686",
  "hwg_b3_exp_5714": "hwg_b3_exp_5686",
  "hwg_b3_exp_5742": "hwg_b3_exp_5686",
  "hwg_b3_exp_5687": "hwg_b3_exp_5687",
  "hwg_b3_exp_5547": "hwg_b3_exp_5687",
  "hwg_b3_exp_5575": "hwg_b3_exp_5687",
  "hwg_b3_exp_5603": "hwg_b3_exp_5687",
  "hwg_b3_exp_5631": "hwg_b3_exp_5687",
  "hwg_b3_exp_5659": "hwg_b3_exp_5687",
  "hwg_b3_exp_5715": "hwg_b3_exp_5687",
  "hwg_b3_exp_5743": "hwg_b3_exp_5687",
  "hwg_b3_exp_5688": "hwg_b3_exp_5688",
  "hwg_b3_exp_5548": "hwg_b3_exp_5688",
  "hwg_b3_exp_5576": "hwg_b3_exp_5688",
  "hwg_b3_exp_5604": "hwg_b3_exp_5688",
  "hwg_b3_exp_5632": "hwg_b3_exp_5688",
  "hwg_b3_exp_5660": "hwg_b3_exp_5688",
  "hwg_b3_exp_5716": "hwg_b3_exp_5688",
  "hwg_b3_exp_5744": "hwg_b3_exp_5688",
  "hwg_b3_exp_5605": "hwg_b3_exp_5605",
  "hwg_b3_exp_5549": "hwg_b3_exp_5605",
  "hwg_b3_exp_5577": "hwg_b3_exp_5605",
  "hwg_b3_exp_5633": "hwg_b3_exp_5605",
  "hwg_b3_exp_5661": "hwg_b3_exp_5605",
  "hwg_b3_exp_5689": "hwg_b3_exp_5605",
  "hwg_b3_exp_5717": "hwg_b3_exp_5605",
  "hwg_b3_exp_5745": "hwg_b3_exp_5605",
  "hwg_b3_exp_5606": "hwg_b3_exp_5606",
  "hwg_b3_exp_5550": "hwg_b3_exp_5606",
  "hwg_b3_exp_5578": "hwg_b3_exp_5606",
  "hwg_b3_exp_5634": "hwg_b3_exp_5606",
  "hwg_b3_exp_5662": "hwg_b3_exp_5606",
  "hwg_b3_exp_5690": "hwg_b3_exp_5606",
  "hwg_b3_exp_5718": "hwg_b3_exp_5606",
  "hwg_b3_exp_5746": "hwg_b3_exp_5606",
  "hwg_b3_exp_5607": "hwg_b3_exp_5607",
  "hwg_b3_exp_5551": "hwg_b3_exp_5607",
  "hwg_b3_exp_5579": "hwg_b3_exp_5607",
  "hwg_b3_exp_5635": "hwg_b3_exp_5607",
  "hwg_b3_exp_5663": "hwg_b3_exp_5607",
  "hwg_b3_exp_5691": "hwg_b3_exp_5607",
  "hwg_b3_exp_5719": "hwg_b3_exp_5607",
  "hwg_b3_exp_5747": "hwg_b3_exp_5607",
  "hwg_b3_exp_5608": "hwg_b3_exp_5608",
  "hwg_b3_exp_5552": "hwg_b3_exp_5608",
  "hwg_b3_exp_5580": "hwg_b3_exp_5608",
  "hwg_b3_exp_5636": "hwg_b3_exp_5608",
  "hwg_b3_exp_5664": "hwg_b3_exp_5608",
  "hwg_b3_exp_5692": "hwg_b3_exp_5608",
  "hwg_b3_exp_5720": "hwg_b3_exp_5608",
  "hwg_b3_exp_5748": "hwg_b3_exp_5608",
  "hwg_b3_exp_5609": "hwg_b3_exp_5609",
  "hwg_b3_exp_5553": "hwg_b3_exp_5609",
  "hwg_b3_exp_5581": "hwg_b3_exp_5609",
  "hwg_b3_exp_5637": "hwg_b3_exp_5609",
  "hwg_b3_exp_5665": "hwg_b3_exp_5609",
  "hwg_b3_exp_5693": "hwg_b3_exp_5609",
  "hwg_b3_exp_5721": "hwg_b3_exp_5609",
  "hwg_b3_exp_5749": "hwg_b3_exp_5609",
  "hwg_b3_exp_5666": "hwg_b3_exp_5666",
  "hwg_b3_exp_5554": "hwg_b3_exp_5666",
  "hwg_b3_exp_5582": "hwg_b3_exp_5666",
  "hwg_b3_exp_5610": "hwg_b3_exp_5666",
  "hwg_b3_exp_5638": "hwg_b3_exp_5666",
  "hwg_b3_exp_5694": "hwg_b3_exp_5666",
  "hwg_b3_exp_5722": "hwg_b3_exp_5666",
  "hwg_b3_exp_5750": "hwg_b3_exp_5666",
  "hwg_b3_exp_5667": "hwg_b3_exp_5667",
  "hwg_b3_exp_5555": "hwg_b3_exp_5667",
  "hwg_b3_exp_5583": "hwg_b3_exp_5667",
  "hwg_b3_exp_5611": "hwg_b3_exp_5667",
  "hwg_b3_exp_5639": "hwg_b3_exp_5667",
  "hwg_b3_exp_5695": "hwg_b3_exp_5667",
  "hwg_b3_exp_5723": "hwg_b3_exp_5667",
  "hwg_b3_exp_5751": "hwg_b3_exp_5667",
  "hwg_b3_exp_5668": "hwg_b3_exp_5668",
  "hwg_b3_exp_5556": "hwg_b3_exp_5668",
  "hwg_b3_exp_5584": "hwg_b3_exp_5668",
  "hwg_b3_exp_5612": "hwg_b3_exp_5668",
  "hwg_b3_exp_5640": "hwg_b3_exp_5668",
  "hwg_b3_exp_5696": "hwg_b3_exp_5668",
  "hwg_b3_exp_5724": "hwg_b3_exp_5668",
  "hwg_b3_exp_5752": "hwg_b3_exp_5668",
  "hwg_b4_exp_5779": "hwg_b4_exp_5779",
  "hwg_b4_exp_5753": "hwg_b4_exp_5779",
  "hwg_b4_exp_5805": "hwg_b4_exp_5779",
  "hwg_b4_exp_5831": "hwg_b4_exp_5779",
  "hwg_b4_exp_5857": "hwg_b4_exp_5779",
  "hwg_b4_exp_5883": "hwg_b4_exp_5779",
  "hwg_b4_exp_5909": "hwg_b4_exp_5779",
  "hwg_b4_exp_5935": "hwg_b4_exp_5779",
  "hwg_b4_exp_5780": "hwg_b4_exp_5780",
  "hwg_b4_exp_5754": "hwg_b4_exp_5780",
  "hwg_b4_exp_5806": "hwg_b4_exp_5780",
  "hwg_b4_exp_5832": "hwg_b4_exp_5780",
  "hwg_b4_exp_5858": "hwg_b4_exp_5780",
  "hwg_b4_exp_5884": "hwg_b4_exp_5780",
  "hwg_b4_exp_5910": "hwg_b4_exp_5780",
  "hwg_b4_exp_5936": "hwg_b4_exp_5780",
  "hwg_b4_exp_5781": "hwg_b4_exp_5781",
  "hwg_b4_exp_5755": "hwg_b4_exp_5781",
  "hwg_b4_exp_5807": "hwg_b4_exp_5781",
  "hwg_b4_exp_5833": "hwg_b4_exp_5781",
  "hwg_b4_exp_5859": "hwg_b4_exp_5781",
  "hwg_b4_exp_5885": "hwg_b4_exp_5781",
  "hwg_b4_exp_5911": "hwg_b4_exp_5781",
  "hwg_b4_exp_5937": "hwg_b4_exp_5781",
  "hwg_b4_exp_5782": "hwg_b4_exp_5782",
  "hwg_b4_exp_5756": "hwg_b4_exp_5782",
  "hwg_b4_exp_5808": "hwg_b4_exp_5782",
  "hwg_b4_exp_5834": "hwg_b4_exp_5782",
  "hwg_b4_exp_5860": "hwg_b4_exp_5782",
  "hwg_b4_exp_5886": "hwg_b4_exp_5782",
  "hwg_b4_exp_5912": "hwg_b4_exp_5782",
  "hwg_b4_exp_5938": "hwg_b4_exp_5782",
  "hwg_b4_exp_5783": "hwg_b4_exp_5783",
  "hwg_b4_exp_5757": "hwg_b4_exp_5783",
  "hwg_b4_exp_5809": "hwg_b4_exp_5783",
  "hwg_b4_exp_5835": "hwg_b4_exp_5783",
  "hwg_b4_exp_5861": "hwg_b4_exp_5783",
  "hwg_b4_exp_5887": "hwg_b4_exp_5783",
  "hwg_b4_exp_5913": "hwg_b4_exp_5783",
  "hwg_b4_exp_5939": "hwg_b4_exp_5783",
  "hwg_b4_exp_5784": "hwg_b4_exp_5784",
  "hwg_b4_exp_5758": "hwg_b4_exp_5784",
  "hwg_b4_exp_5810": "hwg_b4_exp_5784",
  "hwg_b4_exp_5836": "hwg_b4_exp_5784",
  "hwg_b4_exp_5862": "hwg_b4_exp_5784",
  "hwg_b4_exp_5888": "hwg_b4_exp_5784",
  "hwg_b4_exp_5914": "hwg_b4_exp_5784",
  "hwg_b4_exp_5940": "hwg_b4_exp_5784",
  "hwg_b4_exp_5785": "hwg_b4_exp_5785",
  "hwg_b4_exp_5759": "hwg_b4_exp_5785",
  "hwg_b4_exp_5811": "hwg_b4_exp_5785",
  "hwg_b4_exp_5837": "hwg_b4_exp_5785",
  "hwg_b4_exp_5863": "hwg_b4_exp_5785",
  "hwg_b4_exp_5889": "hwg_b4_exp_5785",
  "hwg_b4_exp_5915": "hwg_b4_exp_5785",
  "hwg_b4_exp_5941": "hwg_b4_exp_5785",
  "hwg_b4_exp_5812": "hwg_b4_exp_5812",
  "hwg_b4_exp_5760": "hwg_b4_exp_5812",
  "hwg_b4_exp_5786": "hwg_b4_exp_5812",
  "hwg_b4_exp_5838": "hwg_b4_exp_5812",
  "hwg_b4_exp_5864": "hwg_b4_exp_5812",
  "hwg_b4_exp_5890": "hwg_b4_exp_5812",
  "hwg_b4_exp_5916": "hwg_b4_exp_5812",
  "hwg_b4_exp_5942": "hwg_b4_exp_5812",
  "hwg_b4_exp_5813": "hwg_b4_exp_5813",
  "hwg_b4_exp_5761": "hwg_b4_exp_5813",
  "hwg_b4_exp_5787": "hwg_b4_exp_5813",
  "hwg_b4_exp_5839": "hwg_b4_exp_5813",
  "hwg_b4_exp_5865": "hwg_b4_exp_5813",
  "hwg_b4_exp_5891": "hwg_b4_exp_5813",
  "hwg_b4_exp_5917": "hwg_b4_exp_5813",
  "hwg_b4_exp_5943": "hwg_b4_exp_5813",
  "hwg_b4_exp_5814": "hwg_b4_exp_5814",
  "hwg_b4_exp_5762": "hwg_b4_exp_5814",
  "hwg_b4_exp_5788": "hwg_b4_exp_5814",
  "hwg_b4_exp_5840": "hwg_b4_exp_5814",
  "hwg_b4_exp_5866": "hwg_b4_exp_5814",
  "hwg_b4_exp_5892": "hwg_b4_exp_5814",
  "hwg_b4_exp_5918": "hwg_b4_exp_5814",
  "hwg_b4_exp_5944": "hwg_b4_exp_5814",
  "hwg_b4_exp_5815": "hwg_b4_exp_5815",
  "hwg_b4_exp_5763": "hwg_b4_exp_5815",
  "hwg_b4_exp_5789": "hwg_b4_exp_5815",
  "hwg_b4_exp_5841": "hwg_b4_exp_5815",
  "hwg_b4_exp_5867": "hwg_b4_exp_5815",
  "hwg_b4_exp_5893": "hwg_b4_exp_5815",
  "hwg_b4_exp_5919": "hwg_b4_exp_5815",
  "hwg_b4_exp_5945": "hwg_b4_exp_5815",
  "hwg_b4_exp_5894": "hwg_b4_exp_5894",
  "hwg_b4_exp_5764": "hwg_b4_exp_5894",
  "hwg_b4_exp_5790": "hwg_b4_exp_5894",
  "hwg_b4_exp_5816": "hwg_b4_exp_5894",
  "hwg_b4_exp_5842": "hwg_b4_exp_5894",
  "hwg_b4_exp_5868": "hwg_b4_exp_5894",
  "hwg_b4_exp_5920": "hwg_b4_exp_5894",
  "hwg_b4_exp_5946": "hwg_b4_exp_5894",
  "hwg_b4_exp_5895": "hwg_b4_exp_5895",
  "hwg_b4_exp_5765": "hwg_b4_exp_5895",
  "hwg_b4_exp_5791": "hwg_b4_exp_5895",
  "hwg_b4_exp_5817": "hwg_b4_exp_5895",
  "hwg_b4_exp_5843": "hwg_b4_exp_5895",
  "hwg_b4_exp_5869": "hwg_b4_exp_5895",
  "hwg_b4_exp_5921": "hwg_b4_exp_5895",
  "hwg_b4_exp_5947": "hwg_b4_exp_5895",
  "hwg_b4_exp_5896": "hwg_b4_exp_5896",
  "hwg_b4_exp_5766": "hwg_b4_exp_5896",
  "hwg_b4_exp_5792": "hwg_b4_exp_5896",
  "hwg_b4_exp_5818": "hwg_b4_exp_5896",
  "hwg_b4_exp_5844": "hwg_b4_exp_5896",
  "hwg_b4_exp_5870": "hwg_b4_exp_5896",
  "hwg_b4_exp_5922": "hwg_b4_exp_5896",
  "hwg_b4_exp_5948": "hwg_b4_exp_5896",
  "hwg_b4_exp_5897": "hwg_b4_exp_5897",
  "hwg_b4_exp_5767": "hwg_b4_exp_5897",
  "hwg_b4_exp_5793": "hwg_b4_exp_5897",
  "hwg_b4_exp_5819": "hwg_b4_exp_5897",
  "hwg_b4_exp_5845": "hwg_b4_exp_5897",
  "hwg_b4_exp_5871": "hwg_b4_exp_5897",
  "hwg_b4_exp_5923": "hwg_b4_exp_5897",
  "hwg_b4_exp_5949": "hwg_b4_exp_5897",
  "hwg_b4_exp_5898": "hwg_b4_exp_5898",
  "hwg_b4_exp_5768": "hwg_b4_exp_5898",
  "hwg_b4_exp_5794": "hwg_b4_exp_5898",
  "hwg_b4_exp_5820": "hwg_b4_exp_5898",
  "hwg_b4_exp_5846": "hwg_b4_exp_5898",
  "hwg_b4_exp_5872": "hwg_b4_exp_5898",
  "hwg_b4_exp_5924": "hwg_b4_exp_5898",
  "hwg_b4_exp_5950": "hwg_b4_exp_5898",
  "hwg_b4_exp_5899": "hwg_b4_exp_5899",
  "hwg_b4_exp_5769": "hwg_b4_exp_5899",
  "hwg_b4_exp_5795": "hwg_b4_exp_5899",
  "hwg_b4_exp_5821": "hwg_b4_exp_5899",
  "hwg_b4_exp_5847": "hwg_b4_exp_5899",
  "hwg_b4_exp_5873": "hwg_b4_exp_5899",
  "hwg_b4_exp_5925": "hwg_b4_exp_5899",
  "hwg_b4_exp_5951": "hwg_b4_exp_5899",
  "hwg_b4_exp_5900": "hwg_b4_exp_5900",
  "hwg_b4_exp_5770": "hwg_b4_exp_5900",
  "hwg_b4_exp_5796": "hwg_b4_exp_5900",
  "hwg_b4_exp_5822": "hwg_b4_exp_5900",
  "hwg_b4_exp_5848": "hwg_b4_exp_5900",
  "hwg_b4_exp_5874": "hwg_b4_exp_5900",
  "hwg_b4_exp_5926": "hwg_b4_exp_5900",
  "hwg_b4_exp_5952": "hwg_b4_exp_5900",
  "hwg_b4_exp_5797": "hwg_b4_exp_5797",
  "hwg_b4_exp_5771": "hwg_b4_exp_5797",
  "hwg_b4_exp_5823": "hwg_b4_exp_5797",
  "hwg_b4_exp_5849": "hwg_b4_exp_5797",
  "hwg_b4_exp_5875": "hwg_b4_exp_5797",
  "hwg_b4_exp_5901": "hwg_b4_exp_5797",
  "hwg_b4_exp_5927": "hwg_b4_exp_5797",
  "hwg_b4_exp_5953": "hwg_b4_exp_5797",
  "hwg_b4_exp_5798": "hwg_b4_exp_5798",
  "hwg_b4_exp_5772": "hwg_b4_exp_5798",
  "hwg_b4_exp_5824": "hwg_b4_exp_5798",
  "hwg_b4_exp_5850": "hwg_b4_exp_5798",
  "hwg_b4_exp_5876": "hwg_b4_exp_5798",
  "hwg_b4_exp_5902": "hwg_b4_exp_5798",
  "hwg_b4_exp_5928": "hwg_b4_exp_5798",
  "hwg_b4_exp_5954": "hwg_b4_exp_5798",
  "hwg_b4_exp_5799": "hwg_b4_exp_5799",
  "hwg_b4_exp_5773": "hwg_b4_exp_5799",
  "hwg_b4_exp_5825": "hwg_b4_exp_5799",
  "hwg_b4_exp_5851": "hwg_b4_exp_5799",
  "hwg_b4_exp_5877": "hwg_b4_exp_5799",
  "hwg_b4_exp_5903": "hwg_b4_exp_5799",
  "hwg_b4_exp_5929": "hwg_b4_exp_5799",
  "hwg_b4_exp_5955": "hwg_b4_exp_5799",
  "hwg_b4_exp_5800": "hwg_b4_exp_5800",
  "hwg_b4_exp_5774": "hwg_b4_exp_5800",
  "hwg_b4_exp_5826": "hwg_b4_exp_5800",
  "hwg_b4_exp_5852": "hwg_b4_exp_5800",
  "hwg_b4_exp_5878": "hwg_b4_exp_5800",
  "hwg_b4_exp_5904": "hwg_b4_exp_5800",
  "hwg_b4_exp_5930": "hwg_b4_exp_5800",
  "hwg_b4_exp_5956": "hwg_b4_exp_5800",
  "hwg_b4_exp_5801": "hwg_b4_exp_5801",
  "hwg_b4_exp_5775": "hwg_b4_exp_5801",
  "hwg_b4_exp_5827": "hwg_b4_exp_5801",
  "hwg_b4_exp_5853": "hwg_b4_exp_5801",
  "hwg_b4_exp_5879": "hwg_b4_exp_5801",
  "hwg_b4_exp_5905": "hwg_b4_exp_5801",
  "hwg_b4_exp_5931": "hwg_b4_exp_5801",
  "hwg_b4_exp_5957": "hwg_b4_exp_5801",
  "hwg_b4_exp_5802": "hwg_b4_exp_5802",
  "hwg_b4_exp_5776": "hwg_b4_exp_5802",
  "hwg_b4_exp_5828": "hwg_b4_exp_5802",
  "hwg_b4_exp_5854": "hwg_b4_exp_5802",
  "hwg_b4_exp_5880": "hwg_b4_exp_5802",
  "hwg_b4_exp_5906": "hwg_b4_exp_5802",
  "hwg_b4_exp_5932": "hwg_b4_exp_5802",
  "hwg_b4_exp_5958": "hwg_b4_exp_5802",
  "hwg_b4_exp_5803": "hwg_b4_exp_5803",
  "hwg_b4_exp_5777": "hwg_b4_exp_5803",
  "hwg_b4_exp_5829": "hwg_b4_exp_5803",
  "hwg_b4_exp_5855": "hwg_b4_exp_5803",
  "hwg_b4_exp_5881": "hwg_b4_exp_5803",
  "hwg_b4_exp_5907": "hwg_b4_exp_5803",
  "hwg_b4_exp_5933": "hwg_b4_exp_5803",
  "hwg_b4_exp_5959": "hwg_b4_exp_5803",
  "hwg_b4_exp_5830": "hwg_b4_exp_5830",
  "hwg_b4_exp_5778": "hwg_b4_exp_5830",
  "hwg_b4_exp_5804": "hwg_b4_exp_5830",
  "hwg_b4_exp_5856": "hwg_b4_exp_5830",
  "hwg_b4_exp_5882": "hwg_b4_exp_5830",
  "hwg_b4_exp_5908": "hwg_b4_exp_5830",
  "hwg_b4_exp_5934": "hwg_b4_exp_5830",
  "hwg_b4_exp_5960": "hwg_b4_exp_5830",
  "hwg_b5_exp_5987": "hwg_b5_exp_5987",
  "hwg_b5_exp_5961": "hwg_b5_exp_5987",
  "hwg_b5_exp_6013": "hwg_b5_exp_5987",
  "hwg_b5_exp_6039": "hwg_b5_exp_5987",
  "hwg_b5_exp_6065": "hwg_b5_exp_5987",
  "hwg_b5_exp_6091": "hwg_b5_exp_5987",
  "hwg_b5_exp_6117": "hwg_b5_exp_5987",
  "hwg_b5_exp_6143": "hwg_b5_exp_5987",
  "hwg_b5_exp_5988": "hwg_b5_exp_5988",
  "hwg_b5_exp_5962": "hwg_b5_exp_5988",
  "hwg_b5_exp_6014": "hwg_b5_exp_5988",
  "hwg_b5_exp_6040": "hwg_b5_exp_5988",
  "hwg_b5_exp_6066": "hwg_b5_exp_5988",
  "hwg_b5_exp_6092": "hwg_b5_exp_5988",
  "hwg_b5_exp_6118": "hwg_b5_exp_5988",
  "hwg_b5_exp_6144": "hwg_b5_exp_5988",
  "hwg_b5_exp_5989": "hwg_b5_exp_5989",
  "hwg_b5_exp_5963": "hwg_b5_exp_5989",
  "hwg_b5_exp_6015": "hwg_b5_exp_5989",
  "hwg_b5_exp_6041": "hwg_b5_exp_5989",
  "hwg_b5_exp_6067": "hwg_b5_exp_5989",
  "hwg_b5_exp_6093": "hwg_b5_exp_5989",
  "hwg_b5_exp_6119": "hwg_b5_exp_5989",
  "hwg_b5_exp_6145": "hwg_b5_exp_5989",
  "hwg_b5_exp_5990": "hwg_b5_exp_5990",
  "hwg_b5_exp_5964": "hwg_b5_exp_5990",
  "hwg_b5_exp_6016": "hwg_b5_exp_5990",
  "hwg_b5_exp_6042": "hwg_b5_exp_5990",
  "hwg_b5_exp_6068": "hwg_b5_exp_5990",
  "hwg_b5_exp_6094": "hwg_b5_exp_5990",
  "hwg_b5_exp_6120": "hwg_b5_exp_5990",
  "hwg_b5_exp_6146": "hwg_b5_exp_5990",
  "hwg_b5_exp_5991": "hwg_b5_exp_5991",
  "hwg_b5_exp_5965": "hwg_b5_exp_5991",
  "hwg_b5_exp_6017": "hwg_b5_exp_5991",
  "hwg_b5_exp_6043": "hwg_b5_exp_5991",
  "hwg_b5_exp_6069": "hwg_b5_exp_5991",
  "hwg_b5_exp_6095": "hwg_b5_exp_5991",
  "hwg_b5_exp_6121": "hwg_b5_exp_5991",
  "hwg_b5_exp_6147": "hwg_b5_exp_5991",
  "hwg_b5_exp_6070": "hwg_b5_exp_6070",
  "hwg_b5_exp_5966": "hwg_b5_exp_6070",
  "hwg_b5_exp_5992": "hwg_b5_exp_6070",
  "hwg_b5_exp_6018": "hwg_b5_exp_6070",
  "hwg_b5_exp_6044": "hwg_b5_exp_6070",
  "hwg_b5_exp_6096": "hwg_b5_exp_6070",
  "hwg_b5_exp_6122": "hwg_b5_exp_6070",
  "hwg_b5_exp_6148": "hwg_b5_exp_6070",
  "hwg_b5_exp_6071": "hwg_b5_exp_6071",
  "hwg_b5_exp_5967": "hwg_b5_exp_6071",
  "hwg_b5_exp_5993": "hwg_b5_exp_6071",
  "hwg_b5_exp_6019": "hwg_b5_exp_6071",
  "hwg_b5_exp_6045": "hwg_b5_exp_6071",
  "hwg_b5_exp_6097": "hwg_b5_exp_6071",
  "hwg_b5_exp_6123": "hwg_b5_exp_6071",
  "hwg_b5_exp_6149": "hwg_b5_exp_6071",
  "hwg_b5_exp_6072": "hwg_b5_exp_6072",
  "hwg_b5_exp_5968": "hwg_b5_exp_6072",
  "hwg_b5_exp_5994": "hwg_b5_exp_6072",
  "hwg_b5_exp_6020": "hwg_b5_exp_6072",
  "hwg_b5_exp_6046": "hwg_b5_exp_6072",
  "hwg_b5_exp_6098": "hwg_b5_exp_6072",
  "hwg_b5_exp_6124": "hwg_b5_exp_6072",
  "hwg_b5_exp_6150": "hwg_b5_exp_6072",
  "hwg_b5_exp_6073": "hwg_b5_exp_6073",
  "hwg_b5_exp_5969": "hwg_b5_exp_6073",
  "hwg_b5_exp_5995": "hwg_b5_exp_6073",
  "hwg_b5_exp_6021": "hwg_b5_exp_6073",
  "hwg_b5_exp_6047": "hwg_b5_exp_6073",
  "hwg_b5_exp_6099": "hwg_b5_exp_6073",
  "hwg_b5_exp_6125": "hwg_b5_exp_6073",
  "hwg_b5_exp_6151": "hwg_b5_exp_6073",
  "hwg_b5_exp_6074": "hwg_b5_exp_6074",
  "hwg_b5_exp_5970": "hwg_b5_exp_6074",
  "hwg_b5_exp_5996": "hwg_b5_exp_6074",
  "hwg_b5_exp_6022": "hwg_b5_exp_6074",
  "hwg_b5_exp_6048": "hwg_b5_exp_6074",
  "hwg_b5_exp_6100": "hwg_b5_exp_6074",
  "hwg_b5_exp_6126": "hwg_b5_exp_6074",
  "hwg_b5_exp_6152": "hwg_b5_exp_6074",
  "hwg_b5_exp_6075": "hwg_b5_exp_6075",
  "hwg_b5_exp_5971": "hwg_b5_exp_6075",
  "hwg_b5_exp_5997": "hwg_b5_exp_6075",
  "hwg_b5_exp_6023": "hwg_b5_exp_6075",
  "hwg_b5_exp_6049": "hwg_b5_exp_6075",
  "hwg_b5_exp_6101": "hwg_b5_exp_6075",
  "hwg_b5_exp_6127": "hwg_b5_exp_6075",
  "hwg_b5_exp_6153": "hwg_b5_exp_6075",
  "hwg_b5_exp_6102": "hwg_b5_exp_6102",
  "hwg_b5_exp_5972": "hwg_b5_exp_6102",
  "hwg_b5_exp_5998": "hwg_b5_exp_6102",
  "hwg_b5_exp_6024": "hwg_b5_exp_6102",
  "hwg_b5_exp_6050": "hwg_b5_exp_6102",
  "hwg_b5_exp_6076": "hwg_b5_exp_6102",
  "hwg_b5_exp_6128": "hwg_b5_exp_6102",
  "hwg_b5_exp_6154": "hwg_b5_exp_6102",
  "hwg_b5_exp_6103": "hwg_b5_exp_6103",
  "hwg_b5_exp_5973": "hwg_b5_exp_6103",
  "hwg_b5_exp_5999": "hwg_b5_exp_6103",
  "hwg_b5_exp_6025": "hwg_b5_exp_6103",
  "hwg_b5_exp_6051": "hwg_b5_exp_6103",
  "hwg_b5_exp_6077": "hwg_b5_exp_6103",
  "hwg_b5_exp_6129": "hwg_b5_exp_6103",
  "hwg_b5_exp_6155": "hwg_b5_exp_6103",
  "hwg_b5_exp_6104": "hwg_b5_exp_6104",
  "hwg_b5_exp_5974": "hwg_b5_exp_6104",
  "hwg_b5_exp_6000": "hwg_b5_exp_6104",
  "hwg_b5_exp_6026": "hwg_b5_exp_6104",
  "hwg_b5_exp_6052": "hwg_b5_exp_6104",
  "hwg_b5_exp_6078": "hwg_b5_exp_6104",
  "hwg_b5_exp_6130": "hwg_b5_exp_6104",
  "hwg_b5_exp_6156": "hwg_b5_exp_6104",
  "hwg_b5_exp_6027": "hwg_b5_exp_6027",
  "hwg_b5_exp_5975": "hwg_b5_exp_6027",
  "hwg_b5_exp_6001": "hwg_b5_exp_6027",
  "hwg_b5_exp_6053": "hwg_b5_exp_6027",
  "hwg_b5_exp_6079": "hwg_b5_exp_6027",
  "hwg_b5_exp_6105": "hwg_b5_exp_6027",
  "hwg_b5_exp_6131": "hwg_b5_exp_6027",
  "hwg_b5_exp_6157": "hwg_b5_exp_6027",
  "hwg_b5_exp_6028": "hwg_b5_exp_6028",
  "hwg_b5_exp_5976": "hwg_b5_exp_6028",
  "hwg_b5_exp_6002": "hwg_b5_exp_6028",
  "hwg_b5_exp_6054": "hwg_b5_exp_6028",
  "hwg_b5_exp_6080": "hwg_b5_exp_6028",
  "hwg_b5_exp_6106": "hwg_b5_exp_6028",
  "hwg_b5_exp_6132": "hwg_b5_exp_6028",
  "hwg_b5_exp_6158": "hwg_b5_exp_6028",
  "hwg_b5_exp_6029": "hwg_b5_exp_6029",
  "hwg_b5_exp_5977": "hwg_b5_exp_6029",
  "hwg_b5_exp_6003": "hwg_b5_exp_6029",
  "hwg_b5_exp_6055": "hwg_b5_exp_6029",
  "hwg_b5_exp_6081": "hwg_b5_exp_6029",
  "hwg_b5_exp_6107": "hwg_b5_exp_6029",
  "hwg_b5_exp_6133": "hwg_b5_exp_6029",
  "hwg_b5_exp_6159": "hwg_b5_exp_6029",
  "hwg_b5_exp_6030": "hwg_b5_exp_6030",
  "hwg_b5_exp_5978": "hwg_b5_exp_6030",
  "hwg_b5_exp_6004": "hwg_b5_exp_6030",
  "hwg_b5_exp_6056": "hwg_b5_exp_6030",
  "hwg_b5_exp_6082": "hwg_b5_exp_6030",
  "hwg_b5_exp_6108": "hwg_b5_exp_6030",
  "hwg_b5_exp_6134": "hwg_b5_exp_6030",
  "hwg_b5_exp_6160": "hwg_b5_exp_6030",
  "hwg_b5_exp_6005": "hwg_b5_exp_6005",
  "hwg_b5_exp_5979": "hwg_b5_exp_6005",
  "hwg_b5_exp_6031": "hwg_b5_exp_6005",
  "hwg_b5_exp_6057": "hwg_b5_exp_6005",
  "hwg_b5_exp_6083": "hwg_b5_exp_6005",
  "hwg_b5_exp_6109": "hwg_b5_exp_6005",
  "hwg_b5_exp_6135": "hwg_b5_exp_6005",
  "hwg_b5_exp_6161": "hwg_b5_exp_6005",
  "hwg_b5_exp_6006": "hwg_b5_exp_6006",
  "hwg_b5_exp_5980": "hwg_b5_exp_6006",
  "hwg_b5_exp_6032": "hwg_b5_exp_6006",
  "hwg_b5_exp_6058": "hwg_b5_exp_6006",
  "hwg_b5_exp_6084": "hwg_b5_exp_6006",
  "hwg_b5_exp_6110": "hwg_b5_exp_6006",
  "hwg_b5_exp_6136": "hwg_b5_exp_6006",
  "hwg_b5_exp_6162": "hwg_b5_exp_6006",
  "hwg_b5_exp_6007": "hwg_b5_exp_6007",
  "hwg_b5_exp_5981": "hwg_b5_exp_6007",
  "hwg_b5_exp_6033": "hwg_b5_exp_6007",
  "hwg_b5_exp_6059": "hwg_b5_exp_6007",
  "hwg_b5_exp_6085": "hwg_b5_exp_6007",
  "hwg_b5_exp_6111": "hwg_b5_exp_6007",
  "hwg_b5_exp_6137": "hwg_b5_exp_6007",
  "hwg_b5_exp_6163": "hwg_b5_exp_6007",
  "hwg_b5_exp_6008": "hwg_b5_exp_6008",
  "hwg_b5_exp_5982": "hwg_b5_exp_6008",
  "hwg_b5_exp_6034": "hwg_b5_exp_6008",
  "hwg_b5_exp_6060": "hwg_b5_exp_6008",
  "hwg_b5_exp_6086": "hwg_b5_exp_6008",
  "hwg_b5_exp_6112": "hwg_b5_exp_6008",
  "hwg_b5_exp_6138": "hwg_b5_exp_6008",
  "hwg_b5_exp_6164": "hwg_b5_exp_6008",
  "hwg_b5_exp_6009": "hwg_b5_exp_6009",
  "hwg_b5_exp_5983": "hwg_b5_exp_6009",
  "hwg_b5_exp_6035": "hwg_b5_exp_6009",
  "hwg_b5_exp_6061": "hwg_b5_exp_6009",
  "hwg_b5_exp_6087": "hwg_b5_exp_6009",
  "hwg_b5_exp_6113": "hwg_b5_exp_6009",
  "hwg_b5_exp_6139": "hwg_b5_exp_6009",
  "hwg_b5_exp_6165": "hwg_b5_exp_6009",
  "hwg_b5_exp_6088": "hwg_b5_exp_6088",
  "hwg_b5_exp_5984": "hwg_b5_exp_6088",
  "hwg_b5_exp_6010": "hwg_b5_exp_6088",
  "hwg_b5_exp_6036": "hwg_b5_exp_6088",
  "hwg_b5_exp_6062": "hwg_b5_exp_6088",
  "hwg_b5_exp_6114": "hwg_b5_exp_6088",
  "hwg_b5_exp_6140": "hwg_b5_exp_6088",
  "hwg_b5_exp_6166": "hwg_b5_exp_6088",
  "hwg_b5_exp_6089": "hwg_b5_exp_6089",
  "hwg_b5_exp_5985": "hwg_b5_exp_6089",
  "hwg_b5_exp_6011": "hwg_b5_exp_6089",
  "hwg_b5_exp_6037": "hwg_b5_exp_6089",
  "hwg_b5_exp_6063": "hwg_b5_exp_6089",
  "hwg_b5_exp_6115": "hwg_b5_exp_6089",
  "hwg_b5_exp_6141": "hwg_b5_exp_6089",
  "hwg_b5_exp_6167": "hwg_b5_exp_6089",
  "hwg_b5_exp_6090": "hwg_b5_exp_6090",
  "hwg_b5_exp_5986": "hwg_b5_exp_6090",
  "hwg_b5_exp_6012": "hwg_b5_exp_6090",
  "hwg_b5_exp_6038": "hwg_b5_exp_6090",
  "hwg_b5_exp_6064": "hwg_b5_exp_6090",
  "hwg_b5_exp_6116": "hwg_b5_exp_6090",
  "hwg_b5_exp_6142": "hwg_b5_exp_6090",
  "hwg_b5_exp_6168": "hwg_b5_exp_6090",
  "hwg_b6_exp_6257": "hwg_b6_exp_6257",
  "hwg_b6_exp_6169": "hwg_b6_exp_6257",
  "hwg_b6_exp_6191": "hwg_b6_exp_6257",
  "hwg_b6_exp_6213": "hwg_b6_exp_6257",
  "hwg_b6_exp_6235": "hwg_b6_exp_6257",
  "hwg_b6_exp_6279": "hwg_b6_exp_6257",
  "hwg_b6_exp_6301": "hwg_b6_exp_6257",
  "hwg_b6_exp_6323": "hwg_b6_exp_6257",
  "hwg_b6_exp_6258": "hwg_b6_exp_6258",
  "hwg_b6_exp_6170": "hwg_b6_exp_6258",
  "hwg_b6_exp_6192": "hwg_b6_exp_6258",
  "hwg_b6_exp_6214": "hwg_b6_exp_6258",
  "hwg_b6_exp_6236": "hwg_b6_exp_6258",
  "hwg_b6_exp_6280": "hwg_b6_exp_6258",
  "hwg_b6_exp_6302": "hwg_b6_exp_6258",
  "hwg_b6_exp_6324": "hwg_b6_exp_6258",
  "hwg_b6_exp_6259": "hwg_b6_exp_6259",
  "hwg_b6_exp_6171": "hwg_b6_exp_6259",
  "hwg_b6_exp_6193": "hwg_b6_exp_6259",
  "hwg_b6_exp_6215": "hwg_b6_exp_6259",
  "hwg_b6_exp_6237": "hwg_b6_exp_6259",
  "hwg_b6_exp_6281": "hwg_b6_exp_6259",
  "hwg_b6_exp_6303": "hwg_b6_exp_6259",
  "hwg_b6_exp_6325": "hwg_b6_exp_6259",
  "hwg_b6_exp_6260": "hwg_b6_exp_6260",
  "hwg_b6_exp_6172": "hwg_b6_exp_6260",
  "hwg_b6_exp_6194": "hwg_b6_exp_6260",
  "hwg_b6_exp_6216": "hwg_b6_exp_6260",
  "hwg_b6_exp_6238": "hwg_b6_exp_6260",
  "hwg_b6_exp_6282": "hwg_b6_exp_6260",
  "hwg_b6_exp_6304": "hwg_b6_exp_6260",
  "hwg_b6_exp_6326": "hwg_b6_exp_6260",
  "hwg_b6_exp_6261": "hwg_b6_exp_6261",
  "hwg_b6_exp_6173": "hwg_b6_exp_6261",
  "hwg_b6_exp_6195": "hwg_b6_exp_6261",
  "hwg_b6_exp_6217": "hwg_b6_exp_6261",
  "hwg_b6_exp_6239": "hwg_b6_exp_6261",
  "hwg_b6_exp_6283": "hwg_b6_exp_6261",
  "hwg_b6_exp_6305": "hwg_b6_exp_6261",
  "hwg_b6_exp_6327": "hwg_b6_exp_6261",
  "hwg_b6_exp_6262": "hwg_b6_exp_6262",
  "hwg_b6_exp_6174": "hwg_b6_exp_6262",
  "hwg_b6_exp_6196": "hwg_b6_exp_6262",
  "hwg_b6_exp_6218": "hwg_b6_exp_6262",
  "hwg_b6_exp_6240": "hwg_b6_exp_6262",
  "hwg_b6_exp_6284": "hwg_b6_exp_6262",
  "hwg_b6_exp_6306": "hwg_b6_exp_6262",
  "hwg_b6_exp_6328": "hwg_b6_exp_6262",
  "hwg_b6_exp_6263": "hwg_b6_exp_6263",
  "hwg_b6_exp_6175": "hwg_b6_exp_6263",
  "hwg_b6_exp_6197": "hwg_b6_exp_6263",
  "hwg_b6_exp_6219": "hwg_b6_exp_6263",
  "hwg_b6_exp_6241": "hwg_b6_exp_6263",
  "hwg_b6_exp_6285": "hwg_b6_exp_6263",
  "hwg_b6_exp_6307": "hwg_b6_exp_6263",
  "hwg_b6_exp_6329": "hwg_b6_exp_6263",
  "hwg_b6_exp_6264": "hwg_b6_exp_6264",
  "hwg_b6_exp_6176": "hwg_b6_exp_6264",
  "hwg_b6_exp_6198": "hwg_b6_exp_6264",
  "hwg_b6_exp_6220": "hwg_b6_exp_6264",
  "hwg_b6_exp_6242": "hwg_b6_exp_6264",
  "hwg_b6_exp_6286": "hwg_b6_exp_6264",
  "hwg_b6_exp_6308": "hwg_b6_exp_6264",
  "hwg_b6_exp_6330": "hwg_b6_exp_6264",
  "hwg_b6_exp_6265": "hwg_b6_exp_6265",
  "hwg_b6_exp_6177": "hwg_b6_exp_6265",
  "hwg_b6_exp_6199": "hwg_b6_exp_6265",
  "hwg_b6_exp_6221": "hwg_b6_exp_6265",
  "hwg_b6_exp_6243": "hwg_b6_exp_6265",
  "hwg_b6_exp_6287": "hwg_b6_exp_6265",
  "hwg_b6_exp_6309": "hwg_b6_exp_6265",
  "hwg_b6_exp_6331": "hwg_b6_exp_6265",
  "hwg_b6_exp_6288": "hwg_b6_exp_6288",
  "hwg_b6_exp_6178": "hwg_b6_exp_6288",
  "hwg_b6_exp_6200": "hwg_b6_exp_6288",
  "hwg_b6_exp_6222": "hwg_b6_exp_6288",
  "hwg_b6_exp_6244": "hwg_b6_exp_6288",
  "hwg_b6_exp_6266": "hwg_b6_exp_6288",
  "hwg_b6_exp_6310": "hwg_b6_exp_6288",
  "hwg_b6_exp_6332": "hwg_b6_exp_6288",
  "hwg_b6_exp_6289": "hwg_b6_exp_6289",
  "hwg_b6_exp_6179": "hwg_b6_exp_6289",
  "hwg_b6_exp_6201": "hwg_b6_exp_6289",
  "hwg_b6_exp_6223": "hwg_b6_exp_6289",
  "hwg_b6_exp_6245": "hwg_b6_exp_6289",
  "hwg_b6_exp_6267": "hwg_b6_exp_6289",
  "hwg_b6_exp_6311": "hwg_b6_exp_6289",
  "hwg_b6_exp_6333": "hwg_b6_exp_6289",
  "hwg_b6_exp_6290": "hwg_b6_exp_6290",
  "hwg_b6_exp_6180": "hwg_b6_exp_6290",
  "hwg_b6_exp_6202": "hwg_b6_exp_6290",
  "hwg_b6_exp_6224": "hwg_b6_exp_6290",
  "hwg_b6_exp_6246": "hwg_b6_exp_6290",
  "hwg_b6_exp_6268": "hwg_b6_exp_6290",
  "hwg_b6_exp_6312": "hwg_b6_exp_6290",
  "hwg_b6_exp_6334": "hwg_b6_exp_6290",
  "hwg_b6_exp_6225": "hwg_b6_exp_6225",
  "hwg_b6_exp_6181": "hwg_b6_exp_6225",
  "hwg_b6_exp_6203": "hwg_b6_exp_6225",
  "hwg_b6_exp_6247": "hwg_b6_exp_6225",
  "hwg_b6_exp_6269": "hwg_b6_exp_6225",
  "hwg_b6_exp_6291": "hwg_b6_exp_6225",
  "hwg_b6_exp_6313": "hwg_b6_exp_6225",
  "hwg_b6_exp_6335": "hwg_b6_exp_6225",
  "hwg_b6_exp_6226": "hwg_b6_exp_6226",
  "hwg_b6_exp_6182": "hwg_b6_exp_6226",
  "hwg_b6_exp_6204": "hwg_b6_exp_6226",
  "hwg_b6_exp_6248": "hwg_b6_exp_6226",
  "hwg_b6_exp_6270": "hwg_b6_exp_6226",
  "hwg_b6_exp_6292": "hwg_b6_exp_6226",
  "hwg_b6_exp_6314": "hwg_b6_exp_6226",
  "hwg_b6_exp_6336": "hwg_b6_exp_6226",
  "hwg_b6_exp_6271": "hwg_b6_exp_6271",
  "hwg_b6_exp_6183": "hwg_b6_exp_6271",
  "hwg_b6_exp_6205": "hwg_b6_exp_6271",
  "hwg_b6_exp_6227": "hwg_b6_exp_6271",
  "hwg_b6_exp_6249": "hwg_b6_exp_6271",
  "hwg_b6_exp_6293": "hwg_b6_exp_6271",
  "hwg_b6_exp_6315": "hwg_b6_exp_6271",
  "hwg_b6_exp_6337": "hwg_b6_exp_6271",
  "hwg_b6_exp_6272": "hwg_b6_exp_6272",
  "hwg_b6_exp_6184": "hwg_b6_exp_6272",
  "hwg_b6_exp_6206": "hwg_b6_exp_6272",
  "hwg_b6_exp_6228": "hwg_b6_exp_6272",
  "hwg_b6_exp_6250": "hwg_b6_exp_6272",
  "hwg_b6_exp_6294": "hwg_b6_exp_6272",
  "hwg_b6_exp_6316": "hwg_b6_exp_6272",
  "hwg_b6_exp_6338": "hwg_b6_exp_6272",
  "hwg_b6_exp_6273": "hwg_b6_exp_6273",
  "hwg_b6_exp_6185": "hwg_b6_exp_6273",
  "hwg_b6_exp_6207": "hwg_b6_exp_6273",
  "hwg_b6_exp_6229": "hwg_b6_exp_6273",
  "hwg_b6_exp_6251": "hwg_b6_exp_6273",
  "hwg_b6_exp_6295": "hwg_b6_exp_6273",
  "hwg_b6_exp_6317": "hwg_b6_exp_6273",
  "hwg_b6_exp_6339": "hwg_b6_exp_6273",
  "hwg_b6_exp_6274": "hwg_b6_exp_6274",
  "hwg_b6_exp_6186": "hwg_b6_exp_6274",
  "hwg_b6_exp_6208": "hwg_b6_exp_6274",
  "hwg_b6_exp_6230": "hwg_b6_exp_6274",
  "hwg_b6_exp_6252": "hwg_b6_exp_6274",
  "hwg_b6_exp_6296": "hwg_b6_exp_6274",
  "hwg_b6_exp_6318": "hwg_b6_exp_6274",
  "hwg_b6_exp_6340": "hwg_b6_exp_6274",
  "hwg_b6_exp_6275": "hwg_b6_exp_6275",
  "hwg_b6_exp_6187": "hwg_b6_exp_6275",
  "hwg_b6_exp_6209": "hwg_b6_exp_6275",
  "hwg_b6_exp_6231": "hwg_b6_exp_6275",
  "hwg_b6_exp_6253": "hwg_b6_exp_6275",
  "hwg_b6_exp_6297": "hwg_b6_exp_6275",
  "hwg_b6_exp_6319": "hwg_b6_exp_6275",
  "hwg_b6_exp_6341": "hwg_b6_exp_6275",
  "hwg_b6_exp_6276": "hwg_b6_exp_6276",
  "hwg_b6_exp_6188": "hwg_b6_exp_6276",
  "hwg_b6_exp_6210": "hwg_b6_exp_6276",
  "hwg_b6_exp_6232": "hwg_b6_exp_6276",
  "hwg_b6_exp_6254": "hwg_b6_exp_6276",
  "hwg_b6_exp_6298": "hwg_b6_exp_6276",
  "hwg_b6_exp_6320": "hwg_b6_exp_6276",
  "hwg_b6_exp_6342": "hwg_b6_exp_6276",
  "hwg_b6_exp_6277": "hwg_b6_exp_6277",
  "hwg_b6_exp_6189": "hwg_b6_exp_6277",
  "hwg_b6_exp_6211": "hwg_b6_exp_6277",
  "hwg_b6_exp_6233": "hwg_b6_exp_6277",
  "hwg_b6_exp_6255": "hwg_b6_exp_6277",
  "hwg_b6_exp_6299": "hwg_b6_exp_6277",
  "hwg_b6_exp_6321": "hwg_b6_exp_6277",
  "hwg_b6_exp_6343": "hwg_b6_exp_6277",
  "hwg_b6_exp_6278": "hwg_b6_exp_6278",
  "hwg_b6_exp_6190": "hwg_b6_exp_6278",
  "hwg_b6_exp_6212": "hwg_b6_exp_6278",
  "hwg_b6_exp_6234": "hwg_b6_exp_6278",
  "hwg_b6_exp_6256": "hwg_b6_exp_6278",
  "hwg_b6_exp_6300": "hwg_b6_exp_6278",
  "hwg_b6_exp_6322": "hwg_b6_exp_6278",
  "hwg_b6_exp_6344": "hwg_b6_exp_6278",
  "hwg_b7_exp_6368": "hwg_b7_exp_6368",
  "hwg_b7_exp_6345": "hwg_b7_exp_6368",
  "hwg_b7_exp_6391": "hwg_b7_exp_6368",
  "hwg_b7_exp_6414": "hwg_b7_exp_6368",
  "hwg_b7_exp_6437": "hwg_b7_exp_6368",
  "hwg_b7_exp_6460": "hwg_b7_exp_6368",
  "hwg_b7_exp_6483": "hwg_b7_exp_6368",
  "hwg_b7_exp_6506": "hwg_b7_exp_6368",
  "hwg_b7_exp_6369": "hwg_b7_exp_6369",
  "hwg_b7_exp_6346": "hwg_b7_exp_6369",
  "hwg_b7_exp_6392": "hwg_b7_exp_6369",
  "hwg_b7_exp_6415": "hwg_b7_exp_6369",
  "hwg_b7_exp_6438": "hwg_b7_exp_6369",
  "hwg_b7_exp_6461": "hwg_b7_exp_6369",
  "hwg_b7_exp_6484": "hwg_b7_exp_6369",
  "hwg_b7_exp_6507": "hwg_b7_exp_6369",
  "hwg_b7_exp_6370": "hwg_b7_exp_6370",
  "hwg_b7_exp_6347": "hwg_b7_exp_6370",
  "hwg_b7_exp_6393": "hwg_b7_exp_6370",
  "hwg_b7_exp_6416": "hwg_b7_exp_6370",
  "hwg_b7_exp_6439": "hwg_b7_exp_6370",
  "hwg_b7_exp_6462": "hwg_b7_exp_6370",
  "hwg_b7_exp_6485": "hwg_b7_exp_6370",
  "hwg_b7_exp_6508": "hwg_b7_exp_6370",
  "hwg_b7_exp_6371": "hwg_b7_exp_6371",
  "hwg_b7_exp_6348": "hwg_b7_exp_6371",
  "hwg_b7_exp_6394": "hwg_b7_exp_6371",
  "hwg_b7_exp_6417": "hwg_b7_exp_6371",
  "hwg_b7_exp_6440": "hwg_b7_exp_6371",
  "hwg_b7_exp_6463": "hwg_b7_exp_6371",
  "hwg_b7_exp_6486": "hwg_b7_exp_6371",
  "hwg_b7_exp_6509": "hwg_b7_exp_6371",
  "hwg_b7_exp_6372": "hwg_b7_exp_6372",
  "hwg_b7_exp_6349": "hwg_b7_exp_6372",
  "hwg_b7_exp_6395": "hwg_b7_exp_6372",
  "hwg_b7_exp_6418": "hwg_b7_exp_6372",
  "hwg_b7_exp_6441": "hwg_b7_exp_6372",
  "hwg_b7_exp_6464": "hwg_b7_exp_6372",
  "hwg_b7_exp_6487": "hwg_b7_exp_6372",
  "hwg_b7_exp_6510": "hwg_b7_exp_6372",
  "hwg_b7_exp_6373": "hwg_b7_exp_6373",
  "hwg_b7_exp_6350": "hwg_b7_exp_6373",
  "hwg_b7_exp_6396": "hwg_b7_exp_6373",
  "hwg_b7_exp_6419": "hwg_b7_exp_6373",
  "hwg_b7_exp_6442": "hwg_b7_exp_6373",
  "hwg_b7_exp_6465": "hwg_b7_exp_6373",
  "hwg_b7_exp_6488": "hwg_b7_exp_6373",
  "hwg_b7_exp_6511": "hwg_b7_exp_6373",
  "hwg_b7_exp_6374": "hwg_b7_exp_6374",
  "hwg_b7_exp_6351": "hwg_b7_exp_6374",
  "hwg_b7_exp_6397": "hwg_b7_exp_6374",
  "hwg_b7_exp_6420": "hwg_b7_exp_6374",
  "hwg_b7_exp_6443": "hwg_b7_exp_6374",
  "hwg_b7_exp_6466": "hwg_b7_exp_6374",
  "hwg_b7_exp_6489": "hwg_b7_exp_6374",
  "hwg_b7_exp_6512": "hwg_b7_exp_6374",
  "hwg_b7_exp_6398": "hwg_b7_exp_6398",
  "hwg_b7_exp_6352": "hwg_b7_exp_6398",
  "hwg_b7_exp_6375": "hwg_b7_exp_6398",
  "hwg_b7_exp_6421": "hwg_b7_exp_6398",
  "hwg_b7_exp_6444": "hwg_b7_exp_6398",
  "hwg_b7_exp_6467": "hwg_b7_exp_6398",
  "hwg_b7_exp_6490": "hwg_b7_exp_6398",
  "hwg_b7_exp_6513": "hwg_b7_exp_6398",
  "hwg_b7_exp_6399": "hwg_b7_exp_6399",
  "hwg_b7_exp_6353": "hwg_b7_exp_6399",
  "hwg_b7_exp_6376": "hwg_b7_exp_6399",
  "hwg_b7_exp_6422": "hwg_b7_exp_6399",
  "hwg_b7_exp_6445": "hwg_b7_exp_6399",
  "hwg_b7_exp_6468": "hwg_b7_exp_6399",
  "hwg_b7_exp_6491": "hwg_b7_exp_6399",
  "hwg_b7_exp_6514": "hwg_b7_exp_6399",
  "hwg_b7_exp_6400": "hwg_b7_exp_6400",
  "hwg_b7_exp_6354": "hwg_b7_exp_6400",
  "hwg_b7_exp_6377": "hwg_b7_exp_6400",
  "hwg_b7_exp_6423": "hwg_b7_exp_6400",
  "hwg_b7_exp_6446": "hwg_b7_exp_6400",
  "hwg_b7_exp_6469": "hwg_b7_exp_6400",
  "hwg_b7_exp_6492": "hwg_b7_exp_6400",
  "hwg_b7_exp_6515": "hwg_b7_exp_6400",
  "hwg_b7_exp_6401": "hwg_b7_exp_6401",
  "hwg_b7_exp_6355": "hwg_b7_exp_6401",
  "hwg_b7_exp_6378": "hwg_b7_exp_6401",
  "hwg_b7_exp_6424": "hwg_b7_exp_6401",
  "hwg_b7_exp_6447": "hwg_b7_exp_6401",
  "hwg_b7_exp_6470": "hwg_b7_exp_6401",
  "hwg_b7_exp_6493": "hwg_b7_exp_6401",
  "hwg_b7_exp_6516": "hwg_b7_exp_6401",
  "hwg_b7_exp_6402": "hwg_b7_exp_6402",
  "hwg_b7_exp_6356": "hwg_b7_exp_6402",
  "hwg_b7_exp_6379": "hwg_b7_exp_6402",
  "hwg_b7_exp_6425": "hwg_b7_exp_6402",
  "hwg_b7_exp_6448": "hwg_b7_exp_6402",
  "hwg_b7_exp_6471": "hwg_b7_exp_6402",
  "hwg_b7_exp_6494": "hwg_b7_exp_6402",
  "hwg_b7_exp_6517": "hwg_b7_exp_6402",
  "hwg_b7_exp_6472": "hwg_b7_exp_6472",
  "hwg_b7_exp_6357": "hwg_b7_exp_6472",
  "hwg_b7_exp_6380": "hwg_b7_exp_6472",
  "hwg_b7_exp_6403": "hwg_b7_exp_6472",
  "hwg_b7_exp_6426": "hwg_b7_exp_6472",
  "hwg_b7_exp_6449": "hwg_b7_exp_6472",
  "hwg_b7_exp_6495": "hwg_b7_exp_6472",
  "hwg_b7_exp_6518": "hwg_b7_exp_6472",
  "hwg_b7_exp_6473": "hwg_b7_exp_6473",
  "hwg_b7_exp_6358": "hwg_b7_exp_6473",
  "hwg_b7_exp_6381": "hwg_b7_exp_6473",
  "hwg_b7_exp_6404": "hwg_b7_exp_6473",
  "hwg_b7_exp_6427": "hwg_b7_exp_6473",
  "hwg_b7_exp_6450": "hwg_b7_exp_6473",
  "hwg_b7_exp_6496": "hwg_b7_exp_6473",
  "hwg_b7_exp_6519": "hwg_b7_exp_6473",
  "hwg_b7_exp_6474": "hwg_b7_exp_6474",
  "hwg_b7_exp_6359": "hwg_b7_exp_6474",
  "hwg_b7_exp_6382": "hwg_b7_exp_6474",
  "hwg_b7_exp_6405": "hwg_b7_exp_6474",
  "hwg_b7_exp_6428": "hwg_b7_exp_6474",
  "hwg_b7_exp_6451": "hwg_b7_exp_6474",
  "hwg_b7_exp_6497": "hwg_b7_exp_6474",
  "hwg_b7_exp_6520": "hwg_b7_exp_6474",
  "hwg_b7_exp_6383": "hwg_b7_exp_6383",
  "hwg_b7_exp_6360": "hwg_b7_exp_6383",
  "hwg_b7_exp_6406": "hwg_b7_exp_6383",
  "hwg_b7_exp_6429": "hwg_b7_exp_6383",
  "hwg_b7_exp_6452": "hwg_b7_exp_6383",
  "hwg_b7_exp_6475": "hwg_b7_exp_6383",
  "hwg_b7_exp_6498": "hwg_b7_exp_6383",
  "hwg_b7_exp_6521": "hwg_b7_exp_6383",
  "hwg_b7_exp_6384": "hwg_b7_exp_6384",
  "hwg_b7_exp_6361": "hwg_b7_exp_6384",
  "hwg_b7_exp_6407": "hwg_b7_exp_6384",
  "hwg_b7_exp_6430": "hwg_b7_exp_6384",
  "hwg_b7_exp_6453": "hwg_b7_exp_6384",
  "hwg_b7_exp_6476": "hwg_b7_exp_6384",
  "hwg_b7_exp_6499": "hwg_b7_exp_6384",
  "hwg_b7_exp_6522": "hwg_b7_exp_6384",
  "hwg_b7_exp_6385": "hwg_b7_exp_6385",
  "hwg_b7_exp_6362": "hwg_b7_exp_6385",
  "hwg_b7_exp_6408": "hwg_b7_exp_6385",
  "hwg_b7_exp_6431": "hwg_b7_exp_6385",
  "hwg_b7_exp_6454": "hwg_b7_exp_6385",
  "hwg_b7_exp_6477": "hwg_b7_exp_6385",
  "hwg_b7_exp_6500": "hwg_b7_exp_6385",
  "hwg_b7_exp_6523": "hwg_b7_exp_6385",
  "hwg_b7_exp_6386": "hwg_b7_exp_6386",
  "hwg_b7_exp_6363": "hwg_b7_exp_6386",
  "hwg_b7_exp_6409": "hwg_b7_exp_6386",
  "hwg_b7_exp_6432": "hwg_b7_exp_6386",
  "hwg_b7_exp_6455": "hwg_b7_exp_6386",
  "hwg_b7_exp_6478": "hwg_b7_exp_6386",
  "hwg_b7_exp_6501": "hwg_b7_exp_6386",
  "hwg_b7_exp_6524": "hwg_b7_exp_6386",
  "hwg_b7_exp_6387": "hwg_b7_exp_6387",
  "hwg_b7_exp_6364": "hwg_b7_exp_6387",
  "hwg_b7_exp_6410": "hwg_b7_exp_6387",
  "hwg_b7_exp_6433": "hwg_b7_exp_6387",
  "hwg_b7_exp_6456": "hwg_b7_exp_6387",
  "hwg_b7_exp_6479": "hwg_b7_exp_6387",
  "hwg_b7_exp_6502": "hwg_b7_exp_6387",
  "hwg_b7_exp_6525": "hwg_b7_exp_6387",
  "hwg_b7_exp_6388": "hwg_b7_exp_6388",
  "hwg_b7_exp_6365": "hwg_b7_exp_6388",
  "hwg_b7_exp_6411": "hwg_b7_exp_6388",
  "hwg_b7_exp_6434": "hwg_b7_exp_6388",
  "hwg_b7_exp_6457": "hwg_b7_exp_6388",
  "hwg_b7_exp_6480": "hwg_b7_exp_6388",
  "hwg_b7_exp_6503": "hwg_b7_exp_6388",
  "hwg_b7_exp_6526": "hwg_b7_exp_6388",
  "hwg_b7_exp_6389": "hwg_b7_exp_6389",
  "hwg_b7_exp_6366": "hwg_b7_exp_6389",
  "hwg_b7_exp_6412": "hwg_b7_exp_6389",
  "hwg_b7_exp_6435": "hwg_b7_exp_6389",
  "hwg_b7_exp_6458": "hwg_b7_exp_6389",
  "hwg_b7_exp_6481": "hwg_b7_exp_6389",
  "hwg_b7_exp_6504": "hwg_b7_exp_6389",
  "hwg_b7_exp_6527": "hwg_b7_exp_6389",
  "hwg_b7_exp_6413": "hwg_b7_exp_6413",
  "hwg_b7_exp_6367": "hwg_b7_exp_6413",
  "hwg_b7_exp_6390": "hwg_b7_exp_6413",
  "hwg_b7_exp_6436": "hwg_b7_exp_6413",
  "hwg_b7_exp_6459": "hwg_b7_exp_6413",
  "hwg_b7_exp_6482": "hwg_b7_exp_6413",
  "hwg_b7_exp_6505": "hwg_b7_exp_6413",
  "hwg_b7_exp_6528": "hwg_b7_exp_6413",
  "hwg_b8_exp_6550": "hwg_b8_exp_6550",
  "hwg_b8_exp_6529": "hwg_b8_exp_6550",
  "hwg_b8_exp_6571": "hwg_b8_exp_6550",
  "hwg_b8_exp_6592": "hwg_b8_exp_6550",
  "hwg_b8_exp_6613": "hwg_b8_exp_6550",
  "hwg_b8_exp_6634": "hwg_b8_exp_6550",
  "hwg_b8_exp_6655": "hwg_b8_exp_6550",
  "hwg_b8_exp_6676": "hwg_b8_exp_6550",
  "hwg_b8_exp_6551": "hwg_b8_exp_6551",
  "hwg_b8_exp_6530": "hwg_b8_exp_6551",
  "hwg_b8_exp_6572": "hwg_b8_exp_6551",
  "hwg_b8_exp_6593": "hwg_b8_exp_6551",
  "hwg_b8_exp_6614": "hwg_b8_exp_6551",
  "hwg_b8_exp_6635": "hwg_b8_exp_6551",
  "hwg_b8_exp_6656": "hwg_b8_exp_6551",
  "hwg_b8_exp_6677": "hwg_b8_exp_6551",
  "hwg_b8_exp_6552": "hwg_b8_exp_6552",
  "hwg_b8_exp_6531": "hwg_b8_exp_6552",
  "hwg_b8_exp_6573": "hwg_b8_exp_6552",
  "hwg_b8_exp_6594": "hwg_b8_exp_6552",
  "hwg_b8_exp_6615": "hwg_b8_exp_6552",
  "hwg_b8_exp_6636": "hwg_b8_exp_6552",
  "hwg_b8_exp_6657": "hwg_b8_exp_6552",
  "hwg_b8_exp_6678": "hwg_b8_exp_6552",
  "hwg_b8_exp_6553": "hwg_b8_exp_6553",
  "hwg_b8_exp_6532": "hwg_b8_exp_6553",
  "hwg_b8_exp_6574": "hwg_b8_exp_6553",
  "hwg_b8_exp_6595": "hwg_b8_exp_6553",
  "hwg_b8_exp_6616": "hwg_b8_exp_6553",
  "hwg_b8_exp_6637": "hwg_b8_exp_6553",
  "hwg_b8_exp_6658": "hwg_b8_exp_6553",
  "hwg_b8_exp_6679": "hwg_b8_exp_6553",
  "hwg_b8_exp_6575": "hwg_b8_exp_6575",
  "hwg_b8_exp_6533": "hwg_b8_exp_6575",
  "hwg_b8_exp_6554": "hwg_b8_exp_6575",
  "hwg_b8_exp_6596": "hwg_b8_exp_6575",
  "hwg_b8_exp_6617": "hwg_b8_exp_6575",
  "hwg_b8_exp_6638": "hwg_b8_exp_6575",
  "hwg_b8_exp_6659": "hwg_b8_exp_6575",
  "hwg_b8_exp_6680": "hwg_b8_exp_6575",
  "hwg_b8_exp_6576": "hwg_b8_exp_6576",
  "hwg_b8_exp_6534": "hwg_b8_exp_6576",
  "hwg_b8_exp_6555": "hwg_b8_exp_6576",
  "hwg_b8_exp_6597": "hwg_b8_exp_6576",
  "hwg_b8_exp_6618": "hwg_b8_exp_6576",
  "hwg_b8_exp_6639": "hwg_b8_exp_6576",
  "hwg_b8_exp_6660": "hwg_b8_exp_6576",
  "hwg_b8_exp_6681": "hwg_b8_exp_6576",
  "hwg_b8_exp_6577": "hwg_b8_exp_6577",
  "hwg_b8_exp_6535": "hwg_b8_exp_6577",
  "hwg_b8_exp_6556": "hwg_b8_exp_6577",
  "hwg_b8_exp_6598": "hwg_b8_exp_6577",
  "hwg_b8_exp_6619": "hwg_b8_exp_6577",
  "hwg_b8_exp_6640": "hwg_b8_exp_6577",
  "hwg_b8_exp_6661": "hwg_b8_exp_6577",
  "hwg_b8_exp_6682": "hwg_b8_exp_6577",
  "hwg_b8_exp_6620": "hwg_b8_exp_6620",
  "hwg_b8_exp_6536": "hwg_b8_exp_6620",
  "hwg_b8_exp_6557": "hwg_b8_exp_6620",
  "hwg_b8_exp_6578": "hwg_b8_exp_6620",
  "hwg_b8_exp_6599": "hwg_b8_exp_6620",
  "hwg_b8_exp_6641": "hwg_b8_exp_6620",
  "hwg_b8_exp_6662": "hwg_b8_exp_6620",
  "hwg_b8_exp_6683": "hwg_b8_exp_6620",
  "hwg_b8_exp_6621": "hwg_b8_exp_6621",
  "hwg_b8_exp_6537": "hwg_b8_exp_6621",
  "hwg_b8_exp_6558": "hwg_b8_exp_6621",
  "hwg_b8_exp_6579": "hwg_b8_exp_6621",
  "hwg_b8_exp_6600": "hwg_b8_exp_6621",
  "hwg_b8_exp_6642": "hwg_b8_exp_6621",
  "hwg_b8_exp_6663": "hwg_b8_exp_6621",
  "hwg_b8_exp_6684": "hwg_b8_exp_6621",
  "hwg_b8_exp_6643": "hwg_b8_exp_6643",
  "hwg_b8_exp_6538": "hwg_b8_exp_6643",
  "hwg_b8_exp_6559": "hwg_b8_exp_6643",
  "hwg_b8_exp_6580": "hwg_b8_exp_6643",
  "hwg_b8_exp_6601": "hwg_b8_exp_6643",
  "hwg_b8_exp_6622": "hwg_b8_exp_6643",
  "hwg_b8_exp_6664": "hwg_b8_exp_6643",
  "hwg_b8_exp_6685": "hwg_b8_exp_6643",
  "hwg_b8_exp_6644": "hwg_b8_exp_6644",
  "hwg_b8_exp_6539": "hwg_b8_exp_6644",
  "hwg_b8_exp_6560": "hwg_b8_exp_6644",
  "hwg_b8_exp_6581": "hwg_b8_exp_6644",
  "hwg_b8_exp_6602": "hwg_b8_exp_6644",
  "hwg_b8_exp_6623": "hwg_b8_exp_6644",
  "hwg_b8_exp_6665": "hwg_b8_exp_6644",
  "hwg_b8_exp_6686": "hwg_b8_exp_6644",
  "hwg_b8_exp_6645": "hwg_b8_exp_6645",
  "hwg_b8_exp_6540": "hwg_b8_exp_6645",
  "hwg_b8_exp_6561": "hwg_b8_exp_6645",
  "hwg_b8_exp_6582": "hwg_b8_exp_6645",
  "hwg_b8_exp_6603": "hwg_b8_exp_6645",
  "hwg_b8_exp_6624": "hwg_b8_exp_6645",
  "hwg_b8_exp_6666": "hwg_b8_exp_6645",
  "hwg_b8_exp_6687": "hwg_b8_exp_6645",
  "hwg_b8_exp_6646": "hwg_b8_exp_6646",
  "hwg_b8_exp_6541": "hwg_b8_exp_6646",
  "hwg_b8_exp_6562": "hwg_b8_exp_6646",
  "hwg_b8_exp_6583": "hwg_b8_exp_6646",
  "hwg_b8_exp_6604": "hwg_b8_exp_6646",
  "hwg_b8_exp_6625": "hwg_b8_exp_6646",
  "hwg_b8_exp_6667": "hwg_b8_exp_6646",
  "hwg_b8_exp_6688": "hwg_b8_exp_6646",
  "hwg_b8_exp_6563": "hwg_b8_exp_6563",
  "hwg_b8_exp_6542": "hwg_b8_exp_6563",
  "hwg_b8_exp_6584": "hwg_b8_exp_6563",
  "hwg_b8_exp_6605": "hwg_b8_exp_6563",
  "hwg_b8_exp_6626": "hwg_b8_exp_6563",
  "hwg_b8_exp_6647": "hwg_b8_exp_6563",
  "hwg_b8_exp_6668": "hwg_b8_exp_6563",
  "hwg_b8_exp_6689": "hwg_b8_exp_6563",
  "hwg_b8_exp_6564": "hwg_b8_exp_6564",
  "hwg_b8_exp_6543": "hwg_b8_exp_6564",
  "hwg_b8_exp_6585": "hwg_b8_exp_6564",
  "hwg_b8_exp_6606": "hwg_b8_exp_6564",
  "hwg_b8_exp_6627": "hwg_b8_exp_6564",
  "hwg_b8_exp_6648": "hwg_b8_exp_6564",
  "hwg_b8_exp_6669": "hwg_b8_exp_6564",
  "hwg_b8_exp_6690": "hwg_b8_exp_6564",
  "hwg_b8_exp_6565": "hwg_b8_exp_6565",
  "hwg_b8_exp_6544": "hwg_b8_exp_6565",
  "hwg_b8_exp_6586": "hwg_b8_exp_6565",
  "hwg_b8_exp_6607": "hwg_b8_exp_6565",
  "hwg_b8_exp_6628": "hwg_b8_exp_6565",
  "hwg_b8_exp_6649": "hwg_b8_exp_6565",
  "hwg_b8_exp_6670": "hwg_b8_exp_6565",
  "hwg_b8_exp_6691": "hwg_b8_exp_6565",
  "hwg_b8_exp_6566": "hwg_b8_exp_6566",
  "hwg_b8_exp_6545": "hwg_b8_exp_6566",
  "hwg_b8_exp_6587": "hwg_b8_exp_6566",
  "hwg_b8_exp_6608": "hwg_b8_exp_6566",
  "hwg_b8_exp_6629": "hwg_b8_exp_6566",
  "hwg_b8_exp_6650": "hwg_b8_exp_6566",
  "hwg_b8_exp_6671": "hwg_b8_exp_6566",
  "hwg_b8_exp_6692": "hwg_b8_exp_6566",
  "hwg_b8_exp_6588": "hwg_b8_exp_6588",
  "hwg_b8_exp_6546": "hwg_b8_exp_6588",
  "hwg_b8_exp_6567": "hwg_b8_exp_6588",
  "hwg_b8_exp_6609": "hwg_b8_exp_6588",
  "hwg_b8_exp_6630": "hwg_b8_exp_6588",
  "hwg_b8_exp_6651": "hwg_b8_exp_6588",
  "hwg_b8_exp_6672": "hwg_b8_exp_6588",
  "hwg_b8_exp_6693": "hwg_b8_exp_6588",
  "hwg_b8_exp_6589": "hwg_b8_exp_6589",
  "hwg_b8_exp_6547": "hwg_b8_exp_6589",
  "hwg_b8_exp_6568": "hwg_b8_exp_6589",
  "hwg_b8_exp_6610": "hwg_b8_exp_6589",
  "hwg_b8_exp_6631": "hwg_b8_exp_6589",
  "hwg_b8_exp_6652": "hwg_b8_exp_6589",
  "hwg_b8_exp_6673": "hwg_b8_exp_6589",
  "hwg_b8_exp_6694": "hwg_b8_exp_6589",
  "hwg_b8_exp_6590": "hwg_b8_exp_6590",
  "hwg_b8_exp_6548": "hwg_b8_exp_6590",
  "hwg_b8_exp_6569": "hwg_b8_exp_6590",
  "hwg_b8_exp_6611": "hwg_b8_exp_6590",
  "hwg_b8_exp_6632": "hwg_b8_exp_6590",
  "hwg_b8_exp_6653": "hwg_b8_exp_6590",
  "hwg_b8_exp_6674": "hwg_b8_exp_6590",
  "hwg_b8_exp_6695": "hwg_b8_exp_6590",
  "hwg_b8_exp_6633": "hwg_b8_exp_6633",
  "hwg_b8_exp_6549": "hwg_b8_exp_6633",
  "hwg_b8_exp_6570": "hwg_b8_exp_6633",
  "hwg_b8_exp_6591": "hwg_b8_exp_6633",
  "hwg_b8_exp_6612": "hwg_b8_exp_6633",
  "hwg_b8_exp_6654": "hwg_b8_exp_6633",
  "hwg_b8_exp_6675": "hwg_b8_exp_6633",
  "hwg_b8_exp_6696": "hwg_b8_exp_6633",
  "hwg_b9_exp_6717": "hwg_b9_exp_6717",
  "hwg_b9_exp_6697": "hwg_b9_exp_6717",
  "hwg_b9_exp_6737": "hwg_b9_exp_6717",
  "hwg_b9_exp_6757": "hwg_b9_exp_6717",
  "hwg_b9_exp_6777": "hwg_b9_exp_6717",
  "hwg_b9_exp_6797": "hwg_b9_exp_6717",
  "hwg_b9_exp_6817": "hwg_b9_exp_6717",
  "hwg_b9_exp_6718": "hwg_b9_exp_6718",
  "hwg_b9_exp_6698": "hwg_b9_exp_6718",
  "hwg_b9_exp_6738": "hwg_b9_exp_6718",
  "hwg_b9_exp_6758": "hwg_b9_exp_6718",
  "hwg_b9_exp_6778": "hwg_b9_exp_6718",
  "hwg_b9_exp_6798": "hwg_b9_exp_6718",
  "hwg_b9_exp_6818": "hwg_b9_exp_6718",
  "hwg_b9_exp_6719": "hwg_b9_exp_6719",
  "hwg_b9_exp_6699": "hwg_b9_exp_6719",
  "hwg_b9_exp_6739": "hwg_b9_exp_6719",
  "hwg_b9_exp_6759": "hwg_b9_exp_6719",
  "hwg_b9_exp_6779": "hwg_b9_exp_6719",
  "hwg_b9_exp_6799": "hwg_b9_exp_6719",
  "hwg_b9_exp_6819": "hwg_b9_exp_6719",
  "hwg_b9_exp_6720": "hwg_b9_exp_6720",
  "hwg_b9_exp_6700": "hwg_b9_exp_6720",
  "hwg_b9_exp_6740": "hwg_b9_exp_6720",
  "hwg_b9_exp_6760": "hwg_b9_exp_6720",
  "hwg_b9_exp_6780": "hwg_b9_exp_6720",
  "hwg_b9_exp_6800": "hwg_b9_exp_6720",
  "hwg_b9_exp_6820": "hwg_b9_exp_6720",
  "hwg_b9_exp_6801": "hwg_b9_exp_6801",
  "hwg_b9_exp_6701": "hwg_b9_exp_6801",
  "hwg_b9_exp_6721": "hwg_b9_exp_6801",
  "hwg_b9_exp_6741": "hwg_b9_exp_6801",
  "hwg_b9_exp_6761": "hwg_b9_exp_6801",
  "hwg_b9_exp_6781": "hwg_b9_exp_6801",
  "hwg_b9_exp_6821": "hwg_b9_exp_6801",
  "hwg_b9_exp_6802": "hwg_b9_exp_6802",
  "hwg_b9_exp_6702": "hwg_b9_exp_6802",
  "hwg_b9_exp_6722": "hwg_b9_exp_6802",
  "hwg_b9_exp_6742": "hwg_b9_exp_6802",
  "hwg_b9_exp_6762": "hwg_b9_exp_6802",
  "hwg_b9_exp_6782": "hwg_b9_exp_6802",
  "hwg_b9_exp_6822": "hwg_b9_exp_6802",
  "hwg_b9_exp_6743": "hwg_b9_exp_6743",
  "hwg_b9_exp_6703": "hwg_b9_exp_6743",
  "hwg_b9_exp_6723": "hwg_b9_exp_6743",
  "hwg_b9_exp_6763": "hwg_b9_exp_6743",
  "hwg_b9_exp_6783": "hwg_b9_exp_6743",
  "hwg_b9_exp_6803": "hwg_b9_exp_6743",
  "hwg_b9_exp_6823": "hwg_b9_exp_6743",
  "hwg_b9_exp_6744": "hwg_b9_exp_6744",
  "hwg_b9_exp_6704": "hwg_b9_exp_6744",
  "hwg_b9_exp_6724": "hwg_b9_exp_6744",
  "hwg_b9_exp_6764": "hwg_b9_exp_6744",
  "hwg_b9_exp_6784": "hwg_b9_exp_6744",
  "hwg_b9_exp_6804": "hwg_b9_exp_6744",
  "hwg_b9_exp_6824": "hwg_b9_exp_6744",
  "hwg_b9_exp_6785": "hwg_b9_exp_6785",
  "hwg_b9_exp_6705": "hwg_b9_exp_6785",
  "hwg_b9_exp_6725": "hwg_b9_exp_6785",
  "hwg_b9_exp_6745": "hwg_b9_exp_6785",
  "hwg_b9_exp_6765": "hwg_b9_exp_6785",
  "hwg_b9_exp_6805": "hwg_b9_exp_6785",
  "hwg_b9_exp_6825": "hwg_b9_exp_6785",
  "hwg_b9_exp_6786": "hwg_b9_exp_6786",
  "hwg_b9_exp_6706": "hwg_b9_exp_6786",
  "hwg_b9_exp_6726": "hwg_b9_exp_6786",
  "hwg_b9_exp_6746": "hwg_b9_exp_6786",
  "hwg_b9_exp_6766": "hwg_b9_exp_6786",
  "hwg_b9_exp_6806": "hwg_b9_exp_6786",
  "hwg_b9_exp_6826": "hwg_b9_exp_6786",
  "hwg_b9_exp_6807": "hwg_b9_exp_6807",
  "hwg_b9_exp_6707": "hwg_b9_exp_6807",
  "hwg_b9_exp_6727": "hwg_b9_exp_6807",
  "hwg_b9_exp_6747": "hwg_b9_exp_6807",
  "hwg_b9_exp_6767": "hwg_b9_exp_6807",
  "hwg_b9_exp_6787": "hwg_b9_exp_6807",
  "hwg_b9_exp_6827": "hwg_b9_exp_6807",
  "hwg_b9_exp_6808": "hwg_b9_exp_6808",
  "hwg_b9_exp_6708": "hwg_b9_exp_6808",
  "hwg_b9_exp_6728": "hwg_b9_exp_6808",
  "hwg_b9_exp_6748": "hwg_b9_exp_6808",
  "hwg_b9_exp_6768": "hwg_b9_exp_6808",
  "hwg_b9_exp_6788": "hwg_b9_exp_6808",
  "hwg_b9_exp_6828": "hwg_b9_exp_6808",
  "hwg_b9_exp_6729": "hwg_b9_exp_6729",
  "hwg_b9_exp_6709": "hwg_b9_exp_6729",
  "hwg_b9_exp_6749": "hwg_b9_exp_6729",
  "hwg_b9_exp_6769": "hwg_b9_exp_6729",
  "hwg_b9_exp_6789": "hwg_b9_exp_6729",
  "hwg_b9_exp_6809": "hwg_b9_exp_6729",
  "hwg_b9_exp_6829": "hwg_b9_exp_6729",
  "hwg_b9_exp_6730": "hwg_b9_exp_6730",
  "hwg_b9_exp_6710": "hwg_b9_exp_6730",
  "hwg_b9_exp_6750": "hwg_b9_exp_6730",
  "hwg_b9_exp_6770": "hwg_b9_exp_6730",
  "hwg_b9_exp_6790": "hwg_b9_exp_6730",
  "hwg_b9_exp_6810": "hwg_b9_exp_6730",
  "hwg_b9_exp_6830": "hwg_b9_exp_6730",
  "hwg_b9_exp_6731": "hwg_b9_exp_6731",
  "hwg_b9_exp_6711": "hwg_b9_exp_6731",
  "hwg_b9_exp_6751": "hwg_b9_exp_6731",
  "hwg_b9_exp_6771": "hwg_b9_exp_6731",
  "hwg_b9_exp_6791": "hwg_b9_exp_6731",
  "hwg_b9_exp_6811": "hwg_b9_exp_6731",
  "hwg_b9_exp_6831": "hwg_b9_exp_6731",
  "hwg_b9_exp_6732": "hwg_b9_exp_6732",
  "hwg_b9_exp_6712": "hwg_b9_exp_6732",
  "hwg_b9_exp_6752": "hwg_b9_exp_6732",
  "hwg_b9_exp_6772": "hwg_b9_exp_6732",
  "hwg_b9_exp_6792": "hwg_b9_exp_6732",
  "hwg_b9_exp_6812": "hwg_b9_exp_6732",
  "hwg_b9_exp_6832": "hwg_b9_exp_6732",
  "hwg_b9_exp_6813": "hwg_b9_exp_6813",
  "hwg_b9_exp_6713": "hwg_b9_exp_6813",
  "hwg_b9_exp_6733": "hwg_b9_exp_6813",
  "hwg_b9_exp_6753": "hwg_b9_exp_6813",
  "hwg_b9_exp_6773": "hwg_b9_exp_6813",
  "hwg_b9_exp_6793": "hwg_b9_exp_6813",
  "hwg_b9_exp_6833": "hwg_b9_exp_6813",
  "hwg_b9_exp_6814": "hwg_b9_exp_6814",
  "hwg_b9_exp_6714": "hwg_b9_exp_6814",
  "hwg_b9_exp_6734": "hwg_b9_exp_6814",
  "hwg_b9_exp_6754": "hwg_b9_exp_6814",
  "hwg_b9_exp_6774": "hwg_b9_exp_6814",
  "hwg_b9_exp_6794": "hwg_b9_exp_6814",
  "hwg_b9_exp_6834": "hwg_b9_exp_6814",
  "hwg_b9_exp_6755": "hwg_b9_exp_6755",
  "hwg_b9_exp_6715": "hwg_b9_exp_6755",
  "hwg_b9_exp_6735": "hwg_b9_exp_6755",
  "hwg_b9_exp_6775": "hwg_b9_exp_6755",
  "hwg_b9_exp_6795": "hwg_b9_exp_6755",
  "hwg_b9_exp_6815": "hwg_b9_exp_6755",
  "hwg_b9_exp_6835": "hwg_b9_exp_6755",
  "hwg_b9_exp_6756": "hwg_b9_exp_6756",
  "hwg_b9_exp_6716": "hwg_b9_exp_6756",
  "hwg_b9_exp_6736": "hwg_b9_exp_6756",
  "hwg_b9_exp_6776": "hwg_b9_exp_6756",
  "hwg_b9_exp_6796": "hwg_b9_exp_6756",
  "hwg_b9_exp_6816": "hwg_b9_exp_6756",
  "hwg_b9_exp_6836": "hwg_b9_exp_6756",
  "hwg_bg1_exp_6837": "hwg_bg1_exp_6837",
  "hwg_bg1_exp_6838": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6839": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6841": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6866": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6870": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6875": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6885": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6901": "hwg_bg1_exp_6838",
  "hwg_bg1_exp_6840": "hwg_bg1_exp_6840",
  "hwg_bg1_exp_6864": "hwg_bg1_exp_6840",
  "hwg_bg1_exp_6842": "hwg_bg1_exp_6842",
  "hwg_bg1_exp_6886": "hwg_bg1_exp_6842",
  "hwg_bg1_exp_6903": "hwg_bg1_exp_6842",
  "hwg_bg1_exp_6843": "hwg_bg1_exp_6843",
  "hwg_bg1_exp_6852": "hwg_bg1_exp_6843",
  "hwg_bg1_exp_6906": "hwg_bg1_exp_6843",
  "hwg_bg1_exp_6844": "hwg_bg1_exp_6844",
  "hwg_bg1_exp_6856": "hwg_bg1_exp_6844",
  "hwg_bg1_exp_6871": "hwg_bg1_exp_6844",
  "hwg_bg1_exp_6880": "hwg_bg1_exp_6844",
  "hwg_bg1_exp_6845": "hwg_bg1_exp_6845",
  "hwg_bg1_exp_6849": "hwg_bg1_exp_6845",
  "hwg_bg1_exp_6867": "hwg_bg1_exp_6845",
  "hwg_bg1_exp_6846": "hwg_bg1_exp_6846",
  "hwg_bg1_exp_6851": "hwg_bg1_exp_6846",
  "hwg_bg1_exp_6854": "hwg_bg1_exp_6846",
  "hwg_bg1_exp_6855": "hwg_bg1_exp_6846",
  "hwg_bg1_exp_6859": "hwg_bg1_exp_6846",
  "hwg_bg1_exp_6869": "hwg_bg1_exp_6846",
  "hwg_bg1_exp_6907": "hwg_bg1_exp_6846",
  "hwg_bg1_exp_6847": "hwg_bg1_exp_6847",
  "hwg_bg1_exp_6905": "hwg_bg1_exp_6847",
  "hwg_bg1_exp_6848": "hwg_bg1_exp_6848",
  "hwg_bg1_exp_6858": "hwg_bg1_exp_6848",
  "hwg_bg1_exp_6899": "hwg_bg1_exp_6848",
  "hwg_bg1_exp_6900": "hwg_bg1_exp_6848",
  "hwg_bg1_exp_6850": "hwg_bg1_exp_6850",
  "hwg_bg1_exp_6878": "hwg_bg1_exp_6850",
  "hwg_bg1_exp_6853": "hwg_bg1_exp_6853",
  "hwg_bg1_exp_6863": "hwg_bg1_exp_6853",
  "hwg_bg1_exp_6857": "hwg_bg1_exp_6857",
  "hwg_bg1_exp_6877": "hwg_bg1_exp_6857",
  "hwg_bg1_exp_6860": "hwg_bg1_exp_6860",
  "hwg_bg1_exp_6865": "hwg_bg1_exp_6860",
  "hwg_bg1_exp_6894": "hwg_bg1_exp_6860",
  "hwg_bg1_exp_6902": "hwg_bg1_exp_6860",
  "hwg_bg1_exp_6904": "hwg_bg1_exp_6860",
  "hwg_bg1_exp_6861": "hwg_bg1_exp_6861",
  "hwg_bg1_exp_6872": "hwg_bg1_exp_6861",
  "hwg_bg1_exp_6882": "hwg_bg1_exp_6861",
  "hwg_bg1_exp_6891": "hwg_bg1_exp_6861",
  "hwg_bg1_exp_6862": "hwg_bg1_exp_6862",
  "hwg_bg1_exp_6879": "hwg_bg1_exp_6862",
  "hwg_bg1_exp_6868": "hwg_bg1_exp_6868",
  "hwg_bg1_exp_6876": "hwg_bg1_exp_6868",
  "hwg_bg1_exp_6889": "hwg_bg1_exp_6868",
  "hwg_bg1_exp_6873": "hwg_bg1_exp_6873",
  "hwg_bg1_exp_6887": "hwg_bg1_exp_6873",
  "hwg_bg1_exp_6897": "hwg_bg1_exp_6873",
  "hwg_bg1_exp_6898": "hwg_bg1_exp_6873",
  "hwg_bg1_exp_6874": "hwg_bg1_exp_6874",
  "hwg_bg1_exp_6888": "hwg_bg1_exp_6874",
  "hwg_bg1_exp_6881": "hwg_bg1_exp_6881",
  "hwg_bg1_exp_6892": "hwg_bg1_exp_6881",
  "hwg_bg1_exp_6895": "hwg_bg1_exp_6881",
  "hwg_bg1_exp_6883": "hwg_bg1_exp_6883",
  "hwg_bg1_exp_6893": "hwg_bg1_exp_6883",
  "hwg_bg1_exp_6896": "hwg_bg1_exp_6883",
  "hwg_bg1_exp_6884": "hwg_bg1_exp_6884",
  "hwg_bg1_exp_6890": "hwg_bg1_exp_6890",
  "hwg_bg1_exp_6908": "hwg_bg1_exp_6890",
  "hwg_bg2_exp_6909": "hwg_bg2_exp_6909",
  "hwg_bg2_exp_6918": "hwg_bg2_exp_6909",
  "hwg_bg2_exp_6979": "hwg_bg2_exp_6909",
  "hwg_bg2_exp_7015": "hwg_bg2_exp_6909",
  "hwg_bg2_exp_6910": "hwg_bg2_exp_6910",
  "hwg_bg2_exp_7000": "hwg_bg2_exp_6910",
  "hwg_bg2_exp_7014": "hwg_bg2_exp_6910",
  "hwg_bg2_exp_6911": "hwg_bg2_exp_6911",
  "hwg_bg2_exp_6941": "hwg_bg2_exp_6911",
  "hwg_bg2_exp_6944": "hwg_bg2_exp_6911",
  "hwg_bg2_exp_7006": "hwg_bg2_exp_6911",
  "hwg_bg2_exp_6912": "hwg_bg2_exp_6912",
  "hwg_bg2_exp_6986": "hwg_bg2_exp_6912",
  "hwg_bg2_exp_6913": "hwg_bg2_exp_6913",
  "hwg_bg2_exp_6974": "hwg_bg2_exp_6913",
  "hwg_bg2_exp_6977": "hwg_bg2_exp_6913",
  "hwg_bg2_exp_6914": "hwg_bg2_exp_6914",
  "hwg_bg2_exp_7001": "hwg_bg2_exp_6914",
  "hwg_bg2_exp_7004": "hwg_bg2_exp_6914",
  "hwg_bg2_exp_6915": "hwg_bg2_exp_6915",
  "hwg_bg2_exp_6943": "hwg_bg2_exp_6915",
  "hwg_bg2_exp_6948": "hwg_bg2_exp_6915",
  "hwg_bg2_exp_7013": "hwg_bg2_exp_6915",
  "hwg_bg2_exp_6916": "hwg_bg2_exp_6916",
  "hwg_bg2_exp_6973": "hwg_bg2_exp_6916",
  "hwg_bg2_exp_6917": "hwg_bg2_exp_6917",
  "hwg_bg2_exp_6919": "hwg_bg2_exp_6919",
  "hwg_bg2_exp_6920": "hwg_bg2_exp_6920",
  "hwg_bg2_exp_7008": "hwg_bg2_exp_6920",
  "hwg_bg2_exp_7010": "hwg_bg2_exp_6920",
  "hwg_bg2_exp_6921": "hwg_bg2_exp_6921",
  "hwg_bg2_exp_6924": "hwg_bg2_exp_6921",
  "hwg_bg2_exp_6950": "hwg_bg2_exp_6921",
  "hwg_bg2_exp_6971": "hwg_bg2_exp_6921",
  "hwg_bg2_exp_6922": "hwg_bg2_exp_6922",
  "hwg_bg2_exp_6926": "hwg_bg2_exp_6922",
  "hwg_bg2_exp_6923": "hwg_bg2_exp_6923",
  "hwg_bg2_exp_6956": "hwg_bg2_exp_6923",
  "hwg_bg2_exp_6976": "hwg_bg2_exp_6923",
  "hwg_bg2_exp_7007": "hwg_bg2_exp_6923",
  "hwg_bg2_exp_6925": "hwg_bg2_exp_6925",
  "hwg_bg2_exp_6939": "hwg_bg2_exp_6925",
  "hwg_bg2_exp_6951": "hwg_bg2_exp_6925",
  "hwg_bg2_exp_6952": "hwg_bg2_exp_6925",
  "hwg_bg2_exp_6980": "hwg_bg2_exp_6925",
  "hwg_bg2_exp_7011": "hwg_bg2_exp_6925",
  "hwg_bg2_exp_7016": "hwg_bg2_exp_6925",
  "hwg_bg2_exp_6927": "hwg_bg2_exp_6927",
  "hwg_bg2_exp_6928": "hwg_bg2_exp_6928",
  "hwg_bg2_exp_6932": "hwg_bg2_exp_6928",
  "hwg_bg2_exp_6929": "hwg_bg2_exp_6929",
  "hwg_bg2_exp_7018": "hwg_bg2_exp_6929",
  "hwg_bg2_exp_6930": "hwg_bg2_exp_6930",
  "hwg_bg2_exp_6937": "hwg_bg2_exp_6930",
  "hwg_bg2_exp_6997": "hwg_bg2_exp_6930",
  "hwg_bg2_exp_7020": "hwg_bg2_exp_6930",
  "hwg_bg2_exp_6931": "hwg_bg2_exp_6931",
  "hwg_bg2_exp_6957": "hwg_bg2_exp_6931",
  "hwg_bg2_exp_6995": "hwg_bg2_exp_6931",
  "hwg_bg2_exp_6933": "hwg_bg2_exp_6933",
  "hwg_bg2_exp_6936": "hwg_bg2_exp_6933",
  "hwg_bg2_exp_6938": "hwg_bg2_exp_6933",
  "hwg_bg2_exp_7019": "hwg_bg2_exp_6933",
  "hwg_bg2_exp_7026": "hwg_bg2_exp_6933",
  "hwg_bg2_exp_6934": "hwg_bg2_exp_6934",
  "hwg_bg2_exp_6992": "hwg_bg2_exp_6934",
  "hwg_bg2_exp_6996": "hwg_bg2_exp_6934",
  "hwg_bg2_exp_6935": "hwg_bg2_exp_6935",
  "hwg_bg2_exp_7025": "hwg_bg2_exp_6935",
  "hwg_bg2_exp_6940": "hwg_bg2_exp_6940",
  "hwg_bg2_exp_6949": "hwg_bg2_exp_6940",
  "hwg_bg2_exp_6969": "hwg_bg2_exp_6940",
  "hwg_bg2_exp_6981": "hwg_bg2_exp_6940",
  "hwg_bg2_exp_6942": "hwg_bg2_exp_6942",
  "hwg_bg2_exp_6975": "hwg_bg2_exp_6942",
  "hwg_bg2_exp_7005": "hwg_bg2_exp_6942",
  "hwg_bg2_exp_6945": "hwg_bg2_exp_6945",
  "hwg_bg2_exp_6947": "hwg_bg2_exp_6945",
  "hwg_bg2_exp_6984": "hwg_bg2_exp_6945",
  "hwg_bg2_exp_7009": "hwg_bg2_exp_6945",
  "hwg_bg2_exp_7012": "hwg_bg2_exp_6945",
  "hwg_bg2_exp_6946": "hwg_bg2_exp_6946",
  "hwg_bg2_exp_6970": "hwg_bg2_exp_6946",
  "hwg_bg2_exp_6953": "hwg_bg2_exp_6953",
  "hwg_bg2_exp_6972": "hwg_bg2_exp_6953",
  "hwg_bg2_exp_6982": "hwg_bg2_exp_6953",
  "hwg_bg2_exp_6983": "hwg_bg2_exp_6953",
  "hwg_bg2_exp_6954": "hwg_bg2_exp_6954",
  "hwg_bg2_exp_6978": "hwg_bg2_exp_6954",
  "hwg_bg2_exp_6999": "hwg_bg2_exp_6954",
  "hwg_bg2_exp_7002": "hwg_bg2_exp_6954",
  "hwg_bg2_exp_6955": "hwg_bg2_exp_6955",
  "hwg_bg2_exp_6985": "hwg_bg2_exp_6955",
  "hwg_bg2_exp_6958": "hwg_bg2_exp_6958",
  "hwg_bg2_exp_6959": "hwg_bg2_exp_6959",
  "hwg_bg2_exp_6963": "hwg_bg2_exp_6959",
  "hwg_bg2_exp_6960": "hwg_bg2_exp_6960",
  "hwg_bg2_exp_6967": "hwg_bg2_exp_6960",
  "hwg_bg2_exp_6961": "hwg_bg2_exp_6961",
  "hwg_bg2_exp_7027": "hwg_bg2_exp_6961",
  "hwg_bg2_exp_6962": "hwg_bg2_exp_6962",
  "hwg_bg2_exp_6964": "hwg_bg2_exp_6962",
  "hwg_bg2_exp_6994": "hwg_bg2_exp_6962",
  "hwg_bg2_exp_6965": "hwg_bg2_exp_6965",
  "hwg_bg2_exp_6966": "hwg_bg2_exp_6965",
  "hwg_bg2_exp_6968": "hwg_bg2_exp_6965",
  "hwg_bg2_exp_6987": "hwg_bg2_exp_6987",
  "hwg_bg2_exp_6990": "hwg_bg2_exp_6987",
  "hwg_bg2_exp_6988": "hwg_bg2_exp_6988",
  "hwg_bg2_exp_6989": "hwg_bg2_exp_6989",
  "hwg_bg2_exp_6991": "hwg_bg2_exp_6991",
  "hwg_bg2_exp_7023": "hwg_bg2_exp_6991",
  "hwg_bg2_exp_7024": "hwg_bg2_exp_6991",
  "hwg_bg2_exp_6993": "hwg_bg2_exp_6993",
  "hwg_bg2_exp_6998": "hwg_bg2_exp_6998",
  "hwg_bg2_exp_7003": "hwg_bg2_exp_7003",
  "hwg_bg2_exp_7017": "hwg_bg2_exp_7017",
  "hwg_bg2_exp_7022": "hwg_bg2_exp_7017",
  "hwg_bg2_exp_7028": "hwg_bg2_exp_7017",
  "hwg_bg2_exp_7021": "hwg_bg2_exp_7021",
  "hwg_b1_ba_01": "hwg_b1_ba_01",
  "hwg_b1_ba_02": "hwg_b1_ba_02",
  "hwg_b1_ba_03": "hwg_b1_ba_03",
  "hwg_b1_ba_04": "hwg_b1_ba_04",
  "hwg_b1_ba_05": "hwg_b1_ba_05",
  "hwg_b1_ba_06": "hwg_b1_ba_06",
  "hwg_b1_ba_07": "hwg_b1_ba_07",
  "hwg_b1_ba_08": "hwg_b1_ba_08",
  "hwg_b1_ba_09": "hwg_b1_ba_09",
  "hwg_b1_ba_10": "hwg_b1_ba_10",
  "hwg_b1_ba_11": "hwg_b1_ba_11",
  "hwg_b1_ba_12": "hwg_b1_ba_12",
  "hwg_b1_ba_13": "hwg_b1_ba_13",
  "hwg_b1_ba_14": "hwg_b1_ba_14",
  "hwg_b1_ba_15": "hwg_b1_ba_15",
  "hwg_b1_ba_16": "hwg_b1_ba_16",
  "hwg_b1_ba_17": "hwg_b1_ba_17",
  "hwg_b1_ba_18": "hwg_b1_ba_18",
  "hwg_b1_ba_19": "hwg_b1_ba_19",
  "hwg_b1_ba_20": "hwg_b1_ba_20",
  "hwg_b1_ba_21": "hwg_b1_ba_21",
  "hwg_b1_ba_22": "hwg_b1_ba_22",
  "hwg_b1_ba_23": "hwg_b1_ba_23",
  "hwg_b1_ba_24": "hwg_b1_ba_24",
  "hwg_b1_ba_25": "hwg_b1_ba_25",
  "hwg_b1_ba_26": "hwg_b1_ba_26",
  "hwg_b1_ba_27": "hwg_b1_ba_27",
  "hwg_b1_ba_28": "hwg_b1_ba_28",
  "hwg_b1_ba_29": "hwg_b1_ba_29",
  "hwg_b1_ba_30": "hwg_b1_ba_30",
  "hwg_b1_ba_31": "hwg_b1_ba_31",
  "hwg_b1_ba_32": "hwg_b1_ba_32",
  "hwg_b1_ba_33": "hwg_b1_ba_33",
  "hwg_b1_ba_34": "hwg_b1_ba_34",
  "hwg_b1_ba_35": "hwg_b1_ba_35",
  "hwg_b1_ba_36": "hwg_b1_ba_36",
  "hwg_b1_ba_37": "hwg_b1_ba_37",
  "hwg_b1_ba_38": "hwg_b1_ba_38",
  "hwg_b1_ba_39": "hwg_b1_ba_39",
  "hwg_b1_ba_40": "hwg_b1_ba_40",
  "hwg_b1_ba_41": "hwg_b1_ba_41",
  "hwg_b1_ba_42": "hwg_b1_ba_42",
  "hwg_b1_ba_43": "hwg_b1_ba_43",
  "hwg_b1_ba_44": "hwg_b1_ba_44",
  "hwg_b1_ba_45": "hwg_b1_ba_45",
  "hwg_b1_ba_46": "hwg_b1_ba_46",
  "hwg_b1_ba_47": "hwg_b1_ba_47",
  "hwg_b1_ba_48": "hwg_b1_ba_48",
  "hwg_b1_ba_49": "hwg_b1_ba_49",
  "hwg_b1_ba_50": "hwg_b1_ba_50",
  "hwg_b2_ba_01": "hwg_b2_ba_01",
  "hwg_b2_ba_02": "hwg_b2_ba_02",
  "hwg_b2_ba_03": "hwg_b2_ba_03",
  "hwg_b2_ba_04": "hwg_b2_ba_04",
  "hwg_b2_ba_05": "hwg_b2_ba_05",
  "hwg_b2_ba_06": "hwg_b2_ba_06",
  "hwg_b2_ba_07": "hwg_b2_ba_07",
  "hwg_b2_ba_08": "hwg_b2_ba_08",
  "hwg_b2_ba_09": "hwg_b2_ba_09",
  "hwg_b2_ba_10": "hwg_b2_ba_10",
  "hwg_b2_ba_11": "hwg_b2_ba_11",
  "hwg_b2_ba_12": "hwg_b2_ba_12",
  "hwg_b2_ba_13": "hwg_b2_ba_13",
  "hwg_b2_ba_14": "hwg_b2_ba_14",
  "hwg_b2_ba_15": "hwg_b2_ba_15",
  "hwg_b2_ba_16": "hwg_b2_ba_16",
  "hwg_b2_ba_17": "hwg_b2_ba_17",
  "hwg_b2_ba_18": "hwg_b2_ba_18",
  "hwg_b2_ba_19": "hwg_b2_ba_19",
  "hwg_b2_ba_20": "hwg_b2_ba_20",
  "hwg_b2_ba_21": "hwg_b2_ba_21",
  "hwg_b2_ba_22": "hwg_b2_ba_22",
  "hwg_b2_ba_23": "hwg_b2_ba_23",
  "hwg_b2_ba_24": "hwg_b2_ba_24",
  "hwg_b2_ba_25": "hwg_b2_ba_25",
  "hwg_b2_ba_26": "hwg_b2_ba_26",
  "hwg_b2_ba_27": "hwg_b2_ba_27",
  "hwg_b2_ba_28": "hwg_b2_ba_28",
  "hwg_b2_ba_29": "hwg_b2_ba_29",
  "hwg_b2_ba_30": "hwg_b2_ba_30",
  "hwg_b2_ba_31": "hwg_b2_ba_31",
  "hwg_b2_ba_32": "hwg_b2_ba_32",
  "hwg_b2_ba_33": "hwg_b2_ba_33",
  "hwg_b2_ba_34": "hwg_b2_ba_34",
  "hwg_b2_ba_35": "hwg_b2_ba_35",
  "hwg_b2_ba_36": "hwg_b2_ba_36",
  "hwg_b2_ba_37": "hwg_b2_ba_37",
  "hwg_b2_ba_38": "hwg_b2_ba_38",
  "hwg_b2_ba_39": "hwg_b2_ba_39",
  "hwg_b2_ba_40": "hwg_b2_ba_40",
  "hwg_b2_ba_41": "hwg_b2_ba_41",
  "hwg_b2_ba_42": "hwg_b2_ba_42",
  "hwg_b2_ba_43": "hwg_b2_ba_43",
  "hwg_b2_ba_44": "hwg_b2_ba_44",
  "hwg_b2_ba_45": "hwg_b2_ba_45",
  "hwg_b2_ba_46": "hwg_b2_ba_46",
  "hwg_b2_ba_47": "hwg_b2_ba_47",
  "hwg_b2_ba_48": "hwg_b2_ba_48",
  "hwg_b2_ba_49": "hwg_b2_ba_49",
  "hwg_b2_ba_50": "hwg_b2_ba_50",
  "hwg_b3_bb_01": "hwg_b3_bb_01",
  "hwg_b3_bb_02": "hwg_b3_bb_02",
  "hwg_b3_bb_03": "hwg_b3_bb_03",
  "hwg_b3_bb_04": "hwg_b3_bb_04",
  "hwg_b3_bb_05": "hwg_b3_bb_05",
  "hwg_b3_bb_06": "hwg_b3_bb_06",
  "hwg_b3_bb_07": "hwg_b3_bb_07",
  "hwg_b3_bb_08": "hwg_b3_bb_08",
  "hwg_b3_bb_09": "hwg_b3_bb_09",
  "hwg_b3_bb_10": "hwg_b3_bb_10",
  "hwg_b3_bb_11": "hwg_b3_bb_11",
  "hwg_b3_bb_12": "hwg_b3_bb_12",
  "hwg_b3_bb_13": "hwg_b3_bb_13",
  "hwg_b3_bb_14": "hwg_b3_bb_14",
  "hwg_b3_bb_15": "hwg_b3_bb_15",
  "hwg_b3_bb_16": "hwg_b3_bb_16",
  "hwg_b3_bb_17": "hwg_b3_bb_17",
  "hwg_b3_bb_18": "hwg_b3_bb_18",
  "hwg_b3_bb_19": "hwg_b3_bb_19",
  "hwg_b3_bb_20": "hwg_b3_bb_20",
  "hwg_b3_bb_21": "hwg_b3_bb_21",
  "hwg_b3_bb_22": "hwg_b3_bb_22",
  "hwg_b3_bb_23": "hwg_b3_bb_23",
  "hwg_b3_bb_24": "hwg_b3_bb_24",
  "hwg_b3_bb_25": "hwg_b3_bb_25",
  "hwg_b3_bb_26": "hwg_b3_bb_26",
  "hwg_b3_bb_27": "hwg_b3_bb_27",
  "hwg_b3_bb_28": "hwg_b3_bb_28",
  "hwg_b3_bb_29": "hwg_b3_bb_29",
  "hwg_b3_bb_30": "hwg_b3_bb_30",
  "hwg_b3_bb_31": "hwg_b3_bb_31",
  "hwg_b3_bb_32": "hwg_b3_bb_32",
  "hwg_b3_bb_33": "hwg_b3_bb_33",
  "hwg_b3_bb_34": "hwg_b3_bb_34",
  "hwg_b3_bb_35": "hwg_b3_bb_35",
  "hwg_b3_bb_36": "hwg_b3_bb_36",
  "hwg_b3_bb_37": "hwg_b3_bb_37",
  "hwg_b3_bb_38": "hwg_b3_bb_38",
  "hwg_b3_bb_39": "hwg_b3_bb_39",
  "hwg_b3_bb_40": "hwg_b3_bb_40",
  "hwg_b3_bb_41": "hwg_b3_bb_41",
  "hwg_b3_bb_42": "hwg_b3_bb_42",
  "hwg_b3_bb_43": "hwg_b3_bb_43",
  "hwg_b3_bb_44": "hwg_b3_bb_44",
  "hwg_b3_bb_45": "hwg_b3_bb_45",
  "hwg_b3_bb_46": "hwg_b3_bb_46",
  "hwg_b3_bb_47": "hwg_b3_bb_47",
  "hwg_b3_bb_48": "hwg_b3_bb_48",
  "hwg_b3_bb_49": "hwg_b3_bb_49",
  "hwg_b3_bb_50": "hwg_b3_bb_50",
  "hwg_b4_bb_01": "hwg_b4_bb_01",
  "hwg_b4_bb_02": "hwg_b4_bb_02",
  "hwg_b4_bb_03": "hwg_b4_bb_03",
  "hwg_b4_bb_04": "hwg_b4_bb_04",
  "hwg_b4_bb_05": "hwg_b4_bb_05",
  "hwg_b4_bb_06": "hwg_b4_bb_06",
  "hwg_b4_bb_07": "hwg_b4_bb_07",
  "hwg_b4_bb_08": "hwg_b4_bb_08",
  "hwg_b4_bb_09": "hwg_b4_bb_09",
  "hwg_b4_bb_10": "hwg_b4_bb_10",
  "hwg_b4_bb_11": "hwg_b4_bb_11",
  "hwg_b4_bb_12": "hwg_b4_bb_12",
  "hwg_b4_bb_13": "hwg_b4_bb_13",
  "hwg_b4_bb_14": "hwg_b4_bb_14",
  "hwg_b4_bb_15": "hwg_b4_bb_15",
  "hwg_b4_bb_16": "hwg_b4_bb_16",
  "hwg_b4_bb_17": "hwg_b4_bb_17",
  "hwg_b4_bb_18": "hwg_b4_bb_18",
  "hwg_b4_bb_19": "hwg_b4_bb_19",
  "hwg_b4_bb_20": "hwg_b4_bb_20",
  "hwg_b4_bb_21": "hwg_b4_bb_21",
  "hwg_b4_bb_22": "hwg_b4_bb_22",
  "hwg_b4_bb_23": "hwg_b4_bb_23",
  "hwg_b4_bb_24": "hwg_b4_bb_24",
  "hwg_b4_bb_25": "hwg_b4_bb_25",
  "hwg_b4_bb_26": "hwg_b4_bb_26",
  "hwg_b4_bb_27": "hwg_b4_bb_27",
  "hwg_b4_bb_28": "hwg_b4_bb_28",
  "hwg_b4_bb_29": "hwg_b4_bb_29",
  "hwg_b4_bb_30": "hwg_b4_bb_30",
  "hwg_b4_bb_31": "hwg_b4_bb_31",
  "hwg_b4_bb_32": "hwg_b4_bb_32",
  "hwg_b4_bb_33": "hwg_b4_bb_33",
  "hwg_b4_bb_34": "hwg_b4_bb_34",
  "hwg_b4_bb_35": "hwg_b4_bb_35",
  "hwg_b4_bb_36": "hwg_b4_bb_36",
  "hwg_b4_bb_37": "hwg_b4_bb_37",
  "hwg_b4_bb_38": "hwg_b4_bb_38",
  "hwg_b4_bb_39": "hwg_b4_bb_39",
  "hwg_b4_bb_40": "hwg_b4_bb_40",
  "hwg_b4_bb_41": "hwg_b4_bb_41",
  "hwg_b4_bb_42": "hwg_b4_bb_42",
  "hwg_b4_bb_43": "hwg_b4_bb_43",
  "hwg_b4_bb_44": "hwg_b4_bb_44",
  "hwg_b4_bb_45": "hwg_b4_bb_45",
  "hwg_b4_bb_46": "hwg_b4_bb_46",
  "hwg_b4_bb_47": "hwg_b4_bb_47",
  "hwg_b4_bb_48": "hwg_b4_bb_48",
  "hwg_b4_bb_49": "hwg_b4_bb_49",
  "hwg_b4_bb_50": "hwg_b4_bb_50",
  "hwg_b5_bc_01": "hwg_b5_bc_01",
  "hwg_b5_bc_02": "hwg_b5_bc_02",
  "hwg_b5_bc_03": "hwg_b5_bc_03",
  "hwg_b5_bc_04": "hwg_b5_bc_04",
  "hwg_b5_bc_05": "hwg_b5_bc_05",
  "hwg_b5_bc_06": "hwg_b5_bc_06",
  "hwg_b5_bc_07": "hwg_b5_bc_07",
  "hwg_b5_bc_08": "hwg_b5_bc_08",
  "hwg_b5_bc_09": "hwg_b5_bc_09",
  "hwg_b5_bc_10": "hwg_b5_bc_10",
  "hwg_b5_bc_11": "hwg_b5_bc_11",
  "hwg_b5_bc_12": "hwg_b5_bc_12",
  "hwg_b5_bc_13": "hwg_b5_bc_13",
  "hwg_b5_bc_14": "hwg_b5_bc_14",
  "hwg_b5_bc_15": "hwg_b5_bc_15",
  "hwg_b5_bc_16": "hwg_b5_bc_16",
  "hwg_b5_bc_17": "hwg_b5_bc_17",
  "hwg_b5_bc_18": "hwg_b5_bc_18",
  "hwg_b5_bc_19": "hwg_b5_bc_19",
  "hwg_b5_bc_20": "hwg_b5_bc_20",
  "hwg_b5_bc_21": "hwg_b5_bc_21",
  "hwg_b5_bc_22": "hwg_b5_bc_22",
  "hwg_b5_bc_23": "hwg_b5_bc_23",
  "hwg_b5_bc_24": "hwg_b5_bc_24",
  "hwg_b5_bc_25": "hwg_b5_bc_25",
  "hwg_b5_bc_26": "hwg_b5_bc_26",
  "hwg_b5_bc_27": "hwg_b5_bc_27",
  "hwg_b5_bc_28": "hwg_b5_bc_28",
  "hwg_b5_bc_29": "hwg_b5_bc_29",
  "hwg_b5_bc_30": "hwg_b5_bc_30",
  "hwg_b5_bc_31": "hwg_b5_bc_31",
  "hwg_b5_bc_32": "hwg_b5_bc_32",
  "hwg_b5_bc_33": "hwg_b5_bc_33",
  "hwg_b5_bc_34": "hwg_b5_bc_34",
  "hwg_b5_bc_35": "hwg_b5_bc_35",
  "hwg_b5_bc_36": "hwg_b5_bc_36",
  "hwg_b5_bc_37": "hwg_b5_bc_37",
  "hwg_b5_bc_38": "hwg_b5_bc_38",
  "hwg_b5_bc_39": "hwg_b5_bc_39",
  "hwg_b5_bc_40": "hwg_b5_bc_40",
  "hwg_b5_bc_41": "hwg_b5_bc_41",
  "hwg_b5_bc_42": "hwg_b5_bc_42",
  "hwg_b5_bc_43": "hwg_b5_bc_43",
  "hwg_b5_bc_44": "hwg_b5_bc_44",
  "hwg_b5_bc_45": "hwg_b5_bc_45",
  "hwg_b5_bc_46": "hwg_b5_bc_46",
  "hwg_b5_bc_47": "hwg_b5_bc_47",
  "hwg_b5_bc_48": "hwg_b5_bc_48",
  "hwg_b5_bc_49": "hwg_b5_bc_49",
  "hwg_b5_bc_50": "hwg_b5_bc_50",
  "hwg_b6_bc_01": "hwg_b6_bc_01",
  "hwg_b6_bc_02": "hwg_b6_bc_02",
  "hwg_b6_bc_03": "hwg_b6_bc_03",
  "hwg_b6_bc_04": "hwg_b6_bc_04",
  "hwg_b6_bc_05": "hwg_b6_bc_05",
  "hwg_b6_bc_06": "hwg_b6_bc_06",
  "hwg_b6_bc_07": "hwg_b6_bc_07",
  "hwg_b6_bc_08": "hwg_b6_bc_08",
  "hwg_b6_bc_09": "hwg_b6_bc_09",
  "hwg_b6_bc_10": "hwg_b6_bc_10",
  "hwg_b6_bc_11": "hwg_b6_bc_11",
  "hwg_b6_bc_12": "hwg_b6_bc_12",
  "hwg_b6_bc_13": "hwg_b6_bc_13",
  "hwg_b6_bc_14": "hwg_b6_bc_14",
  "hwg_b6_bc_15": "hwg_b6_bc_15",
  "hwg_b6_bc_16": "hwg_b6_bc_16",
  "hwg_b6_bc_17": "hwg_b6_bc_17",
  "hwg_b6_bc_18": "hwg_b6_bc_18",
  "hwg_b6_bc_19": "hwg_b6_bc_19",
  "hwg_b6_bc_20": "hwg_b6_bc_20",
  "hwg_b6_bc_21": "hwg_b6_bc_21",
  "hwg_b6_bc_22": "hwg_b6_bc_22",
  "hwg_b6_bc_23": "hwg_b6_bc_23",
  "hwg_b6_bc_24": "hwg_b6_bc_24",
  "hwg_b6_bc_25": "hwg_b6_bc_25",
  "hwg_b6_bc_26": "hwg_b6_bc_26",
  "hwg_b6_bc_27": "hwg_b6_bc_27",
  "hwg_b6_bc_28": "hwg_b6_bc_28",
  "hwg_b6_bc_29": "hwg_b6_bc_29",
  "hwg_b6_bc_30": "hwg_b6_bc_30",
  "hwg_b6_bc_31": "hwg_b6_bc_31",
  "hwg_b6_bc_32": "hwg_b6_bc_32",
  "hwg_b6_bc_33": "hwg_b6_bc_33",
  "hwg_b6_bc_34": "hwg_b6_bc_34",
  "hwg_b6_bc_35": "hwg_b6_bc_35",
  "hwg_b6_bc_36": "hwg_b6_bc_36",
  "hwg_b6_bc_37": "hwg_b6_bc_37",
  "hwg_b6_bc_38": "hwg_b6_bc_38",
  "hwg_b6_bc_39": "hwg_b6_bc_39",
  "hwg_b6_bc_40": "hwg_b6_bc_40",
  "hwg_b6_bc_41": "hwg_b6_bc_41",
  "hwg_b6_bc_42": "hwg_b6_bc_42",
  "hwg_b6_bc_43": "hwg_b6_bc_43",
  "hwg_b6_bc_44": "hwg_b6_bc_44",
  "hwg_b6_bc_45": "hwg_b6_bc_45",
  "hwg_b6_bc_46": "hwg_b6_bc_46",
  "hwg_b6_bc_47": "hwg_b6_bc_47",
  "hwg_b6_bc_48": "hwg_b6_bc_48",
  "hwg_b6_bc_49": "hwg_b6_bc_49",
  "hwg_b6_bc_50": "hwg_b6_bc_50",
  "hwg_b7_bd_01": "hwg_b7_bd_01",
  "hwg_b7_bd_02": "hwg_b7_bd_02",
  "hwg_b7_bd_03": "hwg_b7_bd_03",
  "hwg_b7_bd_04": "hwg_b7_bd_04",
  "hwg_b7_bd_05": "hwg_b7_bd_05",
  "hwg_b7_bd_06": "hwg_b7_bd_06",
  "hwg_b7_bd_07": "hwg_b7_bd_07",
  "hwg_b7_bd_08": "hwg_b7_bd_08",
  "hwg_b7_bd_09": "hwg_b7_bd_09",
  "hwg_b7_bd_10": "hwg_b7_bd_10",
  "hwg_b7_bd_11": "hwg_b7_bd_11",
  "hwg_b7_bd_12": "hwg_b7_bd_12",
  "hwg_b7_bd_13": "hwg_b7_bd_13",
  "hwg_b7_bd_14": "hwg_b7_bd_14",
  "hwg_b7_bd_15": "hwg_b7_bd_15",
  "hwg_b7_bd_16": "hwg_b7_bd_16",
  "hwg_b7_bd_17": "hwg_b7_bd_17",
  "hwg_b7_bd_18": "hwg_b7_bd_18",
  "hwg_b7_bd_19": "hwg_b7_bd_19",
  "hwg_b7_bd_20": "hwg_b7_bd_20",
  "hwg_b7_bd_21": "hwg_b7_bd_21",
  "hwg_b7_bd_22": "hwg_b7_bd_22",
  "hwg_b7_bd_23": "hwg_b7_bd_23",
  "hwg_b7_bd_24": "hwg_b7_bd_24",
  "hwg_b7_bd_25": "hwg_b7_bd_25",
  "hwg_b7_bd_26": "hwg_b7_bd_26",
  "hwg_b7_bd_27": "hwg_b7_bd_27",
  "hwg_b7_bd_28": "hwg_b7_bd_28",
  "hwg_b7_bd_29": "hwg_b7_bd_29",
  "hwg_b7_bd_30": "hwg_b7_bd_30",
  "hwg_b7_bd_31": "hwg_b7_bd_31",
  "hwg_b7_bd_32": "hwg_b7_bd_32",
  "hwg_b7_bd_33": "hwg_b7_bd_33",
  "hwg_b7_bd_34": "hwg_b7_bd_34",
  "hwg_b7_bd_35": "hwg_b7_bd_35",
  "hwg_b7_bd_36": "hwg_b7_bd_36",
  "hwg_b7_bd_37": "hwg_b7_bd_37",
  "hwg_b7_bd_38": "hwg_b7_bd_38",
  "hwg_b7_bd_39": "hwg_b7_bd_39",
  "hwg_b7_bd_40": "hwg_b7_bd_40",
  "hwg_b7_bd_41": "hwg_b7_bd_41",
  "hwg_b7_bd_42": "hwg_b7_bd_42",
  "hwg_b7_bd_43": "hwg_b7_bd_43",
  "hwg_b7_bd_44": "hwg_b7_bd_44",
  "hwg_b7_bd_45": "hwg_b7_bd_45",
  "hwg_b7_bd_46": "hwg_b7_bd_46",
  "hwg_b7_bd_47": "hwg_b7_bd_47",
  "hwg_b7_bd_48": "hwg_b7_bd_48",
  "hwg_b7_bd_49": "hwg_b7_bd_49",
  "hwg_b7_bd_50": "hwg_b7_bd_50",
  "hwg_b8_bd_01": "hwg_b8_bd_01",
  "hwg_b8_bd_02": "hwg_b8_bd_02",
  "hwg_b8_bd_03": "hwg_b8_bd_03",
  "hwg_b8_bd_04": "hwg_b8_bd_04",
  "hwg_b8_bd_05": "hwg_b8_bd_05",
  "hwg_b8_bd_06": "hwg_b8_bd_06",
  "hwg_b8_bd_07": "hwg_b8_bd_07",
  "hwg_b8_bd_08": "hwg_b8_bd_08",
  "hwg_b8_bd_09": "hwg_b8_bd_09",
  "hwg_b8_bd_10": "hwg_b8_bd_10",
  "hwg_b8_bd_11": "hwg_b8_bd_11",
  "hwg_b8_bd_12": "hwg_b8_bd_12",
  "hwg_b8_bd_13": "hwg_b8_bd_13",
  "hwg_b8_bd_14": "hwg_b8_bd_14",
  "hwg_b8_bd_15": "hwg_b8_bd_15",
  "hwg_b8_bd_16": "hwg_b8_bd_16",
  "hwg_b8_bd_17": "hwg_b8_bd_17",
  "hwg_b8_bd_18": "hwg_b8_bd_18",
  "hwg_b8_bd_19": "hwg_b8_bd_19",
  "hwg_b8_bd_20": "hwg_b8_bd_20",
  "hwg_b8_bd_21": "hwg_b8_bd_21",
  "hwg_b8_bd_22": "hwg_b8_bd_22",
  "hwg_b8_bd_23": "hwg_b8_bd_23",
  "hwg_b8_bd_24": "hwg_b8_bd_24",
  "hwg_b8_bd_25": "hwg_b8_bd_25",
  "hwg_b8_bd_26": "hwg_b8_bd_26",
  "hwg_b8_bd_27": "hwg_b8_bd_27",
  "hwg_b8_bd_28": "hwg_b8_bd_28",
  "hwg_b8_bd_29": "hwg_b8_bd_29",
  "hwg_b8_bd_30": "hwg_b8_bd_30",
  "hwg_b8_bd_31": "hwg_b8_bd_31",
  "hwg_b8_bd_32": "hwg_b8_bd_32",
  "hwg_b8_bd_33": "hwg_b8_bd_33",
  "hwg_b8_bd_34": "hwg_b8_bd_34",
  "hwg_b8_bd_35": "hwg_b8_bd_35",
  "hwg_b8_bd_36": "hwg_b8_bd_36",
  "hwg_b8_bd_37": "hwg_b8_bd_37",
  "hwg_b8_bd_38": "hwg_b8_bd_38",
  "hwg_b8_bd_39": "hwg_b8_bd_39",
  "hwg_b8_bd_40": "hwg_b8_bd_40",
  "hwg_b8_bd_41": "hwg_b8_bd_41",
  "hwg_b8_bd_42": "hwg_b8_bd_42",
  "hwg_b8_bd_43": "hwg_b8_bd_43",
  "hwg_b8_bd_44": "hwg_b8_bd_44",
  "hwg_b8_bd_45": "hwg_b8_bd_45",
  "hwg_b8_bd_46": "hwg_b8_bd_46",
  "hwg_b8_bd_47": "hwg_b8_bd_47",
  "hwg_b8_bd_48": "hwg_b8_bd_48",
  "hwg_b8_bd_49": "hwg_b8_bd_49",
  "hwg_b8_bd_50": "hwg_b8_bd_50"
};

/** 標準題號 (canonicalId) -> 範圍與複本元資料 */
export const CANONICAL_META_MAP = {
  "hwg_b1_1": {
    "canonicalId": "hwg_b1_1",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_1"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_2": {
    "canonicalId": "hwg_b1_2",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_2"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_3": {
    "canonicalId": "hwg_b1_3",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_3"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_4": {
    "canonicalId": "hwg_b1_4",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_4"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_5": {
    "canonicalId": "hwg_b1_5",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_5"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_6": {
    "canonicalId": "hwg_b1_6",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_6"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_7": {
    "canonicalId": "hwg_b1_7",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_7"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_8": {
    "canonicalId": "hwg_b1_8",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_8"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_9": {
    "canonicalId": "hwg_b1_9",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_9"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_10": {
    "canonicalId": "hwg_b1_10",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_10"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_11": {
    "canonicalId": "hwg_b1_11",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_11"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_12": {
    "canonicalId": "hwg_b1_12",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_12"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_13": {
    "canonicalId": "hwg_b1_13",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_13"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_14": {
    "canonicalId": "hwg_b1_14",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_14"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_15": {
    "canonicalId": "hwg_b1_15",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_15"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_16": {
    "canonicalId": "hwg_b1_16",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_16"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_17": {
    "canonicalId": "hwg_b1_17",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_17"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_18": {
    "canonicalId": "hwg_b1_18",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_18"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_19": {
    "canonicalId": "hwg_b1_19",
    "book": 1,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_19"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_20": {
    "canonicalId": "hwg_b1_20",
    "book": 1,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_20"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_21": {
    "canonicalId": "hwg_b1_21",
    "book": 1,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_21"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_22": {
    "canonicalId": "hwg_b1_22",
    "book": 1,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_22"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_23": {
    "canonicalId": "hwg_b1_23",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_23"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_24": {
    "canonicalId": "hwg_b1_24",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_24"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_25": {
    "canonicalId": "hwg_b1_25",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_25"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_26": {
    "canonicalId": "hwg_b1_26",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_26"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_27": {
    "canonicalId": "hwg_b1_27",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_27"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_28": {
    "canonicalId": "hwg_b1_28",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_28"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_29": {
    "canonicalId": "hwg_b1_29",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_29"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_30": {
    "canonicalId": "hwg_b1_30",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_30"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_31": {
    "canonicalId": "hwg_b1_31",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_31"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_32": {
    "canonicalId": "hwg_b1_32",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_32"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_33": {
    "canonicalId": "hwg_b1_33",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_33"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_34": {
    "canonicalId": "hwg_b1_34",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_34"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_35": {
    "canonicalId": "hwg_b1_35",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_35"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_36": {
    "canonicalId": "hwg_b1_36",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_36"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_37": {
    "canonicalId": "hwg_b1_37",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_37"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_38": {
    "canonicalId": "hwg_b1_38",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_38"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_39": {
    "canonicalId": "hwg_b1_39",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_39"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_40": {
    "canonicalId": "hwg_b1_40",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_40"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_41": {
    "canonicalId": "hwg_b1_41",
    "book": 1,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_41"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_42": {
    "canonicalId": "hwg_b1_42",
    "book": 1,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_42"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_43": {
    "canonicalId": "hwg_b1_43",
    "book": 1,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_43"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_44": {
    "canonicalId": "hwg_b1_44",
    "book": 1,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_44"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_45": {
    "canonicalId": "hwg_b3_45",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_45"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_46": {
    "canonicalId": "hwg_b3_46",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_46"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_47": {
    "canonicalId": "hwg_b3_47",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_47"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_48": {
    "canonicalId": "hwg_b3_48",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_48"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_49": {
    "canonicalId": "hwg_b3_49",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_49"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_50": {
    "canonicalId": "hwg_b3_50",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_50"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_51": {
    "canonicalId": "hwg_b3_51",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_51"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_52": {
    "canonicalId": "hwg_b3_52",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_52"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_53": {
    "canonicalId": "hwg_b3_53",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_53"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_54": {
    "canonicalId": "hwg_b3_54",
    "book": 3,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b3_54"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_55": {
    "canonicalId": "hwg_b3_55",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_55"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_56": {
    "canonicalId": "hwg_b3_56",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_56"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_57": {
    "canonicalId": "hwg_b3_57",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_57"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_58": {
    "canonicalId": "hwg_b3_58",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_58"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_59": {
    "canonicalId": "hwg_b3_59",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_59"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_60": {
    "canonicalId": "hwg_b3_60",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_60"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_61": {
    "canonicalId": "hwg_b3_61",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_61"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_62": {
    "canonicalId": "hwg_b3_62",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_62"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_63": {
    "canonicalId": "hwg_b3_63",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_63"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_64": {
    "canonicalId": "hwg_b3_64",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_64"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_65": {
    "canonicalId": "hwg_b3_65",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_65"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_66": {
    "canonicalId": "hwg_b3_66",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_66"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_67": {
    "canonicalId": "hwg_b3_67",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_67"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_68": {
    "canonicalId": "hwg_b3_68",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_68"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_69": {
    "canonicalId": "hwg_b3_69",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_69"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_70": {
    "canonicalId": "hwg_b3_70",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_70"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_71": {
    "canonicalId": "hwg_b3_71",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_71"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_72": {
    "canonicalId": "hwg_b3_72",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_72"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_73": {
    "canonicalId": "hwg_b3_73",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_73"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_74": {
    "canonicalId": "hwg_b3_74",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_74"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_75": {
    "canonicalId": "hwg_b3_75",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_75"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_76": {
    "canonicalId": "hwg_b3_76",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_76"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_77": {
    "canonicalId": "hwg_b3_77",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_77"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_78": {
    "canonicalId": "hwg_b3_78",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_78"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_79": {
    "canonicalId": "hwg_b3_79",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_79"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_80": {
    "canonicalId": "hwg_b3_80",
    "book": 3,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_80"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_81": {
    "canonicalId": "hwg_b3_81",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_81"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_82": {
    "canonicalId": "hwg_b3_82",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_82"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_83": {
    "canonicalId": "hwg_b3_83",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_83"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_84": {
    "canonicalId": "hwg_b3_84",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_84"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_85": {
    "canonicalId": "hwg_b3_85",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_85"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_86": {
    "canonicalId": "hwg_b3_86",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_86"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_87": {
    "canonicalId": "hwg_b3_87",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_87"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_88": {
    "canonicalId": "hwg_b3_88",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_88"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_89": {
    "canonicalId": "hwg_b3_89",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_89"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_90": {
    "canonicalId": "hwg_b3_90",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_90"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_91": {
    "canonicalId": "hwg_b3_91",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_91"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_92": {
    "canonicalId": "hwg_b3_92",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_92"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_93": {
    "canonicalId": "hwg_b3_93",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_93"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_94": {
    "canonicalId": "hwg_b3_94",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_94"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_95": {
    "canonicalId": "hwg_b3_95",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_95"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_96": {
    "canonicalId": "hwg_b3_96",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_96"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_97": {
    "canonicalId": "hwg_b3_97",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_97"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_98": {
    "canonicalId": "hwg_b3_98",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_98"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_99": {
    "canonicalId": "hwg_b3_99",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_99"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_100": {
    "canonicalId": "hwg_b3_100",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_100"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_101": {
    "canonicalId": "hwg_b3_101",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_101"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_102": {
    "canonicalId": "hwg_b3_102",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_102"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_103": {
    "canonicalId": "hwg_b3_103",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_103"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_104": {
    "canonicalId": "hwg_b3_104",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_104"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_105": {
    "canonicalId": "hwg_b3_105",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_105"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_106": {
    "canonicalId": "hwg_b3_106",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_106"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_107": {
    "canonicalId": "hwg_b3_107",
    "book": 3,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_107"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_108": {
    "canonicalId": "hwg_b3_108",
    "book": 3,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_108"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_109": {
    "canonicalId": "hwg_b3_109",
    "book": 3,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_109"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_110": {
    "canonicalId": "hwg_b3_110",
    "book": 3,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_110"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_111": {
    "canonicalId": "hwg_b3_111",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_111"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_112": {
    "canonicalId": "hwg_b3_112",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_112"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_113": {
    "canonicalId": "hwg_b3_113",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_113"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_114": {
    "canonicalId": "hwg_b3_114",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_114"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_115": {
    "canonicalId": "hwg_b3_115",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_115"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_116": {
    "canonicalId": "hwg_b3_116",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_116"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_117": {
    "canonicalId": "hwg_b3_117",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_117"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_118": {
    "canonicalId": "hwg_b3_118",
    "book": 3,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b3_118"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_119": {
    "canonicalId": "hwg_b5_119",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_119"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_120": {
    "canonicalId": "hwg_b5_120",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_120"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_121": {
    "canonicalId": "hwg_b5_121",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_121"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_122": {
    "canonicalId": "hwg_b5_122",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_122"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_123": {
    "canonicalId": "hwg_b5_123",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_123"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_124": {
    "canonicalId": "hwg_b5_124",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_124"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_125": {
    "canonicalId": "hwg_b5_125",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_125"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_126": {
    "canonicalId": "hwg_b5_126",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_126"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_127": {
    "canonicalId": "hwg_b5_127",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_127"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_128": {
    "canonicalId": "hwg_b5_128",
    "book": 5,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b5_128"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_129": {
    "canonicalId": "hwg_b5_129",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_129"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_130": {
    "canonicalId": "hwg_b5_130",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_130"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_131": {
    "canonicalId": "hwg_b5_131",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_131"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_132": {
    "canonicalId": "hwg_b5_132",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_132"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_133": {
    "canonicalId": "hwg_b5_133",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_133"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_134": {
    "canonicalId": "hwg_b5_134",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_134"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_135": {
    "canonicalId": "hwg_b5_135",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_135"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_136": {
    "canonicalId": "hwg_b5_136",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_136"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_137": {
    "canonicalId": "hwg_b5_137",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_137"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_138": {
    "canonicalId": "hwg_b5_138",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_138"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_139": {
    "canonicalId": "hwg_b5_139",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_139"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_140": {
    "canonicalId": "hwg_b5_140",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_140"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_141": {
    "canonicalId": "hwg_b5_141",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_141"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_142": {
    "canonicalId": "hwg_b5_142",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_142"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_143": {
    "canonicalId": "hwg_b5_143",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_143"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_144": {
    "canonicalId": "hwg_b5_144",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_144"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_145": {
    "canonicalId": "hwg_b5_145",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_145"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_146": {
    "canonicalId": "hwg_b5_146",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_146"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_147": {
    "canonicalId": "hwg_b5_147",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_147"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_148": {
    "canonicalId": "hwg_b5_148",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_148"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_149": {
    "canonicalId": "hwg_b5_149",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_149"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_150": {
    "canonicalId": "hwg_b5_150",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_150"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_151": {
    "canonicalId": "hwg_b5_151",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_151"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_152": {
    "canonicalId": "hwg_b5_152",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_152"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_153": {
    "canonicalId": "hwg_b5_153",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_153"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_154": {
    "canonicalId": "hwg_b5_154",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_154"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_155": {
    "canonicalId": "hwg_b5_155",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_155"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_156": {
    "canonicalId": "hwg_b5_156",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_156"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_157": {
    "canonicalId": "hwg_b5_157",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_157"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_158": {
    "canonicalId": "hwg_b5_158",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_158"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_159": {
    "canonicalId": "hwg_b5_159",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_159"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_160": {
    "canonicalId": "hwg_b5_160",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_160"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_161": {
    "canonicalId": "hwg_b5_161",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_161"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_162": {
    "canonicalId": "hwg_b5_162",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_162"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_163": {
    "canonicalId": "hwg_b5_163",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_163"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_164": {
    "canonicalId": "hwg_b5_164",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_164"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_165": {
    "canonicalId": "hwg_b5_165",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_165"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_166": {
    "canonicalId": "hwg_b5_166",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_166"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_167": {
    "canonicalId": "hwg_b5_167",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_167"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_168": {
    "canonicalId": "hwg_b5_168",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_168"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_169": {
    "canonicalId": "hwg_b5_169",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_169"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_170": {
    "canonicalId": "hwg_b5_170",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_170"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_171": {
    "canonicalId": "hwg_b5_171",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_171"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_172": {
    "canonicalId": "hwg_b5_172",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_172"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_173": {
    "canonicalId": "hwg_b5_173",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_173"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_174": {
    "canonicalId": "hwg_b5_174",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_174"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_175": {
    "canonicalId": "hwg_b5_175",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_175"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_176": {
    "canonicalId": "hwg_b5_176",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_176"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_177": {
    "canonicalId": "hwg_b5_177",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_177"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_178": {
    "canonicalId": "hwg_b5_178",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_178"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_179": {
    "canonicalId": "hwg_b5_179",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_179"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_180": {
    "canonicalId": "hwg_b5_180",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_180"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_181": {
    "canonicalId": "hwg_b5_181",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_181"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_182": {
    "canonicalId": "hwg_b5_182",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_182"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_183": {
    "canonicalId": "hwg_b5_183",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_183"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_184": {
    "canonicalId": "hwg_b5_184",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_184"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_185": {
    "canonicalId": "hwg_b5_185",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_185"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_186": {
    "canonicalId": "hwg_b5_186",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_186"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_187": {
    "canonicalId": "hwg_b5_187",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_187"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_188": {
    "canonicalId": "hwg_b5_188",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_188"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_189": {
    "canonicalId": "hwg_b5_189",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_189"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_190": {
    "canonicalId": "hwg_b5_190",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_190"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_191": {
    "canonicalId": "hwg_b5_191",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_191"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_192": {
    "canonicalId": "hwg_b5_192",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_192"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_193": {
    "canonicalId": "hwg_b5_193",
    "book": 5,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b5_193"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_194": {
    "canonicalId": "hwg_b5_194",
    "book": 5,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b5_194"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_195": {
    "canonicalId": "hwg_b5_195",
    "book": 5,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b5_195"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_196": {
    "canonicalId": "hwg_b5_196",
    "book": 5,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b5_196"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_197": {
    "canonicalId": "hwg_b7_197",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_197"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_198": {
    "canonicalId": "hwg_b7_198",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_198"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_199": {
    "canonicalId": "hwg_b7_199",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_199"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_200": {
    "canonicalId": "hwg_b7_200",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_200"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_201": {
    "canonicalId": "hwg_b7_201",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_201"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_202": {
    "canonicalId": "hwg_b7_202",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_202"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_203": {
    "canonicalId": "hwg_b7_203",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_203"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_204": {
    "canonicalId": "hwg_b7_204",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_204"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_205": {
    "canonicalId": "hwg_b7_205",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_205"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_206": {
    "canonicalId": "hwg_b7_206",
    "book": 7,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b7_206"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_207": {
    "canonicalId": "hwg_b7_207",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_207"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_208": {
    "canonicalId": "hwg_b7_208",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_208"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_209": {
    "canonicalId": "hwg_b7_209",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_209"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_210": {
    "canonicalId": "hwg_b7_210",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_210"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_211": {
    "canonicalId": "hwg_b7_211",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_211"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_212": {
    "canonicalId": "hwg_b7_212",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_212"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_213": {
    "canonicalId": "hwg_b7_213",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_213"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_214": {
    "canonicalId": "hwg_b7_214",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_214"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_215": {
    "canonicalId": "hwg_b7_215",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_215"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_216": {
    "canonicalId": "hwg_b7_216",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_216"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_217": {
    "canonicalId": "hwg_b7_217",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_217"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_218": {
    "canonicalId": "hwg_b7_218",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_218"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_219": {
    "canonicalId": "hwg_b7_219",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_219"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_220": {
    "canonicalId": "hwg_b7_220",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_220"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_221": {
    "canonicalId": "hwg_b7_221",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_221"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_222": {
    "canonicalId": "hwg_b7_222",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_222"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_223": {
    "canonicalId": "hwg_b7_223",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_223"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_224": {
    "canonicalId": "hwg_b7_224",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_224"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_225": {
    "canonicalId": "hwg_b7_225",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_225"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_226": {
    "canonicalId": "hwg_b7_226",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_226"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_227": {
    "canonicalId": "hwg_b7_227",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_227"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_228": {
    "canonicalId": "hwg_b7_228",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_228"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_229": {
    "canonicalId": "hwg_b7_229",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_229"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_230": {
    "canonicalId": "hwg_b7_230",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_230"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_231": {
    "canonicalId": "hwg_b7_231",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_231"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_232": {
    "canonicalId": "hwg_b7_232",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_232"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_233": {
    "canonicalId": "hwg_b7_233",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_233"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_234": {
    "canonicalId": "hwg_b7_234",
    "book": 7,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_234"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_235": {
    "canonicalId": "hwg_b7_235",
    "book": 7,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_235"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_236": {
    "canonicalId": "hwg_b7_236",
    "book": 7,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_236"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_237": {
    "canonicalId": "hwg_b7_237",
    "book": 7,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_237"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_238": {
    "canonicalId": "hwg_b7_238",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_238"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_239": {
    "canonicalId": "hwg_b7_239",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_239"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_240": {
    "canonicalId": "hwg_b7_240",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_240"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_241": {
    "canonicalId": "hwg_b7_241",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_241"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_242": {
    "canonicalId": "hwg_b7_242",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_242"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_243": {
    "canonicalId": "hwg_b7_243",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_243"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_244": {
    "canonicalId": "hwg_b7_244",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_244"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_245": {
    "canonicalId": "hwg_b7_245",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_245"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_246": {
    "canonicalId": "hwg_b7_246",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_246"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_247": {
    "canonicalId": "hwg_b7_247",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_247"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_248": {
    "canonicalId": "hwg_b7_248",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_248"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_249": {
    "canonicalId": "hwg_b7_249",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_249"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_250": {
    "canonicalId": "hwg_b7_250",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_250"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_251": {
    "canonicalId": "hwg_b7_251",
    "book": 7,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_251"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_252": {
    "canonicalId": "hwg_b7_252",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_252"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_253": {
    "canonicalId": "hwg_b7_253",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_253"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_254": {
    "canonicalId": "hwg_b7_254",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_254"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_255": {
    "canonicalId": "hwg_b7_255",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_255"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_256": {
    "canonicalId": "hwg_b7_256",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_256"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_257": {
    "canonicalId": "hwg_b7_257",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_257"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_258": {
    "canonicalId": "hwg_b7_258",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_258"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_259": {
    "canonicalId": "hwg_b7_259",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_259"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_260": {
    "canonicalId": "hwg_b7_260",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_260"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_261": {
    "canonicalId": "hwg_b7_261",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_261"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_262": {
    "canonicalId": "hwg_b7_262",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_262"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_263": {
    "canonicalId": "hwg_b7_263",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_263"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_264": {
    "canonicalId": "hwg_b7_264",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_264"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_265": {
    "canonicalId": "hwg_b7_265",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_265"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_266": {
    "canonicalId": "hwg_b7_266",
    "book": 7,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_266"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_267": {
    "canonicalId": "hwg_b7_267",
    "book": 7,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_267"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_268": {
    "canonicalId": "hwg_b7_268",
    "book": 7,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_268"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_269": {
    "canonicalId": "hwg_b7_269",
    "book": 7,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_269"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_270": {
    "canonicalId": "hwg_b7_270",
    "book": 7,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_270"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_271": {
    "canonicalId": "hwg_b9_271",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_271"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_272": {
    "canonicalId": "hwg_b9_272",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_272"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_273": {
    "canonicalId": "hwg_b9_273",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_273"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_274": {
    "canonicalId": "hwg_b9_274",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_274"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_275": {
    "canonicalId": "hwg_b9_275",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_275"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_276": {
    "canonicalId": "hwg_b9_276",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_276"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_277": {
    "canonicalId": "hwg_b9_277",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_277"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_278": {
    "canonicalId": "hwg_b9_278",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_278"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_279": {
    "canonicalId": "hwg_b9_279",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_279"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_280": {
    "canonicalId": "hwg_b9_280",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_280"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_281": {
    "canonicalId": "hwg_b9_281",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_281"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_282": {
    "canonicalId": "hwg_b9_282",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_282"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_283": {
    "canonicalId": "hwg_b9_283",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_283"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_284": {
    "canonicalId": "hwg_b9_284",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_284"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_285": {
    "canonicalId": "hwg_b9_285",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_285"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_286": {
    "canonicalId": "hwg_b9_286",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_286"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_287": {
    "canonicalId": "hwg_b9_287",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_287"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_288": {
    "canonicalId": "hwg_b9_288",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_288"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_289": {
    "canonicalId": "hwg_b9_289",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_289"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_290": {
    "canonicalId": "hwg_b9_290",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_290"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_291": {
    "canonicalId": "hwg_b9_291",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_291"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_292": {
    "canonicalId": "hwg_b9_292",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_292"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_293": {
    "canonicalId": "hwg_b9_293",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_293"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_294": {
    "canonicalId": "hwg_b9_294",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_294"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_295": {
    "canonicalId": "hwg_b9_295",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_295"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_296": {
    "canonicalId": "hwg_b9_296",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_296"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_297": {
    "canonicalId": "hwg_b9_297",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_297"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_298": {
    "canonicalId": "hwg_b9_298",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_298"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_299": {
    "canonicalId": "hwg_b9_299",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_299"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_300": {
    "canonicalId": "hwg_b9_300",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_300"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_301": {
    "canonicalId": "hwg_b9_301",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_301"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_302": {
    "canonicalId": "hwg_b9_302",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_302"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_303": {
    "canonicalId": "hwg_b9_303",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_303"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_304": {
    "canonicalId": "hwg_b9_304",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_304"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_305": {
    "canonicalId": "hwg_b9_305",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_305"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_306": {
    "canonicalId": "hwg_b9_306",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_306"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_307": {
    "canonicalId": "hwg_b9_307",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_307"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_308": {
    "canonicalId": "hwg_b9_308",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_308"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_309": {
    "canonicalId": "hwg_b9_309",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_309"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_310": {
    "canonicalId": "hwg_b9_310",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_310"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_311": {
    "canonicalId": "hwg_b9_311",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_311"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_312": {
    "canonicalId": "hwg_b9_312",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_312"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_313": {
    "canonicalId": "hwg_b9_313",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_313"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_314": {
    "canonicalId": "hwg_b9_314",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_314"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_315": {
    "canonicalId": "hwg_b9_315",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_315"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_316": {
    "canonicalId": "hwg_b9_316",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_316"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_317": {
    "canonicalId": "hwg_b9_317",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_317"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_318": {
    "canonicalId": "hwg_b9_318",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_318"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_319": {
    "canonicalId": "hwg_b9_319",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_319"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_320": {
    "canonicalId": "hwg_b9_320",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_320"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_321": {
    "canonicalId": "hwg_b9_321",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_321"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_322": {
    "canonicalId": "hwg_b9_322",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_322"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_323": {
    "canonicalId": "hwg_b9_323",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_323"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_324": {
    "canonicalId": "hwg_b9_324",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_324"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_325": {
    "canonicalId": "hwg_b9_325",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_325"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_326": {
    "canonicalId": "hwg_b9_326",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_326"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_327": {
    "canonicalId": "hwg_b9_327",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_327"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_328": {
    "canonicalId": "hwg_b9_328",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_328"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_329": {
    "canonicalId": "hwg_b9_329",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_329"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_330": {
    "canonicalId": "hwg_b9_330",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_330"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_331": {
    "canonicalId": "hwg_b9_331",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_331"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_332": {
    "canonicalId": "hwg_b9_332",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_332"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_333": {
    "canonicalId": "hwg_b9_333",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_333"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_334": {
    "canonicalId": "hwg_b9_334",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_334"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_335": {
    "canonicalId": "hwg_b1_335",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_335"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_336": {
    "canonicalId": "hwg_b1_336",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_336"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_337": {
    "canonicalId": "hwg_b1_337",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_337"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_338": {
    "canonicalId": "hwg_b1_338",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_338"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_339": {
    "canonicalId": "hwg_b1_339",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_339"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_340": {
    "canonicalId": "hwg_b1_340",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_340"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_341": {
    "canonicalId": "hwg_b1_341",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_341"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_342": {
    "canonicalId": "hwg_b1_342",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_342"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_343": {
    "canonicalId": "hwg_b1_343",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_343"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_344": {
    "canonicalId": "hwg_b1_344",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_344"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_345": {
    "canonicalId": "hwg_b1_345",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_345"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_346": {
    "canonicalId": "hwg_b1_346",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_346"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_347": {
    "canonicalId": "hwg_b1_347",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_347"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_348": {
    "canonicalId": "hwg_b1_348",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_348"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_349": {
    "canonicalId": "hwg_b1_349",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_349"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_350": {
    "canonicalId": "hwg_b1_350",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_350"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_351": {
    "canonicalId": "hwg_b1_351",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_351"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_352": {
    "canonicalId": "hwg_b1_352",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_352"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_353": {
    "canonicalId": "hwg_b1_353",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_353"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_354": {
    "canonicalId": "hwg_b1_354",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_354"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_355": {
    "canonicalId": "hwg_b1_355",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_355"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_356": {
    "canonicalId": "hwg_b1_356",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_356"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_357": {
    "canonicalId": "hwg_b1_357",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_357"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_358": {
    "canonicalId": "hwg_b1_358",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_358"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_359": {
    "canonicalId": "hwg_b1_359",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_359"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_360": {
    "canonicalId": "hwg_b1_360",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_360"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_361": {
    "canonicalId": "hwg_b1_361",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_361"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_362": {
    "canonicalId": "hwg_b1_362",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_362"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_363": {
    "canonicalId": "hwg_b1_363",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_363"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_364": {
    "canonicalId": "hwg_b1_364",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_364"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_365": {
    "canonicalId": "hwg_b1_365",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_365"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_366": {
    "canonicalId": "hwg_b1_366",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_366"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_367": {
    "canonicalId": "hwg_b1_367",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_367"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_368": {
    "canonicalId": "hwg_b1_368",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_368"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_369": {
    "canonicalId": "hwg_b1_369",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_369"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_370": {
    "canonicalId": "hwg_b1_370",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_370"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_371": {
    "canonicalId": "hwg_b1_371",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_371"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_372": {
    "canonicalId": "hwg_b1_372",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_372"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_373": {
    "canonicalId": "hwg_b1_373",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_373"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_374": {
    "canonicalId": "hwg_b1_374",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_374"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_375": {
    "canonicalId": "hwg_b1_375",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_375"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_376": {
    "canonicalId": "hwg_b1_376",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_376"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_377": {
    "canonicalId": "hwg_b1_377",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_377"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_378": {
    "canonicalId": "hwg_b1_378",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_378"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_379": {
    "canonicalId": "hwg_b1_379",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_379"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_380": {
    "canonicalId": "hwg_b1_380",
    "book": 1,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_380"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_381": {
    "canonicalId": "hwg_b1_381",
    "book": 1,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_381"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_382": {
    "canonicalId": "hwg_b1_382",
    "book": 1,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_382"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_383": {
    "canonicalId": "hwg_b1_383",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_383"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_384": {
    "canonicalId": "hwg_b1_384",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_384"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_385": {
    "canonicalId": "hwg_b1_385",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_385"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_386": {
    "canonicalId": "hwg_b1_386",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_386"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_387": {
    "canonicalId": "hwg_b1_387",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_387"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_388": {
    "canonicalId": "hwg_b1_388",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_388"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_389": {
    "canonicalId": "hwg_b1_389",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_389"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_390": {
    "canonicalId": "hwg_b1_390",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_390"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_391": {
    "canonicalId": "hwg_b1_391",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_391"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_392": {
    "canonicalId": "hwg_b1_392",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_392"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_393": {
    "canonicalId": "hwg_b1_393",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_393"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_394": {
    "canonicalId": "hwg_b1_394",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_394"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_395": {
    "canonicalId": "hwg_b1_395",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_395"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_396": {
    "canonicalId": "hwg_b1_396",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_396"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_397": {
    "canonicalId": "hwg_b1_397",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_397"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_398": {
    "canonicalId": "hwg_b1_398",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_398"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_399": {
    "canonicalId": "hwg_b1_399",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_399"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_400": {
    "canonicalId": "hwg_b1_400",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_400"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_401": {
    "canonicalId": "hwg_b1_401",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_401"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_402": {
    "canonicalId": "hwg_b1_402",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_402"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_403": {
    "canonicalId": "hwg_b1_403",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_403"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_404": {
    "canonicalId": "hwg_b1_404",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_404"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_405": {
    "canonicalId": "hwg_b1_405",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_405"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_406": {
    "canonicalId": "hwg_b1_406",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_406"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_407": {
    "canonicalId": "hwg_b1_407",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_407"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_408": {
    "canonicalId": "hwg_b1_408",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_408"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_409": {
    "canonicalId": "hwg_b1_409",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_409"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_410": {
    "canonicalId": "hwg_b1_410",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_410"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_411": {
    "canonicalId": "hwg_b1_411",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_411"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_412": {
    "canonicalId": "hwg_b1_412",
    "book": 1,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_412"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_413": {
    "canonicalId": "hwg_b1_413",
    "book": 1,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_413"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_414": {
    "canonicalId": "hwg_b1_414",
    "book": 1,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b1_414"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_415": {
    "canonicalId": "hwg_b1_415",
    "book": 1,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b1_415"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_416": {
    "canonicalId": "hwg_b2_416",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_416"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_417": {
    "canonicalId": "hwg_b2_417",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_417"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_418": {
    "canonicalId": "hwg_b2_418",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_418"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_419": {
    "canonicalId": "hwg_b2_419",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_419"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_420": {
    "canonicalId": "hwg_b2_420",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_420"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_421": {
    "canonicalId": "hwg_b2_421",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_421"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_422": {
    "canonicalId": "hwg_b2_422",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_422"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_423": {
    "canonicalId": "hwg_b2_423",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_423"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_424": {
    "canonicalId": "hwg_b2_424",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_424"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_425": {
    "canonicalId": "hwg_b2_425",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_425"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_426": {
    "canonicalId": "hwg_b2_426",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_426"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_427": {
    "canonicalId": "hwg_b2_427",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_427"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_428": {
    "canonicalId": "hwg_b2_428",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_428"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_429": {
    "canonicalId": "hwg_b2_429",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_429"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_430": {
    "canonicalId": "hwg_b2_430",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_430"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_431": {
    "canonicalId": "hwg_b2_431",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_431"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_432": {
    "canonicalId": "hwg_b2_432",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_432"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_433": {
    "canonicalId": "hwg_b2_433",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_433"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_434": {
    "canonicalId": "hwg_b2_434",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_434"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_435": {
    "canonicalId": "hwg_b2_435",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_435"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_436": {
    "canonicalId": "hwg_b2_436",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_436"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_437": {
    "canonicalId": "hwg_b2_437",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_437"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_438": {
    "canonicalId": "hwg_b2_438",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_438"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_439": {
    "canonicalId": "hwg_b2_439",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_439"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_440": {
    "canonicalId": "hwg_b2_440",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_440"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_441": {
    "canonicalId": "hwg_b2_441",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_441"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_442": {
    "canonicalId": "hwg_b2_442",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_442"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_443": {
    "canonicalId": "hwg_b2_443",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_443"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_444": {
    "canonicalId": "hwg_b2_444",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_444"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_445": {
    "canonicalId": "hwg_b2_445",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_445"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_446": {
    "canonicalId": "hwg_b2_446",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_446"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_447": {
    "canonicalId": "hwg_b2_447",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_447"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_448": {
    "canonicalId": "hwg_b2_448",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_448"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_449": {
    "canonicalId": "hwg_b2_449",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_449"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_450": {
    "canonicalId": "hwg_b2_450",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_450"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_451": {
    "canonicalId": "hwg_b2_451",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_451"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_452": {
    "canonicalId": "hwg_b2_452",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_452"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_453": {
    "canonicalId": "hwg_b2_453",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_453"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_454": {
    "canonicalId": "hwg_b2_454",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_454"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_455": {
    "canonicalId": "hwg_b2_455",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_455"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_456": {
    "canonicalId": "hwg_b2_456",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_456"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_457": {
    "canonicalId": "hwg_b2_457",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_457"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_458": {
    "canonicalId": "hwg_b2_458",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_458"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_459": {
    "canonicalId": "hwg_b2_459",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_459"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_460": {
    "canonicalId": "hwg_b2_460",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_460"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_461": {
    "canonicalId": "hwg_b2_461",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_461"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_462": {
    "canonicalId": "hwg_b2_462",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_462"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_463": {
    "canonicalId": "hwg_b2_463",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_463"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_464": {
    "canonicalId": "hwg_b2_464",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_464"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_465": {
    "canonicalId": "hwg_b2_465",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_465"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_466": {
    "canonicalId": "hwg_b2_466",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_466"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_467": {
    "canonicalId": "hwg_b2_467",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_467"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_468": {
    "canonicalId": "hwg_b2_468",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_468"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_469": {
    "canonicalId": "hwg_b2_469",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_469"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_470": {
    "canonicalId": "hwg_b2_470",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_470"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_471": {
    "canonicalId": "hwg_b2_471",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_471"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_472": {
    "canonicalId": "hwg_b2_472",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_472"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_473": {
    "canonicalId": "hwg_b2_473",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_473"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_474": {
    "canonicalId": "hwg_b2_474",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_474"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_475": {
    "canonicalId": "hwg_b2_475",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_475"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_476": {
    "canonicalId": "hwg_b2_476",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_476"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_477": {
    "canonicalId": "hwg_b2_477",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_477"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_478": {
    "canonicalId": "hwg_b2_478",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_478"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_479": {
    "canonicalId": "hwg_b2_479",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_479"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_480": {
    "canonicalId": "hwg_b2_480",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_480"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_481": {
    "canonicalId": "hwg_b2_481",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_481"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_482": {
    "canonicalId": "hwg_b2_482",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_482"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_483": {
    "canonicalId": "hwg_b2_483",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_483"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_484": {
    "canonicalId": "hwg_b2_484",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_484"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_485": {
    "canonicalId": "hwg_b2_485",
    "book": 2,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_485"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_486": {
    "canonicalId": "hwg_b2_486",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_486"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_487": {
    "canonicalId": "hwg_b2_487",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_487"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_488": {
    "canonicalId": "hwg_b2_488",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_488"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_489": {
    "canonicalId": "hwg_b2_489",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_489"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_490": {
    "canonicalId": "hwg_b2_490",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_490"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_491": {
    "canonicalId": "hwg_b2_491",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_491"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_492": {
    "canonicalId": "hwg_b2_492",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_492"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_493": {
    "canonicalId": "hwg_b2_493",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_493"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_494": {
    "canonicalId": "hwg_b2_494",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_494"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_495": {
    "canonicalId": "hwg_b2_495",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_495"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_496": {
    "canonicalId": "hwg_b2_496",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_496"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_497": {
    "canonicalId": "hwg_b2_497",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_497"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_498": {
    "canonicalId": "hwg_b2_498",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_498"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_499": {
    "canonicalId": "hwg_b2_499",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_499"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_500": {
    "canonicalId": "hwg_b2_500",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_500"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_501": {
    "canonicalId": "hwg_b2_501",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_501"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_502": {
    "canonicalId": "hwg_b2_502",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_502"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_503": {
    "canonicalId": "hwg_b2_503",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_503"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_504": {
    "canonicalId": "hwg_b2_504",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_504"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_505": {
    "canonicalId": "hwg_b2_505",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_505"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_506": {
    "canonicalId": "hwg_b2_506",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_506"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_507": {
    "canonicalId": "hwg_b2_507",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_507"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_508": {
    "canonicalId": "hwg_b2_508",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_508"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_509": {
    "canonicalId": "hwg_b2_509",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_509"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_510": {
    "canonicalId": "hwg_b2_510",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_510"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_511": {
    "canonicalId": "hwg_b2_511",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_511"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_512": {
    "canonicalId": "hwg_b2_512",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_512"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_513": {
    "canonicalId": "hwg_b2_513",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_513"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_514": {
    "canonicalId": "hwg_b2_514",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_514"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_515": {
    "canonicalId": "hwg_b2_515",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_515"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_516": {
    "canonicalId": "hwg_b2_516",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_516"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_517": {
    "canonicalId": "hwg_b2_517",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_517"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_518": {
    "canonicalId": "hwg_b2_518",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_518"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_519": {
    "canonicalId": "hwg_b2_519",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_519"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_520": {
    "canonicalId": "hwg_b2_520",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_520"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_521": {
    "canonicalId": "hwg_b2_521",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_521"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_522": {
    "canonicalId": "hwg_b2_522",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_522"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_523": {
    "canonicalId": "hwg_b2_523",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_523"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_524": {
    "canonicalId": "hwg_b2_524",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_524"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_525": {
    "canonicalId": "hwg_b2_525",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_525"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_526": {
    "canonicalId": "hwg_b2_526",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_526"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_527": {
    "canonicalId": "hwg_b2_527",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_527"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_528": {
    "canonicalId": "hwg_b2_528",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_528"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_529": {
    "canonicalId": "hwg_b2_529",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_529"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_530": {
    "canonicalId": "hwg_b2_530",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_530"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_531": {
    "canonicalId": "hwg_b2_531",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_531"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_532": {
    "canonicalId": "hwg_b2_532",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_532"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_533": {
    "canonicalId": "hwg_b2_533",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_533"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_534": {
    "canonicalId": "hwg_b2_534",
    "book": 2,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_534"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_535": {
    "canonicalId": "hwg_b2_535",
    "book": 2,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_535"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_536": {
    "canonicalId": "hwg_b2_536",
    "book": 2,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b2_536"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_537": {
    "canonicalId": "hwg_b2_537",
    "book": 2,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b2_537"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_538": {
    "canonicalId": "hwg_b3_538",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_538"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_539": {
    "canonicalId": "hwg_b3_539",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_539"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_540": {
    "canonicalId": "hwg_b3_540",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_540"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_541": {
    "canonicalId": "hwg_b3_541",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_541"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_542": {
    "canonicalId": "hwg_b3_542",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_542"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_543": {
    "canonicalId": "hwg_b3_543",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_543"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_544": {
    "canonicalId": "hwg_b3_544",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_544"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_545": {
    "canonicalId": "hwg_b3_545",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_545"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_546": {
    "canonicalId": "hwg_b3_546",
    "book": 3,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_546"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_547": {
    "canonicalId": "hwg_b3_547",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_547"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_548": {
    "canonicalId": "hwg_b3_548",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_548"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_549": {
    "canonicalId": "hwg_b3_549",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_549"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_550": {
    "canonicalId": "hwg_b3_550",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_550"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_551": {
    "canonicalId": "hwg_b3_551",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_551"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_552": {
    "canonicalId": "hwg_b3_552",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_552"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_553": {
    "canonicalId": "hwg_b3_553",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_553"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_554": {
    "canonicalId": "hwg_b3_554",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_554"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_555": {
    "canonicalId": "hwg_b3_555",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_555"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_556": {
    "canonicalId": "hwg_b3_556",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_556"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_557": {
    "canonicalId": "hwg_b3_557",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_557"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_558": {
    "canonicalId": "hwg_b3_558",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_558"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_559": {
    "canonicalId": "hwg_b3_559",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_559"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_560": {
    "canonicalId": "hwg_b3_560",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_560"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_561": {
    "canonicalId": "hwg_b3_561",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_561"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_562": {
    "canonicalId": "hwg_b3_562",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_562"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_563": {
    "canonicalId": "hwg_b3_563",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_563"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_564": {
    "canonicalId": "hwg_b3_564",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_564"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_565": {
    "canonicalId": "hwg_b3_565",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_565"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_566": {
    "canonicalId": "hwg_b3_566",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_566"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_567": {
    "canonicalId": "hwg_b3_567",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_567"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_568": {
    "canonicalId": "hwg_b3_568",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_568"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_569": {
    "canonicalId": "hwg_b3_569",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_569"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_570": {
    "canonicalId": "hwg_b3_570",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_570"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_571": {
    "canonicalId": "hwg_b3_571",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_571"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_572": {
    "canonicalId": "hwg_b3_572",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_572"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_573": {
    "canonicalId": "hwg_b3_573",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_573"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_574": {
    "canonicalId": "hwg_b3_574",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_574"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_575": {
    "canonicalId": "hwg_b3_575",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_575"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_576": {
    "canonicalId": "hwg_b3_576",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_576"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_577": {
    "canonicalId": "hwg_b3_577",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_577"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_578": {
    "canonicalId": "hwg_b3_578",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_578"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_579": {
    "canonicalId": "hwg_b3_579",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_579"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_580": {
    "canonicalId": "hwg_b3_580",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_580"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_581": {
    "canonicalId": "hwg_b3_581",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_581"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_582": {
    "canonicalId": "hwg_b3_582",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_582"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_583": {
    "canonicalId": "hwg_b3_583",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_583"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_584": {
    "canonicalId": "hwg_b3_584",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_584"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_585": {
    "canonicalId": "hwg_b3_585",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_585"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_586": {
    "canonicalId": "hwg_b3_586",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_586"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_587": {
    "canonicalId": "hwg_b3_587",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_587"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_588": {
    "canonicalId": "hwg_b3_588",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_588"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_589": {
    "canonicalId": "hwg_b3_589",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_589"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_590": {
    "canonicalId": "hwg_b3_590",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_590"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_591": {
    "canonicalId": "hwg_b4_591",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_591"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_592": {
    "canonicalId": "hwg_b4_592",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_592"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_593": {
    "canonicalId": "hwg_b4_593",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_593"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_594": {
    "canonicalId": "hwg_b4_594",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_594"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_595": {
    "canonicalId": "hwg_b4_595",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_595"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_596": {
    "canonicalId": "hwg_b4_596",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_596"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_597": {
    "canonicalId": "hwg_b4_597",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_597"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_598": {
    "canonicalId": "hwg_b4_598",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_598"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_599": {
    "canonicalId": "hwg_b4_599",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_599"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_600": {
    "canonicalId": "hwg_b4_600",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_600"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_601": {
    "canonicalId": "hwg_b4_601",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_601"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_602": {
    "canonicalId": "hwg_b4_602",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_602"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_603": {
    "canonicalId": "hwg_b4_603",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_603"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_604": {
    "canonicalId": "hwg_b4_604",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_604"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_605": {
    "canonicalId": "hwg_b4_605",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_605"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_606": {
    "canonicalId": "hwg_b4_606",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_606"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_607": {
    "canonicalId": "hwg_b4_607",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_607"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_608": {
    "canonicalId": "hwg_b4_608",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_608"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_609": {
    "canonicalId": "hwg_b4_609",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_609"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_610": {
    "canonicalId": "hwg_b4_610",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_610"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_611": {
    "canonicalId": "hwg_b4_611",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_611"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_612": {
    "canonicalId": "hwg_b4_612",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_612"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_613": {
    "canonicalId": "hwg_b4_613",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_613"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_614": {
    "canonicalId": "hwg_b4_614",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_614"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_615": {
    "canonicalId": "hwg_b4_615",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_615"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_616": {
    "canonicalId": "hwg_b4_616",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_616"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_617": {
    "canonicalId": "hwg_b4_617",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_617"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_618": {
    "canonicalId": "hwg_b4_618",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_618"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_619": {
    "canonicalId": "hwg_b4_619",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_619"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_620": {
    "canonicalId": "hwg_b4_620",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_620"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_621": {
    "canonicalId": "hwg_b4_621",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_621"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_622": {
    "canonicalId": "hwg_b4_622",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_622"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_623": {
    "canonicalId": "hwg_b4_623",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_623"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_624": {
    "canonicalId": "hwg_b4_624",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_624"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_625": {
    "canonicalId": "hwg_b4_625",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_625"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_626": {
    "canonicalId": "hwg_b4_626",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_626"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_627": {
    "canonicalId": "hwg_b4_627",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_627"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_628": {
    "canonicalId": "hwg_b4_628",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_628"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_629": {
    "canonicalId": "hwg_b4_629",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_629"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_630": {
    "canonicalId": "hwg_b4_630",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_630"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_631": {
    "canonicalId": "hwg_b4_631",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_631"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_632": {
    "canonicalId": "hwg_b4_632",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_632"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_633": {
    "canonicalId": "hwg_b4_633",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_633"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_634": {
    "canonicalId": "hwg_b4_634",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_634"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_635": {
    "canonicalId": "hwg_b4_635",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_635"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_636": {
    "canonicalId": "hwg_b4_636",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_636"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_637": {
    "canonicalId": "hwg_b4_637",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_637"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_638": {
    "canonicalId": "hwg_b4_638",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_638"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_639": {
    "canonicalId": "hwg_b4_639",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_639"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_640": {
    "canonicalId": "hwg_b4_640",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_640"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_641": {
    "canonicalId": "hwg_b4_641",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_641"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_642": {
    "canonicalId": "hwg_b4_642",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_642"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_643": {
    "canonicalId": "hwg_b4_643",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_643"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_644": {
    "canonicalId": "hwg_b4_644",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_644"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_645": {
    "canonicalId": "hwg_b4_645",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_645"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_646": {
    "canonicalId": "hwg_b4_646",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_646"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_647": {
    "canonicalId": "hwg_b4_647",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_647"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_648": {
    "canonicalId": "hwg_b4_648",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_648"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_649": {
    "canonicalId": "hwg_b4_649",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_649"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_650": {
    "canonicalId": "hwg_b4_650",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_650"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_651": {
    "canonicalId": "hwg_b4_651",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_651"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_652": {
    "canonicalId": "hwg_b4_652",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_652"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_653": {
    "canonicalId": "hwg_b4_653",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_653"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_654": {
    "canonicalId": "hwg_b4_654",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_654"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_655": {
    "canonicalId": "hwg_b4_655",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_655"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_656": {
    "canonicalId": "hwg_b4_656",
    "book": 4,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_656"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_657": {
    "canonicalId": "hwg_b4_657",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_657"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_658": {
    "canonicalId": "hwg_b4_658",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_658"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_659": {
    "canonicalId": "hwg_b4_659",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_659"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_660": {
    "canonicalId": "hwg_b4_660",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_660"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_661": {
    "canonicalId": "hwg_b4_661",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_661"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_662": {
    "canonicalId": "hwg_b4_662",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_662"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_663": {
    "canonicalId": "hwg_b4_663",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_663"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_664": {
    "canonicalId": "hwg_b4_664",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_664"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_665": {
    "canonicalId": "hwg_b4_665",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_665"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_666": {
    "canonicalId": "hwg_b4_666",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_666"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_667": {
    "canonicalId": "hwg_b4_667",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_667"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_668": {
    "canonicalId": "hwg_b4_668",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_668"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_669": {
    "canonicalId": "hwg_b4_669",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_669"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_670": {
    "canonicalId": "hwg_b4_670",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_670"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_671": {
    "canonicalId": "hwg_b4_671",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_671"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_672": {
    "canonicalId": "hwg_b4_672",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_672"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_673": {
    "canonicalId": "hwg_b4_673",
    "book": 4,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b4_673"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_674": {
    "canonicalId": "hwg_b4_674",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_674"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_675": {
    "canonicalId": "hwg_b4_675",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_675"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_676": {
    "canonicalId": "hwg_b4_676",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_676"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_677": {
    "canonicalId": "hwg_b4_677",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_677"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_678": {
    "canonicalId": "hwg_b4_678",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_678"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_679": {
    "canonicalId": "hwg_b4_679",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_679"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_680": {
    "canonicalId": "hwg_b4_680",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_680"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_681": {
    "canonicalId": "hwg_b4_681",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_681"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_682": {
    "canonicalId": "hwg_b4_682",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_682"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_683": {
    "canonicalId": "hwg_b4_683",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_683"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_684": {
    "canonicalId": "hwg_b4_684",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_684"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_685": {
    "canonicalId": "hwg_b4_685",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_685"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_686": {
    "canonicalId": "hwg_b4_686",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_686"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_687": {
    "canonicalId": "hwg_b4_687",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_687"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_688": {
    "canonicalId": "hwg_b4_688",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_688"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_689": {
    "canonicalId": "hwg_b4_689",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_689"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_690": {
    "canonicalId": "hwg_b4_690",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_690"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_691": {
    "canonicalId": "hwg_b4_691",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_691"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_692": {
    "canonicalId": "hwg_b4_692",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_692"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_693": {
    "canonicalId": "hwg_b4_693",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_693"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_694": {
    "canonicalId": "hwg_b4_694",
    "book": 4,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_694"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_695": {
    "canonicalId": "hwg_b4_695",
    "book": 4,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_695"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_696": {
    "canonicalId": "hwg_b4_696",
    "book": 4,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b4_696"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_697": {
    "canonicalId": "hwg_b4_697",
    "book": 4,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b4_697"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_698": {
    "canonicalId": "hwg_b4_698",
    "book": 4,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b4_698"
    ],
    "duplicateCount": 0
  },
  "hwg_b4_699": {
    "canonicalId": "hwg_b4_699",
    "book": 4,
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "legacyIds": [
      "hwg_b4_699"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_700": {
    "canonicalId": "hwg_b5_700",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_700"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_701": {
    "canonicalId": "hwg_b5_701",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_701"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_702": {
    "canonicalId": "hwg_b5_702",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_702"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_703": {
    "canonicalId": "hwg_b5_703",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_703"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_704": {
    "canonicalId": "hwg_b5_704",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_704"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_705": {
    "canonicalId": "hwg_b5_705",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_705"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_706": {
    "canonicalId": "hwg_b5_706",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_706"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_707": {
    "canonicalId": "hwg_b5_707",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_707"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_708": {
    "canonicalId": "hwg_b5_708",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_708"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_709": {
    "canonicalId": "hwg_b5_709",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_709"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_710": {
    "canonicalId": "hwg_b5_710",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_710"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_711": {
    "canonicalId": "hwg_b5_711",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_711"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_712": {
    "canonicalId": "hwg_b5_712",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_712"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_713": {
    "canonicalId": "hwg_b5_713",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_713"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_714": {
    "canonicalId": "hwg_b5_714",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_714"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_715": {
    "canonicalId": "hwg_b5_715",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_715"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_716": {
    "canonicalId": "hwg_b5_716",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_716"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_717": {
    "canonicalId": "hwg_b5_717",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_717"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_718": {
    "canonicalId": "hwg_b5_718",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_718"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_719": {
    "canonicalId": "hwg_b5_719",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_719"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_720": {
    "canonicalId": "hwg_b5_720",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_720"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_721": {
    "canonicalId": "hwg_b5_721",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_721"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_722": {
    "canonicalId": "hwg_b5_722",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_722"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_723": {
    "canonicalId": "hwg_b5_723",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_723"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_724": {
    "canonicalId": "hwg_b5_724",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_724"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_725": {
    "canonicalId": "hwg_b5_725",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_725"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_726": {
    "canonicalId": "hwg_b5_726",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_726"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_727": {
    "canonicalId": "hwg_b5_727",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_727"
    ],
    "duplicateCount": 0
  },
  "hwg_b5_728": {
    "canonicalId": "hwg_b5_728",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_728"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_729": {
    "canonicalId": "hwg_b6_729",
    "book": 6,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b6_729"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_730": {
    "canonicalId": "hwg_b6_730",
    "book": 6,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b6_730"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_731": {
    "canonicalId": "hwg_b6_731",
    "book": 6,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b6_731"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_732": {
    "canonicalId": "hwg_b6_732",
    "book": 6,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b6_732"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_733": {
    "canonicalId": "hwg_b6_733",
    "book": 6,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b6_733"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_734": {
    "canonicalId": "hwg_b6_734",
    "book": 6,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b6_734"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_735": {
    "canonicalId": "hwg_b6_735",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_735"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_736": {
    "canonicalId": "hwg_b6_736",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_736"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_737": {
    "canonicalId": "hwg_b6_737",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_737"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_738": {
    "canonicalId": "hwg_b6_738",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_738"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_739": {
    "canonicalId": "hwg_b6_739",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_739"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_740": {
    "canonicalId": "hwg_b6_740",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_740"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_741": {
    "canonicalId": "hwg_b6_741",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_741"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_742": {
    "canonicalId": "hwg_b6_742",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_742"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_743": {
    "canonicalId": "hwg_b6_743",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_743"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_744": {
    "canonicalId": "hwg_b6_744",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_744"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_745": {
    "canonicalId": "hwg_b6_745",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_745"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_746": {
    "canonicalId": "hwg_b6_746",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_746"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_747": {
    "canonicalId": "hwg_b6_747",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_747"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_748": {
    "canonicalId": "hwg_b6_748",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_748"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_749": {
    "canonicalId": "hwg_b6_749",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_749"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_750": {
    "canonicalId": "hwg_b6_750",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_750"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_751": {
    "canonicalId": "hwg_b6_751",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_751"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_752": {
    "canonicalId": "hwg_b6_752",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_752"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_753": {
    "canonicalId": "hwg_b6_753",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_753"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_754": {
    "canonicalId": "hwg_b6_754",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_754"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_755": {
    "canonicalId": "hwg_b6_755",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_755"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_756": {
    "canonicalId": "hwg_b6_756",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_756"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_757": {
    "canonicalId": "hwg_b6_757",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_757"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_758": {
    "canonicalId": "hwg_b6_758",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_758"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_759": {
    "canonicalId": "hwg_b6_759",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_759"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_760": {
    "canonicalId": "hwg_b6_760",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_760"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_761": {
    "canonicalId": "hwg_b6_761",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_761"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_762": {
    "canonicalId": "hwg_b6_762",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_762"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_763": {
    "canonicalId": "hwg_b6_763",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_763"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_764": {
    "canonicalId": "hwg_b6_764",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_764"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_765": {
    "canonicalId": "hwg_b6_765",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_765"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_766": {
    "canonicalId": "hwg_b6_766",
    "book": 6,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_766"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_767": {
    "canonicalId": "hwg_b6_767",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_767"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_768": {
    "canonicalId": "hwg_b6_768",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_768"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_769": {
    "canonicalId": "hwg_b6_769",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_769"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_770": {
    "canonicalId": "hwg_b6_770",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_770"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_771": {
    "canonicalId": "hwg_b6_771",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_771"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_772": {
    "canonicalId": "hwg_b6_772",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_772"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_773": {
    "canonicalId": "hwg_b6_773",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_773"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_774": {
    "canonicalId": "hwg_b6_774",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_774"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_775": {
    "canonicalId": "hwg_b6_775",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_775"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_776": {
    "canonicalId": "hwg_b6_776",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_776"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_777": {
    "canonicalId": "hwg_b6_777",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_777"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_778": {
    "canonicalId": "hwg_b6_778",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_778"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_779": {
    "canonicalId": "hwg_b6_779",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_779"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_780": {
    "canonicalId": "hwg_b6_780",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_780"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_781": {
    "canonicalId": "hwg_b6_781",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_781"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_782": {
    "canonicalId": "hwg_b6_782",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_782"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_783": {
    "canonicalId": "hwg_b6_783",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_783"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_784": {
    "canonicalId": "hwg_b6_784",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_784"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_785": {
    "canonicalId": "hwg_b6_785",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_785"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_786": {
    "canonicalId": "hwg_b6_786",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_786"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_787": {
    "canonicalId": "hwg_b6_787",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_787"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_788": {
    "canonicalId": "hwg_b6_788",
    "book": 6,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_788"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_789": {
    "canonicalId": "hwg_b6_789",
    "book": 6,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_789"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_790": {
    "canonicalId": "hwg_b6_790",
    "book": 6,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_790"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_791": {
    "canonicalId": "hwg_b6_791",
    "book": 6,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_791"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_792": {
    "canonicalId": "hwg_b6_792",
    "book": 6,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_792"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_793": {
    "canonicalId": "hwg_b6_793",
    "book": 6,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_793"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_794": {
    "canonicalId": "hwg_b6_794",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_794"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_795": {
    "canonicalId": "hwg_b6_795",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_795"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_796": {
    "canonicalId": "hwg_b6_796",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_796"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_797": {
    "canonicalId": "hwg_b6_797",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_797"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_798": {
    "canonicalId": "hwg_b6_798",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_798"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_799": {
    "canonicalId": "hwg_b6_799",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_799"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_800": {
    "canonicalId": "hwg_b6_800",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_800"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_801": {
    "canonicalId": "hwg_b6_801",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_801"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_802": {
    "canonicalId": "hwg_b6_802",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_802"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_803": {
    "canonicalId": "hwg_b6_803",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_803"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_804": {
    "canonicalId": "hwg_b6_804",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_804"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_805": {
    "canonicalId": "hwg_b6_805",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_805"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_806": {
    "canonicalId": "hwg_b6_806",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_806"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_807": {
    "canonicalId": "hwg_b6_807",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_807"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_808": {
    "canonicalId": "hwg_b6_808",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_808"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_809": {
    "canonicalId": "hwg_b6_809",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_809"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_810": {
    "canonicalId": "hwg_b6_810",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_810"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_811": {
    "canonicalId": "hwg_b6_811",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_811"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_812": {
    "canonicalId": "hwg_b6_812",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_812"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_813": {
    "canonicalId": "hwg_b6_813",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_813"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_814": {
    "canonicalId": "hwg_b6_814",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_814"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_815": {
    "canonicalId": "hwg_b6_815",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_815"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_816": {
    "canonicalId": "hwg_b6_816",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_816"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_817": {
    "canonicalId": "hwg_b6_817",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_817"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_818": {
    "canonicalId": "hwg_b6_818",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_818"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_819": {
    "canonicalId": "hwg_b6_819",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_819"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_820": {
    "canonicalId": "hwg_b6_820",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_820"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_821": {
    "canonicalId": "hwg_b6_821",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_821"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_822": {
    "canonicalId": "hwg_b6_822",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_822"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_823": {
    "canonicalId": "hwg_b6_823",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_823"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_824": {
    "canonicalId": "hwg_b6_824",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_824"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_825": {
    "canonicalId": "hwg_b6_825",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_825"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_826": {
    "canonicalId": "hwg_b6_826",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_826"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_827": {
    "canonicalId": "hwg_b6_827",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_827"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_828": {
    "canonicalId": "hwg_b6_828",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_828"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_829": {
    "canonicalId": "hwg_b6_829",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_829"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_830": {
    "canonicalId": "hwg_b6_830",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_830"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_831": {
    "canonicalId": "hwg_b6_831",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_831"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_832": {
    "canonicalId": "hwg_b6_832",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_832"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_833": {
    "canonicalId": "hwg_b6_833",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_833"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_834": {
    "canonicalId": "hwg_b6_834",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_834"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_835": {
    "canonicalId": "hwg_b6_835",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_835"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_836": {
    "canonicalId": "hwg_b6_836",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_836"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_837": {
    "canonicalId": "hwg_b6_837",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_837"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_838": {
    "canonicalId": "hwg_b6_838",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_838"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_839": {
    "canonicalId": "hwg_b6_839",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_839"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_840": {
    "canonicalId": "hwg_b6_840",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_840"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_841": {
    "canonicalId": "hwg_b6_841",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_841"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_842": {
    "canonicalId": "hwg_b6_842",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_842"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_843": {
    "canonicalId": "hwg_b6_843",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_843"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_844": {
    "canonicalId": "hwg_b6_844",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_844"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_845": {
    "canonicalId": "hwg_b6_845",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_845"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_846": {
    "canonicalId": "hwg_b6_846",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_846"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_847": {
    "canonicalId": "hwg_b6_847",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_847"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_848": {
    "canonicalId": "hwg_b6_848",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_848"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_849": {
    "canonicalId": "hwg_b6_849",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_849"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_850": {
    "canonicalId": "hwg_b6_850",
    "book": 6,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_850"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_851": {
    "canonicalId": "hwg_b6_851",
    "book": 6,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_851"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_852": {
    "canonicalId": "hwg_b6_852",
    "book": 6,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_852"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_853": {
    "canonicalId": "hwg_b6_853",
    "book": 6,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_853"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_854": {
    "canonicalId": "hwg_b6_854",
    "book": 6,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_854"
    ],
    "duplicateCount": 0
  },
  "hwg_b6_855": {
    "canonicalId": "hwg_b6_855",
    "book": 6,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_855"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_856": {
    "canonicalId": "hwg_b7_856",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_856"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_857": {
    "canonicalId": "hwg_b7_857",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_857"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_858": {
    "canonicalId": "hwg_b7_858",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_858"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_859": {
    "canonicalId": "hwg_b7_859",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_859"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_860": {
    "canonicalId": "hwg_b7_860",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_860"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_861": {
    "canonicalId": "hwg_b7_861",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_861"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_862": {
    "canonicalId": "hwg_b7_862",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_862"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_863": {
    "canonicalId": "hwg_b7_863",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_863"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_864": {
    "canonicalId": "hwg_b7_864",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_864"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_865": {
    "canonicalId": "hwg_b7_865",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_865"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_866": {
    "canonicalId": "hwg_b7_866",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_866"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_867": {
    "canonicalId": "hwg_b7_867",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_867"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_868": {
    "canonicalId": "hwg_b7_868",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_868"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_869": {
    "canonicalId": "hwg_b7_869",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_869"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_870": {
    "canonicalId": "hwg_b7_870",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_870"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_871": {
    "canonicalId": "hwg_b7_871",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_871"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_872": {
    "canonicalId": "hwg_b7_872",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_872"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_873": {
    "canonicalId": "hwg_b7_873",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_873"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_874": {
    "canonicalId": "hwg_b7_874",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_874"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_875": {
    "canonicalId": "hwg_b7_875",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_875"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_876": {
    "canonicalId": "hwg_b7_876",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_876"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_877": {
    "canonicalId": "hwg_b7_877",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_877"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_878": {
    "canonicalId": "hwg_b7_878",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_878"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_879": {
    "canonicalId": "hwg_b7_879",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_879"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_880": {
    "canonicalId": "hwg_b7_880",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_880"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_881": {
    "canonicalId": "hwg_b7_881",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_881"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_882": {
    "canonicalId": "hwg_b7_882",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_882"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_883": {
    "canonicalId": "hwg_b7_883",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_883"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_884": {
    "canonicalId": "hwg_b7_884",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_884"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_885": {
    "canonicalId": "hwg_b7_885",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_885"
    ],
    "duplicateCount": 0
  },
  "hwg_b7_886": {
    "canonicalId": "hwg_b7_886",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_886"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_887": {
    "canonicalId": "hwg_b8_887",
    "book": 8,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b8_887"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_888": {
    "canonicalId": "hwg_b8_888",
    "book": 8,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b8_888"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_889": {
    "canonicalId": "hwg_b8_889",
    "book": 8,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b8_889"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_890": {
    "canonicalId": "hwg_b8_890",
    "book": 8,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b8_890"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_891": {
    "canonicalId": "hwg_b8_891",
    "book": 8,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b8_891"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_892": {
    "canonicalId": "hwg_b8_892",
    "book": 8,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b8_892"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_893": {
    "canonicalId": "hwg_b8_893",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_893"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_894": {
    "canonicalId": "hwg_b8_894",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_894"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_895": {
    "canonicalId": "hwg_b8_895",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_895"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_896": {
    "canonicalId": "hwg_b8_896",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_896"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_897": {
    "canonicalId": "hwg_b8_897",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_897"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_898": {
    "canonicalId": "hwg_b8_898",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_898"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_899": {
    "canonicalId": "hwg_b8_899",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_899"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_900": {
    "canonicalId": "hwg_b8_900",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_900"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_901": {
    "canonicalId": "hwg_b8_901",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_901"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_902": {
    "canonicalId": "hwg_b8_902",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_902"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_903": {
    "canonicalId": "hwg_b8_903",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_903"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_904": {
    "canonicalId": "hwg_b8_904",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_904"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_905": {
    "canonicalId": "hwg_b8_905",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_905"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_906": {
    "canonicalId": "hwg_b8_906",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_906"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_907": {
    "canonicalId": "hwg_b8_907",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_907"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_908": {
    "canonicalId": "hwg_b8_908",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_908"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_909": {
    "canonicalId": "hwg_b8_909",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_909"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_910": {
    "canonicalId": "hwg_b8_910",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_910"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_911": {
    "canonicalId": "hwg_b8_911",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_911"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_912": {
    "canonicalId": "hwg_b8_912",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_912"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_913": {
    "canonicalId": "hwg_b8_913",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_913"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_914": {
    "canonicalId": "hwg_b8_914",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_914"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_915": {
    "canonicalId": "hwg_b8_915",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_915"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_916": {
    "canonicalId": "hwg_b8_916",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_916"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_917": {
    "canonicalId": "hwg_b8_917",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_917"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_918": {
    "canonicalId": "hwg_b8_918",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_918"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_919": {
    "canonicalId": "hwg_b8_919",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_919"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_920": {
    "canonicalId": "hwg_b8_920",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_920"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_921": {
    "canonicalId": "hwg_b8_921",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_921"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_922": {
    "canonicalId": "hwg_b8_922",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_922"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_923": {
    "canonicalId": "hwg_b8_923",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_923"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_924": {
    "canonicalId": "hwg_b8_924",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_924"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_925": {
    "canonicalId": "hwg_b8_925",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_925"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_926": {
    "canonicalId": "hwg_b8_926",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_926"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_927": {
    "canonicalId": "hwg_b8_927",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_927"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_928": {
    "canonicalId": "hwg_b8_928",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_928"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_929": {
    "canonicalId": "hwg_b8_929",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_929"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_930": {
    "canonicalId": "hwg_b8_930",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_930"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_931": {
    "canonicalId": "hwg_b8_931",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_931"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_932": {
    "canonicalId": "hwg_b8_932",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_932"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_933": {
    "canonicalId": "hwg_b8_933",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_933"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_934": {
    "canonicalId": "hwg_b8_934",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_934"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_935": {
    "canonicalId": "hwg_b8_935",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_935"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_936": {
    "canonicalId": "hwg_b8_936",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_936"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_937": {
    "canonicalId": "hwg_b8_937",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_937"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_938": {
    "canonicalId": "hwg_b8_938",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_938"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_939": {
    "canonicalId": "hwg_b8_939",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_939"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_940": {
    "canonicalId": "hwg_b8_940",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_940"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_941": {
    "canonicalId": "hwg_b8_941",
    "book": 8,
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_941"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_942": {
    "canonicalId": "hwg_b8_942",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_942"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_943": {
    "canonicalId": "hwg_b8_943",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_943"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_944": {
    "canonicalId": "hwg_b8_944",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_944"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_945": {
    "canonicalId": "hwg_b8_945",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_945"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_946": {
    "canonicalId": "hwg_b8_946",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_946"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_947": {
    "canonicalId": "hwg_b8_947",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_947"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_948": {
    "canonicalId": "hwg_b8_948",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_948"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_949": {
    "canonicalId": "hwg_b8_949",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_949"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_950": {
    "canonicalId": "hwg_b8_950",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_950"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_951": {
    "canonicalId": "hwg_b8_951",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_951"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_952": {
    "canonicalId": "hwg_b8_952",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_952"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_953": {
    "canonicalId": "hwg_b8_953",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_953"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_954": {
    "canonicalId": "hwg_b8_954",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_954"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_955": {
    "canonicalId": "hwg_b8_955",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_955"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_956": {
    "canonicalId": "hwg_b8_956",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_956"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_957": {
    "canonicalId": "hwg_b8_957",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_957"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_958": {
    "canonicalId": "hwg_b8_958",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_958"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_959": {
    "canonicalId": "hwg_b8_959",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_959"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_960": {
    "canonicalId": "hwg_b8_960",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_960"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_961": {
    "canonicalId": "hwg_b8_961",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_961"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_962": {
    "canonicalId": "hwg_b8_962",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_962"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_963": {
    "canonicalId": "hwg_b8_963",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_963"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_964": {
    "canonicalId": "hwg_b8_964",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_964"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_965": {
    "canonicalId": "hwg_b8_965",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_965"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_966": {
    "canonicalId": "hwg_b8_966",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_966"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_967": {
    "canonicalId": "hwg_b8_967",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_967"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_968": {
    "canonicalId": "hwg_b8_968",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_968"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_969": {
    "canonicalId": "hwg_b8_969",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_969"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_970": {
    "canonicalId": "hwg_b8_970",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_970"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_971": {
    "canonicalId": "hwg_b8_971",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_971"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_972": {
    "canonicalId": "hwg_b8_972",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_972"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_973": {
    "canonicalId": "hwg_b8_973",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_973"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_974": {
    "canonicalId": "hwg_b8_974",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_974"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_975": {
    "canonicalId": "hwg_b8_975",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_975"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_976": {
    "canonicalId": "hwg_b8_976",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_976"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_977": {
    "canonicalId": "hwg_b8_977",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_977"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_978": {
    "canonicalId": "hwg_b8_978",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_978"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_979": {
    "canonicalId": "hwg_b8_979",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_979"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_980": {
    "canonicalId": "hwg_b8_980",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_980"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_981": {
    "canonicalId": "hwg_b8_981",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_981"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_982": {
    "canonicalId": "hwg_b8_982",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_982"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_983": {
    "canonicalId": "hwg_b8_983",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_983"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_984": {
    "canonicalId": "hwg_b8_984",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_984"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_985": {
    "canonicalId": "hwg_b8_985",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_985"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_986": {
    "canonicalId": "hwg_b8_986",
    "book": 8,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_986"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_987": {
    "canonicalId": "hwg_b8_987",
    "book": 8,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_987"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_988": {
    "canonicalId": "hwg_b8_988",
    "book": 8,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_988"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_989": {
    "canonicalId": "hwg_b8_989",
    "book": 8,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_989"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_990": {
    "canonicalId": "hwg_b8_990",
    "book": 8,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_990"
    ],
    "duplicateCount": 0
  },
  "hwg_b8_991": {
    "canonicalId": "hwg_b8_991",
    "book": 8,
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_991"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_992": {
    "canonicalId": "hwg_b9_992",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_992"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_993": {
    "canonicalId": "hwg_b9_993",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_993"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_994": {
    "canonicalId": "hwg_b9_994",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_994"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_995": {
    "canonicalId": "hwg_b9_995",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_995"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_996": {
    "canonicalId": "hwg_b9_996",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_996"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_997": {
    "canonicalId": "hwg_b9_997",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_997"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_998": {
    "canonicalId": "hwg_b9_998",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_998"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_999": {
    "canonicalId": "hwg_b9_999",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_999"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1000": {
    "canonicalId": "hwg_b9_1000",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1000"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1001": {
    "canonicalId": "hwg_b9_1001",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1001"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1002": {
    "canonicalId": "hwg_b9_1002",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1002"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1003": {
    "canonicalId": "hwg_b9_1003",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1003"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1004": {
    "canonicalId": "hwg_b9_1004",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1004"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1005": {
    "canonicalId": "hwg_b9_1005",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1005"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1006": {
    "canonicalId": "hwg_b9_1006",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1006"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1007": {
    "canonicalId": "hwg_b9_1007",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1007"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1008": {
    "canonicalId": "hwg_b9_1008",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1008"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1009": {
    "canonicalId": "hwg_b9_1009",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1009"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1010": {
    "canonicalId": "hwg_b9_1010",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1010"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1011": {
    "canonicalId": "hwg_b9_1011",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1011"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1012": {
    "canonicalId": "hwg_b9_1012",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1012"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1013": {
    "canonicalId": "hwg_b9_1013",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1013"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1014": {
    "canonicalId": "hwg_b9_1014",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1014"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1015": {
    "canonicalId": "hwg_b9_1015",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_1015"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1016": {
    "canonicalId": "hwg_b9_1016",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1016"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1017": {
    "canonicalId": "hwg_b9_1017",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1017"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1018": {
    "canonicalId": "hwg_b9_1018",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1018"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1019": {
    "canonicalId": "hwg_b9_1019",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1019"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1020": {
    "canonicalId": "hwg_b9_1020",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1020"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1021": {
    "canonicalId": "hwg_b9_1021",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1021"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1022": {
    "canonicalId": "hwg_b9_1022",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1022"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1023": {
    "canonicalId": "hwg_b9_1023",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1023"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1024": {
    "canonicalId": "hwg_b9_1024",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1024"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1025": {
    "canonicalId": "hwg_b9_1025",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1025"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1026": {
    "canonicalId": "hwg_b9_1026",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1026"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1027": {
    "canonicalId": "hwg_b9_1027",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1027"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1028": {
    "canonicalId": "hwg_b9_1028",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1028"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1029": {
    "canonicalId": "hwg_b9_1029",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1029"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1030": {
    "canonicalId": "hwg_b9_1030",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1030"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1031": {
    "canonicalId": "hwg_b9_1031",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1031"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1032": {
    "canonicalId": "hwg_b9_1032",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1032"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1033": {
    "canonicalId": "hwg_b9_1033",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1033"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1034": {
    "canonicalId": "hwg_b9_1034",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1034"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1035": {
    "canonicalId": "hwg_b9_1035",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1035"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1036": {
    "canonicalId": "hwg_b9_1036",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1036"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1037": {
    "canonicalId": "hwg_b9_1037",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1037"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1038": {
    "canonicalId": "hwg_b9_1038",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1038"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1039": {
    "canonicalId": "hwg_b9_1039",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1039"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1040": {
    "canonicalId": "hwg_b9_1040",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1040"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1041": {
    "canonicalId": "hwg_b9_1041",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1041"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1042": {
    "canonicalId": "hwg_b9_1042",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1042"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1043": {
    "canonicalId": "hwg_b9_1043",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1043"
    ],
    "duplicateCount": 0
  },
  "hwg_b9_1044": {
    "canonicalId": "hwg_b9_1044",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_1044"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1045": {
    "canonicalId": "hwg_bg1_1045",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1045"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1046": {
    "canonicalId": "hwg_bg1_1046",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1046"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1047": {
    "canonicalId": "hwg_bg1_1047",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1047"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1048": {
    "canonicalId": "hwg_bg1_1048",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1048"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1049": {
    "canonicalId": "hwg_bg1_1049",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1049"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1050": {
    "canonicalId": "hwg_bg1_1050",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1050"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1051": {
    "canonicalId": "hwg_bg1_1051",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1051"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1052": {
    "canonicalId": "hwg_bg1_1052",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1052"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1053": {
    "canonicalId": "hwg_bg1_1053",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1053"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1054": {
    "canonicalId": "hwg_bg1_1054",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1054"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1055": {
    "canonicalId": "hwg_bg1_1055",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1055"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1056": {
    "canonicalId": "hwg_bg1_1056",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1056"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1057": {
    "canonicalId": "hwg_bg1_1057",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1057"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1058": {
    "canonicalId": "hwg_bg1_1058",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1058"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1059": {
    "canonicalId": "hwg_bg1_1059",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1059"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1060": {
    "canonicalId": "hwg_bg1_1060",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1060"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1061": {
    "canonicalId": "hwg_bg1_1061",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1061"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1062": {
    "canonicalId": "hwg_bg1_1062",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1062"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1063": {
    "canonicalId": "hwg_bg1_1063",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1063"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1064": {
    "canonicalId": "hwg_bg1_1064",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1064"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1065": {
    "canonicalId": "hwg_bg1_1065",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1065"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1066": {
    "canonicalId": "hwg_bg1_1066",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1066"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1067": {
    "canonicalId": "hwg_bg1_1067",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1067"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1068": {
    "canonicalId": "hwg_bg1_1068",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1068"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1069": {
    "canonicalId": "hwg_bg1_1069",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1069"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1070": {
    "canonicalId": "hwg_bg1_1070",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1070"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1071": {
    "canonicalId": "hwg_bg1_1071",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1071"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1072": {
    "canonicalId": "hwg_bg1_1072",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1072"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1073": {
    "canonicalId": "hwg_bg1_1073",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1073"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1074": {
    "canonicalId": "hwg_bg1_1074",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1074"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1075": {
    "canonicalId": "hwg_bg1_1075",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1075"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1076": {
    "canonicalId": "hwg_bg1_1076",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1076"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1077": {
    "canonicalId": "hwg_bg1_1077",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1077"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1078": {
    "canonicalId": "hwg_bg1_1078",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1078"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1079": {
    "canonicalId": "hwg_bg1_1079",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1079"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1080": {
    "canonicalId": "hwg_bg1_1080",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1080"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1081": {
    "canonicalId": "hwg_bg1_1081",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1081"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1082": {
    "canonicalId": "hwg_bg1_1082",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1082"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1083": {
    "canonicalId": "hwg_bg1_1083",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1083"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1084": {
    "canonicalId": "hwg_bg1_1084",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1084"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1085": {
    "canonicalId": "hwg_bg1_1085",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1085"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1086": {
    "canonicalId": "hwg_bg1_1086",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1086"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1087": {
    "canonicalId": "hwg_bg1_1087",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1087"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1088": {
    "canonicalId": "hwg_bg1_1088",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1088"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1089": {
    "canonicalId": "hwg_bg1_1089",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1089"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1090": {
    "canonicalId": "hwg_bg1_1090",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1090"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1091": {
    "canonicalId": "hwg_bg1_1091",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1091"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1092": {
    "canonicalId": "hwg_bg1_1092",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1092"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1093": {
    "canonicalId": "hwg_bg1_1093",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1093"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1094": {
    "canonicalId": "hwg_bg1_1094",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1094"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1095": {
    "canonicalId": "hwg_bg1_1095",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1095"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1096": {
    "canonicalId": "hwg_bg1_1096",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1096"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1097": {
    "canonicalId": "hwg_bg1_1097",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1097"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1098": {
    "canonicalId": "hwg_bg1_1098",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1098"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1099": {
    "canonicalId": "hwg_bg1_1099",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1099"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1100": {
    "canonicalId": "hwg_bg1_1100",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1100"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1101": {
    "canonicalId": "hwg_bg1_1101",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1101"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1102": {
    "canonicalId": "hwg_bg1_1102",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1102"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1103": {
    "canonicalId": "hwg_bg1_1103",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1103"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1104": {
    "canonicalId": "hwg_bg1_1104",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1104"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1105": {
    "canonicalId": "hwg_bg1_1105",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1105"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1106": {
    "canonicalId": "hwg_bg1_1106",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1106"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1107": {
    "canonicalId": "hwg_bg1_1107",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1107"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1108": {
    "canonicalId": "hwg_bg1_1108",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1108"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1109": {
    "canonicalId": "hwg_bg1_1109",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1109"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1110": {
    "canonicalId": "hwg_bg1_1110",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1110"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1111": {
    "canonicalId": "hwg_bg1_1111",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1111"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1112": {
    "canonicalId": "hwg_bg1_1112",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1112"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1113": {
    "canonicalId": "hwg_bg1_1113",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1113"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1114": {
    "canonicalId": "hwg_bg1_1114",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1114"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1115": {
    "canonicalId": "hwg_bg1_1115",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1115"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1116": {
    "canonicalId": "hwg_bg1_1116",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1116"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1117": {
    "canonicalId": "hwg_bg1_1117",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1117"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1118": {
    "canonicalId": "hwg_bg1_1118",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1118"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1119": {
    "canonicalId": "hwg_bg1_1119",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1119"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1120": {
    "canonicalId": "hwg_bg1_1120",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1120"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1121": {
    "canonicalId": "hwg_bg1_1121",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1121"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1122": {
    "canonicalId": "hwg_bg1_1122",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1122"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1123": {
    "canonicalId": "hwg_bg1_1123",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1123"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1124": {
    "canonicalId": "hwg_bg1_1124",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1124"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1125": {
    "canonicalId": "hwg_bg1_1125",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1125"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1126": {
    "canonicalId": "hwg_bg1_1126",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1126"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1127": {
    "canonicalId": "hwg_bg1_1127",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1127"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1128": {
    "canonicalId": "hwg_bg1_1128",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1128"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1129": {
    "canonicalId": "hwg_bg1_1129",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1129"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1130": {
    "canonicalId": "hwg_bg1_1130",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1130"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1131": {
    "canonicalId": "hwg_bg1_1131",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1131"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1132": {
    "canonicalId": "hwg_bg1_1132",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1132"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1133": {
    "canonicalId": "hwg_bg1_1133",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1133"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1134": {
    "canonicalId": "hwg_bg1_1134",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1134"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1135": {
    "canonicalId": "hwg_bg1_1135",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1135"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1136": {
    "canonicalId": "hwg_bg1_1136",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1136"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1137": {
    "canonicalId": "hwg_bg1_1137",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1137"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1138": {
    "canonicalId": "hwg_bg1_1138",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1138"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1139": {
    "canonicalId": "hwg_bg1_1139",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1139"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1140": {
    "canonicalId": "hwg_bg1_1140",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1140"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1141": {
    "canonicalId": "hwg_bg1_1141",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1141"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1142": {
    "canonicalId": "hwg_bg1_1142",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1142"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1143": {
    "canonicalId": "hwg_bg1_1143",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1143"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1144": {
    "canonicalId": "hwg_bg1_1144",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1144"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1145": {
    "canonicalId": "hwg_bg1_1145",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1145"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1146": {
    "canonicalId": "hwg_bg1_1146",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1146"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1147": {
    "canonicalId": "hwg_bg1_1147",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_1147"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1148": {
    "canonicalId": "hwg_bg1_1148",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1148"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1149": {
    "canonicalId": "hwg_bg1_1149",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1149"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1150": {
    "canonicalId": "hwg_bg1_1150",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1150"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1151": {
    "canonicalId": "hwg_bg1_1151",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1151"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1152": {
    "canonicalId": "hwg_bg1_1152",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1152"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1153": {
    "canonicalId": "hwg_bg1_1153",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1153"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1154": {
    "canonicalId": "hwg_bg1_1154",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_1154"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1155": {
    "canonicalId": "hwg_bg1_1155",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1155"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1156": {
    "canonicalId": "hwg_bg1_1156",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1156"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1157": {
    "canonicalId": "hwg_bg1_1157",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1157"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1158": {
    "canonicalId": "hwg_bg1_1158",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1158"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1159": {
    "canonicalId": "hwg_bg1_1159",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1159"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1160": {
    "canonicalId": "hwg_bg1_1160",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_1160"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1161": {
    "canonicalId": "hwg_bg1_1161",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1161"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1162": {
    "canonicalId": "hwg_bg1_1162",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1162"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1163": {
    "canonicalId": "hwg_bg1_1163",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1163"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_1164": {
    "canonicalId": "hwg_bg1_1164",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_1164"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1165": {
    "canonicalId": "hwg_bg2_1165",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1165"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1166": {
    "canonicalId": "hwg_bg2_1166",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1166"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1167": {
    "canonicalId": "hwg_bg2_1167",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1167"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1168": {
    "canonicalId": "hwg_bg2_1168",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1168"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1169": {
    "canonicalId": "hwg_bg2_1169",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1169"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1170": {
    "canonicalId": "hwg_bg2_1170",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1170"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1171": {
    "canonicalId": "hwg_bg2_1171",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1171"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1172": {
    "canonicalId": "hwg_bg2_1172",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1172"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1173": {
    "canonicalId": "hwg_bg2_1173",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1173"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1174": {
    "canonicalId": "hwg_bg2_1174",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1174"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1175": {
    "canonicalId": "hwg_bg2_1175",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1175"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1176": {
    "canonicalId": "hwg_bg2_1176",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1176"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1177": {
    "canonicalId": "hwg_bg2_1177",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1177"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1178": {
    "canonicalId": "hwg_bg2_1178",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1178"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1179": {
    "canonicalId": "hwg_bg2_1179",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1179"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1180": {
    "canonicalId": "hwg_bg2_1180",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1180"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1181": {
    "canonicalId": "hwg_bg2_1181",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1181"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1182": {
    "canonicalId": "hwg_bg2_1182",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1182"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1183": {
    "canonicalId": "hwg_bg2_1183",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1183"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1184": {
    "canonicalId": "hwg_bg2_1184",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1184"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1185": {
    "canonicalId": "hwg_bg2_1185",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1185"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1186": {
    "canonicalId": "hwg_bg2_1186",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1186"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1187": {
    "canonicalId": "hwg_bg2_1187",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1187"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1188": {
    "canonicalId": "hwg_bg2_1188",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1188"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1189": {
    "canonicalId": "hwg_bg2_1189",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1189"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1190": {
    "canonicalId": "hwg_bg2_1190",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1190"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1191": {
    "canonicalId": "hwg_bg2_1191",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1191"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1192": {
    "canonicalId": "hwg_bg2_1192",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1192"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1193": {
    "canonicalId": "hwg_bg2_1193",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1193"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1194": {
    "canonicalId": "hwg_bg2_1194",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1194"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1195": {
    "canonicalId": "hwg_bg2_1195",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1195"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1196": {
    "canonicalId": "hwg_bg2_1196",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1196"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1197": {
    "canonicalId": "hwg_bg2_1197",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1197"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1198": {
    "canonicalId": "hwg_bg2_1198",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1198"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1199": {
    "canonicalId": "hwg_bg2_1199",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1199"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1200": {
    "canonicalId": "hwg_bg2_1200",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1200"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1201": {
    "canonicalId": "hwg_bg2_1201",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1201"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1202": {
    "canonicalId": "hwg_bg2_1202",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1202"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1203": {
    "canonicalId": "hwg_bg2_1203",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1203"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1204": {
    "canonicalId": "hwg_bg2_1204",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1204"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1205": {
    "canonicalId": "hwg_bg2_1205",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1205"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1206": {
    "canonicalId": "hwg_bg2_1206",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1206"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1207": {
    "canonicalId": "hwg_bg2_1207",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1207"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1208": {
    "canonicalId": "hwg_bg2_1208",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1208"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1209": {
    "canonicalId": "hwg_bg2_1209",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1209"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1210": {
    "canonicalId": "hwg_bg2_1210",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1210"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1211": {
    "canonicalId": "hwg_bg2_1211",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1211"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1212": {
    "canonicalId": "hwg_bg2_1212",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1212"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1213": {
    "canonicalId": "hwg_bg2_1213",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1213"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1214": {
    "canonicalId": "hwg_bg2_1214",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1214"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1215": {
    "canonicalId": "hwg_bg2_1215",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1215"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1216": {
    "canonicalId": "hwg_bg2_1216",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1216"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1217": {
    "canonicalId": "hwg_bg2_1217",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1217"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1218": {
    "canonicalId": "hwg_bg2_1218",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1218"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1219": {
    "canonicalId": "hwg_bg2_1219",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1219"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1220": {
    "canonicalId": "hwg_bg2_1220",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1220"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1221": {
    "canonicalId": "hwg_bg2_1221",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1221"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1222": {
    "canonicalId": "hwg_bg2_1222",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1222"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1223": {
    "canonicalId": "hwg_bg2_1223",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1223"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1224": {
    "canonicalId": "hwg_bg2_1224",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1224"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1225": {
    "canonicalId": "hwg_bg2_1225",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1225"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1226": {
    "canonicalId": "hwg_bg2_1226",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1226"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1227": {
    "canonicalId": "hwg_bg2_1227",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1227"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1228": {
    "canonicalId": "hwg_bg2_1228",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1228"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1229": {
    "canonicalId": "hwg_bg2_1229",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1229"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1230": {
    "canonicalId": "hwg_bg2_1230",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1230"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1231": {
    "canonicalId": "hwg_bg2_1231",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1231"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1232": {
    "canonicalId": "hwg_bg2_1232",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1232"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1233": {
    "canonicalId": "hwg_bg2_1233",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1233"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1234": {
    "canonicalId": "hwg_bg2_1234",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1234"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1235": {
    "canonicalId": "hwg_bg2_1235",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1235"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1236": {
    "canonicalId": "hwg_bg2_1236",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1236"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1237": {
    "canonicalId": "hwg_bg2_1237",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1237"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1238": {
    "canonicalId": "hwg_bg2_1238",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1238"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1239": {
    "canonicalId": "hwg_bg2_1239",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1239"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1240": {
    "canonicalId": "hwg_bg2_1240",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1240"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1241": {
    "canonicalId": "hwg_bg2_1241",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1241"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1242": {
    "canonicalId": "hwg_bg2_1242",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1242"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1243": {
    "canonicalId": "hwg_bg2_1243",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1243"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1244": {
    "canonicalId": "hwg_bg2_1244",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1244"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1245": {
    "canonicalId": "hwg_bg2_1245",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1245"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1246": {
    "canonicalId": "hwg_bg2_1246",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1246"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1247": {
    "canonicalId": "hwg_bg2_1247",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1247"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1248": {
    "canonicalId": "hwg_bg2_1248",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1248"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1249": {
    "canonicalId": "hwg_bg2_1249",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1249"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1250": {
    "canonicalId": "hwg_bg2_1250",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1250"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1251": {
    "canonicalId": "hwg_bg2_1251",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1251"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1252": {
    "canonicalId": "hwg_bg2_1252",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1252"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1253": {
    "canonicalId": "hwg_bg2_1253",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1253"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1254": {
    "canonicalId": "hwg_bg2_1254",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1254"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1255": {
    "canonicalId": "hwg_bg2_1255",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1255"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1256": {
    "canonicalId": "hwg_bg2_1256",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1256"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1257": {
    "canonicalId": "hwg_bg2_1257",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1257"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1258": {
    "canonicalId": "hwg_bg2_1258",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1258"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1259": {
    "canonicalId": "hwg_bg2_1259",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1259"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1260": {
    "canonicalId": "hwg_bg2_1260",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1260"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1261": {
    "canonicalId": "hwg_bg2_1261",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1261"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1262": {
    "canonicalId": "hwg_bg2_1262",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1262"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1263": {
    "canonicalId": "hwg_bg2_1263",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1263"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1264": {
    "canonicalId": "hwg_bg2_1264",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1264"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1265": {
    "canonicalId": "hwg_bg2_1265",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1265"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1266": {
    "canonicalId": "hwg_bg2_1266",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1266"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1267": {
    "canonicalId": "hwg_bg2_1267",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1267"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1268": {
    "canonicalId": "hwg_bg2_1268",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1268"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1269": {
    "canonicalId": "hwg_bg2_1269",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1269"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1270": {
    "canonicalId": "hwg_bg2_1270",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1270"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1271": {
    "canonicalId": "hwg_bg2_1271",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1271"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1272": {
    "canonicalId": "hwg_bg2_1272",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_1272"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1273": {
    "canonicalId": "hwg_bg2_1273",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1273"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1274": {
    "canonicalId": "hwg_bg2_1274",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1274"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1275": {
    "canonicalId": "hwg_bg2_1275",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1275"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1276": {
    "canonicalId": "hwg_bg2_1276",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1276"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1277": {
    "canonicalId": "hwg_bg2_1277",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1277"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1278": {
    "canonicalId": "hwg_bg2_1278",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1278"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1279": {
    "canonicalId": "hwg_bg2_1279",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_1279"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1280": {
    "canonicalId": "hwg_bg2_1280",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1280"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1281": {
    "canonicalId": "hwg_bg2_1281",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1281"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1282": {
    "canonicalId": "hwg_bg2_1282",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1282"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1283": {
    "canonicalId": "hwg_bg2_1283",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1283"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1284": {
    "canonicalId": "hwg_bg2_1284",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1284"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1285": {
    "canonicalId": "hwg_bg2_1285",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_1285"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1286": {
    "canonicalId": "hwg_bg2_1286",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1286"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1287": {
    "canonicalId": "hwg_bg2_1287",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1287"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1288": {
    "canonicalId": "hwg_bg2_1288",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1288"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_1289": {
    "canonicalId": "hwg_bg2_1289",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_1289"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_exp_5137": {
    "canonicalId": "hwg_b1_exp_5137",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5137",
      "hwg_b1_exp_5001",
      "hwg_b1_exp_5035",
      "hwg_b1_exp_5069",
      "hwg_b1_exp_5103",
      "hwg_b1_exp_5171",
      "hwg_b1_exp_5205",
      "hwg_b1_exp_5239"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5138": {
    "canonicalId": "hwg_b1_exp_5138",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5138",
      "hwg_b1_exp_5002",
      "hwg_b1_exp_5036",
      "hwg_b1_exp_5070",
      "hwg_b1_exp_5104",
      "hwg_b1_exp_5172",
      "hwg_b1_exp_5206",
      "hwg_b1_exp_5240"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5139": {
    "canonicalId": "hwg_b1_exp_5139",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5139",
      "hwg_b1_exp_5003",
      "hwg_b1_exp_5037",
      "hwg_b1_exp_5071",
      "hwg_b1_exp_5105",
      "hwg_b1_exp_5173",
      "hwg_b1_exp_5207",
      "hwg_b1_exp_5241"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5140": {
    "canonicalId": "hwg_b1_exp_5140",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5140",
      "hwg_b1_exp_5004",
      "hwg_b1_exp_5038",
      "hwg_b1_exp_5072",
      "hwg_b1_exp_5106",
      "hwg_b1_exp_5174",
      "hwg_b1_exp_5208",
      "hwg_b1_exp_5242"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5141": {
    "canonicalId": "hwg_b1_exp_5141",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5141",
      "hwg_b1_exp_5005",
      "hwg_b1_exp_5039",
      "hwg_b1_exp_5073",
      "hwg_b1_exp_5107",
      "hwg_b1_exp_5175",
      "hwg_b1_exp_5209",
      "hwg_b1_exp_5243"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5142": {
    "canonicalId": "hwg_b1_exp_5142",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5142",
      "hwg_b1_exp_5006",
      "hwg_b1_exp_5040",
      "hwg_b1_exp_5074",
      "hwg_b1_exp_5108",
      "hwg_b1_exp_5176",
      "hwg_b1_exp_5210",
      "hwg_b1_exp_5244"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5143": {
    "canonicalId": "hwg_b1_exp_5143",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5143",
      "hwg_b1_exp_5007",
      "hwg_b1_exp_5041",
      "hwg_b1_exp_5075",
      "hwg_b1_exp_5109",
      "hwg_b1_exp_5177",
      "hwg_b1_exp_5211",
      "hwg_b1_exp_5245"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5144": {
    "canonicalId": "hwg_b1_exp_5144",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5144",
      "hwg_b1_exp_5008",
      "hwg_b1_exp_5042",
      "hwg_b1_exp_5076",
      "hwg_b1_exp_5110",
      "hwg_b1_exp_5178",
      "hwg_b1_exp_5212",
      "hwg_b1_exp_5246"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5179": {
    "canonicalId": "hwg_b1_exp_5179",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5179",
      "hwg_b1_exp_5009",
      "hwg_b1_exp_5043",
      "hwg_b1_exp_5077",
      "hwg_b1_exp_5111",
      "hwg_b1_exp_5145",
      "hwg_b1_exp_5213",
      "hwg_b1_exp_5247"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5180": {
    "canonicalId": "hwg_b1_exp_5180",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5180",
      "hwg_b1_exp_5010",
      "hwg_b1_exp_5044",
      "hwg_b1_exp_5078",
      "hwg_b1_exp_5112",
      "hwg_b1_exp_5146",
      "hwg_b1_exp_5214",
      "hwg_b1_exp_5248"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5181": {
    "canonicalId": "hwg_b1_exp_5181",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5181",
      "hwg_b1_exp_5011",
      "hwg_b1_exp_5045",
      "hwg_b1_exp_5079",
      "hwg_b1_exp_5113",
      "hwg_b1_exp_5147",
      "hwg_b1_exp_5215",
      "hwg_b1_exp_5249"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5182": {
    "canonicalId": "hwg_b1_exp_5182",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5182",
      "hwg_b1_exp_5012",
      "hwg_b1_exp_5046",
      "hwg_b1_exp_5080",
      "hwg_b1_exp_5114",
      "hwg_b1_exp_5148",
      "hwg_b1_exp_5216",
      "hwg_b1_exp_5250"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5183": {
    "canonicalId": "hwg_b1_exp_5183",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5183",
      "hwg_b1_exp_5013",
      "hwg_b1_exp_5047",
      "hwg_b1_exp_5081",
      "hwg_b1_exp_5115",
      "hwg_b1_exp_5149",
      "hwg_b1_exp_5217",
      "hwg_b1_exp_5251"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5184": {
    "canonicalId": "hwg_b1_exp_5184",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5184",
      "hwg_b1_exp_5014",
      "hwg_b1_exp_5048",
      "hwg_b1_exp_5082",
      "hwg_b1_exp_5116",
      "hwg_b1_exp_5150",
      "hwg_b1_exp_5218",
      "hwg_b1_exp_5252"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5185": {
    "canonicalId": "hwg_b1_exp_5185",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5185",
      "hwg_b1_exp_5015",
      "hwg_b1_exp_5049",
      "hwg_b1_exp_5083",
      "hwg_b1_exp_5117",
      "hwg_b1_exp_5151",
      "hwg_b1_exp_5219",
      "hwg_b1_exp_5253"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5186": {
    "canonicalId": "hwg_b1_exp_5186",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5186",
      "hwg_b1_exp_5016",
      "hwg_b1_exp_5050",
      "hwg_b1_exp_5084",
      "hwg_b1_exp_5118",
      "hwg_b1_exp_5152",
      "hwg_b1_exp_5220",
      "hwg_b1_exp_5254"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5017": {
    "canonicalId": "hwg_b1_exp_5017",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_exp_5017",
      "hwg_b1_exp_5051",
      "hwg_b1_exp_5085",
      "hwg_b1_exp_5119",
      "hwg_b1_exp_5153",
      "hwg_b1_exp_5187",
      "hwg_b1_exp_5221",
      "hwg_b1_exp_5255"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5018": {
    "canonicalId": "hwg_b1_exp_5018",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_exp_5018",
      "hwg_b1_exp_5052",
      "hwg_b1_exp_5086",
      "hwg_b1_exp_5120",
      "hwg_b1_exp_5154",
      "hwg_b1_exp_5188",
      "hwg_b1_exp_5222",
      "hwg_b1_exp_5256"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5019": {
    "canonicalId": "hwg_b1_exp_5019",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_exp_5019",
      "hwg_b1_exp_5053",
      "hwg_b1_exp_5087",
      "hwg_b1_exp_5121",
      "hwg_b1_exp_5155",
      "hwg_b1_exp_5189",
      "hwg_b1_exp_5223",
      "hwg_b1_exp_5257"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5020": {
    "canonicalId": "hwg_b1_exp_5020",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_exp_5020",
      "hwg_b1_exp_5054",
      "hwg_b1_exp_5088",
      "hwg_b1_exp_5122",
      "hwg_b1_exp_5156",
      "hwg_b1_exp_5190",
      "hwg_b1_exp_5224",
      "hwg_b1_exp_5258"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5021": {
    "canonicalId": "hwg_b1_exp_5021",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_exp_5021",
      "hwg_b1_exp_5055",
      "hwg_b1_exp_5089",
      "hwg_b1_exp_5123",
      "hwg_b1_exp_5157",
      "hwg_b1_exp_5191",
      "hwg_b1_exp_5225",
      "hwg_b1_exp_5259"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5090": {
    "canonicalId": "hwg_b1_exp_5090",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_exp_5090",
      "hwg_b1_exp_5022",
      "hwg_b1_exp_5056",
      "hwg_b1_exp_5124",
      "hwg_b1_exp_5158",
      "hwg_b1_exp_5192",
      "hwg_b1_exp_5226",
      "hwg_b1_exp_5260"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5091": {
    "canonicalId": "hwg_b1_exp_5091",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_exp_5091",
      "hwg_b1_exp_5023",
      "hwg_b1_exp_5057",
      "hwg_b1_exp_5125",
      "hwg_b1_exp_5159",
      "hwg_b1_exp_5193",
      "hwg_b1_exp_5227",
      "hwg_b1_exp_5261"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5092": {
    "canonicalId": "hwg_b1_exp_5092",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_exp_5092",
      "hwg_b1_exp_5024",
      "hwg_b1_exp_5058",
      "hwg_b1_exp_5126",
      "hwg_b1_exp_5160",
      "hwg_b1_exp_5194",
      "hwg_b1_exp_5228",
      "hwg_b1_exp_5262"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5093": {
    "canonicalId": "hwg_b1_exp_5093",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_exp_5093",
      "hwg_b1_exp_5025",
      "hwg_b1_exp_5059",
      "hwg_b1_exp_5127",
      "hwg_b1_exp_5161",
      "hwg_b1_exp_5195",
      "hwg_b1_exp_5229",
      "hwg_b1_exp_5263"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5094": {
    "canonicalId": "hwg_b1_exp_5094",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_exp_5094",
      "hwg_b1_exp_5026",
      "hwg_b1_exp_5060",
      "hwg_b1_exp_5128",
      "hwg_b1_exp_5162",
      "hwg_b1_exp_5196",
      "hwg_b1_exp_5230",
      "hwg_b1_exp_5264"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5163": {
    "canonicalId": "hwg_b1_exp_5163",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5163",
      "hwg_b1_exp_5027",
      "hwg_b1_exp_5061",
      "hwg_b1_exp_5095",
      "hwg_b1_exp_5129",
      "hwg_b1_exp_5197",
      "hwg_b1_exp_5231",
      "hwg_b1_exp_5265"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5164": {
    "canonicalId": "hwg_b1_exp_5164",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5164",
      "hwg_b1_exp_5028",
      "hwg_b1_exp_5062",
      "hwg_b1_exp_5096",
      "hwg_b1_exp_5130",
      "hwg_b1_exp_5198",
      "hwg_b1_exp_5232",
      "hwg_b1_exp_5266"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5165": {
    "canonicalId": "hwg_b1_exp_5165",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5165",
      "hwg_b1_exp_5029",
      "hwg_b1_exp_5063",
      "hwg_b1_exp_5097",
      "hwg_b1_exp_5131",
      "hwg_b1_exp_5199",
      "hwg_b1_exp_5233",
      "hwg_b1_exp_5267"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5166": {
    "canonicalId": "hwg_b1_exp_5166",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5166",
      "hwg_b1_exp_5030",
      "hwg_b1_exp_5064",
      "hwg_b1_exp_5098",
      "hwg_b1_exp_5132",
      "hwg_b1_exp_5200",
      "hwg_b1_exp_5234",
      "hwg_b1_exp_5268"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5167": {
    "canonicalId": "hwg_b1_exp_5167",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5167",
      "hwg_b1_exp_5031",
      "hwg_b1_exp_5065",
      "hwg_b1_exp_5099",
      "hwg_b1_exp_5133",
      "hwg_b1_exp_5201",
      "hwg_b1_exp_5235",
      "hwg_b1_exp_5269"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5168": {
    "canonicalId": "hwg_b1_exp_5168",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5168",
      "hwg_b1_exp_5032",
      "hwg_b1_exp_5066",
      "hwg_b1_exp_5100",
      "hwg_b1_exp_5134",
      "hwg_b1_exp_5202",
      "hwg_b1_exp_5236",
      "hwg_b1_exp_5270"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5169": {
    "canonicalId": "hwg_b1_exp_5169",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5169",
      "hwg_b1_exp_5033",
      "hwg_b1_exp_5067",
      "hwg_b1_exp_5101",
      "hwg_b1_exp_5135",
      "hwg_b1_exp_5203",
      "hwg_b1_exp_5237",
      "hwg_b1_exp_5271"
    ],
    "duplicateCount": 7
  },
  "hwg_b1_exp_5170": {
    "canonicalId": "hwg_b1_exp_5170",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_exp_5170",
      "hwg_b1_exp_5034",
      "hwg_b1_exp_5068",
      "hwg_b1_exp_5102",
      "hwg_b1_exp_5136",
      "hwg_b1_exp_5204",
      "hwg_b1_exp_5238",
      "hwg_b1_exp_5272"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5305": {
    "canonicalId": "hwg_b2_exp_5305",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5305",
      "hwg_b2_exp_5273",
      "hwg_b2_exp_5337",
      "hwg_b2_exp_5369",
      "hwg_b2_exp_5401",
      "hwg_b2_exp_5433",
      "hwg_b2_exp_5465",
      "hwg_b2_exp_5497"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5306": {
    "canonicalId": "hwg_b2_exp_5306",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5306",
      "hwg_b2_exp_5274",
      "hwg_b2_exp_5338",
      "hwg_b2_exp_5370",
      "hwg_b2_exp_5402",
      "hwg_b2_exp_5434",
      "hwg_b2_exp_5466",
      "hwg_b2_exp_5498"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5307": {
    "canonicalId": "hwg_b2_exp_5307",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5307",
      "hwg_b2_exp_5275",
      "hwg_b2_exp_5339",
      "hwg_b2_exp_5371",
      "hwg_b2_exp_5403",
      "hwg_b2_exp_5435",
      "hwg_b2_exp_5467",
      "hwg_b2_exp_5499"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5308": {
    "canonicalId": "hwg_b2_exp_5308",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5308",
      "hwg_b2_exp_5276",
      "hwg_b2_exp_5340",
      "hwg_b2_exp_5372",
      "hwg_b2_exp_5404",
      "hwg_b2_exp_5436",
      "hwg_b2_exp_5468",
      "hwg_b2_exp_5500"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5309": {
    "canonicalId": "hwg_b2_exp_5309",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5309",
      "hwg_b2_exp_5277",
      "hwg_b2_exp_5341",
      "hwg_b2_exp_5373",
      "hwg_b2_exp_5405",
      "hwg_b2_exp_5437",
      "hwg_b2_exp_5469",
      "hwg_b2_exp_5501"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5310": {
    "canonicalId": "hwg_b2_exp_5310",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5310",
      "hwg_b2_exp_5278",
      "hwg_b2_exp_5342",
      "hwg_b2_exp_5374",
      "hwg_b2_exp_5406",
      "hwg_b2_exp_5438",
      "hwg_b2_exp_5470",
      "hwg_b2_exp_5502"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5311": {
    "canonicalId": "hwg_b2_exp_5311",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5311",
      "hwg_b2_exp_5279",
      "hwg_b2_exp_5343",
      "hwg_b2_exp_5375",
      "hwg_b2_exp_5407",
      "hwg_b2_exp_5439",
      "hwg_b2_exp_5471",
      "hwg_b2_exp_5503"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5344": {
    "canonicalId": "hwg_b2_exp_5344",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5344",
      "hwg_b2_exp_5280",
      "hwg_b2_exp_5312",
      "hwg_b2_exp_5376",
      "hwg_b2_exp_5408",
      "hwg_b2_exp_5440",
      "hwg_b2_exp_5472",
      "hwg_b2_exp_5504"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5345": {
    "canonicalId": "hwg_b2_exp_5345",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5345",
      "hwg_b2_exp_5281",
      "hwg_b2_exp_5313",
      "hwg_b2_exp_5377",
      "hwg_b2_exp_5409",
      "hwg_b2_exp_5441",
      "hwg_b2_exp_5473",
      "hwg_b2_exp_5505"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5346": {
    "canonicalId": "hwg_b2_exp_5346",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5346",
      "hwg_b2_exp_5282",
      "hwg_b2_exp_5314",
      "hwg_b2_exp_5378",
      "hwg_b2_exp_5410",
      "hwg_b2_exp_5442",
      "hwg_b2_exp_5474",
      "hwg_b2_exp_5506"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5347": {
    "canonicalId": "hwg_b2_exp_5347",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5347",
      "hwg_b2_exp_5283",
      "hwg_b2_exp_5315",
      "hwg_b2_exp_5379",
      "hwg_b2_exp_5411",
      "hwg_b2_exp_5443",
      "hwg_b2_exp_5475",
      "hwg_b2_exp_5507"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5348": {
    "canonicalId": "hwg_b2_exp_5348",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5348",
      "hwg_b2_exp_5284",
      "hwg_b2_exp_5316",
      "hwg_b2_exp_5380",
      "hwg_b2_exp_5412",
      "hwg_b2_exp_5444",
      "hwg_b2_exp_5476",
      "hwg_b2_exp_5508"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5413": {
    "canonicalId": "hwg_b2_exp_5413",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5413",
      "hwg_b2_exp_5285",
      "hwg_b2_exp_5317",
      "hwg_b2_exp_5349",
      "hwg_b2_exp_5381",
      "hwg_b2_exp_5445",
      "hwg_b2_exp_5477",
      "hwg_b2_exp_5509"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5414": {
    "canonicalId": "hwg_b2_exp_5414",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5414",
      "hwg_b2_exp_5286",
      "hwg_b2_exp_5318",
      "hwg_b2_exp_5350",
      "hwg_b2_exp_5382",
      "hwg_b2_exp_5446",
      "hwg_b2_exp_5478",
      "hwg_b2_exp_5510"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5415": {
    "canonicalId": "hwg_b2_exp_5415",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5415",
      "hwg_b2_exp_5287",
      "hwg_b2_exp_5319",
      "hwg_b2_exp_5351",
      "hwg_b2_exp_5383",
      "hwg_b2_exp_5447",
      "hwg_b2_exp_5479",
      "hwg_b2_exp_5511"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5416": {
    "canonicalId": "hwg_b2_exp_5416",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5416",
      "hwg_b2_exp_5288",
      "hwg_b2_exp_5320",
      "hwg_b2_exp_5352",
      "hwg_b2_exp_5384",
      "hwg_b2_exp_5448",
      "hwg_b2_exp_5480",
      "hwg_b2_exp_5512"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5417": {
    "canonicalId": "hwg_b2_exp_5417",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5417",
      "hwg_b2_exp_5289",
      "hwg_b2_exp_5321",
      "hwg_b2_exp_5353",
      "hwg_b2_exp_5385",
      "hwg_b2_exp_5449",
      "hwg_b2_exp_5481",
      "hwg_b2_exp_5513"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5418": {
    "canonicalId": "hwg_b2_exp_5418",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5418",
      "hwg_b2_exp_5290",
      "hwg_b2_exp_5322",
      "hwg_b2_exp_5354",
      "hwg_b2_exp_5386",
      "hwg_b2_exp_5450",
      "hwg_b2_exp_5482",
      "hwg_b2_exp_5514"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5451": {
    "canonicalId": "hwg_b2_exp_5451",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5451",
      "hwg_b2_exp_5291",
      "hwg_b2_exp_5323",
      "hwg_b2_exp_5355",
      "hwg_b2_exp_5387",
      "hwg_b2_exp_5419",
      "hwg_b2_exp_5483",
      "hwg_b2_exp_5515"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5452": {
    "canonicalId": "hwg_b2_exp_5452",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5452",
      "hwg_b2_exp_5292",
      "hwg_b2_exp_5324",
      "hwg_b2_exp_5356",
      "hwg_b2_exp_5388",
      "hwg_b2_exp_5420",
      "hwg_b2_exp_5484",
      "hwg_b2_exp_5516"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5453": {
    "canonicalId": "hwg_b2_exp_5453",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5453",
      "hwg_b2_exp_5293",
      "hwg_b2_exp_5325",
      "hwg_b2_exp_5357",
      "hwg_b2_exp_5389",
      "hwg_b2_exp_5421",
      "hwg_b2_exp_5485",
      "hwg_b2_exp_5517"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5454": {
    "canonicalId": "hwg_b2_exp_5454",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5454",
      "hwg_b2_exp_5294",
      "hwg_b2_exp_5326",
      "hwg_b2_exp_5358",
      "hwg_b2_exp_5390",
      "hwg_b2_exp_5422",
      "hwg_b2_exp_5486",
      "hwg_b2_exp_5518"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5455": {
    "canonicalId": "hwg_b2_exp_5455",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5455",
      "hwg_b2_exp_5295",
      "hwg_b2_exp_5327",
      "hwg_b2_exp_5359",
      "hwg_b2_exp_5391",
      "hwg_b2_exp_5423",
      "hwg_b2_exp_5487",
      "hwg_b2_exp_5519"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5456": {
    "canonicalId": "hwg_b2_exp_5456",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_exp_5456",
      "hwg_b2_exp_5296",
      "hwg_b2_exp_5328",
      "hwg_b2_exp_5360",
      "hwg_b2_exp_5392",
      "hwg_b2_exp_5424",
      "hwg_b2_exp_5488",
      "hwg_b2_exp_5520"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5329": {
    "canonicalId": "hwg_b2_exp_5329",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5329",
      "hwg_b2_exp_5297",
      "hwg_b2_exp_5361",
      "hwg_b2_exp_5393",
      "hwg_b2_exp_5425",
      "hwg_b2_exp_5457",
      "hwg_b2_exp_5489",
      "hwg_b2_exp_5521"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5330": {
    "canonicalId": "hwg_b2_exp_5330",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5330",
      "hwg_b2_exp_5298",
      "hwg_b2_exp_5362",
      "hwg_b2_exp_5394",
      "hwg_b2_exp_5426",
      "hwg_b2_exp_5458",
      "hwg_b2_exp_5490",
      "hwg_b2_exp_5522"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5331": {
    "canonicalId": "hwg_b2_exp_5331",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5331",
      "hwg_b2_exp_5299",
      "hwg_b2_exp_5363",
      "hwg_b2_exp_5395",
      "hwg_b2_exp_5427",
      "hwg_b2_exp_5459",
      "hwg_b2_exp_5491",
      "hwg_b2_exp_5523"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5332": {
    "canonicalId": "hwg_b2_exp_5332",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5332",
      "hwg_b2_exp_5300",
      "hwg_b2_exp_5364",
      "hwg_b2_exp_5396",
      "hwg_b2_exp_5428",
      "hwg_b2_exp_5460",
      "hwg_b2_exp_5492",
      "hwg_b2_exp_5524"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5333": {
    "canonicalId": "hwg_b2_exp_5333",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5333",
      "hwg_b2_exp_5301",
      "hwg_b2_exp_5365",
      "hwg_b2_exp_5397",
      "hwg_b2_exp_5429",
      "hwg_b2_exp_5461",
      "hwg_b2_exp_5493",
      "hwg_b2_exp_5525"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5334": {
    "canonicalId": "hwg_b2_exp_5334",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5334",
      "hwg_b2_exp_5302",
      "hwg_b2_exp_5366",
      "hwg_b2_exp_5398",
      "hwg_b2_exp_5430",
      "hwg_b2_exp_5462",
      "hwg_b2_exp_5494",
      "hwg_b2_exp_5526"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5335": {
    "canonicalId": "hwg_b2_exp_5335",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5335",
      "hwg_b2_exp_5303",
      "hwg_b2_exp_5367",
      "hwg_b2_exp_5399",
      "hwg_b2_exp_5431",
      "hwg_b2_exp_5463",
      "hwg_b2_exp_5495",
      "hwg_b2_exp_5527"
    ],
    "duplicateCount": 7
  },
  "hwg_b2_exp_5368": {
    "canonicalId": "hwg_b2_exp_5368",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_exp_5368",
      "hwg_b2_exp_5304",
      "hwg_b2_exp_5336",
      "hwg_b2_exp_5400",
      "hwg_b2_exp_5432",
      "hwg_b2_exp_5464",
      "hwg_b2_exp_5496",
      "hwg_b2_exp_5528"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5585": {
    "canonicalId": "hwg_b3_exp_5585",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5585",
      "hwg_b3_exp_5529",
      "hwg_b3_exp_5557",
      "hwg_b3_exp_5613",
      "hwg_b3_exp_5641",
      "hwg_b3_exp_5669",
      "hwg_b3_exp_5697",
      "hwg_b3_exp_5725"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5586": {
    "canonicalId": "hwg_b3_exp_5586",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5586",
      "hwg_b3_exp_5530",
      "hwg_b3_exp_5558",
      "hwg_b3_exp_5614",
      "hwg_b3_exp_5642",
      "hwg_b3_exp_5670",
      "hwg_b3_exp_5698",
      "hwg_b3_exp_5726"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5587": {
    "canonicalId": "hwg_b3_exp_5587",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5587",
      "hwg_b3_exp_5531",
      "hwg_b3_exp_5559",
      "hwg_b3_exp_5615",
      "hwg_b3_exp_5643",
      "hwg_b3_exp_5671",
      "hwg_b3_exp_5699",
      "hwg_b3_exp_5727"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5588": {
    "canonicalId": "hwg_b3_exp_5588",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5588",
      "hwg_b3_exp_5532",
      "hwg_b3_exp_5560",
      "hwg_b3_exp_5616",
      "hwg_b3_exp_5644",
      "hwg_b3_exp_5672",
      "hwg_b3_exp_5700",
      "hwg_b3_exp_5728"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5589": {
    "canonicalId": "hwg_b3_exp_5589",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5589",
      "hwg_b3_exp_5533",
      "hwg_b3_exp_5561",
      "hwg_b3_exp_5617",
      "hwg_b3_exp_5645",
      "hwg_b3_exp_5673",
      "hwg_b3_exp_5701",
      "hwg_b3_exp_5729"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5646": {
    "canonicalId": "hwg_b3_exp_5646",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5646",
      "hwg_b3_exp_5534",
      "hwg_b3_exp_5562",
      "hwg_b3_exp_5590",
      "hwg_b3_exp_5618",
      "hwg_b3_exp_5674",
      "hwg_b3_exp_5702",
      "hwg_b3_exp_5730"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5647": {
    "canonicalId": "hwg_b3_exp_5647",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5647",
      "hwg_b3_exp_5535",
      "hwg_b3_exp_5563",
      "hwg_b3_exp_5591",
      "hwg_b3_exp_5619",
      "hwg_b3_exp_5675",
      "hwg_b3_exp_5703",
      "hwg_b3_exp_5731"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5648": {
    "canonicalId": "hwg_b3_exp_5648",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5648",
      "hwg_b3_exp_5536",
      "hwg_b3_exp_5564",
      "hwg_b3_exp_5592",
      "hwg_b3_exp_5620",
      "hwg_b3_exp_5676",
      "hwg_b3_exp_5704",
      "hwg_b3_exp_5732"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5649": {
    "canonicalId": "hwg_b3_exp_5649",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5649",
      "hwg_b3_exp_5537",
      "hwg_b3_exp_5565",
      "hwg_b3_exp_5593",
      "hwg_b3_exp_5621",
      "hwg_b3_exp_5677",
      "hwg_b3_exp_5705",
      "hwg_b3_exp_5733"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5650": {
    "canonicalId": "hwg_b3_exp_5650",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5650",
      "hwg_b3_exp_5538",
      "hwg_b3_exp_5566",
      "hwg_b3_exp_5594",
      "hwg_b3_exp_5622",
      "hwg_b3_exp_5678",
      "hwg_b3_exp_5706",
      "hwg_b3_exp_5734"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5651": {
    "canonicalId": "hwg_b3_exp_5651",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5651",
      "hwg_b3_exp_5539",
      "hwg_b3_exp_5567",
      "hwg_b3_exp_5595",
      "hwg_b3_exp_5623",
      "hwg_b3_exp_5679",
      "hwg_b3_exp_5707",
      "hwg_b3_exp_5735"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5652": {
    "canonicalId": "hwg_b3_exp_5652",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5652",
      "hwg_b3_exp_5540",
      "hwg_b3_exp_5568",
      "hwg_b3_exp_5596",
      "hwg_b3_exp_5624",
      "hwg_b3_exp_5680",
      "hwg_b3_exp_5708",
      "hwg_b3_exp_5736"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5681": {
    "canonicalId": "hwg_b3_exp_5681",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5681",
      "hwg_b3_exp_5541",
      "hwg_b3_exp_5569",
      "hwg_b3_exp_5597",
      "hwg_b3_exp_5625",
      "hwg_b3_exp_5653",
      "hwg_b3_exp_5709",
      "hwg_b3_exp_5737"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5682": {
    "canonicalId": "hwg_b3_exp_5682",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5682",
      "hwg_b3_exp_5542",
      "hwg_b3_exp_5570",
      "hwg_b3_exp_5598",
      "hwg_b3_exp_5626",
      "hwg_b3_exp_5654",
      "hwg_b3_exp_5710",
      "hwg_b3_exp_5738"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5683": {
    "canonicalId": "hwg_b3_exp_5683",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5683",
      "hwg_b3_exp_5543",
      "hwg_b3_exp_5571",
      "hwg_b3_exp_5599",
      "hwg_b3_exp_5627",
      "hwg_b3_exp_5655",
      "hwg_b3_exp_5711",
      "hwg_b3_exp_5739"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5684": {
    "canonicalId": "hwg_b3_exp_5684",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5684",
      "hwg_b3_exp_5544",
      "hwg_b3_exp_5572",
      "hwg_b3_exp_5600",
      "hwg_b3_exp_5628",
      "hwg_b3_exp_5656",
      "hwg_b3_exp_5712",
      "hwg_b3_exp_5740"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5685": {
    "canonicalId": "hwg_b3_exp_5685",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5685",
      "hwg_b3_exp_5545",
      "hwg_b3_exp_5573",
      "hwg_b3_exp_5601",
      "hwg_b3_exp_5629",
      "hwg_b3_exp_5657",
      "hwg_b3_exp_5713",
      "hwg_b3_exp_5741"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5686": {
    "canonicalId": "hwg_b3_exp_5686",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5686",
      "hwg_b3_exp_5546",
      "hwg_b3_exp_5574",
      "hwg_b3_exp_5602",
      "hwg_b3_exp_5630",
      "hwg_b3_exp_5658",
      "hwg_b3_exp_5714",
      "hwg_b3_exp_5742"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5687": {
    "canonicalId": "hwg_b3_exp_5687",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5687",
      "hwg_b3_exp_5547",
      "hwg_b3_exp_5575",
      "hwg_b3_exp_5603",
      "hwg_b3_exp_5631",
      "hwg_b3_exp_5659",
      "hwg_b3_exp_5715",
      "hwg_b3_exp_5743"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5688": {
    "canonicalId": "hwg_b3_exp_5688",
    "book": 3,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5688",
      "hwg_b3_exp_5548",
      "hwg_b3_exp_5576",
      "hwg_b3_exp_5604",
      "hwg_b3_exp_5632",
      "hwg_b3_exp_5660",
      "hwg_b3_exp_5716",
      "hwg_b3_exp_5744"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5605": {
    "canonicalId": "hwg_b3_exp_5605",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5605",
      "hwg_b3_exp_5549",
      "hwg_b3_exp_5577",
      "hwg_b3_exp_5633",
      "hwg_b3_exp_5661",
      "hwg_b3_exp_5689",
      "hwg_b3_exp_5717",
      "hwg_b3_exp_5745"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5606": {
    "canonicalId": "hwg_b3_exp_5606",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5606",
      "hwg_b3_exp_5550",
      "hwg_b3_exp_5578",
      "hwg_b3_exp_5634",
      "hwg_b3_exp_5662",
      "hwg_b3_exp_5690",
      "hwg_b3_exp_5718",
      "hwg_b3_exp_5746"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5607": {
    "canonicalId": "hwg_b3_exp_5607",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5607",
      "hwg_b3_exp_5551",
      "hwg_b3_exp_5579",
      "hwg_b3_exp_5635",
      "hwg_b3_exp_5663",
      "hwg_b3_exp_5691",
      "hwg_b3_exp_5719",
      "hwg_b3_exp_5747"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5608": {
    "canonicalId": "hwg_b3_exp_5608",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5608",
      "hwg_b3_exp_5552",
      "hwg_b3_exp_5580",
      "hwg_b3_exp_5636",
      "hwg_b3_exp_5664",
      "hwg_b3_exp_5692",
      "hwg_b3_exp_5720",
      "hwg_b3_exp_5748"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5609": {
    "canonicalId": "hwg_b3_exp_5609",
    "book": 3,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b3_exp_5609",
      "hwg_b3_exp_5553",
      "hwg_b3_exp_5581",
      "hwg_b3_exp_5637",
      "hwg_b3_exp_5665",
      "hwg_b3_exp_5693",
      "hwg_b3_exp_5721",
      "hwg_b3_exp_5749"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5666": {
    "canonicalId": "hwg_b3_exp_5666",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5666",
      "hwg_b3_exp_5554",
      "hwg_b3_exp_5582",
      "hwg_b3_exp_5610",
      "hwg_b3_exp_5638",
      "hwg_b3_exp_5694",
      "hwg_b3_exp_5722",
      "hwg_b3_exp_5750"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5667": {
    "canonicalId": "hwg_b3_exp_5667",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5667",
      "hwg_b3_exp_5555",
      "hwg_b3_exp_5583",
      "hwg_b3_exp_5611",
      "hwg_b3_exp_5639",
      "hwg_b3_exp_5695",
      "hwg_b3_exp_5723",
      "hwg_b3_exp_5751"
    ],
    "duplicateCount": 7
  },
  "hwg_b3_exp_5668": {
    "canonicalId": "hwg_b3_exp_5668",
    "book": 3,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b3_exp_5668",
      "hwg_b3_exp_5556",
      "hwg_b3_exp_5584",
      "hwg_b3_exp_5612",
      "hwg_b3_exp_5640",
      "hwg_b3_exp_5696",
      "hwg_b3_exp_5724",
      "hwg_b3_exp_5752"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5779": {
    "canonicalId": "hwg_b4_exp_5779",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5779",
      "hwg_b4_exp_5753",
      "hwg_b4_exp_5805",
      "hwg_b4_exp_5831",
      "hwg_b4_exp_5857",
      "hwg_b4_exp_5883",
      "hwg_b4_exp_5909",
      "hwg_b4_exp_5935"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5780": {
    "canonicalId": "hwg_b4_exp_5780",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5780",
      "hwg_b4_exp_5754",
      "hwg_b4_exp_5806",
      "hwg_b4_exp_5832",
      "hwg_b4_exp_5858",
      "hwg_b4_exp_5884",
      "hwg_b4_exp_5910",
      "hwg_b4_exp_5936"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5781": {
    "canonicalId": "hwg_b4_exp_5781",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5781",
      "hwg_b4_exp_5755",
      "hwg_b4_exp_5807",
      "hwg_b4_exp_5833",
      "hwg_b4_exp_5859",
      "hwg_b4_exp_5885",
      "hwg_b4_exp_5911",
      "hwg_b4_exp_5937"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5782": {
    "canonicalId": "hwg_b4_exp_5782",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5782",
      "hwg_b4_exp_5756",
      "hwg_b4_exp_5808",
      "hwg_b4_exp_5834",
      "hwg_b4_exp_5860",
      "hwg_b4_exp_5886",
      "hwg_b4_exp_5912",
      "hwg_b4_exp_5938"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5783": {
    "canonicalId": "hwg_b4_exp_5783",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5783",
      "hwg_b4_exp_5757",
      "hwg_b4_exp_5809",
      "hwg_b4_exp_5835",
      "hwg_b4_exp_5861",
      "hwg_b4_exp_5887",
      "hwg_b4_exp_5913",
      "hwg_b4_exp_5939"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5784": {
    "canonicalId": "hwg_b4_exp_5784",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5784",
      "hwg_b4_exp_5758",
      "hwg_b4_exp_5810",
      "hwg_b4_exp_5836",
      "hwg_b4_exp_5862",
      "hwg_b4_exp_5888",
      "hwg_b4_exp_5914",
      "hwg_b4_exp_5940"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5785": {
    "canonicalId": "hwg_b4_exp_5785",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5785",
      "hwg_b4_exp_5759",
      "hwg_b4_exp_5811",
      "hwg_b4_exp_5837",
      "hwg_b4_exp_5863",
      "hwg_b4_exp_5889",
      "hwg_b4_exp_5915",
      "hwg_b4_exp_5941"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5812": {
    "canonicalId": "hwg_b4_exp_5812",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5812",
      "hwg_b4_exp_5760",
      "hwg_b4_exp_5786",
      "hwg_b4_exp_5838",
      "hwg_b4_exp_5864",
      "hwg_b4_exp_5890",
      "hwg_b4_exp_5916",
      "hwg_b4_exp_5942"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5813": {
    "canonicalId": "hwg_b4_exp_5813",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5813",
      "hwg_b4_exp_5761",
      "hwg_b4_exp_5787",
      "hwg_b4_exp_5839",
      "hwg_b4_exp_5865",
      "hwg_b4_exp_5891",
      "hwg_b4_exp_5917",
      "hwg_b4_exp_5943"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5814": {
    "canonicalId": "hwg_b4_exp_5814",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5814",
      "hwg_b4_exp_5762",
      "hwg_b4_exp_5788",
      "hwg_b4_exp_5840",
      "hwg_b4_exp_5866",
      "hwg_b4_exp_5892",
      "hwg_b4_exp_5918",
      "hwg_b4_exp_5944"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5815": {
    "canonicalId": "hwg_b4_exp_5815",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5815",
      "hwg_b4_exp_5763",
      "hwg_b4_exp_5789",
      "hwg_b4_exp_5841",
      "hwg_b4_exp_5867",
      "hwg_b4_exp_5893",
      "hwg_b4_exp_5919",
      "hwg_b4_exp_5945"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5894": {
    "canonicalId": "hwg_b4_exp_5894",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_exp_5894",
      "hwg_b4_exp_5764",
      "hwg_b4_exp_5790",
      "hwg_b4_exp_5816",
      "hwg_b4_exp_5842",
      "hwg_b4_exp_5868",
      "hwg_b4_exp_5920",
      "hwg_b4_exp_5946"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5895": {
    "canonicalId": "hwg_b4_exp_5895",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_exp_5895",
      "hwg_b4_exp_5765",
      "hwg_b4_exp_5791",
      "hwg_b4_exp_5817",
      "hwg_b4_exp_5843",
      "hwg_b4_exp_5869",
      "hwg_b4_exp_5921",
      "hwg_b4_exp_5947"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5896": {
    "canonicalId": "hwg_b4_exp_5896",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_exp_5896",
      "hwg_b4_exp_5766",
      "hwg_b4_exp_5792",
      "hwg_b4_exp_5818",
      "hwg_b4_exp_5844",
      "hwg_b4_exp_5870",
      "hwg_b4_exp_5922",
      "hwg_b4_exp_5948"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5897": {
    "canonicalId": "hwg_b4_exp_5897",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_exp_5897",
      "hwg_b4_exp_5767",
      "hwg_b4_exp_5793",
      "hwg_b4_exp_5819",
      "hwg_b4_exp_5845",
      "hwg_b4_exp_5871",
      "hwg_b4_exp_5923",
      "hwg_b4_exp_5949"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5898": {
    "canonicalId": "hwg_b4_exp_5898",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_exp_5898",
      "hwg_b4_exp_5768",
      "hwg_b4_exp_5794",
      "hwg_b4_exp_5820",
      "hwg_b4_exp_5846",
      "hwg_b4_exp_5872",
      "hwg_b4_exp_5924",
      "hwg_b4_exp_5950"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5899": {
    "canonicalId": "hwg_b4_exp_5899",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_exp_5899",
      "hwg_b4_exp_5769",
      "hwg_b4_exp_5795",
      "hwg_b4_exp_5821",
      "hwg_b4_exp_5847",
      "hwg_b4_exp_5873",
      "hwg_b4_exp_5925",
      "hwg_b4_exp_5951"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5900": {
    "canonicalId": "hwg_b4_exp_5900",
    "book": 4,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b4_exp_5900",
      "hwg_b4_exp_5770",
      "hwg_b4_exp_5796",
      "hwg_b4_exp_5822",
      "hwg_b4_exp_5848",
      "hwg_b4_exp_5874",
      "hwg_b4_exp_5926",
      "hwg_b4_exp_5952"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5797": {
    "canonicalId": "hwg_b4_exp_5797",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5797",
      "hwg_b4_exp_5771",
      "hwg_b4_exp_5823",
      "hwg_b4_exp_5849",
      "hwg_b4_exp_5875",
      "hwg_b4_exp_5901",
      "hwg_b4_exp_5927",
      "hwg_b4_exp_5953"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5798": {
    "canonicalId": "hwg_b4_exp_5798",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5798",
      "hwg_b4_exp_5772",
      "hwg_b4_exp_5824",
      "hwg_b4_exp_5850",
      "hwg_b4_exp_5876",
      "hwg_b4_exp_5902",
      "hwg_b4_exp_5928",
      "hwg_b4_exp_5954"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5799": {
    "canonicalId": "hwg_b4_exp_5799",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5799",
      "hwg_b4_exp_5773",
      "hwg_b4_exp_5825",
      "hwg_b4_exp_5851",
      "hwg_b4_exp_5877",
      "hwg_b4_exp_5903",
      "hwg_b4_exp_5929",
      "hwg_b4_exp_5955"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5800": {
    "canonicalId": "hwg_b4_exp_5800",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5800",
      "hwg_b4_exp_5774",
      "hwg_b4_exp_5826",
      "hwg_b4_exp_5852",
      "hwg_b4_exp_5878",
      "hwg_b4_exp_5904",
      "hwg_b4_exp_5930",
      "hwg_b4_exp_5956"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5801": {
    "canonicalId": "hwg_b4_exp_5801",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5801",
      "hwg_b4_exp_5775",
      "hwg_b4_exp_5827",
      "hwg_b4_exp_5853",
      "hwg_b4_exp_5879",
      "hwg_b4_exp_5905",
      "hwg_b4_exp_5931",
      "hwg_b4_exp_5957"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5802": {
    "canonicalId": "hwg_b4_exp_5802",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5802",
      "hwg_b4_exp_5776",
      "hwg_b4_exp_5828",
      "hwg_b4_exp_5854",
      "hwg_b4_exp_5880",
      "hwg_b4_exp_5906",
      "hwg_b4_exp_5932",
      "hwg_b4_exp_5958"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5803": {
    "canonicalId": "hwg_b4_exp_5803",
    "book": 4,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5803",
      "hwg_b4_exp_5777",
      "hwg_b4_exp_5829",
      "hwg_b4_exp_5855",
      "hwg_b4_exp_5881",
      "hwg_b4_exp_5907",
      "hwg_b4_exp_5933",
      "hwg_b4_exp_5959"
    ],
    "duplicateCount": 7
  },
  "hwg_b4_exp_5830": {
    "canonicalId": "hwg_b4_exp_5830",
    "book": 4,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b4_exp_5830",
      "hwg_b4_exp_5778",
      "hwg_b4_exp_5804",
      "hwg_b4_exp_5856",
      "hwg_b4_exp_5882",
      "hwg_b4_exp_5908",
      "hwg_b4_exp_5934",
      "hwg_b4_exp_5960"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_5987": {
    "canonicalId": "hwg_b5_exp_5987",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_5987",
      "hwg_b5_exp_5961",
      "hwg_b5_exp_6013",
      "hwg_b5_exp_6039",
      "hwg_b5_exp_6065",
      "hwg_b5_exp_6091",
      "hwg_b5_exp_6117",
      "hwg_b5_exp_6143"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_5988": {
    "canonicalId": "hwg_b5_exp_5988",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_5988",
      "hwg_b5_exp_5962",
      "hwg_b5_exp_6014",
      "hwg_b5_exp_6040",
      "hwg_b5_exp_6066",
      "hwg_b5_exp_6092",
      "hwg_b5_exp_6118",
      "hwg_b5_exp_6144"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_5989": {
    "canonicalId": "hwg_b5_exp_5989",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_5989",
      "hwg_b5_exp_5963",
      "hwg_b5_exp_6015",
      "hwg_b5_exp_6041",
      "hwg_b5_exp_6067",
      "hwg_b5_exp_6093",
      "hwg_b5_exp_6119",
      "hwg_b5_exp_6145"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_5990": {
    "canonicalId": "hwg_b5_exp_5990",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_5990",
      "hwg_b5_exp_5964",
      "hwg_b5_exp_6016",
      "hwg_b5_exp_6042",
      "hwg_b5_exp_6068",
      "hwg_b5_exp_6094",
      "hwg_b5_exp_6120",
      "hwg_b5_exp_6146"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_5991": {
    "canonicalId": "hwg_b5_exp_5991",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_5991",
      "hwg_b5_exp_5965",
      "hwg_b5_exp_6017",
      "hwg_b5_exp_6043",
      "hwg_b5_exp_6069",
      "hwg_b5_exp_6095",
      "hwg_b5_exp_6121",
      "hwg_b5_exp_6147"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6070": {
    "canonicalId": "hwg_b5_exp_6070",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6070",
      "hwg_b5_exp_5966",
      "hwg_b5_exp_5992",
      "hwg_b5_exp_6018",
      "hwg_b5_exp_6044",
      "hwg_b5_exp_6096",
      "hwg_b5_exp_6122",
      "hwg_b5_exp_6148"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6071": {
    "canonicalId": "hwg_b5_exp_6071",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6071",
      "hwg_b5_exp_5967",
      "hwg_b5_exp_5993",
      "hwg_b5_exp_6019",
      "hwg_b5_exp_6045",
      "hwg_b5_exp_6097",
      "hwg_b5_exp_6123",
      "hwg_b5_exp_6149"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6072": {
    "canonicalId": "hwg_b5_exp_6072",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6072",
      "hwg_b5_exp_5968",
      "hwg_b5_exp_5994",
      "hwg_b5_exp_6020",
      "hwg_b5_exp_6046",
      "hwg_b5_exp_6098",
      "hwg_b5_exp_6124",
      "hwg_b5_exp_6150"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6073": {
    "canonicalId": "hwg_b5_exp_6073",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6073",
      "hwg_b5_exp_5969",
      "hwg_b5_exp_5995",
      "hwg_b5_exp_6021",
      "hwg_b5_exp_6047",
      "hwg_b5_exp_6099",
      "hwg_b5_exp_6125",
      "hwg_b5_exp_6151"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6074": {
    "canonicalId": "hwg_b5_exp_6074",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6074",
      "hwg_b5_exp_5970",
      "hwg_b5_exp_5996",
      "hwg_b5_exp_6022",
      "hwg_b5_exp_6048",
      "hwg_b5_exp_6100",
      "hwg_b5_exp_6126",
      "hwg_b5_exp_6152"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6075": {
    "canonicalId": "hwg_b5_exp_6075",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6075",
      "hwg_b5_exp_5971",
      "hwg_b5_exp_5997",
      "hwg_b5_exp_6023",
      "hwg_b5_exp_6049",
      "hwg_b5_exp_6101",
      "hwg_b5_exp_6127",
      "hwg_b5_exp_6153"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6102": {
    "canonicalId": "hwg_b5_exp_6102",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6102",
      "hwg_b5_exp_5972",
      "hwg_b5_exp_5998",
      "hwg_b5_exp_6024",
      "hwg_b5_exp_6050",
      "hwg_b5_exp_6076",
      "hwg_b5_exp_6128",
      "hwg_b5_exp_6154"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6103": {
    "canonicalId": "hwg_b5_exp_6103",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6103",
      "hwg_b5_exp_5973",
      "hwg_b5_exp_5999",
      "hwg_b5_exp_6025",
      "hwg_b5_exp_6051",
      "hwg_b5_exp_6077",
      "hwg_b5_exp_6129",
      "hwg_b5_exp_6155"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6104": {
    "canonicalId": "hwg_b5_exp_6104",
    "book": 5,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6104",
      "hwg_b5_exp_5974",
      "hwg_b5_exp_6000",
      "hwg_b5_exp_6026",
      "hwg_b5_exp_6052",
      "hwg_b5_exp_6078",
      "hwg_b5_exp_6130",
      "hwg_b5_exp_6156"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6027": {
    "canonicalId": "hwg_b5_exp_6027",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6027",
      "hwg_b5_exp_5975",
      "hwg_b5_exp_6001",
      "hwg_b5_exp_6053",
      "hwg_b5_exp_6079",
      "hwg_b5_exp_6105",
      "hwg_b5_exp_6131",
      "hwg_b5_exp_6157"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6028": {
    "canonicalId": "hwg_b5_exp_6028",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6028",
      "hwg_b5_exp_5976",
      "hwg_b5_exp_6002",
      "hwg_b5_exp_6054",
      "hwg_b5_exp_6080",
      "hwg_b5_exp_6106",
      "hwg_b5_exp_6132",
      "hwg_b5_exp_6158"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6029": {
    "canonicalId": "hwg_b5_exp_6029",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6029",
      "hwg_b5_exp_5977",
      "hwg_b5_exp_6003",
      "hwg_b5_exp_6055",
      "hwg_b5_exp_6081",
      "hwg_b5_exp_6107",
      "hwg_b5_exp_6133",
      "hwg_b5_exp_6159"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6030": {
    "canonicalId": "hwg_b5_exp_6030",
    "book": 5,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6030",
      "hwg_b5_exp_5978",
      "hwg_b5_exp_6004",
      "hwg_b5_exp_6056",
      "hwg_b5_exp_6082",
      "hwg_b5_exp_6108",
      "hwg_b5_exp_6134",
      "hwg_b5_exp_6160"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6005": {
    "canonicalId": "hwg_b5_exp_6005",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6005",
      "hwg_b5_exp_5979",
      "hwg_b5_exp_6031",
      "hwg_b5_exp_6057",
      "hwg_b5_exp_6083",
      "hwg_b5_exp_6109",
      "hwg_b5_exp_6135",
      "hwg_b5_exp_6161"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6006": {
    "canonicalId": "hwg_b5_exp_6006",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6006",
      "hwg_b5_exp_5980",
      "hwg_b5_exp_6032",
      "hwg_b5_exp_6058",
      "hwg_b5_exp_6084",
      "hwg_b5_exp_6110",
      "hwg_b5_exp_6136",
      "hwg_b5_exp_6162"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6007": {
    "canonicalId": "hwg_b5_exp_6007",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6007",
      "hwg_b5_exp_5981",
      "hwg_b5_exp_6033",
      "hwg_b5_exp_6059",
      "hwg_b5_exp_6085",
      "hwg_b5_exp_6111",
      "hwg_b5_exp_6137",
      "hwg_b5_exp_6163"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6008": {
    "canonicalId": "hwg_b5_exp_6008",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6008",
      "hwg_b5_exp_5982",
      "hwg_b5_exp_6034",
      "hwg_b5_exp_6060",
      "hwg_b5_exp_6086",
      "hwg_b5_exp_6112",
      "hwg_b5_exp_6138",
      "hwg_b5_exp_6164"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6009": {
    "canonicalId": "hwg_b5_exp_6009",
    "book": 5,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b5_exp_6009",
      "hwg_b5_exp_5983",
      "hwg_b5_exp_6035",
      "hwg_b5_exp_6061",
      "hwg_b5_exp_6087",
      "hwg_b5_exp_6113",
      "hwg_b5_exp_6139",
      "hwg_b5_exp_6165"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6088": {
    "canonicalId": "hwg_b5_exp_6088",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6088",
      "hwg_b5_exp_5984",
      "hwg_b5_exp_6010",
      "hwg_b5_exp_6036",
      "hwg_b5_exp_6062",
      "hwg_b5_exp_6114",
      "hwg_b5_exp_6140",
      "hwg_b5_exp_6166"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6089": {
    "canonicalId": "hwg_b5_exp_6089",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6089",
      "hwg_b5_exp_5985",
      "hwg_b5_exp_6011",
      "hwg_b5_exp_6037",
      "hwg_b5_exp_6063",
      "hwg_b5_exp_6115",
      "hwg_b5_exp_6141",
      "hwg_b5_exp_6167"
    ],
    "duplicateCount": 7
  },
  "hwg_b5_exp_6090": {
    "canonicalId": "hwg_b5_exp_6090",
    "book": 5,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b5_exp_6090",
      "hwg_b5_exp_5986",
      "hwg_b5_exp_6012",
      "hwg_b5_exp_6038",
      "hwg_b5_exp_6064",
      "hwg_b5_exp_6116",
      "hwg_b5_exp_6142",
      "hwg_b5_exp_6168"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6257": {
    "canonicalId": "hwg_b6_exp_6257",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6257",
      "hwg_b6_exp_6169",
      "hwg_b6_exp_6191",
      "hwg_b6_exp_6213",
      "hwg_b6_exp_6235",
      "hwg_b6_exp_6279",
      "hwg_b6_exp_6301",
      "hwg_b6_exp_6323"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6258": {
    "canonicalId": "hwg_b6_exp_6258",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6258",
      "hwg_b6_exp_6170",
      "hwg_b6_exp_6192",
      "hwg_b6_exp_6214",
      "hwg_b6_exp_6236",
      "hwg_b6_exp_6280",
      "hwg_b6_exp_6302",
      "hwg_b6_exp_6324"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6259": {
    "canonicalId": "hwg_b6_exp_6259",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6259",
      "hwg_b6_exp_6171",
      "hwg_b6_exp_6193",
      "hwg_b6_exp_6215",
      "hwg_b6_exp_6237",
      "hwg_b6_exp_6281",
      "hwg_b6_exp_6303",
      "hwg_b6_exp_6325"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6260": {
    "canonicalId": "hwg_b6_exp_6260",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6260",
      "hwg_b6_exp_6172",
      "hwg_b6_exp_6194",
      "hwg_b6_exp_6216",
      "hwg_b6_exp_6238",
      "hwg_b6_exp_6282",
      "hwg_b6_exp_6304",
      "hwg_b6_exp_6326"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6261": {
    "canonicalId": "hwg_b6_exp_6261",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6261",
      "hwg_b6_exp_6173",
      "hwg_b6_exp_6195",
      "hwg_b6_exp_6217",
      "hwg_b6_exp_6239",
      "hwg_b6_exp_6283",
      "hwg_b6_exp_6305",
      "hwg_b6_exp_6327"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6262": {
    "canonicalId": "hwg_b6_exp_6262",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6262",
      "hwg_b6_exp_6174",
      "hwg_b6_exp_6196",
      "hwg_b6_exp_6218",
      "hwg_b6_exp_6240",
      "hwg_b6_exp_6284",
      "hwg_b6_exp_6306",
      "hwg_b6_exp_6328"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6263": {
    "canonicalId": "hwg_b6_exp_6263",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6263",
      "hwg_b6_exp_6175",
      "hwg_b6_exp_6197",
      "hwg_b6_exp_6219",
      "hwg_b6_exp_6241",
      "hwg_b6_exp_6285",
      "hwg_b6_exp_6307",
      "hwg_b6_exp_6329"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6264": {
    "canonicalId": "hwg_b6_exp_6264",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6264",
      "hwg_b6_exp_6176",
      "hwg_b6_exp_6198",
      "hwg_b6_exp_6220",
      "hwg_b6_exp_6242",
      "hwg_b6_exp_6286",
      "hwg_b6_exp_6308",
      "hwg_b6_exp_6330"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6265": {
    "canonicalId": "hwg_b6_exp_6265",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6265",
      "hwg_b6_exp_6177",
      "hwg_b6_exp_6199",
      "hwg_b6_exp_6221",
      "hwg_b6_exp_6243",
      "hwg_b6_exp_6287",
      "hwg_b6_exp_6309",
      "hwg_b6_exp_6331"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6288": {
    "canonicalId": "hwg_b6_exp_6288",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6288",
      "hwg_b6_exp_6178",
      "hwg_b6_exp_6200",
      "hwg_b6_exp_6222",
      "hwg_b6_exp_6244",
      "hwg_b6_exp_6266",
      "hwg_b6_exp_6310",
      "hwg_b6_exp_6332"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6289": {
    "canonicalId": "hwg_b6_exp_6289",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6289",
      "hwg_b6_exp_6179",
      "hwg_b6_exp_6201",
      "hwg_b6_exp_6223",
      "hwg_b6_exp_6245",
      "hwg_b6_exp_6267",
      "hwg_b6_exp_6311",
      "hwg_b6_exp_6333"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6290": {
    "canonicalId": "hwg_b6_exp_6290",
    "book": 6,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6290",
      "hwg_b6_exp_6180",
      "hwg_b6_exp_6202",
      "hwg_b6_exp_6224",
      "hwg_b6_exp_6246",
      "hwg_b6_exp_6268",
      "hwg_b6_exp_6312",
      "hwg_b6_exp_6334"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6225": {
    "canonicalId": "hwg_b6_exp_6225",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_exp_6225",
      "hwg_b6_exp_6181",
      "hwg_b6_exp_6203",
      "hwg_b6_exp_6247",
      "hwg_b6_exp_6269",
      "hwg_b6_exp_6291",
      "hwg_b6_exp_6313",
      "hwg_b6_exp_6335"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6226": {
    "canonicalId": "hwg_b6_exp_6226",
    "book": 6,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b6_exp_6226",
      "hwg_b6_exp_6182",
      "hwg_b6_exp_6204",
      "hwg_b6_exp_6248",
      "hwg_b6_exp_6270",
      "hwg_b6_exp_6292",
      "hwg_b6_exp_6314",
      "hwg_b6_exp_6336"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6271": {
    "canonicalId": "hwg_b6_exp_6271",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6271",
      "hwg_b6_exp_6183",
      "hwg_b6_exp_6205",
      "hwg_b6_exp_6227",
      "hwg_b6_exp_6249",
      "hwg_b6_exp_6293",
      "hwg_b6_exp_6315",
      "hwg_b6_exp_6337"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6272": {
    "canonicalId": "hwg_b6_exp_6272",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6272",
      "hwg_b6_exp_6184",
      "hwg_b6_exp_6206",
      "hwg_b6_exp_6228",
      "hwg_b6_exp_6250",
      "hwg_b6_exp_6294",
      "hwg_b6_exp_6316",
      "hwg_b6_exp_6338"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6273": {
    "canonicalId": "hwg_b6_exp_6273",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6273",
      "hwg_b6_exp_6185",
      "hwg_b6_exp_6207",
      "hwg_b6_exp_6229",
      "hwg_b6_exp_6251",
      "hwg_b6_exp_6295",
      "hwg_b6_exp_6317",
      "hwg_b6_exp_6339"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6274": {
    "canonicalId": "hwg_b6_exp_6274",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6274",
      "hwg_b6_exp_6186",
      "hwg_b6_exp_6208",
      "hwg_b6_exp_6230",
      "hwg_b6_exp_6252",
      "hwg_b6_exp_6296",
      "hwg_b6_exp_6318",
      "hwg_b6_exp_6340"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6275": {
    "canonicalId": "hwg_b6_exp_6275",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6275",
      "hwg_b6_exp_6187",
      "hwg_b6_exp_6209",
      "hwg_b6_exp_6231",
      "hwg_b6_exp_6253",
      "hwg_b6_exp_6297",
      "hwg_b6_exp_6319",
      "hwg_b6_exp_6341"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6276": {
    "canonicalId": "hwg_b6_exp_6276",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6276",
      "hwg_b6_exp_6188",
      "hwg_b6_exp_6210",
      "hwg_b6_exp_6232",
      "hwg_b6_exp_6254",
      "hwg_b6_exp_6298",
      "hwg_b6_exp_6320",
      "hwg_b6_exp_6342"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6277": {
    "canonicalId": "hwg_b6_exp_6277",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6277",
      "hwg_b6_exp_6189",
      "hwg_b6_exp_6211",
      "hwg_b6_exp_6233",
      "hwg_b6_exp_6255",
      "hwg_b6_exp_6299",
      "hwg_b6_exp_6321",
      "hwg_b6_exp_6343"
    ],
    "duplicateCount": 7
  },
  "hwg_b6_exp_6278": {
    "canonicalId": "hwg_b6_exp_6278",
    "book": 6,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b6_exp_6278",
      "hwg_b6_exp_6190",
      "hwg_b6_exp_6212",
      "hwg_b6_exp_6234",
      "hwg_b6_exp_6256",
      "hwg_b6_exp_6300",
      "hwg_b6_exp_6322",
      "hwg_b6_exp_6344"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6368": {
    "canonicalId": "hwg_b7_exp_6368",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6368",
      "hwg_b7_exp_6345",
      "hwg_b7_exp_6391",
      "hwg_b7_exp_6414",
      "hwg_b7_exp_6437",
      "hwg_b7_exp_6460",
      "hwg_b7_exp_6483",
      "hwg_b7_exp_6506"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6369": {
    "canonicalId": "hwg_b7_exp_6369",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6369",
      "hwg_b7_exp_6346",
      "hwg_b7_exp_6392",
      "hwg_b7_exp_6415",
      "hwg_b7_exp_6438",
      "hwg_b7_exp_6461",
      "hwg_b7_exp_6484",
      "hwg_b7_exp_6507"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6370": {
    "canonicalId": "hwg_b7_exp_6370",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6370",
      "hwg_b7_exp_6347",
      "hwg_b7_exp_6393",
      "hwg_b7_exp_6416",
      "hwg_b7_exp_6439",
      "hwg_b7_exp_6462",
      "hwg_b7_exp_6485",
      "hwg_b7_exp_6508"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6371": {
    "canonicalId": "hwg_b7_exp_6371",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6371",
      "hwg_b7_exp_6348",
      "hwg_b7_exp_6394",
      "hwg_b7_exp_6417",
      "hwg_b7_exp_6440",
      "hwg_b7_exp_6463",
      "hwg_b7_exp_6486",
      "hwg_b7_exp_6509"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6372": {
    "canonicalId": "hwg_b7_exp_6372",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6372",
      "hwg_b7_exp_6349",
      "hwg_b7_exp_6395",
      "hwg_b7_exp_6418",
      "hwg_b7_exp_6441",
      "hwg_b7_exp_6464",
      "hwg_b7_exp_6487",
      "hwg_b7_exp_6510"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6373": {
    "canonicalId": "hwg_b7_exp_6373",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6373",
      "hwg_b7_exp_6350",
      "hwg_b7_exp_6396",
      "hwg_b7_exp_6419",
      "hwg_b7_exp_6442",
      "hwg_b7_exp_6465",
      "hwg_b7_exp_6488",
      "hwg_b7_exp_6511"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6374": {
    "canonicalId": "hwg_b7_exp_6374",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6374",
      "hwg_b7_exp_6351",
      "hwg_b7_exp_6397",
      "hwg_b7_exp_6420",
      "hwg_b7_exp_6443",
      "hwg_b7_exp_6466",
      "hwg_b7_exp_6489",
      "hwg_b7_exp_6512"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6398": {
    "canonicalId": "hwg_b7_exp_6398",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6398",
      "hwg_b7_exp_6352",
      "hwg_b7_exp_6375",
      "hwg_b7_exp_6421",
      "hwg_b7_exp_6444",
      "hwg_b7_exp_6467",
      "hwg_b7_exp_6490",
      "hwg_b7_exp_6513"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6399": {
    "canonicalId": "hwg_b7_exp_6399",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6399",
      "hwg_b7_exp_6353",
      "hwg_b7_exp_6376",
      "hwg_b7_exp_6422",
      "hwg_b7_exp_6445",
      "hwg_b7_exp_6468",
      "hwg_b7_exp_6491",
      "hwg_b7_exp_6514"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6400": {
    "canonicalId": "hwg_b7_exp_6400",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6400",
      "hwg_b7_exp_6354",
      "hwg_b7_exp_6377",
      "hwg_b7_exp_6423",
      "hwg_b7_exp_6446",
      "hwg_b7_exp_6469",
      "hwg_b7_exp_6492",
      "hwg_b7_exp_6515"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6401": {
    "canonicalId": "hwg_b7_exp_6401",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6401",
      "hwg_b7_exp_6355",
      "hwg_b7_exp_6378",
      "hwg_b7_exp_6424",
      "hwg_b7_exp_6447",
      "hwg_b7_exp_6470",
      "hwg_b7_exp_6493",
      "hwg_b7_exp_6516"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6402": {
    "canonicalId": "hwg_b7_exp_6402",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6402",
      "hwg_b7_exp_6356",
      "hwg_b7_exp_6379",
      "hwg_b7_exp_6425",
      "hwg_b7_exp_6448",
      "hwg_b7_exp_6471",
      "hwg_b7_exp_6494",
      "hwg_b7_exp_6517"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6472": {
    "canonicalId": "hwg_b7_exp_6472",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_exp_6472",
      "hwg_b7_exp_6357",
      "hwg_b7_exp_6380",
      "hwg_b7_exp_6403",
      "hwg_b7_exp_6426",
      "hwg_b7_exp_6449",
      "hwg_b7_exp_6495",
      "hwg_b7_exp_6518"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6473": {
    "canonicalId": "hwg_b7_exp_6473",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_exp_6473",
      "hwg_b7_exp_6358",
      "hwg_b7_exp_6381",
      "hwg_b7_exp_6404",
      "hwg_b7_exp_6427",
      "hwg_b7_exp_6450",
      "hwg_b7_exp_6496",
      "hwg_b7_exp_6519"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6474": {
    "canonicalId": "hwg_b7_exp_6474",
    "book": 7,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b7_exp_6474",
      "hwg_b7_exp_6359",
      "hwg_b7_exp_6382",
      "hwg_b7_exp_6405",
      "hwg_b7_exp_6428",
      "hwg_b7_exp_6451",
      "hwg_b7_exp_6497",
      "hwg_b7_exp_6520"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6383": {
    "canonicalId": "hwg_b7_exp_6383",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6383",
      "hwg_b7_exp_6360",
      "hwg_b7_exp_6406",
      "hwg_b7_exp_6429",
      "hwg_b7_exp_6452",
      "hwg_b7_exp_6475",
      "hwg_b7_exp_6498",
      "hwg_b7_exp_6521"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6384": {
    "canonicalId": "hwg_b7_exp_6384",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6384",
      "hwg_b7_exp_6361",
      "hwg_b7_exp_6407",
      "hwg_b7_exp_6430",
      "hwg_b7_exp_6453",
      "hwg_b7_exp_6476",
      "hwg_b7_exp_6499",
      "hwg_b7_exp_6522"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6385": {
    "canonicalId": "hwg_b7_exp_6385",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6385",
      "hwg_b7_exp_6362",
      "hwg_b7_exp_6408",
      "hwg_b7_exp_6431",
      "hwg_b7_exp_6454",
      "hwg_b7_exp_6477",
      "hwg_b7_exp_6500",
      "hwg_b7_exp_6523"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6386": {
    "canonicalId": "hwg_b7_exp_6386",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6386",
      "hwg_b7_exp_6363",
      "hwg_b7_exp_6409",
      "hwg_b7_exp_6432",
      "hwg_b7_exp_6455",
      "hwg_b7_exp_6478",
      "hwg_b7_exp_6501",
      "hwg_b7_exp_6524"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6387": {
    "canonicalId": "hwg_b7_exp_6387",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6387",
      "hwg_b7_exp_6364",
      "hwg_b7_exp_6410",
      "hwg_b7_exp_6433",
      "hwg_b7_exp_6456",
      "hwg_b7_exp_6479",
      "hwg_b7_exp_6502",
      "hwg_b7_exp_6525"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6388": {
    "canonicalId": "hwg_b7_exp_6388",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6388",
      "hwg_b7_exp_6365",
      "hwg_b7_exp_6411",
      "hwg_b7_exp_6434",
      "hwg_b7_exp_6457",
      "hwg_b7_exp_6480",
      "hwg_b7_exp_6503",
      "hwg_b7_exp_6526"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6389": {
    "canonicalId": "hwg_b7_exp_6389",
    "book": 7,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6389",
      "hwg_b7_exp_6366",
      "hwg_b7_exp_6412",
      "hwg_b7_exp_6435",
      "hwg_b7_exp_6458",
      "hwg_b7_exp_6481",
      "hwg_b7_exp_6504",
      "hwg_b7_exp_6527"
    ],
    "duplicateCount": 7
  },
  "hwg_b7_exp_6413": {
    "canonicalId": "hwg_b7_exp_6413",
    "book": 7,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b7_exp_6413",
      "hwg_b7_exp_6367",
      "hwg_b7_exp_6390",
      "hwg_b7_exp_6436",
      "hwg_b7_exp_6459",
      "hwg_b7_exp_6482",
      "hwg_b7_exp_6505",
      "hwg_b7_exp_6528"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6550": {
    "canonicalId": "hwg_b8_exp_6550",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6550",
      "hwg_b8_exp_6529",
      "hwg_b8_exp_6571",
      "hwg_b8_exp_6592",
      "hwg_b8_exp_6613",
      "hwg_b8_exp_6634",
      "hwg_b8_exp_6655",
      "hwg_b8_exp_6676"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6551": {
    "canonicalId": "hwg_b8_exp_6551",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6551",
      "hwg_b8_exp_6530",
      "hwg_b8_exp_6572",
      "hwg_b8_exp_6593",
      "hwg_b8_exp_6614",
      "hwg_b8_exp_6635",
      "hwg_b8_exp_6656",
      "hwg_b8_exp_6677"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6552": {
    "canonicalId": "hwg_b8_exp_6552",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6552",
      "hwg_b8_exp_6531",
      "hwg_b8_exp_6573",
      "hwg_b8_exp_6594",
      "hwg_b8_exp_6615",
      "hwg_b8_exp_6636",
      "hwg_b8_exp_6657",
      "hwg_b8_exp_6678"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6553": {
    "canonicalId": "hwg_b8_exp_6553",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6553",
      "hwg_b8_exp_6532",
      "hwg_b8_exp_6574",
      "hwg_b8_exp_6595",
      "hwg_b8_exp_6616",
      "hwg_b8_exp_6637",
      "hwg_b8_exp_6658",
      "hwg_b8_exp_6679"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6575": {
    "canonicalId": "hwg_b8_exp_6575",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6575",
      "hwg_b8_exp_6533",
      "hwg_b8_exp_6554",
      "hwg_b8_exp_6596",
      "hwg_b8_exp_6617",
      "hwg_b8_exp_6638",
      "hwg_b8_exp_6659",
      "hwg_b8_exp_6680"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6576": {
    "canonicalId": "hwg_b8_exp_6576",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6576",
      "hwg_b8_exp_6534",
      "hwg_b8_exp_6555",
      "hwg_b8_exp_6597",
      "hwg_b8_exp_6618",
      "hwg_b8_exp_6639",
      "hwg_b8_exp_6660",
      "hwg_b8_exp_6681"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6577": {
    "canonicalId": "hwg_b8_exp_6577",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6577",
      "hwg_b8_exp_6535",
      "hwg_b8_exp_6556",
      "hwg_b8_exp_6598",
      "hwg_b8_exp_6619",
      "hwg_b8_exp_6640",
      "hwg_b8_exp_6661",
      "hwg_b8_exp_6682"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6620": {
    "canonicalId": "hwg_b8_exp_6620",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_exp_6620",
      "hwg_b8_exp_6536",
      "hwg_b8_exp_6557",
      "hwg_b8_exp_6578",
      "hwg_b8_exp_6599",
      "hwg_b8_exp_6641",
      "hwg_b8_exp_6662",
      "hwg_b8_exp_6683"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6621": {
    "canonicalId": "hwg_b8_exp_6621",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_exp_6621",
      "hwg_b8_exp_6537",
      "hwg_b8_exp_6558",
      "hwg_b8_exp_6579",
      "hwg_b8_exp_6600",
      "hwg_b8_exp_6642",
      "hwg_b8_exp_6663",
      "hwg_b8_exp_6684"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6643": {
    "canonicalId": "hwg_b8_exp_6643",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_exp_6643",
      "hwg_b8_exp_6538",
      "hwg_b8_exp_6559",
      "hwg_b8_exp_6580",
      "hwg_b8_exp_6601",
      "hwg_b8_exp_6622",
      "hwg_b8_exp_6664",
      "hwg_b8_exp_6685"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6644": {
    "canonicalId": "hwg_b8_exp_6644",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_exp_6644",
      "hwg_b8_exp_6539",
      "hwg_b8_exp_6560",
      "hwg_b8_exp_6581",
      "hwg_b8_exp_6602",
      "hwg_b8_exp_6623",
      "hwg_b8_exp_6665",
      "hwg_b8_exp_6686"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6645": {
    "canonicalId": "hwg_b8_exp_6645",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_exp_6645",
      "hwg_b8_exp_6540",
      "hwg_b8_exp_6561",
      "hwg_b8_exp_6582",
      "hwg_b8_exp_6603",
      "hwg_b8_exp_6624",
      "hwg_b8_exp_6666",
      "hwg_b8_exp_6687"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6646": {
    "canonicalId": "hwg_b8_exp_6646",
    "book": 8,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_exp_6646",
      "hwg_b8_exp_6541",
      "hwg_b8_exp_6562",
      "hwg_b8_exp_6583",
      "hwg_b8_exp_6604",
      "hwg_b8_exp_6625",
      "hwg_b8_exp_6667",
      "hwg_b8_exp_6688"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6563": {
    "canonicalId": "hwg_b8_exp_6563",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6563",
      "hwg_b8_exp_6542",
      "hwg_b8_exp_6584",
      "hwg_b8_exp_6605",
      "hwg_b8_exp_6626",
      "hwg_b8_exp_6647",
      "hwg_b8_exp_6668",
      "hwg_b8_exp_6689"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6564": {
    "canonicalId": "hwg_b8_exp_6564",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6564",
      "hwg_b8_exp_6543",
      "hwg_b8_exp_6585",
      "hwg_b8_exp_6606",
      "hwg_b8_exp_6627",
      "hwg_b8_exp_6648",
      "hwg_b8_exp_6669",
      "hwg_b8_exp_6690"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6565": {
    "canonicalId": "hwg_b8_exp_6565",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6565",
      "hwg_b8_exp_6544",
      "hwg_b8_exp_6586",
      "hwg_b8_exp_6607",
      "hwg_b8_exp_6628",
      "hwg_b8_exp_6649",
      "hwg_b8_exp_6670",
      "hwg_b8_exp_6691"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6566": {
    "canonicalId": "hwg_b8_exp_6566",
    "book": 8,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6566",
      "hwg_b8_exp_6545",
      "hwg_b8_exp_6587",
      "hwg_b8_exp_6608",
      "hwg_b8_exp_6629",
      "hwg_b8_exp_6650",
      "hwg_b8_exp_6671",
      "hwg_b8_exp_6692"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6588": {
    "canonicalId": "hwg_b8_exp_6588",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6588",
      "hwg_b8_exp_6546",
      "hwg_b8_exp_6567",
      "hwg_b8_exp_6609",
      "hwg_b8_exp_6630",
      "hwg_b8_exp_6651",
      "hwg_b8_exp_6672",
      "hwg_b8_exp_6693"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6589": {
    "canonicalId": "hwg_b8_exp_6589",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6589",
      "hwg_b8_exp_6547",
      "hwg_b8_exp_6568",
      "hwg_b8_exp_6610",
      "hwg_b8_exp_6631",
      "hwg_b8_exp_6652",
      "hwg_b8_exp_6673",
      "hwg_b8_exp_6694"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6590": {
    "canonicalId": "hwg_b8_exp_6590",
    "book": 8,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b8_exp_6590",
      "hwg_b8_exp_6548",
      "hwg_b8_exp_6569",
      "hwg_b8_exp_6611",
      "hwg_b8_exp_6632",
      "hwg_b8_exp_6653",
      "hwg_b8_exp_6674",
      "hwg_b8_exp_6695"
    ],
    "duplicateCount": 7
  },
  "hwg_b8_exp_6633": {
    "canonicalId": "hwg_b8_exp_6633",
    "book": 8,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b8_exp_6633",
      "hwg_b8_exp_6549",
      "hwg_b8_exp_6570",
      "hwg_b8_exp_6591",
      "hwg_b8_exp_6612",
      "hwg_b8_exp_6654",
      "hwg_b8_exp_6675",
      "hwg_b8_exp_6696"
    ],
    "duplicateCount": 7
  },
  "hwg_b9_exp_6717": {
    "canonicalId": "hwg_b9_exp_6717",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6717",
      "hwg_b9_exp_6697",
      "hwg_b9_exp_6737",
      "hwg_b9_exp_6757",
      "hwg_b9_exp_6777",
      "hwg_b9_exp_6797",
      "hwg_b9_exp_6817"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6718": {
    "canonicalId": "hwg_b9_exp_6718",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6718",
      "hwg_b9_exp_6698",
      "hwg_b9_exp_6738",
      "hwg_b9_exp_6758",
      "hwg_b9_exp_6778",
      "hwg_b9_exp_6798",
      "hwg_b9_exp_6818"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6719": {
    "canonicalId": "hwg_b9_exp_6719",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6719",
      "hwg_b9_exp_6699",
      "hwg_b9_exp_6739",
      "hwg_b9_exp_6759",
      "hwg_b9_exp_6779",
      "hwg_b9_exp_6799",
      "hwg_b9_exp_6819"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6720": {
    "canonicalId": "hwg_b9_exp_6720",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6720",
      "hwg_b9_exp_6700",
      "hwg_b9_exp_6740",
      "hwg_b9_exp_6760",
      "hwg_b9_exp_6780",
      "hwg_b9_exp_6800",
      "hwg_b9_exp_6820"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6801": {
    "canonicalId": "hwg_b9_exp_6801",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6801",
      "hwg_b9_exp_6701",
      "hwg_b9_exp_6721",
      "hwg_b9_exp_6741",
      "hwg_b9_exp_6761",
      "hwg_b9_exp_6781",
      "hwg_b9_exp_6821"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6802": {
    "canonicalId": "hwg_b9_exp_6802",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6802",
      "hwg_b9_exp_6702",
      "hwg_b9_exp_6722",
      "hwg_b9_exp_6742",
      "hwg_b9_exp_6762",
      "hwg_b9_exp_6782",
      "hwg_b9_exp_6822"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6743": {
    "canonicalId": "hwg_b9_exp_6743",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6743",
      "hwg_b9_exp_6703",
      "hwg_b9_exp_6723",
      "hwg_b9_exp_6763",
      "hwg_b9_exp_6783",
      "hwg_b9_exp_6803",
      "hwg_b9_exp_6823"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6744": {
    "canonicalId": "hwg_b9_exp_6744",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6744",
      "hwg_b9_exp_6704",
      "hwg_b9_exp_6724",
      "hwg_b9_exp_6764",
      "hwg_b9_exp_6784",
      "hwg_b9_exp_6804",
      "hwg_b9_exp_6824"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6785": {
    "canonicalId": "hwg_b9_exp_6785",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6785",
      "hwg_b9_exp_6705",
      "hwg_b9_exp_6725",
      "hwg_b9_exp_6745",
      "hwg_b9_exp_6765",
      "hwg_b9_exp_6805",
      "hwg_b9_exp_6825"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6786": {
    "canonicalId": "hwg_b9_exp_6786",
    "book": 9,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6786",
      "hwg_b9_exp_6706",
      "hwg_b9_exp_6726",
      "hwg_b9_exp_6746",
      "hwg_b9_exp_6766",
      "hwg_b9_exp_6806",
      "hwg_b9_exp_6826"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6807": {
    "canonicalId": "hwg_b9_exp_6807",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6807",
      "hwg_b9_exp_6707",
      "hwg_b9_exp_6727",
      "hwg_b9_exp_6747",
      "hwg_b9_exp_6767",
      "hwg_b9_exp_6787",
      "hwg_b9_exp_6827"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6808": {
    "canonicalId": "hwg_b9_exp_6808",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6808",
      "hwg_b9_exp_6708",
      "hwg_b9_exp_6728",
      "hwg_b9_exp_6748",
      "hwg_b9_exp_6768",
      "hwg_b9_exp_6788",
      "hwg_b9_exp_6828"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6729": {
    "canonicalId": "hwg_b9_exp_6729",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6729",
      "hwg_b9_exp_6709",
      "hwg_b9_exp_6749",
      "hwg_b9_exp_6769",
      "hwg_b9_exp_6789",
      "hwg_b9_exp_6809",
      "hwg_b9_exp_6829"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6730": {
    "canonicalId": "hwg_b9_exp_6730",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6730",
      "hwg_b9_exp_6710",
      "hwg_b9_exp_6750",
      "hwg_b9_exp_6770",
      "hwg_b9_exp_6790",
      "hwg_b9_exp_6810",
      "hwg_b9_exp_6830"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6731": {
    "canonicalId": "hwg_b9_exp_6731",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6731",
      "hwg_b9_exp_6711",
      "hwg_b9_exp_6751",
      "hwg_b9_exp_6771",
      "hwg_b9_exp_6791",
      "hwg_b9_exp_6811",
      "hwg_b9_exp_6831"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6732": {
    "canonicalId": "hwg_b9_exp_6732",
    "book": 9,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6732",
      "hwg_b9_exp_6712",
      "hwg_b9_exp_6752",
      "hwg_b9_exp_6772",
      "hwg_b9_exp_6792",
      "hwg_b9_exp_6812",
      "hwg_b9_exp_6832"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6813": {
    "canonicalId": "hwg_b9_exp_6813",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6813",
      "hwg_b9_exp_6713",
      "hwg_b9_exp_6733",
      "hwg_b9_exp_6753",
      "hwg_b9_exp_6773",
      "hwg_b9_exp_6793",
      "hwg_b9_exp_6833"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6814": {
    "canonicalId": "hwg_b9_exp_6814",
    "book": 9,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b9_exp_6814",
      "hwg_b9_exp_6714",
      "hwg_b9_exp_6734",
      "hwg_b9_exp_6754",
      "hwg_b9_exp_6774",
      "hwg_b9_exp_6794",
      "hwg_b9_exp_6834"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6755": {
    "canonicalId": "hwg_b9_exp_6755",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6755",
      "hwg_b9_exp_6715",
      "hwg_b9_exp_6735",
      "hwg_b9_exp_6775",
      "hwg_b9_exp_6795",
      "hwg_b9_exp_6815",
      "hwg_b9_exp_6835"
    ],
    "duplicateCount": 6
  },
  "hwg_b9_exp_6756": {
    "canonicalId": "hwg_b9_exp_6756",
    "book": 9,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b9_exp_6756",
      "hwg_b9_exp_6716",
      "hwg_b9_exp_6736",
      "hwg_b9_exp_6776",
      "hwg_b9_exp_6796",
      "hwg_b9_exp_6816",
      "hwg_b9_exp_6836"
    ],
    "duplicateCount": 6
  },
  "hwg_bg1_exp_6837": {
    "canonicalId": "hwg_bg1_exp_6837",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6837"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_exp_6838": {
    "canonicalId": "hwg_bg1_exp_6838",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6838",
      "hwg_bg1_exp_6839",
      "hwg_bg1_exp_6841",
      "hwg_bg1_exp_6866",
      "hwg_bg1_exp_6870",
      "hwg_bg1_exp_6875",
      "hwg_bg1_exp_6885",
      "hwg_bg1_exp_6901"
    ],
    "duplicateCount": 7
  },
  "hwg_bg1_exp_6840": {
    "canonicalId": "hwg_bg1_exp_6840",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6840",
      "hwg_bg1_exp_6864"
    ],
    "duplicateCount": 1
  },
  "hwg_bg1_exp_6842": {
    "canonicalId": "hwg_bg1_exp_6842",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6842",
      "hwg_bg1_exp_6886",
      "hwg_bg1_exp_6903"
    ],
    "duplicateCount": 2
  },
  "hwg_bg1_exp_6843": {
    "canonicalId": "hwg_bg1_exp_6843",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6843",
      "hwg_bg1_exp_6852",
      "hwg_bg1_exp_6906"
    ],
    "duplicateCount": 2
  },
  "hwg_bg1_exp_6844": {
    "canonicalId": "hwg_bg1_exp_6844",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6844",
      "hwg_bg1_exp_6856",
      "hwg_bg1_exp_6871",
      "hwg_bg1_exp_6880"
    ],
    "duplicateCount": 3
  },
  "hwg_bg1_exp_6845": {
    "canonicalId": "hwg_bg1_exp_6845",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6845",
      "hwg_bg1_exp_6849",
      "hwg_bg1_exp_6867"
    ],
    "duplicateCount": 2
  },
  "hwg_bg1_exp_6846": {
    "canonicalId": "hwg_bg1_exp_6846",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6846",
      "hwg_bg1_exp_6851",
      "hwg_bg1_exp_6854",
      "hwg_bg1_exp_6855",
      "hwg_bg1_exp_6859",
      "hwg_bg1_exp_6869",
      "hwg_bg1_exp_6907"
    ],
    "duplicateCount": 6
  },
  "hwg_bg1_exp_6847": {
    "canonicalId": "hwg_bg1_exp_6847",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6847",
      "hwg_bg1_exp_6905"
    ],
    "duplicateCount": 1
  },
  "hwg_bg1_exp_6848": {
    "canonicalId": "hwg_bg1_exp_6848",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6848",
      "hwg_bg1_exp_6858",
      "hwg_bg1_exp_6899",
      "hwg_bg1_exp_6900"
    ],
    "duplicateCount": 3
  },
  "hwg_bg1_exp_6850": {
    "canonicalId": "hwg_bg1_exp_6850",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6850",
      "hwg_bg1_exp_6878"
    ],
    "duplicateCount": 1
  },
  "hwg_bg1_exp_6853": {
    "canonicalId": "hwg_bg1_exp_6853",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6853",
      "hwg_bg1_exp_6863"
    ],
    "duplicateCount": 1
  },
  "hwg_bg1_exp_6857": {
    "canonicalId": "hwg_bg1_exp_6857",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6857",
      "hwg_bg1_exp_6877"
    ],
    "duplicateCount": 1
  },
  "hwg_bg1_exp_6860": {
    "canonicalId": "hwg_bg1_exp_6860",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6860",
      "hwg_bg1_exp_6865",
      "hwg_bg1_exp_6894",
      "hwg_bg1_exp_6902",
      "hwg_bg1_exp_6904"
    ],
    "duplicateCount": 4
  },
  "hwg_bg1_exp_6861": {
    "canonicalId": "hwg_bg1_exp_6861",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6861",
      "hwg_bg1_exp_6872",
      "hwg_bg1_exp_6882",
      "hwg_bg1_exp_6891"
    ],
    "duplicateCount": 3
  },
  "hwg_bg1_exp_6862": {
    "canonicalId": "hwg_bg1_exp_6862",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6862",
      "hwg_bg1_exp_6879"
    ],
    "duplicateCount": 1
  },
  "hwg_bg1_exp_6868": {
    "canonicalId": "hwg_bg1_exp_6868",
    "book": "g1",
    "primaryScope": "Unit 4 (U~Z)",
    "scopes": [
      "Unit 4 (U~Z)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6868",
      "hwg_bg1_exp_6876",
      "hwg_bg1_exp_6889"
    ],
    "duplicateCount": 2
  },
  "hwg_bg1_exp_6873": {
    "canonicalId": "hwg_bg1_exp_6873",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6873",
      "hwg_bg1_exp_6887",
      "hwg_bg1_exp_6897",
      "hwg_bg1_exp_6898"
    ],
    "duplicateCount": 3
  },
  "hwg_bg1_exp_6874": {
    "canonicalId": "hwg_bg1_exp_6874",
    "book": "g1",
    "primaryScope": "Unit 2 (H~N)",
    "scopes": [
      "Unit 2 (H~N)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6874",
      "hwg_bg1_exp_6888"
    ],
    "duplicateCount": 1
  },
  "hwg_bg1_exp_6881": {
    "canonicalId": "hwg_bg1_exp_6881",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6881",
      "hwg_bg1_exp_6892",
      "hwg_bg1_exp_6895"
    ],
    "duplicateCount": 2
  },
  "hwg_bg1_exp_6883": {
    "canonicalId": "hwg_bg1_exp_6883",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6883",
      "hwg_bg1_exp_6893",
      "hwg_bg1_exp_6896"
    ],
    "duplicateCount": 2
  },
  "hwg_bg1_exp_6884": {
    "canonicalId": "hwg_bg1_exp_6884",
    "book": "g1",
    "primaryScope": "Unit 1 (A~G)",
    "scopes": [
      "Unit 1 (A~G)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6884"
    ],
    "duplicateCount": 0
  },
  "hwg_bg1_exp_6890": {
    "canonicalId": "hwg_bg1_exp_6890",
    "book": "g1",
    "primaryScope": "Unit 3 (O~T)",
    "scopes": [
      "Unit 3 (O~T)"
    ],
    "legacyIds": [
      "hwg_bg1_exp_6890",
      "hwg_bg1_exp_6908"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6909": {
    "canonicalId": "hwg_bg2_exp_6909",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6909",
      "hwg_bg2_exp_6918",
      "hwg_bg2_exp_6979",
      "hwg_bg2_exp_7015"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6910": {
    "canonicalId": "hwg_bg2_exp_6910",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6910",
      "hwg_bg2_exp_7000",
      "hwg_bg2_exp_7014"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6911": {
    "canonicalId": "hwg_bg2_exp_6911",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6911",
      "hwg_bg2_exp_6941",
      "hwg_bg2_exp_6944",
      "hwg_bg2_exp_7006"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6912": {
    "canonicalId": "hwg_bg2_exp_6912",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6912",
      "hwg_bg2_exp_6986"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6913": {
    "canonicalId": "hwg_bg2_exp_6913",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6913",
      "hwg_bg2_exp_6974",
      "hwg_bg2_exp_6977"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6914": {
    "canonicalId": "hwg_bg2_exp_6914",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6914",
      "hwg_bg2_exp_7001",
      "hwg_bg2_exp_7004"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6915": {
    "canonicalId": "hwg_bg2_exp_6915",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6915",
      "hwg_bg2_exp_6943",
      "hwg_bg2_exp_6948",
      "hwg_bg2_exp_7013"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6916": {
    "canonicalId": "hwg_bg2_exp_6916",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6916",
      "hwg_bg2_exp_6973"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6917": {
    "canonicalId": "hwg_bg2_exp_6917",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6917"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_6919": {
    "canonicalId": "hwg_bg2_exp_6919",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6919"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_6920": {
    "canonicalId": "hwg_bg2_exp_6920",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6920",
      "hwg_bg2_exp_7008",
      "hwg_bg2_exp_7010"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6921": {
    "canonicalId": "hwg_bg2_exp_6921",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6921",
      "hwg_bg2_exp_6924",
      "hwg_bg2_exp_6950",
      "hwg_bg2_exp_6971"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6922": {
    "canonicalId": "hwg_bg2_exp_6922",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6922",
      "hwg_bg2_exp_6926"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6923": {
    "canonicalId": "hwg_bg2_exp_6923",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6923",
      "hwg_bg2_exp_6956",
      "hwg_bg2_exp_6976",
      "hwg_bg2_exp_7007"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6925": {
    "canonicalId": "hwg_bg2_exp_6925",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6925",
      "hwg_bg2_exp_6939",
      "hwg_bg2_exp_6951",
      "hwg_bg2_exp_6952",
      "hwg_bg2_exp_6980",
      "hwg_bg2_exp_7011",
      "hwg_bg2_exp_7016"
    ],
    "duplicateCount": 6
  },
  "hwg_bg2_exp_6927": {
    "canonicalId": "hwg_bg2_exp_6927",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6927"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_6928": {
    "canonicalId": "hwg_bg2_exp_6928",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6928",
      "hwg_bg2_exp_6932"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6929": {
    "canonicalId": "hwg_bg2_exp_6929",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6929",
      "hwg_bg2_exp_7018"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6930": {
    "canonicalId": "hwg_bg2_exp_6930",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6930",
      "hwg_bg2_exp_6937",
      "hwg_bg2_exp_6997",
      "hwg_bg2_exp_7020"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6931": {
    "canonicalId": "hwg_bg2_exp_6931",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6931",
      "hwg_bg2_exp_6957",
      "hwg_bg2_exp_6995"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6933": {
    "canonicalId": "hwg_bg2_exp_6933",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6933",
      "hwg_bg2_exp_6936",
      "hwg_bg2_exp_6938",
      "hwg_bg2_exp_7019",
      "hwg_bg2_exp_7026"
    ],
    "duplicateCount": 4
  },
  "hwg_bg2_exp_6934": {
    "canonicalId": "hwg_bg2_exp_6934",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6934",
      "hwg_bg2_exp_6992",
      "hwg_bg2_exp_6996"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6935": {
    "canonicalId": "hwg_bg2_exp_6935",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6935",
      "hwg_bg2_exp_7025"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6940": {
    "canonicalId": "hwg_bg2_exp_6940",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6940",
      "hwg_bg2_exp_6949",
      "hwg_bg2_exp_6969",
      "hwg_bg2_exp_6981"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6942": {
    "canonicalId": "hwg_bg2_exp_6942",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6942",
      "hwg_bg2_exp_6975",
      "hwg_bg2_exp_7005"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6945": {
    "canonicalId": "hwg_bg2_exp_6945",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6945",
      "hwg_bg2_exp_6947",
      "hwg_bg2_exp_6984",
      "hwg_bg2_exp_7009",
      "hwg_bg2_exp_7012"
    ],
    "duplicateCount": 4
  },
  "hwg_bg2_exp_6946": {
    "canonicalId": "hwg_bg2_exp_6946",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6946",
      "hwg_bg2_exp_6970"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6953": {
    "canonicalId": "hwg_bg2_exp_6953",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6953",
      "hwg_bg2_exp_6972",
      "hwg_bg2_exp_6982",
      "hwg_bg2_exp_6983"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6954": {
    "canonicalId": "hwg_bg2_exp_6954",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6954",
      "hwg_bg2_exp_6978",
      "hwg_bg2_exp_6999",
      "hwg_bg2_exp_7002"
    ],
    "duplicateCount": 3
  },
  "hwg_bg2_exp_6955": {
    "canonicalId": "hwg_bg2_exp_6955",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6955",
      "hwg_bg2_exp_6985"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6958": {
    "canonicalId": "hwg_bg2_exp_6958",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6958"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_6959": {
    "canonicalId": "hwg_bg2_exp_6959",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6959",
      "hwg_bg2_exp_6963"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6960": {
    "canonicalId": "hwg_bg2_exp_6960",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6960",
      "hwg_bg2_exp_6967"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6961": {
    "canonicalId": "hwg_bg2_exp_6961",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6961",
      "hwg_bg2_exp_7027"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6962": {
    "canonicalId": "hwg_bg2_exp_6962",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6962",
      "hwg_bg2_exp_6964",
      "hwg_bg2_exp_6994"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6965": {
    "canonicalId": "hwg_bg2_exp_6965",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6965",
      "hwg_bg2_exp_6966",
      "hwg_bg2_exp_6968"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6987": {
    "canonicalId": "hwg_bg2_exp_6987",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6987",
      "hwg_bg2_exp_6990"
    ],
    "duplicateCount": 1
  },
  "hwg_bg2_exp_6988": {
    "canonicalId": "hwg_bg2_exp_6988",
    "book": "g2",
    "primaryScope": "Unit 2 (Hh~Nn)",
    "scopes": [
      "Unit 2 (Hh~Nn)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6988"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_6989": {
    "canonicalId": "hwg_bg2_exp_6989",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6989"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_6991": {
    "canonicalId": "hwg_bg2_exp_6991",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6991",
      "hwg_bg2_exp_7023",
      "hwg_bg2_exp_7024"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_6993": {
    "canonicalId": "hwg_bg2_exp_6993",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6993"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_6998": {
    "canonicalId": "hwg_bg2_exp_6998",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_6998"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_7003": {
    "canonicalId": "hwg_bg2_exp_7003",
    "book": "g2",
    "primaryScope": "Unit 4 (Uu~Zz)",
    "scopes": [
      "Unit 4 (Uu~Zz)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_7003"
    ],
    "duplicateCount": 0
  },
  "hwg_bg2_exp_7017": {
    "canonicalId": "hwg_bg2_exp_7017",
    "book": "g2",
    "primaryScope": "Unit 1 (Aa~Gg)",
    "scopes": [
      "Unit 1 (Aa~Gg)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_7017",
      "hwg_bg2_exp_7022",
      "hwg_bg2_exp_7028"
    ],
    "duplicateCount": 2
  },
  "hwg_bg2_exp_7021": {
    "canonicalId": "hwg_bg2_exp_7021",
    "book": "g2",
    "primaryScope": "Unit 3 (Oo~Tt)",
    "scopes": [
      "Unit 3 (Oo~Tt)"
    ],
    "legacyIds": [
      "hwg_bg2_exp_7021"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_01": {
    "canonicalId": "hwg_b1_ba_01",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_ba_01"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_02": {
    "canonicalId": "hwg_b1_ba_02",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_ba_02"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_03": {
    "canonicalId": "hwg_b1_ba_03",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_ba_03"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_04": {
    "canonicalId": "hwg_b1_ba_04",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_ba_04"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_05": {
    "canonicalId": "hwg_b1_ba_05",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_ba_05"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_06": {
    "canonicalId": "hwg_b1_ba_06",
    "book": 1,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b1_ba_06"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_07": {
    "canonicalId": "hwg_b1_ba_07",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_07"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_08": {
    "canonicalId": "hwg_b1_ba_08",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_08"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_09": {
    "canonicalId": "hwg_b1_ba_09",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_09"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_10": {
    "canonicalId": "hwg_b1_ba_10",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_10"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_11": {
    "canonicalId": "hwg_b1_ba_11",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_11"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_12": {
    "canonicalId": "hwg_b1_ba_12",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_12"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_13": {
    "canonicalId": "hwg_b1_ba_13",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_13"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_14": {
    "canonicalId": "hwg_b1_ba_14",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_14"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_15": {
    "canonicalId": "hwg_b1_ba_15",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_15"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_16": {
    "canonicalId": "hwg_b1_ba_16",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_16"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_17": {
    "canonicalId": "hwg_b1_ba_17",
    "book": 1,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_17"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_18": {
    "canonicalId": "hwg_b1_ba_18",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_18"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_19": {
    "canonicalId": "hwg_b1_ba_19",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_19"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_20": {
    "canonicalId": "hwg_b1_ba_20",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_20"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_21": {
    "canonicalId": "hwg_b1_ba_21",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_21"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_22": {
    "canonicalId": "hwg_b1_ba_22",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_22"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_23": {
    "canonicalId": "hwg_b1_ba_23",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_23"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_24": {
    "canonicalId": "hwg_b1_ba_24",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_24"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_25": {
    "canonicalId": "hwg_b1_ba_25",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_25"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_26": {
    "canonicalId": "hwg_b1_ba_26",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_26"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_27": {
    "canonicalId": "hwg_b1_ba_27",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_27"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_28": {
    "canonicalId": "hwg_b1_ba_28",
    "book": 1,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b1_ba_28"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_29": {
    "canonicalId": "hwg_b1_ba_29",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_29"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_30": {
    "canonicalId": "hwg_b1_ba_30",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_30"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_31": {
    "canonicalId": "hwg_b1_ba_31",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_31"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_32": {
    "canonicalId": "hwg_b1_ba_32",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_32"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_33": {
    "canonicalId": "hwg_b1_ba_33",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_33"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_34": {
    "canonicalId": "hwg_b1_ba_34",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_34"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_35": {
    "canonicalId": "hwg_b1_ba_35",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_35"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_36": {
    "canonicalId": "hwg_b1_ba_36",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_36"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_37": {
    "canonicalId": "hwg_b1_ba_37",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_37"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_38": {
    "canonicalId": "hwg_b1_ba_38",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_38"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_39": {
    "canonicalId": "hwg_b1_ba_39",
    "book": 1,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_39"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_40": {
    "canonicalId": "hwg_b1_ba_40",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_40"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_41": {
    "canonicalId": "hwg_b1_ba_41",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_41"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_42": {
    "canonicalId": "hwg_b1_ba_42",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_42"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_43": {
    "canonicalId": "hwg_b1_ba_43",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_43"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_44": {
    "canonicalId": "hwg_b1_ba_44",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_44"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_45": {
    "canonicalId": "hwg_b1_ba_45",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_45"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_46": {
    "canonicalId": "hwg_b1_ba_46",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_46"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_47": {
    "canonicalId": "hwg_b1_ba_47",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_47"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_48": {
    "canonicalId": "hwg_b1_ba_48",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_48"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_49": {
    "canonicalId": "hwg_b1_ba_49",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_49"
    ],
    "duplicateCount": 0
  },
  "hwg_b1_ba_50": {
    "canonicalId": "hwg_b1_ba_50",
    "book": 1,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b1_ba_50"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_01": {
    "canonicalId": "hwg_b2_ba_01",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_ba_01"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_02": {
    "canonicalId": "hwg_b2_ba_02",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_ba_02"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_03": {
    "canonicalId": "hwg_b2_ba_03",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_ba_03"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_04": {
    "canonicalId": "hwg_b2_ba_04",
    "book": 2,
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "legacyIds": [
      "hwg_b2_ba_04"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_05": {
    "canonicalId": "hwg_b2_ba_05",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_05"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_06": {
    "canonicalId": "hwg_b2_ba_06",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_06"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_07": {
    "canonicalId": "hwg_b2_ba_07",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_07"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_08": {
    "canonicalId": "hwg_b2_ba_08",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_08"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_09": {
    "canonicalId": "hwg_b2_ba_09",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_09"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_10": {
    "canonicalId": "hwg_b2_ba_10",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_10"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_11": {
    "canonicalId": "hwg_b2_ba_11",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_11"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_12": {
    "canonicalId": "hwg_b2_ba_12",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_12"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_13": {
    "canonicalId": "hwg_b2_ba_13",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_13"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_14": {
    "canonicalId": "hwg_b2_ba_14",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_14"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_15": {
    "canonicalId": "hwg_b2_ba_15",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_15"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_16": {
    "canonicalId": "hwg_b2_ba_16",
    "book": 2,
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_16"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_17": {
    "canonicalId": "hwg_b2_ba_17",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_17"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_18": {
    "canonicalId": "hwg_b2_ba_18",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_18"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_19": {
    "canonicalId": "hwg_b2_ba_19",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_19"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_20": {
    "canonicalId": "hwg_b2_ba_20",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_20"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_21": {
    "canonicalId": "hwg_b2_ba_21",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_21"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_22": {
    "canonicalId": "hwg_b2_ba_22",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_22"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_23": {
    "canonicalId": "hwg_b2_ba_23",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_23"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_24": {
    "canonicalId": "hwg_b2_ba_24",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_24"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_25": {
    "canonicalId": "hwg_b2_ba_25",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_25"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_26": {
    "canonicalId": "hwg_b2_ba_26",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_26"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_27": {
    "canonicalId": "hwg_b2_ba_27",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_27"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_28": {
    "canonicalId": "hwg_b2_ba_28",
    "book": 2,
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "legacyIds": [
      "hwg_b2_ba_28"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_29": {
    "canonicalId": "hwg_b2_ba_29",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_29"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_30": {
    "canonicalId": "hwg_b2_ba_30",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_30"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_31": {
    "canonicalId": "hwg_b2_ba_31",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_31"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_32": {
    "canonicalId": "hwg_b2_ba_32",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_32"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_33": {
    "canonicalId": "hwg_b2_ba_33",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_33"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_34": {
    "canonicalId": "hwg_b2_ba_34",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_34"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_35": {
    "canonicalId": "hwg_b2_ba_35",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_35"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_36": {
    "canonicalId": "hwg_b2_ba_36",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_36"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_37": {
    "canonicalId": "hwg_b2_ba_37",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_37"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_38": {
    "canonicalId": "hwg_b2_ba_38",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_38"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_39": {
    "canonicalId": "hwg_b2_ba_39",
    "book": 2,
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_39"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_40": {
    "canonicalId": "hwg_b2_ba_40",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_40"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_41": {
    "canonicalId": "hwg_b2_ba_41",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_41"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_42": {
    "canonicalId": "hwg_b2_ba_42",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_42"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_43": {
    "canonicalId": "hwg_b2_ba_43",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_43"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_44": {
    "canonicalId": "hwg_b2_ba_44",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_44"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_45": {
    "canonicalId": "hwg_b2_ba_45",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_45"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_46": {
    "canonicalId": "hwg_b2_ba_46",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_46"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_47": {
    "canonicalId": "hwg_b2_ba_47",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_47"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_48": {
    "canonicalId": "hwg_b2_ba_48",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_48"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_49": {
    "canonicalId": "hwg_b2_ba_49",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_49"
    ],
    "duplicateCount": 0
  },
  "hwg_b2_ba_50": {
    "canonicalId": "hwg_b2_ba_50",
    "book": 2,
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "legacyIds": [
      "hwg_b2_ba_50"
    ],
    "duplicateCount": 0
  },
  "hwg_b3_bb_01": {
    "canonicalId": "hwg_b3_bb_01",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b3_bb_02": {
    "canonicalId": "hwg_b3_bb_02",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b3_bb_03": {
    "canonicalId": "hwg_b3_bb_03",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b3_bb_04": {
    "canonicalId": "hwg_b3_bb_04",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b3_bb_05": {
    "canonicalId": "hwg_b3_bb_05",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_06": {
    "canonicalId": "hwg_b3_bb_06",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_07": {
    "canonicalId": "hwg_b3_bb_07",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_08": {
    "canonicalId": "hwg_b3_bb_08",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_09": {
    "canonicalId": "hwg_b3_bb_09",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_10": {
    "canonicalId": "hwg_b3_bb_10",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_11": {
    "canonicalId": "hwg_b3_bb_11",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_12": {
    "canonicalId": "hwg_b3_bb_12",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_13": {
    "canonicalId": "hwg_b3_bb_13",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_14": {
    "canonicalId": "hwg_b3_bb_14",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_15": {
    "canonicalId": "hwg_b3_bb_15",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_16": {
    "canonicalId": "hwg_b3_bb_16",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_17": {
    "canonicalId": "hwg_b3_bb_17",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_18": {
    "canonicalId": "hwg_b3_bb_18",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_19": {
    "canonicalId": "hwg_b3_bb_19",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_20": {
    "canonicalId": "hwg_b3_bb_20",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_21": {
    "canonicalId": "hwg_b3_bb_21",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_22": {
    "canonicalId": "hwg_b3_bb_22",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_23": {
    "canonicalId": "hwg_b3_bb_23",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_24": {
    "canonicalId": "hwg_b3_bb_24",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_25": {
    "canonicalId": "hwg_b3_bb_25",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_26": {
    "canonicalId": "hwg_b3_bb_26",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b3_bb_27": {
    "canonicalId": "hwg_b3_bb_27",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_28": {
    "canonicalId": "hwg_b3_bb_28",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_29": {
    "canonicalId": "hwg_b3_bb_29",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_30": {
    "canonicalId": "hwg_b3_bb_30",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_31": {
    "canonicalId": "hwg_b3_bb_31",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_32": {
    "canonicalId": "hwg_b3_bb_32",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_33": {
    "canonicalId": "hwg_b3_bb_33",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_34": {
    "canonicalId": "hwg_b3_bb_34",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_35": {
    "canonicalId": "hwg_b3_bb_35",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_36": {
    "canonicalId": "hwg_b3_bb_36",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_37": {
    "canonicalId": "hwg_b3_bb_37",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_38": {
    "canonicalId": "hwg_b3_bb_38",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_39": {
    "canonicalId": "hwg_b3_bb_39",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_40": {
    "canonicalId": "hwg_b3_bb_40",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_41": {
    "canonicalId": "hwg_b3_bb_41",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_42": {
    "canonicalId": "hwg_b3_bb_42",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_43": {
    "canonicalId": "hwg_b3_bb_43",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_44": {
    "canonicalId": "hwg_b3_bb_44",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_45": {
    "canonicalId": "hwg_b3_bb_45",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_46": {
    "canonicalId": "hwg_b3_bb_46",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_47": {
    "canonicalId": "hwg_b3_bb_47",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_48": {
    "canonicalId": "hwg_b3_bb_48",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b3_bb_49": {
    "canonicalId": "hwg_b3_bb_49",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b3_bb_50": {
    "canonicalId": "hwg_b3_bb_50",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b4_bb_01": {
    "canonicalId": "hwg_b4_bb_01",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b4_bb_02": {
    "canonicalId": "hwg_b4_bb_02",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b4_bb_03": {
    "canonicalId": "hwg_b4_bb_03",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b4_bb_04": {
    "canonicalId": "hwg_b4_bb_04",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b4_bb_05": {
    "canonicalId": "hwg_b4_bb_05",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_06": {
    "canonicalId": "hwg_b4_bb_06",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_07": {
    "canonicalId": "hwg_b4_bb_07",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_08": {
    "canonicalId": "hwg_b4_bb_08",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_09": {
    "canonicalId": "hwg_b4_bb_09",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_10": {
    "canonicalId": "hwg_b4_bb_10",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_11": {
    "canonicalId": "hwg_b4_bb_11",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_12": {
    "canonicalId": "hwg_b4_bb_12",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_13": {
    "canonicalId": "hwg_b4_bb_13",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_14": {
    "canonicalId": "hwg_b4_bb_14",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_15": {
    "canonicalId": "hwg_b4_bb_15",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_16": {
    "canonicalId": "hwg_b4_bb_16",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_17": {
    "canonicalId": "hwg_b4_bb_17",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_18": {
    "canonicalId": "hwg_b4_bb_18",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_19": {
    "canonicalId": "hwg_b4_bb_19",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_20": {
    "canonicalId": "hwg_b4_bb_20",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_21": {
    "canonicalId": "hwg_b4_bb_21",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_22": {
    "canonicalId": "hwg_b4_bb_22",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_23": {
    "canonicalId": "hwg_b4_bb_23",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_24": {
    "canonicalId": "hwg_b4_bb_24",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_25": {
    "canonicalId": "hwg_b4_bb_25",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_26": {
    "canonicalId": "hwg_b4_bb_26",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b4_bb_27": {
    "canonicalId": "hwg_b4_bb_27",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_28": {
    "canonicalId": "hwg_b4_bb_28",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_29": {
    "canonicalId": "hwg_b4_bb_29",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_30": {
    "canonicalId": "hwg_b4_bb_30",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_31": {
    "canonicalId": "hwg_b4_bb_31",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_32": {
    "canonicalId": "hwg_b4_bb_32",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_33": {
    "canonicalId": "hwg_b4_bb_33",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_34": {
    "canonicalId": "hwg_b4_bb_34",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_35": {
    "canonicalId": "hwg_b4_bb_35",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_36": {
    "canonicalId": "hwg_b4_bb_36",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_37": {
    "canonicalId": "hwg_b4_bb_37",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_38": {
    "canonicalId": "hwg_b4_bb_38",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_39": {
    "canonicalId": "hwg_b4_bb_39",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_40": {
    "canonicalId": "hwg_b4_bb_40",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_41": {
    "canonicalId": "hwg_b4_bb_41",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_42": {
    "canonicalId": "hwg_b4_bb_42",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_43": {
    "canonicalId": "hwg_b4_bb_43",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_44": {
    "canonicalId": "hwg_b4_bb_44",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_45": {
    "canonicalId": "hwg_b4_bb_45",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_46": {
    "canonicalId": "hwg_b4_bb_46",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_47": {
    "canonicalId": "hwg_b4_bb_47",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_48": {
    "canonicalId": "hwg_b4_bb_48",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b4_bb_49": {
    "canonicalId": "hwg_b4_bb_49",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b4_bb_50": {
    "canonicalId": "hwg_b4_bb_50",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b5_bc_01": {
    "canonicalId": "hwg_b5_bc_01",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b5_bc_02": {
    "canonicalId": "hwg_b5_bc_02",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b5_bc_03": {
    "canonicalId": "hwg_b5_bc_03",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b5_bc_04": {
    "canonicalId": "hwg_b5_bc_04",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b5_bc_05": {
    "canonicalId": "hwg_b5_bc_05",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_06": {
    "canonicalId": "hwg_b5_bc_06",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_07": {
    "canonicalId": "hwg_b5_bc_07",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_08": {
    "canonicalId": "hwg_b5_bc_08",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_09": {
    "canonicalId": "hwg_b5_bc_09",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_10": {
    "canonicalId": "hwg_b5_bc_10",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_11": {
    "canonicalId": "hwg_b5_bc_11",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_12": {
    "canonicalId": "hwg_b5_bc_12",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_13": {
    "canonicalId": "hwg_b5_bc_13",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_14": {
    "canonicalId": "hwg_b5_bc_14",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_15": {
    "canonicalId": "hwg_b5_bc_15",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_16": {
    "canonicalId": "hwg_b5_bc_16",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_17": {
    "canonicalId": "hwg_b5_bc_17",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_18": {
    "canonicalId": "hwg_b5_bc_18",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_19": {
    "canonicalId": "hwg_b5_bc_19",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_20": {
    "canonicalId": "hwg_b5_bc_20",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_21": {
    "canonicalId": "hwg_b5_bc_21",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_22": {
    "canonicalId": "hwg_b5_bc_22",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_23": {
    "canonicalId": "hwg_b5_bc_23",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_24": {
    "canonicalId": "hwg_b5_bc_24",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_25": {
    "canonicalId": "hwg_b5_bc_25",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_26": {
    "canonicalId": "hwg_b5_bc_26",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b5_bc_27": {
    "canonicalId": "hwg_b5_bc_27",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_28": {
    "canonicalId": "hwg_b5_bc_28",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_29": {
    "canonicalId": "hwg_b5_bc_29",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_30": {
    "canonicalId": "hwg_b5_bc_30",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_31": {
    "canonicalId": "hwg_b5_bc_31",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_32": {
    "canonicalId": "hwg_b5_bc_32",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_33": {
    "canonicalId": "hwg_b5_bc_33",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_34": {
    "canonicalId": "hwg_b5_bc_34",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_35": {
    "canonicalId": "hwg_b5_bc_35",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_36": {
    "canonicalId": "hwg_b5_bc_36",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_37": {
    "canonicalId": "hwg_b5_bc_37",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_38": {
    "canonicalId": "hwg_b5_bc_38",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_39": {
    "canonicalId": "hwg_b5_bc_39",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_40": {
    "canonicalId": "hwg_b5_bc_40",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_41": {
    "canonicalId": "hwg_b5_bc_41",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_42": {
    "canonicalId": "hwg_b5_bc_42",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_43": {
    "canonicalId": "hwg_b5_bc_43",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_44": {
    "canonicalId": "hwg_b5_bc_44",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_45": {
    "canonicalId": "hwg_b5_bc_45",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_46": {
    "canonicalId": "hwg_b5_bc_46",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_47": {
    "canonicalId": "hwg_b5_bc_47",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_48": {
    "canonicalId": "hwg_b5_bc_48",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b5_bc_49": {
    "canonicalId": "hwg_b5_bc_49",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b5_bc_50": {
    "canonicalId": "hwg_b5_bc_50",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b6_bc_01": {
    "canonicalId": "hwg_b6_bc_01",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b6_bc_02": {
    "canonicalId": "hwg_b6_bc_02",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b6_bc_03": {
    "canonicalId": "hwg_b6_bc_03",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b6_bc_04": {
    "canonicalId": "hwg_b6_bc_04",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b6_bc_05": {
    "canonicalId": "hwg_b6_bc_05",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_06": {
    "canonicalId": "hwg_b6_bc_06",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_07": {
    "canonicalId": "hwg_b6_bc_07",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_08": {
    "canonicalId": "hwg_b6_bc_08",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_09": {
    "canonicalId": "hwg_b6_bc_09",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_10": {
    "canonicalId": "hwg_b6_bc_10",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_11": {
    "canonicalId": "hwg_b6_bc_11",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_12": {
    "canonicalId": "hwg_b6_bc_12",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_13": {
    "canonicalId": "hwg_b6_bc_13",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_14": {
    "canonicalId": "hwg_b6_bc_14",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_15": {
    "canonicalId": "hwg_b6_bc_15",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_16": {
    "canonicalId": "hwg_b6_bc_16",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_17": {
    "canonicalId": "hwg_b6_bc_17",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_18": {
    "canonicalId": "hwg_b6_bc_18",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_19": {
    "canonicalId": "hwg_b6_bc_19",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_20": {
    "canonicalId": "hwg_b6_bc_20",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_21": {
    "canonicalId": "hwg_b6_bc_21",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_22": {
    "canonicalId": "hwg_b6_bc_22",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_23": {
    "canonicalId": "hwg_b6_bc_23",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_24": {
    "canonicalId": "hwg_b6_bc_24",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_25": {
    "canonicalId": "hwg_b6_bc_25",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_26": {
    "canonicalId": "hwg_b6_bc_26",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b6_bc_27": {
    "canonicalId": "hwg_b6_bc_27",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_28": {
    "canonicalId": "hwg_b6_bc_28",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_29": {
    "canonicalId": "hwg_b6_bc_29",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_30": {
    "canonicalId": "hwg_b6_bc_30",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_31": {
    "canonicalId": "hwg_b6_bc_31",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_32": {
    "canonicalId": "hwg_b6_bc_32",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_33": {
    "canonicalId": "hwg_b6_bc_33",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_34": {
    "canonicalId": "hwg_b6_bc_34",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_35": {
    "canonicalId": "hwg_b6_bc_35",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_36": {
    "canonicalId": "hwg_b6_bc_36",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_37": {
    "canonicalId": "hwg_b6_bc_37",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_38": {
    "canonicalId": "hwg_b6_bc_38",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_39": {
    "canonicalId": "hwg_b6_bc_39",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_40": {
    "canonicalId": "hwg_b6_bc_40",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_41": {
    "canonicalId": "hwg_b6_bc_41",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_42": {
    "canonicalId": "hwg_b6_bc_42",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_43": {
    "canonicalId": "hwg_b6_bc_43",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_44": {
    "canonicalId": "hwg_b6_bc_44",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_45": {
    "canonicalId": "hwg_b6_bc_45",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_46": {
    "canonicalId": "hwg_b6_bc_46",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_47": {
    "canonicalId": "hwg_b6_bc_47",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_48": {
    "canonicalId": "hwg_b6_bc_48",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b6_bc_49": {
    "canonicalId": "hwg_b6_bc_49",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b6_bc_50": {
    "canonicalId": "hwg_b6_bc_50",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b7_bd_01": {
    "canonicalId": "hwg_b7_bd_01",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b7_bd_02": {
    "canonicalId": "hwg_b7_bd_02",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b7_bd_03": {
    "canonicalId": "hwg_b7_bd_03",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b7_bd_04": {
    "canonicalId": "hwg_b7_bd_04",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b7_bd_05": {
    "canonicalId": "hwg_b7_bd_05",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b7_bd_06": {
    "canonicalId": "hwg_b7_bd_06",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_07": {
    "canonicalId": "hwg_b7_bd_07",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_08": {
    "canonicalId": "hwg_b7_bd_08",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_09": {
    "canonicalId": "hwg_b7_bd_09",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_10": {
    "canonicalId": "hwg_b7_bd_10",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_11": {
    "canonicalId": "hwg_b7_bd_11",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_12": {
    "canonicalId": "hwg_b7_bd_12",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_13": {
    "canonicalId": "hwg_b7_bd_13",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_14": {
    "canonicalId": "hwg_b7_bd_14",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_15": {
    "canonicalId": "hwg_b7_bd_15",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_16": {
    "canonicalId": "hwg_b7_bd_16",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_17": {
    "canonicalId": "hwg_b7_bd_17",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_18": {
    "canonicalId": "hwg_b7_bd_18",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_19": {
    "canonicalId": "hwg_b7_bd_19",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_20": {
    "canonicalId": "hwg_b7_bd_20",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_21": {
    "canonicalId": "hwg_b7_bd_21",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_22": {
    "canonicalId": "hwg_b7_bd_22",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_23": {
    "canonicalId": "hwg_b7_bd_23",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_24": {
    "canonicalId": "hwg_b7_bd_24",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_25": {
    "canonicalId": "hwg_b7_bd_25",
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b7_bd_26": {
    "canonicalId": "hwg_b7_bd_26",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_27": {
    "canonicalId": "hwg_b7_bd_27",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_28": {
    "canonicalId": "hwg_b7_bd_28",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_29": {
    "canonicalId": "hwg_b7_bd_29",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_30": {
    "canonicalId": "hwg_b7_bd_30",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_31": {
    "canonicalId": "hwg_b7_bd_31",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_32": {
    "canonicalId": "hwg_b7_bd_32",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_33": {
    "canonicalId": "hwg_b7_bd_33",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_34": {
    "canonicalId": "hwg_b7_bd_34",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_35": {
    "canonicalId": "hwg_b7_bd_35",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_36": {
    "canonicalId": "hwg_b7_bd_36",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_37": {
    "canonicalId": "hwg_b7_bd_37",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_38": {
    "canonicalId": "hwg_b7_bd_38",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_39": {
    "canonicalId": "hwg_b7_bd_39",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_40": {
    "canonicalId": "hwg_b7_bd_40",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_41": {
    "canonicalId": "hwg_b7_bd_41",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_42": {
    "canonicalId": "hwg_b7_bd_42",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_43": {
    "canonicalId": "hwg_b7_bd_43",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_44": {
    "canonicalId": "hwg_b7_bd_44",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_45": {
    "canonicalId": "hwg_b7_bd_45",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_46": {
    "canonicalId": "hwg_b7_bd_46",
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_47": {
    "canonicalId": "hwg_b7_bd_47",
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b7_bd_48": {
    "canonicalId": "hwg_b7_bd_48",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b7_bd_49": {
    "canonicalId": "hwg_b7_bd_49",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b7_bd_50": {
    "canonicalId": "hwg_b7_bd_50",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b8_bd_01": {
    "canonicalId": "hwg_b8_bd_01",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b8_bd_02": {
    "canonicalId": "hwg_b8_bd_02",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b8_bd_03": {
    "canonicalId": "hwg_b8_bd_03",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b8_bd_04": {
    "canonicalId": "hwg_b8_bd_04",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b8_bd_05": {
    "canonicalId": "hwg_b8_bd_05",
    "primaryScope": "Starter",
    "scopes": [
      "Starter"
    ],
    "clones": []
  },
  "hwg_b8_bd_06": {
    "canonicalId": "hwg_b8_bd_06",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_07": {
    "canonicalId": "hwg_b8_bd_07",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_08": {
    "canonicalId": "hwg_b8_bd_08",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_09": {
    "canonicalId": "hwg_b8_bd_09",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_10": {
    "canonicalId": "hwg_b8_bd_10",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_11": {
    "canonicalId": "hwg_b8_bd_11",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_12": {
    "canonicalId": "hwg_b8_bd_12",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_13": {
    "canonicalId": "hwg_b8_bd_13",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_14": {
    "canonicalId": "hwg_b8_bd_14",
    "primaryScope": "Unit 1",
    "scopes": [
      "Unit 1",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_15": {
    "canonicalId": "hwg_b8_bd_15",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_16": {
    "canonicalId": "hwg_b8_bd_16",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_17": {
    "canonicalId": "hwg_b8_bd_17",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_18": {
    "canonicalId": "hwg_b8_bd_18",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_19": {
    "canonicalId": "hwg_b8_bd_19",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_20": {
    "canonicalId": "hwg_b8_bd_20",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_21": {
    "canonicalId": "hwg_b8_bd_21",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_22": {
    "canonicalId": "hwg_b8_bd_22",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_23": {
    "canonicalId": "hwg_b8_bd_23",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_24": {
    "canonicalId": "hwg_b8_bd_24",
    "primaryScope": "Unit 2",
    "scopes": [
      "Unit 2",
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_25": {
    "canonicalId": "hwg_b8_bd_25",
    "primaryScope": "Review 1",
    "scopes": [
      "Review 1"
    ],
    "clones": []
  },
  "hwg_b8_bd_26": {
    "canonicalId": "hwg_b8_bd_26",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_27": {
    "canonicalId": "hwg_b8_bd_27",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_28": {
    "canonicalId": "hwg_b8_bd_28",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_29": {
    "canonicalId": "hwg_b8_bd_29",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_30": {
    "canonicalId": "hwg_b8_bd_30",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_31": {
    "canonicalId": "hwg_b8_bd_31",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_32": {
    "canonicalId": "hwg_b8_bd_32",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_33": {
    "canonicalId": "hwg_b8_bd_33",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_34": {
    "canonicalId": "hwg_b8_bd_34",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_35": {
    "canonicalId": "hwg_b8_bd_35",
    "primaryScope": "Unit 3",
    "scopes": [
      "Unit 3",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_36": {
    "canonicalId": "hwg_b8_bd_36",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_37": {
    "canonicalId": "hwg_b8_bd_37",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_38": {
    "canonicalId": "hwg_b8_bd_38",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_39": {
    "canonicalId": "hwg_b8_bd_39",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_40": {
    "canonicalId": "hwg_b8_bd_40",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_41": {
    "canonicalId": "hwg_b8_bd_41",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_42": {
    "canonicalId": "hwg_b8_bd_42",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_43": {
    "canonicalId": "hwg_b8_bd_43",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_44": {
    "canonicalId": "hwg_b8_bd_44",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_45": {
    "canonicalId": "hwg_b8_bd_45",
    "primaryScope": "Unit 4",
    "scopes": [
      "Unit 4",
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_46": {
    "canonicalId": "hwg_b8_bd_46",
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_47": {
    "canonicalId": "hwg_b8_bd_47",
    "primaryScope": "Review 2",
    "scopes": [
      "Review 2"
    ],
    "clones": []
  },
  "hwg_b8_bd_48": {
    "canonicalId": "hwg_b8_bd_48",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b8_bd_49": {
    "canonicalId": "hwg_b8_bd_49",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  },
  "hwg_b8_bd_50": {
    "canonicalId": "hwg_b8_bd_50",
    "primaryScope": "Festival",
    "scopes": [
      "Festival"
    ],
    "clones": []
  }
};

/**
 * 取得指定題號之 Canonical ID
 * @param {string} id 舊題號或標準題號
 * @returns {string}
 */
export function resolveCanonicalId(id) {
  if (!id) return id;
  return LEGACY_TO_CANONICAL_MAP[id] || id;
}

/**
 * 判定題號是否為 Canonical 題號
 * @param {string} id
 * @returns {boolean}
 */
export function isCanonicalId(id) {
  if (!id) return false;
  return Boolean(CANONICAL_META_MAP[id]);
}
