// services/pythonDiagramGenerator.js - Generate diagrams using Python diagrams library
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');

class PythonDiagramGenerator {
  constructor() {
    this.outputDir = config.diagrams.outputDir;
    this.tempDir = path.join(__dirname, '..', '.temp-python-diagrams');
    
    // Ensure directories exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate diagram using Python diagrams library via CLI
   */
  async generateDiagram(options) {
    const {
      prompt,
      style = 'azure',
      quality = 'standard',
      template = null,
      outputFormat = 'png'
    } = options;

    const timestamp = Date.now();
    const diagramName = `diagram_${timestamp}`;
    const outputPath = path.join(this.outputDir, diagramName);

    return new Promise((resolve, reject) => {
      const args = ['generate'];
      
      // Add template or prompt
      if (template) {
        args.push('--template', template);
      }
      if (prompt) {
        args.push(prompt);
      }
      
      // Add style and quality
      args.push('--style', style);
      args.push('--quality', quality);

      console.log('Executing Python diagram generation:', args.join(' '));

      // Spawn the ai-diagram.js process
      const aiDiagramPath = path.join(__dirname, '..', 'ai-diagram.js');
      const process = spawn('node', [aiDiagramPath, ...args], {
        cwd: path.dirname(aiDiagramPath)
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('Python diagram generation failed:', stderr);
          return reject(new Error(`Diagram generation failed: ${stderr}`));
        }

        // Check if diagram was created
        const tempDiagramPath = path.join(path.dirname(aiDiagramPath), '.temp-ai-diagrams', 'diagram.png');
        
        if (!fs.existsSync(tempDiagramPath)) {
          return reject(new Error('Diagram file not created'));
        }

        // Move to output directory
        const finalPath = `${outputPath}.${outputFormat}`;
        fs.copyFileSync(tempDiagramPath, finalPath);

        // Also copy the Python source if it exists
        const pythonSourcePath = path.join(path.dirname(aiDiagramPath), '.temp-ai-diagrams', 'diagram.py');
        if (fs.existsSync(pythonSourcePath)) {
          fs.copyFileSync(pythonSourcePath, `${outputPath}.py`);
        }

        console.log('Python diagram generated successfully:', finalPath);

        resolve({
          success: true,
          filePath: finalPath,
          fileName: `${diagramName}.${outputFormat}`,
          format: outputFormat,
          style: style,
          quality: quality,
          sourceCode: fs.existsSync(`${outputPath}.py`) ? `${outputPath}.py` : null
        });
      });

      process.on('error', (error) => {
        console.error('Failed to start Python diagram process:', error);
        reject(new Error(`Failed to start diagram generation: ${error.message}`));
      });
    });
  }

  /**
   * Get available styles
   */
  getAvailableStyles() {
    return [
      { id: 'azure', name: 'Azure Architecture', category: 'Cloud Providers' },
      { id: 'aws', name: 'AWS Architecture', category: 'Cloud Providers' },
      { id: 'gcp', name: 'GCP Architecture', category: 'Cloud Providers' },
      { id: 'alibabacloud', name: 'Alibaba Cloud', category: 'Cloud Providers' },
      { id: 'ibm', name: 'IBM Cloud', category: 'Cloud Providers' },
      { id: 'oci', name: 'Oracle Cloud (OCI)', category: 'Cloud Providers' },
      { id: 'digitalocean', name: 'DigitalOcean', category: 'Cloud Providers' },
      { id: 'openstack', name: 'OpenStack', category: 'Cloud Providers' },
      { id: 'outscale', name: 'Outscale (3DS)', category: 'Cloud Providers' },
      { id: 'k8s', name: 'Kubernetes', category: 'Container & DevOps' },
      { id: 'generic', name: 'Generic / Open Source', category: 'Container & DevOps' },
      { id: 'c4', name: 'C4 Model', category: 'Enterprise Architecture' },
      { id: 'uml', name: 'UML / UML2', category: 'Enterprise Architecture' },
      { id: 'archimate', name: 'ArchiMate', category: 'Enterprise Architecture' },
      { id: 'enterprise', name: 'Enterprise (TOGAF)', category: 'Enterprise Architecture' },
      { id: 'elastic', name: 'Elastic Stack', category: 'SaaS & Specialized' },
      { id: 'firebase', name: 'Firebase', category: 'SaaS & Specialized' }
    ];
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return [
      // Azure
      { id: 'm365-cmk', name: 'M365 Customer Managed Keys', style: 'azure' },
      { id: 'power-platform-cmk', name: 'Power Platform CMK', style: 'azure' },
      { id: 'azure-landing-zone', name: 'Azure Landing Zone', style: 'azure' },
      { id: 'zero-trust', name: 'Zero Trust Architecture', style: 'azure' },
      
      // AWS
      { id: 'aws-serverless', name: 'AWS Serverless', style: 'aws' },
      { id: 'aws-eks', name: 'AWS EKS Platform', style: 'aws' },
      
      // GCP
      { id: 'gcp-data-platform', name: 'GCP Data Platform', style: 'gcp' },
      
      // Kubernetes
      { id: 'k8s-microservices', name: 'Kubernetes Microservices', style: 'k8s' },
      
      // Open Source
      { id: 'oss-observability', name: 'Open Source Observability', style: 'generic' },
      { id: 'oss-cicd', name: 'Open Source CI/CD', style: 'generic' },
      { id: 'oss-secrets', name: 'Open Source Secrets Management', style: 'generic' },
      
      // Enterprise Architecture
      { id: 'c4-context', name: 'C4 Context Diagram', style: 'c4' },
      { id: 'c4-container', name: 'C4 Container Diagram', style: 'c4' },
      { id: 'uml-class', name: 'UML Class Diagram', style: 'uml' },
      { id: 'archimate-layered', name: 'ArchiMate Layered View', style: 'archimate' },
      { id: 'togaf-layers', name: 'TOGAF Architecture Layers', style: 'enterprise' },
      
      // And more...
    ];
  }

  /**
   * Clean up old diagram files
   */
  async cleanupOldFiles(maxAgeHours = 24) {
    const files = fs.readdirSync(this.outputDir);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(this.outputDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log('Cleaned up old diagram:', file);
      }
    }
  }
}

module.exports = PythonDiagramGenerator;