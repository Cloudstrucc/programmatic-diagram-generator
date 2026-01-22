#!/usr/bin/env node
/**
 * AI-Powered Diagram Generator v3.0
 * 
 * Uses Claude API to generate PlantUML diagrams from natural language descriptions.
 * Supports multiple diagram styles:
 *   - c4: C4 model diagrams (works with local Kroki)
 *   - azure: Azure icons (requires kroki.io or full PlantUML server)
 *   - aws: AWS icons (requires kroki.io or full PlantUML server)
 *   - plain: Basic PlantUML shapes (works everywhere)
 * 
 * Usage:
 *   node ai-diagram.js generate "Describe your architecture here"
 *   node ai-diagram.js generate "Azure CMK architecture" --style azure
 *   node ai-diagram.js generate "Simple flow diagram" --style plain
 *   node ai-diagram.js preview
 *   node ai-diagram.js publish --target github
 * 
 * Requires:
 *   ANTHROPIC_API_KEY in .env
 */

import fetch from 'node-fetch';
import pako from 'pako';
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
  kroki: {
    // Local Kroki for C4/plain diagrams
    localUrl: process.env.KROKI_LOCAL_URL || 'http://localhost:8000',
    // Public Kroki for Azure/AWS icons (has full stdlib)
    publicUrl: process.env.KROKI_PUBLIC_URL || 'https://kroki.io',
  },
  temp: {
    dir: path.join(__dirname, '.temp-ai-diagrams'),
    specFile: 'diagram-spec.json',
    imageFile: 'diagram-preview.png',
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
// DIAGRAM STYLES - Different prompts for different icon libraries
// =============================================================================

const DIAGRAM_STYLES = {
  /**
   * C4 Model - Works with basic Kroki, great for architecture diagrams
   */
  c4: {
    name: 'C4 Model',
    krokiUrl: 'local', // Use local Kroki
    systemPrompt: `You are an expert software architect. Generate PlantUML diagrams using C4-PlantUML notation.

You MUST respond with valid JSON in this exact format (no markdown code blocks):
{
  "name": "diagram_name_snake_case",
  "title": "Human Readable Diagram Title",
  "description": "Brief description of what the diagram shows",
  "puml": "<plantuml code here>"
}

C4-PLANTUML SYNTAX:

Include the C4 library:
!include <C4/C4_Container>
!include <C4/C4_Context>
!include <C4/C4_Component>

Available elements:
Person(alias, "Label", "Description")
System(alias, "Label", "Description")
System_Ext(alias, "Label", "Description")
Container(alias, "Label", "Technology", "Description")
ContainerDb(alias, "Label", "Technology", "Description")
Component(alias, "Label", "Technology", "Description")
System_Boundary(alias, "Label") { ... }
Enterprise_Boundary(alias, "Label") { ... }

Relationships:
Rel(from, to, "label")
Rel_Down(from, to, "label")
Rel_Up(from, to, "label")
BiRel(from, to, "label")

ALTERNATIVE - Use basic PlantUML with skinparam for colors:

skinparam backgroundColor white
skinparam rectangle {
  BackgroundColor<<boundary>> #f5f5f5
  BorderColor<<boundary>> #999999
}

rectangle "Group Name" <<boundary>> #colorcode { ... }
storage "Storage" as alias #colorcode
database "Database" as alias #colorcode
component "Component" as alias #colorcode
actor "Actor" as alias #colorcode
file "File" as alias #colorcode

Connection colors:
alias1 -[#FF0000]-> alias2 : red label
alias1 -[#0000FF,dashed]-> alias2 : blue dashed
alias1 -[#808080,dotted]-> alias2 : gray dotted

WORKING EXAMPLE:
{
  "name": "cmk_architecture",
  "title": "Customer Managed Keys Architecture",
  "description": "CMK architecture with Key Vault",
  "puml": "@startuml CMK_Architecture
!include <C4/C4_Container>

title Customer Managed Keys Architecture

Person(admin, \\"Security Admin\\", \\"Manages encryption keys\\")

System_Boundary(azure, \\"Azure\\") {
  Container(kv, \\"Key Vault\\", \\"HSM\\", \\"Stores CMK keys\\")
  ContainerDb(storage, \\"Storage\\", \\"Blob\\", \\"Encrypted data\\")
  Container(app, \\"App Service\\", \\"Web App\\", \\"Application\\")
}

Rel(admin, kv, \\"Manages keys\\")
Rel(app, kv, \\"Get encryption key\\")
Rel(app, storage, \\"Read/write data\\")
Rel(storage, kv, \\"Decrypt with CMK\\")

@enduml"
}

Generate professional C4 architecture diagrams.`,
  },

  /**
   * Azure Icons - Requires kroki.io (public) for full stdlib
   */
  azure: {
    name: 'Azure Icons',
    krokiUrl: 'public', // Use public kroki.io
    systemPrompt: `You are an expert Azure architect. Generate PlantUML diagrams using Azure icons from the PlantUML stdlib.

You MUST respond with valid JSON in this exact format (no markdown code blocks):
{
  "name": "diagram_name_snake_case",
  "title": "Human Readable Diagram Title", 
  "description": "Brief description of what the diagram shows",
  "puml": "<plantuml code here>"
}

AZURE ICONS - Use stdlib syntax with angle brackets:

!include <azure/AzureCommon>
!include <azure/Security/KeyVault>
!include <azure/Identity/AzureActiveDirectory>
!include <azure/Identity/ManagedIdentity>
!include <azure/Management/LogAnalyticsWorkspaces>
!include <azure/DevOps/AzureDevOps>
!include <azure/DevOps/AzurePipelines>
!include <azure/Compute/FunctionApps>
!include <azure/Storage/StorageAccounts>
!include <azure/Storage/BlobStorage>
!include <azure/Databases/AzureCosmosDb>
!include <azure/Databases/SQLDatabase>
!include <azure/Integration/LogicApps>
!include <azure/Security/AzureSentinel>
!include <azure/Web/AppServices>

MACRO SYNTAX (use the icon name as the macro):
KeyVault(alias, "Label", "Description")
AzureActiveDirectory(alias, "Label", "Description")
ManagedIdentity(alias, "Label", "Description") 
StorageAccounts(alias, "Label", "Description")
BlobStorage(alias, "Label", "Description")
FunctionApps(alias, "Label", "Description")
AppServices(alias, "Label", "Description")
SQLDatabase(alias, "Label", "Description")
AzureCosmosDb(alias, "Label", "Description")
AzureSentinel(alias, "Label", "Description")
LogAnalyticsWorkspaces(alias, "Label", "Description")

CONNECTIONS:
alias1 --> alias2 : label
alias1 -[#FF0000]-> alias2 : red (encryption)
alias1 -[#0000FF]-> alias2 : blue (data flow)
alias1 -[#00FF00]-> alias2 : green (success)
alias1 -[#800080,dashed]-> alias2 : purple dashed (auth)

GROUPING:
rectangle "Group Name" {
  KeyVault(kv, "Key Vault", "Stores keys")
}

NOTES:
note right of alias : Single line note
note right of alias
  Multi-line note
  Second line
end note

WORKING EXAMPLE:
{
  "name": "azure_cmk",
  "title": "Azure CMK Architecture",
  "description": "Customer managed keys with Key Vault",
  "puml": "@startuml
!include <azure/AzureCommon>
!include <azure/Security/KeyVault>
!include <azure/Identity/AzureActiveDirectory>
!include <azure/Web/AppServices>

title Azure CMK Architecture

AzureActiveDirectory(aad, \\"Entra ID\\", \\"Identity\\")
KeyVault(kv, \\"Key Vault\\", \\"CMK Storage\\")
AppServices(app, \\"App Service\\", \\"Web App\\")

aad --> kv : RBAC
app --> kv : get keys

@enduml"
}

Generate professional Azure architecture diagrams. Only include icons you actually use.`,
  },

  /**
   * AWS Icons - Requires kroki.io (public) for full stdlib
   */
  aws: {
    name: 'AWS Icons',
    krokiUrl: 'public',
    systemPrompt: `You are an expert AWS architect. Generate PlantUML diagrams using AWS icons from the PlantUML stdlib.

You MUST respond with valid JSON in this exact format (no markdown code blocks):
{
  "name": "diagram_name_snake_case",
  "title": "Human Readable Diagram Title",
  "description": "Brief description of what the diagram shows",
  "puml": "<plantuml code here>"
}

AWS ICONS - Use stdlib syntax:

!include <awslib/AWSCommon>
!include <awslib/SecurityIdentityCompliance/KeyManagementService>
!include <awslib/SecurityIdentityCompliance/IAMIdentityCenter>
!include <awslib/Database/RDS>
!include <awslib/Database/DynamoDB>
!include <awslib/Compute/Lambda>
!include <awslib/Compute/EC2>
!include <awslib/Storage/SimpleStorageService>
!include <awslib/Storage/ElasticBlockStore>
!include <awslib/Containers/ElasticKubernetesService>
!include <awslib/NetworkingContentDelivery/VPC>
!include <awslib/NetworkingContentDelivery/CloudFront>
!include <awslib/ApplicationIntegration/APIGateway>

MACRO SYNTAX:
KeyManagementService(alias, "Label", "Description")
IAMIdentityCenter(alias, "Label", "Description")
RDS(alias, "Label", "Description")
DynamoDB(alias, "Label", "Description")
Lambda(alias, "Label", "Description")
EC2(alias, "Label", "Description")
SimpleStorageService(alias, "Label", "Description")
ElasticKubernetesService(alias, "Label", "Description")
VPC(alias, "Label", "Description")
CloudFront(alias, "Label", "Description")
APIGateway(alias, "Label", "Description")

Generate professional AWS architecture diagrams.`,
  },

  /**
   * Plain PlantUML - Works everywhere, no external dependencies
   */
  plain: {
    name: 'Plain PlantUML',
    krokiUrl: 'local',
    systemPrompt: `You are an expert software architect. Generate clean PlantUML diagrams using basic shapes and colors.

You MUST respond with valid JSON in this exact format (no markdown code blocks):
{
  "name": "diagram_name_snake_case",
  "title": "Human Readable Diagram Title",
  "description": "Brief description of what the diagram shows",
  "puml": "<plantuml code here>"
}

BASIC PLANTUML ELEMENTS:

Shapes:
rectangle "Name" as alias #colorcode
database "Name" as alias #colorcode
storage "Name" as alias #colorcode
component "Name" as alias #colorcode
actor "Name" as alias #colorcode
file "Name" as alias #colorcode
folder "Name" as alias #colorcode
cloud "Name" as alias #colorcode
queue "Name" as alias #colorcode
node "Name" as alias #colorcode

Grouping:
rectangle "Group" #lightgray {
  component "Inside" as c1
}

package "Package" {
  component "Inside" as c2
}

Colors (use hex or names):
#FF6B6B - red
#4ECDC4 - teal
#45B7D1 - blue
#96CEB4 - green
#FFEAA7 - yellow
#DDA0DD - purple
#f5f5f5 - light gray

Connections:
alias1 --> alias2 : label
alias1 -[#FF0000]-> alias2 : red arrow
alias1 -[#0000FF,dashed]-> alias2 : blue dashed
alias1 -[#00FF00,bold]-> alias2 : green bold
alias1 ..> alias2 : dotted

Direction:
left to right direction
top to bottom direction

Styling:
skinparam backgroundColor white
skinparam defaultFontName Arial
skinparam rectangleBorderColor #666666

WORKING EXAMPLE:
{
  "name": "simple_architecture",
  "title": "Simple Architecture",
  "description": "Basic architecture diagram",
  "puml": "@startuml
skinparam backgroundColor white
left to right direction

actor \\"User\\" as user #96CEB4
rectangle \\"Web App\\" as webapp #45B7D1
database \\"Database\\" as db #FFEAA7
storage \\"File Storage\\" as storage #DDA0DD

user --> webapp : requests
webapp --> db : queries
webapp --> storage : files

@enduml"
}

Generate clean, professional diagrams using basic PlantUML shapes with good color choices.`,
  },
};

// =============================================================================
// JSON PARSING HELPER
// =============================================================================

/**
 * Parse Claude's JSON response, handling raw newlines in the puml field
 */
function parseClaudeJsonResponse(responseText) {
  let jsonStr = responseText.trim();
  
  // Strip markdown code blocks if present
  jsonStr = jsonStr
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  
  // Extract JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  
  jsonStr = jsonMatch[0];
  
  // First, try parsing as-is
  try {
    const result = JSON.parse(jsonStr);
    if (result.puml) {
      result.puml = result.puml
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"');
    }
    return result;
  } catch (e) {
    // Continue with fixing
  }
  
  // Find "puml": " pattern and fix raw newlines
  const pumlMatch = jsonStr.match(/"puml"\s*:\s*"/);
  if (!pumlMatch) {
    throw new Error('No "puml" field found in response');
  }
  
  const pumlKeyEnd = pumlMatch.index + pumlMatch[0].length;
  const beforePuml = jsonStr.slice(0, pumlKeyEnd);
  const afterPumlStart = jsonStr.slice(pumlKeyEnd);
  
  // Find closing quote
  let pumlEndIndex = -1;
  let i = 0;
  let escaped = false;
  
  while (i < afterPumlStart.length) {
    const char = afterPumlStart[i];
    
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
      const remaining = afterPumlStart.slice(i + 1).trimStart();
      if (remaining.length === 0 || remaining[0] === '}' || remaining[0] === ',') {
        pumlEndIndex = i;
        break;
      }
    }
    
    i++;
  }
  
  if (pumlEndIndex === -1) {
    throw new Error('Could not find end of puml string in JSON');
  }
  
  const pumlContent = afterPumlStart.slice(0, pumlEndIndex);
  const afterPuml = afterPumlStart.slice(pumlEndIndex);
  
  // Escape for valid JSON
  const escapedPuml = pumlContent
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  
  const fixedJson = beforePuml + escapedPuml + afterPuml;
  
  const result = JSON.parse(fixedJson);
  
  if (result.puml) {
    result.puml = result.puml
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"');
  }
  
  return result;
}

// =============================================================================
// CLAUDE API - DIAGRAM GENERATION
// =============================================================================

/**
 * Generate diagram specification using Claude API
 */
async function generateDiagramWithClaude(description, style, options = {}) {
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

  console.log(`\n🤖 Calling Claude API (${config.anthropic.model})...`);
  console.log(`   Style: ${styleConfig.name}`);
  console.log(`   Description: "${description}"\n`);

  const message = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Generate a PlantUML architecture diagram for the following:

${description}

Remember to respond with ONLY valid JSON containing name, title, description, and puml fields.`,
      },
    ],
    system: styleConfig.systemPrompt,
  });

  // Extract text content from response
  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  // Parse JSON from response
  let diagramSpec;
  try {
    diagramSpec = parseClaudeJsonResponse(responseText);
  } catch (parseError) {
    console.error('Failed to parse Claude response as JSON:');
    console.error('─'.repeat(60));
    console.error(responseText);
    console.error('─'.repeat(60));
    throw new Error(`Invalid JSON response from Claude: ${parseError.message}`);
  }

  // Validate required fields
  if (!diagramSpec.name || !diagramSpec.title || !diagramSpec.puml) {
    throw new Error('Missing required fields in diagram specification');
  }

  // Ensure puml starts with @startuml and ends with @enduml
  let puml = diagramSpec.puml.trim();
  if (!puml.startsWith('@startuml')) {
    puml = '@startuml\n' + puml;
  }
  if (!puml.endsWith('@enduml')) {
    puml = puml + '\n@enduml';
  }
  diagramSpec.puml = puml;
  
  // Store the style for later use
  diagramSpec.style = style;

  // Debug output
  if (options.verbose) {
    console.log('\n📝 Generated PlantUML:');
    console.log('─'.repeat(60));
    console.log(diagramSpec.puml);
    console.log('─'.repeat(60));
  }

  return diagramSpec;
}

// =============================================================================
// KROKI API - DIAGRAM RENDERING
// =============================================================================

/**
 * Encode PlantUML for Kroki API
 */
function encodePlantUML(puml) {
  const data = Buffer.from(puml, 'utf8');
  const compressed = pako.deflate(data, { level: 9 });
  return Buffer.from(compressed)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Get Kroki URL based on diagram style
 */
function getKrokiUrl(style) {
  const styleConfig = DIAGRAM_STYLES[style];
  if (styleConfig && styleConfig.krokiUrl === 'public') {
    return config.kroki.publicUrl;
  }
  return config.kroki.localUrl;
}

/**
 * Render diagram via Kroki API
 */
async function renderDiagram(puml, style, verbose = false) {
  const encoded = encodePlantUML(puml);
  const krokiUrl = getKrokiUrl(style);
  const url = `${krokiUrl}/plantuml/png/${encoded}`;

  if (verbose) {
    console.log(`\n🔗 Using Kroki at: ${krokiUrl}`);
    console.log(`   URL length: ${url.length} chars`);
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('\n❌ Kroki Error Details:');
    console.error('─'.repeat(60));
    console.error(errorText);
    console.error('─'.repeat(60));
    console.error('\n📝 PlantUML that caused the error:');
    console.error('─'.repeat(60));
    console.error(puml);
    console.error('─'.repeat(60));
    
    // Helpful hint for Azure/AWS styles
    if (style === 'azure' || style === 'aws') {
      console.error('\n💡 Hint: Azure/AWS icons require the public kroki.io service.');
      console.error('   Make sure you have internet access or try --style c4 or --style plain');
    }
    
    throw new Error(`Kroki API error: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
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

function saveTempImage(buffer) {
  ensureTempDir();
  const imagePath = path.join(config.temp.dir, config.temp.imageFile);
  fs.writeFileSync(imagePath, buffer);
  return imagePath;
}

function loadTempSpec() {
  const specPath = path.join(config.temp.dir, config.temp.specFile);
  if (!fs.existsSync(specPath)) {
    throw new Error('No diagram found in temp. Run "generate" command first.');
  }
  return JSON.parse(fs.readFileSync(specPath, 'utf8'));
}

function loadTempImage() {
  const imagePath = path.join(config.temp.dir, config.temp.imageFile);
  if (!fs.existsSync(imagePath)) {
    throw new Error('No diagram image found in temp. Run "generate" command first.');
  }
  return fs.readFileSync(imagePath);
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
  console.log('║         AI Diagram Generator v3.0 - Generate               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const style = options.style || 'c4';
  
  console.log(`\n📊 Diagram Style: ${DIAGRAM_STYLES[style]?.name || style}`);
  console.log(`   Kroki: ${getKrokiUrl(style)}`);

  try {
    // Generate diagram spec with Claude
    const spec = await generateDiagramWithClaude(description, style, options);

    console.log('📋 Generated Specification:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Description: ${spec.description}`);

    // Render diagram with Kroki
    console.log('\n🎨 Rendering diagram with Kroki...');
    const imageBuffer = await renderDiagram(spec.puml, style, options.verbose);

    // Save to temp
    const specPath = saveTempSpec(spec);
    const imagePath = saveTempImage(imageBuffer);

    console.log('\n✓ Diagram generated successfully!');
    console.log('');
    console.log('📁 Temp files:');
    console.log(`   Spec: ${specPath}`);
    console.log(`   Image: ${imagePath}`);
    console.log('');
    console.log('👀 Preview the diagram:');
    console.log(`   open "${imagePath}"`);
    console.log('');
    console.log('📤 When ready to publish:');
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
  console.log('║         AI Diagram Generator v3.0 - Preview                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();

    console.log('\n📋 Current Diagram:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Style: ${spec.style || 'unknown'}`);
    console.log(`   Description: ${spec.description}`);

    const imagePath = path.join(config.temp.dir, config.temp.imageFile);
    console.log(`\n📁 Image: ${imagePath}`);

    if (options.puml) {
      console.log('\n📝 PlantUML Source:');
      console.log('─'.repeat(60));
      console.log(spec.puml);
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
  console.log('║         AI Diagram Generator v3.0 - Regenerate             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const spec = loadTempSpec();
    const style = spec.style || 'c4';

    console.log('\n📋 Regenerating diagram:');
    console.log(`   Name: ${spec.name}`);
    console.log(`   Title: ${spec.title}`);
    console.log(`   Style: ${style}`);

    console.log('\n🎨 Rendering diagram with Kroki...');
    const imageBuffer = await renderDiagram(spec.puml, style, options.verbose);

    const imagePath = saveTempImage(imageBuffer);

    console.log('\n✓ Diagram regenerated successfully!');
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
  console.log('║         AI Diagram Generator v3.0 - Publish                ║');
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

    console.log('\n✓ Published successfully!');
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
  console.log('║         AI Diagram Generator v3.0 - Available Styles       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  for (const [key, style] of Object.entries(DIAGRAM_STYLES)) {
    const krokiType = style.krokiUrl === 'public' ? 'kroki.io (public)' : 'localhost (local)';
    console.log(`  ${key.padEnd(10)} - ${style.name.padEnd(20)} [${krokiType}]`);
  }
  
  console.log('');
  console.log('Usage:');
  console.log('  node ai-diagram.js generate "description" --style c4');
  console.log('  node ai-diagram.js generate "description" --style azure');
  console.log('  node ai-diagram.js generate "description" --style aws');
  console.log('  node ai-diagram.js generate "description" --style plain');
  console.log('');
}

async function commandClean() {
  console.log('');
  console.log('🧹 Cleaning temp files...');
  cleanTemp();
  console.log('✓ Done');
}

// =============================================================================
// MAIN
// =============================================================================

program
  .name('ai-diagram')
  .description('AI-powered architecture diagram generator using Claude')
  .version('3.0.0');

program
  .command('generate <description>')
  .description('Generate a diagram from a natural language description')
  .option('-s, --style <style>', 'Diagram style: c4, azure, aws, plain', 'c4')
  .option('-o, --open', 'Open the generated image automatically')
  .option('-v, --verbose', 'Show detailed output')
  .action(commandGenerate);

program
  .command('preview')
  .description('Preview the current diagram in temp')
  .option('-o, --open', 'Open the image automatically')
  .option('-p, --puml', 'Show PlantUML source code')
  .action(commandPreview);

program
  .command('regenerate')
  .description('Regenerate image from modified spec (after manual edits)')
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
  .command('styles')
  .description('List available diagram styles')
  .action(commandStyles);

program
  .command('clean')
  .description('Remove temp files')
  .action(commandClean);

program.parse(process.argv);