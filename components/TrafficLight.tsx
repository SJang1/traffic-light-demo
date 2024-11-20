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
  const [status, setStatus] = useState<TrafficLightStatus>('red');
  const [distance, setDistance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

// *************************************** Force Update Test *************************************** //

  /*
const handleClickRed = async () => {
    const data = {
      status: "red",
      distance_cm: -1,
    };
  
    try {
      // Make the POST request using the Fetch API
      const response = await fetch('/api/update', { // Replace '/api/your-endpoint' with your API URL or endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      // Check for successful response
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const responseData = await response.json();
      console.log('Success:', responseData);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const handleClickYellow = async () => {
    const data = {
      status: "yellow",
      distance_cm: -1,
    };
  
    try {
      // Make the POST request using the Fetch API
      const response = await fetch('/api/update', { // Replace '/api/your-endpoint' with your API URL or endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      // Check for successful response
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const responseData = await response.json();
      console.log('Success:', responseData);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  
  const handleClickGreen = async () => {
    const data = {
      status: "green",
      distance_cm: -1,
    };
  
    try {
      // Make the POST request using the Fetch API
      const response = await fetch('/api/update', { // Replace '/api/your-endpoint' with your API URL or endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      // Check for successful response
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const responseData = await response.json();
      console.log('Success:', responseData);
    } catch (error) {
      console.error('Error:', error);
    }
  };
*/
  // *************************************** Force Update Test End *************************************** //


  const convertToLocalTime = (utcString: string) => {
    const utcDate = new Date(utcString + "Z"); // Add "Z" to ensure it's treated as UTC
    return utcDate.toLocaleString(); // Convert to local timezone and format
  };
  
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/traffic');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data: TrafficLightData = await response.json();
      setStatus(data.status);
      setDistance(data.distance_cm);
      const localTime = convertToLocalTime(data.last_updated);
      setLastUpdated(localTime);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Distance Display */}
      <div className="text-xl font-semibold bg-gray-100 rounded-lg p-4 shadow-inner">
        {distance === -1 ? '수동 업데이트됨' : `거리: ${distance} cm`}
      </div>

      {/* Traffic Light Housing */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
        <div className="bg-gray-900 p-4 rounded-lg space-y-6">
          {/* Red Light */}
          <div 
            className={`w-20 h-20 rounded-full transition-all duration-300 ${
              status === 'red' 
                ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-105' 
                : 'bg-red-900/30'
            }`}
            aria-label={status === 'red' ? 'Red light active' : 'Red light inactive'}
          />
          {/* Yellow Light */}
          <div 
            className={`w-20 h-20 rounded-full transition-all duration-300 ${
              status === 'yellow' 
                ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 scale-105' 
                : 'bg-yellow-900/30'
            }`}
            aria-label={status === 'yellow' ? 'Yellow light active' : 'Yellow light inactive'}
          />
          {/* Green Light */}
          <div 
            className={`w-20 h-20 rounded-full transition-all duration-300 ${
              status === 'green' 
                ? 'bg-green-500 shadow-lg shadow-green-500/50 scale-105' 
                : 'bg-green-900/30'
            }`}
            aria-label={status === 'green' ? 'Green light active' : 'Green light inactive'}
          />
        </div>
      </div>

      {/* Status Information */}
      <div className="text-center space-y-2">
        <div className="text-xl font-semibold">
          현재 신호: 
          <span className={`ml-2 ${
            status === 'red' ? 'text-red-500' :
            status === 'yellow' ? 'text-yellow-400' :
            'text-green-500'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          업데이트 시간: {lastUpdated}
        </div>
      </div>

      {/*
      <div>
        강제 웹사이트 업데이트 버튼 (신호등이 바뀌지는 않습니다)
          <span>
            <button onClick={handleClickRed}>Red</button> 
            <button onClick={handleClickYellow}>Yellow</button> 
            <button onClick={handleClickGreen}>Green</button>
          </span>
      </div>
      */}
    </div>
  );
};

export default TrafficLight;
