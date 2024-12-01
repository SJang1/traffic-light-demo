import type { D1Database } from '@cloudflare/workers-types';
import { NextRequest } from 'next/server';

interface TrafficLight {
  id: number;
  distance_cm: number;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

export class TrafficLightDurableObject implements DurableObject {
  private trafficLightData: Record<number, TrafficLight>;
  private connectedClients: Set<WebSocket>;
  private dbPollingIntervalMs: number;
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.trafficLightData = {};
    this.connectedClients = new Set();
    this.dbPollingIntervalMs = 100; // Poll every 100ms
    this.startPollingDatabase();
  }

  async fetch(request: NextRequest): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      server.accept();
      this.connectedClients.add(server);

      // Handle client messages (if needed)
      server.addEventListener('message', (event: MessageEvent) => {
        console.log('[Client Message]:', event.data);
      });

      // Handle client disconnections
      server.addEventListener('close', () => {
        this.connectedClients.delete(server);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // Non-WebSocket requests are not supported
    return new Response('Expected a WebSocket connection.', { status: 426 });
  }

  private async startPollingDatabase() {
    while (true) {
      try {
        const updatedData = await this.fetchTrafficLightData();
        if (this.detectChanges(updatedData)) {
          this.trafficLightData = updatedData;
          this.broadcastUpdates();
        }
      } catch (error) {
        console.error('[Polling Error]:', error);
      }

      // Wait for the polling interval before the next poll
      await new Promise(resolve => setTimeout(resolve, this.dbPollingIntervalMs));
    }
  }

  private async fetchTrafficLightData(): Promise<Record<number, TrafficLight>> {
    const db = process.env.DB as unknown as D1Database;

    const stmt = await db.prepare(
      `SELECT id, distance_cm, status, last_updated 
       FROM traffic_lights`
    );

    const result = await stmt.all<TrafficLight>();
    const rows = result.results || [];

    return rows.reduce((acc, light) => {
      acc[light.id] = light;
      return acc;
    }, {} as Record<number, TrafficLight>);
  }

  private detectChanges(newData: Record<number, TrafficLight>): boolean {
    if (Object.keys(this.trafficLightData).length !== Object.keys(newData).length) {
      return true;
    }

    for (const [id, light] of Object.entries(newData)) {
      const numericId = Number(id);
      if (
        !this.trafficLightData[numericId] ||
        this.trafficLightData[numericId].status !== light.status ||
        this.trafficLightData[numericId].distance_cm !== light.distance_cm ||
        this.trafficLightData[numericId].last_updated !== light.last_updated
      ) {
        return true;
      }
    }

    return false;
  }

  private broadcastUpdates() {
    const updateMessage = JSON.stringify(this.trafficLightData);
  
    Array.from(this.connectedClients).forEach(client => {
      try {
        client.send(updateMessage);
      } catch (error) {
        console.error('[WebSocket Error]: Unable to send update', error);
        this.connectedClients.delete(client); // Remove failed client
      }
    });
  }  
}
