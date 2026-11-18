# Hướng dẫn Build fMess trên Windows (Local Build)

Tài liệu này ghi chú lại quy trình biên dịch cục bộ (local build) cho `fMess` trên môi trường Windows mà không cần cài đặt Visual Studio C++ nặng hàng chục GB (sử dụng MinGW-w64 toolchain gọn nhẹ).

---

## 1. Yêu cầu môi trường (Đã được cấu hình trên máy)

- **Node.js & npm**
- **Rust Toolchain**: `stable-x86_64-pc-windows-gnu` (nằm tại `~/.cargo/bin`)
- **GCC / MinGW-w64**: WinLibs POSIX UCRT (đã cài qua `winget` tại `AppData\Local\Microsoft\WinGet\Packages\...`)
- **PATH**: Cả `~/.cargo/bin` và `mingw64/bin` đã được thêm vĩnh viễn vào User PATH.

> Kiểm tra bằng cách mở PowerShell và gõ:
> ```powershell
> cargo --version
> rustc --version
> gcc --version
> ```

---

## 2. Lưu ý cực kỳ quan trọng về OneDrive ⚠️

Thư mục dự án đang nằm trong OneDrive (`OneDrive - Hanoi University of Science and Technology`).
Nếu để Cargo sinh thư mục `target/` bên trong dự án, OneDrive sẽ liên tục đồng bộ hàng chục nghìn file tạm (~3 - 4 GB), gây giật lag máy và đầy dung lượng đám mây.

👉 **Luôn luôn trỏ `CARGO_TARGET_DIR` ra ngoài ổ tạm** (ví dụ `C:\temp\fmess-target`).

---

## 3. Các lệnh Build

Mở PowerShell tại thư mục gốc của dự án `fmess`:

### A. Build Release (Tạo file .exe và bộ cài Setup)
```powershell
$env:CARGO_TARGET_DIR = "C:\temp\fmess-target"; npx tauri build --target x86_64-pc-windows-gnu
```

Sau khi hoàn tất, các file thành phẩm sẽ nằm tại:
- **File chạy trực tiếp (Portable)**:  
  `C:\temp\fmess-target\x86_64-pc-windows-gnu\release\fmess.exe`
- **Bộ cài đặt NSIS Setup (.exe)**:  
  `C:\temp\fmess-target\x86_64-pc-windows-gnu\release\bundle\nsis\fMess_<version>_x64-setup.exe`
- **Bộ cài đặt MSI**:  
  `C:\temp\fmess-target\x86_64-pc-windows-gnu\release\bundle\msi\fMess_<version>_x64_en-US.msi`

---

### B. Chạy chế độ Dev (để sửa code và test nhanh)
```powershell
$env:CARGO_TARGET_DIR = "C:\temp\fmess-target"; npx tauri dev --target x86_64-pc-windows-gnu
```

---

## 4. Dọn dẹp sau khi cài đặt

Sau khi cài đặt xong bản `.exe`, bạn có thể xóa thư mục cache build để giải phóng ~3.8 GB ổ cứng:

```powershell
Remove-Item "C:\temp\fmess-target" -Recurse -Force
```
*(Lần sau build lại thì Cargo sẽ tự tạo lại thư mục này, không ảnh hưởng gì đến mã nguồn dự án).*
