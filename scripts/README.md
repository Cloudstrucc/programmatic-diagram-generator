# Installation & Setup Scripts

This directory contains helper scripts for setting up the CLI and API.

## Available Scripts

### `cli-install.sh`
Install CLI dependencies and set up the environment.

```bash
cd cli
chmod +x ../scripts/cli-install.sh
../scripts/cli-install.sh
```

**What it does:**
- Checks Node.js and Python versions
- Installs Node.js dependencies (`npm install`)
- Installs Python dependencies (`diagrams`, `graphviz`, `anthropic`)
- Checks for Graphviz
- Creates `.env` file from template
- Verifies API key setup

### `new-examples-jan.sh`
Generate example diagrams for all supported styles.

```bash
chmod +x scripts/new-examples-jan.sh
./scripts/new-examples-jan.sh
```

**What it does:**
- Generates sample diagrams for:
  - Azure, AWS, GCP
  - Kubernetes
  - UML, ArchiMate, C4, TOGAF
  - Elastic, Firebase
  - Multi-cloud (Alibaba, IBM, OCI, DigitalOcean, OpenStack, Outscale)

## Usage

All scripts should be run from the repository root directory.

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

Run a script:
```bash
./scripts/cli-install.sh
```

## Directory Structure

```
scripts/
├── README.md               # This file
├── cli-install.sh          # CLI setup script
└── new-examples-jan.sh     # Example generator
```
