"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input-field";
import { cn } from "@/lib/utils";
import { Building2, ChevronDown, Globe } from "lucide-react";
import { useState } from "react";

const ROLES = ["Select role", "Host", "Manager", "Coordinator", "Other"];
const ORG_TYPES = [
  "Select type",
  "Hotel",
  "Restaurant",
  "Venue",
  "Event space",
  "Other",
];
const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "tiktok", label: "Tiktok" },
];

const WEBSITE_MAX_LENGTH = 280;

const Setup = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string }[]
  >([
    { platform: "instagram", url: "" },
    { platform: "twitter", url: "" },
    { platform: "tiktok", url: "" },
  ]);

  const updateSocialLink = (
    index: number,
    field: "platform" | "url",
    value: string,
  ) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="mx-auto w-full text-muted-foreground">
      <h1 className="text-2xl tracking-tight text-foreground text-center font-bricolage font-medium">
        Set up your Profile
      </h1>
      <p className="mt-1.5 text-sm text-center">
        Enter your details to set up your profile now.
      </p>

      <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Organisation Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<Building2 className="size-4" />}
            placeholder="Organisation Name"
            name="organisationName"
          />
          <div className="relative w-full">
            <select
              name="role"
              className={cn(
                "h-11 w-full appearance-none rounded-lg border border-input bg-transparent pl-3 pr-10 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow]",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "md:text-sm",
              )}
            >
              {ROLES.map((role) => (
                <option key={role} value={role === "Select role" ? "" : role}>
                  {role}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ChevronDown className="size-4" />
            </span>
          </div>
          <div className="relative w-full">
            <select
              name="organisationType"
              className={cn(
                "h-11 w-full appearance-none rounded-lg border border-input bg-transparent pl-3 pr-10 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow]",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "md:text-sm",
              )}
            >
              {ORG_TYPES.map((type) => (
                <option key={type} value={type === "Select type" ? "" : type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ChevronDown className="size-4" />
            </span>
          </div>
          <div className="relative w-full">
            <InputField
              icon={<Globe className="size-4" />}
              placeholder="Website URL"
              name="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              maxLength={WEBSITE_MAX_LENGTH}
              className="pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
              {websiteUrl.length}/{WEBSITE_MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-foreground">
            Social Media Links
          </h2>
          <div className="space-y-4">
            {socialLinks.map((link, index) => (
              <div key={link.platform} className="grid gap-4 sm:grid-cols-2">
                <div className="relative w-full">
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(index, "platform", e.target.value)
                    }
                    name={`socialPlatform-${index}`}
                    className={cn(
                      "h-11 w-full appearance-none rounded-lg border border-input bg-transparent pl-3 pr-10 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow]",
                      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      "md:text-sm",
                    )}
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ChevronDown className="size-4" />
                  </span>
                </div>
                <div className="relative w-full">
                  <Input
                    placeholder={`https://www.${link.platform}.com/username`}
                    name={`socialUrl-${index}`}
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(index, "url", e.target.value)
                    }
                    className="h-11 rounded-lg border-input pl-3 pr-3"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" size="full" className="mt-8 h-11 rounded-lg">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default Setup;
