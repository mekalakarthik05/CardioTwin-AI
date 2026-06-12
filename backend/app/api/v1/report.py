from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ReportRequest
from app.services.report_pdf import report_generator
from datetime import datetime

router = APIRouter(prefix="", tags=["Report"])

@router.post("/report/generate")
async def generate_report(body: ReportRequest):
    """
    Compile patient details, predictions, and recommendations into a professional PDF report.
    Returns the compiled PDF file stream for direct download.
    """
    inputs = body.inputs.model_dump()
    results = body.results.model_dump()
    
    pdf_stream = report_generator.generate_pdf_stream(inputs, results)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"CardioTwin_Report_{timestamp}.pdf"
    
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
