import re

with open('coords.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    match = re.search('\[.*\];?', line)  # Find everything between first [ and last ], including following ;
    if match:
        coords = match.group(0).rstrip('; ')  # Remove trailing semicolon and whitespace
        # If 'Lat=' and 'Lon=' are present in the coords string
        if 'Lat=' in coords and 'Lon=' in coords:
            info_parts = re.split('\[.*\];?', line)  # Split the line into two parts

            # Extract the lat and lon values
            lat_match = re.search('Lat=([-\d.]+)', coords)
            lon_match = re.search('Lon=([-\d.]+)', coords)

            lat = lat_match.group(1) if lat_match else ''
            lon = lon_match.group(1) if lon_match else ''

            # Rearrange the parts so that the latitude and longitude are at the end
            new_line = info_parts[0].rstrip() + ';' + info_parts[1].strip() + ';' + lat + ';' + lon
            new_lines.append(new_line + '\n')

with open('coords_new.txt', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
