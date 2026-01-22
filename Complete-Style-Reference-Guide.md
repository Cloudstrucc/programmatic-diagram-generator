# Complete Icon & Style Reference Guide v6.0

This document lists ALL available diagram styles, icon packs, and components available in the AI Diagram Generator v6.0.

## Table of Contents

- [Diagram Styles Overview](#diagram-styles-overview)
- [Cloud Providers](#cloud-providers)
  - [Microsoft Azure](#microsoft-azure)
  - [Amazon Web Services (AWS)](#amazon-web-services-aws)
  - [Google Cloud Platform (GCP)](#google-cloud-platform-gcp)
  - [Alibaba Cloud](#alibaba-cloud)
  - [IBM Cloud](#ibm-cloud)
  - [Oracle Cloud (OCI)](#oracle-cloud-oci)
  - [DigitalOcean](#digitalocean)
  - [OpenStack](#openstack)
  - [Outscale (European)](#outscale-european)
- [Container & Orchestration](#container--orchestration)
  - [Kubernetes](#kubernetes)
- [Open Source & On-Premises](#open-source--on-premises)
- [SaaS & Third-Party](#saas--third-party)
- [Elastic Stack](#elastic-stack)
- [Firebase](#firebase)
- [Enterprise Architecture](#enterprise-architecture)
  - [C4 Model](#c4-model)
  - [TOGAF / Zachman](#togaf--zachman)
- [UML Diagrams](#uml-diagrams)
- [ArchiMate 3.x](#archimate-3x)
- [Generic Icons](#generic-icons)
- [Programming Languages & Frameworks](#programming-languages--frameworks)
- [Quick Reference Commands](#quick-reference-commands)

---

## Diagram Styles Overview

| Style | Category | Use Case | Command |
|-------|----------|----------|---------|
| `azure` | Cloud | Azure architectures, M365, Power Platform | `--style azure` |
| `aws` | Cloud | AWS cloud architectures | `--style aws` |
| `gcp` | Cloud | GCP architectures | `--style gcp` |
| `alibabacloud` | Cloud | Chinese cloud provider | `--style alibabacloud` |
| `ibm` | Cloud | IBM cloud architectures | `--style ibm` |
| `oci` | Cloud | Oracle cloud architectures | `--style oci` |
| `digitalocean` | Cloud | Simple cloud hosting | `--style digitalocean` |
| `openstack` | Cloud | Private cloud | `--style openstack` |
| `outscale` | Cloud | European sovereign cloud | `--style outscale` |
| `k8s` | Container | Kubernetes orchestration | `--style k8s` |
| `generic` | On-Prem | Multi-cloud, OSS tools | `--style generic` |
| `elastic` | Specialized | Elasticsearch, Kibana, Beats | `--style elastic` |
| `firebase` | Specialized | Mobile/web backend | `--style firebase` |
| `c4` | EA | C4 software architecture | `--style c4` |
| `enterprise` | EA | TOGAF/Zachman frameworks | `--style enterprise` |
| `uml` | Modeling | UML class, sequence, etc. | `--style uml` |
| `archimate` | EA | ArchiMate 3.x layers | `--style archimate` |

---

## Cloud Providers

### Microsoft Azure

**Style:** `--style azure`

**Import:** `from diagrams.azure.<category> import <Icon>`

#### Compute
```
FunctionApps, AppServices, VM, AKS, ContainerInstances,
BatchAccounts, CloudServices, Disks, AvailabilitySets
```

#### Database
```
SQLDatabases, CosmosDb, BlobStorage, DataLake,
CacheForRedis, DataFactory, SQLDatawarehouse
```

#### DevOps
```
Devops, Repos, Pipelines, Artifacts, Boards, TestPlans
```

#### Identity
```
ManagedIdentities, ActiveDirectory, ConditionalAccess,
EnterpriseApplications, AppRegistrations, Groups, Users
```

#### Integration
```
LogicApps, ServiceBus, EventGridDomains, APIManagement,
DataCatalog, IntegrationAccounts
```

#### Network
```
VirtualNetworks, Firewall, LoadBalancers, ApplicationGateway,
DNS, PrivateEndpoint, Subnets, ExpressRouteCircuits,
TrafficManagerProfiles, VirtualNetworkGateways, Bastionhosts
```

#### Security
```
KeyVaults, SecurityCenter, Sentinel, ApplicationSecurityGroups
```

#### Storage
```
StorageAccounts, BlobStorage, FileStorage, QueueStorage,
TableStorage, DataBoxEdge, NetAppFiles, StorageSyncServices
```

#### Analytics
```
LogAnalyticsWorkspaces, EventHubs, Databricks, SynapseAnalytics,
HDInsightClusters, StreamAnalyticsJobs, AnalysisServices
```

#### General
```
Subscriptions, Resourcegroups, Managementgroups, Tags
```

**Example Command:**
```bash
node ai-diagram.js generate "Azure web app with Key Vault and SQL Database" --style azure --open
```

---

### Amazon Web Services (AWS)

**Style:** `--style aws`

**Import:** `from diagrams.aws.<category> import <Icon>`

#### Compute
```
Lambda, EC2, ECS, EKS, Fargate, ElasticBeanstalk, Batch,
Lightsail, Outposts, ServerlessApplicationRepository, ECR
```

#### Database
```
RDS, Dynamodb, ElastiCache, Redshift, Aurora, Neptune,
DocumentDB, QLDB, Timestream, Keyspaces
```

#### Network
```
VPC, ELB, ALB, NLB, CloudFront, Route53, APIGateway,
PrivateSubnet, PublicSubnet, NATGateway, InternetGateway,
DirectConnect, GlobalAccelerator, TransitGateway, Endpoint
```

#### Storage
```
S3, EBS, EFS, FSx, Glacier, StorageGateway, Backup
```

#### Security
```
IAM, Cognito, KMS, SecretsManager, WAF, Shield, ACM,
SecurityHub, GuardDuty, Inspector, Macie, Detective
```

#### Integration
```
SQS, SNS, Eventbridge, StepFunctions, MQ, AppSync
```

#### Analytics
```
Kinesis, Athena, Glue, EMR, Quicksight, LakeFormation
```

#### Management
```
Cloudwatch, Cloudtrail, Config, SystemsManager, Organizations
```

#### DevTools
```
Codepipeline, Codecommit, Codebuild, Codedeploy
```

**Example Command:**
```bash
node ai-diagram.js generate "AWS serverless API with Lambda and DynamoDB" --style aws --open
```

---

### Google Cloud Platform (GCP)

**Style:** `--style gcp`

**Import:** `from diagrams.gcp.<category> import <Icon>`

#### Compute
```
Functions, Run, GKE, ComputeEngine, AppEngine, GCF
```

#### Database
```
SQL (CloudSQL), Spanner, Firestore, Bigtable, Memorystore
```

#### Network
```
VPC, LoadBalancing, CDN, DNS, Armor, NAT, Router
```

#### Storage
```
GCS, Filestore, PersistentDisk
```

#### Security
```
Iam, KMS, SecurityCommandCenter, KeyManagementService
```

#### Analytics
```
BigQuery, Dataflow, Pubsub, Dataproc, Composer
```

#### Operations
```
Monitoring, Logging
```

**Example Command:**
```bash
node ai-diagram.js generate "GCP data pipeline with Pub/Sub and BigQuery" --style gcp --open
```

---

### Alibaba Cloud

**Style:** `--style alibabacloud`

**Import:** `from diagrams.alibabacloud.<category> import <Icon>`

#### Compute
```
AutoScaling, ContainerService, ECS, ElasticSearch,
FunctionCompute, ServerlessAppEngine
```

#### Database
```
ApsaradbCassandra, ApsaradbMongodb, ApsaradbPostgresql,
ApsaradbRedis, RDS, DBS, DMS
```

#### Network
```
CEN, Cdn, EIP, NatGateway, SLB, VPC, VpnGateway
```

#### Security
```
AntiBotService, AntiDdosBasic, CloudFirewall,
SecurityCenter, WAF, BastionHost, DbAudit
```

**Example Command:**
```bash
node ai-diagram.js generate "Alibaba Cloud e-commerce with ECS and RDS" --style alibabacloud --open
```

---

### IBM Cloud

**Style:** `--style ibm`

**Import:** `from diagrams.ibm.<category> import <Icon>`

#### Compute
```
BareMetalServer, ImageService, Instance, Key, PowerInstance
```

#### Network
```
Bridge, DirectLink, Enterprise, FloatingIp, Gateway,
InternetServices, LoadBalancer, PublicGateway,
TransitGateway, Vpc, VpnConnection, VpnGateway
```

#### Security
```
ApiSecurity, DataSecurity, GovernanceRiskCompliance,
IdentityAccessManagement, IdentityProvider,
InfrastructureSecurity, SecurityServices, Vpn
```

#### Storage
```
BlockStorage, ObjectStorage
```

**Example Command:**
```bash
node ai-diagram.js generate "IBM Cloud VPC with load balancer and instances" --style ibm --open
```

---

### Oracle Cloud (OCI)

**Style:** `--style oci`

**Import:** `from diagrams.oci.<category> import <Icon>`

#### Compute
```
Autoscale, BareMetalServer, Container, ContainerEngine,
Functions, InstancePools, OCIR, OKE, VM
```

#### Database
```
ADB, Autonomous, BigdataService, DBService, DMS, DatabaseService
```

#### Network
```
Drg, InternetGateway, LoadBalancer, RouteTable,
SecurityLists, ServiceGateway, Vcn
```

#### Security
```
CloudGuard, DDOS, Encryption, IDAccess, KeyManagement,
MaxSecurityZone, Vault
```

#### Storage
```
BackupRestore, BlockStorage, BucketStorage, DataTransfer,
FileStorage, ObjectStorage, StorageGateway
```

**Example Command:**
```bash
node ai-diagram.js generate "OCI architecture with OKE and Autonomous Database" --style oci --open
```

---

### DigitalOcean

**Style:** `--style digitalocean`

**Import:** `from diagrams.digitalocean.<category> import <Icon>`

#### Compute
```
Containers, Docker, Droplet, DropletConnect,
DropletSnapshot, K8SCluster, K8SNode, K8SNodePool
```

#### Database
```
DbaasPrimary, DbaasPrimaryStandbyMore, DbaasReadOnly, DbaasStandby
```

#### Network
```
Certificate, Domain, DomainRegistration, FloatingIp,
LoadBalancer, ManagedVpn, Vpc
```

#### Storage
```
Folder, Space, Volume, VolumeSnapshot
```

**Example Command:**
```bash
node ai-diagram.js generate "DigitalOcean Kubernetes with managed database" --style digitalocean --open
```

---

### OpenStack

**Style:** `--style openstack`

**Import:** `from diagrams.openstack.<category> import <Icon>`

#### Compute
```
Nova, Qinling, Zun
```

#### Networking
```
Designate, Neutron, Octavia
```

#### Storage
```
Cinder, Manila, Swift
```

#### Monitoring
```
Monasca, Telemetry
```

#### Shared Services
```
Barbican, Glance, Karbor, Keystone, Searchlight
```

#### Frontend
```
Horizon
```

**Example Command:**
```bash
node ai-diagram.js generate "OpenStack private cloud with Nova, Neutron, and Cinder" --style openstack --open
```

---

### Outscale (European)

**Style:** `--style outscale`

**Import:** `from diagrams.outscale.<category> import <Icon>`

#### Compute
```
Compute, DirectConnect
```

#### Network
```
ClientVpn, InternetService, LoadBalancer, NatService, Net, SiteToSiteVpng
```

#### Security
```
IdentityAndAccessManagement
```

#### Storage
```
SimpleStorageService, Storage
```

**Example Command:**
```bash
node ai-diagram.js generate "Outscale GDPR-compliant architecture" --style outscale --open
```

---

## Container & Orchestration

### Kubernetes

**Style:** `--style k8s`

**Import:** `from diagrams.k8s.<category> import <Icon>`

#### Compute
```
Pod, Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, Cronjob
```

#### Network
```
Service, Ingress, NetworkPolicy, Endpoint
```

#### Storage
```
PV, PVC, StorageClass, Volume
```

#### RBAC
```
ServiceAccount, Role, RoleBinding, ClusterRole, ClusterRoleBinding, User, Group
```

#### Control Plane
```
APIServer, Scheduler, ControllerManager, Etcd
```

#### Infrastructure
```
Node, Master
```

#### Cluster Config
```
HPA, LimitRange, Quota
```

#### Pod Config
```
ConfigMap, Secret
```

#### Group
```
Namespace
```

#### Others
```
CRD, PSP
```

**Example Command:**
```bash
node ai-diagram.js generate "Kubernetes deployment with HPA, Ingress, and RBAC" --style k8s --open
```

---

## Open Source & On-Premises

**Style:** `--style generic`

**Import:** `from diagrams.onprem.<category> import <Icon>`

### Compute & Containers
```
Server, Nomad, Docker, Containerd, Crio, LXC
```

### Databases
```
PostgreSQL, MySQL, MongoDB, Redis, Cassandra, InfluxDB, Neo4J,
MariaDB, MSSQL, Oracle, CockroachDB, Couchbase, Clickhouse
```

### In-Memory
```
Redis, Memcached, Aerospike, Hazelcast
```

### Web Servers & Proxies
```
Nginx, Apache, Traefik, HAProxy, Envoy, Caddy, Gunicorn, Tomcat
```

### Service Mesh & API Gateway
```
Istio, Consul, Kong, Linkerd, Zookeeper, Ambassador
```

### Message Queues
```
Kafka, RabbitMQ, ActiveMQ, Celery, NATS, ZeroMQ
```

### Monitoring & Observability
```
Prometheus, Grafana, Datadog, Splunk, Nagios, Zabbix,
Thanos, Cortex, Mimir, Sentry
```

### Logging
```
FluentBit, Loki, Graylog, RSyslog
```
> ⚠️ Note: `Fluentd` does NOT exist - use `FluentBit`

### Tracing
```
Jaeger, Tempo
```

### CI/CD
```
Jenkins, GithubActions, GitlabCI, CircleCI, DroneCI, TravisCI, Teamcity
```

### Version Control
```
Git, Github, Gitlab
```

### Security & Secrets
```
Vault, Trivy, Bitwarden
```

**Example Command:**
```bash
node ai-diagram.js generate "observability stack with Prometheus, Grafana, Loki, and Jaeger" --style generic --open
```

---

## SaaS & Third-Party

**Import:** `from diagrams.saas.<category> import <Icon>`

### Chat & Communication
```
Teams, Slack, Discord, Line, Mattermost, Messenger, RocketChat, Telegram
```

### CDN
```
Cloudflare, Fastly, Akamai
```

### Identity
```
Auth0, Okta
```

### Alerting
```
Pagerduty, Opsgenie
```

---

## Elastic Stack

**Style:** `--style elastic`

**Import:** `from diagrams.elastic.<category> import <Icon>`

### Elasticsearch
```
Elasticsearch, Kibana, Logstash, Beats, Alerting,
MachineLearning, Maps, Monitoring, SQL, SecuritySettings, Stack
```

### Observability
```
APM, Logs, Metrics, Observability, Uptime
```

### Beats
```
APM, Auditbeat, Filebeat, Functionbeat, Heartbeat,
Metricbeat, Packetbeat, Winlogbeat
```

### Agent
```
Agent, Fleet, Integrations
```

### Security
```
Endpoint, SIEM, Security
```

**Example Command:**
```bash
node ai-diagram.js generate "Elastic observability stack with Filebeat, Elasticsearch, and Kibana" --style elastic --open
```

---

## Firebase

**Style:** `--style firebase`

**Import:** `from diagrams.firebase.<category> import <Icon>`

### Develop
```
Authentication, Firestore, Functions, Hosting, MLKit, RealtimeDatabase, Storage
```

### Grow
```
ABTesting, AppIndexing, DynamicLinks, Invites, Messaging, Predictions, RemoteConfig
```

### Quality
```
AppDistribution, Crashlytics, PerformanceMonitoring, TestLab
```

**Example Command:**
```bash
node ai-diagram.js generate "Firebase mobile backend with Auth, Firestore, and Cloud Functions" --style firebase --open
```

---

## Enterprise Architecture

### C4 Model

**Style:** `--style c4`

**Import:** `from diagrams.c4 import <Component>`

#### Components
```python
Person        # A user or actor
Container     # An application, service, or data store
Database      # A database
System        # An external system
SystemBoundary  # Boundary around a system
Relationship  # Connection between elements
```

#### C4 Diagram Levels
1. **Context** - System scope and external actors
2. **Container** - Applications and data stores within system
3. **Component** - Internal components within containers
4. **Code** - Class/module level (typically UML)

**Example Command:**
```bash
node ai-diagram.js generate "C4 context diagram for banking system with customers, mobile app, and external payment gateway" --style c4 --open
```

**Template Commands:**
```bash
node ai-diagram.js generate --template c4-context --open
node ai-diagram.js generate --template c4-container --open
```

---

### TOGAF / Zachman

**Style:** `--style enterprise`

#### TOGAF Architecture Layers

| Layer | Color | Focus |
|-------|-------|-------|
| Business | #e3f2fd (blue) | Capabilities, Processes, Services, Org Units |
| Application | #e8f5e9 (green) | Components, Services, Interfaces, Integration |
| Data | #fff3e0 (orange) | Entities, Services, Flows, MDM |
| Technology | #f3e5f5 (purple) | Infrastructure, Platforms, Networks |

#### Zachman Framework Perspectives

| Column | Focus |
|--------|-------|
| What (Data) | Entities, attributes, relationships |
| How (Function) | Processes, activities, workflows |
| Where (Network) | Locations, connectivity |
| Who (People) | Roles, responsibilities |
| When (Time) | Events, schedules, triggers |
| Why (Motivation) | Goals, strategies, rules |

**Example Commands:**
```bash
# TOGAF layers
node ai-diagram.js generate "TOGAF architecture for retail company showing all four layers" --style enterprise --quality enterprise --open

# Zachman view
node ai-diagram.js generate "Zachman system model for healthcare organization" --style enterprise --open

# Capability map
node ai-diagram.js generate "business capability map for financial services with maturity levels" --style enterprise --open
```

**Template Commands:**
```bash
node ai-diagram.js generate --template togaf-layers --open
node ai-diagram.js generate --template zachman-framework --open
node ai-diagram.js generate --template capability-map --open
```

---

## UML Diagrams

**Style:** `--style uml`

### Supported UML Diagram Types

| Type | Description | Template |
|------|-------------|----------|
| Class | Object-oriented structure | `--template uml-class` |
| Sequence | Message flow over time | `--template uml-sequence` |
| Component | High-level modules | `--template uml-component` |
| State Machine | Object lifecycle | `--template uml-state` |
| Activity | Workflow/process | `--template uml-activity` |
| Use Case | System functionality | `--template uml-usecase` |

### UML Class Diagram Elements

```
Classes with:
- Attributes (visibility, name, type)
- Methods (visibility, name, parameters, return)

Relationships:
- Association (solid line)
- Aggregation (hollow diamond)
- Composition (filled diamond)
- Inheritance (hollow arrow)
- Dependency (dashed arrow)
- Realization (dashed hollow arrow)

Stereotypes:
- <<interface>>
- <<abstract>>
- <<entity>>
- <<service>>
- <<repository>>
```

### UML Sequence Diagram Elements

```
Participants (lifelines)
Messages:
- Synchronous (solid arrow)
- Asynchronous (open arrow)
- Return (dashed arrow)
Activation boxes
Fragments (opt, alt, loop, par)
```

**Example Commands:**
```bash
# Class diagram
node ai-diagram.js generate "UML class diagram for library management with Book, Member, Loan, and Librarian classes" --style uml --open

# Sequence diagram
node ai-diagram.js generate "UML sequence diagram for user login with authentication service and database" --style uml --open

# Component diagram
node ai-diagram.js generate "UML component diagram for microservices e-commerce" --style uml --open

# State machine
node ai-diagram.js generate "UML state diagram for order lifecycle from created to delivered" --style uml --open

# Activity diagram
node ai-diagram.js generate "UML activity diagram for employee onboarding process" --style uml --open

# Use case
node ai-diagram.js generate "UML use case diagram for online banking with customer and admin actors" --style uml --open
```

---

## ArchiMate 3.x

**Style:** `--style archimate`

### ArchiMate Layers & Colors

| Layer | Color | Elements |
|-------|-------|----------|
| Strategy | #fff8e1 (gold) | Resource, Capability, Course of Action |
| Business | #fffde7 (yellow) | Actor, Role, Process, Function, Service, Object, Event |
| Application | #e3f2fd (blue) | Component, Service, Interface, Function, Data Object |
| Technology | #e8f5e9 (green) | Node, Device, System Software, Service, Artifact, Network |
| Motivation | #fce4ec (pink) | Stakeholder, Driver, Goal, Outcome, Principle, Requirement |
| Implementation | #f5f5f5 (gray) | Work Package, Deliverable, Plateau, Gap |

### ArchiMate Element Types

#### Strategy Layer
```
Resource - An asset owned or controlled
Capability - An ability to achieve outcomes
Course of Action - An approach to achieve goals
```

#### Business Layer
```
Business Actor - An organizational entity
Business Role - Responsibility for behavior
Business Process - A sequence of business behaviors
Business Function - A collection of business behavior
Business Service - An externally visible unit of functionality
Business Object - A concept from business domain
Business Event - Something that happens and influences behavior
```

#### Application Layer
```
Application Component - An encapsulated application functionality
Application Service - An externally visible unit of functionality
Application Interface - A point of access for application services
Application Function - Automated behavior
Data Object - Data structured for automated processing
```

#### Technology Layer
```
Node - A computational or physical resource
Device - A physical IT resource
System Software - Software environment for components
Technology Service - An externally visible unit of technology
Artifact - A piece of data used or produced
Communication Network - A medium for communication
Path - A link between nodes
```

#### Motivation Layer
```
Stakeholder - Individual, team, or organization with interests
Driver - An internal or external condition that motivates
Goal - An end state that stakeholder wishes to achieve
Outcome - An end result that has been achieved
Principle - A qualitative statement of intent
Requirement - A statement of need
Constraint - A restriction on implementation
```

### ArchiMate Relationships

| Relationship | Symbol | Description |
|--------------|--------|-------------|
| Composition | Filled diamond | Part-of relationship |
| Aggregation | Hollow diamond | Grouping relationship |
| Assignment | Solid line + dot | Allocation of responsibility |
| Realization | Dashed line + hollow arrow | Implementation |
| Serving | Solid line + arrow | Providing functionality |
| Access | Dashed line | Reading/writing data |
| Influence | Dashed line + arrow | Impact on motivation |
| Triggering | Solid line + filled arrow | Temporal causation |
| Flow | Solid line + open arrow | Transfer of content |
| Specialization | Solid line + hollow arrow | Type-of relationship |
| Association | Solid line | Unspecified relationship |

**Example Commands:**
```bash
# Full layered view
node ai-diagram.js generate "ArchiMate layered architecture for insurance company" --style archimate --quality enterprise --open

# Motivation view
node ai-diagram.js generate "ArchiMate motivation view for digital transformation initiative" --style archimate --open

# Application cooperation
node ai-diagram.js generate "ArchiMate application cooperation showing CRM-ERP integration" --style archimate --open

# Technology view
node ai-diagram.js generate "ArchiMate technology view for cloud-native deployment" --style archimate --open
```

**Template Commands:**
```bash
node ai-diagram.js generate --template archimate-layered --open
node ai-diagram.js generate --template archimate-motivation --open
node ai-diagram.js generate --template archimate-application --open
node ai-diagram.js generate --template archimate-technology --open
node ai-diagram.js generate --template archimate-implementation --open
```

---

## Generic Icons

**Import:** `from diagrams.generic.<category> import <Icon>`

### Compute
```
Rack
```

### Database
```
SQL
```

### Network
```
Firewall, Router, Switch, Subnet, VPN
```

### Storage
```
Storage
```

### OS
```
Windows, LinuxGeneral, Ubuntu, Centos, Android, IOS
```

### Place
```
Datacenter
```

### Device
```
Mobile, Tablet
```

### Blank
```
Blank  # Empty placeholder for custom labels
```

---

## Programming Languages & Frameworks

**Import:** `from diagrams.programming.<category> import <Icon>`

### Languages
```
Python, Javascript, Go, Rust, Java, Nodejs, Bash, C, Cpp,
Csharp, Dart, Elixir, Erlang, Kotlin, Php, R, Ruby, Scala, Swift, TypeScript
```

### Frameworks
```
React, Vue, Angular, Django, Flask, Spring, Rails, Laravel, FastAPI, Svelte
```

---

## Quick Reference Commands

### List All Styles
```bash
node ai-diagram.js styles
```

### List All Templates
```bash
node ai-diagram.js templates
```

### Generate by Style

```bash
# Cloud Providers
node ai-diagram.js generate "your description" --style azure --open
node ai-diagram.js generate "your description" --style aws --open
node ai-diagram.js generate "your description" --style gcp --open
node ai-diagram.js generate "your description" --style alibabacloud --open
node ai-diagram.js generate "your description" --style ibm --open
node ai-diagram.js generate "your description" --style oci --open
node ai-diagram.js generate "your description" --style digitalocean --open
node ai-diagram.js generate "your description" --style openstack --open
node ai-diagram.js generate "your description" --style outscale --open

# Container & Open Source
node ai-diagram.js generate "your description" --style k8s --open
node ai-diagram.js generate "your description" --style generic --open

# Enterprise Architecture
node ai-diagram.js generate "your description" --style enterprise --open
node ai-diagram.js generate "your description" --style uml --open
node ai-diagram.js generate "your description" --style archimate --open
node ai-diagram.js generate "your description" --style c4 --open

# Specialized
node ai-diagram.js generate "your description" --style elastic --open
node ai-diagram.js generate "your description" --style firebase --open
```

### Generate by Template

```bash
# Cloud Templates
node ai-diagram.js generate --template m365-cmk --open
node ai-diagram.js generate --template aws-serverless --open
node ai-diagram.js generate --template gcp-data-platform --open
node ai-diagram.js generate --template k8s-microservices --open
node ai-diagram.js generate --template oss-observability --open

# Enterprise Architecture Templates
node ai-diagram.js generate --template togaf-layers --open
node ai-diagram.js generate --template zachman-framework --open
node ai-diagram.js generate --template capability-map --open

# UML Templates
node ai-diagram.js generate --template uml-class --open
node ai-diagram.js generate --template uml-sequence --open
node ai-diagram.js generate --template uml-component --open
node ai-diagram.js generate --template uml-state --open
node ai-diagram.js generate --template uml-activity --open
node ai-diagram.js generate --template uml-usecase --open

# ArchiMate Templates
node ai-diagram.js generate --template archimate-layered --open
node ai-diagram.js generate --template archimate-motivation --open
node ai-diagram.js generate --template archimate-application --open
node ai-diagram.js generate --template archimate-technology --open
node ai-diagram.js generate --template archimate-implementation --open

# C4 Model Templates
node ai-diagram.js generate --template c4-context --open
node ai-diagram.js generate --template c4-container --open
```

### Quality Levels

```bash
node ai-diagram.js generate "..." --quality simple --open
node ai-diagram.js generate "..." --quality standard --open
node ai-diagram.js generate "..." --quality enterprise --open
```

---

## Icon Availability Notes

### Icons That DO NOT Exist (Common Mistakes)

| ❌ Doesn't Exist | ✅ Use Instead |
|-----------------|----------------|
| `Fluentd` | `FluentBit` |
| `Tekton` | `GithubActions` or `Jenkins` |
| `Podman` | `Docker` or `Containerd` |
| `Gitea` | `Github` or `Gitlab` |
| `Kubelet` | `Rack` (generic) |
| `CronJob` | `Cronjob` (lowercase j) |
| `HPA` in `k8s.others` | `HPA` in `k8s.clusterconfig` |

### Verifying Icon Availability

```bash
python3 -c "
from diagrams.onprem import logging
print([x for x in dir(logging) if not x.startswith('_')])
"
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.