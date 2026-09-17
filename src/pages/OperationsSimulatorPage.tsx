import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  RotateCcw, 
  Grid, 
  Clock, 
  Users, 
  Activity, 
  Bed, 
  ShieldAlert, 
  Building2,
  Layers,
  Sliders
} from 'lucide-react';

export const OperationsSimulatorPage: React.FC = () => {
  // Scenario Control Form State
  const [hospital, setHospital] = useState('NovaCare Medical Center');
  const [scenario, setScenario] = useState('Sudden patient surge');
  const [department, setDepartment] = useState('Cardiology');
  const [patientsAffected, setPatientsAffected] = useState(15);
  const [doctorAvailabilityChange, setDoctorAvailabilityChange] = useState(1);

  // Simulation Results State
  const [hasRun, setHasRun] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    patientImpact: string;
    estimatedWaitTime: string;
    doctorWorkload: string;
    departmentCapacity: string;
    bedUtilization: string;
    operationalImpact: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Impact';
    impactBadgeColor: string;
  } | null>(null);

  const [eventLogs, setEventLogs] = useState<{ id: string; timestamp: string; text: string; type: 'info' | 'warn' | 'success' }[]>([]);

  const handleRunSimulation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Calculate dynamic simulated values based on parameters
    let baseWait = 20;
    let baseWorkload = 75;
    let baseCapacity = 65;
    let baseBed = 70;
    
    // Scenario multipliers
    let scenarioMultiplier = 1.0;
    if (scenario === 'Sudden patient surge') scenarioMultiplier = 1.6;
    else if (scenario === 'Doctor absence') scenarioMultiplier = 1.5;
    else if (scenario === 'Department slowdown') scenarioMultiplier = 1.4;
    else if (scenario === 'Appointment cancellation wave') scenarioMultiplier = 0.6;
    else if (scenario === 'Temporary hospital service outage') scenarioMultiplier = 2.2;
    else if (scenario === 'Evening demand increase') scenarioMultiplier = 1.3;
    else if (scenario === 'Increased no-show rate') scenarioMultiplier = 0.7;
    else if (scenario === 'Bed occupancy increase') scenarioMultiplier = 1.8;

    // Doctor availability factor (negative change increases workload/wait)
    const docFactor = Math.max(0.4, 1 - doctorAvailabilityChange * 0.08);

    // Compute metrics
    const simulatedWaitMins = Math.round((baseWait + patientsAffected * 1.8) * scenarioMultiplier * docFactor);
    const simulatedWorkload = Math.min(180, Math.round((baseWorkload + patientsAffected * 2.2) * scenarioMultiplier * docFactor));
    const simulatedCapacity = Math.min(100, Math.round((baseCapacity + patientsAffected * 1.2) * scenarioMultiplier));
    const simulatedBeds = Math.min(100, Math.round((baseBed + patientsAffected * 0.9) * scenarioMultiplier));

    let impactLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Impact' = 'Low Risk';
    let badgeColor = '#12a06a';

    if (simulatedWaitMins > 60 || simulatedWorkload > 140) {
      impactLevel = 'Critical Impact';
      badgeColor = '#d94a4a';
    } else if (simulatedWaitMins > 40 || simulatedWorkload > 110) {
      impactLevel = 'High Risk';
      badgeColor = '#e67e22';
    } else if (simulatedWaitMins > 28 || simulatedWorkload > 90) {
      impactLevel = 'Moderate Risk';
      badgeColor = '#f5a623';
    }

    const patientImpactText = scenario === 'Appointment cancellation wave' || scenario === 'Increased no-show rate'
      ? `-${Math.round(patientsAffected * 0.8)}% Reduced Traffic`
      : `+${Math.round(patientsAffected * 2.5)}% Queue Surge`;

    setSimulationResults({
      patientImpact: patientImpactText,
      estimatedWaitTime: `${simulatedWaitMins} mins (was ${baseWait} mins)`,
      doctorWorkload: `${simulatedWorkload}% Capacity`,
      departmentCapacity: `${simulatedCapacity}% Occupancy`,
      bedUtilization: `${simulatedBeds}% Beds Occupied`,
      operationalImpact: impactLevel,
      impactBadgeColor: badgeColor,
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setEventLogs([
      { id: '1', timestamp: nowStr, text: `Digital-twin simulation initialized for ${hospital} (${department} Dept).`, type: 'info' },
      { id: '2', timestamp: nowStr, text: `Triggered scenario "${scenario}" affecting ${patientsAffected} simulated patients.`, type: 'warn' },
      { id: '3', timestamp: nowStr, text: `Doctor availability modifier applied: ${doctorAvailabilityChange > 0 ? '+' : ''}${doctorAvailabilityChange} physician(s).`, type: 'info' },
      { id: '4', timestamp: nowStr, text: `Simulated OPD waiting time recalculated: ${simulatedWaitMins} mins (${impactLevel}).`, type: 'success' },
    ]);

    setHasRun(true);
  };

  const handleReset = () => {
    setHospital('NovaCare Medical Center');
    setScenario('Sudden patient surge');
    setDepartment('Cardiology');
    setPatientsAffected(15);
    setDoctorAvailabilityChange(1);
    setHasRun(false);
    setSimulationResults(null);
    setEventLogs([]);
  };

  return (
    <div className="content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', display: 'grid', placeItems: 'center', color: '#fff' }}>
          <Cpu size={20} />
        </div>
        <h1>Operations Simulator</h1>
      </div>
      <p className="sub">
        Digital-twin scenario testing for a selected hospital. All results are simulated.
      </p>

      {/* Main Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 520px', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Scenario Controls Card */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '15px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <Sliders size={18} color="var(--teal)" />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Scenario Controls</h2>
          </div>

          <form onSubmit={handleRunSimulation}>
            {/* Hospital Dropdown */}
            <div className="form-group">
              <label><Building2 size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Target Hospital</label>
              <select
                className="form-control"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              >
                <option value="NovaCare Medical Center">NovaCare Medical Center</option>
                <option value="Meridian Health Institute">Meridian Health Institute</option>
                <option value="AsterBridge Care Hospital">AsterBridge Care Hospital</option>
                <option value="GreenPulse Medical Institute">GreenPulse Medical Institute</option>
                <option value="HorizonCare Hospital">HorizonCare Hospital</option>
              </select>
            </div>

            {/* Scenario Dropdown */}
            <div className="form-group">
              <label><Layers size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Test Scenario</label>
              <select
                className="form-control"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                <option value="Sudden patient surge">Sudden patient surge</option>
                <option value="Doctor absence">Doctor absence</option>
                <option value="Department slowdown">Department slowdown</option>
                <option value="Appointment cancellation wave">Appointment cancellation wave</option>
                <option value="Temporary hospital service outage">Temporary hospital service outage</option>
                <option value="Evening demand increase">Evening demand increase</option>
                <option value="Increased no-show rate">Increased no-show rate</option>
                <option value="Bed occupancy increase">Bed occupancy increase</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div className="form-group">
              <label><Activity size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Department</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Dermatology">Dermatology</option>
                <option value="ENT">ENT</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Oncology">Oncology</option>
              </select>
            </div>

            {/* Range Slider 1: Simulated Patients Affected */}
            <div className="form-group" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink)' }}>
                  Simulated patients affected: <b>{patientsAffected}</b>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={patientsAffected}
                onChange={(e) => setPatientsAffected(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ink-3)', marginTop: 4 }}>
                <span>1 patient</span>
                <span>50 patients</span>
                <span>100 patients</span>
              </div>
            </div>

            {/* Range Slider 2: Doctor Availability Change */}
            <div className="form-group" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink)' }}>
                  Doctor availability change: <b>{doctorAvailabilityChange > 0 ? `+${doctorAvailabilityChange}` : doctorAvailabilityChange}</b>
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                value={doctorAvailabilityChange}
                onChange={(e) => setDoctorAvailabilityChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ink-3)', marginTop: 4 }}>
                <span>-10 (Absent)</span>
                <span>0 (Normal)</span>
                <span>+10 (Extra On Duty)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn" style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }}>
                <Play size={15} /> Run simulation
              </button>
              <button type="button" className="btn ghost" onClick={handleReset} style={{ padding: '10px 16px', fontSize: '13px' }}>
                <RotateCcw size={15} /> Reset
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Results & Event Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Results Card */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '15px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Grid size={18} color="var(--teal)" />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Results</h2>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#eef7f8', color: 'var(--teal)', padding: '4px 10px', borderRadius: '12px', border: '1px solid #cdeade' }}>
                Simulated
              </span>
            </div>

            {!hasRun || !simulationResults ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--line)' }}>
                <Grid size={36} color="var(--ink-3)" style={{ marginBottom: '10px' }} />
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>Run a scenario to see results</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '4px' }}>
                  Select parameters on the left and click "Run simulation".
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Simulated Impact Badge Bar */}
                <div style={{ background: '#f8fafc', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}>Simulated Operational Impact:</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: simulationResults.impactBadgeColor, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ShieldAlert size={14} /> {simulationResults.operationalImpact} (Simulated)
                  </span>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  
                  <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} color="var(--teal)" /> Patient Impact (Simulated)
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                      {simulationResults.patientImpact}
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color="var(--teal)" /> Est. Waiting Time (Simulated)
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                      {simulationResults.estimatedWaitTime}
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Activity size={13} color="var(--teal)" /> Doctor Workload (Simulated)
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                      {simulationResults.doctorWorkload}
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={13} color="var(--teal)" /> Dept Capacity (Simulated)
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                      {simulationResults.departmentCapacity}
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '10px', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Bed size={13} color="var(--teal)" /> Bed Utilization (Simulated)
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                      {simulationResults.bedUtilization}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Scenario Event Log Card */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '15px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <Clock size={18} color="var(--teal)" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Scenario event log</h2>
            </div>

            {!hasRun || eventLogs.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--ink-3)', padding: '14px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
                No events yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {eventLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: '12px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: log.type === 'warn' ? '#fdf1f1' : (log.type === 'success' ? '#e9f7f1' : '#f8fafc'),
                      border: `1px solid ${log.type === 'warn' ? '#f7d4d4' : (log.type === 'success' ? '#cdeade' : 'var(--line)')}`
                    }}
                  >
                    <span style={{ fontSize: '10.5px', color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>[{log.timestamp}]</span>
                    <span style={{ color: log.type === 'warn' ? '#d94a4a' : (log.type === 'success' ? '#12a06a' : 'var(--ink-2)') }}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
