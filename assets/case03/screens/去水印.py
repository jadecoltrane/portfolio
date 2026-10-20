import sys
from PIL import Image, ImageFilter
import numpy as np

def run_len(mask, axis):
    """For each True pixel, the length of the maximal run of True along `axis`."""
    m = mask if axis == 1 else mask.T
    h, w = m.shape
    out = np.zeros((h, w), np.int32)
    fwd = np.zeros((h, w), np.int32)
    c = np.zeros(h, np.int32)
    for x in range(w):
        c = np.where(m[:, x], c + 1, 0); fwd[:, x] = c
    c[:] = 0
    bwd = np.zeros((h, w), np.int32)
    for x in range(w - 1, -1, -1):
        c = np.where(m[:, x], c + 1, 0); bwd[:, x] = c
    out = np.where(m, fwd + bwd - 1, 0)
    return out if axis == 1 else out.T

def dewatermark(path, out, line_len=15):
    im = Image.open(path).convert('RGB')
    bg = im.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MaxFilter(9))
    a = np.asarray(im).astype(np.int16)
    b = np.asarray(bg).astype(np.int16)
    g, gb = a.mean(2), b.mean(2)
    mask = ((gb - g) > 0) & ((gb - g) <= 35) & (g > 170)
    # a faint pixel sitting in a long straight run is a real rule or border, not the
    # watermark: its glyphs are rotated, so they never form long axis-aligned runs
    keep = (run_len(mask, 1) >= line_len) | (run_len(mask, 0) >= line_len)
    keep[1:] |= keep[:-1]; keep[:-1] |= keep[1:]
    keep[:, 1:] |= keep[:, :-1]; keep[:, :-1] |= keep[:, 1:]
    mask &= ~keep
    Image.fromarray(np.where(mask[..., None], b, a).astype(np.uint8)).save(out)
    return mask.sum() * 100 / mask.size

if __name__ == '__main__':
    print(round(dewatermark(sys.argv[1], sys.argv[2]), 2), '% changed')
