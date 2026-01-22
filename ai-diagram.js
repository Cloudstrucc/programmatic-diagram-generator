#!/usr/bin/env node
/**
 * AI-Powered Diagram Generator v5.0
 * 
 * Generates professional architecture diagrams from natural language descriptions.
 * Supports multiple cloud providers, quality levels, and predefined templates.
 * 
 * v5.0 Features:
 *   - Smart description enhancement for better quality output
 *   - Quality presets: simple, standard, enterprise
 *   - Multiple icon packs: Azure, AWS, GCP, K8s, Generic/Open-source
 *   - Cross-cloud templates for common patterns
 *   - Automatic multi-line string sanitization
 * 
 * Usage:
 *   node ai-diagram.js generate "Your architecture" --quality enterprise
 *   node ai-diagram.js generate --template m365-cmk
 *   node ai-diagram.js templates
 *   node ai-diagram.js styles
 * 
 * Requires:
 *   - ANTHROPIC_API_KEY in .env
 *   - Python 3.8+ with 'diagrams' package: pip install diagrams
 *   - Graphviz: brew install graphviz (Mac) or apt install graphviz (Linux)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { simpleGit } from 'simple-git';
import { program } from 'commander';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
  },
  temp: {
    dir: path.join(__dirname, '.temp-ai-diagrams'),
    specFile: 'diagram-spec.json',
    pythonFile: 'diagram.py',
    imageFile: 'diagram.png',
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO || 'diagrams',
    branch: process.env.GITHUB_BRANCH || 'main',
    folder: process.env.GITHUB_FOLDER || 'images',
    userName: process.env.GITHUB_USER_NAME || 'Diagram Bot',
    userEmail: process.env.GITHUB_USER_EMAIL || 'diagrams@example.com',
  },
  devops: {
    token: process.env.AZDO_TOKEN,
    org: process.env.AZDO_ORG,
    project: process.env.AZDO_PROJECT,
    repo: process.env.AZDO_REPO || 'diagrams',
    branch: process.env.AZDO_BRANCH || 'main',
    folder: process.env.AZDO_FOLDER || 'images',
    userName: process.env.AZDO_USER_NAME || 'Diagram Bot',
    userEmail: process.env.AZDO_USER_EMAIL || 'diagrams@example.com',
  },
  local: {
    outputDir: process.env.LOCAL_OUTPUT_DIR || './output',
  },
  commitMessage: process.env.COMMIT_MESSAGE_PREFIX || 'docs(diagrams): update architecture diagrams',
};

// =============================================================================
// QUALITY PRESETS - Control diagram complexity and detail
// =============================================================================

const QUALITY_PRESETS = {
  simple: {
    name: 'Simple',
    description: 'Basic diagram with main components, minimal detail',
    guidance: `
Create a SIMPLE diagram:
- Maximum 5-8 nodes total
- 1-2 clusters maximum
- Basic labels (1 line each)
- Simple connections without detailed labels
- No automation or monitoring layers
- Focus only on the core architecture`,
  },
  standard: {
    name: 'Standard',
    description: 'Balanced diagram with good detail and organization',
    guidance: `
Create a STANDARD diagram:
- 8-15 nodes organized in logical clusters
- 3-5 clusters with appropriate grouping
- Descriptive labels (1-2 lines)
- Labeled connections showing data/control flow
- Include identity/access components if relevant
- Color-coded clusters by function`,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Comprehensive diagram with full detail, automation, monitoring',
    guidance: `
Create an ENTERPRISE-GRADE diagram:
- Comprehensive coverage of all components mentioned
- Nested clusters showing hierarchies (e.g., Key Vault containing Root Keys and DEP Keys)
- Multi-line descriptive labels with technical details
- Color-coded edges by type: red=encryption/security, blue=data flow, purple=RBAC/identity, green=content, orange=replication/DR, gray=secondary/audit
- Include these layers where relevant:
  * Identity & Access Control (Entra ID, Service Principals, RBAC)
  * Automation (DevOps Pipelines, Logic Apps, Functions)
  * Monitoring & Compliance (Log Analytics, Alerts, Audit Logs)
  * DR/Backup (Secondary regions, geo-replication)
- Show complete flows from source to destination
- Use direction="LR" for encryption/data flows, "TB" for hierarchical`,
  },
};

// =============================================================================
// DIAGRAM STYLES - Different cloud providers and icon packs
// =============================================================================

const DIAGRAM_STYLES = {
  /**
   * Azure Architecture - Microsoft Azure icons
   */
  azure: {
    name: 'Azure Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.azure.compute import FunctionApps, AppServices, VM, AKS, ContainerInstances
from diagrams.azure.database import SQLDatabases, CosmosDb, BlobStorage, DataLake
from diagrams.azure.devops import Devops, Repos, Pipelines, Artifacts, Boards
from diagrams.azure.identity import ManagedIdentities, ActiveDirectory, ConditionalAccess, Users as AzureUsers
from diagrams.azure.integration import LogicApps, ServiceBus, EventGridDomains, APIManagement
from diagrams.azure.network import VirtualNetworks, Firewall, LoadBalancers, ApplicationGateway, DNS, PrivateEndpoint, Subnets
from diagrams.azure.security import KeyVaults, SecurityCenter, Sentinel
from diagrams.azure.storage import StorageAccounts, BlobStorage, FileStorage, QueueStorage
from diagrams.azure.analytics import LogAnalyticsWorkspaces, EventHubs, Databricks, SynapseAnalytics
from diagrams.azure.web import AppServices, AppServicePlans
from diagrams.azure.general import Subscriptions, Resourcegroups, Managementgroups
from diagrams.azure.ml import MachineLearningServiceWorkspaces
from diagrams.onprem.client import Users
from diagrams.saas.chat import Teams
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL
`,
    examples: `
# M365 CMK Key Hierarchy Pattern:
with Cluster("Azure Key Vault (HSM-Protected)", graph_attr={"bgcolor": "#ffebee"}):
    with Cluster("Root Keys"):
        root_key = KeyVaults("Customer\\nRoot Key\\n(RSA 2048+)")
    with Cluster("Data Encryption Policy Keys"):
        dep_spo = KeyVaults("DEP Key\\nSharePoint")
        dep_teams = KeyVaults("DEP Key\\nTeams")
    root_key >> Edge(label="Wraps", color="red", style="bold") >> dep_spo
    root_key >> Edge(label="Wraps", color="red", style="bold") >> dep_teams

# Identity Pattern:
with Cluster("Identity & Access Control", graph_attr={"bgcolor": "#f3e5f5"}):
    entra = ActiveDirectory("Entra ID")
    mi = ManagedIdentities("Service\\nPrincipal")
    entra >> mi
mi >> Edge(label="RBAC", color="purple", style="dashed") >> root_key

# Monitoring Pattern:
with Cluster("Monitoring", graph_attr={"bgcolor": "#fff3e0"}):
    law = LogAnalyticsWorkspaces("Log Analytics")
    alert = Rack("Alerts")
    law >> alert
`,
  },

  /**
   * AWS Architecture - Amazon Web Services icons
   */
  aws: {
    name: 'AWS Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, EC2, ECS, EKS, Fargate, ElasticBeanstalk, Batch
from diagrams.aws.database import RDS, Dynamodb, ElastiCache, Redshift, Aurora, Neptune
from diagrams.aws.network import VPC, ELB, ALB, NLB, CloudFront, Route53, APIGateway, PrivateSubnet, PublicSubnet, NATGateway, InternetGateway
from diagrams.aws.storage import S3, EBS, EFS, FSx, Glacier
from diagrams.aws.security import IAM, Cognito, KMS, SecretsManager, WAF, Shield, ACM, SecurityHub, GuardDuty, Inspector
from diagrams.aws.integration import SQS, SNS, Eventbridge, StepFunctions, MQ
from diagrams.aws.analytics import Kinesis, Athena, Glue, EMR, Quicksight, LakeFormation
from diagrams.aws.management import Cloudwatch, Cloudtrail, Config, SystemsManager, Organizations, ControlTower
from diagrams.aws.devtools import Codepipeline, Codecommit, Codebuild, Codedeploy
from diagrams.aws.ml import Sagemaker, Rekognition, Comprehend
from diagrams.aws.general import Users
from diagrams.onprem.client import Users as OnPremUsers
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
`,
    examples: `
# AWS Security Pattern with KMS:
with Cluster("AWS Security", graph_attr={"bgcolor": "#ffebee"}):
    kms = KMS("KMS\\nCMK")
    secrets = SecretsManager("Secrets\\nManager")
    
with Cluster("IAM", graph_attr={"bgcolor": "#e3f2fd"}):
    iam = IAM("IAM Role")
    cognito = Cognito("Cognito")

iam >> Edge(label="kms:Decrypt", color="purple", style="dashed") >> kms

# AWS Serverless Pattern:
with Cluster("API Layer", graph_attr={"bgcolor": "#e8f5e9"}):
    api = APIGateway("API Gateway")
    waf = WAF("WAF")
    waf >> api

with Cluster("Compute", graph_attr={"bgcolor": "#fff3e0"}):
    fn = Lambda("Lambda")
    
with Cluster("Data", graph_attr={"bgcolor": "#e3f2fd"}):
    db = Dynamodb("DynamoDB")
    cache = ElastiCache("ElastiCache")

api >> fn >> db
fn >> cache

# AWS Monitoring:
with Cluster("Observability", graph_attr={"bgcolor": "#f3e5f5"}):
    cw = Cloudwatch("CloudWatch")
    ct = Cloudtrail("CloudTrail")
    sh = SecurityHub("Security Hub")
`,
  },

  /**
   * GCP Architecture - Google Cloud Platform icons
   */
  gcp: {
    name: 'GCP Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.gcp.compute import Functions, Run, GKE, ComputeEngine, AppEngine, GCF
from diagrams.gcp.database import SQL as CloudSQL, Spanner, Firestore, Bigtable, Memorystore
from diagrams.gcp.network import VPC, LoadBalancing, CDN, DNS, Armor, NAT, Router
from diagrams.gcp.storage import GCS, Filestore, PersistentDisk
from diagrams.gcp.security import Iam, KMS, SecurityCommandCenter, KeyManagementService
from diagrams.gcp.analytics import BigQuery, Dataflow, Pubsub, Dataproc, Composer
from diagrams.gcp.devtools import Build, SourceRepositories, ContainerRegistry
from diagrams.gcp.ml import AIHub, AutoML, VisionAPI
from diagrams.gcp.operations import Monitoring, Logging
from diagrams.onprem.client import Users
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
`,
    examples: `
# GCP Security Pattern:
with Cluster("Security", graph_attr={"bgcolor": "#ffebee"}):
    kms = KeyManagementService("Cloud KMS")
    scc = SecurityCommandCenter("Security\\nCommand Center")

with Cluster("Identity", graph_attr={"bgcolor": "#e3f2fd"}):
    iam = Iam("IAM")

iam >> Edge(label="roles/cloudkms.cryptoKeyEncrypterDecrypter", color="purple") >> kms

# GCP Data Platform:
with Cluster("Data Lake", graph_attr={"bgcolor": "#e8f5e9"}):
    gcs = GCS("Cloud Storage")
    bq = BigQuery("BigQuery")
    dataflow = Dataflow("Dataflow")

gcs >> dataflow >> bq
`,
  },

  /**
   * Kubernetes Architecture
   * VERIFIED icons - checked against diagrams library v0.25.1
   */
  k8s: {
    name: 'Kubernetes Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.k8s.compute import Pod, Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, Cronjob
from diagrams.k8s.network import Service, Ingress, NetworkPolicy
from diagrams.k8s.storage import PV, PVC, StorageClass
from diagrams.k8s.rbac import ServiceAccount, Role, RoleBinding, ClusterRole, ClusterRoleBinding
from diagrams.k8s.controlplane import APIServer, Scheduler, ControllerManager
from diagrams.k8s.infra import Node, Master
from diagrams.k8s.clusterconfig import HPA, LimitRange, Quota
from diagrams.k8s.others import CRD
from diagrams.k8s.podconfig import ConfigMap, Secret
from diagrams.k8s.group import Namespace
from diagrams.onprem.client import Users
from diagrams.onprem.network import Nginx, Istio, Envoy, Traefik, Kong
from diagrams.onprem.monitoring import Prometheus, Grafana
from diagrams.onprem.logging import Loki, FluentBit
from diagrams.onprem.tracing import Jaeger
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
`,
    examples: `
# K8s Ingress Pattern:
with Cluster("Kubernetes Cluster"):
    ing = Ingress("Ingress")
    
    with Cluster("Namespace: production"):
        svc = Service("Service")
        with Cluster("Deployment"):
            pods = [Pod("pod-1"), Pod("pod-2"), Pod("pod-3")]
        hpa = HPA("HPA")
        
    with Cluster("Config"):
        cm = ConfigMap("ConfigMap")
        secret = Secret("Secret")

ing >> svc >> pods
hpa >> pods[0]

# K8s RBAC:
with Cluster("RBAC", graph_attr={"bgcolor": "#f3e5f5"}):
    sa = ServiceAccount("ServiceAccount")
    role = Role("Role")
    rb = RoleBinding("RoleBinding")
    sa >> rb >> role
`,
  },

  /**
   * Generic/Open-Source Architecture - Cloud-agnostic icons
   * VERIFIED icons only - checked against diagrams library v0.25.1
   */
  generic: {
    name: 'Generic / Open Source',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL
from diagrams.generic.network import Firewall, Router, Switch, Subnet, VPN
from diagrams.generic.storage import Storage
from diagrams.generic.os import Windows, LinuxGeneral, Ubuntu, Centos
from diagrams.generic.place import Datacenter
from diagrams.generic.device import Mobile, Tablet
from diagrams.generic.blank import Blank
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server, Nomad
from diagrams.onprem.database import PostgreSQL, MySQL, MongoDB, Redis, Cassandra, InfluxDB, Neo4J
from diagrams.onprem.network import Nginx, Apache, Traefik, HAProxy, Envoy, Istio, Consul, Kong, Linkerd, Zookeeper, Caddy, Gunicorn, Tomcat
from diagrams.onprem.queue import Kafka, RabbitMQ, ActiveMQ, Celery
from diagrams.onprem.monitoring import Prometheus, Grafana, Datadog, Splunk, Nagios, Zabbix, Thanos, Cortex, Mimir, Sentry
from diagrams.onprem.ci import Jenkins, GithubActions, GitlabCI, CircleCI, DroneCI, TravisCI, Teamcity
from diagrams.onprem.container import Docker
from diagrams.onprem.vcs import Git, Github, Gitlab
from diagrams.onprem.security import Vault, Trivy, Bitwarden
from diagrams.onprem.inmemory import Redis as RedisCache, Memcached
from diagrams.onprem.logging import FluentBit, Loki, Graylog, RSyslog
from diagrams.onprem.tracing import Jaeger, Tempo
from diagrams.saas.chat import Teams, Slack
from diagrams.saas.cdn import Cloudflare
from diagrams.saas.identity import Auth0, Okta
from diagrams.saas.alerting import Pagerduty, Opsgenie
from diagrams.programming.language import Python, Javascript, Go, Rust, Java, Nodejs
from diagrams.programming.framework import React, Vue, Angular, Django, Flask, Spring
`,
    examples: `
# Open Source Security with Vault:
with Cluster("Secrets Management", graph_attr={"bgcolor": "#ffebee"}):
    vault = Vault("HashiCorp\\nVault")
    
with Cluster("Identity", graph_attr={"bgcolor": "#e3f2fd"}):
    okta = Okta("Okta\\nSSO")
    
okta >> Edge(label="OIDC", color="purple") >> vault

# Open Source Observability Stack (VERIFIED ICONS):
with Cluster("Observability", graph_attr={"bgcolor": "#e8f5e9"}):
    prom = Prometheus("Prometheus")
    grafana = Grafana("Grafana")
    loki = Loki("Loki")
    jaeger = Jaeger("Jaeger")
    fluentbit = FluentBit("FluentBit")  # Note: Fluentd is NOT available, use FluentBit
    
    prom >> grafana
    loki >> grafana
    jaeger >> grafana

# Service Mesh with Istio:
with Cluster("Service Mesh", graph_attr={"bgcolor": "#e8eaf6"}):
    istio = Istio("Istio")
    envoy1 = Envoy("Envoy Sidecar")
    envoy2 = Envoy("Envoy Sidecar")
    
istio >> Edge(label="Config", color="purple", style="dashed") >> envoy1
istio >> Edge(label="Config", color="purple", style="dashed") >> envoy2

# CI/CD Pipeline:
with Cluster("CI/CD", graph_attr={"bgcolor": "#fff3e0"}):
    gh = Github("GitHub")
    actions = GithubActions("Actions")
    docker = Docker("Registry")
    
gh >> actions >> docker

# Message Queue Pattern:
with Cluster("Event Streaming", graph_attr={"bgcolor": "#f3e5f5"}):
    kafka = Kafka("Kafka")
    
with Cluster("Workers"):
    workers = [Server("worker-1"), Server("worker-2")]
    
kafka >> workers
`,
  },
};

// =============================================================================
// PREDEFINED TEMPLATES - Common enterprise architecture patterns
// =============================================================================

const TEMPLATES = {
  // ===== AZURE TEMPLATES =====
  'm365-cmk': {
    name: 'M365 Customer Managed Keys',
    description: 'Complete M365 CMK architecture with Key Vault, DEP keys, SharePoint, Exchange, Teams',
    style: 'azure',
    quality: 'enterprise',
    prompt: `M365 Customer Managed Keys (CMK) encryption architecture showing:
- Azure Key Vault (HSM-Protected) containing:
  - Customer Root Key (RSA 2048+) 
  - Data Encryption Policy (DEP) Keys for SharePoint, Exchange, and Teams
  - Root key wrapping all DEP keys
- DR Key Vault in secondary region with geo-replication
- Microsoft 365 Workloads:
  - SharePoint Online with Availability Key (AEK) and SPO Content
  - Exchange Online with Availability Key (AEK) and Mailboxes
  - Teams with Availability Key (AEK) and Teams Data (Chats, Files)
- Encryption flow: DEP Keys encrypt Service Keys (AEKs), AEKs encrypt Content
- Identity & Access Control: Entra ID -> M365 Service Principal -> Key Vault Crypto User RBAC
- Key Management Automation: DevOps Pipeline deploying DEP Config, Logic App for Key Rotation
- Monitoring & Compliance: Log Analytics receiving audit logs, Key Access Alerts
Use direction LR for left-to-right encryption flow.`,
  },

  'power-platform-cmk': {
    name: 'Power Platform CMK',
    description: 'Power Platform with Customer Managed Keys - Dataverse, Power Apps, Power Automate',
    style: 'azure',
    quality: 'enterprise',
    prompt: `Power Platform Customer Managed Keys architecture showing:
- Azure Control Plane:
  - Entra ID (Identity Provider)
  - Managed Identity (Service Identity) with RBAC permissions
  - Key Vault (CMK Storage) with HSM-backed keys
- Power Platform:
  - Power Apps (Low-Code Apps)
  - Power Automate (Workflows)
  - Dataverse (Data Platform)
- Encrypted Storage:
  - Blob Storage (Encrypted Data)
- Authentication flow: Entra ID -> Managed Identity
- Encryption flow: Managed Identity gets encryption keys from Key Vault
- Dataverse requests CMK from Key Vault
- All Power Platform data encrypted using CMK (AES-256)
- Include key rotation policies and audit logging
Use direction TB for top-to-bottom hierarchy.`,
  },

  'azure-landing-zone': {
    name: 'Azure Landing Zone',
    description: 'Enterprise-scale Azure landing zone with management groups, subscriptions, networking',
    style: 'azure',
    quality: 'enterprise',
    prompt: `Azure Enterprise Landing Zone architecture showing:
- Management Group Hierarchy:
  - Root Management Group
  - Platform (Identity, Management, Connectivity)
  - Landing Zones (Corp, Online)
  - Sandbox/Decommissioned
- Platform Subscriptions:
  - Identity: Entra ID Connect, Domain Controllers
  - Management: Log Analytics, Automation, Security Center
  - Connectivity: Hub VNet, Azure Firewall, ExpressRoute/VPN
- Landing Zone Subscriptions:
  - Spoke VNets with peering to Hub
  - Application workloads
- Azure Policy for governance (ITSG-33 or similar)
- Microsoft Defender for Cloud
- Azure Monitor and Sentinel for security
Use direction TB for hierarchy view.`,
  },

  'zero-trust': {
    name: 'Zero Trust Architecture',
    description: 'Enterprise Zero Trust with identity, device, network, and data protection',
    style: 'azure',
    quality: 'enterprise',
    prompt: `Enterprise Zero Trust Security Architecture showing:
- Identity Pillar:
  - Entra ID (Identity Provider)
  - Conditional Access Policies
  - Privileged Identity Management (PIM)
  - Multi-Factor Authentication
- Device Pillar:
  - Intune MDM/MAM
  - Device Compliance
  - Defender for Endpoint
- Network Pillar:
  - Azure Firewall
  - Private Endpoints
  - VNet Segmentation
  - Web Application Firewall
- Application Pillar:
  - App Service with Managed Identity
  - API Management
  - App Proxy
- Data Pillar:
  - Key Vault (CMK)
  - Microsoft Purview (DLP, Sensitivity Labels)
  - Encryption at rest and in transit
- Security Operations:
  - Microsoft Sentinel (SIEM)
  - Defender XDR
  - Log Analytics
Show verification/trust boundaries at each layer.`,
  },

  // ===== AWS TEMPLATES =====
  'aws-serverless': {
    name: 'AWS Serverless',
    description: 'Serverless architecture with API Gateway, Lambda, DynamoDB, and security',
    style: 'aws',
    quality: 'enterprise',
    prompt: `AWS Serverless Architecture showing:
- API Layer:
  - CloudFront CDN
  - WAF (Web Application Firewall)
  - API Gateway (REST/HTTP API)
- Compute Layer:
  - Lambda Functions (multiple services)
  - Step Functions for orchestration
- Data Layer:
  - DynamoDB (primary data)
  - ElastiCache (Redis for caching)
  - S3 (object storage)
- Security:
  - IAM Roles with least privilege
  - KMS for encryption
  - Secrets Manager
  - Cognito for authentication
- Event-Driven:
  - EventBridge
  - SQS queues
  - SNS topics
- Monitoring:
  - CloudWatch Logs and Metrics
  - X-Ray tracing
  - CloudTrail audit
Use direction LR for request flow.`,
  },

  'aws-eks': {
    name: 'AWS EKS Platform',
    description: 'Production EKS cluster with networking, security, and observability',
    style: 'aws',
    quality: 'enterprise',
    prompt: `AWS EKS Production Platform showing:
- Networking:
  - VPC with public and private subnets
  - NAT Gateway
  - Application Load Balancer
  - AWS PrivateLink
- EKS Cluster:
  - Control Plane (managed)
  - Node Groups (managed/self-managed)
  - Fargate profiles (optional)
- Security:
  - IAM Roles for Service Accounts (IRSA)
  - KMS for secrets encryption
  - Security Groups
  - Network Policies
- Storage:
  - EBS CSI Driver
  - EFS CSI Driver
- Observability:
  - CloudWatch Container Insights
  - Prometheus/Grafana
  - AWS X-Ray
- CI/CD:
  - CodePipeline
  - ECR (Container Registry)
Use direction TB.`,
  },

  // ===== GCP TEMPLATES =====
  'gcp-data-platform': {
    name: 'GCP Data Platform',
    description: 'Modern data platform with BigQuery, Dataflow, and analytics',
    style: 'gcp',
    quality: 'enterprise',
    prompt: `GCP Data Platform Architecture showing:
- Data Ingestion:
  - Pub/Sub for streaming
  - Cloud Storage for batch
  - Dataflow for ETL/ELT
- Data Lake:
  - Cloud Storage (raw, processed, curated zones)
  - Data Catalog for metadata
- Data Warehouse:
  - BigQuery (analytics)
  - BigQuery ML
- Data Processing:
  - Dataflow (Apache Beam)
  - Dataproc (Spark)
  - Cloud Composer (Airflow)
- Security:
  - Cloud KMS for encryption
  - IAM with fine-grained access
  - VPC Service Controls
  - Data Loss Prevention API
- Visualization:
  - Looker / Looker Studio
- Monitoring:
  - Cloud Monitoring
  - Cloud Logging
Use direction LR for data flow.`,
  },

  // ===== KUBERNETES TEMPLATES =====
  'k8s-microservices': {
    name: 'Kubernetes Microservices',
    description: 'Production microservices platform with service mesh and observability',
    style: 'k8s',
    quality: 'enterprise',
    prompt: `Kubernetes Microservices Platform showing:
- Ingress Layer:
  - Ingress Controller (Nginx/Traefik)
  - TLS termination
  - Rate limiting
- Service Mesh:
  - Istio/Linkerd sidecar proxies
  - mTLS between services
  - Traffic management
- Microservices:
  - Multiple Deployments with HPA
  - Services for each microservice
  - ConfigMaps and Secrets
- Data Layer:
  - StatefulSets for databases
  - PersistentVolumes
  - Redis for caching
- Security:
  - RBAC (Roles, RoleBindings)
  - Network Policies
  - Pod Security Standards
  - Service Accounts
- Observability:
  - Prometheus + Grafana
  - Jaeger/Tempo for tracing
  - Loki for logs
- GitOps:
  - ArgoCD or Flux
Use direction TB for cluster hierarchy.`,
  },

  // ===== GENERIC/OPEN SOURCE TEMPLATES =====
  'oss-observability': {
    name: 'Open Source Observability',
    description: 'Full observability stack with Prometheus, Grafana, Loki, Tempo',
    style: 'generic',
    quality: 'enterprise',
    prompt: `Open Source Observability Stack showing:
- Metrics:
  - Prometheus (metrics collection)
  - Alertmanager (alerting)
  - Node Exporter, cAdvisor
- Logs:
  - Loki (log aggregation)
  - Promtail (log shipping)
  - FluentBit alternative
- Traces:
  - Tempo or Jaeger
  - OpenTelemetry Collector
- Visualization:
  - Grafana (unified dashboards)
  - Grafana Alerting
- Storage:
  - Object Storage (S3/GCS/Minio)
  - Time-series optimized
- Integration:
  - PagerDuty/OpsGenie for alerts
  - Slack notifications
Show data flow from applications to storage to visualization.`,
  },

  'oss-cicd': {
    name: 'Open Source CI/CD',
    description: 'GitOps CI/CD pipeline with GitHub Actions, ArgoCD, and container registry',
    style: 'generic',
    quality: 'enterprise',
    prompt: `Open Source CI/CD Pipeline showing:
- Source Control:
  - GitHub/GitLab repository
  - Branch protection
  - Pull request workflow
- CI Pipeline:
  - GitHub Actions / GitLab CI / Jenkins
  - Build stage
  - Test stage (unit, integration)
  - Security scanning (Trivy, SonarQube)
  - Container build
- Container Registry:
  - Docker Registry / Harbor
  - Image signing
- CD Pipeline:
  - ArgoCD / Flux for GitOps
  - Helm charts / Kustomize
  - Environment promotion (dev -> staging -> prod)
- Deployment Targets:
  - Kubernetes clusters
  - Multiple environments
- Notifications:
  - Slack/Teams integration
  - Deployment status
Use direction LR for pipeline flow.`,
  },

  'oss-secrets': {
    name: 'Open Source Secrets Management',
    description: 'HashiCorp Vault-based secrets management with PKI and dynamic secrets',
    style: 'generic',
    quality: 'enterprise',
    prompt: `HashiCorp Vault Secrets Management showing:
- Vault Cluster:
  - Vault servers (HA)
  - Consul backend or Raft storage
  - Auto-unseal with cloud KMS
- Authentication:
  - OIDC/LDAP integration
  - Kubernetes auth method
  - AppRole for applications
- Secrets Engines:
  - KV v2 (static secrets)
  - PKI (certificate management)
  - Database (dynamic credentials)
  - AWS/Azure/GCP (cloud credentials)
- Consumers:
  - Applications via Vault Agent
  - Kubernetes via CSI driver
  - CI/CD pipelines
- Audit:
  - Audit logs to SIEM
  - Metrics to Prometheus
- DR:
  - Replication to DR cluster
  - Backup/restore procedures
Use direction TB for architecture layers.`,
  },
};

// =============================================================================
// SMART DESCRIPTION ENHANCEMENT
// =============================================================================

/**
 * Analyzes a user's description and enhances it with additional context
 * to help Claude generate a better diagram.
 */
function enhanceDescription(description, quality) {
  const keywords = description.toLowerCase();
  const enhancements = [];
  
  // Detect common patterns and suggest additions
  if (keywords.includes('cmk') || keywords.includes('customer managed key') || keywords.includes('encryption')) {
    enhancements.push('Include key hierarchy showing root keys wrapping service-specific keys');
    enhancements.push('Show RBAC permissions for key access');
    if (!keywords.includes('dr') && !keywords.includes('disaster')) {
      enhancements.push('Consider including DR key vault with geo-replication');
    }
  }
  
  if (keywords.includes('m365') || keywords.includes('microsoft 365') || keywords.includes('office 365')) {
    if (!keywords.includes('sharepoint') && !keywords.includes('exchange') && !keywords.includes('teams')) {
      enhancements.push('Include relevant M365 workloads: SharePoint, Exchange, Teams');
    }
  }
  
  if (keywords.includes('serverless') || keywords.includes('lambda') || keywords.includes('function')) {
    enhancements.push('Show API layer (API Gateway/Management)');
    enhancements.push('Include event sources and triggers');
  }
  
  if (keywords.includes('kubernetes') || keywords.includes('k8s') || keywords.includes('eks') || keywords.includes('aks') || keywords.includes('gke')) {
    enhancements.push('Show ingress/load balancer');
    enhancements.push('Include namespace organization');
    if (!keywords.includes('rbac')) {
      enhancements.push('Consider RBAC components');
    }
  }
  
  if (keywords.includes('api') && !keywords.includes('gateway')) {
    enhancements.push('Include API Gateway or management layer');
  }
  
  if (keywords.includes('microservice')) {
    enhancements.push('Show service-to-service communication patterns');
    enhancements.push('Consider service mesh or load balancing');
  }
  
  // Quality-specific enhancements
  if (quality === 'enterprise') {
    if (!keywords.includes('monitor') && !keywords.includes('log') && !keywords.includes('observ')) {
      enhancements.push('Add monitoring/logging layer (Log Analytics, CloudWatch, or Prometheus/Grafana)');
    }
    if (!keywords.includes('identity') && !keywords.includes('iam') && !keywords.includes('entra') && !keywords.includes('auth')) {
      enhancements.push('Add identity and access management components');
    }
    if (!keywords.includes('automat') && !keywords.includes('pipeline') && !keywords.includes('devops')) {
      enhancements.push('Consider automation/CI-CD components');
    }
  }
  
  if (enhancements.length > 0) {
    return `${description}

Additional recommendations for a complete diagram:
${enhancements.map(e => `- ${e}`).join('\n')}`;
  }
  
  return description;
}

// =============================================================================
// SYSTEM PROMPT GENERATOR
// =============================================================================

function getSystemPrompt(style, quality) {
  const styleConfig = DIAGRAM_STYLES[style] || DIAGRAM_STYLES.azure;
  const qualityConfig = QUALITY_PRESETS[quality] || QUALITY_PRESETS.standard;
  
  return `You are an expert cloud architect specializing in enterprise security architectures. Generate Python code using the 'diagrams' library to create professional architecture diagrams.

You MUST respond with valid JSON in this exact format (no markdown code blocks):
{
  "name": "diagram_name_snake_case",
  "title": "Human Readable Diagram Title",
  "description": "Brief description of what the diagram shows",
  "python_code": "<complete python code here>"
}

QUALITY LEVEL: ${qualityConfig.name}
${qualityConfig.guidance}

AVAILABLE IMPORTS FOR ${styleConfig.name.toUpperCase()}:
${styleConfig.imports}

DIAGRAM STRUCTURE:
\`\`\`python
graph_attr = {
    "fontsize": "24",
    "bgcolor": "white",
    "pad": "0.6",
    "splines": "ortho",
    "nodesep": "0.7",
    "ranksep": "0.9",
}

with Diagram(
    "Diagram Title",
    filename="OUTPUT_PATH",
    outformat="png",
    show=False,
    direction="LR",  # LR for flows, TB for hierarchies
    graph_attr=graph_attr
):
    # Diagram code
\`\`\`

CLUSTER COLORS BY FUNCTION:
- Identity/Users: #e3f2fd (light blue)
- Security/Keys/Encryption: #ffebee (light red)
- Automation/DevOps: #e8f5e9 (light green)
- Monitoring/Observability: #fff3e0 (light orange)
- DR/Backup: #fff8e1 (light yellow)
- Governance/RBAC: #f3e5f5 (light purple)
- Data/Storage: #e0f7fa (light cyan)

EDGE COLORS BY TYPE:
- Red (bold): Encryption, security-critical paths
- Blue: Data flow, primary connections
- Purple (dashed): RBAC, identity, permissions
- Green: Content delivery, success paths
- Orange (dashed): Replication, DR, async
- Gray (dotted): Audit, logging, secondary

REFERENCE PATTERNS:
${styleConfig.examples}

CRITICAL RULES:
1. Always use show=False and filename="OUTPUT_PATH"
2. NEVER use literal newlines in strings - always use \\n
3. Use multi-line labels: "Line1\\nLine2\\n(Details)"
4. Create nested Clusters for hierarchies
5. Color-code edges by their purpose
6. Include all components mentioned in description
7. Use direction="LR" for flow diagrams, "TB" for hierarchical
8. ONLY use imports from the AVAILABLE IMPORTS section above - do not invent new icons
9. If an icon doesn't exist (e.g., Fluentd), use a similar one (FluentBit) or generic (Rack)
10. Common mistakes to avoid:
    - Fluentd does NOT exist - use FluentBit
    - HPA is in k8s.clusterconfig, not k8s.others
    - Tekton, Podman, Gitea do NOT exist
    - CronJob is spelled Cronjob in k8s.compute
    - Kubelet does NOT exist in k8s.controlplane

Generate a professional ${qualityConfig.name.toLowerCase()}-level architecture diagram.`;
}

// =============================================================================
// JSON PARSING HELPER
// =============================================================================

function parseClaudeJsonResponse(responseText) {
  let jsonStr = responseText.trim();
  
  jsonStr = jsonStr
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  
  jsonStr = jsonMatch[0];
  
  try {
    const result = JSON.parse(jsonStr);
    if (result.python_code) {
      result.python_code = result.python_code
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"');
    }
    return result;
  } catch (e) {
    // Continue with fixing
  }
  
  const codeMatch = jsonStr.match(/"python_code"\s*:\s*"/);
  if (!codeMatch) {
    throw new Error('No "python_code" field found in response');
  }
  
  const codeKeyEnd = codeMatch.index + codeMatch[0].length;
  const beforeCode = jsonStr.slice(0, codeKeyEnd);
  const afterCodeStart = jsonStr.slice(codeKeyEnd);
  
  let codeEndIndex = -1;
  let i = 0;
  let escaped = false;
  
  while (i < afterCodeStart.length) {
    const char = afterCodeStart[i];
    
    if (escaped) {
      escaped = false;
      i++;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      i++;
      continue;
    }
    
    if (char === '"') {
      const remaining = afterCodeStart.slice(i + 1).trimStart();
      if (remaining.length === 0 || remaining[0] === '}' || remaining[0] === ',') {
        codeEndIndex = i;
        break;
      }
    }
    
    i++;
  }
  
  if (codeEndIndex === -1) {
    throw new Error('Could not find end of python_code string');
  }
  
  const codeContent = afterCodeStart.slice(0, codeEndIndex);
  const afterCode = afterCodeStart.slice(codeEndIndex);
  
  const escapedCode = codeContent
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  
  const fixedJson = beforeCode + escapedCode + afterCode;
  
  const result = JSON.parse(fixedJson);
  
  if (result.python_code) {
    result.python_code = result.python_code
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"');
  }
  
  return result;
}

// =============================================================================
// CLAUDE API - DIAGRAM CODE GENERATION
// =============================================================================

async function generateDiagramWithClaude(description, style, quality, options = {}) {
  if (!config.anthropic.apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in .env file');
  }

  const styleConfig = DIAGRAM_STYLES[style];
  if (!styleConfig) {
    throw new Error(`Unknown style: ${style}. Available: ${Object.keys(DIAGRAM_STYLES).join(', ')}`);
  }

  const client = new Anthropic({
    apiKey: config.anthropic.apiKey,
  });

  // Enhance description based on quality level
  const enhancedDescription = quality === 'enterprise' 
    ? enhanceDescription(description, quality)
    : description;

  console.log(`\n🤖 Calling Claude API (${config.anthropic.model})...`);
  console.log(`   Style: ${styleConfig.name}`);
  console.log(`   Quality: ${QUALITY_PRESETS[quality]?.name || quality}`);
  if (options.verbose) {
    console.log(`   Description: "${enhancedDescription.slice(0, 200)}..."\n`);
  }

  const message = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Generate a Python diagrams architecture diagram for:

${enhancedDescription}

Respond with ONLY valid JSON containing name, title, description, and python_code fields.
The python_code must be a complete, executable Python script.
CRITICAL: Use \\n for line breaks in labels, never actual newlines inside strings.`,
      },
    ],
    system: getSystemPrompt(style, quality),
  });

  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  let diagramSpec;
  try {
    diagramSpec = parseClaudeJsonResponse(responseText);
  } catch (parseError) {
    console.error('Failed to parse Claude response as JSON:');
    console.error('─'.repeat(60));
    console.error(responseText.slice(0, 2000));
    console.error('─'.repeat(60));
    throw new Error(`Invalid JSON response from Claude: ${parseError.message}`);
  }

  if (!diagramSpec.name || !diagramSpec.title || !diagramSpec.python_code) {
    throw new Error('Missing required fields in diagram specification');
  }

  diagramSpec.style = style;
  diagramSpec.quality = quality;

  if (options.verbose) {
    console.log('\n📝 Generated Python Code:');
    console.log('─'.repeat(60));
    console.log(diagramSpec.python_code);
    console.log('─'.repeat(60));
  }

  return diagramSpec;
}

// =============================================================================
// PYTHON CODE SANITIZATION
// =============================================================================

function sanitizePythonCode(code) {
  // Fix double-quoted strings with literal newlines
  let fixed = code.replace(/"([^"]*)"/g, (match, content) => {
    if (content.includes('\n')) {
      return `"${content.replace(/\n/g, '\\n')}"`;
    }
    return match;
  });

  // Fix single-quoted strings with literal newlines
  fixed = fixed.replace(/'([^']*)'/g, (match, content) => {
    if (content.includes('\n')) {
      return `'${content.replace(/\n/g, '\\n')}'`;
    }
    return match;
  });

  return fixed;
}

// =============================================================================
// PYTHON EXECUTION - RENDER DIAGRAM
// =============================================================================

async function renderDiagramWithPython(pythonCode, outputPath, verbose = false) {
  const sanitizedCode = sanitizePythonCode(pythonCode);

  const modifiedCode = sanitizedCode.replace(
    /filename\s*=\s*["']OUTPUT_PATH["']/g,
    `filename="${outputPath.replace(/\\/g, '/')}"`
  );

  const finalCode = modifiedCode.replace(
    /filename\s*=\s*["'][^"']+["']/g,
    `filename="${outputPath.replace(/\\/g, '/')}"`
  );

  const pythonFile = path.join(config.temp.dir, config.temp.pythonFile);
  fs.writeFileSync(pythonFile, finalCode);

  if (verbose) {
    console.log(`\n🐍 Executing Python script: ${pythonFile}`);
  }

  return new Promise((resolve, reject) => {
    const python = spawn('python3', [pythonFile], {
      cwd: config.temp.dir,
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
      if (verbose) {
        process.stdout.write(data);
      }
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      if (verbose) {
        process.stderr.write(data);
      }
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('\n❌ Python Error:');
        console.error('─'.repeat(60));
        console.error(stderr);
        console.error('─'.repeat(60));
        console.error('\n📝 Python code that caused the error:');
        console.error('─'.repeat(60));
        console.error(finalCode);
        console.error('─'.repeat(60));
        reject(new Error(`Python process exited with code ${code}`));
        return;
      }

      const imagePath = `${outputPath}.png`;
      if (!fs.existsSync(imagePath)) {
        reject(new Error(`Diagram image not created at ${imagePath}`));
        return;
      }

      resolve(imagePath);
    });

    python.on('error', (err) => {
      reject(new Error(`Failed to start Python: ${err.message}. Make sure Python 3 is installed.`));
    });
  });
}

// =============================================================================
// TEMP FILE MANAGEMENT
// =============================================================================

function ensureTempDir() {
  if (!fs.existsSync(config.temp.dir)) {
    fs.mkdirSync(config.temp.dir, { recursive: true });
  }
}

function saveTempSpec(spec) {
  ensureTempDir();
  const specPath = path.join(config.temp.dir, config.temp.specFile);
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
  return specPath;
}

function loadTempSpec() {
  const specPath = path.join(config.temp.dir, config.temp.specFile);
  if (!fs.existsSync(specPath)) {
    throw new Error('No diagram found in temp. Run "generate" command first.');
  }
  return JSON.parse(fs.readFileSync(specPath, 'utf8'));
}

function loadTempImage() {
  const imagePath = path.join(config.temp.dir, 'diagram.png');
  if (!fs.existsSync(imagePath)) {
    throw new Error('No diagram image found in temp. Run "generate" command first.');
  }
  return fs.readFileSync(imagePath);
}

function getTempImagePath() {
  return path.join(config.temp.dir, 'diagram.png');
}

function cleanTemp() {
  if (fs.existsSync(config.temp.dir)) {
    fs.rmSync(config.temp.dir, { recursive: true });
  }
}

// =============================================================================
// PUBLISH TARGETS
// =============================================================================

async function publishToLocal(spec, imageBuffer) {
  const outputDir = config.local.outputDir;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const imagePath = path.join(outputDir, `${spec.name}.png`);
  fs.writeFileSync(imagePath, imageBuffer);

  return {
    path: path.resolve(imagePath),
    url: path.resolve(imagePath),
  };
}

async function publishToGitHub(spec, imageBuffer) {
  const { token, owner, repo, branch, folder, userName, userEmail } = config.github;

  if (!token || !owner) {
    throw new Error('GitHub configuration missing. Set GITHUB_TOKEN and GITHUB_OWNER in .env');
  }

  const tempDir = path.join(__dirname, '.temp-github-publish');
  const repoUrl = `https://${token}@github.com/${owner}/${repo}.git`;

  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    const git = simpleGit(tempDir);

    console.log('  Cloning repository...');
    await git.clone(repoUrl, tempDir, ['--depth', '1', '--branch', branch]);

    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);

    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const imagePath = path.join(imagesDir, `${spec.name}.png`);
    fs.writeFileSync(imagePath, imageBuffer);

    await git.add('.');

    const status = await git.status();
    if (status.files.length > 0) {
      const timestamp = new Date().toISOString();
      await git.commit(`${config.commitMessage}: ${spec.title} [${timestamp}]`);
      await git.push('origin', branch);
      console.log('  ✓ Pushed to GitHub');
    } else {
      console.log('  No changes to commit');
    }

    return {
      path: `${folder}/${spec.name}.png`,
      url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${folder}/${spec.name}.png`,
    };
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  }
}

async function publishToAzureDevOps(spec, imageBuffer) {
  const { token, org, project, repo, branch, folder, userName, userEmail } = config.devops;

  if (!token || !org || !project) {
    throw new Error('Azure DevOps configuration missing. Set AZDO_TOKEN, AZDO_ORG, and AZDO_PROJECT in .env');
  }

  const tempDir = path.join(__dirname, '.temp-devops-publish');
  const repoUrl = `https://${token}@dev.azure.com/${org}/${project}/_git/${repo}`;

  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    const git = simpleGit(tempDir);

    console.log('  Cloning repository...');
    await git.clone(repoUrl, tempDir, ['--depth', '1', '--branch', branch]);

    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);

    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const imagePath = path.join(imagesDir, `${spec.name}.png`);
    fs.writeFileSync(imagePath, imageBuffer);

    await git.add('.');

    const status = await git.status();
    if (status.files.length > 0) {
      const timestamp = new Date().toISOString();
      await git.commit(`${config.commitMessage}: ${spec.title} [${timestamp}]`);
      await git.push('origin', branch);
      console.log('  ✓ Pushed to Azure DevOps');
    } else {
      console.log('  No changes to commit');
    }

    return {
      path: `${folder}/${spec.name}.png`,
      url: `https://dev.azure.com/${org}/${project}/_git/${repo}?path=/${folder}/${spec.name}.png&version=GB${branch}`,
    };
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  }
}

// =============================================================================
// CLI COMMANDS
// =============================================================================

async function commandGenerate(description, options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI Diagram Generator v5.0 (Python Diagrams)            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let finalDescription = description || '';
  let style = options.style || 'azure';
  let quality = options.quality || 'standard';
  
  // Handle template option
  if (options.template) {
    const template = TEMPLATES[options.template];
    if (!template) {
      console.error(`\n❌ Unknown template: ${options.template}`);
      console.log('Available templates: ' + Object.keys(TEMPLATES).join(', '));
      console.log('Run "templates" command to see details.');
      process.exit(1);
    }
    
    console.log(`\n📋 Using template: ${template.name}`);
    console.log(`   ${template.description}`);
    
    finalDescription = template.prompt;
    if (description) {
      finalDescription += `\n\nAdditional requirements: ${description}`;
    }
    style = template.style;
    quality = template.quality || 'enterprise';
  }
  
  if (!finalDescription) {
    console.error('\n❌ Error: Please provide a description or use --template');
    console.log('\nUsage:');
    console.log('  node ai-diagram.js generate "Your architecture description"');
    console.log('  node ai-diagram.js generate "Simple web app" --quality simple');
    console.log('  node ai-diagram.js generate "Full platform" --quality enterprise');
    console.log('  node ai-diagram.js generate --template m365-cmk');
    console.log('\nRun "templates" to see available templates.');
    process.exit(1);
  }
  
  console.log(`\n📊 Diagram Style: ${DIAGRAM_STYLES[style]?.name || style}`);
  console.log(`📈 Quality Level: ${QUALITY_PRESETS[quality]?.name || quality}`);

  try {
    ensureTempDir();
    
    const spec = await generateDiagramWithClaude(finalDescription, style, quality, options);

    console.log('\n📋 Generated Specification:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Description: ${spec.description}`);

    console.log('\n🎨 Rendering diagram with Python diagrams library...');
    const outputPath = path.join(config.temp.dir, 'diagram');
    const imagePath = await renderDiagramWithPython(spec.python_code, outputPath, options.verbose);

    saveTempSpec(spec);

    console.log('\n✅ Diagram generated successfully!');
    console.log('');
    console.log('📁 Files:');
    console.log(`   Image: ${imagePath}`);
    console.log(`   Python: ${path.join(config.temp.dir, config.temp.pythonFile)}`);
    console.log('');
    console.log('👀 Preview:');
    console.log(`   open "${imagePath}"`);
    console.log('');
    console.log('📤 Publish:');
    console.log('   node ai-diagram.js publish --target local');
    console.log('   node ai-diagram.js publish --target github');
    console.log('   node ai-diagram.js publish --target devops');
    console.log('');

    if (options.open) {
      const { exec } = await import('child_process');
      const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${openCmd} "${imagePath}"`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function commandPreview(options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI Diagram Generator v5.0 - Preview                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();

    console.log('\n📋 Current Diagram:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Style: ${spec.style || 'unknown'}`);
    console.log(`   Quality: ${spec.quality || 'unknown'}`);
    console.log(`   Description: ${spec.description}`);

    const imagePath = getTempImagePath();
    console.log(`\n📁 Image: ${imagePath}`);

    if (options.code) {
      console.log('\n🐍 Python Source:');
      console.log('─'.repeat(60));
      console.log(spec.python_code);
      console.log('─'.repeat(60));
    }

    if (options.open) {
      const { exec } = await import('child_process');
      const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${openCmd} "${imagePath}"`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

async function commandRegenerate(options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI Diagram Generator v5.0 - Regenerate                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();

    console.log('\n📋 Regenerating diagram:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);

    console.log('\n🎨 Rendering diagram with Python...');
    const outputPath = path.join(config.temp.dir, 'diagram');
    const imagePath = await renderDiagramWithPython(spec.python_code, outputPath, options.verbose);

    console.log('\n✅ Diagram regenerated successfully!');
    console.log(`📁 Image: ${imagePath}`);

    if (options.open) {
      const { exec } = await import('child_process');
      const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${openCmd} "${imagePath}"`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function commandPublish(options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI Diagram Generator v5.0 - Publish                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();
    const imageBuffer = loadTempImage();

    console.log('\n📋 Publishing diagram:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Target: ${options.target}`);

    let result;

    switch (options.target) {
      case 'local':
        console.log('\n📁 Saving to local filesystem...');
        result = await publishToLocal(spec, imageBuffer);
        break;
      case 'github':
        console.log('\n🐙 Pushing to GitHub...');
        result = await publishToGitHub(spec, imageBuffer);
        break;
      case 'devops':
        console.log('\n🔷 Pushing to Azure DevOps...');
        result = await publishToAzureDevOps(spec, imageBuffer);
        break;
      case 'all':
        console.log('\n📤 Publishing to all targets...');
        const results = {};
        
        console.log('\n📁 Local:');
        results.local = await publishToLocal(spec, imageBuffer);
        console.log(`   ✓ ${results.local.path}`);
        
        if (config.github.token && config.github.owner) {
          console.log('\n🐙 GitHub:');
          results.github = await publishToGitHub(spec, imageBuffer);
          console.log(`   ✓ ${results.github.url}`);
        }
        
        if (config.devops.token && config.devops.org) {
          console.log('\n🔷 Azure DevOps:');
          results.devops = await publishToAzureDevOps(spec, imageBuffer);
          console.log(`   ✓ ${results.devops.url}`);
        }
        
        result = results;
        break;
      default:
        throw new Error(`Unknown target: ${options.target}`);
    }

    console.log('\n✅ Published successfully!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('MARKDOWN REFERENCE:');
    console.log('═══════════════════════════════════════════════════════════════');

    if (options.target === 'all') {
      for (const [target, res] of Object.entries(result)) {
        console.log(`\n${target.toUpperCase()}:`);
        console.log(`  ![${spec.title}](${res.url})`);
      }
    } else {
      console.log(`\n![${spec.title}](${result.url})`);
    }

    console.log('');

    if (options.clean) {
      cleanTemp();
      console.log('🧹 Temp files cleaned');
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function commandStyles() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI Diagram Generator v5.0 - Available Styles           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  for (const [key, style] of Object.entries(DIAGRAM_STYLES)) {
    console.log(`  ${key.padEnd(12)} ${style.name}`);
  }
  
  console.log('');
  console.log('Usage:');
  console.log('  node ai-diagram.js generate "description" --style azure');
  console.log('  node ai-diagram.js generate "description" --style aws');
  console.log('  node ai-diagram.js generate "description" --style gcp');
  console.log('  node ai-diagram.js generate "description" --style k8s');
  console.log('  node ai-diagram.js generate "description" --style generic');
  console.log('');
}

async function commandTemplates() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI Diagram Generator v5.0 - Available Templates        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Group by style
  const byStyle = {};
  for (const [key, template] of Object.entries(TEMPLATES)) {
    const style = template.style || 'generic';
    if (!byStyle[style]) byStyle[style] = [];
    byStyle[style].push({ key, ...template });
  }
  
  for (const [style, templates] of Object.entries(byStyle)) {
    console.log(`\n  ── ${DIAGRAM_STYLES[style]?.name || style.toUpperCase()} ──`);
    for (const t of templates) {
      console.log(`  ${t.key}`);
      console.log(`     ${t.name}`);
      console.log(`     ${t.description}`);
    }
  }
  
  console.log('');
  console.log('Usage:');
  console.log('  node ai-diagram.js generate --template m365-cmk --open');
  console.log('  node ai-diagram.js generate --template aws-serverless --open');
  console.log('  node ai-diagram.js generate --template oss-observability --open');
  console.log('');
  console.log('Customize with additional description:');
  console.log('  node ai-diagram.js generate "Add Redis cache" --template aws-serverless');
  console.log('');
}

async function commandQuality() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     AI Diagram Generator v5.0 - Quality Levels             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  for (const [key, preset] of Object.entries(QUALITY_PRESETS)) {
    console.log(`  ${key.padEnd(12)} ${preset.name}`);
    console.log(`               ${preset.description}`);
    console.log('');
  }
  
  console.log('Usage:');
  console.log('  node ai-diagram.js generate "web app" --quality simple');
  console.log('  node ai-diagram.js generate "microservices" --quality standard');
  console.log('  node ai-diagram.js generate "enterprise platform" --quality enterprise');
  console.log('');
}

async function commandClean() {
  console.log('');
  console.log('🧹 Cleaning temp files...');
  cleanTemp();
  console.log('✅ Done');
}

// =============================================================================
// MAIN
// =============================================================================

program
  .name('ai-diagram')
  .description('AI-powered architecture diagram generator using Python diagrams library')
  .version('5.0.0');

program
  .command('generate [description]')
  .description('Generate a diagram from natural language or template')
  .option('-s, --style <style>', 'Diagram style: azure, aws, gcp, k8s, generic', 'azure')
  .option('-q, --quality <quality>', 'Quality level: simple, standard, enterprise', 'standard')
  .option('-t, --template <template>', 'Use a predefined template')
  .option('-o, --open', 'Open the generated image automatically')
  .option('-v, --verbose', 'Show detailed output')
  .action(commandGenerate);

program
  .command('templates')
  .description('List available predefined templates')
  .action(commandTemplates);

program
  .command('styles')
  .description('List available diagram styles (icon packs)')
  .action(commandStyles);

program
  .command('quality')
  .description('List quality presets')
  .action(commandQuality);

program
  .command('preview')
  .description('Preview the current diagram in temp')
  .option('-o, --open', 'Open the image automatically')
  .option('-c, --code', 'Show Python source code')
  .action(commandPreview);

program
  .command('regenerate')
  .description('Regenerate image from modified spec')
  .option('-o, --open', 'Open the generated image automatically')
  .option('-v, --verbose', 'Show detailed output')
  .action(commandRegenerate);

program
  .command('publish')
  .description('Publish the diagram to a target')
  .option('-t, --target <target>', 'Target: local, github, devops, all', 'local')
  .option('-c, --clean', 'Clean temp files after publishing')
  .option('-v, --verbose', 'Show detailed output')
  .action(commandPublish);

program
  .command('clean')
  .description('Remove temp files')
  .action(commandClean);

program.parse(process.argv);