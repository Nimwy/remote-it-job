import { execSync } from "node:child_process";

/**
 * Reset + seed lại DB e2e (remoteit_e2e) để mỗi lần chạy e2e luôn sạch (T-04).
 * Playwright chạy với cwd = thư mục frontend, nên root = cwd + "../".
 */
const ROOT = `${process.cwd()}/..`;

export default function globalSetup() {
  execSync(`cd ${ROOT} && docker compose run --rm backend-e2e python -m scripts.e2e_prepare`, {
    stdio: "inherit",
  });
}
