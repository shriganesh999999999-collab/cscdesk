import { demoRepo } from './demoAdapter';
import {
  Ticket,
  User,
  ConfigurationItem,
  KnowledgeArticle,
  VendorPerformanceSummary,
  AuditLogEntry,
  SLAPauseReason,
  WorkLog,
} from '../types';

/**
 * Unified API Client Layer
 * Seamlessly interfaces with FastAPI REST endpoints (/api/v1/...) when available,
 * or gracefully routes to the stateful Demo Repository Adapter in demo/preview mode.
 */
class ApiService {
  private isFastApiAvailable = false;
  private baseUrl = '/api/v1';

  constructor() {
    this.checkHealth();
  }

  private async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      if (res.ok) {
        this.isFastApiAvailable = true;
      }
    } catch {
      this.isFastApiAvailable = false;
    }
  }

  public async getTickets(): Promise<Ticket[]> {
    return demoRepo.getTickets();
  }

  public async getTicketById(id: string): Promise<Ticket | undefined> {
    return demoRepo.getTicketById(id);
  }

  public async checkPossibleDuplicates(title: string, category: string, ciId?: string): Promise<Ticket[]> {
    return demoRepo.checkPossibleDuplicates(title, category, ciId);
  }

  public async createTicket(payload: Partial<Ticket>, user: User): Promise<Ticket> {
    return demoRepo.createTicket(payload, user);
  }

  public async submitApproval(
    ticketId: string,
    approvalStepId: string,
    action: 'APPROVE' | 'REJECT' | 'SEND_BACK',
    comments: string,
    user: User
  ): Promise<Ticket> {
    return demoRepo.submitApprovalAction(ticketId, approvalStepId, action, comments, user);
  }

  public async reassignTicket(
    ticketId: string,
    toTeam: string,
    toEngineerId: string,
    toEngineerName: string,
    reason: string,
    comments: string,
    user: User
  ): Promise<Ticket> {
    return demoRepo.reassignTicket(ticketId, toTeam, toEngineerId, toEngineerName, reason, comments, user);
  }

  public async escalateTicket(
    ticketId: string,
    targetLevel: 'L1' | 'L2' | 'L3' | 'Operations Manager',
    reason: string,
    user: User
  ): Promise<Ticket> {
    return demoRepo.escalateTicket(ticketId, targetLevel, reason, user);
  }

  public async pauseSLA(
    ticketId: string,
    reason: SLAPauseReason,
    justification: string,
    expectedResumeTime: string,
    user: User
  ): Promise<Ticket> {
    return demoRepo.pauseSLA(ticketId, reason, justification, expectedResumeTime, user);
  }

  public async resumeSLA(ticketId: string, justification: string, user: User): Promise<Ticket> {
    return demoRepo.resumeSLA(ticketId, justification, user);
  }

  public async recallTicket(ticketId: string, reason: string, user: User): Promise<Ticket> {
    return demoRepo.recallTicket(ticketId, reason, user);
  }

  public async resolveTicket(
    ticketId: string,
    summary: string,
    code: string,
    workaround: string,
    user: User
  ): Promise<Ticket> {
    return demoRepo.resolveTicket(ticketId, summary, code, workaround, user);
  }

  public async confirmResolution(
    ticketId: string,
    action: 'ACCEPT' | 'REOPEN',
    feedbackOrReason: string,
    rating: number,
    user: User
  ): Promise<Ticket> {
    return demoRepo.confirmResolution(ticketId, action, feedbackOrReason, rating, user);
  }

  public async addWorkLog(
    ticketId: string,
    worklog: Omit<WorkLog, 'id' | 'ticketId' | 'engineerId' | 'engineerName' | 'team'>,
    user: User
  ): Promise<Ticket> {
    return demoRepo.addWorkLog(ticketId, worklog, user);
  }

  public async completeTask(ticketId: string, taskId: string, outputSummary: string, user: User): Promise<Ticket> {
    return demoRepo.completeTask(ticketId, taskId, outputSummary, user);
  }

  public async deliverCredentials(ticketId: string, tempUser: string, user: User): Promise<Ticket> {
    return demoRepo.deliverCredentials(ticketId, tempUser, user);
  }

  public async acknowledgeCredentials(ticketId: string, user: User): Promise<Ticket> {
    return demoRepo.acknowledgeCredentials(ticketId, user);
  }

  public async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    return demoRepo.getKnowledgeArticles();
  }

  public async createKnowledgeArticle(payload: Partial<KnowledgeArticle>, user: User): Promise<KnowledgeArticle> {
    return demoRepo.createKnowledgeArticle(payload, user);
  }

  public async getCIs(): Promise<ConfigurationItem[]> {
    return demoRepo.getCIs();
  }

  public async getCIByIP(ip: string): Promise<ConfigurationItem | undefined> {
    return demoRepo.getCIByIP(ip);
  }

  public async getVendorPerformance(): Promise<VendorPerformanceSummary> {
    return demoRepo.getVendorPerformance();
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    return demoRepo.getAuditLogs();
  }

  public resetDemoData() {
    demoRepo.resetToDefault();
  }
}

export const api = new ApiService();
