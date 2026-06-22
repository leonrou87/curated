import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with the Curated team — questions, feedback, press, or partnerships." };

export default function ContactPage() {
  return (
    <div className="contact">
      <header className="ct-head">
        <span className="eyebrow">Support</span>
        <h1 className="serif">Get in touch.</h1>
        <p>Questions about a look, feedback, press or partnerships — we read everything. We usually reply within a day or two.</p>
      </header>
      <ContactForm />
      <style>{`
        .contact{ max-width:680px; margin:0 auto; padding:50px 24px 0; }
        .ct-head h1{ font-weight:400; font-style:italic; font-size:clamp(2.2rem,5vw,3.4rem); letter-spacing:-.02em; margin:10px 0 12px; }
        .ct-head p{ color:var(--ink-soft); max-width:54ch; margin:0 0 34px; line-height:1.6; }
      `}</style>
    </div>
  );
}
