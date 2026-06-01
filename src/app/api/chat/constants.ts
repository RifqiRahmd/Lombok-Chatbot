// ===================================================
// TYPO MAP — koreksi typo umum sebelum diproses
// ===================================================
export const TYPO_MAP: Record<string, string> = {
  // restoran
  "restorant": "restoran", "restrant": "restoran", "resoran": "restoran",
  "restoram": "restoran", "rsto": "restoran", "retoran": "restoran",
  // rekomendasi
  "rekomen": "rekomendasi", "rekomendsi": "rekomendasi",
  "rekomenasi": "rekomendasi", "rekomendai": "rekomendasi",
  "rekomendasii": "rekomendasi", "rekomendasikan": "rekomendasi",
  // harga
  "murh": "murah", "mrah": "murah", "muarh": "murah",
  "maahl": "mahal", "mhal": "mahal",
  "sedng": "sedang", "sdang": "sedang", "sedeng": "sedang",
  // rating
  "ratng": "rating", "ratign": "rating", "rting": "rating",
  // daerah — senggigi
  "sengggi": "senggigi", "senggii": "senggigi", "sengigi": "senggigi",
  "senggig": "senggigi", "snggigi": "senggigi",
  // daerah — mataram
  "matram": "mataram", "mtrm": "mataram", "matarm": "mataram",
  "mataaram": "mataram", "mataramm": "mataram",
  // daerah — gili trawangan
  "gili trwangan": "gili trawangan", "gili trawagan": "gili trawangan",
  "gili trawangn": "gili trawangan", "gili trawangann": "gili trawangan",
  "gilit rawangan": "gili trawangan", "gilitrawangan": "gili trawangan",
  "gil trangan" : "gili trawangan",
  // daerah — gili meno
  "gili mno": "gili meno", "gilimeno": "gili meno", "gili mneo": "gili meno",
  // daerah — gili air
  "gili aer": "gili air", "giliair": "gili air", "gili ar": "gili air",
  // daerah — gili asahan
  "gili asahn": "gili asahan", "gili asahann": "gili asahan",
  // daerah — gili gede
  "gili ged": "gili gede", "giligede": "gili gede", "gili gde": "gili gede",
  // daerah — kuta
  "kutta": "kuta", "kuta lombok": "kuta",
  // daerah — sengkol
  "sngkol": "sengkol", "sengkoll": "sengkol", "sengkel": "sengkol",
  // daerah — bonjeruk
  "bonjerk": "bonjeruk", "bon jeruk": "bonjeruk", "bonjruk": "bonjeruk",
  // daerah — praya
  "prya": "praya", "paraya": "praya", "praya lombok": "praya",
  // daerah — sekotong barat
  "sekotong": "sekotong barat", "skotong barat": "sekotong barat",
  "sekotong brat": "sekotong barat", "sekotongbarat": "sekotong barat",
  // daerah — tanjung
  "tnjung": "tanjung", "tanjuung": "tanjung", "tanjug": "tanjung",
  // daerah — suranadi
  "surandi": "suranadi", "surnadi": "suranadi", "suranai": "suranadi",
  // daerah — tetebatu
  "tetebtu": "tetebatu", "tetbatu": "tetebatu", "tete batu": "tetebatu",
  // daerah — masbagik
  "masbgik": "masbagik", "masbagick": "masbagik", "masbaik": "masbagik",
  // daerah — sigar penjalin
  "sigar pnjalin": "sigar penjalin", "sigarpenjalin": "sigar penjalin",
  "sigar penjalinn": "sigar penjalin",
  // daerah — selong belanak
  "selong blanak": "selong belanak", "selongbelanak": "selong belanak",
  "selong belnk": "selong belanak",
  // daerah — tumpak
  "tmpak": "tumpak", "tumpakk": "tumpak",
  // daerah — sandik
  "sndik": "sandik", "sandick": "sandik",
  // daerah — malaka
  "malakka": "malaka", "mlaka": "malaka",
  // daerah — senaru
  "snaru": "senaru", "senaruu": "senaru", "senuru": "senaru",
  // makanan
  "seafod": "makanan laut", "seaffod": "makanan laut", "seafood": "makanan laut",
  "suhsi": "sushi",
  "piza": "pizza", "pizzza": "pizza",
  "burgr": "burger", "burgerr": "burger",
  "nsi goreng": "nasi goreng", "mi goreng": "mie goreng", "miegoreng": "mie goreng",
  // jenis tempat
  "kafe": "cafe", "kaffe": "cafe", "caffe": "cafe", "cofee": "cafe", "coffe": "cafe",
  "warng": "warung", "warug": "warung", "waring": "warung",
  // kata umum
  "carikan": "cari", "tmukan": "temukan", "tunjukan": "tunjukkan",
  "yg": "yang", "dgn": "dengan", "utk": "untuk",
  "gk": "tidak", "gak": "tidak", "nggak": "tidak", "bkn": "bukan", "tdk": "tidak",
};

// ===================================================
// KNOWN WORDS — untuk fuzzy matching Levenshtein
// ===================================================
export const KNOWN_WORDS: string[] = [
  // kata umum
  "restoran", "rekomendasi", "murah", "mahal", "sedang", "rating",
  "harga", "daerah", "laut", "makan", "cafe", "warung", "kuliner",
  "menu", "tempat", "lombok", "oleh", "pusat", "makanan", "minuman",
  "sushi", "pizza", "burger",
  // semua daerah yang tersedia di database
  "sengkol", "bonjeruk", "praya", "tanjung", "suranadi", "tetebatu",
  "masbagik", "kuta", "mataram", "senggigi", "senaru", "sandik",
  "malaka", "tumpak",
  // komponen kata daerah multi-kata
  "trawangan", "meno", "asahan", "gede", "sekotong", "barat",
  "sigar", "penjalin", "selong", "belanak",
];

// ===================================================
// DAFTAR DAERAH VALID — untuk validasi dan prompt
// ===================================================
export const DAERAH_LIST: string[] = [
  "sengkol", "bonjeruk", "gili meno", "gili air", "praya",
  "sekotong barat", "tanjung", "suranadi", "tetebatu", "masbagik",
  "gili asahan", "gili gede", "sigar penjalin", "selong belanak",
  "tumpak", "sandik", "malaka", "senaru", "kuta",
  "mataram", "gili trawangan", "senggigi",
];
