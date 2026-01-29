// diagram-generator.js - Diagram Generator with Patient Polling

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('generator-form');
    const statusArea = document.getElementById('status-area');
    const statusText = document.getElementById('status-text');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('title').value,
            prompt: document.getElementById('prompt').value,
            diagramType: 'python',  // For database (always python)
            format: document.getElementById('diagramFormat').value,  // For API (graphviz or graphviz-dot)
            style: document.getElementById('style').value,
            quality: document.getElementById('quality').value
        };

        // Show status
        statusArea.style.display = 'block';
        statusText.textContent = 'Submitting request...';

        // Disable form
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            // Submit generation request
            const response = await fetch('/diagrams/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to generate diagram');
            }

            const diagramId = result.diagramId;
            const requestId = result.requestId;
            
            statusText.textContent = '🎨 Your diagram is being created... This usually takes 15-30 seconds.';

            // Poll for status using requestId (up to 2 minutes)
            await pollDiagramStatus(diagramId, requestId);

        } catch (error) {
            console.error('Error:', error);
            statusArea.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
            submitButton.disabled = false;
        }
    });

    async function pollDiagramStatus(diagramId, requestId) {
        const maxAttempts = 60; // 60 attempts x 2 seconds = 2 minutes
        let attempts = 0;
        const startTime = Date.now();

        // Wait 3 seconds before first check to give API time to save
        await new Promise(resolve => setTimeout(resolve, 3000));

        const poll = async () => {
            if (attempts >= maxAttempts) {
                throw new Error('The diagram is taking longer than expected. Please check "My Diagrams" in a few moments.');
            }

            attempts++;
            const elapsed = Math.floor((Date.now() - startTime) / 1000);

            try {
                const response = await fetch(`/diagrams/status/${requestId}`);
                
                // Handle 404 gracefully - diagram might not be saved yet
                if (response.status === 404) {
                    statusText.textContent = `⏳ Preparing your diagram... (${elapsed}s)`;
                    setTimeout(poll, 2000);
                    return;
                }

                const result = await response.json();

                if (result.status === 'completed') {
                    // Success!
                    statusArea.innerHTML = `
                        <div class="alert alert-success">
                            <i class="bi bi-check-circle me-2"></i>
                            <strong>Success!</strong> Your diagram is ready!
                        </div>
                    `;

                    // Redirect to view page using diagramId
                    setTimeout(() => {
                        window.location.href = `/diagrams/view/${diagramId}`;
                    }, 1000);

                } else if (result.status === 'failed') {
                    throw new Error(result.error || result.message || 'Diagram generation failed. Please try again.');

                } else {
                    // Still generating - show friendly progress message
                    let message = '';
                    if (elapsed < 10) {
                        message = '🎨 Generating your diagram...';
                    } else if (elapsed < 30) {
                        message = `⚙️ Claude is designing your architecture... (${elapsed}s)`;
                    } else if (elapsed < 60) {
                        message = `🔧 Almost there, finalizing details... (${elapsed}s)`;
                    } else {
                        message = `⏰ Still working on it... (${elapsed}s) - Complex diagrams take longer!`;
                    }
                    
                    const position = result.position || 0;
                    if (position > 0) {
                        message += ` | Position in queue: ${position}`;
                    }
                    
                    statusText.textContent = message;

                    // Poll again after 2 seconds
                    setTimeout(poll, 2000);
                }

            } catch (error) {
                // If it's just a status check error and we haven't timed out, keep trying
                if (attempts < maxAttempts && error.message.includes('Status check failed')) {
                    statusText.textContent = `⏳ Checking status... (${elapsed}s)`;
                    setTimeout(poll, 2000);
                } else {
                    throw error;
                }
            }
        };

        await poll();
    }
});