import re

with open('coords.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    match = re.search('\[.*\];?', line)  # Find everything between first [ and last ], including following ;
    if match:
        coords = match.group(0).rstrip('; ')  # Remove trailing semicolon and whitespace
        info_parts = re.split('\[.*\];?', line)  # Split the line into two parts
        # Rearrange the parts so that the coordinates are at the end
        new_line = info_parts[0].rstrip() + ';' + info_parts[1].strip() + ';' + coords
        new_lines.append(new_line + '\n')

with open('coords_new.txt', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
