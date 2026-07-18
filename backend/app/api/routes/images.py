from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from openai import AsyncOpenAI
import base64

from app.config import get_settings

router = APIRouter()
settings = get_settings()


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
    contents = await file.read()
    b64_image = base64.b64encode(contents).decode("utf-8")
    mime_type = file.content_type or "image/jpeg"

    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)

    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
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

Perform a thorough analysis checking for:
1. AI generation signatures (artifacts, impossible details, over-smoothing)
2. Manipulation indicators (splicing, cloning, inpainting)
3. Photographic authenticity (natural noise, lens distortion, proper physics)
4. Contextual consistency (shadows match light source, reflections correct, text legible)

Respond in JSON:
{
  "is_likely_ai_generated": true/false,
  "confidence": 0-1.0,
  "indicators": ["specific indicators found, e.g. 'hands have 6 fingers', 'text is garbled'"],
  "manipulation_likelihood": "low|medium|high",
  "metadata_notes": ["observations about image characteristics"],
  "explanation": "educational explanation of how you determined this, teaching the user what to look for",
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
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return ImageAnalysisResponse(**result)


@router.post("/compare")
async def compare_images(original: UploadFile = File(...), suspect: UploadFile = File(...)):
    """Compare two images to determine if one is a manipulated version of the other."""
    original_bytes = await original.read()
    suspect_bytes = await suspect.read()

    b64_original = base64.b64encode(original_bytes).decode("utf-8")
    b64_suspect = base64.b64encode(suspect_bytes).decode("utf-8")

    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)

    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
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
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    import json
    return json.loads(response.choices[0].message.content)
