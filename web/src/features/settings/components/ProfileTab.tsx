import { useState } from 'react'
import Input from '@/components/Input'
import UserIcon from '@/assets/icons/components/UserIcon'
import EmailIcon from '@/assets/icons/components/EmailIcon'
import CompanyIcon from '@/assets/icons/components/CompanyIcon'
import GlobeIcon from '@/assets/icons/components/GlobeIcon'
import CameraIcon from '@/assets/icons/components/CameraIcon'
import TrashIcon from '@/assets/icons/components/TrashIcon'
import PlusIcon from '@/assets/icons/components/PlusIcon'
import InstagramIcon from '@/assets/icons/components/InstagramIcon'
import TwitterXIcon from '@/assets/icons/components/TwitterXIcon'
import TiktokIcon from '@/assets/icons/components/TiktokIcon'
import ChevronDownIcon from '@/assets/icons/components/ChevronDownIcon'
import avatarImg from '@/assets/avatar.png'
import type { SocialMediaLink, PlatformOption } from '@/features/settings/types'

const platformOptions: PlatformOption[] = [
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { value: 'twitter', label: 'Twitter', icon: TwitterXIcon },
  { value: 'tiktok', label: 'Tiktok', icon: TiktokIcon },
]

const defaultLinks: SocialMediaLink[] = [
  { id: '1', platform: 'instagram', url: '' },
  { id: '2', platform: 'twitter', url: '' },
  { id: '3', platform: 'tiktok', url: '' },
]

export default function ProfileTab() {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>(defaultLinks)

  const addSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), platform: 'instagram', url: '' },
    ])
  }

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id))
  }

  const updateSocialLink = (id: string, field: keyof SocialMediaLink, value: string) => {
    setSocialLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    )
  }

  const getPlatform = (value: string) =>
    platformOptions.find((p) => p.value === value) ?? platformOptions[0]

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
            <img
              src={avatarImg}
              alt="Profile"
              className="h-[100px] w-[100px] rounded-full object-cover"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary"
            >
              <CameraIcon width={16} height={16} className="text-white" />
            </button>
          </div>

          {/* Name row */}
          <div className="flex gap-5">
            <Input
              icon={UserIcon}
              placeholder="First Name"
              className="w-[371px]"
            />
            <Input
              icon={UserIcon}
              placeholder="Last Name"
              className="w-[371px]"
            />
          </div>

          {/* Email & Phone row */}
          <div className="flex gap-5">
            <Input
              icon={EmailIcon}
              placeholder="Email Address"
              className="w-[371px]"
            />
            <Input
              placeholder="Phone Number"
              className="w-[371px]"
              prefix={
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-1 text-xs text-muted"
                >
                  <span>+234</span>
                  <ChevronDownIcon width={16} height={16} />
                </button>
              }
            />
          </div>
        </div>
      </section>

      {/* Organisation Information */}
      <section className="flex flex-col gap-10">
        <h2 className="font-display text-xl font-semibold text-black">
          Organisation Information
        </h2>

        <div className="flex gap-5">
          <Input
            icon={CompanyIcon}
            placeholder="Organisation Name"
            className="w-[371px]"
          />
          <Input
            icon={GlobeIcon}
            placeholder="Website Link"
            className="w-[371px]"
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
            const platform = getPlatform(link.platform)
            const PlatformIcon = platform.icon

            return (
              <div key={link.id} className="flex items-center gap-5">
                {/* Platform selector */}
                <button
                  type="button"
                  className="flex w-[209px] shrink-0 items-center justify-between rounded-lg border border-border bg-surface px-3 py-4"
                >
                  <div className="flex items-center gap-1">
                    <PlatformIcon width={16} height={16} className="text-muted" />
                    <span className="text-xs text-muted">{platform.label}</span>
                  </div>
                  <ChevronDownIcon width={16} height={16} className="text-muted" />
                </button>

                {/* URL input + delete */}
                <Input
                  placeholder={`https://www.${platform.value}.com/username`}
                  value={link.url}
                  onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                  className="flex-1"
                  suffix={
                    <button
                      type="button"
                      onClick={() => removeSocialLink(link.id)}
                      className="shrink-0 text-error"
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  }
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addSocialLink}
          className="flex items-center gap-1 rounded-lg bg-border px-3 py-3 text-base font-medium tracking-tight text-muted"
        >
          <PlusIcon width={16} height={16} />
          Add Social media Link
        </button>

        <button
          type="button"
          className="rounded-lg bg-primary px-3.5 py-3 text-sm text-white"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
