<!--
  BrewLite Pull Request Template
  Người thực hiện: TV6 (I-02: R-03)
  Quy ước review chéo:
    - TV1 -> TV2 duyệt
    - TV2 -> TV3 duyệt
    - TV3 -> TV4 duyệt
    - TV4 -> TV1 duyệt
    - TV5 -> TV6 duyệt
    - TV6 -> TV5 duyệt
-->

## 1. Thông tin chung
- **Thành viên thực hiện**: [TV1 / TV2 / TV3 / TV4 / TV5 / TV6]
- **Mã Issue liên quan**: Refs #<id> (nếu PR trung gian) HOẶC Closes #<id> (nếu PR cuối hoàn tất Issue)
- **Tên nhánh**: `docs/<issue>-<mo-ta>` hoặc `feature/<issue>-<mo-ta>`
- **Người duyệt chỉ định (Reviewer)**: @[Reviewer]

## 2. Mô tả nội dung thay đổi
- Tóm tắt ngắn gọn những gì đã thực hiện:
- Lý do thay đổi (đặc biệt khi điều chỉnh yêu cầu, sơ đồ UML hoặc kiến trúc):

## 3. Checklist Definition of Done (DoD)
- [ ] Code/tài liệu đã được kiểm tra kỹ lưỡng và theo đúng quy ước đặt tên / Conventional Commits.
- [ ] CI pipeline chạy xanh toàn bộ: Install -> Lint -> Unit Test -> Build.
- [ ] Có đầy đủ test tự động tương ứng (Unit / Component / Integration / E2E).
- [ ] Không chứa bất kỳ secret (mật khẩu thật, JWT secret, database connection string thật) trong code hoặc log.
- [ ] Sơ đồ liên quan (PlantUML `.puml` và ảnh `.svg`) đã được cập nhật đồng bộ trong `docs/diagrams/`.
- [ ] Đã cập nhật dòng tương ứng trong `docs/traceability-matrix.md`.
- [ ] Chạy kiểm thử thành công trên môi trường local (qua `docker-compose` hoặc npm scripts).

## 4. Minh chứng kiểm thử / Kết quả thực tế
<!-- Đính kèm ảnh chụp màn hình, log kiểm thử hoặc kết quả thực thi -->
