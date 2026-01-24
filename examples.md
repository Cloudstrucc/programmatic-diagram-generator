# AI Diagram Generator v6.1 - Complete Examples

## 🎨 Draw.io Examples (Editable XML)

### Azure Examples

```bash
# M365 Customer Managed Keys
node ai-diagram.js generate \
  --template m365-cmk \
  --style drawio \
  --open
# Output: .temp-ai-diagrams/diagram.drawio

# Power Platform CMK


# Azure Landing Zone
node ai-diagram.js generate \
  --template azure-landing-zone \
  --style drawio \
  --open

# Zero Trust Architecture
node ai-diagram.js generate \
  --template zero-trust \
  --style drawio \
  --open

# Custom Azure Architecture
node ai-diagram.js generate \
  "Azure architecture with Application Gateway, AKS cluster running microservices, Azure SQL Database with private endpoint, Redis cache, Key Vault for secrets, Log Analytics for monitoring" \
  --style drawio \
  --open
```

### AWS Examples

```bash
# AWS Serverless
node ai-diagram.js generate \
  --template aws-serverless \
  --style drawio \
  --open

# AWS EKS Platform
node ai-diagram.js generate \
  --template aws-eks \
  --style drawio \
  --open

# Custom AWS Architecture
node ai-diagram.js generate \
  "3-tier web application with Application Load Balancer, EC2 auto-scaling in 2 availability zones, RDS MySQL multi-AZ, ElastiCache Redis cluster, S3 for static assets, CloudFront CDN" \
  --style drawio \
  --open
```

### Kubernetes Examples

```bash
# K8s Microservices
node ai-diagram.js generate \
  --template k8s-microservices \
  --style drawio \
  --open

# Custom Kubernetes
node ai-diagram.js generate \
  "Production Kubernetes cluster with Nginx ingress controller, cert-manager for TLS, frontend deployment with 3 replicas, API deployment with horizontal pod autoscaler, PostgreSQL StatefulSet, Redis for caching, Prometheus and Grafana for monitoring" \
  --style drawio \
  --open
```

### Open Source Examples

```bash
# Observability Stack
node ai-diagram.js generate \
  --template oss-observability \
  --style drawio \
  --open

# CI/CD Pipeline
node ai-diagram.js generate \
  --template oss-cicd \
  --style drawio \
  --open

# Secrets Management
node ai-diagram.js generate \
  --template oss-secrets \
  --style drawio \
  --open

# Custom OSS Stack
node ai-diagram.js generate \
  "Open source monitoring platform with Prometheus for metrics, Loki for logs, Grafana for dashboards, Jaeger for distributed tracing, FluentBit for log collection, AlertManager for alerting, PagerDuty integration" \
  --style drawio \
  --open
```

### Enterprise Architecture Examples

```bash
# UML Class Diagram
node ai-diagram.js generate \
  --template uml-class \
  --style drawio \
  --open

# ArchiMate Layered View
node ai-diagram.js generate \
  --template archimate-layered \
  --style drawio \
  --open

# C4 Container Diagram
node ai-diagram.js generate \
  --template c4-container \
  --style drawio \
  --open
```

---

## 📊 Python Diagram Examples (PNG)

### Azure Examples

```bash
# M365 CMK with Enterprise Detail
node ai-diagram.js generate \
  --template m365-cmk \
  --style azure \
  --quality enterprise \
  --open
# Output: .temp-ai-diagrams/diagram.png

# Power Platform CMK
node ai-diagram.js generate \
  --template power-platform-cmk \
  --style azure \
  --quality enterprise \
  --open

# Azure Landing Zone
node ai-diagram.js generate \
  --template azure-landing-zone \
  --style azure \
  --quality enterprise \
  --open

# Zero Trust
node ai-diagram.js generate \
  --template zero-trust \
  --style azure \
  --quality enterprise \
  --open

# Custom Azure with Standard Quality
node ai-diagram.js generate \
  "Azure Functions with HTTP triggers, Key Vault for secrets, Cosmos DB for data, Application Insights for monitoring" \
  --style azure \
  --quality standard \
  --open
```

### AWS Examples

```bash
# AWS Serverless
node ai-diagram.js generate \
  --template aws-serverless \
  --style aws \
  --quality enterprise \
  --open

# AWS EKS
node ai-diagram.js generate \
  --template aws-eks \
  --style aws \
  --quality enterprise \
  --open

# Custom AWS
node ai-diagram.js generate \
  "Serverless API with API Gateway, Lambda functions, DynamoDB, S3 for file storage, CloudWatch for logging" \
  --style aws \
  --quality standard \
  --open
```

### GCP Examples

```bash
# GCP Data Platform
node ai-diagram.js generate \
  --template gcp-data-platform \
  --style gcp \
  --quality enterprise \
  --open

# Custom GCP
node ai-diagram.js generate \
  "GCP Cloud Run services, Cloud SQL PostgreSQL, Cloud Storage, Pub/Sub for messaging, Cloud KMS for encryption" \
  --style gcp \
  --quality standard \
  --open
```

### Kubernetes Examples

```bash
# K8s Microservices
node ai-diagram.js generate \
  --template k8s-microservices \
  --style k8s \
  --quality enterprise \
  --open

# Custom Kubernetes
node ai-diagram.js generate \
  "Kubernetes cluster with ingress, 3 microservices as deployments, services, config maps, secrets, persistent volumes for databases" \
  --style k8s \
  --quality standard \
  --open
```

### Open Source Examples

```bash
# Observability Stack
node ai-diagram.js generate \
  --template oss-observability \
  --style generic \
  --quality enterprise \
  --open

# CI/CD Pipeline
node ai-diagram.js generate \
  --template oss-cicd \
  --style generic \
  --quality enterprise \
  --open

# Custom OSS
node ai-diagram.js generate \
  "Web application with Nginx reverse proxy, Node.js API servers, PostgreSQL database, Redis cache, Prometheus monitoring, Grafana dashboards" \
  --style generic \
  --quality standard \
  --open
```

### Enterprise Architecture Examples

```bash
# UML Class Diagram
node ai-diagram.js generate \
  "E-commerce class diagram with Customer, Order, Product, Payment, Address classes showing relationships and cardinality" \
  --style uml \
  --quality standard \
  --open

# UML Sequence Diagram
node ai-diagram.js generate \
  --template uml-sequence \
  --style uml \
  --open

# ArchiMate Layered View
node ai-diagram.js generate \
  --template archimate-layered \
  --style archimate \
  --quality enterprise \
  --open

# C4 Context Diagram
node ai-diagram.js generate \
  --template c4-context \
  --style c4 \
  --open

# TOGAF Layers
node ai-diagram.js generate \
  --template togaf-layers \
  --style enterprise \
  --quality enterprise \
  --open
```

### Specialized Stacks

```bash
# Elastic Observability
node ai-diagram.js generate \
  --template elastic-observability \
  --style elastic \
  --quality enterprise \
  --open

# Elastic SIEM
node ai-diagram.js generate \
  --template elastic-siem \
  --style elastic \
  --quality enterprise \
  --open

# Firebase Mobile Backend
node ai-diagram.js generate \
  --template firebase-mobile \
  --style firebase \
  --quality standard \
  --open
```

### Multi-Cloud Providers

```bash
# Alibaba Cloud
node ai-diagram.js generate \
  --template alibaba-ecommerce \
  --style alibabacloud \
  --quality enterprise \
  --open

# IBM Cloud
node ai-diagram.js generate \
  --template ibm-hybrid \
  --style ibm \
  --quality enterprise \
  --open

# Oracle OCI
node ai-diagram.js generate \
  --template oci-enterprise \
  --style oci \
  --quality enterprise \
  --open

# DigitalOcean
node ai-diagram.js generate \
  --template digitalocean-app \
  --style digitalocean \
  --quality standard \
  --open

# OpenStack
node ai-diagram.js generate \
  --template openstack-private-cloud \
  --style openstack \
  --quality enterprise \
  --open

# Outscale
node ai-diagram.js generate \
  --template outscale-enterprise \
  --style outscale \
  --quality standard \
  --open
```

---

## 🎯 Side-by-Side Comparison

### Same Template, Different Formats

```bash
# M365 CMK as PNG (Python)
node ai-diagram.js generate \
  --template m365-cmk \
  --style azure \
  --quality enterprise \
  --open
# → Output: diagram.png (ready for docs)

# M365 CMK as XML (Draw.io)
node ai-diagram.js generate \
  --template m365-cmk \
  --style drawio \
  --open
# → Output: diagram.drawio (editable, export to PNG/SVG/PDF)
```

### Custom Description, Different Formats

```bash
# As PNG
node ai-diagram.js generate \
  "3-tier web application with load balancer, web servers, app servers, database cluster" \
  --style azure \
  --quality standard \
  --open

# As Draw.io
node ai-diagram.js generate \
  "3-tier web application with load balancer, web servers, app servers, database cluster" \
  --style drawio \
  --open
```

---

## 📋 Workflow Examples

### Standard Workflow

```bash
# 1. Generate diagram
node ai-diagram.js generate --template aws-serverless --style drawio --open

# 2. Preview
node ai-diagram.js preview --open

# 3. Publish to GitHub
node ai-diagram.js publish --target github

# 4. Clean up
node ai-diagram.js clean
```

### Iterative Workflow

```bash
# 1. Generate initial diagram
node ai-diagram.js generate --template k8s-microservices --style k8s

# 2. View the Python code
node ai-diagram.js preview --code

# 3. Edit the Python file manually
# (Edit .temp-ai-diagrams/diagram.py)

# 4. Regenerate
node ai-diagram.js regenerate --open

# 5. Publish when satisfied
node ai-diagram.js publish --target all --clean
```

---

## 🔧 Advanced Examples

### Multiple Quality Levels

```bash
# Simple (quick overview)
node ai-diagram.js generate \
  "microservices platform" \
  --style k8s \
  --quality simple \
  --open

# Standard (balanced)
node ai-diagram.js generate \
  "microservices platform" \
  --style k8s \
  --quality standard \
  --open

# Enterprise (comprehensive)
node ai-diagram.js generate \
  "microservices platform" \
  --style k8s \
  --quality enterprise \
  --open
```

### Template Override

```bash
# Use template but override style
node ai-diagram.js generate \
  --template aws-serverless \
  --style drawio \
  --open

# Use template with additional requirements
node ai-diagram.js generate \
  "Add Redis caching layer" \
  --template aws-serverless \
  --style aws \
  --open
```

---

## 📊 Complete Format Matrix

| Want                              | Command Example                                 |
| --------------------------------- | ----------------------------------------------- |
| **Azure PNG**               | `--template m365-cmk --style azure`           |
| **Azure Draw.io**           | `--template m365-cmk --style drawio`          |
| **AWS PNG**                 | `--template aws-serverless --style aws`       |
| **AWS Draw.io**             | `--template aws-serverless --style drawio`    |
| **K8s PNG**                 | `--template k8s-microservices --style k8s`    |
| **K8s Draw.io**             | `--template k8s-microservices --style drawio` |
| **UML PNG**                 | `--template uml-class --style uml`            |
| **UML Draw.io**             | `--template uml-class --style drawio`         |
| **Any template as Draw.io** | `--template <any> --style drawio`             |

**Every template × 2 formats = Maximum flexibility!** 🎉
