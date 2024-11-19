'use client';

import React, { useEffect, useState } from 'react';

// Type for our traffic light status
type TrafficLightStatus = 'red' | 'yellow' | 'green';

// Type for our API response
interface TrafficLightData {
  id: number;
  location: string;
  status: TrafficLightStatus;
  last_updated: string;
}

// Custom error class for type safety
class TrafficLightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrafficLightError';
  }
}

const TrafficLight = () => {
  const [status, setStatus] = useState<TrafficLightStatus>('red');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/traffic');
      
      if (!response.ok) {
        throw new TrafficLightError(
          `Failed to fetch status: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Type guard to ensure the response matches our expected structure
      if (!isTrafficLightData(data)) {
        throw new TrafficLightError('Invalid data format received from server');
      }

      setStatus(data.status);
      setLastUpdated(new Date(data.last_updated).toLocaleTimeString());
      setError(null);
    } catch (error) {
      // Proper error handling with type narrowing
      if (error instanceof TrafficLightError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Type guard function to validate API response
  const isTrafficLightData = (data: any): data is TrafficLightData => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.id === 'number' &&
      typeof data.location === 'string' &&
      typeof data.status === 'string' &&
      ['red', 'yellow', 'green'].includes(data.status) &&
      typeof data.last_updated === 'string'
    );
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
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
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
          Current Status: 
          <span className={`ml-2 ${
            status === 'red' ? 'text-red-500' :
            status === 'yellow' ? 'text-yellow-400' :
            'text-green-500'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Last Updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default TrafficLight;