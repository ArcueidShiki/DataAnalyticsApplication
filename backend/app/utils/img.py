from PIL import Image, ImageDraw, ImageFont
import datetime

FONT_PATH = "arial.ttf"

def create_summary_image(bg_image_path, output_path, profit_value, symbol, price, avg_cost, username):
    profit_value = round(profit_value / price  * 100, 2)
    price = round(price, 2)
    avg_cost = round(avg_cost, 2)
    profit_text = f"Profit +{profit_value}%" if profit_value > 0 else f"Loss {profit_value}%"

    img = Image.open(bg_image_path)
    draw = ImageDraw.Draw(img)
    WIDTH, HEIGHT = img.size
    title_font = ImageFont.truetype(FONT_PATH, 80)
    details_font = ImageFont.truetype(FONT_PATH, 25)
    bold_font = ImageFont.truetype(FONT_PATH, 40)

    for offset in range(-2, 3):
        draw.text((WIDTH // 2 + offset, HEIGHT * 0.1 + offset), profit_text, font=title_font, fill="white", anchor="mm")

    section_x_positions = [WIDTH * 0.2, WIDTH * 0.5, WIDTH * 0.8]
    header_texts = ["Symbol", "Price", "Cost"]
    values_texts = [symbol, price, avg_cost]

    for i in range(3):
        draw.text((section_x_positions[i], HEIGHT * 0.86), header_texts[i], font=details_font, fill="white", anchor="mm")
        draw.text((section_x_positions[i], HEIGHT * 0.90), values_texts[i], font=bold_font, fill="white", anchor="mm")
    y_line_position = HEIGHT - 110
    for x in range(0, WIDTH, 10):
        draw.line([(x, y_line_position), (x + 5, y_line_position)], fill="white", width=1)
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    user_info = f"{username}"
    draw.text((30, HEIGHT - 70), user_info, font=bold_font, fill="white", anchor="lm")
    draw.text((30, HEIGHT - 25), date_str, font=details_font, fill="white", anchor="lm")
    img.save(output_path)