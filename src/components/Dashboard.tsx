'use client';

import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

interface DeviceStatus {
  name: string;
  ip: string;
  status: 'UP' | 'DOWN';
  latency: number | null;
  checked_at: string;
  ts: string;
}

export default function Dashboard() {
  const [devices, setDevices]       = useState<Record<string, DeviceStatus>>({});
  const [connected, setConnected]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const client = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_URL!, {
      username:        process.env.NEXT_PUBLIC_MQTT_USERNAME,
      password:        process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      reconnectPeriod: 5000,
    });

    client.on('connect', () => {
      setConnected(true);
      client.subscribe('/iot/mikrotik-wg-pln/+/telemetry');
    });

    client.on('disconnect', () => setConnected(false));
    client.on('error',      () => setConnected(false));

    client.on('message', (_topic, message) => {
      try {
        const parsed = JSON.parse(message.toString());
        const d: DeviceStatus = { ...parsed.data, ts: parsed.ts };
        setDevices(prev => ({ ...prev, [d.name]: d }));
        setLastUpdated(new Date());
      } catch (e) {
        console.error('Failed to parse MQTT message', e);
      }
    });

    return () => { client.end(); };
  }, []);

  const deviceList = Object.values(devices).sort((a, b) => {
    // 1. UP before DOWN
    if (a.status !== b.status) return a.status === 'UP' ? -1 : 1;
    // 2. Both UP → fastest latency first (null goes last)
    if (a.status === 'UP') {
      if (a.latency === null && b.latency === null) return a.name.localeCompare(b.name);
      if (a.latency === null) return 1;
      if (b.latency === null) return -1;
      return a.latency - b.latency;
    }
     // 3. Both DOWN → alphabetical
    return a.name.localeCompare(b.name);
  }
   
  );
  const upCount   = deviceList.filter(d => d.status === 'UP').length;
  const downCount = deviceList.filter(d => d.status === 'DOWN').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">WireGuard Monitor</h1>
          <p className="text-gray-400 text-sm mt-1">MikroTik Peer Status</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          connected
            ? 'bg-green-900/40 text-green-400'
            : 'bg-red-900/40 text-red-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',   value: deviceList.length, color: 'text-white' },
          { label: 'Online',  value: upCount,           color: 'text-green-400' },
          { label: 'Offline', value: downCount,         color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className={`text-xs ${color} mb-1`}>{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Device grid */}
      {deviceList.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-gray-600">
          <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0
                 M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <p className="text-lg">Waiting for data…</p>
          <p className="text-sm mt-1">Check Node-RED and MQTT connection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {deviceList.map(device => (
            <div
              key={device.name}
              className={`bg-gray-900 rounded-xl p-5 border transition-colors ${
                device.status === 'UP'
                  ? 'border-green-800/50'
                  : 'border-red-800/50'
              }`}
            >
              {/* Device header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-sm text-white">{device.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5 font-mono">{device.ip}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  device.status === 'UP'
                    ? 'bg-green-900/60 text-green-400'
                    : 'bg-red-900/60 text-red-400'
                }`}>
                  {device.status}
                </span>
              </div>

              {/* Latency bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Latency</span>
                  <span className={device.status === 'UP' ? 'text-green-400' : 'text-gray-600'}>
                    {device.latency !== null ? `${device.latency} ms` : '—'}
                  </span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      device.status === 'UP' ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                    style={{
                      width: device.latency !== null
                        ? `${Math.min((device.latency / 200) * 100, 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Checked at */}
              <p className="text-gray-600 text-xs">
                {new Date(device.checked_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-gray-700 text-xs mt-10">
        {lastUpdated
          ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
          : 'No data received yet'}
      </p>
    </div>
  );
}