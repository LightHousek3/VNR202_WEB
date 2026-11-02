# Phòng họp đại biểu Đại hội IX

Ứng dụng học tập VNR202, nơi người học xử lý chín tờ trình theo ba bước: đọc tóm tắt có nguồn, chọn hướng thảo luận mô phỏng, rồi đối chiếu với nội dung giáo trình về Đại hội IX. Sản phẩm ghi rõ các lựa chọn không phải biên bản hoặc số liệu bỏ phiếu thật.

## Nguồn học tập

Ứng dụng dùng duy nhất tệp PDF theo ấn bản 2021.

- PDF nguồn: `textbooks/Giao-trinh-Lich-su-Dang-Cong-san-Viet-Nam-2021.pdf`

## Hỏi Agent

Agent tra cứu toàn văn giáo trình, gồm phần mở đầu và cả ba chương; các câu hỏi tóm tắt chương 1, 2 hoặc 3 đều có thể đối chiếu theo trang in. Khi có key, Agent liệt kê model khả dụng theo từng key rồi gọi Gemini; câu trả lời hiển thị đoạn nguồn, chương và trang để người học kiểm tra. Nếu chưa có key hoặc tất cả lượt gọi thất bại, Agent dùng tra cứu cục bộ làm phương án dự phòng.
