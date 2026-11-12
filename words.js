/**
 * Szólista a Rajzolj és Emlékezz! játékhoz
 * Bőséges szógyűjtemény könnyű, normál és kifejezetten nehezen lerajzolható feladványokkal.
 * Tartalmazza a kért szavakat: Mikró, Ló, Majomkenyérfa, Megelőzni tilos, stb.
 */

const GAME_WORDS = [
  // --- Kifejezetten nehezen lerajzolható / absztraktabb / összetett szavak ---
  { 
    word: "Mikró", 
    difficulty: "hard", 
    aliases: ["mikro", "mikrohullamu", "mikrohullámú", "mikrohullamu suto", "mikrohullámú sütő", "sütő", "melegítő"] 
  },
  { 
    word: "Ló", 
    difficulty: "hard", 
    aliases: ["lo", "ló", "paripa", "paci", "mén", "csikó", "csiko"] 
  },
  { 
    word: "Majomkenyérfa", 
    difficulty: "hard", 
    aliases: ["majomkenyerfa", "majomkenyérfa", "baobab", "baobabfa"] 
  },
  { 
    word: "Megelőzni tilos", 
    difficulty: "hard", 
    aliases: ["megelozni tilos", "megelőzni tilos", "elozni tilos", "előzni tilos", "elozest tiltó tábla", "kresz tabla", "előzés tilos"] 
  },
  { 
    word: "Fekete lyuk", 
    difficulty: "hard", 
    aliases: ["fekete lyuk", "fekete luk", "black hole", "féreglyuk", "szingularitás"] 
  },
  { 
    word: "DNS spirál", 
    difficulty: "hard", 
    aliases: ["dns", "dns spiral", "dns spirál", "kettős spirál", "genetika"] 
  },
  { 
    word: "Gravitáció", 
    difficulty: "hard", 
    aliases: ["gravitacio", "gravitáció", "tömegvonzás", "lezuhanó alma"] 
  },
  { 
    word: "Időgép", 
    difficulty: "hard", 
    aliases: ["idogep", "időgép", "időutazás", "idoutazas"] 
  },
  { 
    word: "Délibáb", 
    difficulty: "hard", 
    aliases: ["delibab", "délibáb", "mirázs", "illúzió"] 
  },
  { 
    word: "Egyirányú utca", 
    difficulty: "hard", 
    aliases: ["egyiranyu utca", "egyirányú utca", "egyirányú", "egyiranyu", "behajtani tilos"] 
  },
  { 
    word: "Hűtőszekrény", 
    difficulty: "hard", 
    aliases: ["huto", "hűtő", "hutoszekreny", "hűtőszekrény", "frissítő", "fagyasztó"] 
  },
  { 
    word: "Porszívó", 
    difficulty: "hard", 
    aliases: ["porszivo", "porszívó", "takarítógép"] 
  },
  { 
    word: "Lézerkard", 
    difficulty: "hard", 
    aliases: ["lezerkard", "lézerkard", "fénykard", "fenykard", "lightsaber"] 
  },
  { 
    word: "Szfinx", 
    difficulty: "hard", 
    aliases: ["szfinx", "sphinx", "egyiptomi szobor"] 
  },
  { 
    word: "Sakkmatt", 
    difficulty: "hard", 
    aliases: ["matt", "sakkmatt", "sakk-matt", "sakk", "király bukása"] 
  },
  { 
    word: "Wi-Fi jel", 
    difficulty: "hard", 
    aliases: ["wifi", "wi-fi", "wifi jel", "internet", "hullámok"] 
  },
  { 
    word: "Tengeralattjáró", 
    difficulty: "hard", 
    aliases: ["tengeralattjaro", "tengeralattjáró", "búvárhajó", "buvarhajo"] 
  },
  { 
    word: "Metró", 
    difficulty: "hard", 
    aliases: ["metro", "metró", "földalatti", "foldalatti"] 
  },
  { 
    word: "Földrengés", 
    difficulty: "hard", 
    aliases: ["foldrenges", "földrengés", "repedés", "tektonika"] 
  },
  { 
    word: "Körforgalom", 
    difficulty: "medium", 
    aliases: ["korforgalom", "körforgalom", "kör", "kor"] 
  },
  { 
    word: "Piramis", 
    difficulty: "medium", 
    aliases: ["piramis", "piramisok", "gúla"] 
  },
  { 
    word: "Világítótorony", 
    difficulty: "medium", 
    aliases: ["vilagitotorony", "világítótorony", "torony", "fénytorony"] 
  },
  { 
    word: "Léghajó", 
    difficulty: "medium", 
    aliases: ["leghajo", "léghajó", "hőlégballon", "zeppelinn"] 
  },

  // --- Normál és könnyebb tárgyak, állatok, alakzatok ---
  { word: "Napocska", aliases: ["nap", "napocska"] },
  { word: "Házikó", aliases: ["haz", "ház", "haziko", "házikó", "lakás", "otthon"] },
  { word: "Pizza", aliases: ["pizza", "pizzaszelet"] },
  { word: "Pók", aliases: ["pok", "pók", "pókháló"] },
  { word: "Kaktusz", aliases: ["kaktusz", "cactus"] },
  { word: "Szellem", aliases: ["szellem", "kísértet", "kisiertet"] },
  { word: "Szemüveg", aliases: ["szemuveg", "szemüveg", "okuláré"] },
  { word: "Repülőgép", aliases: ["repulo", "repülő", "repulogep", "repülőgép", "repcsi"] },
  { word: "Esernyő", aliases: ["esernyo", "esernyő", "napernyő"] },
  { word: "Fagylalt", aliases: ["fagyi", "fagylalt", "jégkrém", "jegkrem"] },
  { word: "Horgony", aliases: ["horgony"] },
  { word: "Zsiráf", aliases: ["zsiraf", "zsiráf"] },
  { word: "Gitár", aliases: ["gitar", "gitár"] },
  { word: "Macska", aliases: ["macska", "cica", "macsek"] },
  { word: "Kutya", aliases: ["kutya", "kiskutya", "eb", "kutyus"] },
  { word: "Hal", aliases: ["hal", "halacska", "halak"] },
  { word: "Kígyó", aliases: ["kigyo", "kígyó"] },
  { word: "Pillangó", aliases: ["pillango", "pillangó", "lepke"] },
  { word: "Elefánt", aliases: ["elefant", "elefánt"] },
  { word: "Nyúl", aliases: ["nyul", "nyúl", "nyuszi"] },
  { word: "Bagoly", aliases: ["bagoly", "bagolyka"] },
  { word: "Béka", aliases: ["beka", "béka", "breki"] },
  { word: "Cápa", aliases: ["capa", "cápa"] },
  { word: "Csiga", aliases: ["csiga", "csigabiga"] },
  { word: "Teknős", aliases: ["teknos", "teknős", "teknősbéka", "teknosbeka"] },
  { word: "Pingvin", aliases: ["pingvin"] },
  { word: "Polip", aliases: ["polip"] },
  { word: "Alma", aliases: ["alma"] },
  { word: "Banán", aliases: ["banan", "banán"] },
  { word: "Torta", aliases: ["torta", "süti", "szülinapi torta"] },
  { word: "Hamburger", aliases: ["burger", "hamburger", "hambi"] },
  { word: "Sajt", aliases: ["sajt"] },
  { word: "Görögdinnye", aliases: ["dinnye", "gorogdinnye", "görögdinnye"] },
  { word: "Gomba", aliases: ["gomba", "gombák"] },
  { word: "Cseresznye", aliases: ["cseresznye", "meggy"] },
  { word: "Fánk", aliases: ["fank", "fánk", "donut"] },
  { word: "Hold", aliases: ["hold", "félhold", "telihold"] },
  { word: "Csillag", aliases: ["csillag", "csillagok"] },
  { word: "Felhő", aliases: ["felho", "felhő", "felhők"] },
  { word: "Fa", aliases: ["fa", "fácska", "lombkorona"] },
  { word: "Virág", aliases: ["virag", "virág", "tulipán", "rózsa"] },
  { word: "Hegy", aliases: ["hegy", "hegycsúcs", "vulkán"] },
  { word: "Szivárvány", aliases: ["szivarvany", "szivárvány"] },
  { word: "Villám", aliases: ["villam", "villám", "mennykő"] },
  { word: "Hóember", aliases: ["hoember", "hóember"] },
  { word: "Autó", aliases: ["auto", "autó", "kocsi", "gépkocsi"] },
  { word: "Hajó", aliases: ["hajo", "hajó", "vitorlás", "csónak"] },
  { word: "Bicikli", aliases: ["bicikli", "kerékpár", "kerekpar", "bringa"] },
  { word: "Vonat", aliases: ["vonat", "mozdony"] },
  { word: "Rakéta", aliases: ["raketa", "rakéta", "űrhajó"] },
  { word: "Helikopter", aliases: ["helikopter", "heli"] },
  { word: "Szív", aliases: ["sziv", "szív", "szívecske"] },
  { word: "Lufi", aliases: ["lufi", "léggömb", "leggomb"] },
  { word: "Csésze", aliases: ["csesze", "csésze", "bögre", "bogre", "kávé", "tea"] },
  { word: "Kalap", aliases: ["kalap", "sapka"] },
  { word: "Óra", aliases: ["ora", "óra", "karóra", "falióra"] },
  { word: "Kulcs", aliases: ["kulcs"] },
  { word: "Telefon", aliases: ["telefon", "mobil", "okostelefon"] },
  { word: "Gyertya", aliases: ["gyertya", "láng"] },
  { word: "Olló", aliases: ["ollo", "olló"] },
  { word: "Lámpa", aliases: ["lampa", "lámpa", "izzó", "villanykörte"] },
  { word: "Korona", aliases: ["korona"] },
  { word: "Szem", aliases: ["szem", "szempár"] },
  { word: "Bajusz", aliases: ["bajusz"] },
  { word: "Kenyér", aliases: ["kenyer", "kenyér", "cipó"] },
  { word: "Pohár", aliases: ["pohar", "pohár"] },
  { word: "Kard", aliases: ["kard", "szablya"] },
  { word: "Pénz", aliases: ["penz", "pénz", "érme", "erme", "bankjegy"] },
  { word: "Zokni", aliases: ["zokni"] },
  { word: "Cipő", aliases: ["cipo", "cipő", "bakancs", "csizma"] },
  { word: "Kéz", aliases: ["kez", "kéz", "tenyér", "ujj"] },
  { word: "Híd", aliases: ["hid", "híd"] },
  { word: "Sátor", aliases: ["sator", "sátor"] },
  { word: "Doboz", aliases: ["doboz", "ajándék", "ajandek"] },
  { word: "Tükör", aliases: ["tukor", "tükör"] },
  { word: "Fogkefe", aliases: ["fogkefe", "fogkrém"] },
  { word: "Kalapács", aliases: ["kalapacs", "kalapács"] },
  { word: "Toll", aliases: ["toll", "golyóstoll", "madártoll"] },
  { word: "Lakat", aliases: ["lakat", "zár"] },
  { word: "Létra", aliases: ["letra", "létra"] },
  { word: "Hordó", aliases: ["hordo", "hordó"] },
  { word: "Pajzs", aliases: ["pajzs"] },
  { word: "Távcső", aliases: ["tavcso", "távcső", "teleszkóp"] },
  { word: "Vödör", aliases: ["vodor", "vödör", "dézsa"] },
  { word: "Seprű", aliases: ["sepru", "seprű", "partvis"] },
  { word: "Mikrofon", aliases: ["mikrofon"] },
  { word: "Gördeszka", aliases: ["gordeszka", "gördeszka", "deszka"] },
  { word: "Foci", aliases: ["focilabda", "foci", "labda"] },
  { word: "Pattogatott kukorica", aliases: ["popcorn", "pattogatott kukorica", "kukorica"] },
  { word: "Szemetes", aliases: ["kuka", "szemetes", "szemeteskuka"] },
  { word: "Kerék", aliases: ["kerek", "kerék", "abroncs"] },
  { word: "Koponya", aliases: ["koponya", "csontváz"] },
  { word: "Smiley", aliases: ["smiley", "mosoly", "szmájli", "mosolygó fej"] },
  { word: "Csont", aliases: ["csont"] },
  { word: "Könyv", aliases: ["konyv", "könyv", "füzet"] }
];

/**
 * Kiválaszt n darab véletlenszerű, egyedi szót a listából.
 * Ha 'hard' vagy 'extreme' módról van szó, garantáltan belekerülnek a nehezebb feladványok is!
 */
function getRandomWords(count = 15, difficulty = 'normal') {
  let pool = [...GAME_WORDS];

  if (difficulty === 'extreme') {
    // Extrém módban a nehéz szavak előnyt élveznek
    const hardWords = pool.filter(w => w.difficulty === 'hard');
    const otherWords = pool.filter(w => w.difficulty !== 'hard');
    
    // Legalább 6-8 nehéz szó garantáltan kerüljön bele
    hardWords.sort(() => 0.5 - Math.random());
    otherWords.sort(() => 0.5 - Math.random());

    const selected = [...hardWords.slice(0, 8), ...otherWords];
    selected.sort(() => 0.5 - Math.random());
    return selected.slice(0, count);
  }

  // Normál vagy könnyű módban vegyesen, véletlenszerűen
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Szövegek normalizálása és összehasonlítása ékezet-, kisbetű- és elírás-toleranciával
 */
function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // ékezetek eltávolítása
    .replace(/[^a-z0-9]/g, "");     // speciális karakterek eltávolítása
}

/**
 * Levenshtein távolság az apró elírások kezelésére
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // törlés
          dp[i][j - 1] + 1,      // beszúrás
          dp[i - 1][j - 1] + 1   // csere
        );
      }
    }
  }
  return dp[m][n];
}

/**
 * Ellenőrzi, hogy a beírt tipp helyes-e az eredeti szóhoz vagy szinonimáihoz képest
 */
function checkAnswerMatch(targetWordObj, guess) {
  if (!guess || !guess.trim()) return false;
  
  const normGuess = normalizeText(guess);
  if (!normGuess) return false;

  const validOptions = [
    normalizeText(targetWordObj.word),
    ...(targetWordObj.aliases || []).map(normalizeText)
  ];

  // 1. Pontos egyezés (ékezet nélkül is)
  if (validOptions.includes(normGuess)) return true;

  // 2. Részleges egyezés: ha a tipp tartalmazza a szót vagy fordítva (legalább 4 betűs opcióknál)
  for (const opt of validOptions) {
    if (opt.length >= 4 && (normGuess.includes(opt) || opt.includes(normGuess))) {
      return true;
    }
  }

  // 3. Elírás-tolerancia (Levenshtein távolság):
  // 4-6 betűs szónál max 1 karakter eltérés, 7+ betűnél max 2 karakter eltérés
  for (const opt of validOptions) {
    const dist = levenshteinDistance(normGuess, opt);
    const maxAllowed = opt.length >= 7 ? 2 : opt.length >= 4 ? 1 : 0;
    if (dist <= maxAllowed) {
      return true;
    }
  }

  return false;
}
