export type InvoiceTypeCode =
  | "01" // Invoice
  | "02" // Credit Note
  | "03" // Debit Note
  | "04" // Refund Note
  | "11" // Self-billed Invoice
  | "12" // Self-billed Credit Note
  | "13" // Self-billed Debit Note
  | "14"; // Self-billed Refund Note

export type ClassificationCode =
  | "001" // Breastfeeding equipment
  | "002" // Child care centres and kindergartens fees
  | "003" // Computer, smartphone or tablet
  | "004" // Consolidated e-Invoice
  | "005" // Construction materials (as specified under Fourth Schedule of the Lembaga Pembangunan Industri Pembinaan Malaysia Act 1994)
  | "006" // Disbursement
  | "007" // Donation
  | "008" // e-Commerce - e-Invoice to buyer / purchaser
  | "009" // e-Commerce - Self-billed e-Invoice to seller, logistics, etc.
  | "010" // Education fees
  | "011" // Goods on consignment (Consignor)
  | "012" // Goods on consignment (Consignee)
  | "013" // Gym membership
  | "014" // Insurance - Education and medical benefits
  | "015" // Insurance - Takaful or life insurance
  | "016" // Interest and financing expenses
  | "017" // Internet subscription
  | "018" // Land and building
  | "019" // Medical examination for learning disabilities and early intervention or rehabilitation treatments of learning disabilities
  | "020" // Medical examination or vaccination expenses
  | "021" // Medical expenses for serious diseases
  | "022" // Others
  | "023" // Petroleum operations (as defined in Petroleum (Income Tax) Act 1967)
  | "024" // Private retirement scheme or deferred annuity scheme
  | "025" // Motor vehicle
  | "026" // Subscription of books / journals / magazines / newspapers / other similar publications
  | "027" // Reimbursement
  | "028" // Rental of motor vehicle
  | "029" // EV charging facilities (Installation, rental, sale / purchase or subscription fees)
  | "030" // Repair and maintenance
  | "031" // Research and development
  | "032" // Foreign income
  | "033" // Self-billed - Betting and gaming
  | "034" // Self-billed - Importation of goods
  | "035" // Self-billed - Importation of services
  | "036" // Self-billed - Others
  | "037" // Self-billed - Monetary payment to agents, dealers or distributors
  | "038" // Sports equipment, rental / entry fees for sports facilities, registration in sports competition or sports training fees imposed by associations / sports clubs / companies registered with the Sports Commissioner or Companies Commission of Malaysia and carrying out sports activities as listed under the Sports Development Act 1997
  | "039" // Supporting equipment for disabled person
  | "040" // Voluntary contribution to approved provident fund
  | "041" // Dental examination or treatment
  | "042" // Fertility treatment
  | "043" // Treatment and home care nursing, daycare centres and residential care centers
  | "044" // Vouchers, gift cards, loyalty points, etc
  | "045"; // Self-billed - Non-monetary payment to agents, dealers or distributors

export type CountryCodeISO3166Alpha3 =
  | "ABW" // ARUBA
  | "AFG" // AFGHANISTAN
  | "AGO" // ANGOLA
  | "AIA" // ANGUILLA
  | "ALA" // ALAND ISLANDS
  | "ALB" // ALBANIA
  | "AND" // ANDORA
  | "ANT" // NETHERLANDS ANTILLES
  | "ARE" // UNITED ARAB EMIRATES
  | "ARG" // ARGENTINA
  | "ARM" // ARMENIA
  | "ASM" // AMERICAN SAMOA
  | "ATA" // ANTARCTICA
  | "ATF" // FRENCH SOUTHERN TERRITORIES
  | "ATG" // ANTIGUA AND BARBUDA
  | "AUS" // AUSTRALIA
  | "AUT" // AUSTRIA
  | "AZE" // AZERBAIDJAN
  | "BDI" // BURUNDI
  | "BEL" // BELGIUM
  | "BEN" // BENIN
  | "BES" // BONAIRE, SINT EUSTATIUS AND SABA
  | "BFA" // BURKINA FASO
  | "BGD" // BANGLADESH
  | "BGR" // BULGARIA
  | "BHR" // BAHRAIN
  | "BHS" // BAHAMAS
  | "BIH" // BOSNIA AND HERZEGOVINA
  | "BLM" // SAINT BARTHELEMY
  | "BLR" // BELARUS
  | "BLZ" // BELIZE
  | "BMU" // BERMUDA
  | "BOL" // BOLIVIA
  | "BRA" // BRAZIL
  | "BRB" // BARBADOS
  | "BRN" // BRUNEI DARUSSALAM
  | "BTN" // BHUTAN
  | "BVT" // BOUVET ISLAND
  | "BWA" // BOTSWANA
  | "CAF" // CENTRAL AFRICAN REPUBLIC
  | "CAN" // CANADA
  | "CCK" // COCOS ISLAND
  | "CHE" // SWITZERLAND
  | "CHL" // CHILE
  | "CHN" // CHINA
  | "CIV" // COTE D’IVOIRE
  | "CMR" // CAMEROON
  | "COD" // CONGO, THE DEMOCRATIC REPUBLIC
  | "COG" // CONGO
  | "COK" // COOK ISLANDS
  | "COL" // COLOMBIA
  | "COM" // COMOROS
  | "CPV" // CAPE VERDE
  | "CRI" // COSTA RICA
  | "CUB" // CUBA
  | "CUW" // CURACAO
  | "CXR" // CHRISTMAS ISLANDS
  | "CYM" // CAYMAN ISLANDS
  | "CYP" // CYPRUS
  | "CZE" // CZECH REPUBLIC
  | "DEU" // GERMANY
  | "DJI" // DJIBOUTI
  | "DMA" // DOMINICA
  | "DNK" // DENMARK
  | "DOM" // DOMINICAN REPUBLIC
  | "DZA" // ALGERIA
  | "ECU" // ECUADOR
  | "EGY" // EGYPT
  | "ERI" // ERITREA
  | "ESH" // WESTERN SAHARA
  | "ESP" // SPAIN
  | "EST" // ESTONIA
  | "ETH" // ETHIOPIA
  | "FIN" // FINLAND
  | "FJI" // FIJI
  | "FLK" // FALKLAND ISLANDS (MALVINAS)
  | "FRA" // FRANCE
  | "FRO" // FAEROE ISLANDS
  | "FSM" // MICRONESIA, FEDERATED STATES OF
  | "GAB" // GABON
  | "GBR" // UNITED KINGDOM
  | "GEO" // GEORGIA
  | "GGY" // GUERNSEY
  | "GHA" // GHANA
  | "GIB" // GIBRALTAR
  | "GIN" // GUINEA
  | "GLP" // GUADELOUPE
  | "GMB" // GAMBIA
  | "GNB" // GUINEA-BISSAU
  | "GNQ" // EQUATORIAL GUINEA
  | "GRC" // GREECE
  | "GRD" // GRENADA
  | "GRL" // GREENLAND
  | "GTM" // GUATEMALA
  | "GUF" // FRENCH GUIANA
  | "GUM" // GUAM
  | "GUY" // GUYANA
  | "HKG" // HONG KONG
  | "HMD" // HEARD AND MCDONALD ISLANDS
  | "HND" // HONDURAS
  | "HRV" // CROATIA
  | "HTI" // HAITI
  | "HUN" // HUNGARY
  | "IDN" // INDONESIA
  | "IMN" // ISLE OF MAN
  | "IND" // INDIA
  | "IOT" // BRITISH INDIAN OCEAN TERRITORY
  | "IRL" // IRELAND
  | "IRN" // IRAN
  | "IRQ" // IRAQ
  | "ISL" // ICELAND
  | "ISR" // ISRAEL
  | "ITA" // ITALY
  | "JAM" // JAMAICA
  | "JEY" // JERSEY (CHANNEL ISLANDS)
  | "JOR" // JORDAN
  | "JPN" // JAPAN
  | "KAZ" // KAZAKHSTAN
  | "KEN" // KENYA
  | "KGZ" // KYRGYZSTAN
  | "KHM" // CAMBODIA
  | "KIR" // KIRIBATI
  | "KNA" // ST.KITTS AND NEVIS
  | "KOR" // THE REPUBLIC OF KOREA
  | "KWT" // KUWAIT
  | "LAO" // LAOS
  | "LBN" // LEBANON
  | "LBR" // LIBERIA
  | "LBY" // LIBYAN ARAB JAMAHIRIYA
  | "LCA" // SAINT LUCIA
  | "LIE" // LIECHTENSTEIN
  | "LKA" // SRI LANKA
  | "LSO" // LESOTHO
  | "LTU" // LITHUANIA
  | "LUX" // LUXEMBOURG
  | "LVA" // LATVIA
  | "MAC" // MACAO
  | "MAF" // SAINT MARTIN (FRENCH PART)
  | "MAR" // MOROCCO
  | "MCO" // MONACO
  | "MDA" // MOLDOVA, REPUBLIC OF
  | "MDG" // MADAGASCAR
  | "MDV" // MALDIVES
  | "MEX" // MEXICO
  | "MHL" // MARSHALL ISLANDS
  | "MKD" // MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF
  | "MLI" // MALI
  | "MLT" // MALTA
  | "MMR" // MYANMAR
  | "MNE" // MONTENEGRO
  | "MNG" // MONGOLIA
  | "MNP" // NORTHERN MARIANA ISLANDS
  | "MOZ" // MOZAMBIQUE
  | "MRT" // MAURITANIA
  | "MSR" // MONTSERRAT
  | "MTQ" // MARTINIQUE
  | "MUS" // MAURITIUS
  | "MWI" // MALAWI
  | "MYS" // MALAYSIA
  | "MYT" // MAYOTTE
  | "NAM" // NAMIBIA
  | "NCL" // NEW CALEDONIA
  | "NER" // NIGER
  | "NFK" // NORFOLK ISLAND
  | "NGA" // NIGERIA
  | "NIC" // NICARAGUA
  | "NIU" // NIUE
  | "NLD" // NETHERLANDS
  | "NOR" // NORWAY
  | "NPL" // NEPAL
  | "NRU" // NAURU
  | "NZL" // NEW ZEALAND
  | "OMN" // OMAN
  | "PAK" // PAKISTAN
  | "PAN" // PANAMA
  | "PCN" // PITCAIRN
  | "PER" // PERU
  | "PHL" // PHILIPPINES
  | "PLW" // PALAU
  | "PNG" // PAPUA NEW GUINEA
  | "POL" // POLAND
  | "PRI" // PUERTO RICO
  | "PRK" // DEMOC.PEOPLES REP.OF KOREA
  | "PRT" // PORTUGAL
  | "PRY" // PARAGUAY
  | "PSE" // PALESTINIAN TERRITORY, OCCUPIED
  | "PYF" // FRENCH POLYNESIA
  | "QAT" // QATAR
  | "REU" // REUNION
  | "ROU" // ROMANIA
  | "RUS" // RUSSIAN FEDERATION (USSR)
  | "RWA" // RWANDA
  | "SAU" // SAUDI ARABIA
  | "SDN" // SUDAN
  | "SEN" // SENEGAL
  | "SGP" // SINGAPORE
  | "SGS" // SOUTH GEORGIA AND THE SOUTH SANDWICH ISLAND
  | "SHN" // ST. HELENA
  | "SJM" // SVALBARD AND JAN MAYEN ISLANDS
  | "SLB" // SOLOMON ISLANDS
  | "SLE" // SIERRA LEONE
  | "SLV" // EL SALVADOR
  | "SMR" // SAN MARINO
  | "SOM" // SOMALIA
  | "SPM" // ST. PIERRE AND MIQUELON
  | "SRB" // SERBIA
  | "SSD" // SOUTH SUDAN
  | "STP" // SAO TOME AND PRINCIPE
  | "SUR" // SURINAME
  | "SVK" // SLOVAK REPUBLIC
  | "SVN" // SLOVENIA
  | "SWE" // SWEDEN
  | "SWZ" // ESWATINI, KINGDOM OF (SWAZILAND)
  | "SXM" // SINT MAARTEN (DUTCH PART)
  | "SYC" // SEYCHELLES
  | "SYR" // SYRIAN ARAB REPUBLIC
  | "TCA" // TURKS AND CAICOS ISLANDS
  | "TCD" // CHAD
  | "TGO" // TOGO
  | "THA" // THAILAND
  | "TJK" // TAJIKISTAN
  | "TKL" // TOKELAU
  | "TKM" // TURKMENISTAN
  | "TLS" // TIMOR-LESTE
  | "TON" // TONGA
  | "TTO" // TRINIDAD AND TOBAGO
  | "TUN" // TUNISIA
  | "TUR" // TURKIYE
  | "TUV" // TUVALU
  | "TWN" // TAIWAN
  | "TZA" // TANZANIA UNITED REPUBLIC
  | "UGA" // UGANDA
  | "UKR" // UKRAINE
  | "UMI" // UNITED STATES MINOR OUTLYING ISLANDS
  | "URY" // URUGUAY
  | "USA" // UNITED STATES OF AMERICA
  | "UZB" // UZBEKISTAN
  | "VAT" // VATICAN CITY STATE (HOLY SEE)
  | "VCT" // SAINT VINCENT AND GRENADINES
  | "VEN" // VENEZUELA
  | "VGB" // VIRGIN ISLANDS(BRITISH)
  | "VIR" // VIRGIN ISLANDS(US)
  | "VNM" // VIETNAM
  | "VUT" // VANUATU
  | "WLF" // WALLIS AND FUTUNA ISLANDS
  | "WSM" // SAMOA
  | "XKX" // KOSOVO
  | "YEM" // YEMEN
  | "ZAF" // SOUTH AFRICA
  | "ZMB" // ZAMBIA
  | "ZWE"; // ZIMBABWE

export type PaymentMode =
  | "01" // Cash
  | "02" // Cheque
  | "03" // Bank Transfer
  | "04" // Credit Card
  | "05" // Debit Card
  | "06" // e-Wallet / Digital Wallet
  | "07" // Digital Bank
  | "08"; // Others

export type MalaysianStateCode =
  | "01" // Johor
  | "02" // Kedah
  | "03" // Kelantan
  | "04" // Melaka
  | "05" // Negeri Sembilan
  | "06" // Pahang
  | "07" // Pulau Pinang
  | "08" // Perak
  | "09" // Perlis
  | "10" // Selangor
  | "11" // Terengganu
  | "12" // Sabah
  | "13" // Sarawak
  | "14" // Wilayah Persekutuan Kuala Lumpur
  | "15" // Wilayah Persekutuan Labuan
  | "16" // Wilayah Persekutuan Putrajaya
  | "17"; // Not Applicable

export type TaxTypeCode =
  | "01" // Sales Tax
  | "02" // Service Tax
  | "03" // Tourism Tax
  | "04" // High-Value Goods Tax
  | "05" // Sales Tax on Low Value Goods
  | "06" // Not Applicable
  | "E";  // Tax exemption (where applicable)

export type TaxpayerIdType =
  | "NRIC"
  | "PASSPORT"
  | "BRN" 
  | "ARMY";
