// Legal identity + the long-form legal documents (Terms, Privacy), per language.
// Structured (sections carry paragraph and bullet arrays), so this lives here
// rather than as flat dot-keys in lib/i18n — same split as lib/pricing.ts.
//
// COMPANY is the single source of truth for the operator's registration data;
// the footer and both documents read from it so the identifiers can never
// drift apart. Values are the public register entry (FinStat / ORSR).
//
// The document text is a working draft written for this service — it has not
// been reviewed by counsel. Treat wording changes as a legal matter, not a
// copy edit.

import type { Lang } from "@/lib/i18n"

export interface Company {
  name: string
  street: string
  city: string
  country: Record<Lang, string>
  ico: string
  dic: string
  /** Commercial-register entry, per language (court name is translated). */
  register: Record<Lang, string>
  email: string
  phoneDisplay: string
  phoneTel: string
}

export const COMPANY: Company = {
  name: "Gemini Technology s. r. o.",
  street: "Ulica Jozefa Adamca 9983/24",
  city: "917 01 Trnava",
  country: { sk: "Slovenská republika", en: "Slovak Republic" },
  ico: "57 303 568",
  dic: "2122653016",
  register: {
    sk: "Obchodný register Okresného súdu Trnava, oddiel Sro, vložka č. 61124/T",
    en: "Commercial Register of the District Court Trnava, Section Sro, Insert No. 61124/T",
  },
  email: "hello@estima.sk",
  phoneDisplay: "+420 727 906 474",
  phoneTel: "+420727906474",
}

/** Single-line address used in the footer's legal bar. */
export function companyAddress(): string {
  return `${COMPANY.street}, ${COMPANY.city}`
}

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface LegalDocument {
  title: string
  intro: string
  version: string
  effective: string
  sections: LegalSection[]
}

export interface LegalContent {
  /** Shared chrome for both documents. */
  versionLabel: string
  effectiveLabel: string
  operatorLabel: string
  backToTop: string
  otherDocLabel: string
  terms: LegalDocument
  privacy: LegalDocument
}

const VERSION = "1.0"
const EFFECTIVE_SK = "22. júla 2026"
const EFFECTIVE_EN = "22 July 2026"

export const legalContent: Record<Lang, LegalContent> = {
  // ─── Slovak (source of truth for this market) ─────────────────────────────
  sk: {
    versionLabel: "Verzia",
    effectiveLabel: "Účinné od",
    operatorLabel: "Prevádzkovateľ",
    backToTop: "Späť nahor",
    otherDocLabel: "Súvisiaci dokument",

    terms: {
      title: "Obchodné podmienky",
      intro:
        "Tieto obchodné podmienky upravujú práva a povinnosti pri používaní služby Estima. Používaním služby s nimi vyjadrujete súhlas.",
      version: VERSION,
      effective: EFFECTIVE_SK,
      sections: [
        {
          heading: "1. Úvodné ustanovenia a prevádzkovateľ",
          paragraphs: [
            `Tieto obchodné podmienky (ďalej len „Podmienky“) upravujú práva a povinnosti zmluvných strán pri používaní služby Estima dostupnej na estima.sk (ďalej len „Služba“).`,
            `Prevádzkovateľom Služby je ${COMPANY.name}, so sídlom ${COMPANY.street}, ${COMPANY.city}, ${COMPANY.country.sk}, IČO: ${COMPANY.ico}, DIČ: ${COMPANY.dic}, zapísaná v registri: ${COMPANY.register.sk} (ďalej len „Poskytovateľ“).`,
            `Vytvorením účtu alebo používaním Služby potvrdzujete, že ste sa s Podmienkami oboznámili a súhlasíte s nimi. Ak s nimi nesúhlasíte, Službu nepoužívajte.`,
          ],
        },
        {
          heading: "2. Definície",
          bullets: [
            "„Užívateľ“ je fyzická alebo právnická osoba, ktorá si zriadila účet alebo inak používa Službu.",
            "„Spotrebiteľ“ je fyzická osoba, ktorá pri uzatváraní zmluvy nekoná v rámci svojej podnikateľskej činnosti.",
            "„Obsah“ sú dáta, texty, mapy, grafy, odhady cien a ďalšie analytické výstupy sprístupnené v rámci Služby.",
          ],
        },
        {
          heading: "3. Popis Služby",
          paragraphs: [
            "Estima je online platforma, ktorá poskytuje informácie a analytické nástroje týkajúce sa trhu s nehnuteľnosťami na Slovensku — najmä orientačné odhady cien, porovnanie kúpy a nájmu, trhové prehľady a reporty.",
            "Poskytovateľ neposkytuje investičné, finančné, daňové ani právne poradenstvo. Výstupy Služby majú výlučne informatívny charakter a nenahrádzajú znalecký posudok ani ocenenie vypracované oprávnenou osobou.",
          ],
        },
        {
          heading: "4. Registrácia a užívateľský účet",
          paragraphs: [
            "Časti Služby vyžadujú registráciu. Užívateľ je povinný uviesť pravdivé a aktuálne údaje a udržiavať ich v aktuálnom stave.",
            "Užívateľ zodpovedá za dôvernosť svojich prihlasovacích údajov a za všetky aktivity vykonané pod jeho účtom. Podozrenie na zneužitie účtu je povinný bezodkladne oznámiť Poskytovateľovi.",
            "Účet si môže zriadiť osoba staršia ako 16 rokov s potrebnou spôsobilosťou na právne úkony.",
          ],
        },
        {
          heading: "5. Tarify a ceny",
          paragraphs: [
            "Služba je dostupná v bezplatnej tarife a v platených tarifách. Rozsah funkcií jednotlivých taríf a ceny sú uvedené na stránke Cenník.",
            "Predplatné sa účtuje vopred na zvolené obdobie a obnovuje sa automaticky, kým ho Užívateľ nezruší. Zrušenie je účinné ku koncu už zaplateného obdobia.",
            "Poskytovateľ môže ceny meniť; zmena sa uplatní až na nasledujúce zúčtovacie obdobie a Užívateľ o nej bude informovaný v primeranom predstihu.",
          ],
        },
        {
          heading: "6. Odstúpenie od zmluvy (Spotrebitelia)",
          paragraphs: [
            "Spotrebiteľ má právo odstúpiť od zmluvy uzavretej na diaľku do 14 dní bez uvedenia dôvodu.",
            "Aktiváciou platenej tarify Spotrebiteľ žiada o začatie poskytovania Služby pred uplynutím tejto lehoty a berie na vedomie, že v rozsahu už poskytnutého plnenia mu právo na odstúpenie zaniká.",
            "Odstúpenie je možné zaslať na " + COMPANY.email + ".",
          ],
        },
        {
          heading: "7. Povinnosti a zakázané konanie Užívateľa",
          bullets: [
            "obchádzať technické obmedzenia Služby alebo získavať prístup k častiam, ktoré mu neprináležia,",
            "hromadne sťahovať alebo automatizovane vyťažovať Obsah nad rámec dohodnutých API limitov,",
            "ďalej šíriť alebo komerčne využívať Obsah bez predchádzajúceho písomného súhlasu Poskytovateľa,",
            "zasahovať do prevádzky Služby, preťažovať infraštruktúru alebo šíriť škodlivý kód,",
            "porušovať práva duševného vlastníctva, práva na ochranu osobnosti alebo osobných údajov tretích osôb.",
          ],
        },
        {
          heading: "8. Presnosť a obmedzenia Obsahu",
          paragraphs: [
            "Obsah dostupný prostredníctvom Služby vrátane odhadov cien, výnosových predikcií a podobných analytických výstupov má výlučne informatívny charakter a je založený na štatistických modeloch a verejne dostupných či inzertných dátach.",
            "Poskytovateľ nezaručuje správnosť, úplnosť ani aktuálnosť Obsahu a nezodpovedá za rozhodnutia, ktoré Užívateľ na jeho základe prijme. Pred akýmkoľvek majetkovým rozhodnutím odporúčame overiť údaje u oprávnenej osoby.",
          ],
        },
        {
          heading: "9. Duševné vlastníctvo",
          paragraphs: [
            "Služba, jej softvér, dizajn, databázy, značka a analytické výstupy sú chránené právom duševného vlastníctva a patria Poskytovateľovi alebo jeho licenčným partnerom.",
            "Užívateľ získava obmedzenú, nevýhradnú, odvolateľnú a neprenosnú licenciu na používanie Služby v rozsahu zvolenej tarify a na účel, na ktorý je Služba určená.",
          ],
        },
        {
          heading: "10. Obmedzenie zodpovednosti",
          paragraphs: [
            "Poskytovateľ zodpovedá za škodu spôsobenú úmyselne alebo z hrubej nedbanlivosti. V rozsahu povolenom právnym poriadkom je vylúčená zodpovednosť za ušlý zisk, nepriame a následné škody, stratu dát a za nedostupnosť Služby spôsobenú okolnosťami vylučujúcimi zodpovednosť.",
            "Celková zodpovednosť Poskytovateľa je obmedzená sumou, ktorú Užívateľ za Službu uhradil za posledných 12 mesiacov. Zodpovednosť voči Spotrebiteľom podľa kogentných ustanovení zákona tým nie je dotknutá.",
          ],
        },
        {
          heading: "11. Ochrana osobných údajov",
          paragraphs: [
            "Spracúvanie osobných údajov sa riadi samostatným dokumentom Ochrana osobných údajov, ktorý popisuje účely, právne základy, doby uchovávania a práva dotknutých osôb.",
          ],
        },
        {
          heading: "12. Trvanie a ukončenie",
          paragraphs: [
            "Zmluva sa uzatvára na dobu neurčitú. Bezplatný účet možno kedykoľvek zrušiť odstránením účtu; platená tarifa končí uplynutím zaplateného obdobia.",
            "Poskytovateľ môže účet obmedziť alebo zrušiť pri podstatnom porušení Podmienok, pri podozrení na zneužitie alebo z bezpečnostných dôvodov; ak to okolnosti umožňujú, vopred na to Užívateľa upozorní.",
          ],
        },
        {
          heading: "13. Zmeny Podmienok",
          paragraphs: [
            "Poskytovateľ môže Podmienky jednostranne meniť, najmä pri zmene funkčnosti Služby alebo právnej úpravy. O podstatných zmenách bude Užívateľ informovaný v primeranom predstihu.",
            "Pokračovaním v používaní Služby po nadobudnutí účinnosti zmien Užívateľ zmeny akceptuje; ak s nimi nesúhlasí, môže zmluvu ukončiť bez sankcie.",
          ],
        },
        {
          heading: "14. Rozhodné právo a riešenie sporov",
          paragraphs: [
            "Zmluvný vzťah sa riadi právnym poriadkom Slovenskej republiky. Ak je Užívateľ Spotrebiteľom, zostávajú mu zachované ochranné ustanovenia práva štátu jeho obvyklého pobytu, ak sú preňho priaznivejšie.",
            "Reklamácie a podnety je možné uplatniť na " +
              COMPANY.email +
              ". Spotrebiteľ má právo obrátiť sa na Slovenskú obchodnú inšpekciu alebo využiť platformu na alternatívne riešenie sporov na adrese ec.europa.eu/consumers/odr.",
          ],
        },
        {
          heading: "15. Záverečné ustanovenia",
          paragraphs: [
            "Ak sa niektoré ustanovenie Podmienok stane neplatným alebo nevykonateľným, ostatné ustanovenia zostávajú v platnosti a neplatné ustanovenie sa nahradí ustanovením, ktoré najlepšie zodpovedá jeho pôvodnému účelu.",
          ],
        },
      ],
    },

    privacy: {
      title: "Ochrana osobných údajov",
      intro:
        "Tento dokument vysvetľuje, aké osobné údaje pri prevádzke služby Estima spracúvame, na aký účel, ako dlho ich uchovávame a aké práva máte.",
      version: VERSION,
      effective: EFFECTIVE_SK,
      sections: [
        {
          heading: "1. Prevádzkovateľ",
          paragraphs: [
            `Prevádzkovateľom v zmysle nariadenia GDPR je ${COMPANY.name}, so sídlom ${COMPANY.street}, ${COMPANY.city}, ${COMPANY.country.sk}, IČO: ${COMPANY.ico}, DIČ: ${COMPANY.dic}, zapísaná v registri: ${COMPANY.register.sk}.`,
            `Kontakt vo veciach ochrany osobných údajov: ${COMPANY.email}. Prevádzkovateľovi nevzniká povinnosť určiť zodpovednú osobu podľa čl. 37 GDPR.`,
          ],
        },
        {
          heading: "2. Aké údaje spracúvame",
          bullets: [
            "Registračné údaje — e-mailová adresa, meno, voliteľne profilová fotografia z prihlásenia cez Google. Heslá uchovávame výlučne vo forme jednosmerného hashu, nikdy v čitateľnej podobe.",
            "Údaje o používaní — uložené nehnuteľnosti, filtre, sledovania, nastavenia účtu a údaje, ktoré sami zadáte do formulárov (napr. parametre nehnuteľnosti pri odhade).",
            "Technické záznamy — IP adresa, user-agent, časová pečiatka, volaný endpoint a odpoveď servera; slúžia na prevádzku a bezpečnosť.",
            "Platobné údaje — fakturačné údaje a informácie o transakciách. Číslo platobnej karty ani CVV neuchovávame; platby spracúva poskytovateľ platobnej brány.",
            "Cookies a podobné technológie — funkčné, analytické a prípadne marketingové, podľa vášho nastavenia.",
          ],
        },
        {
          heading: "3. Účely a právne základy spracúvania",
          bullets: [
            "Poskytovanie Služby a správa účtu — plnenie zmluvy (čl. 6 ods. 1 písm. b GDPR).",
            "Fakturácia a plnenie účtovných a daňových povinností — zákonná povinnosť (písm. c).",
            "Bezpečnosť, prevencia zneužitia a zlepšovanie Služby — oprávnený záujem (písm. f).",
            "Marketingová komunikácia a nepovinné cookies — súhlas (písm. a), ktorý môžete kedykoľvek odvolať.",
          ],
        },
        {
          heading: "4. Doba uchovávania",
          bullets: [
            "Registračné údaje — po dobu existencie účtu a primeranú dobu po jeho zrušení.",
            "Účtovné a daňové doklady — po dobu stanovenú príslušnými právnymi predpismi.",
            "Technické záznamy — po dobu nevyhnutnú na prevádzku a bezpečnosť Služby.",
            "Údaje spracúvané na základe súhlasu — do odvolania súhlasu.",
          ],
        },
        {
          heading: "5. Príjemcovia a sprostredkovatelia",
          paragraphs: [
            "K údajom majú prístup poverení zamestnanci a zmluvní sprostredkovatelia, ktorí pre nás zabezpečujú prevádzku — najmä poskytovatelia cloudového hostingu a infraštruktúry, e-mailových služieb, analytiky a spracovania platieb.",
            "Osobné údaje neposkytujeme tretím osobám na ich vlastné marketingové účely a nepredávame ich.",
          ],
        },
        {
          heading: "6. Prenos mimo EÚ",
          paragraphs: [
            "Ak pri využívaní niektorých nástrojov dochádza k prenosu údajov mimo Európskeho hospodárskeho priestoru, realizuje sa v súlade s čl. 44 až 46 GDPR — na základe rozhodnutia o primeranosti alebo štandardných zmluvných doložiek.",
          ],
        },
        {
          heading: "7. Vaše práva",
          bullets: [
            "právo na prístup k údajom a na ich kópiu,",
            "právo na opravu nesprávnych a doplnenie neúplných údajov,",
            "právo na vymazanie („právo byť zabudnutý“),",
            "právo na obmedzenie spracúvania a právo namietať,",
            "právo na prenosnosť údajov,",
            "právo kedykoľvek odvolať súhlas bez vplyvu na predchádzajúce spracúvanie,",
            "právo podať sťažnosť Úradu na ochranu osobných údajov SR, Hraničná 12, 820 07 Bratislava 27.",
          ],
          paragraphs: [
            `Svoje práva si môžete uplatniť na ${COMPANY.email}. Žiadosť vybavíme najneskôr do jedného mesiaca od doručenia.`,
          ],
        },
        {
          heading: "8. Cookies a podobné technológie",
          paragraphs: [
            "Nevyhnutné cookies zabezpečujú základnú funkčnosť Služby (prihlásenie, jazyk, motív) a nemožno ich vypnúť. Analytické a marketingové cookies používame len s vaším súhlasom.",
            "Nastavenie cookies môžete kedykoľvek zmeniť vo svojom prehliadači alebo odvolaním súhlasu.",
          ],
        },
        {
          heading: "9. Bezpečnosť",
          paragraphs: [
            "Uplatňujeme primerané technické a organizačné opatrenia — šifrovaný prenos (HTTPS/TLS), jednosmerné hashovanie hesiel, riadenie prístupov, minimalizáciu údajov, zálohovanie a monitorovanie zraniteľností.",
          ],
        },
        {
          heading: "10. Deti",
          paragraphs: [
            "Služba nie je určená osobám mladším ako 16 rokov a vedome nespracúvame ich osobné údaje. Ak zistíme opak, údaje bez zbytočného odkladu vymažeme.",
          ],
        },
        {
          heading: "11. Automatizované rozhodovanie",
          paragraphs: [
            "Odhady cien vytvárame štatistickými modelmi z parametrov nehnuteľnosti a trhových dát. Nejde o automatizované rozhodovanie s právnym účinkom voči vašej osobe v zmysle čl. 22 GDPR — výsledok je informatívny a nemá pre vás právne dôsledky.",
          ],
        },
        {
          heading: "12. Zmeny tohto dokumentu",
          paragraphs: [
            "Dokument môžeme aktualizovať pri zmene Služby alebo právnej úpravy. Aktuálna verzia je vždy dostupná na tejto stránke a jej účinnosť je uvedená v hlavičke.",
          ],
        },
      ],
    },
  },

  // ─── English (mirrors the Slovak source) ──────────────────────────────────
  en: {
    versionLabel: "Version",
    effectiveLabel: "Effective from",
    operatorLabel: "Operator",
    backToTop: "Back to top",
    otherDocLabel: "Related document",

    terms: {
      title: "Terms of Service",
      intro:
        "These terms govern the rights and obligations that apply when you use Estima. By using the service you agree to them.",
      version: VERSION,
      effective: EFFECTIVE_EN,
      sections: [
        {
          heading: "1. Introduction and operator",
          paragraphs: [
            `These terms of service (the “Terms”) govern the rights and obligations of the parties in relation to the Estima service available at estima.sk (the “Service”).`,
            `The Service is operated by ${COMPANY.name}, with its registered seat at ${COMPANY.street}, ${COMPANY.city}, ${COMPANY.country.en}, Company ID (IČO): ${COMPANY.ico}, Tax ID (DIČ): ${COMPANY.dic}, registered in the ${COMPANY.register.en} (the “Provider”).`,
            `By creating an account or using the Service you confirm that you have read and accept these Terms. If you do not accept them, please do not use the Service.`,
          ],
        },
        {
          heading: "2. Definitions",
          bullets: [
            "“User” means any natural or legal person who has created an account or otherwise uses the Service.",
            "“Consumer” means a natural person who does not act within the scope of their business activity when entering into the contract.",
            "“Content” means the data, texts, maps, charts, price estimates and other analytical outputs made available through the Service.",
          ],
        },
        {
          heading: "3. Description of the Service",
          paragraphs: [
            "Estima is an online platform providing information and analytical tools relating to the Slovak property market — in particular indicative price estimates, buy-versus-rent comparisons, market overviews and reports.",
            "The Provider does not offer investment, financial, tax or legal advice. Outputs of the Service are informational only and do not replace an expert appraisal or a valuation issued by an authorised professional.",
          ],
        },
        {
          heading: "4. Registration and user account",
          paragraphs: [
            "Parts of the Service require registration. The User must provide truthful, current information and keep it up to date.",
            "The User is responsible for keeping their credentials confidential and for all activity carried out under their account, and must report any suspected misuse to the Provider without delay.",
            "Accounts may be created by persons over 16 years of age with the required legal capacity.",
          ],
        },
        {
          heading: "5. Plans and pricing",
          paragraphs: [
            "The Service is available in a free plan and in paid plans. The features of each plan and the applicable prices are listed on the Pricing page.",
            "Subscriptions are billed in advance for the selected period and renew automatically until cancelled. Cancellation takes effect at the end of the period already paid for.",
            "The Provider may change prices; a change applies only to subsequent billing periods and the User will be notified reasonably in advance.",
          ],
        },
        {
          heading: "6. Withdrawal from the contract (Consumers)",
          paragraphs: [
            "A Consumer may withdraw from a distance contract within 14 days without giving a reason.",
            "By activating a paid plan the Consumer requests that provision of the Service begin before that period expires and acknowledges that the right of withdrawal ceases to apply to the part of the Service already provided.",
            "Notice of withdrawal may be sent to " + COMPANY.email + ".",
          ],
        },
        {
          heading: "7. User obligations and prohibited conduct",
          bullets: [
            "circumventing technical restrictions or accessing parts of the Service not intended for the User,",
            "bulk downloading or automated extraction of Content beyond the agreed API limits,",
            "redistributing or commercially exploiting Content without the Provider's prior written consent,",
            "interfering with the operation of the Service, overloading the infrastructure or distributing malicious code,",
            "infringing intellectual property rights or the personality or data protection rights of third parties.",
          ],
        },
        {
          heading: "8. Accuracy and limitations of Content",
          paragraphs: [
            "Content available through the Service, including price estimates, yield predictions and similar analytical outputs, is informational only and is derived from statistical models applied to publicly available and listing data.",
            "The Provider does not warrant the accuracy, completeness or timeliness of the Content and is not liable for decisions the User makes on its basis. Before any property or financial decision we recommend verifying the figures with an authorised professional.",
          ],
        },
        {
          heading: "9. Intellectual property",
          paragraphs: [
            "The Service, its software, design, databases, brand and analytical outputs are protected by intellectual property law and belong to the Provider or its licensors.",
            "The User is granted a limited, non-exclusive, revocable and non-transferable licence to use the Service within the scope of the selected plan and for its intended purpose.",
          ],
        },
        {
          heading: "10. Limitation of liability",
          paragraphs: [
            "The Provider is liable for damage caused intentionally or by gross negligence. To the extent permitted by law, liability is excluded for lost profit, indirect and consequential damage, loss of data, and unavailability of the Service caused by circumstances excluding liability.",
            "The Provider's aggregate liability is limited to the amount the User paid for the Service over the preceding 12 months. Mandatory statutory consumer protections remain unaffected.",
          ],
        },
        {
          heading: "11. Personal data protection",
          paragraphs: [
            "The processing of personal data is governed by a separate Privacy Policy, which describes the purposes, legal bases, retention periods and the rights of data subjects.",
          ],
        },
        {
          heading: "12. Term and termination",
          paragraphs: [
            "The contract is concluded for an indefinite period. A free account may be closed at any time by deleting the account; a paid plan ends when the paid period expires.",
            "The Provider may restrict or close an account in the event of a material breach of the Terms, suspected misuse, or for security reasons, giving prior notice where circumstances permit.",
          ],
        },
        {
          heading: "13. Changes to the Terms",
          paragraphs: [
            "The Provider may amend these Terms unilaterally, in particular when the functionality of the Service or the applicable law changes. Users will be notified of material changes reasonably in advance.",
            "Continued use of the Service after the changes take effect constitutes acceptance; a User who does not accept them may terminate the contract without penalty.",
          ],
        },
        {
          heading: "14. Governing law and dispute resolution",
          paragraphs: [
            "The contractual relationship is governed by the law of the Slovak Republic. If the User is a Consumer, the protective provisions of the law of their country of habitual residence continue to apply where more favourable.",
            "Complaints may be submitted to " +
              COMPANY.email +
              ". Consumers may also contact the Slovak Trade Inspection Authority or use the online dispute resolution platform at ec.europa.eu/consumers/odr.",
          ],
        },
        {
          heading: "15. Final provisions",
          paragraphs: [
            "If any provision of these Terms becomes invalid or unenforceable, the remaining provisions stay in force and the invalid provision is replaced by one that best reflects its original purpose.",
          ],
        },
      ],
    },

    privacy: {
      title: "Privacy Policy",
      intro:
        "This document explains what personal data we process when operating Estima, for what purpose, how long we keep it and what rights you have.",
      version: VERSION,
      effective: EFFECTIVE_EN,
      sections: [
        {
          heading: "1. Data controller",
          paragraphs: [
            `The controller within the meaning of the GDPR is ${COMPANY.name}, with its registered seat at ${COMPANY.street}, ${COMPANY.city}, ${COMPANY.country.en}, Company ID (IČO): ${COMPANY.ico}, Tax ID (DIČ): ${COMPANY.dic}, registered in the ${COMPANY.register.en}.`,
            `Contact for data protection matters: ${COMPANY.email}. The controller is not required to designate a data protection officer under Article 37 GDPR.`,
          ],
        },
        {
          heading: "2. What data we process",
          bullets: [
            "Registration data — e-mail address, name, and optionally a profile picture when signing in with Google. Passwords are stored only as one-way hashes, never in readable form.",
            "Usage data — saved properties, filters, alerts, account settings and information you enter into forms (for example property parameters submitted for a valuation).",
            "Technical logs — IP address, user agent, timestamp, requested endpoint and server response; used for operating and securing the Service.",
            "Payment data — billing details and transaction records. We do not store card numbers or CVV codes; payments are handled by our payment provider.",
            "Cookies and similar technologies — functional, analytical and, where applicable, marketing, subject to your preferences.",
          ],
        },
        {
          heading: "3. Purposes and legal bases",
          bullets: [
            "Providing the Service and managing accounts — performance of a contract (Art. 6(1)(b) GDPR).",
            "Invoicing and compliance with accounting and tax obligations — legal obligation (point (c)).",
            "Security, abuse prevention and improvement of the Service — legitimate interest (point (f)).",
            "Marketing communication and optional cookies — consent (point (a)), which you may withdraw at any time.",
          ],
        },
        {
          heading: "4. Retention periods",
          bullets: [
            "Registration data — for as long as the account exists and for a reasonable period afterwards.",
            "Accounting and tax documents — for the period required by the applicable legislation.",
            "Technical logs — for the period necessary to operate and secure the Service.",
            "Data processed on the basis of consent — until consent is withdrawn.",
          ],
        },
        {
          heading: "5. Recipients and processors",
          paragraphs: [
            "Data is accessible to authorised staff and to contracted processors who support our operations — in particular providers of cloud hosting and infrastructure, e-mail services, analytics and payment processing.",
            "We do not share personal data with third parties for their own marketing purposes and we do not sell it.",
          ],
        },
        {
          heading: "6. Transfers outside the EU",
          paragraphs: [
            "Where the use of certain tools involves transferring data outside the European Economic Area, such transfers are carried out in accordance with Articles 44 to 46 GDPR — on the basis of an adequacy decision or standard contractual clauses.",
          ],
        },
        {
          heading: "7. Your rights",
          bullets: [
            "the right of access to your data and to obtain a copy,",
            "the right to rectification of inaccurate and completion of incomplete data,",
            "the right to erasure (the “right to be forgotten”),",
            "the right to restriction of processing and the right to object,",
            "the right to data portability,",
            "the right to withdraw consent at any time, without affecting prior processing,",
            "the right to lodge a complaint with the Office for Personal Data Protection of the Slovak Republic, Hraničná 12, 820 07 Bratislava 27.",
          ],
          paragraphs: [
            `You can exercise your rights at ${COMPANY.email}. We will respond within one month of receiving your request at the latest.`,
          ],
        },
        {
          heading: "8. Cookies and similar technologies",
          paragraphs: [
            "Essential cookies provide the basic functionality of the Service (sign-in, language, theme) and cannot be switched off. Analytical and marketing cookies are used only with your consent.",
            "You can change your cookie preferences at any time in your browser or by withdrawing consent.",
          ],
        },
        {
          heading: "9. Security",
          paragraphs: [
            "We apply appropriate technical and organisational measures — encrypted transport (HTTPS/TLS), one-way password hashing, access control, data minimisation, backups and vulnerability monitoring.",
          ],
        },
        {
          heading: "10. Children",
          paragraphs: [
            "The Service is not intended for persons under 16 and we do not knowingly process their personal data. If we discover otherwise, we delete the data without undue delay.",
          ],
        },
        {
          heading: "11. Automated decision-making",
          paragraphs: [
            "Price estimates are produced by statistical models from property parameters and market data. This does not constitute automated decision-making producing legal effects concerning you within the meaning of Article 22 GDPR — the result is indicative and has no legal consequences for you.",
          ],
        },
        {
          heading: "12. Changes to this document",
          paragraphs: [
            "We may update this document when the Service or the applicable law changes. The current version is always available on this page and its effective date is shown in the header.",
          ],
        },
      ],
    },
  },
}

/** Route slugs — Slovak, matching the rest of the app's URL convention. */
export const LEGAL_ROUTES = {
  terms: "/obchodne-podmienky",
  privacy: "/ochrana-osobnych-udajov",
} as const
