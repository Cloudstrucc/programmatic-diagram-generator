// diagram-generator.js - Diagram Generator Page Logic

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
            diagramType: document.getElementById('diagramType').value,
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
            statusText.textContent = 'Diagram queued. Generating...';

            // Poll for status
            await pollDiagramStatus(diagramId);

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

    async function pollDiagramStatus(diagramId) {
        const maxAttempts = 60;
        let attempts = 0;

        const poll = async () => {
            if (attempts >= maxAttempts) {
                throw new Error('Timeout: Diagram generation took too long');
            }

            attempts++;

            try {
                const response = await fetch(`/diagrams/status/${diagramId}`);
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Status check failed');
                }

                if (result.status === 'completed') {
                    // Success!
                    statusArea.innerHTML = `
                        <div class="alert alert-success">
                            <i class="bi bi-check-circle me-2"></i>
                            <strong>Success!</strong> Your diagram is ready.
                        </div>
                    `;

                    // Redirect to view page after 1 second
                    setTimeout(() => {
                        window.location.href = `/diagrams/view/${diagramId}`;
                    }, 1000);

                } else if (result.status === 'failed') {
                    throw new Error(result.message || 'Diagram generation failed');

                } else {
                    // Still generating
                    const position = result.position || 'processing';
                    statusText.textContent = `Generating... ${position > 0 ? `Position in queue: ${position}` : 'Processing...'}`;

                    // Poll again after 2 seconds
                    setTimeout(poll, 2000);
                }

            } catch (error) {
                throw error;
            }
        };

        await poll();
    }
});
