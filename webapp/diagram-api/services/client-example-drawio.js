// client-example-drawio.js - Example client with draw.io template support
const fs = require('fs');
const path = require('path');

class DrawioDiagramClient {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * List available templates
   */
  async getTemplates() {
    const response = await fetch(`${this.apiUrl}/api/diagram/templates`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Failed to get templates: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get template details
   */
  async getTemplateDetails(templateType) {
    const response = await fetch(`${this.apiUrl}/api/diagram/templates/${templateType}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Failed to get template details: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Generate draw.io diagram
   */
  async generateDrawioDiagram(prompt, templateType, options = {}) {
    try {
      // Submit request
      const response = await fetch(`${this.apiUrl}/api/diagram/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          prompt,
          diagramType: 'drawio',
          templateType,
          styleOptions: options.styleOptions || {},
          options: {
            maxTokens: options.maxTokens || 4096,
            temperature: options.temperature || 1.0
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.message}`);
      }

      const data = await response.json();
      console.log(`✓ Request queued: ${data.requestId}`);
      console.log(`  Template: ${templateType}`);
      console.log(`  Position in queue: ${data.position}`);
      console.log(`  Estimated wait: ${Math.ceil(data.estimatedWait / 1000)}s`);

      // Poll for completion
      return await this.pollForResult(data.requestId);

    } catch (error) {
      console.error('Generate error:', error.message);
      throw error;
    }
  }

  /**
   * Poll for request result
   */
  async pollForResult(requestId, maxAttempts = 120, interval = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.checkStatus(requestId);

      if (status.status === 'completed') {
        console.log('✓ Diagram completed!');
        return {
          requestId,
          result: status.result,
          tokensUsed: status.tokensUsed,
          diagramType: status.diagramType,
          templateType: status.templateType
        };
      }

      if (status.status === 'failed') {
        throw new Error(`Request failed: ${status.error?.message || 'Unknown error'}`);
      }

      if (status.position) {
        console.log(`  Waiting... (position ${status.position})`);
      }

      await this.sleep(interval);
    }

    throw new Error('Request timeout - maximum polling attempts reached');
  }

  /**
   * Check request status
   */
  async checkStatus(requestId) {
    const response = await fetch(`${this.apiUrl}/api/diagram/status/${requestId}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Status check failed: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Validate draw.io XML
   */
  async validateXML(xml) {
    const response = await fetch(`${this.apiUrl}/api/diagram/validate/drawio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ xml })
    });

    if (!response.ok) {
      throw new Error('Validation failed');
    }

    return await response.json();
  }

  /**
   * Save diagram to file
   */
  async saveDiagram(xml, filename) {
    const outputPath = path.join(process.cwd(), filename);
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`✓ Diagram saved to: ${outputPath}`);
    return outputPath;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Example usage
async function main() {
  const client = new DrawioDiagramClient(
    'http://localhost:3000',
    'your-api-key-here'
  );

  try {
    console.log('\n=== Draw.io Template Examples ===\n');

    // Example 1: List available templates
    console.log('1. Getting available templates...\n');
    const templates = await client.getTemplates();
    console.log('Available templates:');
    templates.templates.forEach(t => {
      console.log(`  - ${t.id}: ${t.name}`);
    });

    // Example 2: AWS Architecture
    console.log('\n2. Generating AWS Architecture Diagram...\n');
    const awsDiagram = await client.generateDrawioDiagram(
      `Create a highly available 3-tier web application architecture:
      - Application Load Balancer in public subnets
      - Auto Scaling Group with EC2 instances in private subnets across 2 AZs (us-east-1a, us-east-1b)
      - RDS MySQL in multi-AZ configuration
      - ElastiCache Redis cluster for session management
      - S3 bucket for static assets
      - CloudFront CDN
      - All within a VPC with proper security groups`,
      'aws'
    );

    await client.saveDiagram(awsDiagram.result, 'aws-3tier-app.drawio');
    console.log(`Tokens used: ${awsDiagram.tokensUsed}`);

    // Example 3: Azure Microservices
    console.log('\n3. Generating Azure Microservices Diagram...\n');
    const azureDiagram = await client.generateDrawioDiagram(
      `Design a microservices architecture on Azure:
      - Azure Kubernetes Service (AKS) cluster with 3 node pools
      - Frontend service (React app) - 3 replicas
      - API Gateway service - 2 replicas  
      - Order service - 3 replicas
      - Payment service - 2 replicas
      - Inventory service - 2 replicas
      - Azure Container Registry for Docker images
      - Azure SQL Database for order data
      - Azure Cosmos DB for product catalog
      - Azure Cache for Redis for distributed caching
      - Application Gateway for ingress with WAF
      - Azure Monitor for observability
      - All within a Virtual Network with proper NSGs`,
      'azure'
    );

    await client.saveDiagram(azureDiagram.result, 'azure-microservices.drawio');
    console.log(`Tokens used: ${azureDiagram.tokensUsed}`);

    // Example 4: GCP Data Pipeline
    console.log('\n4. Generating GCP Data Pipeline Diagram...\n');
    const gcpDiagram = await client.generateDrawioDiagram(
      `Create a data processing pipeline on Google Cloud:
      - Cloud Storage buckets for raw data ingestion (CSV, JSON files)
      - Cloud Functions triggered on file upload for validation
      - Cloud Dataflow for batch ETL processing
      - Cloud Pub/Sub for event streaming
      - Cloud Dataproc for Apache Spark jobs
      - BigQuery for data warehouse
      - Cloud Bigtable for time-series data
      - Looker Studio for visualization
      - Cloud Composer (Apache Airflow) for orchestration
      - Cloud KMS for encryption keys
      - All within a VPC with IAM roles`,
      'gcp'
    );

    await client.saveDiagram(gcpDiagram.result, 'gcp-data-pipeline.drawio');
    console.log(`Tokens used: ${gcpDiagram.tokensUsed}`);

    // Example 5: Kubernetes Deployment
    console.log('\n5. Generating Kubernetes Deployment Diagram...\n');
    const k8sDiagram = await client.generateDrawioDiagram(
      `Show a production Kubernetes deployment:
      - Namespace: production
      - Frontend deployment with 3 pods (nginx + React)
      - Backend API deployment with 5 pods (Node.js)
      - Database deployment with 1 pod (PostgreSQL) + PersistentVolume
      - Redis cache deployment with 2 pods
      - Frontend Service (LoadBalancer type)
      - Backend Service (ClusterIP type)
      - Database Service (ClusterIP type)
      - Redis Service (ClusterIP type)
      - Ingress controller (nginx) routing traffic
      - ConfigMap for application config
      - Secret for database credentials
      - HorizontalPodAutoscaler for backend
      - Network Policy for pod communication`,
      'kubernetes'
    );

    await client.saveDiagram(k8sDiagram.result, 'k8s-deployment.drawio');
    console.log(`Tokens used: ${k8sDiagram.tokensUsed}`);

    // Example 6: Network Topology
    console.log('\n6. Generating Network Topology Diagram...\n');
    const networkDiagram = await client.generateDrawioDiagram(
      `Design an enterprise network topology:
      - Internet connection (100Mbps fiber)
      - Edge firewall (Cisco ASA)
      - DMZ zone containing:
        * Web server cluster (3 servers)
        * Email server (Exchange)
        * VPN gateway
      - Core switch (Cisco Catalyst)
      - Internal network with VLANs:
        * VLAN 10: Management (10.0.10.0/24)
        * VLAN 20: Users (10.0.20.0/24)  
        * VLAN 30: Servers (10.0.30.0/24)
        * VLAN 40: VoIP (10.0.40.0/24)
      - Server farm with:
        * Database servers (SQL Server cluster)
        * File servers (Windows)
        * Application servers
      - Backup network with NAS storage
      - Redundant internet connection (failover)
      - Internal firewall between DMZ and internal network`,
      'network'
    );

    await client.saveDiagram(networkDiagram.result, 'network-topology.drawio');
    console.log(`Tokens used: ${networkDiagram.tokensUsed}`);

    // Example 7: Infrastructure Layout
    console.log('\n7. Generating Datacenter Infrastructure Diagram...\n');
    const infraDiagram = await client.generateDrawioDiagram(
      `Design a datacenter layout:
      - Building: Main datacenter facility
      - Floor 1: Equipment room
        * Server rack A1: 20 blade servers (Dell PowerEdge)
        * Server rack A2: 15 rack servers (HP ProLiant)
        * Storage rack B1: SAN arrays (NetApp)
        * Storage rack B2: NAS systems (Synology)
        * Network rack N1: Core switches, routers, firewalls
      - Power infrastructure:
        * UPS systems (2x 100kVA)
        * PDU in each rack
        * Generator backup (500kW)
      - Cooling:
        * CRAC units (4 units)
        * Hot aisle / cold aisle layout
      - Network connections between racks
      - Redundant power feeds`,
      'infrastructure'
    );

    await client.saveDiagram(infraDiagram.result, 'datacenter-layout.drawio');
    console.log(`Tokens used: ${infraDiagram.tokensUsed}`);

    // Example 8: Validate generated XML
    console.log('\n8. Validating generated diagrams...\n');
    const validation = await client.validateXML(awsDiagram.result);
    console.log(`AWS diagram validation: ${validation.valid ? '✓ Valid' : '✗ Invalid'}`);
    if (!validation.valid) {
      console.log(`  Error: ${validation.error}`);
    }

    console.log('\n=== All Examples Completed ===');
    console.log('\nGenerated files:');
    console.log('  - aws-3tier-app.drawio');
    console.log('  - azure-microservices.drawio');
    console.log('  - gcp-data-pipeline.drawio');
    console.log('  - k8s-deployment.drawio');
    console.log('  - network-topology.drawio');
    console.log('  - datacenter-layout.drawio');
    console.log('\nOpen these files in https://app.diagrams.net to view and edit!');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

// Run examples if called directly
if (require.main === module) {
  main();
}

module.exports = DrawioDiagramClient;
