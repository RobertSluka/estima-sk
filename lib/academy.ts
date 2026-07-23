// ─── Estima Academy content model ────────────────────────────────────────────
// The Slovak academy guides, extracted verbatim from the report-service static
// page (app/static/academy_sk.html) into typed data. Body is a block list so
// the article renderer can style paragraphs, lists and callouts and build a
// table of contents. Regenerate with scripts (scratchpad) if the source HTML
// changes. `description` and `readingMinutes` are derived (first sentence /
// word count) — the source has neither.

export type CalloutVariant = "estima" | "tip" | "example" | "data" | "warning"

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; variant: CalloutVariant; heading: string; paragraphs: string[] }
  | { type: "figure"; src: string; alt: string; caption: string }

export interface AcademyCategory {
  slug: string
  title: string
}

export interface AcademyArticle {
  slug: string
  number: number
  categorySlug: string
  title: string
  description: string
  readingMinutes: number
  body: ArticleBlock[]
  cta: { label: string; href: string } | null
}

export const ACADEMY_CATEGORIES: AcademyCategory[] = [
  {
    "slug": "zaklady-ocenovania",
    "title": "Základy oceňovania"
  },
  {
    "slug": "signaly-nehnutelnosti-a-trhu",
    "title": "Signály nehnuteľnosti a trhu"
  },
  {
    "slug": "komunikacia-s-klientom",
    "title": "Komunikácia s klientom"
  },
  {
    "slug": "naborove-prezentacie-a-proces-kancelarie",
    "title": "Náborové prezentácie a proces kancelárie"
  }
]

export const ACADEMY_ARTICLES: AcademyArticle[] = [
  {
    "slug": "ako-pripravit-ocenenie-nehnutelnosti-podlozene-datami",
    "number": 1,
    "categorySlug": "zaklady-ocenovania",
    "title": "Ako pripraviť ocenenie nehnuteľnosti podložené dátami",
    "description": "Kvalitné ocenenie nehnuteľnosti by sa nemalo opierať o jedinú priemernú cenu za meter štvorcový.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Kvalitné ocenenie nehnuteľnosti by sa nemalo opierať o jedinú priemernú cenu za meter štvorcový. Dva byty v tej istej mestskej časti môžu mať výrazne odlišnú hodnotu — kvôli stavu, podlažiu, dispozícii, kvalite budovy, orientácii, polohe a aktuálnej konkurencii na trhu."
      },
      {
        "type": "p",
        "text": "Ocenenie podložené dátami by malo obsahovať:"
      },
      {
        "type": "ul",
        "items": [
          "kľúčové charakteristiky nehnuteľnosti;",
          "podobné nehnuteľnosti aktuálne v ponuke;",
          "nedávne zmeny cien;",
          "miestnu cenu za meter štvorcový;",
          "rozdiely medzi oceňovanou nehnuteľnosťou a porovnateľnými inzerátmi;",
          "aktuálnu ponuku a dopyt;",
          "odhadované cenové rozpätie namiesto jedného nevysvetleného čísla."
        ]
      },
      {
        "type": "p",
        "text": "Skúsenosti makléra zostávajú kľúčové. Dáta poskytujú dôkazy, maklér interpretuje kontext."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima zhromaždí relevantné informácie o nehnuteľnosti, identifikuje porovnateľné inzeráty a spracuje analýzu do oceňovacieho reportu zrozumiteľného pre klienta.",
          "Namiesto ručného skladania informácií z viacerých realitných portálov a tabuliek dostane maklér štruktúrovaný podklad, ktorý môže skontrolovať a upraviť na základe profesionálneho úsudku."
        ]
      }
    ],
    "cta": {
      "label": "Vytvorte oceňovací report s Estimou",
      "href": "/"
    }
  },
  {
    "slug": "ako-vybrat-skutocne-porovnatelne-nehnutelnosti",
    "number": 2,
    "categorySlug": "zaklady-ocenovania",
    "title": "Ako vybrať skutočne porovnateľné nehnuteľnosti",
    "description": "Porovnateľná nehnuteľnosť nie je jednoducho ďalší byt v okolí.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Porovnateľná nehnuteľnosť nie je jednoducho ďalší byt v okolí. Najsilnejšie porovnateľné inzeráty zvyčajne zdieľajú s oceňovanou nehnuteľnosťou viacero charakteristík:"
      },
      {
        "type": "ul",
        "items": [
          "typ nehnuteľnosti;",
          "lokalitu a mikrolokalitu;",
          "úžitkovú plochu;",
          "počet izieb;",
          "formu vlastníctva;",
          "podlažie a prítomnosť výťahu;",
          "stav budovy;",
          "stav bytu;",
          "balkón, terasu, parkovanie alebo pivnicu;",
          "približnú dĺžku inzercie."
        ]
      },
      {
        "type": "p",
        "text": "Kompletne zrekonštruovaný byt by sa nemal priamo porovnávať s bytom vyžadujúcim celkovú rekonštrukciu bez zohľadnenia tohto rozdielu. Podobne dva byty vzdialené len jeden kilometer môžu patriť do úplne odlišných mikrotrhov."
      },
      {
        "type": "p",
        "text": "Zmyslom analýzy porovnateľných nehnuteľností nie je nájsť identické nehnuteľnosti. Identické nehnuteľnosti takmer neexistujú. Zmyslom je identifikovať najrelevantnejšie dostupné dôkazy a vysvetliť rozdiely."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima zoradí potenciálne porovnateľné inzeráty podľa podobnosti a umožní maklérovi rozhodnúť, ktoré nehnuteľnosti sa dostanú do finálneho reportu.",
          "To skracuje čas strávený manuálnym vyhľadávaním a konečné rozhodnutie necháva v rukách makléra."
        ]
      },
      {
        "type": "figure",
        "src": "/images/academy/report-porovnatelne.jpg",
        "alt": "Tabuľka porovnateľných inzerátov v oceňovacom reporte Estima",
        "caption": "Porovnateľné inzeráty v reporte Estima — každý kandidát má rozdiel voči oceňovanej nehnuteľnosti a skóre podobnosti, takže finálny výber zostáva kontrolovateľným rozhodnutím."
      }
    ],
    "cta": {
      "label": "Nájdite silnejšie porovnateľné inzeráty s Estimou",
      "href": "/"
    }
  },
  {
    "slug": "ponukova-cena-verzus-pravdepodobna-predajna-cena",
    "number": 3,
    "categorySlug": "zaklady-ocenovania",
    "title": "Ponuková cena verzus pravdepodobná predajná cena",
    "description": "Ponuková cena vyjadruje, čo majiteľ dúfa, že dostane.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Ponuková cena vyjadruje, čo majiteľ dúfa, že dostane. Pravdepodobná predajná cena vyjadruje, čo je trh aktuálne ochotný akceptovať. Tieto čísla sa často líšia."
      },
      {
        "type": "p",
        "text": "Nehnuteľnosť môže byť inzerovaná nad trhovou hodnotou, pretože:"
      },
      {
        "type": "ul",
        "items": [
          "majiteľ počíta s priestorom na vyjednávanie;",
          "ponuková cena vychádza z citovej väzby;",
          "majiteľ porovnáva nehnuteľnosť s nevhodnými inzerátmi;",
          "nehnuteľnosť zostala na trhu, zatiaľ čo podmienky sa zmenili;",
          "konkurenčné nehnuteľnosti znížili ceny."
        ]
      },
      {
        "type": "p",
        "text": "Makléri by preto nemali prezentovať aktuálne ponukové ceny ako potvrdené trhové hodnoty. Dôveryhodné ocenenie by malo zohľadniť charakteristiky nehnuteľnosti, konkurenciu, počet dní na trhu a viditeľné zľavy z ceny."
      },
      {
        "type": "p",
        "text": "Ak nie sú k dispozícii overené údaje o realizovaných predajoch, maklér by mal jasne uviesť, že ponukové ceny slúžia ako trhový dôkaz, nie ako ceny skutočne uzavretých predajov."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima oddeľuje inzerovanú cenu od odhadovaného trhového rozpätia a ukazuje dôkazy, o ktoré sa odporúčanie opiera.",
          "Maklér tak vie vysvetliť, prečo jednoduché prevzatie najvyššej ceny z okolia môže viesť k nereálnemu oceneniu."
        ]
      }
    ],
    "cta": {
      "label": "Porovnajte ponukovú cenu s odhadovaným trhovým rozpätím",
      "href": "/"
    }
  },
  {
    "slug": "ako-predavajucemu-vysvetlit-cenove-rozpatie-estima",
    "number": 4,
    "categorySlug": "zaklady-ocenovania",
    "title": "Ako predávajúcemu vysvetliť cenové rozpätie Estima",
    "description": "Cenové rozpätie je často dôveryhodnejšie než jedno presné číslo.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Cenové rozpätie je často dôveryhodnejšie než jedno presné číslo. Trhová hodnota nehnuteľnosti nie je fixná na euro presne. Závisí od dopytu kupujúcich, prezentácie nehnuteľnosti, vyjednávania a zmien v konkurenčnej ponuke."
      },
      {
        "type": "p",
        "text": "Pri prezentovaní rozpätia Estima vysvetlite tri možné pozície:"
      },
      {
        "type": "p",
        "text": "Cena pri spodnej časti rozpätia môže vyvolať väčší záujem a zvýšiť pravdepodobnosť viacerých dopytov alebo ponúk."
      },
      {
        "type": "p",
        "text": "Cena okolo stredu rozpätia predstavuje rozumnú rovnováhu medzi pritiahnutím dopytu a ochranou hodnoty pre majiteľa."
      },
      {
        "type": "p",
        "text": "Cenu pri hornej hranici rozpätia alebo nad ňou možno otestovať, majiteľ by však mal rozumieť riziku dlhšieho predaja a budúcich zliav z ceny."
      },
      {
        "type": "p",
        "text": "Maklér by mal odporučiť stratégiu, nielen predložiť číslo."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Report Estima dáva predávajúcemu vizuálne vysvetlenie cenového rozpätia, porovnateľných nehnuteľností a relevantných trhových podmienok.",
          "Cenový rozhovor sa tak mení z osobného sporu na profesionálnu diskusiu podloženú dôkazmi."
        ]
      },
      {
        "type": "figure",
        "src": "/images/academy/odhad-rozpatie.jpg",
        "alt": "Orientačný odhad ceny v Estime s cenovým rozpätím",
        "caption": "Estima prezentuje ocenenie ako rozpätie ukotvené v cene za m² — tri cenové pozície možno prediskutovať priamo nad ním."
      }
    ],
    "cta": {
      "label": "Prezentujte svoje cenové odporúčanie s istotou",
      "href": "/"
    }
  },
  {
    "slug": "ako-reagovat-ked-majitel-ocakava-nerealnu-cenu",
    "number": 5,
    "categorySlug": "komunikacia-s-klientom",
    "title": "Ako reagovať, keď majiteľ očakáva nereálnu cenu",
    "description": "Povedať majiteľovi, že jeho cenové očakávanie je nereálne, môže okamžite vyvolať odpor.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Povedať majiteľovi, že jeho cenové očakávanie je nereálne, môže okamžite vyvolať odpor."
      },
      {
        "type": "p",
        "text": "Lepší prístup je vyhnúť sa vete:"
      },
      {
        "type": "p",
        "text": "Namiesto toho povedzte:"
      },
      {
        "type": "p",
        "text": "Začnite prioritami majiteľa. Opýtajte sa, či je pre neho dôležitejšia najvyššia možná cena, predvídateľný predaj alebo rýchlejšia transakcia. Potom predložte:"
      },
      {
        "type": "ul",
        "items": [
          "podobné aktívne inzeráty;",
          "ako dlho sú inzerované;",
          "nedávne zľavy z ceny;",
          "rozdiely v stave a lokalite;",
          "úroveň konkurencie pri navrhovanej cene."
        ]
      },
      {
        "type": "p",
        "text": "Cieľom nie je vyhrať spor. Cieľom je pomôcť majiteľovi pochopiť dôsledky každého cenového rozhodnutia."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Report Estima umožňuje maklérovi podložiť odporúčanie neutrálnymi trhovými dôkazmi.",
          "Ak je zdôvodnenie jasne zdokumentované, majiteľ si ocenenie menej pravdepodobne vyloží ako snahu o rýchly predaj."
        ]
      }
    ],
    "cta": {
      "label": "Zmeňte náročné cenové rozhovory na rozhodnutia podložené dôkazmi",
      "href": "/"
    }
  },
  {
    "slug": "ako-stav-nehnutelnosti-a-fotografie-ovplyvnuju-ocenenie",
    "number": 6,
    "categorySlug": "signaly-nehnutelnosti-a-trhu",
    "title": "Ako stav nehnuteľnosti a fotografie ovplyvňujú ocenenie",
    "description": "Stav nehnuteľnosti môže výrazne ovplyvniť záujem kupujúcich, očakávané náklady na rekonštrukciu aj konečnú dosiahnuteľnú cenu.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Stav nehnuteľnosti môže výrazne ovplyvniť záujem kupujúcich, očakávané náklady na rekonštrukciu aj konečnú dosiahnuteľnú cenu. Dôležité faktory zahŕňajú:"
      },
      {
        "type": "ul",
        "items": [
          "stav kuchyne a kúpeľne;",
          "podlahy a okná;",
          "elektroinštaláciu a rozvody vody;",
          "denné svetlo;",
          "viditeľné nedostatky údržby;",
          "kvalitu rekonštrukcie;",
          "konzistentnosť materiálov a povrchov;",
          "stav budovy a spoločných priestorov."
        ]
      },
      {
        "type": "p",
        "text": "Aj fotografie ovplyvňujú, ako kupujúci vnímajú nehnuteľnosť ešte pred obhliadkou. Tmavé, nejasné alebo neúplné fotografie môžu znížiť záujem aj pri atraktívnej nehnuteľnosti. Kvalitné fotografie nenapravia nevhodnú cenu, môžu však zlepšiť kvalitu a počet prvotných dopytov."
      },
      {
        "type": "p",
        "text": "Makléri by mali rozlišovať medzi:"
      },
      {
        "type": "ul",
        "items": [
          "fyzickým stavom nehnuteľnosti;",
          "kvalitou jej prezentácie;",
          "trhovou hodnotou vykonaných vylepšení."
        ]
      },
      {
        "type": "p",
        "text": "Nie každá rekonštrukcia zvýši hodnotu nehnuteľnosti o celú investovanú sumu."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima dokáže zdokumentovať viditeľný stav nehnuteľnosti a zohľadniť relevantné rozdiely pri porovnávaní s konkurenčnými inzerátmi.",
          "Maklér tak získa ďalšiu štruktúru na vysvetlenie, prečo dve zdanlivo podobné nehnuteľnosti môžu vyžadovať rôzne ceny."
        ]
      }
    ],
    "cta": {
      "label": "Zahrňte stav nehnuteľnosti do svojej analýzy ocenenia",
      "href": "/"
    }
  },
  {
    "slug": "ako-vyuzit-report-estima-pocas-naborovej-prezentacie",
    "number": 7,
    "categorySlug": "naborove-prezentacie-a-proces-kancelarie",
    "title": "Ako využiť report Estima počas náborovej prezentácie",
    "description": "Oceňovací report má rozhovor podporiť, nie nahradiť.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Oceňovací report má rozhovor podporiť, nie nahradiť. Prezentáciu začnite otázkami na ciele majiteľa:"
      },
      {
        "type": "ul",
        "items": [
          "Prečo uvažuje o predaji?",
          "Aký je jeho preferovaný časový plán?",
          "Dostal už iné ocenenia?",
          "Akú cenu aktuálne očakáva?",
          "Čo je pre neho pri výbere makléra najdôležitejšie?"
        ]
      },
      {
        "type": "p",
        "text": "Po pochopení situácie majiteľa predstavte report. Osvedčené poradie prezentácie:"
      },
      {
        "type": "p",
        "text": "Nestrávte celé stretnutie čítaním reportu stranu po strane. Používajte ho na zodpovedanie otázok a podporu odporúčania."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Report Estima dáva maklérovi profesionálny vizuálny dokument, ktorý môže prezentovať na stretnutí a následne zdieľať s majiteľom.",
          "Ocenenie vďaka nemu pôsobí štruktúrovane, transparentne a pripravené špeciálne pre danú nehnuteľnosť."
        ]
      }
    ],
    "cta": {
      "label": "Posilnite svoju najbližšiu náborovú prezentáciu",
      "href": "/"
    }
  },
  {
    "slug": "ako-ziskat-viac-exkluzivnych-zakaziek-vdaka-lepsim-ocenovacim-reportom",
    "number": 8,
    "categorySlug": "naborove-prezentacie-a-proces-kancelarie",
    "title": "Ako získať viac exkluzívnych zákaziek vďaka lepším oceňovacím reportom",
    "description": "Majitelia sa pred rozhodnutím, koho poveria predajom, často rozprávajú s viacerými maklérmi.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Majitelia sa pred rozhodnutím, koho poveria predajom, často rozprávajú s viacerými maklérmi. Mnohí makléri poskytnú len ústny odhad ceny alebo krátky e-mail. Štruktúrovaný oceňovací report vytvára silnejší profesionálny dojem."
      },
      {
        "type": "p",
        "text": "Dobrý report ukazuje, že maklér:"
      },
      {
        "type": "ul",
        "items": [
          "preskúmal nehnuteľnosť;",
          "prešiel relevantnú konkurenciu;",
          "zohľadnil trhové podmienky;",
          "pripravil jasnú cenovú stratégiu;",
          "vynaložil úsilie ešte pred získaním zákazky."
        ]
      },
      {
        "type": "p",
        "text": "Report by sa nemal používať ako záruka, že sa nehnuteľnosť predá za konkrétnu sumu. Má demonštrovať kvalitu maklérovho procesu."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima umožňuje maklérom pripraviť profesionálne reporty s vlastnou značkou bez ručného vytvárania každého grafu, tabuľky a porovnania.",
          "Aj menšie kancelárie tak dosiahnu úroveň prezentácie, ktorá je bežne spájaná s veľkými firmami a oceňovacími oddeleniami."
        ]
      }
    ],
    "cta": {
      "label": "Odlíšte svoju kanceláriu profesionálnymi reportmi",
      "href": "/"
    }
  },
  {
    "slug": "najcastejsie-chyby-pri-ocenovani-nehnutelnosti",
    "number": 9,
    "categorySlug": "zaklady-ocenovania",
    "title": "Najčastejšie chyby pri oceňovaní nehnuteľností",
    "description": "Aj skúsení makléri môžu pri unáhlenom alebo nekonzistentnom postupe pripraviť slabšie ocenenie.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Aj skúsení makléri môžu pri unáhlenom alebo nekonzistentnom postupe pripraviť slabšie ocenenie. Medzi časté chyby patrí:"
      },
      {
        "type": "ul",
        "items": [
          "spoliehanie sa iba na priemernú cenu za meter štvorcový;",
          "výber nehnuteľností, ktoré sú síce blízko, ale nie sú skutočne porovnateľné;",
          "ignorovanie stavu nehnuteľnosti;",
          "porovnávanie rôznych foriem vlastníctva;",
          "používanie iba najdrahších inzerátov;",
          "ignorovanie inzerátov, ktoré zostávajú dlhodobo nepredané;",
          "zamieňanie ponukovej ceny s cenou realizovaného predaja;",
          "prezentovanie jednej presnej hodnoty bez vysvetlenia neistoty;",
          "neaktualizovanie ocenenia pri zmene trhu."
        ]
      },
      {
        "type": "p",
        "text": "Spoľahlivý proces oceňovania by mal byť opakovateľný. Iný člen tímu by mal pri tej istej nehnuteľnosti vedieť pochopiť, ako odporúčanie vzniklo."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima vytvára konzistentnú štruktúru oceňovania naprieč kanceláriou a zároveň necháva jednotlivým maklérom priestor na uplatnenie miestnej expertízy."
        ]
      }
    ],
    "cta": {
      "label": "Štandardizujte proces oceňovania vo svojej kancelárii",
      "href": "/"
    }
  },
  {
    "slug": "preco-zalezi-na-pocte-dni-na-trhu",
    "number": 10,
    "categorySlug": "signaly-nehnutelnosti-a-trhu",
    "title": "Prečo záleží na počte dní na trhu",
    "description": "Dĺžka inzercie nehnuteľnosti môže prezradiť užitočné informácie o jej pozícii na trhu.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Dĺžka inzercie nehnuteľnosti môže prezradiť užitočné informácie o jej pozícii na trhu. Dlhé obdobie inzercie môže naznačovať:"
      },
      {
        "type": "ul",
        "items": [
          "nereálnu ponukovú cenu;",
          "slabú prezentáciu;",
          "nízky dopyt po danom type nehnuteľnosti;",
          "právne alebo technické komplikácie;",
          "nepresné informácie o nehnuteľnosti;",
          "meniace sa trhové podmienky."
        ]
      },
      {
        "type": "p",
        "text": "Počet dní na trhu by sa nikdy nemal interpretovať izolovane. Niektoré výnimočné alebo drahé nehnuteľnosti prirodzene vyžadujú dlhší čas predaja. Ak však viacero podobných nehnuteľností zostáva dlho v ponuke, ich ponukové ceny nemusia zodpovedať dosiahnuteľným trhovým hodnotám."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima sleduje, ako dlho sú porovnateľné nehnuteľnosti viditeľné, a upozorňuje na zmeny, ktoré môžu ovplyvniť ich relevantnosť.",
          "Makléri tak vedia rozlíšiť čerstvú konkurenciu od inzerátov, ktoré už trh pravdepodobne odmietol."
        ]
      }
    ],
    "cta": {
      "label": "Pridajte časovanie trhu do analýzy porovnateľných inzerátov",
      "href": "/"
    }
  },
  {
    "slug": "co-o-trhu-hovoria-zlavy-z-ceny",
    "number": 11,
    "categorySlug": "signaly-nehnutelnosti-a-trhu",
    "title": "Čo o trhu hovoria zľavy z ceny",
    "description": "Zľava z ceny je signál, že pôvodná ponuková cena nevyvolala očakávanú odozvu.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Zľava z ceny je signál, že pôvodná ponuková cena nevyvolala očakávanú odozvu. Jedna zľava automaticky neznamená, že nová cena je správna. Vzorce naprieč viacerými inzerátmi však môžu naznačovať, že očakávania predávajúcich prevyšujú aktuálny dopyt kupujúcich."
      },
      {
        "type": "p",
        "text": "Makléri by si mali všímať:"
      },
      {
        "type": "ul",
        "items": [
          "pôvodnú ponukovú cenu;",
          "aktuálnu ponukovú cenu;",
          "výšku zľavy;",
          "počet zliav;",
          "čas medzi jednotlivými zmenami;",
          "či podobné inzeráty sledujú rovnaký vzorec."
        ]
      },
      {
        "type": "p",
        "text": "Cenová história je obzvlášť užitočná, keď majiteľ argumentuje konkurenčným inzerátom ako dôkazom, že jeho nehnuteľnosť by mala byť inzerovaná drahšie."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima dokáže zobraziť cenový vývoj porovnateľných nehnuteľností — jasnejší pohľad, než ponúka jediná snímka obrazovky z realitného portálu."
        ]
      }
    ],
    "cta": {
      "label": "Využite cenovú históriu pri najbližšom ocenení",
      "href": "/"
    }
  },
  {
    "slug": "ako-lokalita-a-mikrolokalita-ovplyvnuju-hodnotu-nehnutelnosti",
    "number": 12,
    "categorySlug": "signaly-nehnutelnosti-a-trhu",
    "title": "Ako lokalita a mikrolokalita ovplyvňujú hodnotu nehnuteľnosti",
    "description": "Priemery na úrovni mesta a mestskej časti sú užitočné, ale kupujúci vnímajú nehnuteľnosť na úrovni ulice a susedstva.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Priemery na úrovni mesta a mestskej časti sú užitočné, ale kupujúci vnímajú nehnuteľnosť na úrovni ulice a susedstva. Faktory mikrolokality môžu zahŕňať:"
      },
      {
        "type": "ul",
        "items": [
          "dostupnosť verejnej dopravy;",
          "hluk a dopravu;",
          "školy a škôlky;",
          "parky a zeleň;",
          "obchody a služby;",
          "možnosti parkovania;",
          "okolie budovy;",
          "budúcu výstavbu;",
          "výhľad a orientáciu;",
          "pešiu dostupnosť dôležitých miest."
        ]
      },
      {
        "type": "p",
        "text": "Dve nehnuteľnosti s rovnakým PSČ môžu priťahovať odlišné skupiny kupujúcich a dosahovať rôzne ceny. Maklér by mal vysvetliť, ktoré faktory lokality vytvárajú skutočnú hodnotu pre kupujúceho a ktoré sú najmä marketingové tvrdenia."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima spája analýzu na úrovni nehnuteľnosti s informáciami o miestnom trhu a pomáha maklérovi zasadiť nehnuteľnosť do jej skutočného konkurenčného prostredia."
        ]
      },
      {
        "type": "figure",
        "src": "/images/academy/mapa-cien.jpg",
        "alt": "Mapa cien Estima so slovenskými okresmi",
        "caption": "Mapa cien Estima — okresy zafarbené podľa mediánu €/m², ponuky, nedávnych zliav či nových inzerátov, s rebríčkom okresov vedľa mapy."
      }
    ],
    "cta": {
      "label": "Pridajte miestny kontext do svojho oceňovacieho reportu",
      "href": "/"
    }
  },
  {
    "slug": "ako-profesionalne-prezentovat-neistotu-ocenenia",
    "number": 13,
    "categorySlug": "komunikacia-s-klientom",
    "title": "Ako profesionálne prezentovať neistotu ocenenia",
    "description": "Profesionálne ocenenie by nemalo predstierať, že neistota neexistuje.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Profesionálne ocenenie by nemalo predstierať, že neistota neexistuje. Neistota môže byť vyššia, keď:"
      },
      {
        "type": "ul",
        "items": [
          "je k dispozícii veľmi málo porovnateľných nehnuteľností;",
          "je nehnuteľnosť neobvyklá;",
          "má miestny trh nízku aktivitu transakcií;",
          "chýbajú dôležité informácie o nehnuteľnosti;",
          "sa trhové podmienky rýchlo menia;",
          "stav nehnuteľnosti nemožno riadne posúdiť."
        ]
      },
      {
        "type": "p",
        "text": "Vysvetlenie neistoty neoslabuje dôveryhodnosť makléra. Ukazuje, že odporúčanie je úprimné a podložené dôkazmi. Maklér by mal vysvetliť, čo je známe, čo je odhadované a čo by mohlo očakávaný výsledok zmeniť."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima dokáže prezentovať cenové rozpätie spolu s kvalitou a počtom dostupných porovnateľných inzerátov.",
          "Ľahšie tak vysvetlíte, prečo majú niektoré ocenenia úzke rozpätie, zatiaľ čo iné vyžadujú väčšiu opatrnosť."
        ]
      }
    ],
    "cta": {
      "label": "Prezentujte dôkazy, nie falošnú presnosť",
      "href": "/"
    }
  },
  {
    "slug": "ako-upravit-ocenenie-ked-sa-trh-zmeni",
    "number": 14,
    "categorySlug": "signaly-nehnutelnosti-a-trhu",
    "title": "Ako upraviť ocenenie, keď sa trh zmení",
    "description": "Ocenenie platí ku konkrétnemu okamihu.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Ocenenie platí ku konkrétnemu okamihu. Prehodnotiť ho môže byť potrebné, keď:"
      },
      {
        "type": "ul",
        "items": [
          "sa zmenia úrokové sadzby;",
          "dopyt kupujúcich vzrastie alebo klesne;",
          "na trh vstúpi viacero konkurenčných nehnuteľností;",
          "porovnateľné inzeráty znížia ceny;",
          "nehnuteľnosť zostáva nepredaná;",
          "majiteľ nehnuteľnosť zrekonštruuje alebo zmení;",
          "lokalitu ovplyvní miestny development."
        ]
      },
      {
        "type": "p",
        "text": "Makléri by sa mali s predávajúcim vopred dohodnúť, kedy sa cenová stratégia prehodnotí. Napríklad:"
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima umožňuje maklérovi aktualizovať analýzu podľa aktuálnych inzerátov a trhových informácií namiesto spoliehania sa na pôvodné ocenenie počas celého predaja."
        ]
      },
      {
        "type": "figure",
        "src": "/images/academy/trh-vyvoj.jpg",
        "alt": "Trhový prehľad Estima s dlhodobým vývojom cien",
        "caption": "Trhový prehľad Estima sleduje vývoj €/m² z oficiálnych štatistík NBS — referenčný bod, keď ocenenie potrebuje revíziu pri zmene trhu."
      }
    ],
    "cta": {
      "label": "Udržte každé ocenenie v súlade s aktuálnym trhom",
      "href": "/"
    }
  },
  {
    "slug": "ako-nadviazat-kontakt-po-naborovej-prezentacii",
    "number": 15,
    "categorySlug": "naborove-prezentacie-a-proces-kancelarie",
    "title": "Ako nadviazať kontakt po náborovej prezentácii",
    "description": "Mnohé príležitosti na zákazku sa stratia, pretože follow-up je všeobecný alebo príde neskoro.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Mnohé príležitosti na zákazku sa stratia, pretože follow-up je všeobecný alebo príde neskoro. Po stretnutí pošlite majiteľovi:"
      },
      {
        "type": "ul",
        "items": [
          "oceňovací report;",
          "krátke zhrnutie odporúčanej cenovej stratégie;",
          "kľúčové dôvody odporúčania;",
          "navrhovaný marketingový plán;",
          "jasné ďalšie kroky;",
          "termín ďalšieho rozhovoru."
        ]
      },
      {
        "type": "p",
        "text": "Užitočná follow-up správa môže znieť:"
      },
      {
        "type": "p",
        "text": "Report udržiava odporúčanie makléra na očiach, kým majiteľ porovnáva rôzne kancelárie."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima dáva maklérovi profesionálny dokument, ktorý možno poslať hneď po stretnutí — posilní dojem z prezentácie a udrží kanceláriu v pamäti."
        ]
      }
    ],
    "cta": {
      "label": "Urobte svoj follow-up presvedčivejším",
      "href": "/"
    }
  },
  {
    "slug": "ako-klientom-vysvetlit-automatizovane-ocenenie",
    "number": 16,
    "categorySlug": "komunikacia-s-klientom",
    "title": "Ako klientom vysvetliť automatizované ocenenie",
    "description": "Niektorí majitelia sa môžu domnievať, že automatizované ocenenie znamená, že softvér nahradil expertízu makléra.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Niektorí majitelia sa môžu domnievať, že automatizované ocenenie znamená, že softvér nahradil expertízu makléra. Takto by zodpovedný proces oceňovania fungovať nemal."
      },
      {
        "type": "p",
        "text": "Technológia dokáže:"
      },
      {
        "type": "ul",
        "items": [
          "spracovať veľké množstvo dát z inzerátov;",
          "vypočítať trhové ukazovatele;",
          "identifikovať potenciálne relevantné porovnateľné inzeráty;",
          "sledovať zmeny cien;",
          "pripraviť konzistentné reporty."
        ]
      },
      {
        "type": "p",
        "text": "Maklér musí stále:"
      },
      {
        "type": "ul",
        "items": [
          "overiť informácie o nehnuteľnosti;",
          "posúdiť mikrolokalitu;",
          "pochopiť situáciu predávajúceho;",
          "vyhodnotiť neobvyklé vlastnosti;",
          "skontrolovať vybrané porovnateľné inzeráty;",
          "odporučiť finálnu cenovú stratégiu."
        ]
      },
      {
        "type": "p",
        "text": "Najsilnejší prístup kombinuje technológiu s miestnymi profesionálnymi znalosťami."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima je navrhnutá ako nástroj na podporu rozhodovania realitných maklérov, nie ako ich náhrada.",
          "Preberá opakujúcu sa prípravu dát, aby maklér mohol viac času venovať poradenstvu, získavaniu zákaziek a riadeniu transakcie."
        ]
      }
    ],
    "cta": {
      "label": "Spojte svoju expertízu s lepšími trhovými dátami",
      "href": "/"
    }
  },
  {
    "slug": "ako-budovat-doveru-bez-slubovania-najvyssej-ceny",
    "number": 17,
    "categorySlug": "komunikacia-s-klientom",
    "title": "Ako budovať dôveru bez sľubovania najvyššej ceny",
    "description": "Niektorí makléri sa snažia získať zákazku najvyšším ocenením.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Niektorí makléri sa snažia získať zákazku najvyšším ocenením. Na začiatku to môže fungovať, neskôr však prináša problémy:"
      },
      {
        "type": "ul",
        "items": [
          "obmedzený záujem kupujúcich;",
          "opakované zľavy z ceny;",
          "stratu dôvery majiteľa;",
          "dlhší čas predaja;",
          "nehnuteľnosť, ktorá na trhu „zostarne“."
        ]
      },
      {
        "type": "p",
        "text": "Silnejší obchodný prístup je vysvetliť stratégiu za odporúčaním. Majitelia by mali pochopiť, že najlepší maklér nie je nevyhnutne ten, kto navrhne najvyššiu cenu. Je to ten, kto poskytne najjasnejšie dôkazy, najsilnejší marketingový plán a najrealistickejšiu cestu k úspešnému predaju."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima dáva maklérom nezávisle pôsobiaci dôkazový základ, ktorý podporuje úprimné cenové odporúčanie.",
          "Maklér sa tak stavia do pozície dôveryhodného poradcu, nie niekoho, kto len hovorí to, čo chce majiteľ počuť."
        ]
      }
    ],
    "cta": {
      "label": "Získavajte zákazky dôveryhodnosťou, nie nafúknutými sľubmi",
      "href": "/"
    }
  },
  {
    "slug": "ako-moze-kancelaria-vytvorit-jednotny-standard-ocenovania",
    "number": 18,
    "categorySlug": "naborove-prezentacie-a-proces-kancelarie",
    "title": "Ako môže kancelária vytvoriť jednotný štandard oceňovania",
    "description": "Keď každý maklér pripravuje ocenenia inak, kvalita výstupov kancelárie sa ťažko kontroluje.",
    "readingMinutes": 2,
    "body": [
      {
        "type": "p",
        "text": "Keď každý maklér pripravuje ocenenia inak, kvalita výstupov kancelárie sa ťažko kontroluje. Jeden maklér môže používať detailnú analýzu porovnateľných inzerátov, iný sa spolieha najmä na intuíciu. Reporty môžu používať rôznu terminológiu, formáty a predpoklady."
      },
      {
        "type": "p",
        "text": "Konzistentný interný štandard oceňovania by mal definovať:"
      },
      {
        "type": "ul",
        "items": [
          "požadované informácie o nehnuteľnosti;",
          "ako sa vyberajú porovnateľné inzeráty;",
          "ako sa dokumentujú rozdiely;",
          "ako sa prezentujú cenové rozpätia;",
          "ako sa vysvetľuje neistota;",
          "ktoré upozornenia sa uvádzajú;",
          "kedy sa ocenenia aktualizujú."
        ]
      },
      {
        "type": "p",
        "text": "Konzistentnosť zvyšuje profesionalitu a uľahčuje zaškoľovanie nových maklérov."
      },
      {
        "type": "callout",
        "variant": "estima",
        "heading": "Ako pomáha Estima",
        "paragraphs": [
          "Estima dáva kanceláriám jeden opakovateľný rámec na prípravu a prezentáciu ocenení nehnuteľností.",
          "Reporty môžu niesť branding a metodiku kancelárie, pričom makléri si ponechávajú kontrolu nad finálnym odporúčaním."
        ]
      }
    ],
    "cta": {
      "label": "Vybudujte jednotný proces oceňovania naprieč tímom",
      "href": "/"
    }
  }
]

// ── Lookups & helpers ────────────────────────────────────────────────────────

export function getArticle(slug: string): AcademyArticle | undefined {
  return ACADEMY_ARTICLES.find((a) => a.slug === slug)
}

export function categoryTitle(slug: string): string {
  return ACADEMY_CATEGORIES.find((c) => c.slug === slug)?.title ?? slug
}

export function articlesByCategory(slug: string): AcademyArticle[] {
  return ACADEMY_ARTICLES.filter((a) => a.categorySlug === slug)
}

/** Previous / next by article number (reading order). */
export function articleNeighbours(slug: string): {
  prev: AcademyArticle | null
  next: AcademyArticle | null
} {
  const i = ACADEMY_ARTICLES.findIndex((a) => a.slug === slug)
  return {
    prev: i > 0 ? ACADEMY_ARTICLES[i - 1] : null,
    next: i >= 0 && i < ACADEMY_ARTICLES.length - 1 ? ACADEMY_ARTICLES[i + 1] : null,
  }
}

/** Up to `n` related articles: same category first, then reading-order fill. */
export function relatedArticles(slug: string, n = 3): AcademyArticle[] {
  const current = getArticle(slug)
  if (!current) return []
  const sameCat = ACADEMY_ARTICLES.filter(
    (a) => a.slug !== slug && a.categorySlug === current.categorySlug,
  )
  const rest = ACADEMY_ARTICLES.filter(
    (a) => a.slug !== slug && a.categorySlug !== current.categorySlug,
  )
  return [...sameCat, ...rest].slice(0, n)
}

export const ACADEMY_ARTICLE_COUNT = ACADEMY_ARTICLES.length
export const ACADEMY_CATEGORY_COUNT = ACADEMY_CATEGORIES.length

// The academy content was authored and reviewed as one set; a single "last
// reviewed" label is honest and avoids fabricating per-article dates the
// source never had.
export const ACADEMY_UPDATED = "júl 2026"

/** ASCII, diacritic-free slug used for in-article heading anchors. */
export function academySlug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

export interface TocItem {
  id: string
  label: string
}

// Table-of-contents entries for one article: an "Úvod" anchor at the top plus
// every in-body heading (h3) and callout heading, in document order. Ids are
// de-duplicated so repeated headings still scroll to distinct anchors.
export function articleToc(article: AcademyArticle): TocItem[] {
  const items: TocItem[] = [{ id: "uvod", label: "Úvod" }]
  const used = new Set<string>(["uvod"])
  const push = (label: string) => {
    let id = academySlug(label) || "sekcia"
    let n = 2
    while (used.has(id)) id = `${academySlug(label)}-${n++}`
    used.add(id)
    items.push({ id, label })
  }
  for (const block of article.body) {
    if (block.type === "h3") push(block.text)
    else if (block.type === "callout") push(block.heading)
  }
  return items
}
