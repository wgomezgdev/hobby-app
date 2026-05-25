"""
UI mockup generator — Reading Companion App
Material 3 · 390×844 px · modern style
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os, math

W, H  = 390, 844
OUT   = os.path.dirname(__file__)

# ── Palette ──────────────────────────────────────────────────────────────────
BG           = (255, 251, 254)
SURFACE      = (255, 255, 255)
SURF_VAR     = (231, 224, 236)
SURF_CONT    = (243, 237, 247)
SURF_CONT_HI = (236, 230, 240)
PRIMARY      = (103,  80, 164)
PRIM_CONT    = (234, 221, 255)
ON_PRIMARY   = (255, 255, 255)
ON_PRIM_CONT = ( 33,   0,  93)
SECONDARY    = ( 98,  91, 113)
SEC_CONT     = (232, 222, 248)
TERTIARY     = (125,  82,  96)
TERT_CONT    = (255, 216, 228)
ON_SURFACE   = ( 28,  27,  31)
ON_SURF_VAR  = ( 73,  69,  79)
OUTLINE      = (121, 116, 126)
OUTLINE_VAR  = (202, 196, 208)
ERROR        = (179,  38,  30)
ERR_CONT     = (249, 222, 220)
STAR         = (250, 175,   0)
GREEN        = ( 27, 135,  63)
GREEN_CONT   = (197, 244, 214)
SCRIM        = (  0,   0,   0)
DIVIDER      = (230, 225, 229)

# Cover accent colours (per book)
COVER_PALETTES = [
    ((103,  80, 164), (189, 162, 255), "📖"),
    (( 20, 119, 178), (133, 193, 233), "📘"),
    ((211, 84,   0),  (245, 176, 130), "📙"),
    (( 39, 174, 96),  (171, 235, 198), "📗"),
    ((192,  57,  43), (241, 148, 138), "📕"),
    (( 91,  44, 111), (195, 155, 211), "📔"),
]

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

# ── Font helper ───────────────────────────────────────────────────────────────
FONT_PATHS = {
    "regular": "C:/Windows/Fonts/segoeui.ttf",
    "bold":    "C:/Windows/Fonts/segoeuib.ttf",
    "light":   "C:/Windows/Fonts/segoeuil.ttf",
}
_font_cache = {}
def fnt(size, weight="regular"):
    key = (size, weight)
    if key not in _font_cache:
        try:
            _font_cache[key] = ImageFont.truetype(FONT_PATHS.get(weight, FONT_PATHS["regular"]), size)
        except Exception:
            _font_cache[key] = ImageFont.load_default()
    return _font_cache[key]

# ── Drawing primitives ────────────────────────────────────────────────────────
def save(img, name):
    img.save(os.path.join(OUT, name))
    print(f"  OK  {name}")

def canvas():
    img = Image.new("RGB", (W, H), BG)
    d   = ImageDraw.Draw(img)
    return img, d

def rr(d, x1, y1, x2, y2, radius, fill=None, outline=None, width=1):
    d.rounded_rectangle([x1, y1, x2, y2], radius=radius,
                         fill=fill, outline=outline, width=width)

def txt(d, s, x, y, size=14, weight="regular", color=ON_SURFACE, anchor="la"):
    d.text((x, y), s, font=fnt(size, weight), fill=color, anchor=anchor)

def gradient_rect(img, x1, y1, x2, y2, color_top, color_bot, alpha=255):
    """Vertical gradient fill drawn line by line."""
    height = y2 - y1
    if height <= 0:
        return
    r1,g1,b1 = color_top
    r2,g2,b2 = color_bot
    d = ImageDraw.Draw(img)
    for i in range(height):
        t  = i / max(height - 1, 1)
        cr = int(r1 + (r2-r1)*t)
        cg = int(g1 + (g2-g1)*t)
        cb = int(b1 + (b2-b1)*t)
        d.line([(x1, y1+i), (x2, y1+i)], fill=(cr, cg, cb))

def shadow_card(img, x, y, w, h, radius=16, layers=4):
    """Draw a soft drop shadow then a white card on top."""
    d = ImageDraw.Draw(img)
    for i in range(layers, 0, -1):
        alpha = int(18 * i)
        rr(d, x+i, y+i, x+w+i, y+h+i, radius,
           fill=(0, 0, 0, alpha) if img.mode == "RGBA"
                else tuple(int(c*(1-alpha/255)+255*(alpha/255))
                            for c in (220, 215, 225)))
    rr(d, x, y, x+w, y+h, radius, fill=SURFACE)

def cover_block(img, x, y, w, h, palette_idx=0, radius=12, icon_size=36):
    """Gradient book cover with centred emoji."""
    top, bot, icon = COVER_PALETTES[palette_idx % len(COVER_PALETTES)]
    gradient_rect(img, x, y, x+w, y+h, top, bot)
    d = ImageDraw.Draw(img)
    rr(d, x, y, x+w, y+h, radius, outline=(255,255,255,80), width=0)
    txt(d, icon, x+w//2, y+h//2, icon_size, anchor="mm", color=(255,255,255))

def progress_bar(d, x, y, w, pct, h=8, radius=4):
    rr(d, x, y, x+w, y+h, radius, fill=PRIM_CONT)
    filled = max(radius*2, int(w * pct))
    rr(d, x, y, x+filled, y+h, radius, fill=PRIMARY)

def status_bar(d):
    rr(d, 0, 0, W, 44, 0, fill=BG)
    txt(d, "9:41", 18, 13, 13, "bold", ON_SURFACE)
    txt(d, "...  WiFi  [=]", W-18, 13, 12, "regular", ON_SURFACE, anchor="ra")

def bottom_nav(img, active="home"):
    d = ImageDraw.Draw(img)
    rr(d, 0, H-72, W, H, 0, fill=SURFACE)
    d.line([(0, H-72), (W, H-72)], fill=DIVIDER, width=1)
    tabs = [("home","Home","[H]"),("library","Library","[L]"),
            ("quotes","Quotes","[Q]"),("profile","Profile","[P]")]
    slot = W // 4
    for i,(key,label,sym) in enumerate(tabs):
        cx = slot*i + slot//2
        is_active = key == active
        if is_active:
            rr(d, cx-32, H-68, cx+32, H-42, 16, fill=PRIM_CONT)
        ico_color = ON_PRIM_CONT if is_active else ON_SURF_VAR
        lbl_color = PRIMARY     if is_active else ON_SURF_VAR
        # Icon (simplified symbol)
        icons = {"home":"⌂","library":"🗃","quotes":"❝","profile":"◉"}
        txt(d, icons[key], cx, H-55, 18, anchor="mm", color=ico_color)
        txt(d, label,      cx, H-26, 11, "bold" if is_active else "regular",
            lbl_color, anchor="mm")

def top_bar(d, title, back=False, actions="", elevation=False):
    if elevation:
        rr(d, 0, 44, W, 100, 0, fill=SURFACE)
        d.line([(0,100),(W,100)], fill=DIVIDER, width=1)
    txt(d, title, (52 if back else W//2), 72,
        18, "bold", ON_SURFACE, anchor=("lm" if back else "mm"))
    if back:
        txt(d, "←", 22, 72, 22, anchor="mm", color=ON_SURFACE)
    if actions:
        txt(d, actions, W-18, 72, 20, anchor="rm", color=ON_SURFACE)

def chip(d, label, x, y, active=False):
    w = len(label)*8 + 28
    bg  = SEC_CONT  if active else SURFACE
    fg  = ON_SURFACE if active else ON_SURF_VAR
    out = PRIMARY   if active else OUTLINE_VAR
    rr(d, x, y, x+w, y+32, 16, fill=bg, outline=out, width=2 if active else 1)
    txt(d, label, x+w//2, y+16, 13, "bold" if active else "regular", fg, anchor="mm")
    return w + 8

def tag_pill(d, label, x, y):
    w = len(label)*7+20
    rr(d, x, y, x+w, y+24, 12, fill=SEC_CONT)
    txt(d, label, x+w//2, y+12, 11, color=SECONDARY, anchor="mm")
    return w+6

def fab_button(d, x, y, icon="＋", extended=None):
    if extended:
        w = len(extended)*10+56
        rr(d, x-w+56, y, x+56, y+56, 16, fill=PRIMARY_CONT if False else PRIMARY)
        txt(d, icon, x-w+84, y+28, 20, anchor="mm", color=ON_PRIMARY)
        txt(d, extended, x-w+96+(len(extended)*5), y+28, 14,
            "bold", ON_PRIMARY, anchor="mm")
    else:
        rr(d, x, y, x+56, y+56, 16, fill=PRIMARY)
        txt(d, icon, x+28, y+28, 24, "bold", ON_PRIMARY, anchor="mm")

# Fix: PRIMARY_CONT not defined, use PRIM_CONT
PRIMARY_CONT = PRIM_CONT

def divider_line(d, y, indent=16):
    d.line([(indent, y), (W-indent, y)], fill=DIVIDER, width=1)

def badge(d, text_val, x, y, bg=PRIM_CONT, fg=ON_PRIM_CONT):
    w = len(text_val)*8+24
    rr(d, x, y, x+w, y+28, 14, fill=bg)
    txt(d, text_val, x+w//2, y+14, 12, "bold", fg, anchor="mm")
    return w

def star_row(d, x, y, filled=4, empty=5, size=20):
    for i in range(empty):
        c = STAR if i < filled else OUTLINE_VAR
        txt(d, "★", x+i*(size+3), y, size, color=c)

def outlined_field(d, label, value, x, y, w, focused=False, error=""):
    border = ERROR if error else (PRIMARY if focused else OUTLINE_VAR)
    bw     = 2     if focused or error else 1
    txt(d, label, x+12, y-8, 11, "bold", border)
    rr(d, x, y, x+w, y+48, 10, fill=SURF_CONT, outline=border, width=bw)
    txt(d, value if value else ("" ), x+16, y+24, 14,
        color=ON_SURFACE if value else OUTLINE, anchor="lm")
    if error:
        txt(d, error, x, y+52, 11, color=ERROR)


# ════════════════════════════════════════════════════════════════════════════
# 01 — Sign-in
# ════════════════════════════════════════════════════════════════════════════
def screen_signin():
    img, d = canvas()
    # soft purple gradient top half
    gradient_rect(img, 0, 0, W, 460, (103, 80, 164), (180, 155, 220))
    gradient_rect(img, 0, 460, W, H, (255, 251, 254), (255, 251, 254))

    # decorative circles
    for cx,cy,r,alpha in [(320,80,90,30),(60,200,60,20),(-20,350,80,15)]:
        circ = Image.new("RGBA", (W,H), (0,0,0,0))
        dc   = ImageDraw.Draw(circ)
        dc.ellipse([cx-r,cy-r,cx+r,cy+r], fill=(255,255,255,alpha))
        img.paste(Image.alpha_composite(img.convert("RGBA"), circ).convert("RGB"))
        d = ImageDraw.Draw(img)

    status_bar(d)

    # logo card
    shadow_card(img, W//2-52, 140, 104, 104, radius=32)
    d = ImageDraw.Draw(img)
    txt(d, "📖", W//2, 192, 52, anchor="mm")

    txt(d, "Reading", W//2, 272, 30, "bold", (255,255,255), anchor="mm")
    txt(d, "Companion", W//2, 306, 30, "bold", (255,255,255), anchor="mm")
    txt(d, "Track books · Save quotes · Stay inspired",
        W//2, 338, 13, color=(230,220,255), anchor="mm")

    # white card at bottom
    shadow_card(img, 20, 430, W-40, 280, radius=24)
    d = ImageDraw.Draw(img)

    txt(d, "Welcome back", W//2, 468, 20, "bold", ON_SURFACE, anchor="mm")
    txt(d, "Sign in to sync your reading across devices",
        W//2, 494, 13, color=ON_SURF_VAR, anchor="mm")

    # Google button
    rr(d, 40, 522, W-40, 578, 28, fill=SURFACE, outline=OUTLINE_VAR, width=1)
    # G logo simulation
    rr(d, 60, 538, 88, 562, 6, fill=(234,234,234))
    txt(d, "G", 74, 550, 16, "bold", (66,133,244), anchor="mm")
    txt(d, "Continue with Google", W//2+12, 550, 15, "bold", ON_SURFACE, anchor="mm")

    txt(d, "By continuing you agree to our Terms & Privacy Policy",
        W//2, 598, 11, color=OUTLINE, anchor="mm")

    txt(d, "No password needed · One tap sign in",
        W//2, 622, 12, color=PRIMARY, anchor="mm")

    save(img, "01-sign-in.png")


# ════════════════════════════════════════════════════════════════════════════
# 02 — Home Dashboard
# ════════════════════════════════════════════════════════════════════════════
def screen_home():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 160, (103,80,164), (150,120,200))
    gradient_rect(img, 0, 160, W, H, BG, BG)

    d = ImageDraw.Draw(img)
    status_bar(d)

    txt(d, "Good morning 👋", 20, 58, 13, color=(230,220,255))
    txt(d, "Wilson", 20, 78, 24, "bold", (255,255,255))

    # streak badge
    rr(d, W-100, 58, W-16, 90, 16, fill=(255,255,255,0))
    rr(d, W-108, 54, W-12, 92, 19, fill=(255,255,255))
    d = ImageDraw.Draw(img)
    txt(d, "🔥 12 days", W-60, 73, 13, "bold", PRIMARY, anchor="mm")

    # section label
    txt(d, "Currently Reading", 20, 176, 15, "bold", ON_SURFACE)

    # Book card 1
    shadow_card(img, 16, 200, W-32, 150, radius=20)
    d = ImageDraw.Draw(img)
    cover_block(img, 28, 212, 80, 114, 0, radius=12, icon_size=38)
    d = ImageDraw.Draw(img)
    txt(d, "Atomic Habits", 124, 218, 16, "bold", ON_SURFACE)
    txt(d, "James Clear", 124, 240, 12, color=ON_SURF_VAR)

    rr(d, 124, 258, 254, 272, 4, fill=PRIM_CONT)
    rr(d, 124, 258, 124+int(130*0.68), 272, 4, fill=PRIMARY)
    txt(d, "68%  ·  p. 204/300", 124, 278, 11, color=ON_SURF_VAR)

    rr(d, 124, 298, 220, 330, 10, fill=PRIMARY)
    txt(d, "Log session", 172, 314, 12, "bold", ON_PRIMARY, anchor="mm")
    rr(d, 226, 298, 352, 330, 10, fill=PRIM_CONT)
    txt(d, "Add quote", 289, 314, 12, "bold", ON_PRIM_CONT, anchor="mm")

    # Book card 2
    shadow_card(img, 16, 364, W-32, 150, radius=20)
    d = ImageDraw.Draw(img)
    cover_block(img, 28, 376, 80, 114, 1, radius=12, icon_size=38)
    d = ImageDraw.Draw(img)
    txt(d, "Deep Work", 124, 382, 16, "bold", ON_SURFACE)
    txt(d, "Cal Newport", 124, 404, 12, color=ON_SURF_VAR)

    rr(d, 124, 422, 254, 436, 4, fill=PRIM_CONT)
    rr(d, 124, 422, 124+int(130*0.32), 436, 4, fill=PRIMARY)
    txt(d, "32%  ·  p. 89/277", 124, 442, 11, color=ON_SURF_VAR)

    rr(d, 124, 462, 220, 494, 10, fill=PRIMARY)
    txt(d, "Log session", 172, 478, 12, "bold", ON_PRIMARY, anchor="mm")
    rr(d, 226, 462, 352, 494, 10, fill=PRIM_CONT)
    txt(d, "Add quote", 289, 478, 12, "bold", ON_PRIM_CONT, anchor="mm")

    fab_button(d, W-72, H-148)
    bottom_nav(img, "home")
    save(img, "02-home-dashboard.png")


# ════════════════════════════════════════════════════════════════════════════
# 03 — Library Grid
# ════════════════════════════════════════════════════════════════════════════
def screen_library_grid():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 100, (103,80,164), (140,110,190))
    gradient_rect(img, 0, 100, W, H, BG, BG)
    d = ImageDraw.Draw(img)

    status_bar(d)
    txt(d, "My Library", W//2, 74, 20, "bold", (255,255,255), anchor="mm")
    txt(d, "⊞", W-20, 74, 20, color=(255,255,255), anchor="rm")

    x = 16
    for lbl, active in [("All",True),("Reading",False),("Finished",False),("Want",False)]:
        x += chip(d, lbl, x, 112)

    cw, ch = (W-48)//2, 188
    books = [
        ("Atomic Habits","James Clear","★★★★★","Reading",0),
        ("Deep Work","Cal Newport","★★★★☆","Reading",1),
        ("The Lean Startup","E. Ries","★★★☆☆","Finished",2),
        ("Sapiens","Y. Harari","★★★★★","Finished",3),
        ("1984","G. Orwell","★★★★☆","Finished",4),
        ("Dune","F. Herbert","—","Want",5),
    ]
    for i,(title,author,stars,status,pi) in enumerate(books):
        col = i % 2
        row = i // 2
        bx  = 16 + col*(cw+16)
        by  = 156 + row*(ch+12)
        shadow_card(img, bx, by, cw, ch, radius=16)
        d = ImageDraw.Draw(img)
        cover_block(img, bx+8, by+8, cw-16, 108, pi, radius=10, icon_size=32)
        d = ImageDraw.Draw(img)
        txt(d, title[:16], bx+10, by+124, 13, "bold", ON_SURFACE)
        txt(d, author[:14], bx+10, by+141, 11, color=ON_SURF_VAR)
        sc = (27,135,63) if status=="Reading" else (PRIMARY if status=="Finished" else OUTLINE)
        txt(d, status, bx+10, by+158, 10, color=sc)
        txt(d, stars, bx+10, by+172, 11, color=STAR)

    fab_button(d, W-72, H-148)
    bottom_nav(img, "library")
    save(img, "03-library-grid.png")


# ════════════════════════════════════════════════════════════════════════════
# 04 — Library List
# ════════════════════════════════════════════════════════════════════════════
def screen_library_list():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 100, (103,80,164), (140,110,190))
    gradient_rect(img, 0, 100, W, H, BG, BG)
    d = ImageDraw.Draw(img)
    status_bar(d)

    txt(d, "My Library", W//2, 74, 20, "bold", (255,255,255), anchor="mm")
    txt(d, "⊟", W-20, 74, 20, color=(255,255,255), anchor="rm")

    x=16
    for lbl,active in [("All",True),("Reading",False),("Finished",False),("Want",False)]:
        x += chip(d, lbl, x, 112)

    books = [
        ("Atomic Habits","James Clear","Reading",4,0.68,0),
        ("Deep Work","Cal Newport","Reading",4,0.32,1),
        ("The Lean Startup","Eric Ries","Finished",3,1.0,2),
        ("Sapiens","Yuval Harari","Want to Read",5,0.0,3),
        ("1984","George Orwell","Finished",4,1.0,4),
    ]
    for i,(title,author,status,stars,pct,pi) in enumerate(books):
        by = 152+i*92
        shadow_card(img, 12, by, W-24, 80, radius=14)
        d = ImageDraw.Draw(img)
        cover_block(img, 22, by+10, 52, 60, pi, radius=8, icon_size=24)
        d = ImageDraw.Draw(img)
        txt(d, title,  86, by+14, 14, "bold")
        txt(d, author, 86, by+32, 12, color=ON_SURF_VAR)
        sc = GREEN if status=="Reading" else (PRIMARY if status=="Finished" else OUTLINE)
        txt(d, status, 86, by+50, 11, color=sc)
        if 0 < pct < 1.0:
            progress_bar(d, 86, by+66, W-106, pct, h=4)
        star_row(d, W-122, by+14, filled=stars, empty=5, size=14)

    fab_button(d, W-72, H-148)
    bottom_nav(img, "library")
    save(img, "04-library-list.png")


# ════════════════════════════════════════════════════════════════════════════
# 05 — Book Detail — Progress
# ════════════════════════════════════════════════════════════════════════════
def screen_book_detail_progress():
    img, d = canvas()

    # hero
    gradient_rect(img, 0, 0, W, 250, COVER_PALETTES[0][0], COVER_PALETTES[0][1])
    d = ImageDraw.Draw(img)
    txt(d, COVER_PALETTES[0][2], W//2, 148, 72, anchor="mm", color=(255,255,255))
    status_bar(d)
    txt(d, "←", 22, 72, 22, anchor="mm", color=(255,255,255))
    txt(d, "⋮", W-18, 72, 22, anchor="rm", color=(255,255,255))

    # info strip
    rr(d, 0, 230, W, 300, 0, fill=SURFACE)
    txt(d, "Atomic Habits", W//2, 248, 19, "bold", ON_SURFACE, anchor="mm")
    txt(d, "James Clear  ·  300 pages", W//2, 270, 12, color=ON_SURF_VAR, anchor="mm")
    star_row(d, W//2-48, 284, filled=5, size=16)

    # tabs
    rr(d, 0, 300, W, 348, 0, fill=SURFACE)
    d.line([(0,348),(W,348)], fill=DIVIDER, width=1)
    for i,(lbl,active) in enumerate([("Progress",True),("Quotes",False),("Ranking",False)]):
        tx = (W//3)*i + W//6
        c  = PRIMARY if active else ON_SURF_VAR
        w  = "bold" if active else "regular"
        txt(d, lbl, tx, 324, 14, w, c, anchor="mm")
        if active:
            rr(d, (W//3)*i+24, 343, (W//3)*(i+1)-24, 348, 2, fill=PRIMARY)

    # progress ring simulation (just text + big bar)
    txt(d, "68%", W//2, 408, 36, "bold", PRIMARY, anchor="mm")
    txt(d, "of Atomic Habits complete", W//2, 440, 12, color=ON_SURF_VAR, anchor="mm")
    progress_bar(d, 24, 460, W-48, 0.68, h=14)
    txt(d, "204 pages read  ·  96 remaining", W//2, 488, 12, color=ON_SURF_VAR, anchor="mm")

    rr(d, 24, 508, W-24, 556, 14, fill=PRIMARY)
    txt(d, "📝   Log Reading Session", W//2, 532, 14, "bold", ON_PRIMARY, anchor="mm")

    txt(d, "Session History", 20, 572, 14, "bold", ON_SURFACE)
    sessions = [
        ("Today · 9:30 AM", "p. 180 → 204", "24 min"),
        ("Yesterday · 8:15 PM","p. 140 → 180","38 min"),
        ("May 23 · 7:00 PM","p. 100 → 140","42 min"),
    ]
    for i,(date,pages,dur) in enumerate(sessions):
        sy = 598 + i*64
        shadow_card(img, 16, sy, W-32, 54, radius=12)
        d = ImageDraw.Draw(img)
        txt(d, date,  28, sy+12, 13, "bold")
        txt(d, pages, 28, sy+30, 12, color=ON_SURF_VAR)
        txt(d, dur, W-28, sy+22, 13, color=PRIMARY, anchor="rm")

    bottom_nav(img, "library")
    save(img, "05-book-detail-progress.png")


# ════════════════════════════════════════════════════════════════════════════
# 06 — Book Detail — Quotes
# ════════════════════════════════════════════════════════════════════════════
def screen_book_detail_quotes():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 250, COVER_PALETTES[0][0], COVER_PALETTES[0][1])
    d = ImageDraw.Draw(img)
    txt(d, COVER_PALETTES[0][2], W//2, 148, 72, anchor="mm", color=(255,255,255))
    status_bar(d)
    txt(d, "←", 22, 72, 22, anchor="mm", color=(255,255,255))

    rr(d, 0, 230, W, 300, 0, fill=SURFACE)
    txt(d, "Atomic Habits", W//2, 248, 19, "bold", ON_SURFACE, anchor="mm")
    txt(d, "James Clear  ·  300 pages", W//2, 270, 12, color=ON_SURF_VAR, anchor="mm")

    rr(d, 0, 300, W, 348, 0, fill=SURFACE)
    d.line([(0,348),(W,348)], fill=DIVIDER, width=1)
    for i,(lbl,active) in enumerate([("Progress",False),("Quotes",True),("Ranking",False)]):
        tx = (W//3)*i + W//6
        c  = PRIMARY if active else ON_SURF_VAR
        w  = "bold" if active else "regular"
        txt(d, lbl, tx, 324, 14, w, c, anchor="mm")
        if active:
            rr(d, (W//3)*i+24, 343, (W//3)*(i+1)-24, 348, 2, fill=PRIMARY)

    # search bar
    rr(d, 16, 358, W-16, 398, 20, fill=SURF_CONT, outline=OUTLINE_VAR, width=1)
    txt(d, "🔍  Search quotes…", 44, 378, 13, color=OUTLINE, anchor="lm")

    quotes = [
        ("You do not rise to the level of your\ngoals. You fall to the level of your\nsystems.",
         "p. 27", ["habits","systems"], True),
        ("Every action you take is a vote for\nthe type of person you wish to become.",
         "p. 38", ["identity"], False),
        ("The most effective form of learning\nis practice, not planning.",
         "p. 142", ["learning"], False),
    ]
    qy = 410
    for lines, page, tags, fav in quotes:
        h_est = 60 + len(tags)*0 + 26
        shadow_card(img, 16, qy, W-32, int(h_est)+32, radius=16)
        d = ImageDraw.Draw(img)
        rr(d, 16, qy, 22, qy+int(h_est)+32, 3, fill=PRIMARY)
        for li, line in enumerate(lines.split("\n")):
            txt(d, line, 30, qy+12+li*18, 13, color=ON_SURFACE)
        tx = 30
        for tag in tags:
            tx += tag_pill(d, tag, tx, qy+12+len(lines.split("\n"))*18+4)
        txt(d, page, W-28, qy+12, 11, color=ON_SURF_VAR, anchor="ra")
        heart = "♥" if fav else "♡"
        txt(d, heart, W-28, qy+h_est, 18, color=PRIMARY if fav else OUTLINE_VAR, anchor="ra")
        qy += int(h_est) + 44

    fab_button(d, W-72, H-148, "＋")
    bottom_nav(img, "library")
    save(img, "06-book-detail-quotes.png")


# ════════════════════════════════════════════════════════════════════════════
# 07 — Book Detail — Ranking
# ════════════════════════════════════════════════════════════════════════════
def screen_book_detail_ranking():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 250, COVER_PALETTES[0][0], COVER_PALETTES[0][1])
    d = ImageDraw.Draw(img)
    txt(d, COVER_PALETTES[0][2], W//2, 148, 72, anchor="mm", color=(255,255,255))
    status_bar(d)
    txt(d, "←", 22, 72, 22, anchor="mm", color=(255,255,255))

    rr(d, 0, 230, W, 300, 0, fill=SURFACE)
    txt(d, "Atomic Habits", W//2, 248, 19, "bold", ON_SURFACE, anchor="mm")
    txt(d, "James Clear  ·  300 pages", W//2, 270, 12, color=ON_SURF_VAR, anchor="mm")

    rr(d, 0, 300, W, 348, 0, fill=SURFACE)
    d.line([(0,348),(W,348)], fill=DIVIDER, width=1)
    for i,(lbl,active) in enumerate([("Progress",False),("Quotes",False),("Ranking",True)]):
        tx = (W//3)*i + W//6
        c  = PRIMARY if active else ON_SURF_VAR
        w  = "bold" if active else "regular"
        txt(d, lbl, tx, 324, 14, w, c, anchor="mm")
        if active:
            rr(d, (W//3)*i+24, 343, (W//3)*(i+1)-24, 348, 2, fill=PRIMARY)

    txt(d, "How would you rate this book?", W//2, 382, 14, color=ON_SURF_VAR, anchor="mm")

    # big stars
    star_size = 42
    total_w   = 5*star_size + 4*8
    sx        = (W - total_w) // 2
    for i in range(5):
        c = STAR if i < 4 else OUTLINE_VAR
        txt(d, "★", sx + i*(star_size+8), 410, star_size, color=c)

    txt(d, "4 out of 5 · Excellent", W//2, 468, 13, color=ON_SURF_VAR, anchor="mm")

    txt(d, "Your review", 20, 492, 13, "bold", ON_SURFACE)
    rr(d, 16, 514, W-16, 634, 14, fill=SURF_CONT, outline=OUTLINE_VAR, width=1)
    lines = [
        "One of the best books I've read this year.",
        "Clear's writing style is accessible and",
        "the framework genuinely changed my daily",
        "habits. Highly recommend to everyone.",
    ]
    for i,l in enumerate(lines):
        txt(d, l, 28, 528+i*22, 13, color=ON_SURFACE)

    rr(d, 16, 650, W-16, 698, 14, fill=PRIMARY)
    txt(d, "Save Rating & Review", W//2, 674, 15, "bold", ON_PRIMARY, anchor="mm")

    bottom_nav(img, "library")
    save(img, "07-book-detail-ranking.png")


# ════════════════════════════════════════════════════════════════════════════
# 08 — Add / Edit Book
# ════════════════════════════════════════════════════════════════════════════
def screen_add_book():
    img, d = canvas()
    rr(d, 0, 0, W, H, 0, fill=BG)
    gradient_rect(img, 0, 0, W, 100, (103,80,164),(140,110,190))
    d = ImageDraw.Draw(img)
    status_bar(d)
    txt(d, "←", 22, 72, 22, anchor="mm", color=(255,255,255))
    txt(d, "Add Book", W//2, 74, 18, "bold", (255,255,255), anchor="mm")
    txt(d, "Save", W-20, 74, 15, "bold", (220,200,255), anchor="rm")

    outlined_field(d, "Title *", "Atomic Habits", 20, 124, W-40, focused=True)
    outlined_field(d, "Author *", "James Clear", 20, 196, W-40)
    outlined_field(d, "Total Pages *", "300", 20, 268, W-40)

    txt(d, "Status", 20, 340, 12, "bold", PRIMARY)
    x = 20
    for lbl, active in [("Want to Read",True),("Reading",False),("Finished",False)]:
        x += chip(d, lbl, x, 358)

    txt(d, "Cover Image", 20, 406, 12, "bold", ON_SURF_VAR)
    shadow_card(img, 16, 426, W-32, 140, radius=16)
    d = ImageDraw.Draw(img)
    gradient_rect(img, 24, 434, W-24, 558, (200,180,240),(230,210,255))
    rr(d, 24, 434, W-24, 558, 12)  # re-draw border
    d = ImageDraw.Draw(img)
    txt(d, "📷", W//2, 490, 34, anchor="mm")
    txt(d, "Tap to upload a cover image", W//2, 528, 13, color=PRIMARY, anchor="mm")
    txt(d, "JPG · PNG · max 5 MB", W//2, 546, 11, color=OUTLINE, anchor="mm")

    rr(d, 16, 578, W-16, 626, 14, fill=PRIMARY)
    txt(d, "Add to Library", W//2, 602, 15, "bold", ON_PRIMARY, anchor="mm")

    save(img, "08-add-edit-book.png")


# ════════════════════════════════════════════════════════════════════════════
# 09 — Log Session (bottom sheet)
# ════════════════════════════════════════════════════════════════════════════
def screen_log_session():
    img, d = canvas()
    # blurred-looking background (just dark overlay)
    gradient_rect(img, 0, 0, W, H, (40,30,60),(28,27,31))
    d = ImageDraw.Draw(img)

    # translucent top cards visible in background
    rr(d, 20, 80, W-20, 220, 20, fill=(60,50,90))
    txt(d, "Atomic Habits", 40, 130, 16, "bold", (180,160,220))
    txt(d, "68% · p. 204/300", 40, 154, 12, color=(140,120,180))

    # sheet
    sy = 306
    rr(d, 0, sy, W, H, 24, fill=SURFACE)
    rr(d, W//2-22, sy+14, W//2+22, sy+18, 3, fill=OUTLINE_VAR)

    txt(d, "Log Reading Session", W//2, sy+48, 18, "bold", ON_SURFACE, anchor="mm")
    rr(d, W//2-64, sy+62, W//2+64, sy+84, 12, fill=PRIM_CONT)
    txt(d, "Atomic Habits", W//2, sy+73, 13, "bold", ON_PRIM_CONT, anchor="mm")

    outlined_field(d, "From page", "204", 20, sy+100, (W-48)//2, focused=False)
    outlined_field(d, "To page",   "228", 20+(W-48)//2+8, sy+100, (W-48)//2, focused=True)
    outlined_field(d, "Duration (minutes)", "25", 20, sy+172, W-40)
    outlined_field(d, "Date & time", "Today, 9:41 AM", 20, sy+244, W-40)

    txt(d, "Notes  (optional)", 20, sy+316, 12, "bold", ON_SURF_VAR)
    rr(d, 20, sy+334, W-20, sy+394, 12, fill=SURF_CONT, outline=OUTLINE_VAR, width=1)
    txt(d, "Great session, really focused today…", 32, sy+352, 13, color=ON_SURF_VAR)

    rr(d, 16, sy+410, W-16, sy+458, 14, fill=PRIMARY)
    txt(d, "Save Session", W//2, sy+434, 15, "bold", ON_PRIMARY, anchor="mm")

    save(img, "09-log-session-sheet.png")


# ════════════════════════════════════════════════════════════════════════════
# 10 — Add Quote (bottom sheet)
# ════════════════════════════════════════════════════════════════════════════
def screen_add_quote():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, H, (40,30,60),(28,27,31))
    d = ImageDraw.Draw(img)

    rr(d, 20, 60, W-20, 200, 20, fill=(60,50,90))
    txt(d, "Atomic Habits", 40, 110, 16, "bold", (180,160,220))

    sy = 224
    rr(d, 0, sy, W, H, 24, fill=SURFACE)
    rr(d, W//2-22, sy+14, W//2+22, sy+18, 3, fill=OUTLINE_VAR)

    txt(d, "Save Quote", W//2, sy+48, 18, "bold", ON_SURFACE, anchor="mm")
    rr(d, W//2-64, sy+62, W//2+64, sy+84, 12, fill=PRIM_CONT)
    txt(d, "Atomic Habits", W//2, sy+73, 13, "bold", ON_PRIM_CONT, anchor="mm")

    txt(d, "Quote Text *", 20, sy+100, 12, "bold", PRIMARY)
    rr(d, 20, sy+118, W-20, sy+230, 12, fill=SURF_CONT, outline=PRIMARY, width=2)
    lines = [
        "You do not rise to the level of your",
        "goals. You fall to the level of your",
        "systems.",
    ]
    for i,l in enumerate(lines):
        txt(d, l, 32, sy+132+i*22, 14, color=ON_SURFACE)

    outlined_field(d, "Page number  (optional)", "27", 20, sy+248, 120)

    txt(d, "Tags", 20, sy+320, 12, "bold", ON_SURF_VAR)
    tx = 20
    for tag in ["habits","systems"]:
        tx += tag_pill(d, tag, tx, sy+338)
    rr(d, tx, sy+338, tx+70, sy+362, 12, fill=SURF_CONT, outline=OUTLINE_VAR, width=1)
    txt(d, "+ Add tag", tx+35, sy+350, 12, color=OUTLINE, anchor="mm")

    txt(d, "Mark as Favorite", 20, sy+380, 13, color=ON_SURFACE)
    rr(d, W-66, sy+374, W-18, sy+398, 12, fill=PRIMARY)
    rr(d, W-36, sy+377, W-21, sy+395, 9, fill=SURFACE)

    rr(d, 16, sy+410, W-16, sy+458, 14, fill=PRIMARY)
    txt(d, "Save Quote", W//2, sy+434, 15, "bold", ON_PRIMARY, anchor="mm")

    save(img, "10-add-quote-sheet.png")


# ════════════════════════════════════════════════════════════════════════════
# 11 — Quotes (global tab)
# ════════════════════════════════════════════════════════════════════════════
def screen_quotes_global():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 100, (103,80,164),(140,110,190))
    gradient_rect(img, 0, 100, W, H, BG, BG)
    d = ImageDraw.Draw(img)
    status_bar(d)
    txt(d, "Quotes", W//2, 74, 20, "bold", (255,255,255), anchor="mm")

    rr(d, 16, 108, W-16, 150, 20, fill=SURF_CONT, outline=OUTLINE_VAR, width=1)
    txt(d, "🔍  Search all quotes…", 44, 129, 13, color=OUTLINE, anchor="lm")

    x = 16
    for lbl, active in [("All",True),("Favorites",False),("habits",False),("focus",False)]:
        x += chip(d, lbl, x, 160)

    quotes = [
        ("You do not rise to the level of your\ngoals. You fall to the level of your\nsystems.",
         "Atomic Habits","p. 27",["habits","systems"],True),
        ("Deep work is the ability to focus\nwithout distraction on cognitively\ndemanding tasks.",
         "Deep Work","p. 3",["focus"],False),
        ("Every action you take is a vote for\nthe type of person you wish to become.",
         "Atomic Habits","p. 38",["identity"],False),
    ]
    qy = 204
    for lines, book, page, tags, fav in quotes:
        nlines = len(lines.split("\n"))
        h_est  = 20 + nlines*18 + 10 + 28
        shadow_card(img, 16, qy, W-32, h_est, radius=16)
        d = ImageDraw.Draw(img)
        rr(d, 16, qy, 22, qy+h_est, 3, fill=TERTIARY)
        for li, line in enumerate(lines.split("\n")):
            txt(d, line, 30, qy+12+li*18, 13)
        txt(d, book, 30, qy+12+nlines*18+4, 11, "bold", TERTIARY)
        tx = 30 + len(book)*7+16
        txt(d, "·", tx, qy+12+nlines*18+4, 11, color=OUTLINE)
        tx += 14
        for tag in tags:
            tx += tag_pill(d, tag, tx, qy+12+nlines*18-2)
        txt(d, page, W-28, qy+12, 11, color=ON_SURF_VAR, anchor="ra")
        heart = "♥" if fav else "♡"
        txt(d, heart, W-28, qy+h_est-22, 18,
            color=TERTIARY if fav else OUTLINE_VAR, anchor="ra")
        qy += h_est + 12

    fab_button(d, W-72, H-148, "＋")
    bottom_nav(img, "quotes")
    save(img, "11-quotes-global.png")


# ════════════════════════════════════════════════════════════════════════════
# 12 — Profile
# ════════════════════════════════════════════════════════════════════════════
def screen_profile():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 230, (103,80,164),(140,110,190))
    gradient_rect(img, 0, 230, W, H, BG, BG)
    d = ImageDraw.Draw(img)
    status_bar(d)
    txt(d, "Profile", W//2, 74, 20, "bold", (255,255,255), anchor="mm")

    # avatar
    r = 44
    rr(d, W//2-r-3, 148-r-3, W//2+r+3, 148+r+3, r+3, fill=(255,255,255))
    rr(d, W//2-r, 148-r, W//2+r, 148+r, r, fill=TERTIARY)
    txt(d, "W", W//2, 148, 32, "bold", (255,255,255), anchor="mm")

    txt(d, "Wilson Gómez", W//2, 210, 18, "bold", (255,255,255), anchor="mm")
    txt(d, "wilsongomez8419@gmail.com", W//2, 232, 12, color=(220,200,255), anchor="mm")

    # stats row
    stats = [("12","Books read","📚"),("47","Quotes saved","❝"),("12","Day streak","🔥")]
    sw = (W-48)//3
    for i,(val,lbl,ico) in enumerate(stats):
        sx = 16+i*(sw+8)
        shadow_card(img, sx, 256, sw, 78, radius=14)
        d = ImageDraw.Draw(img)
        txt(d, ico, sx+sw//2, 278, 20, anchor="mm")
        txt(d, val, sx+sw//2, 298, 20, "bold", PRIMARY, anchor="mm")
        txt(d, lbl, sx+sw//2, 318, 10, color=ON_SURF_VAR, anchor="mm")

    txt(d, "Settings", 20, 354, 12, "bold", ON_SURF_VAR)

    settings = [
        ("Appearance", "🎨", "Light mode", False, None),
        ("Dark Mode",  "🌙", "",            True,  False),
        ("Notifications","🔔","",           True,  True),
    ]
    for i,(label,ico,sub,has_toggle,tog_on) in enumerate(settings):
        sy = 372+i*64
        shadow_card(img, 12, sy, W-24, 56, radius=14)
        d = ImageDraw.Draw(img)
        rr(d, 22, sy+12, 54, sy+44, 10, fill=PRIM_CONT)
        txt(d, ico, 38, sy+28, 17, anchor="mm", color=PRIMARY)
        txt(d, label, 64, sy+16, 14, "bold", ON_SURFACE)
        if sub:
            txt(d, sub, 64, sy+34, 12, color=ON_SURF_VAR)
        if has_toggle:
            bg  = PRIMARY if tog_on else OUTLINE_VAR
            rr(d, W-62, sy+18, W-18, sy+42, 12, fill=bg)
            kx  = W-28 if tog_on else W-52
            rr(d, kx-10, sy+21, kx+10, sy+39, 9, fill=SURFACE)
        else:
            txt(d, "›", W-20, sy+28, 20, color=OUTLINE, anchor="rm")

    divider_line(d, 564)
    txt(d, "Sign Out", W//2, 584, 14, "bold", ERROR, anchor="mm")

    txt(d, "Version 1.0.0 · Reading Companion", W//2, 614, 11, color=OUTLINE, anchor="mm")

    bottom_nav(img, "profile")
    save(img, "12-profile.png")


# ════════════════════════════════════════════════════════════════════════════
# 13 — Home Empty State
# ════════════════════════════════════════════════════════════════════════════
def screen_home_empty():
    img, d = canvas()
    gradient_rect(img, 0, 0, W, 160, (103,80,164),(140,110,190))
    gradient_rect(img, 0, 160, W, H, BG, BG)
    d = ImageDraw.Draw(img)
    status_bar(d)
    txt(d, "Good morning, Wilson 👋", 20, 68, 16, "bold", (255,255,255))

    # illustration area
    rr(d, W//2-80, 230, W//2+80, 390, 24, fill=PRIM_CONT)
    txt(d, "📚", W//2, 310, 64, anchor="mm")

    txt(d, "No books in progress", W//2, 418, 20, "bold", ON_SURFACE, anchor="mm")
    txt(d, "Start your reading journey today.", W//2, 446, 14, color=ON_SURF_VAR, anchor="mm")
    txt(d, "Add a book and log your first session.", W//2, 466, 14, color=ON_SURF_VAR, anchor="mm")

    rr(d, W//2-110, 496, W//2+110, 544, 24, fill=PRIMARY)
    txt(d, "＋  Start reading a book", W//2, 520, 14, "bold", ON_PRIMARY, anchor="mm")

    rr(d, W//2-80, 560, W//2+80, 600, 20, fill=PRIM_CONT)
    txt(d, "Browse suggestions", W//2, 580, 13, "bold", ON_PRIM_CONT, anchor="mm")

    fab_button(d, W-72, H-148)
    bottom_nav(img, "home")
    save(img, "13-home-empty-state.png")


# ════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("Generating screens...")
    screen_signin()
    screen_home()
    screen_library_grid()
    screen_library_list()
    screen_book_detail_progress()
    screen_book_detail_quotes()
    screen_book_detail_ranking()
    screen_add_book()
    screen_log_session()
    screen_add_quote()
    screen_quotes_global()
    screen_profile()
    screen_home_empty()
    print("\nDone -- 13 screens in ui-design/")
