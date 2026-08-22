"use client";

import { useAdminHrs, useAdminHrAction } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function AdminUsers() {
  const { data, isLoading } = useAdminHrs();
  const action = useAdminHrAction();

  if (isLoading) {
    return <div className="text-body-md text-secondary">Đang tải...</div>;
  }

  const hrs = data?.items ?? [];

  return (
    <div>
      <h1 className="mb-6 font-display text-headline-lg">Quản lý HR</h1>

      {hrs.length === 0 ? (
        <p className="text-body-md text-secondary">Chưa có tài khoản HR nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant text-label-sm text-secondary">
              <tr>
                <th className="p-4">Tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Công ty</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Số tin</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {hrs.map((hr) => (
                <tr key={hr.id} className="hover:bg-surface-container-low">
                  <td className="p-4 font-medium">{hr.name}</td>
                  <td className="p-4 text-body-md">{hr.email}</td>
                  <td className="p-4 text-body-md">{hr.company_name ?? "-"}</td>
                  <td className="p-4">
                    <Badge status={hr.status}>{hr.status}</Badge>
                  </td>
                  <td className="p-4 text-body-md">{hr.job_count}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {hr.status === "pending" && (
                        <Button onClick={() => action.mutate({ action: "approve", id: hr.id })}>
                          Duyệt
                        </Button>
                      )}
                      {hr.status === "active" && (
                        <Button variant="danger" onClick={() => action.mutate({ action: "block", id: hr.id })}>
                          Khóa
                        </Button>
                      )}
                      {hr.status === "blocked" && (
                        <Button variant="outline" onClick={() => action.mutate({ action: "unblock", id: hr.id })}>
                          Mở khóa
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
