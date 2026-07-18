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
    manipulation_likelihood: str  # low, medium, high
    metadata_notes: list[str]
    explanation: str


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
                "content": "You are an image forensics expert. Analyze images for signs of AI generation or manipulation. Respond in JSON format.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Analyze this image for:
1. Signs of AI generation (artifacts, inconsistencies, uncanny patterns)
2. Signs of manipulation (splicing, cloning, retouching)
3. Any metadata observations

Respond in JSON:
{
  "is_likely_ai_generated": true/false,
  "confidence": 0-1.0,
  "indicators": ["list of specific indicators found"],
  "manipulation_likelihood": "low|medium|high",
  "metadata_notes": ["observations about the image"],
  "explanation": "educational explanation of what to look for"
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
