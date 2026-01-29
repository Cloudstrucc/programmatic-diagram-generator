// // diagram-view.js - Add this to your diagram view page
// // This handles downloading the diagram as Draw.io XML

// document.addEventListener('DOMContentLoaded', function() {
    
//     // XML Download Button Handler
//     const xmlDownloadBtn = document.getElementById('download-xml-btn');
    
//     if (xmlDownloadBtn) {
//         xmlDownloadBtn.addEventListener('click', async function(e) {
//             e.preventDefault();
            
//             const diagramId = this.getAttribute('data-diagram-id');
//             const diagramTitle = this.getAttribute('data-diagram-title') || 'diagram';
            
//             try {
//                 // Show loading state
//                 const originalText = this.innerHTML;
//                 this.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Preparing Download...';
//                 this.disabled = true;
                
//                 // Fetch diagram data (which includes drawioXml field)
//                 const response = await fetch(`/api/diagrams/${diagramId}`);
                
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch diagram data');
//                 }
                
//                 const data = await response.json();
                
//                 // Check if drawioXml exists in the response
//                 if (!data.drawioXml) {
//                     // Legacy diagram - might not have XML export
//                     throw new Error('Draw.io XML export not available for this diagram. Please regenerate the diagram to enable XML export.');
//                 }
                
//                 // Create blob from drawioXml (NOT from code!)
//                 const xmlBlob = new Blob([data.drawioXml], { 
//                     type: 'application/xml' 
//                 });
                
//                 // Create download link
//                 const url = URL.createObjectURL(xmlBlob);
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = `${diagramTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.drawio`;
//                 document.body.appendChild(a);
//                 a.click();
                
//                 // Cleanup
//                 document.body.removeChild(a);
//                 URL.revokeObjectURL(url);
                
//                 // Reset button
//                 this.innerHTML = originalText;
//                 this.disabled = false;
                
//                 // Show success message
//                 showToast('success', 'Draw.io XML downloaded successfully!');
                
//             } catch (error) {
//                 console.error('XML download error:', error);
                
//                 // Reset button
//                 this.innerHTML = originalText;
//                 this.disabled = false;
                
//                 // Show error
//                 showToast('danger', error.message || 'Failed to download Draw.io XML');
//             }
//         });
//     }
    
//     // Optional: Toast notification helper
//     function showToast(type, message) {
//         // Create toast if doesn't exist
//         let toastContainer = document.getElementById('toast-container');
//         if (!toastContainer) {
//             toastContainer = document.createElement('div');
//             toastContainer.id = 'toast-container';
//             toastContainer.style.position = 'fixed';
//             toastContainer.style.top = '20px';
//             toastContainer.style.right = '20px';
//             toastContainer.style.zIndex = '9999';
//             document.body.appendChild(toastContainer);
//         }
        
//         const toast = document.createElement('div');
//         toast.className = `alert alert-${type} alert-dismissible fade show`;
//         toast.role = 'alert';
//         toast.innerHTML = `
//             ${message}
//             <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//         `;
        
//         toastContainer.appendChild(toast);
        
//         // Auto-remove after 5 seconds
//         setTimeout(() => {
//             toast.remove();
//         }, 5000);
//     }
    
// });


// // Alternative: If you're using inline handlers in your HTML
// // Add this function globally
// function downloadDrawioXML(diagramId, diagramTitle) {
//     fetch(`/api/diagrams/${diagramId}`)
//         .then(response => response.json())
//         .then(data => {
//             if (!data.drawioXml) {
//                 throw new Error('Draw.io XML not available. Please regenerate diagram.');
//             }
            
//             const xmlBlob = new Blob([data.drawioXml], { type: 'application/xml' });
//             const url = URL.createObjectURL(xmlBlob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `${diagramTitle.replace(/[^a-z0-9]/gi, '_')}.drawio`;
//             a.click();
//             URL.revokeObjectURL(url);
//         })
//         .catch(error => {
//             alert('Failed to download XML: ' + error.message);
//         });
// }
