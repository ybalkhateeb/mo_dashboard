import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Building2, Car, DollarSign, Home, Store, Ruler, TrendingUp, Calendar, Percent, ArrowUpRight, ArrowDownRight, Map, Layers } from 'lucide-react';

// Main Dashboard Component
// This is the primary component that renders the entire building project dashboard
export default function App() {
  // State management for interactive features
  const [activeTab, setActiveTab] = useState('siteplan');
  const [occupancyRate, setOccupancyRate] = useState(85);
  const [commercialRate, setCommercialRate] = useState(1200);
  const [residentialRate, setResidentialRate] = useState(1800);
  const [selectedFloor, setSelectedFloor] = useState('ground');
  const [hoveredArea, setHoveredArea] = useState(null);

  // Project financial and dimensional data
  // These values are based on the engineering office (A) proposal
  const projectData = {
    totalCost: 1650000,      // Total development cost in SAR (excluding land)
    landValue: 0,            // Land value not included
    buildingDimensions: { width: 16, depth: 25 },
    totalArea: 1000,         // Total built area in m²
    groundFloor: 400,        // Ground floor area in m²
    firstFloor: 400,         // First floor area in m²
    annex: 200,              // Annex area in m²
    northCorridor: 7,        // North corridor width in meters
    southCorridor: 2,        // South corridor width in meters
    parking: 30,             // Number of parking spaces
    setback: 22              // Rear setback in meters
  };

  // Land parcel dimensions
  const landData = {
    width: 25,               // East-West dimension in meters
    depth: 50.44,            // North-South dimension in meters
    buildingWidth: 16,
    buildingDepth: 25,
    northCorridorWidth: 7,
    southCorridorWidth: 2,
    rearSetback: 22,
    eastFrontage: 50,        // Eastern frontage
    westFrontage: 20         // Western frontage
  };

  // Unit configurations for commercial and residential spaces
  const units = {
    commercial: [
      { type: 'محل زاوي', count: 1, area: 50, depth: 15 },
      { type: 'محل وسط', count: 2, area: 45, depth: 15 }
    ],
    residential: [
      { type: 'جناح حشو', count: 6, area: 35 },
      { type: 'جناح زاوية', count: 4, area: 27.5 },
      { type: 'استوديو ملحق', count: 5, area: 32, hasRoof: true }
    ]
  };

  // Calculate unit totals
  const totalCommercialUnits = units.commercial.reduce((sum, u) => sum + u.count, 0);
  const totalResidentialUnits = units.residential.reduce((sum, u) => sum + u.count, 0);
  const totalUnits = totalCommercialUnits + totalResidentialUnits;

  const totalCommercialArea = units.commercial.reduce((sum, u) => sum + (u.count * u.area), 0);

  // Income calculations based on occupancy and rates
  const monthlyCommercialIncome = totalCommercialArea * (commercialRate / 12) * (occupancyRate / 100);
  const monthlyResidentialIncome = totalResidentialUnits * residentialRate * (occupancyRate / 100);
  const totalMonthlyIncome = monthlyCommercialIncome + monthlyResidentialIncome;
  const annualIncome = totalMonthlyIncome * 12;
  const annualYield = (annualIncome / projectData.totalCost) * 100;

  // Data for visualization charts
  const areaDistribution = [
    { name: 'الدور الأرضي', value: projectData.groundFloor, color: '#3B82F6' },
    { name: 'الدور الأول', value: projectData.firstFloor, color: '#10B981' },
    { name: 'الملحق', value: projectData.annex, color: '#F59E0B' }
  ];

  const incomeDistribution = [
    { name: 'تجاري', value: monthlyCommercialIncome, color: '#8B5CF6' },
    { name: 'سكني', value: monthlyResidentialIncome, color: '#EC4899' }
  ];

  const unitMix = [
    { name: 'محلات تجارية', count: totalCommercialUnits, color: '#3B82F6' },
    { name: 'أجنحة دور أول', count: 10, color: '#10B981' },
    { name: 'أجنحة ملحق', count: 5, color: '#F59E0B' }
  ];

  // 10-year financial projection with 3% annual growth
  const projectionData = Array.from({ length: 10 }, (_, i) => {
    const year = i + 1;
    const growthRate = 1 + (0.03 * i);
    return {
      year: `السنة ${year}`,
      income: Math.round(annualIncome * growthRate),
      cumulative: Math.round(annualIncome * ((Math.pow(1.03, year) - 1) / 0.03))
    };
  });

  // Reusable StatCard component for displaying key metrics
  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "blue" }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600' }
    };
    
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
            <Icon className={`w-5 h-5 ${colorClasses[color].text}`} />
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  };

  // Interactive Site Plan Component
  // This component renders an SVG visualization of the land plot and building
  const SitePlan = () => {
    const scale = 8;  // pixels per meter for scaling
    const streetWidth = 40;
    const svgWidth = 700;
    const svgHeight = 600;
    const padding = 60;
    
    // Calculate positions for all elements
    const landX = padding + streetWidth + 20;
    const landY = padding + streetWidth;
    const landW = landData.width * scale;
    const landH = landData.depth * scale;
    
    const buildingX = landX + (landData.northCorridorWidth * scale);
    const buildingY = landY;
    const buildingW = landData.buildingWidth * scale;
    const buildingH = landData.buildingDepth * scale;
    
    const parkingY = buildingY + buildingH;
    const parkingH = landData.rearSetback * scale;

    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">مخطط الموقع العام</h3>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              المقياس: 1 سم = {scale} م
            </span>
          </div>
        </div>
        
        <div className="overflow-auto">
          <svg width={svgWidth} height={svgHeight} className="mx-auto" style={{ direction: 'ltr' }}>
            {/* Background */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#f8fafc" />
            
            {/* North Street - شارع العشرين */}
            <rect x={landX - 20} y={padding - streetWidth} width={landW + 40} height={streetWidth} fill="#94a3b8" />
            <text x={landX + landW/2} y={padding - streetWidth/2 + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
              شارع العشرين (20م)
            </text>
            <text x={landX + landW/2} y={padding - streetWidth/2 + 20} textAnchor="middle" fill="#e2e8f0" fontSize="10">
              الشمال ↑
            </text>

            {/* South Street - شارع الخمسين */}
            <rect x={landX - 20} y={landY + landH} width={landW + 40} height={streetWidth} fill="#64748b" />
            <text x={landX + landW/2} y={landY + landH + streetWidth/2 + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
              شارع الخمسين (50م)
            </text>
            <text x={landX + landW/2} y={landY + landH + streetWidth/2 + 20} textAnchor="middle" fill="#e2e8f0" fontSize="10">
              الجنوب ↓
            </text>

            {/* West Neighbor */}
            <rect x={padding - 10} y={landY} width={streetWidth} height={landH} fill="#e2e8f0" stroke="#cbd5e1" />
            <text x={padding + 10} y={landY + landH/2} textAnchor="middle" fill="#64748b" fontSize="12" transform={`rotate(-90, ${padding + 10}, ${landY + landH/2})`}>
              جار (غرب)
            </text>

            {/* East Neighbor */}
            <rect x={landX + landW + 10} y={landY} width={streetWidth} height={landH} fill="#e2e8f0" stroke="#cbd5e1" />
            <text x={landX + landW + 30} y={landY + landH/2} textAnchor="middle" fill="#64748b" fontSize="12" transform={`rotate(90, ${landX + landW + 30}, ${landY + landH/2})`}>
              جار (شرق)
            </text>

            {/* Land Plot Boundary */}
            <rect 
              x={landX} 
              y={landY} 
              width={landW} 
              height={landH} 
              fill="#fef3c7" 
              stroke="#f59e0b" 
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* North Corridor - 7m wide */}
            <rect 
              x={landX} 
              y={landY} 
              width={landData.northCorridorWidth * scale} 
              height={buildingH} 
              fill="#dbeafe" 
              stroke="#3b82f6" 
              strokeWidth="1"
              onMouseEnter={() => setHoveredArea('northCorridor')}
              onMouseLeave={() => setHoveredArea(null)}
              className="cursor-pointer"
            />
            <text x={landX + (landData.northCorridorWidth * scale)/2} y={landY + buildingH/2 - 10} textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">
              الممر الشمالي
            </text>
            <text x={landX + (landData.northCorridorWidth * scale)/2} y={landY + buildingH/2 + 5} textAnchor="middle" fill="#1e40af" fontSize="11">
              7م
            </text>
            <text x={landX + (landData.northCorridorWidth * scale)/2} y={landY + buildingH/2 + 20} textAnchor="middle" fill="#3b82f6" fontSize="9">
              (مدخل السكان)
            </text>

            {/* Main Building */}
            <rect 
              x={buildingX} 
              y={buildingY} 
              width={buildingW} 
              height={buildingH} 
              fill={selectedFloor === 'ground' ? '#bfdbfe' : selectedFloor === 'first' ? '#bbf7d0' : '#fde68a'}
              stroke="#1e40af" 
              strokeWidth="3"
              onMouseEnter={() => setHoveredArea('building')}
              onMouseLeave={() => setHoveredArea(null)}
              className="cursor-pointer transition-colors"
            />
            
            {/* Floor-specific content */}
            {selectedFloor === 'ground' && (
              <>
                <line x1={buildingX} y1={buildingY + 15*scale} x2={buildingX + buildingW} y2={buildingY + 15*scale} stroke="#1e40af" strokeWidth="1" strokeDasharray="3,3" />
                <rect x={buildingX + 2} y={buildingY + 2} width={buildingW/3 - 4} height={15*scale - 4} fill="#93c5fd" stroke="#2563eb" rx="2" />
                <rect x={buildingX + buildingW/3 + 2} y={buildingY + 2} width={buildingW/3 - 4} height={15*scale - 4} fill="#93c5fd" stroke="#2563eb" rx="2" />
                <rect x={buildingX + 2*buildingW/3 + 2} y={buildingY + 2} width={buildingW/3 - 4} height={15*scale - 4} fill="#93c5fd" stroke="#2563eb" rx="2" />
                <text x={buildingX + buildingW/2} y={buildingY + 7*scale} textAnchor="middle" fill="#1e40af" fontSize="11" fontWeight="bold">
                  3 محلات تجارية
                </text>
                <text x={buildingX + buildingW/2} y={buildingY + 9*scale} textAnchor="middle" fill="#1e40af" fontSize="9">
                  (عمق 15م)
                </text>
              </>
            )}
            
            {selectedFloor === 'first' && (
              <>
                {[0, 1, 2, 3, 4].map((row) => (
                  <line key={row} x1={buildingX} y1={buildingY + (row * 5)*scale} x2={buildingX + buildingW} y2={buildingY + (row * 5)*scale} stroke="#16a34a" strokeWidth="1" strokeDasharray="2,2" />
                ))}
                <line x1={buildingX + buildingW/2} y1={buildingY} x2={buildingX + buildingW/2} y2={buildingY + buildingH} stroke="#16a34a" strokeWidth="1" strokeDasharray="2,2" />
                <text x={buildingX + buildingW/2} y={buildingY + buildingH/2 - 5} textAnchor="middle" fill="#166534" fontSize="11" fontWeight="bold">
                  10 أجنحة سكنية
                </text>
                <text x={buildingX + buildingW/2} y={buildingY + buildingH/2 + 10} textAnchor="middle" fill="#166534" fontSize="9">
                  (6 حشو + 4 زاوية)
                </text>
              </>
            )}

            {selectedFloor === 'annex' && (
              <>
                <text x={buildingX + buildingW/2} y={buildingY + buildingH/2 - 5} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold">
                  5 أجنحة ملحق
                </text>
                <text x={buildingX + buildingW/2} y={buildingY + buildingH/2 + 10} textAnchor="middle" fill="#92400e" fontSize="9">
                  (مع أسطح خاصة)
                </text>
              </>
            )}

            {/* South Corridor - 2m */}
            <rect 
              x={buildingX + buildingW} 
              y={buildingY} 
              width={landData.southCorridorWidth * scale} 
              height={buildingH} 
              fill="#fce7f3" 
              stroke="#ec4899" 
              strokeWidth="1"
            />
            <text x={buildingX + buildingW + (landData.southCorridorWidth * scale)/2} y={buildingY + buildingH/2} textAnchor="middle" fill="#be185d" fontSize="8" transform={`rotate(90, ${buildingX + buildingW + (landData.southCorridorWidth * scale)/2}, ${buildingY + buildingH/2})`}>
              ممر جنوبي 2م (تمديدات)
            </text>

            {/* Parking Area */}
            <rect 
              x={landX} 
              y={parkingY} 
              width={landW} 
              height={parkingH} 
              fill="#dcfce7" 
              stroke="#22c55e" 
              strokeWidth="2"
              onMouseEnter={() => setHoveredArea('parking')}
              onMouseLeave={() => setHoveredArea(null)}
              className="cursor-pointer"
            />
            
            {/* Parking Grid - 3 rows of 10 spaces */}
            {Array.from({ length: 10 }).map((_, i) => (
              <rect 
                key={`p1-${i}`}
                x={landX + 10 + (i * (landW - 20) / 10)} 
                y={parkingY + 20} 
                width={(landW - 20) / 10 - 5} 
                height={40} 
                fill="#86efac" 
                stroke="#22c55e"
                rx="2"
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <rect 
                key={`p2-${i}`}
                x={landX + 10 + (i * (landW - 20) / 10)} 
                y={parkingY + 80} 
                width={(landW - 20) / 10 - 5} 
                height={40} 
                fill="#86efac" 
                stroke="#22c55e"
                rx="2"
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <rect 
                key={`p3-${i}`}
                x={landX + 10 + (i * (landW - 20) / 10)} 
                y={parkingY + 140} 
                width={(landW - 20) / 10 - 5} 
                height={40} 
                fill="#86efac" 
                stroke="#22c55e"
                rx="2"
              />
            ))}
            
            <text x={landX + landW/2} y={parkingY + parkingH/2 + 30} textAnchor="middle" fill="#166534" fontSize="12" fontWeight="bold">
              المواقف الخلفية
            </text>
            <text x={landX + landW/2} y={parkingY + parkingH/2 + 50} textAnchor="middle" fill="#166534" fontSize="11">
              30 موقف (ارتداد 22م)
            </text>

            {/* Dimension Lines */}
            <line x1={landX} y1={landY - 15} x2={landX + landW} y2={landY - 15} stroke="#f59e0b" strokeWidth="2" />
            <text x={landX + landW/2} y={landY - 25} textAnchor="middle" fill="#d97706" fontSize="12" fontWeight="bold">
              25م (عرض الأرض)
            </text>

            <line x1={landX - 15} y1={landY} x2={landX - 15} y2={landY + landH} stroke="#f59e0b" strokeWidth="2" />
            <text x={landX - 25} y={landY + landH/2} textAnchor="middle" fill="#d97706" fontSize="11" fontWeight="bold" transform={`rotate(-90, ${landX - 25}, ${landY + landH/2})`}>
              50.44م (عمق الأرض)
            </text>

            <line x1={buildingX} y1={buildingY + buildingH + 15} x2={buildingX + buildingW} y2={buildingY + buildingH + 15} stroke="#1e40af" strokeWidth="2" />
            <text x={buildingX + buildingW/2} y={buildingY + buildingH + 30} textAnchor="middle" fill="#1e40af" fontSize="11" fontWeight="bold">
              16م (عرض العمارة)
            </text>

            <line x1={buildingX + buildingW + 25} y1={buildingY} x2={buildingX + buildingW + 25} y2={buildingY + buildingH} stroke="#1e40af" strokeWidth="2" />
            <text x={buildingX + buildingW + 40} y={buildingY + buildingH/2} textAnchor="middle" fill="#1e40af" fontSize="11" fontWeight="bold" transform={`rotate(90, ${buildingX + buildingW + 40}, ${buildingY + buildingH/2})`}>
              25م (عمق العمارة)
            </text>

            {/* North Arrow Compass */}
            <g transform={`translate(${svgWidth - 60}, 40)`}>
              <circle cx="20" cy="20" r="25" fill="white" stroke="#1e40af" strokeWidth="2" />
              <polygon points="20,5 15,25 20,20 25,25" fill="#1e40af" />
              <text x="20" y="42" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">N</text>
              <text x="20" y="54" textAnchor="middle" fill="#64748b" fontSize="9">شمال</text>
            </g>

            {/* Legend */}
            <g transform={`translate(20, ${svgHeight - 100})`}>
              <rect x="0" y="0" width="180" height="90" fill="white" stroke="#e2e8f0" rx="5" />
              <text x="90" y="18" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="bold">دليل الألوان</text>
              
              <rect x="10" y="28" width="15" height="12" fill="#bfdbfe" stroke="#1e40af" />
              <text x="30" y="38" fill="#374151" fontSize="9">العمارة</text>
              
              <rect x="90" y="28" width="15" height="12" fill="#dbeafe" stroke="#3b82f6" />
              <text x="110" y="38" fill="#374151" fontSize="9">الممرات</text>
              
              <rect x="10" y="48" width="15" height="12" fill="#dcfce7" stroke="#22c55e" />
              <text x="30" y="58" fill="#374151" fontSize="9">المواقف</text>
              
              <rect x="90" y="48" width="15" height="12" fill="#fef3c7" stroke="#f59e0b" strokeDasharray="2,2" />
              <text x="110" y="58" fill="#374151" fontSize="9">حدود الأرض</text>
              
              <rect x="10" y="68" width="15" height="12" fill="#94a3b8" />
              <text x="30" y="78" fill="#374151" fontSize="9">الشوارع</text>
              
              <rect x="90" y="68" width="15" height="12" fill="#e2e8f0" stroke="#cbd5e1" />
              <text x="110" y="78" fill="#374151" fontSize="9">الجيران</text>
            </g>
          </svg>
        </div>

        {/* Floor Selector Buttons */}
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => setSelectedFloor('ground')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedFloor === 'ground'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الدور الأرضي (تجاري)
          </button>
          <button
            onClick={() => setSelectedFloor('first')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedFloor === 'first'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الدور الأول (سكني)
          </button>
          <button
            onClick={() => setSelectedFloor('annex')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedFloor === 'annex'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الملحق
          </button>
        </div>

        {/* Hover Information Tooltip */}
        {hoveredArea && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            {hoveredArea === 'building' && 'العمارة: 16م × 25م = 400م² لكل دور'}
            {hoveredArea === 'northCorridor' && 'الممر الشمالي: 7م عرض - مدخل هادئ ومستقل للسكان، يعطي انطباعاً فندقياً'}
            {hoveredArea === 'parking' && 'المواقف الخلفية: 30 موقف في ارتداد 22م - كافية لمنع الوقوف أمام المحلات'}
          </div>
        )}
      </div>
    );
  };

  // Floor Plan Component for individual floor layouts
  const FloorPlan = ({ floor }) => {
    const scale = 10;
    const buildingW = 16 * scale;
    const buildingH = 25 * scale;
    const padding = 40;

    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">
            {floor === 'ground' ? 'مسقط الدور الأرضي' : floor === 'first' ? 'مسقط الدور الأول' : 'مسقط الملحق'}
          </h3>
        </div>

        <svg width={buildingW + padding * 2} height={buildingH + padding * 2} className="mx-auto">
          <rect x={padding} y={padding} width={buildingW} height={buildingH} fill="white" stroke="#1e40af" strokeWidth="3" />

          {floor === 'ground' && (
            <>
              <line x1={padding} y1={padding + 15*scale} x2={padding + buildingW} y2={padding + 15*scale} stroke="#1e40af" strokeWidth="2" />
              
              <rect x={padding + 2} y={padding + 2} width={buildingW/3 - 4} height={15*scale - 4} fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" />
              <text x={padding + buildingW/6} y={padding + 7*scale} textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">محل 1</text>
              <text x={padding + buildingW/6} y={padding + 9*scale} textAnchor="middle" fill="#3b82f6" fontSize="9">50م²</text>

              <rect x={padding + buildingW/3 + 2} y={padding + 2} width={buildingW/3 - 4} height={15*scale - 4} fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" />
              <text x={padding + buildingW/2} y={padding + 7*scale} textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">محل 2</text>
              <text x={padding + buildingW/2} y={padding + 9*scale} textAnchor="middle" fill="#3b82f6" fontSize="9">45م²</text>

              <rect x={padding + 2*buildingW/3 + 2} y={padding + 2} width={buildingW/3 - 4} height={15*scale - 4} fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" />
              <text x={padding + 5*buildingW/6} y={padding + 7*scale} textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">محل 3</text>
              <text x={padding + 5*buildingW/6} y={padding + 9*scale} textAnchor="middle" fill="#3b82f6" fontSize="9">45م²</text>

              <rect x={padding + 2} y={padding + 15*scale + 2} width={buildingW - 4} height={10*scale - 4} fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" />
              <text x={padding + buildingW/2} y={padding + 20*scale} textAnchor="middle" fill="#6b7280" fontSize="10">خدمات ومستودعات</text>

              <text x={padding - 25} y={padding + 7.5*scale} textAnchor="middle" fill="#1e40af" fontSize="10" transform={`rotate(-90, ${padding - 25}, ${padding + 7.5*scale})`}>15م</text>
              <text x={padding + buildingW/2} y={padding + buildingH + 20} textAnchor="middle" fill="#1e40af" fontSize="10">16م</text>
            </>
          )}

          {floor === 'first' && (
            <>
              <rect x={padding + buildingW/2 - 10} y={padding} width={20} height={buildingH} fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
              <text x={padding + buildingW/2} y={padding + buildingH/2} textAnchor="middle" fill="#d97706" fontSize="8" transform={`rotate(90, ${padding + buildingW/2}, ${padding + buildingH/2})`}>ممر 2م</text>

              {[0, 1, 2, 3, 4].map((i) => (
                <React.Fragment key={`left-${i}`}>
                  <rect x={padding + 2} y={padding + 2 + i * 5 * scale} width={buildingW/2 - 14} height={5*scale - 4} fill="#dcfce7" stroke="#22c55e" strokeWidth="1" />
                  <text x={padding + buildingW/4 - 5} y={padding + 2.5*scale + i * 5 * scale} textAnchor="middle" fill="#166534" fontSize="9">
                    {i < 3 ? `جناح حشو ${35}م²` : `جناح زاوية ${27.5}م²`}
                  </text>
                </React.Fragment>
              ))}

              {[0, 1, 2, 3, 4].map((i) => (
                <React.Fragment key={`right-${i}`}>
                  <rect x={padding + buildingW/2 + 12} y={padding + 2 + i * 5 * scale} width={buildingW/2 - 14} height={5*scale - 4} fill="#dcfce7" stroke="#22c55e" strokeWidth="1" />
                  <text x={padding + 3*buildingW/4 + 5} y={padding + 2.5*scale + i * 5 * scale} textAnchor="middle" fill="#166534" fontSize="9">
                    {i < 3 ? `جناح حشو ${35}م²` : `جناح زاوية ${27.5}م²`}
                  </text>
                </React.Fragment>
              ))}
            </>
          )}

          {floor === 'annex' && (
            <>
              {[0, 1, 2, 3, 4].map((i) => (
                <React.Fragment key={`annex-${i}`}>
                  <rect x={padding + 2 + i * (buildingW/5)} y={padding + 2} width={buildingW/5 - 4} height={buildingH * 0.6} fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                  <text x={padding + buildingW/10 + i * (buildingW/5)} y={padding + buildingH * 0.3} textAnchor="middle" fill="#92400e" fontSize="9">جناح {i+1}</text>
                  <text x={padding + buildingW/10 + i * (buildingW/5)} y={padding + buildingH * 0.4} textAnchor="middle" fill="#b45309" fontSize="8">32م²</text>
                  
                  <rect x={padding + 2 + i * (buildingW/5)} y={padding + buildingH * 0.6 + 5} width={buildingW/5 - 4} height={buildingH * 0.35} fill="#fde68a" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
                  <text x={padding + buildingW/10 + i * (buildingW/5)} y={padding + buildingH * 0.8} textAnchor="middle" fill="#92400e" fontSize="8">سطح خاص</text>
                </React.Fragment>
              ))}
            </>
          )}
        </svg>
      </div>
    );
  };

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6" dir="rtl">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مشروع إنشاء عمارة - الخيار (أ)</h1>
            <p className="text-sm text-gray-500">لوحة التحكم والمخططات التفصيلية</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'siteplan', label: 'مخطط الموقع', icon: Map },
          { id: 'floors', label: 'المساقط', icon: Layers },
          { id: 'overview', label: 'نظرة عامة', icon: Building2 },
          { id: 'financial', label: 'التحليل المالي', icon: DollarSign },
          { id: 'units', label: 'الوحدات', icon: Home },
          { id: 'simulator', label: 'محاكي الدخل', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Site Plan Tab */}
      {activeTab === 'siteplan' && (
        <div className="space-y-6">
          <SitePlan />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">مساحة الأرض</p>
              <p className="text-xl font-bold text-amber-600">{Math.round(landData.width * landData.depth)} م²</p>
              <p className="text-xs text-gray-400">25م × 50.44م</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">الواجهة الشرقية</p>
              <p className="text-xl font-bold text-blue-600">50م شرقاً</p>
              <p className="text-xs text-gray-400">نافذة تجارية</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">الواجهة الغربية</p>
              <p className="text-xl font-bold text-green-600">20م غرباً</p>
              <p className="text-xs text-gray-400">مدخل سكني</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">العمق</p>
              <p className="text-xl font-bold text-purple-600">50.44م</p>
              <p className="text-xs text-gray-400">شمال-جنوب</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">الشوارع المحيطة</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-slate-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">↑</span>
                  <span className="font-semibold">شارع العشرين (شمال)</span>
                </div>
                <p className="text-sm text-gray-600">عرض 20م - الواجهة السكنية تطل عليه، يخدم كمدخل هادئ للسكان عبر الممر الشمالي 7م</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-r-4 border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">↓</span>
                  <span className="font-semibold">شارع الخمسين (جنوب)</span>
                </div>
                <p className="text-sm text-gray-600">عرض 50م - الواجهة التجارية الرئيسية، حركة مرور عالية، رؤية ممتازة للمحلات</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floor Plans Tab */}
      {activeTab === 'floors' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <FloorPlan floor="ground" />
            <FloorPlan floor="first" />
            <FloorPlan floor="annex" />
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">ملخص الأدوار</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الدور</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الاستخدام</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">المساحة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">عدد الوحدات</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="py-3 px-4 font-medium">الأرضي</td>
                    <td className="py-3 px-4">تجاري</td>
                    <td className="py-3 px-4">400 م²</td>
                    <td className="py-3 px-4">3 محلات</td>
                    <td className="py-3 px-4 text-gray-500">عمق 15م لكل محل</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-green-50">
                    <td className="py-3 px-4 font-medium">الأول</td>
                    <td className="py-3 px-4">سكني</td>
                    <td className="py-3 px-4">400 م²</td>
                    <td className="py-3 px-4">10 أجنحة</td>
                    <td className="py-3 px-4 text-gray-500">جناحين بعمق 7م لكل منهما + ممر 2م</td>
                  </tr>
                  <tr className="hover:bg-amber-50">
                    <td className="py-3 px-4 font-medium">الملحق</td>
                    <td className="py-3 px-4">سكني</td>
                    <td className="py-3 px-4">200 م²</td>
                    <td className="py-3 px-4">5 أجنحة</td>
                    <td className="py-3 px-4 text-gray-500">كل وحدة بسطح خاص</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-3 px-4">الإجمالي</td>
                    <td className="py-3 px-4">مختلط</td>
                    <td className="py-3 px-4">1,000 م²</td>
                    <td className="py-3 px-4">18 وحدة</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} title="تكلفة التطوير" value="1.65 مليون" subtitle="غير شامل قيمة الأرض" color="blue" />
            <StatCard icon={Ruler} title="إجمالي المسطحات" value="1,000 م²" subtitle="أرضي + أول + ملحق" color="green" />
            <StatCard icon={Home} title="إجمالي الوحدات" value={`${totalUnits} وحدة`} subtitle={`${totalCommercialUnits} تجاري + ${totalResidentialUnits} سكني`} color="purple" />
            <StatCard icon={Car} title="المواقف" value="30 موقف" subtitle="ارتداد 22م" color="amber" />
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">أبعاد المبنى</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">16م</p>
                <p className="text-sm text-gray-600 mt-1">العرض</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">25م</p>
                <p className="text-sm text-gray-600 mt-1">العمق</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">7م</p>
                <p className="text-sm text-gray-600 mt-1">الممر الشمالي</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">2م</p>
                <p className="text-sm text-gray-600 mt-1">الممر الجنوبي</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">توزيع المسطحات</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={areaDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}م²`}>
                    {areaDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} م²`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">مزيج الوحدات</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={unitMix} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {unitMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">مميزات التصميم</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'الواجهة التجارية بانحناء انسيابي يزيد زاوية الرؤية',
                'فصل حركة السكان عن المتسوقين',
                'ممر 7م يعطي انطباعاً فندقياً',
                'تمديدات السباكة والتكييف في الارتداد للصيانة السهلة',
                'شرفات غائرة للظل والخصوصية',
                'أبواب الوحدات غير متقابلة للخصوصية',
                'أسطح خاصة لوحدات الملحق',
                'مواقف خلفية كافية (30 موقف)'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} title="الدخل الشهري المتوقع" value={`${Math.round(totalMonthlyIncome).toLocaleString()} ريال`} subtitle={`بنسبة إشغال ${occupancyRate}%`} color="green" />
            <StatCard icon={Calendar} title="الدخل السنوي" value={`${Math.round(annualIncome).toLocaleString()} ريال`} color="blue" />
            <StatCard icon={Percent} title="العائد السنوي" value={`${annualYield.toFixed(1)}%`} subtitle="من تكلفة التطوير" color="purple" trend={annualYield > 8 ? 12 : -5} />
            <StatCard icon={TrendingUp} title="فترة الاسترداد" value={`${(projectData.totalCost / annualIncome).toFixed(1)} سنة`} color="amber" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">توزيع الدخل الشهري</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={incomeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${Math.round(value).toLocaleString()}`}>
                    {incomeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Math.round(value).toLocaleString()} ريال`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">الدخل التجاري</span>
                  <span className="font-semibold text-purple-600">{Math.round(monthlyCommercialIncome).toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-pink-50 rounded">
                  <span className="text-sm">الدخل السكني</span>
                  <span className="font-semibold text-pink-600">{Math.round(monthlyResidentialIncome).toLocaleString()} ريال</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">التوقعات لـ 10 سنوات</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} ريال`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="الدخل السنوي" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="cumulative" name="الدخل التراكمي" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">تفصيل التكاليف المتوقعة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">البند</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">التكلفة التقريبية</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: 'الهيكل الإنشائي', cost: 500000, percent: 30 },
                    { item: 'التشطيبات الداخلية', cost: 400000, percent: 24 },
                    { item: 'الكهرباء والسباكة', cost: 250000, percent: 15 },
                    { item: 'التكييف', cost: 200000, percent: 12 },
                    { item: 'الواجهات', cost: 150000, percent: 9 },
                    { item: 'المصاعد والدرج', cost: 100000, percent: 6 },
                    { item: 'احتياطي', cost: 50000, percent: 4 }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{row.item}</td>
                      <td className="py-3 px-4 font-medium">{row.cost.toLocaleString()} ريال</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.percent}%` }}></div>
                          </div>
                          <span className="text-gray-500">{row.percent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-3 px-4">الإجمالي</td>
                    <td className="py-3 px-4">1,650,000 ريال</td>
                    <td className="py-3 px-4">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Units Tab */}
      {activeTab === 'units' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">الوحدات التجارية</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{totalCommercialUnits} وحدات</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {units.commercial.map((unit, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-gray-800">{unit.type}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{unit.count}x</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">المساحة</span>
                      <span className="font-medium">{unit.area} م²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">العمق</span>
                      <span className="font-medium">{unit.depth} م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الإيجار المتوقع</span>
                      <span className="font-medium text-green-600">{Math.round(unit.area * commercialRate / 12).toLocaleString()} ريال/شهر</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>الشريحة المستهدفة:</strong> بوفية، بقالة، مغسلة - أنشطة تخدم السكان والمارة
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">الوحدات السكنية</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{totalResidentialUnits} وحدة</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {units.residential.map((unit, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-gray-800">{unit.type}</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">{unit.count}x</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">المساحة</span>
                      <span className="font-medium">{unit.area} م²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الإيجار الشهري</span>
                      <span className="font-medium text-green-600">{residentialRate.toLocaleString()} ريال</span>
                    </div>
                    {unit.hasRoof && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <span>✨</span>
                        <span>سطح خاص</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>نمط التأجير:</strong> شهري ويومي - مرونة في استهداف شرائح مختلفة
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-4">ملخص الوحدات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{totalUnits}</p>
                <p className="text-blue-100 text-sm">إجمالي الوحدات</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{totalCommercialArea + 15 * totalResidentialUnits}</p>
                <p className="text-blue-100 text-sm">م² قابلة للتأجير</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{Math.round(totalMonthlyIncome).toLocaleString()}</p>
                <p className="text-blue-100 text-sm">ريال/شهر</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{annualYield.toFixed(1)}%</p>
                <p className="text-blue-100 text-sm">عائد سنوي</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">محاكي الدخل التفاعلي</h3>
            <p className="text-sm text-gray-500 mb-6">قم بتعديل المتغيرات لرؤية تأثيرها على العائد</p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">نسبة الإشغال</label>
                  <span className="text-sm font-bold text-blue-600">{occupancyRate}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">إيجار المتر التجاري (سنوياً)</label>
                  <span className="text-sm font-bold text-purple-600">{commercialRate} ريال</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="2000"
                  step="100"
                  value={commercialRate}
                  onChange={(e) => setCommercialRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>800 ريال</span>
                  <span>2000 ريال</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">إيجار الوحدة السكنية (شهرياً)</label>
                  <span className="text-sm font-bold text-pink-600">{residentialRate} ريال</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3000"
                  step="100"
                  value={residentialRate}
                  onChange={(e) => setResidentialRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1200 ريال</span>
                  <span>3000 ريال</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
              <p className="text-green-100 text-sm">الدخل الشهري</p>
              <p className="text-2xl font-bold mt-1">{Math.round(totalMonthlyIncome).toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-1">ريال</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
              <p className="text-blue-100 text-sm">الدخل السنوي</p>
              <p className="text-2xl font-bold mt-1">{Math.round(annualIncome).toLocaleString()}</p>
              <p className="text-blue-100 text-xs mt-1">ريال</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
              <p className="text-purple-100 text-sm">العائد السنوي</p>
              <p className="text-2xl font-bold mt-1">{annualYield.toFixed(1)}%</p>
              <p className="text-purple-100 text-xs mt-1">من التكلفة</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
              <p className="text-amber-100 text-sm">الاسترداد</p>
              <p className="text-2xl font-bold mt-1">{(projectData.totalCost / annualIncome).toFixed(1)}</p>
              <p className="text-amber-100 text-xs mt-1">سنة</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">سيناريوهات مقارنة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">السيناريو</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الإشغال</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الدخل الشهري</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">العائد</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'متحفظ', occ: 70, commRate: 1000, resRate: 1500 },
                    { name: 'متوسط', occ: 85, commRate: 1200, resRate: 1800 },
                    { name: 'متفائل', occ: 95, commRate: 1500, resRate: 2200 }
                  ].map((scenario, i) => {
                    const commIncome = totalCommercialArea * (scenario.commRate / 12) * (scenario.occ / 100);
                    const resIncome = totalResidentialUnits * scenario.resRate * (scenario.occ / 100);
                    const total = commIncome + resIncome;
                    const yld = ((total * 12) / projectData.totalCost) * 100;
                    return (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{scenario.name}</td>
                        <td className="py-3 px-4">{scenario.occ}%</td>
                        <td className="py-3 px-4">{Math.round(total).toLocaleString()} ريال</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            yld > 10 ? 'bg-green-100 text-green-700' : 
                            yld > 7 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {yld.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>البيانات مبنية على الفكرة التصميمية من المكتب الهندسي (أ)</p>
        <p className="mt-1">الأرقام تقديرية وتحتاج للتحقق من السوق المحلي</p>
      </div>
    </div>
  );
}
