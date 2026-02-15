import { Target, Finding, ArchitectureDoc, Report } from "../types";

export const MOCK_TARGETS: Target[] = [
  {
    id: '1',
    domain: 'corp-internal.demo.com',
    status: 'COMPLETED',
    lastScan: '2023-10-27 14:30',
    riskScore: 85,
    tags: ['Production', 'Internal', 'AWS'],
    findingsCount: { critical: 2, high: 5, medium: 12, low: 8 }
  },
  {
    id: '2',
    domain: 'legacy-api.demo.com',
    status: 'IDLE',
    lastScan: '2023-10-25 09:15',
    riskScore: 92,
    tags: ['Legacy', 'External', 'API'],
    findingsCount: { critical: 4, high: 3, medium: 5, low: 20 }
  },
  {
    id: '3',
    domain: 'staging-auth.demo.com',
    status: 'SCANNING',
    lastScan: null,
    riskScore: 0,
    tags: ['Staging', 'Auth'],
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0 }
  }
];

export const MOCK_FINDINGS: Finding[] = [
  {
    id: 'f1',
    targetId: '1',
    title: 'SQL Injection in /login parameter',
    tool: 'Nuclei',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    description: 'Boolean-based blind SQL injection detected in the username parameter.',
    remediation: 'Use prepared statements or parameterized queries.',
    timestamp: '2023-10-27 14:35',
    category: 'Injection'
  },
  {
    id: 'f2',
    targetId: '1',
    title: 'Exposed .git Directory',
    tool: 'GoBuster',
    severity: 'HIGH',
    cvssScore: 7.5,
    description: 'Source code repository exposed via /.git/HEAD',
    remediation: 'Deny access to .git directories in web server config.',
    timestamp: '2023-10-27 14:32',
    category: 'Information Disclosure'
  },
  {
    id: 'f3',
    targetId: '1',
    title: 'Outdated Apache Version 2.4.49',
    tool: 'Nmap',
    severity: 'HIGH',
    cvssScore: 7.5,
    description: 'Server is running a version vulnerable to Path Traversal (CVE-2021-41773).',
    timestamp: '2023-10-27 14:30',
    category: 'Vulnerable Component'
  },
  {
    id: 'f4',
    targetId: '1',
    title: 'Missing Security Headers',
    tool: 'HTTPx',
    severity: 'LOW',
    cvssScore: 0.0,
    description: 'X-Frame-Options and Content-Security-Policy are missing.',
    timestamp: '2023-10-27 14:28',
    category: 'Misconfiguration'
  },
  {
    id: 'f5',
    targetId: '2',
    title: 'RCE via Log4Shell',
    tool: 'Nuclei',
    severity: 'CRITICAL',
    cvssScore: 10.0,
    description: 'JNDI injection vulnerability detected in User-Agent header.',
    remediation: 'Patch Log4j to version 2.17.1 or higher.',
    timestamp: '2023-10-25 09:10',
    category: 'Injection'
  },
  {
    id: 'f6',
    targetId: '2',
    title: 'Open Redis Instance',
    tool: 'Nmap',
    severity: 'HIGH',
    cvssScore: 8.0,
    description: 'Redis service on port 6379 is accessible without authentication.',
    timestamp: '2023-10-25 09:05',
    category: 'Misconfiguration'
  }
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r1',
    targetId: '1',
    title: 'Q3 Executive Security Summary',
    type: 'EXECUTIVE',
    generatedAt: '2023-10-27 15:00',
    status: 'READY',
    content: '# Executive Summary\n\n**Risk Rating:** Critical\n\nThe assessment of **corp-internal.demo.com** identified significant risks to business continuity.'
  },
  {
    id: 'r2',
    targetId: '2',
    title: 'Legacy API Technical Audit',
    type: 'TECHNICAL',
    generatedAt: '2023-10-25 10:30',
    status: 'READY',
    content: '# Technical Audit\n\n## Findings\n1. **Log4Shell (Critical)**\n2. **Open Redis (High)**'
  }
];

export const ARCHITECTURE_DOCS: ArchitectureDoc[] = [
  {
    section: "System Overview",
    title: "High-Level Architecture",
    content: "The system follows a microservices event-driven architecture. The core consists of a React Frontend communicating with a Golang API Gateway. Scan jobs are dispatched via RabbitMQ to isolated Docker containers running specific reconnaissance tools (Nmap, Nuclei, etc.). Results are normalized and stored in PostgreSQL (structured) and MongoDB (unstructured logs).",
    codeBlock: `User -> [Load Balancer] -> [API Gateway (Go)]
                                  |
                           [Auth Service (OAuth2)]
                                  |
        +-------------------------+-------------------------+
        |                         |                         |
[Target Manager]           [Scan Controller]         [Report Engine]
        |                         |                         |
   [PostgreSQL]             [RabbitMQ]               [S3 / MinIO]
                                  |
                        [Recon Workers (Docker)]
                        |   |   |   |   |
                      Nmap Amass Nuclei FFUF`
  },
  {
    section: "Deployment",
    title: "Docker Compose Structure",
    content: "The production deployment utilizes Docker Compose for orchestration. Each service is containerized with strict resource limits and network isolation.",
    codeBlock: `version: '3.8'
services:
  api-gateway:
    build: ./services/gateway
    ports: ["8080:8080"]
    networks: [backend-net]
    
  recon-worker:
    image: redops/worker:latest
    deploy:
      replicas: 5
    environment:
      - QUEUE_HOST=rabbitmq
    volumes:
      - ./tools:/opt/tools:ro # Read-only tools
    networks: [scan-net]

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: redops
    networks: [backend-net]

networks:
  backend-net:
    internal: true
  scan-net:
    driver: bridge # Isolated scanning network`
  },
  {
    section: "Database",
    title: "Schema Design",
    content: "We use a relational schema for RBAC and Target management, and a JSONB heavy schema for finding data to allow flexibility across different tool outputs.",
    codeBlock: `CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) NOT NULL,
    scope_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID REFERENCES targets(id),
    tool_source VARCHAR(50),
    severity VARCHAR(20),
    raw_output JSONB, -- Stores full tool output
    normalized_fields JSONB, -- Common schema (title, desc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
  }
];