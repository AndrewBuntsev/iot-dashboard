'use client';

import ChartsDashboard from "./ChartsDashboard";

const devices = ['Living_Room', 'Garage'];

export default function Dashboard() {
  return (
    <div className="p-4">
      <ChartsDashboard devices={devices} />
    </div>
  );
}
