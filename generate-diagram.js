#!/usr/bin/env node
/**
 * Azure Architecture Diagram Generator v2.1
 * 
 * Generates architecture diagrams using Kroki API and publishes to:
 * - Local filesystem
 * - GitHub repository
 * - Azure DevOps Git repository
 * 
 * Usage:
 *   node generate-diagram.js [options]
 * 
 * Options:
 *   --target <target>    Output target: local, github, devops, all (default: local)
 *   --diagrams <list>    Comma-separated diagram names or 'all' (default: all)
 *   --dry-run            Generate but don't push to remote
 *   --verbose            Show detailed output
 */

import fetch from 'node-fetch';
import pako from 'pako';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { simpleGit } from 'simple-git';
import { program } from 'commander';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  kroki: {
    // Default to localhost if running Docker, otherwise use hosted
    url: process.env.KROKI_URL || 'https://kroki.io',
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
// DIAGRAM DEFINITIONS - Using C4-PlantUML (bundled with Kroki)
// =============================================================================

const diagrams = {
  /**
   * CMK Complete Architecture - M365 + Power Platform
   */
  cmk: {
    name: 'cmk_architecture',
    title: 'M365 & Power Platform - Customer Managed Keys',
    puml: `@startuml CMK_Architecture
!include <C4/C4_Container>

title M365 & Power Platform - Customer Managed Keys (CMK)\\nComplete Encryption Architecture

skinparam backgroundColor white
skinparam handwritten false

rectangle "Azure Key Vault\\n(Canada Central)" as kv_region <<boundary>> #ffebee {
  
  rectangle "Root Keys" as root_section {
    storage "Customer Root Key\\n(RSA 4096)\\nHSM-Protected" as root_key #ff8a80
    storage "Power Platform\\nRoot Key\\nHSM-Protected" as root_key_pp #ff8a80
  }
  
  rectangle "M365 DEP Keys" as m365_keys {
    storage "DEP Key\\nSharePoint" as dep_spo #ffcdd2
    storage "DEP Key\\nExchange" as dep_exo #ffcdd2
    storage "DEP Key\\nTeams" as dep_teams #ffcdd2
  }
  
  rectangle "Power Platform Keys" as pp_keys {
    storage "Dataverse\\nEncryption Key" as dep_dataverse #ffcdd2
    storage "Copilot Studio\\nKey" as dep_copilot #ffcdd2
  }
}

rectangle "DR Key Vault\\n(Canada East)" as kv_dr_region <<boundary>> #fff8e1 {
  storage "Geo-Replica\\nKey Vault" as kv_dr #ffe082
}

rectangle "Microsoft 365 Workloads" as m365_region <<boundary>> #e3f2fd {
  
  rectangle "SharePoint Online" as spo_section {
    database "SPO Sites &\\nDocument Libraries" as spo #90caf9
    file "Office Files\\n(Word, Excel, PPT)" as spo_office #bbdefb
    file "PDF Files" as spo_pdf #bbdefb
  }
  
  rectangle "Exchange Online" as exo_section {
    database "Mailboxes &\\nAttachments" as exo #90caf9
  }
  
  rectangle "Teams" as teams_section {
    database "Chats, Channels,\\nRecordings" as teams #90caf9
  }
  
  rectangle "OneDrive" as odb_section {
    database "OneDrive Files" as odb #90caf9
  }
}

rectangle "Power Platform\\n(Protected B Environment)" as pp_region <<boundary>> #e8f5e9 {
  
  rectangle "Dataverse" as dv_section {
    database "Dataverse Tables" as dataverse #a5d6a7
    database "File & Image\\nColumns" as dv_files #c8e6c9
  }
  
  rectangle "Power Apps" as pa_section {
    component "Canvas &\\nModel Apps" as powerapps #a5d6a7
  }
  
  rectangle "Power Automate" as flow_section {
    component "Cloud Flows" as powerauto #a5d6a7
  }
  
  rectangle "Power Pages" as pages_section {
    component "Portal Sites &\\nDocuments" as powerpages #a5d6a7
  }
}

rectangle "Identity & RBAC" as identity_region <<boundary>> #f3e5f5 {
  actor "Entra ID" as entra #ce93d8
  component "M365 Service\\nPrincipal" as mi_m365 #e1bee7
  component "Power Platform\\nService Principal" as mi_pp #e1bee7
}

rectangle "Monitoring & Automation" as monitoring_region <<boundary>> #fff3e0 {
  component "DevOps\\nPipelines" as devops #ffcc80
  database "Log Analytics" as law #ffe0b2
  component "Key Rotation\\nAutomation" as rotation #ffcc80
}

' Key Wrapping
root_key -[#red,bold]-> dep_spo : wraps
root_key -[#red,bold]-> dep_exo : wraps
root_key -[#red,bold]-> dep_teams : wraps
root_key_pp -[#red,bold]-> dep_dataverse : wraps
root_key_pp -[#red,bold]-> dep_copilot : wraps

' DR Replication
root_key -[#orange,dashed]-> kv_dr : geo-replicate
root_key_pp -[#orange,dashed]-> kv_dr

' M365 Encryption
dep_spo -[#blue]-> spo : encrypts
dep_spo -[#blue,dashed]-> odb : encrypts
dep_exo -[#blue]-> exo : encrypts
dep_teams -[#blue]-> teams : encrypts

' Power Platform Encryption
dep_dataverse -[#green]-> dataverse : encrypts
dep_dataverse -[#green,dashed]-> dv_files
dep_dataverse -[#green,dashed]-> powerapps
dep_dataverse -[#green,dashed]-> powerauto
dep_dataverse -[#green,dashed]-> powerpages

' Identity
entra --> mi_m365
entra --> mi_pp
mi_m365 -[#purple,dashed]-> root_key : RBAC
mi_pp -[#purple,dashed]-> root_key_pp : RBAC

' Monitoring
devops -[#gray]-> dep_spo : deploy
rotation -[#orange]-> root_key : rotate
root_key -[#gray,dotted]-> law : audit logs

@enduml`
  },

  /**
   * M365 Security Architecture
   */
  m365: {
    name: 'm365_security',
    title: 'LCE M365 Security Architecture',
    puml: `@startuml M365_Security
!include <C4/C4_Container>

title LCE M365 Security Architecture\\nProtected B / NATO Classification

skinparam backgroundColor white

rectangle "Azure DevOps (LCE)" as devops_region <<boundary>> #e8f5e9 {
  component "LCE DevOps Org" as devops #a5d6a7
  component "Automation\\nPipelines" as pipelines #a5d6a7
  file "PowerShell\\nModules" as ps_modules #c8e6c9
  
  devops --> pipelines
  pipelines --> ps_modules
}

rectangle "Identity & Zero Trust" as identity_region <<boundary>> #fce4ec {
  actor "Entra ID" as entra #f48fb1
  component "Managed\\nIdentities" as mi #f8bbd9
  
  rectangle "Conditional Access" as ca_section {
    component "Protected B\\nPolicy" as ca_pb #f8bbd9
    component "NATO Policy" as ca_nato #f8bbd9
  }
  
  entra --> mi
  entra --> ca_section
}

rectangle "Customer Managed Keys" as cmk_region <<boundary>> #ffebee {
  storage "Key Vault\\nPrimary" as kv_primary #ff8a80
  storage "Key Vault\\nDR" as kv_dr #ffab91
  
  kv_primary -[#orange,dashed]-> kv_dr : geo-replicate
}

rectangle "Microsoft 365\\n(Protected B Tenant)" as m365_region <<boundary>> #fff3e0 {
  
  rectangle "M365 Core" as m365_core {
    component "Teams Premium" as teams #ffcc80
    component "SharePoint\\nOnline" as spo #ffcc80
    component "Exchange\\nOnline" as exo #ffcc80
  }
  
  rectangle "Microsoft Purview" as purview {
    component "Sensitivity\\nLabels" as labels #ffe0b2
    component "DLP Policies" as dlp #ffe0b2
    component "Audit Logs" as audit #ffe0b2
  }
}

rectangle "Azure Infrastructure\\n(GC Region)" as azure_region <<boundary>> #e0f7fa {
  component "Hub VNet" as vnet #80deea
  component "Azure\\nFirewall" as fw #80deea
  component "Compliance\\nFunctions" as func #4dd0e1
  database "Audit Log\\nStorage" as storage #80deea
  
  vnet --> fw
  func --> storage
}

rectangle "Security Operations Center" as soc_region <<boundary>> #f3e5f5 {
  component "Microsoft\\nSentinel" as sentinel #ce93d8
  database "Log Analytics" as law #e1bee7
  component "Alert\\nPlaybooks" as alerts #ce93d8
  
  law --> sentinel
  sentinel --> alerts
}

' Connections
pipelines -[#blue]-> func : deploy
mi -[#purple,dashed]-> kv_primary : RBAC
kv_primary -[#red,bold]-> teams : CMK
kv_primary -[#red,bold]-> spo : CMK
kv_primary -[#red,bold]-> exo : CMK
audit -[#orange]-> law : stream
func -[#gray,dotted]-> law : metrics
alerts -[#red]-> teams : notify

@enduml`
  },

  /**
   * Teams Premium Security
   */
  teams: {
    name: 'teams_premium_security',
    title: 'Teams Premium - Protected B / NATO Meeting Security',
    puml: `@startuml Teams_Premium
!include <C4/C4_Container>

title Teams Premium - Protected B / NATO Meeting Security

skinparam backgroundColor white

rectangle "Meeting Participants" as users_region <<boundary>> #e3f2fd {
  actor "Protected B\\nCleared" as user_pb #90caf9
  actor "NATO\\nCleared" as user_nato #90caf9
  actor "External\\nGuests" as user_ext #bbdefb
}

rectangle "Identity & Conditional Access" as identity_region <<boundary>> #fce4ec {
  actor "Entra ID" as entra #f48fb1
  
  rectangle "Conditional Access Policies" as ca_policies {
    component "Protected B\\nPolicy" as ca_pb #f8bbd9
    component "NATO Policy" as ca_nato #f8bbd9
    component "Guest Policy" as ca_guest #f8bbd9
  }
  
  entra --> ca_policies
}

rectangle "Microsoft Purview\\nSensitivity Labels" as labels_region <<boundary>> #fff3e0 {
  
  rectangle "Meeting Labels" as meeting_labels {
    component "Unclassified" as label_unc #fff9c4
    component "Protected B" as label_pb #ffcc80
    component "NATO\\nRESTRICTED" as label_nato_r #ffab91
    component "NATO\\nSECRET" as label_nato_s #ff8a65
  }
  
  rectangle "Label Enforcements" as enforcements {
    component "Watermarking" as enf_water #ffe0b2
    component "Recording\\nRestrictions" as enf_record #ffe0b2
    component "Copy/Paste\\nControls" as enf_copy #ffe0b2
    component "E2E Encryption" as enf_e2e #ffe0b2
    component "Lobby Controls" as enf_lobby #ffe0b2
  }
  
  label_pb --> enf_water
  label_pb --> enf_record
  label_nato_r --> enf_copy
  label_nato_r --> enf_lobby
  label_nato_s --> enf_e2e
}

rectangle "Teams Premium Features" as teams_region <<boundary>> #e8f5e9 {
  component "Teams Premium\\nMeetings" as teams #a5d6a7
  
  rectangle "Meeting Protection" as protection {
    component "Dynamic\\nWatermarks" as feat_water #c8e6c9
    component "End-to-End\\nEncryption" as feat_e2e #c8e6c9
    component "Presenter\\nControls" as feat_present #c8e6c9
    component "Advanced\\nLobby" as feat_lobby #c8e6c9
  }
  
  teams --> protection
}

rectangle "Customer Managed Keys" as cmk_region <<boundary>> #ffebee {
  storage "Key Vault\\n(HSM)" as kv #ff8a80
  storage "Teams DEP\\nKey" as dep_teams #ffcdd2
  
  kv -[#red,bold]-> dep_teams : wraps
}

rectangle "Compliance & Recording" as compliance_region <<boundary>> #f3e5f5 {
  database "Meeting\\nRecordings" as recordings #ce93d8
  database "Transcripts" as transcripts #ce93d8
  component "7-Year\\nRetention" as retention #e1bee7
  
  recordings --> retention
  transcripts --> retention
}

rectangle "Security Operations" as soc_region <<boundary>> #e0f7fa {
  database "Log Analytics" as law #80deea
  component "Sentinel" as sentinel #4dd0e1
  
  law --> sentinel
}

' User Authentication
user_pb -[#green]-> ca_pb : MFA + Device
user_nato -[#green]-> ca_nato : MFA + CAC
user_ext -[#orange]-> ca_guest : Guest Approval

ca_pb -[#blue]-> teams
ca_nato -[#blue]-> teams
ca_guest -[#orange,dashed]-> teams : limited

' Labels
label_pb -[#purple]-> teams : auto-apply
label_nato_r -[#purple]-> teams : manual

' Encryption
dep_teams -[#red,bold]-> teams : encrypts
dep_teams -[#red,bold]-> recordings : encrypts

' Monitoring
teams -[#gray,dotted]-> law : audit

@enduml`
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Encode PlantUML diagram for Kroki API (deflate + base64)
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
 * Generate diagram via Kroki API
 */
async function generateDiagramImage(puml, verbose = false) {
  const encoded = encodePlantUML(puml);
  const url = `${config.kroki.url}/plantuml/png/${encoded}`;
  
  if (verbose) {
    console.log(`  Calling Kroki API at ${config.kroki.url}...`);
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kroki API error: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Log with timestamp
 */
function log(message, verbose = true) {
  if (verbose) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] ${message}`);
  }
}

// =============================================================================
// OUTPUT TARGETS
// =============================================================================

/**
 * Save diagrams to local filesystem
 */
async function saveToLocal(generatedDiagrams, options) {
  const outputDir = config.local.outputDir;
  
  log(`Saving to local: ${outputDir}`, options.verbose);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const urls = {};
  
  for (const [name, data] of Object.entries(generatedDiagrams)) {
    const filePath = path.join(outputDir, `${name}.png`);
    fs.writeFileSync(filePath, data.buffer);
    urls[name] = path.resolve(filePath);
    log(`  ✓ ${name}.png`, options.verbose);
  }
  
  return urls;
}

/**
 * Push diagrams to GitHub repository
 */
async function pushToGitHub(generatedDiagrams, options) {
  const { token, owner, repo, branch, folder, userName, userEmail } = config.github;
  
  if (!token || !owner) {
    throw new Error('GitHub configuration missing. Set GITHUB_TOKEN and GITHUB_OWNER in .env');
  }
  
  log(`Pushing to GitHub: ${owner}/${repo}/${folder}`, options.verbose);
  
  const tempDir = path.join(__dirname, '.temp-github');
  const repoUrl = `https://${token}@github.com/${owner}/${repo}.git`;
  
  try {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    const git = simpleGit(tempDir);
    
    // Clone repository
    log(`  Cloning repository...`, options.verbose);
    await git.clone(repoUrl, tempDir, ['--depth', '1', '--branch', branch]);
    
    // Configure git user
    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);
    
    // Create images folder if it doesn't exist
    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Write diagram files
    const urls = {};
    for (const [name, data] of Object.entries(generatedDiagrams)) {
      const filePath = path.join(imagesDir, `${name}.png`);
      fs.writeFileSync(filePath, data.buffer);
      
      // GitHub raw URL
      urls[name] = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${folder}/${name}.png`;
      log(`  ✓ ${name}.png`, options.verbose);
    }
    
    if (options.dryRun) {
      log(`  [DRY RUN] Would commit and push changes`, options.verbose);
    } else {
      // Stage, commit, and push
      await git.add('.');
      
      const status = await git.status();
      if (status.files.length > 0) {
        const timestamp = new Date().toISOString();
        await git.commit(`${config.commitMessage} [${timestamp}]`);
        await git.push('origin', branch);
        log(`  ✓ Pushed to GitHub`, options.verbose);
      } else {
        log(`  No changes to commit`, options.verbose);
      }
    }
    
    return urls;
    
  } finally {
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  }
}

/**
 * Push diagrams to Azure DevOps Git repository
 */
async function pushToAzureDevOps(generatedDiagrams, options) {
  const { token, org, project, repo, branch, folder, userName, userEmail } = config.devops;
  
  if (!token || !org || !project) {
    throw new Error('Azure DevOps configuration missing. Set AZDO_TOKEN, AZDO_ORG, and AZDO_PROJECT in .env');
  }
  
  log(`Pushing to Azure DevOps: ${org}/${project}/${repo}/${folder}`, options.verbose);
  
  const tempDir = path.join(__dirname, '.temp-devops');
  
  // Azure DevOps Git URL format with PAT
  const repoUrl = `https://${token}@dev.azure.com/${org}/${project}/_git/${repo}`;
  
  try {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    const git = simpleGit(tempDir);
    
    // Clone repository
    log(`  Cloning repository...`, options.verbose);
    await git.clone(repoUrl, tempDir, ['--depth', '1', '--branch', branch]);
    
    // Configure git user
    await git.addConfig('user.name', userName);
    await git.addConfig('user.email', userEmail);
    
    // Create images folder if it doesn't exist
    const imagesDir = path.join(tempDir, folder);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Write diagram files
    const urls = {};
    for (const [name, data] of Object.entries(generatedDiagrams)) {
      const filePath = path.join(imagesDir, `${name}.png`);
      fs.writeFileSync(filePath, data.buffer);
      
      // Azure DevOps raw URL
      urls[name] = `https://dev.azure.com/${org}/${project}/_git/${repo}?path=/${folder}/${name}.png&version=GB${branch}`;
      log(`  ✓ ${name}.png`, options.verbose);
    }
    
    if (options.dryRun) {
      log(`  [DRY RUN] Would commit and push changes`, options.verbose);
    } else {
      // Stage, commit, and push
      await git.add('.');
      
      const status = await git.status();
      if (status.files.length > 0) {
        const timestamp = new Date().toISOString();
        await git.commit(`${config.commitMessage} [${timestamp}]`);
        await git.push('origin', branch);
        log(`  ✓ Pushed to Azure DevOps`, options.verbose);
      } else {
        log(`  No changes to commit`, options.verbose);
      }
    }
    
    return urls;
    
  } finally {
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  program
    .name('generate-diagram')
    .description('Generate Azure architecture diagrams and publish to repositories')
    .option('-t, --target <target>', 'Output target: local, github, devops, all', 'local')
    .option('-d, --diagrams <list>', 'Comma-separated diagram names or "all"', 'all')
    .option('--dry-run', 'Generate but do not push to remote repositories')
    .option('-v, --verbose', 'Show detailed output')
    .parse(process.argv);
  
  const options = program.opts();
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       Azure Architecture Diagram Generator v2.1            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Using Kroki at: ${config.kroki.url}`);
  console.log('');
  
  // Determine which diagrams to generate
  const diagramList = options.diagrams === 'all' 
    ? Object.keys(diagrams) 
    : options.diagrams.split(',').map(d => d.trim());
  
  // Validate diagram names
  for (const name of diagramList) {
    if (!diagrams[name]) {
      console.error(`Unknown diagram: ${name}`);
      console.log(`Available diagrams: ${Object.keys(diagrams).join(', ')}`);
      process.exit(1);
    }
  }
  
  // Generate all diagrams
  log(`Generating ${diagramList.length} diagram(s)...`, true);
  const generatedDiagrams = {};
  
  for (const name of diagramList) {
    const diagram = diagrams[name];
    log(`  Generating: ${diagram.title}`, options.verbose);
    
    try {
      const buffer = await generateDiagramImage(diagram.puml, options.verbose);
      generatedDiagrams[diagram.name] = {
        buffer,
        title: diagram.title,
      };
      log(`  ✓ ${diagram.name}`, true);
    } catch (error) {
      console.error(`  ✗ Failed to generate ${name}: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
  
  console.log('');
  
  // Determine targets
  const targets = options.target === 'all' 
    ? ['local', 'github', 'devops'] 
    : [options.target];
  
  // Output to each target
  const results = {};
  
  for (const target of targets) {
    try {
      switch (target) {
        case 'local':
          results.local = await saveToLocal(generatedDiagrams, options);
          break;
        case 'github':
          results.github = await pushToGitHub(generatedDiagrams, options);
          break;
        case 'devops':
          results.devops = await pushToAzureDevOps(generatedDiagrams, options);
          break;
        default:
          console.error(`Unknown target: ${target}`);
          process.exit(1);
      }
    } catch (error) {
      console.error(`Failed to output to ${target}: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
    }
  }
  
  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('GENERATED URLs (for Markdown reference):');
  console.log('═══════════════════════════════════════════════════════════════');
  
  for (const [target, urls] of Object.entries(results)) {
    if (urls) {
      console.log(`\n${target.toUpperCase()}:`);
      for (const [name, url] of Object.entries(urls)) {
        console.log(`  ![${name}](${url})`);
      }
    }
  }
  
  console.log('');
  console.log('✓ Done!');
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});