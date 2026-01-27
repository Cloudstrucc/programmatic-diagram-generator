#!/usr/bin/env python3
"""
CloudStrucc Diagram Generator
Generates architecture diagrams using Python diagrams library and Claude AI
"""

import argparse
import json
import sys
import os
import base64
from io import BytesIO
from pathlib import Path
import anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_diagram_code(prompt, style, quality):
    """
    Use Claude AI to generate Python code for the diagram
    """
    client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    
    # Quality-based complexity
    complexity_map = {
        'simple': '5-8 nodes, basic architecture',
        'standard': '8-15 nodes, detailed architecture', 
        'enterprise': '15-25 nodes, comprehensive enterprise architecture'
    }
    
    complexity = complexity_map.get(quality, '8-15 nodes')
    
    # Style-based provider
    provider_map = {
        'azure': 'Azure',
        'aws': 'AWS',
        'gcp': 'GCP',
        'k8s': 'Kubernetes',
        'generic': 'Generic/On-premise'
    }
    
    provider = provider_map.get(style, 'Generic')
    
    system_prompt = f"""You are an expert cloud architecture diagram generator. Generate Python code using the 'diagrams' library.

Requirements:
- Use {provider} icons and services
- Target complexity: {complexity}
- Create realistic, production-grade architecture
- Use proper clusters and groupings
- Include appropriate connections with Edge()
- Set graph_attr={{"bgcolor": "white", "pad": "0.5", "dpi": "150"}}
- Use show=False to prevent display
- Output ONLY the Python code, no explanations
- Code must be complete and executable

Available imports:
from diagrams import Diagram, Cluster, Edge
from diagrams.{style.lower()}.* import * (use appropriate modules)

Example structure:
```python
from diagrams import Diagram, Cluster, Edge
from diagrams.azure.compute import VM
# ... more imports

with Diagram("Title", filename="/tmp/diagram", show=False, direction="LR", graph_attr={{"bgcolor": "white", "pad": "0.5", "dpi": "150"}}):
    # Your architecture here
```

Respond with ONLY the Python code."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": f"Generate a {provider} architecture diagram for: {prompt}"
        }],
        system=system_prompt
    )
    
    # Extract code from response
    code = message.content[0].text
    
    # Remove markdown code blocks if present
    if '```python' in code:
        code = code.split('```python')[1].split('```')[0].strip()
    elif '```' in code:
        code = code.split('```')[1].split('```')[0].strip()
    
    return code

def execute_diagram_code(code, output_path):
    """
    Execute the generated Python code to create the diagram
    """
    # Create a safe execution environment
    exec_globals = {
        '__builtins__': __builtins__,
        'Diagram': None,
        'Cluster': None,
        'Edge': None,
    }
    
    # Import diagrams library
    try:
        from diagrams import Diagram, Cluster, Edge
        exec_globals['Diagram'] = Diagram
        exec_globals['Cluster'] = Cluster
        exec_globals['Edge'] = Edge
        
        # Import provider-specific modules (dynamically based on code)
        if 'diagrams.azure' in code:
            import diagrams.azure.compute as azure_compute
            import diagrams.azure.network as azure_network
            import diagrams.azure.database as azure_database
            import diagrams.azure.storage as azure_storage
            import diagrams.azure.security as azure_security
            import diagrams.azure.identity as azure_identity
            exec_globals.update({
                'azure_compute': azure_compute,
                'azure_network': azure_network,
                'azure_database': azure_database,
                'azure_storage': azure_storage,
                'azure_security': azure_security,
                'azure_identity': azure_identity,
            })
            
        if 'diagrams.aws' in code:
            import diagrams.aws.compute as aws_compute
            import diagrams.aws.network as aws_network
            import diagrams.aws.database as aws_database
            import diagrams.aws.storage as aws_storage
            import diagrams.aws.security as aws_security
            exec_globals.update({
                'aws_compute': aws_compute,
                'aws_network': aws_network,
                'aws_database': aws_database,
                'aws_storage': aws_storage,
                'aws_security': aws_security,
            })
            
        if 'diagrams.gcp' in code:
            import diagrams.gcp.compute as gcp_compute
            import diagrams.gcp.network as gcp_network
            import diagrams.gcp.database as gcp_database
            import diagrams.gcp.storage as gcp_storage
            import diagrams.gcp.analytics as gcp_analytics
            exec_globals.update({
                'gcp_compute': gcp_compute,
                'gcp_network': gcp_network,
                'gcp_database': gcp_database,
                'gcp_storage': gcp_storage,
                'gcp_analytics': gcp_analytics,
            })
            
        if 'diagrams.k8s' in code:
            import diagrams.k8s.compute as k8s_compute
            import diagrams.k8s.network as k8s_network
            import diagrams.k8s.storage as k8s_storage
            import diagrams.k8s.podconfig as k8s_podconfig
            exec_globals.update({
                'k8s_compute': k8s_compute,
                'k8s_network': k8s_network,
                'k8s_storage': k8s_storage,
                'k8s_podconfig': k8s_podconfig,
            })
        
        # Execute the code
        exec(code, exec_globals)
        
        return True
        
    except Exception as e:
        raise Exception(f"Diagram execution failed: {str(e)}")

def generate_diagram(prompt, style, diagram_type, quality, request_id):
    """
    Main function to generate diagram
    """
    try:
        # Generate diagram code using Claude
        print(f"Generating diagram code for: {prompt[:50]}...", file=sys.stderr)
        code = generate_diagram_code(prompt, style, quality)
        
        # Set output path
        output_dir = Path("/tmp/diagrams")
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / request_id
        
        # Update code to use correct output path
        code = code.replace('filename="/tmp/diagram"', f'filename="{output_path}"')
        code = code.replace('filename="diagram"', f'filename="{output_path}"')
        
        print("Executing diagram code...", file=sys.stderr)
        execute_diagram_code(code, str(output_path))
        
        # Read the generated image
        image_file = f"{output_path}.png"
        
        if not os.path.exists(image_file):
            raise Exception(f"Diagram file not created: {image_file}")
        
        # Read and encode image
        with open(image_file, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Clean up
        try:
            os.remove(image_file)
        except:
            pass
        
        # Return result as JSON
        result = {
            'success': True,
            'imageData': image_data,
            'xmlData': None,  # Only for draw.io type
            'metadata': {
                'prompt': prompt,
                'style': style,
                'type': diagram_type,
                'quality': quality,
                'nodeCount': 'Generated',
                'generatedCode': code[:500]  # First 500 chars for reference
            }
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'imageData': None,
            'xmlData': None,
            'metadata': None
        }

def main():
    parser = argparse.ArgumentParser(description='Generate architecture diagrams')
    parser.add_argument('--prompt', required=True, help='Diagram description')
    parser.add_argument('--style', required=True, choices=['azure', 'aws', 'gcp', 'k8s', 'generic'], help='Cloud provider style')
    parser.add_argument('--type', required=True, choices=['python', 'drawio'], help='Diagram type')
    parser.add_argument('--quality', required=True, choices=['simple', 'standard', 'enterprise'], help='Quality level')
    parser.add_argument('--request-id', required=True, help='Request ID for tracking')
    
    args = parser.parse_args()
    
    # Validate environment
    if not os.getenv('ANTHROPIC_API_KEY'):
        result = {
            'success': False,
            'error': 'ANTHROPIC_API_KEY not set in environment',
            'imageData': None,
            'xmlData': None,
            'metadata': None
        }
        print(json.dumps(result))
        sys.exit(1)
    
    # Generate diagram
    result = generate_diagram(
        prompt=args.prompt,
        style=args.style,
        diagram_type=args.type,
        quality=args.quality,
        request_id=args.request_id
    )
    
    # Output JSON result
    print(json.dumps(result))
    
    # Exit with error code if failed
    if not result['success']:
        sys.exit(1)

if __name__ == '__main__':
    main()