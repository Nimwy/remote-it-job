"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as hrService from "@/services/hr";
import { CONTACT_LABELS, type Contact } from "@/types";
import { Button } from "@/components/ui/Button";

const CHANNELS = ["zalo", "telegram", "linkedin", "phone", "email"] as const;

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none";

export function HrProfile() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["hr-profile"],
    queryFn: hrService.getProfile,
  });

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  if (profile && !loaded) {
    setName(profile.name);
    setCompanyName(profile.company_name ?? "");
    setContacts(profile.contacts);
    setLoaded(true);
  }

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-6 py-8 text-body-md text-secondary">Đang tải...</div>;
  }

  const setContact = (channel: Contact["channel"], value: string) => {
    const rest = contacts.filter((c) => c.channel !== channel);
    if (value.trim()) {
      setContacts([...rest, { channel, value: value.trim() }]);
    } else {
      setContacts(rest);
    }
  };

  const getContactValue = (channel: string) =>
    contacts.find((c) => c.channel === channel)?.value ?? "";

  const save = async () => {
    await hrService.updateProfile({
      name,
      company_name: companyName,
      contacts,
    });
    queryClient.invalidateQueries({ queryKey: ["hr-profile"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
    setMessage("Đã lưu thông tin");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 font-display text-headline-lg">Thông tin tài khoản</h1>

      <div className="space-y-6">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-display text-headline-sm">Hồ sơ</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-label-sm text-secondary">Tên</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-label-sm text-secondary">Tên công ty</label>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-label-sm text-secondary">Email</label>
              <input value={profile?.email ?? ""} disabled className={`${inputClass} opacity-60`} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-display text-headline-sm">Kênh liên hệ</h2>
          <p className="mb-4 text-body-sm text-secondary">
            Thông tin này sẽ hiển thị trên tin tuyển dụng để job seeker liên hệ.
          </p>
          <div className="space-y-4">
            {CHANNELS.map((channel) => (
              <div key={channel}>
                <label className="mb-1 block text-label-sm text-secondary">
                  {CONTACT_LABELS[channel]}
                </label>
                <input
                  value={getContactValue(channel)}
                  onChange={(e) => setContact(channel, e.target.value)}
                  placeholder={
                    channel === "phone"
                      ? "VD: +84 912 345 678"
                      : channel === "telegram"
                        ? "@username"
                        : channel === "email"
                          ? "email@example.com"
                          : ""
                  }
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button onClick={save}>Lưu thay đổi</Button>
          {message && <span className="text-body-md text-primary">{message}</span>}
        </div>
      </div>
    </div>
  );
}
