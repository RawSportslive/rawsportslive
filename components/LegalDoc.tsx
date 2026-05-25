'use client';

import React from 'react';
import { Shield, Lock, Scale, AlertTriangle, FileText, CheckCircle, HelpCircle, Mail, AlertOctagon } from 'lucide-react';

interface LegalDocProps {
  policyKey: 'privacy' | 'terms' | 'cookies' | 'deletion';
  dynamicAddendum?: string;
}

export default function LegalDoc({ policyKey, dynamicAddendum }: LegalDocProps) {
  // Common theme color classes
  // Gold/Amber accent: text-[#FFBF00] or border-[#FFBF00]
  // Dark text: text-gray-900, text-gray-800
  // Background: bg-white or bg-[#f4f1ea]

  const privacyContent = (
    <div className="space-y-10 text-gray-900">
      {/* Intro */}
      <div className="border-l-4 border-[#FFBF00] pl-4 py-2 bg-[#FFBF00]/5 rounded-r-xl">
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          RawSports Live ("we", "our", or "us") is dedicated to providing premium sports highlights, dynamic live schedules, and notification alerts with absolute transparency. This Privacy Policy is meticulously aligned with the <strong>Google Play Developer Console policies</strong> (specifically regarding Personal & Sensitive Information, Data Safety disclosures, and push token tracking) and the legal framework established by the <strong>Government of Nepal</strong>.
        </p>
      </div>

      {/* Compliance Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f4f1ea] p-6 rounded-3xl border border-black/5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#FFBF00]">
            <Lock size={20} className="stroke-[2.5]" />
            <h3 className="font-bold uppercase tracking-wider text-xs text-gray-900">Google Play Policy Standards</h3>
          </div>
          <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1.5 font-medium">
            <li>Full encryption of user data in transit using HTTPS (TLS 1.3).</li>
            <li>No sharing of Personal & Sensitive User Data to ad networks or data brokers.</li>
            <li>Transparent collection and immediate self-service account deletion option.</li>
            <li>Clear declaration of our database structures and cloud endpoints.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#FFBF00]">
            <Scale size={20} className="stroke-[2.5]" />
            <h3 className="font-bold uppercase tracking-wider text-xs text-gray-900">Nepal Government Compliance</h3>
          </div>
          <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1.5 font-medium">
            <li><strong>Electronic Transactions Act, 2063 (Sec. 44-46)</strong>: Assuring user data secrecy.</li>
            <li><strong>Privacy Act, 2075</strong>: Safeguarding individual physical and digital records.</li>
            <li><strong>Copyright Act, 2059</strong>: Educational review & commentary exemption.</li>
            <li>Compliance checks with local PWA caching standards to preserve public bandwidth.</li>
          </ul>
        </div>
      </div>

      {/* Table of Data Collected */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">1. Data Processing Inventory & Telemetry</h2>
        </div>
        <p className="text-xs text-gray-600 font-medium">
          Under Nepal's Privacy Act, 2075 and Google Play's Data Safety guidelines, the following table lists every data element we collect, why we collect it, how it is stored, and its retention timeframe:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-black/10 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-[10px] font-black uppercase tracking-wider border-b border-black/10">
                <th className="px-4 py-3">Data Node</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Storage Point</th>
                <th className="px-4 py-3">Retention Duration</th>
                <th className="px-4 py-3">Nepal Law Clause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-gray-800 font-medium">
              <tr>
                <td className="px-4 py-3.5 font-bold text-gray-900">FCM Push Tokens</td>
                <td className="px-4 py-3.5">Dispatch live WWE match highlights and broadcast alerts.</td>
                <td className="px-4 py-3.5">Firestore DB (Encrypted)</td>
                <td className="px-4 py-3.5">Until user unsubscribes or 30 days of inactivity.</td>
                <td className="px-4 py-3.5">ETA 2063 Sec. 44 (Consent Basis)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3.5 font-bold text-gray-900">Device Hardware Meta</td>
                <td className="px-4 py-3.5">Optimize viewport size, touch-handlers, & standalone PWA assets.</td>
                <td className="px-4 py-3.5">Transient memory (Not logged)</td>
                <td className="px-4 py-3.5">Immediate session exit</td>
                <td className="px-4 py-3.5">ETA 2063 Sec. 45 (Transitional)</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold text-gray-900">Engagement Logs</td>
                <td className="px-4 py-3.5">Wrestler card bookmarks, live feed likes, and community reviews.</td>
                <td className="px-4 py-3.5">Firestore Database</td>
                <td className="px-4 py-3.5">Deleted immediately upon user-initiated erasure.</td>
                <td className="px-4 py-3.5">Privacy Act 2075 Sec. 12 (Erasure)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3.5 font-bold text-gray-900">Admin Credentials</td>
                <td className="px-4 py-3.5">Authorize news publishers, match builders, and live streamers.</td>
                <td className="px-4 py-3.5">Firebase Auth (Encrypted)</td>
                <td className="px-4 py-3.5">Indefinite/Secure Admin profile</td>
                <td className="px-4 py-3.5">ETA 2063 Sec. 46 (Authentication)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Nepal Law Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Scale size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">2. Statutory Compliance Under Nepalese Jurisdictions</h2>
        </div>
        <div className="space-y-4 text-xs text-gray-700 leading-relaxed font-medium">
          <p>
            RawSports Live proudly operates with complete fidelity to Nepalese digital guidelines, overseen by the Ministry of Communication and Information Technology:
          </p>
          <div className="space-y-3 bg-[#f4f1ea] p-5 rounded-2xl border border-black/5">
            <div>
              <h4 className="font-bold text-gray-900">A. The Electronic Transactions Act, 2063 (ETA)</h4>
              <p className="mt-1">
                Specifically adhering to <strong>Section 44</strong>, we ensure that user records (including notification subscriptions and unique tokens) are kept strictly confidential. Any illegal attempt to intercept, disclose, or sell this telemetry is strongly penalised. Under <strong>Section 45</strong>, all metrics are processed with user-consent parameters.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">B. Privacy Act, 2075 (2018)</h4>
              <p className="mt-1">
                Pursuant to Section 10, 11, and 12, users retain the uncompromisable right to access their accumulated app interaction database logs, request immediate modifications, or trigger complete data purge orders through our data deletion channels.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">C. Taxation and Digital Entertainment Norms</h4>
              <p className="mt-1">
                As a free, advertising-exempt community news aggregation portal, RawSports Live compiles official sports feeds and broadcasts purely for media accessibility. No online gaming, paid ticketing, or commercial gambling occurs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Third Party Content CDNs */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <HelpCircle size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">3. Infrastructure Partners & Media Pipelines</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          To provide rapid match loading and high-fidelity video streams on Nepalese mobile networks (Ncell, Nepal Telecom, Smart Cell), we utilize standard external content delivery networks (CDNs). These providers receive no personally identifiable telemetry from our systems:
        </p>
        <ul className="text-xs text-gray-700 list-disc pl-5 space-y-2 font-medium">
          <li><strong>Firebase (Google LLC)</strong>: Back-end cloud infrastructure, secure real-time Firestore database caching, and Firebase Cloud Messaging (FCM) dispatch.</li>
          <li><strong>YouTube API Integration</strong>: Embeds public sports match summaries, WWE updates, and promotional wrestler highlights. Subject to Google YouTube Developer Terms.</li>
          <li><strong>Cloudinary</strong>: Hosts highly compressed news article header cards and thumbnails to reduce user mobile data overhead.</li>
          <li><strong>Unsplash</strong>: Supplies license-free educational imagery and design layouts.</li>
        </ul>
      </div>

      {/* Data Security and Encryption */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">4. Robust Data Security Measures</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          We protect user data using industry-leading protocols. All transactions between the PWA app client and the server are encrypted using <strong>TLS 1.3 (HTTPS)</strong>. Our databases are defended by robust Firestore security rules, verifying user authorization and blocking third-party bots.
        </p>
      </div>

      {/* Contact Section */}
      <div className="bg-[#FFBF00]/5 border border-[#FFBF00]/20 p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-[#FFBF00]">
          <Mail size={18} />
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Official Compliance Contact</h4>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          For any data safety inquiries, privacy audits, or queries regarding compliance with Nepal's IT Bill, contact our designated Data Protection Officer:
          <br />
          <span className="font-bold text-gray-900">Email:</span> support@rawsportslive.com
          <br />
          <span className="font-bold text-gray-900">Address:</span> Baneshwor, Kathmandu, Nepal
        </p>
      </div>
    </div>
  );

  const termsContent = (
    <div className="space-y-10 text-gray-900">
      {/* Intro */}
      <div className="border-l-4 border-[#FFBF00] pl-4 py-2 bg-[#FFBF00]/5 rounded-r-xl">
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          Welcome to RawSports Live. By installing our Progressive Web Application (PWA), creating an administrative account, or accessing our live video highlights and sports scoreboard schedules, you enter a legally binding covenant governed by the <strong>Nepal Contract Act, 2056</strong>. If you disagree, do not use the application.
        </p>
      </div>

      {/* Copyright Disclaimer and Fair Use Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">1. Intellectual Property, Fair Use, & DMCA Exemption</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          RawSports Live curates, synthesizes, and compiles public video summaries, sports news feeds, and wrestler stats. We explicitly declare the following ownership bounds:
        </p>
        <div className="bg-[#f4f1ea] p-5 rounded-2xl border border-black/5 text-xs text-gray-700 space-y-2.5 font-medium">
          <p>
            <strong>Trademarks & Copyrights:</strong> WWE, SmackDown, RAW, NXT, WrestleMania, athlete names, ringside logo designs, and matching media materials are owned strictly by <strong>World Wrestling Entertainment, Inc. (WWE)</strong> and their official international broadcasters (such as Sony Sports Network in South Asia). RawSports Live claims no ownership or affiliation with these entities.
          </p>
          <p>
            <strong>Nepal Copyright Act, 2059 Section 16 Guidelines (Fair Use Exception):</strong> Under Section 16 of the Nepalese copyright statute, the aggregation of short sports video highlights is fully exempted when processed strictly for <strong>commentary, news reporting, education, criticism, and fan reviews</strong>. Our highlights act as a promotional driver to redirect fans to official streaming broadcast packages.
          </p>
          <p>
            <strong>DMCA & Legal Takedown Procedure:</strong> If you represent an authorized copyright holder and wish to request the deletion of a compiled media embed, email us at <strong className="text-gray-900">support@rawsportslive.com</strong>. The target record will be deleted in under 24 hours.
          </p>
        </div>
      </div>

      {/* User Conduct Table & Section 47 Warning */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertOctagon size={20} className="text-red-600" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">2. User Conduct & Strict Cyber Law Violations</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          When sharing comments, bookmarking superstars, or interacting with other sports fans, you must comply with standard community guidelines and Google Play's User Generated Content (UGC) safety principles.
        </p>

        {/* Section 47 Warning Box */}
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={16} />
            <span>Critical Warning: Nepal Electronic Transactions Act, 2063 (Section 47)</span>
          </div>
          <p className="text-xs text-red-950 leading-relaxed font-medium">
            Publishing, displaying, or transmitting obscene, abusive, defamatory, cyber-bullying, or legally prohibited material via the RawSports Live comment or rating boards is a criminal offense under <strong>Section 47 of the Electronic Transactions Act, 2063</strong>. Violators will be reported to the <strong>Nepal Police Cyber Bureau (Bhotahity, Kathmandu)</strong>. Convictions carry:
          </p>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-white/60 p-3 rounded-xl border border-red-100">
              <span className="block text-[10px] uppercase tracking-widest text-red-800 font-black">Financial Penalty</span>
              <span className="text-sm font-black text-red-950">Up to NPR 100,000</span>
            </div>
            <div className="bg-white/60 p-3 rounded-xl border border-red-100">
              <span className="block text-[10px] uppercase tracking-widest text-red-800 font-black">Imprisonment</span>
              <span className="text-sm font-black text-red-950">Up to 5 Years</span>
            </div>
          </div>
        </div>

        {/* UGC Safety Policy */}
        <div className="space-y-2 text-xs text-gray-700 font-medium">
          <p className="font-bold text-gray-900">UGC Moderation & Safety Measures:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Our administrators actively monitor the match interaction boards daily.</li>
            <li>Users can instantly report any abusive commentary by emailing support with the comment ID.</li>
            <li>We enforce automatic IP bans and Firestore document deletion for malicious actors.</li>
          </ul>
        </div>
      </div>

      {/* Moderation Matrix Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">UGC Offense & Action Matrix</h3>
        <div className="overflow-x-auto rounded-2xl border border-black/10 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-[10px] font-black uppercase tracking-wider border-b border-black/10">
                <th className="px-4 py-3">Violation Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Immediate Admin Response</th>
                <th className="px-4 py-3">Local Legal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-gray-800 font-medium">
              <tr>
                <td className="px-4 py-3.5 font-bold text-[#FFBF00]">Spamming / Bot Posts</td>
                <td className="px-4 py-3.5">Repetitive advertisements, link drops, or promo codes.</td>
                <td className="px-4 py-3.5">Instant comment purge, cookie lockout.</td>
                <td className="px-4 py-3.5">N/A (Local Block)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3.5 font-bold text-red-600">Hate Speech / Slander</td>
                <td className="px-4 py-3.5">Direct harassment, racial or gender slurs, or defamatory remarks.</td>
                <td className="px-4 py-3.5">Immediate post removal, permanent device IP ban.</td>
                <td className="px-4 py-3.5">Logged for Cyber Bureau review.</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold text-red-600">Cyber Exploitations</td>
                <td className="px-4 py-3.5">Threats of digital violence, hacking claims, or phishing hooks.</td>
                <td className="px-4 py-3.5">Account deletion, Firestore ban, network blacklisting.</td>
                <td className="px-4 py-3.5">Formal report submitted under ETA 2063.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations and Jurisdiction */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">3. Limitation of Liability & Judicial Scope</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          RawSports Live operates strictly as a curated highlights directory and fan commentary application. We offer our features on an "As-Is" and "As-Available" baseline without any explicit technical warranties. We are not liable for ISP network disruptions within Nepal (such as Worldlink, Vianet, ClassicTech, NT Fiber, Ncell data, etc.), PWA service worker offline cache limits, or minor live schedule notification delays.
        </p>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          Any disputes, legal litigations, or statutory queries arising from these Terms of Service will be settled exclusively within the jurisdiction of the district courts located in <strong className="text-gray-900">Kathmandu, Nepal</strong>, using established Nepalese civil codes.
        </p>
      </div>
    </div>
  );

  const cookiesContent = (
    <div className="space-y-10 text-gray-900">
      {/* Intro */}
      <div className="border-l-4 border-[#FFBF00] pl-4 py-2 bg-[#FFBF00]/5 rounded-r-xl">
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          The RawSports Live PWA employs standard browser cookies and local web storage to deliver a fast, responsive, and seamless interactive sports experience. By continuing to navigate our sports hub and video arenas, you authorize our use of cookies in complete harmony with Nepal's IT safety frameworks.
        </p>
      </div>

      {/* Definition */}
      <div className="space-y-3 text-xs text-gray-700 leading-relaxed font-medium">
        <h3 className="font-bold text-gray-900">What are Cookies & Local Storages?</h3>
        <p>
          Cookies are compact text strings securely placed on your phone, tablet, or PC to save session credentials. Local Storage, Session Storage, and Cache Storage are modern HTML5 standards that allow web applications to save data directly within your browser, reducing loading times and saving cellular data overhead.
        </p>
      </div>

      {/* Table of Cookies Used */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">1. Complete Inventory of Active Cookies & Web Storage Keys</h2>
        </div>
        <p className="text-xs text-gray-600 font-medium">
          The following list catalogs all active cookies and storage nodes embedded within the RawSports Live application:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-black/10 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-[10px] font-black uppercase tracking-wider border-b border-black/10">
                <th className="px-4 py-3">Storage Key</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Lifespan</th>
                <th className="px-4 py-3">Security Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-gray-800 font-medium">
              <tr>
                <td className="px-4 py-3.5 font-bold text-gray-900">rawsports_alerts</td>
                <td className="px-4 py-3.5">HTML5 Local Storage</td>
                <td className="px-4 py-3.5">Caches your custom scheduled match alarm keys locally on your device.</td>
                <td className="px-4 py-3.5">Persistent (Until browser wipe)</td>
                <td className="px-4 py-3.5">Low-Risk (Local client only)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3.5 font-bold text-gray-900">firebase:auth</td>
                <td className="px-4 py-3.5">Secure Auth Token</td>
                <td className="px-4 py-3.5">Handles verification of active admin profile or custom user session.</td>
                <td className="px-4 py-3.5">Persistent (Secure HTTPS)</td>
                <td className="px-4 py-3.5">High-Risk (Strictly Encrypted)</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold text-gray-900">PWA_Service_Worker</td>
                <td className="px-4 py-3.5">Cache API Storage</td>
                <td className="px-4 py-3.5">Pre-caches structural layout, Lucide-react graphic icons, and core CSS.</td>
                <td className="px-4 py-3.5">30 Days (Renewable)</td>
                <td className="px-4 py-3.5">Low-Risk (Speeds up loading)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3.5 font-bold text-gray-900">next-auth.session</td>
                <td className="px-4 py-3.5">HTTP-Only Cookie</td>
                <td className="px-4 py-3.5">Validates admin dashboard session. Impenetrable to XSS scripts.</td>
                <td className="px-4 py-3.5">Session Only</td>
                <td className="px-4 py-3.5">Critical Security</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cookie Management */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">2. How You Can Manage Cookie Preferences</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          You have complete authority over how cookies are utilized on your device. To adjust your settings, follow the steps below for your primary browser:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-black/10">
            <h4 className="font-bold text-xs text-gray-900 mb-1">Google Chrome (Android/PC)</h4>
            <p className="text-[11px] text-gray-600 font-medium">
              Tap the 3 vertical dots menu &gt; Settings &gt; Privacy and Security &gt; Third-party Cookies. Here, you can completely block or clear cached nodes.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/10">
            <h4 className="font-bold text-xs text-gray-900 mb-1">Apple Safari (iOS/macOS)</h4>
            <p className="text-[11px] text-gray-600 font-medium">
              Navigate to iOS System Settings &gt; Safari &gt; Advanced &gt; Website Data. Tap "Remove All Website Data" to clear stored cookies.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/10">
            <h4 className="font-bold text-xs text-gray-900 mb-1">Within the PWA Interface</h4>
            <p className="text-[11px] text-gray-600 font-medium">
              Simply go to our Deletions or Profile screen to wipe your locally stored notification alarms instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const deletionContent = (
    <div className="space-y-10 text-gray-900">
      {/* Intro */}
      <div className="border-l-4 border-red-600 pl-4 py-2 bg-red-600/5 rounded-r-xl">
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          At RawSports Live, we champion user autonomy over personal data. In complete alignment with the <strong>Google Play Console Developer Account Deletion Policy</strong> and the statutory rights provided under <strong>Nepal's Privacy Act, 2075</strong>, you have the right to request the complete deletion of your records.
        </p>
      </div>

      {/* Step by Step Deletion */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">1. Instant Erasure Methods</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          We offer two separate channels to ensure that your digital footprint is scrubbed entirely from our databases:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-black/10 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">Method A: Direct Self-Service PWA Wipe</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              For instant, real-time deletion of your dynamic bookmarks, push subscription, and engagement history:
            </p>
            <ol className="text-xs text-gray-700 list-decimal pl-4 space-y-1 font-semibold">
              <li>Launch the RawSports Live PWA application.</li>
              <li>Open your navigation menu drawer and tap the "Profile" tab.</li>
              <li>Scroll to the bottom and click on the red "Delete Account & History" button.</li>
              <li>Confirm the verification popup. All associated tokens are wiped from Firestore instantly.</li>
            </ol>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-black/10 space-y-2">
            <h3 className="font-bold text-sm text-gray-900">Method B: Official Email Request</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              If you cannot access the PWA application due to a browser crash, or wish for a manual database scrub:
            </p>
            <ol className="text-xs text-gray-700 list-decimal pl-4 space-y-1 font-semibold">
              <li>Compose an email from your registered email address.</li>
              <li>Send it directly to: <strong className="text-gray-900">support@rawsportslive.com</strong>.</li>
              <li>Use the Subject Line: "REQUEST FOR ACCOUNT AND PUSH TOKEN ERASURE".</li>
              <li>Our technical operations desk will complete the database wipe inside <strong className="text-gray-900">24 hours</strong>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Table of Erasure Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">2. Detailed Database Scrubbing Specifications</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          When a data deletion request is completed, the following operations occur within our Firebase infrastructure to ensure absolute compliance:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-black/10 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-[10px] font-black uppercase tracking-wider border-b border-black/10">
                <th className="px-4 py-3">Data Category</th>
                <th className="px-4 py-3">Storage Endpoint</th>
                <th className="px-4 py-3">Immediate Scrub Action</th>
                <th className="px-4 py-3">Process Time</th>
                <th className="px-4 py-3">Recoverability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-gray-800 font-medium">
              <tr>
                <td className="px-4 py-3.5 font-bold text-gray-900">FCM Push Alert Token</td>
                <td className="px-4 py-3.5">Firestore DB (`/legal` & `/users`)</td>
                <td className="px-4 py-3.5">Absolute record deletion from active subscriber lists.</td>
                <td className="px-4 py-3.5">Instant (Real-Time)</td>
                <td className="px-4 py-3.5 text-red-600 font-bold">Permanently Lost</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3.5 font-bold text-gray-900">Engagement Logs</td>
                <td className="px-4 py-3.5">Firestore DB (`/engagement`)</td>
                <td className="px-4 py-3.5">Purges all specific video likes, wrestler tags, & bookmark indexes.</td>
                <td className="px-4 py-3.5">Instant (Real-Time)</td>
                <td className="px-4 py-3.5 text-red-600 font-bold">Permanently Lost</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold text-gray-900">Admin Account Credentials</td>
                <td className="px-4 py-3.5">Firebase Authentication</td>
                <td className="px-4 py-3.5">Destroys email identity profile, resetting console tokens.</td>
                <td className="px-4 py-3.5">Under 24 Hours</td>
                <td className="px-4 py-3.5 text-red-600 font-bold">Permanently Lost</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3.5 font-bold text-gray-900">PWA Performance Cache</td>
                <td className="px-4 py-3.5">Local Mobile Browser Storage</td>
                <td className="px-4 py-3.5">Service worker cache clear (Triggered via browser settings).</td>
                <td className="px-4 py-3.5">Instant (Client Action)</td>
                <td className="px-4 py-3.5 text-red-600 font-bold">Permanently Lost</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Lock size={20} className="text-[#FFBF00]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">3. Legal Verification & Certification</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          Once your data is successfully purged from the active Firestore production servers, we send a manual email confirmation certifying the action (if requested via email). After completion, your telemetry is permanently non-recoverable. Backups are periodically rolled over and purged fully within a standard 30-day rotation timeframe.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Policy Selection */}
      {policyKey === 'privacy' && privacyContent}
      {policyKey === 'terms' && termsContent}
      {policyKey === 'cookies' && cookiesContent}
      {policyKey === 'deletion' && deletionContent}

      {/* Dynamic Addendum Section */}
      {dynamicAddendum && dynamicAddendum.trim() !== '' && (
        <div className="mt-12 pt-8 border-t-2 border-dashed border-black/10 space-y-4">
          <div className="flex items-center gap-2 text-[#FFBF00]">
            <AlertTriangle size={18} className="stroke-[2.5]" />
            <h3 className="font-bold uppercase tracking-wider text-xs text-gray-900">Dynamic Administration Addendum</h3>
          </div>
          <div className="bg-[#FFBF00]/5 border border-[#FFBF00]/10 p-5 rounded-2xl text-xs text-gray-800 font-semibold whitespace-pre-wrap leading-relaxed">
            {dynamicAddendum}
          </div>
        </div>
      )}
    </div>
  );
}
