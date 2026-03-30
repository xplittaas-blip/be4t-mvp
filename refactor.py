import os
import re
import shutil

print("Starting Refactor Script...")

# 1. Replace strings in locales and Home.jsx
files_to_rebrand = [
    'src/pages/Home.jsx',
    'public/locales/es/common.json',
    'public/locales/en/common.json',
    'public/locales/pt/common.json'
]
for p in files_to_rebrand:
    if os.path.exists(p):
        with open(p, 'r') as f:
            content = f.read()
        content = content.replace('XPLIT', 'BE4T').replace('Xplit', 'BE4T')
        with open(p, 'w') as f:
            f.write(content)
        print(f"Rebranded strings in {p}")

# 2. Restructure directories
components_src = 'src/components'
components_dst = 'src/components/be4t'
os.makedirs(components_dst, exist_ok=True)

utils_src = 'src/utils'
utils_dst = 'src/core/xplit'
os.makedirs(utils_dst, exist_ok=True)

# Move components
print("Moving components to src/components/be4t...")
if os.path.exists(components_src):
    for item in os.listdir(components_src):
        if item != 'be4t':
            try:
                shutil.move(os.path.join(components_src, item), os.path.join(components_dst, item))
            except Exception as e:
                print(f"Warn: {e}")

# Move utils
print("Moving utils to src/core/xplit...")
if os.path.exists(utils_src):
    for item in os.listdir(utils_src):
        try:
            shutil.move(os.path.join(utils_src, item), os.path.join(utils_dst, item))
        except Exception as e:
            print(f"Warn: {e}")
    try:
        os.rmdir(utils_src)
    except:
        pass

# 3. Rewrite imports using Regex
print("Rewriting AST imports across src/...")
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Original content hash to compare
            old_content = content
            
            # components replacement
            content = re.sub(r'([\'"][\.\/]+)components/((?!be4t/).*?[\'"])', r'\g<1>components/be4t/\2', content)
            
            # utils replacement
            content = re.sub(r'([\'"][\.\/]+)utils/(.*?[\'"])', r'\g<1>core/xplit/\2', content)
            
            if content != old_content:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Updated imports in {filepath}")

print("Refactor Complete!")
