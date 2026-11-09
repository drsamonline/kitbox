# Kitbox — complete tool list

**491 tools across 27 categories.**

Generated from the app itself by `node tools/gen-all-tools.js`. Do not edit by hand —
the file is rewritten from the registry, and CI fails if it is out of date.

| # | Category | Code | Tools |
|--:|:--|:--|--:|
| 1 | General Tools | `GEN` | 13 |
| 2 | Text Tools | `TXT` | 66 |
| 3 | Generator Tools | `GNR` | 11 |
| 4 | Calculation Tools | `CAL` | 56 |
| 5 | Image Tools | `IMG` | 25 |
| 6 | Unit Converter | `UNI` | 33 |
| 7 | Finance Tools | `FIN` | 19 |
| 8 | Randomizer Tools | `RND` | 11 |
| 9 | Health Tools | `HLT` | 8 |
| 10 | Development Tools | `DEV` | 76 |
| 11 | Colors Tools | `CLR` | 10 |
| 12 | Science Tools | `SCI` | 21 |
| 13 | Geo Tools | `GEO` | 11 |
| 14 | Audio Tools | `AUD` | 13 |
| 15 | Games | `GAM` | 16 |
| 16 | Travel Tools | `TRV` | 5 |
| 17 | Nature Tools | `NAT` | 6 |
| 18 | Productivity | `PRD` | 8 |
| 19 | Files & Data | `FIL` | 18 |
| 20 | Almanac | `ALM` | 10 |
| 21 | Communication | `COM` | 5 |
| 22 | Reference | `REF` | 10 |
| 23 | System | `SYS` | 4 |
| 24 | Accessibility | `ACC` | 11 |
| 25 | Education | `EDU` | 4 |
| 26 | Clinical | `CLN` | 12 |
| 27 | Money (India) | `MNY` | 9 |

## General Tools — 13 tools

- `GEN-01` **Ruler** — `general/ruler`
- `GEN-02` **Simple Counter** — `general/counter`
- `GEN-03` **Scoreboard** — `general/scoreboard`
- `GEN-04` **Countdown** — `general/countdown`
- `GEN-05` **Stopwatch** — `general/stopwatch`
- `GEN-06` **Morse Code** — `general/morse`
- `GEN-07` **Roman Numerals** — `general/roman`
- `GEN-08` **Number To Word** — `general/num2word`
- `GEN-09` **Compass** — `general/compass`
- `GEN-10` **String To Byte** — `general/str2byte`
- `GEN-11` **Timezone Converter** — `general/tzconv`
- `GEN-12` **Level Tool** — `general/level`
- `GEN-13` **World Clock** — `general/worldclock`

## Text Tools — 66 tools

**Basic Tools**

- `TXT-01` **Text Cases** — `text/cases`
- `TXT-02` **Find & Replace** — `text/findreplace`
- `TXT-03` **Sort Lines** — `text/sortlines`
- `TXT-04` **Text Counter** — `text/textcounter`
- `TXT-05` **Repeat Text** — `text/repeattext`

**Remove Tools**

- `TXT-06` **Remove White Spaces** — `text/rmspaces`
- `TXT-07` **Remove Empty Lines** — `text/rmempty`
- `TXT-08` **Remove Duplicate Lines** — `text/rmduplines`
- `TXT-09` **Remove Duplicate Words** — `text/rmdupwords`
- `TXT-10` **Remove Break Lines** — `text/rmbreaklines`

**Edit Tools**

- `TXT-11` **Suffix/Prefix** — `text/affix`
- `TXT-12` **Add Numbers To Lines** — `text/numberlines`
- `TXT-13` **Reverse Text** — `text/reversetext`
- `TXT-14` **Reverse Lines** — `text/reverselines`
- `TXT-15` **Reverse Words** — `text/reversewords`
- `TXT-16` **Add Break Lines** — `text/addbreaklines`
- `TXT-39` **Hard Wrap at Width** — `text/wrapwidth`

**Stylish Tools**

- `TXT-17` **Stylish Font** — `text/stylishfont`
- `TXT-18` **Text Decoration** — `text/textdecoration`
- `TXT-19` **Japanese Emotion** — `text/kaomoji`
- `TXT-20` **Big Text** — `text/bigtext`
- `TXT-21` **Text To Emoji** — `text/texttoemoji`

**Ciphers & Encoding**

- `TXT-22` **Caesar Cipher** — `text/caesar`
- `TXT-23` **Slugify** — `text/slugify`
- `TXT-24` **NATO Phonetic Alphabet** — `text/natophonetic`
- `TXT-25` **Leet Speak** — `text/leetspeak`
- `TXT-26` **Text ↔ Hex** — `text/texthex`
- `TXT-27` **Text ↔ Binary** — `text/textbinary`
- `TXT-28` **Random String Generator** — `text/randomstring`
- `TXT-29` **Strip HTML Tags** — `text/striphtml`
- `TXT-30` **Char Frequency** — `text/charfreq`
- `TXT-31` **Text Splitter** — `text/textsplitter`
- `TXT-32` **ASCII Art Banner** — `text/asciibanner`
- `TXT-33` **Braille Translator** — `text/braille`
- `TXT-51` **A1Z26 Cipher** — `text/a1z26`
- `TXT-52` **Affine Cipher** — `text/affine`
- `TXT-53` **Atbash Cipher** — `text/atbash`
- `TXT-54` **Bacon Cipher** — `text/bacon`
- `TXT-55` **Rail Fence Cipher** — `text/railfence`
- `TXT-56` **Bifid Cipher** — `text/bifid`
- `TXT-57` **ROT47** — `text/rot47`
- `TXT-41` **XOR Cipher** — `text/xor`
- `TXT-42` **Vigenère Cipher** — `text/vigenere`
- `TXT-44` **Ascii85** — `text/ascii85`
- `TXT-45` **Unicode Escapes** — `text/unicodeescape`

**Analysis Tools**

- `TXT-64` **Syllable Counter** — `text/syllables`
- `TXT-65` **Concordance** — `text/concordance`
- `TXT-60` **Hexdump** — `text/hexdump`
- `TXT-46` **Word-Level Diff** — `text/worddiff`
- `TXT-47` **Extract From Text** — `text/extract`
- `TXT-43` **Shannon Entropy** — `text/entropy`
- `TXT-34` **Keywords & Text Similarity** — `text/keywords`
- `TXT-35` **Readability & Reading Time** — `text/readability`
- `TXT-38` **Word Frequency** — `text/wordfreq`

**Text Cleanup**

- `TXT-66` **Hyphenation** — `text/hyphenate`
- `TXT-61` **Strip ANSI Escapes** — `text/ansistrip`
- `TXT-62` **Remove Null Bytes** — `text/nullbytes`

**Encoding**

- `TXT-58` **Quoted-Printable** — `text/quotedprintable`
- `TXT-59` **Char Codes** — `text/charcodes`
- `TXT-63` **Escape / Unescape** — `text/escape`
- `TXT-48` **Punycode / IDN** — `text/punycode`
- `TXT-49` **Code Point Inspector** — `text/codepoints`
- `TXT-50` **Huffman Coding** — `text/huffman`

**Cleanup Tools**

- `TXT-36` **Remove Accents** — `text/accents`
- `TXT-37` **Smart Quotes Fixer** — `text/smartquotes`
- `TXT-40` **Invisible Character Detector** — `text/invisible`

## Generator Tools — 11 tools

- `GNR-01` **QR Code** — `generator/qrcode`
- `GNR-02` **Lorem Ipsum** — `generator/lorem`
- `GNR-03` **Simple Number Generator** — `generator/numgen`
- `GNR-04` **Multiple Numbers Generator** — `generator/multinumgen`
- `GNR-05` **Barcode/QR code Scanner** — `generator/scanner`
- `GNR-11` **QR Payload Builder** — `generator/qrpayload`
- `GNR-10` **SVG Placeholder** — `generator/placeholder`
- `GNR-06` **Speak Text** — `generator/tts`
- `GNR-07` **Big Clock** — `generator/bigclock`
- `GNR-08` **Passphrase Generator** — `generator/passphrase`
- `GNR-09` **Username Generator** — `generator/usernames`

## Calculation Tools — 56 tools

**Common**

- `CAL-01` **Simple Calculator** — `calc/simplecalc`

**Algebra**

- `CAL-02` **Percentage** — `calc/percentage`
- `CAL-03` **Average** — `calc/average`
- `CAL-04` **Proportional** — `calc/proportional`
- `CAL-05` **Aspect Ratio** — `calc/aspectratio`
- `CAL-06` **Fractions Simplifier** — `calc/fractionsimplify`
- `CAL-07` **Decimal To Fraction** — `calc/decimaltofraction`
- `CAL-08` **Prime Number** — `calc/primenumber`
- `CAL-09` **Exponent** — `calc/exponent`
- `CAL-10` **Factorial** — `calc/factorial`
- `CAL-44` **Scientific Notation & Sig Figs** — `calc/sigfig`
- `CAL-49` **Percentage Change** — `calc/percentchange`
- `CAL-51` **Rounding** — `calc/rounding`

**Time**

- `CAL-11` **Age Calculator** — `calc/agecalc`
- `CAL-12` **Time Calculator** — `calc/timecalc`
- `CAL-13` **Multiple Time Calculator** — `calc/multitimecalc`
- `CAL-14` **Days Until New Year** — `calc/daysuntilnewyear`
- `CAL-48` **Date Difference** — `calc/datediff`
- `CAL-50` **Sleep Cycle Calculator** — `calc/sleepcalc`

**2D Geometry**

- `CAL-15` **Square** — `calc/square`
- `CAL-16` **Circle** — `calc/circle`
- `CAL-17` **Rectangle** — `calc/rectangle`
- `CAL-18` **Rhombus** — `calc/rhombus`
- `CAL-19` **Triangle** — `calc/triangle`
- `CAL-20` **Right Triangle** — `calc/righttriangle`
- `CAL-21` **Trapezoid** — `calc/trapezoid`
- `CAL-22` **Pentagon (regular)** — `calc/pentagon`
- `CAL-23` **Hexagon (regular)** — `calc/hexagon`
- `CAL-24` **Circular Sector** — `calc/circleact`
- `CAL-25` **Cube** — `calc/cube`
- `CAL-26` **Sphere** — `calc/sphere`
- `CAL-27` **Pyramid (square base)** — `calc/pyramid`
- `CAL-28` **Rectangular Prism** — `calc/prism`
- `CAL-29` **Cone** — `calc/cone`
- `CAL-30` **Ellipsoid** — `calc/ellipsoid`
- `CAL-31` **Pyramid Frustum** — `calc/pyramidfrustum`
- `CAL-32` **Cone Frustum** — `calc/conefrustum`
- `CAL-33` **Cylinder** — `calc/cylinder`
- `CAL-34` **Sphere Cap** — `calc/spherecap`
- `CAL-35` **Sphere Segment (zone)** — `calc/spheresegment`

**Advanced Math**

- `CAL-36` **Graph Plotter** — `calc/graphplotter`
- `CAL-37` **Fibonacci Generator** — `calc/fibonacci`
- `CAL-38` **nPr & nCr** — `calc/npr_ncr`
- `CAL-39` **GCD & LCM** — `calc/gcdlcm`
- `CAL-40` **Quadratic Solver** — `calc/quadratic`
- `CAL-41` **Logarithm** — `calc/logarithm`

**Dates & Time**

- `CAL-56` **Working Days** — `calc/workingdays`

**Sets & Logic**

- `CAL-55` **Modular Arithmetic** — `calc/modular`
- `CAL-52` **Set Operations** — `calc/setops`
- `CAL-53` **Edit Distance** — `calc/levenshtein`
- `CAL-54` **Hamming Distance** — `calc/hamming`

**Statistics**

- `CAL-42` **Statistics** — `calc/statistics`
- `CAL-43` **Correlation & Regression** — `calc/regression`

**Everyday**

- `CAL-45` **Fuel Economy & Trip Cost** — `calc/fueleconomy`
- `CAL-46` **Electricity Cost** — `calc/electricity`

**Business**

- `CAL-47` **Markup, Margin & Break-even** — `calc/pricing`

## Image Tools — 25 tools

- `IMG-22` **Sharpen Image** — `image/imsharpen`
- `IMG-23` **Dither Image** — `image/imdither`
- `IMG-24` **Auto Levels** — `image/imautolevels`
- `IMG-25` **Contrast Stretch** — `image/imcontrast`
- `IMG-19` **Image HSL** — `image/imghsl`
- `IMG-20` **Invert Image** — `image/imginvert`
- `IMG-21` **Image Opacity** — `image/imgopacity`
- `IMG-01` **Resize Image** — `image/resize`
- `IMG-02` **Crop Image** — `image/crop`
- `IMG-03` **Rounded Image** — `image/rounded`
- `IMG-04` **Gradient Wallpaper Maker** — `image/gradientwallpaper`
- `IMG-05` **Trim Transparency** — `image/trimtransparency`
- `IMG-06` **Flip Image** — `image/flip`
- `IMG-07` **Add Text to Image** — `image/addtext`
- `IMG-08` **Blur Tool** — `image/blur`
- `IMG-09` **Image Compressor** — `image/compressor`
- `IMG-10` **Image Format Converter** — `image/formatconverter`
- `IMG-11` **Mosaic Effect** — `image/mosaic`
- `IMG-12` **Collage Maker** — `image/collage`
- `IMG-13` **Image Enhancer** — `image/enhancer`
- `IMG-14` **Filters** — `image/filters`
- `IMG-15` **Rotate Image** — `image/rotate`
- `IMG-16` **Image Info** — `image/imageinfo`
- `IMG-17` **Meme Generator** — `image/memegenerator`
- `IMG-18` **ASCII Art from Image** — `image/asciiart`

## Unit Converter — 33 tools

**Common**

- `UNI-01` **Energy** — `unit/energy`
- `UNI-02` **Angle** — `unit/angle`
- `UNI-03` **Temperature** — `unit/temperature`
- `UNI-04` **Cooking** — `unit/cooking`
- `UNI-05` **Time** — `unit/time`
- `UNI-06` **Prefix** — `unit/prefix`

**Dimension**

- `UNI-07` **Area** — `unit/area`
- `UNI-08` **Length** — `unit/length`
- `UNI-09` **Volume** — `unit/volume`

**Mechanics & Electricity**

- `UNI-10` **Mass** — `unit/mass`
- `UNI-11` **Current** — `unit/current`
- `UNI-12` **Pressure** — `unit/pressure`
- `UNI-13` **Voltage** — `unit/voltage`
- `UNI-14` **Electric Charge** — `unit/charge`
- `UNI-15` **Force** — `unit/force`
- `UNI-16` **Work** — `unit/work`
- `UNI-17` **Resistance** — `unit/resistance`
- `UNI-18` **Capacitance** — `unit/capacitance`

**Motion**

- `UNI-19` **Speed** — `unit/speed`
- `UNI-20` **Acceleration** — `unit/acceleration`
- `UNI-21` **Torque** — `unit/torque`
- `UNI-22` **Data** — `unit/data`
- `UNI-23` **CSS Units** — `unit/cssunits`
- `UNI-24` **Data Transfer** — `unit/datatransfer`
- `UNI-25` **Pixel Density** — `unit/pixeldensity`
- `UNI-26` **Image Resolution** — `unit/imageresolution`
- `UNI-27` **Typography** — `unit/typography`

**Other**

- `UNI-28` **Sound** — `unit/sound`
- `UNI-29` **Luminance** — `unit/luminance`
- `UNI-30` **Luminous Flux** — `unit/luminousflux`
- `UNI-31` **Temperature Gradient** — `unit/tempgradient`
- `UNI-32` **Paper Sizes** — `unit/papersize`
- `UNI-33` **Shoe Size** — `unit/shoesize`

## Finance Tools — 19 tools

- `FIN-01` **Currency** — `finance/currency`
- `FIN-02` **Loan EMI Calculator** — `finance/loanemi`
- `FIN-03` **Investment Calculator** — `finance/investment`
- `FIN-04` **Tax Calculator** — `finance/taxcalc`
- `FIN-05` **Bill Splitter** — `finance/billsplit`
- `FIN-06` **Discount Of Product** — `finance/discount`
- `FIN-07` **Commission Calculator** — `finance/commission`
- `FIN-08` **Retirement Planner** — `finance/retirement`
- `FIN-09` **Amortization Table** — `finance/amortization`
- `FIN-10` **Inflation Calculator** — `finance/inflation`
- `FIN-11` **Mortgage Affordability** — `finance/mortgageafford`
- `FIN-12` **Tip Table Generator** — `finance/tiptable`
- `FIN-13` **Budget Splitter** — `finance/budgetsplit`
- `FIN-14` **Wage Converter** — `finance/wageconverter`
- `FIN-15` **Savings Goal** — `finance/savingsgoal`
- `FIN-16` **Debt Payoff Planner** — `finance/debtpayoff`
- `FIN-17` **Simple Interest** — `finance/simpleinterest`
- `FIN-18` **SIP Calculator** — `finance/sip`
- `FIN-19` **GST Split** — `finance/gstsplit`

## Randomizer Tools — 11 tools

- `RND-01` **Lucky Wheel** — `random/luckywheel`
- `RND-02` **Lottery Number Picker** — `random/multinumgen2`
- `RND-03` **Flip Coin** — `random/flipcoin`
- `RND-04` **Yes/No** — `random/yesno`
- `RND-05` **Rock Paper Scissors** — `random/rps`
- `RND-06` **Spin Bottle** — `random/spinbottle`
- `RND-07` **Roll Dice** — `random/rolldice`
- `RND-08` **Random from List** — `random/randomlist`
- `RND-09` **PIN Generator** — `random/pin`
- `RND-10` **Team Shuffler** — `random/teamshuffler`
- `RND-11` **Magic 8-Ball** — `random/eightball`

## Health Tools — 8 tools

- `HLT-01` **BMI Calculator** — `health/bmi`
- `HLT-02` **Water intake Calculator** — `health/water`
- `HLT-03` **Ideal Weight Calculator** — `health/idealweight`
- `HLT-04` **BMR Calculator** — `health/bmr`
- `HLT-05` **Clinical Health Calculator** — `health/clinicalhealth`
- `HLT-06` **TDEE, Macros & Body Fat** — `health/tdeemacros`
- `HLT-07` **Heart Rate Zones** — `health/heartzones`
- `HLT-08` **Pregnancy Due Date** — `health/duedate`

## Development Tools — 76 tools

- `DEV-74` **docker run → Compose** — `dev/dockercompose`
- `DEV-75` **Dockerfile Generator** — `dev/dockerfile`
- `DEV-76` **CSR Reader** — `dev/csr`
- `DEV-01` **Base Converter** — `dev/baseconverter`
- `DEV-02` **Beautify JSON** — `dev/beautifyjson`
- `DEV-03` **Beautify CSS** — `dev/beautifycss`
- `DEV-04` **Beautify XML** — `dev/beautifyxml`
- `DEV-05` **Beautify HTML** — `dev/beautifyhtml`
- `DEV-06` **Base64 Codec** — `dev/base64`
- `DEV-07` **URL Encoder/Decoder** — `dev/urlencode`
- `DEV-08` **UUID Generator** — `dev/uuid`
- `DEV-09` **Hash Generator** — `dev/hashgen`
- `DEV-10` **Text Diff** — `dev/textdiff`
- `DEV-11` **HTML Entity Codec** — `dev/htmlentity`
- `DEV-12` **Data URI Generator** — `dev/datauri`
- `DEV-13` **Password Strength** — `dev/pwstrength`
- `DEV-14` **Password Generator** — `dev/pwgen`
- `DEV-15` **Regex Tester** — `dev/regextester`
- `DEV-16` **JWT Debugger** — `dev/jwtdebug`
- `DEV-17` **Cron Parser** — `dev/cronparser`
- `DEV-18` **HTTP Status Codes** — `dev/httpstatus`
- `DEV-19` **CSS Gradient Generator** — `dev/cssgradient`
- `DEV-20` **User Agent Parser** — `dev/uaparser`
- `DEV-21` **JSON ↔ YAML** — `dev/jsonyaml`
- `DEV-22` **Unix Timestamp Converter** — `dev/unixtime`
- `DEV-23` **JSON Diff** — `dev/jsondiff`
- `DEV-66` **.editorconfig Generator** — `dev/editorconfig`
- `DEV-67` **Makefile Generator** — `dev/makefile`
- `DEV-68` **systemd Unit Generator** — `dev/systemd`
- `DEV-69` **SemVer Comparer** — `dev/semver`
- `DEV-70` **Conventional Commit** — `dev/conventional`
- `DEV-71` **Random Port** — `dev/randomport`
- `DEV-72` **IPv6 ULA Generator** — `dev/ipv6ula`
- `DEV-73` **Email Normaliser** — `dev/emailnormalise`
- `DEV-63` **RSA Sign / Verify** — `dev/rsasign`
- `DEV-64` **IPv6 Header & ICMPv6** — `dev/ipv6`
- `DEV-65` **JSONPath Query** — `dev/jsonpath`
- `DEV-61` **Packet Header Parser** — `dev/packet`
- `DEV-62` **RSA Encrypt / Decrypt** — `dev/rsacrypt`
- `DEV-60` **MIME Decoder** — `dev/mimeparse`
- `DEV-57` **JWK ↔ PEM** — `dev/jwkpem`
- `DEV-58` **File Splitter & Joiner** — `dev/filesplit`
- `DEV-59` **Duplicate Finder** — `dev/dupfinder`
- `DEV-53` **X.509 Certificate Reader** — `dev/x509`
- `DEV-54` **JSON Schema From a Sample** — `dev/jsonschema`
- `DEV-55` **Regex Explainer** — `dev/regexexplain`
- `DEV-56` **CSS Clamp Builder** — `dev/cssclamp`
- `DEV-50` **PBKDF2 Derive** — `dev/pbkdf2`
- `DEV-51` **HKDF Derive** — `dev/hkdf`
- `DEV-52` **ASN.1 Parser** — `dev/asn1`
- `DEV-45` **IP Format Converter** — `dev/ipformat`
- `DEV-46` **Hash Identifier** — `dev/hashid`
- `DEV-47` **UUID Analyser** — `dev/uuidanalyse`
- `DEV-48` **Cron Generator** — `dev/crongen`
- `DEV-49` **JWT Signer** — `dev/jwtsign`
- `DEV-37` **chmod Calculator** — `dev/chmod`
- `DEV-38` **Basic Auth Header** — `dev/basicauth`
- `DEV-39` **MAC Address Generator** — `dev/macaddr`
- `DEV-40` **IPv4 Range Expander** — `dev/iprange`
- `DEV-41` **Meta Tag Generator** — `dev/metatags`
- `DEV-42` **SQL Prettifier** — `dev/sqlpretty`
- `DEV-43` **TOTP Generator** — `dev/totp`
- `DEV-44` **RSA Key Pair** — `dev/rsakeys`
- `DEV-24` **ULID & NanoID** — `dev/ulid`
- `DEV-25` **Base32 / Base58 Codec** — `dev/base32`
- `DEV-26` **HMAC Generator** — `dev/hmac`
- `DEV-27` **MD5 Hash** — `dev/md5`
- `DEV-28` **CIDR / Subnet Calculator** — `dev/subnet`
- `DEV-29` **MIME Type Lookup** — `dev/mime`
- `DEV-30` **Markdown Preview** — `dev/mdpreview`
- `DEV-31` **Config Parser (INI / .env / TOML)** — `dev/configparse`
- `DEV-32` **.gitignore Generator** — `dev/gitignore`
- `DEV-33` **JSON → TypeScript** — `dev/jsontots`
- `DEV-34` **Query String Parser** — `dev/querystring`
- `DEV-35` **Cron Next Runs** — `dev/cronnext`
- `DEV-36` **SQL IN List Builder** — `dev/sqlin`

## Colors Tools — 10 tools

- `CLR-01` **Color Picker** — `colors/colorpicker`
- `CLR-02` **Image Color Picker** — `colors/imagecolorpicker`
- `CLR-03` **Blend Colors** — `colors/blendcolors`
- `CLR-04` **Is Color Darkened** — `colors/isdarkened`
- `CLR-05` **WCAG Contrast Checker** — `colors/contrast`
- `CLR-06` **Colour Blindness Simulator** — `colors/colorblind`
- `CLR-07` **Palette from Image** — `colors/paletteimg`
- `CLR-08` **Colour Harmony** — `colors/harmony`
- `CLR-09` **Tints & Shades** — `colors/tintshade`
- `CLR-10` **Random Colour** — `colors/randomcolor`

## Science Tools — 21 tools

- `SCI-20` **Blackbody Peak** — `science/blackbody`
- `SCI-21` **Titration** — `science/titration`
- `SCI-18` **Decibels & Sound Level** — `science/decibel`
- `SCI-19` **RC Filter Response** — `science/rcfilter`
- `SCI-01` **Ohm's Law** — `science/ohmslaw`
- `SCI-02` **Force & Acceleration** — `science/forceaccel`
- `SCI-03` **Molar Mass Calculator** — `science/molarmass`
- `SCI-04` **pH Estimator** — `science/phestimator`
- `SCI-05` **Half-Life Calculator** — `science/halflife`
- `SCI-06` **Speed of Sound** — `science/speedofsound`
- `SCI-07` **Density Calculator** — `science/density`
- `SCI-08` **Wavelength ↔ Frequency** — `science/wavelengthfreq`
- `SCI-09` **Periodic Table** — `science/periodictable`
- `SCI-16` **Resistor Colour Code** — `science/resistor`
- `SCI-17` **Buffer pH** — `science/bufferph`
- `SCI-13` **RC Time Constant** — `science/rc`
- `SCI-14` **Lens Equation** — `science/lens`
- `SCI-15` **Doppler Shift** — `science/doppler`
- `SCI-10` **Ideal Gas Law** — `science/idealgas`
- `SCI-11` **Projectile Range** — `science/projectile`
- `SCI-12` **Molarity & Dilution** — `science/molarity`

## Geo Tools — 11 tools

- `GEO-11` **UTM Converter** — `geo/utm`
- `GEO-01` **Distance** — `geo/distance`
- `GEO-02` **Bearing** — `geo/bearing`
- `GEO-03` **Midpoint** — `geo/midpoint`
- `GEO-04` **Coordinate Converter** — `geo/dmsconv`
- `GEO-05` **Sunrise/Sunset** — `geo/sunrise`
- `GEO-06` **GPS Speed** — `geo/gpsspeed`
- `GEO-07` **Polygon Area** — `geo/polygonarea`
- `GEO-08` **Antipode Finder** — `geo/antipode`
- `GEO-09` **Bearing → Cardinal** — `geo/cardinal`
- `GEO-10` **Coordinate Rounder** — `geo/coordround`

## Audio Tools — 13 tools

- `AUD-11` **Chord Builder** — `audio/chords`
- `AUD-12` **Interval Trainer** — `audio/intervals`
- `AUD-13` **Note Player** — `audio/piano`
- `AUD-01` **Tone Generator** — `audio/tonegen`
- `AUD-02` **Metronome** — `audio/metronome`
- `AUD-03` **White/Pink Noise** — `audio/noise`
- `AUD-04` **Binaural Beats** — `audio/binaural`
- `AUD-05` **Decibel Meter** — `audio/decibelmeter`
- `AUD-06` **Audio Visualizer** — `audio/visualizer`
- `AUD-07` **Sound Recorder** — `audio/soundrecorder`
- `AUD-10` **Tuner** — `audio/tuner`
- `AUD-08` **Tap Tempo** — `audio/taptempo`
- `AUD-09` **Frequency → Note** — `audio/hznote`

## Games — 16 tools

- `GAM-15` **Pong** — `games/pong`
- `GAM-16` **Breakout** — `games/breakout`
- `GAM-14` **Sudoku Solver** — `games/sudoku`
- `GAM-11` **2048** — `games/game2048`
- `GAM-12` **Minesweeper** — `games/minesweeper`
- `GAM-13` **Snake** — `games/snake`
- `GAM-01` **Tic-Tac-Toe** — `games/tictactoe`
- `GAM-02` **Number Guessing Game** — `games/numberguess`
- `GAM-03` **Memory Match** — `games/memorymatch`
- `GAM-04` **Word Scramble** — `games/wordscramble`
- `GAM-05` **Hangman** — `games/hangman`
- `GAM-06` **Simon Says** — `games/simonsays`
- `GAM-07` **Wordle** — `games/wordle`
- `GAM-08` **Trivia Creator** — `games/triviacreator`
- `GAM-09` **Reaction Time Test** — `games/reaction`
- `GAM-10` **Typing Speed** — `games/typingtest`

## Travel Tools — 5 tools

- `TRV-01` **Packing List** — `travel/packinglist`
- `TRV-02` **Flight Duration** — `travel/flightduration`
- `TRV-03` **Baggage Size Checker** — `travel/baggagesize`
- `TRV-04` **Plug Type Guide** — `travel/plugguide`
- `TRV-05` **Flight Carbon** — `travel/carbon`

## Nature Tools — 6 tools

- `NAT-01` **Moon Phase** — `nature/moonphase`
- `NAT-02` **Solstice/Equinox Dates** — `nature/solsticeequinox`
- `NAT-03` **Sun Exposure / Vitamin D Timer** — `nature/sunexposure`
- `NAT-04` **Night Sky Brightness** — `nature/nightsky`
- `NAT-05` **Golden & Blue Hour** — `nature/goldenhour`
- `NAT-06` **Day Length Calendar** — `nature/daylength`

## Productivity — 8 tools

- `PRD-01` **Pomodoro Timer** — `productivity/pomodoro`
- `PRD-02` **Habit Tracker** — `productivity/habittracker`
- `PRD-03` **Notepad** — `productivity/notepad`
- `PRD-04` **Backup & Restore** — `productivity/backup`
- `PRD-05` **Sketch Pad** — `productivity/sketchpad`
- `PRD-06` **Flashcards & Spaced Repetition** — `productivity/flashcards`
- `PRD-07` **Checklist** — `productivity/checklist`
- `PRD-08` **Meeting Cost** — `productivity/meetingcost`

## Files & Data — 18 tools

- `FIL-17` **Batch Rename** — `files/batchrename`
- `FIL-18` **File Tree** — `files/filetree`
- `FIL-15` **ELF Header Reader** — `files/elf`
- `FIL-16` **File Carver** — `files/filecarve`
- `FIL-14` **CSV to SQL** — `files/csvtosql`
- `FIL-13` **ZIP Extract** — `files/zipextract`
- `FIL-01` **ZIP Creator** — `files/zipcreate`
- `FIL-02` **GZIP Compress / Decompress** — `files/gzip`
- `FIL-03` **File Hash & Checksum** — `files/filehash`
- `FIL-04` **Encrypt / Decrypt a File** — `files/filecrypt`
- `FIL-05` **Sealed Note** — `files/sealednote`
- `FIL-06` **CSV ↔ JSON** — `files/csvjson`
- `FIL-07` **CSV Viewer** — `files/csvtable`
- `FIL-08` **Photo Metadata & GPS** — `files/exif`
- `FIL-09` **Image → Base64** — `files/imgbase64`
- `FIL-10` **Line Ending Converter** — `files/lineendings`
- `FIL-11` **File Type Detector** — `files/filetype`
- `FIL-12` **Base64 → File** — `files/b64file`

## Almanac — 10 tools

- `ALM-10` **Moon Table for a Month** — `almanac/moontable`
- `ALM-09` **Sun Table for a Month** — `almanac/suntable`
- `ALM-08` **Ekadashi List** — `almanac/ekadashi`
- `ALM-06` **Choghadiya** — `almanac/choghadiya`
- `ALM-07` **Moonrise & Moonset** — `almanac/moonrise`
- `ALM-01` **Panchang** — `almanac/panchang`
- `ALM-02` **Rahu Kaal & Muhurat** — `almanac/rahukaal`
- `ALM-03` **Sun & Moon Times** — `almanac/sunmoon`
- `ALM-04` **Planetary Hours** — `almanac/horas`
- `ALM-05` **Tithi Calendar** — `almanac/tithical`

## Communication — 5 tools

- `COM-01` **vCard Generator** — `comms/vcard`
- `COM-02` **Calendar Invite** — `comms/icsinvite`
- `COM-03` **Message Link Builder** — `comms/linkbuilder`
- `COM-04` **SMS Character Counter** — `comms/smscount`
- `COM-05` **Phone Number Formatter** — `comms/phoneformat`

## Reference — 10 tools

- `REF-08` **HTML Entities** — `reference/htmlentities`
- `REF-09` **Git Command Reference** — `reference/gitref`
- `REF-10` **Key Inspector** — `reference/keycode`
- `REF-06` **SI Prefixes** — `reference/siunits`
- `REF-07` **Greek Alphabet** — `reference/greek`
- `REF-01` **ASCII Table** — `reference/asciitable`
- `REF-02` **Big-O Cheatsheet** — `reference/bigo`
- `REF-03` **Regex Cheatsheet** — `reference/regexcheat`
- `REF-04` **Country Dial Codes** — `reference/dialcodes`
- `REF-05` **Keyboard Shortcuts** — `reference/shortcuts`

## System — 4 tools

- `SYS-01` **Device & Screen Info** — `system/deviceinfo`
- `SYS-02` **Error Log** — `system/errorlog`
- `SYS-03` **Browser Feature Check** — `system/features`
- `SYS-04` **Local Storage Usage** — `system/storage`

## Accessibility — 11 tools

- `ACC-10` **Link Text Checker** — `accessibility/linktext`
- `ACC-11` **Reflow at 200%** — `accessibility/zoomsim`
- `ACC-06` **Screen Reader Preview** — `accessibility/srpreview`
- `ACC-07` **Caption Length Checker** — `accessibility/captions`
- `ACC-08` **Colour-Blind Safe Pair** — `accessibility/cbpalette`
- `ACC-09` **Reduced Motion Preview** — `accessibility/motionpreview`
- `ACC-01` **Reading Ruler** — `accessibility/readingruler`
- `ACC-02` **Dyslexia-Friendly Preview** — `accessibility/dyslexiapreview`
- `ACC-03` **Text Spacing Checker** — `accessibility/textspacing`
- `ACC-04` **Alt Text Checker** — `accessibility/altcheck`
- `ACC-05` **Focus Ring Preview** — `accessibility/focuspreview`

## Education — 4 tools

- `EDU-01` **Multiplication Table** — `education/timestable`
- `EDU-02` **Times Table Quiz** — `education/timesquiz`
- `EDU-03` **Unit Circle** — `education/unitcircle`
- `EDU-04` **Formula Sheet** — `education/formulasheet`

## Clinical — 12 tools

- `CLN-05` **Glasgow Coma Scale** — `clinical/gcs`
- `CLN-06` **CURB-65** — `clinical/curb65`
- `CLN-07` **qSOFA** — `clinical/qsofa`
- `CLN-08` **Wells Score — DVT** — `clinical/wellsdvt`
- `CLN-09` **Wells Score — PE** — `clinical/wellspe`
- `CLN-10` **CHA₂DS₂-VASc** — `clinical/chads`
- `CLN-11` **HAS-BLED** — `clinical/hasbled`
- `CLN-12` **Child-Pugh** — `clinical/childpugh`
- `CLN-01` **Paediatric Dose** — `clinical/paeddose`
- `CLN-02` **IV Drip Rate** — `clinical/drip`
- `CLN-03` **eGFR (CKD-EPI 2021)** — `clinical/egfr`
- `CLN-04` **Corrected Calcium & Anion Gap** — `clinical/electrolytes`

## Money (India) — 9 tools

- `MNY-08` **Leave Encashment** — `money/leaveencashment`
- `MNY-09` **Salary Splitter** — `money/salarysplit`
- `MNY-05` **Step-Up SIP** — `money/stepupsip`
- `MNY-06` **FD Ladder** — `money/fdladder`
- `MNY-07` **NPS Corpus** — `money/nps`
- `MNY-01` **HRA Exemption** — `money/hra`
- `MNY-02` **EPF Corpus** — `money/epf`
- `MNY-03` **Gratuity** — `money/gratuity`
- `MNY-04` **PPF / FD Maturity** — `money/ppf`
