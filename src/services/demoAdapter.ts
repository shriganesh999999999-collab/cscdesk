import {
  Ticket,
  User,
  ConfigurationItem,
  KnowledgeArticle,
  VendorPerformanceSummary,
  AuditLogEntry,
  WorkLog,
  SLAPauseReason,
  TicketTask,
  ApprovalStep,
} from '../types';
import {
  INITIAL_TICKETS,
  SEEDED_CIS,
  SEEDED_KB_ARTICLES,
  VENDOR_PERFORMANCE_METRICS,
  SEEDED_AUDIT_LOGS,
  ALL_ORGANIZATION_USERS,
} from './mockData';

const STORAGE_KEYS = {
  TICKETS: 'enterprise_itsm_tickets_v1',
  CIS: 'enterprise_itsm_cis_v1',
  KB: 'enterprise_itsm_kb_v1',
  AUDIT: 'enterprise_itsm_audit_v1',
  VENDOR: 'enterprise_itsm_vendor_v1',
};

class DemoRepositoryAdapter {
  private tickets: Ticket[] = [];
  private cis: ConfigurationItem[] = [];
  private kbArticles: KnowledgeArticle[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private vendorMetrics: VendorPerformanceSummary = VENDOR_PERFORMANCE_METRICS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (storedTickets) {
        this.tickets = JSON.parse(storedTickets);
      } else {
        this.tickets = [...INITIAL_TICKETS];
        this.saveTickets();
      }

      const storedCis = localStorage.getItem(STORAGE_KEYS.CIS);
      if (storedCis) {
        this.cis = JSON.parse(storedCis);
      } else {
        this.cis = [...SEEDED_CIS];
      }

      const storedKb = localStorage.getItem(STORAGE_KEYS.KB);
      if (storedKb) {
        this.kbArticles = JSON.parse(storedKb);
      } else {
        this.kbArticles = [...SEEDED_KB_ARTICLES];
      }

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [...SEEDED_AUDIT_LOGS];
      }
    } catch {
      this.tickets = [...INITIAL_TICKETS];
      this.cis = [...SEEDED_CIS];
      this.kbArticles = [...SEEDED_KB_ARTICLES];
      this.auditLogs = [...SEEDED_AUDIT_LOGS];
    }
  }

  private saveTickets() {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(this.tickets));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  private saveAudit() {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  private saveKb() {
    try {
      localStorage.setItem(STORAGE_KEYS.KB, JSON.stringify(this.kbArticles));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  public recordAuditLog(
    actor: User,
    action: string,
    targetType: string,
    targetId: string,
    targetIdentifier: string,
    details?: { oldVal?: string; newVal?: string; reason?: string }
  ) {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      ipAddress: '10.240.4.102',
      action,
      targetType,
      targetId,
      targetIdentifier,
      oldValues: details?.oldVal,
      newValues: details?.newVal,
      reason: details?.reason,
    };
    this.auditLogs.unshift(entry);
    this.saveAudit();
  }

  public getTickets(): Ticket[] {
    return [...this.tickets];
  }

  public getTicketById(id: string): Ticket | undefined {
    return this.tickets.find((t) => t.id === id || t.ticketNumber === id);
  }

  public checkPossibleDuplicates(title: string, category: string, affectedCIId?: string): Ticket[] {
    const query = title.toLowerCase();
    return this.tickets.filter((t) => {
      if (t.status === 'CLOSED' || t.status === 'CANCELLED' || t.status === 'RECALLED') return false;
      const titleMatch = t.title.toLowerCase().includes(query) || query.includes(t.title.toLowerCase().slice(0, 15));
      const ciMatch = affectedCIId && t.affectedCIId === affectedCIId;
      const catMatch = t.category === category;
      return (titleMatch && catMatch) || ciMatch;
    });
  }

  public createTicket(payload: Partial<Ticket>, currentUser: User): Ticket {
    const now = new Date();
    const count = this.tickets.length + 1;
    const padded = String(count).padStart(6, '0');

    let prefix = 'INC';
    if (payload.ticketType === 'VM Request') prefix = 'VMR';
    else if (payload.ticketType === 'Firewall Whitelist' || payload.ticketType === 'Service Request') prefix = 'REQ';
    else if (payload.ticketType === 'Change Request') prefix = 'CHG';
    else if (payload.ticketType === 'Problem') prefix = 'PRB';
    else if (payload.ticketType === 'Monitoring Review') prefix = 'MON';
    else if (payload.ticketType === 'Backup Review') prefix = 'BKP';

    const ticketNumber = `${prefix}-2026-${padded}`;
    const id = `tkt-gen-${Date.now()}`;

    // Calculate SLA Targets based on priority
    let responseMinutes = 120;
    let resolutionMinutes = 480;
    if (payload.priority === 'P1') {
      responseMinutes = 15;
      resolutionMinutes = 120; // 2 hours
    } else if (payload.priority === 'P2') {
      responseMinutes = 30;
      resolutionMinutes = 240; // 4 hours
    } else if (payload.priority === 'P3') {
      responseMinutes = 120;
      resolutionMinutes = 480; // 8 hours
    } else if (payload.priority === 'P4') {
      responseMinutes = 240;
      resolutionMinutes = 2880; // 2 business days
    }

    const targetTime = new Date(now.getTime() + resolutionMinutes * 60 * 1000);

    // Setup Approval Chain
    const approvals: ApprovalStep[] = [];
    if (payload.ticketType === 'VM Request') {
      approvals.push(
        {
          id: `app-vm-1-${id}`,
          stageName: 'Supervisor Approval',
          approverRole: 'Supervisor',
          approverName: currentUser.managerName || 'Sarah Jenkins',
          status: 'PENDING',
          isMandatory: true,
        },
        {
          id: `app-vm-2-${id}`,
          stageName: 'Infra Head Approval',
          approverRole: 'Infra Head',
          approverName: 'Marcus Vance',
          status: 'PENDING',
          isMandatory: true,
        },
        {
          id: `app-vm-3-${id}`,
          stageName: 'Operations Manager Dispatch',
          approverRole: 'Operations Manager',
          approverName: 'David Zhao',
          status: 'PENDING',
          isMandatory: true,
        }
      );
    } else if (payload.ticketType === 'Firewall Whitelist') {
      approvals.push(
        {
          id: `app-fw-1-${id}`,
          stageName: 'Supervisor Approval',
          approverRole: 'Supervisor',
          approverName: currentUser.managerName || 'Sarah Jenkins',
          status: 'PENDING',
          isMandatory: true,
        },
        {
          id: `app-fw-2-${id}`,
          stageName: 'Security Review & CISO Sign-off',
          approverRole: 'CISO',
          approverName: 'Evelyn Reed',
          status: 'PENDING',
          isMandatory: true,
        },
        {
          id: `app-fw-3-${id}`,
          stageName: 'Infra Head Approval',
          approverRole: 'Infra Head',
          approverName: 'Marcus Vance',
          status: 'PENDING',
          isMandatory: true,
        },
        {
          id: `app-fw-4-${id}`,
          stageName: 'NOC / Network Implementation',
          approverRole: 'Operations Manager',
          approverName: 'David Zhao',
          status: 'PENDING',
          isMandatory: true,
        }
      );
    } else if (payload.ticketType === 'Change Request') {
      approvals.push(
        {
          id: `app-chg-1-${id}`,
          stageName: 'CAB Review & Window Scheduling',
          approverRole: 'Operations Manager',
          approverName: 'David Zhao',
          status: 'PENDING',
          isMandatory: true,
        },
        {
          id: `app-chg-2-${id}`,
          stageName: 'CISO Risk Review',
          approverRole: 'CISO',
          approverName: 'Evelyn Reed',
          status: 'PENDING',
          isMandatory: true,
        }
      );
    }

    // Setup Child Tasks for VM Request
    const tasks: TicketTask[] = [];
    if (payload.ticketType === 'VM Request') {
      tasks.push(
        {
          id: `tsk-vm-1-${id}`,
          taskNumber: 'TASK-001',
          title: 'Cloud Provisioning: Create Virtual Machines in vSphere/OpenStack',
          description: 'Deploy OS templates, allocate compute vCPU, RAM, and root disk volumes.',
          team: 'Cloud Operations Team',
          status: 'QUEUED',
          olaTargetHours: 3,
          olaElapsedHours: 0,
        },
        {
          id: `tsk-vm-2-${id}`,
          taskNumber: 'TASK-002',
          title: 'Network Work Order: VLAN Routing & Static IP Assignment',
          description: 'Allocate IPs in private network segment, register reverse DNS.',
          team: 'Network & Security',
          status: 'PENDING',
          olaTargetHours: 2,
          olaElapsedHours: 0,
          dependsOnTaskId: `tsk-vm-1-${id}`,
        },
        {
          id: `tsk-vm-3-${id}`,
          taskNumber: 'TASK-003',
          title: 'Firewall Policy: Configure Inter-VLAN Ports & Security Groups',
          description: 'Configure east-west application and database connectivity rules.',
          team: 'Network & Security',
          status: 'PENDING',
          olaTargetHours: 1,
          olaElapsedHours: 0,
          dependsOnTaskId: `tsk-vm-2-${id}`,
        },
        {
          id: `tsk-vm-4-${id}`,
          taskNumber: 'TASK-004',
          title: 'Storage & Backup Policy: Attach Gold SLA Snapshot Backup',
          description: 'Enable daily snapshot retention policy and backup catalog entry.',
          team: 'Backup & Storage',
          status: 'PENDING',
          olaTargetHours: 1,
          olaElapsedHours: 0,
        },
        {
          id: `tsk-vm-5-${id}`,
          taskNumber: 'TASK-005',
          title: 'NOC Monitoring: Install Zabbix & Prometheus Exporters',
          description: 'Configure standard infrastructure health monitoring and thresholds.',
          team: 'NOC & Monitoring',
          status: 'PENDING',
          olaTargetHours: 1,
          olaElapsedHours: 0,
        },
        {
          id: `tsk-vm-6-${id}`,
          taskNumber: 'TASK-006',
          title: 'Security Hardening: Apply CIS Baseline & CrowdStrike EDR Agent',
          description: 'Execute ansible security baseline playbook and verify endpoint protection.',
          team: 'Information Security',
          status: 'PENDING',
          olaTargetHours: 1,
          olaElapsedHours: 0,
        }
      );
    }

    const initialStatus = approvals.length > 0 ? 'PENDING_APPROVAL' : 'QUEUED';

    const newTicket: Ticket = {
      id,
      ticketNumber,
      title: payload.title || 'Untitled Request',
      description: payload.description || '',
      ticketType: payload.ticketType || 'Incident',
      status: initialStatus,
      priority: payload.priority || 'P3',
      impact: payload.impact || 'Department',
      urgency: payload.urgency || 'Medium',
      category: payload.category || 'General Infrastructure',
      subcategory: payload.subcategory || 'Standard Service',
      service: payload.service || 'Enterprise Cloud & Datacenter',
      department: payload.department || currentUser.department,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      requesterDepartment: currentUser.department,
      currentAssignmentGroup: payload.currentAssignmentGroup || 'IT Service Desk',
      currentAssigneeId: payload.currentAssigneeId,
      currentAssigneeName: payload.currentAssigneeName,
      businessOwner: currentUser.managerName || 'Sarah Jenkins',
      environment: payload.environment || 'PROD',
      affectedCIId: payload.affectedCIId,
      affectedCIName: payload.affectedCIName,
      affectedIP: payload.affectedIP,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      sla: {
        priority: payload.priority || 'P3',
        responseTargetMinutes: responseMinutes,
        resolutionTargetMinutes: resolutionMinutes,
        responseSLAStart: now.toISOString(),
        resolutionSLAStart: now.toISOString(),
        resolutionSLATarget: targetTime.toISOString(),
        elapsedMinutes: 0,
        pausedMinutes: 0,
        remainingMinutes: resolutionMinutes,
        percentageConsumed: 0,
        isPaused: false,
        isBreached: false,
        clockEvents: [
          {
            id: `clk-${Date.now()}`,
            eventType: 'STARTED',
            timestamp: now.toISOString(),
            actorName: currentUser.name,
            justification: 'Ticket created and SLA clock started',
          },
        ],
      },
      approvals,
      tasks,
      activities: [
        {
          id: `act-${Date.now()}`,
          timestamp: now.toISOString(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'Ticket Created',
          details: `Ticket created with status ${initialStatus} and priority ${payload.priority || 'P3'}.`,
          type: 'STATUS_CHANGE',
          newValue: initialStatus,
        },
      ],
      worklogs: [],
      customFields: payload.customFields || {},
      credentialHandover:
        payload.ticketType === 'VM Request'
          ? {
              isHandedOver: false,
              temporaryUsername: 'svc-auto-deploy',
              maskedPassword: '••••••••••••••••',
            }
          : undefined,
    };

    this.tickets.unshift(newTicket);
    this.saveTickets();

    this.recordAuditLog(
      currentUser,
      'TICKET_CREATE',
      'TICKET',
      newTicket.id,
      newTicket.ticketNumber,
      { newVal: `Status: ${newTicket.status}, Priority: ${newTicket.priority}` }
    );

    return newTicket;
  }

  public submitApprovalAction(
    ticketId: string,
    approvalStepId: string,
    action: 'APPROVE' | 'REJECT' | 'SEND_BACK',
    comments: string,
    currentUser: User
  ): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const stepIndex = ticket.approvals.findIndex((a) => a.id === approvalStepId);
    if (stepIndex === -1) throw new Error('Approval step not found');

    const step = ticket.approvals[stepIndex];
    if (action === 'REJECT' && (!comments || comments.trim().length === 0)) {
      throw new Error('Mandatory comments are required when rejecting a request.');
    }

    const now = new Date().toISOString();
    step.actionDate = now;
    step.comments = comments;
    step.approverUserId = currentUser.id;
    step.approverName = currentUser.name;

    if (action === 'APPROVE') {
      step.status = 'APPROVED';
      // Check if all mandatory steps are now approved
      const allApproved = ticket.approvals.every((a) => a.status === 'APPROVED');
      if (allApproved) {
        ticket.status = 'QUEUED';
        if (ticket.tasks.length > 0) {
          // Activate first task
          ticket.tasks[0].status = 'IN_PROGRESS';
        }
      }
    } else if (action === 'REJECT') {
      step.status = 'REJECTED';
      ticket.status = 'REJECTED';
    } else if (action === 'SEND_BACK') {
      step.status = 'SENT_BACK';
      ticket.status = 'PENDING_REQUESTER';
    }

    ticket.updatedAt = now;
    ticket.activities.unshift({
      id: `act-app-${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Approval: ${action}`,
      details: `Stage "${step.stageName}" evaluated to ${action}. Comments: ${comments || 'None'}.`,
      type: 'APPROVAL',
      newValue: ticket.status,
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      `APPROVAL_${action}`,
      'APPROVAL',
      step.id,
      ticket.ticketNumber,
      { newVal: `Stage: ${step.stageName} -> ${action}`, reason: comments }
    );

    return ticket;
  }

  public reassignTicket(
    ticketId: string,
    toTeam: string,
    toEngineerId: string,
    toEngineerName: string,
    reason: string,
    comments: string,
    currentUser: User
  ): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const fromTeam = ticket.currentAssignmentGroup;
    const fromEngineer = ticket.currentAssigneeName || 'Unassigned Queue';
    const now = new Date().toISOString();

    ticket.currentAssignmentGroup = toTeam;
    ticket.currentAssigneeId = toEngineerId;
    ticket.currentAssigneeName = toEngineerName;
    ticket.status = 'ASSIGNED';
    ticket.updatedAt = now;

    // SLA is explicitly NOT reset
    ticket.activities.unshift({
      id: `act-rea-${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Ticket Reassigned',
      details: `Reassigned from ${fromTeam} (${fromEngineer}) to ${toTeam} (${toEngineerName}). Reason: ${reason}. Notes: ${comments}. Original SLA preserved.`,
      type: 'ASSIGNMENT',
      oldValue: `${fromTeam} / ${fromEngineer}`,
      newValue: `${toTeam} / ${toEngineerName}`,
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      'TICKET_REASSIGN',
      'TICKET',
      ticket.id,
      ticket.ticketNumber,
      {
        oldVal: `${fromTeam} (${fromEngineer})`,
        newVal: `${toTeam} (${toEngineerName})`,
        reason: `${reason} - ${comments}`,
      }
    );

    return ticket;
  }

  public escalateTicket(
    ticketId: string,
    targetLevel: 'L1' | 'L2' | 'L3' | 'Operations Manager',
    reason: string,
    currentUser: User
  ): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const now = new Date().toISOString();
    const oldLevel = ticket.assignedLevel || 'L1';
    ticket.assignedLevel = targetLevel as any;
    ticket.updatedAt = now;

    ticket.activities.unshift({
      id: `act-esc-${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Functional Escalation',
      details: `Escalated from ${oldLevel} to ${targetLevel}. Reason: ${reason}. Single ticket integrity and SLA clock preserved.`,
      type: 'ASSIGNMENT',
      oldValue: oldLevel,
      newValue: targetLevel,
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      'FUNCTIONAL_ESCALATION',
      'TICKET',
      ticket.id,
      ticket.ticketNumber,
      { oldVal: oldLevel, newVal: targetLevel, reason }
    );

    return ticket;
  }

  public pauseSLA(
    ticketId: string,
    reason: SLAPauseReason,
    justification: string,
    expectedResumeTime: string,
    currentUser: User
  ): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    // Strict Business Rule check (Scenario 4)
    const VALID_REASONS: SLAPauseReason[] = [
      'Waiting for Requester',
      'Waiting for Approved Maintenance Window',
      'Waiting for Third Party',
      'Waiting for OEM',
      'Waiting for Vendor',
      'Waiting for Business Approval',
      'Waiting for Security Approval',
      'Waiting for External Dependency',
      'Planned Activity',
      'Force Majeure',
    ];

    if (!VALID_REASONS.includes(reason)) {
      throw new Error(`Invalid hold reason: "${reason}". SLA pause rejected by business rules engine.`);
    }

    if (!justification || justification.trim().length < 10) {
      throw new Error('A detailed justification (minimum 10 characters) is required to pause the SLA clock.');
    }

    const now = new Date().toISOString();
    ticket.status = 'ON_HOLD';
    ticket.sla.isPaused = true;
    ticket.sla.pauseReason = reason;
    ticket.sla.pausedAt = now;
    ticket.sla.pauseJustification = justification;
    ticket.sla.expectedResumeTime = expectedResumeTime;
    ticket.sla.pausedBy = currentUser.name;
    ticket.updatedAt = now;

    ticket.sla.clockEvents.push({
      id: `clk-${Date.now()}`,
      eventType: 'PAUSED',
      timestamp: now,
      actorName: currentUser.name,
      reason,
      justification,
    });

    ticket.activities.unshift({
      id: `act-pause-${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'SLA Clock Paused',
      details: `Ticket placed on hold. Reason: ${reason}. Justification: ${justification}. Expected resume: ${expectedResumeTime || 'TBD'}.`,
      type: 'SLA_HOLD',
      oldValue: 'IN_PROGRESS',
      newValue: 'ON_HOLD',
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      'SLA_PAUSED',
      'TICKET',
      ticket.id,
      ticket.ticketNumber,
      { newVal: `Reason: ${reason}`, reason: justification }
    );

    return ticket;
  }

  public resumeSLA(ticketId: string, justification: string, currentUser: User): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const now = new Date();
    if (ticket.sla.pausedAt) {
      const pausedStart = new Date(ticket.sla.pausedAt).getTime();
      const diffMin = Math.round((now.getTime() - pausedStart) / (1000 * 60));
      ticket.sla.pausedMinutes = (ticket.sla.pausedMinutes || 0) + Math.max(0, diffMin);

      // Extend target by the paused minutes
      const curTarget = new Date(ticket.sla.resolutionSLATarget).getTime();
      ticket.sla.resolutionSLATarget = new Date(curTarget + Math.max(0, diffMin) * 60 * 1000).toISOString();
    }

    ticket.status = 'IN_PROGRESS';
    ticket.sla.isPaused = false;
    ticket.sla.pauseReason = undefined;
    ticket.sla.pausedAt = undefined;
    ticket.sla.pausedBy = undefined;
    ticket.updatedAt = now.toISOString();

    ticket.sla.clockEvents.push({
      id: `clk-res-${Date.now()}`,
      eventType: 'RESUMED',
      timestamp: now.toISOString(),
      actorName: currentUser.name,
      justification: justification || 'Hold conditions cleared by engineer',
    });

    ticket.activities.unshift({
      id: `act-res-${Date.now()}`,
      timestamp: now.toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'SLA Clock Resumed',
      details: `Resumed SLA clock from hold. Notes: ${justification || 'Conditions cleared'}. Target extended accordingly.`,
      type: 'SLA_RESUME',
      oldValue: 'ON_HOLD',
      newValue: 'IN_PROGRESS',
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      'SLA_RESUMED',
      'TICKET',
      ticket.id,
      ticket.ticketNumber,
      { newVal: 'Status: IN_PROGRESS', reason: justification }
    );

    return ticket;
  }

  public recallTicket(ticketId: string, reason: string, currentUser: User): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    // Permitted only before engineering execution has advanced
    const PERMITTED_STATUSES = ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'QUEUED'];
    if (!PERMITTED_STATUSES.includes(ticket.status)) {
      throw new Error(`Cannot recall ticket in '${ticket.status}' status. Execution is already active.`);
    }

    const now = new Date().toISOString();
    const oldStatus = ticket.status;
    ticket.status = 'RECALLED';
    ticket.recalledAt = now;
    ticket.updatedAt = now;
    ticket.sla.isPaused = true;

    ticket.activities.unshift({
      id: `act-rcl-${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Ticket Recalled',
      details: `Requester pulled back ticket. Reason: ${reason || 'Accidental/duplicate request'}. Requester can edit and resubmit or permanently cancel.`,
      type: 'RECALL',
      oldValue: oldStatus,
      newValue: 'RECALLED',
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      'TICKET_RECALL',
      'TICKET',
      ticket.id,
      ticket.ticketNumber,
      { oldVal: oldStatus, newVal: 'RECALLED', reason }
    );

    return ticket;
  }

  public resolveTicket(
    ticketId: string,
    resolutionSummary: string,
    resolutionCode: string,
    workaround: string,
    currentUser: User
  ): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const now = new Date().toISOString();
    ticket.status = 'RESOLVED';
    ticket.resolvedAt = now;
    ticket.resolutionSummary = resolutionSummary;
    ticket.resolutionCode = resolutionCode;
    ticket.resolutionWorkaround = workaround;
    ticket.sla.resolutionSLAEnd = now;
    ticket.sla.isPaused = false;
    ticket.updatedAt = now;

    ticket.sla.clockEvents.push({
      id: `clk-res-${Date.now()}`,
      eventType: 'MET',
      timestamp: now,
      actorName: currentUser.name,
      justification: `Resolved with code: ${resolutionCode}`,
    });

    ticket.activities.unshift({
      id: `act-res-${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Ticket Resolved',
      details: `Resolution registered: ${resolutionSummary}. Awaiting requester confirmation.`,
      type: 'STATUS_CHANGE',
      oldValue: 'IN_PROGRESS',
      newValue: 'RESOLVED',
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      'TICKET_RESOLVE',
      'TICKET',
      ticket.id,
      ticket.ticketNumber,
      { newVal: `Code: ${resolutionCode}`, reason: resolutionSummary }
    );

    return ticket;
  }

  public confirmResolution(
    ticketId: string,
    action: 'ACCEPT' | 'REOPEN',
    feedbackOrReason: string,
    rating: number,
    currentUser: User
  ): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const now = new Date().toISOString();
    if (action === 'ACCEPT') {
      ticket.status = 'CLOSED';
      ticket.closedAt = now;
      ticket.customerSatisfaction = rating || 5;
      ticket.activities.unshift({
        id: `act-cls-${Date.now()}`,
        timestamp: now,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'Resolution Accepted',
        details: `Requester accepted resolution with CSAT rating ${rating}/5. Ticket formally closed.`,
        type: 'STATUS_CHANGE',
        oldValue: 'RESOLVED',
        newValue: 'CLOSED',
      });
    } else {
      ticket.status = 'REOPENED';
      ticket.reopenedAt = now;
      ticket.reopenCount = (ticket.reopenCount || 0) + 1;
      ticket.activities.unshift({
        id: `act-rop-${Date.now()}`,
        timestamp: now,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'Ticket Reopened',
        details: `Requester rejected resolution: ${feedbackOrReason}. Reopen count: ${ticket.reopenCount}.`,
        type: 'REOPEN',
        oldValue: 'RESOLVED',
        newValue: 'REOPENED',
      });
    }

    ticket.updatedAt = now;
    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      action === 'ACCEPT' ? 'TICKET_CLOSE' : 'TICKET_REOPEN',
      'TICKET',
      ticket.id,
      ticket.ticketNumber,
      { newVal: ticket.status, reason: feedbackOrReason }
    );

    return ticket;
  }

  public addWorkLog(
    ticketId: string,
    worklog: Omit<WorkLog, 'id' | 'ticketId' | 'engineerId' | 'engineerName' | 'team'>,
    currentUser: User
  ): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const newLog: WorkLog = {
      ...worklog,
      id: `wkl-${Date.now()}`,
      ticketId,
      engineerId: currentUser.id,
      engineerName: currentUser.name,
      team: currentUser.team,
    };

    ticket.worklogs.push(newLog);
    ticket.updatedAt = new Date().toISOString();

    ticket.activities.unshift({
      id: `act-wkl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Worklog Added',
      details: `Logged ${worklog.minutesSpent} mins: ${worklog.activity}`,
      type: 'WORKLOG',
    });

    this.saveTickets();
    return ticket;
  }

  public completeTask(ticketId: string, taskId: string, outputSummary: string, currentUser: User): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const taskIndex = ticket.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    const now = new Date().toISOString();
    const task = ticket.tasks[taskIndex];
    task.status = 'COMPLETED';
    task.completedAt = now;
    task.completedBy = currentUser.name;
    task.outputSummary = outputSummary;

    // Activate next task in sequence if dependent
    const nextTask = ticket.tasks.find((t) => t.dependsOnTaskId === taskId && t.status === 'PENDING');
    if (nextTask) {
      nextTask.status = 'IN_PROGRESS';
    }

    ticket.updatedAt = now;
    ticket.activities.unshift({
      id: `act-tsk-${Date.now()}`,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Task Completed',
      details: `Work order ${task.taskNumber} (${task.title}) marked COMPLETED. Summary: ${outputSummary}`,
      type: 'TASK',
    });

    this.saveTickets();
    this.recordAuditLog(
      currentUser,
      'TASK_COMPLETED',
      'TASK',
      task.id,
      `${ticket.ticketNumber} / ${task.taskNumber}`,
      { newVal: 'COMPLETED', reason: outputSummary }
    );

    return ticket;
  }

  public deliverCredentials(ticketId: string, tempUser: string, currentUser: User): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    ticket.credentialHandover = {
      isHandedOver: true,
      temporaryUsername: tempUser,
      maskedPassword: '••••••••••••••••',
      handoverTimestamp: new Date().toISOString(),
      deliveredBy: currentUser.name,
      acknowledgedByRequester: false,
    };
    ticket.updatedAt = new Date().toISOString();

    ticket.activities.unshift({
      id: `act-cred-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Secure Credential Handover',
      details: `Temporary credentials generated and delivered securely to requester. No plaintext passwords logged.`,
      type: 'COMMENT',
    });

    this.saveTickets();
    return ticket;
  }

  public acknowledgeCredentials(ticketId: string, currentUser: User): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket || !ticket.credentialHandover) throw new Error('No credential handover record');

    ticket.credentialHandover.acknowledgedByRequester = true;
    ticket.credentialHandover.acknowledgedAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();

    ticket.activities.unshift({
      id: `act-cred-ack-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'Credential Receipt Acknowledged',
      details: `Requester ${currentUser.name} confirmed safe retrieval of temporary credentials.`,
      type: 'COMMENT',
    });

    this.saveTickets();
    return ticket;
  }

  public createKnowledgeArticle(payload: Partial<KnowledgeArticle>, currentUser: User): KnowledgeArticle {
    const count = this.kbArticles.length + 1;
    const padded = String(count).padStart(4, '0');
    const now = new Date().toISOString();

    const newArticle: KnowledgeArticle = {
      id: `kb-${Date.now()}`,
      articleNumber: `KB-2026-${padded}`,
      title: payload.title || 'Untitled Standard Operating Procedure',
      problem: payload.problem || '',
      symptoms: payload.symptoms || '',
      cause: payload.cause || '',
      resolution: payload.resolution || '',
      workaround: payload.workaround,
      commands: payload.commands,
      category: payload.category || 'General',
      applicableSystems: payload.applicableSystems || ['Enterprise Linux'],
      tags: payload.tags || ['operations'],
      authorName: currentUser.name,
      status: 'Published',
      createdFromTicketNumber: payload.createdFromTicketNumber,
      views: 1,
      helpfulCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.kbArticles.unshift(newArticle);
    this.saveKb();

    this.recordAuditLog(
      currentUser,
      'KB_ARTICLE_CREATE',
      'KNOWLEDGE',
      newArticle.id,
      newArticle.articleNumber,
      { newVal: newArticle.title }
    );

    return newArticle;
  }

  public getKnowledgeArticles(): KnowledgeArticle[] {
    return [...this.kbArticles];
  }

  public getCIs(): ConfigurationItem[] {
    return [...this.cis];
  }

  public getCIByIP(ip: string): ConfigurationItem | undefined {
    return this.cis.find((c) => c.ipAddress === ip || c.ipAddress.includes(ip));
  }

  public getVendorPerformance(): VendorPerformanceSummary {
    return { ...this.vendorMetrics };
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.CIS);
    localStorage.removeItem(STORAGE_KEYS.KB);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    this.loadFromStorage();
  }
}

export const demoRepo = new DemoRepositoryAdapter();
