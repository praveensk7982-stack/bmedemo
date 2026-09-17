import React, { useState, useEffect } from 'react';
import type { Hospital, Doctor } from '../types';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Users, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  Heart,
  ArrowLeft,
  Calendar,
  Search,
  Stethoscope,
  Info,
  LocateFixed,
  Mic,
  MicOff,
  Volume2,
  Globe
} from 'lucide-react';

interface HospitalsPageProps {
  hospitals: Hospital[];
  searchQuery: string;
  onBookAppointment: (hospital: Hospital, doctor?: Doctor) => void;
  onOpenDoctorProfile: (doctor: Doctor) => void;
}

export interface SpecialistChip {
  label: string;
  val: string;
  isPrimary?: boolean;
}

export const SPECIALIST_CHIPS: SpecialistChip[] = [
  // Top Most Common Visible Chips (9 categories)
  { label: 'Fever (காய்ச்சல்)', val: 'Fever', isPrimary: true },
  { label: 'Skin problem (தோல்)', val: 'Skin problem', isPrimary: true },
  { label: 'Ear problem (காது வலி)', val: 'Ear problem', isPrimary: true },
  { label: 'Joint pain (மூட்டு வலி)', val: 'Joint pain', isPrimary: true },
  { label: 'Breathing (மூச்சு)', val: 'Breathing problem', isPrimary: true },
  { label: 'Heart (இதயம்)', val: 'Heart concern', isPrimary: true },
  { label: 'General Physician — பொது மருத்துவர்', val: 'General Physician', isPrimary: true },
  { label: 'Gynaecologist — மகப்பேறு மருத்துவர்', val: 'Gynaecologist', isPrimary: true },
  { label: 'Paediatrician — குழந்தை மருத்துவர்', val: 'Paediatrician', isPrimary: true },

  // Additional Specialist Categories (Expandable)
  { label: 'Cardiologist — இதயநோய் மருத்துவர்', val: 'Cardiologist' },
  { label: 'Neurologist — நரம்பியல் மருத்துவர்', val: 'Neurologist' },
  { label: 'Dermatologist — தோல் மருத்துவர்', val: 'Dermatologist' },
  { label: 'Orthopaedic Doctor — எலும்பியல் மருத்துவர்', val: 'Orthopaedic Doctor' },
  { label: 'Gastroenterologist — வயிற்று நோய் மருத்துவர்', val: 'Gastroenterologist' },
  { label: 'Pulmonologist — நுரையீரல் மருத்துவர்', val: 'Pulmonologist' },
  { label: 'ENT Specialist — காது மூக்கு தொண்டை மருத்துவர்', val: 'ENT Specialist' },
  { label: 'Ophthalmologist (Eye Doctor) — கண் மருத்துவர்', val: 'Ophthalmologist' },
  { label: 'Urologist — சிறுநீரக மருத்துவர்', val: 'Urologist' },
  { label: 'Endocrinologist — நாளமில்லா சுரப்பி மருத்துவர்', val: 'Endocrinologist' },
  { label: 'Psychiatrist — மனநல மருத்துவர்', val: 'Psychiatrist' },
  { label: 'Dentist — பல் மருத்துவர்', val: 'Dentist' },
  { label: 'Nephrologist — சிறுநீரக மருத்துவர்', val: 'Nephrologist' },
  { label: 'General Surgeon — அறுவை சிகிச்சை மருத்துவர்', val: 'General Surgeon' },
  { label: 'Emergency Medicine Doctor — அவசர சிகிச்சை மருத்துவர்', val: 'Emergency Medicine Doctor' },
];

// Symptom / Condition mapping helper (Supports both English and Tamil phrases)
export function mapConditionToDepartment(condition: string): string {
  const q = condition.toLowerCase().trim();
  if (!q) return 'General Medicine';

  // General Physician / Medicine
  if (
    q.includes('general physician') || q.includes('பொது மருத்துவர்') ||
    q.includes('fever') || q.includes('cold') || q.includes('flu') || 
    q.includes('infection') || q.includes('fatigue') || q.includes('body pain') ||
    q.includes('weakness') || q.includes('viral') || q.includes('chill') ||
    q.includes('காய்ச்சல்') || q.includes('சளி') || q.includes('உடம்பு வலி')
  ) {
    return 'General Medicine';
  }

  // Cardiologist / Cardiology
  if (
    q.includes('cardio') || q.includes('heart') || q.includes('chest') || q.includes('bp') || 
    q.includes('blood pressure') || q.includes('palpitation') || q.includes('angina') ||
    q.includes('இதயம்') || q.includes('நெஞ்சு வலி') || q.includes('இதயநோய்') || q.includes('மார்பு') || q.includes('ரத்த அழுத்தம்')
  ) {
    return 'Cardiology';
  }

  // Neurologist / Neurology
  if (
    q.includes('neuro') || q.includes('brain') || q.includes('nerve') || q.includes('headache') || 
    q.includes('migraine') || q.includes('seizure') || q.includes('paralys') || q.includes('stroke') || 
    q.includes('fits') || q.includes('numbness') || q.includes('tremor') || q.includes('memory') ||
    q.includes('நரம்பியல்') || q.includes('தலைவலி') || q.includes('நரம்பு') || q.includes('மூளை') || q.includes('பக்கவாதம்')
  ) {
    return 'Neurology';
  }

  // Dermatologist / Dermatology
  if (
    q.includes('derma') || q.includes('skin') || q.includes('rash') || q.includes('acne') || 
    q.includes('itching') || q.includes('eczema') || q.includes('psoriasis') || q.includes('pimple') || 
    q.includes('boil') || q.includes('hair fall') || q.includes('தோல்') || q.includes('அரிப்பு') || 
    q.includes('சொறி') || q.includes('படை') || q.includes('முகப்பரு')
  ) {
    return 'Dermatology';
  }

  // Orthopaedic / Orthopedics
  if (
    q.includes('ortho') || q.includes('bone') || q.includes('joint') || q.includes('knee') || 
    q.includes('fracture') || q.includes('back pain') || q.includes('spine') || q.includes('arthritis') || 
    q.includes('leg pain') || q.includes('shoulder') || q.includes('neck pain') || q.includes('எலும்பியல்') || 
    q.includes('மூட்டு') || q.includes('எலும்பு') || q.includes('முதுகு வலி') || q.includes('முழங்கால்')
  ) {
    return 'Orthopedics';
  }

  // Gastroenterologist / Gastroenterology
  if (
    q.includes('gastro') || q.includes('stomach') || q.includes('digest') || q.includes('acidity') || 
    q.includes('liver') || q.includes('ulcer') || q.includes('vomit') || q.includes('diarrhea') || 
    q.includes('constipat') || q.includes('gut') || q.includes('heartburn') || q.includes('indigestion') || 
    q.includes('வயிற்று நோய்') || q.includes('வயிறு') || q.includes('செரிமானம்') || q.includes('வாந்தி') || q.includes('குடல்')
  ) {
    return 'Gastroenterology';
  }

  // Pulmonologist / Pulmonology
  if (
    q.includes('pulmon') || q.includes('breath') || q.includes('asthma') || q.includes('cough') || 
    q.includes('lung') || q.includes('wheez') || q.includes('respirat') || q.includes('copd') || 
    q.includes('நுரையீரல்') || q.includes('மூச்சு') || q.includes('இருமல்') || q.includes('ஆஸ்துமா')
  ) {
    return 'Pulmonology';
  }

  // ENT Specialist / ENT
  if (
    q.includes('ent') || q.includes('ear') || q.includes('nose') || q.includes('throat') || 
    q.includes('hearing') || q.includes('sinus') || q.includes('tonsil') || q.includes('tinnitus') || 
    q.includes('nasal') || q.includes('காது மூக்கு தொண்டை') || q.includes('காது') || q.includes('மூக்கு') || 
    q.includes('தொண்டை') || q.includes('சைனஸ்')
  ) {
    return 'ENT';
  }

  // Ophthalmologist / Ophthalmology
  if (
    q.includes('ophthalm') || q.includes('eye') || q.includes('vision') || q.includes('cataract') || 
    q.includes('sight') || q.includes('glaucoma') || q.includes('blurry') || q.includes('redness') || 
    q.includes('கண்') || q.includes('பார்வை')
  ) {
    return 'Ophthalmology';
  }

  // Gynaecologist / Gynecology
  if (
    q.includes('gynaec') || q.includes('gynec') || q.includes('women') || q.includes('pregnancy') || 
    q.includes('period') || q.includes('uterus') || q.includes('menstrua') || q.includes('matern') || 
    q.includes('pregnant') || q.includes('pcos') || q.includes('pelvic') || q.includes('மகப்பேறு') || 
    q.includes('பெண்') || q.includes('கர்ப்பம்') || q.includes('மாதவிடாய்')
  ) {
    return 'Gynecology';
  }

  // Paediatrician / Pediatrics
  if (
    q.includes('pediatr') || q.includes('paediatr') || q.includes('child') || q.includes('baby') || 
    q.includes('kid') || q.includes('infant') || q.includes('newborn') || q.includes('toddler') || 
    q.includes('diarrhoea') || q.includes('growth') || q.includes('குழந்தை') || q.includes('பாப்பா')
  ) {
    return 'Pediatrics';
  }

  // Urologist / Urology
  if (
    q.includes('urol') || q.includes('urinary') || q.includes('stone') || q.includes('bladder') || 
    q.includes('urinat') || q.includes('சிறுநீரக') || q.includes('சிறுநீர்')
  ) {
    return 'Urology';
  }

  // Nephrologist / Nephrology
  if (
    q.includes('nephro') || q.includes('kidney') || q.includes('swelling') || q.includes('சிறுநீரக')
  ) {
    return 'Urology';
  }

  // Endocrinologist / Endocrinology
  if (
    q.includes('endocrin') || q.includes('diabet') || q.includes('thyroid') || q.includes('hormon') || 
    q.includes('நாளமில்லா') || q.includes('சுரப்பி')
  ) {
    return 'General Medicine';
  }

  // Psychiatrist / Psychiatry
  if (
    q.includes('psych') || q.includes('stress') || q.includes('anxiety') || q.includes('depress') || 
    q.includes('mental') || q.includes('insomnia') || q.includes('sleep') || q.includes('emotional') || 
    q.includes('மனநல') || q.includes('மன')
  ) {
    return 'Psychiatry';
  }

  // Dentist / Dentistry
  if (
    q.includes('dent') || q.includes('tooth') || q.includes('teeth') || q.includes('caries') || 
    q.includes('gum') || q.includes('toothache') || q.includes('cavities') || q.includes('oral') || 
    q.includes('பல்') || q.includes('ஈறு')
  ) {
    return 'Dentistry';
  }

  // General Surgeon / Surgery
  if (
    q.includes('surgeon') || q.includes('surgery') || q.includes('hernia') || q.includes('lump') || 
    q.includes('gallstone') || q.includes('surgical') || q.includes('அறுவை சிகிச்சை')
  ) {
    return 'General Medicine';
  }

  // Emergency Medicine
  if (
    q.includes('emergency') || q.includes('injury') || q.includes('trauma') || q.includes('urgent') || 
    q.includes('casualty') || q.includes('அவசர சிகிச்சை')
  ) {
    return 'General Medicine';
  }

  // Oncology
  if (
    q.includes('cancer') || q.includes('tumor') || q.includes('lump') || 
    q.includes('oncol') || q.includes('chemo') || q.includes('radiation') ||
    q.includes('leukemia') || q.includes('புற்றுநோய்') || q.includes('கட்டி')
  ) {
    return 'Oncology';
  }

  return 'General Medicine';
}

export function isDepartmentMatch(hospitalDepts: string[], targetDept: string): boolean {
  const target = targetDept.toLowerCase().trim();
  return hospitalDepts.some((d) => {
    const dept = d.toLowerCase().trim();
    if (target === 'general medicine') {
      return dept.includes('general') || dept.includes('medicine') || dept.includes('internal');
    }
    if (target === 'dermatology') {
      return dept.includes('derma') || dept.includes('skin');
    }
    if (target === 'ent') {
      return dept.includes('ent') || dept.includes('ear') || dept.includes('throat');
    }
    if (target === 'orthopedics') {
      return dept.includes('ortho') || dept.includes('bone');
    }
    if (target === 'cardiology') {
      return dept.includes('cardio') || dept.includes('heart');
    }
    if (target === 'pulmonology') {
      return dept.includes('pulmon') || dept.includes('lung');
    }
    if (target === 'pediatrics') {
      return dept.includes('pediatr') || dept.includes('child');
    }
    if (target === 'neurology') {
      return dept.includes('neuro') || dept.includes('brain');
    }
    if (target === 'oncology') {
      return dept.includes('oncol') || dept.includes('cancer');
    }
    if (target === 'gastroenterology') {
      return dept.includes('gastro') || dept.includes('stomach');
    }
    if (target === 'gynecology') {
      return dept.includes('gynec') || dept.includes('gynaec') || dept.includes('women');
    }
    if (target === 'ophthalmology') {
      return dept.includes('ophthalm') || dept.includes('eye');
    }
    if (target === 'dentistry') {
      return dept.includes('dental') || dept.includes('dentist') || dept.includes('tooth');
    }
    if (target === 'urology') {
      return dept.includes('urolog') || dept.includes('kidney');
    }
    if (target === 'psychiatry') {
      return dept.includes('psychiat') || dept.includes('mental');
    }
    return dept.includes(target) || target.includes(dept);
  });
}

export function normalizeHospitalSearchQuery(query: string): string {
  const q = query.toLowerCase().trim();
  if (!q) return '';

  if (q.includes('அப்போலோ') || q.includes('அப்பல்லோ')) return 'apollo';
  if (q.includes('மியாட்') || q.includes('மையாட்') || q.includes('மியாயாட்')) return 'miot';
  if (q.includes('எஸ்ஆர்எம்') || q.includes('எஸ் ஆர் எம்') || q.includes('எஸ்.ஆர்.எம்')) return 'srm';
  if (q.includes('மெட்ராஸ்') || q.includes('எம்எம்சி') || q.includes('எம்.எம்.சி') || q.includes('அரசு மருத்துவமனை')) return 'madras';
  if (q.includes('சிம்ஸ்')) return 'sims';
  if (q.includes('காவேரி')) return 'kauvery';
  if (q.includes('போர்டிஸ்')) return 'fortis';
  return q;
}

function createDynamicHospital(query: string, city: string): Hospital {
  const trimmed = query.trim();
  const formattedName = trimmed
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const hospitalName = formattedName.toLowerCase().includes('hospital') 
    ? formattedName 
    : `${formattedName} Hospital`;

  const id = `dynamic-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return {
    id,
    name: hospitalName,
    rating: 4.6,
    reviews: "1.4k",
    address: `Central Sector, ${city}`,
    distance: "3.2 km",
    phone: "+91 44 4000 8888",
    open: "06:30 AM",
    close: "10:00 PM",
    depts: ["General Medicine", "Cardiology", "Orthopedics", "Emergency Care"],
    more: 6,
    wait: 22,
    queue: 7,
    tint: "#7ebf9b",
    accent: "#1e7a4b",
    city: city,
    alert: { title: "24/7 ER Operational", text: "Direct emergency admission & outpatient slots open." },
    doctors: [
      {
        id: `${id}-doc-1`,
        name: `Dr. A. R. Sharma`,
        spec: "Senior Consultant Specialist",
        hospital: hospitalName,
        hospitalId: id,
        qualification: "MBBS, MD, DNB",
        experienceYears: 15,
        rating: 4.8,
        reviewsCount: 230,
        fee: 750,
        available: true,
        when: "Today 09:00 AM - 04:00 PM",
        sex: "m",
        about: `Senior Medical Specialist at ${hospitalName} with expertise in internal medicine, cardiac health, and primary diagnostics.`,
        education: ["MBBS - State Medical University", "MD - National Institute"],
        availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
      },
      {
        id: `${id}-doc-2`,
        name: `Dr. Sunita Rao`,
        spec: "General Physician & Surgeon",
        hospital: hospitalName,
        hospitalId: id,
        qualification: "MBBS, MS",
        experienceYears: 12,
        rating: 4.6,
        reviewsCount: 180,
        fee: 650,
        available: true,
        when: "Today 10:30 AM - 05:30 PM",
        sex: "f",
        about: `Consultant physician at ${hospitalName} specializing in patient wellness and outpatient procedures.`,
        education: ["MBBS - Madras Medical College", "MS - General Surgery"],
        availableDays: ["Mon", "Wed", "Fri", "Sat"]
      }
    ]
  };
}

export const HospitalsPage: React.FC<HospitalsPageProps> = ({
  hospitals,
  searchQuery,
  onBookAppointment,
  onOpenDoctorProfile,
}) => {
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [selectedDistance, setSelectedDistance] = useState('10 km');
  const [sortBy, setSortBy] = useState<'default' | 'wait' | 'rating' | 'distance'>('default');
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [activeHospitalId, setActiveHospitalId] = useState<string | null>(null);

  // Condition Finder State
  const [conditionInput, setConditionInput] = useState('');
  const [activeConditionResult, setActiveConditionResult] = useState<{
    condition: string;
    department: string;
  } | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<'ta-IN' | 'en-IN'>('ta-IN');

  // Geolocation state
  const [locationStatus, setLocationStatus] = useState<string>('');

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setLocationStatus('Detecting GPS location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus(`📍 GPS Location Active (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})`);
        },
        () => {
          setLocationStatus('GPS unavailable. Using selected city location.');
        }
      );
    } else {
      setLocationStatus('GPS unavailable. Using selected city location.');
    }
  };

  const startVoiceSearch = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Web Speech API is not supported on this browser. Please type your search or try Chrome/Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setConditionInput(transcript);
          const mappedDept = mapConditionToDepartment(transcript);
          setActiveConditionResult({
            condition: transcript,
            department: mappedDept,
          });
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('Microphone access denied. Please click the camera/microphone icon in your browser URL bar to allow access.');
        } else {
          setSpeechError(`Voice recognition stopped (${event.error}). Please click the microphone button to try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechError('Unable to access microphone. Please check browser permissions.');
    }
  };

  const handleFindConditionHospitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionInput.trim()) return;

    const mappedDept = mapConditionToDepartment(conditionInput);
    setActiveConditionResult({
      condition: conditionInput.trim(),
      department: mappedDept,
    });
  };

  const handleClearConditionSearch = () => {
    setConditionInput('');
    setActiveConditionResult(null);
    setSpeechError(null);
  };

  // Base Hospitals Filtering
  const trimmedQuery = searchQuery.trim().toLowerCase();
  let filtered: Hospital[] = [];

  if (trimmedQuery.length > 0) {
    // GLOBAL SEARCH FOR HOSPITALS (Top Search Bar)
    const normQuery = normalizeHospitalSearchQuery(trimmedQuery);
    const staticMatches = hospitals.filter((h) => {
      const nameMatch = h.name.toLowerCase().includes(normQuery) || h.name.toLowerCase().includes(trimmedQuery);
      const addrMatch = h.address.toLowerCase().includes(normQuery) || h.address.toLowerCase().includes(trimmedQuery);
      const deptMatch = h.depts.some((d) => d.toLowerCase().includes(normQuery) || d.toLowerCase().includes(trimmedQuery));
      return nameMatch || addrMatch || deptMatch;
    });

    if (staticMatches.length > 0) {
      filtered = staticMatches;
    } else {
      const isHospitalSearch = normQuery.includes('hospital') || normQuery.includes('clinic') || normQuery.includes('medical') || normQuery.length > 3;
      if (isHospitalSearch) {
        const dynamicHosp = createDynamicHospital(searchQuery, selectedCity);
        filtered = [dynamicHosp];
      } else {
        filtered = [];
      }
    }
  } else if (activeConditionResult) {
    // STRICT CONDITION-SPECIFIC FILTERING:
    // 1. Identify target department
    // 2. Filter ONLY hospitals providing that department
    // 3. Do NOT include unrelated hospitals
    const deptTarget = activeConditionResult.department;
    const conditionMatched = hospitals.filter((h) =>
      isDepartmentMatch(h.depts, deptTarget)
    );

    if (conditionMatched.length > 0) {
      filtered = conditionMatched;
    } else {
      const dyn = createDynamicHospital(`${activeConditionResult.condition} Specialty Hospital`, selectedCity);
      dyn.depts = [activeConditionResult.department, "Emergency Care"];
      filtered = [dyn];
    }

    // 4. Sort matching hospitals strictly by nearest distance
    filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } else {
    filtered = hospitals.filter((h) => {
      const distVal = parseFloat(h.distance);
      const maxDist = parseFloat(selectedDistance);
      return isNaN(distVal) || isNaN(maxDist) || distVal <= maxDist;
    });

    if (sortBy === 'wait') {
      filtered.sort((a, b) => a.wait - b.wait);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
  }

  // Active hospital for details panel (only non-null if user explicitly clicked a hospital)
  const activeHospital = activeHospitalId
    ? (hospitals.find((h) => h.id === activeHospitalId) || filtered.find((h) => h.id === activeHospitalId) || null)
    : null;

  useEffect(() => {
    // Clear active hospital on search/condition change so details view does not open automatically
    // unless user explicitly selects a hospital
  }, [searchQuery, activeConditionResult]);

  return (
    <div className={`content ${activeHospital ? 'split' : ''}`}>
      {/* Left Column - Main Content & Card List */}
      <section>
        <h1>Hospitals</h1>
        <p className="sub">
          Find the best hospitals near you with real-time information, ratings and department availability.
        </p>

        {/* ---------- MODULE: Find Hospitals for Your Condition ---------- */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f7f9 100%)',
            border: '1px solid #bcd3e4',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 14px rgba(15, 39, 68, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                <Stethoscope size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>
                  Find Hospitals for Your Condition
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '2px' }}>
                  Speak or type a health concern in Tamil or English to find relevant departments.
                </div>
              </div>
            </div>

            {/* Voice Language Selector Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid var(--line)', padding: '4px 8px', borderRadius: '20px', fontSize: '11.5px' }}>
              <Globe size={13} color="var(--teal)" />
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Mic Language:</span>
              <button
                type="button"
                style={{ fontWeight: speechLang === 'ta-IN' ? 700 : 500, color: speechLang === 'ta-IN' ? 'var(--teal)' : 'var(--ink-3)', cursor: 'pointer' }}
                onClick={() => setSpeechLang('ta-IN')}
              >
                தமிழ் (Tamil)
              </button>
              <span style={{ color: 'var(--line)' }}>|</span>
              <button
                type="button"
                style={{ fontWeight: speechLang === 'en-IN' ? 700 : 500, color: speechLang === 'en-IN' ? 'var(--teal)' : 'var(--ink-3)', cursor: 'pointer' }}
                onClick={() => setSpeechLang('en-IN')}
              >
                English
              </button>
            </div>
          </div>

          <form onSubmit={handleFindConditionHospitals} style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                <Search size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '48px', borderRadius: '10px', height: '42px', fontSize: '13px' }}
                  placeholder={speechLang === 'ta-IN' ? "Enter disease (e.g. காய்ச்சல், தோல் பிரச்சனை, காது வலி, மூட்டு வலி)..." : "Enter disease or health concern... (e.g. Fever, skin problem, ear problem, joint pain)"}
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                />

                {/* Microphone Voice Search Button inside input */}
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  title={isListening ? "Listening... Speak now" : `Click to speak (${speechLang === 'ta-IN' ? 'Tamil' : 'English'})`}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isListening ? '#d94a4a' : '#eef7f8',
                    color: isListening ? '#fff' : 'var(--teal)',
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isListening ? '0 0 0 4px rgba(217, 74, 74, 0.25)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isListening ? <Volume2 size={16} className="pulse" /> : <Mic size={16} />}
                </button>
              </div>

              <button type="submit" className="btn" style={{ height: '42px', padding: '0 20px', borderRadius: '10px', fontSize: '13px' }}>
                <Stethoscope size={15} /> Find Hospitals
              </button>

              {activeConditionResult && (
                <button
                  type="button"
                  className="btn ghost"
                  style={{ height: '42px', borderRadius: '10px', fontSize: '12px' }}
                  onClick={handleClearConditionSearch}
                >
                  Clear Search
                </button>
              )}
            </div>
          </form>

          {/* Listening Active Badge */}
          {isListening && (
            <div style={{ marginTop: '10px', background: '#fdf1f1', border: '1px solid #f7d4d4', color: '#d94a4a', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MicOff size={15} />
              <span>Listening in <b>{speechLang === 'ta-IN' ? 'Tamil (தமிழ்)' : 'English'}</b>... Speak your health concern (e.g., "காய்ச்சல்" or "Fever").</span>
            </div>
          )}

          {/* Microphone Permission / Error Message */}
          {speechError && (
            <div style={{ marginTop: '10px', background: '#fdf1f1', border: '1px solid #f7d4d4', color: '#d94a4a', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} style={{ flex: '0 0 15px' }} />
              <span>{speechError}</span>
            </div>
          )}

          {/* Quick Symptom / Specialist Chips (English + Tamil) */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: '12px', color: 'var(--ink-2)', fontWeight: 700 }}>
                🏥 Select Condition / Specialist:
              </span>
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                style={{
                  background: '#eef7f8',
                  border: '1px solid #cdeade',
                  color: 'var(--teal)',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {showAllCategories ? 'Show Less ▴' : '+ View All 18 Specialists (மேலும்) ▾'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {(showAllCategories ? SPECIALIST_CHIPS : SPECIALIST_CHIPS.filter(c => c.isPrimary)).map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  className="pill"
                  style={{
                    cursor: 'pointer',
                    border: conditionInput === chip.val ? '1.5px solid var(--teal)' : '1px solid var(--line)',
                    background: conditionInput === chip.val ? '#eef7f8' : '#fff',
                    color: conditionInput === chip.val ? 'var(--teal)' : 'var(--ink)',
                    fontSize: '11px',
                    padding: '5px 11px',
                    fontWeight: conditionInput === chip.val ? 700 : 500
                  }}
                  onClick={() => {
                    setConditionInput(chip.val);
                    const dept = mapConditionToDepartment(chip.val);
                    setActiveConditionResult({ condition: chip.val, department: dept });
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location status bar */}
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--ink-2)', background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '8px' }}>
            <span>{locationStatus || `📍 Search Location: ${selectedCity}`}</span>
            <button
              type="button"
              onClick={handleDetectLocation}
              style={{ color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            >
              <LocateFixed size={13} /> Detect My Location
            </button>
          </div>

          {/* Medical Disclaimer Note */}
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '11px', color: 'var(--ink-3)', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <Info size={14} color="var(--teal)" style={{ flex: '0 0 14px', marginTop: 1 }} />
            <span>
              <b>Note:</b> Voice search only helps find relevant hospital departments and does not provide a medical diagnosis.
            </span>
          </div>
        </div>

        {/* Condition Search Active Banner */}
        {activeConditionResult && (
          <div style={{ background: '#eef7f8', border: '1px solid #cdeade', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#4f7d6b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                RECOMMENDED NEARBY HOSPITALS
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
                Hospitals with <b>{activeConditionResult.department} Department</b> for "{activeConditionResult.condition}"
              </div>
            </div>
            <span className="badge on" style={{ fontSize: '11px' }}>Sorted by Nearest Distance</span>
          </div>
        )}

        {/* Existing Filters Bar */}
        <div className="filters">
          <div className="select">
            <MapPin size={14} className="pin" />
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          <div className="select">
            <select value={selectedDistance} onChange={(e) => setSelectedDistance(e.target.value)}>
              <option value="5 km">5 km</option>
              <option value="10 km">10 km</option>
              <option value="20 km">20 km</option>
              <option value="50 km">50 km</option>
            </select>
          </div>

          <div className="select">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="default">Sort by: Recommended</option>
              <option value="wait">Shortest Wait Time</option>
              <option value="rating">Highest Rating</option>
              <option value="distance">Nearest Distance</option>
            </select>
          </div>

          <button
            className="nearby-toggle"
            aria-pressed={nearbyOnly}
            onClick={() => setNearbyOnly(!nearbyOnly)}
          >
            <span className="switch"></span>
            <span className="t">Nearby</span>
            <MapPin size={13} color="#5b7085" />
          </button>
        </div>

        {/* Hospitals List */}
        <div className="list">
          {filtered.length === 0 ? (
            <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--line)' }}>
              <Building2 size={36} color="var(--ink-3)" style={{ marginBottom: '10px' }} />
              <div style={{ fontWeight: 600, fontSize: '15px' }}>No hospitals found</div>
              <div style={{ color: 'var(--ink-2)', fontSize: '12.5px', marginTop: '4px' }}>Try clearing filters or searching for another location.</div>
            </div>
          ) : (
            filtered.map((h) => (
              <div
                key={h.id}
                className={`hcard ${activeHospital && h.id === activeHospital.id ? 'active' : ''}`}
                onClick={() => setActiveHospitalId(h.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="thumb">
                  <svg viewBox="0 0 200 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                    <rect width="200" height="180" fill="#eaf3f9" />
                    <rect x="14" y="58" width="60" height="96" fill={h.tint} />
                    <rect x="78" y="34" width="72" height="120" fill={h.accent} opacity=".88" />
                    <rect x="154" y="72" width="34" height="82" fill={h.tint} opacity=".8" />
                    <rect x="96" y="124" width="36" height="30" fill="#f3f8fb" />
                  </svg>
                </div>

                <div className="hbody">
                  <div className="hname">
                    {h.name} <CheckCircle2 size={14} className="verified" />
                  </div>
                  <div className="rating">
                    <div className="stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} fill={h.rating >= i + 1 ? "var(--star)" : "none"} color="var(--star)" />
                      ))}
                    </div>
                    <span className="rate-txt">{h.rating.toFixed(1)}/5 ({h.reviews} reviews)</span>
                  </div>

                  <div className="meta">
                    <span><MapPin size={13} className="ic" /> {h.address}</span>
                    <span><Navigation size={13} className="ic" /> {h.distance}</span>
                  </div>

                  <div className="meta">
                    <span className="tel"><Phone size={13} className="ic" /> {h.phone}</span>
                    <span className="open"><Clock size={13} className="ic" /> Open {h.open} - {h.close}</span>
                  </div>

                  <div className="pills">
                    {h.depts.map((d) => {
                      const isMatchedDept = activeConditionResult && isDepartmentMatch([d], activeConditionResult.department);
                      return (
                        <span
                          key={d}
                          className="pill"
                          style={{
                            background: isMatchedDept ? '#0e7c86' : undefined,
                            color: isMatchedDept ? '#ffffff' : undefined,
                            fontWeight: isMatchedDept ? 700 : undefined
                          }}
                        >
                          {d} {isMatchedDept ? '✓' : ''}
                        </span>
                      );
                    })}
                    <span className="pill more">+{h.more} more</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn ghost"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      onClick={(e) => { e.stopPropagation(); setActiveHospitalId(h.id); }}
                    >
                      View Details
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      onClick={(e) => { e.stopPropagation(); onBookAppointment(h); }}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>

                <div className="hside">
                  <div className="wait">
                    <span className="lbl" style={{ display: 'block' }}>Waiting Time</span>
                    <span className="val" style={{ display: 'block' }}>{h.wait} mins</span>
                    <div className="queue">
                      <Users size={12} /> {h.queue} in queue
                    </div>
                  </div>
                  <ChevronRight className="chev-r" size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Right Column - Detail View Panel */}
      {activeHospital && (
        <aside className="detail">
          <div className="hero">
            <div className="img">
              <svg viewBox="0 0 200 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                <rect width="200" height="180" fill="#9db8cd" />
                <rect x="20" y="40" width="160" height="140" fill={activeHospital.accent} />
              </svg>
            </div>
            <div className="scrim" />
            <button className="hero-btn back" aria-label="Close details" onClick={() => setActiveHospitalId(null)}><ArrowLeft size={15} /></button>
            <button className="hero-btn fav" aria-label="Save"><Heart size={15} /></button>
            <div className="hero-text">
              <h2>{activeHospital.name} <CheckCircle2 size={16} color="#12a3ae" /></h2>
              <div className="rating">
                <span className="stars">★★★★★</span>
                <span className="rate-txt">{activeHospital.rating}/5 ({activeHospital.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <div className="quickbar">
            <div className="quick">
              <Clock size={17} color="var(--teal)" />
              <span>
                <span className="t" style={{ display: 'block' }}>Open</span>
                <span className="s" style={{ display: 'block' }}>{activeHospital.open} - {activeHospital.close}</span>
              </span>
            </div>
            <div className="quick">
              <Phone size={17} color="var(--teal)" />
              <span>
                <span className="t" style={{ display: 'block' }}>{activeHospital.phone}</span>
                <span className="s" style={{ display: 'block' }}>Call Line</span>
              </span>
            </div>
          </div>

          <div className="addr">
            <MapPin size={15} color="var(--teal)" />
            <span>{activeHospital.address}</span>
            <span className="link" style={{ cursor: 'pointer' }}>Map View</span>
          </div>

          <div className="alerts">
            <div className="alert ok">
              <Clock size={19} className="ic" />
              <div>
                <div className="lbl">Est. Wait Time</div>
                <div className="big">{activeHospital.wait}m</div>
                <div className="small">Based on live token movement</div>
              </div>
            </div>

            {activeHospital.alert ? (
              <div className="alert warn">
                <AlertTriangle size={19} className="ic" />
                <div>
                  <div className="lbl">{activeHospital.alert.title}</div>
                  <div className="small">{activeHospital.alert.text}</div>
                </div>
              </div>
            ) : (
              <div className="alert ok">
                <CheckCircle2 size={19} className="ic" />
                <div>
                  <div className="lbl">Normal OPD Flow</div>
                  <div className="small">Token movement on track</div>
                </div>
              </div>
            )}
          </div>

          <div className="sec">
            <div className="sec-head">
              <h3>Available Doctors ({activeHospital.doctors.length})</h3>
              <span className="link" style={{ cursor: 'pointer' }} onClick={() => onBookAppointment(activeHospital)}>
                Book Direct
              </span>
            </div>

            <div className="docs">
              {activeHospital.doctors.map((d) => (
                <div key={d.id} className="doc">
                  <div className="pic">
                    <svg viewBox="0 0 64 64" width="100%" height="100%">
                      <rect width="64" height="64" fill="#e4edf5" />
                      <circle cx="32" cy="26" r="12" fill={d.sex === 'f' ? '#e8bfa0' : '#dcae8c'} />
                    </svg>
                  </div>
                  <div>
                    <div className="n">{d.name}</div>
                    <div className="sp">{d.spec}</div>
                    <div className="rv">
                      <Star size={12} fill="var(--star)" color="var(--star)" /> {d.rating} ({d.reviewsCount})
                    </div>
                  </div>
                  <div className="right">
                    <span className={`badge ${d.available ? 'on' : 'off'}`}>
                      {d.available ? 'Available' : 'Busy'}
                    </span>
                    <div className="when">{d.when}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn ghost"
                        style={{ padding: '4px 8px', fontSize: '10.5px' }}
                        onClick={() => onOpenDoctorProfile(d)}
                      >
                        Profile
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '4px 8px', fontSize: '10.5px' }}
                        onClick={() => onBookAppointment(activeHospital, d)}
                      >
                        <Calendar size={12} /> Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
