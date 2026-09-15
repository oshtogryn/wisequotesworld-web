#!/usr/bin/env python3
"""Static accessibility guardrails for the shared WQW theme.

This is intentionally small: it protects the main text/background pairs against
future regressions below WCAG AA contrast while renderer-level smoke tests cover
skip navigation and ARIA state markup in production.
"""
from pathlib import Path
import re

CSS = Path('styles.css').read_text(encoding='utf-8')


def srgb(v: int) -> float:
    c = v / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip('#')
    if len(h) != 6:
        raise AssertionError(f'expected 6-digit hex color, got {hex_color!r}')
    r, g, b = (srgb(int(h[i:i+2], 16)) for i in (0, 2, 4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: str, b: str) -> float:
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def css_var(name: str) -> str:
    m = re.search(rf'--{re.escape(name)}:(#[0-9a-fA-F]{{6}})', CSS)
    if not m:
        raise AssertionError(f'missing CSS variable --{name}')
    return m.group(1)


bg = css_var('bg')
panel = css_var('panel')
text = css_var('text')
muted = css_var('muted')
gold2 = css_var('gold2')
gold = css_var('gold')

pairs = {
    'body text / background': (text, bg, 4.5),
    'muted text / background': (muted, bg, 4.5),
    'muted text / panel': (muted, panel, 4.5),
    'accent text / background': (gold2, bg, 4.5),
    'dark button text / gold button': ('#12100b', gold, 4.5),
}

for label, (fg, background, minimum) in pairs.items():
    ratio = contrast(fg, background)
    print(f'{label}: {ratio:.2f}:1')
    assert ratio >= minimum, f'{label} contrast {ratio:.2f}:1 < {minimum}:1'

required = [
    '.skip-link{',
    ':focus-visible',
    '@media(prefers-reduced-motion:reduce)',
    'min-height:44px',
]
for marker in required:
    assert marker in CSS, f'missing accessibility CSS guardrail: {marker}'

for renderer in ('lib/site_v2.js', 'lib/new_locales_site.js', 'lib/locale13_site.js'):
    src = Path(renderer).read_text(encoding='utf-8')
    assert 'skip-link' in src, f'{renderer}: missing skip link'
    assert 'main-content' in src, f'{renderer}: missing main target'
    assert 'aria-expanded' in src, f'{renderer}: missing toggle state semantics'

print('Accessibility CSS/markup smoke passed.')
