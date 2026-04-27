import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const termsContentEn = `
<h2>1. Introduction</h2>
<p>Welcome to <strong>Pernahga</strong>. These Terms of Service ("Terms", "Terms of Service") govern your use of our website and our IT consulting and software development services (the "Service") operated by Pernahga.</p>
<p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

<h2>2. Our Services</h2>
<p>Pernahga provides IT consulting, business requirements analysis, and software development services (including web apps, mobile apps, and custom systems). The specific scope of any project will always be detailed in a separate Statement of Work (SOW) or Service Agreement for each client.</p>

<h2>3. Intellectual Property</h2>
<p>Unless otherwise stated in a written agreement, all software, underlying systems, methodologies, and materials developed by Pernahga remain the intellectual property of Pernahga. The Client will be granted a usage license as agreed upon in the contract.</p>

<h2>4. Client Responsibilities</h2>
<p>Clients are required to: (a) provide accurate and complete information as required for the project; (b) provide timely feedback during user acceptance testing (UAT); (c) use our services for lawful purposes.</p>

<h2>5. Limitation of Liability</h2>
<p>Pernahga makes every effort to provide reliable technology solutions, however, we are not liable for any indirect, incidental, or consequential damages arising from the use or inability to use the software delivered, except where caused by gross negligence on our part.</p>

<h2>6. Changes to Service & Pricing</h2>
<p>Prices for our consulting and development packages are subject to change without notice. Pernahga reserves the right at any time to modify or discontinue the Service (or any part thereof) without notice.</p>
`;

const privacyContentEn = `
<h2>1. Information We Collect</h2>
<p>At <strong>Pernahga</strong>, client privacy is a top priority. In providing our consulting and software development services, we collect various information, including but not limited to:</p>
<ul>
  <li><strong>Personal Data:</strong> Full name, email address, phone number, and job title.</li>
  <li><strong>Business Data:</strong> Company information, operational workflows, and technical data shared during consulting sessions.</li>
  <li><strong>Usage Data:</strong> System logs and usage analytics on our platform.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the collected data solely to:</p>
<ul>
  <li>Design specific and tailored software solutions for your company.</li>
  <li>Provide, maintain, and improve our Service.</li>
  <li>Communicate with you regarding projects, billing, or technical updates.</li>
</ul>

<h2>3. Non-Disclosure Agreement (NDA)</h2>
<p>As an IT company, we understand how valuable your business data is. Pernahga is always prepared to sign a standard Non-Disclosure Agreement (NDA) separately before any Enterprise project or Professional Consultation begins, to ensure that your ideas and business data are never leaked to third parties.</p>

<h2>4. Data Security</h2>
<p>We adhere to current industry standards to secure the data you submit. However, please remember that no method of transmission over the Internet or electronic storage is 100% secure.</p>

<h2>5. Third Parties</h2>
<p>We do not sell, trade, or rent clients' personally identifiable information or trade secrets to outside parties. Exceptions apply only to licensed third-party vendors (e.g., AWS/Google Cloud hosting services) who are required to adhere to strict privacy standards.</p>
`;

const refundContentEn = `
<h2>1. General Refund Policy</h2>
<p>Given the nature of Pernahga's services, which involve intellectual consulting and custom software development, our refund policy is handled very specifically based on the project phase.</p>

<h2>2. Consultation Sessions (Basic & Professional)</h2>
<p>If you have paid for a Professional Consultation package and wish to cancel:</p>
<ul>
  <li>Cancellations made at least <strong>48 hours before the first scheduled session</strong> will receive a full (100%) refund.</li>
  <li>Cancellations after the first session has taken place will not be refunded, as the time and initial analysis of our consultants have already been dedicated.</li>
</ul>

<h2>3. Software Development Services (Enterprise)</h2>
<p>For custom software development projects, the payment structure is typically divided into several milestones (Down Payment, Mid-term, Final Settlement). The refund policy will refer to the agreed-upon Statement of Work (SOW) or Service Agreement:</p>
<ul>
  <li><strong>Down Payments (DP)</strong> are generally non-refundable once the System Requirements analysis phase has begun.</li>
  <li>If Pernahga fails to meet the final specifications (after maximum revisions), a penalty scheme or partial refund will be specifically governed by the legal contract of the project.</li>
</ul>

<h2>4. Post-Launch Technical Issues</h2>
<p>Our services include a maintenance warranty according to the package (e.g., free for 1 month or 1 year). Any bugs or errors will be fixed for free during this warranty period. Refunds do not apply to technical issues that arise after the handover and UAT are signed.</p>

<h2>5. Submission Process</h2>
<p>To request a cancellation or discuss contracts/refunds, you can send an official email to our operational team at <strong>hello@pernahga.com</strong> or contact the assigned project manager directly.</p>
`;

async function main() {
  console.log("Updating English Legal Pages with professional content...");

  await prisma.siteSettings.upsert({
    where: { key: "termsContentEn" },
    update: { value: termsContentEn.trim() },
    create: { key: "termsContentEn", value: termsContentEn.trim() },
  });

  await prisma.siteSettings.upsert({
    where: { key: "privacyContentEn" },
    update: { value: privacyContentEn.trim() },
    create: { key: "privacyContentEn", value: privacyContentEn.trim() },
  });

  await prisma.siteSettings.upsert({
    where: { key: "refundContentEn" },
    update: { value: refundContentEn.trim() },
    create: { key: "refundContentEn", value: refundContentEn.trim() },
  });

  console.log("Successfully updated English legal pages!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
