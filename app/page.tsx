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

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Traffic Light Monitor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real-time traffic light monitoring system powered by Cloudflare Pages and D1 Database.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="max-w-md mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
            Real-time Updates
          </h2>
          <p className="text-gray-600">
            Traffic light status is updated every second using Cloudflare's edge network.
          </p>
        </div>

        {/* Database Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            D1 Database
          </h2>
          <p className="text-gray-600">
            Powered by Cloudflare D1, providing fast and reliable data storage at the edge.
          </p>
        </div>

        {/* Edge Network Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Global Edge Network
          </h2>
          <p className="text-gray-600">
            Deployed on Cloudflare's global network for minimal latency worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}