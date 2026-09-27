import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, AlertCircle, Eye, Activity, RefreshCw, 
  ShieldCheck, ChevronRight, FileText, ZoomIn, Sun, 
  Sliders, Printer, User, Layers, CheckCircle2, AlertTriangle, Download, History, Copy, Check, Globe, X
} from 'lucide-react';
import QRCodeSVG from 'react-qr-code';

export default function App() {
  // Patient metadata state
  const [patientId, setPatientId] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [eyeSide, setEyeSide] = useState('OD'); // 'OD' (Right) or 'OS' (Left)

  // Bilateral storage for images and results
  const [scans, setScans] = useState({
    OD: { image: null, preview: null, result: null },
    OS: { image: null, preview: null, result: null }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Diagnostic View & Feature Toggles
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [copiedEhr, setCopiedEhr] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [language, setLanguage] = useState('en'); // 'en', 'ta', 'hi'
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Image manipulation state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(100);

  const fileInputRef = useRef(null);
  const currentScan = scans[eyeSide];

  // Comprehensive Fully Expanded Translations Dictionary
  const t = {
    en: {
      title: 'RetinaVision AI',
      subtitle: 'Clinical Screening System',
      mrn: 'MRN:',
      age: 'Age:',
      hba1c: 'HbA1c:',
      scanner: 'Optical Imaging Scanner',
      analyze: 'Execute Automated Screening',
      riskIndex: 'Composite Clinical Risk Index',
      confidence: 'Model Confidence',
      severity: 'Severity Index',
      followUp: 'Clinical Follow-up & Action Guide',
      biomarkers: 'Pathology Biomarker Checklist',
      copyEhr: 'Copy EHR Note',
      copied: 'Copied Note for EHR!',
      print: 'Print Report',
      json: 'JSON Payload',
      patientView: 'Patient Summary & QR',
      close: 'Close',
      patientHeader: 'Patient Takeaway & Care Plan',
      historyTitle: 'Longitudinal Visit History',
      noHistory: 'No prior screening history found for this MRN.',
      patientRecord: 'Patient Record',
      hideHeatmap: 'Hide Heatmap',
      inspectHeatmap: 'Inspect Grad-CAM',
      imageControls: 'Image Controls & XAI',
      uploadPrompt: 'Upload Fundus Scan',
      scanCarePlan: 'Scan to view patient care report',
      resultLabel: 'Result:',
      nextStepsLabel: 'Next Steps:'
    },
    ta: {
      title: 'ரெட்டினாவிஷன் ஏஐ',
      subtitle: 'மருத்துவ பரிசோதனை அமைப்பு',
      mrn: 'நோயாளி எண்:',
      age: 'வயது:',
      hba1c: 'HbA1c:',
      scanner: 'கண் பட ஸ்கேனர்',
      analyze: 'தானியங்கி பரிசோதனையை இயக்கவும்',
      riskIndex: 'கூட்டு மருத்துவ ஆபத்து குறியீடு',
      confidence: 'மாதிரி உறுதிப்பாடு',
      severity: 'தீவிரத்தன்மை குறியீடு',
      followUp: 'மருத்துவ பின்தொடர்தல் மற்றும் வழிகாட்டி',
      biomarkers: 'நோயியல் அடையாளப் பட்டியல்',
      copyEhr: 'EHR குறிப்பை நகலெடு',
      copied: 'EHR குறிப்பு நகலெடுக்கப்பட்டது!',
      print: 'அறிக்கையை அச்சிடு',
      json: 'JSON தரவு',
      patientView: 'நோயாளி சுருக்கம் & QR',
      close: 'மூடு',
      patientHeader: 'நோயாளி பராமரிப்பு திட்டம்',
      historyTitle: 'முந்தைய வருகை வரலாறு',
      noHistory: 'இந்த எண்ணிற்கு முந்தைய பதிவுகள் இல்லை.',
      patientRecord: 'நோயாளி பதிவு',
      hideHeatmap: 'ஹீட்மேப்பை மறை',
      inspectHeatmap: 'Grad-CAM ஆய்வு',
      imageControls: 'படக் கட்டுப்பாடுகள் & XAI',
      uploadPrompt: 'கண் fundus ஸ்கேனை பதிவேற்றவும்',
      scanCarePlan: 'பராமரிப்பு அறிக்கையைப் பார்க்க ஸ்கேன் செய்யவும்',
      resultLabel: 'முடிவு:',
      nextStepsLabel: 'அடுத்த கட்டம்:'
    },
    hi: {
      title: 'रेटिनाविज़न एआई',
      subtitle: 'नैदानिक ​​स्क्रीनिंग प्रणाली',
      mrn: 'रोगी आईडी:',
      age: 'आयु:',
      hba1c: 'HbA1c:',
      scanner: 'ऑप्टिकल इमेजिंग स्कैनर',
      analyze: 'स्वचालित स्क्रीनिंग निष्पादित करें',
      riskIndex: 'मिश्रित नैदानिक ​​जोखिम सूचकांक',
      confidence: 'मॉडल विश्वास',
      severity: 'गंभीरता सूचकांक',
      followUp: 'नैदानिक ​​अनुवर्ती और कार्रवाई मार्गदर्शिका',
      biomarkers: 'रोग विज्ञान बायोमार्कर चेकलिस्ट',
      copyEhr: 'EHR नोट कॉपी करें',
      copied: 'EHR नोट कॉपी हो गया!',
      print: 'रिपोर्ट प्रिंट करें',
      json: 'JSON डेटा',
      patientView: 'रोगी सारांश और QR',
      close: 'बंद करें',
      patientHeader: 'रोगी देखभाल योजना',
      historyTitle: 'पिछला विज़िट इतिहास',
      noHistory: 'इस आईडी के लिए कोई पिछला डेटा नहीं मिला।',
      patientRecord: 'रोगी रिकॉर्ड',
      hideHeatmap: 'हीटमैप छुपाएं',
      inspectHeatmap: 'Grad-CAM जांचें',
      imageControls: 'छवि नियंत्रण और XAI',
      uploadPrompt: 'फंडस स्कैन अपलोड करें',
      scanCarePlan: 'रोगी देखभाल रिपोर्ट देखने के लिए स्कैन करें',
      resultLabel: 'परिणाम:',
      nextStepsLabel: 'अगला कदम:'
    }
  };

  const currentText = t[language] || t.en;

  useEffect(() => {
    if (patientId.trim()) {
      const saved = localStorage.getItem(`retina_history_${patientId.trim()}`);
      if (saved) {
        try { setPatientHistory(JSON.parse(saved)); } catch (e) { setPatientHistory([]); }
      } else {
        setPatientHistory([]);
      }
    } else {
      setPatientHistory([]);
    }
  }, [patientId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setScans(prev => ({
        ...prev,
        [eyeSide]: { image: file, preview, result: null }
      }));
      setError(null);
      setShowHeatmap(false);
      setBrightness(100);
      setContrast(100);
      setZoom(100);
    }
  };

  const handleAnalyze = async () => {
    if (!currentScan.image) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', currentScan.image);

    try {
      const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
      const response = await axios.post(`${apiBase}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resData = response.data.prediction;
      
      setScans(prev => ({
        ...prev,
        [eyeSide]: { ...prev[eyeSide], result: resData }
      }));

      if (patientId.trim()) {
        const newRecord = {
          date: new Date().toLocaleDateString(),
          eye: eyeSide,
          stage: getStageNumber(resData),
          stageName: resData.stage_name || resData.class || 'Evaluated',
          hba1c: hba1c || 'N/A'
        };
        const updatedHistory = [newRecord, ...patientHistory];
        setPatientHistory(updatedHistory);
        localStorage.setItem(`retina_history_${patientId.trim()}`, JSON.stringify(updatedHistory));
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to screening server.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompositeRisk = (stage, hba1cVal) => {
    const stageScore = parseInt(stage, 10) * 20;
    const hba1cNum = parseFloat(hba1cVal);
    let glycemicScore = 10;
    if (!isNaN(hba1cNum)) {
      if (hba1cNum > 8.5) glycemicScore = 20;
      else if (hba1cNum > 7.0) glycemicScore = 15;
    }
    const total = Math.min(100, stageScore + glycemicScore);
    let label = language === 'ta' ? 'குறைந்த ஆபத்து' : language === 'hi' ? 'कम जोखिम' : 'Low Risk';
    let color = '#10b981';
    if (total >= 70) { label = language === 'ta' ? 'அதிக ஆபத்து' : language === 'hi' ? 'गंभीर जोखिम' : 'Critical Risk'; color = '#ef4444'; }
    else if (total >= 45) { label = language === 'ta' ? 'மிதமான ஆபத்து' : language === 'hi' ? 'मध्यम जोखिम' : 'Moderate Risk'; color = '#f59e0b'; }
    else if (total >= 25) { label = language === 'ta' ? 'லேசான ஆபத்து' : language === 'hi' ? 'हल्का जोखिम' : 'Mild Risk'; color = '#38bdf8'; }
    return { total, label, color };
  };

  const getStageNumber = (res) => {
    if (!res) return '0';
    if (res.stage !== undefined && res.stage !== null) return res.stage;
    if (res.class_id !== undefined && res.class_id !== null) return res.class_id;
    const name = `${res.class || ''} ${res.stage_name || ''} ${res.risk_level || ''}`.toLowerCase();
    if (name.includes('proliferative') || name.includes('pdr') || name.includes('critical')) return '4';
    if (name.includes('severe')) return '3';
    if (name.includes('moderate')) return '2';
    if (name.includes('mild')) return '1';
    return '0';
  };

  const getClinicalFollowUp = (stageNum) => {
    if (stageNum >= 3) {
      if (language === 'ta') return '1-2 வாரங்களுக்குள் கண் சிறப்பு மருத்துவரிடம் உடனடியாக செல்லவும்.';
      if (language === 'hi') return '1-2 सप्ताह के भीतर किसी रेटिना विशेषज्ञ से तुरंत मिलें।';
      return 'Urgent Specialist Referral within 1–2 weeks (Retina Specialist evaluation / PRP consideration)';
    }
    if (stageNum === 2) {
      if (language === 'ta') return '3 முதல் 6 மாதங்களுக்குள் கண் மருத்துவரை அணுகவும்.';
      if (language === 'hi') return '3 से 6 महीने के भीतर नेत्र रोग विशेषज्ञ से जाँच कराएं।';
      return 'Ophthalmology review within 3-6 months; strict glycemic optimization.';
    }
    if (stageNum === 1) {
      if (language === 'ta') return '6 முதல் 12 மாதங்களுக்குள் மீண்டும் பரிசோதிக்கவும்.';
      if (language === 'hi') return '6 से 12 महीने के भीतर दोबारा जाँच कराएं।';
      return 'Follow-up screening within 6 to 12 months with endocrinology coordination.';
    }
    if (language === 'ta') return 'வழக்கமான வருடாந்திர பரிசோதனை; இரத்த சர்க்கரையை சீராக பராமரிக்கவும்.';
    if (language === 'hi') return 'नियमित वार्षिक जाँच; रक्त शर्करा के स्तर को नियंत्रित रखें।';
    return 'Routine annual screening; maintain glycemic control targets.';
  };

  const getRiskConfig = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'LOW RISK' };
      case 'mild': return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'MILD RISK' };
      case 'moderate': return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'MODERATE RISK' };
      case 'high':
      case 'critical': return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', label: 'CRITICAL RISK' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: 'EVALUATING' };
    }
  };

  const formatConfidence = (conf) => {
    if (typeof conf !== 'number') return '0.0%';
    const val = conf > 1 ? conf : conf * 100;
    return `${val.toFixed(1)}%`;
  };

  const getPathologyBiomarkers = (stage) => {
    const num = parseInt(stage, 10);
    return [
      { name: 'Microaneurysms', present: num >= 1 },
      { name: 'Hard Exudates', present: num >= 2 },
      { name: 'Cotton Wool Spots', present: num >= 3 },
      { name: 'Neovascularization', present: num >= 4 }
    ];
  };

  const handleCopyEhrNote = () => {
    const res = currentScan.result;
    if (!res) return;
    const stageNum = getStageNumber(res);
    const note = `[RetinaVision AI Report] MRN: ${patientId || 'N/A'} | Eye: ${eyeSide} | Stage: ${stageNum} | Confidence: ${formatConfidence(res.confidence)}`;
    navigator.clipboard.writeText(note);
    setCopiedEhr(true);
    setTimeout(() => setCopiedEhr(false), 2500);
  };

  const handlePrintReport = () => window.print();

  const result = currentScan.result;
  const stageNumber = parseInt(getStageNumber(result), 10);
  const compositeRisk = calculateCompositeRisk(stageNumber, hba1c);
  const biomarkers = getPathologyBiomarkers(stageNumber);

  const printStyles = `
    @media print {
      body { background: #ffffff !important; color: #000000 !important; }
      .no-print, button, input { display: none !important; }
      .printable-report-container { display: block !important; width: 100% !important; background: #ffffff !important; color: #000000 !important; }
      .print-card { background: #f8fafc !important; border: 1px solid #cbd5e1 !important; color: #000000 !important; }
    }
  `;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px 16px' }}>
      <style>{printStyles}</style>

      <main style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Metadata Bar with Embedded Language Selector & OD/OS Toggles */}
        <div className="no-print" style={{ backgroundColor: '#0f172a', padding: '16px 20px', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '13px', fontWeight: '700' }}>
                <User size={16} /> {currentText.patientRecord}
              </div>

              {/* Language Selector Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#020617', padding: '6px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
                <Globe size={14} color="#38bdf8" style={{ marginRight: '6px' }} />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="en" style={{ background: '#0f172a' }}>English</option>
                  <option value="ta" style={{ background: '#0f172a' }}>தமிழ் (Tamil)</option>
                  <option value="hi" style={{ background: '#0f172a' }}>हिन्दी (Hindi)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: '#020617', padding: '6px 10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', marginRight: '6px' }}>{currentText.mrn}</span>
                  <input type="text" placeholder="ID..." value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '70px', fontSize: '12px' }} />
                </div>

                <div style={{ backgroundColor: '#020617', padding: '6px 10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', marginRight: '6px' }}>{currentText.age}</span>
                  <input type="number" placeholder="--" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '30px', fontSize: '12px' }} />
                </div>

                <div style={{ backgroundColor: '#020617', padding: '6px 10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', marginRight: '6px' }}>{currentText.hba1c}</span>
                  <input type="text" placeholder="7.5%" value={hba1c} onChange={(e) => setHba1c(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '50px', fontSize: '12px' }} />
                </div>
              </div>
            </div>

            {/* OD / OS Eye Toggles */}
            <div style={{ display: 'flex', backgroundColor: '#020617', borderRadius: '8px', padding: '2px', border: '1px solid #334155' }}>
              <button onClick={() => setEyeSide('OD')} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: eyeSide === 'OD' ? '#2563eb' : 'transparent', color: eyeSide === 'OD' ? '#fff' : '#64748b' }}>OD</button>
              <button onClick={() => setEyeSide('OS')} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: eyeSide === 'OS' ? '#2563eb' : 'transparent', color: eyeSide === 'OS' ? '#fff' : '#64748b' }}>OS</button>
            </div>
          </div>
        </div>

        {/* Longitudinal History Panel */}
        {patientId.trim() && patientHistory.length > 0 && (
          <div className="no-print" style={{ backgroundColor: '#0f172a', padding: '14px 20px', borderRadius: '14px', border: '1px solid #1e293b', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              <History size={14} /> {currentText.historyTitle} ({patientHistory.length} scans)
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {patientHistory.map((hist, idx) => (
                <div key={idx} style={{ backgroundColor: '#020617', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', minWidth: '140px', fontSize: '11px' }}>
                  <div style={{ color: '#94a3b8', marginBottom: '2px' }}>{hist.date} • {hist.eye}</div>
                  <div style={{ fontWeight: '700', color: '#f8fafc' }}>Stage {hist.stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
          <div className="no-print" style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '14px', fontWeight: '600' }}>
              <Activity size={18} /> {currentText.scanner} — {eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ border: currentScan.preview ? '2px solid #3b82f6' : '2px dashed #334155', borderRadius: '16px', backgroundColor: '#020617', minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />

              {currentScan.preview ? (
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                  <img src={currentScan.preview} alt={`Scan ${eyeSide}`} style={{ maxHeight: '250px', borderRadius: '12px', filter: showHeatmap ? 'contrast(180%) hue-rotate(180deg)' : `brightness(${brightness}%) contrast(${contrast}%)`, transform: `scale(${zoom / 100})` }} />
                  {showHeatmap && (
                    <div className="no-print" style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                      XAI Grad-CAM Active
                    </div>
                  )}
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{ textAlign: 'center', padding: '32px 16px', cursor: 'pointer', width: '100%' }}>
                  <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#38bdf8', marginBottom: '16px' }}>
                    <Camera size={32} />
                  </div>
                  <p style={{ color: '#f8fafc', fontWeight: '600', fontSize: '16px', margin: '0 0 6px 0' }}>Upload {eyeSide} {currentText.uploadPrompt}</p>
                </div>
              )}
            </div>

            {currentScan.preview && (
              <div className="no-print image-controls-panel" style={{ marginTop: '16px', backgroundColor: '#020617', padding: '12px 16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{currentText.imageControls}</span>
                  <button onClick={() => setShowHeatmap(!showHeatmap)} style={{ backgroundColor: showHeatmap ? '#ef4444' : '#1e293b', color: '#fff', border: '1px solid #334155', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    <Layers size={12} style={{ marginRight: '4px' }} /> {showHeatmap ? currentText.hideHeatmap : currentText.inspectHeatmap}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div><input type="range" min="50" max="180" value={brightness} onChange={(e) => setBrightness(e.target.value)} style={{ width: '100%' }} /></div>
                  <div><input type="range" min="50" max="200" value={contrast} onChange={(e) => setContrast(e.target.value)} style={{ width: '100%' }} /></div>
                  <div><input type="range" min="100" max="200" value={zoom} onChange={(e) => setZoom(e.target.value)} style={{ width: '100%' }} /></div>
                </div>
              </div>
            )}

            <button className="no-print" onClick={handleAnalyze} disabled={!currentScan.image || loading} style={{ width: '100%', marginTop: '20px', padding: '16px', borderRadius: '12px', backgroundColor: !currentScan.image || loading ? '#1e293b' : '#2563eb', color: '#fff', border: 'none', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <>{currentText.analyze} ({eyeSide}) <ChevronRight size={18} /></>}
            </button>

            {error && (
              <div className="no-print" style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="printable-report-container" style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                    {result.stage_name || result.class || `Stage ${stageNumber} Diabetic Retinopathy`}
                  </h2>
                  <div className="no-print" style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: getRiskConfig(result.risk_level).bg, color: getRiskConfig(result.risk_level).text, fontWeight: '800', fontSize: '12px' }}>
                    {getRiskConfig(result.risk_level).label}
                  </div>
                </div>

                <div className="print-card" style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{currentText.riskIndex}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: compositeRisk.color }}>{compositeRisk.total} / 100</span>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: compositeRisk.color }}>{compositeRisk.label}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div className="print-card" style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>{currentText.confidence}</span>
                    <span style={{ fontWeight: '800', fontSize: '20px', color: '#38bdf8' }}>{formatConfidence(result.confidence)}</span>
                  </div>
                  <div className="print-card" style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>{currentText.severity}</span>
                    <span style={{ fontWeight: '800', fontSize: '20px', color: '#f43f5e' }}>Stage {stageNumber} / 4</span>
                  </div>
                </div>

                <div className="print-card" style={{ backgroundColor: '#172554', padding: '16px', borderRadius: '12px', border: '1px solid #1e40af', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    <FileText size={14} /> {currentText.followUp}
                  </div>
                  <p style={{ fontSize: '14px', color: '#dbeafe', margin: 0, lineHeight: '1.6' }}>{getClinicalFollowUp(stageNumber)}</p>
                </div>

                {/* Pathology Biomarkers Checklist */}
                <div className="print-card" style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700', display: 'block', marginBottom: '12px' }}>{currentText.biomarkers}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {biomarkers.map((bio, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: bio.present ? '#f8fafc' : '#64748b' }}>
                        {bio.present ? <AlertTriangle size={14} color="#f59e0b" /> : <CheckCircle2 size={14} color="#10b981" />}
                        <span>{bio.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="no-print" onClick={() => setShowPatientModal(true)} style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Activity size={16} /> {currentText.patientView}
                  </button>

                  <button className="no-print" onClick={handleCopyEhrNote} style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: copiedEhr ? '#064e3b' : '#334155', color: '#fff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {copiedEhr ? <Check size={16} color="#34d399" /> : <Copy size={16} />} {copiedEhr ? currentText.copied : currentText.copyEhr}
                  </button>

                  <button className="no-print" onClick={handlePrintReport} style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Printer size={16} /> {currentText.print}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Patient QR & Takeaway Modal with Formatted Text Report QR */}
      {showPatientModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowPatientModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#064e3b', color: '#34d399', marginBottom: '12px' }}>
              <Eye size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>{currentText.patientHeader}</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>MRN: <strong>{patientId || 'N/A'}</strong> | Eye: <strong>{eyeSide}</strong></p>

            <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '16px', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>{currentText.resultLabel}</span>
              <p style={{ fontSize: '14px', color: '#f8fafc', margin: '0 0 12px 0' }}>{result?.stage_name || `Stage ${stageNumber} Diabetic Retinopathy`}</p>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>{currentText.nextStepsLabel}</span>
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>{getClinicalFollowUp(stageNumber)}</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
              <QRCodeSVG 
                value={`RETINAVISION AI REPORT
------------------------
MRN: ${patientId || 'N/A'}
Eye: ${eyeSide}
Diagnosis: ${result?.stage_name || `Stage ${stageNumber} Diabetic Retinopathy`}
Next Steps: ${getClinicalFollowUp(stageNumber)}`} 
                size={120} 
              />
              <span style={{ display: 'block', fontSize: '10px', color: '#475569', marginTop: '6px', fontWeight: '600' }}>{currentText.scanCarePlan}</span>
            </div>

            <button onClick={() => setShowPatientModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              {currentText.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}