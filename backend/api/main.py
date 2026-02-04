from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove, new_session
from PIL import Image
import io

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use faster model - load once at startup
session = new_session("u2netp")  # Smaller, faster model

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/remove-bg")
async def remove_bg(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    
    # Resize large images for faster processing
    max_size = 1024
    if image.width > max_size or image.height > max_size:
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    # Use pre-loaded session for faster processing
    output = remove(image, session=session)

    buffer = io.BytesIO()
    output.save(buffer, format="PNG", optimize=True)
    buffer.seek(0)

    return Response(content=buffer.getvalue(), media_type="image/png")