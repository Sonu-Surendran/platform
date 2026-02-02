
import os
import re
import base64
import requests

def extract_and_save_diagrams(md_path, output_dir):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find mermaid blocks
    # Looking for ```mermaid ... ```
    pattern = r"```mermaid\s+(.*?)\s+```"
    matches = re.findall(pattern, content, re.DOTALL)

    print(f"Found {len(matches)} diagrams.")

    for i, code in enumerate(matches):
        try:
            # Clean leading/trailing whitespace
            code = code.strip()
            
            # Encode
            base64_str = base64.urlsafe_b64encode(code.encode('utf-8')).decode('utf-8')
            url = f"https://mermaid.ink/img/{base64_str}"
            
            print(f"Diagram {i+1}: Fetching from {url[:50]}...")
            
            response = requests.get(url)
            if response.status_code == 200:
                filename = f"diagram_{i+1}_system_design.png"
                filepath = os.path.join(output_dir, filename)
                with open(filepath, 'wb') as f_out:
                    f_out.write(response.content)
                print(f"  -> Saved to {filename}")
            else:
                print(f"  -> Failed to fetch diagram {i+1}: Status {response.status_code}")
                
        except Exception as e:
            print(f"  -> Error processing diagram {i+1}: {e}")

if __name__ == "__main__":
    ARTIFACT_DIR = r"C:\Users\USER\.gemini\antigravity\brain\181f9321-c44f-4dd7-843b-6a15814c867a"
    md_file = os.path.join(ARTIFACT_DIR, "system_design.md")
    
    extract_and_save_diagrams(md_file, ARTIFACT_DIR)
