// app/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the TrafficLight component with no SSR
const TrafficLight = dynamic(() => import('@/components/TrafficLight'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  ),
});


const handleClickRed = async () => {
  const data = {
    status: "red",
    distance_cm: 0,
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
    distance_cm: 0,
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
    distance_cm: 0,
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


export default function Home() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          신호등 상태 모니터링
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          준-실시간으로 신호등 상태를 모니터링할 수 있는 시스템입니다.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="max-w-md mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animaTraffic Light Monitor

Real-time traffic light monitoring system powered by Cloudflare Pages and D1 Database.te-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }>
            <TrafficLight />
          </Suspense>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            실시간 업데이트
          </h2>
          <p className="text-gray-600">
            신호등 정보는 매 ½초마다 업데이트됩니다. 이는 Cloudflare의 Serverless Platform을 이용해서 가능해졌습니다.
          </p>
        </div>

        {/* Database Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            데이터베이스
          </h2>
          <p className="text-gray-600">
            Cloudflare의 D1 SQL 데이터베이스를 이용해서, 신속하고 안정적으로 서비스를 제공할 수 있습니다.
          </p>
        </div>

        {/* Edge Network Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            네트워크
          </h2>
          <p className="text-gray-600">
            전세계 어디서나 낮은 지연시간으로 실시간으로 신호등 정보를 알 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
