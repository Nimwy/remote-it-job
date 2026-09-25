// PM2 — Frontend Next.js (`next start`, bản build do deploy.yml tạo).
// Bản đang chạy trên VPS (2026-09-22) được tạo bằng tay: `pm2 start npm --name remoteit-frontend
// -- run start` trong /home/deploy/remoteit/frontend, lưu trong ~/.pm2/dump.pm2, tự khởi động
// qua pm2-deploy.service.
//
// Áp dụng (user deploy, xem DEPLOYMENT.md § Cài đặt server):
//   pm2 delete remoteit-frontend
//   pm2 start deploy/pm2/ecosystem.config.js && pm2 save
// Mỗi lần deploy chỉ cần `pm2 restart remoteit-frontend`.
module.exports = {
  apps: [
    {
      name: "remoteit-frontend",
      cwd: "/home/deploy/remoteit/frontend",
      script: "npm",
      // KHÔNG thêm `-H 127.0.0.1`: Next 16 khi bind hostname cụ thể sẽ sinh
      // middleware-rewrite TUYỆT ĐỐI (https://localhost:3000/vi) và tự proxy qua HTTPS
      // tới server HTTP -> EPROTO -> 500. Bind mọi interface (mặc định) cho rewrite
      // tương đối (/vi); cổng 3000 vẫn bị ufw chặn từ ngoài, Nginx là cổng vào duy nhất.
      args: "run start -- -p 3000",
    },
  ],
};
