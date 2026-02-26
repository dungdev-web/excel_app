// src/comparison/comparison.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ActiveSession {
  sessionId: string;
  users: { id: string; name: string }[];
  companies: string[];
  comparison: any;
  createdAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
})
export class ComparisonGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeSessions = new Map<string, ActiveSession>();
  private userSessions = new Map<string, string>(); // userId -> sessionId

  handleConnection(client: Socket) {
    console.log(`User ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    const sessionId = this.userSessions.get(client.id);
    if (sessionId) {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.users = session.users.filter((u) => u.id !== client.id);
        this.server.to(sessionId).emit('userLeft', {
          userId: client.id,
          remainingUsers: session.users.length,
        });

        if (session.users.length === 0) {
          this.activeSessions.delete(sessionId);
        }
      }
    }
    console.log(`User ${client.id} disconnected`);
  }

  @SubscribeMessage('joinSession')
  handleJoinSession(client: Socket, data: { sessionId: string; userName: string }) {
    const { sessionId, userName } = data;

    client.join(sessionId);
    this.userSessions.set(client.id, sessionId);

    let session = this.activeSessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        users: [],
        companies: [],
        comparison: null,
        createdAt: new Date(),
      };
      this.activeSessions.set(sessionId, session);
    }

    session.users.push({ id: client.id, name: userName });

    this.server.to(sessionId).emit('userJoined', {
      users: session.users,
      message: `${userName} joined the session`,
    });
  }

  @SubscribeMessage('selectCompany')
  handleSelectCompany(client: Socket, data: { sessionId: string; company: any }) {
    const session = this.activeSessions.get(data.sessionId);
    if (session) {
      session.companies.push(data.company.id);
      this.server.to(data.sessionId).emit('companySelected', {
        company: data.company,
        totalSelected: session.companies.length,
        users: session.users.length,
      });
    }
  }

  @SubscribeMessage('shareComparison')
  handleShareComparison(client: Socket, data: { sessionId: string; comparison: any }) {
    const session = this.activeSessions.get(data.sessionId);
    if (!session) return;

    const { company1, company2 } = data.comparison;

    // Tính winner dựa trên avgSalary nếu có, fallback về score, fallback về draw
    const score1 = company1?.avgSalary ?? company1?.score ?? 0;
    const score2 = company2?.avgSalary ?? company2?.score ?? 0;

    let winner: 'company1' | 'company2' | 'draw';
    if (score1 > score2) winner = 'company1';
    else if (score2 > score1) winner = 'company2';
    else winner = 'draw';

    const comparisonWithWinner = {
      ...data.comparison,
      winner,
    };

    session.comparison = comparisonWithWinner;

    this.server.to(data.sessionId).emit('comparisonShared', {
      comparison: comparisonWithWinner,
      sharedBy: client.id,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('getActiveSessions')
  handleGetSessions() {
    const sessions = Array.from(this.activeSessions.values()).map((s) => ({
      sessionId: s.sessionId,
      users: s.users.length,
      companies: s.companies.length,
      createdAt: s.createdAt,
    }));
    return sessions;
  }
}