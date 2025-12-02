import os
import re

files = [
    'src/entities/spl/lib/parser/grammar/rules/helpers.ts',
    'src/entities/spl/lib/parser/grammar/rules/expressions.ts',
    'src/entities/spl/lib/parser/grammar/rules/search.ts',
    'src/entities/spl/lib/parser/grammar/rules/pipeline.ts',
    'src/entities/spl/lib/parser/grammar/rules/commands/field-creators.ts',
    'src/entities/spl/lib/parser/grammar/rules/commands/field-filters.ts',
    'src/entities/spl/lib/parser/grammar/rules/commands/structural.ts',
    'src/entities/spl/lib/parser/grammar/rules/commands/splitters.ts',
    'src/entities/spl/lib/parser/grammar/rules/commands/generic.ts'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add const p = parser as any; after function declaration if not present
    if 'const p = parser as any' not in content:
        content = re.sub(
            r'(export function \w+\(parser: SPLParser\): void \{\n)',
            r'\1  const p = parser as any; // Access protected parser methods\n',
            content
        )
    
    # Replace ALL parser.METHOD_NAME( with p.METHOD_NAME(
    # This will catch all variations: RULE, CONSUME, SUBRULE, etc., with any numbers
    content = re.sub(r'(?<!const p = parser )parser\.(\w+)\(', r'p.\1(', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'✓ Fixed: {file}')

print('\nAll grammar rule files fixed!')
