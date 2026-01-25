#!/bin/bash
# Run this in webapp-frontend/views directory

# Generator page
cat > generator.hbs << 'EOFGEN'
<section style="background: var(--light-bg); padding: 60px 0 80px;">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="text-center mb-5">
                    <h1>Generate AI Diagram</h1>
                    <p class="text-muted">Describe your architecture and let AI create it</p>
                    <div class="mt-3">
                        <span class="badge bg-success">{{remaining}} diagrams remaining today</span>
                        <span class="badge bg-secondary">{{user.tier}} tier</span>
                    </div>
                </div>

                {{#unless canCreate}}
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    You've reached your daily limit of {{limit}} diagrams. 
                    <a href="/pricing" class="alert-link">Upgrade your plan</a> for more diagrams.
                </div>
                {{/unless}}

                <div class="card shadow" style="border: 2px solid #f0f0f0; border-radius: 15px;">
                    <div class="card-body p-5">
                        <form id="generator-form">
                            <div class="mb-4">
                                <label for="title" class="form-label fw-bold">Diagram Title</label>
                                <input 
                                    type="text" 
                                    class="form-control form-control-lg" 
                                    id="title" 
                                    name="title" 
                                    placeholder="e.g., Azure AKS Production Setup"
                                    required
                                    {{#unless canCreate}}disabled{{/unless}}
                                >
                            </div>

                            <div class="mb-4">
                                <label for="prompt" class="form-label fw-bold">Description</label>
                                <textarea 
                                    class="form-control" 
                                    id="prompt" 
                                    name="prompt" 
                                    rows="4" 
                                    placeholder="Describe your architecture... e.g., 'Azure AKS cluster with 3 node pools, Azure SQL Database, Application Gateway, and Azure Key Vault for secrets management'"
                                    required
                                    {{#unless canCreate}}disabled{{/unless}}
                                ></textarea>
                                <small class="text-muted">Be specific for better results</small>
                            </div>

                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label for="diagramType" class="form-label fw-bold">Diagram Type</label>
                                    <select class="form-select form-select-lg" id="diagramType" name="diagramType" {{#unless canCreate}}disabled{{/unless}}>
                                        <option value="python">Python (PNG)</option>
                                        <option value="drawio">Draw.io (XML)</option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label for="style" class="form-label fw-bold">Style</label>
                                    <select class="form-select form-select-lg" id="style" name="style" {{#unless canCreate}}disabled{{/unless}}>
                                        <option value="azure">Azure</option>
                                        <option value="aws">AWS</option>
                                        <option value="gcp">GCP</option>
                                        <option value="k8s">Kubernetes</option>
                                        <option value="generic">Generic</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="quality" class="form-label fw-bold">Quality Level</label>
                                <select class="form-select form-select-lg" id="quality" name="quality" {{#unless canCreate}}disabled{{/unless}}>
                                    <option value="simple">Simple (5-8 nodes)</option>
                                    <option value="standard" selected>Standard (8-15 nodes)</option>
                                    <option value="enterprise">Enterprise (15+ nodes)</option>
                                </select>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary btn-lg" style="background: var(--secondary-color); border: none;" {{#unless canCreate}}disabled{{/unless}}>
                                    <i class="bi bi-magic me-2"></i>Generate Diagram
                                </button>
                            </div>
                        </form>

                        <div id="status-area" class="mt-4" style="display: none;">
                            <div class="alert alert-info">
                                <div class="d-flex align-items-center">
                                    <div class="spinner-border spinner-border-sm me-3" role="status"></div>
                                    <div>
                                        <strong>Generating your diagram...</strong>
                                        <p class="mb-0 small" id="status-text">Please wait...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<script src="/js/diagram-generator.js"></script>
EOFGEN

# My Diagrams page
cat > my-diagrams.hbs << 'EOFMYD'
<section style="background: var(--light-bg); padding: 60px 0 80px;">
    <div class="container">
        <div class="row mb-4">
            <div class="col-md-8">
                <h1>My Diagrams</h1>
                <p class="text-muted">View and manage all your generated diagrams</p>
            </div>
            <div class="col-md-4 text-md-end">
                <a href="/diagrams/generator" class="btn btn-primary-hero">
                    <i class="bi bi-plus-circle me-2"></i>New Diagram
                </a>
            </div>
        </div>

        {{#if diagrams.length}}
        <div class="row g-4">
            {{#each diagrams}}
            <div class="col-md-4">
                <div class="card h-100" style="border: 2px solid #f0f0f0; border-radius: 10px;">
                    <div class="card-body">
                        <h5 class="card-title">{{this.title}}</h5>
                        <p class="card-text text-muted">{{truncate this.prompt 100}}</p>
                        <div class="mb-3">
                            <span class="badge bg-primary">{{this.diagramType}}</span>
                            <span class="badge bg-secondary">{{this.quality}}</span>
                            {{#if (eq this.status 'completed')}}
                            <span class="badge bg-success">Completed</span>
                            {{else if (eq this.status 'generating')}}
                            <span class="badge bg-warning">Generating...</span>
                            {{else}}
                            <span class="badge bg-danger">Failed</span>
                            {{/if}}
                        </div>
                        <div class="d-grid gap-2">
                            <a href="/diagrams/view/{{this._id}}" class="btn btn-primary btn-sm">View</a>
                        </div>
                    </div>
                    <div class="card-footer text-muted small">
                        {{formatDate this.createdAt}}
                    </div>
                </div>
            </div>
            {{/each}}
        </div>

        {{#if pagination}}
        <nav class="mt-5">
            <ul class="pagination justify-content-center">
                {{#if pagination.hasPrev}}
                <li class="page-item">
                    <a class="page-link" href="?page={{pagination.page - 1}}">Previous</a>
                </li>
                {{/if}}
                
                <li class="page-item active">
                    <span class="page-link">{{pagination.page}}</span>
                </li>
                
                {{#if pagination.hasNext}}
                <li class="page-item">
                    <a class="page-link" href="?page={{pagination.page + 1}}">Next</a>
                </li>
                {{/if}}
            </ul>
        </nav>
        {{/if}}
        {{else}}
        <div class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 5rem; color: #ccc;"></i>
            <h3 class="mt-4">No diagrams yet</h3>
            <p class="text-muted">Create your first diagram to get started</p>
            <a href="/diagrams/generator" class="btn btn-primary-hero mt-3">
                <i class="bi bi-plus-circle me-2"></i>Generate Diagram
            </a>
        </div>
        {{/if}}
    </div>
</section>
EOFMYD

# View Diagram page
cat > view-diagram.hbs << 'EOFVIEW'
<section style="background: var(--light-bg); padding: 60px 0 80px;">
    <div class="container">
        <div class="row mb-4">
            <div class="col-md-8">
                <h1>{{diagram.title}}</h1>
                <p class="text-muted">{{diagram.prompt}}</p>
            </div>
            <div class="col-md-4 text-md-end">
                <a href="/diagrams/my-diagrams" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left me-2"></i>Back to My Diagrams
                </a>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-9">
                <div class="card" style="border: 2px solid #f0f0f0; border-radius: 10px;">
                    <div class="card-body p-4">
                        {{#if (eq diagram.status 'completed')}}
                            {{#if diagram.imageData}}
                            <img src="data:image/png;base64,{{diagram.imageData}}" class="img-fluid rounded" alt="{{diagram.title}}" style="max-width: 100%;">
                            {{else if diagram.xmlData}}
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                This is a Draw.io XML diagram. Download it and open in Draw.io to view.
                            </div>
                            <pre class="bg-light p-3 rounded" style="max-height: 400px; overflow: auto;"><code>{{diagram.xmlData}}</code></pre>
                            {{/if}}
                        {{else if (eq diagram.status 'generating')}}
                        <div class="alert alert-warning">
                            <div class="d-flex align-items-center">
                                <div class="spinner-border spinner-border-sm me-3"></div>
                                <div>This diagram is still being generated. Please refresh the page in a moment.</div>
                            </div>
                        </div>
                        {{else}}
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Failed to generate diagram. Error: {{diagram.error}}
                        </div>
                        {{/if}}
                    </div>
                </div>
            </div>

            <div class="col-lg-3">
                <div class="card" style="border: 2px solid #f0f0f0; border-radius: 10px;">
                    <div class="card-body">
                        <h5>Details</h5>
                        <hr>
                        <p><strong>Type:</strong> {{diagram.diagramType}}</p>
                        <p><strong>Style:</strong> {{diagram.style}}</p>
                        <p><strong>Quality:</strong> {{diagram.quality}}</p>
                        <p><strong>Status:</strong> 
                            {{#if (eq diagram.status 'completed')}}
                            <span class="badge bg-success">Completed</span>
                            {{else if (eq diagram.status 'generating')}}
                            <span class="badge bg-warning">Generating</span>
                            {{else}}
                            <span class="badge bg-danger">Failed</span>
                            {{/if}}
                        </p>
                        <p><strong>Created:</strong> {{formatDate diagram.createdAt}}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
EOFVIEW

# Examples page
cat > examples.hbs << 'EOFEX'
<section class="examples">
    <div class="container">
        <div class="section-title">
            <h2>Example Diagrams</h2>
            <p>Professional architecture diagrams created in seconds</p>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6 col-lg-4">
                <div class="example-card">
                    <div class="example-image" style="background: linear-gradient(135deg, #0078d4 0%, #00bcf2 100%);">
                        <i class="bi bi-microsoft"></i>
                    </div>
                    <div class="example-content">
                        <h4>Azure Landing Zone</h4>
                        <p>Enterprise-grade Azure landing zone with hub-spoke topology, management groups, and policy governance.</p>
                        <div class="mt-2">
                            <span class="badge-custom">Azure</span>
                            <span class="badge-custom">Enterprise</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <div class="example-card">
                    <div class="example-image" style="background: linear-gradient(135deg, #ff9900 0%, #ff6600 100%);">
                        <i class="bi bi-clouds"></i>
                    </div>
                    <div class="example-content">
                        <h4>AWS Serverless API</h4>
                        <p>Serverless architecture with API Gateway, Lambda functions, DynamoDB, and S3 for scalable applications.</p>
                        <div class="mt-2">
                            <span class="badge-custom">AWS</span>
                            <span class="badge-custom">Serverless</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <div class="example-card">
                    <div class="example-image" style="background: linear-gradient(135deg, #326ce5 0%, #1a4ba0 100%);">
                        <i class="bi bi-diagram-3"></i>
                    </div>
                    <div class="example-content">
                        <h4>Kubernetes Cluster</h4>
                        <p>Production K8s setup with ingress controller, microservices, StatefulSets, and monitoring stack.</p>
                        <div class="mt-2">
                            <span class="badge-custom">Kubernetes</span>
                            <span class="badge-custom">DevOps</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="example-card">
                    <div class="example-image" style="background: linear-gradient(135deg, #ea4335 0%, #fbbc04 100%);">
                        <i class="bi bi-google"></i>
                    </div>
                    <div class="example-content">
                        <h4>GCP Data Pipeline</h4>
                        <p>Data pipeline with Cloud Pub/Sub, Dataflow, BigQuery, and Cloud Storage for analytics workloads.</p>
                        <div class="mt-2">
                            <span class="badge-custom">GCP</span>
                            <span class="badge-custom">Data</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="example-card">
                    <div class="example-image" style="background: linear-gradient(135deg, #0078d4 0%, #5e5e5e 100%);">
                        <i class="bi bi-server"></i>
                    </div>
                    <div class="example-content">
                        <h4>Hybrid Cloud Network</h4>
                        <p>Multi-cloud network with VPN connections, ExpressRoute, and cross-cloud service mesh integration.</p>
                        <div class="mt-2">
                            <span class="badge-custom">Hybrid</span>
                            <span class="badge-custom">Network</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-lg-4">
                <div class="example-card">
                    <div class="example-image" style="background: linear-gradient(135deg, #5e5e5e 0%, #000000 100%);">
                        <i class="bi bi-shield-check"></i>
                    </div>
                    <div class="example-content">
                        <h4>Zero Trust Architecture</h4>
                        <p>Modern zero-trust security with identity-based access, micro-segmentation, and continuous verification.</p>
                        <div class="mt-2">
                            <span class="badge-custom">Security</span>
                            <span class="badge-custom">ZeroTrust</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-5">
            <a href="/auth/register" class="btn btn-primary-hero" style="padding: 0.75rem 3rem;">
                Start Creating Diagrams
            </a>
        </div>
    </div>
</section>
EOFEX

# Pricing page
cat > pricing.hbs << 'EOFPRICE'
<section class="pricing">
    <div class="container">
        <div class="section-title">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your needs</p>
        </div>
        
        <div class="row g-4">
            <div class="col-lg-4">
                <div class="pricing-card">
                    <h3>Free</h3>
                    <div class="pricing-price">$0</div>
                    <div class="pricing-period">per month</div>
                    <ul class="pricing-features">
                        <li><i class="bi bi-check-circle-fill"></i> 10 diagrams/day</li>
                        <li><i class="bi bi-check-circle-fill"></i> All cloud providers</li>
                        <li><i class="bi bi-check-circle-fill"></i> PNG & Draw.io export</li>
                        <li><i class="bi bi-check-circle-fill"></i> Standard quality</li>
                        <li><i class="bi bi-check-circle-fill"></i> Community support</li>
                    </ul>
                    <a href="/auth/register" class="btn btn-outline-primary btn-pricing">Get Started</a>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="pricing-card featured">
                    <div class="featured-badge">Most Popular</div>
                    <h3>Standard</h3>
                    <div class="pricing-price">$29</div>
                    <div class="pricing-period">per month</div>
                    <ul class="pricing-features">
                        <li><i class="bi bi-check-circle-fill"></i> 100 diagrams/day</li>
                        <li><i class="bi bi-check-circle-fill"></i> All cloud providers</li>
                        <li><i class="bi bi-check-circle-fill"></i> PNG & Draw.io export</li>
                        <li><i class="bi bi-check-circle-fill"></i> Enterprise quality</li>
                        <li><i class="bi bi-check-circle-fill"></i> Priority support</li>
                        <li><i class="bi bi-check-circle-fill"></i> API access</li>
                        <li><i class="bi bi-check-circle-fill"></i> Custom templates</li>
                    </ul>
                    <a href="/auth/register" class="btn btn-primary btn-pricing" style="background: var(--secondary-color); border-color: var(--secondary-color);">Start Free Trial</a>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="pricing-card">
                    <h3>Pro</h3>
                    <div class="pricing-price">$99</div>
                    <div class="pricing-period">per month</div>
                    <ul class="pricing-features">
                        <li><i class="bi bi-check-circle-fill"></i> 500 diagrams/day</li>
                        <li><i class="bi bi-check-circle-fill"></i> All cloud providers</li>
                        <li><i class="bi bi-check-circle-fill"></i> All export formats</li>
                        <li><i class="bi bi-check-circle-fill"></i> Enterprise quality</li>
                        <li><i class="bi bi-check-circle-fill"></i> Premium support</li>
                        <li><i class="bi bi-check-circle-fill"></i> Full API access</li>
                        <li><i class="bi bi-check-circle-fill"></i> Custom templates</li>
                        <li><i class="bi bi-check-circle-fill"></i> Team collaboration</li>
                        <li><i class="bi bi-check-circle-fill"></i> SLA guarantee</li>
                    </ul>
                    <a href="/auth/register" class="btn btn-outline-primary btn-pricing">Contact Sales</a>
                </div>
            </div>
        </div>
    </div>
</section>
EOFPRICE

# Docs page
cat > docs.hbs << 'EOFDOCS'
<section style="padding: 80px 0; min-height: 70vh;">
    <div class="container">
        <div class="row">
            <div class="col-lg-8">
                <h1 class="mb-4">Documentation</h1>
                <p class="lead">Learn how to use CloudStrucc Diagram Generator</p>
                
                <div class="mt-5">
                    <h3>Getting Started</h3>
                    <p>Create professional architecture diagrams using natural language descriptions.</p>
                    
                    <h3 class="mt-4">Supported Providers</h3>
                    <ul>
                        <li>Microsoft Azure</li>
                        <li>Amazon AWS</li>
                        <li>Google Cloud Platform (GCP)</li>
                        <li>Kubernetes</li>
                        <li>Generic/Custom</li>
                    </ul>
                    
                    <h3 class="mt-4">Quality Levels</h3>
                    <ul>
                        <li><strong>Simple:</strong> 5-8 nodes, basic architecture</li>
                        <li><strong>Standard:</strong> 8-15 nodes, detailed architecture</li>
                        <li><strong>Enterprise:</strong> 15+ nodes, comprehensive architecture</li>
                    </ul>
                    
                    <h3 class="mt-4">API Documentation</h3>
                    <p>Coming soon...</p>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card" style="border: 2px solid #f0f0f0;">
                    <div class="card-body">
                        <h5>Quick Links</h5>
                        <hr>
                        <ul class="list-unstyled">
                            <li class="mb-2"><a href="/diagrams/generator">Generate Diagram</a></li>
                            <li class="mb-2"><a href="/examples">View Examples</a></li>
                            <li class="mb-2"><a href="/pricing">Pricing</a></li>
                            <li class="mb-2"><a href="https://cloudstrucc.com#contact">Contact Support</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
EOFDOCS

# Error page
cat > error.hbs << 'EOFERR'
<section style="min-height: 70vh; display: flex; align-items: center; background: var(--light-bg);">
    <div class="container">
        <div class="text-center">
            <i class="bi bi-exclamation-triangle" style="font-size: 5rem; color: var(--accent-color);"></i>
            <h1 class="mt-4">Oops! Something went wrong</h1>
            <p class="text-muted">We're sorry, but an error occurred.</p>
            
            {{#if error}}
            <div class="alert alert-danger mt-4" style="max-width: 600px; margin: 0 auto;">
                <strong>Error:</strong> {{error.message}}
            </div>
            {{/if}}
            
            <div class="mt-4">
                <a href="/" class="btn btn-primary-hero">
                    <i class="bi bi-house me-2"></i>Go Home
                </a>
                <a href="/dashboard" class="btn btn-outline-hero ms-2">
                    <i class="bi bi-speedometer2 me-2"></i>Dashboard
                </a>
            </div>
        </div>
    </div>
</section>
EOFERR

# 404 page
cat > 404.hbs << 'EOF404'
<section style="min-height: 70vh; display: flex; align-items: center; background: var(--light-bg);">
    <div class="container">
        <div class="text-center">
            <h1 style="font-size: 6rem; color: var(--secondary-color);">404</h1>
            <h2 class="mt-4">Page Not Found</h2>
            <p class="text-muted">The page you're looking for doesn't exist.</p>
            
            <div class="mt-4">
                <a href="/" class="btn btn-primary-hero">
                    <i class="bi bi-house me-2"></i>Go Home
                </a>
            </div>
        </div>
    </div>
</section>
EOF404

# Features page
cat > features.hbs << 'EOFFEAT'
<section class="features">
    <div class="container">
        <div class="section-title">
            <h2>Powerful Features</h2>
            <p>Everything you need to create professional architecture diagrams</p>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6 col-lg-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="bi bi-lightning-charge"></i>
                    </div>
                    <h3>AI-Powered Generation</h3>
                    <p>Describe your architecture in plain English and let AI create professional diagrams instantly using Claude Sonnet 4.5.</p>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="bi bi-cloud"></i>
                    </div>
                    <h3>Multi-Cloud Support</h3>
                    <p>Official icons for AWS, Azure, GCP, Kubernetes, and 10+ cloud providers. Enterprise architecture frameworks included.</p>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="bi bi-palette"></i>
                    </div>
                    <h3>Multiple Formats</h3>
                    <p>Export as PNG images or editable Draw.io XML. Choose from 40+ pre-built templates or create custom diagrams.</p>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="bi bi-layers"></i>
                    </div>
                    <h3>Quality Levels</h3>
                    <p>Simple (5-8 nodes), Standard (8-15 nodes), or Enterprise (15+ nodes) detail levels for every use case.</p>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="bi bi-code-square"></i>
                    </div>
                    <h3>Developer API</h3>
                    <p>RESTful API with JWT authentication, queue management, and real-time WebSocket updates for integration.</p>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-4">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="bi bi-shield-check"></i>
                    </div>
                    <h3>Enterprise Ready</h3>
                    <p>Rate limiting, usage tracking, cost estimation, and production-grade security with MongoDB persistence.</p>
                </div>
            </div>
        </div>
    </div>
</section>
EOFFEAT

echo "✅ All view files created!"