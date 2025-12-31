import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const EnergyFlowHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${API_URL}/users/energy-flow`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setHistory(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch energy flow history', error);
                setLoading(false);
            }
        };

        if (token) {
            fetchHistory();
        }
    }, [token]);

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-6">
            <h3 className="text-xl font-semibold mb-4 text-teal-300">Energy Flow</h3>
            <ul>
                {history.map((flow: any) => (
                    <li key={flow._id} className={`border-b border-gray-700 py-2 flex justify-between items-center ${flow.direction === 'Inflow' ? 'text-green-400' : 'text-amber-400'}`}>
                        <div>
                            <span className="font-bold">{flow.type}</span>
                            <span className="text-sm text-gray-400 ml-2">({new Date(flow.createdAt).toLocaleDateString()})</span>
                            <p className="text-sm">{flow.notes}</p>
                        </div>
                        <div>
                            {flow.lumens > 0 && <span>{flow.lumens} ln</span>}
                            {flow.rays > 0 && <span>{flow.rays} Ry</span>}
                            {flow.flares > 0 && <span>{flow.flares} Fl</span>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EnergyFlowHistory;
