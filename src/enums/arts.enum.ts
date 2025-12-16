export enum ImageFolder {
  ION_SAMSUNG_NV_10 = 'ION_Samsung_NV_10',
  ION_VOPROSY_EST = 'ION_voprosy_est',
  ADVEGO_IKONKI_ADMINA = 'Advego_ikonki_admina',
  RMNT_DLJA_REKLAMODATELEJ = 'RMNT_dlja_reklamodatelej',
  RMNT_AGENSTVO_NEDVIZHIMOSTI = 'RMNT_agenstvo_nedvizhimosti',
  ION_NOVYJ_SAJT = 'ION_novyj_sajt',
  ION_KARTINKI_DLJA_SAJTA = 'ION_kartinki_dlja_sajta',
  NIKITA_BANNERY_DLJA_TYT_BY = 'Nikita_bannery_dlja_tyt_by',
  LANDYSHI_OBLOZHKA = 'Landyshi_oblozhka',
  ION_ACER_TRAVELMATE_PROMO = 'ION_Acer_TravelMate_promo',
  RMNT_BUKLET_NA_VYSTAVKU = 'RMNT_buklet_na_vystavku',
  GEOOPTICS = 'Geooptics',
  NIKITA_KAROS = 'Nikita_Karos',
  GAZ_EXPORT_MAKET_SAJTA = 'Gaz_export_maket_sajta',
  TSARITSINO_2 = 'Tsaritsino_2',
  ION_SKIDKA_NA_OBUCHENIE = 'ION_skidka_na_obuchenie',
  ADV_MIX_MAKET_SAJTA = 'ADV_mix_maket_sajta',
  JESTEL_ADONI_ZASTAVKA_SAJTA = 'Jestel_Adoni_zastavka_sajta',
  RMNT_KONCEPT_NOVOGO_SAJTA = 'RMNT_koncept_novogo_sajta',
  ADVEGO_PLAKAT_RABOTA_NA_DOMU = 'Advego_plakat_rabota_na_domu',
  NIKITA_PP_PREZENTACIJA = 'Nikita_PP_prezentacija',
  ADVEGO_SLET_2013 = 'Advego_slet_2013',
  ION_POVESTKU_NA_KARTU = 'ION_povestku_na_kartu',
  UTINET_KARTA_PROEZDA = 'Utinet_karta_proezda',
  GRUZOFLOT_SAJT = 'Gruzoflot_sajt',
  ADVEGO_MARKI = 'Advego_marki',
  ALSENA = 'Alsena',
  NIKITA_PROMO_4STORY = 'Nikita_promo_4story',
  NIKITA_PROMO_DISK_I_LISTOVKA_DLJA_VYSTAVKI = 'Nikita_promo_disk_i_listovka_dlja_vystavki',
  KRANBURG = 'Kranburg',
  STORM_AG_LOGOTIP = 'STORM_AG_logotip',
  NOVYJ_GOD_2005 = 'Novyj_god_2005',
  ION_VTOROJ_DISK_S_IGROJ_BESPLATNO = 'ION_vtoroj_disk_s_igroj_besplatno',
  ION_NOKIA_N93_PROMO = 'ION_Nokia_N93_promo',
  ARTJES_PRODACKSHN_IKONKI = 'Artjes_Prodakshn_ikonki',
  ION_KUPI_PANASONIC_KARTA_PAMJATI_V_PODAROK = 'ION_kupi_Panasonic_karta_pamjati_v_podarok',
  SAMOMOJ = 'Samomoj',
  UTINET_OFORMLENIE_STRANIC = 'Utinet_oformlenie_stranic',
  PRAVOVEST_MAKET_SAJTA = 'Pravovest_maket_sajta',
  RMNT_JURIDICHESKOE_SOPROVOZHDENIE = 'RMNT_juridicheskoe_soprovozhdenie',
  NIKITA_PROMO_SAJT_POVELITELI_DRAKONOV = 'Nikita_promo_sajt_poveliteli_drakonov',
  ADVEGO_SAJT_NOVYJ_DIZAJN = 'Advego_sajt_novyj_dizajn',
  PRONEDRA_LOGOTIP = 'Pronedra_logotip',
  RMNT_SBERBANK = 'RMNT_sberbank',
  KONSALTING_MAKET_STRANICY = 'Konsalting_maket_stranicy',
  NIKITA_OFORMLENIE_DISKOV = 'Nikita_oformlenie_diskov',
  ION_ZAGLUSHKI_DLJA_AVATAROV = 'ION_zaglushki_dlja_avatarov',
  RUSSIAN_STANDART_PROMO_STRANICY = 'Russian_Standart_promo_stranicy',
  NEVSKOE_NOVAJA_BANKA = 'Nevskoe_novaja_banka',
  NIKITA_NOVOGODNJAJA_OTKRYTKA = 'Nikita_novogodnjaja_otkrytka',
  SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK = 'Samomoj_primerochnaja_vizualizacija_moek',
  MEGA_KARAOKE_MAKET_STRANICY = 'Mega_Karaoke_maket_stranicy',
  NIKITA_RAPPLEZ = 'Nikita_Rapplez',
  FAKTORIJA_STILJA_MAKET_STRANICY = 'Faktorija_stilja_maket_stranicy',
  WEBCAB_SITE = 'Webcab_site',
}

export type FolderData = {
  preview: string | null
  images: string[]
}

// Функция для получения правильного URL в зависимости от среды
const getImageUrl = (folder: ImageFolder, filename: string): string => {
  // В dev-режиме используем прямой доступ
  if (import.meta.env.DEV) {
    // Алиас @assets настроен в vite.config.ts
    return `/src/view/assets/images/arts/${folder}/${filename}`
  }
  // В production используем путь к скомпилированным ассетам
  return `/assets/images/arts/${folder}/${filename}`
}

export const FOLDERS_DATA: Record<ImageFolder, FolderData> = {
  [ImageFolder.ION_SAMSUNG_NV_10]: {
    preview: getImageUrl(ImageFolder.ION_SAMSUNG_NV_10, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_SAMSUNG_NV_10, '1_big.jpg')],
  },
  [ImageFolder.ION_VOPROSY_EST]: {
    preview: getImageUrl(ImageFolder.ION_VOPROSY_EST, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_VOPROSY_EST, '1_big.jpg')],
  },
  [ImageFolder.ADVEGO_IKONKI_ADMINA]: {
    preview: getImageUrl(ImageFolder.ADVEGO_IKONKI_ADMINA, 'mini.png'),
    images: [getImageUrl(ImageFolder.ADVEGO_IKONKI_ADMINA, '1_big.png')],
  },
  [ImageFolder.RMNT_DLJA_REKLAMODATELEJ]: {
    preview: getImageUrl(ImageFolder.RMNT_DLJA_REKLAMODATELEJ, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.RMNT_DLJA_REKLAMODATELEJ, '1_big.png'),
      getImageUrl(ImageFolder.RMNT_DLJA_REKLAMODATELEJ, '2_big.png'),
      getImageUrl(ImageFolder.RMNT_DLJA_REKLAMODATELEJ, '3_big.png'),
      getImageUrl(ImageFolder.RMNT_DLJA_REKLAMODATELEJ, '4_big.png'),
      getImageUrl(ImageFolder.RMNT_DLJA_REKLAMODATELEJ, '5_big.png'),
    ],
  },
  [ImageFolder.RMNT_AGENSTVO_NEDVIZHIMOSTI]: {
    preview: getImageUrl(ImageFolder.RMNT_AGENSTVO_NEDVIZHIMOSTI, 'mini.png'),
    images: [getImageUrl(ImageFolder.RMNT_AGENSTVO_NEDVIZHIMOSTI, '1_big.png')],
  },
  [ImageFolder.ION_NOVYJ_SAJT]: {
    preview: getImageUrl(ImageFolder.ION_NOVYJ_SAJT, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_NOVYJ_SAJT, '1_big.jpg')],
  },
  [ImageFolder.ION_KARTINKI_DLJA_SAJTA]: {
    preview: getImageUrl(ImageFolder.ION_KARTINKI_DLJA_SAJTA, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_KARTINKI_DLJA_SAJTA, '1_big.jpg')],
  },
  [ImageFolder.NIKITA_BANNERY_DLJA_TYT_BY]: {
    preview: getImageUrl(ImageFolder.NIKITA_BANNERY_DLJA_TYT_BY, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.NIKITA_BANNERY_DLJA_TYT_BY, '1_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_BANNERY_DLJA_TYT_BY, '2_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_BANNERY_DLJA_TYT_BY, '3_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_BANNERY_DLJA_TYT_BY, '4_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_BANNERY_DLJA_TYT_BY, '5_big.jpg'),
    ],
  },
  [ImageFolder.LANDYSHI_OBLOZHKA]: {
    preview: getImageUrl(ImageFolder.LANDYSHI_OBLOZHKA, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.LANDYSHI_OBLOZHKA, '1_big.png'),
      getImageUrl(ImageFolder.LANDYSHI_OBLOZHKA, '2_big.png'),
    ],
  },
  [ImageFolder.ION_ACER_TRAVELMATE_PROMO]: {
    preview: getImageUrl(ImageFolder.ION_ACER_TRAVELMATE_PROMO, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_ACER_TRAVELMATE_PROMO, '1_big.jpg')],
  },
  [ImageFolder.RMNT_BUKLET_NA_VYSTAVKU]: {
    preview: getImageUrl(ImageFolder.RMNT_BUKLET_NA_VYSTAVKU, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.RMNT_BUKLET_NA_VYSTAVKU, '1_big.png'),
      getImageUrl(ImageFolder.RMNT_BUKLET_NA_VYSTAVKU, '2_big.png'),
      getImageUrl(ImageFolder.RMNT_BUKLET_NA_VYSTAVKU, '3_big.jpg'),
    ],
  },
  [ImageFolder.GEOOPTICS]: {
    preview: getImageUrl(ImageFolder.GEOOPTICS, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.GEOOPTICS, '1_big.png'),
      getImageUrl(ImageFolder.GEOOPTICS, '2_big.png'),
      getImageUrl(ImageFolder.GEOOPTICS, '3_big.png'),
      getImageUrl(ImageFolder.GEOOPTICS, '4_big.jpg'),
    ],
  },
  [ImageFolder.NIKITA_KAROS]: {
    preview: getImageUrl(ImageFolder.NIKITA_KAROS, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.NIKITA_KAROS, '1_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_KAROS, '2_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_KAROS, '3_big.jpg'),
    ],
  },
  [ImageFolder.GAZ_EXPORT_MAKET_SAJTA]: {
    preview: getImageUrl(ImageFolder.GAZ_EXPORT_MAKET_SAJTA, 'mini.jpg'),
    images: [
      getImageUrl(ImageFolder.GAZ_EXPORT_MAKET_SAJTA, '1_big.jpg'),
      getImageUrl(ImageFolder.GAZ_EXPORT_MAKET_SAJTA, '2_big.jpg'),
    ],
  },
  [ImageFolder.TSARITSINO_2]: {
    preview: getImageUrl(ImageFolder.TSARITSINO_2, 'mini.jpg'),
    images: [getImageUrl(ImageFolder.TSARITSINO_2, '1_big.jpg')],
  },
  [ImageFolder.ION_SKIDKA_NA_OBUCHENIE]: {
    preview: getImageUrl(ImageFolder.ION_SKIDKA_NA_OBUCHENIE, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_SKIDKA_NA_OBUCHENIE, '1_big.jpg')],
  },
  [ImageFolder.ADV_MIX_MAKET_SAJTA]: {
    preview: getImageUrl(ImageFolder.ADV_MIX_MAKET_SAJTA, 'mini.jpg'),
    images: [
      getImageUrl(ImageFolder.ADV_MIX_MAKET_SAJTA, '1_big.jpg'),
      getImageUrl(ImageFolder.ADV_MIX_MAKET_SAJTA, '2_big.jpg'),
    ],
  },
  [ImageFolder.JESTEL_ADONI_ZASTAVKA_SAJTA]: {
    preview: getImageUrl(ImageFolder.JESTEL_ADONI_ZASTAVKA_SAJTA, 'mini.jpg'),
    images: [getImageUrl(ImageFolder.JESTEL_ADONI_ZASTAVKA_SAJTA, '1_big.jpg')],
  },
  [ImageFolder.RMNT_KONCEPT_NOVOGO_SAJTA]: {
    preview: getImageUrl(ImageFolder.RMNT_KONCEPT_NOVOGO_SAJTA, 'mini.png'),
    images: [getImageUrl(ImageFolder.RMNT_KONCEPT_NOVOGO_SAJTA, '1_big.png')],
  },
  [ImageFolder.ADVEGO_PLAKAT_RABOTA_NA_DOMU]: {
    preview: getImageUrl(ImageFolder.ADVEGO_PLAKAT_RABOTA_NA_DOMU, 'mini.png'),
    images: [getImageUrl(ImageFolder.ADVEGO_PLAKAT_RABOTA_NA_DOMU, 'big.png')],
  },
  [ImageFolder.NIKITA_PP_PREZENTACIJA]: {
    preview: getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '1_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '2_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '3_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '4_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '5_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '6_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '7_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PP_PREZENTACIJA, '8_big.jpg'),
    ],
  },
  [ImageFolder.ADVEGO_SLET_2013]: {
    preview: getImageUrl(ImageFolder.ADVEGO_SLET_2013, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.ADVEGO_SLET_2013, '1_big.png'),
      getImageUrl(ImageFolder.ADVEGO_SLET_2013, '2_big.png'),
      getImageUrl(ImageFolder.ADVEGO_SLET_2013, '3_big.png'),
    ],
  },
  [ImageFolder.ION_POVESTKU_NA_KARTU]: {
    preview: getImageUrl(ImageFolder.ION_POVESTKU_NA_KARTU, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_POVESTKU_NA_KARTU, '1_big.jpg')],
  },
  [ImageFolder.UTINET_KARTA_PROEZDA]: {
    preview: getImageUrl(ImageFolder.UTINET_KARTA_PROEZDA, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.UTINET_KARTA_PROEZDA, '1_big.png'),
      getImageUrl(ImageFolder.UTINET_KARTA_PROEZDA, '2_big.png'),
    ],
  },
  [ImageFolder.GRUZOFLOT_SAJT]: {
    preview: getImageUrl(ImageFolder.GRUZOFLOT_SAJT, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.GRUZOFLOT_SAJT, '1_big.png'),
      getImageUrl(ImageFolder.GRUZOFLOT_SAJT, '2_big.png'),
    ],
  },
  [ImageFolder.ADVEGO_MARKI]: {
    preview: getImageUrl(ImageFolder.ADVEGO_MARKI, 'mini.png'),
    images: [getImageUrl(ImageFolder.ADVEGO_MARKI, '1_big.png')],
  },
  [ImageFolder.ALSENA]: {
    preview: getImageUrl(ImageFolder.ALSENA, 'mini.png'),
    images: [getImageUrl(ImageFolder.ALSENA, '1_big.png')],
  },
  [ImageFolder.NIKITA_PROMO_4STORY]: {
    preview: getImageUrl(ImageFolder.NIKITA_PROMO_4STORY, 'mini.png'),
    images: [getImageUrl(ImageFolder.NIKITA_PROMO_4STORY, '1_big.jpg')],
  },
  [ImageFolder.NIKITA_PROMO_DISK_I_LISTOVKA_DLJA_VYSTAVKI]: {
    preview: getImageUrl(
      ImageFolder.NIKITA_PROMO_DISK_I_LISTOVKA_DLJA_VYSTAVKI,
      'mini.jpg',
    ),
    images: [
      getImageUrl(ImageFolder.NIKITA_PROMO_DISK_I_LISTOVKA_DLJA_VYSTAVKI, '1_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PROMO_DISK_I_LISTOVKA_DLJA_VYSTAVKI, '2_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_PROMO_DISK_I_LISTOVKA_DLJA_VYSTAVKI, '3_big.jpg'),
    ],
  },
  [ImageFolder.KRANBURG]: {
    preview: getImageUrl(ImageFolder.KRANBURG, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.KRANBURG, '1_big.png'),
      getImageUrl(ImageFolder.KRANBURG, '2_big.png'),
    ],
  },
  [ImageFolder.STORM_AG_LOGOTIP]: {
    preview: getImageUrl(ImageFolder.STORM_AG_LOGOTIP, 'mini.png'),
    images: [getImageUrl(ImageFolder.STORM_AG_LOGOTIP, '1_big.png')],
  },
  [ImageFolder.NOVYJ_GOD_2005]: {
    preview: getImageUrl(ImageFolder.NOVYJ_GOD_2005, 'mini.jpg'),
    images: [getImageUrl(ImageFolder.NOVYJ_GOD_2005, '1_big.jpg')],
  },
  [ImageFolder.ION_VTOROJ_DISK_S_IGROJ_BESPLATNO]: {
    preview: getImageUrl(ImageFolder.ION_VTOROJ_DISK_S_IGROJ_BESPLATNO, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_VTOROJ_DISK_S_IGROJ_BESPLATNO, '1_big.jpg')],
  },
  [ImageFolder.ION_NOKIA_N93_PROMO]: {
    preview: getImageUrl(ImageFolder.ION_NOKIA_N93_PROMO, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_NOKIA_N93_PROMO, '1_big.jpg')],
  },
  [ImageFolder.ARTJES_PRODACKSHN_IKONKI]: {
    preview: getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, 'mini.jpg'),
    images: [
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '1_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '2_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '3_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '4_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '5_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '6_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '7_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '8_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '9_big.jpg'),
      getImageUrl(ImageFolder.ARTJES_PRODACKSHN_IKONKI, '10_big.jpg'),
    ],
  },
  [ImageFolder.ION_KUPI_PANASONIC_KARTA_PAMJATI_V_PODAROK]: {
    preview: getImageUrl(
      ImageFolder.ION_KUPI_PANASONIC_KARTA_PAMJATI_V_PODAROK,
      'mini.png',
    ),
    images: [
      getImageUrl(ImageFolder.ION_KUPI_PANASONIC_KARTA_PAMJATI_V_PODAROK, '1_big.jpg'),
    ],
  },
  [ImageFolder.SAMOMOJ]: {
    preview: getImageUrl(ImageFolder.SAMOMOJ, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.SAMOMOJ, '1_big.png'),
      getImageUrl(ImageFolder.SAMOMOJ, '2_big.png'),
      getImageUrl(ImageFolder.SAMOMOJ, '3_big.png'),
      getImageUrl(ImageFolder.SAMOMOJ, '4_big.png'),
    ],
  },
  [ImageFolder.UTINET_OFORMLENIE_STRANIC]: {
    preview: getImageUrl(ImageFolder.UTINET_OFORMLENIE_STRANIC, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.UTINET_OFORMLENIE_STRANIC, '1_big.png'),
      getImageUrl(ImageFolder.UTINET_OFORMLENIE_STRANIC, '2_big.png'),
      getImageUrl(ImageFolder.UTINET_OFORMLENIE_STRANIC, '3_big.png'),
      getImageUrl(ImageFolder.UTINET_OFORMLENIE_STRANIC, '4_big.png'),
    ],
  },
  [ImageFolder.PRAVOVEST_MAKET_SAJTA]: {
    preview: getImageUrl(ImageFolder.PRAVOVEST_MAKET_SAJTA, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.PRAVOVEST_MAKET_SAJTA, '1_big.jpg'),
      getImageUrl(ImageFolder.PRAVOVEST_MAKET_SAJTA, '2_big.jpg'),
      getImageUrl(ImageFolder.PRAVOVEST_MAKET_SAJTA, '3_big.png'),
    ],
  },
  [ImageFolder.RMNT_JURIDICHESKOE_SOPROVOZHDENIE]: {
    preview: getImageUrl(ImageFolder.RMNT_JURIDICHESKOE_SOPROVOZHDENIE, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.RMNT_JURIDICHESKOE_SOPROVOZHDENIE, '1_big.png'),
      getImageUrl(ImageFolder.RMNT_JURIDICHESKOE_SOPROVOZHDENIE, '2_big.png'),
    ],
  },
  [ImageFolder.NIKITA_PROMO_SAJT_POVELITELI_DRAKONOV]: {
    preview: getImageUrl(ImageFolder.NIKITA_PROMO_SAJT_POVELITELI_DRAKONOV, 'mini.jpg'),
    images: [getImageUrl(ImageFolder.NIKITA_PROMO_SAJT_POVELITELI_DRAKONOV, '1_big.jpg')],
  },
  [ImageFolder.ADVEGO_SAJT_NOVYJ_DIZAJN]: {
    preview: getImageUrl(ImageFolder.ADVEGO_SAJT_NOVYJ_DIZAJN, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.ADVEGO_SAJT_NOVYJ_DIZAJN, '1_big.png'),
      getImageUrl(ImageFolder.ADVEGO_SAJT_NOVYJ_DIZAJN, '2_big.png'),
    ],
  },
  [ImageFolder.PRONEDRA_LOGOTIP]: {
    preview: getImageUrl(ImageFolder.PRONEDRA_LOGOTIP, 'mini.png'),
    images: [getImageUrl(ImageFolder.PRONEDRA_LOGOTIP, '1_big.png')],
  },
  [ImageFolder.RMNT_SBERBANK]: {
    preview: getImageUrl(ImageFolder.RMNT_SBERBANK, 'mini.png'),
    images: [getImageUrl(ImageFolder.RMNT_SBERBANK, '1_big.png')],
  },
  [ImageFolder.KONSALTING_MAKET_STRANICY]: {
    preview: getImageUrl(ImageFolder.KONSALTING_MAKET_STRANICY, 'mini.png'),
    images: [getImageUrl(ImageFolder.KONSALTING_MAKET_STRANICY, '1_big.png')],
  },
  [ImageFolder.NIKITA_OFORMLENIE_DISKOV]: {
    preview: getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, 'mini.jpg'),
    images: [
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '1_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '2_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '3_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '4_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '5_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '6_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '7_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '8_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '9_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '10_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '11_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '12_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '13_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '14_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '15_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '16_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '17_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '18_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '19_big.jpg'),
      getImageUrl(ImageFolder.NIKITA_OFORMLENIE_DISKOV, '20_big.jpg'),
    ],
  },
  [ImageFolder.ION_ZAGLUSHKI_DLJA_AVATAROV]: {
    preview: getImageUrl(ImageFolder.ION_ZAGLUSHKI_DLJA_AVATAROV, 'mini.png'),
    images: [getImageUrl(ImageFolder.ION_ZAGLUSHKI_DLJA_AVATAROV, '1_big.png')],
  },
  [ImageFolder.RUSSIAN_STANDART_PROMO_STRANICY]: {
    preview: getImageUrl(ImageFolder.RUSSIAN_STANDART_PROMO_STRANICY, 'mini.png'),
    images: [
      getImageUrl(ImageFolder.RUSSIAN_STANDART_PROMO_STRANICY, '1_big.jpg'),
      getImageUrl(ImageFolder.RUSSIAN_STANDART_PROMO_STRANICY, '2_big.jpg'),
      getImageUrl(ImageFolder.RUSSIAN_STANDART_PROMO_STRANICY, '3_big.jpg'),
      getImageUrl(ImageFolder.RUSSIAN_STANDART_PROMO_STRANICY, '4_big.jpg'),
    ],
  },
  [ImageFolder.NEVSKOE_NOVAJA_BANKA]: {
    preview: getImageUrl(ImageFolder.NEVSKOE_NOVAJA_BANKA, 'mini.jpg'),
    images: [getImageUrl(ImageFolder.NEVSKOE_NOVAJA_BANKA, '1_big.jpg')],
  },
  [ImageFolder.NIKITA_NOVOGODNJAJA_OTKRYTKA]: {
    preview: getImageUrl(ImageFolder.NIKITA_NOVOGODNJAJA_OTKRYTKA, 'mini.png'),
    images: [getImageUrl(ImageFolder.NIKITA_NOVOGODNJAJA_OTKRYTKA, '1_big.jpg')],
  },
  [ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK]: {
    preview: getImageUrl(
      ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK,
      'mini.jpg',
    ),
    images: [
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '1_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '2_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '3_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '4_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '5_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '6_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '7_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '8_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '9_big.jpg'),
      getImageUrl(ImageFolder.SAMOMOJ_PRIMEROCHNAJA_VIZUALIZACIJA_MOEK, '10_big.jpg'),
    ],
  },
  [ImageFolder.MEGA_KARAOKE_MAKET_STRANICY]: {
    preview: getImageUrl(ImageFolder.MEGA_KARAOKE_MAKET_STRANICY, 'mini.png'),
    images: [getImageUrl(ImageFolder.MEGA_KARAOKE_MAKET_STRANICY, '1_big.jpg')],
  },
  [ImageFolder.NIKITA_RAPPLEZ]: {
    preview: getImageUrl(ImageFolder.NIKITA_RAPPLEZ, 'mini.png'),
    images: [getImageUrl(ImageFolder.NIKITA_RAPPLEZ, '1_big.jpg')],
  },
  [ImageFolder.FAKTORIJA_STILJA_MAKET_STRANICY]: {
    preview: getImageUrl(ImageFolder.FAKTORIJA_STILJA_MAKET_STRANICY, 'mini.jpg'),
    images: [getImageUrl(ImageFolder.FAKTORIJA_STILJA_MAKET_STRANICY, '1_big.jpg')],
  },
  [ImageFolder.WEBCAB_SITE]: {
    preview: getImageUrl(ImageFolder.WEBCAB_SITE, 'mini.png'),
    images: [getImageUrl(ImageFolder.WEBCAB_SITE, '1_big.png')],
  },
}
