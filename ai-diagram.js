#!/usr/bin/env node
/**
 * AI-Powered Diagram Generator v6.0
 * 
 * Generates professional architecture diagrams from natural language descriptions.
 * Supports multiple cloud providers, enterprise architecture styles, and predefined templates.
 * 
 * v6.0 Features:
 *   - Enterprise Architecture: C4 Model, UML/UML2, ArchiMate, TOGAF, Zachman
 *   - Cloud Providers: Azure, AWS, GCP, Alibaba Cloud, IBM Cloud, Oracle OCI, DigitalOcean, OpenStack, Outscale
 *   - Container/DevOps: Kubernetes, Generic/Open-source
 *   - Specialized: Elastic Stack, Firebase
 *   - Quality presets: simple, standard, enterprise
 *   - 40+ predefined templates
 *   - Smart description enhancement
 *   - Automatic multi-line string sanitization
 * 
 * Usage:
 *   node ai-diagram.js generate "Your architecture" --style azure --quality enterprise
 *   node ai-diagram.js generate "class diagram for e-commerce" --style uml
 *   node ai-diagram.js generate --template archimate-layered
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
// DIAGRAM STYLES - All supported icon packs
// =============================================================================

const DIAGRAM_STYLES = {
  // ===== CLOUD PROVIDERS =====
  
  azure: {
    name: 'Azure Architecture',
    category: 'Cloud Providers',
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
from diagrams.generic.database import SQL`,
    examples: `
# M365 CMK Key Hierarchy Pattern:
with Cluster("Azure Key Vault (HSM-Protected)", graph_attr={"bgcolor": "#ffebee"}):
    with Cluster("Root Keys"):
        root_key = KeyVaults("Customer\\nRoot Key\\n(RSA 2048+)")
    with Cluster("Data Encryption Policy Keys"):
        dep_spo = KeyVaults("DEP Key\\nSharePoint")
        dep_teams = KeyVaults("DEP Key\\nTeams")
    root_key >> Edge(label="Wraps", color="red", style="bold") >> dep_spo

# Identity Pattern:
with Cluster("Identity & Access Control", graph_attr={"bgcolor": "#f3e5f5"}):
    entra = ActiveDirectory("Entra ID")
    mi = ManagedIdentities("Service\\nPrincipal")
    entra >> mi

# Monitoring Pattern:
with Cluster("Monitoring", graph_attr={"bgcolor": "#fff3e0"}):
    law = LogAnalyticsWorkspaces("Log Analytics")
    alert = Rack("Alerts")
    law >> alert`,
  },

  aws: {
    name: 'AWS Architecture',
    category: 'Cloud Providers',
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
from diagrams.generic.compute import Rack`,
    examples: `
# AWS Security Pattern with KMS:
with Cluster("AWS Security", graph_attr={"bgcolor": "#ffebee"}):
    kms = KMS("KMS\\nCMK")
    secrets = SecretsManager("Secrets\\nManager")

# AWS Serverless Pattern:
with Cluster("API Layer", graph_attr={"bgcolor": "#e8f5e9"}):
    api = APIGateway("API Gateway")
    waf = WAF("WAF")
    waf >> api`,
  },

  gcp: {
    name: 'GCP Architecture',
    category: 'Cloud Providers',
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
from diagrams.generic.compute import Rack`,
    examples: `
# GCP Security Pattern:
with Cluster("Security", graph_attr={"bgcolor": "#ffebee"}):
    kms = KeyManagementService("Cloud KMS")
    scc = SecurityCommandCenter("Security\\nCommand Center")`,
  },

  alibabacloud: {
    name: 'Alibaba Cloud',
    category: 'Cloud Providers',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.alibabacloud.compute import ECS, ContainerService, FunctionCompute, ElasticSearch, AutoScaling
from diagrams.alibabacloud.database import RDS, PolarDB, Redis as AliRedis, MongoDB as AliMongoDB, AnalyticDB
from diagrams.alibabacloud.network import SLB, ALB, VPC as AliVPC, CDN as AliCDN, DNS as AliDNS, NAT as AliNAT, VPN as AliVPN
from diagrams.alibabacloud.storage import OSS, NAS as AliNAS, ESSD
from diagrams.alibabacloud.security import WAF as AliWAF, AntiDdos, SecurityCenter as AliSecurityCenter, DataEncryptionService
from diagrams.alibabacloud.analytics import DataV, Datahub, ELK
from diagrams.alibabacloud.application import APIGateway as AliAPIGateway, LogService, MessageNotificationService
from diagrams.onprem.client import Users
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack`,
    examples: `# Alibaba e-commerce with Anti-DDoS, WAF, CDN, ECS, RDS`,
  },

  ibm: {
    name: 'IBM Cloud',
    category: 'Cloud Providers',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.ibm.compute import BareMetalServer, VirtualMachineClassic, MQ, PowerSystems
from diagrams.ibm.network import VPC as IbmVPC, LoadBalancerClassic, DirectLink, TransitGateway, VPN as IbmVPN
from diagrams.ibm.storage import BlockStorage, ObjectStorage, FileStorage as IbmFileStorage
from diagrams.ibm.database import CloudDatabases, Cloudant, Db2, Informix
from diagrams.ibm.applications import OpenShift, CloudFoundry
from diagrams.ibm.devops import Toolchain, AutoScaling as IbmAutoScaling
from diagrams.ibm.security import IdentityProvider, KeyProtect, ApiConnect
from diagrams.ibm.analytics import Watson, StreamingAnalytics
from diagrams.ibm.management import CloudManagement, Monitoring as IbmMonitoring, AlertNotification
from diagrams.ibm.infrastructure import ContainerKubernetes, ContainerRegistry as IbmContainerRegistry
from diagrams.ibm.general import Cloudservices
from diagrams.onprem.client import Users
from diagrams.generic.compute import Rack`,
    examples: `# IBM Hybrid with Direct Link, OpenShift, Key Protect`,
  },

  oci: {
    name: 'Oracle Cloud (OCI)',
    category: 'Cloud Providers',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.oci.compute import Compute, Container, Functions as OciFunctions, VM as OciVM, VMCluster
from diagrams.oci.database import Autonomous, DatabaseService, Dcat
from diagrams.oci.network import VCN, LoadBalancer as OciLB, DRG, Firewall as OciFirewall, ServiceGateway, InternetGateway as OciIGW
from diagrams.oci.storage import BlockStorage as OciBlock, FileStorage as OciFS, ObjectStorage as OciObject
from diagrams.oci.security import Vault, CloudGuard, IDCloud, KeyManagement, WAF as OciWAF, Bastion
from diagrams.oci.governance import Compartments, Policies, Tagging, Audit
from diagrams.oci.monitoring import Alarm, Events, Logging as OciLogging, Notifications, Telemetry
from diagrams.oci.connectivity import Backbone, CDN as OciCDN, FastConnect, VPN as OciVPN, DNS as OciDNS
from diagrams.onprem.client import Users
from diagrams.generic.compute import Rack`,
    examples: `# OCI Landing Zone with Compartments, VCN, Cloud Guard, Vault`,
  },

  digitalocean: {
    name: 'DigitalOcean',
    category: 'Cloud Providers',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.digitalocean.compute import Containers, Docker as DoDocker, Droplet, K8SCluster, K8SNodePool
from diagrams.digitalocean.database import DbaasPrimary, DbaasReadReplica, DbaasStandby
from diagrams.digitalocean.network import Certificate, Firewall as DoFirewall, FloatingIp, LoadBalancer as DoLB, DomainRegistration
from diagrams.digitalocean.storage import Folder, Space, Volume
from diagrams.onprem.client import Users
from diagrams.generic.compute import Rack`,
    examples: `# DigitalOcean with DOKS, Managed DB, Spaces`,
  },

  openstack: {
    name: 'OpenStack',
    category: 'Cloud Providers',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.openstack.compute import Nova, Qemu
from diagrams.openstack.networking import Neutron, Designate, Octavia
from diagrams.openstack.storage import Cinder, Manila, Swift
from diagrams.openstack.sharedservices import Glance, Keystone, Barbican, Heat
from diagrams.openstack.deployment import Ansible as OsAnsible, Kolla, TripleO
from diagrams.openstack.monitoring import Monasca, Telemetry
from diagrams.openstack.frontend import Horizon
from diagrams.onprem.client import Users
from diagrams.generic.compute import Rack`,
    examples: `# OpenStack with Keystone, Nova, Neutron, Cinder, Barbican`,
  },

  outscale: {
    name: 'Outscale (3DS)',
    category: 'Cloud Providers',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.outscale.compute import Compute as OsCompute, DirectConnect as OsDc
from diagrams.outscale.network import LoadBalancer as OsLB, Net, SiteToSiteVpng, InternetService, NatService
from diagrams.outscale.storage import Storage as OsStorage, SimpleStorageService
from diagrams.outscale.security import IdentityAndAccessManagement, Firewall as OsFirewall
from diagrams.onprem.client import Users
from diagrams.generic.compute import Rack`,
    examples: `# Outscale European sovereign cloud pattern`,
  },

  // ===== CONTAINER & DEVOPS =====

  k8s: {
    name: 'Kubernetes Architecture',
    category: 'Container & DevOps',
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
from diagrams.generic.compute import Rack`,
    examples: `
# K8s Ingress Pattern:
with Cluster("Kubernetes Cluster"):
    ing = Ingress("Ingress")
    with Cluster("Namespace: production"):
        svc = Service("Service")
        with Cluster("Deployment"):
            pods = [Pod("pod-1"), Pod("pod-2"), Pod("pod-3")]
        hpa = HPA("HPA")
ing >> svc >> pods`,
  },

  generic: {
    name: 'Generic / Open Source',
    category: 'Container & DevOps',
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
from diagrams.onprem.database import PostgreSQL, MySQL, MongoDB, Redis, Cassandra, InfluxDB, Neo4J, MariaDB, Clickhouse, CockroachDB
from diagrams.onprem.network import Nginx, Apache, Traefik, HAProxy, Envoy, Istio, Consul, Kong, Linkerd, Zookeeper, Caddy, Gunicorn, Tomcat
from diagrams.onprem.queue import Kafka, RabbitMQ, ActiveMQ, Celery
from diagrams.onprem.monitoring import Prometheus, Grafana, Datadog, Splunk, Nagios, Zabbix, Thanos, Sentry, Newrelic
from diagrams.onprem.ci import Jenkins, GithubActions, GitlabCI, CircleCI, DroneCI, TravisCI, Teamcity, Concourse
from diagrams.onprem.container import Docker, Containerd
from diagrams.onprem.vcs import Git, Github, Gitlab, Bitbucket
from diagrams.onprem.security import Vault, Trivy, Bitwarden
from diagrams.onprem.inmemory import Redis as RedisCache, Memcached, Hazelcast
from diagrams.onprem.logging import FluentBit, Loki, Graylog, RSyslog
from diagrams.onprem.tracing import Jaeger, Tempo
from diagrams.onprem.gitops import ArgoCD, Flux
from diagrams.onprem.workflow import Airflow, Kubeflow, Nifi
from diagrams.onprem.iac import Ansible, Terraform, Puppet, Atlantis
from diagrams.onprem.certificates import Letsencrypt, CertManager
from diagrams.saas.chat import Teams, Slack, Discord
from diagrams.saas.cdn import Cloudflare, Akamai, Fastly
from diagrams.saas.identity import Auth0, Okta
from diagrams.saas.alerting import Pagerduty, Opsgenie
from diagrams.programming.language import Python, Javascript, Go, Rust, Java, Nodejs, Csharp, Typescript
from diagrams.programming.framework import React, Vue, Angular, Django, Flask, Spring, Fastapi`,
    examples: `
# Open Source Observability Stack:
with Cluster("Observability", graph_attr={"bgcolor": "#e8f5e9"}):
    prom = Prometheus("Prometheus")
    grafana = Grafana("Grafana")
    loki = Loki("Loki")
    jaeger = Jaeger("Jaeger")
    fluentbit = FluentBit("FluentBit")  # Note: Fluentd is NOT available
    prom >> grafana
    loki >> grafana`,
  },

  // ===== ENTERPRISE ARCHITECTURE =====

  c4: {
    name: 'C4 Model',
    category: 'Enterprise Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.c4 import Person, Container, Database, System, SystemBoundary, Relationship
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL
from diagrams.generic.storage import Storage
from diagrams.onprem.client import Users`,
    examples: `
# C4 Context Diagram:
user = Person("User", "A user of the system")
system = System("E-Commerce System", "Allows users to browse and purchase")
payment = System("Payment Gateway", "External payment processing", external=True)
user >> Edge(label="Uses") >> system`,
  },

  uml: {
    name: 'UML / UML2',
    category: 'Enterprise Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL
from diagrams.generic.storage import Storage
from diagrams.generic.network import Switch, Router
from diagrams.generic.blank import Blank
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server
from diagrams.programming.language import Python, Java, Csharp
from diagrams.programming.framework import Spring, Django, React`,
    examples: `
# UML Class Diagram Pattern:
with Cluster("com.example.domain", graph_attr={"bgcolor": "#e3f2fd"}):
    customer = Rack("Customer\\n---------\\n- id: Long\\n- name: String")
    order = Rack("Order\\n---------\\n- id: Long\\n- status: Status")
customer >> Edge(label="1      *", style="bold") >> order`,
  },

  archimate: {
    name: 'ArchiMate',
    category: 'Enterprise Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL
from diagrams.generic.storage import Storage
from diagrams.generic.network import Switch, Router, Firewall, Subnet
from diagrams.generic.blank import Blank
from diagrams.generic.place import Datacenter
from diagrams.generic.device import Mobile, Tablet
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server
from diagrams.onprem.network import Nginx
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.queue import Kafka`,
    examples: `
# ArchiMate Layer Colors:
# Strategy: #fff8e1, Business: #fffde7, Application: #e3f2fd, Technology: #e8f5e9, Motivation: #fce4ec`,
  },

  enterprise: {
    name: 'Enterprise (TOGAF)',
    category: 'Enterprise Architecture',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL
from diagrams.generic.storage import Storage
from diagrams.generic.network import Switch, Router, Firewall
from diagrams.generic.place import Datacenter
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.queue import Kafka
from diagrams.saas.identity import Okta`,
    examples: `# TOGAF layers: Business=#e3f2fd, Application=#e8f5e9, Data=#fff3e0, Technology=#f3e5f5`,
  },

  // ===== SAAS & SPECIALIZED =====

  elastic: {
    name: 'Elastic Stack',
    category: 'SaaS & Specialized',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.elastic.elasticsearch import Elasticsearch, Kibana, Logstash, Beats, Alerting, MachineLearning, Maps, Monitoring
from diagrams.elastic.observability import APM, Logs, Metrics, Observability, Uptime
from diagrams.elastic.agent import Agent, Fleet, Integrations
from diagrams.elastic.beats import APM as APMBeat, Auditbeat, Filebeat, Functionbeat, Heartbeat, Metricbeat, Packetbeat, Winlogbeat
from diagrams.elastic.saas import Elastic, Cloud
from diagrams.elastic.security import Endpoint, SIEM, Security
from diagrams.generic.compute import Rack
from diagrams.onprem.client import Users`,
    examples: `# Elastic with Filebeat, Metricbeat, Logstash, Elasticsearch, Kibana, SIEM`,
  },

  firebase: {
    name: 'Firebase',
    category: 'SaaS & Specialized',
    imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.firebase.develop import Authentication, Firestore, Functions, Hosting, RealtimeDatabase, Storage as FirebaseStorage
from diagrams.firebase.grow import ABTesting, DynamicLinks, Messaging, RemoteConfig
from diagrams.firebase.quality import AppDistribution, Crashlytics, PerformanceMonitoring, TestLab
from diagrams.firebase.base import Firebase
from diagrams.onprem.client import Users
from diagrams.generic.device import Mobile, Tablet`,
    examples: `# Firebase with Authentication, Firestore, Functions, Crashlytics, FCM`,
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
- Azure Key Vault (HSM-Protected) containing Customer Root Key (RSA 2048+) and Data Encryption Policy (DEP) Keys for SharePoint, Exchange, Teams
- Root key wrapping all DEP keys
- DR Key Vault in secondary region with geo-replication
- Microsoft 365 Workloads with Availability Keys (AEK)
- Encryption flow: DEP Keys encrypt Service Keys (AEKs), AEKs encrypt Content
- Identity & Access Control: Entra ID -> M365 Service Principal -> Key Vault Crypto User RBAC
- Monitoring & Compliance: Log Analytics receiving audit logs, Key Access Alerts
Use direction LR for left-to-right encryption flow.`,
  },

  'power-platform-cmk': {
    name: 'Power Platform CMK',
    description: 'Power Platform with Customer Managed Keys - Dataverse, Power Apps, Power Automate',
    style: 'azure',
    quality: 'enterprise',
    prompt: `Power Platform Customer Managed Keys architecture showing Entra ID, Managed Identity with RBAC, Key Vault (HSM-backed), Power Apps, Power Automate, Dataverse, encrypted Blob Storage. Use direction TB.`,
  },

  'azure-landing-zone': {
    name: 'Azure Landing Zone',
    description: 'Enterprise-scale Azure landing zone with management groups, subscriptions, networking',
    style: 'azure',
    quality: 'enterprise',
    prompt: `Azure Enterprise Landing Zone with Management Group Hierarchy (Root, Platform, Landing Zones, Sandbox), Platform Subscriptions (Identity, Management, Connectivity), Spoke VNets, Azure Policy, Defender, Sentinel. Use direction TB.`,
  },

  'zero-trust': {
    name: 'Zero Trust Architecture',
    description: 'Enterprise Zero Trust with identity, device, network, and data protection',
    style: 'azure',
    quality: 'enterprise',
    prompt: `Zero Trust Security Architecture with Identity Pillar (Entra ID, Conditional Access, PIM, MFA), Device Pillar (Intune, Compliance), Network Pillar (Firewall, Private Endpoints), Application Pillar (App Service, APIM), Data Pillar (Key Vault CMK, Purview), Security Operations (Sentinel, Defender XDR).`,
  },

  // ===== AWS TEMPLATES =====
  'aws-serverless': {
    name: 'AWS Serverless',
    description: 'Serverless architecture with API Gateway, Lambda, DynamoDB, and security',
    style: 'aws',
    quality: 'enterprise',
    prompt: `AWS Serverless with CloudFront CDN, WAF, API Gateway, Lambda Functions, Step Functions, DynamoDB, ElastiCache, S3, IAM Roles, KMS, Secrets Manager, Cognito, EventBridge, SQS, SNS, CloudWatch, X-Ray, CloudTrail. Direction LR.`,
  },

  'aws-eks': {
    name: 'AWS EKS Platform',
    description: 'Production EKS cluster with networking, security, and observability',
    style: 'aws',
    quality: 'enterprise',
    prompt: `AWS EKS with VPC (public/private subnets), NAT Gateway, ALB, EKS Control Plane, Managed Node Groups, IRSA, KMS secrets, Security Groups, EBS/EFS CSI, CloudWatch Container Insights, Prometheus/Grafana, CodePipeline, ECR. Direction TB.`,
  },

  // ===== GCP TEMPLATES =====
  'gcp-data-platform': {
    name: 'GCP Data Platform',
    description: 'Modern data platform with BigQuery, Dataflow, and analytics',
    style: 'gcp',
    quality: 'enterprise',
    prompt: `GCP Data Platform with Pub/Sub streaming, Cloud Storage batch, Dataflow ETL, Data Lake zones, BigQuery, BigQuery ML, Dataproc Spark, Composer Airflow, Cloud KMS, IAM, VPC Service Controls, DLP, Looker. Direction LR.`,
  },

  // ===== KUBERNETES TEMPLATES =====
  'k8s-microservices': {
    name: 'Kubernetes Microservices',
    description: 'Production microservices platform with service mesh and observability',
    style: 'k8s',
    quality: 'enterprise',
    prompt: `K8s Microservices with Ingress Controller, TLS, Istio Service Mesh with mTLS, Deployments with HPA, Services, ConfigMaps, Secrets, StatefulSets, PVs, Redis, RBAC, Network Policies, Prometheus, Grafana, Jaeger, Loki, ArgoCD GitOps. Direction TB.`,
  },

  // ===== OSS TEMPLATES =====
  'oss-observability': {
    name: 'Open Source Observability',
    description: 'Full observability stack with Prometheus, Grafana, Loki, Tempo',
    style: 'generic',
    quality: 'enterprise',
    prompt: `OSS Observability with Prometheus, Alertmanager for metrics, Loki, FluentBit for logs, Tempo/Jaeger, OpenTelemetry for traces, Grafana dashboards, Object Storage backend, PagerDuty/Slack integration. Direction TB.`,
  },

  'oss-cicd': {
    name: 'Open Source CI/CD',
    description: 'GitOps CI/CD pipeline with GitHub Actions, ArgoCD',
    style: 'generic',
    quality: 'enterprise',
    prompt: `OSS CI/CD with GitHub/GitLab, branch protection, PRs, GitHub Actions/Jenkins CI (build, test, Trivy scan), Docker/Harbor registry, ArgoCD/Flux GitOps, Helm/Kustomize, K8s targets, Slack notifications. Direction LR.`,
  },

  'oss-secrets': {
    name: 'Open Source Secrets Management',
    description: 'HashiCorp Vault-based secrets management',
    style: 'generic',
    quality: 'enterprise',
    prompt: `Vault Secrets with HA Vault servers, Consul/Raft storage, auto-unseal, OIDC/LDAP, K8s auth, AppRole, KV v2, PKI, Database, Cloud credentials engines, Vault Agent, K8s CSI, Audit to SIEM, metrics to Prometheus, DR replication. Direction TB.`,
  },

  // ===== C4 TEMPLATES =====
  'c4-context': {
    name: 'C4 Context Diagram',
    description: 'System context with actors and external systems',
    style: 'c4',
    quality: 'standard',
    prompt: `C4 Context with End Users, Admin Users, System boundary with main system, External systems (Payment Gateway, Email Service, Auth Provider), Relationship labels.`,
  },

  'c4-container': {
    name: 'C4 Container Diagram',
    description: 'Container diagram with technology stack',
    style: 'c4',
    quality: 'standard',
    prompt: `C4 Container with System boundary, Web App (React), Mobile App, API Gateway, User Service (Node), Order Service (Spring), Notification Service (Python), PostgreSQL, Redis, RabbitMQ, External systems. Direction TB.`,
  },

  // ===== UML TEMPLATES =====
  'uml-class': {
    name: 'UML Class Diagram',
    description: 'Class diagram with relationships',
    style: 'uml',
    quality: 'standard',
    prompt: `UML Class for e-commerce: Customer, Order, OrderItem, Product, Payment, Address classes with attributes and methods. Relationships with cardinality. Use stereotypes.`,
  },

  'uml-sequence': {
    name: 'UML Sequence Diagram',
    description: 'Message flow between components',
    style: 'uml',
    quality: 'standard',
    prompt: `UML Sequence for order: User, Web UI, API Gateway, Order Service, Inventory, Payment, Notification. Numbered message flow with sync/async messages.`,
  },

  'uml-component': {
    name: 'UML Component Diagram',
    description: 'Component architecture with interfaces',
    style: 'uml',
    quality: 'standard',
    prompt: `UML Component with API Gateway, User Service, Order Service, Product Service, Payment Service, Notification Service. Provided/required interfaces. External systems.`,
  },

  'uml-state': {
    name: 'UML State Machine',
    description: 'Object lifecycle states',
    style: 'uml',
    quality: 'standard',
    prompt: `UML State for Order: Draft, Submitted, Payment Pending, Paid, Processing, Shipped, Delivered, Cancelled, Refunded states. Transitions with guards.`,
  },

  'uml-activity': {
    name: 'UML Activity Diagram',
    description: 'Workflow with swimlanes',
    style: 'uml',
    quality: 'standard',
    prompt: `UML Activity for checkout: Customer, System, Payment, Warehouse swimlanes. Decision diamonds, fork/join bars, start/end nodes.`,
  },

  'uml-usecase': {
    name: 'UML Use Case Diagram',
    description: 'Actors and use cases',
    style: 'uml',
    quality: 'standard',
    prompt: `UML Use Case: Customer, Admin, Payment System, Shipping actors. Browse, Search, Checkout, Track, Return use cases. Include/extend relationships.`,
  },

  // ===== ARCHIMATE TEMPLATES =====
  'archimate-layered': {
    name: 'ArchiMate Layered View',
    description: 'Full ArchiMate layers',
    style: 'archimate',
    quality: 'enterprise',
    prompt: `ArchiMate Layered: Strategy (#fff8e1), Business (#fffde7), Application (#e3f2fd), Technology (#e8f5e9) layers with elements and relationships (Realization, Assignment, Serving, Access, Triggering, Flow).`,
  },

  'archimate-motivation': {
    name: 'ArchiMate Motivation View',
    description: 'Goals, principles, requirements',
    style: 'archimate',
    quality: 'standard',
    prompt: `ArchiMate Motivation (#fce4ec): Stakeholders, Drivers, Goals, Outcomes, Principles, Requirements, Constraints with influence/realization relationships.`,
  },

  'archimate-application': {
    name: 'ArchiMate Application Cooperation',
    description: 'Application integration patterns',
    style: 'archimate',
    quality: 'enterprise',
    prompt: `ArchiMate Application (#e3f2fd): CRM, ERP, E-Commerce, Data Warehouse, Portal components. Services, Interfaces, Data Objects. API Gateway, Event Bus, ETL integration.`,
  },

  'archimate-technology': {
    name: 'ArchiMate Technology View',
    description: 'Infrastructure and deployment',
    style: 'archimate',
    quality: 'enterprise',
    prompt: `ArchiMate Technology (#e8f5e9): Web, App, DB Tier nodes. Devices, Software (Linux, Docker, K8s, PostgreSQL, Redis, Kafka). Services, Artifacts, Networks.`,
  },

  'archimate-implementation': {
    name: 'ArchiMate Implementation',
    description: 'Migration and work packages',
    style: 'archimate',
    quality: 'standard',
    prompt: `ArchiMate Implementation: Plateaus (Baseline, Transitions, Target), Work Packages, Deliverables, Events with realization relationships.`,
  },

  // ===== ELASTIC TEMPLATES =====
  'elastic-observability': {
    name: 'Elastic Observability',
    description: 'Elastic observability stack',
    style: 'elastic',
    quality: 'enterprise',
    prompt: `Elastic Observability: Filebeat, Metricbeat, APM Agents, Heartbeat, Fleet Server, Elastic Agent, Logstash, ES Cluster (Master, Data tiers), Kibana (Dashboards, APM, Logs, Metrics), Alerting, ML anomaly.`,
  },

  'elastic-siem': {
    name: 'Elastic SIEM',
    description: 'Elastic Security/SIEM',
    style: 'elastic',
    quality: 'enterprise',
    prompt: `Elastic SIEM: Firewall, Windows (Winlogbeat), Linux (Auditbeat), Cloud, Network (Packetbeat) sources. Elastic Agent, Beats. ES Security indices. Kibana Security (Detection Engine, Timeline, Cases, Threat Intel), ML anomaly.`,
  },

  // ===== FIREBASE TEMPLATE =====
  'firebase-mobile': {
    name: 'Firebase Mobile Backend',
    description: 'Firebase mobile app backend',
    style: 'firebase',
    quality: 'standard',
    prompt: `Firebase Mobile: iOS, Android, Web clients. Firebase Auth (Social, Email, Phone). Firestore, Realtime DB, Cloud Storage with rules. Cloud Functions. FCM, In-app messaging. Crashlytics, Performance, Test Lab. Hosting, Dynamic Links.`,
  },

  // ===== ADDITIONAL CLOUD TEMPLATES =====
  'alibaba-ecommerce': {
    name: 'Alibaba Cloud E-Commerce',
    description: 'Alibaba e-commerce architecture',
    style: 'alibabacloud',
    quality: 'enterprise',
    prompt: `Alibaba E-Commerce: Anti-DDoS, WAF, CDN edge. SLB, ALB. ECS Auto Scaling, ACK, Function Compute. RDS MySQL, PolarDB, Redis, MongoDB, ES. OSS, NAS. MNS, API Gateway. RAM, KMS, Security Center. CloudMonitor, SLS, ARMS. Multi-AZ VPC.`,
  },

  'ibm-hybrid': {
    name: 'IBM Cloud Hybrid',
    description: 'IBM hybrid cloud architecture',
    style: 'ibm',
    quality: 'enterprise',
    prompt: `IBM Hybrid: On-Prem (Bare Metal, VMware, DBs). Direct Link, VPN, Transit Gateway. VPC (Multi-AZ VSIs). OpenShift, Code Engine, Registry. Cloud Databases, Cloudant, Db2, Storage. App Connect, MQ, API Connect. IAM, Key Protect. Watson, Cloud Pak for Data.`,
  },

  'oci-enterprise': {
    name: 'OCI Enterprise Landing Zone',
    description: 'OCI enterprise landing zone',
    style: 'oci',
    quality: 'enterprise',
    prompt: `OCI Landing Zone: Compartments (Root, Network, Security, Shared, Workloads). Hub VCN, Spoke VCNs, DRG, Gateways. Cloud Guard, Security Zones, Vault, WAF, Bastion. OKE, Instances, Functions. Autonomous DB, MySQL, NoSQL. Object, Block, File Storage. Logging, Monitoring, Events.`,
  },

  'digitalocean-app': {
    name: 'DigitalOcean App Platform',
    description: 'DigitalOcean app platform',
    style: 'digitalocean',
    quality: 'standard',
    prompt: `DigitalOcean App: Web, API, Worker, Static services. Managed PostgreSQL, Redis, Spaces. DOKS (Node pools, LB, Block storage). VPC, LB, Firewall, Floating IPs. GitHub integration, Review apps. Metrics, Alerts, Uptime.`,
  },

  'openstack-private-cloud': {
    name: 'OpenStack Private Cloud',
    description: 'OpenStack private cloud',
    style: 'openstack',
    quality: 'enterprise',
    prompt: `OpenStack Private: Keystone, Nova, Neutron, Cinder, Glance, Swift, Horizon control plane. Neutron ML2/OVS, Octavia, Designate. KVM, Nova compute. Ceph, Swift, Manila. Monasca. Barbican. TripleO/Kolla, Heat. 3-controller HA.`,
  },

  'outscale-enterprise': {
    name: 'Outscale Enterprise',
    description: 'Outscale European sovereign cloud',
    style: 'outscale',
    quality: 'standard',
    prompt: `Outscale: Net (VPC), Internet Service, NAT, Subnets. Site-to-Site VPN, Direct Connect. VMs. BSU Block, OOS Object (S3-compatible). Security Groups, IAM, ACLs. Load Balancer. GDPR/SecNumCloud compliant.`,
  },

  // ===== ENTERPRISE ARCHITECTURE TEMPLATES =====
  'togaf-layers': {
    name: 'TOGAF Architecture Layers',
    description: 'Four-layer TOGAF architecture',
    style: 'enterprise',
    quality: 'enterprise',
    prompt: `TOGAF Layers: Business (#e3f2fd - Capabilities, Processes, Services), Application (#e8f5e9 - Components, Services, Interfaces), Data (#fff3e0 - Entities, Services, MDM), Technology (#f3e5f5 - Infrastructure, Platforms). Architecture Repository. Direction TB.`,
  },

  'zachman-framework': {
    name: 'Zachman Framework View',
    description: 'Zachman perspectives',
    style: 'enterprise',
    quality: 'enterprise',
    prompt: `Zachman System Model: What (Data), How (Functions), Where (Locations), Who (Organization), When (Timing), Why (Goals). Matrix structure with clusters per perspective.`,
  },

  'capability-map': {
    name: 'Business Capability Map',
    description: 'Capability map with maturity',
    style: 'enterprise',
    quality: 'enterprise',
    prompt: `Capability Map: Strategic (Strategy, EA, Portfolio, Innovation), Core (Customer, Product, Order, Service, Supply Chain), Supporting (HR, Finance, IT, Legal). Color by maturity: Red=Low, Yellow=Medium, Green=High. Show dependencies.`,
  },
};

// =============================================================================
// SMART DESCRIPTION ENHANCEMENT
// =============================================================================

function enhanceDescription(description, quality) {
  const keywords = description.toLowerCase();
  const enhancements = [];
  
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
  
  if (keywords.includes('uml') || keywords.includes('class diagram')) {
    enhancements.push('Use standard UML notation with stereotypes and relationship cardinality');
  }
  
  if (keywords.includes('archimate')) {
    enhancements.push('Use ArchiMate layer colors: Yellow=Business, Blue=Application, Green=Technology');
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
  
  if (quality === 'enterprise') {
    if (!keywords.includes('monitor') && !keywords.includes('log') && !keywords.includes('observ')) {
      enhancements.push('Add monitoring/logging layer');
    }
    if (!keywords.includes('identity') && !keywords.includes('iam') && !keywords.includes('entra') && !keywords.includes('auth')) {
      enhancements.push('Add identity and access management components');
    }
  }
  
  if (enhancements.length > 0) {
    return `${description}\n\nAdditional recommendations:\n${enhancements.map(e => `- ${e}`).join('\n')}`;
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
    direction="LR",
    graph_attr=graph_attr
):
    # Diagram code

CLUSTER COLORS BY FUNCTION:
- Identity/Users: #e3f2fd (light blue)
- Security/Keys/Encryption: #ffebee (light red)
- Automation/DevOps: #e8f5e9 (light green)
- Monitoring/Observability: #fff3e0 (light orange)
- DR/Backup: #fff8e1 (light yellow)
- Governance/RBAC: #f3e5f5 (light purple)
- Data/Storage: #e0f7fa (light cyan)

ARCHIMATE LAYER COLORS:
- Strategy: #fff8e1 (gold)
- Business: #fffde7 (yellow)
- Application: #e3f2fd (blue)
- Technology: #e8f5e9 (green)
- Motivation: #fce4ec (pink)

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

  const enhancedDescription = quality === 'enterprise' 
    ? enhanceDescription(description, quality)
    : description;

  console.log(`\n🤖 Calling Claude API (${config.anthropic.model})...`);
  console.log(`   Style: ${styleConfig.name}`);
  console.log(`   Quality: ${QUALITY_PRESETS[quality]?.name || quality}`);

  const message = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Generate a Python diagrams architecture diagram for:\n\n${enhancedDescription}\n\nRespond with ONLY valid JSON containing name, title, description, and python_code fields.`,
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
    console.error('Failed to parse Claude response');
    throw new Error(`Invalid JSON response from Claude: ${parseError.message}`);
  }

  if (!diagramSpec.name || !diagramSpec.title || !diagramSpec.python_code) {
    throw new Error('Missing required fields in diagram specification');
  }

  diagramSpec.style = style;
  diagramSpec.quality = quality;

  return diagramSpec;
}

function sanitizePythonCode(code) {
  let fixed = code.replace(/"([^"]*)"/g, (match, content) => {
    if (content.includes('\n')) {
      return `"${content.replace(/\n/g, '\\n')}"`;
    }
    return match;
  });
  fixed = fixed.replace(/'([^']*)'/g, (match, content) => {
    if (content.includes('\n')) {
      return `'${content.replace(/\n/g, '\\n')}'`;
    }
    return match;
  });
  return fixed;
}

async function renderDiagramWithPython(pythonCode, outputPath, verbose = false) {
  const sanitizedCode = sanitizePythonCode(pythonCode);
  const finalCode = sanitizedCode.replace(
    /filename\s*=\s*["'][^"']+["']/g,
    `filename="${outputPath.replace(/\\/g, '/')}"`
  );

  const pythonFile = path.join(config.temp.dir, config.temp.pythonFile);
  fs.writeFileSync(pythonFile, finalCode);

  return new Promise((resolve, reject) => {
    const python = spawn('python3', [pythonFile], { cwd: config.temp.dir });
    let stderr = '';

    python.stderr.on('data', (data) => { stderr += data.toString(); });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('\n❌ Python Error:\n' + stderr);
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
      reject(new Error(`Failed to start Python: ${err.message}`));
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
  return { path: path.resolve(imagePath), url: path.resolve(imagePath) };
}

async function publishToGitHub(spec, imageBuffer) {
  const { token, owner, repo, branch, folder, userName, userEmail } = config.github;
  if (!token || !owner) {
    throw new Error('GitHub configuration missing. Set GITHUB_TOKEN and GITHUB_OWNER in .env');
  }

  const tempDir = path.join(__dirname, '.temp-github-publish');
  const repoUrl = `https://${token}@github.com/${owner}/${repo}.git`;

  try {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });

    const git = simpleGit(tempDir);
    console.log('  Cloning repository...');
    await git.clone(repoUrl, tempDir, ['--depth', '1', '--branch', branch]);
    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);

    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    fs.writeFileSync(path.join(imagesDir, `${spec.name}.png`), imageBuffer);

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
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
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
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });

    const git = simpleGit(tempDir);
    console.log('  Cloning repository...');
    await git.clone(repoUrl, tempDir, ['--depth', '1', '--branch', branch]);
    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);

    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    fs.writeFileSync(path.join(imagesDir, `${spec.name}.png`), imageBuffer);

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
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
  }
}

// =============================================================================
// CLI COMMANDS
// =============================================================================

async function commandGenerate(description, options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Diagram Generator v6.0                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let finalDescription = description || '';
  let style = options.style || 'azure';
  let quality = options.quality || 'standard';
  
  if (options.template) {
    const template = TEMPLATES[options.template];
    if (!template) {
      console.error(`\n❌ Unknown template: ${options.template}`);
      console.log('Available templates: ' + Object.keys(TEMPLATES).join(', '));
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
    console.log('  node ai-diagram.js generate --template m365-cmk');
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
    console.log('📤 Publish:');
    console.log('   node ai-diagram.js publish --target local');
    console.log('   node ai-diagram.js publish --target github');
    console.log('   node ai-diagram.js publish --target devops');

    if (options.open) {
      const { exec } = await import('child_process');
      const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${openCmd} "${imagePath}"`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (options.verbose) console.error(error.stack);
    process.exit(1);
  }
}

async function commandPreview(options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Diagram Generator v6.0 - Preview                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();
    console.log('\n📋 Current Diagram:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Style: ${spec.style || 'unknown'}`);
    console.log(`   Quality: ${spec.quality || 'unknown'}`);
    console.log(`   Description: ${spec.description}`);
    console.log(`\n📁 Image: ${getTempImagePath()}`);

    if (options.code) {
      console.log('\n🐍 Python Source:');
      console.log('─'.repeat(60));
      console.log(spec.python_code);
      console.log('─'.repeat(60));
    }

    if (options.open) {
      const { exec } = await import('child_process');
      const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${openCmd} "${getTempImagePath()}"`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

async function commandRegenerate(options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Diagram Generator v6.0 - Regenerate                    ║');
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
    if (options.verbose) console.error(error.stack);
    process.exit(1);
  }
}

async function commandPublish(options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Diagram Generator v6.0 - Publish                       ║');
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
    if (options.verbose) console.error(error.stack);
    process.exit(1);
  }
}

async function commandStyles() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Diagram Generator v6.0 - Available Styles              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const byCategory = {};
  for (const [key, style] of Object.entries(DIAGRAM_STYLES)) {
    const cat = style.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ key, name: style.name });
  }
  
  for (const [cat, styles] of Object.entries(byCategory)) {
    console.log(`── ${cat.toUpperCase()} ──`);
    for (const s of styles) {
      console.log(`  ${s.key.padEnd(16)} ${s.name}`);
    }
    console.log('');
  }
  
  console.log('Usage:');
  console.log('  node ai-diagram.js generate "description" --style azure');
  console.log('  node ai-diagram.js generate "class diagram" --style uml');
  console.log('  node ai-diagram.js generate "layered view" --style archimate');
  console.log('');
}

async function commandTemplates() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Diagram Generator v6.0 - Available Templates           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
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
      console.log(`     ${t.name} - ${t.description}`);
    }
  }
  
  console.log('');
  console.log('Usage:');
  console.log('  node ai-diagram.js generate --template m365-cmk --open');
  console.log('  node ai-diagram.js generate --template uml-class --open');
  console.log('  node ai-diagram.js generate "Add Redis" --template aws-serverless');
  console.log('');
}

async function commandQuality() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Diagram Generator v6.0 - Quality Levels                ║');
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
// MAIN - CLI SETUP
// =============================================================================

program
  .name('ai-diagram')
  .description('AI-powered architecture diagram generator with EA, UML, ArchiMate, and cloud provider support')
  .version('6.0.0');

program
  .command('generate [description]')
  .description('Generate a diagram from natural language or template')
  .option('-s, --style <style>', 'Diagram style: azure, aws, gcp, k8s, generic, uml, archimate, c4, enterprise, elastic, firebase, alibabacloud, ibm, oci, digitalocean, openstack, outscale', 'azure')
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