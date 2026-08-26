#!/usr/bin/env python3
"""Generate pixel-art character portraits (PNG, stdlib only).

Writes frontend/assets/characters/<id>/portrait.png for each hero defined
below. Re-run after tweaking any grid or palette:

    python tools/generate_character_art.py
"""
import os
import struct
import zlib

SCALE = 5  # each "pixel" of the grid becomes SCALE x SCALE real pixels

# ---------------------------------------------------------------------------
# Minimal PNG writer (RGBA, 8-bit, no filtering)
# ---------------------------------------------------------------------------

def write_png(path, width, height, rgba_rows):
    def chunk(tag, payload):
        return (
            struct.pack(">I", len(payload))
            + tag
            + payload
            + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    raw = b"".join(
        b"\x00" + bytes(v for px in row for v in px) for row in rgba_rows
    )
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(png)
    print("wrote", path, f"({width}x{height})")


def render_grid(grid, palette, out_path):
    """grid: list of strings; palette: char -> (r,g,b,a)."""
    width = len(grid[0])
    for i, row in enumerate(grid):
        if len(row) != width:
            raise ValueError(f"{out_path}: row {i} has {len(row)} cols, expected {width}")
        for ch in row:
            if ch not in palette:
                raise KeyError(f"{out_path}: row {i} uses unknown palette char '{ch}'")
    height = len(grid)
    rows = []
    for grid_row in grid:
        scaled_rows = [[] for _ in range(SCALE)]
        for ch in grid_row:
            color = palette[ch]
            for s_y in range(SCALE):
                scaled_rows[s_y].extend([color] * SCALE)
        rows.extend(scaled_rows)
    write_png(out_path, width * SCALE, height * SCALE, rows)


# ---------------------------------------------------------------------------
# Palettes (shared outline / skin tones)
# ---------------------------------------------------------------------------
O = (16, 18, 26, 255)      # outline
SKIN = (232, 185, 138, 255)
SKIN_D = (196, 142, 96, 255)
EYE_W = (240, 240, 240, 255)
BG = (0, 0, 0, 0)          # transparent

# --- Knight ---
KNIGHT_PAL = {
    ".": BG,
    "o": O,
    "h": (154, 165, 177, 255),   # steel helm
    "H": (92, 102, 114, 255),    # helm shade
    "r": (198, 40, 40, 255),     # red plume
    "f": SKIN,
    "F": SKIN_D,
    "e": (30, 34, 44, 255),      # eyes
    "a": (55, 71, 79, 255),      # armor body
    "A": (201, 168, 76, 255),    # gold trim
    "s": (129, 141, 155, 255),   # pauldron light
}

KNIGHT = [
    ".....orrrro.....",
    "....orrrrrro....",
    "...ohhhhhhhho...",
    "..ohhhhhhhhhho..",
    "..ohhhhhhhhhho..",
    ".ohhhhhhhhhhhho.",
    ".ohhHfffffHhhho.",
    ".ohfeeeffeeefho.",
    ".ohhffffffffhho.",
    "..oooffffffooo..",
    "..osaaaaaaso....",
    ".osaaaaaaaaso...",
    ".osaaAAAAaaso...",
    ".of.aaaaaa.fo...",
    "....aAAAaa......",
    "....aaa..aaa....",
    "...oAA...AAo....",
    "...oo.....oo....",
]

# --- Necromancer ---
NECRO_PAL = {
    ".": BG,
    "o": O,
    "p": (74, 20, 140, 255),     # hood purple
    "P": (49, 27, 146, 255),     # robe deep purple
    "d": (26, 5, 38, 255),       # hood shadow
    "e": (105, 240, 174, 255),   # glowing eyes
    "g": (200, 200, 210, 255),   # skull staff head
    "G": (140, 140, 150, 255),
    "t": (201, 168, 76, 255),    # trim
    "s": (123, 97, 175, 255),    # sleeve light
    "f": SKIN,                   # hands
    "w": (94, 78, 56, 255),      # staff wood
}

NECRO = [
    "......oggo......",
    ".....oggsggo....",
    "....oppppppo....",
    "...opppppppppo..",
    "..oppddddddpppo.",
    "..opddeeeddepo..",
    "..opddeeeddepo..",
    "..oppddddddppo..",
    "...oppppppppo...",
    "..opPtPPPPtPpo..",
    ".oppPPPPPPPPppo.",
    ".op.tPPPPPPt.po.",
    ".os.PPPPPPPP.so.",
    ".of.PPPPPPPP.fo.",
    "....PPttttPP....",
    "....PPPPPPPP....",
    "...wPP.PP.PPw...",
    "...ww.......ww..",
]

# --- Rogue ---
ROGUE_PAL = {
    ".": BG,
    "o": O,
    "k": (38, 50, 56, 255),      # dark hood
    "K": (55, 71, 79, 255),      # hood light edge
    "m": (20, 26, 30, 255),      # mask
    "e": (255, 179, 0, 255),     # amber eyes
    "l": (93, 64, 55, 255),      # leather
    "L": (62, 39, 35, 255),      # leather shade
    "b": (176, 190, 197, 255),   # blade
    "B": (120, 132, 140, 255),   # blade shade
    "g": (201, 168, 76, 255),    # buckle gold
    "f": SKIN,
}

ROGUE = [
    ".....okkkko.....",
    "....okkkkkko....",
    "...okkkkkkkko...",
    "..okkKKKKKKkko..",
    "..okmmmmmmmmko..",
    "..okmeeomeeemko.",
    "..okmmmmmmmmko..",
    "..okkmmmmmmkko..",
    "...okkkkkkkko...",
    "..okllllllllko..",
    ".okklgggggllkko.",
    ".ok.lllllll.bbo.",
    ".ob.lllllll.bbo.",
    ".oB.LLLLLLL.oBo.",
    "....llLLll......",
    "....ll..ll......",
    "...oLL..LLo.....",
    "...oo....oo.....",
]

HEROES = [
    ("knight", KNIGHT, KNIGHT_PAL),
    ("necromancer", NECRO, NECRO_PAL),
    ("rogue", ROGUE, ROGUE_PAL),
]


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for hero_id, grid, palette in HEROES:
        out = os.path.join(root, "frontend", "assets", "characters", hero_id, "portrait.png")
        render_grid(grid, palette, out)


if __name__ == "__main__":
    main()
