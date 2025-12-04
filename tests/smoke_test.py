#!/usr/bin/env python3
import sys, os, re

ROOT = os.path.dirname(os.path.dirname(__file__))
files = {
    'html': os.path.join(ROOT, 'index.html'),
    'css': os.path.join(ROOT, 'styles.css'),
    'js': os.path.join(ROOT, 'script.js'),
}

errors = []

def read(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        errors.append(f'ERROR: could not read {path}: {e}')
        return ''

html = read(files['html'])
css = read(files['css'])
js = read(files['js'])

def check_html_ids(haystack, ids):
    miss = []
    for idv in ids:
        if f'id="{idv}"' not in haystack:
            miss.append(idv)
    return miss

required_ids = ['capy','externalUrl','loadExternal','capyBtn','playBtn','confetti-canvas','rsvpModal','rsvpBtn']
miss = check_html_ids(html, required_ids)
if miss:
    errors.append('Missing HTML IDs: ' + ', '.join(miss))

# CSS variables
for var in ['--accent','--muted','--bg']:
    if var not in css:
        errors.append(f'Missing CSS variable {var} in styles.css')

# Fonts
if 'fonts.googleapis.com' not in html:
    errors.append('Google Fonts not found in index.html')

# MP4 asset check
mp4_candidates = [n for n in os.listdir(ROOT) if n.lower().endswith('.mp4')]
if not mp4_candidates:
    errors.append('No .mp4 file found in project root (expected uploaded MP4)')

# Basic JS check: ensure event listeners likely present
if 'addEventListener' not in js:
    errors.append('script.js looks missing event listeners (no addEventListener found)')

print('--- Smoke test report ---')
if errors:
    print('FAIL')
    for e in errors:
        print('- ' + e)
    sys.exit(2)
else:
    print('PASS: Basic checks OK')
    print('Found MP4 files: ', ', '.join(mp4_candidates))
    sys.exit(0)
