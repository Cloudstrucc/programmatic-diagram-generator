# Complete Icon & Style Reference Guide

This document lists ALL available diagram styles, icon packs, and components available in the AI Diagram Generator.

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
  - [Compute & Containers](#compute--containers)
  - [Databases](#databases)
  - [Web Servers & Proxies](#web-servers--proxies)
  - [Service Mesh & API Gateway](#service-mesh--api-gateway)
  - [Message Queues](#message-queues)
  - [Monitoring & Observability](#monitoring--observability)
  - [Logging](#logging)
  - [Tracing](#tracing)
  - [CI/CD](#cicd)
  - [GitOps](#gitops)
  - [Infrastructure as Code](#infrastructure-as-code)
  - [Version Control](#version-control)
  - [Security & Secrets](#security--secrets)
  - [Container Registries](#container-registries)
  - [Analytics & Data](#analytics--data)
  - [Workflow Orchestration](#workflow-orchestration)
  - [MLOps](#mlops)
  - [Search](#search)
  - [Identity & Auth](#identity--auth)
- [SaaS & Third-Party](#saas--third-party)
- [Elastic Stack](#elastic-stack)
- [Firebase](#firebase)
- [C4 Model](#c4-model)
- [Generic Icons](#generic-icons)
- [Programming Languages & Frameworks](#programming-languages--frameworks)

---

## Diagram Styles Overview

| Style | Provider | Use Case |
|-------|----------|----------|
| `azure` | Microsoft Azure | Azure cloud architectures, M365, Power Platform |
| `aws` | Amazon Web Services | AWS cloud architectures |
| `gcp` | Google Cloud Platform | GCP architectures |
| `k8s` | Kubernetes | Container orchestration |
| `generic` | Open Source / On-Prem | Multi-cloud, OSS tools, on-premises |
| `alibabacloud` | Alibaba Cloud | Chinese cloud provider |
| `ibm` | IBM Cloud | IBM cloud architectures |
| `oci` | Oracle Cloud | Oracle cloud architectures |
| `digitalocean` | DigitalOcean | Simple cloud hosting |
| `openstack` | OpenStack | Private cloud |
| `elastic` | Elastic Stack | Elasticsearch, Kibana, Beats |
| `firebase` | Firebase | Mobile/web backend |
| `c4` | C4 Model | Software architecture modeling |

---

## Cloud Providers

### Microsoft Azure

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

#### Web
```
AppServices, AppServicePlans, MediaServices, Search, 
SignalR, NotificationHubs
```

#### General
```
Subscriptions, Resourcegroups, Managementgroups, Tags
```

#### ML
```
MachineLearningServiceWorkspaces, CognitiveServices, BotServices
```

---

### Amazon Web Services (AWS)

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
S3, EBS, EFS, FSx, Glacier, StorageGateway, Backup, 
SnowFamily, CloudendureDisasterRecovery
```

#### Security
```
IAM, Cognito, KMS, SecretsManager, WAF, Shield, ACM, 
SecurityHub, GuardDuty, Inspector, Macie, Detective,
CloudHSM, DirectoryService, FirewallManager, ResourceAccessManager
```

#### Integration
```
SQS, SNS, Eventbridge, StepFunctions, MQ, AppSync, 
ConsoleMobileApplication
```

#### Analytics
```
Kinesis, Athena, Glue, EMR, Quicksight, LakeFormation, 
DataPipeline, Elasticsearch, MSK, DataExchange
```

#### Management
```
Cloudwatch, Cloudtrail, Config, SystemsManager, Organizations, 
ControlTower, TrustedAdvisor, WellArchitectedTool, ServiceCatalog,
OpsWorks, CloudFormation, AutoScaling, Chatbot
```

#### DevTools
```
Codepipeline, Codecommit, Codebuild, Codedeploy, 
CodeStar, Cloud9, XRay, Codeartifact
```

#### ML
```
Sagemaker, Rekognition, Comprehend, Lex, Polly, 
Translate, Transcribe, Forecast, Personalize, Textract,
DeepLens, DeepRacer, Panorama
```

#### Containers
```
ECS, EKS, ECR, Fargate
```

---

### Google Cloud Platform (GCP)

**Import:** `from diagrams.gcp.<category> import <Icon>`

#### Compute
```
Functions, Run, GKE, ComputeEngine, AppEngine, GCF,
ContainerOptimizedOS, GPU, Preemptible
```

#### Database
```
CloudSQL, Spanner, Firestore, Bigtable, Memorystore, Datastore
```

#### Network
```
VPC, LoadBalancing, CDN, DNS, Armor, NAT, Router, 
VirtualPrivateCloud, DedicatedInterconnect, PartnerInterconnect,
TrafficDirector, ServiceDirectory, PremiumNetworkTier
```

#### Storage
```
GCS, Filestore, PersistentDisk
```

#### Security
```
Iam, KMS, SecurityCommandCenter, KeyManagementService,
BinaryAuthorization, ResourceManager, SecurityScanner
```

#### Analytics
```
BigQuery, Dataflow, Pubsub, Dataproc, Composer, 
DataCatalog, DataFusion, DataLossPreventionAPI
```

#### DevTools
```
Build, SourceRepositories, ContainerRegistry, 
Scheduler, Tasks, CloudSDK
```

#### ML
```
AIHub, AutoML, VisionAPI, NaturalLanguageAPI, 
SpeechToText, TextToSpeech, TranslationAPI, 
VideoIntelligenceAPI, RecommendationsAI, DialogflowEnterpriseEdition
```

#### Operations (Monitoring)
```
Monitoring, Logging, Debugger, Profiler, Trace, ErrorReporting
```

---

### Alibaba Cloud

**Import:** `from diagrams.alibabacloud.<category> import <Icon>`

#### Compute
```
AutoScaling, BatchCompute, ContainerRegistry, ContainerService,
ECI, ECS, EHPC, ESS, ElasticComputeService, ElasticContainerInstance,
ElasticHighPerformanceComputing, ElasticSearch, FC, FunctionCompute,
OOS, OperationOrchestrationService, ROS, ResourceOrchestrationService,
SAE, SAS, SLB, ServerLoadBalancer, ServerlessAppEngine,
SimpleApplicationServer, WAS, WebAppService
```

#### Database
```
ApsaradbCassandra, ApsaradbHbase, ApsaradbMemcache, ApsaradbMongodb,
ApsaradbOceanbase, ApsaradbPolardb, ApsaradbPostgresql, ApsaradbPpas,
ApsaradbRedis, ApsaradbSqlserver, DBS, DMS, DRDS, DTS,
DataManagementService, DataTransmissionService, DatabaseBackupService,
DisributeRelationalDatabaseService, GDS, GraphDatabaseService,
HybriddbForMysql, RDS, RelationalDatabaseService
```

#### Network
```
CEN, Cdn, CloudEnterpriseNetwork, EIP, ElasticIpAddress,
ExpressConnect, NatGateway, SLB, ServerLoadBalancer,
SmartAccessGateway, VPC, VirtualPrivateCloud, VpnGateway
```

#### Security
```
ABS, AS, AntiBotService, AntiDdosBasic, AntiDdosPro, AntifraudService,
BastionHost, CFW, CM, CloudFirewall, CloudSecurityScanner,
ContentModeration, CrowdsourcedSecurityTesting, DES, DataEncryptionService,
DbAudit, GameShield, IdVerification, ManagedSecurityService,
SecurityCenter, ServerGuard, SslCertificates, WAF, WebApplicationFirewall
```

#### Analytics
```
AnalyticDb, ClickHouse, DataLakeAnalytics, ElaticMapReduce, OpenSearch
```

---

### IBM Cloud

**Import:** `from diagrams.ibm.<category> import <Icon>`

#### Compute
```
BareMetalServer, ImageService, Instance, Key, PowerInstance
```

#### Network
```
Bridge, DirectLink, Enterprise, Firewall, FloatingIp, Gateway,
InternetServices, LoadBalancer, LoadBalancerListener, LoadBalancerPool,
LoadBalancingRouting, PublicGateway, Region, Router, Rules, Subnet,
TransitGateway, Vpc, VpnConnection, VpnGateway, VpnPolicy
```

#### Security
```
ApiSecurity, BlockchainSecurityService, DataSecurity, Firewall, Gateway,
GovernanceRiskCompliance, IdentityAccessManagement, IdentityProvider,
InfrastructureSecurity, PhysicalSecurity, SecurityMonitoringIntelligence,
SecurityServices, TrustendComputing, Vpn
```

#### Data
```
Caches, Cloud, ConversationTrainedDeployed, DataServices, DataSources,
DeviceIdentityService, DeviceRegistry, EnterpriseData,
EnterpriseUserDirectory, FileRepository, GroundTruth, Model, TmsDataInterface
```

#### Analytics
```
Analytics, DataIntegration, DataRepositories, DeviceAnalytics, StreamingComputing
```

#### DevOps
```
ArtifactManagement, BuildTest, CodeEditor, CollaborativeDevelopment,
ConfigurationManagement, ContinuousDeploy, ContinuousTesting, Devops,
Provision, ReleaseManagement
```

#### Storage
```
BlockStorage, ObjectStorage
```

#### Blockchain
```
Blockchain, BlockchainDeveloper, CertificateAuthority, ClientApplication,
Event, EventListener, ExistingEnterpriseSystems, HyperledgerFabric,
KeyManagement, Ledger, MembershipServicesProviderApi,
MessageBus, Node, PeerOrganization, SmartContract
```

---

### Oracle Cloud (OCI)

**Import:** `from diagrams.oci.<category> import <Icon>`

#### Compute
```
Autoscale, BareMetalServer, Container, ContainerEngine, Functions,
InstancePools, OCIR, OKE, VM, VirtualMachine
```
*Note: White variants available (e.g., `VMWhite`)*

#### Database
```
ADB, Autonomous, BigdataService, DBService, DMS, DatabaseService,
DataflowApache, Dcat, Dis, Science, Stream
```

#### Network
```
Drg, Firewall, InternetGateway, LoadBalancer, RouteTable,
SecurityLists, ServiceGateway, Vcn
```

#### Security
```
CloudGuard, DDOS, Encryption, IDAccess, KeyManagement,
MaxSecurityZone, Vault, WAF
```

#### Monitoring
```
Alarm, Email, Events, HealthCheck, Notifications, Queue, Search, Telemetry, Workflow
```

#### Storage
```
BackupRestore, BlockStorage, BucketStorage, DataTransfer,
ElasticPerformance, FileStorage, ObjectStorage, StorageGateway
```

---

### DigitalOcean

**Import:** `from diagrams.digitalocean.<category> import <Icon>`

#### Compute
```
Containers, Docker, Droplet, DropletConnect, DropletSnapshot,
K8SCluster, K8SNode, K8SNodePool
```

#### Database
```
DbaasPrimary, DbaasPrimaryStandbyMore, DbaasReadOnly, DbaasStandby
```

#### Network
```
Certificate, Domain, DomainRegistration, Firewall, FloatingIp,
InternetGateway, LoadBalancer, ManagedVpn, Vpc
```

#### Storage
```
Folder, Space, Volume, VolumeSnapshot
```

---

### OpenStack

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

#### Deployment
```
Ansible, Charms, Chef, Helm, Kolla, KollaAnsible, TripleO
```

#### Shared Services
```
Barbican, Glance, Karbor, Keystone, Searchlight
```

---

### Outscale (European)

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
Firewall, IdentityAndAccessManagement
```

#### Storage
```
SimpleStorageService, Storage
```

---

## Container & Orchestration

### Kubernetes

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
CRD, PSP (PodSecurityPolicy)
```

---

## Open Source & On-Premises

**Import:** `from diagrams.onprem.<category> import <Icon>`

### Compute & Containers
```
Server, Nomad
```

### Container Runtimes
```
Docker, Containerd, Crio, Firecracker, Gvisor, K3S, LXC, RKT
```

### Databases
```
PostgreSQL, MySQL, MongoDB, Redis, Cassandra, InfluxDB, Neo4J,
MariaDB, MSSQL, Oracle, CockroachDB, Couchbase, Couchdb, Dgraph,
Druid, HBase, Janusgraph, Scylla, Clickhouse
```

### In-Memory
```
Redis, Memcached, Aerospike, Hazelcast
```

### Web Servers & Proxies
```
Nginx, Apache, Traefik, HAProxy, Envoy, Caddy, Gunicorn, Tomcat,
Wildfly, Jetty, Glassfish
```

### Service Mesh & API Gateway
```
Istio, Consul, Kong, Linkerd, Zookeeper, Ambassador, Ocelot,
OpenServiceMesh, Pomerium, Tyk, Yarp
```

### Message Queues
```
Kafka, RabbitMQ, ActiveMQ, Celery, EMQx, NATS, ZeroMQ
```

### Monitoring & Observability
```
Prometheus, Grafana, Datadog, Splunk, Nagios, Zabbix,
Thanos, Cortex, Mimir, Sentry, Dynatrace, Newrelic, Humio
```

### Logging
```
FluentBit, Loki, Graylog, RSyslog, SyslogNg
```

### Tracing
```
Jaeger, Tempo
```

### CI/CD
```
Jenkins, GithubActions, GitlabCI, CircleCI, DroneCI, TravisCI,
Teamcity, ConcourseCI, ZuulCI
```

### Continuous Delivery
```
Spinnaker, Tekton
```

### GitOps
```
ArgoCD, Flux, Flagger
```

### Infrastructure as Code
```
Terraform, Ansible, Pulumi, Puppet, Atlantis, Awx
```

### Version Control
```
Git, Github, Gitlab, Gitea, Subversion, Perforce
```

### Security & Secrets
```
Vault, Trivy, Bitwarden
```

### Auth
```
Boundary, BuzzfeedSso, Oauth2Proxy
```

### Identity
```
Dex
```

### Container Registries
```
Harbor, Jfrog
```

### Analytics & Data
```
Spark, Hadoop, Hive, Flink, Beam, Presto, Trino, Storm,
Databricks, Dbt, Dremio, Metabase, Norikra, Singer, Superset,
Tableau, PowerBI
```

### Workflow Orchestration
```
Airflow, Digdag, KubeFlow, NiFi
```

### MLOps
```
Mlflow, Polyaxon
```

### Search
```
Solr
```

### Aggregator
```
Fluentd, Vector
```

### Certificates
```
CertManager, LetsEncrypt
```

### DNS
```
Coredns, Powerdns
```

### Proxmox
```
ProxmoxVE
```

### Client
```
Users, Client
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
Cloudflare, Fastly, Akamai, Imperva
```

### Identity
```
Auth0, Okta
```

### Alerting
```
Pagerduty, Opsgenie
```

### Analytics
```
Snowflake, Stitch
```

### Social
```
Facebook, Twitter
```

### Media
```
Cloudinary
```

### Logging
```
Papertrail, Datadog
```

### Recommendations
```
Recombee
```

### File Sharing
```
Nextcloud
```

---

## Elastic Stack

**Import:** `from diagrams.elastic.<category> import <Icon>`

### Elasticsearch
```
Elasticsearch, Kibana, Logstash, Beats, Alerting,
ML, MachineLearning, MapServices, Maps, Monitoring,
SQL, SearchableSnapshots, SecuritySettings, Stack
```

### Observability
```
APM, Logs, Metrics, Observability, Uptime
```

### Beats
```
APM, Auditbeat, Filebeat, Functionbeat, Heartbeat, Metricbeat, Packetbeat, Winlogbeat
```

### Agent
```
Agent, Fleet, Integrations
```

### SIEM/Security
```
Endpoint, SIEM, Security
```

---

## Firebase

**Import:** `from diagrams.firebase.<category> import <Icon>`

### Develop
```
Authentication, Firestore, Functions, Hosting, MLKit, RealtimeDatabase, Storage
```

### Grow
```
ABTesting, AppIndexing, DynamicLinks, FCM, InAppMessaging,
Invites, Messaging, Predictions, RemoteConfig
```

### Quality
```
AppDistribution, CrashReporting, Crashlytics, PerformanceMonitoring, TestLab
```

### Analytics
```
Analytics, Dashboard, Funnels, Predictions
```

### Extensions
```
Extensions
```

---

## C4 Model

**Import:** `from diagrams.c4 import <Component>`

The C4 Model provides a standardized way to visualize software architecture.

```python
from diagrams.c4 import Person, Container, Database, System, SystemBoundary

# Components:
Person        # A user or actor
Container     # An application, service, or data store
Database      # A database
System        # An external system
SystemBoundary  # Boundary around a system
```

### Example
```python
from diagrams import Diagram
from diagrams.c4 import Person, Container, Database, System, SystemBoundary

with Diagram("C4 Example", show=False):
    user = Person("User", "A user of the system")
    
    with SystemBoundary("My System"):
        webapp = Container("Web App", "React", "Frontend")
        api = Container("API", "Node.js", "Backend API")
        db = Database("Database", "PostgreSQL", "Stores data")
    
    external = System("External API", "Third-party service")
    
    user >> webapp >> api >> db
    api >> external
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
Windows, LinuxGeneral, Ubuntu, Centos, Android, IOS, Suse, Debian
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
Blank  # Empty placeholder
```

---

## Programming Languages & Frameworks

**Import:** `from diagrams.programming.<category> import <Icon>`

### Languages
```
Python, Javascript, Go, Rust, Java, Nodejs, Bash, C, Cpp,
Csharp, Dart, Elixir, Erlang, Kotlin, Latex, Matlab, Php,
R, Ruby, Scala, Swift, TypeScript
```

### Frameworks
```
React, Vue, Angular, Django, Flask, Spring, Rails, Laravel,
FastAPI, Svelte, Backbone, Ember
```

### Flowcharts
```
Action, Collate, Database, Decision, Delay, Display, Document,
InputOutput, Inspection, InternalStorage, LoopLimit,
ManualInput, ManualLoop, Merge, MultipleDocuments,
OffPageConnectorLeft, OffPageConnectorRight, Or, PredefinedProcess,
Preparation, Sort, StartEnd, StoredData, SummingJunction
```

---

## Adding New Styles to the Generator

To add a new cloud provider or style to `ai-diagram-v5.js`, add an entry to the `DIAGRAM_STYLES` object:

```javascript
'newstyle': {
  name: 'New Style Name',
  imports: `
from diagrams import Diagram, Cluster, Edge
from diagrams.newprovider.category import Icon1, Icon2, Icon3
// ... all imports
`,
  examples: `
# Example code showing common patterns
with Cluster("Group"):
    icon1 = Icon1("Label")
    icon2 = Icon2("Label")
icon1 >> Edge(label="connects") >> icon2
`,
},
```

---

## Other Open-Source Diagram Tools

### Mermaid
- Text-based diagrams
- Flowcharts, sequence diagrams, Gantt charts
- Native GitHub/GitLab markdown support
- Website: https://mermaid.js.org/

### PlantUML
- Text-based UML diagrams
- Sequence, class, activity, component diagrams
- Large icon libraries (AWS, Azure, K8s)
- Website: https://plantuml.com/

### Structurizr
- C4 model diagrams
- Architecture as code
- Website: https://structurizr.com/

### Draw.io / diagrams.net
- Free, open-source diagramming
- Large icon libraries
- Website: https://www.diagrams.net/

### Excalidraw
- Hand-drawn style diagrams
- Collaborative
- Website: https://excalidraw.com/

### D2
- Modern diagram scripting language
- Clean, modern output
- Website: https://d2lang.com/

### Kroki
- Unified API for multiple diagram types
- Supports 20+ diagram formats
- Website: https://kroki.io/