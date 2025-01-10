import { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import './App.css'
import ParticleBackground from './components/ParticleBackground'
import HelpChat from './components/HelpChat'

const formatIndianPrice = (number) => {
  const numStr = Math.round(number).toString()
  if (numStr.length <= 3) return numStr
  
  let lastThree = numStr.substring(numStr.length - 3)
  let remaining = numStr.substring(0, numStr.length - 3)
  if (remaining) {
    lastThree = ',' + lastThree
  }
  const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree
  return formatted
}

const RoundTo2Decimal = (number) => {
  return Math.round(number * 100) / 100
}

const roundToInteger = (number) => {
  return Math.ceil(number);
}

const InfoTooltip = ({ formula, description }) => (
  <span className="info-tooltip">
    ⓘ
    <div className="tooltip-content">
      {description && <p>{description}</p>}
      {formula && (
        <>
          <p><strong>Formula:</strong></p>
          <p>{formula}</p>
        </>
      )}
    </div>
  </span>
)

function App() {
  const [formData, setFormData] = useState({
    landholding: '',
    farmerCategory: '',
    croppingCycles: '1',
    croppingPattern: 'kharif',
    milkingCattle: '',
    milkYield: '5',
    useManualCosts: false,
    manualCosts: {
      shredding: '',
      bajrangBan: '',
      labor: '',
    },
    purchasedFodderPercentage: '',
    useManualEnzymeCosts: false,
    enzymeManualCosts: {
      shredding: '',
      bajrangBan: '',
      saltA: '',
      saltB: ''
    },
    annualIncome: '',
  })

  const [unitStates, setUnitStates] = useState({
    phrUnit: 'tonnes',
    fymUsedUnit: 'trolleys',
    fymGeneratedUnit: 'trolleys',
    fymPurchasedUnit: 'trolleys',
    dryFodderUnit: 'tonnes',
    purchasedFodderUnit: 'tonnes'
  })

  const [showDefaultsModal, setShowDefaultsModal] = useState(false)
  const [editingDefault, setEditingDefault] = useState(null)
  const [isBreakdownVisible, setIsBreakdownVisible] = useState(true)
  const [showReminder, setShowReminder] = useState(false)
  const [activeSection, setActiveSection] = useState('fym')
  const [displayUnit, setDisplayUnit] = useState('tonnes')

  const [defaults, setDefaults] = useState({
    residuePerCycle: 5, // tonnes
    fymPerCycle: 5, // tonnes
    fymPerCow: ((0.2 * 10) * 365) / 1000, // tonnes per cow per year
    trailerCost: 3000, // rupees
    trailerCapacity: 1.5, // tonnes
    tonnsPerTrolley: 1.5, //can be changed later
    transportCost: 0, // rupees
    storageCost: 0, // rupees
    dryFodderPerCow: 3.5, // kg per day
    milkDaysAnnually: 150,
    milkPricePerLiter: 35,
    dryFodderPricePerKg: 4.5,
    minMilkYieldIncrease: 0.4,
    saltAPrice: 219, // per kg
    saltBPrice: 310, // per kg
    bajrangBanPrice: 800, // per liter
    milkYieldIncreaseMin: 0.4,  // L per cow per day
    milkingDaysDefault: 150,  // days
  })

  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (activeSection === 'analytics' && chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext('2d')
      const directCO2 = calculateDirectCO2Avoided()
      const milkYieldCO2 = calculateMilkYieldCO2Avoided()

      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Direct CO₂ Avoided', 'CO₂ Avoided from Milk Yield'],
          datasets: [{
            data: [directCO2, milkYieldCO2],
            backgroundColor: [
              'rgba(46, 125, 50, 0.8)',  // Green
              'rgba(76, 175, 80, 0.8)'   // Light Green
            ],
            borderColor: [
              'rgba(46, 125, 50, 1)',
              'rgba(76, 175, 80, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 14
                }
              }
            },
            title: {
              display: true,
              text: `Total CO₂ Avoided: ${RoundTo2Decimal(calculateTotalCO2Avoided())} tonnes/year`,
              font: {
                size: 16,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 30
              }
            }
          }
        }
      })
    }
  }, [activeSection, formData.milkingCattle, formData.landholding, formData.croppingCycles])

  const handleUnitChange = (point, unit) => {
    setUnitStates(prev => ({
      ...prev,
      [point]: unit
    }))
  }

  const formatUnitValueForPoint = (tonnes, point) => {
    const unit = unitStates[point]
    const value = unit === 'tonnes' ? tonnes : convertToTrolleys(tonnes)
    return unit === 'tonnes' ? RoundTo2Decimal(value) : value
  }

  const getUnitLabelForPoint = (point) => {
    return unitStates[point]
  }

  const convertToTrolleys = (tonnes) => {
    return Math.round(tonnes / defaults.tonnsPerTrolley)
  }

  const formatUnitValue = (tonnes) => {
    const value = displayUnit === 'tonnes' ? tonnes : convertToTrolleys(tonnes)
    return RoundTo2Decimal(value)
  }

  const trolConv = () => {
    return (defaults.tonnsPerTrolley)
  }

  const getUnitLabel = () => {
    return displayUnit === 'tonnes' ? 'tonnes' : 'trolleys'
  }

  const calculateFarmerCategory = (landholding) => {
    if (landholding < 1) return "Marginal"
    if (landholding <= 2) return "Small"
    if (landholding <= 4) return "Small-Medium"
    return "Large"
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      if (name === 'landholding') {
        newData.farmerCategory = calculateFarmerCategory(Number(value))
      }
      return newData
    })
  }

  const getCroppingPatternOptions = () => {
    switch (formData.croppingCycles) {
      case '1':
        return ['kharif (monsoon)', 'rabi (winter)']
      case '2':
        return ['kharif_rabi', 'rabi_summer', 'kharif_summer']
      case '3':
        return ['kharif_rabi_summer']
      default:
        return []
    }
  }

  // Calculations
  const calculatePHR = () => {
    return Number(formData.croppingCycles) * 
           defaults.residuePerCycle * 
           Number(formData.landholding)
  }

  const calculateFYMUsed = () => {
    return (Number(formData.croppingCycles) * defaults.fymPerCycle * Number(formData.landholding))
  }

  const calculateFYMGenerated = () => {
    return (Number(formData.milkingCattle) * defaults.fymPerCow)
  }

  const calculateFYMPurchased = () => {
    return (calculateFYMUsed() - calculateFYMGenerated())
  }

  const calculateFYMCost = () => {
    const fymPurchased = calculateFYMPurchased()
    if (fymPurchased <= 0) return 0
    return ((fymPurchased * defaults.trailerCost) / defaults.trailerCapacity + 
           defaults.transportCost + defaults.storageCost)
  }

  const handleDefaultsChange = (key, value) => {
    setDefaults(prev => ({
      ...prev,
      [key]: Number(value)
    }))
  }

  const handleSaveDefaults = () => {
    setShowDefaultsModal(false)
  }

  const handleManualCostChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      manualCosts: {
        ...prev.manualCosts,
        [name]: value
      }
    }))
  }

  const calculateRawPHRRequired = () => {
    const fymPurchased = calculateFYMPurchased()
    return (fymPurchased * 3.5 * Number(formData.landholding)) / 5
  }

  const calculateShredding = () => {
    const rawPHR = calculateRawPHRRequired()
    const fymPurchased = calculateFYMPurchased()
    return (2500*0.7*fymPurchased)/(Number(formData.croppingCycles)*5)  // Fixed cost from Excel
  }

  const calculateBajrangBan = () => {
    const rawPHR = calculateRawPHRRequired()
    const fymPurchased = calculateFYMPurchased()
    return 800*0.7*fymPurchased  // Fixed cost from Excel
  }

  const calculateLabor = () => {
    const rawPHR = calculateRawPHRRequired()
    const fymPurchased = calculateFYMPurchased()
    return 1000*fymPurchased/5  // Fixed cost from Excel
  }

  const calculateTotalCost = () => {
    if (formData.useManualCosts) {
      const { shredding, bajrangBan, labor } = formData.manualCosts
      return Number(shredding || 0) + Number(bajrangBan || 0) + Number(labor || 0)
    }
    return calculateShredding() + calculateBajrangBan() + calculateLabor()
  }

  const calculateAvoidedCost = () => {
    const fymPurchaseCost = calculateFYMCost()
    const totalCost = calculateTotalCost()
    return fymPurchaseCost - totalCost
  }

  const calculateDryFodderRequirement = () => {
    return (Number(formData.milkingCattle) * defaults.dryFodderPerCow * 365) / 1000
  }

  const calculateTotalPurchasedFodder = () => {
    return (calculateDryFodderRequirement() * Number(formData.purchasedFodderPercentage)) / 100
  }

  const calculateFodderPurchaseCost = () => {
    return calculateTotalPurchasedFodder() * defaults.dryFodderPricePerKg * 1000
  }

  const calculatePHRLeftAfterCompost = () => {
    return calculateDryFodderRequirement() - calculateTotalPurchasedFodder()
  }

  const calculateShreddingCostFodder = () => {
    const costPerHectare = 2500
    return (costPerHectare * calculatePHRLeftAfterCompost()) / defaults.residuePerCycle
  }

  const calculateEnzymeRequirements = () => {
    const fodderToEnrich = calculateDryFodderRequirement()
    const litresEnzyme = (fodderToEnrich * 1000) / 4
    const kgDryPHR = litresEnzyme / 10
    const bajrangBanLitres = kgDryPHR / 1000
    return {
      litresEnzyme,
      bajrangBanLitres,
      saltAKg: (8.4 * litresEnzyme) / 1000,
      saltBKg: (1.4 * litresEnzyme) / 1000
    }
  }

  const calculateEnzymeTreatmentCost = () => {
    const shreddingCost = calculateShreddingCostFodder()
    const requirements = calculateEnzymeRequirements()
    
    const bajrangBanCost = requirements.bajrangBanLitres * defaults.bajrangBanPrice
    const saltACost = requirements.saltAKg * defaults.saltAPrice
    const saltBCost = requirements.saltBKg * defaults.saltBPrice
    
    return shreddingCost + bajrangBanCost + saltACost + saltBCost
  }

  const calculateIncreasedMilkRevenue = () => {
    return defaults.minMilkYieldIncrease * 
      Number(formData.milkingCattle) * 
      defaults.milkPricePerLiter * 
      defaults.milkDaysAnnually
  }

  const calculateOverallGain = () => {
    // Total value of dry fodder = Annual requirement × Price per kg × 1000
    const totalFodderValue = calculateDryFodderRequirement() * 
      defaults.dryFodderPricePerKg * 1000

    // Costs to subtract
    const fodderPurchaseCost = calculateFodderPurchaseCost()
    const enzymeTreatmentCost = calculateEnzymeTreatmentCost()

    // Revenue from increased milk yield
    const milkRevenue = calculateIncreasedMilkRevenue()

    // Overall gain = Total fodder value - (Purchase cost + Treatment cost) + Milk revenue
    return totalFodderValue - (fodderPurchaseCost + enzymeTreatmentCost) + milkRevenue
  }

  const isPreviousSectionComplete = () => {
    return formData.landholding && 
           formData.croppingCycles && 
           formData.croppingPattern && 
           formData.milkingCattle;
  }

  const handleEnzymeManualCostChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      enzymeManualCosts: {
        ...prev.enzymeManualCosts,
        [name]: value
      }
    }))
  }

  const calculateOverallGainPercentage = () => {
    if (!formData.annualIncome) return 0
    
    // Get avoided cost from point 12 (PHR compost)
    const avoidedCostPHR = calculateAvoidedCost()
    
    // Get overall gain from point 20 (fodder calculations)
    const overallGainFodder = calculateOverallGain()
    
    // Calculate percentage
    return (100 * (avoidedCostPHR + overallGainFodder)) / Number(formData.annualIncome)
  }

  const calculateRevenuePercentage = () => {
    if (!formData.annualIncome) return 0
    return (calculateIncreasedMilkRevenue() * 100) / Number(formData.annualIncome)
  }

  const calculateDirectCO2Avoided = () => {
    const tonCO2PertonPHR = (7190 /( 1000 * 5))
    const annualPHR = calculatePHR()
    return annualPHR * tonCO2PertonPHR
  }

  const calculateMilkYieldCO2Avoided = () => {
    const increasedYieldPerYear = defaults.milkYieldIncreaseMin * 
      defaults.milkingDaysDefault * 
      Number(formData.milkingCattle)
    
    return (increasedYieldPerYear * 3.4) / 1000
  }

  const calculateTotalCO2Avoided = () => {
    return calculateDirectCO2Avoided() + calculateMilkYieldCO2Avoided()
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const calculateCO2Analogies = (totalCO2) => {
    // Average tree absorbs about 22 kg CO2 per year
    const treesEquivalent = Math.round(totalCO2 * 1000 / 22)
    
    // Average car emits about 4.6 tonnes of CO2 per year
    const carsEquivalent = Math.round(totalCO2 / 4.6)
    
    // Average household emits about 7.5 tonnes of CO2 per year
    const householdsEquivalent = Math.round(totalCO2 / 7.5)
    
    return {
      trees: treesEquivalent,
      cars: carsEquivalent,
      households: householdsEquivalent
    }
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-top">
          <div className="logo-container">
            <img src="/vnit-logo.png" alt="VNIT Logo" className="vnit-logo" />
            <h2 className='vnit-logo-text'>Department of Chemical Engineering, VNIT</h2>
          </div>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${activeSection === 'fym' ? 'active' : ''}`}
            onClick={() => setActiveSection('fym')}
          >
            FYM Calculations
          </button>
          <button 
            className={`nav-link ${activeSection === 'fodder' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('fodder')
              if (!isPreviousSectionComplete()) {
                setShowReminder(true)
              }
            }}
          >
            Fodder Calculations
          </button>
          <button 
            className={`nav-link ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('analytics')
              if (!isPreviousSectionComplete() || !isFodderSectionComplete()) {
                setShowReminder(true)
              }
            }}
          >
            Impact Analytics
          </button>
        </div>
      </nav>

      <ParticleBackground />

      <div className="content-wrapper">
        <div className="calculator">
          <h1>FYM & Fodder Optimizer</h1>
          
          {activeSection === 'fym' && (
            <div className="fym-section">
              <div className="input-group">
                <label>
                  1. Land Holding (ha):
                  <InfoTooltip 
                    description="Enter your total agricultural land area in hectares"
                  />
                  <input
                    type="number"
                    name="landholding"
                    value={formData.landholding}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  2. Farmer Category:
                  <InfoTooltip 
                    description="Automatically determined based on land holding"
                    formula="Marginal: < 1 ha | Small: 1-2 ha | Small-Medium: 2-4 ha | Large: > 4 ha"
                  />
                  <input
                    type="text"
                    value={formData.farmerCategory}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  3. Number of Cropping Cycles:
                  <InfoTooltip 
                    description="Number of crop cycles per year"
                    formula="1 cycle: Single season | 2 cycles: Dual season | 3 cycles: Triple season"
                  />
                  <select
                    name="croppingCycles"
                    value={formData.croppingCycles}
                    onChange={handleInputChange}
                  >
                    <option value="1">1 Cycle</option>
                    <option value="2">2 Cycles</option>
                    <option value="3">3 Cycles</option>
                  </select>
                </label>
              </div>

              <div className="input-group">
                <label>
                  4. Cropping Pattern:
                  <InfoTooltip 
                    description="Select your cropping pattern based on seasons"
                    formula="Kharif: Monsoon (Jun-Oct) | Rabi: Winter (Oct-Mar) | Summer (Mar-Jun)"
                  />
                  <select
                    name="croppingPattern"
                    value={formData.croppingPattern}
                    onChange={handleInputChange}
                  >
                    {getCroppingPatternOptions().map(option => (
                    <option key={option} value={option}>
                      {option
                        .replace(/_/g, ' + ') // Replace underscores with " + "
                        .toLowerCase() // Convert to lowercase first (optional, ensures uniformity)
                        .replace(/\b\w/g, char => char.toUpperCase()) // Capitalize the first letter of each word
                      }
                    </option>
                    ))}

                  </select>
                </label>
              </div>

              <div className="input-group">
                <div className="input-group-header">
                  <label>
                    5. Average Annual PHR Generation
                    <InfoTooltip 
                      description={`Total post-harvest residue generated annually (1 trolley = ${trolConv()} tonnes)`}
                      formula="Number of cycles × Residue per cycle × Land holding"
                    />
                  </label>
                  <div className="unit-toggle-inline">
                    <select
                      value={unitStates.phrUnit}
                      onChange={(e) => handleUnitChange('phrUnit', e.target.value)}
                    >
                      <option value="tonnes">Tonnes</option>
                      <option value="trolleys">Trolleys</option>
                    </select>
                  </div>
                </div>
                <input
                  type="number"
                  value={formatUnitValueForPoint(calculatePHR(), 'phrUnit')}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="input-group">
                <label>
                  6. Number of Milking Cattle:
                  <InfoTooltip 
                    description="Enter the total number of milking cattle in your farm"
                    formula="Only include actively milking cattle"
                  />
                  <input
                    type="number"
                    name="milkingCattle"
                    value={formData.milkingCattle}
                    onChange={handleInputChange}
                    min="0"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  7. Average Milk Yield per Day per Cow (L):
                  <InfoTooltip 
                    description="Average milk production per cow per day"
                    formula="(Total daily milk production ÷ Number of milking cattle)"
                  />
                  <input
                    type="number"
                    name="milkYield"
                    value={formData.milkYield}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                  />
                </label>
              </div>

              <div className="input-group">
                <div className="input-group-header">
                  <label>
                    8. FYM Used Annually
                    <InfoTooltip 
                      description={`Total Farm Yard Manure used per year (1 trolley = ${trolConv()} tonnes)`}
                      formula="Number of cycles × FYM per cycle × Land holding"
                    />
                  </label>
                  <div className="unit-toggle-inline">
                    <select
                      value={unitStates.fymUsedUnit}
                      onChange={(e) => handleUnitChange('fymUsedUnit', e.target.value)}
                    >
                      <option value="tonnes">Tonnes</option>
                      <option value="trolleys">Trolleys</option>
                    </select>
                  </div>
                </div>
                <div className="input-with-button">
                  <input
                    type="number"
                    value={formatUnitValueForPoint(calculateFYMUsed(), 'fymUsedUnit')}
                    readOnly
                    className="readonly"
                  />
                  <button 
                    className="defaults-button"
                    onClick={() => {
                      setEditingDefault('fymPerCycle')
                      setShowDefaultsModal(true)
                    }}
                  >
                    Change Defaults
                  </button>
                </div>
              </div>

              <div className="input-group">
                <div className="input-group-header">
                  <label>
                    9. FYM Generated In-house Annually
                    <InfoTooltip 
                      description={`FYM generated by cow(s) annually (1 trolley = ${trolConv()} tonnes)`}
                      formula=<>(20% efficiency × 10 kg cowdung per cow per day × 365 days x number of cows) / 1000 = 0.73 tonnes/year x number of cows
                              <br />(Assumes 20 kg cowdung/day/cow, out of which 50% is used for FYM, 20% conversion efficiency of cowdung to FYM)</>
                    />
                  </label>
                  <div className="unit-toggle-inline">
                    <select
                      value={unitStates.fymGeneratedUnit}
                      onChange={(e) => handleUnitChange('fymGeneratedUnit', e.target.value)}
                    >
                      <option value="tonnes">Tonnes</option>
                      <option value="trolleys">Trolleys</option>
                    </select>
                  </div>
                </div>
                <div className="input-with-button">
                  <input
                    type="number"
                    value={formatUnitValueForPoint(calculateFYMGenerated(), 'fymGeneratedUnit')}
                    readOnly
                    className="readonly"
                  />
                  <button 
                    className="defaults-button"
                    onClick={() => {
                      setEditingDefault('fymPerCow')
                      setShowDefaultsModal(true)
                    }}
                  >
                    Change Defaults
                  </button>
                </div>
              </div>

              <div className="input-group">
                <div className="input-group-header">
                  <label>
                    10. FYM Purchased Annually
                    <InfoTooltip 
                      description={`Additional FYM needed to be purchased (1 trolley = ${trolConv()} tonnes)`}
                      formula="FYM Used - FYM Generated (if positive)"
                    />
                  </label>
                  <div className="unit-toggle-inline">
                    <select
                      value={unitStates.fymPurchasedUnit}
                      onChange={(e) => handleUnitChange('fymPurchasedUnit', e.target.value)}
                    >
                      <option value="tonnes">Tonnes</option>
                      <option value="trolleys">Trolleys</option>
                    </select>
                  </div>
                </div>
                <input
                  type="number"
                  value={formatUnitValueForPoint(calculateFYMPurchased(), 'fymPurchasedUnit')}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="input-group">
                <label>
                  11. Cost of FYM Purchase (₹):
                  <InfoTooltip 
                    description="Total cost of purchasing required FYM"
                    formula="(FYM purchased × Trailer cost / Trailer capacity) + Transport cost + Storage cost"
                  />
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={`₹${formatIndianPrice(calculateFYMCost())}`}
                      readOnly
                      className="readonly"
                    />
                    <button 
                      className="defaults-button"
                      onClick={() => {
                        setEditingDefault('costs')
                        setShowDefaultsModal(true)
                      }}
                    >
                      Change Defaults
                    </button>
                  </div>
                </label>
              </div>

              <div className="input-group">
                <label>
                  12. Avoided cost due to PHR compost (₹)
                  <InfoTooltip 
                    description="Cost saved by making compost from PHR instead of purchasing FYM"
                    formula="Cost of FYM purchase - (Shredding cost + Bajrang ban cost + Labor cost)"
                  />
                  <input
                    type="text"
                    value={`₹${formatIndianPrice(calculateAvoidedCost())}`}
                    readOnly
                    className="readonly"
                  />
                </label>

                <div className="manual-section">
                  <label className="manual-label">
                    <span>Manual Input</span>
                    <InfoTooltip description="Enable to manually enter costs instead of using calculated values" />
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.useManualCosts}
                        onChange={(e) => setFormData(prev => ({...prev, useManualCosts: e.target.checked}))}
                      />
                      <span className="slider round"></span>
                    </label>
                  </label>

                  {formData.useManualCosts && (
                    <div className="manual-inputs">
                      <input
                        type="number"
                        name="shredding"
                        placeholder="Shredding cost"
                        value={formData.manualCosts?.shredding || ''}
                        onChange={handleManualCostChange}
                      />
                      <input
                        type="number"
                        name="bajrangBan"
                        placeholder="Bajrang ban cost"
                        value={formData.manualCosts?.bajrangBan || ''}
                        onChange={handleManualCostChange}
                      />
                      <input
                        type="number"
                        name="labor"
                        placeholder="Labor cost"
                        value={formData.manualCosts?.labor || ''}
                        onChange={handleManualCostChange}
                      />
                    </div>
                  )}
                </div>

                <div 
                  className="cost-breakdown"
                  onClick={() => setIsBreakdownVisible(!isBreakdownVisible)}
                >
                  <div className="breakdown-header">
                    Show Cost Breakdown
                    <span className={`arrow ${isBreakdownVisible ? 'up' : 'down'}`}>▼</span>
                  </div>
                  {isBreakdownVisible && (
                    <div className="breakdown-content">
                      <div className="breakdown-row">
                        <span>Shredding Cost:</span>
                        <span>₹{formatIndianPrice(calculateShredding())}</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Bajrang Ban Cost:</span>
                        <span>₹{formatIndianPrice(calculateBajrangBan())}</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Labor Cost:</span>
                        <span>₹{formatIndianPrice(calculateLabor())}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="next-section-container">
                <button 
                  className="next-section-button"
                  onClick={() => {
                    setActiveSection('fodder')
                    scrollToTop()
                    if (!isPreviousSectionComplete()) {
                      setShowReminder(true)
                    }
                  }}
                >
                  Next: Fodder Calculations →
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'fodder' && (
            <div className="fodder-section">
              <div className="input-group">
                <div className="input-group-header">
                  <label>
                    14. Average annual dry fodder requirement
                    <InfoTooltip 
                      description={`Total dry fodder needed annually for all cattle (1 trolley = ${trolConv()} tonnes)`}
                      formula="Dry fodder = Number of milking cattle × Daily fodder per cow × 365 / 1000"
                    />
                  </label>
                  <div className="unit-toggle-inline">
                    <select
                      value={unitStates.dryFodderUnit}
                      onChange={(e) => handleUnitChange('dryFodderUnit', e.target.value)}
                    >
                      <option value="tonnes">Tonnes</option>
                      <option value="trolleys">Trolleys</option>
                    </select>
                  </div>
                </div>
                <div className="input-with-button">
                  <input
                    type="number"
                    value={formatUnitValueForPoint(calculateDryFodderRequirement(), 'dryFodderUnit')}
                    readOnly
                    className="readonly"
                  />
                  <button 
                    className="defaults-button"
                    onClick={() => {
                      setEditingDefault('dryFodder')
                      setShowDefaultsModal(true)
                    }}
                  >
                    Change Defaults
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>
                  15. Percentage of dry fodder required purchased annually
                  <InfoTooltip 
                    description="Percentage of total fodder requirement that needs to be purchased"
                    formula="Input range: 0-100%"
                  />
                  <input
                    type="number"
                    name="purchasedFodderPercentage"
                    value={formData.purchasedFodderPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                  />
                </label>
              </div>

              <div className="input-group">
                <div className="input-group-header">
                  <label>
                    16. Total purchased dry fodder
                    <InfoTooltip 
                      description={`Amount of fodder that needs to be purchased (1 trolley = ${trolConv()} tonnes)`}
                      formula="Purchased fodder = Annual requirement × Purchase percentage / 100"
                    />
                  </label>
                  <div className="unit-toggle-inline">
                    <select
                      value={unitStates.purchasedFodderUnit}
                      onChange={(e) => handleUnitChange('purchasedFodderUnit', e.target.value)}
                    >
                      <option value="tonnes">Tonnes</option>
                      <option value="trolleys">Trolleys</option>
                    </select>
                  </div>
                </div>
                <input
                  type="number"
                  value={formatUnitValueForPoint(calculateTotalPurchasedFodder(), 'purchasedFodderUnit')}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="input-group">
                <label>
                  17. Fodder Purchase Cost (₹)
                  <InfoTooltip 
                    description="Total cost of purchasing required fodder"
                    formula="Cost = Total purchased fodder × Price per kg × 1000"
                  />
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={`₹${formatIndianPrice(calculateFodderPurchaseCost())}`}
                      readOnly
                      className="readonly"
                    />
                    <button 
                      className="defaults-button"
                      onClick={() => {
                        setEditingDefault('fodderPrice')
                        setShowDefaultsModal(true)
                      }}
                    >
                      Change Defaults
                    </button>
                  </div>
                </label>
              </div>

              <div className="input-group">
                <label>
                  18. Cost avoided due to reduced purchase (₹)
                  <InfoTooltip 
                    description="Money saved by using treated fodder"
                    formula="Avoided cost = Total requirement × Price per kg × 1000 - Purchase cost"
                  />
                  <input
                    type="text"
                    value={`₹${formatIndianPrice(calculateDryFodderRequirement() * defaults.dryFodderPricePerKg * 1000 - calculateFodderPurchaseCost())}`}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  19. Enzyme Treatment Cost (₹)
                  <InfoTooltip 
                    description="Total cost of treating fodder with enzymes including shredding, Bajrang ban, and salts"
                    formula="Total = Shredding Cost + Bajrang Ban Cost + Salt A Cost + Salt B Cost"
                  />
                </label>
                
                <div className="manual-section">
                  <div className="manual-label">
                    Manual Input
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.useManualEnzymeCosts}
                        onChange={(e) => handleInputChange({
                          target: {
                            name: 'useManualEnzymeCosts',
                            value: e.target.checked
                          }
                        })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  {formData.useManualEnzymeCosts ? (
                    <div className="manual-inputs">
                      <input
                        type="number"
                        name="shredding"
                        placeholder="Shredding cost"
                        value={formData.enzymeManualCosts?.shredding || ''}
                        onChange={handleEnzymeManualCostChange}
                      />
                      <input
                        type="number"
                        name="bajrangBan"
                        placeholder="Bajrang ban cost"
                        value={formData.enzymeManualCosts?.bajrangBan || ''}
                        onChange={handleEnzymeManualCostChange}
                      />
                      <input
                        type="number"
                        name="saltA"
                        placeholder="Salt A cost"
                        value={formData.enzymeManualCosts?.saltA || ''}
                        onChange={handleEnzymeManualCostChange}
                      />
                      <input
                        type="number"
                        name="saltB"
                        placeholder="Salt B cost"
                        value={formData.enzymeManualCosts?.saltB || ''}
                        onChange={handleEnzymeManualCostChange}
                      />
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={`₹${formatIndianPrice(calculateEnzymeTreatmentCost())}`}
                        readOnly
                        className="readonly"
                      />
                      <div className="cost-breakdown">
                        <div 
                          className="breakdown-header"
                          onClick={() => setIsBreakdownVisible(!isBreakdownVisible)}
                        >
                          <span>{isBreakdownVisible ? 'Hide' : 'Show'} Cost Breakdown</span>
                          <span className={`arrow ${isBreakdownVisible ? 'up' : 'down'}`}>▼</span>
                        </div>
                        {isBreakdownVisible && (
                          <div className="breakdown-content">
                            <div className="breakdown-row">
                              <span>A) Shredding Cost:</span>
                              <span>₹{formatIndianPrice(calculateShreddingCostFodder())}</span>
                            </div>
                            <div className="breakdown-row">
                              <span>B) Bajrang Ban Cost:</span>
                              <span>₹{formatIndianPrice(calculateEnzymeRequirements().bajrangBanLitres * defaults.bajrangBanPrice)}</span>
                            </div>
                            <div className="breakdown-row">
                              <span>C) Salt A Cost:</span>
                              <span>₹{formatIndianPrice(calculateEnzymeRequirements().saltAKg * defaults.saltAPrice)}</span>
                            </div>
                            <div className="breakdown-row">
                              <span>D) Salt B Cost:</span>
                              <span>₹{formatIndianPrice(calculateEnzymeRequirements().saltBKg * defaults.saltBPrice)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  className="defaults-button"
                  onClick={() => {
                    setEditingDefault('enzymeTreatment')
                    setShowDefaultsModal(true)
                  }}
                >
                  Change Defaults
                </button>
              </div>

              <div className="input-group">
                <label>
                  20. Revenue from increased milk yield (₹)
                  <InfoTooltip 
                    description="Additional revenue from increased milk production"
                    formula="Revenue = Milk yield increase × Number of cows × Price per liter × Milking days"
                  />
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={`₹${formatIndianPrice(calculateIncreasedMilkRevenue())}`}
                      readOnly
                      className="readonly"
                    />
                    <button 
                      className="defaults-button"
                      onClick={() => {
                        setEditingDefault('milkYield')
                        setShowDefaultsModal(true)
                      }}
                    > 
                      Change Defaults
                    </button>
                  </div>
                </label>
              </div>

              <div className="input-group">
                <label>
                  21. Overall Gain (₹)
                  <InfoTooltip 
                    description="Total financial benefit including avoided costs and added revenue"
                    formula="(Annual fodder requirement × ₹4.5/kg × 1000) - (Fodder purchase cost + Enzyme treatment cost) + Milk revenue"
                  />
                  <input
                    type="text"
                    value={`₹${formatIndianPrice(calculateOverallGain())}`}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>

              <div className="next-section-container">
                <button 
                  className="next-section-button"
                  onClick={() => {
                    setActiveSection('analytics')
                    scrollToTop()
                    if (!isPreviousSectionComplete() || !isFodderSectionComplete()) {
                      setShowReminder(true)
                    }
                  }}
                >
                  Next: Impact Analytics →
                </button>
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="analytics-section">
              <div className="input-group">
                <label>
                  1. Annual Income (₹)
                  <InfoTooltip 
                    description="Your total annual income to calculate impact percentages"
                  />
                  <input
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleInputChange}
                    min="0"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  2. Overall Gain with PHR Utilization (%)
                  <InfoTooltip 
                    description="Percentage of total benefits compared to annual income"
                    formula="100 × (Avoided cost from PHR compost + Overall gain from fodder) / Annual income"
                  />
                  <input
                    type="number"
                    value={RoundTo2Decimal(calculateOverallGainPercentage())}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  3. Added Revenue from Sales Annually (₹)
                  <InfoTooltip 
                    description="Additional revenue from increased milk yield"
                    formula="Milk yield increase × Number of cows × Price per liter × Milking days"
                  />
                  <input
                    type="text"
                    value={`₹${formatIndianPrice(calculateIncreasedMilkRevenue())}`}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  4. Revenue Impact from Sales (%)
                  <InfoTooltip 
                    description="Percentage of additional revenue from increased milk yield"
                    formula="(Revenue from increased milk yield × 100) / Annual income"
                  />
                  <input
                    type="number"
                    value={RoundTo2Decimal(calculateRevenuePercentage())}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>


              <div className="input-group">
                <label>
                  5. Direct Avoided GHG Emissions Annually (tonnes CO₂)
                  <InfoTooltip 
                    description="CO₂ emissions avoided by not burning PHR"
                    formula="annual PHR generation (tonnes) × (7190 kg CO₂ / (1000 × 5 tonnes PHR burnt))"
                  />
                  <input
                    type="number"
                    value={RoundTo2Decimal(calculateDirectCO2Avoided())}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>


              <div className="input-group">
                <label>
                  6. Avoided CO₂ from Milk Yield Improvement Annually (tonnes/year)
                  <InfoTooltip 
                    description="CO₂ emissions avoided due to increased milk yield efficiency"
                    formula="(Litres per cow per day × 3.4 kg CO₂/year × Number of cows) × Number of days/year"
                  />
                  <div className="input-with-button">
                    <input
                      type="number"
                      value={RoundTo2Decimal(calculateMilkYieldCO2Avoided())}
                      readOnly
                      className="readonly"
                    />
                    <button 
                      className="defaults-button"
                      onClick={() => {
                        setEditingDefault('milkYieldDefaults')
                        setShowDefaultsModal(true)
                      }}
                    >
                      Change Defaults
                    </button>
                  </div>
                </label>
              </div>

              <div className="input-group">
                <label>
                  7. Total CO₂ Avoided (tonnes/year)
                  <InfoTooltip 
                    description="Total CO₂ emissions avoided from both PHR utilization and improved milk yield"
                    formula="Direct Avoided GHG Emissions + Avoided CO₂ from Milk Yield Improvement"
                  />
                  <input
                    type="number"
                    value={RoundTo2Decimal(calculateTotalCO2Avoided())}
                    readOnly
                    className="readonly"
                  />
                </label>
              </div>

              <div className="analytics-visualization">
                <h3>CO₂ Emissions Reduction Breakdown</h3>
                <div className="chart-container">
                  <canvas ref={chartRef} id="co2Chart"></canvas>
                </div>
                <div className="co2-analogies">
                  <h4>What does this CO₂ reduction mean?</h4>
                  {(() => {
                    const totalCO2 = calculateTotalCO2Avoided()
                    const analogies = calculateCO2Analogies(totalCO2)
                    return (
                      <div className="analogy-cards">
                        <div className="analogy-card">
                          <span className="analogy-icon">🌳</span>
                          <p>Equivalent to the annual CO₂ absorption of</p>
                          <strong>{analogies.trees.toLocaleString()} trees</strong>
                        </div>
                        <div className="analogy-card">
                          <span className="analogy-icon">🚗</span>
                          <p>Equal to removing</p>
                          <strong>{analogies.cars.toLocaleString()} cars</strong>
                          <p>from the road for a year</p>
                        </div>
                        <div className="analogy-card">
                          <span className="analogy-icon">🏠</span>
                          <p>Same as the annual emissions of</p>
                          <strong>{analogies.households.toLocaleString()} households</strong>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>Made by: Divyajyoti Biswal and Sarthak Chavhan</p>
        <p>Under the Guidance of Dr. Sachin Mandavgane</p>
        <p>
          Source Code:{" "}
          <a
            href="https://github.com/toms-wrld/agri2"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            GitHub
          </a>
        </p>
      </footer>


      {showDefaultsModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingDefault === 'residuePerCycle' ? 'PHR Default Settings' :
                 editingDefault === 'costs' ? 'FYM Cost Settings' :
                 editingDefault === 'dryFodder' ? 'Dry Fodder Settings' :
                 editingDefault === 'fodderPrice' ? 'Fodder Price Settings' :
                 editingDefault === 'milkYield' ? 'Milk Yield Settings' :
                 editingDefault === 'enzymeTreatment' ? 'Enzyme Treatment Settings' :
                 editingDefault === 'milkYieldDefaults' ? 'CO₂ Avoidance Settings' :
                 'Default Settings'}
              </h2>
              <button 
                className="close-button"
                onClick={() => setShowDefaultsModal(false)}
              >
                ×
              </button>
            </div>

            {editingDefault === 'residuePerCycle' && (
              <>
                <div className="modal-input-group">
                  <label>Residue per cycle (tonne)</label>
                  <input
                    type="number"
                    value={defaults.residuePerCycle}
                    onChange={(e) => handleDefaultsChange('residuePerCycle', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Default Crop Type</label>
                  <select
                    value={defaults.cropType || 'cotton'}
                    onChange={(e) => handleDefaultsChange('cropType', e.target.value)}
                  >
                    <option value="cotton">Cotton</option>
                    <option value="rice">Rice</option>
                    <option value="wheat">Wheat</option>
                    <option value="sugarcane">Sugarcane</option>
                  </select>
                </div>
              </>
            )}

            {editingDefault === 'costs' && (
              <>
                <div className="modal-input-group">
                  <label>Trailer Cost (₹)</label>
                  <input
                    type="number"
                    value={defaults.trailerCost}
                    onChange={(e) => handleDefaultsChange('trailerCost', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Trailer Capacity (tonnes)</label>
                  <input
                    type="number"
                    value={defaults.trailerCapacity}
                    onChange={(e) => handleDefaultsChange('trailerCapacity', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Transport Cost (₹)</label>
                  <input
                    type="number"
                    value={defaults.transportCost}
                    onChange={(e) => handleDefaultsChange('transportCost', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Storage Cost (₹)</label>
                  <input
                    type="number"
                    value={defaults.storageCost}
                    onChange={(e) => handleDefaultsChange('storageCost', e.target.value)}
                    min="0"
                  />
                </div>
              </>
            )}

            {editingDefault === 'fymPerCycle' && (
              <>
                <div className="modal-input-group">
                  <label>FYM per Cycle (tonnes)</label>
                  <input
                    type="number"
                    value={defaults.fymPerCycle}
                    onChange={(e) => handleDefaultsChange('fymPerCycle', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="modal-input-group">
                <label>tonns per trolley</label>
                <input
                  type="number"
                  value={defaults.tonnsPerTrolley}
                  onChange={(e) => handleDefaultsChange('tonnsPerTrolley', e.target.value)}
                  min="1.5"
                  max="10"
                  step="0.5"
                />
              </div>
              </>
            )}

            {editingDefault === 'fymPerCow' && (
              <div className="modal-input-group">
                <label>FYM per Cow (tonnes)</label>
                <input
                  type="number"
                  value={defaults.fymPerCow}
                  onChange={(e) => handleDefaultsChange('fymPerCow', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            
            <button 
              className="save-button"
              onClick={handleSaveDefaults}
            >
              Save Changes
            </button>

            {editingDefault === 'dryFodder' && (
              <div className="modal-input-group">
                <label>Dry Fodder per Cow (kg/day)</label>
                <input
                  type="number"
                  value={defaults.dryFodderPerCow}
                  onChange={(e) => handleDefaultsChange('dryFodderPerCow', e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
            )}

            {editingDefault === 'fodderPrice' && (
              <div className="modal-input-group">
                <label>Dry Fodder Price (₹/kg)</label>
                <input
                  type="number"
                  value={defaults.dryFodderPricePerKg}
                  onChange={(e) => handleDefaultsChange('dryFodderPricePerKg', e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
            )}

            {editingDefault === 'milkYield' && (
              <>
                <div className="modal-input-group">
                  <label>Minimum Milk Yield Increase (L/day/cow)</label>
                  <input
                    type="number"
                    value={defaults.minMilkYieldIncrease}
                    onChange={(e) => handleDefaultsChange('minMilkYieldIncrease', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Milk Price (₹/L)</label>
                  <input
                    type="number"
                    value={defaults.milkPricePerLiter}
                    onChange={(e) => handleDefaultsChange('milkPricePerLiter', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Milking Days Annually</label>
                  <input
                    type="number"
                    value={defaults.milkDaysAnnually}
                    onChange={(e) => handleDefaultsChange('milkDaysAnnually', e.target.value)}
                    min="0"
                    max="365"
                    step="1"
                  />
                </div>
              </>
            )}

            {editingDefault === 'enzymeTreatment' && (
              <>
                <div className="modal-input-group">
                  <label>Salt A Price (₹/kg)</label>
                  <input
                    type="number"
                    value={defaults.saltAPrice}
                    onChange={(e) => handleDefaultsChange('saltAPrice', e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Salt B Price (₹/kg)</label>
                  <input
                    type="number"
                    value={defaults.saltBPrice}
                    onChange={(e) => handleDefaultsChange('saltBPrice', e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Bajrang Ban Price (₹/L)</label>
                  <input
                    type="number"
                    value={defaults.bajrangBanPrice}
                    onChange={(e) => handleDefaultsChange('bajrangBanPrice', e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
              </>
            )}

            {editingDefault === 'milkYieldDefaults' && (
              <>
                <div className="modal-input-group">
                  <label>Minimum Milk Yield Increase (L/day/cow)</label>
                  <input
                    type="number"
                    value={defaults.milkYieldIncreaseMin}
                    onChange={(e) => handleDefaultsChange('milkYieldIncreaseMin', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="modal-input-group">
                  <label>Number of Milking Days</label>
                  <input
                    type="number"
                    value={defaults.milkingDaysDefault}
                    onChange={(e) => handleDefaultsChange('milkingDaysDefault', e.target.value)}
                    min="0"
                    max="365"
                    step="1"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showReminder && (
        <div className="reminder-modal">
          <div className="reminder-content">
            <div className="reminder-header">
              <h3>⚠️ Complete FYM Calculations First</h3>
              <button 
                className="close-button"
                onClick={() => setShowReminder(false)}
              >
                ×
              </button>
            </div>
            <p className="reminder-message">
              Please complete the FYM Calculations section before proceeding to next Calculations. 
              This ensures accurate calculations as some values are dependent on previous results.
            </p>
            <div className="reminder-actions">
              <button 
                className="primary-button"
                onClick={() => {
                  setActiveSection('fym');
                  setShowReminder(false);
                }}
              >
                Go to FYM Calculations
              </button>
              <button 
                className="secondary-button"
                onClick={() => setShowReminder(false)}
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <HelpChat />
    </div>
  )
}

export default App
