# Haiku Cosmos — SUB META SYSTEM
## System sub-meta: oddechy pomiędzy działaniami

SUB-META to warstwa pośrednia pomiędzy RUN a META końcowym.
Jej celem jest:
- przywracanie decyzyjności gracza,
- umożliwienie taktycznych zmian stylu gry,
- zapobieganie „zamrożeniu kosmosu” przy dużych skalach,
- zapewnienie gratyfikacji pośredniej bez czekania do końca runu.

SUB-META **nie resetuje świata** i **nie kończy runu**.
Jest świadomym zatrzymaniem / spowolnieniem czasu kosmosu.

---

## 1. Pozycja SUB-META w strukturze gry

RUN  
→ **SUB-META** (wielokrotnie, krótkie)  
→ META końcowe (rzadko, pełny reset / nowy eon)

SUB-META:
- występuje wiele razy w jednym runie,
- trwa krótko,
- dotyczy *sposobu działania gracza*, nie globalnych zasad świata.

---

## 2. Pierwsze progi wejścia do SUB-META (v1)

Na etapie v1 SUB-META jest wyzwalana **deterministycznie**, przez kluczowe przejścia epokowe.

### Kanoniczne progi v1:
1. **Utworzenie pierwszej planety**
2. **Utworzenie pierwszej gwiazdy**

Są to momenty:
- wyraźnej zmiany skali,
- zmiany dynamiki świata,
- naturalnego „zatrzymania oddechu”.

W przyszłości:
- SUB-META będzie mogła być wyzwalana także przez eventy, rytuały i zakończenie akcji,
- ale v1 celowo ogranicza się do prostych, czytelnych progów.

---

## 3. Zachowanie świata podczas SUB-META

Po wejściu w SUB-META:

- symulacja świata zostaje:
  - **zamrożona** lub
  - **radykalnie spowolniona** (do decyzji implementacyjnej),
- obiekty pozostają widoczne,
- nie zachodzą nowe kolizje ani przechwyty.

SUB-META jest **stanem kosmosu**, nie osobną sceną.

---

## 4. Rola SUB-META dla gracza

SUB-META daje graczowi możliwość:

1. **Zatrzymania się**
2. **Zrozumienia co właśnie się wydarzyło**
3. **Zmiany stylu interakcji**

Nie jest to sklep ani drzewko statystyk.

---

## 5. PRG w SUB-META — zmiana „broni” / postawy

PRG (Player Reaction Field) w SUB-META:
- przestaje być stałym polem,
- staje się narzędziem taktycznym.

W SUB-META gracz może:
- przełączyć **tryb działania PRG** (stance),
- zdecydować *jak* chce dalej wpływać na świat.

Przykładowe osie zmian (nie implementacja):
- promień działania,
- siła „glue”,
- przyciąganie vs odpychanie,
- spowalnianie vs przyśpieszanie.

Zmiany dokonane w SUB-META:
- obowiązują w dalszej części runu,
- nie są jeszcze META permanentnym.

---

## 6. SUB-META jako rozwiązanie problemu „zamrożonej rozgrywki”

W pewnym momencie runu:
- planety i gwiazdy osiągają bardzo duże skale,
- ich orbity grawitacyjne zajmują większość ekranu,
- brak wolnych meteorów i planetoid uniemożliwia sensowną interakcję.

Ten stan:
- **nie jest błędem**,
- jest sygnałem, że kosmos osiągnął lokalne nasycenie.

SUB-META pełni rolę:
- bezpiecznego zatrzymania,
- miejsca decyzji „co dalej”,
- przygotowania do kolejnej fazy dynamiki.

---

## 7. SUB-META a progi jakościowe (uwaga projektowa)

Na obecnym etapie:
- wysokie progi jakościowe (np. dominacja 60–80%) mogą blokować przejścia planeta → gwiazda,
- przy dużych orbitach prowadzi to do „puchnięcia” bez transformacji.

W wersji v1:
- **dopuszcza się obniżenie progu jakościowego do ok. 30%**,
- celem jest umożliwienie przejścia w PRESTAR i dalsze testy skal.

Docelowo:
- progi jakościowe będą modulowane przez karty, META i SUB-META,
- a nie sztywno blokowały progresję.

---

## 8. Relacja SUB-META do kamery i skali (przyszłość)

SUB-META jest naturalnym miejscem na:
- reframing skali,
- delikatny zoom out,
- przygotowanie gracza na „kosmiczne” proporcje.

Na etapie v1:
- zoom out jest **poza zakresem implementacji**,
- ale SUB-META jest projektowym punktem zaczepienia dla tej mechaniki.

---

## 9. Relacja SUB-META do META końcowego

SUB-META:
- taktyczna,
- częsta,
- odwracalna.

META końcowe:
- strategiczne,
- rzadkie,
- zamyka eon i resetuje run.

Te dwa poziomy **nie zastępują się** i pełnią różne role.

---

## 10. Status dokumentu

Dokument koncepcyjny — v1.
Zakres celowo ograniczony do:
- progów epokowych,
- PRG jako narzędzia,
- rozwiązania problemu skali i zamrożenia rozgrywki.

Rozszerzenia (eventy, rytuały, losowość) będą opisane w kolejnych iteracjach.
