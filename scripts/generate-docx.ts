import fs from 'node:fs';
import path from 'node:path';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  ExternalHyperlink,
  BorderStyle,
} from 'docx';
import { resume } from '../src/data/resume';

export async function generateDocx(outputPath?: string): Promise<string> {
  const targetPath = outputPath || path.resolve(process.cwd(), 'public/resume.docx');
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const { personal, leadershipExperience, previousExperience, professionalDevelopment } = resume;

  const doc = new Document({
    creator: personal.name,
    title: `${personal.name} - Resume`,
    description: `Resume of ${personal.name}, ${personal.title}`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 21, // 10.5 pt
            color: '1F2124',
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              before: 60,
              after: 60,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080,    // 0.75 in
              bottom: 1080, // 0.75 in
              left: 1150,   // 0.8 in
              right: 1150,  // 0.8 in
            },
          },
        },
        children: [
          // Header: Name
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: personal.name,
                bold: true,
                size: 44, // 22pt
                color: '151515',
                font: 'Georgia',
              }),
            ],
          }),

          // Contact details line
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({
                text: `${personal.location}  |  ${personal.citizenship}  |  ${personal.phone}  |  `,
                size: 19, // 9.5pt
                color: '4A4A4A',
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: personal.email,
                    size: 19,
                    color: '1E3A8A',
                    underline: {},
                  }),
                ],
                link: `mailto:${personal.email}`,
              }),
              new TextRun({
                text: '  |  ',
                size: 19,
                color: '4A4A4A',
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: personal.website.replace('https://', ''),
                    size: 19,
                    color: '1E3A8A',
                    underline: {},
                  }),
                ],
                link: personal.website,
              }),
            ],
          }),

          // Section: Summary
          createSectionHeader('Summary'),
          new Paragraph({
            spacing: { before: 80, after: 180 },
            children: [
              new TextRun({
                text: personal.summary,
                size: 20, // 10pt
                color: '262626',
              }),
            ],
          }),

          // Section: Employment History
          createSectionHeader('Employment History'),
          ...leadershipExperience.flatMap((job) => [
            // Job Title and Company
            new Paragraph({
              spacing: { before: 160, after: 40 },
              children: [
                new TextRun({
                  text: `${job.role} – ${job.company}`,
                  bold: true,
                  size: 23, // 11.5pt
                  color: '111827',
                }),
                ...(job.industry ? [
                  new TextRun({
                    text: ` (${job.industry})`,
                    italics: true,
                    size: 21,
                    color: '4B5563',
                  })
                ] : []),
              ],
            }),

            // Dates & Location
            new Paragraph({
              spacing: { before: 0, after: 100 },
              children: [
                new TextRun({
                  text: `${job.period}  •  ${job.location}`,
                  bold: true,
                  size: 19, // 9.5pt
                  color: '6B7280',
                }),
              ],
            }),

            // Achievements as styled bullet-style paragraphs
            ...job.achievements.map((ach) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 40, after: 60 },
                children: [
                  new TextRun({
                    text: `${ach.title}: `,
                    bold: true,
                    size: 20, // 10pt
                    color: '1F2937',
                  }),
                  new TextRun({
                    text: ach.description,
                    size: 20,
                    color: '374151',
                  }),
                ],
              })
            ),
          ]),

          // Section: Previous Experience
          createSectionHeader(`Previous Experience (${previousExperience.period})`),
          ...previousExperience.roles.map((prev) =>
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 40, after: 60 },
              children: [
                new TextRun({
                  text: `${prev.role} | ${prev.company}${prev.location ? ` (${prev.location})` : ''}: `,
                  bold: true,
                  size: 20,
                  color: '1F2937',
                }),
                new TextRun({
                  text: prev.description,
                  size: 20,
                  color: '374151',
                }),
              ],
            })
          ),

          // Section: Professional Development & Certifications
          createSectionHeader('Professional Development & Certifications'),
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: 'ISTQB Certifications: ',
                bold: true,
                size: 20,
                color: '1F2937',
              }),
              new TextRun({
                text: professionalDevelopment.istqbCertifications
                  .map((c) => `${c.title} (${c.year}) – ${c.issuer}`)
                  .join('  •  '),
                size: 20,
                color: '374151',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60, after: 120 },
            children: [
              new TextRun({
                text: 'Technical Skill Expansion: ',
                bold: true,
                size: 20,
                color: '1F2937',
              }),
              new TextRun({
                text: professionalDevelopment.technicalSkills.join(', '),
                size: 20,
                color: '374151',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(targetPath, buffer);
  console.log(`Successfully generated DOCX at: ${targetPath} (${buffer.length} bytes)`);

  // Also mirror to dist if dist exists
  const distPath = path.resolve(process.cwd(), 'dist/resume.docx');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, buffer);
  }

  return targetPath;
}

function createSectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: {
      bottom: {
        color: 'CCCCCC',
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 26, // 13pt
        color: '111827',
        font: 'Georgia',
      }),
    ],
  });
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDocx().catch((err) => {
    console.error('Failed to generate DOCX:', err);
    process.exit(1);
  });
}
