
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { LandingPage } from './features/public/LandingPage';
import { SearchResultsPage } from './features/public/SearchResultsPage';
import { LoginVoyageur } from './features/auth/LoginVoyageur';
import { SignupVoyageur } from './features/auth/SignupVoyageur';
import { LoginCompany } from './features/auth/LoginCompany';
import { SignupCompany } from './features/auth/SignupCompany';
import { LoginAdmin } from './features/auth/LoginAdmin';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { CompanyDashboard } from './features/company/CompanyDashboard';
import { ClientDashboard } from './features/client/ClientDashboard';
import { StationManager } from './features/company/StationManager';
import { CompaniesListPage } from './features/public/CompaniesListPage';
import { CompanyDetailsPage } from './features/public/CompanyDetailsPage';
import { CompaniesPage } from './features/public/CompaniesPage';
import { NotificationSystem, NotificationItem } from './shared/components/NotificationSystem';
import { Navbar } from './shared/components/Navbar';
import { Footer } from './shared/components/Footer';
import { User, ViewState, UserRole } from './shared/types';
import { getCurrentUser, setCurrentUser as setStorageUser } from './shared/services/storage';

export type NotifyFunc = (msg: string, type: 'success' | 'error' | 'info' | 'warning' | 'danger') => void;

// Wrapper for CompanyDetails to extract ID from params
const CompanyDetailsWrapper = ({ onNavigate, user }: { onNavigate: any, user: any }) => {
    const { id } = useParams();
    return <CompanyDetailsPage onNavigate={onNavigate} companyId={id || ''} user={user} />;
};

// Wrapper for StationManager to extract props from location state
const StationManagerWrapper = ({ user, notify, onNavigate }: { user: any, notify: any, onNavigate: any }) => {
    const location = useLocation();
    const state = location.state as { editId?: string, initialType?: 'STATION' | 'ROUTE', parentId?: string } | null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <StationManager
                user={user}
                notify={notify}
                onClose={() => onNavigate('DASHBOARD_COMPANY')}
                editId={state?.editId || null}
                initialType={state?.initialType || 'STATION'}
                parentId={state?.parentId}
            />
        </div>
    );
};

const AppContent = () => {
    const [user, setUser] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const stored = getCurrentUser();
        if (stored) {
            setUser(stored);
        }
    }, []);

    const notify: NotifyFunc = (msg, type) => {
        const id = Date.now();
        const variant = type === 'error' ? 'danger' : type;
        setNotifications(prev => [...prev, { id, message: msg, variant }]);
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleLogout = () => {
        setStorageUser(null);
        setUser(null);
        navigate('/');
        notify("Déconnexion réussie", "info");
    };

    // Backward compatibility wrapper for onNavigate
    const handleNavigate = (view: ViewState, params?: any) => {
        window.scrollTo(0, 0);
        switch (view) {
            case 'LANDING': navigate('/'); break;
            case 'LOGIN_VOYAGEUR': navigate('/login/voyageur'); break;
            case 'SIGNUP_VOYAGEUR': navigate('/signup/voyageur'); break;
            case 'LOGIN_COMPANY': navigate('/login/company'); break;
            case 'SIGNUP_COMPANY': navigate('/signup/company'); break;
            case 'LOGIN_ADMIN': navigate('/login/admin'); break;
            case 'DASHBOARD_ADMIN': navigate('/admin/dashboard'); break;
            case 'DASHBOARD_COMPANY': navigate('/company/dashboard'); break;
            case 'DASHBOARD_CLIENT': navigate('/client/dashboard', { state: params }); break;
            case 'COMPANIES_LIST': navigate('/companies'); break;
            case 'COMPANIES': navigate('/companies-all'); break; // Assuming CompaniesPage is different
            case 'COMPANY_DETAILS': navigate(`/company/${params?.companyId}`); break;
            case 'SEARCH_RESULTS': navigate('/search', { state: params }); break;
            case 'STATION_MANAGER': navigate('/company/stations', { state: params }); break;
            default: console.warn('Unknown view:', view);
        }
    };

    // Special handling for SearchResults to get params from state
    const SearchResultsWrapper = () => {
        const loc = useLocation();
        return <SearchResultsPage onNavigate={handleNavigate} searchParams={loc.state} user={user} />;
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
            <NotificationSystem notifications={notifications} removeNotification={removeNotification} />
            <Navbar user={user} onNavigate={handleNavigate} onLogout={handleLogout} />

            <main className="flex-grow pt-16 md:pt-20">
                <Routes>
                    <Route path="/" element={<LandingPage onNavigate={handleNavigate} user={user} />} />
                    <Route path="/companies" element={<CompaniesListPage onNavigate={handleNavigate} />} />
                    <Route path="/companies-all" element={<CompaniesPage onNavigate={handleNavigate} />} />
                    <Route path="/company/:id" element={<CompanyDetailsWrapper onNavigate={handleNavigate} user={user} />} />
                    <Route path="/search" element={<SearchResultsWrapper />} />

                    <Route path="/login/voyageur" element={<LoginVoyageur onNavigate={handleNavigate} notify={notify} setUser={setUser} />} />
                    <Route path="/signup/voyageur" element={<SignupVoyageur onNavigate={handleNavigate} notify={notify} setUser={setUser} />} />
                    <Route path="/login/company" element={<LoginCompany onNavigate={handleNavigate} notify={notify} setUser={setUser} />} />
                    <Route path="/signup/company" element={<SignupCompany onNavigate={handleNavigate} notify={notify} setUser={setUser} />} />
                    <Route path="/login/admin" element={<LoginAdmin onNavigate={handleNavigate} notify={notify} setUser={setUser} />} />

                    <Route path="/admin/dashboard" element={
                        user?.role === UserRole.ADMIN ?
                            <AdminDashboard user={user} notify={notify} onNavigate={handleNavigate} /> :
                            <Navigate to="/login/admin" />
                    } />

                    <Route path="/company/dashboard" element={
                        user?.role === UserRole.COMPANY ?
                            <CompanyDashboard
                                user={user}
                                notify={notify}
                                onNavigate={handleNavigate}
                                setEditStationId={(id: string | null) => handleNavigate('STATION_MANAGER', { editId: id, initialType: 'STATION' })}
                                setStationManagerProps={(props: any) => handleNavigate('STATION_MANAGER', props)}
                            /> :
                            <Navigate to="/login/company" />
                    } />

                    <Route path="/client/dashboard" element={
                        user?.role === UserRole.CLIENT ?
                            <ClientDashboard user={user} notify={notify} onNavigate={handleNavigate} /> :
                            <Navigate to="/login/voyageur" />
                    } />

                    <Route path="/company/stations" element={
                        user?.role === UserRole.COMPANY ?
                            <StationManagerWrapper user={user} notify={notify} onNavigate={handleNavigate} /> :
                            <Navigate to="/login/company" />
                    } />
                </Routes>
            </main>

            {location.pathname === '/' && <Footer onNavigate={handleNavigate} />}
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;