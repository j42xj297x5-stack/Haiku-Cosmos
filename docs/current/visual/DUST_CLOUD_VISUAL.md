Specyfikacja robocza — Three.js Dust Cloud Visual v1
1. Cel

Celem DustCloud Visual v1 jest zastąpienie prostych kul/okręgów pyłu organicznymi obłokami mgławicowymi w Three.js.

Chmury pyłu mają wyglądać jak żywa materia kosmiczna, nie jak szare kulki debugowe.

Kierunek zatwierdzony:

harmonicDust      → świetlista kolorowa mgławica
cosmicGrayDust    → ciemna mgławica kosmiczna
czytelność        → podporządkowana organiczności
2. Zakres

Spec dotyczy wizualizacji:

harmonicDust
cosmicGrayDust / future dustCloud
frozenDustCloud
ignitedDustCloud
recovering harmonicDust

Nie dotyczy jeszcze:

HUD stosiku pyłu
Magazynu
Kuźni
flakonów/naczyń
kryształów
finalnych wartości balansu

Ważne: harmonicDust, moonImpactDust i przyszły fizyczny cosmicGrayDust są rozdzielone pojęciowo. Dokument impact/orbit mówi wprost, że harmonicDust powstaje z kolizji dwóch meteorów tego samego koloru, a przyszły cosmicGrayDust / dustCloud jest niezależny od HUD reservoir, nie jest zwykłym zasobem do zebrania i ma wpływać fizycznie na obiekty.

3. Model wizualny

Podstawowy renderer chmury:

DustCloud = Points core + Sprite shell

Czyli:

1. rdzeń z drobin:
   THREE.Points

2. zewnętrzna powłoka:
   kilka miękkich półprzezroczystych sprite’ów / billboardów

3. animacja:
   puls skali
   dryf punktów
   powolny obrót warstw
   zmienna przezroczystość

Nie używać jako podstawy:

jednej SphereGeometry
jednej szarej kuli
idealnego okręgu
statycznej plamy bez życia
4. Typy chmur
4.1. harmonicDust

Źródło:

kolizja dwóch meteorów tego samego koloru

Wygląd:

świetlista kolorowa mgławica
lekki rdzeń
miękkie rozproszone obrzeża
delikatne iskrzące drobiny
nieregularny kształt
subtelny puls

Kolory:

RED
YELLOW
GREEN
BLUE

Charakter:

lekki
żywy
zbieralny / powiązany z PRG
bardziej świetlisty niż dymny
4.2. cosmicGrayDust

Źródło docelowe:

przyszły fizyczny szary pył kosmiczny / dustCloud

Wygląd:

ciemna mgławica
grafitowo-fioletowy / stalowo-popielaty ton
mało czystej bieli
gęstsza powłoka
wolniejszy puls
mniej iskrzenia
większa głębia

Charakter:

ciężki
fizyczny
niezbieralny zwykłym trybem
spowalniający obiekty
bardziej stan świata niż zasób HUD
4.3. frozenDustCloud

Powiązanie systemowe:

Kometa lodowa po wejściu w chmurę pyłu zamraża ją, zagęszcza i nadaje stan frozenDustCloud; dokument komet opisuje też silniejsze spowalnianie obiektów w takiej chmurze.

Wygląd:

bardziej zwarta mgławica
mniejszy dryf
ostrzejsze drobiny
kryształowe punkty
chłodna, niebieskawa poświata
4.4. ignitedDustCloud

Powiązanie systemowe:

Kometa ognista rozpala chmurę pyłu i nadaje jej stan ignitedDustCloud; jeśli chmura była zamrożona, ogień topi ją i nadpisuje stan ogniem.

Wygląd:

rozgrzany rdzeń
ciemniejsza zewnętrzna powłoka
iskry na brzegach
nieregularny puls żaru
krótkie rozbłyski
4.5. recovering

Dla kolorowego pyłu przesuniętego chwilowo ku szarości:

kolor powoli wraca od grafitu do barwy bazowej
powłoka robi się lżejsza
rdzeń odzyskuje świetlistość
puls przyspiesza do normalnego rytmu

To pasuje do decyzji, że kolorowy pył może być czasowo „gray-shifted”, ale jeśli próg przemiany nie został przekroczony, odzyskuje kolor.

5. Parametry wizualne

Minimalny zestaw pól:

id
type: harmonic | cosmicGray
color: red | yellow | green | blue | gray
state: normal | frozen | ignited | recovering
position
radius
density
particleCount
shellCount
opacity
glowStrength
driftSpeed
pulseSpeed
rotationSpeed
lifetimeMs
ageMs

Parametry debug:

dustCloudParticleCount
dustCloudRadius
dustCloudDensity
dustCloudCoreOpacity
dustCloudShellOpacity
dustCloudGlowStrength
dustCloudPulseSpeed
dustCloudDriftSpeed
dustCloudShellScale
cosmicGrayDarkness
frozenDensityMultiplier
ignitedGlowMultiplier
recoverColorDurationMs
6. Zasady stylu

Chmura ma być:

organiczna
nieregularna
półprzezroczysta
warstwowa
żywa
kosmiczna

Chmura nie ma być:

kulą
ikoną zasobu
okrągłym guzikiem
jednym billboardem
agresywnym neonem
debugowym placeholderem
7. Relacja z HUD i Kuźnią

HUD nadal powinien zbierać tylko jeden kolor bazowy naraz, a mieszanie pyłów oraz szary/alchemiczny pył powinny pozostać po stronie SUB-META, Kuźni albo stanów świata — nie zwykłego zasobnika HUD.

Dlatego visual chmury w świecie może być organiczny i mniej „ikonowy”. Czytelność zasobu rozwiązuje HUD, a nie sama geometria chmury.

8. Rekomendowana kolejność wdrożenia
Etap 1:
Wspólny obiekt DustCloudView / ThreeDustCloudView.

Etap 2:
Profil harmonicNebula dla RED/YELLOW/GREEN/BLUE.

Etap 3:
Profil cosmicGrayNebula jako ciemna mgławica.

Etap 4:
Stany frozen / ignited / recovering tylko jako visual state.

Etap 5:
Dopiero potem podpięcie fizycznych efektów cosmicGrayDust.
9. Decyzja robocza

Aktualna decyzja projektowa:

DustCloud Visual v1 opiera się na hybrydzie THREE.Points + miękka powłoka sprite’ów.

Kolorowy harmonicDust wygląda jak świetlista mgławica.

Szary cosmicGrayDust wygląda jak ciemna, cięższa mgławica kosmiczna.

Czytelność pickupowa nie dominuje nad organicznym wyglądem obłoku.