import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PrivacyPolicy = () => {
  const lastUpdated = "January 17, 2025";

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-12 md:py-20">
        <div className="container px-5 md:px-6 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Your data security is our priority
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Last Updated: <span className="text-primary">{lastUpdated}</span>
            </p>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-muted/50 py-8 md:py-12 border-b">
        <div className="container px-5 md:px-6 max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              "Our Commitment to Your Privacy",
              "Who We Are",
              "Information We Collect From You",
              "Why We Process Your Data",
              "Data Security Measures",
              "Who We Share Your Data With",
              "Cross-Border Data Transfers",
              "How Long We Keep Your Data",
              "Your Rights Under Swiss and EU Law",
              "Cookies and Similar Technologies",
              "Policy Updates",
              "Questions or Concerns?"
            ].map((item, index) => (
              <a
                key={index}
                href={`#section-${index + 1}`}
                className="text-primary hover:underline py-1"
              >
                {index + 1}. {item}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12 md:py-16">
        <div className="container px-5 md:px-6 max-w-4xl mx-auto">
          <div className="space-y-12 text-foreground" style={{ fontSize: '15px', lineHeight: '1.7' }}>
            
            {/* Section 1: Introduction */}
            <section id="section-1" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">1. Our Commitment to Your Privacy</h2>
              <div className="prose prose-sm md:prose-base max-w-none">
                <p className="mb-4">
                  Unikey ("we," "us," or "our") is committed to protecting the personal data and privacy rights of all individuals ("you," "your," or "data subject") who use our student housing matching services in Lausanne, Switzerland. This Privacy Policy explains how we collect, use, store, process, and protect your personal information in compliance with:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>The <strong>Swiss Federal Act on Data Protection (FADP)</strong>, effective September 1, 2023</li>
                  <li>The <strong>EU General Data Protection Regulation (GDPR)</strong>, where applicable to EU residents</li>
                  <li>All applicable Swiss cantonal and federal data protection regulations</li>
                </ul>
                <p className="mb-4">
                  By submitting your information through our website or services, you acknowledge that you have read, understood, and consent to the practices described in this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Section 2: Data Controller */}
            <section id="section-2" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">2. Who We Are</h2>
              <div className="bg-muted/50 p-6 rounded-lg mb-4">
                <p className="mb-2"><strong>Data Controller:</strong> Unikey</p>
                <p className="mb-2"><strong>Address:</strong> Chemin du vieux tilleul 16, Prilly, 1008, Switzerland</p>
                <p className="mb-2"><strong>Email:</strong> contact@unikey.ch</p>
              </div>
              <p>
                We are registered and operate under Swiss law. As the data controller, we determine the purposes and means of processing your personal data.
              </p>
            </section>

            {/* Section 3: What Data We Collect */}
            <section id="section-3" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">3. Information We Collect From You</h2>
              <p className="mb-4">
                We collect only the personal data necessary to provide you with our student housing matching services. The categories of personal data we process include:
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">a) Identification Data</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Full name</li>
                      <li>Date of birth</li>
                      <li>Nationality</li>
                      <li>Student identification number or university affiliation</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">b) Contact Information</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Current residential address</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">c) Housing Preferences</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Preferred neighborhoods in Lausanne</li>
                      <li>Budget range</li>
                      <li>Move-in date</li>
                      <li>Number of roommates</li>
                      <li>Specific housing requirements (accessibility needs, furnished/unfurnished, etc.)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">d) Technical Data</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>IP address</li>
                      <li>Browser type and version</li>
                      <li>Device information</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">e) Communication Data</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Records of correspondence between you and Unikey</li>
                      <li>Feedback and survey responses</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong>Important:</strong> We do not collect sensitive personal data as defined under Article 5(c) of the FADP (data on religious views, health, racial or ethnic origin, trade union membership, genetic or biometric data, or data concerning social welfare measures) unless explicitly necessary and with your express consent.
                </p>
              </div>
            </section>

            {/* Section 4: Legal Basis */}
            <section id="section-4" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">4. Why We Process Your Data</h2>
              <p className="mb-4">We process your personal data for the following lawful purposes:</p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg mb-2">a) Contract Performance (Primary Legal Basis)</h3>
                  <p className="mb-2">To fulfill our contractual obligations to match you with suitable student housing, including:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Analyzing your housing preferences</li>
                    <li>Searching our partner platforms for available apartments</li>
                    <li>Coordinating viewings and lease negotiations</li>
                    <li>Providing customer support throughout your housing search</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg mb-2">b) Legitimate Interests</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Improving our services and website functionality</li>
                    <li>Conducting internal analytics to understand user needs</li>
                    <li>Ensuring the security and integrity of our systems</li>
                    <li>Preventing fraud and unauthorized access</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg mb-2">c) Legal Compliance</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Complying with Swiss and EU data protection laws</li>
                    <li>Responding to lawful requests from authorities</li>
                    <li>Maintaining records as required by law</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg mb-2">d) Consent (Where Applicable)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Sending you marketing communications (you may withdraw consent at any time)</li>
                    <li>Using cookies and tracking technologies</li>
                  </ul>
                </div>
              </div>

              <p className="mt-4 text-sm italic">
                We process personal data in accordance with the principles of lawfulness, good faith, proportionality, purpose limitation, and data minimization as required under Article 6 of the FADP.
              </p>
            </section>

            {/* Section 5: Data Security */}
            <section id="section-5" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">5. Data Security Measures</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, accidental loss, destruction, alteration, or unlawful disclosure, in compliance with Article 8 of the FADP:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-primary">Technical Measures:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>End-to-end encryption (TLS/SSL) for data transmission</li>
                    <li>Secure server infrastructure with firewall protection</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls and authentication protocols</li>
                    <li>Encrypted data storage</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-primary">Organizational Measures:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Strict internal data access policies</li>
                    <li>Confidentiality agreements with all employees and contractors</li>
                    <li>Regular staff training on data protection principles</li>
                    <li>Incident response and data breach notification procedures</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm">
                  <strong>Disclaimer:</strong> While we employ industry-standard security measures, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security but commit to promptly notifying you and relevant authorities of any data breach that poses a high risk to your rights and freedoms, as required under Article 24 of the FADP.
                </p>
              </div>
            </section>

            {/* Section 6: Data Sharing */}
            <section id="section-6" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">6. Who We Share Your Data With</h2>
              <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-semibold">
                  We do not sell, rent, or trade your personal data to third parties for marketing purposes.
                </p>
              </div>

              <p className="mb-4">
                We may share your personal data only with the following categories of recipients, and only to the extent necessary to provide our services:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">a) Partner Real Estate Platforms</h3>
                  <p>
                    We share your housing preferences with our verified partner platforms to identify suitable apartments. These partners act as independent data controllers under their own privacy policies.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">b) Property Owners and Landlords</h3>
                  <p>
                    We disclose your contact information and housing preferences to property owners when arranging viewings and lease agreements.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">c) Service Providers (Data Processors)</h3>
                  <p className="mb-2">
                    We engage trusted third-party service providers who process data on our behalf under strict contractual obligations, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Website hosting providers</li>
                    <li>Email service providers</li>
                    <li>Customer relationship management (CRM) systems</li>
                    <li>Payment processors (if applicable)</li>
                  </ul>
                  <p className="mt-2 text-sm italic">
                    All processors are bound by data processing agreements compliant with Article 9 of the FADP and Article 28 of the GDPR.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">d) Legal Authorities</h3>
                  <p>
                    We may disclose your data if required by law, court order, or regulatory request, or to protect our legal rights and prevent fraud.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">e) Business Transfers</h3>
                  <p>
                    In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity, subject to the same privacy protections.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: International Transfers */}
            <section id="section-7" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">7. Cross-Border Data Transfers</h2>
              <p className="mb-4">
                Your personal data is primarily processed and stored within Switzerland. If we transfer data to countries outside Switzerland or the European Economic Area (EEA), we ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Swiss Federal Council adequacy decisions (countries deemed to provide adequate data protection)</li>
                <li>EU Standard Contractual Clauses (SCCs) approved under Article 46(2)(c) of the GDPR</li>
                <li>Binding Corporate Rules or other safeguards recognized under Article 16 of the FADP</li>
              </ul>
              <p>
                We will inform you of any international transfers and the safeguards in place upon request.
              </p>
            </section>

            {/* Section 8: Data Retention */}
            <section id="section-8" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">8. How Long We Keep Your Data</h2>
              <p className="mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law:
              </p>
              <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                <div>
                  <strong>Active service users:</strong> Data retained for the duration of your housing search and up to 12 months after successful placement
                </div>
                <div>
                  <strong>Inactive users:</strong> Data deleted or anonymized after 24 months of inactivity
                </div>
                <div>
                  <strong>Communication records:</strong> Retained for 3 years for customer service and legal purposes
                </div>
                <div>
                  <strong>Accounting/legal records:</strong> Retained as required by Swiss commercial and tax law (typically 10 years)
                </div>
              </div>
              <p className="mt-4 text-sm italic">
                Once the retention period expires, we securely delete or anonymize your data in accordance with Article 6(5) of the FADP.
              </p>
            </section>

            {/* Section 9: Your Rights */}
            <section id="section-9" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">9. Your Rights Under Swiss and EU Law</h2>
              <p className="mb-4">
                You have the following rights regarding your personal data under the FADP and GDPR:
              </p>

              <div className="space-y-3">
                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">a) Right of Access (Article 25 FADP / Article 15 GDPR)</h3>
                  <p className="text-sm">You may request confirmation of whether we process your data and obtain a copy of your data free of charge.</p>
                </div>

                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">b) Right to Rectification (Article 32 FADP / Article 16 GDPR)</h3>
                  <p className="text-sm">You may request correction of inaccurate or incomplete data.</p>
                </div>

                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">c) Right to Erasure / Right to be Forgotten (Article 32 FADP / Article 17 GDPR)</h3>
                  <p className="text-sm">You may request deletion of your data under certain conditions.</p>
                </div>

                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">d) Right to Restriction of Processing (Article 32 FADP / Article 18 GDPR)</h3>
                  <p className="text-sm">You may request limitation of data processing in specific circumstances.</p>
                </div>

                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">e) Right to Data Portability (Article 28 FADP / Article 20 GDPR)</h3>
                  <p className="text-sm">You may receive your data in a structured, commonly used format and transmit it to another controller.</p>
                </div>

                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">f) Right to Object (Article 30 FADP / Article 21 GDPR)</h3>
                  <p className="text-sm">You may object to data processing based on legitimate interests or for direct marketing purposes.</p>
                </div>

                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">g) Right to Withdraw Consent</h3>
                  <p className="text-sm">Where processing is based on consent, you may withdraw it at any time without affecting prior lawful processing.</p>
                </div>

                <div className="p-4 border-l-4 border-primary bg-muted/30">
                  <h3 className="font-semibold mb-1">h) Right to Lodge a Complaint</h3>
                  <p className="text-sm mb-2">You may file a complaint with:</p>
                  <ul className="text-sm list-disc pl-6 space-y-1">
                    <li><strong>Swiss Federal Data Protection and Information Commissioner (FDPIC)</strong></li>
                    <li>EU supervisory authority (if you are an EU resident)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary text-primary-foreground rounded-lg">
                <p className="font-semibold mb-2">How to Exercise Your Rights:</p>
                <p className="text-sm">
                  To exercise your rights, contact us at <strong>contact@unikey.ch</strong>. We will respond within 30 days as required by law.
                </p>
              </div>
            </section>

            {/* Section 10: Cookies */}
            <section id="section-10" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">10. Cookies and Similar Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your website experience. These technologies help us:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our website</li>
                <li>Improve website performance and user experience</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="mb-4">
                You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.
              </p>
              <p className="text-sm italic">
                For detailed information about our cookie practices, please refer to our separate Cookie Policy.
              </p>
            </section>

            {/* Section 11: Policy Updates */}
            <section id="section-11" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">11. Policy Updates</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices, legal requirements, or services. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Posting the updated policy on our website with a new "Last Updated" date</li>
                <li>Sending email notification (for significant changes)</li>
              </ul>
              <p>
                Continued use of our services after changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Section 12: Contact */}
            <section id="section-12" className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">12. Questions or Concerns?</h2>
              <p className="mb-4">
                If you have questions, concerns, or wish to exercise your data protection rights, please contact us:
              </p>
              <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <p className="mb-2"><strong>Unikey Data Protection</strong></p>
                <p className="mb-2"><strong>Email:</strong> contact@unikey.ch</p>
                <p className="mb-2"><strong>Address:</strong> Chemin du vieux tilleul 16, Prilly, 1008, Switzerland</p>
              </div>
              <p className="mt-4">
                We are committed to resolving any privacy concerns promptly and transparently.
              </p>
            </section>

          </div>

          {/* Bottom Last Updated */}
          <div className="mt-12 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Last Updated: <span className="font-medium text-foreground">{lastUpdated}</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
