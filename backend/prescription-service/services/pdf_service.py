import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

import config


def generate_prescription_pdf(prescription_data, output_dir=None):
    if output_dir is None:
        output_dir = config.PRESCRIPTION_UPLOAD_DIR

    os.makedirs(output_dir, exist_ok=True)

    rx_code = prescription_data.get("rxCode", "RX-000001")
    filename = f"prescription_{rx_code}.pdf"
    filepath = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
    )

    styles = getSampleStyleSheet()
    style_normal = ParagraphStyle("Normal", parent=styles["Normal"], fontSize=10, spaceAfter=6)
    style_heading = ParagraphStyle("Heading", parent=styles["Heading2"], fontSize=16, spaceAfter=4, textColor=colors.HexColor("#0EA5E9"))
    style_title = ParagraphStyle("Title", parent=styles["Title"], fontSize=20, spaceAfter=2, textColor=colors.HexColor("#0EA5E9"))
    style_section = ParagraphStyle("Section", parent=styles["Heading3"], fontSize=12, spaceAfter=6, spaceBefore=12, textColor=colors.HexColor("#0284C7"))
    style_right = ParagraphStyle("Right", parent=style_normal, alignment=TA_RIGHT)
    style_center = ParagraphStyle("Center", parent=style_normal, alignment=TA_CENTER)

    clinic_name = prescription_data.get("clinicName", "City Care Clinic")
    doctor_name = prescription_data.get("doctorName", "")
    doctor_qual = prescription_data.get("doctorQualification", "")
    patient_name = prescription_data.get("patientName", "")
    patient_id = prescription_data.get("patientId", "")
    patient_age = prescription_data.get("patientAge", "")
    patient_gender = prescription_data.get("patientGender", "")
    diagnosis = prescription_data.get("diagnosis", "")
    medicines = prescription_data.get("medicines", [])
    notes = prescription_data.get("notes", "")
    next_visit = prescription_data.get("nextVisit", "")
    date_str = datetime.now().strftime("%d %b %Y")

    elements = []

    elements.append(Paragraph(clinic_name, style_title))
    elements.append(Paragraph("Prescription", style_heading))
    elements.append(Spacer(1, 0.15 * inch))

    header_data = [
        [Paragraph(f"<b>Dr. {doctor_name}</b>", style_normal),
         Paragraph(f"<b>Date:</b> {date_str}", style_right)],
        [Paragraph(doctor_qual, style_normal),
         Paragraph(f"<b>Rx No:</b> {rx_code}", style_right)],
    ]
    header_table = Table(header_data, colWidths=[3.5 * inch, 3.5 * inch])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#0EA5E9")),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.2 * inch))

    patient_info = [
        [Paragraph(f"<b>Patient Name:</b> {patient_name}", style_normal),
         Paragraph(f"<b>Patient ID:</b> {patient_id}", style_normal)],
        [Paragraph(f"<b>Age:</b> {patient_age}", style_normal),
         Paragraph(f"<b>Gender:</b> {patient_gender}", style_normal)],
    ]
    patient_table = Table(patient_info, colWidths=[3.5 * inch, 3.5 * inch])
    patient_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 0.15 * inch))

    if diagnosis:
        elements.append(Paragraph("<b>Diagnosis:</b>", style_section))
        elements.append(Paragraph(diagnosis, style_normal))
        elements.append(Spacer(1, 0.1 * inch))

    if medicines:
        elements.append(Paragraph("<b>Medicines Prescribed:</b>", style_section))
        med_header = [["#", "Medicine", "Dosage", "Frequency", "Duration", "Qty", "Instructions"]]
        med_rows = []
        for i, med in enumerate(medicines, 1):
            med_rows.append([
                str(i),
                med.get("name", ""),
                med.get("dosage", ""),
                med.get("frequency", ""),
                f"{med.get('duration', '')} {med.get('durationType', '')}",
                str(med.get("quantity", "")),
                med.get("instructions", ""),
            ])
        med_table = Table(med_header + med_rows, colWidths=[0.3*inch, 1.1*inch, 0.9*inch, 0.9*inch, 0.8*inch, 0.4*inch, 1.2*inch])
        med_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0EA5E9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        elements.append(med_table)
        elements.append(Spacer(1, 0.15 * inch))

    if notes:
        elements.append(Paragraph("<b>Notes:</b>", style_section))
        elements.append(Paragraph(notes, style_normal))
        elements.append(Spacer(1, 0.15 * inch))

    if next_visit:
        elements.append(Paragraph(f"<b>Next Visit:</b> {next_visit}", style_normal))
        elements.append(Spacer(1, 0.2 * inch))

    elements.append(Spacer(1, 0.3 * inch))
    signature_data = [
        [Paragraph("_________________________", style_center),
         Paragraph("", style_center)],
        [Paragraph(f"<b>Dr. {doctor_name}</b>", style_center),
         Paragraph("<b>(Clinic Stamp)</b>", style_center)],
    ]
    sig_table = Table(signature_data, colWidths=[3.5 * inch, 3.5 * inch])
    sig_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEABOVE", (0, 0), (0, 0), 1, colors.HexColor("#0EA5E9")),
    ]))
    elements.append(sig_table)

    doc.build(elements)
    return filepath
