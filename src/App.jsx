
import React, { useState, useEffect } from 'react';

// Centralized RBAC configuration
const ROLES = {
    ADMIN: 'Admin',
    POLICYHOLDER: 'Policyholder',
    CLAIMS_OFFICER: 'Claims Officer',
    FINANCE_TEAM: 'Finance Team',
};

// Standardized status keys and UI labels with deterministic colors
const CLAIM_STATUS_MAP = {
    SUBMITTED: { label: 'Submitted', colorClass: 'status-submitted' },
    PENDING_VERIFICATION: { label: 'Pending Verification', colorClass: 'status-pending' },
    IN_REVIEW: { label: 'In Review', colorClass: 'status-in_review' },
    APPROVED: { label: 'Approved', colorClass: 'status-approved' },
    REJECTED: { label: 'Rejected', colorClass: 'status-rejected' },
    PENDING_SETTLEMENT: { label: 'Pending Settlement', colorClass: 'status-in_review' },
    SETTLED: { label: 'Settled', colorClass: 'status-settled' },
    RESUBMITTED: { label: 'Resubmitted', colorClass: 'status-resubmitted' },
    ESCALATED: { label: 'Escalated', colorClass: 'status-escalated' },
    VERIFIED: { label: 'Verified', colorClass: 'status-verified' },
};

// Dummy Data
const initialUsers = [
    { id: 'usr-1', name: 'Alice Smith', email: 'alice.s@example.com', role: ROLES.ADMIN },
    { id: 'usr-2', name: 'Bob Johnson', email: 'bob.j@example.com', role: ROLES.CLAIMS_OFFICER },
    { id: 'usr-3', name: 'Carol White', email: 'carol.w@example.com', role: ROLES.POLICYHOLDER },
    { id: 'usr-4', name: 'David Lee', email: 'david.l@example.com', role: ROLES.FINANCE_TEAM },
    { id: 'usr-5', name: 'Eve Davis', email: 'eve.d@example.com', role: ROLES.POLICYHOLDER },
];

const initialPolicies = [
    { id: 'pol-1001', policyNumber: 'P-987654321', type: 'Auto Insurance', holderId: 'usr-3', startDate: '2022-01-01', endDate: '2023-01-01' },
    { id: 'pol-1002', policyNumber: 'P-123456789', type: 'Home Insurance', holderId: 'usr-5', startDate: '2021-06-15', endDate: '2022-06-15' },
    { id: 'pol-1003', policyNumber: 'P-555444333', type: 'Life Insurance', holderId: 'usr-3', startDate: '2020-03-01', endDate: '2040-03-01' },
];

const initialClaims = [
    {
        id: 'clm-001', policyId: 'pol-1001', policyNumber: 'P-987654321', claimantId: 'usr-3', claimantName: 'Carol White',
        type: 'Car Accident', description: 'Minor fender bender on highway.', amount: 2500,
        submissionDate: '2023-03-10', status: 'SUBMITTED', documents: ['doc1.pdf'],
        workflow: [{ stage: 'Submitted', by: 'Carol White', date: '2023-03-10' }],
        auditLogs: [{ user: 'Carol White', action: 'Claim Submitted', timestamp: '2023-03-10T10:00:00Z' }]
    },
    {
        id: 'clm-002', policyId: 'pol-1002', policyNumber: 'P-123456789', claimantId: 'usr-5', claimantName: 'Eve Davis',
        type: 'Water Damage', description: 'Pipe burst in kitchen, extensive water damage.', amount: 15000,
        submissionDate: '2023-03-05', status: 'PENDING_VERIFICATION', documents: ['doc2.jpg', 'doc3.png'],
        workflow: [{ stage: 'Submitted', by: 'Eve Davis', date: '2023-03-05' }],
        auditLogs: [{ user: 'Eve Davis', action: 'Claim Submitted', timestamp: '2023-03-05T11:30:00Z' }]
    },
    {
        id: 'clm-003', policyId: 'pol-1001', policyNumber: 'P-987654321', claimantId: 'usr-3', claimantName: 'Carol White',
        type: 'Windshield Repair', description: 'Small crack in windshield from flying debris.', amount: 500,
        submissionDate: '2023-02-28', status: 'IN_REVIEW', documents: ['doc4.pdf'],
        workflow: [
            { stage: 'Submitted', by: 'Carol White', date: '2023-02-28' },
            { stage: 'In Review', by: 'Bob Johnson', date: '2023-03-01' }
        ],
        auditLogs: [
            { user: 'Carol White', action: 'Claim Submitted', timestamp: '2023-02-28T09:00:00Z' },
            { user: 'Bob Johnson', action: 'Claim moved to In Review', timestamp: '2023-03-01T14:15:00Z' }
        ]
    },
    {
        id: 'clm-004', policyId: 'pol-1003', policyNumber: 'P-555444333', claimantId: 'usr-3', claimantName: 'Carol White',
        type: 'Life Event', description: 'Life insurance claim.', amount: 500000,
        submissionDate: '2023-01-15', status: 'APPROVED', documents: ['doc5.pdf', 'doc6.pdf'],
        workflow: [
            { stage: 'Submitted', by: 'Carol White', date: '2023-01-15' },
            { stage: 'In Review', by: 'Bob Johnson', date: '2023-01-18' },
            { stage: 'Approved', by: 'Bob Johnson', date: '2023-01-25' }
        ],
        auditLogs: [
            { user: 'Carol White', action: 'Claim Submitted', timestamp: '2023-01-15T10:00:00Z' },
            { user: 'Bob Johnson', action: 'Claim moved to In Review', timestamp: '2023-01-18T10:00:00Z' },
            { user: 'Bob Johnson', action: 'Claim Approved', timestamp: '2023-01-25T10:00:00Z' }
        ]
    },
    {
        id: 'clm-005', policyId: 'pol-1002', policyNumber: 'P-123456789', claimantId: 'usr-5', claimantName: 'Eve Davis',
        type: 'Theft', description: 'Laptop stolen from car.', amount: 2000,
        submissionDate: '2023-02-10', status: 'REJECTED', documents: ['doc7.pdf'],
        workflow: [
            { stage: 'Submitted', by: 'Eve Davis', date: '2023-02-10' },
            { stage: 'In Review', by: 'Bob Johnson', date: '2023-02-12' },
            { stage: 'Rejected', by: 'Bob Johnson', date: '2023-02-15', reason: 'Lack of supporting evidence' }
        ],
        auditLogs: [
            { user: 'Eve Davis', action: 'Claim Submitted', timestamp: '2023-02-10T09:00:00Z' },
            { user: 'Bob Johnson', action: 'Claim moved to In Review', timestamp: '2023-02-12T10:00:00Z' },
            { user: 'Bob Johnson', action: 'Claim Rejected', timestamp: '2023-02-15T10:00:00Z' }
        ]
    },
    {
        id: 'clm-006', policyId: 'pol-1001', policyNumber: 'P-987654321', claimantId: 'usr-3', claimantName: 'Carol White',
        type: 'Fire Damage', description: 'Small kitchen fire, minor damage.', amount: 7500,
        submissionDate: '2023-03-20', status: 'SUBMITTED', documents: ['doc8.jpg'],
        workflow: [{ stage: 'Submitted', by: 'Carol White', date: '2023-03-20' }],
        auditLogs: [{ user: 'Carol White', action: 'Claim Submitted', timestamp: '2023-03-20T14:00:00Z' }]
    },
    {
        id: 'clm-007', policyId: 'pol-1002', policyNumber: 'P-123456789', claimantId: 'usr-5', claimantName: 'Eve Davis',
        type: 'Accidental Damage', description: 'Dropped TV, cracked screen.', amount: 1200,
        submissionDate: '2023-03-18', status: 'PENDING_VERIFICATION', documents: ['doc9.mp4'],
        workflow: [{ stage: 'Submitted', by: 'Eve Davis', date: '2023-03-18' }],
        auditLogs: [{ user: 'Eve Davis', action: 'Claim Submitted', timestamp: '2023-03-18T16:00:00Z' }]
    },
    {
        id: 'clm-008', policyId: 'pol-1003', policyNumber: 'P-555444333', claimantId: 'usr-3', claimantName: 'Carol White',
        type: 'Medical Emergency', description: 'Overseas medical treatment.', amount: 10000,
        submissionDate: '2023-03-12', status: 'VERIFIED', documents: ['doc10.pdf', 'doc11.jpg'],
        workflow: [
            { stage: 'Submitted', by: 'Carol White', date: '2023-03-12' },
            { stage: 'Verified', by: 'Bob Johnson', date: '2023-03-15' }
        ],
        auditLogs: [
            { user: 'Carol White', action: 'Claim Submitted', timestamp: '2023-03-12T10:00:00Z' },
            { user: 'Bob Johnson', action: 'Claim Verified', timestamp: '2023-03-15T10:00:00Z' }
        ]
    },
];

// Utility function to generate unique IDs
const generateId = (prefix = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

function App() {
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
    const [currentUser, setCurrentUser] = useState(initialUsers[0]); // Default to Admin
    const [claims, setClaims] = useState(initialClaims);
    const [policies, setPolicies] = useState(initialPolicies);
    const [users, setUsers] = useState(initialUsers);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

    // Simulate login for different roles
    useEffect(() => {
        // Can add logic here to load user from local storage or API
        // For demo, we just use the default.
    }, []);

    const navigate = (screenName, params = {}) => {
        setView({ screen: screenName, params: params });
        setShowSearchSuggestions(false); // Hide suggestions on navigation
    };

    const handleLogout = () => {
        setCurrentUser(null); // Clear user
        navigate('LOGIN'); // Or a dedicated login screen
    };

    const getBreadcrumbs = () => {
        const breadcrumbs = [{ label: 'Home', screen: 'DASHBOARD' }];
        if (view.screen === 'CLAIMS_LIST') {
            breadcrumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
        } else if (view.screen === 'CLAIM_DETAIL') {
            breadcrumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
            breadcrumbs.push({ label: `Claim ${view.params?.id || 'Detail'}`, screen: 'CLAIM_DETAIL', params: view.params });
        } else if (view.screen === 'CREATE_CLAIM') {
            breadcrumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
            breadcrumbs.push({ label: 'New Claim', screen: 'CREATE_CLAIM' });
        } else if (view.screen === 'EDIT_CLAIM') {
            breadcrumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
            breadcrumbs.push({ label: `Claim ${view.params?.id || 'Edit'}`, screen: 'CLAIM_DETAIL', params: { id: view.params?.id } });
            breadcrumbs.push({ label: 'Edit', screen: 'EDIT_CLAIM', params: view.params });
        }
        // Add more screens as needed
        return breadcrumbs;
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setGlobalSearchTerm(term);
        setShowSearchSuggestions(term.length > 2); // Show suggestions if term is long enough
    };

    const handleSearchSubmit = (itemType, itemId) => {
        // Implement smart search navigation here
        if (itemType === 'claim') {
            navigate('CLAIM_DETAIL', { id: itemId });
        } else if (itemType === 'policy') {
            // navigate to policy detail screen (not implemented in this minimal example)
            console.log(`Navigating to policy ${itemId}`);
        }
        setGlobalSearchTerm('');
        setShowSearchSuggestions(false);
    };

    const getSearchResults = (term) => {
        if (!term || term.length < 3) return [];
        const lowerCaseTerm = term.toLowerCase();
        const results = [];

        // Search claims
        claims.forEach(claim => {
            if (claim.id.toLowerCase().includes(lowerCaseTerm) ||
                claim.policyNumber.toLowerCase().includes(lowerCaseTerm) ||
                claim.claimantName.toLowerCase().includes(lowerCaseTerm) ||
                claim.type.toLowerCase().includes(lowerCaseTerm) ||
                CLAIM_STATUS_MAP[claim.status]?.label.toLowerCase().includes(lowerCaseTerm)) {
                results.push({
                    type: 'claim',
                    id: claim.id,
                    label: `Claim ${claim.id}: ${claim.type} by ${claim.claimantName} (${CLAIM_STATUS_MAP[claim.status]?.label})`
                });
            }
        });

        // Search policies
        policies.forEach(policy => {
            if (policy.policyNumber.toLowerCase().includes(lowerCaseTerm) ||
                policy.type.toLowerCase().includes(lowerCaseTerm)) {
                results.push({
                    type: 'policy',
                    id: policy.id,
                    label: `Policy ${policy.policyNumber}: ${policy.type}`
                });
            }
        });

        return results.slice(0, 5); // Limit suggestions
    };

    // --- Components / Screens (defined within App for direct state access) ---

    const Header = () => (
        <>
            <header className="app-header">
                <span className="app-logo" onClick={() => navigate('DASHBOARD')}>
                    ClaimFlow
                </span>
                <div className="global-search-container">
                    <input
                        type="text"
                        className="global-search-input"
                        placeholder="Search claims, policies, documents..."
                        value={globalSearchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => globalSearchTerm.length > 2 && setShowSearchSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 100)} // Delay to allow click on suggestion
                    />
                    {showSearchSuggestions && globalSearchTerm.length > 2 && (
                        <div className="search-suggestions">
                            {getSearchResults(globalSearchTerm).length > 0 ? (
                                getSearchResults(globalSearchTerm).map((result, index) => (
                                    <div
                                        key={index}
                                        className="search-suggestion-item"
                                        onClick={() => handleSearchSubmit(result.type, result.id)}
                                    >
                                        {result.label}
                                    </div>
                                ))
                            ) : (
                                <div className="search-suggestion-item text-muted">No results found</div>
                            )}
                        </div>
                    )}
                </div>
                <nav className="app-nav">
                    <a
                        href="#"
                        className={`app-nav-link ${view.screen === 'DASHBOARD' ? 'active' : ''}`}
                        onClick={() => navigate('DASHBOARD')}
                    >
                        Dashboard
                    </a>
                    <a
                        href="#"
                        className={`app-nav-link ${view.screen === 'CLAIMS_LIST' || view.screen === 'CLAIM_DETAIL' || view.screen === 'CREATE_CLAIM' || view.screen === 'EDIT_CLAIM' ? 'active' : ''}`}
                        onClick={() => navigate('CLAIMS_LIST')}
                    >
                        Claims
                    </a>
                    {currentUser?.role === ROLES.ADMIN && (
                        <a
                            href="#"
                            className={`app-nav-link ${view.screen === 'ADMIN_SETTINGS' ? 'active' : ''}`}
                            onClick={() => navigate('ADMIN_SETTINGS')}
                        >
                            Admin
                        </a>
                    )}
                </nav>
                {currentUser && (
                    <div className="user-profile">
                        <div className="user-profile-avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
                        <span className="user-profile-name">{currentUser?.name} ({currentUser?.role})</span>
                        <button className="btn btn-outline" onClick={handleLogout} style={{ marginLeft: 'var(--spacing-md)' }}>
                            Logout
                        </button>
                    </div>
                )}
            </header>
            <div className="breadcrumbs">
                {getBreadcrumbs().map((crumb, index, arr) => (
                    <React.Fragment key={crumb.screen + index}>
                        <span
                            className={`breadcrumb-item ${index === arr.length - 1 ? 'active' : ''}`}
                            onClick={() => index !== arr.length - 1 && navigate(crumb.screen, crumb.params)}
                            style={index !== arr.length - 1 ? { cursor: 'pointer' } : {}}
                        >
                            {crumb.label}
                        </span>
                        {index < arr.length - 1 && <span className="breadcrumb-separator">/</span>}
                    </React.Fragment>
                ))}
            </div>
        </>
    );

    const DashboardScreen = () => {
        const claimsSubmitted = claims.filter(c => c.status === 'SUBMITTED').length;
        const claimsApproved = claims.filter(c => c.status === 'APPROVED').length;
        const claimsRejected = claims.filter(c => c.status === 'REJECTED').length;
        const totalClaims = claims.length;

        const kpis = [
            { label: 'Total Claims', value: totalClaims, pulse: true },
            { label: 'Claims Submitted', value: claimsSubmitted, pulse: true },
            { label: 'Claims Approved', value: claimsApproved, pulse: true },
            { label: 'Claims Rejected', value: claimsRejected, pulse: true },
        ];

        // Filter recent activities based on current user role
        const recentActivities = claims
            .flatMap(claim => (claim.auditLogs || []).map(log => ({
                claimId: claim.id,
                activity: log.action,
                user: log.user,
                timestamp: log.timestamp,
                claimStatus: claim.status,
            })))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5); // Display top 5 recent activities

        return (
            <div className="main-content">
                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Dashboard</h2>

                <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="flex-row">
                        {kpis.map((kpi, index) => (
                            <div key={index} className={`card flex-grow-1 ${kpi.pulse ? 'realtime-pulse' : ''}`} style={{ cursor: 'default' }}>
                                <div className="card-header">
                                    <h3 className="card-title" style={{ borderBottom: 'none', paddingBottom: '0' }}>{kpi.label}</h3>
                                </div>
                                <div className="card-body" style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', textAlign: 'center' }}>
                                    {kpi.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 className="section-header">Claim Overview (Real-time)</h3>
                    <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        <div className="chart-container">Bar Chart Placeholder</div>
                        <div className="chart-container">Line Chart Placeholder</div>
                        <div className="chart-container">Donut Chart Placeholder</div>
                        <div className="chart-container">Gauge Chart Placeholder</div>
                    </div>
                </section>

                <section>
                    <h3 className="section-header">Recent Activities</h3>
                    <div className="flex-col">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <div key={index} className="card" onClick={() => navigate('CLAIM_DETAIL', { id: activity.claimId })}>
                                    <p className="mb-xs">
                                        <strong>{activity.user}</strong> {activity.activity} for Claim <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>{activity.claimId}</span>
                                    </p>
                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                        {new Date(activity.timestamp).toLocaleString()} - Status: <span className={`card-status ${CLAIM_STATUS_MAP[activity.claimStatus]?.colorClass || ''}`} style={{ color: 'var(--color-text-dark)', backgroundColor: 'transparent', padding: '0', fontSize: 'var(--font-size-sm)' }}>{CLAIM_STATUS_MAP[activity.claimStatus]?.label}</span>
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="card text-center" style={{ cursor: 'default' }}>
                                <p className="text-muted">No recent activities to display.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        );
    };

    const ClaimCard = ({ claim, onClick }) => (
        <div key={claim.id} className="card" onClick={onClick}>
            <div className="card-header">
                <h4 className="card-title">Claim {claim.id}</h4>
                <span className={`card-status ${CLAIM_STATUS_MAP[claim.status]?.colorClass || ''}`}>
                    {CLAIM_STATUS_MAP[claim.status]?.label || claim.status}
                </span>
            </div>
            <div className="card-body">
                <p><strong>Policy:</strong> {claim.policyNumber}</p>
                <p><strong>Claimant:</strong> {claim.claimantName}</p>
                <p><strong>Type:</strong> {claim.type}</p>
                <p><strong>Amount:</strong> ${claim.amount?.toLocaleString()}</p>
            </div>
            <div className="card-footer">
                <span className="text-muted">Submitted: {claim.submissionDate}</span>
            </div>
        </div>
    );

    const ClaimsListScreen = () => {
        const [filterStatus, setFilterStatus] = useState('ALL');
        const [searchTerm, setSearchTerm] = useState('');
        const [sortBy, setSortBy] = useState('submissionDate');
        const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

        const filteredClaims = claims.filter(claim => {
            const matchesStatus = filterStatus === 'ALL' || claim.status === filterStatus;
            const matchesSearch = searchTerm === '' ||
                claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                claim.type.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        }).sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (sortBy === 'amount') {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            } else if (sortBy === 'submissionDate') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

        return (
            <div className="main-content">
                <div className="d-flex justify-content-between align-items-center mb-lg">
                    <h2 style={{ marginBottom: '0' }}>Claims Management</h2>
                    {currentUser?.role !== ROLES.CLAIMS_OFFICER && ( // Example RBAC for new claim button
                        <button className="btn btn-primary" onClick={() => navigate('CREATE_CLAIM')}>
                            New Claim
                        </button>
                    )}
                </div>

                <div className="d-flex gap-md mb-lg flex-wrap">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flexGrow: 1, minWidth: '200px' }}
                    />
                    <select
                        className="form-control"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="ALL">All Statuses</option>
                        {Object.entries(CLAIM_STATUS_MAP).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                        ))}
                    </select>
                    <select
                        className="form-control"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="submissionDate">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                        <option value="status">Sort by Status</option>
                    </select>
                    <button className="btn btn-outline" onClick={toggleSortOrder}>
                        {sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
                    </button>
                    {/* Placeholder for bulk actions */}
                    {currentUser?.role === ROLES.CLAIMS_OFFICER && (
                        <button className="btn btn-secondary">
                            Bulk Actions (Approve/Reject)
                        </button>
                    )}
                </div>

                {filteredClaims.length > 0 ? (
                    <div className="grid-container">
                        {filteredClaims.map((claim) => (
                            <ClaimCard key={claim.id} claim={claim} onClick={() => navigate('CLAIM_DETAIL', { id: claim.id })} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center p-xl" style={{ cursor: 'default' }}>
                        <h4 style={{ color: 'var(--color-primary)' }}>No Claims Found</h4>
                        <p className="text-muted mb-md">Adjust your filters or search terms.</p>
                        {currentUser?.role === ROLES.POLICYHOLDER && (
                            <button className="btn btn-primary" onClick={() => navigate('CREATE_CLAIM')}>
                                Submit a New Claim
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const ClaimDetailScreen = () => {
        const claimId = view.params?.id;
        const claim = claims.find(c => c.id === claimId);

        if (!claim) {
            return (
                <div className="main-content">
                    <h2 className="text-center" style={{ color: 'var(--color-danger)' }}>Claim Not Found</h2>
                    <p className="text-center text-muted">The claim with ID "{claimId}" does not exist.</p>
                    <div className="text-center mt-lg">
                        <button className="btn btn-primary" onClick={() => navigate('CLAIMS_LIST')}>
                            Back to Claims List
                        </button>
                    </div>
                </div>
            );
        }

        const handleWorkflowAction = (newStatus, actionBy) => {
            const updatedClaims = claims.map(c =>
                c.id === claimId
                    ? {
                        ...c,
                        status: newStatus,
                        workflow: [...(c.workflow || []), { stage: CLAIM_STATUS_MAP[newStatus]?.label || newStatus, by: actionBy, date: new Date().toISOString().split('T')[0] }],
                        auditLogs: [...(c.auditLogs || []), { user: actionBy, action: `Claim ${CLAIM_STATUS_MAP[newStatus]?.label || newStatus}`, timestamp: new Date().toISOString() }],
                    }
                    : c
            );
            setClaims(updatedClaims);
        };

        const isClaimOfficer = currentUser?.role === ROLES.CLAIMS_OFFICER;
        const isFinanceTeam = currentUser?.role === ROLES.FINANCE_TEAM;
        const isPolicyholder = currentUser?.role === ROLES.POLICYHOLDER;

        // Determine available actions based on role and current status
        const canApprove = isClaimOfficer && (claim.status === 'SUBMITTED' || claim.status === 'PENDING_VERIFICATION' || claim.status === 'IN_REVIEW' || claim.status === 'VERIFIED');
        const canReject = isClaimOfficer && (claim.status === 'SUBMITTED' || claim.status === 'PENDING_VERIFICATION' || claim.status === 'IN_REVIEW' || claim.status === 'VERIFIED');
        const canVerify = isClaimOfficer && claim.status === 'PENDING_VERIFICATION';
        const canSettle = isFinanceTeam && claim.status === 'APPROVED';
        const canResubmit = isPolicyholder && claim.status === 'REJECTED';
        const canEdit = isPolicyholder && (claim.status === 'SUBMITTED' || claim.status === 'PENDING_VERIFICATION'); // Policyholder can edit own claim if not yet processed significantly
        const canAdminEdit = currentUser?.role === ROLES.ADMIN; // Admin can always edit

        return (
            <div className="main-content">
                <div className="d-flex justify-content-between align-items-center mb-lg">
                    <h2>Claim Details: {claim.id}</h2>
                    <div className="d-flex gap-md">
                        {(canEdit || canAdminEdit) && (
                            <button className="btn btn-outline" onClick={() => navigate('EDIT_CLAIM', { id: claim.id })}>
                                Edit Claim
                            </button>
                        )}
                        {canApprove && (
                            <button className="btn btn-success" onClick={() => handleWorkflowAction('APPROVED', currentUser?.name)}>
                                Approve Claim
                            </button>
                        )}
                        {canReject && (
                            <button className="btn btn-danger" onClick={() => handleWorkflowAction('REJECTED', currentUser?.name)}>
                                Reject Claim
                            </button>
                        )}
                        {canVerify && (
                            <button className="btn btn-primary" onClick={() => handleWorkflowAction('VERIFIED', currentUser?.name)}>
                                Verify Claim
                            </button>
                        )}
                        {canSettle && (
                            <button className="btn btn-secondary" onClick={() => handleWorkflowAction('SETTLED', currentUser?.name)}>
                                Settle Claim
                            </button>
                        )}
                        {canResubmit && (
                            <button className="btn btn-info" onClick={() => navigate('EDIT_CLAIM', { id: claim.id, resubmit: true })}>
                                Resubmit Claim
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-row">
                    <div className="card flex-grow-1">
                        <h4 className="card-title">Claim Information</h4>
                        <p><strong>Claim ID:</strong> {claim.id}</p>
                        <p><strong>Policy Number:</strong> {claim.policyNumber}</p>
                        <p><strong>Claimant:</strong> {claim.claimantName}</p>
                        <p><strong>Type:</strong> {claim.type}</p>
                        <p><strong>Description:</strong> {claim.description}</p>
                        <p><strong>Amount:</strong> ${claim.amount?.toLocaleString()}</p>
                        <p><strong>Submission Date:</strong> {claim.submissionDate}</p>
                        <p>
                            <strong>Current Status:</strong>
                            <span
                                className={`card-status ${CLAIM_STATUS_MAP[claim.status]?.colorClass || ''}`}
                                style={{ marginLeft: 'var(--spacing-sm)' }}
                            >
                                {CLAIM_STATUS_MAP[claim.status]?.label || claim.status}
                            </span>
                        </p>
                    </div>

                    <div className="card flex-grow-1">
                        <h4 className="card-title">Related Documents</h4>
                        {claim.documents && claim.documents.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {claim.documents.map((doc, index) => (
                                    <li key={index} className="mb-sm">
                                        <a href={`/documents/${doc}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                            📄 {doc} (Preview)
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">No documents uploaded.</p>
                        )}
                    </div>
                </div>

                <div className="flex-row mt-lg">
                    <div className="card flex-grow-1">
                        <h4 className="card-title">Workflow Stages</h4>
                        {claim.workflow && claim.workflow.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {claim.workflow.map((stage, index) => (
                                    <li key={index} className="mb-sm">
                                        <p className="mb-xs"><strong>{stage.stage}</strong> by {stage.by}</p>
                                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{stage.date}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">No workflow history.</p>
                        )}
                    </div>

                    <div className="card flex-grow-1">
                        <h4 className="card-title">Audit Log</h4>
                        {claim.auditLogs && claim.auditLogs.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {claim.auditLogs.map((log, index) => (
                                    <li key={index} className="mb-sm" style={currentUser?.role !== ROLES.ADMIN ? {display: 'none'} : {}}> {/* RBAC for log visibility */}
                                        <p className="mb-xs"><strong>{log.user}:</strong> {log.action}</p>
                                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{new Date(log.timestamp).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">No audit logs available.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const ClaimFormScreen = () => {
        const claimId = view.params?.id;
        const isEditMode = !!claimId;
        const initialClaim = isEditMode ? claims.find(c => c.id === claimId) : null;

        const [formData, setFormData] = useState({
            policyId: initialClaim?.policyId || '',
            policyNumber: initialClaim?.policyNumber || '',
            claimantId: currentUser?.id || '',
            claimantName: currentUser?.name || '',
            type: initialClaim?.type || '',
            description: initialClaim?.description || '',
            amount: initialClaim?.amount || '',
            documents: initialClaim?.documents || [],
            status: initialClaim?.status || 'SUBMITTED',
            submissionDate: initialClaim?.submissionDate || new Date().toISOString().split('T')[0],
        });
        const [errors, setErrors] = useState({});
        const [fileUploads, setFileUploads] = useState([]); // For new file uploads

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));

            // Auto-populate policy details
            if (name === 'policyId') {
                const selectedPolicy = policies.find(p => p.id === value);
                if (selectedPolicy) {
                    setFormData(prev => ({
                        ...prev,
                        policyNumber: selectedPolicy.policyNumber,
                        claimantId: selectedPolicy.holderId,
                        claimantName: users.find(u => u.id === selectedPolicy.holderId)?.name || '',
                    }));
                } else {
                    setFormData(prev => ({ ...prev, policyNumber: '', claimantId: '', claimantName: '' }));
                }
            }
        };

        const handleFileChange = (e) => {
            setFileUploads(prev => [...prev, ...Array.from(e.target.files)]);
        };

        const validateForm = () => {
            const newErrors = {};
            if (!formData.policyId) newErrors.policyId = 'Policy is mandatory.';
            if (!formData.type) newErrors.type = 'Claim type is mandatory.';
            if (!formData.description) newErrors.description = 'Description is mandatory.';
            if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be a positive number.';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!validateForm()) {
                console.log("Form has errors:", errors);
                return;
            }

            const newClaimData = {
                ...formData,
                amount: parseFloat(formData.amount),
                // Simulate file upload process
                documents: [...(formData.documents || []), ...fileUploads.map(file => file.name)],
            };

            if (isEditMode) {
                // Update existing claim
                const updatedClaims = claims.map(c =>
                    c.id === claimId
                        ? {
                            ...newClaimData,
                            id: claimId, // Ensure ID is preserved
                            workflow: [...(c.workflow || []), { stage: 'Edited', by: currentUser?.name, date: new Date().toISOString().split('T')[0] }],
                            auditLogs: [...(c.auditLogs || []), { user: currentUser?.name, action: 'Claim Updated', timestamp: new Date().toISOString() }],
                        }
                        : c
                );
                setClaims(updatedClaims);
                navigate('CLAIM_DETAIL', { id: claimId });
            } else {
                // Create new claim
                const newClaim = {
                    ...newClaimData,
                    id: generateId('clm'),
                    submissionDate: new Date().toISOString().split('T')[0],
                    workflow: [{ stage: 'Submitted', by: currentUser?.name, date: new Date().toISOString().split('T')[0] }],
                    auditLogs: [{ user: currentUser?.name, action: 'Claim Submitted', timestamp: new Date().toISOString() }],
                };
                setClaims(prev => [...prev, newClaim]);
                navigate('CLAIM_DETAIL', { id: newClaim.id });
            }
        };

        const relevantPolicies = currentUser?.role === ROLES.POLICYHOLDER
            ? policies.filter(p => p.holderId === currentUser.id)
            : policies;

        return (
            <div className="main-content">
                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>{isEditMode ? `Edit Claim: ${claimId}` : 'Submit New Claim'}</h2>
                <form onSubmit={handleSubmit} className="card p-lg">
                    <div className="form-group">
                        <label htmlFor="policyId" className="form-label">Policy <span style={{color: 'var(--color-danger)'}}>*</span></label>
                        <select
                            id="policyId"
                            name="policyId"
                            className="form-control"
                            value={formData.policyId}
                            onChange={handleChange}
                            disabled={currentUser?.role === ROLES.POLICYHOLDER && isEditMode} // Cannot change policy on edit for policyholder
                        >
                            <option value="">Select a Policy</option>
                            {relevantPolicies.map(policy => (
                                <option key={policy.id} value={policy.id}>
                                    {policy.policyNumber} - {policy.type}
                                </option>
                            ))}
                        </select>
                        {errors.policyId && <p className="form-error">{errors.policyId}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="policyNumber" className="form-label">Policy Number</label>
                        <input
                            type="text"
                            id="policyNumber"
                            name="policyNumber"
                            className="form-control"
                            value={formData.policyNumber}
                            disabled // Auto-populated and read-only
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="claimantName" className="form-label">Claimant Name</label>
                        <input
                            type="text"
                            id="claimantName"
                            name="claimantName"
                            className="form-control"
                            value={formData.claimantName}
                            disabled // Auto-populated and read-only
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type" className="form-label">Claim Type <span style={{color: 'var(--color-danger)'}}>*</span></label>
                        <input
                            type="text"
                            id="type"
                            name="type"
                            className="form-control"
                            value={formData.type}
                            onChange={handleChange}
                        />
                        {errors.type && <p className="form-error">{errors.type}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">Description <span style={{color: 'var(--color-danger)'}}>*</span></label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-control"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                        {errors.description && <p className="form-error">{errors.description}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount" className="form-label">Claim Amount ($) <span style={{color: 'var(--color-danger)'}}>*</span></label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            className="form-control"
                            value={formData.amount}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                        {errors.amount && <p className="form-error">{errors.amount}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="documents" className="form-label">Supporting Documents</label>
                        <input
                            type="file"
                            id="documents"
                            name="documents"
                            className="form-control"
                            multiple
                            onChange={handleFileChange}
                            style={{ padding: 'var(--spacing-sm)' }}
                        />
                        {formData.documents?.length > 0 && (
                            <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                <p className="text-muted mb-xs">Existing Documents:</p>
                                <ul style={{ listStyle: 'disc', marginLeft: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)' }}>
                                    {formData.documents.map((doc, index) => (
                                        <li key={index}>{doc}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {fileUploads.length > 0 && (
                            <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                <p className="text-muted mb-xs">New Files to Upload:</p>
                                <ul style={{ listStyle: 'disc', marginLeft: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)' }}>
                                    {fileUploads.map((file, index) => (
                                        <li key={`new-file-${index}`}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {isEditMode ? 'Update Claim' : 'Submit Claim'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => navigate(isEditMode ? 'CLAIM_DETAIL' : 'CLAIMS_LIST', isEditMode ? { id: claimId } : {})}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Main App Render Logic
    return (
        <div id="app-container">
            <Header />
            {(currentUser?.role) ? (
                (() => {
                    if (view.screen === 'DASHBOARD') {
                        return <DashboardScreen />;
                    } else if (view.screen === 'CLAIMS_LIST') {
                        return <ClaimsListScreen />;
                    } else if (view.screen === 'CLAIM_DETAIL') {
                        return <ClaimDetailScreen />;
                    } else if (view.screen === 'CREATE_CLAIM' || view.screen === 'EDIT_CLAIM') {
                        return <ClaimFormScreen />;
                    } else {
                        return (
                            <div className="main-content text-center">
                                <h2>Screen Not Implemented</h2>
                                <p className="text-muted">Currently on: {view.screen}</p>
                                <button className="btn btn-primary mt-md" onClick={() => navigate('DASHBOARD')}>Go to Dashboard</button>
                            </div>
                        );
                    }
                })()
            ) : (
                <div className="main-content text-center">
                    <h2 className="mb-md">Please Login</h2>
                    <p className="mb-lg">Select a user role to proceed:</p>
                    <div className="d-flex justify-content-center gap-md">
                        {initialUsers.map(user => (
                            <button key={user.id} className="btn btn-primary" onClick={() => setCurrentUser(user)}>
                                Login as {user.name} ({user.role})
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;