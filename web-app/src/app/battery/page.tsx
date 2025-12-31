'use client';
import UserBattery from '../../components/UserBattery';
import EnergyFlowHistory from '../../components/EnergyFlowHistory';
import { AuthProvider } from '../../context/AuthContext';

const BatteryPage = () => {
    return (
        <AuthProvider>
            <div className="container mx-auto p-4">
                <UserBattery />
                <EnergyFlowHistory />
            </div>
        </AuthProvider>
    );
};

export default BatteryPage;
