import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app_name: 'Balochistan Blood Donor App',
      slogan: 'Become a Hero, Donate Blood',
      home: 'Home',
      register: 'Register',
      search: 'Search',
      about: 'About',
      admin: 'Admin',
      emergency: 'Emergency Blood Request',
      total_donors: 'Total Registered Donors',
      hero_quote: 'Your blood can save a life. Join our community of heroes today.',
      btn_register: 'Become a Donor',
      btn_search: 'Find a Donor',
      blood_group: 'Blood Group',
      district: 'District',
      full_name: 'Full Name',
      phone: 'Phone Number',
      whatsapp: 'WhatsApp Number',
      age: 'Age',
      last_donation: 'Last Donation Date',
      success_reg: 'Registered Successfully!',
      btn_call: 'Call',
      btn_whatsapp: 'WhatsApp',
      btn_copy: 'Copy',
      no_results: 'No donors found for this selection.',
      emergency_details: '{{name}} needs {{group}} at {{hospital}} ({{district}})',
      contact_now: 'Contact Now'
    }
  },
  ur: {
    translation: {
      app_name: 'بلوچستان بلڈ ڈونر ایپ',
      slogan: 'ہیرو بنیں، خون عطیہ کریں',
      home: 'ہوم',
      register: 'رجسٹریشن',
      search: 'تلاش',
      about: 'ایپ کے بارے میں',
      admin: 'ایڈمن',
      emergency: 'ہنگامی خون کی درخواست',
      total_donors: 'کل رجسٹرڈ عطیہ دہندگان',
      hero_quote: 'آپ کا خون کسی کی زندگی بچا سکتا ہے۔ آج ہی ہمارے ہیروز میں شامل ہوں۔',
      btn_register: 'عطیہ دہندہ بنیں',
      btn_search: 'عطیہ دہندہ تلاش کریں',
      blood_group: 'بلڈ گروپ',
      district: 'ضلع',
      full_name: 'پورا نام',
      phone: 'فون نمبر',
      whatsapp: 'واٹس ایپ نمبر',
      age: 'عمر',
      last_donation: 'آخری عطیہ کی تاریخ',
      success_reg: 'کامیابی سے رجسٹریشن ہوگئی!',
      btn_call: 'کال کریں',
      btn_whatsapp: 'واٹس ایپ',
      btn_copy: 'کاپی کریں',
      no_results: 'اس انتخاب کے لیے کوئی عطیہ دہندہ نہیں ملا۔',
      emergency_details: '{{name}} کو {{hospital}} ({{district}}) میں {{group}} کی ضرورت ہے',
      contact_now: 'ابھی رابطہ کریں'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
