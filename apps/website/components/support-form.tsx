"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "tech@runwae.io";

export function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const lines = [
      message,
      "",
      "---",
      `From: ${name || "(not provided)"}`,
      `Reply-to: ${email || "(not provided)"}`,
    ];
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject || "Support request"
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = mailto;
  }

  return (
    <form className="support-card" onSubmit={handleSubmit} noValidate>
      <p className="support-card__note">
        Tell us what&rsquo;s going wrong and we&rsquo;ll get back to you. This
        opens your email app with a message addressed to {SUPPORT_EMAIL}.
      </p>

      <div className="support-field">
        <label htmlFor="sp-name">Your name</label>
        <input
          id="sp-name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="support-field">
        <label htmlFor="sp-email">Your email</label>
        <input
          id="sp-email"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="support-field">
        <label htmlFor="sp-subject">Subject</label>
        <input
          id="sp-subject"
          type="text"
          placeholder="What's this about?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="support-field">
        <label htmlFor="sp-message">Describe the problem</label>
        <textarea
          id="sp-message"
          placeholder="Tell us what happened…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="support-submit">
        Send email
      </button>
    </form>
  );
}
