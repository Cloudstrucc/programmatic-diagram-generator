#!/usr/bin/env node
/**
 * Azure Architecture Diagram Generator v2.0
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
// DIAGRAM DEFINITIONS
// =============================================================================

const diagrams = {
  /**
   * CMK Complete Architecture - M365 + Power Platform
   */
  cmk: {
    name: 'cmk_architecture',
    title: 'M365 & Power Platform - Customer Managed Keys',
    puml: `
@startuml CMK_Architecture
!define AzurePuml https://raw.githubusercontent.com/plantuml-stdlib/Azure-PlantUML/master/dist
!include AzurePuml/AzureCommon.puml
!include AzurePuml/Security/AzureKeyVault.puml
!include AzurePuml/Identity/AzureActiveDirectory.puml
!include AzurePuml/Identity/AzureManagedIdentity.puml
!include AzurePuml/Analytics/AzureLogAnalyticsWorkspace.puml
!include AzurePuml/DevOps/AzureDevOps.puml
!include AzurePuml/Databases/AzureCosmosDb.puml
!include AzurePuml/Storage/AzureBlobStorage.puml
!include AzurePuml/Compute/AzureFunction.puml
!include AzurePuml/Integration/AzureLogicApps.puml

title M365 & Power Platform - Customer Managed Keys (CMK)\\nComplete Encryption Architecture

skinparam linetype ortho
skinparam backgroundColor white
skinparam defaultFontSize 11

' Key Vault Primary
rectangle "Azure Key Vault (Canada Central)" as kv_region #ffebee {
  rectangle "Root Keys" as root_keys {
    AzureKeyVault(root_key, "Customer Root Key\\n(RSA 4096)", "HSM-Protected")
    AzureKeyVault(root_key_pp, "Power Platform\\nRoot Key", "HSM-Protected")
  }
  
  rectangle "M365 DEP Keys" as dep_keys {
    AzureKeyVault(dep_spo, "DEP Key\\nSharePoint", "")
    AzureKeyVault(dep_exo, "DEP Key\\nExchange", "")
    AzureKeyVault(dep_teams, "DEP Key\\nTeams", "")
  }
  
  rectangle "Power Platform Keys" as pp_keys {
    AzureKeyVault(dep_dataverse, "Dataverse\\nEncryption Key", "")
    AzureKeyVault(dep_copilot, "Copilot Studio\\nKey", "")
  }
}

' Key Vault DR
rectangle "DR Key Vault (Canada East)" as kv_dr_region #fff8e1 {
  AzureKeyVault(kv_dr, "Geo-Replica\\nKey Vault", "Auto-Replicated")
}

' Microsoft 365
rectangle "Microsoft 365 Workloads" as m365 #e3f2fd {
  rectangle "SharePoint Online" as spo_cluster {
    AzureBlobStorage(spo, "SPO Sites &\\nDocument Libraries", "")
    storage "Office Files\\n(Word, Excel, PPT)" as spo_office
    storage "PDF Files" as spo_pdf
  }
  
  rectangle "Exchange Online" as exo_cluster {
    AzureBlobStorage(exo, "Mailboxes &\\nAttachments", "")
  }
  
  rectangle "Teams" as teams_cluster {
    AzureBlobStorage(teams, "Chats, Channels,\\nRecordings", "")
  }
  
  rectangle "OneDrive" as odb_cluster {
    AzureBlobStorage(odb, "OneDrive Files", "")
  }
}

' Power Platform
rectangle "Power Platform (Protected B)" as powerplat #e8f5e9 {
  rectangle "Dataverse" as dv_cluster {
    AzureCosmosDb(dataverse, "Dataverse Tables", "")
    AzureBlobStorage(dv_files, "File & Image\\nColumns", "")
  }
  
  rectangle "Power Apps" as pa_cluster {
    AzureFunction(powerapps, "Canvas &\\nModel Apps", "")
  }
  
  rectangle "Power Automate" as pflow_cluster {
    AzureLogicApps(powerauto, "Cloud Flows", "")
  }
  
  rectangle "Power Pages" as pp_cluster {
    AzureBlobStorage(powerpages, "Portal Sites &\\nDocuments", "")
  }
}

' Identity
rectangle "Identity & RBAC" as identity #f3e5f5 {
  AzureActiveDirectory(entra, "Entra ID", "")
  AzureManagedIdentity(mi_m365, "M365 Service\\nPrincipal", "")
  AzureManagedIdentity(mi_pp, "Power Platform\\nService Principal", "")
}

' Monitoring
rectangle "Monitoring & Automation" as monitoring #fff3e0 {
  AzureDevOps(devops, "DevOps\\nPipelines", "")
  AzureLogAnalyticsWorkspace(law, "Log Analytics", "")
  AzureLogicApps(rotation, "Key Rotation\\nAutomation", "")
}

' Connections - Key Wrapping
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

' Identity Connections
entra --> mi_m365
entra --> mi_pp
mi_m365 -[#purple,dashed]-> root_key : RBAC
mi_pp -[#purple,dashed]-> root_key_pp : RBAC

' Monitoring
devops -[#gray]-> dep_spo : deploy
rotation -[#orange]-> root_key : rotate
root_key -[#gray,dotted]-> law : audit logs

@enduml
`
  },

  /**
   * M365 Security Architecture
   */
  m365: {
    name: 'm365_security',
    title: 'LCE M365 Security Architecture',
    puml: `
@startuml M365_Security
!define AzurePuml https://raw.githubusercontent.com/plantuml-stdlib/Azure-PlantUML/master/dist
!include AzurePuml/AzureCommon.puml
!include AzurePuml/Security/AzureKeyVault.puml
!include AzurePuml/Security/AzureSentinel.puml
!include AzurePuml/Identity/AzureActiveDirectory.puml
!include AzurePuml/Identity/AzureManagedIdentity.puml
!include AzurePuml/Analytics/AzureLogAnalyticsWorkspace.puml
!include AzurePuml/DevOps/AzureDevOps.puml
!include AzurePuml/DevOps/AzurePipelines.puml
!include AzurePuml/Networking/AzureVirtualNetwork.puml
!include AzurePuml/Networking/AzureFirewall.puml
!include AzurePuml/Compute/AzureFunction.puml
!include AzurePuml/Integration/AzureLogicApps.puml
!include AzurePuml/Storage/AzureBlobStorage.puml

title LCE M365 Security Architecture\\nProtected B / NATO Classification

skinparam linetype ortho
skinparam backgroundColor white

' Azure DevOps
rectangle "Azure DevOps (LCE)" as devops_region #e8f5e9 {
  AzureDevOps(devops, "LCE DevOps Org", "")
  AzurePipelines(pipelines, "Automation\\nPipelines", "")
  storage "PowerShell\\nModules" as ps_modules
  
  devops --> pipelines
  pipelines --> ps_modules
}

' Identity
rectangle "Identity & Zero Trust" as identity_region #fce4ec {
  AzureActiveDirectory(entra, "Entra ID", "")
  AzureManagedIdentity(mi, "Managed\\nIdentities", "")
  rectangle "Conditional Access" as ca {
    component "Protected B\\nPolicy" as ca_pb
    component "NATO Policy" as ca_nato
  }
  
  entra --> mi
  entra --> ca
}

' CMK
rectangle "Customer Managed Keys" as cmk_region #ffebee {
  AzureKeyVault(kv_primary, "Key Vault\\nPrimary", "Canada Central")
  AzureKeyVault(kv_dr, "Key Vault\\nDR", "Canada East")
  
  kv_primary -[#orange,dashed]-> kv_dr : geo-replicate
}

' M365
rectangle "Microsoft 365 (Protected B Tenant)" as m365_region #fff3e0 {
  rectangle "M365 Core" as m365_core {
    component "Teams Premium" as teams
    component "SharePoint\\nOnline" as spo
    component "Exchange\\nOnline" as exo
  }
  
  rectangle "Microsoft Purview" as purview {
    component "Sensitivity\\nLabels" as labels
    component "DLP Policies" as dlp
    component "Audit Logs" as audit
  }
}

' Azure Infrastructure
rectangle "Azure Infrastructure (GC Region)" as azure_region #e0f7fa {
  AzureVirtualNetwork(vnet, "Hub VNet", "")
  AzureFirewall(fw, "Azure\\nFirewall", "")
  AzureFunction(func, "Compliance\\nFunctions", "")
  AzureBlobStorage(storage, "Audit Log\\nStorage", "")
  
  vnet --> fw
  func --> storage
}

' Security Operations
rectangle "Security Operations Center" as soc_region #f3e5f5 {
  AzureSentinel(sentinel, "Microsoft\\nSentinel", "")
  AzureLogAnalyticsWorkspace(law, "Log Analytics", "")
  AzureLogicApps(alerts, "Alert\\nPlaybooks", "")
  
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

@enduml
`
  },

  /**
   * Teams Premium Security
   */
  teams: {
    name: 'teams_premium_security',
    title: 'Teams Premium - Protected B / NATO Meeting Security',
    puml: `
@startuml Teams_Premium
!define AzurePuml https://raw.githubusercontent.com/plantuml-stdlib/Azure-PlantUML/master/dist
!include AzurePuml/AzureCommon.puml
!include AzurePuml/Security/AzureKeyVault.puml
!include AzurePuml/Security/AzureSentinel.puml
!include AzurePuml/Identity/AzureActiveDirectory.puml
!include AzurePuml/Analytics/AzureLogAnalyticsWorkspace.puml
!include AzurePuml/Storage/AzureBlobStorage.puml

title Teams Premium - Protected B / NATO Meeting Security

skinparam linetype ortho
skinparam backgroundColor white

' Users
rectangle "Meeting Participants" as users_region #e3f2fd {
  actor "Protected B\\nCleared" as user_pb
  actor "NATO\\nCleared" as user_nato
  actor "External\\nGuests" as user_ext
}

' Identity
rectangle "Identity & Conditional Access" as identity_region #fce4ec {
  AzureActiveDirectory(entra, "Entra ID", "")
  
  rectangle "Conditional Access Policies" as ca_policies {
    component "Protected B\\nPolicy" as ca_pb
    component "NATO Policy" as ca_nato
    component "Guest Policy" as ca_guest
  }
  
  entra --> ca_policies
}

' Sensitivity Labels
rectangle "Microsoft Purview - Sensitivity Labels" as labels_region #fff3e0 {
  rectangle "Meeting Labels" as meeting_labels {
    component "Unclassified" as label_unc
    component "Protected B" as label_pb
    component "NATO RESTRICTED" as label_nato_r
    component "NATO SECRET" as label_nato_s
  }
  
  rectangle "Label Enforcements" as enforcements {
    component "Watermarking" as enf_water
    component "Recording\\nRestrictions" as enf_record
    component "Copy/Paste\\nControls" as enf_copy
    component "E2E Encryption" as enf_e2e
    component "Lobby Controls" as enf_lobby
  }
  
  label_pb --> enf_water
  label_pb --> enf_record
  label_nato_r --> enf_copy
  label_nato_r --> enf_lobby
  label_nato_s --> enf_e2e
}

' Teams Premium
rectangle "Teams Premium Features" as teams_region #e8f5e9 {
  component "Teams Premium\\nMeetings" as teams
  
  rectangle "Meeting Protection" as protection {
    component "Dynamic\\nWatermarks" as feat_water
    component "End-to-End\\nEncryption" as feat_e2e
    component "Presenter\\nControls" as feat_present
    component "Advanced\\nLobby" as feat_lobby
  }
  
  teams --> protection
}

' CMK
rectangle "Customer Managed Keys" as cmk_region #ffebee {
  AzureKeyVault(kv, "Key Vault\\n(HSM)", "")
  AzureKeyVault(dep_teams, "Teams DEP\\nKey", "")
  
  kv -[#red,bold]-> dep_teams : wraps
}

' Compliance
rectangle "Compliance & Recording" as compliance_region #f3e5f5 {
  AzureBlobStorage(recordings, "Meeting\\nRecordings", "")
  AzureBlobStorage(transcripts, "Transcripts", "")
  component "7-Year\\nRetention" as retention
  
  recordings --> retention
  transcripts --> retention
}

' Monitoring
rectangle "Security Operations" as soc_region #e0f7fa {
  AzureLogAnalyticsWorkspace(law, "Log Analytics", "")
  AzureSentinel(sentinel, "Sentinel", "")
  
  law --> sentinel
}

' Connections
user_pb -[#green]-> ca_pb : MFA + Device
user_nato -[#green]-> ca_nato : MFA + CAC
user_ext -[#orange]-> ca_guest : Guest Approval

ca_pb -[#blue]-> teams
ca_nato -[#blue]-> teams
ca_guest -[#orange,dashed]-> teams : limited

label_pb -[#purple]-> teams : auto-apply
label_nato_r -[#purple]-> teams : manual

dep_teams -[#red,bold]-> teams : encrypts
dep_teams -[#red,bold]-> recordings : encrypts

teams -[#gray,dotted]-> law : audit

@enduml
`
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Encode PlantUML diagram for Kroki API
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
    console.log(`  Calling Kroki API...`);
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kroki API error: ${response.status} ${response.statusText}`);
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
  console.log('║       Azure Architecture Diagram Generator v2.0            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
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