import { DurableObject } from "cloudflare:workers";
import type { D1Database } from '@cloudflare/workers-types';

interface TrafficLight {
    id: number;
    distance_cm: number;
    status: 'red' | 'yellow' | 'green';
    last_updated: string;
  }

export interface Env {
    WEBSOCKET_SERVER: DurableObjectNamespace<WebSocketServer>;
  }
  
  // Worker
  export default {
    async fetch(request, env, ctx): Promise<Response> {

      if (request.url.endsWith("/websocket")) {
        // Expect to receive a WebSocket Upgrade request.
        // If there is one, accept the request and return a WebSocket Response.
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
          return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
        }
  
        // This example will refer to the same Durable Object,
        // since the name "foo" is hardcoded.
        let id = env.WEBSOCKET_SERVER.idFromName("foo");
        let stub = env.WEBSOCKET_SERVER.get(id);
  
        return stub.fetch(request);
      }
      
      return new Response(null, {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  } satisfies ExportedHandler<Env>;
  
  // Durable Object
  export class WebSocketServer extends DurableObject {
    currentlyConnectedWebSockets: number;
    trafficLightData: Record<string | number, TrafficLight>;
    connectedClients: Set<WebSocket>;
    dbPollingIntervalMs: number;
  
    constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env);
      this.currentlyConnectedWebSockets = 0;
      this.trafficLightData = {};
      this.connectedClients = new Set();
      this.dbPollingIntervalMs = 100; // Poll every 100ms
      this.startPollingDatabase();
    }
  
    async fetch(request: Request): Promise<Response> {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
  
      server.accept();
      this.connectedClients.add(server);
      this.currentlyConnectedWebSockets++;
  
      // Handle client messages
      server.addEventListener('message', (event: MessageEvent) => {
        server.send(`[Durable Object] Connections: ${this.currentlyConnectedWebSockets}`);
      });
  
      // Handle client disconnections
      server.addEventListener('close', () => {
        this.connectedClients.delete(server);
        this.currentlyConnectedWebSockets--;
      });
  
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
  
    // Polling loop for the database
    async startPollingDatabase() {
      while (true) {
        try {
          const updatedData = await this.fetchTrafficLightData();
          const hasUpdates = this.detectChanges(updatedData);
  
          if (hasUpdates) {
            this.trafficLightData = updatedData;
            this.broadcastUpdates();
          }
        } catch (error) {
          console.error('[Polling Error]:', error);
        }
  
        // Wait for the polling interval before next poll
        await new Promise(resolve => setTimeout(resolve, this.dbPollingIntervalMs));
      }
    }
  
    async fetchTrafficLightData(): Promise<Record<number, TrafficLight>> {
      const db = process.env.DB as unknown as D1Database;
  
      const stmt = await db.prepare(
        `SELECT id, distance_cm, status, last_updated 
         FROM traffic_lights 
         WHERE id IN (1, 2)`
      );
  
      const result = await stmt.all<TrafficLight>();
      const rows = result.results || [];
  
      return rows.reduce((acc, light) => {
        acc[light.id] = light;
        return acc;
      }, {} as Record<number, TrafficLight>);
    }
  
    detectChanges(newData: Record<number, TrafficLight>): boolean {
      if (Object.keys(this.trafficLightData).length !== Object.keys(newData).length) {
        return true;
      }
  
      for (const [id, light] of Object.entries(newData)) {
        if (
          !this.trafficLightData[id] ||
          this.trafficLightData[id].status !== light.status ||
          this.trafficLightData[id].distance_cm !== light.distance_cm ||
          this.trafficLightData[id].last_updated !== light.last_updated
        ) {
          return true;
        }
      }
  
      return false;
    }
  
    broadcastUpdates() {
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
  
