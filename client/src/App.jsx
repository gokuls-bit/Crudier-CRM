import React, { useState, useEffect } from 'react';

function App() {
  // ── States ────────────────────────────────────────────────
  const [serverHealth, setServerHealth] = useState({ status: 'checking', details: null });
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');
  const [authToken, setAuthToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState('111111111111111111111111');
  const [workspaceName, setWorkspaceName] = useState('Snavior CRM Inc.');
  
  // Attendance State
  const [checkInTime, setCheckInTime] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('Absent');
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  // Task Board States
  const [tasks, setTasks] = useState([
    { _id: '1', title: 'Implement JWT refresh rotation', priority: 'Critical', status: 'Submitted', assignee: 'Jane Doe' },
    { _id: '2', title: 'Design lead dashboard layout', priority: 'High', status: 'In Progress', assignee: 'Jane Doe' },
    { _id: '3', title: 'Verify attendance late triggers', priority: 'Medium', status: 'Pending', assignee: 'John Smith' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  // Sales CRM Pipeline States
  const [pipelineMetrics, setPipelineMetrics] = useState({
    totalLeads: 24,
    conversionRate: 62.5,
    avgDealValue: 4800,
    estimatedRevenue: 115200,
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'announcement', message: 'Monorepo project restructured successfully.', time: 'Just now' },
    { id: 2, type: 'task_assigned', message: 'You have been assigned to "JWT refresh rotation".', time: '10 mins ago' },
  ]);

  // ── Fetch Server Health ───────────────────────────────────
  const checkHealth = async () => {
    try {
      setServerHealth({ status: 'checking', details: null });
      const res = await fetch('http://localhost:5000/api/v1/health');
      if (res.ok) {
        const data = await res.json();
        setServerHealth({ status: 'healthy', details: data.data });
      } else {
        setServerHealth({ status: 'unhealthy', details: null });
      }
    } catch (err) {
      setServerHealth({ status: 'unhealthy', details: null });
    }
  };

  useEffect(() => {
    checkHealth();
    // Poll health status every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Authentication Handlers ────────────────────────────────
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    if (authMode === 'register' && !name) return;

    // Simulate Auth API check
    const mockUser = {
      _id: '661748b167e646e0f89e8e59',
      name: authMode === 'register' ? name : 'Jane Doe',
      email,
      role: authMode === 'register' ? role : 'Founder',
      workspaceId: activeWorkspace,
      isActive: true,
    };

    setAuthToken('mock_jwt_access_token_value');
    setUserProfile(mockUser);
    
    // Trigger notification
    addNotification('announcement', `${mockUser.name} (${mockUser.role}) logged in successfully.`);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUserProfile(null);
    addNotification('announcement', 'Logged out cleanly from active session.');
  };

  // ── Attendance Actions ────────────────────────────────────
  const handleCheckIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Auto status logic: Late if after 9:30 AM
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status = isLate ? 'Late' : 'Present';

    setCheckInTime(now);
    setAttendanceStatus(status);
    
    const newLog = {
      date: now.toISOString().split('T')[0],
      checkIn: timeStr,
      checkOut: '--:--',
      status,
      hours: 0,
    };
    setAttendanceLogs([newLog, ...attendanceLogs]);
    addNotification('attendance_alert', `Checked in successfully as ${status} at ${timeStr}.`);
  };

  const handleCheckOut = () => {
    if (!checkInTime) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const diffHours = Math.round((now - checkInTime) / (1000 * 60 * 60) * 10) / 10;
    
    // If under 4 hours, status is downgraded to Half Day
    let finalStatus = attendanceStatus;
    if (diffHours < 4 && (attendanceStatus === 'Present' || attendanceStatus === 'Late')) {
      finalStatus = 'Half Day';
    }

    setAttendanceStatus(finalStatus);
    setCheckInTime(null);

    const updatedLogs = [...attendanceLogs];
    if (updatedLogs.length > 0) {
      updatedLogs[0].checkOut = timeStr;
      updatedLogs[0].status = finalStatus;
      updatedLogs[0].hours = diffHours;
    }
    setAttendanceLogs(updatedLogs);
    addNotification('attendance_alert', `Checked out at ${timeStr}. Logged ${diffHours} hrs (${finalStatus}).`);
  };

  // ── Task Management Actions ────────────────────────────────
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      _id: Math.random().toString(36).substring(7),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      status: 'Pending',
      assignee: userProfile ? userProfile.name : 'Unassigned',
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    addNotification('task_assigned', `Task "${newTask.title}" added to backlog.`);
  };

  const handleTaskStatusChange = (id, targetStatus) => {
    const updated = tasks.map((t) => {
      if (t._id === id) {
        return { ...t, status: targetStatus };
      }
      return t;
    });
    setTasks(updated);
    addNotification('task_assigned', `Task status transitioned to ${targetStatus}.`);
  };

  // ── Notifications Helper ──────────────────────────────────
  const addNotification = (type, message) => {
    const newAlert = {
      id: Date.now(),
      type,
      message,
      time: 'Just now',
    };
    setNotifications([newAlert, ...notifications]);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)' }}>
            Crudier <span style={{ color: 'var(--color-primary)' }}>CRM</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Enterprise Startup Dashboard & Collaborator Workspace
          </p>
        </div>

        {/* Server Health Status Shield */}
        <div className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>API Status:</span>
          {serverHealth.status === 'checking' && (
            <span className="badge badge-warning">Checking...</span>
          )}
          {serverHealth.status === 'healthy' && (
            <span className="badge badge-success" onClick={checkHealth} style={{ cursor: 'pointer' }}>Healthy</span>
          )}
          {serverHealth.status === 'unhealthy' && (
            <span className="badge badge-danger" onClick={checkHealth} style={{ cursor: 'pointer' }}>Disconnected</span>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT GRID ──────────────────────────────── */}
      <div className="grid-2">
        
        {/* LEFT COLUMN: AUTH & WORKSPACE & ATTENDANCE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Auth Simulator Card */}
          <div className="glass-card">
            {!userProfile ? (
              <div>
                <h3 style={{ marginBottom: '16px' }}>Session Security Login</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <button 
                    className={`btn ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAuthMode('login')}
                    style={{ flex: 1 }}
                  >
                    Log In
                  </button>
                  <button 
                    className={`btn ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAuthMode('register')}
                    style={{ flex: 1 }}
                  >
                    Register
                  </button>
                </div>
                
                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {authMode === 'register' && (
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  )}
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input 
                    type="password" 
                    placeholder="Password (min 6 characters)" 
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {authMode === 'register' && (
                    <select 
                      className="form-input" 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Founder">Founder</option>
                      <option value="Admin">Admin</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Sales">Sales</option>
                      <option value="Intern">Intern</option>
                    </select>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                    {authMode === 'login' ? 'Confirm Login' : 'Register Account'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ textTransform: 'capitalize' }}>Welcome, {userProfile.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{userProfile.email}</p>
                  </div>
                  <span className="badge badge-primary">{userProfile.role}</span>
                </div>

                <div style={{ padding: '12px', background: 'hsla(230, 20%, 8%, 0.4)', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                  <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Workspace:</span>
                    <strong style={{ color: 'var(--color-secondary)' }}>{workspaceName}</strong>
                  </p>
                </div>

                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                  Log Out Session
                </button>
              </div>
            )}
          </div>

          {/* Attendance Manager Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Attendance Log</h3>
              <span className={`badge ${attendanceStatus === 'Present' ? 'badge-success' : (attendanceStatus === 'Late' ? 'badge-warning' : 'badge-danger')}`}>
                {attendanceStatus}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button 
                onClick={handleCheckIn} 
                disabled={checkInTime !== null}
                className="btn btn-primary" 
                style={{ flex: 1 }}
              >
                Check In
              </button>
              <button 
                onClick={handleCheckOut} 
                disabled={checkInTime === null}
                className="btn btn-danger" 
                style={{ flex: 1 }}
              >
                Check Out
              </button>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Logs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attendanceLogs.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No attendance logged today.</p>
                ) : (
                  attendanceLogs.map((log, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'hsla(230, 20%, 8%, 0.4)', borderRadius: '8px', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{log.date}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '10px' }}>{log.checkIn} - {log.checkOut}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{log.hours} hrs</span>
                        <span className={`badge ${log.status === 'Present' ? 'badge-success' : (log.status === 'Late' ? 'badge-warning' : 'badge-danger')}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sales CRM Pipeline Metrics Card */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Sales CRM Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'hsla(230, 20%, 8%, 0.4)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Pipeline Value</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-secondary)' }}>${pipelineMetrics.estimatedRevenue.toLocaleString()}</p>
              </div>
              <div style={{ padding: '12px', background: 'hsla(230, 20%, 8%, 0.4)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Won Deals Rate</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>{pipelineMetrics.conversionRate}%</p>
              </div>
            </div>
            
            {/* Visual Progress Bar */}
            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Sales Pipeline Stage Status</span>
                <span>Active Leads: {pipelineMetrics.totalLeads}</span>
              </span>
              <div style={{ height: '8px', background: 'hsla(230, 20%, 8%, 0.6)', borderRadius: '50px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '30%', background: 'var(--color-primary)' }} title="New Lead"></div>
                <div style={{ width: '25%', background: 'var(--color-info)' }} title="Contacted"></div>
                <div style={{ width: '20%', background: 'var(--color-warning)' }} title="Negotiation"></div>
                <div style={{ width: '25%', background: 'var(--color-success)' }} title="Closed Won"></div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TASK BOARD & SOCKET FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Task Board Card */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Active Sprint Task Board</h3>
            
            {/* Add Task Mini-Form */}
            <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Add sprint task description..." 
                className="form-input" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                style={{ flex: 3 }}
              />
              <select 
                className="form-input" 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                style={{ flex: 1, minWidth: '100px' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <button type="submit" className="btn btn-primary">Add</button>
            </form>

            {/* Task list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.map((task) => (
                <div key={task._id} className="glass-card" style={{ padding: '14px 18px', background: 'hsla(230, 20%, 12%, 0.45)', border: '1px solid hsla(230, 20%, 25%, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{task.title}</span>
                    <span className={`badge ${task.priority === 'Critical' ? 'badge-danger' : (task.priority === 'High' ? 'badge-warning' : 'badge-info')}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assignee: {task.assignee}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {task.status !== 'In Progress' && task.status !== 'Submitted' && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleTaskStatusChange(task._id, 'In Progress')}
                          style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleTaskStatusChange(task._id, 'Submitted')}
                          style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                        >
                          Submit
                        </button>
                      )}
                      <span className={`badge ${task.status === 'Submitted' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Socket & Notification Live Log */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Live Collaboration Feed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {notifications.map((alert) => (
                <div key={alert.id} style={{ padding: '12px 16px', background: 'hsla(230, 20%, 8%, 0.45)', borderRadius: '8px', borderLeft: `3px solid ${alert.type === 'attendance_alert' ? 'var(--color-secondary)' : 'var(--color-primary)'}`, fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                      {alert.type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{alert.time}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)' }}>{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        <p>© 2026 Crudier CRM. Custom scaffolded monorepo format (server/ & client/ folders).</p>
      </footer>

    </div>
  );
}

export default App;
