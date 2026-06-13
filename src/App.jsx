import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Mapa entre la sección interna (tab) y la URL pública (slug).
const TAB_TO_PATH = {
  home: "/",
  board: "/draft-board",
  coaches: "/entrenadores",
  teams: "/equipos",
  matchups: "/matchups",
  trades: "/intercambios",
  history: "/historico",
  activity: "/actividad",
  settings: "/configuracion",
};
const PATH_TO_TAB = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab])
);

// ============ DATOS DEL DRAFT POOL (mismos Pokémon y costos que la WDL) ============
const RAW = [
[10035,"Mega Charizard Y","fire,flying",20],
[10296,"Mega Floette","fairy",20],
[10038,"Mega Gengar","ghost,poison",20],
[1018,"Archaludon","steel,dragon",19],
[902,"Basculegion-Male","water,ghost",19],
[10285,"Mega Froslass","ice,ghost",19],
[903,"Sneasler","fighting,poison",19],
[547,"Whimsicott","grass,fairy",19],
[445,"Garchomp","dragon,ground",18],
[727,"Incineroar","fire,dark",18],
[10051,"Mega Gardevoir","psychic,fairy",18],
[10039,"Mega Kangaskhan","normal",18],
[1013,"Sinistcha","grass,ghost",18],
[142,"Aerodactyl","rock,flying",17],
[983,"Kingambit","dark,steel",17],
[10042,"Mega Aerodactyl","rock,flying",17],
[10036,"Mega Blastoise","water",17],
[10293,"Mega Delphox","fire,psychic",17],
[10049,"Mega Tyranitar","rock,dark",17],
[681,"Aegislash","steel,ghost",16],
[149,"Dragonite","dragon,flying",16],
[981,"Farigiraf","normal,psychic",16],
[925,"Maushold","normal",16],
[10321,"Mega Glimmora","rock,poison",16],
[10088,"Mega Lopunny","normal,fighting",16],
[279,"Pelipper","water,flying",16],
[248,"Tyranitar","rock,dark",16],
[637,"Volcarona","bug,fire",16],
[36,"Clefable","fairy",15],
[887,"Dragapult","dragon,ghost",15],
[10230,"Hisuian Arcanine","fire,rock",15],
[10034,"Mega Charizard X","fire,dragon",15],
[10281,"Mega Dragonite","dragon,flying",15],
[10059,"Mega Lucario","fighting,steel",15],
[10046,"Mega Scizor","bug,steel",15],
[10280,"Mega Starmie","water,psychic",15],
[730,"Primarina","water,fairy",15],
[700,"Sylveon","fairy",15],
[663,"Talonflame","fire,flying",15],
[324,"Torkoal","fire",15],
[10104,"Alolan Ninetales","ice,fairy",14],
[59,"Arcanine","fire",14],
[635,"Hydreigon","dark,dragon",14],
[784,"Kommo-o","dragon,fighting",14],
[10278,"Mega Clefable","fairy,flying",14],
[10058,"Mega Garchomp","dragon,ground",14],
[10041,"Mega Gyarados","water,dark",14],
[10282,"Mega Meganium","grass,fairy",14],
[10320,"Mega Scovillain","grass,fire",14],
[10033,"Mega Venusaur","grass,poison",14],
[350,"Milotic","water",14],
[10009,"Rotom-Wash","electric,water",14],
[823,"Corviknight","flying,steel",13],
[530,"Excadrill","ground,steel",13],
[970,"Glimmora","rock,poison",13],
[130,"Gyarados","water,flying",13],
[10287,"Mega Excadrill","ground,steel",13],
[186,"Politoed","water",13],
[3,"Venusaur","grass,poison",13],
[184,"Azumarill","water,fairy",12],
[10248,"Basculegion-Female","water,ghost",12],
[473,"Mamoswine","ice,ground",12],
[10037,"Mega Alakazam","psychic",12],
[10068,"Mega Gallade","psychic,fighting",12],
[10294,"Mega Greninja","water,dark",12],
[10054,"Mega Medicham","fighting,psychic",12],
[908,"Meowscarada","grass,dark",12],
[964,"Palafin","water",12],
[10008,"Rotom-Heat","electric,fire",12],
[752,"Araquanid","water,bug",11],
[10061,"Floette-Eternal","fairy",11],
[707,"Klefki","steel,fairy",11],
[10284,"Mega Skarmory","steel,flying",11],
[678,"Meowstic-Male","psychic",11],
[778,"Mimikyu","ghost,fairy",11],
[38,"Ninetales","fire",11],
[10252,"Paldean Tauros Aqua","fighting,water",11],
[10012,"Rotom-Mow","electric,grass",11],
[302,"Sableye","dark,ghost",11],
[212,"Scizor","bug,steel",11],
[959,"Tinkaton","fairy,steel",11],
[282,"Gardevoir","psychic,fairy",10],
[510,"Liepard","dark",10],
[10087,"Mega Camerupt","fire,ground",10],
[10313,"Mega Golurk","ground,ghost",10],
[10300,"Mega Hawlucha","fighting,flying",10],
[10055,"Mega Manectric","electric",10],
[765,"Oranguru","normal,psychic",10],
[26,"Raichu","electric",10],
[758,"Salazzle","poison,fire",10],
[666,"Vivillon","bug,flying",10],
[9,"Blastoise","water",9],
[858,"Hatterene","psychic,fairy",9],
[10239,"Hisuian Zoroark","normal,ghost",9],
[553,"Krookodile","ground,dark",9],
[10067,"Mega Altaria","dragon,fairy",9],
[10291,"Mega Chandelure","ghost,fire",9],
[10306,"Mega Chimecho","psychic,steel",9],
[10283,"Mega Feraligatr","water,dragon",9],
[10314,"Mega Meowstic","psychic",9],
[10066,"Mega Sableye","dark,ghost",9],
[715,"Noivern","flying,dragon",9],
[10251,"Paldean Tauros Blaze","fighting,fire",9],
[464,"Rhyperior","ground,rock",9],
[461,"Weavile","dark,ice",9],
[936,"Armarouge","fire,psychic",8],
[937,"Ceruledge","fire,ghost",8],
[475,"Gallade","psychic,fighting",8],
[94,"Gengar","ghost,poison",8],
[10233,"Hisuian Typhlosion","fire,ghost",8],
[10053,"Mega Aggron","steel",8],
[10292,"Mega Chesnaught","grass,fighting",8],
[10315,"Mega Crabominable","fighting,ice",8],
[10302,"Mega Drampa","normal,dragon",8],
[10286,"Mega Emboar","fire,fighting",8],
[10071,"Mega Slowbro","water,psychic",8],
[579,"Reuniclus","psychic",8],
[143,"Snorlax","normal",8],
[763,"Tsareena","grass",8],
[584,"Vanilluxe","ice",8],
[534,"Conkeldurr","fighting",7],
[395,"Empoleon","water,steel",7],
[196,"Espeon","psychic",7],
[671,"Florges","fairy",7],
[10165,"Galarian Slowbro","poison,psychic",7],
[658,"Greninja","water,dark",7],
[701,"Hawlucha","fighting,flying",7],
[392,"Infernape","fire,fighting",7],
[115,"Kangaskhan","normal",7],
[308,"Medicham","fighting,psychic",7],
[10047,"Mega Heracross","bug,fighting",7],
[10073,"Mega Pidgeot","normal,flying",7],
[10040,"Mega Pinsir","bug,flying",7],
[10070,"Mega Sharpedo","water,dark",7],
[10279,"Mega Victreebel","grass,poison",7],
[968,"Orthworm","steel",7],
[80,"Slowbro","water,psychic",7],
[199,"Slowking","water,psychic",7],
[899,"Wyrdeer","normal,psychic",7],
[460,"Abomasnow","grass,ice",6],
[683,"Aromatisse","fairy",6],
[609,"Chandelure","ghost,fire",6],
[660,"Diggersby","normal,ground",6],
[10172,"Galarian Slowking","poison,psychic",6],
[10242,"Hisuian Goodra","steel,dragon",6],
[1019,"Hydrapple","grass,dragon",6],
[900,"Kleavor","bug,rock",6],
[448,"Lucario","fighting,steel",6],
[10060,"Mega Abomasnow","grass,ice",6],
[10048,"Mega Houndoom","dark,fire",6],
[10072,"Mega Steelix","steel,ground",6],
[675,"Pangoro","fighting,dark",6],
[442,"Spiritomb","ghost,dark",6],
[571,"Zoroark","dark",6],
[65,"Alakazam","psychic",5],
[10100,"Alolan Raichu","electric,psychic",5],
[6,"Charizard","fire,flying",5],
[563,"Cofagrigus","ghost",5],
[655,"Delphox","fire,psychic",5],
[956,"Espathra","psychic",5],
[934,"Garganacl","rock",5],
[471,"Glaceon","ice",5],
[711,"Gourgeist","ghost,grass",5],
[450,"Hippowdon","ground",5],
[470,"Leafeon","grass",5],
[10152,"Lycanroc-Dusk","rock",5],
[10056,"Mega Banette","ghost",5],
[10090,"Mega Beedrill","bug,poison",5],
[750,"Mudsdale","ground",5],
[855,"Polteageist","ghost",5],
[914,"Quaquaval","water,fighting",5],
[867,"Runerigus","ground,ghost",5],
[497,"Serperior","grass",5],
[911,"Skeledirge","fire,ghost",5],
[157,"Typhlosion","fire",5],
[197,"Umbreon","dark",5],
[134,"Vaporeon","water",5],
[869,"Alcremie","fairy",4],
[939,"Bellibolt","electric",4],
[652,"Chesnaught","grass,fighting",4],
[693,"Clawitzer","water",4],
[132,"Ditto","normal",4],
[478,"Froslass","ice,ghost",4],
[623,"Golurk","ground,ghost",4],
[706,"Goodra","dragon",4],
[695,"Heliolisk","electric,normal",4],
[10244,"Hisuian Decidueye","grass,fighting",4],
[10236,"Hisuian Samurott","water,dark",4],
[135,"Jolteon","electric",4],
[405,"Luxray","electric",4],
[68,"Machamp","fighting",4],
[10057,"Mega Absol","dark",4],
[10045,"Mega Ampharos","electric,dragon",4],
[10074,"Mega Glalie","ice",4],
[409,"Rampardos","rock",4],
[407,"Roserade","grass,poison",4],
[10010,"Rotom-Frost","electric,ice",4],
[121,"Starmie","water,psychic",4],
[389,"Torterra","grass,ground",4],
[454,"Toxicroak","poison,fighting",4],
[697,"Tyrantrum","rock,dragon",4],
[531,"Audino","normal",3],
[699,"Aurorus","rock,ice",3],
[614,"Beartic","ice",3],
[740,"Crabominable","fighting,ice",3],
[724,"Decidueye","grass,ghost",3],
[780,"Drampa","normal,dragon",3],
[500,"Emboar","fire,fighting",3],
[160,"Feraligatr","water",3],
[841,"Flapple","grass,dragon",3],
[136,"Flareon","fire",3],
[472,"Gliscor","ground,flying",3],
[214,"Heracross","bug,fighting",3],
[745,"Lycanroc-Midday","rock",3],
[10069,"Mega Audino","normal,fairy",3],
[866,"Mr. Rime","ice,psychic",3],
[10250,"Paldean Tauros","fighting",3],
[766,"Passimian","fighting",3],
[952,"Scovillain","grass,fire",3],
[227,"Skarmory","steel,flying",3],
[748,"Toxapex","poison,water",3],
[709,"Trevenant","ghost,grass",3],
[71,"Victreebel","grass,poison",3],
[306,"Aggron","steel,rock",2],
[24,"Arbok","poison",2],
[168,"Ariados","bug,poison",2],
[411,"Bastiodon","rock,steel",2],
[10025,"Meowstic-Female","psychic",2],
[877,"Morpeko","electric,dark",2],
[479,"Rotom","electric,ghost",2],
[10011,"Rotom-Fan","electric,flying",2],
[844,"Sandaconda","ground",2],
[319,"Sharpedo","water,dark",2],
[685,"Slurpuff","fairy",2],
[208,"Steelix","steel,ground",2],
[128,"Tauros","normal",2],
[359,"Absol","dark",1],
[334,"Altaria","dragon,flying",1],
[181,"Ampharos","electric",1],
[842,"Appletun","grass,dragon",1],
[713,"Avalugg","ice",1],
[354,"Banette","ghost",1],
[15,"Beedrill","bug,poison",1],
[323,"Camerupt","fire,ground",1],
[351,"Castform","normal",1],
[358,"Chimecho","psychic",1],
[702,"Dedenne","electric,fairy",1],
[587,"Emolga","electric,flying",1],
[205,"Forretress","bug,steel",1],
[676,"Furfrou","normal",1],
[10180,"Galarian Stunfisk","ground,steel",1],
[569,"Garbodor","poison",1],
[362,"Glalie","ice",1],
[10243,"Hisuian Avalugg","ice,rock",1],
[229,"Houndoom","dark,fire",1],
[428,"Lopunny","normal",1],
[10126,"Lycanroc-Midnight","rock",1],
[310,"Manectric","electric",1],
[154,"Meganium","grass",1],
[18,"Pidgeot","normal,flying",1],
[25,"Pikachu","electric",1],
[127,"Pinsir","bug",1],
[503,"Samurott","water",1],
[516,"Simipour","water",1],
[512,"Simisage","grass",1],
[514,"Simisear","fire",1],
[618,"Stunfisk","ground,electric",1],
[733,"Toucannon","normal,flying",1],
[505,"Watchog","normal",1]
];
const POOL = RAW.map(([id, name, types, cost]) => ({ id, name, types: types.split(","), cost }));

const TYPE_COLORS = {
  normal:"#9099a1", fire:"#ff9d55", water:"#5090d6", electric:"#f4d23c",
  grass:"#63bc5a", ice:"#73cec0", fighting:"#ce4069", poison:"#ab6ac8",
  ground:"#d97845", flying:"#8fa8dd", psychic:"#fa7179", bug:"#91c12f",
  rock:"#c5b78c", ghost:"#5269ad", dragon:"#0b6dc3", dark:"#5a5366",
  steel:"#5a8ea1", fairy:"#ec8fe6"
};

// Valores por defecto de las reglas de la liga. Coinciden con los de la liga
// actual para no alterar nada al introducir la configuración.
// Contraseña/PIN de fábrica. Se usa para sembrar el primer administrador
// cuando una liga todavía no tiene lista de `admins`.
const EDIT_PASSWORD = "RDL2026!!";

// Máximo de entradas que se conservan en el registro de actividad.
// Al superarlo, se descartan las más antiguas.
const MAX_LOG = 100;

// Administradores por defecto. Se siembran la primera vez. El PIN del primero
// es la contraseña histórica para no romper el acceso de quien ya la conocía.
const DEFAULT_ADMINS = [
  { id: "admin1", name: "Admin 1", pin: EDIT_PASSWORD },
  { id: "admin2", name: "Admin 2", pin: "RDL2026#2" },
];

const DEFAULT_SETTINGS = {
  leagueName: "Liga Matachanchos",  // nombre de la liga (editable en Configuración)
  budget: 100,       // puntos a gastar por entrenador
  maxCoaches: 8,     // cantidad máxima de equipos a registrar
  maxPicks: 10,      // cantidad máxima de Pokémon a draftear por equipo
  maxTrade: 2,       // cantidad máxima de Pokémon que cada lado puede ceder en un intercambio
  admins: DEFAULT_ADMINS,  // lista de {id, name, pin} que pueden desbloquear la edición
  log: [],           // registro de actividad: lista de {ts, who, action}, máx. MAX_LOG
};

// Normaliza settings: si falta el campo o alguna clave, rellena con el default.
// Garantiza que `admins` nunca quede vacío (si lo está, resiembra los de fábrica).
function withSettings(state) {
  const s = state || {};
  const merged = { ...DEFAULT_SETTINGS, ...(s.settings || {}) };
  if (!Array.isArray(merged.admins) || merged.admins.length === 0) {
    merged.admins = DEFAULT_ADMINS;
  }
  if (!Array.isArray(merged.log)) merged.log = [];
  const out = { ...s, settings: merged };
  if (!Array.isArray(out.podiums)) out.podiums = [];
  return out;
}
const LOGO = "data:image/jpeg;base64,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";
const SHOWDOWN = {"10035": "charizard-megay", "10296": "floette", "10038": "gengar-mega", "1018": "archaludon", "902": "basculegion", "10285": "froslass", "903": "sneasler", "547": "whimsicott", "445": "garchomp", "727": "incineroar", "10051": "gardevoir-mega", "10039": "kangaskhan-mega", "1013": "sinistcha", "142": "aerodactyl", "983": "kingambit", "10042": "aerodactyl-mega", "10036": "blastoise-mega", "10293": "delphox", "10049": "tyranitar-mega", "681": "aegislash", "149": "dragonite", "981": "farigiraf", "925": "maushold", "10321": "glimmora", "10088": "lopunny-mega", "279": "pelipper", "248": "tyranitar", "637": "volcarona", "36": "clefable", "887": "dragapult", "10230": "arcanine-hisui", "10034": "charizard-megax", "10281": "dragonite", "10059": "lucario-mega", "10046": "scizor-mega", "10280": "starmie", "730": "primarina", "700": "sylveon", "663": "talonflame", "324": "torkoal", "10104": "ninetales-alola", "59": "arcanine", "635": "hydreigon", "784": "kommoo", "10278": "clefable", "10058": "garchomp-mega", "10041": "gyarados-mega", "10282": "meganium", "10320": "scovillain", "10033": "venusaur-mega", "350": "milotic", "10009": "rotom-wash", "823": "corviknight", "530": "excadrill", "970": "glimmora", "130": "gyarados", "10287": "megaexcadrill", "186": "politoed", "3": "venusaur", "184": "azumarill", "10248": "basculegion-f", "473": "mamoswine", "10037": "alakazam-mega", "10068": "gallade-mega", "10294": "greninja-ash", "10054": "medicham-mega", "908": "meowscarada", "964": "palafin", "10008": "rotom-heat", "752": "araquanid", "10061": "floette-eternal", "707": "klefki", "10284": "skarmory", "678": "meowstic", "778": "mimikyu", "38": "ninetales", "10252": "tauros-paldeaaqua", "10012": "rotom-mow", "302": "sableye", "212": "scizor", "959": "tinkaton", "282": "gardevoir", "510": "liepard", "10087": "camerupt-mega", "10313": "golurk", "10300": "hawlucha", "10055": "manectric-mega", "765": "oranguru", "26": "raichu", "758": "salazzle", "666": "vivillon", "9": "blastoise", "858": "hatterene", "10239": "zoroark-hisui", "553": "krookodile", "10067": "altaria-mega", "10291": "chandelure", "10306": "chimecho", "10283": "feraligatr", "10314": "meowstic", "10066": "sableye-mega", "715": "noivern", "10251": "tauros-paldeablaze", "464": "rhyperior", "461": "weavile", "936": "armarouge", "937": "ceruledge", "475": "gallade", "94": "gengar", "10233": "typhlosion-hisui", "10053": "aggron-mega", "10292": "chesnaught", "10315": "crabominable", "10302": "drampa", "10286": "emboar", "10071": "slowbro-mega", "579": "reuniclus", "143": "snorlax", "763": "tsareena", "584": "vanilluxe", "534": "conkeldurr", "395": "empoleon", "196": "espeon", "671": "florges", "10165": "slowbro-galar", "658": "greninja", "701": "hawlucha", "392": "infernape", "115": "kangaskhan", "308": "medicham", "10047": "heracross-mega", "10073": "pidgeot-mega", "10040": "pinsir-mega", "10070": "sharpedo-mega", "10279": "victreebel", "968": "orthworm", "80": "slowbro", "199": "slowking", "899": "wyrdeer", "460": "abomasnow", "683": "aromatisse", "609": "chandelure", "660": "diggersby", "10172": "slowking-galar", "10242": "goodra-hisui", "1019": "hydrapple", "900": "kleavor", "448": "lucario", "10060": "abomasnow-mega", "10048": "houndoom-mega", "10072": "steelix-mega", "675": "pangoro", "442": "spiritomb", "571": "zoroark", "65": "alakazam", "10100": "raichu-alola", "6": "charizard", "563": "cofagrigus", "655": "delphox", "956": "espathra", "934": "garganacl", "471": "glaceon", "711": "gourgeist", "450": "hippowdon", "470": "leafeon", "10152": "lycanroc-dusk", "10056": "banette-mega", "10090": "beedrill-mega", "750": "mudsdale", "855": "polteageist", "914": "quaquaval", "867": "runerigus", "497": "serperior", "911": "skeledirge", "157": "typhlosion", "197": "umbreon", "134": "vaporeon", "869": "alcremie", "939": "bellibolt", "652": "chesnaught", "693": "clawitzer", "132": "ditto", "478": "froslass", "623": "golurk", "706": "goodra", "695": "heliolisk", "10244": "decidueye-hisui", "10236": "samurott-hisui", "135": "jolteon", "405": "luxray", "68": "machamp", "10057": "absol-mega", "10045": "ampharos-mega", "10074": "glalie-mega", "409": "rampardos", "407": "roserade", "10010": "rotom-frost", "121": "starmie", "389": "torterra", "454": "toxicroak", "697": "tyrantrum", "531": "audino", "699": "aurorus", "614": "beartic", "740": "crabominable", "724": "decidueye", "780": "drampa", "500": "emboar", "160": "feraligatr", "841": "flapple", "136": "flareon", "472": "gliscor", "214": "heracross", "745": "lycanroc", "10069": "audino-mega", "866": "mrrime", "10250": "tauros-paldeacombat", "766": "passimian", "952": "scovillain", "227": "skarmory", "748": "toxapex", "709": "trevenant", "71": "victreebel", "306": "aggron", "24": "arbok", "168": "ariados", "411": "bastiodon", "10025": "meowstic-f", "877": "morpeko", "479": "rotom", "10011": "rotom-fan", "844": "sandaconda", "319": "sharpedo", "685": "slurpuff", "208": "steelix", "128": "tauros", "359": "absol", "334": "altaria", "181": "ampharos", "842": "appletun", "713": "avalugg", "354": "banette", "15": "beedrill", "323": "camerupt", "351": "castform", "358": "chimecho", "702": "dedenne", "587": "emolga", "205": "forretress", "676": "furfrou", "10180": "stunfisk-galar", "569": "garbodor", "362": "glalie", "10243": "avalugg-hisui", "229": "houndoom", "428": "lopunny", "10126": "lycanroc-midnight", "310": "manectric", "154": "meganium", "18": "pidgeot", "25": "pikachu", "127": "pinsir", "503": "samurott", "516": "simipour", "512": "simisage", "514": "simisear", "618": "stunfisk", "733": "toucannon", "505": "watchog"};

// ============ ALMACENAMIENTO COMPARTIDO (Supabase) ============
// Toda la liga vive en una sola fila (id = 'main') de la tabla `league`,
// en la columna `data` (tipo jsonb). Así todos ven y editan lo mismo.
const LEAGUE_ID = "main";
const blankState = () => ({ coaches: [], picks: {}, matches: [], trades: [], podiums: [], settings: { ...DEFAULT_SETTINGS } });

async function loadState() {
  try {
    const { data, error } = await supabase
      .from("league")
      .select("data")
      .eq("id", LEAGUE_ID)
      .maybeSingle();
    if (error) throw error;
    if (data && data.data) return withSettings(data.data);
  } catch (e) {
    console.error("No se pudo cargar la liga:", e);
  }
  return blankState();
}

async function saveState(state) {
  try {
    const { error } = await supabase
      .from("league")
      .upsert({ id: LEAGUE_ID, data: state, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    console.error("No se pudo guardar la liga:", e);
  }
}

// Escucha cambios en tiempo real de otros usuarios.
function subscribeState(onChange) {
  const channel = supabase
    .channel("league-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "league", filter: `id=eq.${LEAGUE_ID}` },
      payload => {
        const next = payload.new && payload.new.data;
        if (next) onChange(next);
      }
    )
    .subscribe();
  return channel;
}

const uid = () => Math.random().toString(36).slice(2, 9);

// Devuelve un Set con los IDs de Pokémon que un equipo recibió por intercambio
// (sea trade entre equipos o cambio con el pool). Se usa para marcarlos en la
// vista de equipos y en el campeón. Solo cuenta los que siguen en el roster.
function tradedInIds(state, coachId) {
  const ids = new Set();
  (state.trades || []).forEach(t => {
    if (t.kind === "pool") {
      if (t.coach === coachId) ids.add(t.in);
    } else {
      // En un swap, A recibe lo que cedió B y viceversa.
      if (t.a === coachId) (t.bGave || []).forEach(id => ids.add(id));
      if (t.b === coachId) (t.aGave || []).forEach(id => ids.add(id));
    }
  });
  const roster = new Set(state.picks[coachId] || []);
  return new Set([...ids].filter(id => roster.has(id)));
}


// Carga una imagen como promesa. Resuelve con el <img> o con null si falla.
// crossOrigin permite exportar el canvas sin "tintarlo" (taint).
function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Dibuja un podio (campeón, subcampeón, 3º) en un canvas y dispara la descarga
// como PNG. Recibe los datos ya resueltos para que sirva tanto al podio actual
// como a los guardados en el histórico. Cada place puede traer `picks` (ids).
async function downloadPodiumImage({ leagueName, ts, places }) {
  // places: array de { place:1|2|3, team, trainer, picks?:number[] }
  const W = 1080, H = 1320;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1a0c0d"); g.addColorStop(1, "#0a0708");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(194,22,26,0.10)";
  ctx.beginPath(); ctx.arc(W*0.5, H*1.05, 560, 0, Math.PI*2); ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#c2161a";
  ctx.font = "700 24px Oswald, Arial, sans-serif";
  ctx.fillText("🏆 PODIO DE LA TEMPORADA", W/2, 90);
  ctx.fillStyle = "#ece5e3";
  ctx.font = "700 56px Oswald, Arial, sans-serif";
  ctx.fillText((leagueName || "Liga").toUpperCase(), W/2, 155);
  ctx.fillStyle = "#8c7775";
  ctx.font = "400 26px Arial, sans-serif";
  let fecha = "";
  try { fecha = new Date(ts).toLocaleDateString("es", { day:"numeric", month:"long", year:"numeric" }); } catch {}
  ctx.fillText(fecha, W/2, 195);

  const baseY = 770;
  const slotW = 300;
  const positions = { 2: W/2 - slotW, 1: W/2, 3: W/2 + slotW };
  const heights = { 1: 230, 2: 160, 3: 115 };
  const colors = { 1: "#e2b53a", 2: "#c9c2bd", 3: "#c08a4a" };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

  // Pre-cargar todos los sprites de todos los equipos del podio.
  const spriteCache = {};
  await Promise.all(
    places.flatMap(pl => (pl.picks || []).map(async id => {
      if (spriteCache[id] !== undefined) return;
      spriteCache[id] = await loadImg(spriteUrl(id));
    }))
  );

  places.forEach(({ place, team, trainer }) => {
    const cx = positions[place];
    const h = heights[place];
    const top = baseY - h;
    ctx.textAlign = "center";
    ctx.fillStyle = colors[place];
    ctx.fillRect(cx - 135, top, 270, h);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(cx - 135, top, 270, 12);
    ctx.fillStyle = "#0a0708";
    ctx.font = "700 96px Oswald, Arial, sans-serif";
    ctx.fillText(String(place), cx, top + h/2 + 32);
    ctx.font = "64px Arial, sans-serif";
    ctx.fillText(medals[place], cx, top - 96);
    ctx.fillStyle = "#ece5e3";
    ctx.font = "700 32px Oswald, Arial, sans-serif";
    ctx.fillText(team || "—", cx, top - 44);
    ctx.fillStyle = "#8c7775";
    ctx.font = "400 24px Arial, sans-serif";
    ctx.fillText(trainer || "", cx, top - 12);
  });

  // Fila de sprites del equipo de cada puesto, bajo los bloques del podio.
  const rowY = baseY + 30;
  const rowH = 150;
  places.forEach(({ place, picks }) => {
    const cx = positions[place];
    const ids = (picks || []);
    if (!ids.length) return;
    // Rejilla compacta dentro del ancho del slot (~260px).
    const maxPerRow = 4;
    const cell = 54;
    const startX = cx - (Math.min(ids.length, maxPerRow) * cell) / 2 + cell/2;
    ids.slice(0, 8).forEach((id, idx) => {
      const col = idx % maxPerRow;
      const row = Math.floor(idx / maxPerRow);
      const x = startX + col * cell;
      const y = rowY + row * cell;
      const img = spriteCache[id];
      if (img) {
        ctx.drawImage(img, x - cell/2 + 4, y, cell - 8, cell - 8);
      } else {
        // Fallback: círculo con iniciales.
        ctx.fillStyle = "#241413";
        ctx.beginPath(); ctx.arc(x, y + (cell-8)/2, (cell-8)/2, 0, Math.PI*2); ctx.fill();
      }
    });
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "#5a3a3b";
  ctx.font = "400 20px Arial, sans-serif";
  ctx.fillText("Pokémon Draft League", W/2, H - 40);

  let url;
  try {
    url = canvas.toDataURL("image/png");
  } catch (e) {
    // Si algún sprite "tintó" el canvas (CORS), reintenta sin imágenes.
    alert("No se pudieron incrustar los sprites por restricciones del navegador. Se descargará el podio sin las imágenes de los Pokémon.");
    return downloadPodiumImageNoSprites({ leagueName, ts, places });
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = `podio-${(leagueName||"liga").replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.png`;
  document.body.appendChild(a); a.click(); a.remove();
}

// Variante sin sprites, usada como fallback si el canvas queda "tintado" por CORS.
function downloadPodiumImageNoSprites({ leagueName, ts, places }) {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1a0c0d"); g.addColorStop(1, "#0a0708");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#c2161a";
  ctx.font = "700 24px Oswald, Arial, sans-serif";
  ctx.fillText("🏆 PODIO DE LA TEMPORADA", W/2, 100);
  ctx.fillStyle = "#ece5e3";
  ctx.font = "700 56px Oswald, Arial, sans-serif";
  ctx.fillText((leagueName || "Liga").toUpperCase(), W/2, 165);
  ctx.fillStyle = "#8c7775";
  ctx.font = "400 26px Arial, sans-serif";
  let fecha = "";
  try { fecha = new Date(ts).toLocaleDateString("es", { day:"numeric", month:"long", year:"numeric" }); } catch {}
  ctx.fillText(fecha, W/2, 205);
  const baseY = 880, slotW = 300;
  const positions = { 2: W/2 - slotW, 1: W/2, 3: W/2 + slotW };
  const heights = { 1: 230, 2: 160, 3: 115 };
  const colors = { 1: "#e2b53a", 2: "#c9c2bd", 3: "#c08a4a" };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  places.forEach(({ place, team, trainer }) => {
    const cx = positions[place], h = heights[place], top = baseY - h;
    ctx.fillStyle = colors[place]; ctx.fillRect(cx - 135, top, 270, h);
    ctx.fillStyle = "#0a0708"; ctx.font = "700 96px Oswald, Arial, sans-serif";
    ctx.fillText(String(place), cx, top + h/2 + 32);
    ctx.font = "64px Arial, sans-serif"; ctx.fillText(medals[place], cx, top - 96);
    ctx.fillStyle = "#ece5e3"; ctx.font = "700 32px Oswald, Arial, sans-serif";
    ctx.fillText(team || "—", cx, top - 44);
    ctx.fillStyle = "#8c7775"; ctx.font = "400 24px Arial, sans-serif";
    ctx.fillText(trainer || "", cx, top - 12);
  });
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `podio-${(leagueName||"liga").replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.png`;
  document.body.appendChild(a); a.click(); a.remove();
}

function TypeBadge({ t }) {
  return <span style={{
    background: TYPE_COLORS[t] || "#777", color: "#fff", fontSize: 10,
    fontWeight: 700, padding: "2px 7px", borderRadius: 999, letterSpacing: ".04em",
    textTransform: "uppercase"
  }}>{t}</span>;
}

function initials(name) {
  if (!name) return "?";
  const clean = name.replace(/^(Mega|Alolan|Hisuian|Galarian|Paldean)\s+/i, "");
  const words = clean.trim().split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

// ============ SPRITE (imagen real + fallback al emblema) ============
// Fuera del artifact las imágenes externas SÍ cargan, así que usamos los
// sprites oficiales de PokeAPI. Si una imagen falla, mostramos el emblema SVG.
function spriteUrl(id) {
  // Sprite pixel-art clásico (Showdown) cuando lo conocemos; si no, PokeAPI.
  const slug = SHOWDOWN[String(id)];
  if (slug) return `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function Sprite({ id, name = "", size = 44, style = {} }) {
  const [failed, setFailed] = useState(false);
  const p = POOL.find(x => x.id === id);
  const pname = name || p?.name || "?";
  if (failed || !id) {
    return <EmblemSprite id={id} name={pname} size={size} style={style} />;
  }
  return (
    <img
      src={spriteUrl(id)}
      alt={pname}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        display: "block", flexShrink: 0, imageRendering: "pixelated",
        objectFit: "contain", ...style
      }}
    />
  );
}
function EmblemSprite({ id, name = "", size = 44, style = {} }) {
  const p = POOL.find(x => x.id === id);
  const pname = name || p?.name || "?";
  const types = p?.types || ["normal"];
  const c1 = TYPE_COLORS[types[0]] || "#9099a1";
  const c2 = TYPE_COLORS[types[1]] || c1;
  const u = `s${id}`;
  const ini = initials(pname);
  const fontSize = ini.length > 1 ? 26 : 32;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display:"block", flexShrink:0, ...style }} aria-label={pname}>
      <defs>
        {/* volumen de la mitad superior (color de tipo) */}
        <radialGradient id={`top${u}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={c1} stopOpacity="1" />
          <stop offset="65%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        {/* volumen de la mitad inferior (plata/blanco con sombra) */}
        <radialGradient id={`bot${u}`} cx="38%" cy="72%" r="80%">
          <stop offset="0%" stopColor="#f4f1ee" />
          <stop offset="70%" stopColor="#d8d2cd" />
          <stop offset="100%" stopColor="#a9a29c" />
        </radialGradient>
        {/* anillo metálico */}
        <linearGradient id={`ring${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3330" />
          <stop offset="50%" stopColor="#15100f" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        {/* clip esfera */}
        <clipPath id={`clip${u}`}><circle cx="50" cy="50" r="44" /></clipPath>
      </defs>

      {/* sombra/borde exterior */}
      <circle cx="50" cy="50" r="47" fill="rgba(0,0,0,0.45)" />

      <g clipPath={`url(#clip${u})`}>
        {/* mitad superior con color de tipo */}
        <rect x="0" y="0" width="100" height="50" fill={`url(#top${u})`} />
        {/* mitad inferior plateada */}
        <rect x="0" y="50" width="100" height="50" fill={`url(#bot${u})`} />
        {/* banda central */}
        <rect x="0" y="44" width="100" height="12" fill="#120d0c" />
        {/* brillo especular superior */}
        <ellipse cx="36" cy="24" rx="22" ry="12" fill="rgba(255,255,255,0.35)" />
        {/* sombra inferior interna para dar esfera */}
        <ellipse cx="50" cy="100" rx="50" ry="26" fill="rgba(0,0,0,0.22)" />
      </g>

      {/* aro metálico exterior */}
      <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#ring${u})`} strokeWidth="3" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* botón central con iniciales */}
      <circle cx="50" cy="50" r="15" fill="#1a1413" stroke="#0a0708" strokeWidth="2" />
      <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <text x="50" y="51" textAnchor="middle" dominantBaseline="central"
        fontFamily="'Oswald', sans-serif" fontWeight="700" fill="#fff"
        fontSize={fontSize}
        style={{ letterSpacing: "-0.5px" }}>
        {ini}
      </text>
    </svg>
  );
}

// ============ NAV ============
function Nav({ tab, setTab, unlocked }) {
  const tabs = [
    ["home", "Inicio"],
    ["board", "Draft Board"],
    ["coaches", "Entrenadores"],
    ["teams", "Equipos"],
    ["matchups", "Matchups"],
    ["trades", "Intercambios"],
    ["history", "Histórico"],
    ...(unlocked ? [["activity", "Actividad"], ["settings", "Configuración"]] : []),
  ];
  return (
    <nav style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:28 }}>
      {tabs.map(([k, label]) => (
        <a key={k} href={TAB_TO_PATH[k]} className="rl-display"
          onClick={(e) => {
            // Permite abrir en pestaña nueva con Ctrl/Cmd/click central.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            setTab(k);
          }}
          style={{
            background: tab===k ? "var(--accent)" : "transparent",
            color: tab===k ? "#fff" : "var(--ink-dim)",
            border: "1px solid " + (tab===k ? "var(--accent-soft)" : "var(--line)"),
            padding: "10px 20px", borderRadius: 9, fontWeight: 600, fontSize: 14,
            cursor: "pointer", fontFamily: "'Oswald',sans-serif", transition: "all .15s",
            letterSpacing: ".05em", textDecoration: "none", display: "inline-block",
            boxShadow: tab===k ? "0 4px 14px -4px rgba(194,22,26,0.6)" : "none"
          }}>{label}</a>
      ))}
    </nav>
  );
}

// ============ HOME ============
function Home({ state, setTab, unlocked, logAction }) {
  const cName = (id) => state.coaches.find(c=>c.id===id)?.team || "—";
  const cTrainer = (id) => state.coaches.find(c=>c.id===id)?.trainer || "";
  const leagueName = state.settings.leagueName || "Liga";

  const allMatches = state.matches || [];
  const isDoneM = (m) => m.final ? (m.sa>=3||m.sb>=3) : (m.sa>=2||m.sb>=2);
  const done = allMatches.filter(isDoneM);

  // Campeón: ganador de la final (si está reportada).
  const finalM = allMatches.find(m => m.final);
  const champion = finalM && isDoneM(finalM) ? (finalM.sa > finalM.sb ? finalM.a : finalM.b) : null;
  const runnerUp = finalM && isDoneM(finalM) ? (finalM.sa > finalM.sb ? finalM.b : finalM.a) : null;

  // Tabla regular (round-robin) para sacar el 3er lugar.
  const rr = allMatches.filter(m => !m.final);
  const standings = useMemo(() => {
    const t = {};
    state.coaches.forEach(c => t[c.id] = { id:c.id, sw:0, sl:0, gw:0, gl:0 });
    rr.forEach(m => {
      if (!isDoneM(m)) return;
      const A = t[m.a], B = t[m.b];
      if (!A || !B) return;
      A.gw += m.sa; A.gl += m.sb; B.gw += m.sb; B.gl += m.sa;
      if (m.sa > m.sb) { A.sw++; B.sl++; } else { B.sw++; A.sl++; }
    });
    return Object.values(t)
      .map(r => ({ ...r, diff: r.gw - r.gl }))
      .sort((x,y) => y.sw - x.sw || y.diff - x.diff || y.gw - x.gw);
  }, [state.matches, state.coaches]);

  // 3er lugar: el mejor de la tabla regular que no sea campeón ni subcampeón.
  const third = champion
    ? (standings.find(s => s.id !== champion && s.id !== runnerUp)?.id || null)
    : null;

  // El podio existe cuando hay final reportada.
  const podium = champion ? [champion, runnerUp, third].filter(Boolean) : [];

  // Últimos 6 partidos reportados (round-robin, sin contar la final), ordenados
  // del más reciente al más antiguo según el sello de tiempo de cuando se decidió.
  const recentMatches = allMatches
    .filter(m => !m.final && isDoneM(m))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 6);

  const fmtDate = (ts) => {
    if (!ts) return "";
    try { return new Date(ts).toLocaleDateString("es", { day:"numeric", month:"short" }); }
    catch { return ""; }
  };
  const fmtFull = (ts) => {
    try { return new Date(ts).toLocaleDateString("es", { day:"numeric", month:"long", year:"numeric" }); }
    catch { return ""; }
  };

  // ----- Guardado AUTOMÁTICO del podio en el histórico -----
  // Firma única de este podio: incluye el id de la final, de modo que una nueva
  // temporada (final nueva tras reiniciar) genere un podio distinto aunque
  // coincidan liga y puestos.
  const podiumKey = champion ? `${finalM?.id}|${leagueName}|${champion}|${runnerUp}|${third}` : null;
  const alreadySaved = (state.podiums || []).some(p => p.key === podiumKey);

  useEffect(() => {
    if (!champion || !podiumKey || alreadySaved) return;
    const entry = {
      id: uid(),
      key: podiumKey,
      ts: Date.now(),
      hidden: false,
      leagueName,
      champion, runnerUp, third,
      // Guardamos nombres y rosters por si después se editan/borran equipos o se reinicia la liga.
      names: {
        [champion]: { team: cName(champion), trainer: cTrainer(champion) },
        ...(runnerUp ? { [runnerUp]: { team: cName(runnerUp), trainer: cTrainer(runnerUp) } } : {}),
        ...(third ? { [third]: { team: cName(third), trainer: cTrainer(third) } } : {}),
      },
      picks: {
        [champion]: [...(state.picks[champion] || [])],
        ...(runnerUp ? { [runnerUp]: [...(state.picks[runnerUp] || [])] } : {}),
        ...(third ? { [third]: [...(state.picks[third] || [])] } : {}),
      },
    };
    setState(s => {
      // Re-chequeo dentro del setState por si otro cliente ya lo guardó.
      if ((s.podiums || []).some(p => p.key === podiumKey)) return s;
      return { ...s, podiums: [entry, ...(s.podiums || [])] };
    });
    logAction?.(`Podio de «${leagueName}» guardado en el histórico`);
  }, [podiumKey, alreadySaved]);

  // ----- Descargar el podio como imagen (canvas, sin librerías) -----
  const downloadPodium = () => {
    const places = [
      { place: 1, team: cName(champion), trainer: cTrainer(champion), picks: state.picks[champion] || [] },
      ...(runnerUp ? [{ place: 2, team: cName(runnerUp), trainer: cTrainer(runnerUp), picks: state.picks[runnerUp] || [] }] : []),
      ...(third ? [{ place: 3, team: cName(third), trainer: cTrainer(third), picks: state.picks[third] || [] }] : []),
    ];
    downloadPodiumImage({ leagueName, ts: Date.now(), places });
  };

  const ResultCard = (m) => {
    const winA = m.sa > m.sb;
    const reported = isDoneM(m);
    return (
      <div key={m.id} style={{
        background:"var(--panel)", border:"1px solid " + (m.final?"var(--accent)":"var(--line)"),
        borderRadius:12, padding:"12px 16px", display:"grid",
        gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:10,
        opacity: reported ? 1 : 0.6
      }}>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontWeight:700, color: reported&&winA?"var(--accent)":"var(--ink)" }}>{cName(m.a)} {reported&&winA&&"🏆"}</div>
          <div style={{ fontSize:11, color:"var(--ink-dim)" }}>{cTrainer(m.a)}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div className="rl-display" style={{ fontWeight:800, fontSize:22, lineHeight:1 }}>{m.sa}–{m.sb}</div>
          <div style={{ fontSize:10, color:"var(--ink-dim)", textTransform:"uppercase", letterSpacing:".05em", marginTop:2 }}>
            {reported ? (m.final ? "Final" : "Bo3") : "Pendiente"}{m.ts ? " · "+fmtDate(m.ts) : ""}
          </div>
        </div>
        <div>
          <div style={{ fontWeight:700, color: reported&&!winA?"var(--accent)":"var(--ink)" }}>{reported&&!winA&&"🏆"} {cName(m.b)}</div>
          <div style={{ fontSize:11, color:"var(--ink-dim)" }}>{cTrainer(m.b)}</div>
        </div>
      </div>
    );
  };

  // Bloque visual de una posición del podio (con su equipo).
  const PodiumPlace = ({ id, place }) => {
    const traded = tradedInIds(state, id);
    const medal = place===1?"🥇":place===2?"🥈":"🥉";
    const label = place===1?"Campeón":place===2?"Subcampeón":"3er lugar";
    const mons = (state.picks[id] || []).map(x=>POOL.find(p=>p.id===x)).filter(Boolean).sort((a,b)=>b.cost-a.cost);
    return (
      <div style={{
        background: place===1 ? "linear-gradient(135deg, #2a0d0e 0%, #16100f 60%)" : "var(--panel)",
        border:"1px solid " + (place===1?"var(--accent)":"var(--line)"), borderRadius:16, padding:"20px 18px", textAlign:"center"
      }}>
        <div style={{ fontSize: place===1?44:34, lineHeight:1 }}>{medal}</div>
        <div className="rl-display" style={{ color:"var(--silver-dim)", fontSize:11, letterSpacing:".18em", marginTop:6, fontWeight:600 }}>{label}</div>
        <div className="rl-display" style={{ fontSize: place===1?30:22, fontWeight:700, color: place===1?"var(--accent)":"var(--silver)", lineHeight:1.05, margin:"4px 0 2px" }}>{cName(id)}</div>
        <div style={{ color:"var(--silver)", fontSize:13 }}>{cTrainer(id)}</div>
        {mons.length>0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginTop:12 }}>
            {mons.map(p => {
              const wasTraded = traded.has(p.id);
              return (
                <div key={p.id} title={`${p.name} · ${p.cost} pts${wasTraded?" · llegó por intercambio":""}`} style={{
                  position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                  background:"rgba(0,0,0,0.3)", border:"1px solid " + (wasTraded?"var(--accent)":"rgba(255,255,255,0.08)"),
                  borderRadius:10, padding:"6px 8px", minWidth:52
                }}>
                  {wasTraded && <span style={{ position:"absolute", top:-6, right:-6, fontSize:9, fontWeight:800, color:"#fff", background:"var(--accent)", borderRadius:999, padding:"1px 5px" }}>⇄</span>}
                  <Sprite id={p.id} name={p.name} size={40} />
                  <span style={{ fontSize:9, color:"var(--silver)", fontWeight:600, textAlign:"center", lineHeight:1.1 }}>{p.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <SectionTitle title="Inicio" sub="Resumen de la liga y los últimos resultados reportados." />

      {/* PODIO */}
      {champion && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:10 }}>
            <div className="rl-display" style={{ fontSize:18, fontWeight:700, color:"var(--silver)" }}>🏆 Podio · {leagueName}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={downloadPodium} style={btnGhost}>⬇ Descargar imagen</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns: podium.length>=3?"1fr 1.15fr 1fr":"repeat(auto-fit, minmax(220px,1fr))", gap:14, alignItems:"start" }}>
            {/* orden visual: 2 - 1 - 3 cuando hay 3 */}
            {podium.length>=3
              ? <>
                  <PodiumPlace id={runnerUp} place={2} />
                  <PodiumPlace id={champion} place={1} />
                  <PodiumPlace id={third} place={3} />
                </>
              : podium.map((id,i) => <PodiumPlace key={id} id={id} place={i+1} />)}
          </div>
          <div style={{ textAlign:"center", color:"var(--ink-dim)", fontSize:13, marginTop:10 }}>
            Final ganada {Math.max(finalM.sa, finalM.sb)}–{Math.min(finalM.sa, finalM.sb)}
          </div>
        </div>
      )}

      {/* tarjetas resumen */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))", gap:12, marginBottom:28 }}>
        <StatCard label="Entrenadores" value={state.coaches.length} onClick={()=>setTab("coaches")} />
        <StatCard label="Series jugadas" value={done.filter(m=>!m.final).length} onClick={()=>setTab("matchups")} />
        <StatCard label="Pokémon drafteados" value={Object.values(state.picks||{}).reduce((n,a)=>n+a.length,0)} onClick={()=>setTab("board")} />
      </div>

      {/* últimos resultados reportados */}
      <div className="rl-display" style={{ fontSize:18, fontWeight:700, margin:"0 0 14px", color:"var(--silver)" }}>
        Últimos resultados
      </div>
      {recentMatches.length===0
        ? <Empty msg="Todavía no hay resultados reportados. Ve a «Matchups» para empezar." />
        : <div style={{ display:"grid", gap:10 }}>
            {recentMatches.map(ResultCard)}
          </div>}

      {/* final reportada también visible aquí */}
      {finalM && isDoneM(finalM) && (
        <>
          <div className="rl-display" style={{ fontSize:18, fontWeight:700, margin:"24px 0 14px", color:"var(--silver)" }}>Final</div>
          <div style={{ display:"grid", gap:10 }}>{ResultCard(finalM)}</div>
        </>
      )}

      <Rules state={state} />
    </div>
  );
}

// Reglas de la liga (adaptadas de la WDL con nuestras condiciones).
function Rules({ state }) {
  const H = ({ children }) => (
    <h3 className="rl-display" style={{ fontSize:20, fontWeight:700, margin:"28px 0 10px", color:"var(--silver)", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ width:5, height:20, background:"var(--accent)", borderRadius:2 }} />{children}
    </h3>
  );
  const P = ({ children }) => <p style={{ margin:"0 0 12px", color:"var(--ink)", fontSize:14, lineHeight:1.65 }}>{children}</p>;
  const Li = ({ children }) => (
    <li style={{ color:"var(--ink)", fontSize:14, lineHeight:1.6, marginBottom:8 }}>{children}</li>
  );
  return (
    <div style={{ marginTop:40, borderTop:"1px solid var(--line)", paddingTop:8 }}>
      <SectionTitle title="Reglas" sub="Cómo funciona la Draft League Matachanchos." />

      <P>
        Una Draft League de Pokémon es un torneo inspirado en el fantasy football. Cada
        entrenador draftea un equipo de Pokémon únicos desde un fondo compartido (el «Draft
        Board») y compite usando solamente los Pokémon que eligió.
      </P>

      {/* números clave */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px,1fr))", gap:12, margin:"18px 0 4px" }}>
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"16px", textAlign:"center" }}>
          <div className="rl-display" style={{ fontSize:30, fontWeight:700, color:"var(--accent)", lineHeight:1 }}>100</div>
          <div style={{ color:"var(--ink-dim)", fontSize:12, marginTop:4 }}>Puntos de presupuesto</div>
        </div>
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"16px", textAlign:"center" }}>
          <div className="rl-display" style={{ fontSize:30, fontWeight:700, color:"var(--accent)", lineHeight:1 }}>Bo3</div>
          <div style={{ color:"var(--ink-dim)", fontSize:12, marginTop:4 }}>Series fase regular</div>
        </div>
        <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"16px", textAlign:"center" }}>
          <div className="rl-display" style={{ fontSize:30, fontWeight:700, color:"var(--accent)", lineHeight:1 }}>Bo5</div>
          <div style={{ color:"var(--ink-dim)", fontSize:12, marginTop:4 }}>La gran final</div>
        </div>
      </div>

      <H>El draft</H>
      <ul style={{ margin:"0 0 12px", paddingLeft:20 }}>
        <Li>Cada entrenador empieza con un presupuesto de <strong>{state.settings.budget} puntos</strong> para draftear un equipo de hasta <strong>{state.settings.maxPicks} Pokémon</strong> desde el Draft Board.</Li>
        <Li>Cada Pokémon tiene un costo según su poder y viabilidad competitiva: los más fuertes cuestan más.</Li>
        <Li>Un Pokémon drafteado <strong>no se puede repetir</strong>: una vez que alguien lo elige, queda fuera del fondo para los demás.</Li>
        <Li>Solo puedes batallar con los Pokémon que drafteaste. Los rosters quedan fijos durante la temporada.</Li>
      </ul>

      <H>Fase regular · Round-robin</H>
      <ul style={{ margin:"0 0 12px", paddingLeft:20 }}>
        <Li><strong>Todos contra todos:</strong> cada entrenador se enfrenta una vez contra cada uno de los demás.</Li>
        <Li>Cada enfrentamiento es una serie <strong>al mejor de 3 (Bo3)</strong>: gana quien llegue primero a 2 victorias.</Li>
        <Li>La <strong>tabla de posiciones</strong> ordena por series ganadas; en caso de empate, decide la <strong>diferencia de juegos</strong> (juegos ganados menos perdidos).</Li>
        <Li><strong>Ajustes entre rondas:</strong> entre una ronda y otra puedes modificar libremente los <strong>movimientos, habilidades, objetos, naturalezas, EVs/IVs, etc.</strong> de tus Pokémon. Sin embargo, <strong>dentro de una misma serie (entre los games de una ronda) la configuración queda fija</strong> y no se puede cambiar.</Li>
      </ul>

      <H>La final</H>
      <ul style={{ margin:"0 0 12px", paddingLeft:20 }}>
        <Li>Al terminar todas las rondas, los <strong>dos primeros</strong> de la tabla disputan la final.</Li>
        <Li>La final es una serie <strong>al mejor de 5 (Bo5)</strong>: gana quien llegue primero a 3 victorias.</Li>
        <Li><strong>Ventaja del líder:</strong> el equipo que llega como <strong>1º de la tabla arranca la final ganando 1-0</strong>, como premio por su desempeño en la fase regular.</Li>
      </ul>

      <H>Traspasos · Mitad de temporada</H>
      <ul style={{ margin:"0 0 12px", paddingLeft:20 }}>
        <Li>A la <strong>mitad del torneo</strong> se abre una ventana de intercambios.</Li>
        <Li>Cada entrenador puede cambiar <strong>hasta 2 Pokémon</strong> de su equipo con otro entrenador que esté de acuerdo en hacer el intercambio.</Li>
        <Li>Los traspasos quedan registrados en la sección <strong>«Intercambios»</strong> para que toda la liga pueda verlos.</Li>
      </ul>

      <H>Edición y permisos</H>
      <ul style={{ margin:"0 0 12px", paddingLeft:20 }}>
        <Li>La liga es de visualización abierta: cualquiera puede consultar el draft, los equipos, los matchups y la tabla.</Li>
        <Li>Para <strong>editar</strong> (registrar entrenadores, draftear, generar el calendario o reportar resultados) hay que desbloquear el modo edición con la contraseña, usando el botón 🔒 de la cabecera.</Li>
      </ul>

      <P>
        <span style={{ color:"var(--ink-dim)" }}>
          Formato inspirado en la Wolfey Draft League, adaptado para la liga Matachanchos.
        </span>
      </P>
    </div>
  );
}
function StatCard({ label, value, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14,
      padding:"18px 16px", cursor:"pointer", transition:"border-color .15s"
    }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="var(--line)"}
    >
      <div className="rl-display" style={{ fontSize:34, fontWeight:700, color:"var(--accent)", lineHeight:1 }}>{value}</div>
      <div style={{ color:"var(--ink-dim)", fontSize:13, marginTop:4 }}>{label}</div>
    </div>
  );
}

// ============ ENTRENADORES ============
function Coaches({ state, setState, unlocked, logAction }) {
  const [trainer, setTrainer] = useState("");
  const [team, setTeam] = useState("");
  // edición inline
  const [editId, setEditId] = useState(null);
  const [editTrainer, setEditTrainer] = useState("");
  const [editTeam, setEditTeam] = useState("");

  const maxCoaches = state.settings.maxCoaches;
  const budget = state.settings.budget;

  const add = () => {
    if (!trainer.trim() || !team.trim()) return;
    if (state.coaches.length >= maxCoaches) {
      alert(`La liga permite un máximo de ${maxCoaches} equipos. Puedes cambiar este límite en Configuración.`);
      return;
    }
    const c = { id: uid(), trainer: trainer.trim(), team: team.trim() };
    setState(s => ({ ...s, coaches: [...s.coaches, c] }));
    logAction?.(`Registró al entrenador «${c.trainer}» (${c.team})`);
    setTrainer(""); setTeam("");
  };
  const remove = (id) => {
    if (!confirm("¿Eliminar este entrenador? Se borrarán también sus picks y partidos.")) return;
    const c = state.coaches.find(c => c.id === id);
    setState(s => {
      const picks = { ...s.picks }; delete picks[id];
      return {
        ...s,
        coaches: s.coaches.filter(c => c.id !== id),
        picks,
        matches: s.matches.filter(m => m.a !== id && m.b !== id),
      };
    });
    logAction?.(`Eliminó al entrenador «${c?.trainer || ""}» (${c?.team || ""})`);
  };
  const startEdit = (c) => {
    setEditId(c.id); setEditTrainer(c.trainer); setEditTeam(c.team);
  };
  const cancelEdit = () => {
    setEditId(null); setEditTrainer(""); setEditTeam("");
  };
  const saveEdit = (id) => {
    if (!editTrainer.trim() || !editTeam.trim()) { alert("El nombre del entrenador y del equipo no pueden quedar vacíos."); return; }
    setState(s => ({
      ...s,
      coaches: s.coaches.map(c =>
        c.id === id ? { ...c, trainer: editTrainer.trim(), team: editTeam.trim() } : c
      ),
    }));
    logAction?.(`Editó al entrenador «${editTrainer.trim()}» (${editTeam.trim()})`);
    cancelEdit();
  };

  return (
    <div>
      <SectionTitle title="Entrenadores" sub={`Registra a los participantes de la liga. Cada uno tendrá ${budget} puntos para draftear. (${state.coaches.length}/${maxCoaches} equipos)`} />
      {unlocked
        ? <div style={{
            display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end",
            background:"var(--panel)", border:"1px solid var(--line)", padding:18, borderRadius:14, marginBottom:24
          }}>
            <Field label="Nombre de entrenador" value={trainer} onChange={setTrainer} placeholder="Ej. Ash Ketchum" />
            <Field label="Nombre del equipo" value={team} onChange={setTeam} placeholder="Ej. Pallet Town Thunders" />
            <button onClick={add} disabled={state.coaches.length >= maxCoaches}
              style={{ ...btnPrimary, opacity: state.coaches.length >= maxCoaches ? 0.5 : 1, cursor: state.coaches.length >= maxCoaches ? "not-allowed" : "pointer" }}
              title={state.coaches.length >= maxCoaches ? "Límite de equipos alcanzado" : ""}>+ Agregar</button>
          </div>
        : <LockedNote />}

      {state.coaches.length === 0
        ? <Empty msg="Todavía no hay entrenadores registrados." />
        : <div style={{ display:"grid", gap:10 }}>
            {state.coaches.map(c => {
              const spent = (state.picks[c.id]||[]).reduce((s,id)=>s+(POOL.find(p=>p.id===id)?.cost||0),0);
              const count = (state.picks[c.id]||[]).length;
              const editing = editId === c.id;
              return (
                <div key={c.id} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, flexWrap:"wrap",
                  background:"var(--panel)", border:"1px solid var(--line)", padding:"14px 18px", borderRadius:12
                }}>
                  {editing
                    ? <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", flex:1, minWidth:260 }}>
                        <Field label="Nombre de entrenador" value={editTrainer} onChange={setEditTrainer} placeholder="Nombre de entrenador" />
                        <Field label="Nombre del equipo" value={editTeam} onChange={setEditTeam} placeholder="Nombre del equipo" />
                      </div>
                    : <div>
                        <div className="rl-display" style={{ fontWeight:700, fontSize:19 }}>{c.team}</div>
                        <div style={{ color:"var(--ink-dim)", fontSize:13 }}>{c.trainer}</div>
                      </div>}
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    {!editing && (
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:800, color:"var(--accent)" }}>{spent}<span style={{color:"var(--ink-dim)",fontWeight:500}}>/{budget} pts</span></div>
                        <div style={{ color:"var(--ink-dim)", fontSize:12 }}>{count} pokémon</div>
                      </div>
                    )}
                    {unlocked && (editing
                      ? <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>saveEdit(c.id)} style={btnPrimary}>Guardar</button>
                          <button onClick={cancelEdit} style={btnGhost}>Cancelar</button>
                        </div>
                      : <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>startEdit(c)} style={btnGhost}>Editar</button>
                          <button onClick={()=>remove(c.id)} style={btnGhost}>Eliminar</button>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>}
    </div>
  );
}

// ============ DRAFT BOARD ============
function Board({ state, setState, unlocked, logAction }) {
  const [activeCoach, setActiveCoach] = useState("");
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    if (!activeCoach && state.coaches[0]) setActiveCoach(state.coaches[0].id);
  }, [state.coaches]);

  // mapa pokemonId -> coachId
  const draftedBy = useMemo(() => {
    const m = {};
    Object.entries(state.picks).forEach(([cid, ids]) => ids.forEach(id => { m[id] = cid; }));
    return m;
  }, [state.picks]);

  const coachName = (id) => state.coaches.find(c=>c.id===id)?.team || "—";
  const budget = state.settings.budget;
  const maxPicks = state.settings.maxPicks;
  const myPicks = state.picks[activeCoach] || [];
  const mySpent = myPicks.reduce((s,id)=>s+(POOL.find(p=>p.id===id)?.cost||0),0);
  const myRemaining = budget - mySpent;

  const pick = (pk) => {
    if (!activeCoach) { alert("Primero selecciona qué entrenador está drafteando (arriba)."); return; }
    if (draftedBy[pk.id]) return; // ya tomado
    if (myPicks.length >= maxPicks) { alert(`Cada equipo puede tener máximo ${maxPicks} Pokémon.`); return; }
    if (pk.cost > myRemaining) { alert(`No te alcanzan los puntos. Te quedan ${myRemaining} y este cuesta ${pk.cost}.`); return; }
    setState(s => {
      const cur = s.picks[activeCoach] || [];
      if (cur.length >= maxPicks) return s;
      return { ...s, picks: { ...s.picks, [activeCoach]: [...cur, pk.id] } };
    });
    logAction?.(`Drafteó a ${pk.name} (${pk.cost} pts) para ${coachName(activeCoach)}`);
  };
  const unpick = (pkId, cid) => {
    const pk = POOL.find(p => p.id === pkId);
    setState(s => ({ ...s, picks: { ...s.picks, [cid]: (s.picks[cid]||[]).filter(x=>x!==pkId) } }));
    logAction?.(`Quitó a ${pk?.name || ""} del equipo ${coachName(cid)}`);
  };

  const allTypes = useMemo(() => [...new Set(POOL.flatMap(p=>p.types))].sort(), []);
  const filtered = POOL.filter(p =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
    (!typeFilter || p.types.includes(typeFilter))
  );

  return (
    <div>
      <SectionTitle title="Draft Board" sub={`Cada entrenador tiene ${budget} puntos y puede draftear hasta ${maxPicks} Pokémon. Un Pokémon ya drafteado no se puede repetir.`} />
      {!unlocked && <LockedNote />}


      {state.coaches.length === 0
        ? <Empty msg="Registra entrenadores primero en la pestaña «Entrenadores»." />
        : <>
          {/* selector de entrenador activo */}
          <div style={{
            background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14,
            padding:16, marginBottom:18, position:"sticky", top:8, zIndex:5,
            backdropFilter:"blur(8px)"
          }}>
            <div style={{ fontSize:12, color:"var(--ink-dim)", marginBottom:8, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Drafteando como</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              {state.coaches.map(c => {
                const sp = (state.picks[c.id]||[]).reduce((s,id)=>s+(POOL.find(p=>p.id===id)?.cost||0),0);
                return (
                  <button key={c.id} onClick={()=>setActiveCoach(c.id)} style={{
                    background: activeCoach===c.id ? "var(--accent)" : "transparent",
                    color: activeCoach===c.id ? "#0b0e14" : "var(--ink)",
                    border: "1px solid " + (activeCoach===c.id ? "var(--accent)" : "var(--line)"),
                    padding:"8px 14px", borderRadius:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:13
                  }}>{c.team} <span style={{opacity:.7, fontWeight:500}}>· {budget-sp}p</span></button>
                );
              })}
            </div>
            {activeCoach && (
              <div style={{ marginTop:12, display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ flex:1, height:10, background:"var(--line)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ width:`${(mySpent/budget)*100}%`, height:"100%", background: myRemaining<0?"#ff5b5b":"var(--accent)", transition:"width .2s" }} />
                </div>
                <div style={{ fontWeight:800, fontSize:14, whiteSpace:"nowrap" }}>
                  {mySpent}/{budget} <span style={{color:"var(--ink-dim)",fontWeight:500}}>· quedan {myRemaining}</span>
                  <span style={{ color: myPicks.length>=maxPicks?"var(--accent)":"var(--ink-dim)", fontWeight:700, marginLeft:10 }}>{myPicks.length}/{maxPicks} pkmn</span>
                </div>
              </div>
            )}
            {/* picks actuales del entrenador activo */}
            {myPicks.length > 0 && (
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
                {myPicks.map(id => {
                  const p = POOL.find(x=>x.id===id);
                  return (
                    <span key={id} onClick={()=> unlocked && unpick(id, activeCoach)} title={unlocked ? "Quitar" : "Bloqueado"}
                      style={{ display:"flex", alignItems:"center", gap:4, background:"var(--chip)", borderRadius:8, padding:"3px 8px 3px 3px", cursor: unlocked ? "pointer" : "default", fontSize:12, fontWeight:600, opacity: unlocked ? 1 : 0.85 }}>
                      <Sprite id={id} name={p?.name} size={26} />
                      {p?.name} {unlocked && "×"}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* filtros */}
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar pokémon…" style={inputStyle} />
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{...inputStyle, cursor:"pointer", maxWidth:170}}>
              <option value="">Todos los tipos</option>
              {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* tabla */}
          <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"56px 1fr 1fr 1fr 70px", padding:"10px 16px", borderBottom:"1px solid var(--line)", fontSize:11, fontWeight:800, color:"var(--ink-dim)", textTransform:"uppercase", letterSpacing:".06em" }}>
              <div></div><div>Pokémon</div><div>Tipos</div><div>Drafteado por</div><div style={{textAlign:"right"}}>Costo</div>
            </div>
            <div style={{ maxHeight:560, overflowY:"auto" }}>
              {filtered.map(p => {
                const owner = draftedBy[p.id];
                const taken = !!owner;
                const mine = owner === activeCoach;
                const teamFull = myPicks.length >= maxPicks;
                const affordable = p.cost <= myRemaining && !teamFull;
                return (
                  <div key={p.id} onClick={()=> unlocked && (taken ? (mine && unpick(p.id, activeCoach)) : pick(p))}
                    style={{
                      display:"grid", gridTemplateColumns:"56px 1fr 1fr 1fr 70px", alignItems:"center",
                      padding:"6px 16px", borderBottom:"1px solid var(--line)",
                      cursor: !unlocked ? "default" : (taken ? (mine?"pointer":"not-allowed") : (affordable?"pointer":"not-allowed")),
                      opacity: taken && !mine ? .42 : (!affordable && !taken ? .55 : 1),
                      background: mine ? "rgba(194,22,26,0.14)" : "transparent",
                      transition:"background .12s"
                    }}
                    onMouseEnter={e=>{ if(unlocked && !(taken&&!mine)) e.currentTarget.style.background = mine?"rgba(194,22,26,0.24)":"var(--hover)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background = mine?"rgba(194,22,26,0.14)":"transparent"; }}
                  >
                    <Sprite id={p.id} name={p.name} size={44} />
                    <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{p.types.map(t=><TypeBadge key={t} t={t} />)}</div>
                    <div style={{ fontSize:13, color: taken?"var(--accent)":"var(--ink-dim)", fontWeight: taken?700:400 }}>
                      {taken ? coachName(owner) : "—"}
                    </div>
                    <div style={{ textAlign:"right", fontWeight:800, fontSize:16 }}>{p.cost}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>}
    </div>
  );
}

// ============ EQUIPOS ============
function Teams({ state }) {
  if (state.coaches.length === 0) return <><SectionTitle title="Equipos" /><Empty msg="No hay entrenadores aún." /></>;
  const budget = state.settings.budget;
  return (
    <div>
      <SectionTitle title="Equipos" sub="Así quedaron los rosters de cada entrenador. Los Pokémon marcados con ⇄ llegaron por intercambio." />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px,1fr))", gap:18 }}>
        {state.coaches.map(c => {
          const ids = state.picks[c.id] || [];
          const traded = tradedInIds(state, c.id);
          const mons = ids.map(id => POOL.find(p=>p.id===id)).filter(Boolean).sort((a,b)=>b.cost-a.cost);
          const spent = mons.reduce((s,m)=>s+m.cost,0);
          return (
            <div key={c.id} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, overflow:"hidden" }}>
              <div style={{ padding:"16px 18px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div className="rl-display" style={{ fontWeight:700, fontSize:21, lineHeight:1 }}>{c.team}</div>
                  <div style={{ color:"var(--ink-dim)", fontSize:13, marginTop:3 }}>{c.trainer}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:900, color:"var(--accent)", fontSize:18 }}>{spent}</div>
                  <div style={{ color:"var(--ink-dim)", fontSize:11 }}>de {budget} pts</div>
                </div>
              </div>
              {mons.length===0
                ? <div style={{ padding:24, textAlign:"center", color:"var(--ink-dim)", fontSize:13 }}>Sin pokémon drafteados</div>
                : <div style={{ padding:10 }}>
                    {mons.map(m => {
                      const wasTraded = traded.has(m.id);
                      return (
                        <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"5px 8px", borderRadius:8, background: wasTraded ? "rgba(194,22,26,0.08)" : "transparent" }}>
                          <Sprite id={m.id} name={m.name} size={42} />
                          <div style={{ flex:1, fontWeight:700, fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
                            {m.name}
                            {wasTraded && <span title="Llegó por intercambio" style={{ fontSize:9, fontWeight:800, color:"#fff", background:"var(--accent)", borderRadius:999, padding:"2px 6px", letterSpacing:".04em", textTransform:"uppercase" }}>⇄ Cambio</span>}
                          </div>
                          <div style={{ display:"flex", gap:4 }}>{m.types.map(t=><TypeBadge key={t} t={t} />)}</div>
                          <div style={{ fontWeight:800, width:28, textAlign:"right" }}>{m.cost}</div>
                        </div>
                      );
                    })}
                  </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ MATCHUPS + TABLA ============
// Modelo de match: { id, a, b, sa, sb, round, final? }
//  - sa/sb = juegos ganados por cada lado (marcador exacto)
//  - round-robin: Bo3 (primero a 2). final: Bo5 (primero a 3), el #1 arranca 1-0.
const winsNeeded = (m) => (m.final ? 3 : 2);
const isDone = (m) => m.sa >= winsNeeded(m) || m.sb >= winsNeeded(m);
const matchWinner = (m) => !isDone(m) ? null : (m.sa > m.sb ? m.a : m.b);

function Matchups({ state, setState, unlocked, logAction }) {
  const cName = (id) => state.coaches.find(c=>c.id===id)?.team || "—";
  const cTrainer = (id) => state.coaches.find(c=>c.id===id)?.trainer || "";

  const rr = (state.matches || []).filter(m => !m.final);
  const finalMatch = (state.matches || []).find(m => m.final) || null;

  // Genera todos contra todos repartido en rondas (jornadas).
  const generateSchedule = () => {
    const ids = state.coaches.map(c => c.id);
    if (ids.length < 2) { alert("Necesitas al menos 2 entrenadores."); return; }
    if (rr.length > 0 && !confirm("Ya hay un calendario. ¿Regenerarlo? Se borrarán los resultados actuales del round-robin.")) return;

    // Algoritmo del círculo: si hay impar, se añade un "BYE" que descansa.
    const arr = [...ids];
    if (arr.length % 2 !== 0) arr.push("BYE");
    const n = arr.length;
    const rounds = n - 1;
    const half = n / 2;
    const pairs = [];
    let list = arr.slice();
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < half; i++) {
        const a = list[i], b = list[n - 1 - i];
        if (a !== "BYE" && b !== "BYE")
          pairs.push({ id: uid(), a, b, sa: 0, sb: 0, round: r + 1 });
      }
      // rotar manteniendo fijo el primer elemento
      list = [list[0], list[n - 1], ...list.slice(1, n - 1)];
    }
    setState(s => ({ ...s, matches: [...pairs, ...(s.matches||[]).filter(m=>m.final)] }));
    logAction?.("Generó el calendario de enfrentamientos");
  };

  const clearAll = () => {
    if (!confirm("¿Borrar todos los matchups (round-robin y final)?")) return;
    setState(s => ({ ...s, matches: [] }));
    logAction?.("Borró todos los matchups");
  };

  // Ajustar marcador con límites según el tipo de serie.
  const setScore = (mid, side, val) => {
    let decided = null; // {winner, sa, sb, final} si la serie se acaba de decidir
    setState(s => ({
      ...s,
      matches: s.matches.map(m => {
        if (m.id !== mid) return m;
        const need = m.final ? 3 : 2;
        const v = Math.max(0, Math.min(need, val));
        const next = side === "a" ? { ...m, sa: v } : { ...m, sb: v };
        const nowDone = next.sa >= need || next.sb >= need;
        const wasDone = m.sa >= need || m.sb >= need;
        // sello de tiempo cuando se decide la serie (para "últimos resultados")
        if (nowDone && !wasDone) {
          next.ts = Date.now();
          decided = {
            winner: next.sa > next.sb ? next.a : next.b,
            sa: next.sa, sb: next.sb, final: !!m.final,
          };
        }
        if (!nowDone) next.ts = null;
        return next;
      })
    }));
    if (decided) {
      const tag = decided.final ? "Final" : "Serie";
      logAction?.(`${tag} decidida: ganó ${cName(decided.winner)} (${decided.sa}-${decided.sb})`);
    }
  };

  // Standings del round-robin: series ganadas, desempate por dif. de juegos.
  const standings = useMemo(() => {
    const t = {};
    state.coaches.forEach(c => t[c.id] = { id:c.id, sw:0, sl:0, gw:0, gl:0, played:0 });
    rr.forEach(m => {
      if (!isDone(m)) return;
      const A = t[m.a], B = t[m.b];
      if (!A || !B) return;
      A.played++; B.played++;
      A.gw += m.sa; A.gl += m.sb; B.gw += m.sb; B.gl += m.sa;
      const w = matchWinner(m);
      if (w === m.a) { A.sw++; B.sl++; } else { B.sw++; A.sl++; }
    });
    return Object.values(t)
      .map(r => ({ ...r, diff: r.gw - r.gl }))
      .sort((x,y) => y.sw - x.sw || y.diff - x.diff || y.gw - x.gw);
  }, [state.matches, state.coaches]);

  const rrComplete = rr.length > 0 && rr.every(isDone);
  const top2 = standings.slice(0, 2);

  // Crear / sincronizar la final con los 2 primeros (el #1 arranca 1-0).
  const createFinal = () => {
    if (top2.length < 2) return;
    const [first, second] = top2;
    setState(s => ({
      ...s,
      matches: [
        ...(s.matches||[]).filter(m => !m.final),
        { id: uid(), a: first.id, b: second.id, sa: 1, sb: 0, round: "final", final: true },
      ]
    }));
    logAction?.(`Creó la final: ${cName(first.id)} vs ${cName(second.id)}`);
  };

  if (state.coaches.length === 0) return <><SectionTitle title="Matchups" /><Empty msg="No hay entrenadores aún." /></>;

  return (
    <div>
      <SectionTitle title="Matchups" sub="Round-robin (todos contra todos) en series Bo3. Los 2 primeros disputan la final Bo5; el líder de la tabla arranca 1-0." />

      {/* tabla de posiciones */}
      <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, overflow:"hidden", marginBottom:26 }}>
        <div className="rl-display" style={{ padding:"14px 18px", borderBottom:"1px solid var(--line)", fontWeight:700, fontSize:18, letterSpacing:".03em" }}>Tabla de posiciones</div>
        <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 50px 46px 46px 64px", padding:"8px 16px", fontSize:11, fontWeight:800, color:"var(--ink-dim)", textTransform:"uppercase", letterSpacing:".04em", borderBottom:"1px solid var(--line)" }}>
          <div>#</div><div>Equipo</div><div style={{textAlign:"center"}}>PJ</div><div style={{textAlign:"center"}}>G</div><div style={{textAlign:"center"}}>P</div><div style={{textAlign:"center"}}>Dif</div>
        </div>
        {standings.map((row, i) => (
          <div key={row.id} style={{ display:"grid", gridTemplateColumns:"36px 1fr 50px 46px 46px 64px", padding:"10px 16px", alignItems:"center", borderBottom:"1px solid var(--line)", background: i<2 ? "rgba(194,22,26,0.07)" : "transparent" }}>
            <div style={{ fontWeight:900, color: i===0?"var(--accent)":(i===1?"var(--accent-soft)":"var(--ink-dim)") }}>{i+1}</div>
            <div>
              <div style={{ fontWeight:700 }}>{cName(row.id)}</div>
              <div style={{ fontSize:11, color:"var(--ink-dim)" }}>{cTrainer(row.id)}</div>
            </div>
            <div style={{ textAlign:"center", color:"var(--ink-dim)" }}>{row.played}</div>
            <div style={{ textAlign:"center", fontWeight:800, color:"var(--accent)" }}>{row.sw}</div>
            <div style={{ textAlign:"center", fontWeight:800 }}>{row.sl}</div>
            <div style={{ textAlign:"center", color:"var(--ink-dim)", fontWeight:600 }}>{row.diff>0?"+":""}{row.diff}</div>
          </div>
        ))}
      </div>

      {/* controles */}
      {unlocked
        ? <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:22 }}>
            <button onClick={generateSchedule} style={btnPrimary}>Generar calendario</button>
            {rr.length>0 && <button onClick={clearAll} style={btnGhost}>Borrar todo</button>}
          </div>
        : <LockedNote />}

      {/* round-robin */}
      <div className="rl-display" style={{ fontSize:16, fontWeight:700, margin:"4px 0 12px", color:"var(--silver)" }}>Fase regular · Bo3</div>
      {rr.length===0
        ? <Empty msg={unlocked ? "Pulsa «Generar calendario» para crear los enfrentamientos." : "Aún no se ha generado el calendario."} />
        : [...new Set(rr.map(m=>m.round))].sort((a,b)=>a-b).map(rn => (
            <div key={rn} style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"var(--ink-dim)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Ronda {rn}</div>
              <div style={{ display:"grid", gap:10 }}>
                {rr.filter(m=>m.round===rn).map(m => <SeriesRow key={m.id} m={m} cName={cName} cTrainer={cTrainer} setScore={setScore} unlocked={unlocked} />)}
              </div>
            </div>
          ))}

      {/* final */}
      <div className="rl-display" style={{ fontSize:16, fontWeight:700, margin:"30px 0 12px", color:"var(--silver)" }}>Final · Bo5</div>
      {!finalMatch
        ? <div style={{ background:"var(--panel)", border:"1px dashed var(--line)", borderRadius:14, padding:22, textAlign:"center", color:"var(--ink-dim)", fontSize:14 }}>
            {!rrComplete
              ? "La final se habilitará cuando todas las series de la fase regular estén reportadas."
              : <>
                  <div style={{ marginBottom: unlocked?12:0 }}>
                    Clasificados: <strong style={{color:"var(--accent)"}}>{cName(top2[0]?.id)}</strong> (1º, arranca 1-0) vs <strong style={{color:"var(--silver)"}}>{cName(top2[1]?.id)}</strong> (2º)
                  </div>
                  {unlocked && <button onClick={createFinal} style={btnPrimary}>Crear final</button>}
                </>}
          </div>
        : <SeriesRow m={finalMatch} cName={cName} cTrainer={cTrainer} setScore={setScore} unlocked={unlocked} highlight />}
    </div>
  );
}

// Fila de una serie con marcador exacto editable.
function SeriesRow({ m, cName, cTrainer, setScore, unlocked, highlight }) {
  const need = m.final ? 3 : 2;
  const done = m.sa >= need || m.sb >= need;
  const winner = done ? (m.sa > m.sb ? m.a : m.b) : null;
  const Stepper = ({ side, val }) => (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      {unlocked && <button onClick={()=>setScore(m.id, side, val-1)} style={stepBtn}>−</button>}
      <span style={{ minWidth:18, textAlign:"center", fontWeight:900, fontSize:20 }}>{val}</span>
      {unlocked && <button onClick={()=>setScore(m.id, side, val+1)} style={stepBtn}>+</button>}
    </div>
  );
  return (
    <div style={{
      background:"var(--panel)",
      border:"1px solid " + (highlight ? "var(--accent)" : "var(--line)"),
      borderRadius:12, padding:"14px 16px",
      boxShadow: highlight ? "0 0 0 1px var(--accent), 0 8px 24px -10px rgba(194,22,26,0.5)" : "none"
    }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:10 }}>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontWeight:700, fontSize:15, color: winner===m.a?"var(--accent)":"var(--ink)" }}>
            {cName(m.a)} {winner===m.a && "🏆"}
          </div>
          {cTrainer && cTrainer(m.a) && <div style={{ fontSize:11, color:"var(--ink-dim)", marginTop:2 }}>{cTrainer(m.a)}</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Stepper side="a" val={m.sa} />
          <span style={{ color:"var(--ink-dim)", fontWeight:800 }}>–</span>
          <Stepper side="b" val={m.sb} />
        </div>
        <div style={{ textAlign:"left" }}>
          <div style={{ fontWeight:700, fontSize:15, color: winner===m.b?"var(--accent)":"var(--ink)" }}>
            {winner===m.b && "🏆"} {cName(m.b)}
          </div>
          {cTrainer && cTrainer(m.b) && <div style={{ fontSize:11, color:"var(--ink-dim)", marginTop:2 }}>{cTrainer(m.b)}</div>}
        </div>
      </div>
      <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"var(--ink-dim)", textTransform:"uppercase", letterSpacing:".06em" }}>
        {m.final ? "Final Bo5 · líder arranca 1-0" : "Bo3"} · {done ? "Reportado" : "Pendiente"}
      </div>
    </div>
  );
}

// ============ INTERCAMBIOS ============
function Trades({ state, setState, unlocked, logAction }) {
  const cName = (id) => state.coaches.find(c=>c.id===id)?.team || "—";
  const cTrainer = (id) => state.coaches.find(c=>c.id===id)?.trainer || "";
  const mon = (id) => POOL.find(p=>p.id===id);
  const maxTrade = state.settings.maxTrade;
  const budget = state.settings.budget;

  // Costo total del roster actual de un equipo.
  const rosterCost = (coachId, roster) =>
    (roster || state.picks[coachId] || []).reduce((sum, id) => sum + (mon(id)?.cost || 0), 0);

  // Cuántos Pokémon ha movido un equipo en toda la temporada, sumando los
  // trades entre equipos (lo que cedió en aGave/bGave) y los cambios con el
  // pool (cada cambio con el pool gasta 1 movimiento). Este conteo es el que
  // no puede superar maxTrade.
  const tradedCount = (coachId) =>
    (state.trades || []).reduce((n, t) => {
      if (t.kind === "pool") {
        return n + (t.coach === coachId ? 1 : 0);
      }
      let c = 0;
      if (t.a === coachId) c += (t.aGave || []).length;
      if (t.b === coachId) c += (t.bGave || []).length;
      return n + c;
    }, 0);

  // Conjunto de todos los Pokémon ya drafteados por cualquier equipo (no
  // disponibles para el cambio con el pool).
  const draftedIds = new Set(
    state.coaches.flatMap(c => state.picks[c.id] || [])
  );

  // ----- Cambio con el pool (1 por 1) -----
  const [poolCoach, setPoolCoach] = useState("");
  const [poolOut, setPoolOut] = useState("");   // pokemon que sale del equipo
  const [poolIn, setPoolIn] = useState("");     // pokemon del pool que entra
  const [poolSearch, setPoolSearch] = useState("");

  const resetPool = () => { setPoolOut(""); setPoolIn(""); setPoolSearch(""); };

  const poolRoster = poolCoach ? (state.picks[poolCoach] || []) : [];
  const poolRemaining = poolCoach ? (maxTrade - tradedCount(poolCoach)) : 0;
  // Pokémon disponibles en el pool: los que nadie ha drafteado, filtrados por búsqueda.
  const poolAvailable = POOL
    .filter(p => !draftedIds.has(p.id))
    .filter(p => p.name.toLowerCase().includes(poolSearch.trim().toLowerCase()))
    .sort((a,b) => b.cost - a.cost);

  const confirmPoolSwap = () => {
    if (!poolCoach) { alert("Elige un equipo."); return; }
    if (!poolOut)   { alert("Elige el Pokémon que sale del equipo."); return; }
    if (!poolIn)    { alert("Elige el Pokémon que entra desde el pool."); return; }
    if (poolRemaining <= 0) {
      alert(`${cName(poolCoach)} ya alcanzó el máximo de ${maxTrade} Pokémon intercambiados en la temporada.`);
      return;
    }
    const outMon = mon(Number(poolOut));
    const inMon  = mon(Number(poolIn));
    // Validar presupuesto tras el cambio.
    const newCost = rosterCost(poolCoach) - (outMon?.cost || 0) + (inMon?.cost || 0);
    if (newCost > budget) {
      alert(`Con este cambio el equipo gastaría ${newCost} pts, superando el presupuesto de ${budget}. Elige un Pokémon de costo menor.`);
      return;
    }
    const outId = Number(poolOut), inId = Number(poolIn);
    setState(s => {
      const picks = { ...s.picks };
      const roster = [...(picks[poolCoach] || [])];
      picks[poolCoach] = roster.filter(id => id !== outId).concat(inId);
      const trade = {
        id: uid(), ts: Date.now(), kind: "pool",
        coach: poolCoach, out: outId, in: inId,
      };
      return { ...s, picks, trades: [...(s.trades||[]), trade] };
    });
    logAction?.(`Cambio con el pool: ${cName(poolCoach)} soltó ${outMon?.name} y tomó ${inMon?.name}`);
    resetPool();
    alert("Cambio con el pool realizado.");
  };

  // ----- Intercambio entre equipos -----
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [aGive, setAGive] = useState([]); // pokemon ids que cede A
  const [bGive, setBGive] = useState([]); // pokemon ids que cede B

  const aPicks = aId ? (state.picks[aId] || []) : [];
  const bPicks = bId ? (state.picks[bId] || []) : [];

  const aRemaining = aId ? (maxTrade - tradedCount(aId)) : 0;
  const bRemaining = bId ? (maxTrade - tradedCount(bId)) : 0;

  const toggle = (list, setList, id, remaining, who) => {
    if (list.includes(id)) { setList(list.filter(x=>x!==id)); return; }
    if (list.length >= remaining) {
      alert(`${who} solo puede ceder ${remaining} Pokémon más esta temporada (máximo ${maxTrade} en total).`);
      return;
    }
    setList([...list, id]);
  };

  const reset = () => { setAGive([]); setBGive([]); };

  const confirmTrade = () => {
    if (!aId || !bId || aId===bId) { alert("Elige dos entrenadores distintos."); return; }
    if (aGive.length === 0 || bGive.length === 0) { alert("Cada entrenador debe ceder al menos 1 Pokémon."); return; }
    if (aGive.length > aRemaining) { alert(`${cName(aId)} excede su cupo de intercambios de la temporada.`); return; }
    if (bGive.length > bRemaining) { alert(`${cName(bId)} excede su cupo de intercambios de la temporada.`); return; }
    if (aGive.length !== bGive.length) {
      if (!confirm(`El intercambio no es parejo (${aGive.length} por ${bGive.length}). ¿Continuar de todas formas?`)) return;
    }
    // Validar presupuesto de ambos equipos tras el intercambio.
    const aNewCost = rosterCost(aId) - aGive.reduce((n,id)=>n+(mon(id)?.cost||0),0) + bGive.reduce((n,id)=>n+(mon(id)?.cost||0),0);
    const bNewCost = rosterCost(bId) - bGive.reduce((n,id)=>n+(mon(id)?.cost||0),0) + aGive.reduce((n,id)=>n+(mon(id)?.cost||0),0);
    if (aNewCost > budget) { alert(`${cName(aId)} quedaría en ${aNewCost} pts, superando el presupuesto de ${budget}.`); return; }
    if (bNewCost > budget) { alert(`${cName(bId)} quedaría en ${bNewCost} pts, superando el presupuesto de ${budget}.`); return; }
    setState(s => {
      const picks = { ...s.picks };
      const aRost = [...(picks[aId]||[])];
      const bRost = [...(picks[bId]||[])];
      // quitar lo que cada uno cede
      const aAfter = aRost.filter(id => !aGive.includes(id)).concat(bGive);
      const bAfter = bRost.filter(id => !bGive.includes(id)).concat(aGive);
      picks[aId] = aAfter;
      picks[bId] = bAfter;
      const trade = {
        id: uid(), ts: Date.now(), kind: "swap",
        a: aId, b: bId,
        aGave: [...aGive], bGave: [...bGive],
      };
      return { ...s, picks, trades: [...(s.trades||[]), trade] };
    });
    reset();
    const aNames = aGive.map(id => mon(id)?.name).filter(Boolean).join(", ");
    const bNames = bGive.map(id => mon(id)?.name).filter(Boolean).join(", ");
    logAction?.(`Intercambio: ${cName(aId)} cedió ${aNames} ↔ ${cName(bId)} cedió ${bNames}`);
    alert("Intercambio realizado.");
  };

  const undoTrade = (t) => {
    if (t.kind === "pool") {
      if (!confirm("¿Revertir este cambio con el pool? El Pokémon volverá al equipo y el otro al pool.")) return;
      setState(s => {
        const picks = { ...s.picks };
        const roster = [...(picks[t.coach]||[])];
        picks[t.coach] = roster.filter(id => id !== t.in).concat(t.out);
        return { ...s, picks, trades: (s.trades||[]).filter(x=>x.id!==t.id) };
      });
      logAction?.(`Revirtió un cambio con el pool de ${cName(t.coach)}`);
      return;
    }
    if (!confirm("¿Revertir este intercambio? Los Pokémon volverán a sus equipos originales.")) return;
    setState(s => {
      const picks = { ...s.picks };
      const aRost = [...(picks[t.a]||[])];
      const bRost = [...(picks[t.b]||[])];
      // deshacer: A recupera lo que dio (aGave) y devuelve lo que recibió (bGave)
      const aAfter = aRost.filter(id => !t.bGave.includes(id)).concat(t.aGave);
      const bAfter = bRost.filter(id => !t.aGave.includes(id)).concat(t.bGave);
      picks[t.a] = aAfter;
      picks[t.b] = bAfter;
      return { ...s, picks, trades: (s.trades||[]).filter(x=>x.id!==t.id) };
    });
    logAction?.(`Revirtió un intercambio entre ${cName(t.a)} y ${cName(t.b)}`);
  };

  const trades = [...(state.trades||[])].sort((x,y)=>(y.ts||0)-(x.ts||0));
  const fmtDate = (ts) => { try { return new Date(ts).toLocaleDateString("es",{day:"numeric",month:"short"}); } catch { return ""; } };

  if (state.coaches.length < 1)
    return <><SectionTitle title="Intercambios" /><Empty msg="Necesitas al menos 1 entrenador registrado." /></>;

  const PickList = ({ picks, selected, setSel, remaining, who }) => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
      {picks.length===0
        ? <span style={{ color:"var(--ink-dim)", fontSize:13 }}>Sin Pokémon</span>
        : picks.map(id => {
            const p = mon(id); const on = selected.includes(id);
            return (
              <button key={id} onClick={()=>toggle(selected, setSel, id, remaining, who)} style={{
                display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontFamily:"inherit",
                background: on?"var(--accent)":"var(--chip)", color: on?"#fff":"var(--ink)",
                border:"1px solid " + (on?"var(--accent-soft)":"var(--line)"),
                borderRadius:8, padding:"3px 9px 3px 3px", fontSize:12, fontWeight:600
              }}>
                <Sprite id={id} name={p?.name} size={24} />
                {p?.name}
              </button>
            );
          })}
    </div>
  );

  return (
    <div>
      <SectionTitle title="Intercambios" sub={`Cada equipo puede mover hasta ${maxTrade} Pokémon en la temporada, sumando cambios con el pool e intercambios entre equipos. Ningún equipo puede superar el presupuesto de ${budget} pts.`} />

      {/* ===== Cambio con el pool (1 por 1) — va primero ===== */}
      <div className="rl-display" style={{ fontSize:16, fontWeight:700, margin:"4px 0 12px", color:"var(--silver)" }}>Cambio con el pool</div>
      {unlocked
        ? <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:18, marginBottom:26 }}>
            <div style={{ fontSize:12, color:"var(--ink-dim)", marginBottom:14 }}>
              Cambia un Pokémon de tu equipo por uno que nadie haya drafteado (1 por 1).
            </div>
            <Label>Equipo</Label>
            <select value={poolCoach} onChange={e=>{setPoolCoach(e.target.value); resetPool();}} style={{...inputStyle, cursor:"pointer", width:"100%"}}>
              <option value="">—</option>
              {state.coaches.map(c=><option key={c.id} value={c.id}>{c.team} ({c.trainer})</option>)}
            </select>

            {poolCoach && <>
              <div style={{ display:"flex", gap:16, fontSize:12, color:"var(--ink-dim)", margin:"10px 0 0" }}>
                <span>Presupuesto: <strong style={{color: rosterCost(poolCoach)>budget?"var(--accent)":"var(--silver)"}}>{rosterCost(poolCoach)}/{budget} pts</strong></span>
                <span>Cambios restantes: <strong style={{color: poolRemaining<=0?"var(--accent)":"var(--silver)"}}>{Math.max(0,poolRemaining)}/{maxTrade}</strong></span>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginTop:14 }}>
                {/* sale */}
                <div>
                  <div style={{ fontSize:12, color:"var(--ink-dim)", marginBottom:6 }}>Sale del equipo:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {poolRoster.length===0
                      ? <span style={{ color:"var(--ink-dim)", fontSize:13 }}>Sin Pokémon</span>
                      : poolRoster.map(id => {
                          const p = mon(id); const on = Number(poolOut)===id;
                          return (
                            <button key={id} onClick={()=>setPoolOut(on?"":String(id))} style={{
                              display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontFamily:"inherit",
                              background: on?"var(--accent)":"var(--chip)", color: on?"#fff":"var(--ink)",
                              border:"1px solid " + (on?"var(--accent-soft)":"var(--line)"),
                              borderRadius:8, padding:"3px 9px 3px 3px", fontSize:12, fontWeight:600
                            }}>
                              <Sprite id={id} name={p?.name} size={24} />
                              {p?.name} <span style={{opacity:.7}}>· {p?.cost}p</span>
                            </button>
                          );
                        })}
                  </div>
                </div>
                {/* entra */}
                <div>
                  <div style={{ fontSize:12, color:"var(--ink-dim)", marginBottom:6 }}>Entra desde el pool:</div>
                  <input
                    value={poolSearch}
                    onChange={e=>setPoolSearch(e.target.value)}
                    placeholder="Buscar Pokémon disponible…"
                    style={{...inputStyle, width:"100%", marginBottom:8}}
                  />
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, maxHeight:180, overflowY:"auto" }}>
                    {poolAvailable.length===0
                      ? <span style={{ color:"var(--ink-dim)", fontSize:13 }}>Ningún Pokémon disponible.</span>
                      : poolAvailable.slice(0, 60).map(p => {
                          const on = Number(poolIn)===p.id;
                          return (
                            <button key={p.id} onClick={()=>setPoolIn(on?"":String(p.id))} style={{
                              display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontFamily:"inherit",
                              background: on?"var(--accent)":"var(--chip)", color: on?"#fff":"var(--ink)",
                              border:"1px solid " + (on?"var(--accent-soft)":"var(--line)"),
                              borderRadius:8, padding:"3px 9px 3px 3px", fontSize:12, fontWeight:600
                            }}>
                              <Sprite id={p.id} name={p.name} size={24} />
                              {p.name} <span style={{opacity:.7}}>· {p.cost}p</span>
                            </button>
                          );
                        })}
                  </div>
                </div>
              </div>

              {poolOut && poolIn && (() => {
                const newCost = rosterCost(poolCoach) - (mon(Number(poolOut))?.cost||0) + (mon(Number(poolIn))?.cost||0);
                const over = newCost > budget;
                return (
                  <div style={{ fontSize:13, marginTop:14, color: over?"var(--accent-soft)":"var(--ink-dim)", fontWeight:600 }}>
                    Presupuesto tras el cambio: {newCost}/{budget} pts {over ? "— supera el límite" : "✓"}
                  </div>
                );
              })()}

              <div style={{ display:"flex", gap:10, marginTop:16, alignItems:"center" }}>
                <button onClick={confirmPoolSwap} style={btnPrimary}>Confirmar cambio</button>
                {(poolOut||poolIn||poolSearch) && <button onClick={resetPool} style={btnGhost}>Limpiar selección</button>}
              </div>
            </>}
          </div>
        : <LockedNote />}

      {/* ===== Intercambio entre equipos ===== */}
      <div className="rl-display" style={{ fontSize:16, fontWeight:700, margin:"4px 0 12px", color:"var(--silver)" }}>Intercambio entre equipos</div>
      {unlocked
        ? <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, padding:18, marginBottom:26 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
              {/* lado A */}
              <div>
                <Label>Entrenador A</Label>
                <select value={aId} onChange={e=>{setAId(e.target.value); setAGive([]);}} style={{...inputStyle, cursor:"pointer", width:"100%"}}>
                  <option value="">—</option>
                  {state.coaches.filter(c=>c.id!==bId).map(c=><option key={c.id} value={c.id}>{c.team} ({c.trainer})</option>)}
                </select>
                {aId && <><div style={{ fontSize:12, color:"var(--ink-dim)", marginTop:10 }}>Cede (le quedan {Math.max(0,aRemaining)} de {maxTrade} esta temporada):</div>
                  <PickList picks={aPicks} selected={aGive} setSel={setAGive} remaining={aRemaining} who={cName(aId)} /></>}
              </div>
              {/* lado B */}
              <div>
                <Label>Entrenador B</Label>
                <select value={bId} onChange={e=>{setBId(e.target.value); setBGive([]);}} style={{...inputStyle, cursor:"pointer", width:"100%"}}>
                  <option value="">—</option>
                  {state.coaches.filter(c=>c.id!==aId).map(c=><option key={c.id} value={c.id}>{c.team} ({c.trainer})</option>)}
                </select>
                {bId && <><div style={{ fontSize:12, color:"var(--ink-dim)", marginTop:10 }}>Cede (le quedan {Math.max(0,bRemaining)} de {maxTrade} esta temporada):</div>
                  <PickList picks={bPicks} selected={bGive} setSel={setBGive} remaining={bRemaining} who={cName(bId)} /></>}
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:16, alignItems:"center" }}>
              <button onClick={confirmTrade} style={btnPrimary}>Confirmar intercambio</button>
              {(aGive.length>0||bGive.length>0) && <button onClick={reset} style={btnGhost}>Limpiar selección</button>}
            </div>
          </div>
        : <LockedNote />}

      {/* historial */}
      <div className="rl-display" style={{ fontSize:16, fontWeight:700, margin:"4px 0 12px", color:"var(--silver)" }}>Historial de intercambios</div>
      {trades.length===0
        ? <Empty msg="Aún no hay intercambios registrados." />
        : <div style={{ display:"grid", gap:12 }}>
            {trades.map(t => (
              <div key={t.id} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:12, color:"var(--ink-dim)" }}>
                    {fmtDate(t.ts)}
                    <span style={{ marginLeft:8, padding:"1px 8px", borderRadius:999, background:"var(--chip)", border:"1px solid var(--line)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em" }}>
                      {t.kind==="pool" ? "Pool" : "Equipos"}
                    </span>
                  </div>
                  {unlocked && <button onClick={()=>undoTrade(t)} style={btnGhost}>Revertir</button>}
                </div>
                {t.kind==="pool"
                  ? <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:10, alignItems:"center" }}>
                      <TradeSide team={cName(t.coach)} trainer={cTrainer(t.coach)} gives={[t.out]} mon={mon} align="right" />
                      <div style={{ fontSize:20 }}>⇄</div>
                      <TradeSide team="Pool" trainer="entra al equipo" gives={[t.in]} mon={mon} align="left" />
                    </div>
                  : <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:10, alignItems:"center" }}>
                      <TradeSide team={cName(t.a)} trainer={cTrainer(t.a)} gives={t.aGave} mon={mon} align="right" />
                      <div style={{ fontSize:20 }}>⇄</div>
                      <TradeSide team={cName(t.b)} trainer={cTrainer(t.b)} gives={t.bGave} mon={mon} align="left" />
                    </div>}
              </div>
            ))}
          </div>}
    </div>
  );
}
function TradeSide({ team, trainer, gives, mon, align }) {
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontWeight:700, fontSize:14 }}>{team}</div>
      <div style={{ fontSize:11, color:"var(--ink-dim)", marginBottom:6 }}>{trainer} entrega:</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent: align==="right"?"flex-end":"flex-start" }}>
        {gives.map(id => {
          const p = mon(id);
          return (
            <span key={id} style={{ display:"flex", alignItems:"center", gap:4, background:"var(--chip)", borderRadius:8, padding:"3px 8px 3px 3px", fontSize:12, fontWeight:600 }}>
              <Sprite id={id} name={p?.name} size={24} />{p?.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ============ HELPERS UI ============
function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom:22 }}>
      <h2 className="rl-display" style={{ margin:0, fontSize:40, fontWeight:700, letterSpacing:".01em", lineHeight:1, display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ width:6, height:34, background:"var(--accent)", borderRadius:2, boxShadow:"0 0 12px rgba(194,22,26,0.7)" }} />
        {title}
      </h2>
      {sub && <p style={{ margin:"10px 0 0 20px", color:"var(--ink-dim)", fontSize:14, maxWidth:620, lineHeight:1.5 }}>{sub}</p>}
    </div>
  );
}
function Label({ children }) { return <div style={{ fontSize:12, color:"var(--ink-dim)", marginBottom:6, fontWeight:700 }}>{children}</div>; }
function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ flex:1, minWidth:180 }}>
      <Label>{label}</Label>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...inputStyle, width:"100%"}} />
    </div>
  );
}
function Empty({ msg }) {
  return <div style={{ padding:50, textAlign:"center", color:"var(--ink-dim)", border:"1px dashed var(--line)", borderRadius:14, fontSize:14 }}>{msg}</div>;
}
function Settings({ state, setState, unlocked, logAction }) {
  const s = state.settings;
  // Borrador local: se edita aquí y solo se aplica al pulsar Guardar.
  const [draft, setDraft] = useState({
    leagueName: s.leagueName || "",
    budget: String(s.budget),
    maxCoaches: String(s.maxCoaches),
    maxPicks: String(s.maxPicks),
    maxTrade: String(s.maxTrade),
  });
  const [saved, setSaved] = useState(false);

  // Si cambian los settings desde fuera (otro usuario / importar), refrescar el borrador.
  useEffect(() => {
    setDraft({
      leagueName: s.leagueName || "",
      budget: String(s.budget),
      maxCoaches: String(s.maxCoaches),
      maxPicks: String(s.maxPicks),
      maxTrade: String(s.maxTrade),
    });
  }, [s.leagueName, s.budget, s.maxCoaches, s.maxPicks, s.maxTrade]);

  const fields = [
    { key: "budget",     label: "Puntos a gastar por entrenador",        hint: "Presupuesto que cada entrenador tiene para draftear." },
    { key: "maxCoaches", label: "Cantidad máxima de equipos",            hint: "Tope de entrenadores que se pueden registrar." },
    { key: "maxPicks",   label: "Máximo de Pokémon a draftear",          hint: "Cuántos Pokémon puede tener cada equipo." },
    { key: "maxTrade",   label: "Máximo de Pokémon a intercambiar",      hint: "Cuántos Pokémon puede mover cada equipo en toda la temporada (sumando cambios con el pool e intercambios entre equipos)." },
  ];

  const onChange = (key, val) => {
    // Solo dígitos.
    const clean = val.replace(/[^0-9]/g, "");
    setDraft(d => ({ ...d, [key]: clean }));
    setSaved(false);
  };

  const save = () => {
    const name = draft.leagueName.trim();
    if (!name) { alert("El nombre de la liga no puede quedar vacío."); return; }
    const parsed = { leagueName: name };
    for (const { key, label } of fields) {
      const n = parseInt(draft[key], 10);
      if (!Number.isFinite(n) || n < 1) {
        alert(`«${label}» debe ser un número entero igual o mayor que 1.`);
        return;
      }
      parsed[key] = n;
    }
    // Avisos no bloqueantes si el nuevo límite es menor que lo ya usado.
    const warnings = [];
    if (parsed.maxCoaches < state.coaches.length)
      warnings.push(`Ya hay ${state.coaches.length} equipos registrados, más que el nuevo máximo (${parsed.maxCoaches}). No se eliminará ninguno, pero no podrás añadir más hasta quedar por debajo del límite.`);
    const maxPicksUsed = Math.max(0, ...state.coaches.map(c => (state.picks[c.id] || []).length));
    if (parsed.maxPicks < maxPicksUsed)
      warnings.push(`Algún equipo ya tiene ${maxPicksUsed} Pokémon, más que el nuevo máximo (${parsed.maxPicks}). No se quitará ninguno, pero no se podrán añadir más.`);

    if (warnings.length && !confirm(warnings.join("\n\n") + "\n\n¿Guardar de todas formas?")) return;

    setState(st => ({ ...st, settings: { ...st.settings, ...parsed } }));
    logAction?.("Cambió la configuración de la liga");
    setSaved(true);
  };

  // Reinicia la liga para empezar una nueva temporada: borra drafts, partidos e
  // intercambios, pero CONSERVA equipos/entrenadores, la configuración y el
  // histórico de podios.
  const resetLeague = () => {
    if (!confirm("¿Reiniciar la liga para una nueva temporada?\n\nSe borrarán: los Pokémon drafteados, los partidos y los intercambios.\n\nSe conservarán: los equipos y entrenadores, la configuración y el histórico de podios.\n\nEsta acción no se puede deshacer.")) return;
    if (!confirm("Confirma una vez más: se perderán todos los drafts, resultados e intercambios de la temporada actual.")) return;
    setState(s => ({
      ...s,
      picks: {},
      matches: [],
      trades: [],
    }));
    logAction?.("Reinició la liga para una nueva temporada");
    alert("Liga reiniciada. Los equipos y el histórico se conservaron.");
  };

  const dirty = (s.leagueName || "") !== draft.leagueName || fields.some(({ key }) => String(s[key]) !== draft[key]);

  return (
    <div>
      <SectionTitle title="Configuración" sub="Define las reglas de la liga. Los cambios se aplican al guardar y se guardan en la nube." />
      {!unlocked
        ? <LockedNote />
        : <div style={{ display:"grid", gap:16, maxWidth:560 }}>
            {/* Nombre de la liga */}
            <div style={{ background:"var(--panel)", border:"1px solid var(--line)", padding:18, borderRadius:14 }}>
              <label style={{ display:"block", fontWeight:700, fontSize:14, marginBottom:4 }}>Nombre de la liga</label>
              <div style={{ color:"var(--ink-dim)", fontSize:12, marginBottom:10 }}>Identifica esta liga (aparece en el podio y en el histórico).</div>
              <input
                value={draft.leagueName}
                onChange={e => { setDraft(d => ({ ...d, leagueName: e.target.value })); setSaved(false); }}
                placeholder="Ej. Liga Matachanchos 2026"
                maxLength={60}
                style={{ ...inputStyle, width:"100%", fontSize:16, fontWeight:700 }}
              />
            </div>
            {fields.map(({ key, label, hint }) => (
              <div key={key} style={{ background:"var(--panel)", border:"1px solid var(--line)", padding:18, borderRadius:14 }}>
                <label style={{ display:"block", fontWeight:700, fontSize:14, marginBottom:4 }}>{label}</label>
                <div style={{ color:"var(--ink-dim)", fontSize:12, marginBottom:10 }}>{hint}</div>
                <input
                  value={draft[key]}
                  onChange={e => onChange(key, e.target.value)}
                  inputMode="numeric"
                  style={{ ...inputStyle, width:120, fontSize:16, fontWeight:700 }}
                />
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button onClick={save} disabled={!dirty}
                style={{ ...btnPrimary, opacity: dirty ? 1 : 0.5, cursor: dirty ? "pointer" : "default" }}>
                Guardar cambios
              </button>
              {saved && !dirty && <span style={{ color:"var(--accent)", fontWeight:700, fontSize:13 }}>✓ Guardado</span>}
            </div>
            <AdminManager state={state} setState={setState} logAction={logAction} />

            {/* Reiniciar liga (nueva temporada) */}
            <div style={{ background:"var(--panel)", border:"1px solid var(--accent)", padding:18, borderRadius:14, marginTop:8 }}>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:4, color:"var(--accent-soft)" }}>Reiniciar liga</div>
              <div style={{ color:"var(--ink-dim)", fontSize:12, marginBottom:14, lineHeight:1.5 }}>
                Empieza una nueva temporada: borra los Pokémon drafteados, los partidos y los intercambios.
                Conserva los equipos y entrenadores, la configuración y el histórico de podios.
              </div>
              <button onClick={resetLeague} style={{ ...btnPrimary }}>Reiniciar liga</button>
            </div>
          </div>}
    </div>
  );
}

// Gestión de administradores: cada uno tiene nombre y PIN. Se editan poco, por eso
// viven dentro de Configuración. Siempre debe quedar al menos un administrador.
function AdminManager({ state, setState, logAction }) {
  const admins = state.settings.admins || [];
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");

  const updateAdmin = (id, patch) => {
    setState(st => ({
      ...st,
      settings: { ...st.settings, admins: (st.settings.admins || []).map(a => a.id === id ? { ...a, ...patch } : a) },
    }));
  };

  const removeAdmin = (id) => {
    if (admins.length <= 1) { alert("Debe quedar al menos un administrador."); return; }
    const admin = admins.find(a => a.id === id);
    if (!confirm(`¿Eliminar al administrador «${admin?.name}»?`)) return;
    setState(st => ({
      ...st,
      settings: { ...st.settings, admins: (st.settings.admins || []).filter(a => a.id !== id) },
    }));
    logAction?.(`Eliminó al administrador «${admin?.name}»`);
  };

  const addAdmin = () => {
    const name = newName.trim();
    const pin = newPin.trim();
    if (!name) { alert("El nombre del administrador no puede estar vacío."); return; }
    if (pin.length < 4) { alert("El PIN debe tener al menos 4 caracteres."); return; }
    const id = "admin_" + Date.now().toString(36);
    setState(st => ({
      ...st,
      settings: { ...st.settings, admins: [...(st.settings.admins || []), { id, name, pin }] },
    }));
    logAction?.(`Añadió al administrador «${name}»`);
    setNewName(""); setNewPin("");
  };

  return (
    <div style={{ background:"var(--panel)", border:"1px solid var(--line)", padding:18, borderRadius:14, marginTop:8 }}>
      <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Administradores</div>
      <div style={{ color:"var(--ink-dim)", fontSize:12, marginBottom:16 }}>
        Quienes pueden desbloquear y editar la liga. Cada acción queda registrada en Actividad con el nombre del administrador.
      </div>
      <div style={{ display:"grid", gap:10, marginBottom:18 }}>
        {admins.map(a => (
          <div key={a.id} style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <input
              value={a.name}
              onChange={e => updateAdmin(a.id, { name: e.target.value })}
              placeholder="Nombre"
              style={{ ...inputStyle, flex:1, minWidth:140 }}
            />
            <input
              type="password"
              value={a.pin}
              onChange={e => updateAdmin(a.id, { pin: e.target.value })}
              onCopy={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
              onContextMenu={e => e.preventDefault()}
              autoComplete="new-password"
              placeholder="PIN"
              style={{ ...inputStyle, width:140 }}
            />
            <button onClick={() => removeAdmin(a.id)} style={btnGhost} title="Eliminar administrador">Eliminar</button>
          </div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid var(--line)", paddingTop:14 }}>
        <Label>Añadir administrador</Label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nombre" style={{ ...inputStyle, flex:1, minWidth:140 }} />
          <input type="password" value={newPin} onChange={e=>setNewPin(e.target.value)} onCopy={e=>e.preventDefault()} onCut={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} autoComplete="new-password" placeholder="PIN (mín. 4)" style={{ ...inputStyle, width:140 }} />
          <button onClick={addAdmin} style={btnPrimary}>Añadir</button>
        </div>
      </div>
    </div>
  );
}

// Registro de actividad: lista de las últimas acciones (máx. 100), con quién y cuándo.
// ============ HISTÓRICO DE PODIOS ============
function History({ state, setState, unlocked, logAction }) {
  const [showHidden, setShowHidden] = useState(false);
  const all = state.podiums || [];
  const fmtFull = (ts) => {
    try { return new Date(ts).toLocaleDateString("es", { day:"numeric", month:"long", year:"numeric" }); }
    catch { return ""; }
  };
  // Nombre de un equipo en un podio: usa el guardado, y si no, el actual.
  const nameOf = (p, id) =>
    p.names?.[id]?.team || state.coaches.find(c=>c.id===id)?.team || "—";
  const trainerOf = (p, id) =>
    p.names?.[id]?.trainer || state.coaches.find(c=>c.id===id)?.trainer || "";
  const picksOf = (p, id) =>
    p.picks?.[id] || state.picks?.[id] || [];

  // Contador de trofeos por entrenador (solo cuenta podios NO ocultos).
  const trophies = useMemo(() => {
    const t = {}; // nombreEntrenador -> { gold, silver, bronze }
    all.filter(p => !p.hidden).forEach(p => {
      const add = (id, key) => {
        if (!id) return;
        const name = trainerOf(p, id) || "—";
        if (!t[name]) t[name] = { gold:0, silver:0, bronze:0 };
        t[name][key]++;
      };
      add(p.champion, "gold");
      add(p.runnerUp, "silver");
      add(p.third, "bronze");
    });
    return Object.entries(t)
      .map(([name, c]) => ({ name, ...c, total: c.gold + c.silver + c.bronze }))
      .sort((a,b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || a.name.localeCompare(b.name));
  }, [all, state.coaches]);

  const toggleHidden = (id) => {
    setState(s => ({
      ...s,
      podiums: (s.podiums||[]).map(p => p.id === id ? { ...p, hidden: !p.hidden } : p)
    }));
    logAction?.("Cambió la visibilidad de un podio en el histórico");
  };

  const download = (p) => {
    const places = [
      { place: 1, team: nameOf(p, p.champion), trainer: trainerOf(p, p.champion), picks: picksOf(p, p.champion) },
      ...(p.runnerUp ? [{ place: 2, team: nameOf(p, p.runnerUp), trainer: trainerOf(p, p.runnerUp), picks: picksOf(p, p.runnerUp) }] : []),
      ...(p.third ? [{ place: 3, team: nameOf(p, p.third), trainer: trainerOf(p, p.third), picks: picksOf(p, p.third) }] : []),
    ];
    downloadPodiumImage({ leagueName: p.leagueName, ts: p.ts, places });
  };

  const Row = ({ p, id, place }) => {
    const medal = place===1?"🥇":place===2?"🥈":"🥉";
    return (
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0" }}>
        <span style={{ fontSize:20, width:28, textAlign:"center" }}>{medal}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color: place===1?"var(--accent)":"var(--ink)" }}>{nameOf(p, id)}</div>
          <div style={{ fontSize:11, color:"var(--ink-dim)" }}>{trainerOf(p, id)}</div>
        </div>
      </div>
    );
  };

  const visible = all.filter(p => showHidden || !p.hidden);
  const hiddenCount = all.filter(p => p.hidden).length;

  return (
    <div>
      <SectionTitle title="Histórico de podios" sub="Registro de los podios de todas las ligas jugadas. Se guardan automáticamente al terminar cada torneo." />

      {/* Tabla de trofeos por entrenador */}
      {trophies.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div className="rl-display" style={{ fontSize:16, fontWeight:700, margin:"0 0 12px", color:"var(--silver)" }}>🏆 Trofeos por entrenador</div>
          <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto auto", gap:10, padding:"10px 16px", borderBottom:"1px solid var(--line)", fontSize:11, color:"var(--ink-dim)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>
              <span>Entrenador</span><span style={{textAlign:"center",minWidth:42}}>🥇</span><span style={{textAlign:"center",minWidth:42}}>🥈</span><span style={{textAlign:"center",minWidth:42}}>🥉</span><span style={{textAlign:"center",minWidth:48}}>Total</span>
            </div>
            {trophies.map((r,i) => (
              <div key={r.name} style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto auto", gap:10, padding:"10px 16px", alignItems:"center", borderTop: i>0?"1px solid var(--line)":"none" }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{r.name}</span>
                <span style={{ textAlign:"center", minWidth:42, fontWeight:700 }}>{r.gold || "—"}</span>
                <span style={{ textAlign:"center", minWidth:42, fontWeight:700 }}>{r.silver || "—"}</span>
                <span style={{ textAlign:"center", minWidth:42, fontWeight:700 }}>{r.bronze || "—"}</span>
                <span style={{ textAlign:"center", minWidth:48, fontWeight:800, color:"var(--accent)" }}>{r.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de podios */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:10 }}>
        <div className="rl-display" style={{ fontSize:16, fontWeight:700, color:"var(--silver)" }}>Podios</div>
        {hiddenCount > 0 && (
          <button onClick={()=>setShowHidden(v=>!v)} style={btnGhost}>
            {showHidden ? "Ocultar los podios ocultos" : `Mostrar ocultos (${hiddenCount})`}
          </button>
        )}
      </div>

      {visible.length === 0
        ? <Empty msg="Aún no hay podios. Cuando termine un torneo (al reportar la final), el podio se guardará aquí automáticamente." />
        : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:18 }}>
            {visible.map(p => (
              <div key={p.id} style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, overflow:"hidden", opacity: p.hidden ? 0.55 : 1 }}>
                <div style={{ padding:"16px 18px", borderBottom:"1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                  <div>
                    <div className="rl-display" style={{ fontWeight:700, fontSize:19, lineHeight:1.1 }}>{p.leagueName || "Liga"}</div>
                    <div style={{ color:"var(--ink-dim)", fontSize:12, marginTop:4 }}>{fmtFull(p.ts)}</div>
                  </div>
                  {p.hidden && <span style={{ fontSize:10, fontWeight:700, color:"var(--ink-dim)", border:"1px solid var(--line)", borderRadius:999, padding:"2px 8px", textTransform:"uppercase", letterSpacing:".04em" }}>Oculto</span>}
                </div>
                <div style={{ padding:"10px 18px" }}>
                  <Row p={p} id={p.champion} place={1} />
                  {p.runnerUp && <Row p={p} id={p.runnerUp} place={2} />}
                  {p.third && <Row p={p} id={p.third} place={3} />}
                </div>
                <div style={{ display:"flex", gap:8, padding:"12px 18px", borderTop:"1px solid var(--line)" }}>
                  <button onClick={()=>download(p)} style={btnGhost}>⬇ Imagen</button>
                  {unlocked && <button onClick={()=>toggleHidden(p.id)} style={btnGhost}>{p.hidden ? "Mostrar" : "Ocultar"}</button>}
                </div>
              </div>
            ))}
          </div>}
    </div>
  );
}

function Activity({ state, setState, unlocked }) {
  const log = state.settings.log || [];

  const fmt = (ts) => {
    try {
      return new Date(ts).toLocaleString("es", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return ""; }
  };

  const clearLog = () => {
    if (!log.length) return;
    if (!confirm("¿Vaciar todo el registro de actividad? No se puede deshacer.")) return;
    setState(st => ({ ...st, settings: { ...st.settings, log: [] } }));
  };

  return (
    <div>
      <SectionTitle title="Actividad" sub="Las últimas acciones realizadas en la liga (hasta 100). Se registran al editar con el modo edición abierto." />
      {!unlocked
        ? <LockedNote />
        : log.length === 0
          ? <Empty msg="Aún no hay actividad registrada." />
          : <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
                <button onClick={clearLog} style={btnGhost}>Vaciar registro</button>
              </div>
              <div style={{ display:"grid", gap:8 }}>
                {log.map((e, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:12, flexWrap:"wrap",
                    background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12, padding:"12px 16px"
                  }}>
                    <span className="rl-display" style={{
                      fontSize:12, fontWeight:700, color:"#0a0708", background:"var(--accent)",
                      padding:"3px 10px", borderRadius:999, letterSpacing:".03em", whiteSpace:"nowrap"
                    }}>{e.who}</span>
                    <span style={{ flex:1, minWidth:160, fontSize:14 }}>{e.action}</span>
                    <span style={{ fontSize:12, color:"var(--ink-dim)", whiteSpace:"nowrap" }}>{fmt(e.ts)}</span>
                  </div>
                ))}
              </div>
            </div>}
    </div>
  );
}

function LockedNote() {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10, marginBottom:24,
      background:"var(--panel)", border:"1px solid var(--line)", padding:"14px 18px", borderRadius:12,
      color:"var(--ink-dim)", fontSize:13
    }}>
      <span style={{ fontSize:18 }}>🔒</span>
      Modo solo lectura. Pulsa <strong style={{color:"var(--silver)"}}>🔒 Bloqueado</strong> arriba e introduce la contraseña para editar.
    </div>
  );
}

const inputStyle = { background:"var(--input)", border:"1px solid var(--line)", color:"var(--ink)", padding:"10px 13px", borderRadius:9, fontSize:14, fontFamily:"inherit", outline:"none" };
const btnPrimary = { background:"var(--accent)", color:"#fff", border:"1px solid var(--accent-soft)", padding:"11px 22px", borderRadius:9, fontWeight:700, cursor:"pointer", fontFamily:"'Oswald',sans-serif", fontSize:14, textTransform:"uppercase", letterSpacing:".05em", boxShadow:"0 4px 14px -4px rgba(194,22,26,0.6)" };
const btnGhost = { background:"transparent", color:"var(--ink-dim)", border:"1px solid var(--line)", padding:"7px 12px", borderRadius:8, fontWeight:600, cursor:"pointer", fontFamily:"inherit", fontSize:12 };
const resultBtn = (active) => ({ background: active?"var(--accent)":"var(--chip)", color: active?"#fff":"var(--ink)", border:"1px solid " + (active?"var(--accent-soft)":"var(--line)"), padding:"9px 16px", borderRadius:9, fontWeight:700, cursor:"pointer", fontFamily:"'Oswald',sans-serif", fontSize:14, textTransform:"uppercase", letterSpacing:".03em" });
const stepBtn = { width:28, height:28, borderRadius:7, border:"1px solid var(--line)", background:"var(--chip)", color:"var(--ink)", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"inherit", lineHeight:1, display:"grid", placeItems:"center" };

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  // La sección activa se deriva de la URL. Si la ruta no existe, mostramos Inicio.
  const tab = PATH_TO_TAB[location.pathname] || "home";
  const setTab = (k) => navigate(TAB_TO_PATH[k] || "/");
  const [state, setState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  // Identidad de quien desbloqueó la edición (solo en memoria de esta sesión).
  const [currentAdmin, setCurrentAdmin] = useState(null);
  // Admin elegido en el modal de desbloqueo (por defecto, el primero de la lista).
  const [selectedAdminId, setSelectedAdminId] = useState("");

  // Evita re-guardar lo que acabamos de recibir del servidor.
  const skipNextSave = useRef(false);
  const importInputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadState().then(s => { if (alive) { skipNextSave.current = true; setState(s); } });

    // Tiempo real: si otra persona cambia algo, lo recibimos al instante.
    const channel = subscribeState(remote => {
      skipNextSave.current = true;
      setState(remote);
    });
    return () => { alive = false; if (channel) channel.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!state) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    setSaving(true);
    const t = setTimeout(() => { saveState(state).then(()=>setSaving(false)); }, 400);
    return () => clearTimeout(t);
  }, [state]);

  // Protege TODAS las escrituras: si la liga está bloqueada, ninguna acción
  // (draftear, quitar picks, marcar resultados, intercambios…) modifica el estado.
  // Esto es la salvaguarda real; ocultar botones en la UI es solo cosmético.
  const guardedSetState = (updater) => {
    if (!unlocked) return;
    setState(updater);
  };

  // Registra una acción en el log de actividad. Usa el admin de la sesión y la
  // hora actual. Conserva solo las últimas MAX_LOG entradas (las más recientes
  // van primero). Solo registra si la liga está desbloqueada.
  const logAction = (action) => {
    if (!unlocked) return;
    const who = currentAdmin?.name || "—";
    const entry = { ts: Date.now(), who, action };
    setState(prev => {
      const prevLog = Array.isArray(prev?.settings?.log) ? prev.settings.log : [];
      const nextLog = [entry, ...prevLog].slice(0, MAX_LOG);
      return { ...prev, settings: { ...prev.settings, log: nextLog } };
    });
  };

  // Restaura la liga desde un archivo JSON de respaldo. Sobreescribe TODO el estado.
  // Protegido por candado + confirmación. Valida la forma antes de aplicar.
  const importBackup = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        // Acepta tanto el formato con envoltorio {_backup, state} como un state plano.
        const incoming = parsed && parsed.state ? parsed.state : parsed;
        if (!incoming || typeof incoming !== "object") throw new Error("El archivo no tiene el formato esperado.");
        if (!Array.isArray(incoming.coaches)) throw new Error("Falta la lista de entrenadores (coaches).");
        // Normaliza para garantizar que todos los campos existen y tienen el tipo correcto.
        const clean = {
          coaches: Array.isArray(incoming.coaches) ? incoming.coaches : [],
          picks: (incoming.picks && typeof incoming.picks === "object") ? incoming.picks : {},
          matches: Array.isArray(incoming.matches) ? incoming.matches : [],
          trades: Array.isArray(incoming.trades) ? incoming.trades : [],
          settings: { ...DEFAULT_SETTINGS, ...(incoming.settings || {}) },
        };
        const stamp = parsed && parsed._exportedAt ? `\nFecha del respaldo: ${new Date(parsed._exportedAt).toLocaleString()}` : "";
        const ok = confirm(
          `¿Restaurar la liga desde este respaldo?\n\n` +
          `Entrenadores: ${clean.coaches.length}\n` +
          `Partidos: ${clean.matches.length}\n` +
          `Intercambios: ${clean.trades.length}` + stamp +
          `\n\n⚠ Esto REEMPLAZA por completo los datos actuales de la liga. No se puede deshacer.`
        );
        if (!ok) return;
        setState(clean);
        alert("Respaldo restaurado. Los cambios ya se están guardando en la nube.");
      } catch (e) {
        alert("No se pudo importar el respaldo: " + (e?.message || e));
      }
    };
    reader.onerror = () => alert("No se pudo leer el archivo.");
    reader.readAsText(file);
  };

  // Descarga una copia completa del estado actual de la liga como archivo JSON.
  // Es solo lectura: no modifica nada en la base de datos.
  const exportBackup = () => {
    try {
      const payload = {
        _backup: "ringe-draft-league",
        _exportedAt: new Date().toISOString(),
        state,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const a = document.createElement("a");
      a.href = url;
      a.download = `ringe-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("No se pudo generar el respaldo: " + (e?.message || e));
    }
  };

  const toggleLock = () => {
    if (unlocked) {
      // Al bloquear, registramos el cierre de sesión antes de limpiar la identidad.
      logAction("Cerró el modo edición");
      setUnlocked(false);
      setCurrentAdmin(null);
      return;
    }
    const admins = state?.settings?.admins || [];
    setSelectedAdminId(admins[0]?.id || "");
    setPwInput(""); setPwError(false); setShowPwModal(true);
  };

  const submitPassword = () => {
    const admins = state?.settings?.admins || [];
    const admin = admins.find(a => a.id === selectedAdminId);
    if (admin && pwInput === admin.pin) {
      setUnlocked(true);
      setCurrentAdmin({ id: admin.id, name: admin.name });
      setShowPwModal(false);
      setPwInput(""); setPwError(false);
      // Registramos la apertura de sesión. Usamos el nombre del admin directamente
      // porque currentAdmin aún no se ha propagado en este render.
      const entry = { ts: Date.now(), who: admin.name, action: "Abrió el modo edición" };
      setState(prev => {
        const prevLog = Array.isArray(prev?.settings?.log) ? prev.settings.log : [];
        const nextLog = [entry, ...prevLog].slice(0, MAX_LOG);
        return { ...prev, settings: { ...prev.settings, log: nextLog } };
      });
    } else {
      setPwError(true);
    }
  };

  if (!state) return <div className="rl-display" style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"#0a0708", color:"#8c7775", fontFamily:"'Oswald',sans-serif", letterSpacing:".1em" }}>Cargando liga…</div>;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--ink)", fontFamily:"'Chakra Petch', system-ui, sans-serif", position:"relative" }}>
      <style>{`
        :root {
          --bg:#0a0708; --panel:#16100f; --input:#0e0a0a; --line:#3a1c1d;
          --ink:#ece5e3; --ink-dim:#8c7775; --accent:#c2161a; --accent-soft:#e23a3e;
          --chip:#241413; --hover:#1f1110; --silver:#c9c2bd; --silver-dim:#7a726e;
        }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:10px; height:10px; }
        ::-webkit-scrollbar-track { background:#0a0708; }
        ::-webkit-scrollbar-thumb { background:#3a1c1d; border-radius:999px; }
        ::-webkit-scrollbar-thumb:hover { background:var(--accent); }
        select option { background:#16100f; }
        .rl-display { font-family:'Oswald', sans-serif; text-transform:uppercase; letter-spacing:.01em; }
        .rl-bgnoise {
          position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.5;
          background:
            radial-gradient(circle at 18% 12%, rgba(194,22,26,0.18), transparent 38%),
            radial-gradient(circle at 85% 8%, rgba(120,12,15,0.22), transparent 42%),
            radial-gradient(circle at 50% 120%, rgba(194,22,26,0.10), transparent 55%);
        }
      `}</style>
      <div className="rl-bgnoise" />
      {showPwModal && (
        <div
          onClick={()=>setShowPwModal(false)}
          style={{
            position:"fixed", inset:0, zIndex:50, display:"grid", placeItems:"center",
            background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", padding:20
          }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16,
            padding:24, width:"100%", maxWidth:360, boxShadow:"0 20px 60px -20px rgba(194,22,26,0.5)"
          }}>
            <div className="rl-display" style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>🔒 Modo edición</div>
            <p style={{ color:"var(--ink-dim)", fontSize:13, margin:"0 0 16px", lineHeight:1.5 }}>
              Elige tu nombre de administrador e introduce tu PIN para editar la liga.
            </p>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--silver-dim)", marginBottom:6, textTransform:"uppercase", letterSpacing:".05em" }}>Administrador</label>
            <select
              value={selectedAdminId}
              onChange={e=>{ setSelectedAdminId(e.target.value); setPwError(false); }}
              style={{ ...inputStyle, width:"100%", marginBottom:14, cursor:"pointer" }}
            >
              {(state.settings.admins || []).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <input
              type="password"
              autoFocus
              value={pwInput}
              onChange={e=>{ setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={e=>{ if (e.key === "Enter") submitPassword(); }}
              placeholder="PIN"
              style={{
                ...inputStyle, width:"100%",
                borderColor: pwError ? "var(--accent)" : "var(--line)"
              }}
            />
            {pwError && <div style={{ color:"var(--accent-soft)", fontSize:12, marginTop:8, fontWeight:600 }}>Administrador o PIN incorrecto.</div>}
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={submitPassword} style={{ ...btnPrimary, flex:1 }}>Desbloquear</button>
              <button onClick={()=>setShowPwModal(false)} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ maxWidth:980, margin:"0 auto", padding:"24px 20px 80px", position:"relative", zIndex:1 }}>
        <header style={{ marginBottom:26 }}>
          <div style={{
            position:"relative", borderRadius:18, overflow:"hidden",
            border:"1px solid var(--line)",
            background:"linear-gradient(180deg, #1a0c0d 0%, #0a0708 100%)",
            boxShadow:"0 0 0 1px rgba(0,0,0,0.5), 0 20px 50px -20px rgba(194,22,26,0.4)"
          }}>
            <img src={LOGO} alt="Ringe Draft League" style={{
              display:"block", width:"100%", objectFit:"cover"
            }} />
            <div style={{
              position:"absolute", top:12, right:14, display:"flex", gap:8, alignItems:"center"
            }}>
              <span style={{
                fontSize:11, fontWeight:600,
                color: saving?"var(--accent-soft)":"var(--silver-dim)",
                background:"rgba(0,0,0,0.45)", padding:"4px 10px", borderRadius:999,
                border:"1px solid var(--line)", backdropFilter:"blur(4px)"
              }}>{saving?"Guardando…":"Guardado ✓"}</span>
              {unlocked && (
                <button onClick={exportBackup} title="Descargar una copia de la liga (JSON)" style={{
                  fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Oswald',sans-serif",
                  color:"var(--silver)", background:"rgba(0,0,0,0.45)",
                  padding:"5px 11px", borderRadius:999, border:"1px solid var(--line)",
                  backdropFilter:"blur(4px)", textTransform:"uppercase", letterSpacing:".04em"
                }}>⬇ Respaldo</button>
              )}
              {unlocked && (
                <>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    style={{ display:"none" }}
                    onChange={e => { const f = e.target.files?.[0]; importBackup(f); e.target.value = ""; }}
                  />
                  <button onClick={()=>importInputRef.current?.click()} title="Restaurar la liga desde un archivo JSON" style={{
                    fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Oswald',sans-serif",
                    color:"var(--silver)", background:"rgba(0,0,0,0.45)",
                    padding:"5px 11px", borderRadius:999, border:"1px solid var(--line)",
                    backdropFilter:"blur(4px)", textTransform:"uppercase", letterSpacing:".04em"
                  }}>⬆ Importar</button>
                </>
              )}
              <button onClick={toggleLock} title={unlocked?"Bloquear edición":"Desbloquear edición"} style={{
                fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Oswald',sans-serif",
                color: unlocked?"#0a0708":"var(--silver)",
                background: unlocked?"var(--accent)":"rgba(0,0,0,0.45)",
                padding:"5px 11px", borderRadius:999,
                border:"1px solid " + (unlocked?"var(--accent-soft)":"var(--line)"),
                backdropFilter:"blur(4px)", textTransform:"uppercase", letterSpacing:".04em"
              }}>{unlocked?`🔓 ${currentAdmin?.name || "Editando"}`:"🔒 Bloqueado"}</button>
            </div>
          </div>
          <div className="rl-display" style={{ textAlign:"center", color:"var(--silver-dim)", fontSize:13, marginTop:12, fontWeight:600, letterSpacing:".22em" }}>
            Pokémon VGC · {state.settings.leagueName || "Liga privada"}
          </div>
        </header>
        <Nav tab={tab} setTab={setTab} unlocked={unlocked} />
        {tab==="home" && <Home state={state} setTab={setTab} unlocked={unlocked} logAction={logAction} setState={guardedSetState} />}
        {tab==="board" && <Board state={state} setState={guardedSetState} unlocked={unlocked} logAction={logAction} />}
        {tab==="coaches" && <Coaches state={state} setState={guardedSetState} unlocked={unlocked} logAction={logAction} />}
        {tab==="teams" && <Teams state={state} />}
        {tab==="matchups" && <Matchups state={state} setState={guardedSetState} unlocked={unlocked} logAction={logAction} />}
        {tab==="trades" && <Trades state={state} setState={guardedSetState} unlocked={unlocked} logAction={logAction} />}
        {tab==="history" && <History state={state} setState={guardedSetState} unlocked={unlocked} logAction={logAction} />}
        {tab==="activity" && <Activity state={state} setState={guardedSetState} unlocked={unlocked} />}
        {tab==="settings" && <Settings state={state} setState={guardedSetState} unlocked={unlocked} logAction={logAction} />}
      </div>
    </div>
  );
}
