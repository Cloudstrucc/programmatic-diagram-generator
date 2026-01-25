# Draw.io Templates & Styles Guide

## Overview

The API now supports generating professional draw.io diagrams with pre-configured templates and styles for:

- ☁️ **Cloud Platforms**: AWS, Azure, GCP
- 🐳 **Containers**: Kubernetes
- 🌐 **Infrastructure**: Network diagrams, on-premise infrastructure
- 📊 **Modeling**: Flowcharts, UML diagrams

## Available Templates

### 1. AWS Architecture (`aws`)

Generate AWS cloud architecture diagrams with official AWS icons and styling.

**Available Services:**
- Compute: EC2, Lambda, ECS, EKS, Fargate
- Storage: S3, EBS, EFS, Glacier
- Database: RDS, DynamoDB, Aurora, ElastiCache, Redshift
- Networking: VPC, CloudFront, Route 53, ELB, API Gateway
- Security: IAM, KMS, WAF, Shield
- Containers: ECR

**Style Features:**
- Official AWS colors and branding
- VPC containers with green styling
- Subnet grouping with blue styling
- Security group highlighting
- Availability zone separation

### 2. Azure Architecture (`azure`)

Microsoft Azure cloud diagrams with official Azure icons.

**Available Services:**
- Compute: Virtual Machines, AKS, Functions, App Service, Container Instances
- Storage: Storage Accounts, Blob Storage, File Storage, Disk Storage
- Database: SQL Database, Cosmos DB, SQL Managed Instance, Redis
- Networking: VNet, Load Balancer, Application Gateway, Front Door, DNS
- Security: Key Vault, Security Center, Sentinel
- Identity: Active Directory

**Style Features:**
- Microsoft Azure color palette
- Resource Group containers
- Virtual Network grouping
- NSG (Network Security Group) highlighting
- Consistent Azure branding

### 3. Google Cloud Platform (`gcp`)

GCP architecture diagrams with Google Cloud icons.

**Available Services:**
- Compute: Compute Engine, GKE, Cloud Functions, App Engine, Cloud Run
- Storage: Cloud Storage, Persistent Disk, Filestore
- Database: Cloud SQL, Cloud Spanner, Firestore, Bigtable, Memorystore
- Networking: VPC, Cloud Load Balancing, Cloud DNS, Cloud CDN
- Security: Cloud IAM, Cloud KMS, Security Command Center

**Style Features:**
- Google's Material Design colors
- Project-level containers
- VPC and subnet grouping
- Zone separation
- Clean, modern styling

### 4. Kubernetes (`kubernetes`)

Container orchestration diagrams.

**Available Resources:**
- Workloads: Pod, Deployment
- Networking: Service, Ingress
- Config: ConfigMap, Secret
- Storage: PersistentVolume
- Cluster: Namespace

**Style Features:**
- Kubernetes blue color scheme
- Cluster and namespace grouping
- Node visualization
- Resource-specific colors

### 5. Network Diagram (`network`)

Traditional network topology diagrams.

**Available Devices:**
- Router, Switch, Firewall, Load Balancer
- Server, Workstation
- Cloud, Internet

**Style Features:**
- Professional network diagram colors
- DMZ, Internal, External zone separation
- Device-specific color coding
- Clear connection lines

### 6. Infrastructure (`infrastructure`)

On-premise datacenter and infrastructure diagrams.

**Available Equipment:**
- Servers: Rack, Blade
- Storage: SAN, NAS
- Power: UPS, PDU
- Cooling: CRAC units

**Style Features:**
- Building/floor/room hierarchy
- Rack elevation views
- Equipment-specific colors
- Physical layout representation

### 7. Flowchart (`flowchart`)

Process flow and decision diagrams.

**Available Shapes:**
- Process, Decision, Terminator
- Data, Document, Subprocess
- Connector

**Style Features:**
- Color-coded by shape type
- Clean, professional styling
- Standard flowchart conventions

### 8. UML (`uml`)

Software design diagrams.

**Available Shapes:**
- Class, Interface, Abstract Class
- Actor, Use Case
- Component, Package

**Style Features:**
- Class diagram styling
- Relationship types (inheritance, composition, etc.)
- Proper UML notation

## API Usage

### List Available Templates

```bash
curl http://localhost:3000/api/diagram/templates \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "success": true,
  "templates": [
    {
      "id": "aws",
      "name": "AWS Architecture",
      "description": "Amazon Web Services cloud architecture diagrams",
      "defaultStyle": "aws"
    },
    {
      "id": "azure",
      "name": "Azure Architecture",
      "description": "Microsoft Azure cloud architecture diagrams",
      "defaultStyle": "azure"
    }
    // ... more templates
  ],
  "supported": {
    "cloud": ["aws", "azure", "gcp"],
    "containers": ["kubernetes"],
    "infrastructure": ["network", "infrastructure"],
    "modeling": ["flowchart", "uml"]
  }
}
```

### Get Template Details

```bash
curl http://localhost:3000/api/diagram/templates/aws \
  -H "X-API-Key: your-api-key"
```

Response includes available shapes, styles, and stencils for that template.

### Generate Draw.io Diagram with Template

```bash
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "prompt": "Create a 3-tier web application architecture with load balancer, EC2 instances in multiple availability zones, RDS database, and S3 for static assets",
    "diagramType": "drawio",
    "templateType": "aws"
  }'
```

### Example Requests

#### AWS Architecture
```javascript
{
  "prompt": "Design a serverless API architecture using API Gateway, Lambda functions, DynamoDB for data storage, and S3 for file uploads. Include VPC for security.",
  "diagramType": "drawio",
  "templateType": "aws"
}
```

#### Azure Microservices
```javascript
{
  "prompt": "Create a microservices architecture using AKS, with Azure Container Registry, Azure SQL Database, Redis Cache, and Application Gateway for ingress",
  "diagramType": "drawio",
  "templateType": "azure"
}
```

#### GCP Data Pipeline
```javascript
{
  "prompt": "Design a data pipeline with Cloud Functions triggered by Cloud Storage, processing data through Dataflow, storing in BigQuery, and visualizing with Data Studio",
  "diagramType": "drawio",
  "templateType": "gcp"
}
```

#### Kubernetes Deployment
```javascript
{
  "prompt": "Show a Kubernetes deployment with frontend and backend services, ingress controller, config maps, secrets, and persistent volumes",
  "diagramType": "drawio",
  "templateType": "kubernetes"
}
```

#### Network Topology
```javascript
{
  "prompt": "Create a corporate network diagram showing internet connection, edge firewall, DMZ with web servers, internal network with database servers, and backup connections",
  "diagramType": "drawio",
  "templateType": "network"
}
```

#### Infrastructure Layout
```javascript
{
  "prompt": "Design a datacenter layout showing server racks, storage arrays, network switches, UPS systems, and cooling units",
  "diagramType": "drawio",
  "templateType": "infrastructure"
}
```

## Client Library Usage

### JavaScript/Node.js

```javascript
const DiagramClient = require('./client-example');

const client = new DiagramClient(
  'http://localhost:3000',
  'your-api-key'
);

// Generate AWS architecture diagram
const awsDiagram = await client.generateDiagram(
  'Create a highly available web application with auto-scaling groups, application load balancer, RDS in multi-AZ, and ElastiCache for session management',
  {
    diagramType: 'drawio',
    templateType: 'aws'
  }
);

// Save the draw.io XML
const fs = require('fs');
fs.writeFileSync('aws-architecture.drawio', awsDiagram.result);

console.log('Diagram saved! Open in draw.io');
```

### Frontend Integration (React)

```javascript
function DiagramGenerator() {
  const [template, setTemplate] = useState('aws');
  const [prompt, setPrompt] = useState('');
  const [diagram, setDiagram] = useState(null);

  async function generate() {
    const res = await fetch('/api/diagram/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        prompt,
        diagramType: 'drawio',
        templateType: template
      })
    });

    const { requestId } = await res.json();

    // Poll for result
    const interval = setInterval(async () => {
      const status = await fetch(`/api/diagram/status/${requestId}`, {
        headers: { 'X-API-Key': apiKey }
      });
      const data = await status.json();

      if (data.status === 'completed') {
        setDiagram(data.result);
        clearInterval(interval);
        
        // Download diagram
        const blob = new Blob([data.result], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template}-diagram.drawio`;
        a.click();
      }
    }, 2000);
  }

  return (
    <div>
      <select value={template} onChange={e => setTemplate(e.target.value)}>
        <option value="aws">AWS</option>
        <option value="azure">Azure</option>
        <option value="gcp">Google Cloud</option>
        <option value="kubernetes">Kubernetes</option>
        <option value="network">Network</option>
        <option value="flowchart">Flowchart</option>
      </select>
      
      <textarea 
        value={prompt} 
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe your architecture..."
      />
      
      <button onClick={generate}>Generate Diagram</button>
    </div>
  );
}
```

## Opening Generated Diagrams

### Option 1: draw.io Desktop/Web

1. Save the generated XML to a `.drawio` file
2. Open https://app.diagrams.net
3. File → Open → Select your `.drawio` file
4. Edit and export as needed (PNG, SVG, PDF)

### Option 2: VS Code Extension

1. Install "Draw.io Integration" extension
2. Save XML as `.drawio` file
3. Open in VS Code
4. Edit inline

### Option 3: Programmatic Conversion

```javascript
// Convert draw.io XML to PNG using puppeteer
const puppeteer = require('puppeteer');

async function convertToPNG(drawioXML, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://app.diagrams.net');
  // Load XML and export as PNG
  // (implementation details omitted for brevity)
  
  await browser.close();
}
```

## Best Practices

### 1. Be Specific in Prompts

**Good:**
```
"Create an AWS architecture with Application Load Balancer distributing traffic to EC2 instances in 2 availability zones (us-east-1a and us-east-1b), with RDS MySQL in multi-AZ configuration and ElastiCache Redis cluster"
```

**Bad:**
```
"Make an AWS diagram"
```

### 2. Specify Component Details

Include:
- Component names/labels
- Connections and data flow
- Grouping (VPCs, subnets, resource groups)
- Security boundaries
- Redundancy/high availability requirements

### 3. Use Appropriate Templates

- `aws/azure/gcp`: Cloud-native applications
- `kubernetes`: Container orchestration
- `network`: Traditional networking
- `infrastructure`: Physical datacenter layouts
- `flowchart`: Business processes
- `uml`: Software design

### 4. Validate Output

```bash
curl -X POST http://localhost:3000/api/diagram/validate/drawio \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "xml": "<mxGraphModel>...</mxGraphModel>"
  }'
```

## Customization

### Custom Style Options

You can pass custom style options:

```javascript
{
  "prompt": "Create AWS VPC architecture",
  "diagramType": "drawio",
  "templateType": "aws",
  "styleOptions": {
    "fontSize": 14,
    "connectorWidth": 3,
    "customColors": {
      "vpc": "#E7F3EC"
    }
  }
}
```

### Mixing Templates

For hybrid architectures, describe both environments:

```javascript
{
  "prompt": "Create a hybrid cloud architecture showing on-premise datacenter connected via VPN to AWS VPC, with data replication between on-premise SQL Server and AWS RDS",
  "diagramType": "drawio",
  "templateType": "aws"
}
```

## Troubleshooting

### Invalid XML Output

If validation fails, the system automatically:
1. Attempts to extract XML from markdown code blocks
2. Post-processes to add missing attributes
3. Returns cleaned XML

### Missing Icons

The system uses public icon libraries. Ensure:
- Internet connectivity for stencil downloads
- Correct service names in prompts
- Template type matches service provider

### Style Not Applied

Check that:
- `templateType` matches `diagramType: "drawio"`
- Template exists (check `/api/diagram/templates`)
- Prompt describes architecture clearly

## Pricing Impact

Draw.io diagrams typically use:
- **More tokens** than Mermaid (2000-4000 tokens)
- **Higher quality output** with professional styling
- **Better for**: Client presentations, documentation, architecture reviews
- **Consider**: Using Mermaid for quick internal diagrams, draw.io for polished outputs

## Examples Gallery

See the `/examples` directory for sample generated diagrams:
- `aws-3tier.drawio` - Classic 3-tier web app
- `azure-microservices.drawio` - Microservices on AKS
- `gcp-data-pipeline.drawio` - BigQuery data pipeline
- `k8s-deployment.drawio` - Kubernetes deployment
- `network-topology.drawio` - Enterprise network
- `datacenter-layout.drawio` - Physical infrastructure

All examples can be regenerated using the provided prompts in `examples/prompts.json`.
