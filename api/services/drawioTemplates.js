// services/drawioTemplates.js - Draw.io diagram generation with templates and styles

const config = require('../config');

class DrawioTemplateEngine {
  constructor() {
    this.templates = this.initializeTemplates();
    this.styles = this.initializeStyles();
    this.stencils = this.initializeStencils();
  }

  /**
   * Initialize diagram templates
   */
  initializeTemplates() {
    return {
      aws: {
        name: 'AWS Architecture',
        description: 'Amazon Web Services cloud architecture diagrams',
        stencils: ['aws19', 'aws4'],
        defaultStyle: 'aws',
        shapes: this.getAWSShapes()
      },
      azure: {
        name: 'Azure Architecture',
        description: 'Microsoft Azure cloud architecture diagrams',
        stencils: ['azure'],
        defaultStyle: 'azure',
        shapes: this.getAzureShapes()
      },
      gcp: {
        name: 'Google Cloud Platform',
        description: 'GCP cloud architecture diagrams',
        stencils: ['gcp2'],
        defaultStyle: 'gcp',
        shapes: this.getGCPShapes()
      },
      network: {
        name: 'Network Diagram',
        description: 'Network topology and infrastructure diagrams',
        stencils: ['network', 'cisco'],
        defaultStyle: 'network',
        shapes: this.getNetworkShapes()
      },
      flowchart: {
        name: 'Flowchart',
        description: 'Process flow and decision diagrams',
        stencils: ['general'],
        defaultStyle: 'flowchart',
        shapes: this.getFlowchartShapes()
      },
      uml: {
        name: 'UML Diagrams',
        description: 'Unified Modeling Language diagrams',
        stencils: ['uml'],
        defaultStyle: 'uml',
        shapes: this.getUMLShapes()
      },
      infrastructure: {
        name: 'Infrastructure',
        description: 'On-premise and hybrid infrastructure diagrams',
        stencils: ['general', 'rack'],
        defaultStyle: 'infrastructure',
        shapes: this.getInfrastructureShapes()
      },
      kubernetes: {
        name: 'Kubernetes',
        description: 'Container orchestration diagrams',
        stencils: ['kubernetes'],
        defaultStyle: 'kubernetes',
        shapes: this.getKubernetesShapes()
      }
    };
  }

  /**
   * Initialize visual styles
   */
  initializeStyles() {
    return {
      aws: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        groupStyles: {
          vpc: 'fillColor=#E7F3EC;strokeColor=#6CAF5B;strokeWidth=2;dashed=1;',
          subnet: 'fillColor=#EBF5FB;strokeColor=#3498DB;strokeWidth=2;dashed=1;',
          securityGroup: 'fillColor=#FEF9E7;strokeColor=#F39C12;strokeWidth=2;dashed=1;',
          availabilityZone: 'fillColor=#FADBD8;strokeColor=#E74C3C;strokeWidth=2;'
        },
        serviceStyles: {
          compute: 'fillColor=#ED7100;fontColor=#FFFFFF;strokeColor=#ED7100;',
          storage: 'fillColor=#3F8624;fontColor=#FFFFFF;strokeColor=#3F8624;',
          database: 'fillColor=#2E73B8;fontColor=#FFFFFF;strokeColor=#2E73B8;',
          networking: 'fillColor=#8C4FFF;fontColor=#FFFFFF;strokeColor=#8C4FFF;',
          analytics: 'fillColor=#FF9900;fontColor=#FFFFFF;strokeColor=#FF9900;'
        },
        connectorStyle: 'strokeColor=#232F3E;strokeWidth=2;',
        fontFamily: 'Amazon Ember, Helvetica, Arial',
        fontSize: 12
      },
      azure: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        groupStyles: {
          resourceGroup: 'fillColor=#E8F4F8;strokeColor=#0078D4;strokeWidth=2;dashed=1;',
          subnet: 'fillColor=#FFF4E5;strokeColor=#FF8C00;strokeWidth=2;dashed=1;',
          vnet: 'fillColor=#E5F3FF;strokeColor=#0078D4;strokeWidth=2;dashed=1;',
          nsg: 'fillColor=#FFF0F0;strokeColor=#D13438;strokeWidth=2;dashed=1;'
        },
        serviceStyles: {
          compute: 'fillColor=#0078D4;fontColor=#FFFFFF;strokeColor=#0078D4;',
          storage: 'fillColor=#FFB900;fontColor=#000000;strokeColor=#FFB900;',
          database: 'fillColor=#50E6FF;fontColor=#000000;strokeColor=#50E6FF;',
          networking: 'fillColor=#8661C5;fontColor=#FFFFFF;strokeColor=#8661C5;',
          security: 'fillColor=#E81123;fontColor=#FFFFFF;strokeColor=#E81123;'
        },
        connectorStyle: 'strokeColor=#0078D4;strokeWidth=2;',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        fontSize: 12
      },
      gcp: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        groupStyles: {
          project: 'fillColor=#F4F6F9;strokeColor=#4285F4;strokeWidth=2;dashed=1;',
          vpc: 'fillColor=#E8F0FE;strokeColor=#1A73E8;strokeWidth=2;dashed=1;',
          subnet: 'fillColor=#FFF8E1;strokeColor=#F9AB00;strokeWidth=2;dashed=1;',
          zone: 'fillColor=#E6F4EA;strokeColor=#34A853;strokeWidth=2;dashed=1;'
        },
        serviceStyles: {
          compute: 'fillColor=#4285F4;fontColor=#FFFFFF;strokeColor=#4285F4;',
          storage: 'fillColor=#EA4335;fontColor=#FFFFFF;strokeColor=#EA4335;',
          database: 'fillColor=#FBBC04;fontColor=#000000;strokeColor=#FBBC04;',
          networking: 'fillColor=#34A853;fontColor=#FFFFFF;strokeColor=#34A853;',
          analytics: 'fillColor=#9AA0A6;fontColor=#FFFFFF;strokeColor=#9AA0A6;'
        },
        connectorStyle: 'strokeColor=#5F6368;strokeWidth=2;',
        fontFamily: 'Google Sans, Arial, sans-serif',
        fontSize: 12
      },
      network: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        groupStyles: {
          datacenter: 'fillColor=#F5F5F5;strokeColor=#666666;strokeWidth=3;',
          dmz: 'fillColor=#FFE6E6;strokeColor=#CC0000;strokeWidth=2;dashed=1;',
          internal: 'fillColor=#E6FFE6;strokeColor=#00CC00;strokeWidth=2;dashed=1;',
          external: 'fillColor=#E6E6FF;strokeColor=#0000CC;strokeWidth=2;dashed=1;'
        },
        deviceStyles: {
          router: 'fillColor=#1BA1E2;fontColor=#FFFFFF;strokeColor=#1BA1E2;',
          switch: 'fillColor=#00A300;fontColor=#FFFFFF;strokeColor=#00A300;',
          firewall: 'fillColor=#E51400;fontColor=#FFFFFF;strokeColor=#E51400;',
          server: 'fillColor=#647687;fontColor=#FFFFFF;strokeColor=#647687;',
          workstation: 'fillColor=#A0A0A0;fontColor=#FFFFFF;strokeColor=#A0A0A0;'
        },
        connectorStyle: 'strokeColor=#000000;strokeWidth=2;',
        fontFamily: 'Arial, sans-serif',
        fontSize: 11
      },
      flowchart: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        shapeStyles: {
          process: 'fillColor=#DAE8FC;strokeColor=#6C8EBF;strokeWidth=2;',
          decision: 'fillColor=#FFE6CC;strokeColor=#D79B00;strokeWidth=2;',
          data: 'fillColor=#D5E8D4;strokeColor=#82B366;strokeWidth=2;',
          terminator: 'fillColor=#F8CECC;strokeColor=#B85450;strokeWidth=2;',
          document: 'fillColor=#E1D5E7;strokeColor=#9673A6;strokeWidth=2;'
        },
        connectorStyle: 'strokeColor=#000000;strokeWidth=2;',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 12
      },
      uml: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        classStyle: 'fillColor=#F5F5F5;strokeColor=#666666;strokeWidth=1;',
        interfaceStyle: 'fillColor=#E1F5FE;strokeColor=#0277BD;strokeWidth=1;',
        abstractStyle: 'fillColor=#FFF9C4;strokeColor=#F57F17;strokeWidth=1;',
        connectorStyles: {
          association: 'strokeColor=#000000;strokeWidth=1;',
          aggregation: 'strokeColor=#000000;strokeWidth=1;endArrow=diamond;',
          composition: 'strokeColor=#000000;strokeWidth=1;endArrow=diamondThin;',
          inheritance: 'strokeColor=#000000;strokeWidth=1;endArrow=block;endFill=0;',
          dependency: 'strokeColor=#000000;strokeWidth=1;dashed=1;'
        },
        fontFamily: 'Courier New, monospace',
        fontSize: 11
      },
      kubernetes: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        groupStyles: {
          cluster: 'fillColor=#E8F4F8;strokeColor=#326CE5;strokeWidth=3;',
          namespace: 'fillColor=#F0F8FF;strokeColor=#326CE5;strokeWidth=2;dashed=1;',
          node: 'fillColor=#FFF8E1;strokeColor=#FF9800;strokeWidth=2;'
        },
        resourceStyles: {
          pod: 'fillColor=#326CE5;fontColor=#FFFFFF;strokeColor=#326CE5;',
          service: 'fillColor=#00ACC1;fontColor=#FFFFFF;strokeColor=#00ACC1;',
          deployment: 'fillColor=#7B1FA2;fontColor=#FFFFFF;strokeColor=#7B1FA2;',
          configmap: 'fillColor=#43A047;fontColor=#FFFFFF;strokeColor=#43A047;',
          volume: 'fillColor=#F57C00;fontColor=#FFFFFF;strokeColor=#F57C00;'
        },
        connectorStyle: 'strokeColor=#326CE5;strokeWidth=2;',
        fontFamily: 'Roboto, Arial, sans-serif',
        fontSize: 11
      },
      infrastructure: {
        background: '#FFFFFF',
        gridColor: '#E5E5E5',
        groupStyles: {
          building: 'fillColor=#F5F5F5;strokeColor=#333333;strokeWidth=3;',
          floor: 'fillColor=#E8E8E8;strokeColor=#666666;strokeWidth=2;',
          room: 'fillColor=#FFFFFF;strokeColor=#999999;strokeWidth=1;dashed=1;',
          rack: 'fillColor=#D6D6D6;strokeColor=#000000;strokeWidth=2;'
        },
        equipmentStyles: {
          server: 'fillColor=#4A90E2;fontColor=#FFFFFF;strokeColor=#4A90E2;',
          storage: 'fillColor=#50C878;fontColor=#FFFFFF;strokeColor=#50C878;',
          network: 'fillColor=#F39C12;fontColor=#FFFFFF;strokeColor=#F39C12;',
          power: 'fillColor=#E74C3C;fontColor=#FFFFFF;strokeColor=#E74C3C;',
          cooling: 'fillColor=#3498DB;fontColor=#FFFFFF;strokeColor=#3498DB;'
        },
        connectorStyle: 'strokeColor=#333333;strokeWidth=2;',
        fontFamily: 'Arial, sans-serif',
        fontSize: 11
      }
    };
  }

  /**
   * Initialize stencil libraries
   */
  initializeStencils() {
    return {
      aws19: 'https://raw.githubusercontent.com/aws/aws-icons-for-draw-io/master/aws19/',
      aws4: 'https://raw.githubusercontent.com/aws/aws-icons-for-draw-io/master/aws4/',
      azure: 'https://raw.githubusercontent.com/Azure/Azure-Architecture-Icons/master/Draw.io/',
      gcp2: 'https://raw.githubusercontent.com/GoogleCloudPlatform/icons-for-draw-io/master/gcp/',
      kubernetes: 'https://raw.githubusercontent.com/kubernetes/community/master/icons/draw.io/',
      cisco: 'https://app.diagrams.net/plugins/cisco.xml',
      network: 'https://app.diagrams.net/plugins/network.xml'
    };
  }

  /**
   * Get AWS service shapes mapping
   */
  getAWSShapes() {
    return {
      // Compute
      'ec2': { name: 'Amazon EC2', category: 'compute', icon: 'EC2.png' },
      'lambda': { name: 'AWS Lambda', category: 'compute', icon: 'Lambda.png' },
      'ecs': { name: 'Amazon ECS', category: 'compute', icon: 'ECS.png' },
      'eks': { name: 'Amazon EKS', category: 'compute', icon: 'EKS.png' },
      'fargate': { name: 'AWS Fargate', category: 'compute', icon: 'Fargate.png' },
      
      // Storage
      's3': { name: 'Amazon S3', category: 'storage', icon: 'S3.png' },
      'ebs': { name: 'Amazon EBS', category: 'storage', icon: 'EBS.png' },
      'efs': { name: 'Amazon EFS', category: 'storage', icon: 'EFS.png' },
      'glacier': { name: 'Amazon Glacier', category: 'storage', icon: 'Glacier.png' },
      
      // Database
      'rds': { name: 'Amazon RDS', category: 'database', icon: 'RDS.png' },
      'dynamodb': { name: 'Amazon DynamoDB', category: 'database', icon: 'DynamoDB.png' },
      'aurora': { name: 'Amazon Aurora', category: 'database', icon: 'Aurora.png' },
      'elasticache': { name: 'Amazon ElastiCache', category: 'database', icon: 'ElastiCache.png' },
      'redshift': { name: 'Amazon Redshift', category: 'analytics', icon: 'Redshift.png' },
      
      // Networking
      'vpc': { name: 'Amazon VPC', category: 'networking', icon: 'VPC.png' },
      'cloudfront': { name: 'Amazon CloudFront', category: 'networking', icon: 'CloudFront.png' },
      'route53': { name: 'Amazon Route 53', category: 'networking', icon: 'Route53.png' },
      'elb': { name: 'Elastic Load Balancing', category: 'networking', icon: 'ELB.png' },
      'apigateway': { name: 'Amazon API Gateway', category: 'networking', icon: 'APIGateway.png' },
      
      // Security
      'iam': { name: 'AWS IAM', category: 'security', icon: 'IAM.png' },
      'kms': { name: 'AWS KMS', category: 'security', icon: 'KMS.png' },
      'waf': { name: 'AWS WAF', category: 'security', icon: 'WAF.png' },
      'shield': { name: 'AWS Shield', category: 'security', icon: 'Shield.png' },
      
      // Containers
      'ecr': { name: 'Amazon ECR', category: 'containers', icon: 'ECR.png' }
    };
  }

  /**
   * Get Azure service shapes mapping
   */
  getAzureShapes() {
    return {
      // Compute
      'vm': { name: 'Virtual Machines', category: 'compute', icon: 'Virtual-Machine.svg' },
      'aks': { name: 'Azure Kubernetes Service', category: 'compute', icon: 'Kubernetes-Services.svg' },
      'functions': { name: 'Azure Functions', category: 'compute', icon: 'Function-Apps.svg' },
      'appservice': { name: 'App Service', category: 'compute', icon: 'App-Services.svg' },
      'containerinstances': { name: 'Container Instances', category: 'compute', icon: 'Container-Instances.svg' },
      
      // Storage
      'storageaccount': { name: 'Storage Accounts', category: 'storage', icon: 'Storage-Accounts.svg' },
      'blobstorage': { name: 'Blob Storage', category: 'storage', icon: 'Blob-Storage.svg' },
      'filestorage': { name: 'File Storage', category: 'storage', icon: 'File-Storage.svg' },
      'diskstorage': { name: 'Disk Storage', category: 'storage', icon: 'Managed-Disks.svg' },
      
      // Database
      'sqldatabase': { name: 'SQL Database', category: 'database', icon: 'SQL-Database.svg' },
      'cosmosdb': { name: 'Cosmos DB', category: 'database', icon: 'Azure-Cosmos-DB.svg' },
      'sqlmanagedinstance': { name: 'SQL Managed Instance', category: 'database', icon: 'SQL-Managed-Instance.svg' },
      'redis': { name: 'Azure Cache for Redis', category: 'database', icon: 'Cache-Redis.svg' },
      
      // Networking
      'vnet': { name: 'Virtual Network', category: 'networking', icon: 'Virtual-Networks.svg' },
      'loadbalancer': { name: 'Load Balancer', category: 'networking', icon: 'Load-Balancers.svg' },
      'appgateway': { name: 'Application Gateway', category: 'networking', icon: 'Application-Gateways.svg' },
      'frontdoor': { name: 'Front Door', category: 'networking', icon: 'Front-Doors.svg' },
      'dns': { name: 'DNS', category: 'networking', icon: 'DNS-Zones.svg' },
      
      // Security
      'keyvault': { name: 'Key Vault', category: 'security', icon: 'Key-Vaults.svg' },
      'securitycenter': { name: 'Security Center', category: 'security', icon: 'Security-Center.svg' },
      'sentinel': { name: 'Azure Sentinel', category: 'security', icon: 'Azure-Sentinel.svg' },
      
      // Identity
      'activedirectory': { name: 'Active Directory', category: 'identity', icon: 'Azure-Active-Directory.svg' }
    };
  }

  /**
   * Get GCP service shapes mapping
   */
  getGCPShapes() {
    return {
      // Compute
      'computeengine': { name: 'Compute Engine', category: 'compute', icon: 'Compute_Engine.svg' },
      'gke': { name: 'Kubernetes Engine', category: 'compute', icon: 'Kubernetes_Engine.svg' },
      'cloudfunctions': { name: 'Cloud Functions', category: 'compute', icon: 'Cloud_Functions.svg' },
      'appengine': { name: 'App Engine', category: 'compute', icon: 'App_Engine.svg' },
      'cloudrun': { name: 'Cloud Run', category: 'compute', icon: 'Cloud_Run.svg' },
      
      // Storage
      'cloudstorage': { name: 'Cloud Storage', category: 'storage', icon: 'Cloud_Storage.svg' },
      'persistentdisk': { name: 'Persistent Disk', category: 'storage', icon: 'Persistent_Disk.svg' },
      'filestore': { name: 'Filestore', category: 'storage', icon: 'Filestore.svg' },
      
      // Database
      'cloudsql': { name: 'Cloud SQL', category: 'database', icon: 'Cloud_SQL.svg' },
      'cloudspanner': { name: 'Cloud Spanner', category: 'database', icon: 'Cloud_Spanner.svg' },
      'firestore': { name: 'Firestore', category: 'database', icon: 'Cloud_Firestore.svg' },
      'bigtable': { name: 'Cloud Bigtable', category: 'database', icon: 'Cloud_Bigtable.svg' },
      'memorystore': { name: 'Memorystore', category: 'database', icon: 'Cloud_Memorystore.svg' },
      
      // Networking
      'vpc': { name: 'VPC Network', category: 'networking', icon: 'Virtual_Private_Cloud.svg' },
      'cloudloadbalancing': { name: 'Cloud Load Balancing', category: 'networking', icon: 'Cloud_Load_Balancing.svg' },
      'clouddns': { name: 'Cloud DNS', category: 'networking', icon: 'Cloud_DNS.svg' },
      'cloudcdn': { name: 'Cloud CDN', category: 'networking', icon: 'Cloud_CDN.svg' },
      
      // Security
      'iam': { name: 'Cloud IAM', category: 'security', icon: 'Cloud_IAM.svg' },
      'kms': { name: 'Cloud KMS', category: 'security', icon: 'Cloud_Key_Management_Service.svg' },
      'securitycommandcenter': { name: 'Security Command Center', category: 'security', icon: 'Security_Command_Center.svg' }
    };
  }

  /**
   * Get network device shapes
   */
  getNetworkShapes() {
    return {
      'router': { name: 'Router', category: 'network', icon: 'router.png' },
      'switch': { name: 'Switch', category: 'network', icon: 'switch.png' },
      'firewall': { name: 'Firewall', category: 'security', icon: 'firewall.png' },
      'loadbalancer': { name: 'Load Balancer', category: 'network', icon: 'loadbalancer.png' },
      'server': { name: 'Server', category: 'compute', icon: 'server.png' },
      'workstation': { name: 'Workstation', category: 'endpoint', icon: 'workstation.png' },
      'cloud': { name: 'Cloud', category: 'cloud', icon: 'cloud.png' },
      'internet': { name: 'Internet', category: 'network', icon: 'internet.png' }
    };
  }

  /**
   * Get flowchart shapes
   */
  getFlowchartShapes() {
    return {
      'process': { name: 'Process', shape: 'rectangle' },
      'decision': { name: 'Decision', shape: 'rhombus' },
      'terminator': { name: 'Start/End', shape: 'rounded' },
      'data': { name: 'Data', shape: 'parallelogram' },
      'document': { name: 'Document', shape: 'document' },
      'subprocess': { name: 'Predefined Process', shape: 'process' },
      'connector': { name: 'Connector', shape: 'circle' }
    };
  }

  /**
   * Get UML shapes
   */
  getUMLShapes() {
    return {
      'class': { name: 'Class', type: 'class' },
      'interface': { name: 'Interface', type: 'interface' },
      'abstract': { name: 'Abstract Class', type: 'abstract' },
      'actor': { name: 'Actor', type: 'actor' },
      'usecase': { name: 'Use Case', type: 'usecase' },
      'component': { name: 'Component', type: 'component' },
      'package': { name: 'Package', type: 'package' }
    };
  }

  /**
   * Get Kubernetes resource shapes
   */
  getKubernetesShapes() {
    return {
      'pod': { name: 'Pod', category: 'workload', icon: 'pod.svg' },
      'deployment': { name: 'Deployment', category: 'workload', icon: 'deploy.svg' },
      'service': { name: 'Service', category: 'network', icon: 'svc.svg' },
      'ingress': { name: 'Ingress', category: 'network', icon: 'ing.svg' },
      'configmap': { name: 'ConfigMap', category: 'config', icon: 'cm.svg' },
      'secret': { name: 'Secret', category: 'config', icon: 'secret.svg' },
      'persistentvolume': { name: 'PersistentVolume', category: 'storage', icon: 'pv.svg' },
      'namespace': { name: 'Namespace', category: 'cluster', icon: 'ns.svg' }
    };
  }

  /**
   * Get infrastructure equipment shapes
   */
  getInfrastructureShapes() {
    return {
      'rackserver': { name: 'Rack Server', category: 'compute', icon: 'server_rack.png' },
      'bladeserver': { name: 'Blade Server', category: 'compute', icon: 'blade_server.png' },
      'san': { name: 'SAN Storage', category: 'storage', icon: 'san.png' },
      'nas': { name: 'NAS Storage', category: 'storage', icon: 'nas.png' },
      'ups': { name: 'UPS', category: 'power', icon: 'ups.png' },
      'pdu': { name: 'PDU', category: 'power', icon: 'pdu.png' },
      'crac': { name: 'CRAC Unit', category: 'cooling', icon: 'crac.png' }
    };
  }

  /**
   * Generate prompt for Claude based on template and user request
   */
  generateDrawioPrompt(userRequest, templateType, styleOptions = {}) {
    const template = this.templates[templateType];
    const style = this.styles[templateType];

    if (!template) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    // Build comprehensive prompt for Claude
    const prompt = `Generate a draw.io diagram in XML format based on the following requirements:

USER REQUEST:
${userRequest}

TEMPLATE TYPE: ${template.name}
${template.description}

STYLE GUIDELINES:
${JSON.stringify(style, null, 2)}

AVAILABLE SHAPES/SERVICES:
${JSON.stringify(template.shapes, null, 2)}

REQUIREMENTS:
1. Generate valid draw.io XML format (mxGraphModel structure)
2. Use the specified style guidelines for colors, fonts, and formatting
3. Include proper grouping with containers (VPCs, resource groups, namespaces, etc.)
4. Apply appropriate shape styles based on service categories
5. Include clear labels and annotations
6. Use proper connectors with the specified style
7. Ensure professional spacing and layout
8. Add a title and legend if appropriate

OUTPUT FORMAT:
Return ONLY the draw.io XML, starting with <mxGraphModel> and ending with </mxGraphModel>.
Do not include any explanations or markdown - just the pure XML that can be imported directly into draw.io.

EXAMPLE STRUCTURE:
<mxGraphModel dx="1234" dy="789" grid="1" gridSize="10" guides="1">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Groups, shapes, and connectors here -->
  </root>
</mxGraphModel>

Generate the diagram now:`;

    return prompt;
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Object.entries(this.templates).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description,
      defaultStyle: template.defaultStyle
    }));
  }

  /**
   * Get template details
   */
  getTemplateDetails(templateType) {
    const template = this.templates[templateType];
    const style = this.styles[templateType];

    if (!template) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    return {
      template,
      style,
      shapes: template.shapes,
      stencils: template.stencils.map(s => ({
        name: s,
        url: this.stencils[s]
      }))
    };
  }

  /**
   * Validate draw.io XML output
   */
  validateDrawioXML(xml) {
    try {
      // Basic validation checks
      if (!xml.includes('<mxGraphModel')) {
        return { valid: false, error: 'Missing mxGraphModel root element' };
      }

      if (!xml.includes('</mxGraphModel>')) {
        return { valid: false, error: 'Unclosed mxGraphModel element' };
      }

      if (!xml.includes('<root>')) {
        return { valid: false, error: 'Missing root element' };
      }

      // Check for minimum required cells
      const cellMatches = xml.match(/<mxCell/g);
      if (!cellMatches || cellMatches.length < 2) {
        return { valid: false, error: 'Missing required base cells' };
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Post-process draw.io XML to ensure quality
   */
  postProcessDrawioXML(xml, templateType) {
    const style = this.styles[templateType];

    // Add any missing style attributes
    let processed = xml;

    // Ensure grid is enabled
    if (!processed.includes('grid="1"')) {
      processed = processed.replace('<mxGraphModel', '<mxGraphModel grid="1" gridSize="10"');
    }

    // Add background if not present
    if (style.background && !processed.includes('background=')) {
      processed = processed.replace('<mxGraphModel', `<mxGraphModel background="${style.background}"`);
    }

    return processed;
  }
}

module.exports = DrawioTemplateEngine;
