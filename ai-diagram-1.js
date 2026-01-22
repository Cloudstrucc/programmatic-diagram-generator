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
 * 
 * Usage:
 *   node ai-diagram.js generate "Your architecture" --style azure --quality enterprise
 *   node ai-diagram.js generate "class diagram for e-commerce" --style uml
 *   node ai-diagram.js generate --template archimate-layered
 *   node ai-diagram.js templates
 *   node ai-diagram.js styles
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { simpleGit } from 'simple-git';
import { program } from 'commander';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

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
// QUALITY PRESETS
// =============================================================================

const QUALITY_PRESETS = {
  simple: {
    name: 'Simple',
    description: 'Basic diagram with main components, minimal detail',
    guidance: `Create a SIMPLE diagram: Maximum 5-8 nodes, 1-2 clusters, basic labels, simple connections, focus on core architecture.`,
  },
  standard: {
    name: 'Standard',
    description: 'Balanced diagram with good detail and organization',
    guidance: `Create a STANDARD diagram: 8-15 nodes in logical clusters, 3-5 clusters, descriptive labels, labeled connections, color-coded clusters.`,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Comprehensive diagram with full detail, automation, monitoring',
    guidance: `Create an ENTERPRISE-GRADE diagram: Comprehensive coverage, nested clusters, multi-line labels, color-coded edges (red=security, blue=data, purple=RBAC, green=content, orange=DR, gray=audit). Include Identity, Automation, Monitoring, DR layers. Use direction="LR" for flows, "TB" for hierarchical.`,
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
    examples: `# M365 CMK Pattern with Key Vault, Identity, Monitoring clusters`,
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
    examples: `# AWS Serverless with API Gateway, Lambda, DynamoDB, KMS, CloudWatch`,
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
    examples: `# GCP Data Platform with BigQuery, Dataflow, Cloud KMS`,
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
    examples: `# K8s with Ingress, Deployments, HPA, RBAC, Service Mesh`,
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
from diagrams.onprem.network import Nginx, Apache, Traefik, HAProxy, Envoy, Istio, Consul, Kong, Linkerd, Zookeeper, Caddy
from diagrams.onprem.queue import Kafka, RabbitMQ, ActiveMQ, Celery
from diagrams.onprem.monitoring import Prometheus, Grafana, Datadog, Splunk, Nagios, Zabbix, Thanos, Sentry, Newrelic
from diagrams.onprem.ci import Jenkins, GithubActions, GitlabCI, CircleCI, DroneCI, TravisCI, Teamcity, Concourse
from diagrams.onprem.container import Docker, Containerd
from diagrams.onprem.vcs import Git, Github, Gitlab, Bitbucket
from diagrams.onprem.security import Vault, Trivy, Bitwarden
from diagrams.onprem.inmemory import Redis as RedisCache, Memcached, Hazelcast
from diagrams.onprem.logging import FluentBit, Loki, Graylog
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
    examples: `# OSS stack with Vault, Prometheus, Grafana, ArgoCD, Kafka`,
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
    examples: `# C4 Context/Container with Person, System, Container, Database, Relationship`,
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
    examples: `# UML Class: Cluster for packages, Rack for classes with attributes in labels
# UML Sequence: Chain of edges with numbered labels
# UML Component: Server icons with <<component>> in labels`,
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
    examples: `# ArchiMate layers: Strategy=#fff8e1, Business=#fffde7, Application=#e3f2fd, Technology=#e8f5e9, Motivation=#fce4ec
# Use Cluster colors to denote layers, Edge labels for relationships (Realization, Serving, Access)`,
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
    examples: `# TOGAF layers: Business=#e3f2fd, Application=#e8f5e9, Data=#fff3e0, Technology=#f3e5f5
# Capability maps, process flows, application portfolios`,
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
// PREDEFINED TEMPLATES
// =============================================================================

const TEMPLATES = {
  // ===== AZURE TEMPLATES =====
  'm365-cmk': { name: 'M365 Customer Managed Keys', description: 'M365 CMK with Key Vault, DEP keys, SharePoint, Exchange, Teams', style: 'azure', quality: 'enterprise',
    prompt: `M365 CMK architecture: Azure Key Vault (HSM) with Customer Root Key (RSA 2048+) wrapping DEP Keys for SharePoint, Exchange, Teams. DR Key Vault with geo-replication. M365 workloads with Availability Keys (AEK). Encryption flow: DEP Keys -> AEKs -> Content. Identity: Entra ID -> Service Principal -> Key Vault Crypto User RBAC. Automation: DevOps Pipeline for DEP deployment, Logic App for key rotation. Monitoring: Log Analytics, Key Access Alerts. Direction LR.` },
  
  'power-platform-cmk': { name: 'Power Platform CMK', description: 'Power Platform CMK with Dataverse, Power Apps, Power Automate', style: 'azure', quality: 'enterprise',
    prompt: `Power Platform CMK: Entra ID, Managed Identity with RBAC, Key Vault (HSM-backed). Power Apps, Power Automate, Dataverse requesting CMK. Encrypted Blob Storage. Key rotation policies, audit logging. Direction TB.` },
  
  'azure-landing-zone': { name: 'Azure Landing Zone', description: 'Enterprise-scale landing zone with management groups', style: 'azure', quality: 'enterprise',
    prompt: `Azure Landing Zone: Management Group hierarchy (Root, Platform/Identity/Management/Connectivity, Landing Zones/Corp/Online, Sandbox). Platform subs: Identity (Entra Connect, DCs), Management (Log Analytics, Automation, Security Center), Connectivity (Hub VNet, Firewall, ExpressRoute). Spoke VNets peered to Hub. Azure Policy, Defender, Monitor, Sentinel. Direction TB.` },
  
  'zero-trust': { name: 'Zero Trust Architecture', description: 'Zero Trust with identity, device, network, data pillars', style: 'azure', quality: 'enterprise',
    prompt: `Zero Trust: Identity (Entra ID, Conditional Access, PIM, MFA), Device (Intune, Compliance, Defender for Endpoint), Network (Firewall, Private Endpoints, WAF), Application (App Service, APIM, App Proxy), Data (Key Vault CMK, Purview DLP). Security Ops: Sentinel SIEM, Defender XDR. Show trust boundaries.` },

  // ===== AWS TEMPLATES =====
  'aws-serverless': { name: 'AWS Serverless', description: 'Serverless with API Gateway, Lambda, DynamoDB', style: 'aws', quality: 'enterprise',
    prompt: `AWS Serverless: CloudFront CDN, WAF, API Gateway. Lambda functions, Step Functions. DynamoDB, ElastiCache Redis, S3. IAM roles, KMS, Secrets Manager, Cognito. EventBridge, SQS, SNS. CloudWatch, X-Ray, CloudTrail. Direction LR.` },
  
  'aws-eks': { name: 'AWS EKS Platform', description: 'Production EKS with networking, security, observability', style: 'aws', quality: 'enterprise',
    prompt: `AWS EKS: VPC with public/private subnets, NAT Gateway, ALB. EKS Control Plane, Managed Node Groups. IRSA, KMS secrets, Security Groups, Network Policies. EBS/EFS CSI. CloudWatch Container Insights, Prometheus/Grafana. CodePipeline, ECR. Direction TB.` },

  // ===== GCP TEMPLATES =====
  'gcp-data-platform': { name: 'GCP Data Platform', description: 'Data platform with BigQuery, Dataflow, analytics', style: 'gcp', quality: 'enterprise',
    prompt: `GCP Data Platform: Pub/Sub streaming, Cloud Storage batch, Dataflow ETL. Data Lake zones (raw/processed/curated). BigQuery, BigQuery ML. Dataflow, Dataproc Spark, Composer Airflow. Cloud KMS, IAM, VPC Service Controls, DLP. Looker. Monitoring, Logging. Direction LR.` },

  // ===== K8S TEMPLATES =====
  'k8s-microservices': { name: 'Kubernetes Microservices', description: 'Microservices with service mesh, observability', style: 'k8s', quality: 'enterprise',
    prompt: `K8s Microservices: Ingress Controller (Nginx/Traefik), TLS. Service Mesh (Istio) with mTLS. Deployments with HPA, Services, ConfigMaps, Secrets. StatefulSets, PVs, Redis. RBAC, Network Policies. Prometheus, Grafana, Jaeger, Loki. ArgoCD GitOps. Direction TB.` },

  // ===== OSS TEMPLATES =====
  'oss-observability': { name: 'Open Source Observability', description: 'Prometheus, Grafana, Loki, Tempo stack', style: 'generic', quality: 'enterprise',
    prompt: `OSS Observability: Prometheus, Alertmanager for metrics. Loki, FluentBit for logs. Tempo/Jaeger, OpenTelemetry for traces. Grafana dashboards. Object Storage backend. PagerDuty/Slack integration. Direction TB.` },
  
  'oss-cicd': { name: 'Open Source CI/CD', description: 'GitOps with GitHub Actions, ArgoCD', style: 'generic', quality: 'enterprise',
    prompt: `OSS CI/CD: GitHub/GitLab, branch protection, PRs. GitHub Actions/Jenkins CI: build, test, Trivy scan, container build. Docker/Harbor registry. ArgoCD/Flux GitOps, Helm/Kustomize. K8s targets. Slack notifications. Direction LR.` },
  
  'oss-secrets': { name: 'Open Source Secrets', description: 'HashiCorp Vault secrets management', style: 'generic', quality: 'enterprise',
    prompt: `Vault Secrets: HA Vault servers, Consul/Raft storage, auto-unseal. OIDC/LDAP, K8s auth, AppRole. KV v2, PKI, Database, Cloud credentials engines. Vault Agent, K8s CSI. Audit to SIEM, metrics to Prometheus. DR replication. Direction TB.` },

  // ===== C4 TEMPLATES =====
  'c4-context': { name: 'C4 Context Diagram', description: 'System context with actors and external systems', style: 'c4', quality: 'standard',
    prompt: `C4 Context: End Users, Admin Users. System boundary with main system. External systems: Payment Gateway, Email Service, Auth Provider. Relationship labels showing interactions.` },
  
  'c4-container': { name: 'C4 Container Diagram', description: 'Container diagram with technology stack', style: 'c4', quality: 'standard',
    prompt: `C4 Container: System boundary with Web App (React), Mobile App, API Gateway. Backend: User Service (Node), Order Service (Spring), Notification Service (Python). Data: PostgreSQL, Redis, RabbitMQ. External: Payment, Email. Show technology in labels. Direction TB.` },

  // ===== UML TEMPLATES =====
  'uml-class': { name: 'UML Class Diagram', description: 'Class diagram with relationships', style: 'uml', quality: 'standard',
    prompt: `UML Class for e-commerce: Customer (id, name, +register()), Order (id, status, +submit()), OrderItem (quantity), Product (name, price), Payment, Address. Relationships: Customer "1"--"*" Order, Order "1"*--"*" OrderItem (composition), OrderItem "*"-->"1" Product. Use <<entity>>, <<interface>> stereotypes.` },
  
  'uml-sequence': { name: 'UML Sequence Diagram', description: 'Message flow between components', style: 'uml', quality: 'standard',
    prompt: `UML Sequence for order: Participants: User, Web UI, API Gateway, Order Service, Inventory, Payment, Notification. Flow: 1.Submit Order, 2.POST /orders, 3.createOrder(), 4.checkStock(), 5.stock available, 6.processPayment(), 7.payment confirmed, 8.reserveStock(), 9.sendConfirmation(). Show sync/async messages.` },
  
  'uml-component': { name: 'UML Component Diagram', description: 'Component architecture with interfaces', style: 'uml', quality: 'standard',
    prompt: `UML Component: <<component>> API Gateway, User Service, Order Service, Product Service, Payment Service, Notification Service. Provided/required interfaces (lollipop/socket). External: PostgreSQL, Elasticsearch, Stripe. Group in packages.` },
  
  'uml-state': { name: 'UML State Machine', description: 'Object lifecycle states', style: 'uml', quality: 'standard',
    prompt: `UML State for Order: States: [Initial], Draft, Submitted, Payment Pending, Paid, Processing, Shipped, Delivered, Cancelled, Refunded, [Final]. Transitions: Draft->Submitted: submit [valid], Payment Pending->Paid: success. Show guards in brackets.` },
  
  'uml-activity': { name: 'UML Activity Diagram', description: 'Workflow with swimlanes', style: 'uml', quality: 'standard',
    prompt: `UML Activity for checkout: Swimlanes: Customer, System, Payment, Warehouse. Flow: Review Cart -> Enter Address -> Validate -> Decision (valid?) -> Select Payment -> Fork(Process Payment || Check Inventory) -> Join -> Confirm -> Ship. Decision diamonds, fork/join bars.` },
  
  'uml-usecase': { name: 'UML Use Case Diagram', description: 'Actors and use cases', style: 'uml', quality: 'standard',
    prompt: `UML Use Case: Actors: Customer, Admin, Payment System, Shipping. Use Cases: Browse, Search, Checkout, Track, Return. Admin: Manage Products/Orders/Users. Checkout <<includes>> Make Payment. Show extend/include relationships.` },

  // ===== ARCHIMATE TEMPLATES =====
  'archimate-layered': { name: 'ArchiMate Layered View', description: 'Full ArchiMate layers', style: 'archimate', quality: 'enterprise',
    prompt: `ArchiMate Layered: Strategy (#fff8e1): Resource, Capability, Course of Action. Business (#fffde7): Actor, Role, Process, Function, Service, Object, Event. Application (#e3f2fd): Component, Service, Interface, Function, Data Object. Technology (#e8f5e9): Node, Device, System Software, Service, Artifact, Network. Relationships: Realization, Assignment, Serving, Access, Triggering.` },
  
  'archimate-motivation': { name: 'ArchiMate Motivation View', description: 'Goals, principles, requirements', style: 'archimate', quality: 'standard',
    prompt: `ArchiMate Motivation (#fce4ec): Stakeholders (CEO, CTO). Drivers (Cost, Speed, Security). Goals (Reduce 30%, Weekly deploy). Outcomes ($2M savings). Principles (Cloud-First, API-Driven). Requirements (Cloud migration, CI/CD). Constraints (Budget, Timeline). Show influence/realization relationships.` },
  
  'archimate-application': { name: 'ArchiMate Application Cooperation', description: 'Application integration patterns', style: 'archimate', quality: 'enterprise',
    prompt: `ArchiMate Application (#e3f2fd): Components: CRM, ERP, E-Commerce, Data Warehouse, Portal. Services: Customer Data, Order Mgmt, Catalog. Interfaces: REST, GraphQL, Events. Data Objects. Integration: API Gateway, Event Bus, ETL. Show serving, access, flow relationships.` },
  
  'archimate-technology': { name: 'ArchiMate Technology View', description: 'Infrastructure and deployment', style: 'archimate', quality: 'enterprise',
    prompt: `ArchiMate Technology (#e8f5e9): Nodes: Web, App, DB Tiers. Devices: LB, Servers. Software: Linux, Docker, K8s, PostgreSQL, Redis, Kafka. Services: LB, Orchestration, DB, Cache, Messaging. Artifacts: Images, Configs. Networks: Public, VPC. Show deployment relationships.` },
  
  'archimate-implementation': { name: 'ArchiMate Implementation', description: 'Migration and work packages', style: 'archimate', quality: 'standard',
    prompt: `ArchiMate Implementation: Plateaus: Baseline, Transition 1, Transition 2, Target. Work Packages: Cloud Setup, Containerization, Data Migration, Integration, Security, Testing, Cutover. Deliverables per package. Events: Kickoff, Go-Lives. Show realization relationships.` },

  // ===== ELASTIC TEMPLATES =====
  'elastic-observability': { name: 'Elastic Observability', description: 'Elastic observability stack', style: 'elastic', quality: 'enterprise',
    prompt: `Elastic Observability: Collection: Filebeat, Metricbeat, APM Agents, Heartbeat. Fleet Server, Elastic Agent. Logstash pipelines. ES Cluster: Master, Data (Hot-Warm-Cold). Kibana: Dashboards, APM, Logs, Metrics. Alerting, ML anomaly. Cross-cluster replication.` },
  
  'elastic-siem': { name: 'Elastic SIEM', description: 'Elastic Security/SIEM', style: 'elastic', quality: 'enterprise',
    prompt: `Elastic SIEM: Sources: Firewall, Windows (Winlogbeat), Linux (Auditbeat), Cloud, Network (Packetbeat). Elastic Agent, Beats. Processing: Parsing, ECS, GeoIP. ES Security indices. Kibana Security: Detection Engine, Timeline, Cases, Threat Intel. ML anomaly, SOAR integration.` },

  // ===== FIREBASE TEMPLATE =====
  'firebase-mobile': { name: 'Firebase Mobile Backend', description: 'Firebase mobile app backend', style: 'firebase', quality: 'standard',
    prompt: `Firebase Mobile: Clients: iOS, Android, Web. Auth: Firebase Auth, Social, Email, Phone. Data: Firestore, Realtime DB, Cloud Storage with rules. Compute: Cloud Functions (triggers, callable). Messaging: FCM, In-app. Quality: Crashlytics, Performance, Test Lab. Distribution: Hosting, Dynamic Links.` },

  // ===== ADDITIONAL CLOUD TEMPLATES =====
  'alibaba-ecommerce': { name: 'Alibaba Cloud E-Commerce', description: 'Alibaba e-commerce architecture', style: 'alibabacloud', quality: 'enterprise',
    prompt: `Alibaba E-Commerce: Edge: Anti-DDoS, WAF, CDN. Load: SLB, ALB. Compute: ECS Auto Scaling, ACK, Function Compute. Data: RDS MySQL, PolarDB, Redis, MongoDB, ES. Storage: OSS, NAS. Integration: MNS, API Gateway. Security: RAM, KMS, Security Center. Monitoring: CloudMonitor, SLS, ARMS. Multi-AZ VPC.` },
  
  'ibm-hybrid': { name: 'IBM Cloud Hybrid', description: 'IBM hybrid cloud architecture', style: 'ibm', quality: 'enterprise',
    prompt: `IBM Hybrid: On-Prem: Bare Metal, VMware, DBs. Connectivity: Direct Link, VPN, Transit Gateway. VPC: Multi-AZ VSIs, Bare Metal. Containers: OpenShift, Code Engine, Registry. Data: Cloud Databases, Cloudant, Db2, Object/Block Storage. Integration: App Connect, MQ, API Connect. Security: IAM, Key Protect. AI: Watson, Cloud Pak for Data.` },
  
  'oci-enterprise': { name: 'OCI Enterprise Landing Zone', description: 'OCI enterprise landing zone', style: 'oci', quality: 'enterprise',
    prompt: `OCI Landing Zone: Compartments: Root, Network, Security, Shared, Workloads. Networking: Hub VCN, Spoke VCNs, DRG, Gateways. Security: Cloud Guard, Security Zones, Vault, WAF, Bastion. Compute: OKE, Instances, Functions. Data: Autonomous DB, MySQL, NoSQL. Storage: Object, Block, File. Observability: Logging, Monitoring, Events.` },
  
  'digitalocean-app': { name: 'DigitalOcean App Platform', description: 'DigitalOcean app platform', style: 'digitalocean', quality: 'standard',
    prompt: `DigitalOcean App: App Platform: Web, API, Worker, Static. Databases: Managed PostgreSQL, Redis, Spaces. DOKS: Node pools, LB, Block storage. Networking: VPC, LB, Firewall, Floating IPs. CI/CD: GitHub integration, Review apps. Monitoring: Metrics, Alerts, Uptime. CDN via Spaces.` },
  
  'openstack-private-cloud': { name: 'OpenStack Private Cloud', description: 'OpenStack private cloud', style: 'openstack', quality: 'enterprise',
    prompt: `OpenStack Private: Control: Keystone, Nova, Neutron, Cinder, Glance, Swift, Horizon. Networking: Neutron ML2/OVS, Octavia, Designate. Compute: KVM, Nova. Storage: Ceph, Swift, Manila. Telemetry: Monasca. Security: Barbican. Deployment: TripleO/Kolla, Heat. 3-controller HA, tenant isolation.` },
  
  'outscale-enterprise': { name: 'Outscale Enterprise', description: 'Outscale European sovereign cloud', style: 'outscale', quality: 'standard',
    prompt: `Outscale: Net (VPC), Internet Service, NAT, Subnets. Connectivity: Site-to-Site VPN, Direct Connect. Compute: VMs. Storage: BSU Block, OOS Object (S3-compatible). Security: Security Groups, IAM, ACLs. Load Balancer. Multi-subnet, GDPR/SecNumCloud compliant.` },

  // ===== ENTERPRISE ARCHITECTURE TEMPLATES =====
  'togaf-layers': { name: 'TOGAF Architecture Layers', description: 'Four-layer TOGAF architecture', style: 'enterprise', quality: 'enterprise',
    prompt: `TOGAF Layers: Business (#e3f2fd): Capabilities, Processes, Services. Application (#e8f5e9): Components, Services, Interfaces. Data (#fff3e0): Entities, Services, MDM. Technology (#f3e5f5): Infrastructure, Platforms. Show layer mappings and Architecture Repository. Direction TB.` },
  
  'zachman-framework': { name: 'Zachman Framework View', description: 'Zachman perspectives', style: 'enterprise', quality: 'enterprise',
    prompt: `Zachman System Model: What (Data entities, models), How (Functions, processes), Where (Locations, distributed arch), Who (Organization, users), When (Cycles, timing), Why (Goals, rules). Matrix structure with clusters per perspective.` },
  
  'capability-map': { name: 'Business Capability Map', description: 'Capability map with maturity', style: 'enterprise', quality: 'enterprise',
    prompt: `Capability Map: Strategic (top): Strategy, EA, Portfolio, Innovation. Core (middle): Customer, Product, Order, Service, Supply Chain. Supporting (bottom): HR, Finance, IT, Legal. Color by maturity: Red=Low, Yellow=Medium, Green=High. Show dependencies.` },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function enhanceDescription(description, quality) {
  const keywords = description.toLowerCase();
  const enhancements = [];
  
  if (keywords.includes('cmk') || keywords.includes('encryption')) {
    enhancements.push('Include key hierarchy with root keys wrapping service keys, RBAC permissions');
  }
  if (keywords.includes('uml') || keywords.includes('class diagram')) {
    enhancements.push('Use standard UML notation with stereotypes and relationship cardinality');
  }
  if (keywords.includes('archimate')) {
    enhancements.push('Use ArchiMate layer colors: Yellow=Business, Blue=Application, Green=Technology');
  }
  if (keywords.includes('serverless') || keywords.includes('lambda')) {
    enhancements.push('Show API layer, event sources, triggers');
  }
  if (keywords.includes('kubernetes') || keywords.includes('k8s')) {
    enhancements.push('Show ingress, namespace organization, RBAC');
  }
  if (quality === 'enterprise' && !keywords.includes('monitor')) {
    enhancements.push('Add monitoring/logging layer');
  }
  if (quality === 'enterprise' && !keywords.includes('identity')) {
    enhancements.push('Add identity and access management');
  }
  
  return enhancements.length > 0 
    ? `${description}\n\nAdditional recommendations:\n${enhancements.map(e => `- ${e}`).join('\n')}` 
    : description;
}

function getSystemPrompt(style, quality) {
  const styleConfig = DIAGRAM_STYLES[style] || DIAGRAM_STYLES.azure;
  const qualityConfig = QUALITY_PRESETS[quality] || QUALITY_PRESETS.standard;
  
  return `You are an expert architecture diagrammer. Generate Python code using the 'diagrams' library.

Respond with valid JSON only (no markdown code blocks):
{"name": "diagram_name_snake_case", "title": "Human Title", "description": "Brief description", "python_code": "<complete python code>"}

QUALITY: ${qualityConfig.name}
${qualityConfig.guidance}

STYLE: ${styleConfig.name}
IMPORTS:${styleConfig.imports}

DIAGRAM STRUCTURE:
graph_attr = {"fontsize": "24", "bgcolor": "white", "pad": "0.6", "splines": "ortho", "nodesep": "0.7", "ranksep": "0.9"}
with Diagram("Title", filename="OUTPUT_PATH", outformat="png", show=False, direction="LR", graph_attr=graph_attr):
    # diagram code

CLUSTER COLORS BY FUNCTION:
- Identity: #e3f2fd (light blue)
- Security: #ffebee (light red)
- Automation: #e8f5e9 (light green)
- Monitoring: #fff3e0 (light orange)
- DR/Backup: #fff8e1 (light yellow)
- RBAC: #f3e5f5 (light purple)
- Data: #e0f7fa (light cyan)

ARCHIMATE LAYER COLORS:
- Strategy: #fff8e1 (gold)
- Business: #fffde7 (yellow)
- Application: #e3f2fd (blue)
- Technology: #e8f5e9 (green)
- Motivation: #fce4ec (pink)

EDGE COLORS: Red=security, Blue=data flow, Purple=RBAC, Green=content, Orange=DR, Gray=audit

CRITICAL RULES:
1. Always use show=False and filename="OUTPUT_PATH"
2. Use \\n for newlines in labels, NEVER literal newlines inside strings
3. Multi-line labels: "Line1\\nLine2\\n(Details)"
4. ONLY use imports from the IMPORTS section - do not invent icons
5. Common mistakes: FluentBit not Fluentd, Cronjob not CronJob, HPA in k8s.clusterconfig`;
}

function parseClaudeJsonResponse(responseText) {
  let jsonStr = responseText.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in response');
  
  try {
    const result = JSON.parse(jsonMatch[0]);
    if (result.python_code) {
      result.python_code = result.python_code
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"');
    }
    return result;
  } catch (e) {
    // Try to fix common JSON issues
    const codeMatch = jsonStr.match(/"python_code"\s*:\s*"/);
    if (!codeMatch) throw new Error('Could not parse JSON response');
    throw new Error(`JSON parse error: ${e.message}`);
  }
}

function sanitizePythonCode(code) {
  return code
    .replace(/"([^"]*)"/g, (match, content) => 
      content.includes('\n') ? `"${content.replace(/\n/g, '\\n')}"` : match)
    .replace(/'([^']*)'/g, (match, content) => 
      content.includes('\n') ? `'${content.replace(/\n/g, '\\n')}'` : match);
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

async function generateDiagramWithClaude(description, style, quality, options = {}) {
  if (!config.anthropic.apiKey) throw new Error('ANTHROPIC_API_KEY not set in .env file');
  if (!DIAGRAM_STYLES[style]) throw new Error(`Unknown style: ${style}. Available: ${Object.keys(DIAGRAM_STYLES).join(', ')}`);

  const client = new Anthropic({ apiKey: config.anthropic.apiKey });
  const enhancedDescription = quality === 'enterprise' ? enhanceDescription(description, quality) : description;

  console.log(`\n🤖 Calling Claude API (${config.anthropic.model})...`);
  console.log(`   Style: ${DIAGRAM_STYLES[style].name}`);
  console.log(`   Quality: ${QUALITY_PRESETS[quality]?.name || quality}`);

  const message = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `Generate a Python diagrams architecture diagram for:\n\n${enhancedDescription}\n\nRespond with ONLY valid JSON containing name, title, description, and python_code fields.`,
    }],
    system: getSystemPrompt(style, quality),
  });

  const responseText = message.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const diagramSpec = parseClaudeJsonResponse(responseText);
  
  if (!diagramSpec.name || !diagramSpec.python_code) throw new Error('Missing required fields in response');
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

async function renderDiagramWithPython(pythonCode, outputPath, verbose = false) {
  const sanitizedCode = sanitizePythonCode(pythonCode);
  const finalCode = sanitizedCode.replace(/filename\s*=\s*["'][^"']*["']/g, `filename="${outputPath.replace(/\\/g, '/')}"`);
  
  if (!fs.existsSync(config.temp.dir)) fs.mkdirSync(config.temp.dir, { recursive: true });
  const pythonFile = path.join(config.temp.dir, config.temp.pythonFile);
  fs.writeFileSync(pythonFile, finalCode);

  if (verbose) console.log(`\n🐍 Executing Python script: ${pythonFile}`);

  return new Promise((resolve, reject) => {
    const python = spawn('python3', [pythonFile], { cwd: config.temp.dir });
    let stderr = '';

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      if (verbose) process.stderr.write(data);
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('\n❌ Python Error:');
        console.error('─'.repeat(60));
        console.error(stderr);
        console.error('─'.repeat(60));
        console.error('\n📝 Python code:');
        console.error(finalCode);
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

    python.on('error', (err) => reject(new Error(`Failed to start Python: ${err.message}`)));
  });
}

// =============================================================================
// TEMP FILE MANAGEMENT
// =============================================================================

function ensureTempDir() {
  if (!fs.existsSync(config.temp.dir)) fs.mkdirSync(config.temp.dir, { recursive: true });
}

function saveTempSpec(spec) {
  ensureTempDir();
  fs.writeFileSync(path.join(config.temp.dir, config.temp.specFile), JSON.stringify(spec, null, 2));
}

function loadTempSpec() {
  const specPath = path.join(config.temp.dir, config.temp.specFile);
  if (!fs.existsSync(specPath)) throw new Error('No diagram found. Run "generate" command first.');
  return JSON.parse(fs.readFileSync(specPath, 'utf8'));
}

function loadTempImage() {
  const imagePath = path.join(config.temp.dir, 'diagram.png');
  if (!fs.existsSync(imagePath)) throw new Error('No diagram image found. Run "generate" command first.');
  return fs.readFileSync(imagePath);
}

function getTempImagePath() {
  return path.join(config.temp.dir, 'diagram.png');
}

function cleanTemp() {
  if (fs.existsSync(config.temp.dir)) fs.rmSync(config.temp.dir, { recursive: true });
}

// =============================================================================
// PUBLISH TARGETS
// =============================================================================

async function publishToLocal(spec, imageBuffer) {
  if (!fs.existsSync(config.local.outputDir)) fs.mkdirSync(config.local.outputDir, { recursive: true });
  const imagePath = path.join(config.local.outputDir, `${spec.name}.png`);
  fs.writeFileSync(imagePath, imageBuffer);
  return { path: path.resolve(imagePath), url: path.resolve(imagePath) };
}

async function publishToGitHub(spec, imageBuffer) {
  const { token, owner, repo, branch, folder, userName, userEmail } = config.github;
  if (!token || !owner) throw new Error('GitHub configuration missing. Set GITHUB_TOKEN and GITHUB_OWNER in .env');

  const tempDir = path.join(__dirname, '.temp-github-publish');
  try {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });

    const git = simpleGit(tempDir);
    console.log('  Cloning repository...');
    await git.clone(`https://${token}@github.com/${owner}/${repo}.git`, tempDir, ['--depth', '1', '--branch', branch]);
    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);

    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    fs.writeFileSync(path.join(imagesDir, `${spec.name}.png`), imageBuffer);

    await git.add('.');
    const status = await git.status();
    if (status.files.length > 0) {
      await git.commit(`${config.commitMessage}: ${spec.title} [${new Date().toISOString()}]`);
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
  if (!token || !org || !project) throw new Error('Azure DevOps configuration missing. Set AZDO_TOKEN, AZDO_ORG, and AZDO_PROJECT in .env');

  const tempDir = path.join(__dirname, '.temp-devops-publish');
  try {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });

    const git = simpleGit(tempDir);
    console.log('  Cloning repository...');
    await git.clone(`https://${token}@dev.azure.com/${org}/${project}/_git/${repo}`, tempDir, ['--depth', '1', '--branch', branch]);
    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);

    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    fs.writeFileSync(path.join(imagesDir, `${spec.name}.png`), imageBuffer);

    await git.add('.');
    const status = await git.status();
    if (status.files.length > 0) {
      await git.commit(`${config.commitMessage}: ${spec.title} [${new Date().toISOString()}]`);
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
  console.log('║  AI Diagram Generator v6.0 (EA/UML/ArchiMate Support)      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let finalDescription = description || '';
  let style = options.style || 'azure';
  let quality = options.quality || 'standard';
  
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
    finalDescription = template.prompt + (description ? `\n\nAdditional requirements: ${description}` : '');
    style = template.style;
    quality = template.quality || 'enterprise';
  }
  
  if (!finalDescription) {
    console.error('\n❌ Error: Please provide a description or use --template');
    console.log('\nUsage:');
    console.log('  node ai-diagram.js generate "Your architecture description"');
    console.log('  node ai-diagram.js generate "class diagram for orders" --style uml');
    console.log('  node ai-diagram.js generate --template m365-cmk');
    console.log('  node ai-diagram.js generate --template archimate-layered');
    console.log('\nRun "templates" or "styles" to see options.');
    process.exit(1);
  }
  
  console.log(`\n📊 Style: ${DIAGRAM_STYLES[style]?.name || style}`);
  console.log(`📈 Quality: ${QUALITY_PRESETS[quality]?.name || quality}`);

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

async function commandStyles() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Available Styles                                          ║');
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
    for (const s of styles) console.log(`  ${s.key.padEnd(16)} ${s.name}`);
    console.log('');
  }
  
  console.log('Usage:');
  console.log('  node ai-diagram.js generate "web app" --style azure');
  console.log('  node ai-diagram.js generate "class diagram" --style uml');
  console.log('  node ai-diagram.js generate "layered architecture" --style archimate');
  console.log('');
}

async function commandTemplates() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Available Templates                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const byStyle = {};
  for (const [key, t] of Object.entries(TEMPLATES)) {
    const style = t.style || 'generic';
    if (!byStyle[style]) byStyle[style] = [];
    byStyle[style].push({ key, name: t.name, desc: t.description });
  }
  
  for (const [style, templates] of Object.entries(byStyle)) {
    console.log(`\n── ${DIAGRAM_STYLES[style]?.name || style.toUpperCase()} ──`);
    for (const t of templates) {
      console.log(`  ${t.key}`);
      console.log(`     ${t.name} - ${t.desc}`);
    }
  }
  
  console.log('');
  console.log('Usage:');
  console.log('  node ai-diagram.js generate --template m365-cmk --open');
  console.log('  node ai-diagram.js generate --template uml-class --open');
  console.log('  node ai-diagram.js generate --template archimate-layered --open');
  console.log('');
  console.log('Customize with additional description:');
  console.log('  node ai-diagram.js generate "Add Redis cache" --template aws-serverless');
  console.log('');
}

async function commandQuality() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Quality Levels                                            ║');
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

async function commandPreview(options) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Preview Current Diagram                                   ║');
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
  console.log('║  Regenerate Diagram                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();
    console.log('\n📋 Regenerating:');
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
  console.log('║  Publish Diagram                                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();
    const imageBuffer = loadTempImage();

    console.log('\n📋 Publishing:');
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