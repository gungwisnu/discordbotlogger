import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import './ReactionRoles.css';

const STANDARD_EMOJIS = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '🤔', '🤫', '🫠', '🫣', '🫡', '🥱'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️', '🦂', '🐢', '🐍', '🦎', '🐙', '🦑', '🦞', '🦀', '🐡', '🐠', '🐬', '🐳', '🦈'],
  food: ['🍏', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍞', '🥐', '🥖', '🥨', '🧀', '🍳', '🥞', '🧇', '🥓', '🥩', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍿', '🧁', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏹', '🎣', '🥊', '🥋', '🛹', '🛼', '🏋️', '🚴', '🏊', '🤽', '🤸', '🤾', '🏌️', '🏇', '🧘', '🎮', '🕹️', '🎰', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🚲', '🛴', '🛹', '🚏', '🛣️', '🚂', '✈️', '🚁', '🚀', '🛸', '⛵', '🚢', '⚓', '🌙', '☀️', '☁️', '🌧️', '❄️', '🌋', '⛺', '🏕️', '🏖️', '⛰️', '🏛️', '⛪', '🕌', '⛩️', '🎡', '🎢', '🗼', '🗻'],
  objects: ['💡', '🔦', '🕯️', '🗑️', '🛒', '💸', '💵', '🪙', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '⛏️', '🪓', '⚙️', '🧲', '🔫', '💣', '🛡️', '⚔️', '🔮', '🔭', '🔬', '🧪', '🩹', '🩺', '🔑', '🗝️', '📦', '📫', '✉️', '✏️', '📝', '📂', '📅', '📖', '📌', '📎', '✂️', '☎️', '💻', '📷', '📺', '⌚'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☯️', '✡️', '☸️', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎', '🎴', '🌀', '💤', '🛑', '⚠️', '🚫', '💯', '💲'],
  flags: ['🏁', '🚩', '🏴', '🏳️', '🇮🇩', '🇺🇸', '🇯🇵', '🇬🇧', '🇰🇷', '🇨🇳', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹', '🇷🇺', '🇨🇦', '🇦🇺', '🇧🇷', '🇮🇳', '🇸🇬', '🇲🇾', '🇹🇭', '🇻🇳', '🇵🇭', '🇸🇦', '🇹🇷', '🇪🇬', '🇿🇦', '🇳🇿', '🇲🇽', '🇨🇭', '🇳🇱', '🇧🇪', '🇸🇪', '🇳🇴', '🇫🇮', '🇩🇰', '🇮🇪', '🇦🇹', '🇵🇱', '🇺🇦']
};

const EMOJI_KEYWORDS = {
  '😀': 'grinning smile happy laughing senyum gembira ria',
  '😃': 'grinning smile happy laughing senyum gembira ria',
  '😄': 'grinning smile happy laughing senyum gembira ria',
  '😁': 'beaming smile happy laughing senyum gembira ria',
  '😆': 'grinning squinting smile happy laughing senyum gembira ria',
  '😅': 'grinning sweat smile happy laughing senyum gembira ria keringat',
  '😂': 'joy tears laugh crying happy tertawa menangis ngakak',
  '🤣': 'rofl laugh laughing rolling tertawa ngakak',
  '😊': 'smiling happy warm senyum gembira ria hangat',
  '😇': 'halo angel holy baik suci malaikat',
  '🙂': 'slight smile senyum tipis biasa',
  '🙃': 'upside down terbalik',
  '😉': 'wink kedip mata',
  '😌': 'relieved tenang lega santai',
  '😍': 'heart eyes love cinta suka naksir',
  '🥰': 'hearts smiling love cinta sayang hangat',
  '😘': 'blow kiss love cium ciuman sayang',
  '😋': 'yum delicious food tasty lezat enak nyam',
  '😛': 'tongue melet lidah',
  '😜': 'wink tongue kedip melet lidah',
  '🤪': 'zany crazy gila lucu konyol',
  '🤨': 'raised eyebrow bingung heran curiga',
  '🧐': 'monocle pintar inspect teliti',
  '🤓': 'nerd pintar culun kacamata',
  '😎': 'cool sunglasses kece keren gaya kaca mata hitam',
  '🥸': 'disguise menyamar topeng kumis kacamata',
  '🤩': 'star struck takjub keren bintang terpana',
  '🥳': 'party celebration ultah pesta selamat ulang tahun',
  '😏': 'smirk licik sombong',
  '😒': 'unamused kesal bosan sebal malas',
  '😞': 'disappointed kecewa sedih murung',
  '😔': 'pensive merenung sedih murung',
  '🥺': 'pleading beg memohon sedih melas',
  '😢': 'sad cry crying menangis sedih air mata',
  '😭': 'loud cry crying menangis sedih parah kejer',
  '😤': 'triumph angry marah kesal hembus nafas',
  '😠': 'angry marah kesal sebal',
  '😡': 'pouting angry marah merah murka',
  '🤬': 'swearing swearing kasar toxic memaki sensor',
  '🤯': 'exploding mind blown pusing takjub meledak otak',
  '😳': 'flushed shocked malu kaget memerah',
  '🥵': 'hot panas gerah demam lidah',
  '🥶': 'cold dingin beku es',
  '😱': 'scared scream takut kaget histeris teriak',
  '🤔': 'thinking memikirkan bingung mikir',
  '🤫': 'shush quiet diam silent sst',
  '🫠': 'melting meleleh',
  '🫣': 'peeking mengintip malu takut',
  '🫡': 'saluting hormat siap komandan',
  '🥱': 'yawning mengantuk bosan nguap',
  '🐶': 'dog puppy anjing guguk hewan animal pet peliharaan',
  '🐱': 'cat kitten kucing hewan animal pet peliharaan meong',
  '🐭': 'mouse tikus hewan animal',
  '🐹': 'hamster hewan animal pet',
  '🐰': 'rabbit bunny kelinci hewan animal pet',
  '🦊': 'fox rubah hewan animal',
  '🐻': 'bear beruang hewan animal',
  '🐼': 'panda hewan animal',
  '🐨': 'koala hewan animal',
  '🐯': 'tiger harimau hewan animal macan',
  '🦁': 'lion singa hewan animal',
  '🐮': 'cow sapi hewan animal lembu',
  '🐷': 'pig babi hewan animal',
  '🐸': 'frog katak kodok hewan animal',
  '🐵': 'monkey monkey face monyet kera hewan animal',
  '🐔': 'chicken ayam hewan animal unggas bird',
  '🐧': 'penguin pinguin hewan animal bird burung',
  '🐦': 'bird burung hewan animal unggas',
  '🐤': 'chick anak ayam hewan animal bird burung',
  '🦆': 'duck bebek hewan animal bird burung unggas',
  '🦅': 'eagle elang hewan animal bird burung perkasa',
  '🦉': 'owl burung hantu hewan animal bird',
  '🦇': 'bat kelelawar hewan animal batman',
  '🐺': 'wolf serigala hewan animal',
  '🐗': 'boar babi hutan hewan animal',
  '🐴': 'horse kuda hewan animal',
  '🦄': 'unicorn kuda poni gaib unicorn',
  '🐝': 'bee lebah madu serangga insect hewan animal',
  '🐛': 'bug caterpillar ulat serangga insect',
  '🦋': 'butterfly kupu kupu serangga insect',
  '🐌': 'snail siput hewan animal lambat',
  '🐞': 'ladybug kumbang serangga insect',
  '🐜': 'ant semut serangga insect',
  '🕷️': 'spider laba laba serangga insect',
  '🦂': 'scorpion kalajengking serangga insect berbisa',
  '🐢': 'turtle kura kura hewan animal lambat',
  '🐍': 'snake ular reptil hewan animal naga',
  '🦎': 'lizard kadal reptil hewan animal',
  '🐙': 'octopus gurita hewan laut animal sea',
  '🦑': 'squid cumi cumi hewan laut animal sea',
  '🦞': 'lobster lobster udang karang animal sea',
  '🦀': 'crab kepiting animal sea kepiting',
  '🐡': 'blowfish ikan buntal animal sea fish',
  '🐠': 'tropical fish ikan hias animal sea',
  '🐬': 'dolphin lumba lumba animal sea',
  '🐳': 'whale paus animal sea',
  '🦈': 'shark hiu predator animal sea',
  '🍏': 'green apple apel hijau fruit buah sehat',
  '🍎': 'red apple apel merah fruit buah sehat',
  '🍊': 'tangerine orange jeruk fruit buah',
  '🍋': 'lemon lemon fruit buah masam kuning',
  '🍌': 'banana pisang fruit buah monyet kuning',
  '🍉': 'watermelon semangka fruit buah segar merah',
  '🍇': 'grapes anggur fruit buah ungu',
  '🍓': 'strawberry stroberi fruit buah merah asam',
  '🍒': 'cherries ceri fruit buah merah',
  '🍑': 'peach persik fruit buah',
  '🥭': 'mango mangga fruit buah manis',
  '🍍': 'pineapple nanas fruit buah kuning',
  '🥥': 'coconut kelapa fruit buah santan',
  '🥝': 'kiwi kiwi fruit buah',
  '🍅': 'tomato tomat fruit buah sayur merah',
  '🍆': 'eggplant terong sayur violet ungu',
  '🥑': 'avocado alpukat fruit buah mentega',
  '🥦': 'broccoli brokoli sayur sehat hijau',
  '🥬': 'leafy green sayur sayuran hijau',
  '🥒': 'cucumber timun sayur segar lalap',
  '🌶️': 'hot pepper cabai pedas sambal merah hot',
  '🌽': 'corn jagung makanan sayur manis bakar',
  '🥕': 'carrot wortel sayur kelinci sehat oranye',
  '🥔': 'potato kentang sayur karbohidrat goreng',
  '🍞': 'bread roti makanan sarapan tawar',
  '🥐': 'croissant roti sabit makanan sarapan prancis',
  '🥖': 'baguette roti panjang prancis makanan',
  '🥨': 'pretzel kue pretzel makanan asin cemilan',
  '🧀': 'cheese keju susu makanan yellow asin',
  '🍳': 'egg cooking telur ceplok wajan penggorengan',
  '🥞': 'pancakes kue dadar sarapan manis sirup',
  '🧇': 'waffle waffle kue sarapan manis',
  '🥓': 'bacon bacon daging babi asap makanan sarapan',
  '🥩': 'meat cut beef steak daging sapi mentah barbeque bbq',
  '🍔': 'hamburger burger fast food makanan cepat saji daging',
  '🍟': 'french fries kentang goreng fast food makanan cemilan',
  '🍕': 'pizza pizza italian fast food makanan keju',
  '🌭': 'hotdog sosis roti makanan saji fast food',
  '🥪': 'sandwich roti isi makanan sarapan bekal',
  '🌮': 'taco taco mexican makanan saji daging',
  '🌯': 'burrito burrito mexican makanan daging nasi',
  '🍿': 'popcorn popcorn jagung bioskop cemilan nonton',
  '🧁': 'cupcake cupcake kue mangkok manis cokelat',
  '🍩': 'doughnut donat manis cemilan bolong',
  '🍪': 'cookie kue kering cokelat cemilan cookies',
  '🎂': 'birthday cake kue ulang tahun ultah lilin pesta',
  '🍫': 'chocolate bar cokelat batang manis coklat',
  '🍬': 'candy permen manis sugar',
  '🍭': 'lollipop permen gagang lolipop manis manisan',
  '⚽': 'soccer football bola kaki olahraga sports main',
  '🏀': 'basketball bola basket olahraga sports main ring',
  '🏈': 'american football bola rugby olahraga sports',
  '⚾': 'baseball bola kasti olahraga sports pemukul',
  '🥎': 'softball softball kasti olahraga sports',
  '🎾': 'tennis tenis olahraga sports raket lapangan',
  '🏐': 'volleyball bola voli olahraga sports net',
  '🏉': 'rugby rugby olahraga sports',
  '🎱': 'billiards biliar bola 8 olahraga sports',
  '🏓': 'ping pong tenis meja olahraga sports raket',
  '🏸': 'badminton bulu tangkis olahraga sports raket kok',
  '🏒': 'ice hockey hoki es olahraga sports stik',
  '🏹': 'bow arrow panahan panah target jitu sports',
  '🎣': 'fishing rod memancing ikan kail hobi sungai laut',
  '🥊': 'boxing glove tinju olahraga sports jotos sarung',
  '🥋': 'martial arts karate taekwondo silat bela diri sports baju',
  '🛹': 'skateboard papan seluncur skateboard sports jalanan',
  '🛼': 'roller skate sepatu roda sports meluncur jalanan',
  '🏋️': 'weightlifter angkat besi olahraga sports gym otot fit',
  '🚴': 'cyclist bersepeda sepeda olahraga sports gowes jalan',
  '🏊': 'swimmer berenang renang air olahraga sports kolam',
  '🤽': 'water polo polo air olahraga sports kolam',
  '🤸': 'gymnast senam artistik olahraga sports lentur',
  '🤾': 'handball bola tangan olahraga sports',
  '🏌️': 'golfer golf olahraga sports stik padang',
  '🏇': 'horse racing pacuan kuda olahraga sports joki',
  '🧘': 'yoga meditasi zen tenang santai sehat',
  '🎮': 'video game gamepad game controller main ps xbox nintendo',
  '🕹️': 'joystick game retro main dindong klasik',
  '🎰': 'slot machine judi kasino hoki jackpot',
  '🎲': 'game die dadu ludo monopoli main board game untung',
  '🧩': 'puzzle teka teki mainan asah otak',
  '🎭': 'performing arts topeng teater drama seni akting',
  '🎨': 'artist palette cat lukis lukisan gambar menggambar kuas seni art',
  '🎬': 'clapperboard film bioskop syuting sutradara kamera',
  '🎤': 'microphone mikrofon mic nyanyi lagu karaoke mc pidato',
  '🎧': 'headphone earphone dengar lagu musik dj gaming mic',
  '🎼': 'musical score nada lagu musik partitur seni',
  '🎹': 'musical keyboard piano musik nada instrumen',
  '🥁': 'drum drum stik musik tabuh instrumen',
  '🎷': 'saxophone saksofon musik tiup instrumen',
  '🎺': 'trumpet terompet musik tiup instrumen pesta',
  '🎸': 'guitar gitar musik petik instrumen band melodi',
  '🪕': 'banjo banjo musik petik instrumen tradisional',
  '🎻': 'violin biola musik gesek instrumen orkestra',
  '🚗': 'red car mobil merah jalan raya transportasi mudik',
  '🚕': 'taxi taksi kuning transportasi umum penumpang',
  '🚙': 'suv car mobil biru transportasi jalanan',
  '🚌': 'bus bis transportasi umum rombongan penumpang mudik',
  '🚎': 'trolleybus bis listrik transportasi',
  '🏎️': 'racing car mobil balap f1 speed kencang sports',
  '🚓': 'police car mobil polisi sirine patroli keamanan amankan',
  '🚑': 'ambulance ambulans rumah sakit darurat sirine medis',
  '🚒': 'fire engine pemadam kebakaran damkar sirine air padam',
  '🚐': 'minibus minibus mobil transportasi travel',
  '🛻': 'pickup truck mobil pikap muatan barang angkut',
  '🚚': 'delivery truck truk pengirim kurir paket ekspedisi',
  '🚛': 'articulated lorry truk besar muatan kontainer cargo',
  '🚜': 'tractor traktor sawah kebun tani bajak tanah',
  '🛵': 'motor scooter motor matic vespa ojek berkendara',
  '🚲': 'bicycle sepeda gowes olahraga sports kayuh',
  '🛴': 'kick scooter otoped mainan anak luncur',
  '🚏': 'bus stop halte bis menunggu penumpang',
  '🛣️': 'motorway jalan tol jalan bebas hambatan lurus',
  '🚂': 'locomotive kereta api lokomotif stasiun uap rel',
  '✈️': 'airplane pesawat terbang bandara udara liburan cargo flight',
  '🚁': 'helicopter helikopter baling udara medis polisi terbang',
  '🚀': 'rocket roket luar angkasa terbang meluncur astronot',
  '🛸': 'flying saucer ufo alien piring terbang misteri',
  '⛵': 'sailboat kapal layar laut air perahu nelayan',
  '🚢': 'ship kapal laut pesiar cargo besar pelabuhan samudera',
  '⚓': 'anchor jangkar kapal laut air pelabuhan',
  '🌙': 'crescent moon bulan sabit malam night tidur gelap',
  '☀️': 'sun matahari terik panas siang day cerah',
  '☁️': 'cloud awan mendung langit cuaca',
  '🌧️': 'cloud with rain hujan air basah badai cuaca dingin',
  '❄️': 'snowflake salju dingin es beku salju kristal',
  '🌋': 'volcano gunung berapi meletus lava panas bencana alam',
  '⛺': 'tent tenda kemah camping hobi gunung hutan',
  '🏕️': 'camping kemah camping gunung hutan hobi api unggun',
  '🏖️': 'beach with umbrella pantai pasir liburan laut santai matahari',
  '⛰️': 'mountain gunung bukit daki hiking pemandangan',
  '🏛️': 'classical building gedung klasik museum pilar sejarah',
  '⛪': 'church gereja kristen katolik ibadah',
  '🕌': 'mosque masjid islam muslim ibadah kubah',
  '⛩️': 'shinto shrine torii jepang kuil shinto gerbang',
  '🎡': 'ferris wheel bianglala komidi putar pasar malam wahana',
  '🎢': 'roller coaster roller coaster wahana ekstrim liburan',
  '🗼': 'tokyo tower menara tokyo menara jepang wisata',
  '🗻': 'mount fuji gunung fuji jepang wisata salju',
  '💡': 'light bulb ide terang lampu bohlam inspirasi',
  '🔦': 'flashlight senter terang cahaya malam gelap',
  '🕯️': 'candle lilin cahaya bakar malam padam mati lampu',
  '🗑️': 'wastebasket tempat sampah buang kebersihan',
  '🛒': 'shopping cart keranjang belanja beli pasar online shop mall',
  '💸': 'money with wings uang terbang kaya gajian boros',
  '💵': 'dollar banknote uang dolar dollar kertas duit cash',
  '🪙': 'coin koin uang logam duit receh rupiah emas',
  '💳': 'credit card kartu kredit kartu debit kartu bank bayar atm',
  '💎': 'gem stone permata berlian mulia mewah bersinar',
  '⚖️': 'balance scale timbangan hukum keadilan pengadilan',
  '🔧': 'wrench kunci pas alat tukang bengkel obeng mekanik',
  '🔨': 'hammer palu alat tukang mengetok paku semen',
  '⚒️': 'hammer and pick palu beliung tambang alat tukang minecraft',
  '⛏️': 'pick kapak beliung tambang gali batu minecraft',
  '🪓': 'axe kapak potong kayu alat tukang hutan',
  '⚙️': 'gear roda gigi mesin setting pengaturan setelan',
  '🧲': 'magnet magnet tarik besi kutub',
  '🔫': 'water pistol pistol air mainan senapan tembak target',
  '💣': 'bomb bom meledak ledakan teror berbahaya',
  '🛡️': 'shield tameng perlindungan pertahanan shield ksatria aman',
  '⚔️': 'crossed swords pedang silang tarung perang ksatria duel',
  '🔮': 'crystal ball bola kristal ramalan sihir gaib peramal wizard',
  '🔭': 'telescope teleskop teropong bintang luar angkasa astronomi',
  '🔬': 'microscope mikroskop laboratorium sains penelitian bakteri sel',
  '🧪': 'test tube tabung reaksi kimia sains eksperimen lab racun',
  '🩹': 'adhesive bandage plester luka obat p3k cedera sakit',
  '🩺': 'stethoscope stetoskop dokter medis rumah sakit periksa jantung',
  '🔑': 'key kunci pintu rumah rahasia aman lock',
  '🗝️': 'old key kunci kuno pintu antik rahasia misteri',
  '📦': 'package paket kotak kiriman kurir ekspedisi box',
  '📫': 'mailbox kotak surat pos kiriman amplop',
  '✉️': 'envelope amplop surat pos pesan e-mail',
  '✏️': 'pencil pensil tulis gambar belajar sekolah obeng',
  '📝': 'memo kertas catatan tulis tugas daftar daftar belanja',
  '📂': 'open folder map berkas dokumen komputer data',
  '📅': 'calendar kalender tanggal hari jadwal waktu',
  '📖': 'open book buku baca membaca belajar sekolah ilmu pustaka',
  '📌': 'pushpin pin mading paku payung tempel tanda lokasi',
  '📎': 'paperclip klip kertas jepit dokumen kantor',
  '✂️': 'scissors gunting potong kertas rambut kain alat',
  '☎️': 'telephone telepon telepon rumah jadul panggilan ring telpon',
  '💻': 'laptop computer laptop pc komputer kerja kuliah gaming coder',
  '📷': 'camera kamera foto potret hobi lensa memori',
  '📺': 'television tv layar nonton siaran berita film',
  '⌚': 'watch jam tangan waktu penunjuk detik menit',
  '❤️': 'red heart hati merah cinta kasih sayang suka love',
  '🧡': 'orange heart hati oranye cinta kasih sayang love',
  '💛': 'yellow heart hati kuning cinta kasih sayang love',
  '💚': 'green heart hati hijau cinta kasih sayang love',
  '💙': 'blue heart hati biru cinta kasih sayang love',
  '💜': 'purple heart hati ungu cinta kasih sayang love',
  '🖤': 'black heart hati hitam cinta duka sedih kecewa gothic',
  '🤍': 'white heart hati putih cinta kasih sayang suci',
  '🤎': 'brown heart hati cokelat cinta kasih sayang',
  '💔': 'broken heart patah hati sedih cinta putus putus cinta',
  '❣️': 'heart exclamation tanda seru hati cinta suka',
  '💕': 'two hearts dua hati cinta romantis sayang suka',
  '💞': 'revolving hearts hati berputar cinta suka sayang romantis',
  '💓': 'beating heart hati berdebar cinta deg-degan sayang',
  '💗': 'growing heart hati tumbuh cinta sayang suka',
  '💖': 'sparkling heart hati berkilau cinta sayang suka emas',
  '💘': 'heart with arrow panah cinta asmara naksir sayang pacar',
  '💝': 'heart with ribbon kado cinta hadiah kado valentine sayang',
  '💟': 'heart decoration hiasan hati dekorasi cinta',
  '☮️': 'peace symbol lambang perdamaian damai perdamaian',
  '✝️': 'latin cross salib kristen katolik agama tuhan gereja',
  '☪️': 'star and crescent bulan bintang islam muslim agama masjid',
  '🕉️': 'om om hindu dharma agama',
  '☯️': 'yin yang keseimbangan yin yang tionghoa tradisi',
  '✡️': 'star of david bintang daud yahudi israel agama',
  '☸️': 'wheel of dharma roda dharma buddha agama',
  '♈': 'aries zodiak ramalan bintang aries maret april',
  '♉': 'taurus zodiak ramalan bintang taurus april mei',
  '♊': 'gemini zodiak ramalan bintang gemini mei juni',
  '♋': 'cancer zodiak ramalan bintang cancer juni juli',
  '♌': 'leo zodiak ramalan bintang leo juli agustus',
  '♍': 'virgo zodiak ramalan bintang virgo agustus september',
  '♎': 'libra zodiak ramalan bintang libra september oktober',
  '♏': 'scorpio zodiak ramalan bintang scorpio oktober november',
  '♐': 'sagittarius zodiak ramalan bintang sagittarius november desember',
  '♑': 'capricorn zodiak ramalan bintang capricorn desember januari',
  '♒': 'aquarius zodiak ramalan bintang aquarius januari februari',
  '♓': 'pisces zodiak ramalan bintang pisces februari maret',
  '⛎': 'ophiuchus zodiak ramalan bintang ophiuchus pembawa ular',
  '🎴': 'flower playing cards kartu hanafuda jepang main',
  '🌀': 'cyclone angin topan tornado badai bencana cuaca muter',
  '💤': 'zzz tidur mengantuk bosan lelah lelap malam',
  '🛑': 'stop sign rambu stop berhenti jalan raya merah',
  '⚠️': 'warning sign tanda bahaya peringatan hati-hati awas kuning',
  '🚫': 'prohibited sign tanda larangan dilarang silang merah merah',
  '💯': 'hundred points seratus nilai sempurna ujian pintar sekolah',
  '💲': 'heavy dollar sign tanda dolar uang duit kaya cash',
  '🏁': 'chequered flag bendera balap start finish f1 kencang',
  '🚩': 'triangular flag bendera merah segitiga tanda warning',
  '🏴': 'black flag bendera hitam bajak laut',
  '🏳️': 'white flag bendera putih menyerah damai kalah',
  '🇮🇩': 'indonesia flag bendera indonesia merah putih id ri nusantara',
  '🇺🇸': 'united states flag bendera amerika serikat us usa',
  '🇯🇵': 'japan flag bendera jepang nippon matahari terbit jpn',
  '🇬🇧': 'united kingdom flag bendera inggris gb uk union jack',
  '🇰🇷': 'south korea flag bendera korea selatan kor k-pop',
  '🇨🇳': 'china flag bendera cina tiongkok chn merah',
  '🇩🇪': 'germany flag bendera jerman ger deu',
  '🇫🇷': 'france flag bendera prancis fra menara',
  '🇪🇸': 'spain flag bendera spanyol esp',
  '🇮🇹': 'italy flag bendera italia ita pizza',
  '🇷🇺': 'russia flag bendera rusia rus beruang',
  '🇨🇦': 'canada flag bendera kanada can daun maple',
  '🇦🇺': 'australia flag bendera australia aus kanguru',
  '🇧🇷': 'brazil flag bendera brasil bra bola samba',
  '🇮🇳': 'india flag bendera india ind taj mahal',
  '🇸🇬': 'singapore flag bendera singapura sg sin',
  '🇲🇾': 'malaysia flag bendera malaysia my mys',
  '🇹🇭': 'thailand flag bendera thailand th tha',
  '🇻🇳': 'vietnam flag bendera vietnam vn vnm bintang',
  '🇵🇭': 'philippines flag bendera filipina ph phl',
  '🇸🇦': 'saudi arabia flag bendera arab saudi sa sau mekkah',
  '🇹🇷': 'turkey flag bendera turki tr tur',
  '🇪🇬': 'egypt flag bendera mesir eg egy piramida',
  '🇿🇦': 'south africa flag bendera afrika selatan za zaf',
  '🇳🇿': 'new zealand flag bendera selandia baru nz nzl',
  '🇲🇽': 'mexico flag bendera meksiko mx mex taco',
  '🇨🇭': 'switzerland flag bendera swiss ch che palang putih merah',
  '🇳🇱': 'netherlands flag bendera belanda nl nld kincir',
  '🇧🇪': 'belgium flag bendera belgia be bel',
  '🇸🇪': 'sweden flag bendera swedia se swe',
  '🇳🇴': 'norway flag bendera norwegia no nor',
  '🇫🇮': 'finland flag bendera finlandia fi fin salju',
  '🇩🇰': 'denmark flag bendera denmark dk dnk',
  '🇮🇪': 'ireland flag bendera irlandia ie irl',
  '🇦🇹': 'austria flag bendera austria at aut',
  '🇵🇱': 'poland flag bendera polandia pl pol',
  '🇺🇦': 'ukraine flag bendera ukraina ua ukr biru kuning'
};

const CATEGORY_NAMES = {
  custom: 'Server Custom Emojis',
  smileys: 'Smileys & People',
  animals: 'Animals & Nature',
  food: 'Food & Drink',
  activities: 'Activities & Sports',
  travel: 'Travel & Places',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags'
};

// Premium Custom Reusable Emoji Picker Component
function EmojiPicker({ selectedEmoji, onSelect, customEmojis }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(customEmojis.length > 0 ? 'custom' : 'smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter emojis based on query
  const getFilteredEmojis = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      if (activeTab === 'custom') return { custom: customEmojis };
      return { [activeTab]: STANDARD_EMOJIS[activeTab] };
    }

    const filtered = {};
    
    // Filter Custom Emojis
    const matchingCustom = customEmojis.filter(e => e.name.toLowerCase().includes(query));
    if (matchingCustom.length > 0) filtered.custom = matchingCustom;

    // Filter Standard Emojis
    Object.entries(STANDARD_EMOJIS).forEach(([cat, list]) => {
      const match = list.filter(emoji => {
        if (emoji.toLowerCase().includes(query) || cat.includes(query)) return true;
        const keywords = EMOJI_KEYWORDS[emoji];
        return keywords && keywords.toLowerCase().includes(query);
      });
      if (match.length > 0) filtered[cat] = match;
    });

    return filtered;
  };

  const filteredData = getFilteredEmojis();

  // Helper to draw emoji representation
  const renderEmojiIcon = (val) => {
    if (!val) return '⚫';
    // Check if Custom Emoji (e.g. numeric ID or <a:name:id> or custom object representation)
    const matchedCustom = customEmojis.find(e => e.id === val || e.name === val || val.includes(e.id));
    if (matchedCustom) {
      return <img src={matchedCustom.url} alt={matchedCustom.name} style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }} />;
    }
    return val;
  };

  return (
    <div style={{ position: 'relative' }} ref={pickerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          transition: 'all 0.2s'
        }}
        title="Klik untuk memilih emoji"
      >
        {renderEmojiIcon(selectedEmoji)}
      </div>

      {isOpen && (
        <div className="emoji-picker-container">
          {/* Search bar */}
          <div className="emoji-picker-search">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass"
              style={{ fontSize: '0.8rem', padding: '6px 12px', width: '100%' }}
              placeholder="🔍 Search emoji..."
              autoFocus
            />
          </div>

          {/* Tabs */}
          {!searchQuery && (
            <div className="emoji-picker-tabs">
              {customEmojis.length > 0 && (
                <button 
                  onClick={() => setActiveTab('custom')}
                  className={`emoji-picker-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                  title="Server Emojis"
                >
                  ⭐
                </button>
              )}
              {Object.keys(STANDARD_EMOJIS).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`emoji-picker-tab-btn ${activeTab === cat ? 'active' : ''}`}
                  title={CATEGORY_NAMES[cat]}
                >
                  {cat === 'smileys' ? '😀' : cat === 'animals' ? '🐶' : cat === 'food' ? '🍏' : cat === 'activities' ? '⚽' : cat === 'travel' ? '🚗' : cat === 'objects' ? '💡' : cat === 'symbols' ? '❤️' : '🏁'}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid Scroll */}
          <div className="emoji-picker-scroll">
            {Object.entries(filteredData).map(([cat, list]) => (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="emoji-picker-category-title">{CATEGORY_NAMES[cat]}</span>
                <div className="emoji-picker-grid">
                  {cat === 'custom' ? (
                    list.map(e => (
                      <button
                        key={e.id}
                        onClick={() => {
                          onSelect(e.id); // store by numeric custom ID
                          setIsOpen(false);
                        }}
                        className="emoji-picker-btn emoji-picker-custom-btn"
                        title={`:${e.name}:`}
                      >
                        <img src={e.url} alt={e.name} className="emoji-picker-custom-img" />
                      </button>
                    ))
                  ) : (
                    list.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onSelect(emoji);
                          setIsOpen(false);
                        }}
                        className="emoji-picker-btn"
                      >
                        {emoji}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Custom Reusable Multi-Select Role Dropdown Component
function MultiSelect({ allRoles, selectedIds, onChange, placeholder = 'Pilih peran...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id) => {
    const list = [...selectedIds];
    const idx = list.indexOf(id);
    if (idx !== -1) {
      list.splice(idx, 1);
    } else {
      list.push(id);
    }
    onChange(list);
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    onChange(selectedIds.filter(x => x !== id));
  };

  return (
    <div className="multi-select-container" ref={containerRef}>
      <div className="multi-select-box" onClick={() => setIsOpen(!isOpen)}>
        {selectedIds.length === 0 ? (
          <span className="multi-select-placeholder">{placeholder}</span>
        ) : (
          selectedIds.map(id => {
            const role = allRoles.find(r => r.id === id);
            return (
              <span key={id} className="multi-select-chip">
                {role ? role.name : `Peran: ${id.slice(-4)}`}
                <button type="button" className="multi-select-chip-remove" onClick={(e) => handleRemove(e, id)}>×</button>
              </span>
            );
          })
        )}
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          {allRoles.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', padding: '10px', textAlign: 'center' }}>Tidak ada peran.</span>
          ) : (
            allRoles.map(role => {
              const isSelected = selectedIds.includes(role.id);
              return (
                <div 
                  key={role.id}
                  onClick={() => handleToggle(role.id)}
                  className={`multi-select-option ${isSelected ? 'selected' : ''}`}
                >
                  <span>🛡️ {role.name}</span>
                  {isSelected && <span style={{ color: '#818cf8', fontWeight: 'bold' }}>✓</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function ReactionRoles() {
  const { selectedGuild } = useApp();
  const [reactionRoles, setReactionRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); 
  const [optionsExpanded, setOptionsExpanded] = useState(true);

  // Load reaction roles, channels, roles, and emojis
  useEffect(() => {
    if (!selectedGuild) return;
    setLoading(true);
    
    // Fetch channels
    fetch(`/api/guilds/${selectedGuild.id}/channels`)
      .then(res => res.json())
      .then(data => setChannels(data || []))
      .catch(err => console.error('Gagal memuat channels:', err));

    // Fetch roles
    fetch(`/api/guilds/${selectedGuild.id}/roles`)
      .then(res => res.json())
      .then(data => setRoles(data || []))
      .catch(err => console.error('Gagal memuat roles:', err));

    // Fetch Custom Emojis
    fetch(`/api/guilds/${selectedGuild.id}/emojis`)
      .then(res => res.json())
      .then(data => setCustomEmojis(data || []))
      .catch(err => console.error('Gagal memuat custom emojis:', err));

    // Fetch configurations
    fetch(`/api/guilds/${selectedGuild.id}/reaction-roles`)
      .then(res => res.json())
      .then(data => {
        setReactionRoles(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal memuat reaction roles:', err);
        setLoading(false);
      });
  }, [selectedGuild]);

  const showFeedback = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleCreateNew = () => {
    setCurrentConfig({
      id: '',
      name: 'Reaction Roles Baru',
      channel_id: channels[0]?.id || '',
      message_type: 'plain',
      plain_content: 'Pilih peran di bawah ini:',
      embed_title: 'Reaction Roles',
      embed_description: 'Pilih peran di bawah ini untuk mendapatkan role.',
      embed_color: '#6366f1',
      selection_type: 'dropdowns',
      
      // Advanced Options properties matching screenshot 2
      type: 'Normal',
      allowed_roles: [],
      ignored_roles: [],
      allow_multiple_roles: false, // exclusive by default for dropdown
      shuffle_roles: false,

      options: [
        { emoji: '⚫', role_ids: [], label: 'Hitam', description: 'Ganti warna nama profil menjadi Hitam' }
      ]
    });
    setOptionsExpanded(true);
    setIsEditing(true);
  };

  const handleEdit = (config) => {
    setCurrentConfig(JSON.parse(JSON.stringify(config))); // Deep copy
    setOptionsExpanded(true);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konfigurasi Reaction Roles ini?')) return;

    try {
      const res = await fetch(`/api/guilds/${selectedGuild.id}/reaction-roles/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReactionRoles(prev => prev.filter(rr => rr.id !== id));
        showFeedback('✓ Konfigurasi Reaction Roles berhasil dihapus!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus.');
      }
    } catch (err) {
      showFeedback(`❌ Error: ${err.message}`, 'error');
    }
  };

  const handleSave = async () => {
    if (!currentConfig.name.trim()) return showFeedback('❌ Nama konfigurasi wajib diisi.', 'error');
    if (!currentConfig.channel_id) return showFeedback('❌ Saluran target wajib dipilih.', 'error');
    if (currentConfig.options.length === 0) return showFeedback('❌ Minimal harus ada 1 opsi pilihan role.', 'error');
    
    // Check if roles are selected
    const missingRoles = currentConfig.options.some(opt => !opt.role_ids || opt.role_ids.length === 0);
    if (missingRoles) return showFeedback('❌ Seluruh opsi harus memiliki minimal 1 peran (Role) yang terpilih.', 'error');

    setSaving(true);
    const method = currentConfig.id ? 'PUT' : 'POST';
    const url = currentConfig.id 
      ? `/api/guilds/${selectedGuild.id}/reaction-roles/${currentConfig.id}`
      : `/api/guilds/${selectedGuild.id}/reaction-roles`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
      });

      if (res.ok) {
        const data = await res.json();
        if (method === 'POST') {
          setReactionRoles(prev => [...prev, data.config]);
        } else {
          setReactionRoles(prev => prev.map(rr => rr.id === data.config.id ? data.config : rr));
        }
        setIsEditing(false);
        setCurrentConfig(null);
        showFeedback('✓ Konfigurasi Reaction Roles berhasil disimpan!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan.');
      }
    } catch (err) {
      showFeedback(`❌ Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePostToDiscord = async (id) => {
    setPostingId(id);
    try {
      const res = await fetch(`/api/guilds/${selectedGuild.id}/reaction-roles/${id}/post`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setReactionRoles(prev => prev.map(rr => rr.id === id ? { ...rr, message_id: data.messageId } : rr));
        showFeedback('✓ Pesan Reaction Roles berhasil diposting ke Discord!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengirim.');
      }
    } catch (err) {
      showFeedback(`❌ Error: ${err.message}`, 'error');
    } finally {
      setPostingId(null);
    }
  };

  const handleAddOption = () => {
    setCurrentConfig(prev => ({
      ...prev,
      options: [...prev.options, { emoji: '⚫', role_ids: [], label: 'Role Baru', description: 'Deskripsi Opsi' }]
    }));
  };

  const handleRemoveOption = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index)
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setCurrentConfig(prev => {
      const opts = [...prev.options];
      opts[index] = { ...opts[index], [field]: value };
      return { ...prev, options: opts };
    });
  };

  // Helper to draw emoji representation in visual previews
  const renderEmojiRepresentation = (val) => {
    if (!val) return '⚫';
    const matched = customEmojis.find(e => e.id === val || e.name === val || val.includes(e.id));
    if (matched) {
      return <img src={matched.url} alt={matched.name} style={{ width: '18px', height: '18px', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />;
    }
    return <span style={{ marginRight: '4px' }}>{val}</span>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid hsla(var(--primary-glow), 0.2)',
          borderTopColor: 'hsl(var(--primary-glow))',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite'
        }} />
        <span style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--text-secondary))', fontWeight: '600', fontSize: '0.85rem' }}>
          MEMUAT REACTION ROLES...
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '18px' }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: '800', color: 'hsl(var(--text-primary))' }}>
            🎭 Reaction Roles
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
            Berikan kebebasan bagi anggota server untuk memilih peran/role mereka secara interaktif dengan tombol, menu dropdown, atau reaksi.
          </p>
        </div>
        
        {!isEditing && (
          <button className="btn-primary" onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Buat Reaction Roles
          </button>
        )}
      </div>

      {/* Global Status Message */}
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.92rem',
          fontWeight: '600',
          backgroundColor: messageType === 'success' ? 'hsla(var(--success-emerald), 0.12)' : 'hsla(var(--danger-crimson), 0.12)',
          border: `1px solid ${messageType === 'success' ? 'hsl(var(--success-emerald))' : 'hsl(var(--danger-crimson))'}`,
          color: messageType === 'success' ? 'hsl(var(--success-emerald))' : 'hsl(var(--danger-crimson))',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {message}
        </div>
      )}

      {/* LIST VIEW (No Active Editing) */}
      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reactionRoles.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'hsla(var(--primary-glow), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary-glow))' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><path d="M12 14v4"/></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--text-primary))', fontWeight: '700' }}>Belum ada Reaction Roles</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0' }}>
                  Anda belum membuat setelan Reaction Roles. Klik tombol di atas untuk mulai membuat setelan peran interaktif pertama Anda!
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }} className="settings-grid">
              {reactionRoles.map(rr => (
                <div key={rr.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.15rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>{rr.name}</h4>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        backgroundColor: 'hsla(var(--primary-glow), 0.15)',
                        color: 'hsl(var(--primary-glow))'
                      }}>
                        {rr.selection_type}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: '600' }}>Saluran:</span>
                        <span>#{channels.find(c => c.id === rr.channel_id)?.name || rr.channel_id || 'Tidak diketahui'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: '600' }}>Tipe:</span>
                        <span>{rr.type || 'Normal'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: '600' }}>Jumlah Opsi:</span>
                        <span>{rr.options?.length || 0} peran</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600' }}>Status Discord:</span>
                        {rr.message_id ? (
                          <span style={{ color: 'hsl(var(--success-emerald))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                            Aktif (ID: {rr.message_id.slice(-6)}...)
                          </span>
                        ) : (
                          <span style={{ color: 'hsl(var(--warning-amber))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                            Belum Diposting
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '16px' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => handlePostToDiscord(rr.id)} 
                      disabled={postingId !== null}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      {postingId === rr.id ? 'Mengirim...' : rr.message_id ? '🔄 Re-Post / Sync' : '🚀 Posting ke Discord'}
                    </button>
                    
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleEdit(rr)}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px' }}
                    >
                      Edit
                    </button>
                    
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleDelete(rr.id)}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px', borderColor: 'hsla(var(--danger-crimson), 0.2)', color: 'hsl(var(--danger-crimson))' }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* FORM EDIT / BUAT BARU VIEW (Split 2 Columns: Form vs Live Preview) */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="settings-grid">
          
          {/* LEFT COLUMN: FORM CONFIGURATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* MESSAGE SETTINGS PANEL */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '10px' }}>
                MESSAGE SETTINGS
              </h3>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Nama Konfigurasi</label>
                <input 
                  type="text" 
                  value={currentConfig.name} 
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="input-glass"
                  placeholder="Misalnya: Warnai Aku"
                />
              </div>

              {/* Target Channel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Channel to post</label>
                <select 
                  value={currentConfig.channel_id} 
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, channel_id: e.target.value }))}
                  className="input-glass"
                  style={{ backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                >
                  <option value="" disabled>-- Pilih Saluran Teks Discord --</option>
                  {channels.map(ch => (
                    <option key={ch.id} value={ch.id} style={{ backgroundColor: 'hsl(var(--bg-space))' }}>
                      📢 #{ch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Message Type</label>
                <div style={{ display: 'flex', gap: '30px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="msg_type"
                      checked={currentConfig.message_type === 'plain'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, message_type: 'plain' }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Plain Message
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="msg_type"
                      checked={currentConfig.message_type === 'embed'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, message_type: 'embed' }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Embed Message
                  </label>
                </div>
              </div>

              {/* Selection Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Selection Type</label>
                <div style={{ display: 'flex', gap: '30px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'reactions'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'reactions', allow_multiple_roles: true }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Reactions
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'buttons'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'buttons', allow_multiple_roles: true }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Buttons
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'dropdowns'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'dropdowns', allow_multiple_roles: false }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Dropdowns
                  </label>
                </div>
              </div>

              {/* Plain Message Text Area */}
              {currentConfig.message_type === 'plain' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Plain Message Content</label>
                  <textarea 
                    value={currentConfig.plain_content} 
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, plain_content: e.target.value }))}
                    className="input-glass"
                    rows="4"
                    placeholder="Tulis pesan yang akan ditampilkan di Discord..."
                  />
                </div>
              ) : (
                /* Embed Message Inputs */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px dashed hsl(var(--border-glass))', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>EMBED PARAMS</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Embed Title</label>
                    <input 
                      type="text" 
                      value={currentConfig.embed_title} 
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, embed_title: e.target.value }))}
                      className="input-glass"
                      placeholder="Judul Embed"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Embed Description</label>
                    <textarea 
                      value={currentConfig.embed_description} 
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, embed_description: e.target.value }))}
                      className="input-glass"
                      rows="3"
                      placeholder="Deskripsi Embed..."
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Embed Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="color" 
                        value={currentConfig.embed_color || '#6366f1'} 
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, embed_color: e.target.value }))}
                        style={{ border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'hsl(var(--text-primary))' }}>{currentConfig.embed_color}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SELECTION SETTINGS PANEL (DYNAMIC LIST WITH EMOJI PICKER & MULTI-SELECT ROLES) */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>
                  {currentConfig.selection_type.toUpperCase()} SETTINGS
                </h3>
                <button className="btn-secondary" onClick={handleAddOption} style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  + Add Option
                </button>
              </div>

              {currentConfig.options.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '16px' }}>
                  Belum ada opsi ditambahkan. Klik "+ Add Option" untuk menambahkan pemetaan role.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {currentConfig.options.map((opt, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '60px 1.8fr 1.2fr 1.2fr 40px',
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: 'hsla(var(--border-glass), 0.08)',
                        border: '1px solid hsl(var(--border-glass))'
                      }}
                      className="expandable-card-grid"
                    >
                      {/* Premium Emoji Picker */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Emoji</label>
                        <EmojiPicker 
                          selectedEmoji={opt.emoji} 
                          onSelect={(emojiVal) => handleOptionChange(idx, 'emoji', emojiVal)}
                          customEmojis={customEmojis}
                        />
                      </div>

                      {/* Multi-Select Roles (chip systems!) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Roles</label>
                        <MultiSelect 
                          allRoles={roles} 
                          selectedIds={opt.role_ids || []} 
                          onChange={(ids) => handleOptionChange(idx, 'role_ids', ids)}
                          placeholder="Pilih Peran..."
                        />
                      </div>

                      {/* Option Label */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>
                          {currentConfig.selection_type === 'reactions' ? 'Reaction Label (Optional)' : 'Label'}
                        </label>
                        <input 
                          type="text" 
                          value={opt.label || ''} 
                          onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                          className="input-glass"
                          style={{ padding: '6px 8px', fontSize: '0.82rem', height: '42px' }}
                          placeholder="Nama Tombol"
                        />
                      </div>

                      {/* Dropdown Description (Only for dropdowns) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: currentConfig.selection_type === 'dropdowns' ? 1 : 0.5 }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Description (Dropdown)</label>
                        <input 
                          type="text" 
                          value={opt.description || ''} 
                          disabled={currentConfig.selection_type !== 'dropdowns'}
                          onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                          className="input-glass"
                          style={{ padding: '6px 8px', fontSize: '0.82rem', height: '42px' }}
                          placeholder="Deskripsi..."
                        />
                      </div>

                      {/* Delete Option */}
                      <button 
                        onClick={() => handleRemoveOption(idx)}
                        style={{
                          background: 'hsla(var(--danger-crimson), 0.15)',
                          border: '1px solid hsla(var(--danger-crimson), 0.3)',
                          borderRadius: '8px',
                          color: 'hsl(var(--danger-crimson))',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          marginTop: '16px',
                          height: '42px',
                          transition: 'all 0.2s'
                        }}
                        className="sidebar-link-hover"
                        title="Hapus Opsi Ini"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLLAPSIBLE OPTIONS PANEL (AS SHOWN IN PICTURE 2) */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
              <div 
                className="collapsible-header"
                onClick={() => setOptionsExpanded(!optionsExpanded)}
              >
                <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg 
                    width="14" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: optionsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.25s' }}
                  >
                    <path d="m1 1 4 4 4-4"/>
                  </svg>
                  OPTIONS
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                  {optionsExpanded ? 'Tutup Parameter' : 'Buka Parameter'}
                </span>
              </div>

              <div 
                className="collapsible-content"
                style={{ 
                  maxHeight: optionsExpanded ? '1000px' : '0px', 
                  marginTop: optionsExpanded ? '16px' : '0px',
                  borderTop: optionsExpanded ? '1px solid hsl(var(--border-glass))' : 'none',
                  paddingTop: optionsExpanded ? '16px' : '0px'
                }}
              >
                {/* Type Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Type</label>
                  <select
                    value={currentConfig.type || 'Normal'}
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, type: e.target.value }))}
                    className="input-glass"
                    style={{ backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                  >
                    <option value="Normal" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Normal (Toggle role saat berinteraksi)</option>
                    <option value="Toggle" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Toggle (Sama dengan Normal)</option>
                    <option value="Give" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Give (Hanya menyematkan peran, tidak bisa dicabut)</option>
                    <option value="Take" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Take (Hanya mencabut peran terkait)</option>
                  </select>
                </div>

                {/* Allowed Roles & Ignored Roles (Picture 2 Double Column) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="expandable-card-grid">
                  
                  {/* Allowed Roles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Allowed Roles 
                      <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))' }} title="Hanya anggota dengan peran ini yang bisa mengeklaim peran">🛈</span>
                    </label>
                    <MultiSelect 
                      allRoles={roles} 
                      selectedIds={currentConfig.allowed_roles || []} 
                      onChange={(ids) => setCurrentConfig(prev => ({ ...prev, allowed_roles: ids }))}
                      placeholder="Semua peran diizinkan..."
                    />
                  </div>

                  {/* Ignored Roles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Ignored Roles 
                      <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))' }} title="Anggota dengan peran ini diblokir dari mengeklaim peran">🛈</span>
                    </label>
                    <MultiSelect 
                      allRoles={roles} 
                      selectedIds={currentConfig.ignored_roles || []} 
                      onChange={(ids) => setCurrentConfig(prev => ({ ...prev, ignored_roles: ids }))}
                      placeholder="Tidak ada peran diabaikan..."
                    />
                  </div>

                </div>

                {/* Two checkboxes side by side (Picture 2 layout) */}
                <div style={{ display: 'flex', gap: '40px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="checkbox" 
                      checked={!!currentConfig.allow_multiple_roles}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, allow_multiple_roles: e.target.checked }))}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Allow members to get multiple roles 
                    <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))', marginLeft: '2px' }} title="Jika dicentang, anggota bisa mengeklaim lebih dari 1 peran. Jika tidak dicentang, peran lama dari Reaction Roles ini akan otomatis dicabut.">🛈</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="checkbox" 
                      checked={!!currentConfig.shuffle_roles}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, shuffle_roles: e.target.checked }))}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Shuffle roles and their emojis 
                    <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))', marginLeft: '2px' }} title="Jika diaktifkan, urutan peran dan emoji akan diacak saat diposting di Discord untuk variasi letak visual.">🛈</span>
                  </label>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setIsEditing(false);
                  setCurrentConfig(null);
                }}
                disabled={saving}
                style={{ padding: '12px 24px', borderRadius: '12px' }}
              >
                Batalkan
              </button>
              
              <button 
                className="btn-primary" 
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '12px 28px', borderRadius: '12px' }}
              >
                {saving ? 'Menyimpan...' : 'Simpan Setelan'}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE DISCORD PREVIEW SIMULATOR */}
          <div style={{ position: 'sticky', top: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'hsla(var(--border-glass), 0.1)', borderBottom: '1px solid hsl(var(--border-glass))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '700', letterSpacing: '0.05em' }}>LIVE DISCORD PREVIEW</span>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#5865f2', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>BOT MESSAGE</span>
              </div>
              
              <div style={{ padding: '20px', backgroundColor: '#313338' /* Discord dark style */, minHeight: '320px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Embed or Plain Content Display */}
                {currentConfig.message_type === 'plain' ? (
                  <div style={{ color: '#dbdee1', fontSize: '0.92rem', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
                    {currentConfig.plain_content || 'Pilih peran di bawah ini:'}
                  </div>
                ) : (
                  /* Embed Render */
                  <div style={{
                    borderLeft: `4px solid ${currentConfig.embed_color || '#6366f1'}`,
                    backgroundColor: '#2b2d31',
                    padding: '16px',
                    borderRadius: '4px',
                    fontFamily: 'sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '0.98rem' }}>
                      {currentConfig.embed_title || 'Reaction Roles'}
                    </div>
                    <div style={{ color: '#dbdee1', fontSize: '0.88rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {currentConfig.embed_description || 'Pilih peran di bawah ini untuk mendapatkan role.'}
                    </div>
                  </div>
                )}

                {/* RENDER SELECTION COMPONENTS BELOW MESSAGE (Respect Shuffle Preview if active) */}
                {(() => {
                  let options = [...currentConfig.options];
                  // If shuffle is checked, we can simulate the random ordering!
                  if (currentConfig.shuffle_roles) {
                    // Let's do a deterministic shuffle so it doesn't bounce endlessly on rerenders
                    options.reverse();
                  }

                  return (
                    <>
                      {/* 1. REACTIONS PREVIEW */}
                      {currentConfig.selection_type === 'reactions' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {options.map((opt, idx) => {
                            if (!opt.emoji) return null;
                            return (
                              <div 
                                key={idx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '6px', 
                                  backgroundColor: '#2b2d31', 
                                  border: '1px solid #3f4248', 
                                  padding: '4px 10px', 
                                  borderRadius: '8px', 
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  color: '#b5bac1'
                                }}
                              >
                                {renderEmojiRepresentation(opt.emoji)}
                                <span style={{ fontWeight: '600', color: '#5865f2', fontSize: '0.78rem' }}>1</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. BUTTONS PREVIEW */}
                      {currentConfig.selection_type === 'buttons' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {options.map((opt, idx) => {
                            const selectedRoleNames = (opt.role_ids || []).map(id => roles.find(r => r.id === id)?.name).filter(x => !!x).join(', ');
                            return (
                              <button
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: '#4e5058', 
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  padding: '6px 14px',
                                  fontSize: '0.82rem',
                                  fontWeight: '500',
                                  fontFamily: 'sans-serif',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                {opt.emoji && renderEmojiRepresentation(opt.emoji)}
                                <span>{opt.label || selectedRoleNames || `Role ${idx + 1}`}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. DROPDOWNS PREVIEW */}
                      {currentConfig.selection_type === 'dropdowns' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontFamily: 'sans-serif' }}>
                          <div 
                            style={{
                              backgroundColor: '#1e1f22',
                              border: '1px solid #3f4248',
                              borderRadius: '4px',
                              padding: '10px 12px',
                              color: '#949ba4',
                              fontSize: '0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <span>
                              {currentConfig.plain_content ? currentConfig.plain_content.slice(0, 45) : currentConfig.embed_description ? currentConfig.embed_description.slice(0, 45) : 'Pilih opsi...'}
                              {((currentConfig.plain_content && currentConfig.plain_content.length > 45) || (currentConfig.embed_description && currentConfig.embed_description.length > 45)) ? '...' : ''}
                            </span>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m1 1 4 4 4-4"/></svg>
                          </div>
                          
                          {/* Simulated Select Menu Dropdown Overlay */}
                          <div 
                            style={{
                              backgroundColor: '#2b2d31',
                              border: '1px solid #1e1f22',
                              borderRadius: '4px',
                              marginTop: '4px',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'hidden'
                            }}
                          >
                            {options.map((opt, idx) => {
                              const selectedRoleNames = (opt.role_ids || []).map(id => roles.find(r => r.id === id)?.name).filter(x => !!x).join(', ');
                              return (
                                <div 
                                  key={idx}
                                  style={{
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: idx === options.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                  }}
                                  className="simulated-dropdown-option"
                                >
                                  <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                                    {renderEmojiRepresentation(opt.emoji || '⚫')}
                                  </span>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ color: '#dbdee1', fontSize: '0.82rem', fontWeight: '500' }}>
                                      {opt.label || selectedRoleNames || `Opsi ${idx + 1}`}
                                    </span>
                                    {opt.description && (
                                      <span style={{ color: '#949ba4', fontSize: '0.72rem' }}>
                                        {opt.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

              </div>
            </div>

            {/* Quick Helper Tips Card */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ color: 'hsl(var(--text-primary))', fontSize: '0.98rem', fontWeight: '750' }}>💡 Tips Setelan Lanjutan</h4>
              <ul style={{ padding: '0 0 0 16px', margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                <li><strong>Allowed/Ignored Roles</strong> membatasi secara spesifik siapa saja anggota yang boleh mengeklaim setelan peran ini.</li>
                <li>Matikan <strong>"Allow members to get multiple roles"</strong> jika Anda membuat pilihan warna eksklusif seperti di mockup.</li>
                <li><strong>Custom Emojis Picker</strong> mendukung penelusuran custom emoji resmi langsung dari *database* server Discord aktif Anda.</li>
                <li>Pastikan urutan peran bot Anda berada di urutan teratas agar bot diizinkan menyematkan peran tersebut.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
