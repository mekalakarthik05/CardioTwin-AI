import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


class ReportGenerator:
    def generate_pdf_stream(self, inputs: dict, results: dict) -> io.BytesIO:
        """
        Generate a professional heart health report PDF in memory.
        Returns a BytesIO stream containing the compiled PDF.
        """
        buffer = io.BytesIO()
        
        # Setup document template on the buffer (letter size, margins = 48 for clean printable area)
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=48,
            leftMargin=48,
            topMargin=48,
            bottomMargin=48
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles for premium warm consumer aesthetic
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#FF6B35'), # CardioTwin Orange
            spaceAfter=4
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            textColor=colors.HexColor('#7C3AED'), # Deep Purple Accent
            spaceAfter=15,
            textTransform='uppercase',
            leading=12
        )
        
        meta_style = ParagraphStyle(
            'MetaText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            textColor=colors.HexColor('#4B5563'),
            spaceAfter=15,
            leading=12
        )
        
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            textColor=colors.HexColor('#111827'),
            spaceBefore=12,
            spaceAfter=6,
            borderColor=colors.HexColor('#FF6B35'),
            borderPadding=2
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['BodyText'],
            fontName='Helvetica',
            fontSize=9.5,
            textColor=colors.HexColor('#374151'),
            leading=13.5
        )
        
        rec_style = ParagraphStyle(
            'Recommendation',
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            leading=14
        )
        
        story = []
        
        # 1. Header (Logo & Branding Block)
        header_data = [
            [
                Paragraph("CardioTwin AI", title_style),
                Paragraph("<b>Date:</b> " + datetime.now().strftime("%B %d, %Y<br/><b>Time:</b> %I:%M %p Local"), ParagraphStyle('HeaderRight', parent=body_style, alignment=2, leading=12))
            ]
        ]
        header_table = Table(header_data, colWidths=[300, 216])
        header_table.setStyle(TableStyle([
            ('PADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 1.5, colors.HexColor('#E8E8E4')),
            ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 10))
        
        story.append(Paragraph("CLINICAL CARDIOVASCULAR HEALTH REPORT & PROBABILISTIC AI ASSESSMENT", subtitle_style))
        
        # 2. Risk Classification Summary Card
        risk_score = results['riskScore']
        risk_group = results['riskGroup']
        health_score = results['healthScore']
        bn_prob = results['bayesianRiskProb']
        xgb_prob = results['xgboostRiskProb']
        
        risk_pct = int(bn_prob * 100)
        
        if risk_group == "High Risk":
            card_bg = colors.HexColor('#FEE2E2') # soft red
            card_border = colors.HexColor('#EF4444')
            text_color = colors.HexColor('#B91C1C')
        elif risk_group == "Moderate Risk":
            card_bg = colors.HexColor('#FEF3C7') # soft orange
            card_border = colors.HexColor('#FF6B35')
            text_color = colors.HexColor('#B45309')
        else:
            card_bg = colors.HexColor('#DCFCE7') # soft green
            card_border = colors.HexColor('#22C55E')
            text_color = colors.HexColor('#15803D')
            
        summary_text = f"<b>Risk Classification:</b> {risk_group} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Risk Score Flags:</b> {risk_score}/10 &nbsp;&nbsp;|&nbsp;&nbsp; <b>General Health Index:</b> {health_score}/100"
        
        summary_table = Table([[Paragraph(summary_text, ParagraphStyle('CardText', parent=body_style, textColor=text_color, fontSize=10.5, fontName='Helvetica-Bold'))]], colWidths=[516])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), card_bg),
            ('BOX', (0,0), (-1,-1), 1.5, card_border),
            ('PADDING', (0,0), (-1,-1), 10),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 12))
        
        # 3. Visual Risk Progress Bar (Dynamic gauge representation)
        story.append(Paragraph("Risk Index Calibration", ParagraphStyle('Subheading', parent=section_heading, fontSize=11)))
        
        left_width = max(10, min(506, 516 * (risk_pct / 100.0)))
        right_width = 516 - left_width
        
        progress_bar_table = Table([['', '']], colWidths=[left_width, right_width], rowHeights=[10])
        progress_bar_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), card_border),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#E5E7EB')),
            ('PADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ]))
        story.append(progress_bar_table)
        
        # Label under progress bar
        lbl_text = f"<font size=8.5 color='#6B7280'>0% (Normal)</font><alignment value='center'/><font size=9 color='{card_border.hexval()}'><b>Calculated Risk: {risk_pct}%</b></font><alignment value='right'/><font size=8.5 color='#6B7280'>100% (High Risk)</font>"
        lbl_style = ParagraphStyle('ProgressLabels', parent=body_style, fontSize=8.5)
        
        lbl_data = [
            [
                Paragraph("0% (Normal)", ParagraphStyle('L', parent=lbl_style, alignment=0)),
                Paragraph(f"<b>Bayesian Risk Probability: {risk_pct}%</b>", ParagraphStyle('C', parent=lbl_style, alignment=1, textColor=text_color)),
                Paragraph("100% (Maximum Risk)", ParagraphStyle('R', parent=lbl_style, alignment=2))
            ]
        ]
        lbl_table = Table(lbl_data, colWidths=[150, 216, 150])
        lbl_table.setStyle(TableStyle([
            ('PADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(lbl_table)
        story.append(Spacer(1, 15))
        
        # 4. Model Predictions Table
        prob_data = [
            ["Risk Engine Type", "Cardiovascular Probability", "Consensus Role"],
            ["Bayesian Network Model (Causal inference)", f"{bn_prob*100:.1f}%", "Primary Explainable AI Reasoning Layer"],
            ["XGBoost Classifier Model (Ensemble method)", f"{xgb_prob*100:.1f}%", "Complementary Machine Learning Validator"]
        ]
        prob_table = Table(prob_data, colWidths=[216, 150, 150])
        prob_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FF6B35')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('TOPPADDING', (0,0), (-1,0), 6),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,1), (-1,-1), 9),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E8E8E4')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FAFAF8')]),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(prob_table)
        story.append(Spacer(1, 12))
        
        # 5. Patient Input Metrics (All 13 variables in a clean 4-column layout)
        story.append(Paragraph("Patient Clinical Intake Profile", section_heading))
        
        sex_label = "Male" if inputs['sex'] == 1 else "Female"
        cp_labels = ["Typical Angina", "Atypical Angina", "Non-Anginal Pain", "Asymptomatic Chest Pain"]
        cp_label = cp_labels[int(inputs['cp'])]
        fbs_label = "Yes (> 120 mg/dl)" if inputs['fbs'] == 1 else "No"
        exang_label = "Yes, Induced" if inputs['exang'] == 1 else "No"
        ecg_labels = ["Normal ECG", "ST-T Wave Abnormality", "LV Hypertrophy"]
        ecg_label = ecg_labels[int(inputs['restecg'])]
        slope_labels = ["Upsloping", "Flat", "Downsloping"]
        slope_label = slope_labels[int(inputs['slope'])]
        thal_labels = ["Normal", "Fixed Defect", "Reversible Defect", "Unknown"]
        thal_label = thal_labels[int(inputs['thal'])]
        
        metrics_data = [
            ["Age", f"{int(inputs['age'])} yrs", "Biological Sex", sex_label],
            ["Chest Pain Class", cp_label, "Exercise Induced Angina", exang_label],
            ["Resting Blood Pressure", f"{int(inputs['trestbps'])} mmHg", "Serum Cholesterol", f"{int(inputs['chol'])} mg/dl"],
            ["Fasting Blood Sugar", fbs_label, "Resting ECG Output", ecg_label],
            ["Max Heart Rate (thalach)", f"{int(inputs['thalach'])} bpm", "ST Depression (oldpeak)", f"{inputs['oldpeak']:.1f}"],
            ["ST Peak Segment Slope", slope_label, "Major Vessels colored (ca)", f"{inputs['ca']} vessels"],
            ["Thalassemia Status", thal_label, "Total Assessment Flags", f"{risk_score} present"]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[140, 118, 150, 108])
        metrics_table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E8E8E4')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#FAFAF8')),
            ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#FAFAF8')),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 12))
        
        # 6. Top Causal Risk Factors (Inferred from clinical threshold mappings)
        story.append(Paragraph("Key Contributing Risk Factors", section_heading))
        risk_factors = []
        if inputs['trestbps'] >= 140:
            risk_factors.append(f"Elevated Resting Blood Pressure: Measured at {int(inputs['trestbps'])} mmHg (stage 2 hypertension threshold is ≥140 mmHg).")
        elif inputs['trestbps'] >= 130:
            risk_factors.append(f"Borderline resting Blood Pressure: Measured at {int(inputs['trestbps'])} mmHg (pre-hypertension).")
            
        if inputs['chol'] >= 240:
            risk_factors.append(f"High Serum Cholesterol: Measured at {int(inputs['chol'])} mg/dl (hypercholesterolemia threshold is ≥240 mg/dl).")
        elif inputs['chol'] >= 200:
            risk_factors.append(f"Borderline Serum Cholesterol: Measured at {int(inputs['chol'])} mg/dl.")
            
        if inputs['fbs'] == 1:
            risk_factors.append("Elevated Fasting Glucose: Blood sugar exceeds 120 mg/dl threshold, signaling high metabolic risk.")
            
        if inputs['exang'] == 1:
            risk_factors.append("Exercise-Induced Angina: Clinical physical stress test triggered myocardial chest discomfort.")
            
        if inputs['oldpeak'] >= 2.0:
            risk_factors.append(f"Significant ST Segment Depression: oldpeak measurement of {inputs['oldpeak']:.1f} signals severe exercise stress deficiency.")
        elif inputs['oldpeak'] >= 1.0:
            risk_factors.append(f"Moderate ST Segment Depression: oldpeak measurement of {inputs['oldpeak']:.1f} indicates cardiovascular strain.")
            
        if inputs['ca'] > 0:
            risk_factors.append(f"Major Coronary Vessels Blockage: Fluoroscopy colors {inputs['ca']} vessel(s), indicating localized stenosis.")
            
        if inputs['thal'] in [1, 2]: # Fixed or reversible defects
            risk_factors.append(f"Thalassemia Pattern Present: Classified as {thal_label}, representing myocardial blood perfusion imbalances.")

        if not risk_factors:
            story.append(Paragraph("No elevated clinical risk flags detected. All variables remain within normal thresholds.", body_style))
        else:
            for rf in risk_factors:
                story.append(Paragraph(f"• <b>{rf.split(':')[0]}:</b>{rf.split(':')[1] if ':' in rf else ''}", rec_style))
                story.append(Spacer(1, 3))
                
        story.append(Spacer(1, 12))
        
        # 7. Recommendations
        story.append(Paragraph("Clinical Guidance & Recommendations", section_heading))
        recs = results['recommendations']
        for rec in recs:
            clean_rec = rec
            story.append(Paragraph(f"• {clean_rec}", rec_style))
            story.append(Spacer(1, 4))
            
        story.append(Spacer(1, 15))
        
        # 8. Disclaimer
        line_table = Table([['']], colWidths=[516], rowHeights=[1])
        line_table.setStyle(TableStyle([
            ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#E8E8E4')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(line_table)
        story.append(Spacer(1, 8))
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=body_style,
            fontName='Helvetica-Oblique',
            fontSize=7.5,
            textColor=colors.HexColor('#6B7280'),
            leading=10
        )
        disclaimer_text = "<b>Medical Disclaimer:</b> CardioTwin AI is a predictive system powered by artificial intelligence and Bayesian logic. It is intended for educational and diagnostic-support purposes only. This report does NOT constitute professional medical advice, diagnosis, or treatment. Always consult with a licensed cardiologist or physician regarding any heart health concern."
        story.append(Paragraph(disclaimer_text, disclaimer_style))
        
        # Build PDF into the memory buffer
        doc.build(story)
        buffer.seek(0)
        return buffer


# Instantiate singleton
report_generator = ReportGenerator()
