'use client';

import React, { useEffect, useState } from 'react';

type TrafficLightStatus = 'red' | 'yellow' | 'green';

interface TrafficLightData {
  id: number;
  distance_cm: number;
  status: TrafficLightStatus;
  last_updated: string;
}


const TrafficLight = () => {
  const [lights, setLights] = useState<Record<number, TrafficLightData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);

  const trafficLightNames: Record<number, string> = {
    1: '트램',
    2: '차량',
  };

  const convertToLocalTime = (utcString: string) => {
    const utcDate = new Date(utcString);
    return utcDate.toLocaleString();
  };

  useEffect(() => {
    const ws = new WebSocket('/websocket'); // Replace with your WebSocket endpoint

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Extract and update connected users count
        if (data.connectedusers !== undefined) {
          setConnectedUsers(data.connectedusers);
        }

        // Extract and update traffic light data
        const updatedLights = Object.keys(data)
          .filter((key) => !isNaN(Number(key))) // Only process numeric keys
          .reduce((acc, key) => {
            const light = data[key];
            acc[Number(key)] = {
              ...light,
              last_updated: convertToLocalTime(light.last_updated),
            };
            return acc;
          }, {} as Record<number, TrafficLightData>);

        setLights((prevLights) => ({
          ...prevLights,
          ...updatedLights,
        }));
        setError(null);
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        setError('Failed to process incoming data');
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection error');
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setError('WebSocket connection closed');
    };

    // close websocket connection after 1 hour
    setTimeout(() => {
      ws.close();
    }, 3600000);
    
    const sendMessage = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message: 'Update' }));
      }
    };
    //const intervalId = setInterval(sendMessage, 500); // Send message every 0.5 seconds

    // Cleanup WebSocket on component unmount
    return () => {
      //clearInterval(intervalId);
      ws.close();
    };
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-row items-center justify-center space-x-12'>
        {error ? `에러 발생: ${error}` : ''}
    </div>
    <div className="flex flex-row items-center justify-center space-x-12">
      {Object.values(lights).map((light) => (
        <div key={light.id} className="flex flex-col items-center space-y-6">
          {/* Light Name */}
          <div className="text-2xl font-bold">{trafficLightNames[light.id]}</div>

          {/* Distance Display */}
          <div className="text-xl font-semibold bg-gray-100 rounded-lg p-4 shadow-inner">
            {light.distance_cm === -1 ? '거리정보 없음' : `거리: ${light.distance_cm} cm`}
          </div>

          {/* Traffic Light Housing */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
            <div className="bg-gray-900 p-4 rounded-lg space-y-6">
              {/* Red Light */}
              <div
                className={`w-20 h-20 rounded-full transition-all duration-300 ${
                  light.status === 'red'
                    ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-105'
                    : 'bg-red-900/30'
                }`}
                aria-label={light.status === 'red' ? 'Red light active' : 'Red light inactive'}
              />
              {/* Yellow Light */}
              <div
                className={`w-20 h-20 rounded-full transition-all duration-300 ${
                  light.status === 'yellow'
                    ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 scale-105'
                    : 'bg-yellow-900/30'
                }`}
                aria-label={light.status === 'yellow' ? 'Yellow light active' : 'Yellow light inactive'}
              />
              {/* Green Light */}
              <div
                className={`w-20 h-20 rounded-full transition-all duration-300 ${
                  light.status === 'green'
                    ? 'bg-green-500 shadow-lg shadow-green-500/50 scale-105'
                    : 'bg-green-900/30'
                }`}
                aria-label={light.status === 'green' ? 'Green light active' : 'Green light inactive'}
              />
            </div>
          </div>

          {/* Status Information */}
          <div className="text-center space-y-2">
            <div className="text-xl font-semibold">
              신호 상태: 
              <span
                className={`ml-2 ${
                  light.status === 'red'
                    ? 'text-red-500'
                    : light.status === 'yellow'
                    ? 'text-yellow-400'
                    : 'text-green-500'
                }`}
              >
                {light.status.charAt(0).toUpperCase() + light.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-500">{light.last_updated}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-center mt-8">
      <br />
      <p className="text-gray-500">현재 연결된 사용자 수: {connectedUsers}명</p>
    </div>
    </div>
  );
};

export default TrafficLight;
