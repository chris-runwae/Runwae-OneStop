"use client";

import { PhoneInput } from "@/components/shared/phone-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input-field";
import {
  Building2,
  Camera,
  ChevronDown,
  Globe,
  Instagram,
  Mail,
  Music,
  Plus,
  Trash2,
  Twitter,
  User,
} from "lucide-react";
import { type ComponentType, type SVGProps, useState } from "react";

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
}

export interface PlatformOption {
  value: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const platformOptions: PlatformOption[] = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "tiktok", label: "TikTok", icon: Music },
];

const getPlaceholderUrl = (platform: string) => {
  if (platform === "twitter") return "https://www.x.com/username";
  return `https://www.${platform}.com/username`;
};

const defaultLinks: SocialMediaLink[] = [
  {
    id: "1",
    platform: "instagram",
    url: "https://www.instagram.com/ellajames",
  },
  { id: "2", platform: "twitter", url: "https://www.x.com/ellajames" },
  { id: "3", platform: "tiktok", url: "https://www.tiktok.com/@ellajames" },
];

const inputRowClass =
  "flex flex-col gap-5 sm:flex-row sm:gap-5 [&>*]:min-w-0 [&>*]:flex-1";

export default function ProfileTab() {
  const [socialLinks, setSocialLinks] =
    useState<SocialMediaLink[]>(defaultLinks);
  const [about, setAbout] = useState("");

  const addSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), platform: "instagram", url: "" },
    ]);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const updateSocialLink = (
    id: string,
    field: keyof SocialMediaLink,
    value: string,
  ) => {
    setSocialLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    );
  };

  const getPlatform = (value: string) =>
    platformOptions.find((p) => p.value === value) ?? platformOptions[0];

  return (
    <div className="flex flex-col gap-11">
      {/* Personal Information */}
      <section className="flex flex-col gap-10">
        <h2 className="font-display text-xl font-semibold text-black">
          Personal Information
        </h2>

        <div className="flex flex-col gap-5">
          {/* Avatar */}
          <div className="relative inline-block w-fit">
            <Avatar className="size-[100px]">
              <AvatarFallback className="bg-muted text-2xl text-muted-foreground">
                ?
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Change profile photo"
            >
              <Camera className="size-4" aria-hidden />
            </button>
          </div>

          {/* Name row */}
          <div className={inputRowClass}>
            <InputField
              icon={<User className="size-5" aria-hidden />}
              placeholder="First Name"
              className="bg-surface"
            />
            <InputField
              icon={<User className="size-5" aria-hidden />}
              placeholder="Last Name"
              className="bg-surface"
            />
          </div>

          {/* Email & Phone row */}
          <div className={inputRowClass}>
            <InputField
              icon={<Mail className="size-5" aria-hidden />}
              placeholder="Email Address"
              type="email"
              className="bg-surface"
            />
            <div className="min-w-0 flex-1">
              <PhoneInput />
            </div>
          </div>

          {/* About textarea */}
          <textarea
            placeholder="Tell us about yourself"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-3 text-base shadow-xs placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 md:text-sm"
          />
        </div>
      </section>

      {/* Organisation Information */}
      <section className="flex flex-col gap-10">
        <h2 className="font-display text-xl font-semibold text-black">
          Organisation Information
        </h2>

        <div className={inputRowClass}>
          <InputField
            icon={<Building2 className="size-5" aria-hidden />}
            placeholder="Organisation Name"
            className="bg-surface"
          />
          <InputField
            icon={<Globe className="size-5" aria-hidden />}
            placeholder="Website Link"
            className="bg-surface"
          />
        </div>
      </section>

      {/* Social Media Links */}
      <section className="flex flex-col gap-10">
        <h2 className="font-display text-xl font-semibold text-black">
          Social Media Links
        </h2>

        <div className="flex flex-col gap-5">
          {socialLinks.map((link) => {
            const platform = getPlatform(link.platform);
            const PlatformIcon = platform.icon;

            return (
              <div
                key={link.id}
                className="flex flex-col gap-5 sm:flex-row sm:items-center"
              >
                {/* Platform selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full shrink-0 items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-4 sm:w-[209px] focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <PlatformIcon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="truncate text-sm text-muted-foreground">
                          {platform.label}
                        </span>
                      </div>
                      <ChevronDown
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[180px]">
                    {platformOptions.map((opt) => {
                      const PlatformOptionIcon = opt.icon;
                      return (
                        <DropdownMenuItem
                          key={opt.value}
                          onSelect={() =>
                            updateSocialLink(link.id, "platform", opt.value)
                          }
                          className="cursor-pointer"
                        >
                          <PlatformOptionIcon
                            className="size-4 shrink-0"
                            aria-hidden
                          />
                          {opt.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* URL input + delete */}
                <div className="relative flex min-w-0 flex-1">
                  <Input
                    placeholder={getPlaceholderUrl(platform.value)}
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(link.id, "url", e.target.value)
                    }
                    className="h-11 rounded-lg bg-surface pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(link.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-error transition-colors hover:text-error/80 focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Remove link"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={addSocialLink}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          Add Social media Link
        </button>

        <button
          type="button"
          className="ml-auto rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
