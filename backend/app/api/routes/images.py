from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import base64

from app.services.ai_client import ai_json_request, get_ai_client
from app.config import get_settings

router = APIRouter()
settings = get_settings()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


class ImageAnalysisResponse(BaseModel):
    is_likely_ai_generated: bool
    confidence: float
    indicators: list[str]
    manipulation_likelihood: str
    metadata_notes: list[str]
    explanation: str
    detection_methods_used: list[str]
    what_to_look_for: list[str]


@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image exceeds 10MB limit")

    b64_image = base64.b64encode(contents).decode("utf-8")
    mime_type = file.content_type or "image/jpeg"

    messages = [
        {
            "role": "system",
            "content": """You are an expert image forensics analyst specializing in detecting AI-generated images vs real photographs.

You analyze images for:
- AI generation artifacts (DALL-E, Midjourney, Stable Diffusion patterns)
- Inconsistent lighting, shadows, reflections
- Unnatural skin textures, hair, hands, fingers
- Text/lettering anomalies
- Background inconsistencies
- Repeating patterns or impossible geometry
- Over-smoothing or uncanny perfection
- Metadata absence typical of AI images

Always provide educational explanations teaching users what to look for.""",
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """Analyze this image and determine if it is AI-generated or a real photograph.

Respond in JSON:
{
  "is_likely_ai_generated": true/false,
  "confidence": 0-1.0,
  "indicators": ["specific indicators found"],
  "manipulation_likelihood": "low|medium|high",
  "metadata_notes": ["observations about image characteristics"],
  "explanation": "educational explanation of how you determined this",
  "detection_methods_used": ["list of analysis methods applied"],
  "what_to_look_for": ["practical tips users can apply to detect AI images themselves"]
}""",
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{b64_image}"},
                },
            ],
        },
    ]

    result = await ai_json_request(
        system_prompt="",
        user_prompt="",
        messages=messages,
    )
    return ImageAnalysisResponse(**result)


@router.post("/compare")
async def compare_images(original: UploadFile = File(...), suspect: UploadFile = File(...)):
    original_bytes = await original.read()
    suspect_bytes = await suspect.read()

    if len(original_bytes) > MAX_IMAGE_SIZE or len(suspect_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Images exceed 10MB limit")

    b64_original = base64.b64encode(original_bytes).decode("utf-8")
    b64_suspect = base64.b64encode(suspect_bytes).decode("utf-8")

    messages = [
        {
            "role": "system",
            "content": "You are an image forensics expert. Compare two images to determine if one is manipulated or fake.",
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """Compare these two images. Determine:
1. Are they the same scene/subject?
2. Has either been manipulated?
3. What differences exist?

Respond in JSON:
{
  "same_subject": true/false,
  "manipulation_detected": true/false,
  "differences": ["list of differences found"],
  "which_is_original": "first|second|unclear",
  "explanation": "what was done and how to tell"
}""",
                },
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_original}"}},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_suspect}"}},
            ],
        },
    ]

    result = await ai_json_request(
        system_prompt="",
        user_prompt="",
        messages=messages,
    )
    return result
