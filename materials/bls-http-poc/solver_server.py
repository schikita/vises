# BLS 3x3 captcha solver — local HTTP backend (torch + model_best.pt from /e/my/poc/bls3x3).
# POST /solve  {"target": "386", "tiles": [{"id": "...", "b64": "<base64 image>"}]}
#        ->    {"ok": true, "picks": ["id1", ...], "tiles": [{"id","num","conf"}]}
# GET  /health -> {"ok": true}
import base64
import io
import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

POC_DIR = r"E:\my\poc\bls3x3"
sys.path.insert(0, POC_DIR)

import numpy as np  # noqa: E402
import torch  # noqa: E402
from PIL import Image  # noqa: E402
from train import Net  # noqa: E402

META = json.load(open(f"{POC_DIR}\\model_meta.json", encoding="utf-8"))
W, H, CH = META["w"], META["h"], tuple(META["ch"])
MIN_CONF = 0.5  # below this the digit prediction is unreliable -> tile not picked

model = Net(CH, W, H)
model.load_state_dict(torch.load(f"{POC_DIR}\\model_best.pt", map_location="cpu"))
model.eval()

DEV = "cpu"  # small net, CPU is instant for 9 tiles


def solve(target: int, tiles):
    xs = np.zeros((len(tiles), 3, H, W), dtype=np.float32)
    for i, t in enumerate(tiles):
        im = Image.open(io.BytesIO(base64.b64decode(t["b64"]))).convert("RGB")
        im = im.resize((W, H), Image.BILINEAR)
        xs[i] = (np.asarray(im, dtype=np.float32) / 255.0).transpose(2, 0, 1)
    with torch.no_grad():
        o1, o2, o3 = model(torch.from_numpy(xs))
        heads = []
        for o in (o1, o2, o3):
            p = torch.softmax(o, 1)
            heads.append((p.argmax(1).numpy(), p.max(1).values.numpy()))
        nums = heads[0][0] * 100 + heads[1][0] * 10 + heads[2][0]
        confs = np.minimum(np.minimum(heads[0][1], heads[1][1]), heads[2][1])

    picks = []
    per_tile = []
    for i, t in enumerate(tiles):
        num = int(nums[i])
        conf = float(confs[i])
        per_tile.append({"id": t["id"], "num": num, "conf": round(conf, 4)})
        if num == target and conf >= MIN_CONF:
            picks.append(t["id"])
    return picks, per_tile


class Handler(BaseHTTPRequestHandler):
    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self._json(200, {"ok": True, "backend": "torch-cpu", "input": f"{W}x{H}"})
        else:
            self._json(404, {"ok": False})

    def do_POST(self):
        if self.path != "/solve":
            self._json(404, {"ok": False, "error": "not found"})
            return
        try:
            length = int(self.headers.get("content-length", 0))
            data = json.loads(self.rfile.read(length) or b"{}")
            target = int(str(data["target"]))
            tiles = data["tiles"]
            if not tiles:
                raise ValueError("no tiles")
            picks, per_tile = solve(target, tiles)
            self._json(200, {"ok": True, "target": target, "picks": picks, "tiles": per_tile})
        except Exception as e:  # noqa: BLE001
            self._json(400, {"ok": False, "error": str(e)[:300]})

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8788
    print(f"bls3x3 solver backend on http://127.0.0.1:{port} (torch {torch.__version__}, input {W}x{H})")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
