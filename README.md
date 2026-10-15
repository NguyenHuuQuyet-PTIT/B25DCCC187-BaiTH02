# Weather

Ứng dụng React xem thời tiết hiện tại và dự báo 7 ngày cho 8 thành phố Việt Nam. Dữ liệu được lấy trực tiếp từ [Open-Meteo](https://open-meteo.com/) và không cần API key.

## Chạy ứng dụng

```bash
npm install
npm run dev
```

## Tính năng

- Chọn một trong 8 thành phố; thành phố đang xem được làm nổi bật.
- Thời tiết hiện tại gồm biểu tượng, mô tả, nhiệt độ, độ ẩm, tốc độ gió và giờ cập nhật.
- Dự báo 7 ngày với thứ, ngày, biểu tượng, nhiệt độ cao nhất và thấp nhất.
- Chuyển đổi °C/°F ngay trên dữ liệu đã tải, không gọi lại API.
- Tìm thành phố không phân biệt dấu và lưu thành phố yêu thích trong localStorage.
- Có trạng thái tải, lỗi và nút thử lại; giao diện xếp hai cột từ 768px và xếp dọc trên màn hình nhỏ hơn.

## Build

```bash
npm run build
```

Thư mục `node_modules` và `dist` không được đưa lên repository.
