import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Hindi translations
const hi = {
    translation: {
        // Greetings
        "Good Morning": "सुप्रभात",
        "Good Afternoon": "शुभ दोपहर",
        "Good Evening": "शुभ संध्या",
        "Guest": "अतिथि",

        // Quick Actions
        "Quick Actions": "त्वरित क्रियाएँ",
        "Fake Call": "फर्जी कॉल",
        "Escape Route": "बचने का रास्ता",
        "Check-In": "चेक-इन",
        "Safety Timer": "सुरक्षा टाइमर",
        "Safe Route": "सुरक्षित मार्ग",
        "AI Navigation": "एआई नेविगेशन",
        "Safety Tips": "सुरक्षा सुझाव",
        "Self Defense": "आत्मरक्षा",
        "Alerts": "अलर्ट",
        "Community": "समुदाय",
        "Record": "रिकॉर्ड",
        "Evidence": "प्रमाण",
        "Cab Safe": "कैब सुरक्षित",
        "Ride Tracker": "सवारी ट्रैकर",
        "Companion": "साथी",
        "Virtual Walk": "आभासी सैर",

        // Status
        "Status": "स्थिति",
        "Shake On": "शेक चालू",
        "Shake to SOS (Global)": "SOS के लिए हिलाएं (वैश्विक)",
        "Voice": "आवाज़",
        "Listening...": "सुन रहा है...",
        "Voice Off": "आवाज़ बंद",
        "Say \"Help\"": "\"मदद\" बोलें",

        // SOS Button
        "HOLD": "दबाए रखें",
        "FOR SOS": "SOS के लिए",
        "EMERGENCY": "आपातकाल",
        "ACTIVE": "सक्रिय",
        "Keep holding...": "दबाए रखें...",
        "Press and hold for 3 seconds": "3 सेकंड तक दबाए रखें",
        "Triggers emergency alert & location sharing": "आपातकालीन अलर्ट और स्थान साझाकरण ट्रिगर करता है",

        // Emergency Mode
        "EMERGENCY ACTIVE": "आपातकाल सक्रिय",
        "Help is on the way": "मदद रास्ते में है",
        "Emergency services will be contacted in": "में आपातकालीन सेवाओं से संपर्क किया जाएगा",
        "seconds": "सेकंड",
        "Enter cancel code": "रद्द करने का कोड दर्ज करें",
        "Cancel": "रद्द करें",
        "Enter your 4-digit code to cancel false alarm": "गलत अलार्म रद्द करने के लिए अपना 4-अंकीय कोड दर्ज करें",
        "Emergency Services": "आपातकालीन सेवाएं",
        "Preparing to call 112...": "112 पर कॉल करने की तैयारी...",
        "Connected to 112 • Sending your location": "112 से जुड़ा • आपका स्थान भेजा जा रहा है",
        "Live Location Sharing": "लाइव लोकेशन शेयरिंग",
        "Broadcasting real-time GPS coordinates": "रीयल-टाइम GPS निर्देशांक प्रसारित किए जा रहे हैं",
        "Trusted Contacts Notified": "विश्वसनीय संपर्क सूचित किए गए",
        "contacts alerted via SMS & push notification": "संपर्कों को SMS और पुश नोटिफिकेशन द्वारा अलर्ट किया गया",
        "Delivered": "वितरित",
        "Stay calm. Your emergency profile and medical info has been shared.": "शांत रहें। आपकी आपातकालीन प्रोफ़ाइल और चिकित्सा जानकारी साझा कर दी गई है।",
        "Cancel Emergency": "आपातकाल रद्द करें",

        // Bottom Navigation
        "Home": "होम",
        "Contacts": "संपर्क",
        "Activity": "गतिविधि",
        "Profile": "प्रोफ़ाइल"
    }
};

// English empty for fallback
const en = {
    translation: {
        // Text acts as key by default if missing
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en,
            hi
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        }
    });

export default i18n;
