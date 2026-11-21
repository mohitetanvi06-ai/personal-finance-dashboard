import os
from PIL import Image, ImageDraw, ImageFont

# Canvas Setup (A4 at 150 DPI)
W, H = 1240, 1754
BG_COLOR = (248, 250, 252)  # slate-50

def get_font(name, size, bold=False):
    try:
        if name == 'nirmala':
            return ImageFont.truetype("C:/Windows/Fonts/Nirmala.ttc", size, index=0)
        elif bold:
            return ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", size)
        else:
            return ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", size)
    except Exception:
        try:
            return ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
        except Exception:
            return ImageFont.load_default()

font_title = get_font('segoe', 32, bold=True)
font_subtitle = get_font('segoe', 20, bold=False)
font_header = get_font('segoe', 24, bold=True)
font_card_title = get_font('segoe', 18, bold=True)
font_body = get_font('segoe', 15, bold=False)
font_body_bold = get_font('segoe', 15, bold=True)
font_small = get_font('segoe', 13, bold=False)
font_marathi = get_font('nirmala', 15, bold=False)
font_marathi_bold = get_font('nirmala', 18, bold=True)

def draw_arrow_down(draw, x, y_start, y_end, color=(15, 59, 100), width=4):
    draw.line([(x, y_start), (x, y_end)], fill=color, width=width)
    # Arrow head
    draw.polygon([(x, y_end + 6), (x - 7, y_end - 4), (x + 7, y_end - 4)], fill=color)

def draw_rounded_card(draw, box, fill, outline, radius=12, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

# ==============================================================================
# PAGE 1: Long-Term Care (LTC) Workflow Architecture (Matches User Reference Image)
# ==============================================================================
def create_page_1():
    img = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Top Header Pill (ClearCert | Dashboard)
    top_w, top_h = 560, 68
    top_x = (W - top_w) // 2
    top_y = 50
    draw.rounded_rectangle([top_x, top_y, top_x + top_w, top_y + top_h], radius=16, fill=(11, 53, 96))
    
    # Text inside top header
    draw.text((top_x + 60, top_y + 18), "ClearCert", font=get_font('segoe', 26, bold=True), fill=(255, 255, 255))
    draw.line([(top_x + 230, top_y + 14), (top_x + 230, top_y + 54)], fill=(100, 150, 200), width=2)
    draw.text((top_x + 270, top_y + 18), "Dashboard", font=get_font('segoe', 26, bold=True), fill=(255, 255, 255))

    # Arrow down
    draw_arrow_down(draw, W // 2, top_y + top_h, top_y + top_h + 30)

    # Green Pill: Long-Term Care
    ltc_w, ltc_h = 480, 58
    ltc_x = (W - ltc_w) // 2
    ltc_y = top_y + top_h + 40
    draw.rounded_rectangle([ltc_x, ltc_y, ltc_x + ltc_w, ltc_y + ltc_h], radius=14, fill=(26, 127, 55))
    draw.text((ltc_x + 90, ltc_y + 14), "[OK]  Long-Term Care", font=get_font('segoe', 24, bold=True), fill=(255, 255, 255))

    # Arrow down
    draw_arrow_down(draw, W // 2, ltc_y + ltc_h, ltc_y + ltc_h + 30)

    # 1. Compliance Reports (Large Box Container)
    box1_x = 70
    box1_y = ltc_y + ltc_h + 40
    box1_w = W - 140
    box1_h = 660

    # Draw outer container
    draw.rounded_rectangle([box1_x, box1_y, box1_x + box1_w, box1_y + box1_h], radius=16, fill=(255, 255, 255), outline=(18, 65, 145), width=3)
    
    # Header bar of Container 1
    draw.rounded_rectangle([box1_x, box1_y, box1_x + box1_w, box1_y + 54], radius=14, fill=(18, 65, 145))
    draw.text((box1_x + 24, box1_y + 14), "1. Compliance Reports", font=get_font('segoe', 22, bold=True), fill=(255, 255, 255))

    # Cards inside Container 1 (2 Columns Grid)
    col_w = (box1_w - 60) // 2
    c1_x = box1_x + 20
    c2_x = c1_x + col_w + 20

    # Helper to draw inner cards
    def draw_inner_card(x, y, w, h, title, bullets=[]):
        draw.rounded_rectangle([x, y, x + w, y + h], radius=10, fill=(235, 243, 253), outline=(160, 195, 240), width=2)
        draw.text((x + 16, y + 12), title, font=font_card_title, fill=(11, 40, 80))
        cur_y = y + 42
        for b in bullets:
            indent = 20 if b.startswith("    *") else 10
            clean_b = b.replace("    *", "").replace("*", "").strip()
            draw.text((x + 16 + indent, cur_y), f"- {clean_b}", font=font_body, fill=(30, 41, 59))
            cur_y += 24

    # Row 1
    # Card 1 (Left): Long-Term Care Certification Report
    draw_inner_card(c1_x, box1_y + 70, col_w, 140, "1. Long-Term Care Certification Report", [
        "Lookup Compliance Reports",
        "Saved Reports",
        "    * Lookup Transcript Lookup"
    ])
    # Card 2 (Right): Batch LTCI Certification Report
    draw_inner_card(c2_x, box1_y + 70, col_w, 140, "2. Batch LTCI Certification Report", [
        "Bulk Producer LTCI Validation",
        "Multi-State Reciprocity Evaluation"
    ])

    # Row 2
    # Card 3 (Left): Life Insurance Certification Report
    draw_inner_card(c1_x, box1_y + 225, col_w, 130, "3. Life Insurance Certification Report", [
        "Pure Life Compliance Lookup",
        "State Specific Disclosure Verification"
    ])
    # Card 4 (Right): Annuity Reports
    draw_inner_card(c2_x, box1_y + 225, col_w, 130, "4. Annuity Reports", [
        "Annuity Certification Report",
        "Batch Annuity Certification Report",
        "Saved Report"
    ])

    # Row 3
    # Card 5 (Left): Combined LTC & Annuity Certification Report
    draw_inner_card(c1_x, box1_y + 370, col_w, 120, "5. Combined LTC & Annuity Certification Report", [
        "Dual-line Producer Clearance Status",
        "Cross-product eligibility audit"
    ])
    # Card 6 (Right): Annuity Batch Report
    draw_inner_card(c2_x, box1_y + 370, col_w, 120, "6. Annuity Batch Report", [
        "Batch Annuity Certification Report",
        "Saved Reports"
    ])

    # Row 4 (Full Width Card 7)
    draw_inner_card(c1_x, box1_y + 505, box1_w - 40, 130, "7. Anti-Money Laundering Certification Report", [
        "Anti-Money Laundering Certification Report (FINRA / RegEd / WebCE Course Validation)",
        "Saved Reports"
    ])

    # Arrow down
    draw_arrow_down(draw, W // 2, box1_y + box1_h, box1_y + box1_h + 30)

    # 2. Batch Compliance Reports
    box2_w = 640
    box2_h = 75
    box2_x = (W - box2_w) // 2
    box2_y = box1_y + box1_h + 40
    draw.rounded_rectangle([box2_x, box2_y, box2_x + box2_w, box2_y + box2_h], radius=14, fill=(225, 245, 230), outline=(40, 167, 69), width=2)
    draw.text((box2_x + 30, box2_y + 14), "2. Batch Compliance Reports", font=get_font('segoe', 20, bold=True), fill=(20, 90, 40))
    draw.text((box2_x + 60, box2_y + 44), "- Batch LTCI Certification Report", font=font_body, fill=(30, 41, 59))

    # Arrow down
    draw_arrow_down(draw, W // 2, box2_y + box2_h, box2_y + box2_h + 25)

    # 3. Bookmarked Reports
    box3_w = 640
    box3_h = 56
    box3_x = (W - box3_w) // 2
    box3_y = box2_y + box2_h + 35
    draw.rounded_rectangle([box3_x, box3_y, box3_x + box3_w, box3_y + box3_h], radius=14, fill=(238, 230, 252), outline=(130, 80, 210), width=2)
    draw.text((box3_x + 30, box3_y + 16), "3. Bookmarked Reports", font=get_font('segoe', 20, bold=True), fill=(90, 40, 160))

    # Arrow down
    draw_arrow_down(draw, W // 2, box3_y + box3_h, box3_y + box3_h + 25)

    # Connects to Long-Term Care -> Saved Reports
    box4_w = 780
    box4_h = 56
    box4_x = (W - box4_w) // 2
    box4_y = box3_y + box3_h + 35
    draw.rounded_rectangle([box4_x, box4_y, box4_x + box4_w, box4_y + box4_h], radius=14, fill=(228, 246, 235), outline=(50, 180, 100), width=2)
    draw.text((box4_x + 40, box4_y + 16), "🔗  Connects to Long-Term Care -> Saved Reports", font=get_font('segoe', 19, bold=True), fill=(20, 110, 50))

    # Arrow down
    draw_arrow_down(draw, W // 2, box4_y + box4_h, box4_y + box4_h + 25)

    # End of Long-Term Care Pill
    end_w, end_h = 320, 50
    end_x = (W - end_w) // 2
    end_y = box4_y + box4_h + 35
    draw.rounded_rectangle([end_x, end_y, end_x + end_w, end_y + end_h], radius=25, fill=(11, 45, 85))
    draw.text((end_x + 50, end_y + 14), "End of Long-Term Care", font=get_font('segoe', 18, bold=True), fill=(255, 255, 255))

    # Page 1 Footer
    draw.text((W // 2 - 120, H - 40), "ClearCert Architecture - Page 1 of 3", font=font_small, fill=(140, 150, 165))

    return img

# ==============================================================================
# PAGE 2: Annuity Suitability (NAIC Model) & Carrier PST Clearance Engine
# ==============================================================================
def create_page_2():
    img = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Header
    top_w, top_h = 680, 68
    top_x = (W - top_w) // 2
    top_y = 50
    draw.rounded_rectangle([top_x, top_y, top_x + top_w, top_y + top_h], radius=16, fill=(11, 53, 96))
    draw.text((top_x + 40, top_y + 18), "ClearCert", font=get_font('segoe', 26, bold=True), fill=(255, 255, 255))
    draw.line([(top_x + 190, top_y + 14), (top_x + 190, top_y + 54)], fill=(100, 150, 200), width=2)
    draw.text((top_x + 220, top_y + 18), "Annuity & Carrier Clearance", font=get_font('segoe', 24, bold=True), fill=(255, 255, 255))

    # Arrow down
    draw_arrow_down(draw, W // 2, top_y + top_h, top_y + top_h + 30)

    # Orange Pill: NAIC Annuity & Best Interest
    ann_w, ann_h = 560, 58
    ann_x = (W - ann_w) // 2
    ann_y = top_y + top_h + 40
    draw.rounded_rectangle([ann_x, ann_y, ann_x + ann_w, ann_y + ann_h], radius=14, fill=(217, 119, 6))
    draw.text((ann_x + 45, ann_y + 14), "[OK]  NAIC Annuity Best Interest Model", font=get_font('segoe', 22, bold=True), fill=(255, 255, 255))

    # Arrow down
    draw_arrow_down(draw, W // 2, ann_y + ann_h, ann_y + ann_h + 30)

    # Main Annuity Container
    box1_x = 70
    box1_y = ann_y + ann_h + 40
    box1_w = W - 140
    box1_h = 660

    draw.rounded_rectangle([box1_x, box1_y, box1_x + box1_w, box1_y + box1_h], radius=16, fill=(255, 255, 255), outline=(180, 83, 9), width=3)
    draw.rounded_rectangle([box1_x, box1_y, box1_x + box1_w, box1_y + 54], radius=14, fill=(180, 83, 9))
    draw.text((box1_x + 24, box1_y + 14), "1. Annuity Pre-Sale & Product Training (PST) Engine", font=get_font('segoe', 22, bold=True), fill=(255, 255, 255))

    col_w = (box1_w - 60) // 2
    c1_x = box1_x + 20
    c2_x = c1_x + col_w + 20

    def draw_inner_card(x, y, w, h, title, bullets=[]):
        draw.rounded_rectangle([x, y, x + w, y + h], radius=10, fill=(254, 243, 199), outline=(245, 158, 11), width=2)
        draw.text((x + 16, y + 12), title, font=font_card_title, fill=(146, 64, 14))
        cur_y = y + 42
        for b in bullets:
            draw.text((x + 26, cur_y), f"- {b.strip()}", font=font_body, fill=(30, 41, 59))
            cur_y += 24

    # Row 1
    draw_inner_card(c1_x, box1_y + 70, col_w, 150, "1. NAIC 4-Hour Annuity Suitability", [
        "2020 Model Regulation Compliance Verification",
        "Multi-State Reciprocity Evaluation",
        "Completed Provider Transcript Match"
    ])
    draw_inner_card(c2_x, box1_y + 70, col_w, 150, "2. 1-Hour Best Interest Update Course", [
        "Grandfathered Producer CE Rule Tracking",
        "State Implementation Deadline Alerts",
        "Missing Update Notification Trigger"
    ])

    # Row 2
    draw_inner_card(c1_x, box1_y + 235, col_w, 150, "3. Carrier Product-Specific Training (PST)", [
        "Carrier-by-Carrier Requirements Matrix",
        "Allianz, Athene, Lincoln, Corebridge, etc.",
        "Specific Product Validation (FIA, RILA, Fixed)"
    ])
    draw_inner_card(c2_x, box1_y + 235, col_w, 150, "4. State Jurisdictional Regulations", [
        "New York Reg 187 Best Interest Standard",
        "California Senior Suitability Training",
        "Florida Annuity Disclosures"
    ])

    # Row 3 (Full Width: Clearance Status Engine)
    draw_inner_card(c1_x, box1_y + 400, box1_w - 40, 230, "5. Real-Time 'Clear to Sell' (CTS) Decision Matrix", [
        "Step 1: Check Active State Producer License via NPN Feed",
        "Step 2: Verify NAIC State 4-Hour / 1-Hour Annuity Training Completion",
        "Step 3: Verify Insurance Carrier Product-Specific Training (PST)",
        "Step 4: Output Status: [CLEARED TO SELL] | [NOT CLEARED - MISSING TRAINING] | [EXPIRED]",
        "Step 5: Immediate PDF Transcript & Clearance Badge Generation"
    ])

    # Arrow down
    draw_arrow_down(draw, W // 2, box1_y + box1_h, box1_y + box1_h + 30)

    # 2. Batch Clearance Validation
    box2_w = 640
    box2_h = 75
    box2_x = (W - box2_w) // 2
    box2_y = box1_y + box1_h + 40
    draw.rounded_rectangle([box2_x, box2_y, box2_x + box2_w, box2_y + box2_h], radius=14, fill=(254, 243, 199), outline=(217, 119, 6), width=2)
    draw.text((box2_x + 30, box2_y + 14), "2. Batch Annuity & Carrier Clearance Reports", font=get_font('segoe', 20, bold=True), fill=(180, 83, 9))
    draw.text((box2_x + 60, box2_y + 44), "- Batch Annuity Clearance Report & Agency Carrier Audit", font=font_body, fill=(30, 41, 59))

    # Arrow down
    draw_arrow_down(draw, W // 2, box2_y + box2_h, box2_y + box2_h + 25)

    # Connects to Annuity -> Saved Reports
    box4_w = 780
    box4_h = 56
    box4_x = (W - box4_w) // 2
    box4_y = box2_y + box2_h + 35
    draw.rounded_rectangle([box4_x, box4_y, box4_x + box4_w, box4_y + box4_h], radius=14, fill=(255, 237, 213), outline=(234, 88, 12), width=2)
    draw.text((box4_x + 40, box4_y + 16), "🔗  Connects to Annuity & Carrier -> Saved / Scheduled Reports", font=get_font('segoe', 19, bold=True), fill=(194, 65, 12))

    # Arrow down
    draw_arrow_down(draw, W // 2, box4_y + box4_h, box4_y + box4_h + 25)

    # End Pill
    end_w, end_h = 320, 50
    end_x = (W - end_w) // 2
    end_y = box4_y + box4_h + 35
    draw.rounded_rectangle([end_x, end_y, end_x + end_w, end_y + end_h], radius=25, fill=(11, 45, 85))
    draw.text((end_x + 65, end_y + 14), "End of Annuity Flow", font=get_font('segoe', 18, bold=True), fill=(255, 255, 255))

    # Page 2 Footer
    draw.text((W // 2 - 120, H - 40), "ClearCert Architecture - Page 2 of 3", font=font_small, fill=(140, 150, 165))

    return img

# ==============================================================================
# PAGE 3: Agency Member Roster, Bulk Processing & Audit Infrastructure
# ==============================================================================
def create_page_3():
    img = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Header
    top_w, top_h = 680, 68
    top_x = (W - top_w) // 2
    top_y = 50
    draw.rounded_rectangle([top_x, top_y, top_x + top_w, top_y + top_h], radius=16, fill=(11, 53, 96))
    draw.text((top_x + 40, top_y + 18), "ClearCert", font=get_font('segoe', 26, bold=True), fill=(255, 255, 255))
    draw.line([(top_x + 190, top_y + 14), (top_x + 190, top_y + 54)], fill=(100, 150, 200), width=2)
    draw.text((top_x + 220, top_y + 18), "Agency Roster & Batch Audit", font=get_font('segoe', 24, bold=True), fill=(255, 255, 255))

    # Section 1: Agency Member Dashboard UI Hierarchy
    draw.text((70, 150), "1. Agency Member Dashboard - Screen Hierarchy", font=font_header, fill=(15, 23, 42))

    def draw_section_card(x, y, w, h, title, color_theme, bullets):
        bg, border, text_c = color_theme
        draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=bg, outline=border, width=2)
        draw.text((x + 20, y + 14), title, font=font_card_title, fill=text_c)
        cur_y = y + 46
        for b in bullets:
            draw.text((x + 30, cur_y), f"•  {b}", font=font_body, fill=(30, 41, 59))
            cur_y += 24

    # Grid 1
    w_card = (W - 160) // 2
    draw_section_card(70, 195, w_card, 210, "A. Executive KPI Metrics Cards", ((240, 249, 255), (56, 189, 248), (3, 105, 161)), [
        "Total Active Agency Producers (Members)",
        "Clear to Sell Rate (% Fully Compliant)",
        "Action Required Count (Missing NAIC / PST)",
        "Expiring Certifications (Next 30/60 Days)",
        "Real-Time Sync Status with NIPR"
    ])

    draw_section_card(70 + w_card + 20, 195, w_card, 210, "B. Multi-Dimensional Search & Filters", ((245, 243, 255), (167, 139, 250), (109, 40, 217)), [
        "Search: Agent Name, NPN, SSN Last 4, Email",
        "Carrier Filter: Allianz, Athene, Lincoln, etc.",
        "State License Filter: CA, NY Reg 187, TX, FL",
        "Compliance Status: Clear, Missing, Expired",
        "Bulk Action: Import CSV, Export Report, Email Alert"
    ])

    draw_section_card(70, 425, w_card, 230, "C. Member Roster Data Grid (Table)", ((236, 253, 245), (52, 211, 153), (4, 120, 87)), [
        "Col 1: Producer Info (Name, NPN, Licenses)",
        "Col 2: NAIC Annuity 4-Hr Best Interest Badge",
        "Col 3: Long-Term Care (LTC) Initial/Renewal CE",
        "Col 4: Carrier Product-Specific Training (e.g. 5/5)",
        "Col 5: Overall Clear to Sell Status Pill",
        "Col 6: Action Dropdown (Transcript, Email, Edit)"
    ])

    draw_section_card(70 + w_card + 20, 425, w_card, 230, "D. Interactive Slide-Over Drawer", ((254, 242, 242), (248, 113, 113), (185, 28, 28)), [
        "Tab 1: Carrier Clearances Breakdown by Product",
        "Tab 2: Verified Course History & Transcripts",
        "Tab 3: Actionable Missing Requirements Checklist",
        "One-click 'Send Training Link to Agent' Email",
        "Official PDF Compliance Certificate Download"
    ])

    # Section 2: Batch Processing Architecture
    draw.text((70, 680), "2. Batch Processing & Compliance Ingestion Engine", font=font_header, fill=(15, 23, 42))

    batch_box_y = 725
    batch_box_h = 290
    draw.rounded_rectangle([70, batch_box_y, W - 70, batch_box_y + batch_box_h], radius=14, fill=(255, 255, 255), outline=(15, 59, 100), width=2)
    
    # Steps in batch
    steps = [
        ("Step 1: Ingestion", "Upload CSV / Excel containing hundreds of Agent NPNs and State Codes."),
        ("Step 2: NIPR Validation", "Verify active producer licenses and disciplinary actions across states."),
        ("Step 3: Training Match", "Match course completions from RegEd, WebCE, Kaplan, and Carrier direct feeds."),
        ("Step 4: Rule Evaluation", "Evaluate NAIC 2020 rules, LTC 8-hr/4-hr partnership, and Carrier PST requirements."),
        ("Step 5: Output Generation", "Produce Compliant vs. Non-Compliant audit reports with instant PDF/Excel exports.")
    ]
    cur_sy = batch_box_y + 20
    for s_title, s_desc in steps:
        draw.text((95, cur_sy), s_title, font=font_card_title, fill=(11, 53, 96))
        draw.text((320, cur_sy + 2), s_desc, font=font_body, fill=(51, 65, 85))
        cur_sy += 52

    # Section 3: Summary Matrix in Marathi & English
    draw.text((70, 1040), "3. Project Modules Summary Matrix (प्रकल्प कार्यप्रणाली सारांश)", font=font_header, fill=(15, 23, 42))

    matrix_y = 1085
    matrix_h = 560
    draw.rounded_rectangle([70, matrix_y, W - 70, matrix_y + matrix_h], radius=14, fill=(248, 250, 252), outline=(203, 213, 225), width=2)

    # Table Header
    draw.rounded_rectangle([70, matrix_y, W - 70, matrix_y + 44], radius=12, fill=(15, 59, 100))
    draw.text((90, matrix_y + 12), "विभाग (Module)", font=font_card_title, fill=(255, 255, 255))
    draw.text((360, matrix_y + 12), "उद्देश व मुख्य कार्य (Purpose & Features)", font=font_card_title, fill=(255, 255, 255))
    draw.text((850, matrix_y + 12), "अहवाल (Key Reports)", font=font_card_title, fill=(255, 255, 255))

    rows = [
        ("Long-Term Care (LTC)", "LTC Partnership compliance, 8-hour initial CE, and 24-month ongoing renewal tracking.", "LTC Certification, Batch LTCI, Combined LTC & Annuity"),
        ("Annuity Suitability (NAIC)", "NAIC 2020 4-hour Best Interest model, 1-hour updates, and Carrier PST validation.", "Annuity Certification, Batch Annuity, State Reciprocity"),
        ("Life Insurance", "Life insurance pre-sale disclosures, state regulations, and replacement rules.", "Life Insurance Certification Report, Saved Audit Reports"),
        ("Anti-Money Laundering (AML)", "FINRA / US Treasury compliant AML training validation for financial professionals.", "AML Certification Report, Provider Course Transcripts"),
        ("Member Roster Management", "Agency producers list, NPN verification, active state licenses, and transcript lookup.", "Master Agency Roster, Non-Compliant Producer Alert List"),
        ("Clear to Sell (CTS) Engine", "Real-time clearance evaluator ensuring agent is legal to solicit carrier products.", "Carrier Clearance Matrix, Missing Requirement Action List"),
        ("Batch & Audit Automation", "Automated bulk CSV processing and scheduled compliance digests for regulators.", "Batch LTCI, Batch Annuity, Scheduled Compliance Digest")
    ]

    r_y = matrix_y + 54
    for mod, desc, reps in rows:
        draw.line([(70, r_y), (W - 70, r_y)], fill=(226, 232, 240), width=1)
        draw.text((90, r_y + 10), mod, font=font_body_bold, fill=(15, 23, 42))
        
        # Word wrap desc
        draw.text((360, r_y + 10), desc[:65], font=font_body, fill=(51, 65, 85))
        if len(desc) > 65:
            draw.text((360, r_y + 30), desc[65:130], font=font_body, fill=(51, 65, 85))
            
        draw.text((850, r_y + 10), reps[:40], font=font_body, fill=(3, 105, 161))
        if len(reps) > 40:
            draw.text((850, r_y + 30), reps[40:], font=font_body, fill=(3, 105, 161))
            
        r_y += 68

    # Page 3 Footer
    draw.text((W // 2 - 120, H - 40), "ClearCert Architecture - Page 3 of 3", font=font_small, fill=(140, 150, 165))

    return img

# ==============================================================================
# MAIN COMPILATION
# ==============================================================================
if __name__ == '__main__':
    print("Generating Page 1: Long-Term Care Flow...")
    p1 = create_page_1()
    print("Generating Page 2: Annuity & Carrier PST Flow...")
    p2 = create_page_2()
    print("Generating Page 3: Roster & Batch Audit Matrix...")
    p3 = create_page_3()

    output_path = r"D:\IMP POROJECTS\personal-finance-dashboard\ClearCert_Agency_Dashboard_Structure.pdf"
    print(f"Compiling PDF into: {output_path}")
    
    # Save multi-page PDF
    p1.save(
        output_path,
        "PDF",
        resolution=150.0,
        save_all=True,
        append_images=[p2, p3]
    )
    print("PDF Successfully Created!")
