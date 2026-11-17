/**
 * Numbered section banners for Анкета портала (staff RU labels).
 * Order matches manage_applicant(form).html (REQ-002).
 */
export const PORTAL_FORM_SECTION_BANNERS = {
  personalDetails: { number: 1, title: 'Личные данные' },
  minors: {
    number: 2,
    title: 'Для несовершеннолетних — данные родителя / законного представителя',
  },
  passportDetails: { number: 3, title: 'Паспортные данные' },
  addressContact: { number: 4, title: 'Адрес и контакты' },
  otherResidence: {
    number: 5,
    title: 'Проживание в стране, отличной от страны текущего гражданства',
  },
  employerDetails: {
    number: 6,
    title: 'Данные работодателя. Для студентов — учебное заведение',
  },
  travelInformation: { number: 7, title: 'Информация о поездке' },
  previousSchengenVisa: { number: 8, title: 'Предыдущая шенгенская виза' },
  fingerprints: {
    number: 9,
    title: 'Отпечатки пальцев, ранее снятые для шенгенской визы',
  },
  entryPermit: {
    number: 10,
    title: 'Разрешение на въезд в конечную страну назначения (если применимо)',
  },
  inviting: {
    number: 11,
    title:
      'Данные приглашающего лица в государстве-члене. Если не применимо — отель или временное проживание',
  },
  costOfTravelling: {
    number: 12,
    title: 'Расходы на поездку и проживание во время пребывания',
  },
  euFamilyPersonalData: {
    number: 13,
    title: 'Личные данные члена семьи — гражданина ЕС, ЕЭЗ или Швейцарии',
  },
  euFamilyRelationship: {
    number: 14,
    title: 'Родство с гражданином ЕС, ЕЭЗ или Швейцарии',
  },
  booking: { number: 0, title: 'Бронирование — город подачи и тип визы' },
} as const
