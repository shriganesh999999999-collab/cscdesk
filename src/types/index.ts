/**
 * Enterprise ITSM Core TypeScript Definitions
 * Enterprise-grade Type Architecture supporting RBAC, SLA Engine,
 * CMDB, Approvals, Parent-Child Work Orders, and Audit Logs.
 */

export type RoleName =
  | 'Requester'
  | 'Supervisor'
  | 'Reporting Officer'
  | 'Department Head'
  | 'IT Support L1'
  | 'IT Support L2'
  | 'IT Support L3'
  | 'NOC L1'
  | 'NOC L2'
  | 'NOC L3'
  | 'Network Engineer'
  | 'Cloud Engineer'
  | 'System Administrator'
  | 'Database Administrator'
  | 'Backup Administrator'
  | 'Security Analyst'
  | 'CISO'
  | 'DevOps Engineer'
  | 'Data Center Engineer'
  | 'Operations Manager'
  | 'Vendor Operations Manager'
  | 'Infra Head'
  | 'General Manager'
  | 'Finance Viewer'
  | 'Internal Auditor'
  | 'Super Admin';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  managerId?: string;
  managerName?: string;
  reportingOfficerId?: string;
  role: RoleName;
  team: string;
  isVendor: boolean;
  vendorName?: string;
  isActive: boolean;
  avatarUrl?: string;
  permissions: string[];
}

export type TicketType =
  | 'Incident'
  | 'Service Request'
  | 'Change Request'
  | 'Problem'
  | 'Monitoring Review'
  | 'Backup Review'
  | 'Maintenance Activity'
  | 'Security Request'
  | 'Access Request'
  | 'Infrastructure Request'
  | 'Network Request'
  | 'Cloud Request'
  | 'Database Request'
  | 'Endpoint Support'
  | 'Data Center Order'
  | 'VM Request'
  | 'Firewall Whitelist';

export type TicketStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'QUEUED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'PENDING_REQUESTER'
  | 'PENDING_SECURITY'
  | 'PENDING_VENDOR'
  | 'PENDING_THIRD_PARTY'
  | 'WAITING_FOR_CHANGE_WINDOW'
  | 'PLANNED'
  | 'ON_HOLD'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'RECALLED'
  | 'REOPENED';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type ImpactLevel = 'Individual' | 'Small Team' | 'Department' | 'Multiple Departments' | 'Enterprise' | 'Critical Public Service';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type SLAPauseReason =
  | 'Waiting for Requester'
  | 'Waiting for Approved Maintenance Window'
  | 'Waiting for Third Party'
  | 'Waiting for OEM'
  | 'Waiting for Vendor'
  | 'Waiting for Business Approval'
  | 'Waiting for Security Approval'
  | 'Waiting for External Dependency'
  | 'Planned Activity'
  | 'Force Majeure';

export type DelayAttribution =
  | 'Internal Cause'
  | 'Vendor Cause'
  | 'OEM Cause'
  | 'Third Party Cause'
  | 'Power Issue'
  | 'ISP Issue'
  | 'Requester Delay'
  | 'Approval Delay'
  | 'Resource Unavailability'
  | 'Maintenance Window'
  | 'Unknown';

export interface SLAInstance {
  priority: PriorityLevel;
  responseTargetMinutes: number;
  resolutionTargetMinutes: number;
  responseSLAStart: string;
  responseSLAEnd?: string;
  responseSLAMet?: boolean;
  resolutionSLAStart: string;
  resolutionSLATarget: string;
  resolutionSLAEnd?: string;
  elapsedMinutes: number;
  pausedMinutes: number;
  remainingMinutes: number;
  percentageConsumed: number;
  isPaused: boolean;
  isBreached: boolean;
  pauseReason?: SLAPauseReason;
  pausedAt?: string;
  pauseJustification?: string;
  expectedResumeTime?: string;
  pausedBy?: string;
  clockEvents: SLAClockEvent[];
}

export interface SLAClockEvent {
  id: string;
  eventType: 'STARTED' | 'PAUSED' | 'RESUMED' | 'MET' | 'BREACHED';
  timestamp: string;
  actorName: string;
  reason?: string;
  justification?: string;
  durationMinutes?: number;
}

export interface ApprovalStep {
  id: string;
  stageName: string;
  approverRole: string;
  approverUserId?: string;
  approverName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT_BACK' | 'SKIPPED';
  actionDate?: string;
  comments?: string;
  isMandatory: boolean;
}

export interface TicketTask {
  id: string;
  taskNumber: string; // e.g., TASK-001
  title: string;
  description: string;
  team: string;
  assigneeName?: string;
  assigneeId?: string;
  status: 'PENDING' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  olaTargetHours: number;
  olaElapsedHours: number;
  dependsOnTaskId?: string;
  completedAt?: string;
  completedBy?: string;
  outputSummary?: string;
}

export interface TicketActivity {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  type: 'STATUS_CHANGE' | 'APPROVAL' | 'ASSIGNMENT' | 'SLA_HOLD' | 'SLA_RESUME' | 'COMMENT' | 'WORKLOG' | 'TASK' | 'RECALL' | 'REOPEN';
  oldValue?: string;
  newValue?: string;
}

export interface WorkLog {
  id: string;
  ticketId: string;
  engineerId: string;
  engineerName: string;
  team: string;
  startTime: string;
  endTime: string;
  minutesSpent: number;
  activity: string;
  isPrivate: boolean;
  requesterNote?: string;
  actionTaken: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // INC-2026-000001, VMR-2026-000001, CHG-2026-000001, etc.
  title: string;
  description: string;
  ticketType: TicketType;
  status: TicketStatus;
  priority: PriorityLevel;
  impact: ImpactLevel;
  urgency: UrgencyLevel;
  category: string;
  subcategory: string;
  service: string;
  department: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterDepartment: string;
  currentAssignmentGroup: string;
  currentAssigneeId?: string;
  currentAssigneeName?: string;
  assignedLevel?: 'L1' | 'L2' | 'L3' | 'Team Lead' | 'Specialist';
  businessOwner: string;
  technicalOwner?: string;
  affectedCIId?: string;
  affectedCIName?: string;
  affectedIP?: string;
  environment?: 'DEV' | 'UAT' | 'PRE-PROD' | 'PROD' | 'DR';
  sla: SLAInstance;
  approvals: ApprovalStep[];
  tasks: TicketTask[];
  activities: TicketActivity[];
  worklogs: WorkLog[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  recalledAt?: string;
  reopenedAt?: string;
  reopenCount?: number;
  resolutionSummary?: string;
  resolutionCode?: string;
  resolutionWorkaround?: string;
  customerSatisfaction?: number; // 1-5
  isMajorIncident?: boolean;
  majorIncidentManager?: string;
  bridgeDetails?: string;
  isFalsePositive?: boolean;
  falsePositiveReason?: string;
  thirdPartyDependency?: {
    isThirdParty: boolean;
    providerName?: string;
    externalTicketNumber?: string;
    downtimeMinutes?: number;
    delayAttribution: DelayAttribution;
    justification?: string;
  };
  customFields?: Record<string, any>;
  credentialHandover?: {
    isHandedOver: boolean;
    temporaryUsername?: string;
    maskedPassword?: string;
    handoverTimestamp?: string;
    deliveredBy?: string;
    acknowledgedByRequester?: boolean;
    acknowledgedAt?: string;
  };
}

export interface ConfigurationItem {
  id: string;
  ciNumber: string;
  name: string;
  ciClass:
    | 'Physical Server'
    | 'Virtual Machine'
    | 'IP Address'
    | 'Application'
    | 'Database'
    | 'Firewall'
    | 'Router'
    | 'Switch'
    | 'Load Balancer'
    | 'Storage'
    | 'Backup Server'
    | 'Monitoring Device'
    | 'SSL Certificate'
    | 'Cloud Platform';
  ipAddress: string;
  environment: 'DEV' | 'UAT' | 'PRE-PROD' | 'PROD' | 'DR';
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'PROVISIONING';
  owner: string;
  dataCenter: string;
  operatingSystem?: string;
  cpu?: string;
  ram?: string;
  disk?: string;
  relationships: CIRelationship[];
}

export interface CIRelationship {
  id: string;
  relationshipType:
    | 'runs on'
    | 'uses'
    | 'behind'
    | 'protected by'
    | 'monitored by'
    | 'backed up by'
    | 'depends on'
    | 'hosted on';
  targetCIId: string;
  targetCIName: string;
  targetCIClass: string;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  estimatedSLA: string;
  approvalRequired: boolean;
  defaultPriority: PriorityLevel;
  ticketType: TicketType;
  requiresVMWorkflow?: boolean;
  requiresFirewallWorkflow?: boolean;
}

export interface KnowledgeArticle {
  id: string;
  articleNumber: string; // KB-2026-0001
  title: string;
  problem: string;
  symptoms: string;
  cause: string;
  resolution: string;
  workaround?: string;
  commands?: string;
  category: string;
  applicableSystems: string[];
  tags: string[];
  authorName: string;
  status: 'Draft' | 'Under Review' | 'Published' | 'Retired';
  createdFromTicketNumber?: string;
  views: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  ipAddress: string;
  action: string;
  targetType: string;
  targetId: string;
  targetIdentifier: string; // Ticket number, CI name, User name
  oldValues?: string;
  newValues?: string;
  reason?: string;
}

export interface VendorPerformanceSummary {
  vendorName: string;
  period: string; // e.g., "September 2026"
  contractRef: string;
  totalCalls: number;
  callsByPriority: Record<PriorityLevel, number>;
  callsBySupportLevel: { L1: number; L2: number; L3: number };
  slaMetCount: number;
  slaBreachedCount: number;
  slaMetPercentage: number;
  avgResolutionHours: number;
  longestTicketHours: number;
  pausedHoursTotal: number;
  delayAttribution: {
    vendorDelayHours: number;
    requesterDelayHours: number;
    oemDelayHours: number;
    thirdPartyDelayHours: number;
    resourceDelayHours: number;
  };
  reopenedCount: number;
  repeatIncidentCount: number;
  performanceScore: number; // 0 - 100
  managementReviewStatus: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'DISPUTED';
  managementComments?: string;
}
