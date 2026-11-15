from PIL import Image, ImageOps
import os, glob

pub = r'c:/Users/12124/Documents/soul-shades-website/public/'
srcs = glob.glob(pub + '*.jpg') + glob.glob(pub + 'releases/*.jpg') + glob.glob(pub + 'merch/*.jpg')
LIMIT = 100 * 1024
rows = []
for p in sorted(srcs):
    im = ImageOps.exif_transpose(Image.open(p)).convert('RGB')
    base = os.path.splitext(p)[0]
    for target in (640, 1280):
        w = min(target, im.width)
        out = f'{base}-{target}.webp'
        r = im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        used = None
        for q in (80, 74, 68, 62, 56, 50, 45):
            r.save(out, 'WEBP', quality=q, method=6)
            used = q
            if os.path.getsize(out) <= LIMIT:
                break
        ww = r.width
        while os.path.getsize(out) > LIMIT and ww > 480:
            ww = int(ww * 0.88)
            r = im.resize((ww, round(im.height * ww / im.width)), Image.LANCZOS)
            r.save(out, 'WEBP', quality=60, method=6)
            used = 60
        rows.append((os.path.relpath(out, pub).replace(os.sep, '/'), r.size, os.path.getsize(out) // 1024, used))

for name, size, kb, q in rows:
    print(f'{kb:4d} KB  {size[0]}x{size[1]}  q{q}  {name}')
print('largest:', max(r[2] for r in rows), 'KB; files:', len(rows))
