"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as hrService from "@/services/hr";
import type { Contact } from "@/types";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/errors";

const CHANNELS = ["zalo", "telegram", "linkedin", "phone", "email"] as const;

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none";

export function HrProfile() {
  const t = useTranslations("profile");
  const ct = useTranslations("contact");
  const e = useTranslations("errors");
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
  const [error, setError] = useState<string | null>(null);

  if (profile && !loaded) {
    setName(profile.name);
    setCompanyName(profile.company_name ?? "");
    setContacts(profile.contacts);
    setLoaded(true);
  }

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-6 py-8 text-body-md text-secondary">{t("loading")}</div>;
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
    setError(null);
    setMessage("");
    try {
      await hrService.updateProfile({
        name,
        company_name: companyName,
        contacts,
      });
      queryClient.invalidateQueries({ queryKey: ["hr-profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setMessage(t("saved"));
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(getApiErrorMessage(e, err));
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 font-display text-headline-lg">{t("title")}</h1>

      <div className="space-y-6">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-display text-headline-sm">{t("profile")}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-label-sm text-secondary">{t("name")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-label-sm text-secondary">{t("companyName")}</label>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-label-sm text-secondary">{t("email")}</label>
              <input value={profile?.email ?? ""} disabled className={`${inputClass} opacity-60`} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-display text-headline-sm">{t("contacts")}</h2>
          <p className="mb-4 text-body-sm text-secondary">{t("contactsHint")}</p>
          <div className="space-y-4">
            {CHANNELS.map((channel) => (
              <div key={channel}>
                <label className="mb-1 block text-label-sm text-secondary">{ct(channel)}</label>
                <input
                  value={getContactValue(channel)}
                  onChange={(e) => setContact(channel, e.target.value)}
                  placeholder={
                    channel === "phone"
                      ? "+84 912 345 678"
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button onClick={save}>{t("save")}</Button>
            {message && <span className="text-body-md text-primary">{message}</span>}
          </div>
          {error && <p className="text-body-sm text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
