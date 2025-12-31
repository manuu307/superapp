import React, { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { beamEnergy, convertEnergy, dischargeEnergy } from '../services/economy';
import { LucideProps } from 'lucide-react';

// Solarpunk Icons using Lucide
const Sun = (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

const Zap = (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const Sparkles = (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 3-1.5 3L7 7.5l3 1.5L12 12l1.5-3L17 7.5l-3-1.5Z" />
        <path d="M5 12.5 3.5 14l-1.5.5.5 1.5L3.5 17 5 16.5l1.5.5.5-1.5-1-1Z" />
        <path d="M19 12.5 17.5 14l-1.5.5.5 1.5L17.5 17 19 16.5l1.5.5.5-1.5-1-1Z" />
    </svg>
);


const UserBattery = () => {
    const { user, token } = useAuth();
    const [recipientId, setRecipientId] = useState('');
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState<'lumens' | 'rays'>('lumens');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleBeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!token) {
            setError('You must be logged in to beam energy.');
            return;
        }
        try {
            await beamEnergy(token, recipientId, amount, currency);
            setSuccess('Energy beamed successfully!');
        } catch (err) {
            setError('Failed to beam energy. Please check recipient and balance.');
        }
    };

    const handleConvert = async (from: 'lumens' | 'rays', to: 'rays' | 'flares') => {
        setError('');
        setSuccess('');
        if (!token) {
            setError('You must be logged in to convert energy.');
            return;
        }
        try {
            await convertEnergy(token, from, to);
            setSuccess('Energy converted successfully!');
        } catch (err) {
            setError('Conversion failed. Insufficient energy.');
        }
    };
    
    const handleDischarge = async (dischargeAmount: number) => {
        setError('');
        setSuccess('');
        if (!token) {
            setError('You must be logged in to discharge energy.');
            return;
        }
        try {
            await dischargeEnergy(token, dischargeAmount);
            setSuccess('Discharge request successful!');
        } catch (err) {
            setError('Discharge failed. Insufficient Flares.');
        }
    };


    if (!user) return <div>Loading...</div>;

    const batteryPercentage = user.battery ? 
        (user.battery.lumens + user.battery.rays * 100 + user.battery.flares * 10000) / 100000 * 100 
        : 0;

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-teal-300">My Battery</h2>
            
            <div className="flex items-center space-x-4">
                <div className="w-16 h-48 bg-gray-800 rounded-full flex flex-col justify-end">
                    <div className="bg-gradient-to-t from-yellow-400 to-amber-500 rounded-full" style={{ height: `${batteryPercentage}%` }}></div>
                </div>
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Sun className="text-yellow-400" />
                        <span className="font-bold">{user.battery?.lumens || 0} ln</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Zap className="text-amber-500" />
                        <span className="font-bold">{user.battery?.rays || 0} Ry</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Sparkles className="text-teal-300" />
                        <span className="font-bold">{user.battery?.flares || 0} Fl</span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2 text-teal-300">Beam Energy</h3>
                <form onSubmit={handleBeam}>
                    <input type="text" placeholder="Recipient ID" value={recipientId} onChange={e => setRecipientId(e.target.value)} className="w-full bg-gray-800 rounded p-2 mb-2" />
                    <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-gray-800 rounded p-2 mb-2" />
                    <select value={currency} onChange={e => setCurrency(e.target.value as 'lumens' | 'rays')} className="w-full bg-gray-800 rounded p-2 mb-2">
                        <option value="lumens">Lumens</option>
                        <option value="rays">Rays</option>
                    </select>
                    <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 font-bold py-2 px-4 rounded">Beam</button>
                </form>
            </div>
            
            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2 text-teal-300">Alchemist Converter</h3>
                <div className="flex space-x-4">
                    <button onClick={() => handleConvert('lumens', 'rays')} className="bg-yellow-500 hover:bg-yellow-600 font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-yellow-400/50">100 ln &rarr; 1 Ry</button>
                    <button onClick={() => handleConvert('rays', 'flares')} className="bg-amber-500 hover:bg-amber-600 font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-amber-500/50">100 Ry &rarr; 1 Fl</button>
                </div>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            {success && <p className="text-green-500 mt-4">{success}</p>}
        </div>
    );
};

export default UserBattery;

