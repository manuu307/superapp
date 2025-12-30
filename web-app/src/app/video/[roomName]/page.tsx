"use client";

import { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

export default function Video() {
    const { roomName } = useParams<{ roomName: string }>();
    const [token, setToken] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            return;
        }

        (async () => {
            try {
                const resp = await fetch(`/api/v1/video/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': `${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        roomName,
                        participantName: user.username,
                    }),
                });
                const data = await resp.json();
                console.log('Token response from server:', data);
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [user, roomName]);

    if (token === "") {
        return <div>Getting token...</div>;
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: '100dvh' }}
        >
            <VideoConference />
        </LiveKitRoom>
    );
}
