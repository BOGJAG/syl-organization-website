"""Generate the 3 missing gallery images for SYL Organization website."""
import sys
import os
import time
import requests

sys.path.insert(0, '/home/turry/Projects/HVAC QUOTE ORCHESTRATION/.venv/lib/python3.13/site-packages')
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

IMAGES_DIR = "/home/turry/Projects/sylorg.md/images"

MISSING = [
    {
        "filename_prefix": "laundry_multi_5",
        "prompt": (
            "A beautifully organized laundry room with white cabinetry, "
            "neatly folded clean towels stacked on open shelves, glass jars "
            "with labeled detergents, a modern front-loading washer and dryer, "
            "soft natural light, warm neutral tones, interior design photography style, "
            "professional editorial photo, no text"
        ),
    },
    {
        "filename_prefix": "laundry_multi_6",
        "prompt": (
            "An elegant utility/laundry room with built-in white linen storage, "
            "wicker baskets neatly arranged on lower shelves, a marble countertop, "
            "potted herb plant, bright airy atmosphere, South Florida luxury home, "
            "interior design photography, no people, no text"
        ),
    },
    {
        "filename_prefix": "office_multi_6",
        "prompt": (
            "A minimalist luxury home office with a clean white desk, "
            "an organized pegboard with accessories hanging neatly, "
            "floating white shelves with books and small plants, "
            "a comfortable chair, warm ambient lighting, "
            "professional home organization aesthetic, interior design photography, "
            "no people, no text"
        ),
    },
]


def generate_image(prompt: str, filename_prefix: str) -> str:
    print(f"Generating: {filename_prefix}...")
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )
    url = response.data[0].url

    # Download
    img_data = requests.get(url).content
    timestamp = int(time.time() * 1000)
    filename = f"{filename_prefix}_{timestamp}.png"
    path = os.path.join(IMAGES_DIR, filename)

    # Resize to 640x640 to match existing images
    from io import BytesIO
    from PIL import Image
    img = Image.open(BytesIO(img_data))
    img = img.resize((640, 640), Image.LANCZOS)
    img.save(path)

    print(f"  Saved: {filename}")
    return filename


if __name__ == "__main__":
    results = []
    for item in MISSING:
        fname = generate_image(item["prompt"], item["filename_prefix"])
        results.append(fname)
        time.sleep(1)  # brief pause between calls

    print("\nDone! Generated images:")
    for r in results:
        print(f"  images/{r}")
    print("\nNext: update main.js references with new filenames, then run push_images.sh")
