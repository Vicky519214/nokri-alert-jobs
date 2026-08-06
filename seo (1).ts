import { JobPost } from '../types';

export const updatePageSEO = (
  title?: string,
  description?: string,
  post?: JobPost
) => {
  const defaultTitle = 'Sarkari Job Express - Latest Government Jobs, Private Vacancies, Admit Card & Mock Tests';
  const defaultDesc = 'Get instant verified updates on Govt Jobs, Private Vacancies, Admit Cards, Exam Results, Syllabus, Admissions, Scholarships, Mock Tests & Daily Current Affairs.';

  document.title = title ? `${title} | Sarkari Job Express` : defaultTitle;

  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description || defaultDesc);

  // Inject JobPosting JSON-LD structured data for search engines
  const existingScript = document.getElementById('json-ld-schema');
  if (existingScript) {
    existingScript.remove();
  }

  if (post && (post.category === 'govt_jobs' || post.category === 'private_jobs')) {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: post.title,
      description: post.summary || post.details,
      identifier: {
        '@type': 'PropertyValue',
        name: post.organization,
        value: post.id,
      },
      datePosted: post.postedDate,
      validThrough: post.importantDates.lastDate || '2026-12-31',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: post.organization,
        sameAs: post.officialWebsiteUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
          addressLocality: post.location,
        },
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          unitText: 'MONTH',
          value: post.salary,
        },
      },
    };

    const script = document.createElement('script');
    script.id = 'json-ld-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
};

export const generateXmlSitemap = (posts: JobPost[]): string => {
  const baseUrl = window.location.origin || 'https://sarkarijobexpress.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls = [
    '',
    '/category/govt_jobs',
    '/category/private_jobs',
    '/category/admit_card',
    '/category/results',
    '/category/syllabus',
    '/exam-calendar',
    '/mock-tests',
    '/current-affairs',
    '/pdf-notes',
    '/resume-builder',
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticUrls.forEach((url) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${url === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  posts.forEach((p) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/job/${p.id}</loc>\n`;
    xml += `    <lastmod>${p.updatedDate || p.postedDate || currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
};
